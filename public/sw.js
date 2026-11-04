// build 172: precache exactly what the current page shell loads; other fonts and images are cached on first use.
// admin-app.js is deliberately not precached: only staff download it, on first visit to /#/admin.
// Files with a version in the address (?v=...) and fonts never change under the same address,
// so they are served from the phone's cache without a network round trip. A new version gets a new address.
// Everything else (pages, unversioned images) still goes to the network first and uses the cache only offline.
const CACHE='apsua-hosted-v178';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./fleet.css?v=131','./fonts.css?v=131','./user-theme.css?v=148','./responsive-layout.css?v=131','./apple-theme.css?v=146','./v134.css?v=146','./v146.css?v=146','./v152.css?v=176','./apple-system.css?v=1','./intro.js?v=logo131','./search-pages.js?v=176','./user-app.js?v=176','./rail-motion.js?v=166','./live-updates.js?v=166','./visual-editor.js?v=173','./fonts/manrope-variable.woff2','./api/app-icon-180.png','./apple-touch-icon.png','./assets/app-icon-192-v141.png','./assets/app-icon-512-v141.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const keep=(request,response)=>{if(response.ok&&response.type==='basic'&&!response.headers.get('content-type')?.includes('text/html')){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy))}return response};
const offline=()=>new Response('Для загрузки этой страницы нужен интернет.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
const versioned=url=>url.searchParams.has('v')||url.pathname.startsWith('/fonts/');
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(url.pathname.startsWith('/api/'))return;if(e.request.method!=='GET'||url.origin!==location.origin)return;
if(versioned(url)){e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>keep(e.request,r))).catch(offline));return}
e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>keep(e.request,r)).catch(()=>caches.match(e.request).then(r=>r||offline())))});

self.addEventListener('push',event=>{let data={};try{data=event.data?.json()||{}}catch{}event.waitUntil(self.registration.showNotification(String(data.title||'Апсуа Тур').slice(0,80),{body:String(data.body||'Новое сообщение').slice(0,700),icon:'/assets/app-icon-192-v133.png',badge:'/assets/site-badge-96-v133.png',tag:String(data.tag||'apsua-message'),data:{url:typeof data.url==='string'&&/^\/[^/]/.test(data.url)?data.url:'/#/'}}))});
self.addEventListener('notificationclick',event=>{event.notification.close();const target=event.notification.data?.url||'/#/';event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){if(new URL(client.url).origin===self.location.origin){await client.focus();if(target!=='/#/'&&'navigate' in client)await client.navigate(target).catch(()=>{});return}}await self.clients.openWindow(target)})())});
