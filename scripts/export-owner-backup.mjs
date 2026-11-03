import {createHash} from 'node:crypto';
import {chmod,mkdir,rename,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';

let privateInput={};
if(!process.env.APSUA_EXPORT_TOKEN){
  let raw='';
  for await(const chunk of process.stdin){raw+=chunk;if(/[\r\n]/.test(raw))break}
  try{privateInput=JSON.parse(raw.trim()||'{}')}catch{throw new Error('Private input must be a JSON object.')}}
const origin=String(privateInput.origin||process.env.APSUA_EXPORT_ORIGIN||'').replace(/\/$/,'');
const cookie=String(privateInput.cookie||process.env.APSUA_EXPORT_COOKIE||'');
const sitesAuthorization=String(privateInput.sitesAuthorization||'');
const ownerToken=String(privateInput.ownerToken||'');
const token=String(privateInput.exportToken||process.env.APSUA_EXPORT_TOKEN||'');
const output=resolve(process.env.APSUA_EXPORT_DIR||'private-backup');
if(!/^https:\/\//.test(origin)||(!cookie&&(!sitesAuthorization||!ownerToken))||!token)throw new Error('Provide origin, owner authentication and exportToken through private stdin JSON.');

const sha256=value=>createHash('sha256').update(value).digest('hex');
const quote=value=>'"'+String(value).replaceAll('"','""')+'"';
const literal=cell=>{
  if(cell.type==='null')return 'NULL';
  if(cell.type==='integer')return String(cell.value);
  if(cell.type==='real')return Number.isFinite(cell.value)?String(cell.value):`CAST('${String(cell.value).replaceAll("'","''")}' AS REAL)`;
  if(cell.type==='blob')return `X'${String(cell.value)}'`;
  return "'"+String(cell.value).replaceAll("'","''")+"'";
};

async function call(action,data={}){
  const headers={Origin:origin,'X-Apsua-Export-Token':token,'Content-Type':'application/json'};
  if(cookie)headers.Cookie=cookie;
  if(sitesAuthorization)headers['OAI-Sites-Authorization']='Bearer '+sitesAuthorization;
  if(ownerToken)headers['X-Apsua-Owner-Export-Token']=ownerToken;
  const response=await fetch(`${origin}/api/owner-export/${action}`,{method:'POST',headers,body:JSON.stringify(data),redirect:'error'});
  if(!response.ok){let reason='HTTP '+response.status;try{reason=(await response.json()).error||reason}catch{}throw new Error(`${action}: ${reason}`)}
  return response;
}

async function readD1(){
  const {schema}=await (await call('d1-schema')).json(),tables=schema.filter(item=>item.type==='table'&&(!item.name.startsWith('sqlite_')||item.name==='sqlite_sequence'));
  const rows={},counts={};
  for(const table of tables){
    let offset=0,columns=null;const data=[];
    for(;;){
      const page=await (await call('d1-page',{table:table.name,offset,limit:500})).json();
      columns||=page.columns;data.push(...page.rows);offset=page.nextOffset;
      if(page.done)break;
    }
    rows[table.name]={columns,rows:data};counts[table.name]=data.length;
  }
  const tableSql=schema.filter(item=>item.type==='table'&&!item.name.startsWith('sqlite_')).map(item=>item.sql+';');
  const tailSql=schema.filter(item=>item.type!=='table'&&!item.name.startsWith('sqlite_')).map(item=>item.sql+';');
  const statements=['PRAGMA foreign_keys=OFF;','BEGIN TRANSACTION;',...tableSql];
  for(const table of tables.filter(table=>table.name!=='sqlite_sequence')){const data=rows[table.name],names=data.columns.map(column=>quote(column.name)).join(',');for(const row of data.rows)statements.push(`INSERT INTO ${quote(table.name)} (${names}) VALUES (${row.map(literal).join(',')});`)}
  if(rows.sqlite_sequence){const data=rows.sqlite_sequence;statements.push('DELETE FROM sqlite_sequence;');for(const row of data.rows)statements.push(`INSERT INTO sqlite_sequence (${data.columns.map(column=>quote(column.name)).join(',')}) VALUES (${row.map(literal).join(',')});`)}
  statements.push(...tailSql,'COMMIT;','');
  const sql=statements.join('\n'),digest=sha256(Buffer.from(sql));
  return {schema,counts,sql,digest,totalRows:Object.values(counts).reduce((sum,count)=>sum+count,0)};
}

async function stableD1(){
  for(let attempt=1;attempt<=3;attempt++){
    const first=await readD1(),second=await readD1();
    if(first.digest===second.digest)return second;
    if(attempt===3)throw new Error('D1 changed during all three verification attempts; no backup was written.');
  }
}

async function listR2(){
  const objects=[];let cursor=null;
  do{const page=await (await call('r2-list',{cursor,limit:500})).json();objects.push(...page.objects);cursor=page.truncated?page.cursor:null}while(cursor);
  return objects;
}

function r2Fingerprint(objects){return sha256(Buffer.from(JSON.stringify(objects.map(item=>({key:item.key,version:item.version,size:item.size,etag:item.etag,uploaded:item.uploaded,httpMetadata:item.httpMetadata,customMetadata:item.customMetadata,checksums:item.checksums,storageClass:item.storageClass})))))}

await mkdir(output,{recursive:false,mode:0o700});await mkdir(join(output,'r2','objects'),{recursive:true,mode:0o700});await chmod(output,0o700);
const d1=await stableD1();
await writeFile(join(output,'d1-export.sql'),d1.sql,{mode:0o600});
const before=await listR2(),r2=[];
for(const object of before){
  const response=await call('r2-object',{key:object.key,version:object.version,etag:object.etag}),bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length!==object.size)throw new Error(`R2 size mismatch for ${JSON.stringify(object.key)}`);
  const contentSha256=sha256(bytes),file=sha256(Buffer.from(object.key))+'.bin',temporary=join(output,'r2','objects',file+'.part'),target=join(output,'r2','objects',file);
  await writeFile(temporary,bytes,{mode:0o600});await rename(temporary,target);
  r2.push({...object,file:'r2/objects/'+file,contentSha256});
}
const after=await listR2();
if(r2Fingerprint(before)!==r2Fingerprint(after))throw new Error('R2 changed during export; the incomplete backup must not be used.');
const manifest={format:'apsua-owner-backup-v1',createdAt:new Date().toISOString(),source:origin,d1:{file:'d1-export.sql',sha256:d1.digest,totalRows:d1.totalRows,tables:d1.counts,schema:d1.schema},r2:{totalFiles:r2.length,totalBytes:r2.reduce((sum,item)=>sum+item.size,0),listingSha256:r2Fingerprint(after),objects:r2}};
await writeFile(join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
const report={createdAt:manifest.createdAt,d1Rows:d1.totalRows,d1Tables:d1.counts,d1Sha256:d1.digest,r2Files:r2.length,r2Bytes:manifest.r2.totalBytes,r2ListingSha256:manifest.r2.listingSha256};
await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify(report,null,2));
