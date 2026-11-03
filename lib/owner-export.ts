type ExportEnv={
  DB:D1Database;
  BUCKET:R2Bucket;
  OWNER_EXPORT_ENABLED?:string;
  OWNER_EXPORT_TOKEN?:string;
};

const jsonHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(value:unknown,status=200)=>Response.json(value,{status,headers:jsonHeaders});
const encoder=new TextEncoder();

function sameSecret(left:string,right:string){
  const a=encoder.encode(left),b=encoder.encode(right),length=Math.max(a.length,b.length);let different=a.length^b.length;
  for(let index=0;index<length;index++)different|=(a[index]||0)^(b[index]||0);
  return different===0;
}

async function input(request:Request){
  const raw=await request.text();
  if(raw.length>100000)throw new Error('PAYLOAD_TOO_LARGE');
  if(!raw)return {} as any;
  const value=JSON.parse(raw);
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('BAD_JSON');
  return value as any;
}

function identifier(value:string){return '"'+value.replace(/"/g,'""')+'"'}
function iso(value:Date|undefined){return value instanceof Date?value.toISOString():value||null}

function objectMetadata(object:R2Object){
  return {
    key:object.key,
    version:object.version,
    size:object.size,
    etag:object.etag,
    uploaded:object.uploaded.toISOString(),
    storageClass:object.storageClass,
    httpMetadata:object.httpMetadata?{...object.httpMetadata,cacheExpiry:iso(object.httpMetadata.cacheExpiry)}:null,
    customMetadata:object.customMetadata||null,
    checksums:object.checksums?.toJSON?.()||{},
  };
}

async function schema(env:ExportEnv){
  const result=await env.DB.prepare("SELECT type,name,tbl_name,sql FROM sqlite_schema WHERE sql IS NOT NULL AND name NOT LIKE '_cf_%' ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 WHEN 'trigger' THEN 2 ELSE 3 END,name").all<any>();
  return result.results;
}

async function tableColumns(env:ExportEnv,table:string){
  const known=await env.DB.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name=? AND name NOT LIKE '_cf_%'").bind(table).first<any>();
  if(!known)throw new Error('UNKNOWN_TABLE');
  const result=await env.DB.prepare(`PRAGMA table_xinfo(${identifier(table)})`).all<any>();
  return result.results.filter((column:any)=>Number(column.hidden||0)===0);
}

async function d1Page(env:ExportEnv,value:any){
  const table=String(value.table||''),offset=Math.max(0,Math.floor(Number(value.offset)||0)),limit=Math.max(1,Math.min(500,Math.floor(Number(value.limit)||200)));
  if(!table||table.length>200)throw new Error('UNKNOWN_TABLE');
  const columns=await tableColumns(env,table);
  if(!columns.length)return {table,offset,limit,columns:[],rows:[],done:true};
  const selected=columns.flatMap((column:any,index:number)=>{
    const name=identifier(String(column.name));
    return [`typeof(${name}) AS ${identifier('t'+index)}`,`CASE typeof(${name}) WHEN 'integer' THEN CAST(${name} AS TEXT) WHEN 'blob' THEN hex(${name}) ELSE ${name} END AS ${identifier('v'+index)}`];
  });
  const query=`SELECT ${selected.join(',')} FROM ${identifier(table)} ORDER BY rowid LIMIT ? OFFSET ?`;
  let result;
  try{result=await env.DB.prepare(query).bind(limit,offset).all<any>()}
  catch{
    const primary=columns.filter((column:any)=>Number(column.pk)>0).sort((a:any,b:any)=>Number(a.pk)-Number(b.pk));
    if(!primary.length)throw new Error('TABLE_ORDER_UNAVAILABLE');
    result=await env.DB.prepare(`SELECT ${selected.join(',')} FROM ${identifier(table)} ORDER BY ${primary.map((column:any)=>identifier(String(column.name))).join(',')} LIMIT ? OFFSET ?`).bind(limit,offset).all<any>();
  }
  const rows=result.results.map((row:any)=>columns.map((_column:any,index:number)=>({type:row['t'+index],value:row['v'+index]})));
  return {table,offset,limit,columns:columns.map((column:any)=>({name:String(column.name),declaredType:String(column.type||''),notNull:!!column.notnull,primaryKey:Number(column.pk)||0})),rows,done:rows.length<limit,nextOffset:offset+rows.length};
}

export async function ownerExport(request:Request,env:ExportEnv,isOwner:boolean):Promise<Response|null>{
  const url=new URL(request.url),prefix='/api/owner-export/';
  if(!url.pathname.startsWith(prefix))return null;
  if(request.method!=='POST')return reply({error:'Метод не разрешён'},405);
  if(request.headers.get('origin')!==url.origin)return reply({error:'Недопустимый источник запроса'},403);
  if(!isOwner)return reply({error:'Доступ только владельцу'},403);
  if(env.OWNER_EXPORT_ENABLED!=='1'||!env.OWNER_EXPORT_TOKEN)return reply({error:'Экспорт отключён'},404);
  const supplied=request.headers.get('x-apsua-export-token')||'';
  if(!supplied||!sameSecret(supplied,env.OWNER_EXPORT_TOKEN))return reply({error:'Экспорт не разрешён'},403);
  try{
    const action=url.pathname.slice(prefix.length),value=await input(request);
    if(action==='status')return reply({ok:true,d1:'logical-sql',r2:'paginated-objects',maxPageSize:500});
    if(action==='d1-schema')return reply({schema:await schema(env)});
    if(action==='d1-page')return reply(await d1Page(env,value));
    if(action==='r2-list'){
      const limit=Math.max(1,Math.min(500,Math.floor(Number(value.limit)||200))),cursor=typeof value.cursor==='string'&&value.cursor?value.cursor:undefined;
      const listed=await env.BUCKET.list({limit,cursor,include:['httpMetadata','customMetadata']} as R2ListOptions);
      return reply({objects:listed.objects.map(objectMetadata),truncated:listed.truncated,cursor:listed.truncated?listed.cursor:null});
    }
    if(action==='r2-object'){
      const key=typeof value.key==='string'?value.key:'',version=typeof value.version==='string'?value.version:'',etag=typeof value.etag==='string'?value.etag:'';
      if(!key||key.length>1024||!version||!etag)return reply({error:'Укажите ключ, версию и ETag'},400);
      const object=await env.BUCKET.get(key,{onlyIf:{etagMatches:etag}});
      if(!object||!('body' in object)||!object.body)return reply({error:'Объект изменился или удалён'},409);
      if(object.version!==version||object.etag!==etag)return reply({error:'Версия объекта изменилась'},409);
      const headers=new Headers({'Cache-Control':'no-store','Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename="r2-object.bin"','X-Content-Type-Options':'nosniff','ETag':object.httpEtag,'X-Apsua-R2-Version':object.version,'X-Apsua-R2-Size':String(object.size)});
      return new Response(object.body,{headers});
    }
    return reply({error:'Экспортный маршрут не найден'},404);
  }catch(error){
    const code=error instanceof Error?error.message:'';
    if(code==='UNKNOWN_TABLE')return reply({error:'Таблица не найдена'},404);
    if(code==='TABLE_ORDER_UNAVAILABLE')return reply({error:'Для таблицы нельзя построить стабильный порядок'},409);
    if(code==='PAYLOAD_TOO_LARGE')return reply({error:'Слишком много данных'},413);
    if(code==='BAD_JSON'||error instanceof SyntaxError)return reply({error:'Некорректный JSON'},400);
    return reply({error:'Экспорт временно недоступен'},500);
  }
}
