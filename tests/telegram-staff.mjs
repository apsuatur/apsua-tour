import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import {createHash} from 'node:crypto';
const source=readFileSync(new URL('../lib/site-api.ts',import.meta.url),'utf8')
 .replace("import '../public/fleet-model.js';",readFileSync(new URL('../public/fleet-model.js',import.meta.url),'utf8'))
 .replace("import { dispatchPayload, normalizeDispatchUpdate, sendToDispatcher, verifyDispatchWebhook } from './dispatch';",readFileSync(new URL('../lib/dispatch.ts',import.meta.url),'utf8').replace(/export /g,''))
 .replace("import { orderNotification } from './order-notify';",readFileSync(new URL('../lib/order-notify.ts',import.meta.url),'utf8').replace(/export /g,''))
 .replace("import {pushAPI,pushToUser} from './web-push';",readFileSync(new URL('../lib/web-push.ts',import.meta.url),'utf8').replace(/export /g,''))
 .replace("import seed from './site-seed.json';",'const seed='+readFileSync(new URL('../lib/site-seed.json',import.meta.url),'utf8')+';')
 .replace("import { telegramAuth, telegramConfig, telegramIdentity, telegramLogout, telegramAppAPI } from './telegram-auth';",readFileSync(new URL('../lib/telegram-auth.ts',import.meta.url),'utf8').replace(/export /g,''))
 .replace("import { ownerExport } from './owner-export';",readFileSync(new URL('../lib/owner-export.ts',import.meta.url),'utf8').replace(/export /g,''))
 .replace("import { priceBooking } from './tour-pricing';",readFileSync(new URL('../lib/tour-pricing.ts',import.meta.url),'utf8').replace(/export /g,''))
 .replace("import transferRates from './transfer-rates.json';",'const transferRates='+readFileSync(new URL('../lib/transfer-rates.json',import.meta.url),'utf8')+';');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {siteAPI}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../drizzle/0000_demonic_black_cat.sql',import.meta.url),'utf8'));
const DB={prepare(sql){let values=[];return {bind(...v){values=v;return this},async first(){return sqlite.prepare(sql).get(...values)||null},async all(){return {results:sqlite.prepare(sql).all(...values)}},async run(){const r=sqlite.prepare(sql).run(...values);return {meta:{changes:Number(r.changes)}}}}},async batch(items){return Promise.all(items.map(x=>x.run()))}};
const files=new Map();const BUCKET={async put(key,bytes,options){files.set(key,{bytes,...options})},async head(key){return files.get(key)||null}};
const env={DB,BUCKET,SITE_OWNER_EMAIL:'owner@example.com'};
async function call(path,user='tourist',method='GET',data,options={}){const headers={};if(options.cookie)headers.cookie=options.cookie;if(user){headers['oai-authenticated-user-id']=user;headers['oai-authenticated-user-email']=user+'@example.com'}if(method!=='GET')headers.origin=options.origin||'https://test.example';if(data instanceof Blob)headers['Content-Type']=data.type;else if(data)headers['Content-Type']='application/json';const response=await siteAPI(new Request('https://test.example'+path,{method,headers,body:data?(data instanceof Blob?data:JSON.stringify(data)):undefined}),env);return {status:response.status,cookie:response.headers.get('Set-Cookie'),data:await response.json()}}

const now=Date.now();
for(const [id,kind,owner,body] of [['tg-identity:tg:123','tg-identity','tg:123',{name:'Руслан',username:'ruslan'}],['AT-contact','bookings','tg:123',{phone:'+7 (999) 123-45-67'}]])sqlite.prepare('INSERT INTO records (id,kind,owner,body,status,created,updated) VALUES (?,?,?,?,?,?,?)').run(id,kind,owner,JSON.stringify(body),'private',now,now);
assert.equal((await call('/api/admin/staff','tourist')).status,403);
let result=await call('/api/admin/staff','owner');assert.equal(result.status,200);assert.equal(result.data.staff[0].phone,'+7 (999) 123-45-67');
assert.equal((await call('/api/admin/staff','tourist','PUT',{userId:'tg:123',role:'admin'})).status,403);
result=await call('/api/admin/staff','owner','PUT',{userId:'tg:123',role:'admin'});assert.equal(result.data.staff[0].role,'admin');
result=await call('/api/admin/staff','owner','PUT',{userId:'tg:123',role:''});assert.equal(result.data.staff[0].role,'');
assert.equal((await call('/api/admin/staff','owner','PUT',{userId:'tg:999',role:'admin'})).status,404);
assert.equal((await call('/api/admin/staff','owner','PUT',{userId:'tg:123',role:'owner'})).status,400);
const ui=readFileSync(new URL('../public/user-app.js',import.meta.url),'utf8');
const {runInNewContext}=await import('node:vm');
const context={serverStaffRole:'admin',serverEditor:false,ADM_TABS:[['staff','Сотрудники'],['requests','Заявки']],staffQuery:''};
runInNewContext(ui.match(/function adminCurrentTabs\(\)\{[^\n]+/)[0]+';'+ui.match(/function staffMatches\(row\)\{[^\n]+/)[0],context);
assert.ok(context.adminCurrentTabs().some(([key])=>key==='staff'));
context.serverStaffRole='observer';assert.ok(!context.adminCurrentTabs().some(([key])=>key==='staff'));
for(const query of ['Рус','@rus','999123']){context.staffQuery=query;assert.equal(context.staffMatches({name:'Руслан',username:'ruslan',phone:'+7 (999) 123-45-67'}),true)}
console.log('PASS: staff navigation, normalized phone search, owner-only grants and revocation');
