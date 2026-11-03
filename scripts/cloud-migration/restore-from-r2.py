#!/usr/bin/env python3
"""Guarded cloud-only migration of an owner backup staged privately in Cloudflare R2.

Runs only in the manual GitHub Actions workflow. Does not print customer data,
publish a website, use local operator tools, or send backup to GitHub artifacts.
"""
from __future__ import annotations
import hashlib
import io
import json
import os
import re
import sqlite3
import subprocess
import sys
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen

import boto3

BUCKET = "apsuatur-media"
DATABASE = "apsuatur-db"
BACKUP_KEY = "_migration/APSUA-TUR-CLOUDFLARE-IMPORT-READY-2026-11-03.zip"
BACKUP_SHA256 = "2094816762bed15ad745a5257b668c035945067942f263bf39af648405882fd0"
SQL_SHA256 = "c14912885ef22b77d86952a8498447ed727731d0d71c2429df96108645ffd7d9"
EXPECTED = {"__appgarden_migrations": 1, "records": 319, "settings": 135, "views": 35, "votes": 7}
EXPECTED_FILES = 74
EXPECTED_R2_BYTES = 22180366


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Required GitHub Actions secret missing: {name}")
    return value


def s3_client(account: str):
    return boto3.client(
        "s3", endpoint_url=f"https://{account}.r2.cloudflarestorage.com",
        aws_access_key_id=require_env("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=require_env("R2_SECRET_ACCESS_KEY"),
        region_name="auto",
    )


def all_keys(client) -> set[str]:
    keys = set()
    for page in client.get_paginator("list_objects_v2").paginate(Bucket=BUCKET):
        for obj in page.get("Contents", []):
            keys.add(obj["Key"])
    return keys


def cloudflare_api(account: str, database_id: str, token: str, suffix="", query=None):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account}/d1/database/{database_id}{suffix}"
    payload = json.dumps({"sql": query}).encode() if query else None
    req = Request(url, data=payload, method="POST" if payload else "GET",
                  headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urlopen(req, timeout=30) as response:
        doc = json.loads(response.read(2_000_000))
    if doc.get("success") is not True:
        raise RuntimeError("Cloudflare D1 API rejected a request")
    return doc["result"]


def query_rows(account, database_id, token, sql) -> list[dict]:
    result = cloudflare_api(account, database_id, token, "/query", sql)
    if not isinstance(result, list) or not result or not result[0].get("success", False):
        raise RuntimeError("Cloudflare D1 query failed")
    return result[0].get("results", [])


def remote_counts(account, database_id, token) -> dict[str, int]:
    names = query_rows(account, database_id, token,
        "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%'")
    found = {row["name"] for row in names}
    if not found:
        return {}
    if found != set(EXPECTED):
        raise RuntimeError(f"Unexpected D1 tables: {sorted(found)}")
    return {name: int(query_rows(account, database_id, token,
        f'SELECT COUNT(*) AS n FROM "{name}"')[0]["n"]) for name in EXPECTED}


def validate_backup(raw: bytes):
    if sha(raw) != BACKUP_SHA256:
        raise RuntimeError("Staged backup SHA-256 mismatch. No changes made.")
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        if archive.testzip() is not None:
            raise RuntimeError("Staged ZIP CRC failed")
        root = "apsua-restore/"
        manifest = json.loads(archive.read(root + "manifest.json"))
        sql = archive.read(root + "d1-cloudflare.sql")
        if sha(sql) != SQL_SHA256 or not sql.startswith(b"-- APSUA D1 restore"):
            raise RuntimeError("D1 SQL SHA-256 mismatch")
        if manifest["d1"]["totalRows"] != 498 or manifest["d1"]["tables"] != {**EXPECTED, "sqlite_sequence": 1}:
            raise RuntimeError("D1 manifest does not match snapshot")
        objects = manifest["r2"]["objects"]
        if len(objects) != EXPECTED_FILES or manifest["r2"]["totalBytes"] != EXPECTED_R2_BYTES:
            raise RuntimeError("R2 manifest does not match snapshot")
        if len({item["key"] for item in objects}) != EXPECTED_FILES:
            raise RuntimeError("Duplicate R2 keys")
        if BACKUP_KEY in {item["key"] for item in objects}:
            raise RuntimeError("Backup key collides with media")
        content = {}
        for item in objects:
            rel = item["file"]
            if not re.fullmatch(r"r2/objects/[0-9a-f]{64}\.bin", rel):
                raise RuntimeError("Invalid media path")
            data = archive.read(root + rel)
            if len(data) != item["size"] or sha(data) != item["contentSha256"]:
                raise RuntimeError("Media integrity check failed")
            content[item["key"]] = data
        if sum(len(chunk) for chunk in content.values()) != EXPECTED_R2_BYTES:
            raise RuntimeError("Total R2 bytes mismatch")
        db = sqlite3.connect(":memory:")
        try:
            db.executescript(sql.decode("utf8"))
            for name, count in EXPECTED.items():
                if db.execute(f'SELECT COUNT(*) FROM "{name}"').fetchone()[0] != count:
                    raise RuntimeError("D1 SQL does not match expected counts")
            if db.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                raise RuntimeError("D1 SQL fails SQLite integrity check")
        finally:
            db.close()
    return sql, objects, content


def verify_remote_object(client, item: dict):
    obj = client.get_object(Bucket=BUCKET, Key=item["key"])
    data = obj["Body"].read()
    if len(data) != item["size"] or sha(data) != item["contentSha256"]:
        raise RuntimeError("Remote media checksum mismatch; refusing overwrite")
    meta = item.get("httpMetadata") or {}
    for original, field in (
        ("contentType", "ContentType"), ("cacheControl", "CacheControl"),
        ("contentEncoding", "ContentEncoding"), ("contentDisposition", "ContentDisposition"),
        ("contentLanguage", "ContentLanguage"),
    ):
        if meta.get(original) and meta[original] != obj.get(field):
            raise RuntimeError("R2 HTTP metadata mismatch")
    orig_custom = {k.lower(): v for k, v in (item.get("customMetadata") or {}).items()}
    remote_custom = {k.lower(): v for k, v in (obj.get("Metadata") or {}).items()}
    if orig_custom != remote_custom:
        raise RuntimeError("R2 custom metadata mismatch")


def restore_r2(client, objects, content):
    allowed = {item["key"] for item in objects}
    existing = all_keys(client)
    if existing - allowed - {BACKUP_KEY}:
        raise RuntimeError("Unexpected objects in destination R2; refusing to modify")
    for index, item in enumerate(objects, 1):
        if item["key"] in existing:
            verify_remote_object(client, item)
            continue
        metadata = item.get("httpMetadata") or {}
        kwargs = {"Bucket": BUCKET, "Key": item["key"], "Body": content[item["key"]],
                  "Metadata": item.get("customMetadata") or {}}
        for original, field in (
            ("contentType", "ContentType"), ("cacheControl", "CacheControl"),
            ("contentEncoding", "ContentEncoding"), ("contentDisposition", "ContentDisposition"),
            ("contentLanguage", "ContentLanguage"),
        ):
            if metadata.get(original):
                kwargs[field] = metadata[original]
        if metadata.get("cacheExpiry"):
            kwargs["Expires"] = datetime.fromisoformat(metadata["cacheExpiry"].replace("Z", "+00:00"))
        client.put_object(**kwargs)
        verify_remote_object(client, item)
        print(f"R2 verified: {index}/{len(objects)}", flush=True)
    if all_keys(client) != allowed | {BACKUP_KEY}:
        raise RuntimeError("Final R2 key set mismatch")
    print("R2 verified: 74 files, exact original bytes and supported metadata")


def main():
    mode = os.environ.get("APSUA_MIGRATION_MODE", "verify")
    if mode not in ("verify", "restore"):
        raise RuntimeError("Allowed modes: verify or restore")
    account = require_env("CLOUDFLARE_ACCOUNT_ID")
    token = require_env("CLOUDFLARE_API_TOKEN")
    database_id = require_env("APSUA_D1_DATABASE_ID")
    if not re.fullmatch(r"[0-9a-fA-F]{32}", account) or not re.fullmatch(
        r"[0-9a-fA-F]{8}-[0-9a-fA-F-]{27,}", database_id
    ):
        raise RuntimeError("Invalid Cloudflare account or D1 UUID")
    info = cloudflare_api(account, database_id, token)
    if info.get("name") != DATABASE:
        raise RuntimeError("D1 UUID is not apsuatur-db; refusing to proceed")

    client = s3_client(account)
    source = client.head_object(Bucket=BUCKET, Key=BACKUP_KEY)
    if not (1_000_000 < source["ContentLength"] < 80_000_000):
        raise RuntimeError("Unexpected staged archive size")
    raw = client.get_object(Bucket=BUCKET, Key=BACKUP_KEY)["Body"].read()
    sql, objects, content = validate_backup(raw)
    print("Backup verified: D1 498 rows; R2 74 objects (all hashes correct)")
    counts = remote_counts(account, database_id, token)
    existing = all_keys(client) - {BACKUP_KEY}
    expected = {item["key"] for item in objects}
    if counts and counts != EXPECTED:
        raise RuntimeError("Destination D1 already has unrelated or changed data")
    if existing - expected:
        raise RuntimeError("Unexpected R2 objects, refusing to proceed")
    print(f"Target checked: D1 {'empty' if not counts else 'already restored'}; R2 {len(existing)} media objects")

    if mode == "verify":
        print("DRY RUN: absolutely no D1 or R2 writes")
        return
    if counts:
        raise RuntimeError("D1 already restored; never import SQL twice")
    restore_r2(client, objects, content)
    with tempfile.TemporaryDirectory(prefix="apsua-cloud-import-") as tmp:
        sql_file = Path(tmp) / "d1-restore.sql"
        sql_file.write_bytes(sql)
        result = subprocess.run(
            ["npx", "wrangler", "d1", "execute", DATABASE, "--remote",
             "--file", str(sql_file), "--yes"],
            cwd=os.environ["GITHUB_WORKSPACE"], text=True,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            timeout=300,
        )
        if result.returncode:
            raise RuntimeError("D1 import failed. No retry until D1 is inspected.")
    after = remote_counts(account, database_id, token)
    if after != EXPECTED:
        raise RuntimeError("D1 post-import counts do not match verified backup")
    for item in objects:
        verify_remote_object(client, item)
    print("SUCCESS: Cloudflare D1 contains 497 application rows plus SQLite autoincrement state; R2 has 74 verified media objects.")
    print("Snapshot is historical. FINAL LIVE SYNC is still required before domain cutover.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # Never print secrets, data, SQL statements, filenames or record values.
        print("MIGRATION FAILED:", type(exc).__name__, file=sys.stderr)
        sys.exit(1)
