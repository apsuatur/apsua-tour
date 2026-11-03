import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {generateKeyPairSync,createECDH,createPublicKey,diffieHellman,hkdfSync,createDecipheriv,randomBytes,verify} from 'node:crypto';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync('lib/web-push.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {createPushRequest,validPushSubscription,pushAPI,pushToUser,saveNotification}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));

const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync('drizzle/0000_demonic_black_cat.sql','utf8'));
const env={DB:{prepare(sql){let values=[];return{bind(...v){values=v;return this},async first(){return sqlite.prepare(sql).get(...values)||null},async all(){return{results:sqlite.prepare(sql).all(...values)}},async run(){return{meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}}}}}};
async function call(path,user='alice',method='GET',value,origin='https://example.test'){const res=await pushAPI(new Request('https://example.test'+path,{method,headers:{Origin:origin},body:value?JSON.stringify(value):undefined}),env,user,false);return{status:res.status,data:await res.json()}}
assert.equal((await call('/api/push/inbox','')).status,401);
await pushToUser(env,'alice',{title:'Поездка подтверждена',body:'Детали заявки',url:'/#/account'});
let result=await call('/api/push/inbox');assert.equal(result.data.items.length,1,'Save without push configuration or subscriptions');assert.equal(result.data.unread,1);const id=result.data.items[0].id;
assert.equal((await call('/api/push/inbox','bob')).data.items.length,0);
await call('/api/push/inbox/read','bob','PUT',{ids:[id]});assert.equal((await call('/api/push/inbox')).data.unread,1,'Cannot read another user notification');
assert.equal((await call('/api/push/inbox/read','alice','PUT',{ids:[id]},'https://evil.test')).status,403);
await call('/api/push/inbox/read','alice','PUT',{ids:[id]});assert.equal((await call('/api/push/inbox')).data.unread,0);
await saveNotification(env,'alice',{title:'Рассылка',body:'Текст'},'broadcast-1');await saveNotification(env,'alice',{title:'Рассылка',body:'Текст'},'broadcast-1');assert.equal((await call('/api/push/inbox')).data.items.length,2,'Deduplicate one broadcast across devices');
for(let i=0;i<45;i++)await saveNotification(env,'alice',{title:'Сообщение '+i,body:'Текст',url:'//evil.test'});
result=await call('/api/push/inbox');assert.equal(result.data.items.length,40);assert.ok(result.data.next);assert.equal(result.data.items[0].url,'/#/account');
const next=await call('/api/push/inbox?before='+result.data.next.before+'&after='+encodeURIComponent(result.data.next.after));assert.equal(next.data.items.length,7);assert.equal(new Set([...result.data.items,...next.data.items].map(x=>x.id)).size,47,'Cursor pagination handles identical timestamps without losing items');
await call('/api/push/inbox/read','alice','PUT',{before:Date.now()});result=await call('/api/push/inbox');assert.equal(result.data.unread,0);assert.equal(result.data.items.length,40,'Reading preserves history');
assert.equal((await call('/api/push/inbox/read','alice','PUT',{})).status,400);
console.log('PASS: durable inbox without push, private access, scoped reads, CSRF, broadcast deduplication, safe links and stable pagination');

const cutoff=Date.now()-86400000;
sqlite.prepare("INSERT INTO records(id,kind,owner,body,status,created,updated) VALUES(?,'notification','alice',?,'read',?,?)").run('old-notification',JSON.stringify({title:'Старая история',body:'Сохраняется после прочтения',url:'/#/account'}),cutoff-1000,cutoff-1000);
let recent=await call('/api/push/inbox?scope=recent&cutoff='+cutoff);assert.equal(recent.data.hasOlder,true);assert.ok(!recent.data.items.some(x=>x.id==='old-notification'));
let archive=await call('/api/push/inbox?scope=archive&cutoff='+cutoff);assert.equal(archive.data.items.length,1);assert.equal(archive.data.items[0].id,'old-notification');assert.equal(archive.data.items[0].read,true);
await call('/api/push/inbox/read','alice','PUT',{before:Date.now()});archive=await call('/api/push/inbox?scope=archive&cutoff='+cutoff);assert.equal(archive.data.items[0].id,'old-notification','Read history survives a fresh request');
assert.equal((await call('/api/push/inbox?scope=archive&cutoff='+cutoff,'bob')).data.items.length,0);
const futureCutoff=Date.now()+1000;recent=await call('/api/push/inbox?scope=recent&cutoff='+futureCutoff);assert.equal(recent.data.items.length,0);assert.equal(recent.data.hasOlder,true,'Empty recent list still exposes the archive');
console.log('PASS: 24-hour partition, old read history survives reload, empty recent state retains archive and privacy');
