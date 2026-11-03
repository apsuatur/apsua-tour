// Validate production bindings before anyone deploys the standalone Worker.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const file = "dist/server/wrangler.json";
const config = JSON.parse(readFileSync(file, "utf8"));
const db = (config.d1_databases || []).find((entry) => entry.binding === "DB");
const bucket = (config.r2_buckets || []).find((entry) => entry.binding === "BUCKET");
assert.equal(config.name, process.env.APSUA_WORKER_NAME || "apsuatur-prod", "Unexpected standalone Worker name");
assert.equal(db?.database_name, process.env.APSUA_D1_DATABASE_NAME || "apsuatur-db", "Wrong D1 database");
assert.equal(db?.database_id, process.env.APSUA_D1_DATABASE_ID, "Wrong D1 database ID");
assert.match(db.database_id, /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i, "Missing real D1 database UUID");
assert.notEqual(db.database_id, "00000000-0000-4000-8000-000000000000", "Placeholder database ID");
assert.equal(bucket?.bucket_name, process.env.APSUA_R2_BUCKET_NAME || "apsuatur-media", "Wrong R2 bucket");
console.log("Standalone Worker build bindings: verified");
