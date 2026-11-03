type YandexEnv={DB:D1Database;YANDEX_OAUTH_CLIENT_ID?:string;YANDEX_OAUTH_CLIENT_SECRET?:string};
const cookie='__Host-apsua_ya',flowCookie='__Host-apsua_ya_flow';
const YA_DAY=86400000,YA_SESSION_DAYS=30,YA_MAX_DAYS=90,YA_FLOW_TTL=10*60000;
const yaHex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const yaSha=async(v:string)=>yaHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));
const b64url=(b:ArrayBuffer)=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const yaRandom=(n=32)=>yaHex(crypto.getRandomValues(new Uint8Array(n)).buffer);
const safeReturn=(v:string|null)=>{const x=String(v||'#/');return x.length<=600&&!/[\r\n]/.test(x)&&/^#\/(?:$|(?:excursions|transfer|map|reviews|diary|useful|install|favorites|fleet|about|contacts|contact|compare|pick|orders|account)(?:[/?]|$))/.test(x)?x:'#/account'};
const clearFlow=`${flowCookie}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
const redirect=(location:string)=>new Response(null,{status:302,headers:{Location:location,'Cache-Control':'no-store'}});
export function yandexConfig(env:YandexEnv){return {enabled:/^[A-Za-z0-9._-]{8,200}$/.test(env.YANDEX_OAUTH_CLIENT_ID||'')&&!!env.YANDEX_OAUTH_CLIENT_SECRET}}

async function issue(env:YandexEnv,user:{subject:string;name:string;email:string;avatar:string},canonical=''){
 const now=Date.now(),owner=canonical||'ya:'+user.subject,token=yaRandom(),expires=now+YA_SESSION_DAYS*YA_DAY;
 await env.DB.batch([
  env.DB.prepare("INSERT INTO records(id,kind,owner,body,status,created,updated) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET owner=excluded.owner,body=excluded.body,updated=excluded.updated").bind('ya-identity:'+user.subject,'ya-identity',owner,JSON.stringify(user),'private',now,now),
  env.DB.prepare("INSERT OR IGNORE INTO records(id,kind,owner,body,status,created,updated) VALUES(?,?,?,?,?,?,?)").bind('profile:'+owner,'profile',owner,JSON.stringify({name:user.name,city:'',about:'',avatar:''}),'private',now,now),
  env.DB.prepare("INSERT INTO records(id,kind,owner,body,status,created,updated) VALUES(?,?,?,?,?,?,?)").bind('ya-session:'+await yaSha(token),'ya-session',owner,JSON.stringify({expires,created:now,subject:user.subject}),'private',now,now),
  env.DB.prepare("DELETE FROM records WHERE kind='ya-session' AND CAST(json_extract(body,'$.expires') AS INTEGER)<?").bind(now)
 ]);
 return {token,owner};
}

export async function yandexAuth(request:Request,env:YandexEnv,linkOwner=''){
 const url=new URL(request.url),config=yandexConfig(env);if(!config.enabled)return redirect(url.origin+'/?login=yandex-unavailable#/account');
 if(url.pathname==='/api/yandex-auth/start'){
  const state=yaRandom(16),proof=yaRandom(32),verifier=b64url(crypto.getRandomValues(new Uint8Array(48)).buffer),challenge=b64url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))),now=Date.now(),returnTo=safeReturn(url.searchParams.get('return_to'));
  await env.DB.prepare("INSERT INTO records(id,kind,owner,body,status,created,updated) VALUES(?,?,?,?,?,?,?)").bind('ya-flow:'+state,'ya-flow',linkOwner||'guest',JSON.stringify({proof:await yaSha(proof),verifier,returnTo,expires:now+YA_FLOW_TTL,linkOwner:linkOwner||''}),'pending',now,now).run();
  const authorize=new URL('https://oauth.yandex.ru/authorize');authorize.search=new URLSearchParams({response_type:'code',client_id:env.YANDEX_OAUTH_CLIENT_ID!,redirect_uri:url.origin+'/api/yandex-auth/callback',state,code_challenge:challenge,code_challenge_method:'S256'}).toString();
  const response=redirect(authorize.href);response.headers.append('Set-Cookie',`${flowCookie}=${state}.${proof}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600`);return response;
 }
 if(url.pathname!=='/api/yandex-auth/callback')return Response.json({error:'Не найдено'},{status:404});
 const match=request.headers.get('cookie')?.match(/(?:^|; )__Host-apsua_ya_flow=([a-f0-9]{32})\.([a-f0-9]{64})(?:;|$)/),state=url.searchParams.get('state')||'',fail=(reason:string,back='#/account')=>{const r=redirect(url.origin+'/?login='+reason+back);r.headers.append('Set-Cookie',clearFlow);return r};
 if(!match||match[1]!==state)return fail('yandex-failed');
 const row=await env.DB.prepare("SELECT body,status FROM records WHERE id=? AND kind='ya-flow'").bind('ya-flow:'+state).first<any>();let flow:any;try{flow=row&&JSON.parse(row.body)}catch{}if(!flow||row.status!=='pending'||flow.expires<=Date.now()||flow.proof!==await yaSha(match[2]))return fail('yandex-expired');
 const consumed=await env.DB.prepare("UPDATE records SET status='consumed',updated=? WHERE id=? AND status='pending'").bind(Date.now(),'ya-flow:'+state).run();if(!consumed.meta.changes)return fail('yandex-expired',flow.returnTo);
 const code=url.searchParams.get('code')||'';if(!code)return fail('yandex-cancelled',flow.returnTo);
 try{
  const tokenResponse=await fetch('https://oauth.yandex.ru/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code,client_id:env.YANDEX_OAUTH_CLIENT_ID!,client_secret:env.YANDEX_OAUTH_CLIENT_SECRET!,redirect_uri:url.origin+'/api/yandex-auth/callback',code_verifier:flow.verifier}),signal:AbortSignal.timeout(10000)});if(!tokenResponse.ok)throw new Error('token');const token:any=await tokenResponse.json();if(typeof token.access_token!=='string')throw new Error('token');
  const infoResponse=await fetch('https://login.yandex.ru/info?format=json',{headers:{Authorization:'OAuth '+token.access_token},signal:AbortSignal.timeout(10000)});if(!infoResponse.ok)throw new Error('profile');const info:any=await infoResponse.json(),subject=String(info.id||'');if(!/^\d{1,30}$/.test(subject))throw new Error('profile');
  const linked=await env.DB.prepare("SELECT owner FROM records WHERE id=? AND kind='ya-identity'").bind('ya-identity:'+subject).first<any>(),canonical=linked?.owner||flow.linkOwner||'';const name=String(info.display_name||info.real_name||info.login||'Путешественник').trim().slice(0,100),email=String(info.default_email||'').trim().slice(0,200),avatar=/^[A-Za-z0-9_-]{10,100}$/.test(info.default_avatar_id||'')?'https://avatars.yandex.net/get-yapic/'+info.default_avatar_id+'/islands-200':'';const session=await issue(env,{subject,name,email,avatar},canonical);
  const response=redirect(url.origin+'/'+flow.returnTo);response.headers.append('Set-Cookie',`${cookie}=${session.token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${YA_SESSION_DAYS*86400}`);response.headers.append('Set-Cookie',clearFlow);return response;
 }catch{return fail('yandex-failed',flow.returnTo)}
}

export async function yandexIdentity(request:Request,env:YandexEnv,renew=true){const token=request.headers.get('cookie')?.match(/(?:^|; )__Host-apsua_ya=([a-f0-9]{64})(?:;|$)/)?.[1];if(!token)return null;const id='ya-session:'+await yaSha(token),row=await env.DB.prepare("SELECT owner,body,created FROM records WHERE id=? AND kind='ya-session'").bind(id).first<any>();if(!row)return null;let data:any;try{data=JSON.parse(row.body)}catch{return null}const now=Date.now(),created=Number(data.created)||Number(row.created)||now,hard=created+YA_MAX_DAYS*YA_DAY;if(!(data.expires>now)||now>=hard)return null;let renewCookie='',target=Math.min(now+YA_SESSION_DAYS*YA_DAY,hard);if(renew&&target-data.expires>=YA_DAY){const next={...data,created,expires:target},changed=await env.DB.prepare("UPDATE records SET body=?,updated=? WHERE id=? AND body=?").bind(JSON.stringify(next),now,id,row.body).run();if(changed.meta.changes)renewCookie=`${cookie}=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${Math.floor((target-now)/1000)}`}
 const identity=await env.DB.prepare("SELECT body FROM records WHERE kind='ya-identity' AND owner=? ORDER BY updated DESC LIMIT 1").bind(row.owner).first<any>();let details:any={};try{details=identity?JSON.parse(identity.body):{}}catch{}return {id:String(row.owner),email:details.email||'',avatar:details.avatar||'',renewCookie}}
export async function yandexLogout(request:Request,env:YandexEnv){const token=request.headers.get('cookie')?.match(/(?:^|; )__Host-apsua_ya=([a-f0-9]{64})(?:;|$)/)?.[1];if(token)await env.DB.prepare("DELETE FROM records WHERE id=? AND kind='ya-session'").bind('ya-session:'+await yaSha(token)).run();const r=Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});r.headers.set('Set-Cookie',`${cookie}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`);return r}
