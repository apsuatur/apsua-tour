import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ownerExport} from '../lib/owner-export.ts';

const origin='https://test.example',secret='x'.repeat(48);
const object={key:'фото/рица.jpg',version:'v1',size:3,etag:'abc',httpEtag:'"abc"',uploaded:new Date('2026-01-02T03:04:05Z'),storageClass:'Standard',httpMetadata:{contentType:'image/jpeg',cacheExpiry:new Date('2027-01-01T00:00:00Z')},customMetadata:{source:'camera'},checksums:{toJSON:()=>({md5:'kAFQmDzST7DWlj99KOF/cg=='})},body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array([1,2,3]));controller.close()}})};
function statement(sql){let bindings=[];return {bind(...value){bindings=value;return this},async first(){if(sql.includes("FROM sqlite_schema WHERE type='table'"))return bindings[0]==='records'?{name:'records'}:null;return null},async all(){if(sql.startsWith('SELECT type,name'))return {results:[{type:'table',name:'records',tbl_name:'records',sql:'CREATE TABLE records(id TEXT PRIMARY KEY,n INTEGER,b BLOB)'}]};if(sql.startsWith('PRAGMA table_xinfo'))return {results:[{name:'id',type:'TEXT',notnull:1,pk:1,hidden:0},{name:'n',type:'INTEGER',notnull:0,pk:0,hidden:0},{name:'b',type:'BLOB',notnull:0,pk:0,hidden:0}]};if(sql.startsWith('SELECT typeof'))return {results:[{t0:'text',v0:'one',t1:'integer',v1:'9007199254740993',t2:'blob',v2:'00FF'}]};throw new Error('Unexpected SQL: '+sql)}}}
const env={OWNER_EXPORT_ENABLED:'1',OWNER_EXPORT_TOKEN:secret,DB:{prepare:statement},BUCKET:{async list(){return {objects:[object],truncated:false}},async get(key,options){assert.equal(key,object.key);assert.equal(options.onlyIf.etagMatches,object.etag);return object}}};
function request(path,{method='POST',token=secret,body={}}={}){return new Request(origin+path,{method,headers:{Origin:origin,'X-Apsua-Export-Token':token,'Content-Type':'application/json'},body:method==='POST'?JSON.stringify(body):undefined})}

assert.equal(await ownerExport(new Request(origin+'/api/state'),env,true),null,'unrelated routes are untouched');
assert.equal((await ownerExport(request('/api/owner-export/status',{method:'GET'}),env,true)).status,405,'GET cannot export');
assert.equal((await ownerExport(request('/api/owner-export/status'),{...env,OWNER_EXPORT_ENABLED:'0'},true)).status,404,'export is off by default');
assert.equal((await ownerExport(request('/api/owner-export/status'),env,false)).status,403,'only the owner can export');
assert.equal((await ownerExport(request('/api/owner-export/status',{token:'wrong'}),env,true)).status,403,'the temporary secret is also required');
assert.equal((await ownerExport(new Request(origin+'/api/owner-export/status',{method:'POST',headers:{Origin:'https://evil.example','X-Apsua-Export-Token':secret},body:'{}'}),env,true)).status,403,'cross-origin requests are rejected');

let response=await ownerExport(request('/api/owner-export/d1-schema'),env,true),data=await response.json();assert.equal(data.schema[0].sql.startsWith('CREATE TABLE'),true);
response=await ownerExport(request('/api/owner-export/d1-page',{body:{table:'records',offset:0,limit:200}}),env,true);data=await response.json();assert.deepEqual(data.rows[0],[{type:'text',value:'one'},{type:'integer',value:'9007199254740993'},{type:'blob',value:'00FF'}],'integer and blob representations stay lossless');
assert.equal((await ownerExport(request('/api/owner-export/d1-page',{body:{table:'secrets'}}),env,true)).status,404,'arbitrary SQL identifiers are refused');

response=await ownerExport(request('/api/owner-export/r2-list'),env,true);data=await response.json();assert.equal(data.objects[0].key,object.key);assert.equal(data.objects[0].version,'v1');assert.equal(data.objects[0].httpMetadata.cacheExpiry,'2027-01-01T00:00:00.000Z');assert.equal(data.objects[0].customMetadata.source,'camera');assert.equal(data.objects[0].checksums.md5,'kAFQmDzST7DWlj99KOF/cg==');
response=await ownerExport(request('/api/owner-export/r2-object',{body:{key:object.key,version:object.version,etag:object.etag}}),env,true);assert.equal(response.status,200);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[1,2,3]);assert.equal(response.headers.get('cache-control'),'no-store');

const api=readFileSync(new URL('../lib/site-api.ts',import.meta.url),'utf8');assert.match(api,/ownerExport\(request,env,isOwner\)/,'the protected handler is wired after owner authentication');
console.log('PASS: owner export is disabled by default, requires owner + same origin + a temporary secret, preserves D1 value types, paginates R2 metadata and streams only the listed object version.');
