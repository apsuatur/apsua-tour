
(function(){
"use strict";

/* Public URLs share the server's canonical paths. Private admin keeps its draft guards. */
function routeHash(url=location){
 if(url.hash && (/^#\//.test(url.hash)||/^#(?:tour-|home$|catalog$|transfer(?:\/|$)|excursions-from\/|map$|reviews$|diary$|favorites$|account$|popular$|install$|admin$)/.test(url.hash)))return url.hash;
 const path=url.pathname.replace(/\/$/,'')||'/';
 const mapped=path.replace(/^\/tour\//,'/excursions/').replace(/^\/catalog(?=\/|$)/,'/excursions').replace(/^\/journal(?=\/|$)/,'/diary').replace(/^\/administrator(?=\/|$)/,'/admin');
 return '#'+(mapped==='/index.html'?'/':mapped)+(url.search||'');
}
window.apsuaRouteHash=routeHash;
/* Text for search engines sits under the page, folded into one tile. */
function searchMoreHTML(label,body){return '<section class="wrap section search-more-wrap" data-search-content><details class="search-more"><summary>'+esc(label)+'</summary><div class="prose search-more-body">'+body+'</div></details></section>'}
function publicURL(hash){
 if(!/^#\//.test(hash)||/^#\/(admin)(?:[/?]|$)/.test(hash))return null;
 let path=hash.slice(1).replace(/^\/excursions\//,'/tour/');
 path=path.replace(/^\/diary(?=[/?]|$)/,'/journal');
 return path;
}
function canonicalPublicURL(){
 const path=publicURL(routeHash());
 if(path&&location.hash.startsWith('#/')){history.replaceState(history.state,'',path);routePreviousURL=location.href}
 if(/^#\/admin(?:[/?]|$)/.test(routeHash())&&!location.hash)history.replaceState(history.state,'',location.pathname+location.search+routeHash());
}
function publicLinks(root=document){
 for(const a of root.querySelectorAll('a[href^="#/"],a[href^="/#/"]')){
  const href=a.getAttribute('href').replace(/^\/#/,'#'),url=publicURL(href);
  if(url)a.setAttribute('href',url);
 }
}
new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'){const a=r.target;if(a.matches?.('a[href^="#/"],a[href^="/#/"]')){const url=publicURL(a.getAttribute('href').replace(/^\/#/,'#'));if(url)a.setAttribute('href',url)}}else for(const n of r.addedNodes)if(n.nodeType===1){if(n.matches?.('a[href]')){const url=publicURL(n.getAttribute('href').replace(/^\/#/,'#'));if(url)n.setAttribute('href',url)}publicLinks(n)}}}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
publicLinks();
document.addEventListener('click',e=>{
 const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download')||/^#\/admin(?:[/?]|$)/.test(routeHash()))return;
 const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.hash||!/^\/(?:$|catalog(?:[/?]|$)|tour\/|transfer(?:\/|$)|excursions-from\/|map$|reviews$|journal(?:\/|$)|useful(?:\/|$)|faq$|fleet$|about$|contacts$|orders$|account$|favorites$|compare$|pick$|install$)/.test(u.pathname))return;
 if(u.pathname==='/account'&&!serverIdentity&&serverTelegramAuth.enabled)return;
 if(u.pathname==='/faq'&&current==='home'&&$('#faq')){e.preventDefault();v17CloseMenu(true);v17ScrollToFaq(true);history.replaceState(history.state,'','/faq');routePreviousURL=location.href;return}
 e.preventDefault();const hash=routeHash(u);if(hash===routeHash())return;location.hash=hash;
},true);
// Traversing between two clean history entries does not emit a native hashchange.
let routePreviousURL=location.href;
window.addEventListener('popstate',()=>{const oldURL=routePreviousURL,newURL=location.href;routePreviousURL=newURL;if(new URL(oldURL).hash===location.hash)window.dispatchEvent(new HashChangeEvent('hashchange',{oldURL,newURL}))});
window.addEventListener('hashchange',()=>{queueMicrotask(()=>{routePreviousURL=location.href})});

/* ---------- Painted illustrations (placeholders for real photos) ---------- */
const PALS=[
  {s1:'#7fc3d6',s2:'#f4dfbf',sun:'#fff4d8',far:'#9ab9bd',mid:'#4f8175',near:'#20453c',water:'#2a7d87',deep:'#155a63'},
  {s1:'#4ea6d4',s2:'#cfe8f1',sun:'#fffbea',far:'#a3c1c6',mid:'#3b7562',near:'#1b3d33',water:'#1d6f8c',deep:'#0f4c63'},
  {s1:'#33406f',s2:'#f2a25c',sun:'#ffd08a',far:'#7b6f8e',mid:'#4a506a',near:'#24293b',water:'#3d4d78',deep:'#252f52'}
];
const cache={};
function ridge(g,w,h,base,amp,seed,color){
  g.fillStyle=color;g.beginPath();g.moveTo(0,h);
  for(let x=0;x<=w;x+=6){
    const y=base-amp*(.5*Math.sin(x*.0042+seed)+.3*Math.sin(x*.011+seed*2.3)+.2*Math.sin(x*.029+seed*3.7));
    g.lineTo(x,y);
  }
  g.lineTo(w,h);g.closePath();g.fill();
}
function pine(g,x,y,s,c){g.fillStyle=c;for(let i=0;i<4;i++){const yy=y-i*s*.55;g.beginPath();g.moveTo(x-s*(.62-i*.12),yy);g.lineTo(x,yy-s*.9);g.lineTo(x+s*(.62-i*.12),yy);g.closePath();g.fill();}g.fillRect(x-s*.07,y,s*.14,s*.3);}
function palm(g,x,y,s,c){
  g.strokeStyle=c;g.lineWidth=s*.09;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+s*.25,y-s*.9,x+s*.1,y-s*1.8);g.stroke();
  const tx=x+s*.1,ty=y-s*1.8;g.lineWidth=s*.07;
  [[-1.2,.6],[-.7,.9],[0,1],[.7,.85],[1.25,.55],[-1.5,.2],[1.5,.25]].forEach(([dx,dy])=>{g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+dx*s*.5,ty-s*.5*dy,tx+dx*s*.9,ty+s*(.35-.25*dy));g.stroke();});
}
function cypress(g,x,y,s,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y-s,s*.18,s,0,0,Math.PI*2);g.fill();}
function paint(kind,v,W,H){
  W=W||800;H=H||600;const key=kind+v+W;if(cache[key])return cache[key];
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const p=PALS[v%3];const k=W/800;
  let gr=g.createLinearGradient(0,0,0,H*.75);gr.addColorStop(0,p.s1);gr.addColorStop(1,p.s2);g.fillStyle=gr;g.fillRect(0,0,W,H);
  const sunX=W*(.62+.12*((v*7)%3)/2),sunY=H*(v===2?.5:.26);
  const sg=g.createRadialGradient(sunX,sunY,0,sunX,sunY,H*.35);sg.addColorStop(0,p.sun);sg.addColorStop(.15,p.sun+'cc');sg.addColorStop(1,p.sun+'00');g.fillStyle=sg;g.fillRect(0,0,W,H);
  g.fillStyle=p.sun;g.beginPath();g.arc(sunX,sunY,H*.05,0,7);g.fill();
  const seed=kind.length+v*1.7;
  const water=(top)=>{let wg=g.createLinearGradient(0,top,0,H);wg.addColorStop(0,p.water);wg.addColorStop(1,p.deep);g.fillStyle=wg;g.fillRect(0,top,W,H-top);
    g.strokeStyle=p.sun+'88';g.lineWidth=2*k;for(let i=0;i<14;i++){const yy=top+8*k+i*i*2.2*k;const half=(26+i*9)*k;g.beginPath();g.moveTo(sunX-half,yy);g.lineTo(sunX+half,yy);g.stroke();}
    g.strokeStyle='rgba(255,255,255,.12)';for(let i=0;i<22;i++){const yy=top+(i*17)%(H-top);const xx=(i*137)%W;g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+40*k,yy);g.stroke();}};
  if(kind==='sea'){ridge(g,W,H,H*.5,H*.1,seed,p.far);ridge(g,W,H,H*.6,H*.06,seed+2,p.mid);water(H*.62);
    g.fillStyle=p.near;g.beginPath();g.moveTo(0,H);g.lineTo(0,H*.84);g.quadraticCurveTo(W*.2,H*.8,W*.34,H);g.fill();palm(g,W*.08,H*.9,H*.28,p.near);palm(g,W*.2,H*.95,H*.22,p.near);}
  else if(kind==='lake'){ridge(g,W,H,H*.42,H*.2,seed,p.far);ridge(g,W,H,H*.58,H*.22,seed+1.3,p.mid);
    let lg=g.createLinearGradient(0,H*.6,0,H);lg.addColorStop(0,'#3aa3a8');lg.addColorStop(1,p.deep);g.fillStyle=lg;g.beginPath();g.ellipse(W*.5,H*.76,W*.62,H*.17,0,0,7);g.fill();
    g.globalAlpha=.25;g.save();g.translate(0,H*1.18);g.scale(1,-.5);ridge(g,W,H,H*.58,H*.22,seed+1.3,p.mid);g.restore();g.globalAlpha=1;
    g.fillStyle=p.near;g.fillRect(0,H*.9,W,H*.1);for(let i=0;i<9;i++){pine(g,(i<5?i*45:W-(i-4)*48)*k,H*(.93+(i%2)*.03),H*(.16+(i%3)*.04),p.near);}}
  else if(kind==='mountains'){ridge(g,W,H,H*.4,H*.24,seed,p.far);
    g.fillStyle='rgba(255,255,255,.55)';for(let x=0;x<W;x+=6){const y=H*.4-H*.24*(.5*Math.sin(x*.0042+seed)+.3*Math.sin(x*.011+seed*2.3)+.2*Math.sin(x*.029+seed*3.7));if(y<H*.3)g.fillRect(x,y,6,(H*.3-y)*.6);}
    ridge(g,W,H,H*.6,H*.16,seed+2,p.mid);ridge(g,W,H,H*.78,H*.07,seed+4,p.near);for(let i=0;i<6;i++)pine(g,W*(.06+i*.17),H*(.86+(i%2)*.04),H*.12,p.near);}
  else if(kind==='waterfall'){ridge(g,W,H,H*.3,H*.12,seed,p.far);g.fillStyle=p.mid;g.fillRect(0,H*.22,W*.38,H);g.fillRect(W*.62,H*.18,W*.38,H);
    g.fillStyle=p.near;g.beginPath();g.moveTo(0,H*.3);g.lineTo(W*.36,H*.26);g.lineTo(W*.42,H);g.lineTo(0,H);g.fill();g.beginPath();g.moveTo(W,H*.24);g.lineTo(W*.64,H*.24);g.lineTo(W*.58,H);g.lineTo(W,H);g.fill();
    let fg=g.createLinearGradient(0,H*.24,0,H*.85);fg.addColorStop(0,'rgba(255,255,255,.95)');fg.addColorStop(1,'rgba(220,240,245,.7)');g.fillStyle=fg;g.fillRect(W*.4,H*.25,W*.2,H*.62);
    g.strokeStyle='rgba(160,205,215,.8)';g.lineWidth=3*k;for(let i=0;i<12;i++){const x=W*.41+i*W*.016;g.beginPath();g.moveTo(x,H*.26);g.lineTo(x+((i%3)-1)*4,H*.86);g.stroke();}
    g.fillStyle=p.water;g.beginPath();g.ellipse(W*.5,H*.92,W*.3,H*.08,0,0,7);g.fill();
    g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(W*.5,H*.86,W*.16,H*.05,0,0,7);g.fill();
    for(let i=0;i<5;i++)pine(g,W*(i<3?.04+i*.1:.74+(i-3)*.12),H*.98,H*.18,p.near);}
  else if(kind==='cave'){g.fillStyle='#120f0d';g.fillRect(0,0,W,H);
    let cg=g.createRadialGradient(W*.5,H*.62,10,W*.5,H*.6,W*.55);cg.addColorStop(0,'#f6c37a');cg.addColorStop(.35,'#a8662c');cg.addColorStop(1,'#120f0d');g.fillStyle=cg;g.beginPath();g.ellipse(W*.5,H*.66,W*.56,H*.5,0,Math.PI,0);g.lineTo(W*1.06,H);g.lineTo(-W*.06,H);g.fill();
    g.fillStyle='#120f0d';for(let i=0;i<26;i++){const x=(i*61+v*23)%W,l=(30+(i*37)%110)*k;g.beginPath();g.moveTo(x-10*k,0);g.lineTo(x,l+H*.1);g.lineTo(x+10*k,0);g.fill();}
    for(let i=0;i<9;i++){const x=(i*97+40)%W,hh=(20+(i*29)%70)*k;g.beginPath();g.moveTo(x-12*k,H*.86);g.lineTo(x,H*.86-hh);g.lineTo(x+12*k,H*.86);g.fill();}
    let pg=g.createLinearGradient(0,H*.86,0,H);pg.addColorStop(0,'#3a6f74');pg.addColorStop(1,'#0e1d1f');g.fillStyle=pg;g.fillRect(0,H*.86,W,H*.14);
    g.fillStyle='rgba(255,215,150,.9)';for(let i=0;i<7;i++){g.beginPath();g.arc(W*(.18+i*.11),H*(.78-(i%2)*.04),3*k,0,7);g.fill();}}
  else if(kind==='ruins'){ridge(g,W,H,H*.55,H*.1,seed,p.far);g.fillStyle=p.mid;g.beginPath();g.moveTo(0,H);g.lineTo(0,H*.72);g.quadraticCurveTo(W*.45,H*.38,W,H*.7);g.lineTo(W,H);g.fill();
    g.fillStyle=p.near;const tx=W*.46,ty=H*.48;g.fillRect(tx-W*.06,ty-H*.24,W*.12,H*.26);for(let i=0;i<4;i++)g.fillRect(tx-W*.06+i*W*.034,ty-H*.28,W*.022,H*.05);
    g.fillRect(tx-W*.22,ty-H*.06,W*.44,H*.08);for(let i=0;i<9;i++)g.fillRect(tx-W*.22+i*W*.05,ty-H*.09,W*.03,H*.04);
    g.fillStyle=p.s2;g.beginPath();g.arc(tx,ty-H*.12,W*.018,Math.PI,0);g.fillRect(tx-W*.018,ty-H*.12,W*.036,H*.05);g.fill();
    for(let i=0;i<5;i++)cypress(g,W*(.12+i*.05)+(i>2?W*.55:0),H*(.86+(i%2)*.03),H*.15,p.near);g.fillStyle=p.near;g.fillRect(0,H*.9,W,H*.1);}
  else if(kind==='garden'){ridge(g,W,H,H*.55,H*.08,seed,p.far);water(H*.6);g.fillStyle=p.mid;g.fillRect(0,H*.72,W,H*.28);
    g.fillStyle=p.s2;g.beginPath();g.moveTo(W*.44,H);g.lineTo(W*.5,H*.73);g.lineTo(W*.54,H*.73);g.lineTo(W*.68,H);g.fill();
    for(let i=0;i<5;i++)palm(g,W*(.06+i*.09),H*(.98-(i%2)*.04),H*(.2+(i%3)*.05),p.near);for(let i=0;i<4;i++)palm(g,W*(.72+i*.08),H*(.97-(i%2)*.05),H*(.22+(i%2)*.06),p.near);}
  else if(kind==='canyon'){g.fillStyle=p.mid;g.beginPath();g.moveTo(0,0);g.lineTo(W*.4,0);g.lineTo(W*.46,H*.4);g.lineTo(W*.38,H);g.lineTo(0,H);g.fill();g.beginPath();g.moveTo(W,0);g.lineTo(W*.58,0);g.lineTo(W*.54,H*.42);g.lineTo(W*.64,H);g.lineTo(W,H);g.fill();
    g.fillStyle=p.near;g.beginPath();g.moveTo(0,0);g.lineTo(W*.3,0);g.lineTo(W*.36,H);g.lineTo(0,H);g.fill();g.beginPath();g.moveTo(W,0);g.lineTo(W*.68,0);g.lineTo(W*.66,H);g.lineTo(W,H);g.fill();
    g.fillStyle=p.far;g.beginPath();g.moveTo(W*.44,H);g.lineTo(W*.49,H*.5);g.lineTo(W*.52,H*.5);g.lineTo(W*.6,H);g.fill();
    g.strokeStyle=p.s2;g.lineWidth=2*k;g.setLineDash([12*k,10*k]);g.beginPath();g.moveTo(W*.505,H*.52);g.lineTo(W*.52,H);g.stroke();g.setLineDash([]);
    g.fillStyle='rgba(120,170,110,.5)';for(let i=0;i<30;i++){g.beginPath();g.arc((i%2?W*.33:W*.67)+((i*13)%30-15)*k,H*(i/30),8*k,0,7);g.fill();}}
  else if(kind==='forest'){ridge(g,W,H,H*.5,H*.06,seed,p.far);water(H*.56);g.fillStyle=p.s2;g.fillRect(0,H*.7,W,H*.05);
    g.fillStyle=p.mid;g.fillRect(0,H*.74,W,H*.26);for(let i=0;i<14;i++){const x=W*(i/13),s=H*(.2+((i*7)%5)*.035);g.strokeStyle=p.near;g.lineWidth=5*k;g.beginPath();g.moveTo(x,H);g.lineTo(x+6*k,H*.98-s*.9);g.stroke();g.fillStyle=p.near;g.beginPath();g.ellipse(x+6*k,H*.98-s,s*.38,s*.16,0,0,7);g.fill();}}
  else if(kind==='vineyard'){ridge(g,W,H,H*.4,H*.14,seed,p.far);ridge(g,W,H,H*.55,H*.07,seed+3,p.mid);
    g.fillStyle='#6f8f45';g.fillRect(0,H*.6,W,H*.4);g.strokeStyle=p.near;g.lineWidth=7*k;g.lineCap='round';
    for(let i=-6;i<=6;i++){g.beginPath();g.moveTo(W*.5+i*W*.012,H*.6);g.lineTo(W*.5+i*W*.16,H);g.stroke();}
    g.fillStyle='#f3ead9';g.fillRect(W*.7,H*.47,W*.12,H*.1);g.fillStyle='#8c3b2b';g.beginPath();g.moveTo(W*.69,H*.47);g.lineTo(W*.76,H*.41);g.lineTo(W*.83,H*.47);g.fill();cypress(g,W*.86,H*.58,H*.1,p.near);}
  else if(kind==='road'){ridge(g,W,H,H*.38,H*.16,seed,p.far);ridge(g,W,H,H*.5,H*.1,seed+2,p.mid);water(H*.56);
    g.fillStyle=p.near;g.beginPath();g.moveTo(0,H);g.lineTo(0,H*.62);g.quadraticCurveTo(W*.35,H*.58,W*.55,H*.72);g.quadraticCurveTo(W*.75,H*.86,W,H*.8);g.lineTo(W,H);g.fill();
    g.strokeStyle='#5d6461';g.lineWidth=46*k;g.lineCap='round';g.beginPath();g.moveTo(-20,H*.74);g.quadraticCurveTo(W*.4,H*.66,W*.62,H*.84);g.quadraticCurveTo(W*.78,H*.97,W+20,H*.92);g.stroke();
    g.strokeStyle='#f3ead9';g.lineWidth=3*k;g.setLineDash([18*k,16*k]);g.stroke();g.setLineDash([]);
    const cx=W*.47,cy=H*.745;g.fillStyle='#f4f6f5';g.beginPath();g.moveTo(cx-60*k,cy);g.lineTo(cx-48*k,cy-26*k);g.lineTo(cx+30*k,cy-28*k);g.lineTo(cx+56*k,cy-4*k);g.lineTo(cx+62*k,cy+10*k);g.lineTo(cx-62*k,cy+12*k);g.closePath();g.fill();
    g.fillStyle='#24323a';g.fillRect(cx-40*k,cy-22*k,62*k,16*k);g.beginPath();g.arc(cx-36*k,cy+12*k,11*k,0,7);g.arc(cx+40*k,cy+12*k,11*k,0,7);g.fill();
    for(let i=0;i<4;i++)palm(g,W*(.8+i*.05),H*(.86-(i%2)*.03),H*.2,p.near);}
  cache[key]=c.toDataURL('image/jpeg',.86);return cache[key];
}
const APP_ICON='/api/app-icon-512.png';
const APP_ICON_192='/api/app-icon-192.png';
/* Real geography: GADM district boundaries + Natural Earth neighbours, equirectangular projection */
const GEO={"W":1000,"H":798,"dist":{"gagra":"M315.4,125.8 314.9,144.5 313.8,146.5 309.9,146.8 300.6,144.3 297.5,145.3 296.8,147.4 298.0,151.8 305.2,157.8 308.5,181.9 312.4,196.7 309.9,207.1 307.7,211.6 302.3,219.7 293.2,229.3 290.7,234.4 288.1,244.9 287.9,259.6 281.7,272.6 281.6,275.3 285.3,289.8 279.5,301.9 274.6,318.2 278.8,326.4 281.5,336.2 278.9,336.2 271.6,329.2 267.5,328.3 263.1,328.9 254.3,334.0 248.6,340.6 248.9,343.0 247.2,344.6 237.8,336.3 233.6,330.5 226.6,327.5 219.7,319.1 215.9,280.3 212.6,263.8 207.8,249.9 203.1,244.8 197.5,243.7 190.0,238.8 183.2,237.7 171.5,233.5 165.9,230.2 159.3,224.2 156.8,222.9 152.6,223.1 137.7,212.6 134.8,211.8 125.5,212.3 115.9,209.1 109.1,208.2 108.8,200.3 110.8,191.2 110.3,186.7 120.4,167.4 123.4,153.0 130.6,143.9 132.4,137.6 144.0,126.1 145.4,122.7 143.1,114.3 143.1,110.1 144.6,106.5 146.6,104.0 148.6,103.5 156.1,105.2 160.3,104.5 171.5,99.7 177.5,98.3 184.4,99.9 192.5,99.8 198.6,96.2 207.7,94.3 213.8,95.3 221.7,99.9 226.1,104.0 231.8,103.0 234.7,104.3 243.9,112.5 252.3,110.9 260.3,114.6 276.9,116.6 280.8,116.5 288.8,111.0 296.8,116.1 305.3,117.2 309.3,119.7 312.8,124.7 315.4,125.8Z","gal":"M899.8,651.6 885.2,673.1 867.5,693.1 843.8,709.5 817.3,722.6 810.7,723.6 799.5,727.8 780.4,750.9 750.6,766.0 746.1,738.6 742.4,703.0 737.3,672.9 734.9,660.4 733.0,656.7 728.6,637.3 723.8,622.3 737.1,618.9 741.6,616.8 748.2,608.9 765.7,601.5 774.4,596.5 777.5,591.0 780.0,588.8 807.1,581.9 815.5,573.4 833.1,573.1 835.2,570.1 835.6,551.8 837.5,551.2 843.8,553.5 861.1,563.3 864.5,563.7 869.9,561.7 876.6,549.7 879.0,547.2 892.7,537.7 895.4,537.7 897.4,543.4 897.8,553.7 899.7,559.8 900.1,588.5 903.9,597.7 912.2,606.4 917.2,614.3 917.8,617.6 917.4,628.7 912.9,644.7 906.8,649.2 899.8,651.6Z","gudauta":"M281.5,336.2 278.8,326.4 274.6,318.2 279.5,301.9 285.3,289.8 281.6,275.3 281.7,272.6 287.9,259.6 288.1,244.9 290.7,234.4 293.2,229.3 302.3,219.7 307.7,211.6 309.9,207.1 312.4,196.7 308.5,181.9 305.2,157.8 298.0,151.8 296.8,147.4 297.5,145.3 300.6,144.3 309.9,146.8 313.8,146.5 314.9,144.5 315.4,125.8 342.5,133.4 348.8,129.9 359.2,117.5 362.5,115.3 369.0,113.5 376.0,108.6 382.9,109.3 386.5,112.5 390.9,120.5 393.2,122.5 400.5,124.8 409.0,125.7 418.8,130.9 426.7,137.6 438.5,143.3 434.9,150.1 430.0,155.1 426.9,156.4 413.8,156.6 410.5,158.8 404.6,165.7 413.6,187.5 423.6,207.7 426.5,222.0 426.1,227.9 419.4,241.3 411.5,252.4 410.8,258.5 412.5,262.0 429.4,268.1 435.9,268.4 442.2,266.2 449.6,267.2 463.5,283.6 464.5,287.8 464.9,308.8 468.8,317.9 479.0,328.5 482.3,342.7 481.7,347.4 476.2,358.5 477.2,360.5 486.0,360.5 488.6,361.8 491.3,379.5 490.2,383.8 486.4,389.6 477.1,399.4 469.7,388.9 464.8,384.6 462.3,383.8 456.4,383.5 446.8,380.2 439.1,379.4 434.3,381.0 429.0,378.9 418.6,377.5 405.3,378.8 397.0,377.7 392.6,378.3 382.7,375.0 378.4,371.5 371.3,370.1 358.2,375.1 345.9,375.6 343.3,374.2 340.1,369.0 338.5,368.3 329.2,353.6 320.9,346.8 314.3,345.5 308.4,347.1 304.2,345.7 300.1,348.0 295.2,342.5 291.1,340.4 285.7,340.1 281.5,336.2Z","gulripsh":"M553.3,455.0 573.6,435.2 582.3,429.0 595.9,409.9 596.5,388.8 605.0,355.0 605.5,330.6 612.5,309.6 619.3,298.4 639.4,271.7 652.0,263.9 655.9,256.6 656.9,245.8 659.9,236.1 666.9,230.8 671.5,223.4 674.4,221.4 680.2,223.2 688.1,220.8 690.8,221.6 695.9,226.3 697.0,251.2 698.1,253.3 703.2,255.1 715.9,256.5 720.3,258.4 726.8,266.1 730.8,269.1 748.0,278.9 751.8,285.8 759.7,288.8 763.5,293.4 770.5,294.6 783.6,300.5 787.8,300.0 791.6,296.8 794.8,296.4 809.1,304.1 815.5,305.0 819.0,303.2 823.9,295.7 827.5,294.9 832.5,298.2 838.7,304.7 851.5,307.4 860.3,311.4 862.5,311.4 876.0,307.4 880.5,304.6 882.5,300.6 879.5,292.4 881.8,287.5 884.1,286.8 886.7,287.3 891.9,292.6 902.9,297.5 913.6,299.2 920.5,308.1 923.8,307.8 929.1,305.1 944.9,305.3 950.0,310.0 953.6,315.4 957.6,316.6 961.5,317.0 971.3,311.0 980.8,310.5 984.5,309.3 994.5,301.8 998.1,301.5 1002.1,302.8 991.7,328.5 991.4,344.3 984.4,350.4 965.3,376.0 951.5,389.5 926.5,401.2 913.5,401.1 907.8,399.2 900.0,398.7 893.6,396.7 881.6,396.4 875.7,394.4 859.9,394.1 852.8,391.9 837.5,391.7 831.1,389.6 820.7,389.6 814.9,392.1 801.5,402.4 775.0,414.2 761.3,424.5 742.9,431.2 736.5,431.3 730.6,429.3 714.7,429.2 708.2,431.2 699.9,431.5 687.5,437.4 675.1,438.2 665.6,440.5 659.7,443.6 650.0,451.9 648.0,458.2 647.4,467.3 644.8,479.9 639.1,493.2 622.8,506.6 599.4,518.4 598.4,520.9 598.2,539.4 593.4,545.8 583.5,544.0 581.7,542.1 578.5,534.0 572.6,528.3 571.8,525.4 566.6,520.2 565.1,517.0 557.9,474.8 553.3,455.0Z","ochamchira":"M592.9,546.2 598.2,539.4 598.4,520.9 599.4,518.4 622.8,506.6 639.1,493.2 644.8,479.9 647.4,467.3 648.0,458.2 650.0,451.9 661.1,442.6 675.1,438.2 687.5,437.4 699.9,431.5 708.2,431.2 717.6,429.1 730.6,429.3 736.5,431.3 741.3,431.5 756.3,426.8 761.3,424.5 775.0,414.2 801.5,402.4 814.9,392.1 820.7,389.6 831.1,389.6 837.5,391.7 852.8,391.9 859.9,394.1 875.7,394.4 881.6,396.4 893.6,396.7 900.0,398.7 907.8,399.2 913.5,401.1 928.7,400.7 953.3,388.1 965.3,376.0 984.4,350.4 991.4,344.3 995.4,352.3 995.7,355.7 993.1,365.8 988.9,376.3 981.2,391.5 965.0,406.1 963.1,410.1 962.1,416.5 959.6,420.9 950.5,423.4 939.7,423.9 934.3,425.7 927.4,426.3 915.8,431.8 897.5,435.3 887.2,441.1 888.9,451.8 891.2,456.1 901.6,458.1 901.9,463.0 900.0,468.5 900.0,482.0 901.0,484.4 905.9,488.6 906.7,496.6 910.4,501.8 910.7,505.9 906.0,514.5 896.5,518.7 890.3,527.0 890.3,530.3 895.4,535.5 895.4,537.7 891.1,538.2 879.0,547.2 876.6,549.7 869.9,561.7 862.8,564.0 843.8,553.5 837.5,551.2 835.6,551.8 835.2,570.1 833.1,573.1 815.5,573.4 807.1,581.9 780.0,588.8 777.5,591.0 774.4,596.5 765.7,601.5 748.2,608.9 741.6,616.8 737.1,618.9 723.8,622.4 715.1,596.9 705.1,577.9 702.4,575.2 697.7,575.8 698.8,573.9 697.2,573.1 698.1,572.2 696.7,573.0 696.6,576.3 690.1,566.9 685.1,563.9 678.8,561.9 670.1,561.2 659.0,557.0 652.0,556.8 641.1,549.0 628.1,546.0 613.8,540.5 607.7,540.2 602.6,541.9 595.7,546.8 592.9,546.2Z","suhum":"M477.1,399.4 485.4,391.0 490.2,383.8 491.2,376.5 489.4,371.0 488.6,361.8 486.0,360.5 477.2,360.5 476.2,358.5 481.7,347.4 482.3,342.7 479.0,328.5 468.8,317.9 464.9,308.8 464.5,287.8 463.5,283.6 452.0,269.4 448.1,266.6 442.2,266.2 435.9,268.4 431.0,268.5 415.5,263.5 411.4,260.7 410.7,255.5 411.5,252.4 419.4,241.3 423.9,232.5 426.1,227.9 426.5,222.0 423.6,207.7 404.8,167.7 405.5,164.1 410.5,158.8 413.8,156.6 426.9,156.4 430.0,155.1 434.9,150.1 438.5,143.3 450.8,150.8 470.5,151.0 478.0,156.5 478.5,159.4 477.3,166.4 479.1,168.6 486.7,172.4 489.8,175.3 494.1,185.0 499.6,186.9 506.1,186.4 509.9,185.1 514.0,180.7 516.5,180.3 519.6,181.5 533.6,190.5 538.4,197.9 538.8,204.8 546.4,209.6 558.4,212.5 563.1,212.3 570.7,202.4 578.8,202.7 612.2,214.8 626.2,223.6 642.5,227.5 650.8,237.2 659.1,237.1 656.9,245.8 655.9,256.6 652.0,263.9 639.4,271.7 619.3,298.4 612.0,311.0 605.1,332.8 605.0,355.0 596.5,388.8 595.9,409.9 591.0,417.4 582.3,429.0 573.6,435.2 553.3,455.0 544.5,436.7 540.2,431.5 534.2,428.4 531.0,428.5 528.2,430.4 518.3,429.8 517.7,432.3 511.5,438.0 509.2,438.6 507.2,437.9 502.0,429.3 494.5,423.1 491.7,416.0 487.8,410.5 482.2,407.1 480.8,404.4 479.0,403.6 477.1,399.4Z"},"lbl":{"gagra":[205,150],"gudauta":[345,300],"suhum":[505,250],"gulripsh":[760,330],"ochamchira":[765,440],"gal":[800,722]},"pins":{"psou":[106.3,208.1],"gagra":[216.7,268.0],"pitsunda":[245.8,336.4],"ritsa":[331.3,159.7],"gudauta":[366.7,364.9],"afon":[443.7,376.3],"suhum":[529.2,427.6],"kamany":[562.5,376.3],"ochamchira":[716.7,593.0],"tkuarchal":[804.2,518.9],"gulripsh":[563.3,467.6],"dranda":[586.7,498.3],"gal":[827.5,640.9]}};

/* ---------- Storage ---------- */
const store={get(k,d){try{const v=localStorage.getItem('apsua.'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('apsua.'+k,JSON.stringify(v));return true}catch(e){return false}},del(k){try{localStorage.removeItem('apsua.'+k)}catch(e){}}};
const sess={get(k){try{return sessionStorage.getItem('apsua.'+k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem('apsua.'+k,v)}catch(e){}},del(k){try{sessionStorage.removeItem('apsua.'+k)}catch(e){}}};
/* Images uploaded in the admin panel live in IndexedDB (too big for localStorage). Content refers to them as "img:<key>". */
const IMG={};
const idb={db:null,
 open(){return new Promise(res=>{try{const r=indexedDB.open('apsua-tour',1);r.onupgradeneeded=()=>r.result.createObjectStore('img');r.onsuccess=()=>{this.db=r.result;res(true)};r.onerror=()=>res(false)}catch(e){res(false)}})},
 tx(mode){return this.db.transaction('img',mode).objectStore('img')},
 loadAll(){return new Promise(res=>{if(!this.db)return res();try{const st=this.tx('readonly');const rq=st.openCursor();rq.onsuccess=()=>{const c=rq.result;if(c){IMG[c.key]=c.value;c.continue()}else res()};rq.onerror=()=>res()}catch(e){res()}})},
 put(k,v){IMG[k]=v;return new Promise(res=>{if(!this.db)return res(false);try{const r=this.tx('readwrite').put(v,k);r.onsuccess=()=>res(true);r.onerror=()=>res(false)}catch(e){res(false)}})},
 del(k){delete IMG[k];if(!this.db)return;try{this.tx('readwrite').delete(k)}catch(e){}},
 clear(){for(const k in IMG)delete IMG[k];if(!this.db)return;try{this.tx('readwrite').clear()}catch(e){}}
};
const src=(v,scene,w,h)=>{if(v){let value=String(v);if(value.startsWith('img:'))value=String(IMG[value.slice(4)]||'');if(value&&(/^(?:https?:\/\/|\/api\/media\/|\/?assets\/|data:image\/(?:png|jpeg|webp);base64,|blob:)/i.test(value)))return esc(value)}return scene?paint(scene[0],scene[1],w,h):''};

/* ---------- Reference data ---------- */
const CAT={sea:'Море',mount:'Горы',hist:'История и культура',food:'Гастро',nature:'Природа',active:'Активный отдых',relax:'SPA и релакс'};
const DISTRICTS=[
 {id:'gagra',name:'Гагрский район',short:'Гагрский',about:'Гагра, Пицунда, Цандрыпш: курортное побережье, колоннада и реликтовые сосны.'},
 {id:'gudauta',name:'Гудаутский район',short:'Гудаутский',about:'Новый Афон, Гудаута, Лыхны, Мюссера и дорога к озеру Рица.'},
 {id:'suhum',name:'Сухумский район',short:'Сухумский',about:'Сухум, Каманы, Ешера: столица у моря и святыни в предгорьях.'},
 {id:'gulripsh',name:'Гулрыпшский район',short:'Гулрыпшский',about:'Гулрыпш, Дранда и горная часть Кодорского ущелья.'},
 {id:'ochamchira',name:'Очамчырский район',short:'Очамчырский',about:'Очамчыра, Моквинский храм и Илор: тихие пляжи юга.'},
 {id:'tkuarchal',name:'Ткуарчалский район',short:'Ткуарчалский',about:'Ткуарчал и Акармара: горный шахтёрский край.'},
 {id:'gal',name:'Галский район',short:'Галский',about:'Гал и долина Ингура на юго-востоке республики.'}
];
const DMAP=Object.fromEntries(DISTRICTS.map(d=>[d.id,d]));
const PIN_NAMES={psou:'Граница Псоу',gagra:'Гагра',pitsunda:'Пицунда',ritsa:'Рица',gudauta:'Гудаута',afon:'Новый Афон',suhum:'Сухум',kamany:'Каманы',gulripsh:'Гулрыпш',dranda:'Дранда',ochamchira:'Очамчыра',tkuarchal:'Ткуарчал',gal:'Гал'};
const PIN_DIST={psou:'gagra',gagra:'gagra',pitsunda:'gagra',ritsa:'gudauta',gudauta:'gudauta',afon:'gudauta',suhum:'suhum',kamany:'suhum',gulripsh:'gulripsh',dranda:'gulripsh',ochamchira:'ochamchira',tkuarchal:'tkuarchal',gal:'gal'};
const PIN_LBL={psou:[14,26,'start'],gagra:[-14,24,'end'],pitsunda:[-14,22,'end'],ritsa:[18,-16,'start'],gudauta:[-10,40,'end'],afon:[0,42,'middle'],suhum:[-10,46,'end'],kamany:[16,-12,'start'],gulripsh:[14,4,'start'],dranda:[12,24,'start'],ochamchira:[-14,24,'end'],tkuarchal:[14,-12,'start'],gal:[14,-10,'start']};

/* ---------- Default content (everything here is editable in the admin panel) ---------- */
const DEFAULT={
 site:{name:'Апсуа Тур',logo:'/assets/brand-logo.png',phone:'[номер менеджера]',messenger:'[контакт]',email:'',vk:'https://vk.ru/otdyh_in_abkhazia',instagram:'https://www.instagram.com/apsua_tur',footAbout:'Экскурсии и трансфер по Абхазии',footPlaces:'Гагра · Пицунда · Новый Афон · Сухум',
  footFacts:['Граница: паспорт РФ подходит для въезда','Валюта: российский рубль'],footnote:'Прототип. Цены, расписание и рейтинги — примеры и требуют подтверждения.',
  guideName:'[Имя гида]',guideText:'Местный гид Апсуа Тур. Добавьте фото, стаж и пару слов о себе.',guidePhoto:''},
 hero:{eyebrow:'Абхазия · экскурсии и трансфер',title:'Абхазия своими глазами',lead:'Маршруты, которые запоминаются, и люди, которые знают здесь каждую тропу.',btn1:'Смотреть экскурсии',btn2:'Заказать трансфер',photo:'',facts:[['{маршруты}','маршрутов'],['7','районов'],['от Псоу','трансфер']]},
 districts:{},
 sec:{
  popular:{eyebrow:'Чаще всего бронируют',title:'Популярные маршруты'},
  catalog:{eyebrow:'Каталог',title:'Найди своё путешествие'},
  map:{eyebrow:'Карта',title:'Куда поехать',sub:'Выберите район или точку на карте, чтобы увидеть маршруты рядом.'},
  reviews:{eyebrow:'Отзывы',title:'Что говорят гости'},
  diary:{eyebrow:'Истории гостей',title:'Дневник путешественников'}
 },
 transfer:{eyebrow:'Трансфер',title:'От границы до отеля без пересадок',text:'Встретим на Псоу или в аэропорту Сочи, поможем с багажом и довезём до двери. Цена фиксируется при заказе.',
  bullets:['Табличка с именем и связь с водителем','Детское кресло по запросу','Ожидание при задержке рейса','Индивидуальный или групповой трансфер'],photo:'',seat:300,formats:{individual:{max:4},group:{max:21}},
  from:[{id:'psou',name:'Граница Псоу',add:0},{id:'adler',name:'Аэропорт Сочи (Адлер)',add:1000}],
  to:[{id:'gagra',name:'Гагра',price:1500},{id:'pitsunda',name:'Пицунда',price:2200},{id:'gudauta',name:'Гудаута',price:2800},{id:'afon',name:'Новый Афон',price:3300},{id:'suhum',name:'Сухум',price:3800},{id:'ochamchira',name:'Очамчыра',price:5200}],
  classes:[{id:'comfort',name:'Комфорт',note:'до 3 пассажиров',k:1,max:3},{id:'van',name:'Минивэн',note:'до 7 пассажиров',k:1.5,max:7},{id:'business',name:'Бизнес',note:'до 3 пассажиров',k:1.9,max:3}]},
 yandex:{url:'',rating:'',count:''},
 reviews:[
  {id:'d1',src:'demo',n:'Ольга',c:'Москва',t:'ritsa',r:5,d:'август',x:'Гид рассказывал всю дорогу и знал, где остановиться, чтобы не было толпы. На Рице дали достаточно времени.'},
  {id:'d2',src:'demo',n:'Артём',c:'Краснодар',t:'auadhara',r:5,d:'сентябрь',x:'Лучший день отпуска. Внедорожник, туман, а потом луга над облаками. Обязательно берите куртку.'},
  {id:'d3',src:'demo',n:'Марина',c:'Санкт-Петербург',t:'afon',r:5,d:'июль',x:'Пещера впечатлила детей больше, чем море. Удобно, что забрали прямо от отеля.'},
  {id:'d4',src:'demo',n:'Сергей',c:'Ростов',t:'gastro',r:5,d:'сентябрь',x:'Хозяйка показала, как делают аджику. Вино домашнее, сыр — лучший, что пробовали.'},
  {id:'d5',src:'demo',n:'Ирина',c:'Казань',t:'pitsunda',r:4,d:'июнь',x:'Очень красивая роща и тихий пляж. Хотелось бы чуть больше времени на купание.'},
  {id:'d6',src:'demo',n:'Денис',c:'Самара',t:'gagra-sea',r:5,d:'август',x:'Закат с катера — то, ради чего стоит ехать. Купались в открытом море.'}
 ],
 stories:[
  {id:'s1',t:'Как мы поднялись на Ауадхару в туман',a:'Ксения, сентябрь',scene:['mountains',1],photo:'',x:'Первая половина дороги — молоко, ничего не видно. А потом машина выехала над облаками.'},
  {id:'s2',t:'Где пить кофе в Сухуме',a:'Павел, июль',scene:['garden',0],photo:'',x:'Три места на набережной, где кофе варят на песке, и одно, где к нему дают чурчхелу.'},
  {id:'s3',t:'Новый Афон с детьми',a:'Анна, август',scene:['cave',1],photo:'',x:'Как спланировать день, чтобы дети не устали: пещера утром, пруды после обеда.'}
 ],
 tours:[{"id":"ritsa","title":"Озеро Рица и Голубое озеро","cat":"mount","hours":9,"dur":"9 часов","price":2500,"kid":1500,"rating":4.9,"reviews":214,"popular":true,"short":"Бзыбское ущелье, Юпшарский каньон, водопады «Мужские и Девичьи слёзы» и горное озеро на высоте 950 м.","scenes":[["lake",0],["canyon",1],["waterfall",2]],"format":"Групповая, автобус","group":"до 18 человек","lang":"Русский","times":["08:00","09:30"],"about":["Главный маршрут Абхазии. Едем вверх по Бзыбскому ущелью, где дорога петляет между отвесными скалами, а река меняет цвет от бирюзового до молочного.","Останавливаемся у Голубого озера, проезжаем «Каменный мешок» Юпшарского каньона и поднимаемся к Рице. На озере будет время на прогулку, обед с видом на воду и фото."],"program":[["08:00","Встреча и выезд","Забираем гостей от отелей Гагры и Пицунды по согласованному маршруту."],["09:30","Бзыбское ущелье и Голубое озеро","Короткая остановка у озера, которое не меняет цвет круглый год."],["10:30","Юпшарский каньон","Проезд через самое узкое место ущелья, стены поднимаются на сотни метров."],["11:00","Водопады «Слёзы»","Остановки у водопадов «Мужские слёзы» и «Девичьи слёзы»."],["12:00","Озеро Рица","Свободное время, прогулка по берегу, по желанию — дача Сталина (отдельный билет)."],["14:30","Обед","Форель, сыр и мамалыга в кафе у озера (оплачивается на месте)."],["17:30","Возвращение","Привозим обратно к отелям."]],"incl":["Транспорт и сопровождение гида","Посещение всех точек маршрута","Питьевая вода в дороге"],"excl":["Экологический сбор Рицинского парка","Обед","Вход на дачу Сталина"],"meet":"Сбор у вашего отеля в Гагре или Пицунде. Точное время подачи менеджер сообщит накануне.","notes":["Возьмите паспорт: на маршруте проверяют документы.","В горах прохладнее, чем на побережье, на 6–8 градусов.","Дорога серпантинная: при укачивании выберите место в начале автобуса."],"district":"gudauta","pin":"ritsa","loc":"Рица","photos":[],"hidden":false},{"id":"afon","title":"Новый Афон: пещера, монастырь и Анакопия","cat":"hist","hours":7,"dur":"7 часов","price":2200,"kid":1300,"rating":4.8,"reviews":176,"popular":true,"short":"Подземный поезд в Новоафонскую пещеру, Симоно-Кананитский храм, лебединые пруды и вид с Иверской горы.","scenes":[["cave",0],["ruins",1],["garden",0]],"format":"Групповая, минивэн","group":"до 12 человек","lang":"Русский","times":["09:00","11:00"],"about":["Один день, три эпохи. Спускаемся в карстовую пещеру с огромными залами, куда возит подземный поезд.","Потом поднимаемся к Новоафонскому монастырю и древней Анакопийской крепости на Иверской горе, откуда видно всё побережье."],"program":[["09:00","Выезд","Забираем из отелей Гагры, Пицунды или Гудауты."],["10:30","Новоафонская пещера","Экскурсия по залам с подсветкой, около полутора часов."],["12:30","Лебединые пруды и водопад","Прогулка по парку у Симоно-Кананитского храма."],["13:30","Новоафонский монастырь","Осмотр монастыря и смотровой площадки."],["14:30","Анакопийская крепость","Подъём на Иверскую гору, на вершине — руины крепости."],["16:00","Возвращение","Привозим к отелям."]],"incl":["Транспорт и гид","Сопровождение по всем точкам"],"excl":["Билет в пещеру","Подъём к крепости","Обед"],"meet":"Сбор у вашего отеля. Для гостей Нового Афона — у входа в парк.","notes":["В пещере около +12 °C, возьмите кофту.","Для посещения монастыря нужна закрытая одежда."],"district":"gudauta","pin":"afon","loc":"Новый Афон","photos":[],"hidden":false},{"id":"suhum","title":"Сухум: набережная, ботанический сад, Беслетский мост","cat":"hist","hours":6,"dur":"6 часов","price":1900,"kid":1100,"rating":4.7,"reviews":98,"popular":false,"short":"Столица у моря: набережная Махаджиров, кофе на песке, ботанический сад и средневековый мост через Беслетку.","scenes":[["garden",1],["sea",1],["ruins",2]],"format":"Групповая, минивэн","group":"до 12 человек","lang":"Русский","times":["10:00"],"about":["Сухум лучше понимать пешком. Гуляем по набережной, пьём кофе, сваренный на песке, и заходим в Сухумский ботанический сад.","Затем едем к Беслетскому мосту XII века и смотрим город с высоты."],"program":[["10:00","Выезд","Сбор у отелей побережья."],["11:30","Набережная Махаджиров","Прогулка, кофейня у моря."],["12:30","Ботанический сад","Одна из старейших коллекций субтропических растений."],["14:00","Беслетский мост","Средневековый мост в зелёном ущелье."],["16:00","Возвращение","Привозим к отелям."]],"incl":["Транспорт и гид"],"excl":["Билет в ботанический сад","Обед и кофе"],"meet":"Сбор у вашего отеля. Для гостей Сухума — на набережной.","notes":["Удобная обувь: много ходим пешком."],"district":"suhum","pin":"suhum","loc":"Сухум","photos":[],"hidden":false},{"id":"pitsunda","title":"Пицундская роща и Мюссерский заповедник","cat":"sea","hours":5,"dur":"5 часов","price":1700,"kid":1000,"rating":4.8,"reviews":121,"popular":true,"short":"Реликтовые сосны у самого моря, Пицундский храм с органом и дикий пляж Мюссеры.","scenes":[["forest",1],["sea",0],["ruins",0]],"format":"Групповая, минивэн","group":"до 12 человек","lang":"Русский","times":["10:00","14:00"],"about":["Пицунда — это сосны, растущие прямо на пляже. Гуляем по реликтовой роще и заходим в древний храм, где сейчас проходят органные концерты.","После едем в Мюссерский заповедник: тихие бухты и дачный парк у моря."],"program":[["10:00","Выезд","Сбор у отелей Гагры и Пицунды."],["10:30","Реликтовая роща","Прогулка среди пицундских сосен."],["11:30","Пицундский храм","Осмотр, по расписанию — органный концерт."],["12:30","Мюссерский заповедник","Бухта, купание, пикник."],["15:00","Возвращение","Привозим к отелям."]],"incl":["Транспорт и гид","Вход в заповедник"],"excl":["Органный концерт","Обед"],"meet":"Сбор у вашего отеля.","notes":["Возьмите купальник: будет время искупаться."],"district":"gagra","pin":"pitsunda","loc":"Пицунда","photos":[],"hidden":false},{"id":"auadhara","title":"Джип-тур на альпийские луга Ауадхары","cat":"mount","hours":10,"dur":"10 часов","price":4500,"kid":3000,"rating":5,"reviews":63,"popular":true,"short":"На внедорожниках выше Рицы: альпийские луга, минеральные источники и облака под ногами.","scenes":[["mountains",0],["waterfall",1],["lake",2]],"format":"Мини-группа, внедорожник","group":"до 6 человек","lang":"Русский","times":["07:30"],"about":["Маршрут для тех, кто видел Рицу и хочет выше. Внедорожник поднимается по грунтовке на луга Ауадхары, около 1 600 метров над морем.","По пути — водопады, минеральные источники и горные сыроварни."],"program":[["07:30","Выезд на внедорожниках","Сбор у отелей."],["10:00","Озеро Рица","Короткая остановка."],["11:30","Грунтовая дорога","Подъём через лес и перевал."],["13:00","Луга Ауадхары","Минеральные источники, прогулка, пикник."],["17:30","Возвращение","Привозим к отелям."]],"incl":["Внедорожник с водителем-гидом","Пикник"],"excl":["Экологические сборы"],"meet":"Сбор у вашего отеля.","notes":["Наверху холодно даже летом: возьмите куртку.","Не подходит при проблемах со спиной: дорога тряская."],"district":"gudauta","pin":"ritsa","loc":"Ауадхара","photos":[],"hidden":false},{"id":"gastro","title":"Абхазский стол: вино, сыр и аджика в Лыхны","cat":"food","hours":5,"dur":"5 часов","price":3200,"kid":1600,"rating":4.9,"reviews":87,"popular":false,"short":"Гостевой дом в селе Лыхны: дегустация домашнего вина, сыр ашвлапа, мамалыга и аджика из ступки.","scenes":[["vineyard",0],["vineyard",2],["mountains",1]],"format":"Мини-группа","group":"до 10 человек","lang":"Русский","times":["13:00"],"about":["Едем в древнюю столицу абхазских князей, село Лыхны. Смотрим Лыхненскую церковь и поляну народных сходов.","Потом — застолье в семейном доме: хозяева показывают, как готовят мамалыгу и растирают аджику."],"program":[["13:00","Выезд","Сбор у отелей."],["14:00","Лыхны","Церковь и поляна."],["15:00","Абхазский стол","Дегустация вина и сыра, мастер-класс по аджике."],["18:00","Возвращение","Привозим к отелям."]],"incl":["Транспорт","Дегустация и ужин"],"excl":["Покупка вина с собой"],"meet":"Сбор у вашего отеля.","notes":["Алкоголь — только для гостей старше 18 лет."],"district":"gudauta","pin":"gudauta","loc":"Лыхны","photos":[],"hidden":false},{"id":"kamany","title":"Каманы и Шакуранский водопад","cat":"hist","hours":6,"dur":"6 часов","price":2400,"kid":1400,"rating":4.7,"reviews":52,"popular":false,"short":"Святыня Иоанна Златоуста в Каманах, каскад Шакурана и источник в горах над Сухумом.","scenes":[["waterfall",0],["ruins",1],["forest",2]],"format":"Групповая, минивэн","group":"до 12 человек","lang":"Русский","times":["09:30"],"about":["Каманы — место паломничества: здесь, по преданию, похоронен Иоанн Златоуст. Небольшой храм стоит в лесу у источника.","После — Шакуранский водопад, к которому ведёт короткая тропа."],"program":[["09:30","Выезд","Сбор у отелей."],["11:30","Каманы","Храм и источник."],["13:00","Шакуранский водопад","Прогулка по тропе, купание."],["15:30","Возвращение","Привозим к отелям."]],"incl":["Транспорт и гид"],"excl":["Обед"],"meet":"Сбор у вашего отеля.","notes":["Для храма нужна закрытая одежда."],"district":"suhum","pin":"kamany","loc":"Каманы","photos":[],"hidden":false},{"id":"gagra-sea","title":"Морская прогулка вдоль Гагры","cat":"sea","hours":2,"dur":"2 часа","price":1500,"kid":800,"rating":4.6,"reviews":140,"popular":false,"short":"Колоннада, парк Принца Ольденбургского и крепость Абаата с воды, на закате.","scenes":[["sea",2],["sea",0],["garden",2]],"format":"Групповая, катер","group":"до 20 человек","lang":"Русский","times":["17:00","19:00"],"about":["Гагра с моря выглядит иначе: видно, как горы почти обрываются в воду.","Проходим вдоль колоннады и старой Гагры, останавливаемся для купания в открытом море."],"program":[["17:00","Посадка","Причал у Гагрской колоннады."],["17:20","Вдоль Старой Гагры","Парк, колоннада, крепость Абаата."],["18:00","Стоянка","Купание в открытом море."],["19:00","Возвращение","Высадка у причала."]],"incl":["Прогулка на катере","Спасательные жилеты"],"excl":["Напитки"],"meet":"Причал у Гагрской колоннады.","notes":["При шторме прогулку переносим."],"district":"gagra","pin":"gagra","loc":"Гагра","photos":[],"hidden":false}]
};
const clone=o=>JSON.parse(JSON.stringify(o));
function mergeDefaults(c,d){if(Array.isArray(d))return Array.isArray(c)?c:clone(d);if(d&&typeof d==='object'){const o=c&&typeof c==='object'&&!Array.isArray(c)?c:{};const migrateFont=Object.hasOwn(d,'typography')&&o.typography?.fontVersion!==130;for(const k in d)o[k]=mergeDefaults(o[k],d[k]);if(migrateFont)o.typography={...o.typography,bodyFont:'Manrope',headingFont:'Manrope',fontVersion:130};return o}return c===undefined?d:c}

const MIGRATION_SEED={"tours":[{"id":"ritsa","title":"Озеро Рица","cat":"mount","hours":10.5,"dur":"10,5 часов","price":2600,"kid":2100,"rating":0,"reviews":0,"popular":true,"short":"Горное озеро, каньоны и природные достопримечательности по дороге. Два времени выезда на выбор.","scenes":[],"format":"Групповая · Микроавтобус","group":"Уточняется организатором","lang":"Уточняется организатором","times":["09:00","13:00"],"about":["Горное озеро, каньоны и природные достопримечательности по дороге. Два времени выезда на выбор."],"program":[["","Ваш маршрут","Горное озеро, каньоны и природные достопримечательности по дороге. Два времени выезда на выбор."],["","Детали поездки","Порядок остановок и подробную программу подтвердит организатор."]],"incl":["Состав услуг уточняется до подтверждения заявки."],"excl":["Билеты, питание и другие расходы уточните у организатора."],"meet":"Укажите город выезда и адрес проживания. Точное место посадки подтвердит диспетчер.","notes":["Одежду и обувь подберите по погоде и особенностям маршрута.","Наличие мест, оплату и условия отмены подтвердит диспетчер."],"district":"gudauta","pin":"ritsa","loc":"Гудаутский район","photos":["assets/lake2.jpg"],"hidden":false,"cities":{"Сухум":{"adult":2600,"child":2100},"Новый Афон":{"adult":2600,"child":2100}},"summer":true,"winter":true,"summerTimes":"09:00,13:00","winterTimes":"09:00"},{"id":"premium","title":"Рица. Путешествие с комфортом","cat":"mount","hours":10,"dur":"10 часов","price":4500,"kid":3900,"rating":0,"reviews":0,"popular":true,"short":"Больше времени на озере, комфортабельный транспорт и посещение дачи Сталина.","scenes":[],"format":"Групповая · Микроавтобус","group":"Уточняется организатором","lang":"Уточняется организатором","times":["09:00"],"about":["Больше времени на озере, комфортабельный транспорт и посещение дачи Сталина."],"program":[["","Ваш маршрут","Больше времени на озере, комфортабельный транспорт и посещение дачи Сталина."],["","Детали поездки","Порядок остановок и подробную программу подтвердит организатор."]],"incl":["Состав услуг уточняется до подтверждения заявки."],"excl":["Билеты, питание и другие расходы уточните у организатора."],"meet":"Укажите город выезда и адрес проживания. Точное место посадки подтвердит диспетчер.","notes":["Одежду и обувь подберите по погоде и особенностям маршрута.","Наличие мест, оплату и условия отмены подтвердит диспетчер."],"district":"gudauta","pin":"ritsa","loc":"Гудаутский район","photos":["assets/lake.jpg"],"hidden":false,"cities":{"Сухум":{"adult":4500,"child":3900},"Новый Афон":{"adult":4500,"child":3900}},"summer":true,"winter":true,"summerTimes":"09:00","winterTimes":"09:00"},{"id":"ring","title":"Золотое кольцо Абхазии","cat":"hist","hours":12,"dur":"12 часов","price":3300,"kid":2600,"rating":0,"reviews":0,"popular":true,"short":"Главные достопримечательности за один день: древние храмы и высокогорное озеро Рица.","scenes":[],"format":"Групповая · Микроавтобус","group":"Уточняется организатором","lang":"Уточняется организатором","times":["09:00"],"about":["Главные достопримечательности за один день: древние храмы и высокогорное озеро Рица."],"program":[["","Ваш маршрут","Главные достопримечательности за один день: древние храмы и высокогорное озеро Рица."],["","Детали поездки","Порядок остановок и подробную программу подтвердит организатор."]],"incl":["Состав услуг уточняется до подтверждения заявки."],"excl":["Билеты, питание и другие расходы уточните у организатора."],"meet":"Укажите город выезда и адрес проживания. Точное место посадки подтвердит диспетчер.","notes":["Одежду и обувь подберите по погоде и особенностям маршрута.","Наличие мест, оплату и условия отмены подтвердит диспетчер."],"district":"gudauta","pin":"afon","loc":"Гудаутский район","photos":["assets/athos.jpg"],"hidden":false,"cities":{"Сухум":{"adult":3300,"child":2600},"Новый Афон":{"adult":3300,"child":2600}},"summer":true,"winter":true,"summerTimes":"09:00","winterTimes":"09:00"},{"id":"labra","title":"Лабра и термальный SPA","cat":"hist","hours":7,"dur":"7 часов","price":3200,"kid":2800,"rating":0,"reviews":0,"popular":false,"short":"Виноградники Восточной Абхазии, местные традиции и спокойный отдых у термальных источников.","scenes":[],"format":"Групповая · Микроавтобус","group":"Уточняется организатором","lang":"Уточняется организатором","times":["12:00"],"about":["Виноградники Восточной Абхазии, местные традиции и спокойный отдых у термальных источников."],"program":[["","Ваш маршрут","Виноградники Восточной Абхазии, местные традиции и спокойный отдых у термальных источников."],["","Детали поездки","Порядок остановок и подробную программу подтвердит организатор."]],"incl":["Состав услуг уточняется до подтверждения заявки."],"excl":["Билеты, питание и другие расходы уточните у организатора."],"meet":"Укажите город выезда и адрес проживания. Точное место посадки подтвердит диспетчер.","notes":["Одежду и обувь подберите по погоде и особенностям маршрута.","Наличие мест, оплату и условия отмены подтвердит диспетчер."],"district":"ochamchira","pin":"","loc":"Очамчырский район","photos":["assets/labra.jpg"],"hidden":false,"cities":{"Сухум":{"adult":3200,"child":2800},"Новый Афон":{"adult":3200,"child":2800}},"summer":true,"winter":true,"summerTimes":"12:00","winterTimes":"12:00"},{"id":"waterfall","title":"Путь к Илору и Акармаре","cat":"mount","hours":9,"dur":"9 часов","price":2850,"kid":2800,"rating":0,"reviews":0,"popular":false,"short":"Древние святыни, горные дороги и живописные водопады Восточной Абхазии.","scenes":[],"format":"Групповая · Микроавтобус","group":"Уточняется организатором","lang":"Уточняется организатором","times":["10:00"],"about":["Древние святыни, горные дороги и живописные водопады Восточной Абхазии."],"program":[["","Ваш маршрут","Древние святыни, горные дороги и живописные водопады Восточной Абхазии."],["","Детали поездки","Порядок остановок и подробную программу подтвердит организатор."]],"incl":["Состав услуг уточняется до подтверждения заявки."],"excl":["Билеты, питание и другие расходы уточните у организатора."],"meet":"Укажите город выезда и адрес проживания. Точное место посадки подтвердит диспетчер.","notes":["Одежду и обувь подберите по погоде и особенностям маршрута.","Наличие мест, оплату и условия отмены подтвердит диспетчер."],"district":"tkuarchal","pin":"akarmara","loc":"Ткуарчальский район","photos":["assets/waterfall-new.jpg"],"hidden":false,"cities":{"Сухум":{"adult":2850,"child":2800},"Новый Афон":{"adult":2850,"child":2800}},"summer":true,"winter":true,"summerTimes":"10:00","winterTimes":"10:00"},{"id":"canyon","title":"Черниговка и Ассир","cat":"nature","hours":4,"dur":"4 часа","price":1500,"kid":1200,"rating":0,"reviews":0,"popular":false,"short":"Прогулка по карстовому ущелью, горная река и водопады недалеко от Сухума.","scenes":[],"format":"Групповая · Микроавтобус","group":"Уточняется организатором","lang":"Уточняется организатором","times":["15:00"],"about":["Прогулка по карстовому ущелью, горная река и водопады недалеко от Сухума."],"program":[["","Ваш маршрут","Прогулка по карстовому ущелью, горная река и водопады недалеко от Сухума."],["","Детали поездки","Порядок остановок и подробную программу подтвердит организатор."]],"incl":["Состав услуг уточняется до подтверждения заявки."],"excl":["Билеты, питание и другие расходы уточните у организатора."],"meet":"Укажите город выезда и адрес проживания. Точное место посадки подтвердит диспетчер.","notes":["Одежду и обувь подберите по погоде и особенностям маршрута.","Наличие мест, оплату и условия отмены подтвердит диспетчер."],"district":"gulripsh","pin":"chernigovka","loc":"Гулрыпшский район","photos":["assets/canyon-new.jpg"],"hidden":false,"cities":{"Сухум":{"adult":1500,"child":1200},"Новый Афон":{"adult":1850,"child":1400}},"summer":true,"winter":true,"summerTimes":"15:00","winterTimes":"15:00"},{"id":"spa","title":"Природный SPA. Кындыг","cat":"nature","hours":5,"dur":"5 часов","price":1200,"kid":900,"rating":0,"reviews":0,"popular":false,"short":"Термальные источники, отдых в тёплой воде и знакомство с местной гастрономией.","scenes":[],"format":"Групповая · Микроавтобус","group":"Уточняется организатором","lang":"Уточняется организатором","times":["10:00","16:00"],"about":["Термальные источники, отдых в тёплой воде и знакомство с местной гастрономией."],"program":[["","Ваш маршрут","Термальные источники, отдых в тёплой воде и знакомство с местной гастрономией."],["","Детали поездки","Порядок остановок и подробную программу подтвердит организатор."]],"incl":["Состав услуг уточняется до подтверждения заявки."],"excl":["Билеты, питание и другие расходы уточните у организатора."],"meet":"Укажите город выезда и адрес проживания. Точное место посадки подтвердит диспетчер.","notes":["Одежду и обувь подберите по погоде и особенностям маршрута.","Наличие мест, оплату и условия отмены подтвердит диспетчер."],"district":"ochamchira","pin":"kındıg","loc":"Очамчырский район","photos":["assets/spa.jpg"],"hidden":false,"cities":{"Сухум":{"adult":1200,"child":900},"Новый Афон":{"adult":1500,"child":1150}},"summer":true,"winter":true,"summerTimes":"10:00,16:00","winterTimes":"10:00"}],"site":{"logo":"assets/brand-logo.png","phone":"+7 (940) 995-15-16","messenger":"Уточните удобный способ связи по телефону","email":"apsuatur@mail.ru","guideName":"Команда «Апсуа Тур»","guideText":"Уточните маршрут, место встречи и условия участия до поездки.","guidePhoto":"assets/brand-logo.png","footFacts":[],"footnote":"Тестовая версия · цены и расписание подтвердит организатор."},"hero":{"photo":"assets/lake2.jpg","eyebrow":"Море, горы и настоящее гостеприимство","title":"Абхазия. Своими глазами.","btn1":"Выбрать путешествие","btn2":"Заказать трансфер"},"transfer":{"photo":"assets/transfer-panorama.webp","title":"Трансфер к вашему месту отдыха","text":"Выберите аэропорт или вокзал и населённый пункт в Абхазии. Условия встречи и стоимость подтвердит диспетчер.","bullets":["Встреча и обратный трансфер","Укажите рейс и адрес проживания","Детское кресло по запросу"],"seat":0,"from":[{"id":"sochi","name":"Аэропорт Сочи","add":0},{"id":"adler","name":"Ж/д вокзал Адлер","add":0},{"id":"sukhum","name":"Аэропорт Сухум","add":0}],"to":[{"id":"suhum","name":"Сухум","price":0},{"id":"afon","name":"Новый Афон","price":0},{"id":"gagra","name":"Гагра","price":0},{"id":"pitsunda","name":"Пицунда","price":0},{"id":"gudauta","name":"Гудаута","price":0}],"classes":[{"id":"standard","name":"Трансфер","note":"Транспорт подтвердит диспетчер","k":1,"max":30}]},"yandex":{"url":"https://yandex.ru/maps/org/apsua_tur/132935970380/reviews","rating":"","count":""},"reviews":[],"stories":[]};for(const [k,v]of Object.entries(MIGRATION_SEED)){if(k==='site'||k==='hero'||k==='transfer')Object.assign(DEFAULT[k],v);else DEFAULT[k]=v}DEFAULT.typography={bodyFont:'Manrope',headingFont:'Manrope',fontVersion:130,bodySize:15.5,h1:64,h2:36,h3:20,lineHeight:1.65,wrap:1200,hero:1320};DEFAULT.popularLimit=5;
let C=mergeDefaults(store.get('content',null),clone(DEFAULT));
const saveContent=()=>store.set('content',C);
const TOURS=()=>C.tours;
const tourById=id=>C.tours.find(t=>t.id===id);
const tourPics=(t,w=1400,h=900)=>{const ph=(t.photos||[]).filter(Boolean).map(p=>src(p,null)).filter(Boolean);return ph.length?ph:(t.scenes||[['sea',0]]).map(s=>paint(s[0],s[1],w,h))};
const tourCover=(t,w,h)=>tourPics(t,w,h)[0];

/* ---------- Helpers ---------- */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rub=n=>Math.round(Number(n)||0).toLocaleString('ru-RU')+' ₽';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
// build 166: public lists carry an opaque public author ID; the signed-in user's own ID and public ID both count as theirs.
const isMine=(uid,u)=>!!u&&!!uid&&(uid===u.id||(!!u.publicId&&uid===u.publicId));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICON={
 heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.3 4.3 0 0112 7.4a4.3 4.3 0 017.5 2.7c0 5.8-7.5 10.4-7.5 10.4z"/></svg>',
 yes:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 no:'<svg viewBox="0 0 24 24" fill="none"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 left:'<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 right:'<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 shield:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
 pin:'<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9.5" r="2.5" stroke="currentColor" stroke-width="2"/></svg>',
 cal:'<svg class="icon" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 users:'<svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="2"/><path d="M2.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18 14.8c1.9.6 3 2.4 3.5 5.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 search:'<svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2.2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
 chev:'<svg class="icon chev" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 up:'<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 down:'<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 trash:'<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
 copy:'<svg class="icon" viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="12" height="12" rx="2.5" stroke="currentColor" stroke-width="2"/><path d="M16 8V5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8" stroke="currentColor" stroke-width="2"/></svg>',
 edit:'<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L19 9l-4-4L4 16z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
 plus:'<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
 img:'<svg class="icon" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="15" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="2" stroke="currentColor" stroke-width="2"/><path d="M4 18l5-4.5 3.5 3 3-2.5L21 18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
 ext:'<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
let favs=new Set(store.get('favs',[]));
const plural=(n,a,b,c)=>{const m10=n%10,m100=n%100;return m10===1&&m100!==11?a:(m10>=2&&m10<=4&&(m100<10||m100>=20)?b:c)};
function hash(s){let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))|0;return Math.abs(h)}
const WD=['вс','пн','вт','ср','чт','пт','сб'],MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],MONN=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const today0=()=>{const t=new Date();t.setHours(0,0,0,0);return t};
function days(n){const out=[],t=today0();for(let i=1;i<=n;i++){const d=new Date(t);d.setDate(t.getDate()+i);out.push(d)}return out}
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const fromIso=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const human=d=>d.getDate()+' '+MON[d.getMonth()]+', '+WD[d.getDay()];
const shortDate=s=>{const d=fromIso(s);return d.getDate()+' '+MON[d.getMonth()].slice(0,3)+', '+WD[d.getDay()]};
function seats(t,dIso,time){const offer=tourOffer(t,dIso,t._departureCity||departureCity,t._bookingKind);return offer.times.includes(time)?offer.maxPeople:0}
const fmtRating=r=>String(r).replace('.',',');
const lines=v=>Array.isArray(v)?v:String(v||'').split('\n').map(s=>s.trim()).filter(Boolean);
function phoneOk(v){return String(v).replace(/\D/g,'').length>=10}
function code(prefix){return prefix+'-'+crypto.randomUUID().slice(0,18)}
const monthNow=()=>new Date().toLocaleDateString('ru-RU',{month:'long',year:'numeric'}).replace(' г.','');
function toast(msg){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=msg;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),2600)}
function readPhoto(file,max,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const g=c.getContext('2d');const png=/png|webp|svg/.test(file.type)&&max<=800;if(!png){g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height)}g.drawImage(im,0,0,c.width,c.height);cb(png?c.toDataURL('image/png'):c.toDataURL('image/jpeg',.82))};im.onerror=()=>cb('');im.src=r.result};r.onerror=()=>cb('');r.readAsDataURL(file)}

/* ---------- State ---------- */
const ui={cat:'all',sort:'pop',onlyFav:false,mapDist:'gudauta',mapPin:'',q:{district:'',city:'',format:'',date:'',people:1}};
const app=$('#app');

/* ---------- Chrome: logo, footer, labels ---------- */
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function logoHTML(){return C.site.logo&&src(C.site.logo)?`<img class="logo-img" src="${src(C.site.logo)}" alt="${esc(C.site.name)}">`:`<span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M2 18l6.5-9 4 5.5L15 11l7 7" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M2 21c3-1.6 5-1.6 8 0s5 1.6 8 0 3-1.4 4-1" stroke="#f39a3e" stroke-width="2" stroke-linecap="round"/></svg></span><b>${esc(C.site.name)}</b>`}
function renderChrome(){
 $$('.logo').forEach(a=>{a.innerHTML=logoHTML();a.setAttribute('aria-label',C.site.name+' — на главную')});
 const s=C.site;
 $('#contacts').innerHTML=`<div class="wrap footer-compact"><div class="footer-main"><div class="footer-brand"><b>${esc(s.name)}</b><p>Экскурсии и трансфер по Абхазии</p></div><div class="footer-contact">${s.phone?`<a class="footer-phone" href="tel:${esc(s.phone.replace(/[^+0-9]/g,''))}">${esc(s.phone)}</a>`:''}${s.messenger&&s.messenger!==s.phone?`<span>${esc(s.messenger)}</span>`:''}${s.email?`<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>`:''}</div><nav class="footer-links" aria-label="Полезные ссылки"><a href="#/reviews">Отзывы</a><a href="#/diary">Истории</a><a href="#/faq">Вопросы</a><a href="#/useful">Полезное</a></nav></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(s.name)}</span><div></div></div></div>`;
 const it=$('#installTab');if(it)it.hidden=true;
 document.title=C.site.name;
 syncAcc();syncFav();
}
function syncAcc(){const u=store.get('user',null),button=$('#accBtn'),avatar=u?.avatar?src(u.avatar):'';$$('[data-acc-label]').forEach(x=>{x.textContent=u?u.name.split(' ')[0]:'Войти';if(u){x.dataset.userProfile=u.id;x.setAttribute('aria-haspopup','dialog')}else{x.removeAttribute('data-user-profile');x.removeAttribute('aria-haspopup')}});if(!button)return;button.querySelector('.header-account-avatar')?.remove();button.classList.toggle('has-avatar',!!avatar);button.setAttribute('aria-label',u?`Профиль: ${u.name||'Telegram'}`:'Войти в профиль');if(avatar){const image=document.createElement('img');image.className='header-account-avatar';image.src=avatar;image.alt='';image.decoding='async';image.referrerPolicy='no-referrer';image.addEventListener('error',()=>{image.remove();button.classList.remove('has-avatar')},{once:true});button.prepend(image)}}
function syncFav(){store.set('favs',[...favs]);$$('[data-fav-count]').forEach(e=>{e.textContent=favs.size;e.hidden=!favs.size})}
function pageHead(crumb,eyebrow,title,sub,extra=''){return `<header class="page-head"><div><h1>${esc(title)}</h1>${sub?`<p class="sub">${esc(sub)}</p>`:''}</div>${extra}</header>`}

/* ---------- Search bar: districts, glass calendar, people stepper ---------- */
function searchHTML(id){const q=ui.q;
 return `<form class="search search-departures" id="${id}" aria-label="Подбор экскурсии">
  <div class="field departure-filter"><span>Откуда · город выезда</span><button type="button" class="input sbtn" data-pop-open="departure" aria-haspopup="listbox" aria-expanded="false" aria-label="Город выезда">${ICON.pin}<b>${esc(q.city||'Все города')}</b>${ICON.chev}</button></div>
  <div class="field"><span>Куда хочется</span><button type="button" class="input sbtn" data-pop-open="district" aria-haspopup="listbox" aria-expanded="false">${ICON.pin}<b>${q.district?esc(DMAP[q.district].name):'Вся Абхазия'}</b>${ICON.chev}</button></div>
  <div class="field"><span>Когда</span><button type="button" class="input sbtn" data-pop-open="date" aria-haspopup="dialog" aria-expanded="false">${ICON.cal}<b>${q.date?shortDate(q.date):'Любая дата'}</b>${ICON.chev}</button></div>
  <div class="field"><span>Сколько вас</span><button type="button" class="input sbtn people-open" data-pop-open="people" aria-haspopup="dialog" aria-expanded="false" aria-label="Количество гостей: ${q.people}">${ICON.users}<b>${q.people}</b></button></div>
  <button class="btn btn-accent" type="submit" aria-label="Найти экскурсии">${ICON.search}<span>Найти</span></button></form>`}
function refreshSearch(){$$('form.search').forEach(f=>{f.outerHTML=searchHTML(f.id)})}
const qString=()=>{const p=new URLSearchParams();if(ui.q.district)p.set('district',ui.q.district);if(ui.q.city)p.set('city',ui.q.city);if(ui.q.format)p.set('format',ui.q.format);if(ui.q.date)p.set('date',ui.q.date);if(ui.q.people!==1)p.set('people',ui.q.people);if(ui.cat!=='all')p.set('cat',ui.cat);if(ui.priceMin!=null)p.set('min',ui.priceMin);if(ui.priceMax!=null)p.set('max',ui.priceMax);const s=p.toString();return s?'?'+s:''};
function syncCatalogHash(){if(current==='catalog'){history.replaceState(history.state,'','/excursions'+qString());routePreviousURL=location.href}}

let popEl=null,cal={y:0,m:0,target:'q'};
function closePop(){if(!popEl)return;if(popEl._bd)popEl._bd.remove();const b=popEl._btn;popEl.remove();popEl=null;if(b){b.setAttribute('aria-expanded','false')}}
function openPop(btn,kind){
 closePop();const el=document.createElement('div');el.className='popover';el.dataset.kind=kind;el.setAttribute('role','dialog');
 const mobile=matchMedia('(max-width:640px)').matches;
 if(mobile){el.classList.add('sheet');const bd=document.createElement('div');bd.className='sheet-bd';bd.addEventListener('click',closePop);document.body.appendChild(bd);el._bd=bd}
 document.body.appendChild(el);popEl=el;el._btn=btn;btn.setAttribute('aria-expanded','true');
 if(['date','trdate','reviewdate'].includes(kind)){const cur=kind==='reviewdate'?$('#rv-date')?.value:kind==='date'?ui.q.date:tr.date;const d=cur?fromIso(cur):today0();cal={y:d.getFullYear(),m:d.getMonth(),target:kind}}
 drawPop();
 if(!mobile){const r=btn.getBoundingClientRect();const w=['district','departure'].includes(kind)?300:348;let left=r.left+scrollX;left=Math.min(left,scrollX+document.documentElement.clientWidth-w-12);el.style.top=(r.bottom+scrollY+8)+'px';el.style.left=Math.max(12,left)+'px';el.style.width=w+'px'}
 let x0=null;el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
 el.addEventListener('touchend',e=>{if(x0===null||!el.querySelector('.cal-grid'))return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)calShift(dx<0?1:-1);x0=null});
 setTimeout(()=>{const f=el.querySelector('[aria-selected="true"],[aria-pressed="true"],button');if(f)f.focus({preventScroll:true})},30);
}
function calShift(n){const t=today0();let m=cal.m+n,y=cal.y;if(m<0){m=11;y--}if(m>11){m=0;y++}if(cal.target==='reviewdate'){if(y<1970||y>t.getFullYear()||y===t.getFullYear()&&m>t.getMonth())return}else if(y<t.getFullYear()||(y===t.getFullYear()&&m<t.getMonth()))return;cal.m=m;cal.y=y;drawPop()}
function drawPop(){
 const el=popEl;if(!el)return;const k=el.dataset.kind;const grab=el.classList.contains('sheet')?'<span class="grab" aria-hidden="true"></span>':'';
 if(k==='people'){el.innerHTML=`${grab}<p class="pop-title">Сколько вас</p><div class="input sstep">${ICON.users}<span class="sstep-n">${ui.q.people} ${plural(ui.q.people,'человек','человека','человек')}</span><button type="button" data-q-people="-1" aria-label="Меньше" ${ui.q.people<=1?'disabled':''}>−</button><button type="button" data-q-people="1" aria-label="Больше" ${ui.q.people>=20?'disabled':''}>+</button></div>`;return}
 if(k==='departure'){el.innerHTML=`${grab}<p class="pop-title">Город выезда</p><div class="plist" role="listbox" aria-label="Город выезда">${['',...allDepartureCities()].map(city=>{const n=C.tours.filter(t=>tourPublic(t,ui.q.date,city)).length;return `<button type="button" role="option" data-pick-departure="${esc(city)}" aria-selected="${ui.q.city===city}"><span><b>${esc(city||'Все города')}</b><small>${n?n+' '+plural(n,'маршрут','маршрута','маршрутов'):'скоро'}</small></span>${ui.q.city===city?ICON.yes:''}</button>`}).join('')}</div>`;return}
 if(k==='district'){el.innerHTML=`${grab}<p class="pop-title">Куда хочется</p><div class="plist" role="listbox" aria-label="Район">${[{id:'',name:'Вся Абхазия',about:'Все маршруты'}].concat(DISTRICTS).map(d=>{const n=C.tours.filter(t=>tourPublic(t)&&(!d.id||tourInDistrict(t,d.id))).length;return `<button type="button" role="option" data-pick-district="${d.id}" aria-selected="${ui.q.district===d.id}"><span><b>${esc(d.name)}</b><small>${n?n+' '+plural(n,'маршрут','маршрута','маршрутов'):'скоро'}</small></span>${ui.q.district===d.id?ICON.yes:''}</button>`}).join('')}</div>`;return}
 const t=today0(),review=cal.target==='reviewdate',sel=review?$('#rv-date')?.value:cal.target==='date'?ui.q.date:tr.date;const first=new Date(cal.y,cal.m,1),start=(first.getDay()+6)%7,dim=new Date(cal.y,cal.m+1,0).getDate();
 const currentMonth=cal.y===t.getFullYear()&&cal.m===t.getMonth(),atMin=review?cal.y===1970&&cal.m===0:currentMonth;let cells='';for(let i=0;i<start;i++)cells+='<span></span>';
 for(let d=1;d<=dim;d++){const dt=new Date(cal.y,cal.m,d),di=iso(dt),past=dt<t,wk=dt.getDay()===0||dt.getDay()===6;cells+=`<button type="button" data-pick-date="${di}" ${(review?dt>t:past)?'disabled':''} aria-pressed="${sel===di}" class="${+dt===+t?'today ':''}${wk?'wk':''}" aria-label="${human(dt)}">${d}</button>`}
 const yesterday=new Date(t);yesterday.setDate(t.getDate()-1);const tm=new Date(t);tm.setDate(t.getDate()+1);const afterTomorrow=new Date(t);afterTomorrow.setDate(t.getDate()+2);
 el.innerHTML=`${grab}<div class="cal-head"><b>${MONN[cal.m]} <span>${cal.y}</span></b><div><button type="button" class="cal-nav" data-cal="-1" aria-label="Предыдущий месяц" ${atMin?'disabled':''}>${ICON.left}</button><button type="button" class="cal-nav" data-cal="1" aria-label="Следующий месяц" ${review&&currentMonth?'disabled':''}>${ICON.right}</button></div></div>
  <div class="cal-wd">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(w=>`<span>${w}</span>`).join('')}</div><div class="cal-grid">${cells}</div>
  <div class="cal-foot">${review?`<button type="button" data-pick-date="${iso(t)}">Сегодня</button><button type="button" data-pick-date="${iso(yesterday)}">Вчера</button>`:`${cal.target==='date'?'<button type="button" data-pick-date="">Любая дата</button>':''}<button type="button" data-pick-date="${iso(tm)}">Завтра</button><button type="button" data-pick-date="${iso(afterTomorrow)}">Послезавтра</button>`}</div>`;
}
function pickDate(v){if(cal.target==='reviewdate'){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||fromIso(v)>today0())return;const input=$('#rv-date'),button=$('#rv-date-btn');if(input)input.value=v;if(button){$('b',button).textContent=shortDate(v);button.classList.remove('invalid')}closePop();button?.focus();return}if(cal.target==='date'){ui.q.date=v;closePop();refreshSearch();if(current==='catalog'){renderCards();syncCatalogHash()}}else{tr.date=v||tr.date;closePop();keepTr(renderTransfer)}}

function tourRating(t){const ratings=allReviews().filter(r=>r.t===t.id&&r.src!=='demo').map(r=>Number(r.r)).filter(r=>r>=1&&r<=5);return {count:ratings.length,average:ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:0}}
function tourRatingHTML(t){const r=tourRating(t);return `<span class="tour-rating" title="${r.count?'Оценка по опубликованным отзывам':'Оценок пока нет'}"><span class="tour-rating-value">★ ${r.count?fmtRating(r.average.toFixed(1)):'—'}</span><span class="tour-review-count">${r.count} ${plural(r.count,'отзыв','отзыва','отзывов')}</span></span>`}
function serviceItems(){if(!Array.isArray(C.services))C.services=[{id:'car-rental',title:'Авто в аренду',category:'Транспорт',short:'Для поездок в своём ритме.',description:'Уточните доступные автомобили, стоимость, условия аренды и получения у команды «Апсуа Тур».',photo:'',price:'',partner:'',location:'Абхазия',url:'',button:'Уточнить условия',hidden:false},{id:'theatre',title:'Билеты в театр',category:'Культура',short:'Добавьте к путешествию вечер в театре.',description:'Уточните афишу, даты спектаклей и возможность покупки билетов у команды «Апсуа Тур».',photo:'',price:'',partner:'',location:'Абхазия',url:'',button:'Уточнить афишу',hidden:false}];return C.services}
function serviceURL(value){const v=String(value||'').trim();if(/^https?:\/\//i.test(v)){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}if(/^tel:\+?[0-9 ()-]{5,30}$/i.test(v)||/^mailto:[^\s<>]+@[^\s<>]+$/i.test(v))return v;return ''}
function serviceCard(item){return `<a class="service-card" href="#/useful/${encodeURIComponent(item.id)}">${item.photo?`<img src="${src(item.photo)}" alt="" loading="lazy">`:`<div class="service-art" aria-hidden="true">${item.category==='Транспорт'?'↗':'✦'}</div>`}<div class="service-card-body"><span class="eyebrow">${esc(item.category||'Полезное')}</span><h2>${esc(item.title)}</h2><p>${esc(item.short)}</p>${item.price?`<span class="service-card-foot"><b>${esc(item.price)}</b></span>`:''}</div></a>`}
function usefulView(id){const list=serviceItems().filter(x=>!x.hidden);if(!id){app.innerHTML=`<div class="wrap useful-page">${pageHead('Полезное','Полезное рядом','Полезное','Услуги и идеи, которые могут пригодиться в Абхазии.')}<div class="services-grid">${list.map(serviceCard).join('')||'<p class="empty">Рекомендации скоро появятся.</p>'}</div></div>`;return}const item=list.find(x=>x.id===id);if(!item){app.innerHTML='<div class="wrap section"><h1>Услуга не найдена</h1><a class="btn btn-sea" href="#/useful">Все услуги</a></div>';return}const contact=serviceURL(item.url)||serviceURL('tel:'+String(C.site.phone||'').replace(/[^+0-9]/g,''));app.innerHTML=`<article class="wrap service-detail"><a class="btn btn-ghost small" href="#/useful">← Полезное</a><div class="service-detail-grid">${item.photo?`<img class="service-detail-photo" src="${src(item.photo)}" alt="${esc(item.title)}">`:`<div class="service-art service-detail-photo" aria-hidden="true">${item.category==='Транспорт'?'↗':'✦'}</div>`}<section class="panel"><p class="eyebrow">${esc(item.category||'Полезное')}</p><h1>${esc(item.title)}</h1>${item.partner?`<p class="service-partner">${esc(item.partner)}</p>`:''}${item.location?`<p class="sub">${esc(item.location)}</p>`:''}<div class="prose">${lines(item.description).map(x=>`<p>${esc(x)}</p>`).join('')}</div>${item.price?`<p class="service-price">${esc(item.price)}</p>`:''}${contact?`<a class="btn btn-sea" href="${esc(contact)}" ${/^https?:/.test(contact)?'target="_blank" rel="noopener"':''}>${esc(item.button||'Связаться')}</a>`:'<p class="sub">Контакт скоро появится.</p>'}</section></div></article>`}

/* ---------- Cards & catalog ---------- */
function cardHTML(t){
 t=tourPublic(t)||t;const fav=favs.has(t.id),pics=tourPics(t,800,600);
 return `<article class="card" data-id="${t.id}">
  <div class="card-media"><a class="card-photo-link" href="#/excursions/${t.id}" tabindex="-1" aria-hidden="true">${pics.map((p,i)=>`<img src="${p}" alt="" loading="lazy" class="${i?'':'on'}">`).join('')}</a>${pics.length>1?`<button class="card-photo-arrow prev" type="button" data-card-photo="-1" aria-label="Предыдущее фото">${ICON.left}</button><button class="card-photo-arrow next" type="button" data-card-photo="1" aria-label="Следующее фото">${ICON.right}</button><span class="card-dots" aria-hidden="true">${pics.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</span>`:''}<span class="tag">${CAT[t.cat]||''}</span></div>
  <button class="fav" type="button" data-fav="${t.id}" aria-pressed="${fav}" aria-label="${fav?'Убрать из избранного':'В избранное'}">${ICON.heart}</button>
  <div class="card-body">
   <div class="card-meta"><span>${esc(t.dur)}</span>${tourRatingHTML(t)}</div>
   <h3><a href="#/excursions/${t.id}">${esc(t.title)}</a></h3>
   <p class="desc">${esc(t.short)}</p>${t.offerKind==='individual'?'<p class="card-format">Индивидуальная экскурсия</p>':''}
   <div class="card-bottom"><span class="price num">${t.price==null?'':'<small>от</small>'} ${tourPriceHTML(t)} <small>${t.price==null?'':t.offerKind==='individual'?'/ группа':'/ чел.'}</small></span><a class="btn btn-sea small" href="#/excursions/${t.id}">Подробнее</a></div>
  </div></article>`;
}
function tripStyles(t){const text=[t.title,t.short,t.description,t.program,t.about,t.format].join(' ').toLowerCase();return [...new Set([...(Array.isArray(t.styles)?t.styles:[]),...(/джип|поход|рафтинг|верхов|треккинг|квадро/.test(text)?['active']:[]),...(/термал|spa|спа|источник/.test(text)?['relax']:[]),...(Number(t.hours)>0&&Number(t.hours)<=6?['short']:[])])]}
function priceBounds(){const prices=C.tours.map(t=>tourPublic(t)).filter(t=>t&&t.price!=null).map(t=>Number(t.price)).filter(Number.isFinite);return {min:prices.length?Math.min(...prices):0,max:prices.length?Math.max(...prices):0}}
function filtered(){
 let list=C.tours.map(t=>tourPublic(t)).filter(t=>t&&(ui.cat==='all'||t.cat===ui.cat||tripStyles(t).includes(ui.cat))&&(ui.priceMin==null||t.price!=null&&Number(t.price)>=ui.priceMin)&&(ui.priceMax==null||t.price!=null&&Number(t.price)<=ui.priceMax)&&(!ui.q.district||tourInDistrict(t,ui.q.district))&&(!ui.onlyFav||favs.has(t.id)));
 const s={pop:(a,b)=>b.reviews-a.reviews,cheap:(a,b)=>(a.price??Infinity)-(b.price??Infinity),exp:(a,b)=>(b.price??-Infinity)-(a.price??-Infinity),short:(a,b)=>a.hours-b.hours}[ui.sort];
 return list.sort(s);
}
function renderCards(){
 const box=$('#cards');if(!box)return;const list=filtered();const lim=box.dataset.limit?Number(box.dataset.limit):0;
 const rc=$('#resCount');if(rc)rc.textContent=list.length+' '+plural(list.length,'маршрут','маршрута','маршрутов')+(ui.q.district?' · '+DMAP[ui.q.district].name:'')+(ui.q.city?' · из '+ui.q.city:'')+(ui.q.date?' · '+shortDate(ui.q.date):'');
 const rp=$('#resetPlace');if(rp)rp.hidden=!ui.q.district&&!ui.q.city&&!ui.q.format&&!ui.onlyFav&&!ui.q.date&&ui.cat==='all'&&ui.priceMin==null&&ui.priceMax==null;
 const shown=lim?list.slice(0,lim):list;
 box.innerHTML=shown.length?shown.map(cardHTML).join(''):`<div class="empty" style="grid-column:1/-1">${ui.onlyFav?'В избранном пока пусто. Нажмите на сердечко на карточке, чтобы сохранить маршрут.':(ui.q.district&&!C.tours.some(t=>t.district===ui.q.district)?`В районе «${esc(DMAP[ui.q.district].short)}» маршруты скоро появятся. Можно заказать <a href="#/transfer" style="color:var(--sea)">трансфер</a> или индивидуальную поездку.`:'По этим условиям маршрутов нет. Попробуйте другую дату или район.')}</div>`;
}
function syncChips(){$$('[data-cat]').forEach(c=>c.setAttribute('aria-pressed',String(ui.cat===c.dataset.cat)));const f=$('[data-onlyfav]');if(f)f.setAttribute('aria-pressed',String(ui.onlyFav));const s=$('#sort');if(s)s.value=ui.sort;setupCategoryRails();syncPriceControls()}
function toolbarHTML(){const b=priceBounds(),low=ui.priceMin??b.min,high=ui.priceMax??b.max,span=b.max-b.min||1;return `<div class="toolbar catalog-compact-toolbar">
  <div class="category-rail"><button type="button" class="category-arrow" data-category-scroll="-1" aria-label="Предыдущие категории">‹</button><div class="chips" role="group" aria-label="Тип маршрута"><button class="chip" type="button" data-cat="all" aria-pressed="true">Все</button>${Object.entries({...CAT,active:'Активный отдых',relax:'SPA и релакс',short:'До 6 часов'}).map(([k,v])=>`<button class="chip" type="button" data-cat="${k}" aria-pressed="false">${v}</button>`).join('')}<button class="chip" type="button" data-onlyfav aria-pressed="false">♥ Избранное</button></div><button type="button" class="category-arrow" data-category-scroll="1" aria-label="Следующие категории">›</button></div>
  <div class="catalog-selects"><details class="price-filter catalog-price${priceFiltered()?' is-active':''}"><summary aria-label="Фильтр по цене${priceFiltered()?': '+esc(priceSummaryText()):''}"><span data-price-summary>Цена</span></summary><fieldset><legend><b>Цена</b><small>Групповые — за человека, индивидуальные — за группу</small></legend><div class="price-values"><label><span>От, ₽</span><input type="number" inputmode="numeric" id="priceFromInput" min="${b.min}" max="${b.max}" value="${low}" aria-label="Цена от"></label><span aria-hidden="true">—</span><label><span>До, ₽</span><input type="number" inputmode="numeric" id="priceToInput" min="${b.min}" max="${b.max}" value="${high}" aria-label="Цена до"></label></div><div class="price-range" style="--range-start:${(low-b.min)/span*100}%;--range-end:${(high-b.min)/span*100}%"><div class="price-range-track" aria-hidden="true"></div><input type="range" id="priceMin" min="${b.min}" max="${b.max}" step="1" value="${low}" aria-label="Минимальная цена" ${b.min===b.max?'disabled':''}><input type="range" id="priceMax" min="${b.min}" max="${b.max}" step="1" value="${high}" aria-label="Максимальная цена" ${b.min===b.max?'disabled':''}></div><div class="price-actions"><button type="button" class="btn btn-ghost small" data-price-reset>Сбросить</button><button type="button" class="btn btn-sea small" data-price-done>Готово</button></div></fieldset></details><label class="sort sort-format"><span>Формат</span><select class="input" data-format-filter aria-label="Формат экскурсии"><option value="">Все форматы</option><option value="group" ${ui.q.format==='group'?'selected':''}>Групповые</option><option value="individual" ${ui.q.format==='individual'?'selected':''}>Индивидуальные</option></select></label><label class="sort sort-order"><span>Сортировка</span><select class="input" id="sort" aria-label="Сортировка"><option value="pop">Популярные</option><option value="cheap">Дешевле</option><option value="exp">Дороже</option><option value="short">Короткие</option></select></label></div></div>`}
/* Price pill: shows «Цена» until a range is chosen, then the chosen range. */
function priceFiltered(){return ui.priceMin!=null||ui.priceMax!=null}
function priceSummaryText(){if(!priceFiltered())return 'Цена';const b=priceBounds(),low=ui.priceMin??b.min,high=ui.priceMax??b.max;return Math.round(low).toLocaleString('ru-RU')+' – '+rub(high)}

/* ---------- Home ---------- */
function popularHTML(){const pop=C.tours.map(t=>tourPublic(t)).filter(t=>t&&t.popular).slice(0,Math.max(0,Number(C.popularLimit)||0));if(!pop.length)return '';
 return `<section class="section" id="popular" aria-labelledby="h-pop">
   <div class="section-head"><div><p class="eyebrow">${esc(C.sec.popular.eyebrow)}</p><h2 id="h-pop">${esc(C.sec.popular.title)}</h2></div></div>
   <div class="popular" id="pop" aria-roledescription="карусель">
    ${pop.map((t,i)=>`<article class="slide${i?'':' on'}" aria-hidden="${i?'true':'false'}" aria-label="${i+1} из ${pop.length}">
      <img src="${tourCover(t,1400,700)}" alt="">
      <div class="slide-copy"><div class="slide-row"><span class="chip-img">${CAT[t.cat]||''}</span><span class="chip-img">${esc(t.dur)}</span>${tourRatingHTML(t)}</div>
      <h3>${esc(t.title)}</h3><p>${esc(t.short)}</p>
      <div class="slide-row"><span class="price num" style="color:inherit">${t.price==null?'':'от '}${tourPriceHTML(t)}${t.price!=null&&t.offerKind==='individual'?' / группа':''}</span><a class="btn btn-glass" href="#/excursions/${t.id}" ${i?'tabindex="-1"':''}>Подробнее</a></div></div>
     </article>`).join('')}
    <div class="pop-controls"><button class="circle" type="button" data-pop="-1" aria-label="Предыдущий маршрут">${ICON.left}</button><button class="circle" type="button" data-pop="1" aria-label="Следующий маршрут">${ICON.right}</button></div>
   </div>
   <div class="pop-dots" id="popDots">${pop.map((t,i)=>`<button type="button" class="${i?'':'on'}" data-go="${i}" aria-label="${esc(t.title)}"></button>`).join('')}</div>
  </section>`}
function transferBandHTML(){const T=C.transfer;
 return `<div class="transfer-band"><div class="transfer-gallery banner-gallery">${bannerImages('transfer',['road',0],'Дорога вдоль моря в Абхазии')}</div>
  <div class="copy"><h2 id="h-tr" style="color:#fff">${esc(T.title)}</h2><p>${esc(T.text)}</p>
   <ul>${lines(T.bullets).map(b=>`<li>${esc(b)}</li>`).join('')}</ul>
   <div class="from"><a class="btn btn-accent" href="#/transfer">Рассчитать трансфер</a></div></div></div>`}
function homeView(){
 const H=C.hero;
 app.innerHTML=`
 <section class="hero" aria-labelledby="h-hero">
  <div class="hero-bg banner-gallery">${bannerImages('hero',['lake',1],'')}</div>
  <div class="hero-in">
   <p class="eyebrow">${esc(H.eyebrow)}</p>
   <h1 id="h-hero">${esc(H.title)}</h1>
   <p class="lead">${esc(H.lead)}</p>
   <div class="hero-buttons"><a class="btn btn-glass" href="#/excursions">Заказать экскурсию</a><a class="btn btn-glass" href="#/transfer">${esc(H.btn2)}</a></div>
  </div>
 </section>
 <div class="wrap">
  <div class="home-search">${searchHTML('search')}</div>
  ${popularHTML()}
  <section class="section home-catalog" id="catalog" aria-labelledby="h-cat">
   <div class="section-head"><div><p class="eyebrow">${esc(C.sec.catalog.eyebrow)}</p><h2 id="h-cat">${esc(C.sec.catalog.title)}</h2><p class="sub" id="resCount"></p></div><button class="btn btn-ghost small" type="button" id="resetPlace" hidden>Сбросить фильтры</button></div>
   ${toolbarHTML()}
   <div class="cards" id="cards" data-limit="6"></div>
   <div class="more"><a class="btn btn-sea" href="#/excursions">Все экскурсии ${ICON.right}</a></div>
  </section>
  <section class="section" aria-labelledby="h-tr">${transferBandHTML()}</section>
  <section class="section" id="map" aria-labelledby="h-map">
   <div class="section-head"><div><h2 id="h-map">${esc(C.sec.map.title)}</h2><p class="sub">${esc(C.sec.map.sub)}</p></div></div>
   ${mapBlock()}
  </section>
  <section class="section" id="reviews" aria-labelledby="h-rev">

   ${yandexHTML()}

  </section>
  <section class="section" id="diary" aria-labelledby="h-dia">
   <div class="section-head"><div><p class="eyebrow">${esc(C.sec.diary.eyebrow)}</p><h2 id="h-dia">${esc(C.sec.diary.title)}</h2></div><div class="head-btns"><a class="btn btn-ghost small" href="#/diary">Все истории</a><a class="btn btn-ghost small" href="#/account">Написать историю</a></div></div>
   <div class="stories">${allStories().slice(0,3).map(storyHTML).join('')}</div>
  </section>

 </div>`;
 renderCards();syncChips();setupPopular();renderMapSide(ui.mapDist,ui.mapPin);
}

/* ---------- Section pages (each has its own address) ---------- */
function catalogView(onlyFav){
 ui.onlyFav=!!onlyFav;
 app.innerHTML=`<div class="wrap">${pageHead(onlyFav?'Избранное':'Экскурсии',onlyFav?'Сохранённые маршруты':C.sec.catalog.eyebrow,onlyFav?'Избранное':C.sec.catalog.title,'')}
  ${onlyFav?'':searchHTML('search2')}
  <div class="section" style="margin-top:28px"><div class="section-head" style="margin-bottom:16px"><p class="sub" id="resCount"></p><button class="btn btn-ghost small" type="button" id="resetPlace" hidden>Сбросить фильтры</button></div>
  ${toolbarHTML()}<div class="cards" id="cards"></div></div></div>`;
 renderCards();syncChips();
}
function mapView(){app.innerHTML=`<div class="wrap">${pageHead('Карта',C.sec.map.eyebrow,C.sec.map.title,C.sec.map.sub)}<div class="section" style="margin-top:24px">${mapBlock()}</div></div>`;renderMapSide(ui.mapDist,ui.mapPin)}
function reviewsView(){app.innerHTML=`<div class="wrap">${pageHead('Отзывы',C.sec.reviews.eyebrow,C.sec.reviews.title,'',`<a class="btn btn-accent" href="#/account">Оставить отзыв</a>`)}<div class="section" style="margin-top:24px">${yandexHTML()}</div></div>`}
function diaryView(){app.innerHTML=`<div class="wrap">${pageHead('Дневник',C.sec.diary.eyebrow,C.sec.diary.title,'Истории гостей об Абхазии: маршруты, места и советы.',`<a class="btn btn-accent" href="#/account">Написать историю</a>`)}<div class="section" style="margin-top:24px"><div class="stories all">${allStories().map(storyHTML).join('')}</div></div></div>`}

/* ---------- Reviews & diary data ---------- */
const SRC={ya:['','Яндекс Карты'],site:['site','С сайта'],demo:['demo','Пример']};
function allReviews(){const order={ya:0,site:1,demo:2};return [...store.get('reviews',[]).map(r=>({...r,src:'site'})),...C.reviews.filter(r=>!r.hidden)].sort((a,b)=>(order[a.src]??2)-(order[b.src]??2))}
function reviewHTML(r){const t=tourById(r.t),sc=SRC[r.src||'demo']||SRC.demo;const st=Math.max(1,Math.min(5,Number(r.r)||5));return `<article class="review"><header><span class="avatar" ${profileTarget(r.uid)}>${r.avatar?`<img src="${src(r.avatar)}" alt="Аватар ${esc(r.n)}" loading="lazy" decoding="async">`:esc((r.n||'?')[0])}</span><div><b ${profileTarget(r.uid)}>${esc(r.n)}</b><small>${r.c?esc(r.c)+' · ':''}${esc(r.d||'')}</small></div></header><span class="stars" aria-label="${st} из 5">${'★'.repeat(st)}${'☆'.repeat(5-st)}</span>${String(r.x||'').length>220?`<details class="review-text"><summary><q>${esc(r.x)}</q><span>Читать полностью</span><span>Свернуть</span></summary><q>${esc(r.x)}</q></details>`:`<q>${esc(r.x)}</q>`}${r.verified?`<small class="verified-review">✓ Подтверждённая поездка · ${esc(r.excursionDate)}</small>`:''}<div class="rev-foot">${t?`<a href="#/excursions/${t.id}">${esc(t.title)}</a>`:'<span></span>'}<span class="src ${sc[0]}"><i></i>${sc[1]}</span></div></article>`}
function yandexHTML(){const Y=C.yandex,has=Y.rating&&Y.count;return `<div class="ya glass"><span class="ya-badge"><span class="ya-dot">Я</span>Отзывы на Яндекс Картах</span>${has?`<span class="ya-rating num">${esc(fmtRating(Y.rating))}</span><span class="stars">★★★★★</span><span class="sub">${esc(Y.count)} ${plural(Number(Y.count)||0,'отзыв','отзыва','отзывов')}</span>`:`<span class="sub">Здесь появится рейтинг с Яндекс Карт.</span>`}${Y.url?`<a class="btn btn-ghost small" href="${esc(Y.url)}" target="_blank" rel="noopener" style="margin-left:auto">Все отзывы на Яндексе ${ICON.ext}</a>`:''}</div>`}
function allStories(){moderateStories();return [...store.get('diary',[]).filter(s=>s.status==='published').map(s=>({...s,user:true})),...C.stories.filter(s=>!s.hidden&&(s.status==='published'||!s.status))]}
function storyHTML(s){return `<article class="story"><img src="${src(s.img)||src(s.photo,s.scene||['sea',0],1000,625)}" alt="" loading="lazy"><div><small>${esc(s.a)}${s.user?' · <span class="src site"><i></i>с сайта</span>':''}</small><h3>${esc(s.t)}</h3><p>${esc(s.x)}</p></div></article>`}

/* ---------- Map: real district boundaries (GADM) with gradation by number of routes ---------- */
const distCount=id=>C.tours.filter(t=>tourInDistrict(t,id)&&tourPublic(t)).length;
const GRAD=[['#edf3ee','нет маршрутов'],['#d9eade','1'],['#b8d8c5','2–3'],['#91bea6','4 и больше']];
const gradIdx=n=>n<1?0:n<2?1:n<4?2:3;
function mapSVG(){
 const P=GEO.pins;
 const points=Object.keys(P).filter(k=>PIN_LBL[k]);
 const pin=k=>{const [x,y]=P[k],[dx,dy,an]=PIN_LBL[k],n=C.tours.filter(t=>tourPins(t).includes(k)&&tourPublic(t)).length;
 return `<g class="map-pin${k==='psou'?' border':n?'':' muted'}" tabindex="0" role="${k==='psou'?'link':'button'}" ${k==='psou'?'data-goto="#/transfer"':`data-pin="${k}"`} aria-label="${esc(PIN_NAMES[k])}${n?': '+n+' маршрутов':''}"><title>${esc(PIN_NAMES[k])}${n?' · '+n+' маршрутов':''}</title>${n?`<circle class="pin-halo" cx="${x}" cy="${y}" r="18"/>`:''}<circle class="dot" cx="${x}" cy="${y}" r="${n?8:5}"/><text x="${x+dx}" y="${y+dy}" text-anchor="${an}">${esc(PIN_NAMES[k])}</text></g>`};
 const coast=['psou','gagra','pitsunda','gudauta','afon','suhum','gulripsh','ochamchira','gal'].filter(k=>P[k]);
 return `<svg class="atlas" viewBox="70 70 960 720" role="group" aria-label="Интерактивная карта Абхазии: выберите район или место">
 <defs><linearGradient id="seaG" x2="1" y2="1"><stop stop-color="#f0f9ff"/><stop offset="1" stop-color="#b8dae9"/></linearGradient><linearGradient id="landG" x2="0" y2="1"><stop stop-color="#f0f6ef"/><stop offset="1" stop-color="#d5e7dc"/></linearGradient><pattern id="atlasGrid" width="55" height="55" patternUnits="userSpaceOnUse"><path d="M55 0H0V55" fill="none" stroke="#fff" stroke-opacity=".4"/></pattern><filter id="landShadow"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#296379" flood-opacity=".14"/></filter></defs>
 <rect width="1200" height="1000" fill="url(#seaG)"/><rect width="1200" height="1000" fill="url(#atlasGrid)"/>
 <g class="atlas-land" filter="url(#landShadow)">${Object.entries(GEO.dist).map(([id,d])=>`<path class="dist" data-density="${gradIdx(distCount(id))}" d="${d}" fill="${GRAD[gradIdx(distCount(id))][0]}" data-dist="${id}" tabindex="0" role="button" aria-label="${esc(DMAP[id].name)}: ${distCount(id)} маршрутов"><title>${esc(DMAP[id].name)}</title></path>`).join('')}</g>
 <path class="atlas-route" d="${coast.map((k,i)=>(i?'L':'M')+P[k].join(',')).join(' ')}"/>
 <text class="atlas-sea" x="200" y="635">Чёрное море</text><text class="atlas-caption" x="200" y="665">АБХАЗИЯ • ВАШЕ ПУТЕШЕСТВИЕ</text>
 ${points.map(pin).join('')}</svg><div class="atlas-tip">Выберите место на карте ↗</div>`;
}

function mapBlock(){return `<div class="map-grid"><div><div class="map-box">${mapSVG()}</div>
  <div class="map-legend"><span>Маршрутов в районе:</span>${GRAD.map(([c,l])=>`<span><i style="background:${c}"></i>${l}</span>`).join('')}</div>
  <p class="map-credit" style="margin:6px 0 0;font-size:12px;opacity:.6">Карта: bdijkstra, Wikimedia Commons, <a href="https://creativecommons.org/licenses/by-sa/3.0/nl/" target="_blank" rel="noopener">CC BY-SA 3.0 NL</a>, изменена.</p>
  <div class="dchips" role="group" aria-label="Районы">${DISTRICTS.map(d=>`<button type="button" class="chip" data-dist="${d.id}" aria-pressed="false">${esc(d.short)}<small>${distCount(d.id)||''}</small></button>`).join('')}</div></div>
  <div class="map-side" id="mapSide"></div></div>`}
function renderMapSide(dist,pinK){
 ui.mapDist=dist;ui.mapPin=pinK||'';
 $$('.dist').forEach(p=>p.classList.toggle('on',p.dataset.dist===dist));
 $$('.dchips [data-dist]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dist===dist)));
 $$('.map-pin').forEach(p=>p.classList.toggle('on',!!pinK&&p.dataset.pin===pinK));
 const side=$('#mapSide');if(!side)return;const D=DMAP[dist];
 let list=C.tours.map(t=>tourPublic(t)).filter(t=>t&&tourInDistrict(t,dist)&&(!pinK||tourPins(t).includes(pinK)));
 side.innerHTML=`<div class="side-head"><p class="eyebrow">${pinK?esc(PIN_NAMES[pinK])+' · ':''}Район</p><h3>${esc(D.name)}</h3><p class="sub">${esc((C.districts&&C.districts[dist])||D.about)}</p></div>
  ${list.length?list.map(t=>`<a class="mini" href="#/excursions/${t.id}"><img src="${tourCover(t,300,220)}" alt=""><div><b>${esc(t.title)}</b><span>${esc(t.dur)} · от ${tourPriceHTML(t)}${t.offerKind==='individual'?' / группа':''}</span></div></a>`).join('')+`<a class="btn btn-ghost small" href="#/excursions?district=${dist}">Все маршруты района</a>`:`<div class="empty">Маршруты в этом районе скоро появятся. Можно заказать <a href="#/transfer" style="color:var(--sea)">трансфер</a> или индивидуальную поездку.</div>`}`;
}

/* ---------- Popular carousel: auto every 3 s; wheel over it flips slides ---------- */
let popTimer=null,popIdx=0,popPaused=false;
function setupPopular(){
 clearInterval(popTimer);popIdx=0;popPaused=false;const box=$('#pop');if(!box)return;
 const go=i=>{const slides=$$('.slide',box),dots=$$('#popDots button');popIdx=(i+slides.length)%slides.length;
  slides.forEach((s,j)=>{s.classList.toggle('on',j===popIdx);s.setAttribute('aria-hidden',j===popIdx?'false':'true');const a=$('a',s);if(a)a.tabIndex=j===popIdx?0:-1});
  dots.forEach((d,j)=>{d.classList.remove('on');if(j===popIdx){void d.offsetWidth;d.classList.add('on')}})};
 box._go=go;
 const start=()=>{clearInterval(popTimer);popTimer=setInterval(()=>{if(!popPaused&&!document.hidden&&!window.apsuaVisualActive)go(popIdx+1)},3000)};
 const pause=v=>{popPaused=v;const pd=$('#popDots');if(pd)pd.classList.toggle('paused',v);box.classList.toggle('paused',v)};
 box.addEventListener('focusin',()=>pause(true));box.addEventListener('focusout',()=>pause(false));
 let x0=null,y0=null;box.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
 box.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(e.changedTouches[0].clientY-y0)){go(popIdx+(dx<0?1:-1));start()}x0=null});
 let wheelAt=0;
 box.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;const d=e.deltaX;if(!d)return;e.preventDefault();const now=Date.now();if(now-wheelAt<650)return;wheelAt=now;go(popIdx+(d>0?1:-1))},{passive:false});
 box._restart=start;pause(false);start();
}
function changeCardPhoto(card,step){
 const imgs=$$('.card-media img,.story-media img',card),dots=$$('.card-dots i',card);if(imgs.length<2)return;
 const cur=Math.max(0,imgs.findIndex(x=>x.classList.contains('on'))),next=(cur+step+imgs.length)%imgs.length;
 imgs.forEach((img,i)=>img.classList.toggle('on',i===next));dots.forEach((dot,i)=>dot.classList.toggle('on',i===next));
}
document.addEventListener('click',e=>{const arrow=e.target.closest('[data-card-photo]');if(!arrow)return;e.preventDefault();e.stopPropagation();const card=arrow.closest('.card,.story');if(card){card._photoManualAt=Date.now();changeCardPhoto(card,Number(arrow.dataset.cardPhoto))}});
let cardSwipe=null;
document.addEventListener('touchstart',e=>{const media=e.target.closest('.card-media');if(!media||e.touches.length!==1||e.target.closest('[data-card-photo]')){cardSwipe=null;return}cardSwipe={media,x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
document.addEventListener('touchend',e=>{const swipe=cardSwipe;cardSwipe=null;if(!swipe||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-swipe.x,dy=e.changedTouches[0].clientY-swipe.y;if(Math.abs(dx)<40||Math.abs(dx)<Math.abs(dy)*1.3)return;const card=swipe.media.closest('.card');if(!card||$$('.card-media img',card).length<2)return;card._photoManualAt=Date.now();swipe.media._swipeAt=Date.now();changeCardPhoto(card,dx<0?1:-1)},{passive:true});
document.addEventListener('touchcancel',()=>{cardSwipe=null},{passive:true});
document.addEventListener('click',e=>{const media=e.target.closest('.card-media');if(media&&Date.now()-(media._swipeAt||0)<700){e.preventDefault();e.stopImmediatePropagation()}},true);
setInterval(()=>{
 if(document.hidden||window.apsuaVisualActive)return;
 $$('.card,.story').forEach(card=>{if(card.matches(':hover')||card.contains(document.activeElement)||Date.now()-(card._photoManualAt||0)<6000)return;const r=card.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;changeCardPhoto(card,1)});
},4000);

/* ---------- Tour page ---------- */
function tourAboutParts(value,limit=400){
 const paragraphs=lines(value),preview=[],rest=[];let size=0;
 for(let i=0;i<paragraphs.length;i++){
  const p=paragraphs[i];
  if(size+p.length<=limit){preview.push(p);size+=p.length;continue}
  if(!preview.length){let cut=p.lastIndexOf(' ',limit);if(cut<Math.floor(limit*.65))cut=limit;preview.push(p.slice(0,cut));rest.push(p.slice(cut));}
  else rest.push(p);
  rest.push(...paragraphs.slice(i+1));break;
 }
 return {preview,rest};
}
function tourAboutHTML(value){
 const {preview,rest}=tourAboutParts(value),html=items=>items.map(p=>`<p>${esc(p)}</p>`).join('');
 return `<section class="block tour-about" id="tour-about"><h2>О чём экскурсия</h2><div class="prose">${html(preview)}</div>${rest.length?`<details class="tour-about-more"><summary><span class="about-closed">Читать полностью</span><span class="about-open">Свернуть</span>${ICON.down||'⌄'}</summary><div class="prose">${html(rest)}</div></details>`:''}</section>`;
}
let bk=null,tourBackHash='#/excursions';
function tourView(id){
 const t=tourById(id);if(!t||!tourPublic(t)){app.innerHTML='<div class="wrap section"><h1>Экскурсия сейчас недоступна</h1><p>Выберите другую дату или маршрут.</p><a class="btn btn-sea" href="#/excursions">Все экскурсии</a></div>';return}
 const d0=ui.q.date&&fromIso(ui.q.date)>=today0()?ui.q.date:null;departureCity=ui.q.city||departureCity;const monthDate=d0?fromIso(d0):today0();bookingMonth=new Date(monthDate.getFullYear(),monthDate.getMonth(),1);
 bk={t,date:d0,time:null,adults:Math.max(1,Math.min(ui.q.people||1,8)),kids:0,step:'pick'};
 if(d0){bk.time=scheduledTimes(t,d0)[0]||null}
 const AR=allReviews();const reviews=AR.filter(r=>r.t===t.id);const all=reviews;
 const dist=[[5,.82],[4,.13],[3,.03],[2,.01],[1,.01]];const pics=tourPics(t);
 app.innerHTML=`<div class="wrap tour-page">
  <div class="tour-back-row"><a class="btn btn-ghost small tour-back-control" href="${esc(tourBackHash)}" aria-label="Назад к предыдущей странице">${ICON.left}<span>Назад</span></a></div>
  <nav class="crumbs" aria-label="Навигация"><a href="#/">Главная</a><span>/</span><a href="#/excursions">Экскурсии</a><span>/</span><a href="#/excursions?district=${t.district}">${esc(DMAP[t.district]?DMAP[t.district].short:'')}</a></nav>
  <header class="tour-head"><div class="tour-mobile-top"><span>${esc(t.loc||'')}</span><a class="btn btn-ghost small tour-back-control" href="${esc(tourBackHash)}" aria-label="Назад к предыдущей странице">${ICON.left}<span>Назад</span></a></div><h1>${esc(t.title)}</h1>
   <div class="tour-meta"><span class="tour-confirmation">Условия подтвердит организатор</span><span class="tour-duration">${esc(t.dur)}</span><span class="tour-location">${esc(t.loc||'')}</span>
   <button class="btn btn-ghost small" type="button" data-fav="${t.id}" aria-pressed="${favs.has(t.id)}">${favs.has(t.id)?'♥ В избранном':'♡ В избранное'}</button><button class="btn btn-ghost small" type="button" data-share>Поделиться</button></div></header>
  ${tourGalleryHTML(pics)}
  <nav class="tour-section-nav" aria-label="Разделы экскурсии">${[["tour-about","Описание"],["tour-program","Программа"],["tour-route","Маршрут"],["t-reviews","Отзывы"]].map(([id,label])=>`<a href="#${id}" data-tour-anchor="${id}">${label}</a>`).join('')}</nav>
  <div class="tour-layout">
   <div class="tour-main">
    <div class="facts"><div class="fact"><span>Длительность</span><b>${esc(t.dur)}</b></div><div class="fact"><span>Формат</span><b data-tour-format>${esc(bk.kind==='individual'?'Индивидуальная':t.format)}</b></div><div class="fact"><span>Группа</span><b data-tour-group>${esc(t.group)}</b></div><div class="fact"><span>Язык</span><b>${esc(t.lang)}</b></div></div>
    ${tourAboutHTML(t.about)}
    <section class="block" id="tour-program"><h2>Программа</h2><ol class="timeline">${(t.program||[]).map(s=>`<li><time class="num">${esc(s[0])}</time><span class="rail"><i></i></span><div class="step"><b>${esc(s[1])}</b><p>${esc(s[2])}</p></div></li>`).join('')}</ol>
     <p style="font-size:14px;color:var(--muted)">Время ориентировочное и зависит от дорог и погоды.</p></section>
    <section class="block"><h2>Что входит в цену</h2><div class="incl">
     <div class="yes"><h3>Включено</h3><ul>${lines(t.incl).map(x=>`<li>${ICON.yes}<span>${esc(x)}</span></li>`).join('')}</ul></div>
     <div class="no"><h3>Оплачивается отдельно</h3><ul>${lines(t.excl).map(x=>`<li>${ICON.no}<span>${esc(x)}</span></li>`).join('')}</ul></div></div></section>
    ${tourRouteHTML(t)}<section class="block"><h2>Место встречи</h2><div class="meet"><b>${esc(t.meet)}</b><span style="color:var(--muted);font-size:14px">После бронирования менеджер свяжется с вами в выбранном мессенджере.</span></div></section>
    <section class="block"><h2>Важно знать</h2><ul class="notes">${lines(t.notes).map(n=>`<li>${esc(n)}</li>`).join('')}</ul></section>
    <section class="block" id="t-reviews"><h2>Отзывы</h2>
     <p class="sub">${reviews.length?tourRatingHTML(t):'Отзывы именно об этом маршруте появятся после публикации гостей.'}</p><div class="tour-reviews">${reviews.map(reviewHTML).join('')}</div></section>
    <section class="block"><h2>Похожие маршруты</h2><div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${C.tours.filter(x=>x.id!==t.id&&tourPublic(x)&&(x.cat===t.cat||x.district===t.district)).slice(0,2).map(cardHTML).join('')}</div></section>
   </div>
   <aside class="booking" id="booking" aria-label="Бронирование"></aside>
  </div></div>`;
 renderBooking();
 const mb=$('#mbar');mb.hidden=false;document.body.classList.add('has-mbar');
 mb.innerHTML=`<div><span class="price num">${bookingPriceLabel()}</span></div><button class="btn btn-accent" type="button" id="toBooking">Выбрать дату</button>`;
}
function bkTotal(){return bk.kind==='individual'?bk.t.price:bk.adults*bk.t.price+bk.kids*bk.t.kid}
function renderBooking(){
 const el=$('#booking');if(!el||!bk)return;const t=bk.t;
 if(bk.step==='done'){el.innerHTML=`<div class="success"><span class="ok">${ICON.yes}</span><h3>Отправляем заявку…</h3><p style="color:var(--muted);font-size:15px">Номер заявки</p><span class="code">${bk.code}</span>
   <div class="summary" style="text-align:left;width:100%"><b>${esc(t.title)}</b><span>${human(fromIso(bk.date))}, ${esc(bk.time)}</span><span>${bk.adults} взр.${bk.kids?` + ${bk.kids} дет.`:''} · ${bookingTotalLabel()}</span></div>
   <p style="font-size:14px;color:var(--muted)">Заявка у диспетчера. Как только он ответит, придёт уведомление, а статус появится в разделе «Мои заявки».</p>
   <button class="btn btn-ghost block" type="button" data-bk="again">Забронировать ещё</button></div>`;return}
 if(bk.step==='form'){el.innerHTML=`<div class="booking-price"><h3>Контакты</h3><button class="btn btn-ghost small" type="button" data-bk="back">${ICON.left} Назад</button></div>
   <div class="summary"><b>${human(fromIso(bk.date))}, ${bk.time}</b><span>${bk.adults} взр.${bk.kids?` + ${bk.kids} дет.`:''} · <b class="num">${bookingTotalLabel()}</b></span></div>
   <form id="bkForm" novalidate style="display:grid;gap:14px">
    <label class="field"><span>Имя</span><input class="input" id="bk-name" name="name" minlength="2" aria-describedby="e-name" autocomplete="section-contact name" autocapitalize="words" enterkeyhint="next" required><small class="err" id="e-name"></small></label>
    <label class="field"><span>Телефон</span><input class="input" id="bk-phone" name="tel" aria-describedby="e-phone" type="tel" inputmode="tel" autocomplete="section-contact tel" enterkeyhint="next" placeholder="+7 940 000-00-00" required><small class="err" id="e-phone"></small></label>
    <fieldset class="booking-messenger"><legend>Как с вами связаться</legend>${['WhatsApp','Telegram','MAX'].map(v=>`<label><input type="radio" name="via" value="${v}" ${v===(bk.contact?.via||'WhatsApp')?'checked':''}><span>${v}</span></label>`).join('')}</fieldset>
    <label class="field"><span>Где вы живёте</span><input class="input" id="bk-hotel" name="stay-place" list="bookingHotels" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="next" placeholder="Начните вводить название отеля"><datalist id="bookingHotels">${(C.transfer?.hotels||[]).filter(h=>h.name&&h.address).map(h=>`<option value="${esc(h.name+', '+h.address)}"></option>`).join('')}</datalist><small class="hint">Нет в списке — напишите название и точный адрес</small></label>
    <label class="field"><span>Комментарий</span><textarea class="input" id="bk-note" name="note" autocomplete="off" placeholder="Детское кресло, вопросы гиду"></textarea></label>
    <label class="check"><input type="checkbox" id="bk-ok" aria-describedby="e-ok"><span>Согласен на обработку персональных данных для связи по заявке</span></label><small class="err" id="e-ok"></small><p class="err" id="bk-error" role="alert"></p>
    <button class="btn btn-accent block" type="submit">Отправить заявку</button>
   </form>`;const u=store.get('user',null);if(u){$('#bk-name').value=u.name||'';if(u.phone)$('#bk-phone').value=u.phone}return}
 const ds=days(21);
 const times=bk.date?scheduledTimes(t,bk.date).map(tm=>{const s=seats(t,bk.date,tm);return `<button class="time" type="button" data-time="${tm}" aria-pressed="${bk.time===tm}" ${s?'':'disabled'}>${tm}<small>${s?'по запросу':'нет расписания'}</small></button>`}).join(''):'';
 const left=tourOffer(t,bk.date||iso(today0()),departureCity,bk.kind).maxPeople;
 el.innerHTML=`<div class="booking-price"><span class="price num">${bookingPriceLabel()}</span><span class="hint">Места требуют подтверждения</span></div>
  <div><div class="label"><span>Дата</span><span>${bk.date?human(fromIso(bk.date)):'выберите день'}</span></div>
   ${bookingCalendar(t)}</div>
  ${bk.date?`<div><div class="label"><span>Время</span></div><div class="times">${times}</div></div>`:''}
  <div class="people"><div class="label" style="margin:0"><span>Участники</span></div>
   ${[['adults','Взрослые',bk.kind==='individual'?'В составе группы':rub(t.price)],['kids','Дети',bk.kind==='individual'?'В составе группы':rub(t.kid)]].map(([k,l,p])=>`<div class="person"><div>${l}<small>${p}</small></div><div class="stepper"><button type="button" data-step="${k}" data-d="-1" aria-label="Меньше" ${bk[k]<=(k==='adults'?1:0)?'disabled':''}>−</button><output class="num" aria-live="polite">${bk[k]}</output><button type="button" data-step="${k}" data-d="1" aria-label="Больше" ${bk.adults+bk.kids>=left?'disabled':''}>+</button></div></div>`).join('')}
  </div>
  <div class="total"><span>Итого</span><b class="num">${bookingTotalLabel()}</b></div>
  <button class="btn btn-accent block" type="button" data-bk="next" ${bk.date&&bk.time?'':'disabled'}>${bk.date?(bk.time?'Забронировать':'Выберите время'):'Выберите дату'}</button>
  <div class="assure"><span>${ICON.shield}Бесплатная отмена до оплаты</span><span>${ICON.shield}Оплата по QR после подтверждения диспетчером</span></div>`;
 
}
function clampPeople(){if(!bk.date||!bk.time)return;const left=seats(bk.t,bk.date,bk.time);while(bk.adults+bk.kids>left&&bk.kids>0)bk.kids--;while(bk.adults+bk.kids>left&&bk.adults>1)bk.adults--}

/* ---------- Transfer ---------- */
const tr={direction:'arrival',address:'',hotel:'',flight:'',name:'',phone:'',via:'',from:'psou',to:'gagra',cls:'individual',seat:false,date:'',time:'12:00',pax:1,passengerNames:[''],step:'form'};
const trFrom=()=>C.transfer.from.find(x=>x.id===tr.from)||C.transfer.from[0];
const trTo=()=>C.transfer.to.find(x=>x.id===tr.to)||C.transfer.to[0];
// build 166: two transfer formats only. 'individual' = price per car for the route (passengers within capacity do not multiply it),
// 'group' = price per passenger × passengers. Car classes (comfort/standard/van) never pick a tariff; old stored values read as individual.
const TRANSFER_FORMAT_NAMES={individual:'Индивидуальный',group:'Групповой'};
function transferFormatOf(order){const f=order?.format;if(f==='individual'||f==='group')return f;const legacy=String(order?.clsId??order?.cls??'');return legacy==='group'||/группов/i.test(legacy)?'group':'individual'}
const transferFormatLabel=order=>TRANSFER_FORMAT_NAMES[transferFormatOf(order)];
function transferFormatMax(id){const max=Number(C.transfer?.formats?.[id]?.max);return Number.isInteger(max)&&max>0?max:id==='group'?21:4}
function transferFormats(){return [{id:'individual',name:TRANSFER_FORMAT_NAMES.individual,note:'Автомобиль только для вас · цена за машину',max:transferFormatMax('individual')},{id:'group',name:TRANSFER_FORMAT_NAMES.group,note:'Место в общем трансфере · цена за пассажира',max:transferFormatMax('group')}]}
const trCls=()=>transferFormats().find(x=>x.id===tr.cls)||transferFormats()[0];
function rateFor(destination,origin,format){
 if(!['sochi','adler'].includes(origin)||!destination)return null;
 const value=format==='group'?Number(destination.rates?.group):Number(destination.price);
 return Number.isFinite(value)&&value>0?value:null;
}
// Shown before sending only; the server computes the order price itself.
function trPrice(){const base=rateFor(trTo(),trFrom().id,trCls().id);if(base===null)return null;return base*(trCls().id==='group'?tr.pax:1)+(tr.seat?Number(C.transfer.seat)||0:0)}
function transferRouteLabel(){return tr.direction==='departure'?trTo().name+' → '+trFrom().name:trFrom().name+' → '+trTo().name}
function renderTransferRates(){const box=$('#trRates');if(!box)return;const cls=trCls(),origin=trFrom();box.innerHTML=`<p class="eyebrow">Стоимость поездки</p><h3>${esc(cls.name)}</h3><p class="sub">${tr.direction==='departure'?'Абхазия → '+esc(origin.name):esc(origin.name)+' → Абхазия'}</p><div class="rate-list">${C.transfer.to.map(d=>{const price=rateFor(d,origin.id,cls.id);return `<div class="rate-item${d.id===trTo().id?' selected':''}"><span>${esc(d.name)}</span><b class="num">${price===null?'Согласуем цену':rub(price)}</b></div>`}).join('')}</div><p class="rate-note">${cls.id==='group'?'Цена за одного пассажира. Итог учитывает число гостей.':'Цена за автомобиль в одну сторону.'} Стоимость и время подачи подтвердит диспетчер.</p>`}
function transferView(){ensureTransferConfig();if(!tr.date)tr.date=iso(days(1)[0]);if(!C.transfer.from.some(x=>x.id===tr.from))tr.from=C.transfer.from[0].id;if(!C.transfer.to.some(x=>x.id===tr.to)){tr.to=C.transfer.to[0]?.id||'';tr.hotel='';tr.address=''}app.innerHTML=`<div class="wrap">${pageHead('Трансфер',C.transfer.eyebrow,'Трансфер по Абхазии','Выберите встречу или отъезд, маршрут и точный адрес. Условия поездки и стоимость подтвердит диспетчер.')}<div class="tr-layout"><div class="panel" id="trPanel"></div><aside class="booking transfer-rates" id="trRates" aria-label="Тарифы"></aside></div></div>`;renderTransfer()}
function renderTransfer(){const p=$('#trPanel');if(!p)return;ensureTransferConfig();const T=C.transfer,available=transferFormats().filter(c=>c.id!=='group'||transferGroupAvailable(tr.date));if(!available.some(c=>c.id===tr.cls))tr.cls=available[0]?.id||'individual';const cls=trCls();tr.pax=Math.max(1,Math.min(tr.pax,cls.max));renderTransferRates();if(tr.step==='done'){p.innerHTML=`<div class="success"><span class="ok">${ICON.yes}</span><h3>Заявка на трансфер принята</h3><span class="code">${esc(tr.code)}</span><div class="summary"><b>${esc(transferRouteLabel())}</b><span>${shortDate(tr.date)}, ${esc(tr.time)} · ${esc(cls.name)} · ${tr.pax} пасс.</span><span>${esc(tr.address)}</span><span class="num">${transferPriceLabel()}</span></div><p class="sub">Заявка у диспетчера. После подтверждения придёт QR для оплаты, а за 24 часа до выезда — водитель, машина и госномер.</p><button class="btn btn-ghost" type="button" data-tr="again">Новая заявка</button></div>`;return}const terminalField=`<label class="field"><span>${tr.direction==='departure'?'Куда · аэропорт или вокзал':'Откуда · аэропорт или вокзал'}</span><select class="input" id="tr-from">${T.from.map(f=>`<option value="${esc(f.id)}" ${f.id===tr.from?'selected':''}>${esc(f.name)}</option>`).join('')}</select></label>`,cityField=`<label class="field"><span>${tr.direction==='departure'?'Откуда · населённый пункт':'Куда · населённый пункт'}</span><select class="input" id="tr-to">${T.to.map(x=>`<option value="${esc(x.id)}" ${x.id===tr.to?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>`,hotels=transferHotels();p.innerHTML=`<form id="trForm" novalidate><fieldset class="tr-direction"><legend>Встреча или отъезд</legend>${[['arrival','Встреча'],['departure','Отъезд']].map(([id,label])=>`<label><input type="radio" name="tr-direction" value="${id}" ${tr.direction===id?'checked':''}><span>${label}</span></label>`).join('')}</fieldset>${tr.direction==='departure'?'<p class="tr-departure-warning" role="note"><b>Важно: заявка на отъезд подаётся не позднее чем за 12 часов до отправления.</b> Укажите время отправления рейса или поезда; время подачи автомобиля подтвердит диспетчер.</p>':''}<div class="grid2">${tr.direction==='departure'?cityField+terminalField:terminalField+cityField}<div class="field"><span>Дата ${tr.direction==='departure'?'отправления':'прибытия'}</span><button type="button" class="input sbtn" data-pop-open="trdate" aria-expanded="false">${ICON.cal}<b>${human(fromIso(tr.date))}</b>${ICON.chev}</button></div><label class="field"><span>Время ${tr.direction==='departure'?'отправления рейса / поезда':'прибытия рейса / поезда'}</span><input class="input num" id="tr-time" name="trip-time" autocomplete="off" aria-describedby="te-time" type="time" required value="${esc(tr.time)}"><small class="err" id="te-time" aria-live="polite"></small></label></div><div class="tr-address-block"><label class="field"><span>Отель в ${esc(trTo().name)} · необязательно</span><input class="input" id="tr-hotel" name="stay-place" list="transferHotels" autocomplete="off" autocorrect="off" spellcheck="false" value="${esc(tr.hotel)}" placeholder="${hotels.length?'Начните вводить название…':'Название отеля или частного жилья'}"><datalist id="transferHotels">${hotels.map(h=>`<option value="${esc(h.name)}">${esc(h.address)}</option>`).join('')}</datalist></label><label class="field"><span>${tr.direction==='departure'?'Адрес или название отеля, откуда забрать *':'Адрес или название отеля, куда отвезти *'}</span><input class="input" id="tr-address" name="pickup-address" aria-describedby="te-address" value="${esc(tr.address)}" required maxlength="300" autocomplete="section-pickup street-address" enterkeyhint="next" placeholder="Улица, дом, корпус / название объекта"><small class="err" id="te-address" aria-live="polite"></small></label></div><div class="field"><span>Формат поездки</span><div class="classes">${available.map(c=>`<label class="class"><input type="radio" name="cls" value="${esc(c.id)}" ${c.id===tr.cls?'checked':''}><span><b>${esc(c.name)}</b><small>${esc(c.note)}</small></span></label>`).join('')}</div>${transferGroupAvailable(tr.date)?'':'<small class="tr-season-note">На выбранную дату доступны только индивидуальные трансферы.</small>'}</div><div class="grid2 tr-passengers"><div class="person field"><div>Пассажиры<small>до ${cls.max}</small></div><div class="stepper"><button type="button" data-pax="-1" aria-label="Меньше" ${tr.pax<=1?'disabled':''}>−</button><output class="num">${tr.pax}</output><button type="button" data-pax="1" aria-label="Больше" ${tr.pax>=cls.max?'disabled':''}>+</button></div></div><label class="check"><input type="checkbox" id="tr-seat" ${tr.seat?'checked':''}><span>Детское кресло</span></label></div><div class="grid2"><label class="field"><span>Имя</span><input class="input" id="tr-name" name="name" aria-describedby="te-name" value="${esc(tr.name||store.get('user',null)?.name||'')}" autocomplete="section-contact name" autocapitalize="words" enterkeyhint="next" required minlength="2"><small class="err" id="te-name" aria-live="polite"></small></label><label class="field"><span>Телефон *</span><input class="input" id="tr-phone" name="tel" aria-describedby="te-phone" value="${esc(tr.phone)}" type="tel" inputmode="tel" autocomplete="section-contact tel" enterkeyhint="next" placeholder="+7 900 000-00-00" required><small class="err" id="te-phone" aria-live="polite"></small></label></div><label class="field"><span>Как связаться с вами *</span><select class="input" id="tr-via" name="messenger" autocomplete="off" required aria-describedby="te-via"><option value="">Выберите способ связи</option>${['WhatsApp','Telegram','MAX'].map(v=>`<option value="${v}" ${tr.via===v?'selected':''}>${v}</option>`).join('')}</select><small class="err" id="te-via" aria-live="polite"></small></label><label class="field"><span>Номер рейса / поезда · необязательно</span><input class="input" id="tr-flight" name="flight" autocomplete="off" autocapitalize="characters" maxlength="120" value="${esc(tr.flight)}" placeholder="Например: SU 1120"></label><p id="tr-error" class="err" role="alert"></p><div class="total"><span>Стоимость</span><b class="num">${transferPriceLabel()}</b></div><button class="btn btn-accent block" type="submit">Заказать трансфер</button></form>`}
function captureTransferFields(){if(uxRestoringDraft)return;for(const [key,id]of [['name','tr-name'],['phone','tr-phone'],['via','tr-via'],['address','tr-address'],['hotel','tr-hotel'],['flight','tr-flight']]){const el=$('#'+id);if(el)tr[key]=el.value}}
function keepTr(fn){captureTransferFields();fn()}

function tourGalleryHTML(pics){return `<div class="gallery tour-gallery" style="--gallery-rows:${Math.max(1,pics.length-1)}">${pics.map((p,i)=>`<button type="button" data-lb="${i}" ${i===0?'data-gallery-main':'data-gallery-thumb'} aria-label="Открыть фото ${i+1}"><img src="${esc(p)}" alt="Фото экскурсии ${i+1}">${i===0?`<img class="gallery-preview" alt="" aria-hidden="true"><span class="count">${pics.length} фото</span>`:''}</button>`).join('')}</div>`}
function previewTourPhoto(button,show){const gallery=button.closest('.tour-gallery'),main=$('[data-gallery-main]',gallery),preview=$('.gallery-preview',main);if(!main||!preview)return;if(show){preview.src=$('img',button).src;preview.classList.add('on');main.dataset.lb=button.dataset.lb;main.setAttribute('aria-label','Открыть фото '+(Number(button.dataset.lb)+1))}else{preview.classList.remove('on');main.dataset.lb='0';main.setAttribute('aria-label','Открыть фото 1')}}
document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const button=e.target.closest('[data-gallery-thumb]');if(button&&!button.contains(e.relatedTarget))previewTourPhoto(button,true)});
document.addEventListener('pointerout',e=>{if(e.pointerType!=='mouse')return;const button=e.target.closest('[data-gallery-thumb]');if(button&&!button.contains(e.relatedTarget))previewTourPhoto(button,false)});
document.addEventListener('focusin',e=>{const button=e.target.closest('[data-gallery-thumb]');if(button)previewTourPhoto(button,true)});
document.addEventListener('focusout',e=>{const button=e.target.closest('[data-gallery-thumb]');if(button)previewTourPhoto(button,false)});

/* ---------- Lightbox ---------- */
function lightbox(pics,i){
 if(!pics.length)return;i=((Number(i)||0)%pics.length+pics.length)%pics.length;
 const lb=document.createElement('div');lb.className='lightbox photo-lightbox';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Фото');
 const n=pics.length;
 const draw=()=>{lb.innerHTML=`<div class="lb-top"><span class="num">${i+1} / ${n}</span><button class="circle" type="button" data-lbx aria-label="Закрыть">✕</button></div><div class="lb-img"><img src="${esc(pics[i])}" alt="Фото ${i+1}"></div><div class="lb-nav" ${n<2?'hidden':''}><button class="circle lb-prev" type="button" data-lbn="-1" aria-label="Предыдущее">${ICON.left}</button><button class="circle lb-next" type="button" data-lbn="1" aria-label="Следующее">${ICON.right}</button></div>`;$('[data-lbx]',lb).focus()};
 const close=()=>{lb.remove();document.removeEventListener('keydown',key)};
 const key=e=>{if(e.key==='Escape')close();if(e.key==='ArrowRight'){i=(i+1)%n;draw()}if(e.key==='ArrowLeft'){i=(i-1+n)%n;draw()}};
 lb.addEventListener('click',e=>{if(e.target.closest('[data-lbx]')||e.target===lb)return close();const b=e.target.closest('[data-lbn]');if(b){i=(i+Number(b.dataset.lbn)+n)%n;draw();return}const image=$('.lb-img img',lb);if(!e.target.closest('img,button')||photoBackdropClick(e,image))close()});
 let x0=null;lb.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});lb.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){i=(i+(dx<0?1:-1)+n)%n;draw()}x0=null});
 document.addEventListener('keydown',key);document.body.appendChild(lb);draw();
}

/* ---------- Tourist account ---------- */
let acc={tab:'email',step:'id',val:'',rate:5,photo:''};
function renderAuth(){
 const el=$('#authBox');if(!el)return;
 if(acc.step==='id'){const em=acc.tab==='email';el.innerHTML=`<div style="display:grid;gap:6px"><h1 id="h-auth" style="font-size:clamp(26px,4vw,32px)">Вход для туристов</h1><p class="sub">Оставляйте отзывы, ведите дневник путешествий и смотрите свои бронирования.</p></div>
  <div class="tabs" role="tablist" aria-label="Способ входа"><button type="button" role="tab" data-tab="email" aria-selected="${em}">Почта</button><button type="button" role="tab" data-tab="phone" aria-selected="${!em}">Телефон</button></div>
  <form id="authForm" novalidate style="display:grid;gap:14px">
   <label class="field"><span>${em?'Электронная почта':'Номер телефона'}</span><input class="input" id="au-id" ${em?'type="email" autocomplete="email" placeholder="name@mail.ru"':'type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 940 000-00-00"'} value="${esc(acc.val)}"><small class="err" id="e-au"></small></label>
   <button class="btn btn-accent block" type="submit">Получить код</button>
  </form>`;return}
 el.innerHTML=`<div style="display:grid;gap:6px"><h1 id="h-auth" style="font-size:clamp(26px,4vw,32px)">Введите код</h1><p class="sub">Код для ${esc(acc.val)} · <button type="button" class="linkbtn" style="color:var(--sea)" data-au-back>изменить</button></p></div>
  <form id="codeForm" novalidate style="display:grid;gap:14px">
   <label class="field"><span>Код из 4 цифр</span><input class="input code-in" id="au-code" inputmode="numeric" maxlength="4" autocomplete="one-time-code"><small class="err" id="e-code"></small></label>
   <label class="field"><span>Как вас зовут</span><input class="input" id="au-name" autocomplete="name"><small class="err" id="e-an"></small></label>
   <p class="hint">Прототип: код пока никуда не отправляется, подойдут любые 4 цифры. Отправка SMS и писем заработает после подключения сервера.</p>
   <button class="btn btn-accent block" type="submit">Войти</button>
  </form>`;
 setTimeout(()=>{const c=$('#au-code');if(c)c.focus()},50);
}
function accountView(){
 const u=store.get('user',null);
 if(!u){app.innerHTML=`<div class="wrap"><nav class="crumbs" aria-label="Навигация"><a href="#/">Главная</a><span>/</span><span>Вход</span></nav><section class="auth" id="authBox" aria-labelledby="h-auth"></section></div>`;renderAuth();return}
 const books=store.get('bookings',[]),revs=store.get('reviews',[]).filter(r=>isMine(r.uid,u)),dia=store.get('diary',[]).filter(r=>isMine(r.uid,u));
 app.innerHTML=`<div class="wrap">
  <nav class="crumbs" aria-label="Навигация"><a href="#/">Главная</a><span>/</span><span>Профиль</span></nav>
  <div class="acc-head"><div class="who"><span class="avatar" ${profileTarget(u.id)}>${u.avatar?`<img src="${esc(u.avatar)}" alt="Ваш аватар">`:esc(u.name[0])}</span><div><h1 style="font-size:clamp(24px,4vw,34px)">Здравствуйте, <span ${profileTarget(u.id)}>${esc(u.name)}</span></h1><p class="sub">${esc(u.email||u.phone)}${u.authKind==='test'?' · тестовый аккаунт':''}</p></div></div><div class="account-actions"><button class="btn btn-sea small" type="button" data-edit-profile>Редактировать</button><button class="btn btn-ghost small" type="button" data-logout>Выйти</button></div></div>
  <div class="acc-grid">
   <details class="panel account-section"><summary><span>Мои отзывы</span><small>${revs.length}</small></summary><div class="account-section-content"><details class="account-compose"><summary>Оставить отзыв</summary>
    <form id="revForm" novalidate style="display:grid;gap:14px">
     <label class="field"><span>Экскурсия</span><select class="input" id="rv-tour">${C.tours.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></label>
     <div class="review-details"><div class="field"><span id="rv-date-label">Дата экскурсии</span><input id="rv-date" type="hidden"><button class="input sbtn" id="rv-date-btn" type="button" data-pop-open="reviewdate" aria-haspopup="dialog" aria-expanded="false" aria-labelledby="rv-date-label rv-date-value">${ICON.cal}<b id="rv-date-value">Выберите дату</b>${ICON.chev}</button></div><label class="field"><span>Номер бронирования</span><input class="input" id="rv-booking" required maxlength="100" placeholder="AT-…"></label></div><p class="review-note">Номер указан в разделе «Мои бронирования».</p><p class="hint">Отзыв публикуется после проверки вашего бронирования, даты и подтверждения организатором.</p>
     <div class="field"><span>Оценка</span><div class="rate" role="radiogroup" aria-label="Оценка">${[1,2,3,4,5].map(n=>`<button type="button" role="radio" data-rate="${n}" aria-checked="${n===acc.rate}" aria-label="${n} из 5" class="${n<=acc.rate?'on':''}">★</button>`).join('')}</div></div>
     <label class="field"><span>Ваш отзыв</span><textarea class="input" id="rv-text" placeholder="Что понравилось, что стоит знать другим путешественникам"></textarea><small class="err" id="e-rv"></small></label>
     <button class="btn btn-accent" type="submit">Опубликовать отзыв</button>
    </form></details>
    ${revs.length?`<h3>Мои отзывы</h3><div class="acc-list">${revs.map(r=>`<div class="entry"><header><b>${esc((tourById(r.t)||{}).title||'')}</b><button class="linkbtn" type="button" data-del-rev="${r.id}">Удалить</button></header><span class="stars">${'★'.repeat(r.r)}${'☆'.repeat(5-r.r)}</span><p>${esc(r.x)}</p><small>${esc(r.d)}</small></div>`).join('')}</div>`:''}
   </div></details>
   <details class="panel account-section"><summary><span>Мои истории</span><small>${dia.length}</small></summary><div class="account-section-content"><details class="account-compose"><summary>Написать историю</summary><p class="hint">Истории публикуются после проверки модератором. Истории и материалы сохраняются на сервере.</p>
    <form id="diaForm" novalidate style="display:grid;gap:14px">
     <label class="field"><span>Заголовок</span><input class="input" id="dw-title" maxlength="90" placeholder="Например: Рассвет на Рице"><small class="err" id="e-dt"></small></label>
     <label class="field"><span>История</span><textarea class="input" id="dw-text" rows="5" placeholder="Где были, что увидели, что посоветуете"></textarea><small class="err" id="e-dx"></small></label>
     <label class="field"><span>Фото (необязательно)</span><input class="input" id="dw-photo" type="file" accept="image/*"></label>
     <img class="preview-img" id="dw-prev" alt="" ${acc.photo?`src="${acc.photo}"`:'hidden'}>
     <button class="btn btn-accent" type="submit">Отправить на модерацию</button>
    </form></details>
    ${dia.length?`<h3>Мои записи</h3><div class="acc-list">${dia.map(d=>`<div class="entry"><header><b>${esc(d.t)}</b><button class="linkbtn" type="button" data-del-dia="${d.id}">Удалить</button></header><p>${esc(d.x)}</p><small><span ${profileTarget(d.uid)}>${esc(d.a)}</span> · ${storyStatus(d)}</small></div>`).join('')}</div>`:''}
   </div></details>
   ${myOrdersSectionHTML()}
  </div></div>`;
}
function profileFormHTML(u){return `<form id="profileForm" class="profile-form">
    <div class="profile-photo"><span class="avatar profile-avatar" id="profile-preview">${u.avatar?`<img src="${esc(u.avatar)}" alt="Ваш аватар">`:esc(u.name[0])}</span><label class="field"><span>Аватарка</span><input class="input" type="file" id="profile-photo" accept="image/jpeg,image/png,image/webp"><small class="hint">JPG, PNG или WebP до 10 МБ</small></label></div>
    <div class="profile-fields"><label class="field">Имя<input class="input" name="name" value="${esc(u.name)}" required minlength="2" maxlength="100" autocomplete="name"></label><label class="field">Город, откуда вы<input class="input" name="city" value="${esc(u.city||'')}" maxlength="100" autocomplete="address-level2" placeholder="Например, Москва"></label><label class="field profile-about">О себе<textarea class="input" name="about" rows="3" maxlength="1500" placeholder="Расскажите немного о себе и своих путешествиях">${esc(u.about||'')}</textarea></label></div>
    <div class="profile-actions"><button class="btn btn-sea" type="submit">Сохранить</button><span class="hint" id="profile-status" role="status" aria-live="polite"></span></div>
   </form>`}

function accClick(e){
 const tb=e.target.closest('[data-tab]');if(tb){acc.tab=tb.dataset.tab;acc.val='';renderAuth();$('#au-id').focus();return true}
 if(e.target.closest('[data-au-back]')){acc.step='id';renderAuth();return true}
 if(e.target.closest('[data-logout]')){store.del('user');acc={tab:'email',step:'id',val:'',rate:5,photo:''};syncAcc();accountView();return true}
 const rt=e.target.closest('[data-rate]');if(rt){acc.rate=Number(rt.dataset.rate);$$('[data-rate]').forEach(b=>{const n=Number(b.dataset.rate);b.classList.toggle('on',n<=acc.rate);b.setAttribute('aria-checked',n===acc.rate)});return true}
 const dr=e.target.closest('[data-del-rev]');if(dr){store.set('reviews',store.get('reviews',[]).filter(r=>r.id!==dr.dataset.delRev));if(current==='admin')route();else accountView();return true}
 const dd=e.target.closest('[data-del-dia]');if(dd){store.set('diary',store.get('diary',[]).filter(r=>r.id!==dd.dataset.delDia));if(current==='admin')route();else accountView();return true}
 return false;
}
function accSubmit(f){
 const err=(id,el,msg)=>{$(id).textContent=msg;if(el){el.classList.toggle('invalid',!!msg);if(msg)el.focus()}return !msg};
 if(f.id==='authForm'){const v=$('#au-id').value.trim();const ok=acc.tab==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v):phoneOk(v);
  if(!err('#e-au',$('#au-id'),ok?'':(acc.tab==='email'?'Проверьте адрес почты, например name@mail.ru.':'Нужен номер из 10–11 цифр.')))return true;
  acc.val=v;acc.step='code';renderAuth();return true}
 if(f.id==='codeForm'){const c=$('#au-code').value.trim(),n=$('#au-name').value.trim();
  if(!err('#e-code',$('#au-code'),/^\d{4}$/.test(c)?'':'Введите 4 цифры.'))return true;
  if(!err('#e-an',$('#au-name'),n.length>=2?'':'Как к вам обращаться?'))return true;
  store.set('user',{id:'u'+hash(acc.val.toLowerCase()),name:n,[acc.tab]:acc.val});acc.step='id';syncAcc();accountView();scrollTo(0,0);return true}
 const u=store.get('user',null);if(!u)return false;
 if(f.id==='revForm'){const x=$('#rv-text').value.trim();if(!err('#e-rv',$('#rv-text'),x.length>=10?'':'Напишите хотя бы пару предложений.'))return true;
  const list=store.get('reviews',[]);list.unshift({id:'r'+Date.now(),uid:u.id,n:u.name,c:u.city||'',t:$('#rv-tour').value,r:acc.rate,d:monthNow(),x});store.set('reviews',list);acc.rate=5;accountView();toast('Отзыв опубликован');return true}
 if(f.id==='diaForm'){const t=$('#dw-title').value.trim(),x=$('#dw-text').value.trim();
  if(!err('#e-dt',$('#dw-title'),t.length>=3?'':'Добавьте заголовок.'))return true;
  if(!err('#e-dx',$('#dw-text'),x.length>=20?'':'Расскажите чуть подробнее.'))return true;
  const list=store.get('diary',[]);list.unshift({id:'d'+Date.now(),uid:u.id,t,x,a:u.name+', '+monthNow(),img:acc.photo||'',scene:['mountains',hash(t)%3],status:'pending',submittedAt:new Date().toISOString(),views:0,ratings:{},comments:[]});
  if(!store.set('diary',list)){list[0].img='';store.set('diary',list);toast('Фото слишком большое, запись сохранена без него')}else toast('История отправлена на модерацию');
  acc.photo='';accountView();return true}
 return false;
}

/* ---------- Install as an app (Add to Home Screen) ---------- */
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function phone(inner,dark){return `<svg class="phone" viewBox="0 0 240 480" role="img" aria-hidden="true"><rect x="4" y="4" width="232" height="472" rx="38" fill="#1b2326"/><rect x="12" y="12" width="216" height="456" rx="31" fill="${dark?'#0f1d22':'#ffffff'}"/><g clip-path="url(#scr)">${inner}</g><rect x="88" y="20" width="64" height="18" rx="9" fill="#1b2326"/><defs><clipPath id="scr"><rect x="12" y="12" width="216" height="456" rx="31"/></clipPath></defs></svg>`}
const tap=(x,y)=>`<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#ec7f1c" stroke-width="3"/><circle cx="${x}" cy="${y}" r="26" fill="#ec7f1c" opacity=".18"><animate attributeName="r" values="18;28;18" dur="1.6s" repeatCount="indefinite"/></circle>`;
function sitePreview(top){return `<rect x="12" y="${top}" width="216" height="28" fill="#fff"/><rect x="22" y="${top+7}" width="14" height="14" rx="4" fill="#0d5c62"/><rect x="40" y="${top+10}" width="54" height="8" rx="4" fill="#10302c"/><rect x="22" y="${top+36}" width="196" height="120" rx="14" fill="#2a7d87"/><path d="M22 ${top+130} l40-34 26 20 22-14 44 28 64-30 v56 H22z" fill="#1b4b45"/><rect x="34" y="${top+60}" width="120" height="12" rx="6" fill="#fff"/><rect x="34" y="${top+78}" width="90" height="8" rx="4" fill="#cfe9ec"/><rect x="22" y="${top+166}" width="196" height="40" rx="12" fill="#f1f6f5"/><rect x="22" y="${top+214}" width="94" height="90" rx="12" fill="#e7efee"/><rect x="124" y="${top+214}" width="94" height="90" rx="12" fill="#e7efee"/>`}
function homeScreen(label){const icons=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++){const x=30+c*48,y=70+r*64;if(r===2&&c===1)continue;icons.push(`<rect x="${x}" y="${y}" width="36" height="36" rx="10" fill="rgba(255,255,255,.35)"/><rect x="${x+4}" y="${y+42}" width="28" height="5" rx="2.5" fill="rgba(255,255,255,.5)"/>`)}
 return `<rect x="12" y="12" width="216" height="456" fill="url(#wall)"/><defs><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5aa9b5"/><stop offset="1" stop-color="#f0a35e"/></linearGradient></defs>${icons.join('')}<image href="${APP_ICON}" x="78" y="198" width="36" height="36" clip-path="inset(0 round 10px)"/><text x="96" y="248" text-anchor="middle" font-size="8" font-weight="600" fill="#fff" font-family="Manrope,sans-serif">${esc(label)}</text>${tap(96,216)}<rect x="24" y="404" width="192" height="52" rx="20" fill="rgba(255,255,255,.3)"/>`}
function installSteps(os){
 const name=C.site.name;
 if(os==='ios')return [
  [phone(sitePreview(44)+`<rect x="12" y="404" width="216" height="64" fill="#f7f7f8"/><rect x="24" y="412" width="192" height="22" rx="11" fill="#e9eaec"/><text x="120" y="427" text-anchor="middle" font-size="8.5" fill="#555" font-family="Manrope,sans-serif">apsua-tour</text><path d="M40 448l-6 5 6 5M64 448l6 5-6 5" stroke="#0a84ff" stroke-width="2" fill="none" stroke-linecap="round"/><g transform="translate(112 441)"><path d="M8 2v12M3 7l5-5 5 5" stroke="#0a84ff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10v8h10v-8" stroke="#0a84ff" stroke-width="2" fill="none" stroke-linejoin="round"/></g><rect x="156" y="444" width="14" height="14" rx="3" stroke="#0a84ff" stroke-width="2" fill="none"/><circle cx="196" cy="451" r="2" fill="#0a84ff"/><circle cx="202" cy="451" r="2" fill="#0a84ff"/><circle cx="190" cy="451" r="2" fill="#0a84ff"/>`+tap(120,451)),'Откройте сайт в Safari','Нажмите кнопку «Поделиться» — квадрат со стрелкой вверх. Если её не видно, нажмите «•••» рядом с адресной строкой, затем «Поделиться».'],
  [phone(sitePreview(44)+`<rect x="12" y="12" width="216" height="456" fill="rgba(0,0,0,.35)"/><rect x="12" y="214" width="216" height="254" rx="18" fill="#f2f2f7"/><rect x="104" y="222" width="32" height="4" rx="2" fill="#c7c7cc"/>${[['Скопировать',0],['Добавить в «Избранное»',0],['На экран «Домой»',1],['Добавить в Заметки',0]].map(([t,h],i)=>`<rect x="24" y="${244+i*44}" width="192" height="38" rx="10" fill="${h?'#fff':'#fff'}" stroke="${h?'#ec7f1c':'none'}" stroke-width="2"/><text x="36" y="${268+i*44}" font-size="10" font-weight="${h?700:500}" fill="#111" font-family="Manrope,sans-serif">${t}</text>${h?`<rect x="190" y="${253+i*44}" width="16" height="16" rx="4" stroke="#111" stroke-width="1.6" fill="none"/><path d="M198 ${257+i*44}v8M194 ${261+i*44}h8" stroke="#111" stroke-width="1.6"/>`:''}`).join('')}`+tap(176,351)),'Выберите «На экран «Домой»»','Пролистайте меню вниз и нажмите «На экран «Домой»». В новых версиях iOS пункт может быть в разделе «Ещё».'],
  [phone(`<rect x="12" y="12" width="216" height="456" fill="#f2f2f7"/><text x="22" y="66" font-size="8" fill="#0a84ff" font-family="Manrope,sans-serif">Отменить</text><text x="120" y="66" text-anchor="middle" font-size="7.5" font-weight="700" fill="#111" font-family="Manrope,sans-serif">На экран «Домой»</text><text x="218" y="66" text-anchor="end" font-size="8" font-weight="700" fill="#0a84ff" font-family="Manrope,sans-serif">Добавить</text><rect x="24" y="88" width="192" height="64" rx="12" fill="#fff"/><image href="${APP_ICON}" x="34" y="98" width="44" height="44" clip-path="inset(0 round 11px)"/><text x="88" y="116" font-size="11" font-weight="600" fill="#111" font-family="Manrope,sans-serif">${esc(name)}</text><rect x="88" y="126" width="110" height="1" fill="#ddd"/><text x="88" y="141" font-size="8" fill="#888" font-family="Manrope,sans-serif">apsua-tour</text>`+tap(196,62)),'Нажмите «Добавить»','Проверьте название — «'+name+'» — и нажмите «Добавить» в правом верхнем углу.'],
  [phone(homeScreen(name),true),'Готово!','На экране «Домой» появилась иконка. Открывайте сайт с неё — он запустится на весь экран, как приложение.']
 ];
 return [
  [phone(`<rect x="12" y="12" width="216" height="72" fill="#f1f3f4"/><rect x="22" y="48" width="170" height="26" rx="13" fill="#fff"/><text x="36" y="65" font-size="9" fill="#555" font-family="Manrope,sans-serif">apsua-tour</text><circle cx="208" cy="54" r="2.2" fill="#333"/><circle cx="208" cy="61" r="2.2" fill="#333"/><circle cx="208" cy="68" r="2.2" fill="#333"/>`+sitePreview(84)+tap(208,61)),'Откройте сайт в Chrome','Нажмите на три точки ⋮ в правом верхнем углу браузера.'],
  [phone(`<rect x="12" y="12" width="216" height="72" fill="#f1f3f4"/>`+sitePreview(84)+`<rect x="92" y="44" width="130" height="200" rx="10" fill="#fff" stroke="#ddd"/>${['Новая вкладка','История','Скачанные файлы','Добавить на гл. экран','Настройки'].map((t,i)=>`<text x="104" y="${70+i*36}" font-size="9" font-weight="${i===3?700:500}" fill="#111" font-family="Manrope,sans-serif">${t}</text>`).join('')}<rect x="96" y="${50+3*36}" width="122" height="30" rx="8" fill="none" stroke="#ec7f1c" stroke-width="2"/>`+tap(160,166)),'«Добавить на главный экран»','Выберите «Добавить на главный экран» или «Установить приложение» — название зависит от версии Chrome.'],
  [phone(sitePreview(44)+`<rect x="12" y="12" width="216" height="456" fill="rgba(0,0,0,.35)"/><rect x="28" y="170" width="184" height="140" rx="18" fill="#fff"/><text x="44" y="198" font-size="11" font-weight="700" fill="#111" font-family="Manrope,sans-serif">Установить приложение?</text><image href="${APP_ICON}" x="44" y="212" width="36" height="36" clip-path="inset(0 round 18px)"/><text x="90" y="234" font-size="10" font-weight="600" fill="#111" font-family="Manrope,sans-serif">${esc(name)}</text><text x="130" y="290" font-size="10" fill="#0d5c62" font-family="Manrope,sans-serif">Отмена</text><text x="172" y="290" font-size="10" font-weight="700" fill="#0d5c62" font-family="Manrope,sans-serif">Установить</text>`+tap(196,286)),'Подтвердите установку','Нажмите «Установить» (или «Добавить»).'],
  [phone(homeScreen(name),true),'Готово!','Иконка появится на главном экране и в списке приложений. Сайт откроется на весь экран.']
 ];
}
function installView(){
 const os=ui.instOs||(isIOS()?'ios':(/android/i.test(navigator.userAgent)?'android':'ios'));ui.instOs=os;
 app.innerHTML=`<div class="wrap">${pageHead('Приложение','Приложение',C.site.name+' на экране «Домой»','Сайт открывается как обычное приложение: со своей иконкой, на весь экран, без адресной строки. Скачивать из App Store или Google Play ничего не нужно.')}
  ${isStandalone()?`<div class="hint" style="margin-top:18px">Вы уже открыли сайт как приложение — всё работает.</div>`:''}
  <div class="benefits"><div class="glass"><img src="${APP_ICON}" alt="" width="44" height="44"><b>Своя иконка</b><span>Рядом с остальными приложениями</span></div><div class="glass"><span class="bi">⤢</span><b>На весь экран</b><span>Без панелей браузера</span></div><div class="glass"><span class="bi">♥</span><b>Всё под рукой</b><span>Избранное, брони и дневник</span></div></div>
  <div class="inst-top"><div class="tabs inst-tabs" role="tablist"><button type="button" role="tab" data-inst="ios" aria-selected="${os==='ios'}">iPhone и iPad</button><button type="button" role="tab" data-inst="android" aria-selected="${os==='android'}">Android</button></div></div>
  <ol class="inst-steps">${installSteps(os).map(([svg,t,x],i)=>`<li class="glass"><div class="inst-pic">${svg}</div><div class="inst-txt"><span class="inst-n">${i+1}</span><b>${esc(t)}</b><p>${esc(x)}</p></div></li>`).join('')}</ol>
  <p class="sub" style="margin-top:20px">${os==='ios'?'На iPhone установка работает только из Safari. Если сайт открыт в другом браузере или внутри Telegram, сначала откройте его в Safari.':'Если пункта нет, обновите Chrome. В Яндекс Браузере: меню ≡ → «Добавить ярлык».'}</p>
 </div>`;
}

/* ---------- Admin panel ---------- */
/* build 172: the admin panel is in admin-app.js. It is downloaded only when someone opens /#/admin and runs
   inside this file's scope, so it uses the same C, api, esc… as before. The rest of the site reaches it only
   through adminApp. Visitors never download it. */
let adminApp=null,adminAppLoading=null;
function loadAdminApp(){
 if(adminApp)return Promise.resolve(adminApp);
 return adminAppLoading||(adminAppLoading=fetch('/admin-app.js?v=172',{credentials:'same-origin'}).then(r=>{if(!r.ok)throw new Error('admin-app.js: HTTP '+r.status);return r.text()}).then(runAdminApp).catch(err=>{adminAppLoading=null;throw err}));
}
function runAdminApp(adminAppSource){eval(adminAppSource);return adminApp}
function openAdmin(parts){
 if(adminApp)return adminApp.view(parts);
 app.innerHTML='<div class="wrap section" role="status"><p class="sub">Загружаю админку…</p></div>';
 loadAdminApp().then(()=>{if(current==='admin'&&parseHash().parts[0]==='admin')adminApp.view(parseHash().parts)}).catch(()=>{if(current==='admin')app.innerHTML='<div class="wrap section" role="alert"><p class="sub">Не удалось загрузить админку. Проверьте связь и обновите страницу.</p></div>'});
}
const isAdmin=()=>sess.get('admin')==='1';
function getPath(o,p){return p.split('.').reduce((a,k)=>a==null?a:a[k],o)}
function admStatus(t,bad){const s=$('#admStatus');if(s){s.textContent=t;s.classList.toggle('bad',!!bad)}}
const F={
 text:(k,label,ph='')=>`<label class="field"><span>${label}</span><input class="input" data-k="${k}" value="${esc(getPath(C,k))}" placeholder="${esc(ph)}"></label>`,
 num:(k,label,step='1')=>`<label class="field"><span>${label}</span><input class="input num" type="number" step="${step}" data-k="${k}" data-t="num" value="${esc(getPath(C,k))}"></label>`,
 area:(k,label,rows=3,ph='')=>`<label class="field"><span>${label}</span><textarea class="input" rows="${rows}" data-k="${k}" placeholder="${esc(ph)}">${esc(getPath(C,k))}</textarea></label>`,
 lines:(k,label,rows=4,hint='Каждый пункт — с новой строки')=>`<label class="field"><span>${label} <em class="fh">${hint}</em></span><textarea class="input" rows="${rows}" data-k="${k}" data-t="lines">${esc(lines(getPath(C,k)).join('\n'))}</textarea></label>`,
 bool:(k,label)=>`<label class="switch"><input type="checkbox" data-k="${k}" data-t="bool" ${getPath(C,k)?'checked':''}><i></i><span>${label}</span></label>`,
 select:(k,label,opts)=>`<label class="field"><span>${label}</span><select class="input" data-k="${k}">${opts.map(([v,t])=>`<option value="${esc(v)}" ${String(getPath(C,k))===String(v)?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`,
 photo:(k,label,scene,note='')=>{const v=getPath(C,k);const s=src(v,scene,600,400);return `<div class="field"><span>${label}</span><div class="slot" data-drop="${k}"><div class="slot-img">${s?`<img src="${s}" alt="">`:'<span>Нет фото</span>'}${v?'':'<em>Заглушка</em>'}</div><div class="slot-act"><label class="btn btn-sea small">${ICON.img}Загрузить<input type="file" accept="image/*" data-photo="${k}" hidden></label>${v?`<button type="button" class="btn btn-ghost small" data-photo-clear="${k}">Убрать</button>`:''}<small>или перетащите файл сюда${note?'. '+note:''}</small></div></div></div>`}
};
const card=(title,body,extra='')=>`<section class="adm-card"><header><h3>${title}</h3>${extra}</header><div class="adm-body">${body}</div></section>`;
function newId(p){return p+Date.now().toString(36)+Math.floor(Math.random()*1e3)}

async function storePhoto(file,max){return new Promise(res=>readPhoto(file,max,async d=>{if(!d)return res('');const key=newId('p');const ok=await idb.put(key,d);res(ok?'img:'+key:d)}))}

/* ---------- Events ---------- */
document.addEventListener('click',e=>{
 if(popEl&&!popEl.contains(e.target)&&!e.target.closest('[data-pop-open]'))closePop();
 if(e.target.closest('.adm')&&adminApp?.click(e))return;
 if(accClick(e))return;
 const po=e.target.closest('[data-pop-open]');if(po){if(popEl&&popEl._btn===po){closePop();return}openPop(po,po.dataset.popOpen);return}
 const pcity=e.target.closest('[data-pick-departure]');if(pcity){ui.q.city=pcity.dataset.pickDeparture;ui.priceMin=null;ui.priceMax=null;closePop();refreshSearch();renderCards();syncPriceControls();syncCatalogHash();return}
 const pdis=e.target.closest('[data-pick-district]');if(pdis){ui.q.district=pdis.dataset.pickDistrict;closePop();refreshSearch();if(current==='catalog'){renderCards();syncCatalogHash()}else if(current==='home')renderCards();return}
 const pdt=e.target.closest('[data-pick-date]');if(pdt){pickDate(pdt.dataset.pickDate);return}
 const cn=e.target.closest('[data-cal]');if(cn){calShift(Number(cn.dataset.cal));return}
 const qp=e.target.closest('[data-q-people]');if(qp){ui.q.people=Math.max(1,Math.min(20,ui.q.people+Number(qp.dataset.qPeople)));refreshSearch();if(popEl?.dataset.kind==='people'){drawPop();popEl._btn=$('[data-pop-open="people"]')}if(current==='catalog'&&ui.q.date){renderCards()}syncCatalogHash();return}
 const sc=e.target.closest('[data-scroll]');if(sc){e.preventDefault();const t=document.getElementById(sc.dataset.scroll);if(t)t.scrollIntoView({behavior:reduce?'auto':'smooth'});return}
 const f=e.target.closest('[data-fav]');
 if(f){e.preventDefault();const id=f.dataset.fav;favs.has(id)?favs.delete(id):favs.add(id);syncFav();
  $$(`[data-fav="${id}"]`).forEach(b=>{const on=favs.has(id);b.setAttribute('aria-pressed',on);if(b.classList.contains('fav'))b.setAttribute('aria-label',on?'Убрать из избранного':'В избранное');else b.textContent=on?'♥ В избранном':'♡ В избранное'});
  if(ui.onlyFav)renderCards();return}
 const c=e.target.closest('[data-cat]');if(c){ui.cat=c.dataset.cat;syncChips();renderCards();syncCatalogHash();return}
 if(e.target.closest('[data-onlyfav]')){ui.onlyFav=!ui.onlyFav;syncChips();renderCards();return}
 if(e.target.closest('#resetPlace')){ui.q.district='';ui.q.city='';ui.q.format='';ui.q.date='';ui.onlyFav=current==='favorites';ui.cat='all';ui.priceMin=null;ui.priceMax=null;syncPriceControls();refreshSearch();syncChips();renderCards();syncCatalogHash();return}
 if(e.target.closest('#favBtn')){location.hash='#/favorites';return}
 const pb=e.target.closest('[data-pop]');if(pb){const box=$('#pop');box._go(popIdx+Number(pb.dataset.pop));box._restart();return}
 const pd=e.target.closest('[data-go]');if(pd){const box=$('#pop');box._go(Number(pd.dataset.go));box._restart();return}
 const gt=e.target.closest('[data-goto]');if(gt){location.hash=gt.dataset.goto;return}
 const dz=e.target.closest('[data-dist]');if(dz){mapLock={d:dz.dataset.dist,p:''};renderMapSide(dz.dataset.dist);if(matchMedia('(max-width:900px)').matches&&dz.closest('svg')){const s=$('#mapSide');if(s)s.scrollIntoView({behavior:'smooth',block:'start'})}return}
 const pin=e.target.closest('[data-pin]');if(pin){mapLock={d:PIN_DIST[pin.dataset.pin],p:pin.dataset.pin};renderMapSide(mapLock.d,mapLock.p);return}
 const lbb=e.target.closest('[data-lb]');if(lbb&&bk){lightbox(tourPics(bk.t),Number(lbb.dataset.lb));return}
 if(e.target.closest('#toBooking')){$('#booking').scrollIntoView({block:'start'});return}
 if(e.target.closest('[data-share]')&&bk){const url=location.href;if(navigator.share)navigator.share({title:bk.t.title,url}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(url).then(()=>toast('Ссылка скопирована'),()=>toast(url));return}
 const ins=e.target.closest('[data-inst]');if(ins){ui.instOs=ins.dataset.inst;installView();return}
 if(e.target.closest('[data-close-tab]')){store.set('installTabClosed',true);$('#installTab').hidden=true;return}
 if(bk){
  const day=e.target.closest('[data-day]');if(day){bk.date=day.dataset.day;bk.time=null;renderBooking();return}
  const tm=e.target.closest('[data-time]');if(tm){bk.time=tm.dataset.time;clampPeople();renderBooking();return}
  const st=e.target.closest('[data-step]');if(st){bk[st.dataset.step]+=Number(st.dataset.d);renderBooking();return}
  const a=e.target.closest('[data-bk]');if(a){const v=a.dataset.bk;if(v==='next'){bk.step='form';renderBooking();$('#booking').scrollIntoView({block:'start'});setTimeout(()=>{const n=$('#bk-name');if(n)n.focus({preventScroll:true})},50)}else if(v==='back'){bk.step='pick';renderBooking()}else if(v==='again'){bk.step='pick';bk.time=null;bk.date=null;renderBooking()}return}
 }
 const px=e.target.closest('[data-pax]');if(px){tr.pax+=Number(px.dataset.pax);keepTr(renderTransfer);return}
 if(e.target.closest('[data-tr="again"]')){tr.step='form';renderTransfer();return}
});
/* hover preview on the map (mouse devices): district or point shows its routes; leaving the map restores the clicked choice */
let mapLock=null,hovT=null;const canHover=matchMedia('(hover:hover) and (pointer:fine)');
document.addEventListener('pointerover',e=>{if(!canHover.matches||!e.target.closest)return;const box=e.target.closest('.map-box');if(!box)return;
 const pin=e.target.closest('[data-pin]'),dz=e.target.closest('.dist');if(!pin&&!dz)return;if(!mapLock)mapLock={d:ui.mapDist,p:ui.mapPin};
 clearTimeout(hovT);hovT=setTimeout(()=>{if(pin)renderMapSide(PIN_DIST[pin.dataset.pin],pin.dataset.pin);else if(dz.dataset.dist!==ui.mapDist||ui.mapPin)renderMapSide(dz.dataset.dist)},90)});
document.addEventListener('pointerout',e=>{if(!canHover.matches||!e.target.closest)return;const box=e.target.closest('.map-box');if(!box||box.contains(e.relatedTarget))return;clearTimeout(hovT);if(mapLock&&(mapLock.d!==ui.mapDist||mapLock.p!==ui.mapPin))renderMapSide(mapLock.d,mapLock.p)});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&popEl){const b=popEl._btn;closePop();if(b)b.focus();return}
 const el=e.target.closest&&e.target.closest('[data-goto],[data-pin],.dist');if(!el||!(e.key==='Enter'||e.key===' '))return;e.preventDefault();
 if(el.dataset.goto)location.hash=el.dataset.goto;else if(el.dataset.pin){mapLock={d:PIN_DIST[el.dataset.pin],p:el.dataset.pin};renderMapSide(mapLock.d,mapLock.p)}else{mapLock={d:el.dataset.dist,p:''};renderMapSide(el.dataset.dist)}
});
document.addEventListener('input',e=>{if(e.target.closest('.adm'))adminApp?.input(e);if(e.target.closest('#trForm'))captureTransferFields()});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.closest('.adm')){if(t.type==='file')adminApp?.file(t);else if(t.tagName==='SELECT'||t.type==='checkbox')adminApp?.input(e);return}
 if(t.id==='dw-photo'){const fl=t.files&&t.files[0];if(fl){storyPhotoBusy=true;readPhoto(fl,1200,d=>{storyPhotoBusy=false;acc.photo=d;const pv=$('#dw-prev');if(pv){if(d){pv.src=d;pv.hidden=false}else pv.hidden=true}})};return}
 if(t.id==='sort'){ui.sort=t.value;renderCards()}
 if(t.closest('#trForm')){
  captureTransferFields();
  // Autofill fires «change» for every filled field. Re-rendering the form in the middle of it made browsers
  // put values into the wrong fields (phone into the address) and closed the phone keyboard. Text fields only
  // update the state and the summary; structural controls still redraw the form.
  if(['tr-name','tr-phone','tr-address','tr-flight','tr-via'].includes(t.id)){if(typeof updateTransferReview==='function')updateTransferReview();if(typeof v4TransferBar==='function')v4TransferBar();return}
  if(t.id==='tr-hotel'){const hotel=transferHotels().find(x=>x.name===t.value);tr.hotel=t.value;if(hotel){tr.address=hotel.address;const address=$('#tr-address');if(address)address.value=hotel.address}if(typeof updateTransferReview==='function')updateTransferReview();if(typeof v4TransferBar==='function')v4TransferBar();return}
  if(t.name==='tr-direction'){tr.direction=t.value;if(tr.cls!=='group')tr.cls='individual'}if(t.id==='tr-from')tr.from=t.value;if(t.id==='tr-to'){tr.to=t.value;tr.hotel='';tr.address=''}if(t.id==='tr-hotel'){tr.hotel=t.value;const hotel=transferHotels().find(x=>x.name===t.value);if(hotel)tr.address=hotel.address}if(t.id==='tr-time')tr.time=t.value;if(t.id==='tr-seat')tr.seat=t.checked;
  if(t.name==='cls'){tr.cls=t.value;tr.pax=Math.min(tr.pax,trCls().max)}
  renderTransfer();
 }
});
/* drag & drop photos in the admin panel */
document.addEventListener('dragover',e=>{const z=e.target.closest&&e.target.closest('[data-drop],[data-drop-tour]');if(z){e.preventDefault();z.classList.add('drag')}});
document.addEventListener('dragleave',e=>{const z=e.target.closest&&e.target.closest('[data-drop],[data-drop-tour]');if(z)z.classList.remove('drag')});
document.addEventListener('drop',e=>{const z=e.target.closest&&e.target.closest('[data-drop],[data-drop-tour]');if(!z)return;e.preventDefault();z.classList.remove('drag');const files=[...e.dataTransfer.files].filter(f=>f.type.startsWith('image/'));if(!files.length)return;
 const fake={files,dataset:z.dataset.drop?{photo:z.dataset.drop}:{tphoto:z.dataset.dropTour},hasAttribute:()=>false};adminApp?.file(fake)});
document.addEventListener('submit',e=>{
 e.preventDefault();const f=e.target;
 if(accSubmit(f))return;
 if(f.id==='search'){location.hash='#/excursions'+qString();return}
 if(f.id==='search2'){renderCards();syncCatalogHash();$('#cards').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});return}
 if(f.id==='bkForm'){
  const n=$('#bk-name'),p=$('#bk-phone'),ok=$('#bk-ok');let good=true;
  const chk=(cond,el,errId,msg)=>{el.classList&&el.classList.toggle('invalid',!cond);$(errId).textContent=cond?'':msg;if(!cond&&good){el.focus();good=false}};
  chk(n.value.trim().length>=2,n,'#e-name','Введите имя, чтобы гид знал, кого встречать.');
  chk(phoneOk(p.value),p,'#e-phone','Нужен номер из 10–11 цифр, например +7 940 123-45-67.');
  chk(ok.checked,ok,'#e-ok','Отметьте согласие, без него мы не сможем связаться.');
  if(!good)return;
  bk.via=$('input[name="via"]:checked').value;bk.code=code('AT');bk.step='done';
  const saved=store.get('bookings',[]);saved.push({code:bk.code,tour:bk.t.id,date:bk.date,time:bk.time,adults:bk.adults,kids:bk.kids,name:n.value.trim(),phone:p.value.trim(),via:bk.via,city:departureCity,format:bk.kind,season:bk.seasonName,total:bkTotal(),priceUnit:bk.kind==='individual'?'group':'person',hotel:$('#bk-hotel').value,note:$('#bk-note').value});store.set('bookings',saved);
  renderBooking();$('#booking').scrollIntoView({block:'start'});return}
 if(f.id==='trForm'){
  const n=$('#tr-name'),p=$('#tr-phone');let good=true;
  n.classList.toggle('invalid',n.value.trim().length<2);$('#te-name').textContent=n.value.trim().length<2?'Введите имя для таблички.':'';
  p.classList.toggle('invalid',!phoneOk(p.value));$('#te-phone').textContent=phoneOk(p.value)?'':'Нужен номер из 10–11 цифр.';
  if(n.value.trim().length<2){n.focus();good=false}else if(!phoneOk(p.value)){p.focus();good=false}
  if(!good)return;tr.code=code('TR');tr.step='done';
  const saved=store.get('transfers',[]);saved.push({code:tr.code,route:trFrom().name+' → '+trTo().name,date:tr.date,time:tr.time,cls:trCls().name,pax:tr.pax,seat:tr.seat,name:n.value.trim(),phone:p.value.trim(),note:$('#tr-note').value,price:trPrice()});store.set('transfers',saved);
  renderTransfer();$('#trPanel').scrollIntoView({block:'start'});}
});

/* ---------- Router: every section has its own address ---------- */
const LEGACY={home:'/',catalog:'/excursions',transfer:'/transfer',map:'/map',reviews:'/reviews',diary:'/diary',favorites:'/favorites',account:'/account',popular:'/',install:'/install',admin:'/admin'};
function parseHash(){
 let h=decodeURIComponent(routeHash().slice(1));
 if(!h)h='/';
 if(h.startsWith('tour-'))h='/excursions/'+h.slice(5);else if(LEGACY[h])h=LEGACY[h];else if(!h.startsWith('/'))h='/';
 const [path,qs]=h.split('?');return {path,parts:path.split('/').filter(Boolean),q:Object.fromEntries(new URLSearchParams(qs||''))};
}
function applyQ(q){ui.q.city=String(q.city||'');ui.q.format=['group','individual'].includes(q.format)?q.format:'';ui.q.district=DMAP[q.district]?q.district:'';ui.q.date=/^\d{4}-\d\d-\d\d$/.test(q.date||'')&&fromIso(q.date)>=today0()?q.date:'';const p=Number(q.people);ui.q.people=p>=1&&p<=20?p:ui.q.people;ui.cat=CAT[q.cat]||q.cat==='short'?q.cat:'all';const b=priceBounds(),valid=v=>v!=null&&v!==''&&Number.isFinite(Number(v));ui.priceMin=valid(q.min)?Math.max(b.min,Math.min(b.max,Number(q.min))):null;ui.priceMax=valid(q.max)?Math.max(ui.priceMin??b.min,Math.min(b.max,Number(q.max))):null}
function setNav(k){$$('[data-nav]').forEach(a=>a.toggleAttribute('aria-current',false));$$('[data-m]').forEach(a=>a.toggleAttribute('aria-current',false));if(k)$$('[data-nav="'+k+'"],[data-m="'+k+'"]').forEach(a=>a.setAttribute('aria-current','page'))}
let current='',uxLastHash=routeHash();const uxScrollPositions=new Map();
function route(){
 const uxPrevious=current,uxDestination=routeHash();if(uxLastHash!==uxDestination){uxScrollPositions.set(uxLastHash,scrollY);uxLastHash=uxDestination}
 closeProfileEditor();
 closePop();mapLock=null;

 canonicalPublicURL();
 const {parts,q}=parseHash();const p0=parts[0]||'';
 if(!(p0==='excursions'&&parts[1])&&p0!=='admin')tourBackHash=routeHash()||'#/';
 const mb=$('#mbar');
 document.body.classList.toggle('is-admin',p0==='admin');
 if(!(p0==='excursions'&&parts[1])){mb.hidden=true;document.body.classList.remove('has-mbar');bk=null}
 const top=()=>{const y=uxPrevious==='tour'&&uxScrollPositions.has(uxDestination)?uxScrollPositions.get(uxDestination):0;scrollTo(0,y);updateCustomerOrdersBanner();if(y)requestAnimationFrame(()=>scrollTo(0,y))};
 if(p0==='fleet'){fleetPage();return}if(['about','contacts','contact'].includes(p0)){aboutFleetPage();return}if(p0==='orders'){current='orders';ordersView();setNav('account');top();return}if(p0==='compare'){compareView();top();return}if(p0==='pick'){pickerView();top();return}
 if(p0==='excursions'&&parts[1]){if(q.city||q.date){ui.q.city=String(q.city||'');ui.q.date=/^\d{4}-\d\d-\d\d$/.test(q.date||'')?q.date:''}current='tour';tourView(parts[1]);setNav('catalog');top();return}
 if(p0==='excursions'){applyQ(q);current='catalog';catalogView(false);if(window.ApsuaSearchPages)app.insertAdjacentHTML('beforeend',searchMoreHTML('Подробнее об экскурсиях',window.ApsuaSearchPages.excursionOverview(C)));setNav('catalog');top();return}
 if(p0==='favorites'){current='favorites';catalogView(true);setNav('favorites');top();return}
 if(p0==='transfer'){
  const search=window.ApsuaSearchPages,landing=parts[1]&&search?.resolve('/transfer/'+parts[1],C);
  if(parts[1]&&!landing){app.innerHTML='<div class="wrap section"><h1>Маршрут не найден</h1><a href="/transfer">Все трансферы</a></div>';top();return}
  const from=landing?.from||q.from,to=landing?.to||q.to;
  if(C.transfer.from.some(x=>x.id===from))tr.from=from;
  if(C.transfer.to.some(x=>x.id===to)){if(tr.to!==to){tr.hotel='';tr.address=''}tr.to=to;}
  if(landing)tr.direction='arrival';
  current='transfer';tr.step='form';transferView();
  if(landing){const h=$('h1',app);if(h)h.textContent=landing.title;app.insertAdjacentHTML('beforeend',searchMoreHTML('Подробнее о маршруте',landing.body))}
  else if(search)app.insertAdjacentHTML('beforeend',searchMoreHTML('Подробнее о трансфере',search.transferOverview(C)));
  setNav('transfer');top();return
 }
 if(p0==='excursions-from'){
  const landing=window.ApsuaSearchPages?.resolve('/excursions-from/'+parts[1],C);current='catalog';
  if(!landing){app.innerHTML='<div class="wrap section"><h1>Направление не найдено</h1><a href="/excursions">Все экскурсии</a></div>';setNav('catalog');top();return}
  // City pages from search show the real catalogue for that city; the search text stays below, folded.
  applyQ({city:landing.city});catalogView(false);const h=$('h1',app);if(h)h.textContent=landing.title;
  app.insertAdjacentHTML('beforeend',searchMoreHTML('Подробнее об экскурсиях из '+landing.from,landing.body));setNav('catalog');top();return
 }
 if(p0==='map'){current='map';mapView();setNav('map');top();return}
 if(p0==='reviews'){current='reviews';reviewsView();setNav('reviews');top();return}
 if(p0==='diary'){current='diary';diaryView();setNav('diary');top();return}
 if(p0==='account'){current='account';accountView();setNav('account');top();return}
 if(p0==='useful'){current='useful';usefulView(parts[1]);setNav('useful');top();return}
 if(p0==='install'){current='install';installView();setNav('install');top();return}
 if(p0==='admin'){current='admin';openAdmin(parts);setNav('');top();return}
 current='home';ui.onlyFav=false;homeView();setNav('home');top();
}
addEventListener('hashchange',route);

/* ---------- App-like install support ---------- */
(function pwa(){
 if(isStandalone())document.documentElement.classList.add('standalone');
})();

/* Integration of retained data and browser-local features into the supplied design. */
function validateTourSettings(tours){
 for(const t of tours){if(!t.seasons)continue;if(!Array.isArray(t.seasons)||!t.seasons.length)return 'Добавьте хотя бы один сезон';const dates=new Set();for(const s of t.seasons){
 if(!s||!Array.isArray(s.departures))return 'Укажите города выезда для сезона';
 const start=String(s.start||'').slice(-5),d=new Date('2000-'+start+'T12:00:00Z');if(!/^\d\d-\d\d$/.test(start)||!Number.isFinite(+d)||d.toISOString().slice(5,10)!==start)return 'Укажите корректную дату начала сезона';
 if(s.end){const end=String(s.end).slice(-5),last=new Date('2000-'+end+'T12:00:00Z');if(!/^\d\d-\d\d$/.test(end)||!Number.isFinite(+last)||last.toISOString().slice(5,10)!==end)return 'Укажите корректную дату окончания сезона'}
 if(dates.has(start))return 'Даты начала сезонов должны различаться';dates.add(start);
 if(!['group','individual','both','closed'].includes(s.mode))return 'Выберите формат сезона';
 const cities=new Set();for(const city of s.departures||[]){if(!city||!Array.isArray(city.times))return 'Укажите расписание выезда';const name=String(city.city||'').trim();if(!name)return 'Укажите город выезда';if(cities.has(name.toLowerCase()))return 'Город повторяется в одном сезоне: '+name;cities.add(name.toLowerCase());
 for(const key of ['adult','child','individualPrice'])if(city[key]!=null&&city[key]!==''&&(!Number.isFinite(Number(city[key]))||Number(city[key])<0))return 'Цена должна быть неотрицательным числом';
 if(!Number.isInteger(Number(city.maxPeople))||Number(city.maxPeople)<1||Number(city.maxPeople)>100)return 'Количество гостей: целое число от 1 до 100';
 if((city.times||[]).some(time=>!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)))return 'Укажите время в формате ЧЧ:ММ, каждое с новой строки';
 }} }return '';
}

/* City and annually recurring season offers. Legacy records are read without mutation. */
function tourSeasons(t){
 if(Array.isArray(t.seasons)&&t.seasons.length)return t.seasons;
 const cities=Object.entries(t.cities||{}).filter(([,p])=>p&&typeof p==='object');if(!cities.length)cities.push(['Сухум',{adult:t.price,child:t.kid}]);
 return ['summer','winter'].map((id,i)=>({id,name:i?'Зимний сезон':'Летний сезон',start:i?'11-01':'05-01',mode:t[id]===false?'closed':(/индивидуаль/i.test(t.format||'')?'individual':'group'),departures:cities.map(([city,p])=>({city,enabled:true,adult:Number(p.adult??t.price)||0,child:Number(p.child??t.kid)||0,times:String(t[id+'Times']||t.times?.join(',')||'').split(/[,\n]/).map(x=>x.trim()).filter(Boolean),days:{0:true,1:true,2:true,3:true,4:true,5:true,6:true},individualPrice:null,maxPeople:6}))}));
}
function tourSeasonEnd(seasons,season){
 if(season.end)return String(season.end).slice(-5);
 const starts=seasons.map(s=>String(s.start).slice(-5)).sort(),start=String(season.start).slice(-5),next=starts.find(s=>s>start)||starts[0];
 const date=new Date('2000-'+next+'T12:00:00Z');date.setUTCDate(date.getUTCDate()-1);return date.toISOString().slice(5,10);
}
function tourSeason(t,date){
 const md=String(date||iso(today0())).slice(-5),seasons=tourSeasons(t);
 const active=seasons.filter(s=>{const start=String(s.start).slice(-5),end=tourSeasonEnd(seasons,s);return start<=end?md>=start&&md<=end:md>=start||md<=end}).sort((a,b)=>String(a.start).slice(-5).localeCompare(String(b.start).slice(-5)));
 return active.filter(s=>String(s.start).slice(-5)<=md).at(-1)||active.at(-1)||null;
}
function tourOffer(t,date,city='',format=''){
 const season=tourSeason(t,date),mode=season?.mode||'closed';const departures=(season?.departures||[]).filter(d=>d.enabled!==false&&d.city?.trim());
 const departure=city?departures.find(d=>d.city===city):departures[0];const kind=mode==='individual'?'individual':mode==='both'&&format==='individual'?'individual':'group';
 const weekday=date?fromIso(date).getDay():null,dayOK=!date||!departure?.days||departure.days[weekday]===true;
 const times=kind==='individual'?['По согласованию']:(Array.isArray(departure?.times)?departure.times:lines(departure?.times)).filter(x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(x));
 const available=!t.hidden&&mode!=='closed'&&!!departure&&dayOK&&times.length>0;
 return {season,mode,kind,departures,departure,available,times:available?times:[],price:kind==='individual'?(departure?.individualPrice==null||departure.individualPrice===''?null:Number(departure.individualPrice)):Number(departure?.adult??t.price??0),kid:Number(departure?.child??t.kid??0),maxPeople:kind==='individual'?Math.max(1,Number(departure?.maxPeople)||6):30};
}
function tourPublic(t,date=ui.q.date,city=ui.q.city||''){
 const dateForSeason=date||iso(today0()),base=tourOffer(t,dateForSeason,city,ui.q.format);if(t.hidden||base.mode==='closed')return null;
 let offers=(city?[base]:base.departures.map(d=>tourOffer(t,dateForSeason,d.city,ui.q.format))).filter(o=>o.available||!date&&o.mode!=='closed'&&o.departure&&o.times.length===0&&((o.kind==='individual')||((o.departure.times||[]).length>0||!t.seasons))&&(!o.departure.days||Object.values(o.departure.days).some(Boolean)));
 if(ui.q.format==='individual')offers=offers.filter(o=>['individual','both'].includes(o.mode));
 if(ui.q.format==='group')offers=offers.filter(o=>['group','both'].includes(o.mode));
 offers=offers.filter(o=>o.maxPeople>=(ui.q.people||1));if(!offers.length)return null;offers.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));const o=offers[0];
 return {...t,price:o.price,kid:o.kid,offerKind:o.kind,offerCity:o.departure.city,offerSeason:o.season.name};
}
function tourPins(t){syncRouteStops();return Array.isArray(t.routePins)?t.routePins.filter(p=>stopCatalog().some(x=>x.id===p)):t.pin&&stopCatalog().some(s=>s.id===t.pin)?[t.pin]:[]}
function tourInDistrict(t,id){return t.district===id||tourPins(t).some(p=>PIN_DIST[p]===id)}
function tourPriceHTML(t){return t.price==null?'По запросу':rub(t.price)}
function allDepartureCities(){return [...new Set(C.tours.flatMap(t=>tourSeasons(t).flatMap(s=>(s.departures||[]).map(d=>d.city))).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru'))}
function roadMarkers(points,names){
 const placed=[];
 return points.map((p,i)=>{const name=names[i]||'Остановка',width=Math.max(55,name.length*15),x=Math.max(85+width/2,Math.min(1015-width/2,p[0]));let y=p[1]-24;
 for(const offset of [-24,38,-62,76,-100,114]){const candidate={left:x-width/2,right:x+width/2,top:p[1]+offset-28,bottom:p[1]+offset+7};if(!placed.some(q=>candidate.left<q.right+8&&candidate.right>q.left-8&&candidate.top<q.bottom+5&&candidate.bottom>q.top-5)){y=p[1]+offset;placed.push(candidate);break}}
 return `<g class="road-stop"><circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${i?'#187d59':'#ed8b35'}" stroke="white" stroke-width="3"/><text class="road-stop-name" x="${x}" y="${y}" text-anchor="middle" font-size="26" font-weight="700" fill="#163b49" stroke="white" stroke-width="5" paint-order="stroke" stroke-linejoin="round">${esc(name)}</text><title>${esc(name)}</title></g>`}).join('');
}
const roadAnimations=new WeakMap();
function stopRoadAnimation(box){const state=roadAnimations.get(box);if(state){state.observer?.disconnect();if(state.frame)cancelAnimationFrame(state.frame);roadAnimations.delete(box)}}
function animateRoadRoute(box){
 stopRoadAnimation(box);const path=$('.road-route-line',box);if(!path)return;
 path.style.strokeDasharray='12 18';path.style.strokeDashoffset='0';
 // build 146: the dashes used to repaint the whole SVG map every frame even when the map was scrolled away, which
 // made the booking calendar below it stutter on phones. The animation now runs only while the map is on screen
 // and the page is visible; it is still continuous while you look at it.
 const state={frame:0,observer:null,visible:typeof IntersectionObserver!=='function'};roadAnimations.set(box,state);let started=null;
 const frame=now=>{state.frame=0;if(roadAnimations.get(box)!==state||!box.isConnected){state.observer?.disconnect();roadAnimations.delete(box);return}if(!state.visible||document.hidden)return;if(started===null)started=now;path.style.strokeDashoffset=String(-((now-started)%1200)/1200*30);state.frame=requestAnimationFrame(frame)};
 state.resume=()=>{if(!state.frame&&state.visible&&!document.hidden&&roadAnimations.get(box)===state)state.frame=requestAnimationFrame(frame)};
 if(!state.visible){state.observer=new IntersectionObserver(entries=>{state.visible=entries.some(entry=>entry.isIntersecting);if(state.visible)state.resume();else if(state.frame){cancelAnimationFrame(state.frame);state.frame=0}});state.observer.observe(box)}
 state.resume();
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){const box=$('#tourRoadRoute');roadAnimations.get(box)?.resume?.()}});
function tourRouteHTML(t){
 const pins=tourPins(t);if(!pins.length)return '';const mapped=pins.filter(p=>GEO.pins[p]);
 return `<section class="block road-route" id="tourRoadRoute" data-tour-id="${esc(t.id)}"><h2>Маршрут на карте</h2><div class="road-route-status" role="status" aria-live="polite">Строим маршрут по дорогам…</div><svg class="tour-route-map" viewBox="70 70 960 720" role="img" aria-label="Автомобильный маршрут экскурсии"><rect x="70" y="70" width="960" height="720" fill="#edf6f7"/>${Object.values(GEO.dist).map(d=>`<path d="${d}" fill="#d9eade" stroke="#fff" stroke-width="2"/>`).join('')}<g data-road-line></g><g data-road-markers>${roadMarkers(mapped.map(p=>GEO.pins[p]),mapped.map(p=>PIN_NAMES[p]))}</g></svg><ol class="route-stops" data-road-stops>${pins.map(p=>`<li>${esc(PIN_NAMES[p])}</li>`).join('')}</ol><p class="hint road-route-note">От центра города выезда до последней остановки. Сбор по отелям и обратная дорога не включены.</p><small class="road-attribution">Карта и дороги: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a> · OSRM</small></section>`;
}
const roadRequests=new Map();
async function updateTourRoadRoute(t,city,force=false){
 const box=$('#tourRoadRoute');if(!box||box.dataset.tourId!==t.id)return;
 const pins=tourPins(t),key=city+'|'+pins.join(',')+'|'+pins.map(id=>GEO.pins[id]?.join(',')||'').join(';');if(box.dataset.routeKey===key&&!force)return;box.dataset.routeKey=key;
 stopRoadAnimation(box);const line=$('[data-road-line]',box),status=$('.road-route-status',box);line.innerHTML='';status.textContent='Строим маршрут из '+city+'…';box.classList.add('is-routing');
 try{
  if(pins.some(id=>!GEO.pins[id]))throw new Error('Для одной из остановок не указаны координаты. Названия сохранены; маршрут на карте появится после заполнения справочника.');if(force)roadRequests.delete(key);if(!roadRequests.has(key)){if(roadRequests.size>=50)roadRequests.delete(roadRequests.keys().next().value);roadRequests.set(key,api('/api/road-route?'+new URLSearchParams({from:city,stops:pins.join(',')})).catch(error=>{roadRequests.delete(key);throw error}))}
  const data=await roadRequests.get(key);if($('#tourRoadRoute')!==box||box.dataset.routeKey!==key)return;
  const valid=p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Number.isFinite(p[1]);if(!Array.isArray(data.coordinates)||!data.coordinates.every(valid)||!Array.isArray(data.waypoints)||!data.waypoints.every(valid)||!Number.isFinite(data.distanceKm))throw new Error('Не удалось загрузить маршрут');
  const path=data.coordinates.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(' '),names=(data.stops||[]).map((id,i)=>i?PIN_NAMES[id]||'Остановка':city);
  line.innerHTML=data.coordinates.length>1?`<path d="${path}" fill="none" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="#1887b5" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path class="road-route-line" d="${path}" pathLength="1000" fill="none" stroke="#b8eafa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`:'';
  $('[data-road-markers]',box).innerHTML=roadMarkers(data.waypoints,names);$('[data-road-stops]',box).innerHTML=names.map((name,i)=>`<li>${i===0?'Выезд: ':''}${esc(name)}</li>`).join('');
  status.innerHTML=`<b class="num">${data.distanceKm.toLocaleString('ru-RU')} км</b><span>по автомобильной дороге · ${esc(city)} → ${esc(PIN_NAMES[pins.at(-1)]||'последняя остановка')}</span>`;box.classList.remove('is-routing');animateRoadRoute(box);
 }catch(error){if($('#tourRoadRoute')!==box||box.dataset.routeKey!==key)return;box.classList.remove('is-routing');status.innerHTML=`<span>${esc(error.message||'Маршрут временно недоступен')}</span><button type="button" class="btn btn-ghost small" data-road-retry>Повторить</button>`}
}
document.addEventListener('click',e=>{if(e.target.closest('[data-road-replay]')){const box=$('#tourRoadRoute');if(box)animateRoadRoute(box)}if(e.target.closest('[data-road-retry]')&&bk)updateTourRoadRoute(tourById(bk.t.id)||bk.t,departureCity,true)});

document.addEventListener('change',e=>{if(e.target.matches?.('[data-departure-filter],[data-format-filter]')){if(e.target.hasAttribute('data-departure-filter'))ui.q.city=e.target.value;else ui.q.format=e.target.value;ui.priceMin=null;ui.priceMax=null;refreshSearch();renderCards();syncPriceControls();syncCatalogHash()}});

function scheduledTimes(t,date){return tourOffer(t,date,t._departureCity||departureCity,t._bookingKind).times}
function transferPriceLabel(){const total=tr.step==='done'&&Object.hasOwn(tr,'acceptedPrice')?tr.acceptedPrice:trPrice();return total===null?'Согласуем цену':rub(total)}
function storyStatus(s){return {pending:'На проверке',published:'Опубликована',rejected:'Отклонена'}[s.status]||'Опубликована'}
function moderateStories(){return false}
function findStory(id){return allStories().find(x=>x.id===id)}
function storyVoteKey(){const u=store.get('user',null);return u?.publicId||u?.id||'visitor'}
function storyScore(s){const values=Object.values(s.ratings||{}).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=5);return {count:values.length,average:values.length?values.reduce((a,b)=>a+b,0)/values.length:0}}
function storyNumbers(s){const r=storyScore(s);return `<div class="story-numbers"><span>◉ ${Math.max(0,Number(s.views)||0)} просмотров</span><span>★ ${r.count?r.average.toFixed(1):'—'} <small>(${r.count})</small></span></div>`}
storyHTML=function(s){const href='#/diary/'+encodeURIComponent(s.id),photos=[...new Set([s.img||s.photo,...(s.photos||[])].filter(Boolean).map(p=>src(p)))];if(!photos.length)photos.push(src(null,s.scene||['sea',0],1000,625));return `<div class="story-link"><article class="story"><div class="story-media"><a class="card-photo-link" href="${href}" aria-label="${esc(s.t||'История путешествия')}">${photos.map((p,i)=>`<img src="${esc(p)}" alt="" loading="lazy" class="${i?'':'on'}">`).join('')}</a>${photos.length>1?`<button class="card-photo-arrow prev" type="button" data-card-photo="-1" aria-label="Предыдущее фото">${ICON.left}</button><button class="card-photo-arrow next" type="button" data-card-photo="1" aria-label="Следующее фото">${ICON.right}</button><span class="card-dots" aria-hidden="true">${photos.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</span>`:''}</div><a class="story-body story-content-link" href="${href}"><div class="story-top"><small class="story-author" ${profileTarget(s.uid)}>${esc(s.authorName||s.a)}</small>${storyNumbers(s)}</div><h3 class="story-title">${esc(s.t||'История путешествия')}</h3><p class="story-excerpt">${esc(s.x)}</p><span class="story-read">Читать историю <span aria-hidden="true">↗</span></span></a></article></div>`};
function updateStoredStory(id,change){const list=store.get('diary',[]),s=list.find(x=>x.id===id)||C.stories.find(x=>x.id===id);if(!s)return false;change(s);if(list.some(x=>x.id===id))return store.set('diary',list);return saveContent()}
function commentHTML(c){const user=store.get('user',null),author=isMine(c.uid,user)?user.name:c.author||'Путешественник',avatar=isMine(c.uid,user)?user.avatar:c.avatar;return `<div class="entry story-comment"><header><span class="avatar comment-avatar" ${profileTarget(c.uid)}>${avatar?`<img src="${src(avatar)}" alt="Аватар ${esc(author)}" loading="lazy">`:esc(author[0])}</span><b ${profileTarget(c.uid)}>${esc(author)}</b></header><p>${esc(c.text)}</p></div>`}
function refreshOwnCommentProfile(user){for(const story of [...(serverLists.diary||[]),...(C.stories||[])])for(const comment of story.comments||[])if(isMine(comment.uid,user)){comment.author=user.name;comment.avatar=user.avatar||''}for(const review of serverLists.reviews||[])if(isMine(review.uid,user)){review.n=user.name;review.avatar=user.avatar||'';review.c=user.city||''}}
function storyView(id){const s=findStory(id);if(!s){app.innerHTML='<div class="wrap section"><h1>История не найдена</h1><a class="btn btn-sea" href="#/diary">Все истории</a></div>';return}if(!sess.get('view:'+id)){const views=(Number(s.views)||0)+1;updateStoredStory(id,x=>x.views=views);sess.set('view:'+id,'1');s.views=views}const own=Number(s.ratings?.[storyVoteKey()]||0);app.innerHTML=`<article class="wrap story-detail"><a href="#/diary" class="btn btn-ghost small">← Все истории</a><header class="page-head"><div><p class="eyebrow">Дневник путешественников</p><h1>${esc(s.t)}</h1><p class="sub" ${profileTarget(s.uid)}>${esc(s.authorName||s.a)}</p>${storyNumbers(s)}</div></header>${s.img||s.photo?`<img class="story-hero" src="${src(s.img||s.photo)}" alt="Фото поездки">`:''}<div class="prose">${lines(s.x).map(x=>`<p>${esc(x)}</p>`).join('')}</div>${(s.photos||[]).slice(1).map(x=>`<img class="story-hero" src="${src(x)}" alt="Фото поездки" loading="lazy">`).join('')}${s.videoUrl?`<video src="${src(s.videoUrl)}" controls playsinline preload="metadata"></video>`:''}${s.videoKey?`<video data-story-media="${esc(s.videoKey)}" controls playsinline preload="metadata"></video>`:''}<section class="panel"><h2>Оцените историю</h2><div class="rate" role="radiogroup" aria-label="Оценка истории">${[1,2,3,4,5].map(n=>`<button type="button" role="radio" aria-checked="${own===n}" data-story-rate="${n}" data-story-id="${esc(id)}" style="color:${n<=own?'var(--accent)':'var(--muted)'}" aria-label="${n} из 5">★</button>`).join('')}</div><p class="hint">${own?'Ваша оценка: '+own+' из 5. Её можно изменить.':'Выберите от 1 до 5 звёзд.'}</p></section><section class="panel"><h2>Обсуждение</h2>${(s.comments||[]).map(commentHTML).join('')||'<p class="sub">Пока нет комментариев.</p>'}${store.get('user',null)?`<form id="storyComment" data-id="${esc(id)}"><label class="field">Комментарий<textarea class="input" name="text" required maxlength="2000"></textarea></label><button class="btn btn-sea">Добавить комментарий</button></form>`:'<a class="btn btn-sea" href="#/account">Войти и оставить комментарий</a>'}</section></article>`;loadStoryMedia()}
function yandexDarkReviewsHTML(){const reviews=allReviews().filter(r=>r.src==='ya').slice(0,3);return `<div class="ya-dark-reviews"><h3>Отзывы на Яндекс Картах</h3>${reviews.length?reviews.map(r=>`<article><header><b>${esc(r.n||'Гость')}</b><span class="stars">${'★'.repeat(Math.max(1,Math.min(5,Math.round(Number(r.r)||1))))}</span></header><p>${esc(r.x||'')}</p><small>${esc(r.d||'')}</small></article>`).join(''):'<p>Читайте впечатления путешественников на Яндекс Картах.</p>'}<a class="btn btn-ghost small" href="https://yandex.ru/maps/org/apsua_tur/132935970380/reviews" target="_blank" rel="noopener">Открыть отзывы ↗</a></div>`}
yandexHTML=function(){const Y=C.yandex,has=Y.rating&&Y.count;return `<section class="ya-showcase" aria-labelledby="h-rev"><div class="ya-copy"><p class="eyebrow">Яндекс Карты</p><h2 id="h-rev">Впечатления наших гостей</h2><p class="sub">Отзывы путешественников об «Апсуа Тур».</p>${has?`<div class="ya-summary"><strong class="num">${esc(fmtRating(Y.rating))}</strong><span class="stars" aria-label="Рейтинг ${esc(Y.rating)} из 5">★★★★★</span><span>${esc(Y.count)} ${plural(Number(Y.count)||0,'отзыв','отзыва','отзывов')}</span></div>`:''}<a class="btn btn-ghost" href="https://yandex.ru/maps/org/apsua_tur/132935970380/reviews" target="_blank" rel="noopener">Все отзывы на Яндексе ↗</a></div><div class="ya-widget">${yandexDarkReviewsHTML()}<details class="ya-original-widget" open><summary>Показать виджет Яндекс Карт</summary><iframe title="Отзывы об Апсуа Тур на Яндекс Картах" src="https://yandex.ru/maps-reviews-widget/132935970380?comments" width="560" height="480" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><a class="ya-source" href="https://yandex.ru/maps/org/apsua_tur/132935970380/reviews" target="_blank" rel="noopener">Не загрузились? Открыть отзывы ↗</a></details></div></section>`};
let departureCity='Сухум';
const originalRenderBooking=renderBooking;renderBooking=function(){
 if(!bk)return;const source=tourById(bk.t.id)||bk.t,date=bk.date||iso(today0());let offer=tourOffer(source,date,departureCity,bk.kind||ui.q.format);
 if(!offer.departure&&offer.departures.length){departureCity=offer.departures[0].city;offer=tourOffer(source,date,departureCity,bk.kind||ui.q.format)}
 bk.kind=offer.kind;bk.seasonName=offer.season?.name||'';bk.t={...source,price:offer.price,kid:offer.kid,times:offer.times,_departureCity:departureCity,_bookingKind:bk.kind};
 if(bk.step==='pick'){if(!offer.times.includes(bk.time))bk.time=bk.date&&offer.times.length===1?offer.times[0]:null;while(bk.adults+bk.kids>offer.maxPeople&&bk.kids>0)bk.kids--;bk.adults=Math.min(bk.adults,offer.maxPeople)}
 originalRenderBooking();const box=$('#booking');
 if(box&&bk.step==='pick'){
 box.insertAdjacentHTML('afterbegin',`<p class="hint">${esc(bk.seasonName)} · ${bk.kind==='individual'?'Индивидуальная экскурсия':'Групповая экскурсия'}</p><label class="field"><span>Город выезда</span><select class="input" id="departure-city">${offer.departures.map(d=>`<option value="${esc(d.city)}" ${d.city===departureCity?'selected':''}>${esc(d.city)}</option>`).join('')}</select></label>${offer.mode==='both'?`<label class="field"><span>Формат поездки</span><select class="input" id="booking-kind"><option value="group" ${bk.kind==='group'?'selected':''}>Групповая</option><option value="individual" ${bk.kind==='individual'?'selected':''}>Индивидуальная</option></select></label>`:''}`);
 box.insertAdjacentHTML('beforeend',`<p class="hint">${offer.mode==='closed'?'На выбранную дату направление закрыто. Выберите другую дату.':!offer.departure?'Выездов на этот сезон пока нет. Выберите другую дату.':'Наличие мест, точное время и условия поездки подтвердит диспетчер.'}</p>`);
 }
 if(box&&['form','done'].includes(bk.step)){box.insertAdjacentHTML('afterbegin',`<p class="hint">Выезд: ${esc(departureCity)} · ${bk.kind==='individual'?'индивидуальная':'групповая'} · ${esc(bk.seasonName)}</p>`)}
 const price=$('#mbar .price');if(price)price.textContent=bookingPriceLabel();const fact=$('[data-tour-format]');if(fact)fact.textContent=offer.mode==='closed'?'Закрыто в этом сезоне':bk.kind==='individual'?'Индивидуальная':source.format||'Групповая';const group=$('[data-tour-group]');if(group)group.textContent=bk.kind==='individual'?'До '+offer.maxPeople+' гостей':source.group||'Уточняется организатором';updateTourRoadRoute(source,departureCity);
};
function bookingPriceLabel(){return bk.t.price==null?'Стоимость по запросу':rub(bk.t.price)+(bk.kind==='individual'?' / группа':' / взрослый')}
function bookingTotalLabel(){const total=bk.step==='done'&&Object.hasOwn(bk,'acceptedTotal')?bk.acceptedTotal:bkTotal();return total==null?'По запросу':rub(total)}
document.addEventListener('change',e=>{if(e.target.id==='booking-kind'&&bk){bk.kind=e.target.value;bk.time=null;renderBooking()}});

const oldCardHTML=cardHTML;cardHTML=function(t){return oldCardHTML(t)};
const originalTourView=tourView;tourView=function(id){originalTourView(id);const section=$('#t-reviews');if(section)section.insertAdjacentHTML('beforeend',`<button class="btn btn-ghost small" type="button" data-ask-tour="${esc(id)}">Задать вопрос организатору</button>`)};
// Public question drafts stay separate from booking records.
document.addEventListener('click',e=>{const b=e.target.closest('[data-story-rate],[data-mod-story],[data-ask-tour]');if(!b)return;if(b.dataset.storyRate){const n=Number(b.dataset.storyRate);if(n<1||n>5)return;updateStoredStory(b.dataset.storyId,s=>{s.ratings={...(s.ratings||{}),[storyVoteKey()]:n}});const y=scrollY;storyView(b.dataset.storyId);scrollTo(0,y)}if(b.dataset.modStory){updateStoredStory(b.dataset.modStory,s=>{s.status=b.dataset.status;s.autoPublished=false;if(s.status==='published')s.publishedAt=new Date().toISOString()});adminApp?.render('moderation');toast('Решение сохранено')}if(b.dataset.askTour){const box=document.createElement('div');box.className='lightbox question-layer';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.innerHTML=`<section class="panel"><button class="circle" type="button" data-close-question aria-label="Закрыть">✕</button><h2>Вопрос организатору</h2><p class="sub">${esc(tourById(b.dataset.askTour)?.title)}</p><form id="questionForm" data-id="${esc(b.dataset.askTour)}"><label class="field">Ваше имя<input class="input" name="name" required maxlength="100"></label><label class="field">Телефон или email<input class="input" name="contact" required maxlength="150"></label><label class="field">Вопрос<textarea class="input" name="question" required maxlength="3000"></textarea></label><p class="hint">Вопрос поступит организатору в админку.</p><button class="btn btn-sea">Сохранить вопрос</button></form></section>`;document.body.append(box);$('[data-close-question]',box).onclick=()=>box.remove();$('input',box).focus()}});
document.addEventListener('change',e=>{if(e.target.id==='departure-city'){departureCity=e.target.value;renderBooking()}});
document.addEventListener('submit',e=>{const f=e.target;if(!['storyComment','questionForm'].includes(f.id))return;e.preventDefault();const values=Object.fromEntries(new FormData(f));if(f.id==='storyComment'){const text=(values.text||'').trim();if(!text)return;updateStoredStory(f.dataset.id,s=>(s.comments||=[]).push({uid:store.get('user',null).id,author:store.get('user',null).name,avatar:store.get('user',null).avatar||'',text,created:new Date().toISOString()}));storyView(f.dataset.id)}else{const contact=(values.contact||'').trim();if(!phoneOk(contact)&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)){toast('Укажите телефон или email');return}const list=store.get('questions',[]);list.push({id:code('Q'),tour:f.dataset.id,...values,created:new Date().toISOString()});if(store.set('questions',list)){$('.question-layer')?.remove();toast('Вопрос добавлен')}else toast('Не удалось сохранить вопрос')}});

function applyUserTypography(){const t=C.typography||{},fonts={Manrope:'Manrope, sans-serif',Montserrat:'Montserrat, sans-serif',system:'system-ui, sans-serif',Arial:'Arial, sans-serif',Georgia:'Georgia, serif'},bound=(v,min,max,def)=>Math.max(min,Math.min(max,Number(v)||def));const vars={'--f-body':fonts[t.bodyFont]||fonts.Manrope,'--f-display':fonts[t.headingFont]||fonts.Manrope,'--user-font':bound(t.bodySize,14,20,15.5)+'px','--user-h1':bound(t.h1,34,80,64)+'px','--user-h2':bound(t.h2,25,48,36)+'px','--user-h3':bound(t.h3,17,28,20)+'px','--user-line':bound(t.lineHeight,1.3,2,1.65),'--wrap':bound(t.wrap,1000,1600,1200)+'px','--hero':bound(t.hero,1100,1800,1320)+'px'};for(const [k,v]of Object.entries(vars))document.documentElement.style.setProperty(k,String(v))}
document.addEventListener('input',e=>{if(e.target.dataset.k?.startsWith('typography.'))setTimeout(applyUserTypography,350)});
document.addEventListener('change',e=>{if(e.target.dataset.k?.startsWith('typography.'))setTimeout(applyUserTypography,350);if(e.target.id==='moderation-filter')$$('[data-mod-status]').forEach(n=>n.hidden=e.target.value!=='all'&&n.dataset.modStatus!==e.target.value)});
// Video uploads use the same IndexedDB media store, referenced by keys rather than base64.
const mediaUrls=[];
async function loadStoryMedia(){for(const el of $$('[data-story-media]')){let media=IMG[el.dataset.storyMedia];if(!media){try{const db=await new Promise(resolve=>{const r=indexedDB.open('apsua-media',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null)});if(db?.objectStoreNames.contains('files'))media=await new Promise(resolve=>{const r=db.transaction('files').objectStore('files').get(el.dataset.storyMedia);r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null)});db?.close()}catch{}}if(media instanceof Blob){const url=URL.createObjectURL(media);mediaUrls.push(url);el.src=url}else if(typeof media==='string')el.src=media}}
let diaryVideo='';
const baseAccountView=accountView;accountView=function(){baseAccountView();const f=$('#diaForm');if(f){f.insertAdjacentHTML('beforeend','<label class="field"><span>Видео поездки · MP4 или WebM до 30 МБ</span><input class="input" type="file" id="diary-video" accept="video/mp4,video/webm"><small class="hint">Видео сохраняется в облачном хранилище.</small></label>')}};
document.addEventListener('change',async e=>{if(e.target.id!=='diary-video')return;const file=e.target.files[0];if(!file)return;if(!['video/mp4','video/webm'].includes(file.type)||file.size>30*1024*1024){toast('Выберите MP4 или WebM до 30 МБ');e.target.value='';return}const key='video:'+Date.now();diaryVideoBusy=true;const uploaded=await idb.put(key,file);diaryVideoBusy=false;if(uploaded){diaryVideo=key;toast('Видео загружено')}else toast('Не удалось сохранить видео')});
const baseAccSubmit=accSubmit;accSubmit=function(f){const before=f.id==='diaForm'?store.get('diary',[]).length:0,result=baseAccSubmit(f);if(f.id==='diaForm'){const list=store.get('diary',[]);if(list.length>before&&diaryVideo){list[0].videoKey=diaryVideo;store.set('diary',list);diaryVideo=''}}return result};
// Existing browser records remain in their original namespace; this is a one-time copy.
if(!store.get('migration-user20',false)){try{const oldStories=JSON.parse(localStorage.getItem('apsua-stories')||'[]');const existing=store.get('diary',[]);for(const s of oldStories)if(!existing.some(x=>x.id===s.id))existing.push({id:s.id,uid:'u'+hash(String(s.owner||'').toLowerCase()),t:s.title,x:s.text,a:s.author,img:s.photos?.[0]||'',photos:s.photos||[],videoKey:s.videoKey,videoUrl:s.videoUrl,status:s.status||'published',submittedAt:s.submittedAt||s.created,views:s.views||0,ratings:s.ratings||{},comments:s.comments||[]});if(existing.length)store.set('diary',existing);const oldFav=JSON.parse(localStorage.getItem('apsua-favorites')||'[]');oldFav.forEach(id=>favs.add(id));const oldUser=JSON.parse(localStorage.getItem('apsua-user')||'null');if(oldUser&&!store.get('user',null)){const c=oldUser.contact||'';store.set('user',{id:'u'+hash(c.toLowerCase()),name:oldUser.name||'Гость',...(c.includes('@')?{email:c}:{phone:c})})}store.set('migration-user20',true)}catch{}}
// Clean-path compatibility for story permalinks from the previous site.
const oldRoute=route;route=function(){for(const url of mediaUrls.splice(0))URL.revokeObjectURL(url);const parts=parseHash().parts;if(parts[0]==='diary'&&parts[1]){current='story';$('#mbar').hidden=true;document.body.classList.remove('has-mbar');storyView(parts[1]);setNav('diary');scrollTo(0,0);return}oldRoute();applyUserTypography()};
addEventListener('hashchange',()=>{const p=parseHash().parts;if(p[0]==='diary'&&p[1])route()});
setInterval(()=>{if(moderateStories()&&['home','diary'].includes(current))route()},60000);
applyUserTypography();
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{});



/* Month calendar for excursion booking. */
let bookingMonth=new Date(today0().getFullYear(),today0().getMonth(),1);
function bookingCalendar(t){
 const now=today0(),year=bookingMonth.getFullYear(),month=bookingMonth.getMonth(),offset=(bookingMonth.getDay()+6)%7,count=new Date(year,month+1,0).getDate();
 const title=bookingMonth.toLocaleDateString('ru-RU',{month:'long'}),today=iso(now);
 const tomorrow=new Date(now);tomorrow.setDate(now.getDate()+1);const afterTomorrow=new Date(now);afterTomorrow.setDate(now.getDate()+2);
 const allowed=d=>d>=now&&scheduledTimes(t,iso(d)).length>0;
 return `<div class="booking-calendar"><header class="cal-head"><strong>${esc(title[0].toUpperCase()+title.slice(1))} <span>${year}</span></strong><div><button type="button" data-cal-month="-1" aria-label="Предыдущий месяц" ${year===now.getFullYear()&&month===now.getMonth()?'disabled':''}>‹</button><button type="button" data-cal-month="1" aria-label="Следующий месяц">›</button></div></header><div class="cal-week" aria-hidden="true">${['пн','вт','ср','чт','пт','сб','вс'].map(d=>`<span>${d}</span>`).join('')}</div><div class="cal-grid" role="group" aria-label="Даты поездки">${'<span aria-hidden="true"></span>'.repeat(offset)}${Array.from({length:count},(_,i)=>{const date=new Date(year,month,i+1),value=iso(date),valid=allowed(date);return `<button type="button" class="cal-date ${[0,6].includes(date.getDay())?'weekend':''} ${value===today?'today':''}" data-day="${value}" aria-pressed="${bk.date===value}" ${valid?'':'disabled'} aria-label="${human(date)}${valid?'':', дата недоступна'}" ${value===today?'aria-current="date"':''}>${i+1}</button>`}).join('')}</div><div class="cal-shortcuts"><button type="button" data-cal-any aria-pressed="${!bk.date}">Любая дата</button><button type="button" data-day="${iso(tomorrow)}" ${allowed(tomorrow)?'':'disabled'}>Завтра</button><button type="button" data-day="${iso(afterTomorrow)}" ${allowed(afterTomorrow)?'':'disabled'}>Послезавтра</button></div></div>`
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cal-month],[data-cal-any],.cal-shortcuts [data-day]');if(!b||!bk)return;if(b.dataset.calMonth){bookingMonth=new Date(bookingMonth.getFullYear(),bookingMonth.getMonth()+Number(b.dataset.calMonth),1);renderBooking()}else if(b.hasAttribute('data-cal-any')){bk.date=null;bk.time=null;renderBooking()}else{const d=fromIso(b.dataset.day);bookingMonth=new Date(d.getFullYear(),d.getMonth(),1);renderBooking()}});


/* Hosted persistence. Browser caches are never an authority for identity or permissions. */
let lastModifiedAt=null;
function adminUpdatedLabel(){return lastModifiedAt?'Последнее изменение: <time datetime="'+new Date(lastModifiedAt).toISOString()+'">'+new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date(lastModifiedAt))+' (МСК)</time>':'Последнее изменение: —'}
function updateAdminTimestamp(value){if(!Number.isFinite(Number(value))||Number(value)<=0)return;lastModifiedAt=Number(value);const label=$('#admUpdated');if(label)label.innerHTML=adminUpdatedLabel()}
let serverIdentity=null,serverAdmin=false,serverEditor=false,serverStaffRole='',contentRevision=1,serverReady=false,serverQueue=Promise.resolve(),serverTestAuth={enabled:false,until:null},serverTelegramAuth={enabled:false,bot:''},serverYandexAuth={enabled:false};
const serverLists={},mediaMapping={};
async function api(path,options={}){let response;try{response=await fetch(path,{credentials:'same-origin',...options,headers:{...(options.body instanceof Blob?{}:{'Content-Type':'application/json'}),...options.headers}})}catch(cause){const error=new Error(navigator.onLine===false?'Нет соединения с интернетом. Проверьте связь и попробуйте ещё раз.':'Сервер временно недоступен. Попробуйте ещё раз.');error.network=true;error.cause=cause;throw error}let data;try{data=await response.json()}catch(cause){const error=new Error(response.ok?'Некорректный ответ сервера. Попробуйте ещё раз.':'Ошибка сервера');error.status=response.status;error.network=!response.ok&&response.status>=500;throw error}if(!response.ok){const error=new Error(data?.error||'Ошибка сервера');error.status=response.status;throw error}if(data.lastModifiedAt)updateAdminTimestamp(data.lastModifiedAt);return data}
function normalizeMedia(value,key=''){if(typeof value==='string'){if(value.startsWith('img:'))return mediaMapping[value.slice(4)]||IMG[value.slice(4)]||value;return mediaMapping[value]||value}if(Array.isArray(value))return value.map(x=>normalizeMedia(x));if(value&&typeof value==='object'){const result={};for(const [k,v]of Object.entries(value)){if(k==='videoKey'&&(mediaMapping[v]||String(IMG[v]||'').startsWith('/api/media/')||String(v).startsWith('/api/media/'))){result.videoUrl=mediaMapping[v]||IMG[v]||v;continue}result[k]=normalizeMedia(v,k)}return result}return value}
function scheduleServerSave(work){serverQueue=serverQueue.then(work).catch(e=>{admStatus('Не сохранено: '+e.message,true);toast('Не сохранено на сервере: '+e.message);const box=$('.success');if(box){$('h3',box).textContent='Заявка не отправлена';const retry=document.createElement('button');retry.className='btn btn-sea';retry.textContent='Повторить отправку';retry.onclick=()=>{retry.remove();scheduleServerSave(work)};box.append(retry)}});return serverQueue}
const localStoreSet=store.set,localStoreGet=store.get;
store.get=function(k,d){if(serverReady&&Object.hasOwn(serverLists,k))return clone(serverLists[k]);return localStoreGet(k,d)};
store.set=function(k,value){if(!serverReady)return localStoreSet(k,value);if(k==='user'){return !!serverIdentity}if(k==='content'){if(!serverAdmin){toast('Нет доступа к настройкам');return false}const content=normalizeMedia(clone(value));delete content.site.adminPass;const validation=validateTourSettings(content.tours);if(validation){admStatus(validation,true);toast(validation);return false}scheduleServerSave(async()=>{admStatus('Сохранение на сервере…');const data=await api('/api/content',{method:'PUT',body:JSON.stringify(serverEditor?{patch:Object.fromEntries(['tours','services','popularLimit','servicesPartnerVersion','routeStops'].filter(k=>Object.hasOwn(content,k)).map(k=>[k,content[k]])),revision:contentRevision}:{content,revision:contentRevision})});contentRevision=data.revision;admStatus('Сохранено на сервере ✓')});return true}if(['diary','reviews','bookings','transfers','questions','favs'].includes(k)){if(!serverIdentity){if(k==='favs')return localStoreSet(k,value);toast('Войдите в аккаунт, чтобы сохранить');return false}const before=serverLists[k]||[],items=normalizeMedia(clone(value)),deleted=before.filter(x=>!items.some(y=>(y.id||y.code)===(x.id||x.code))).map(x=>x.id||x.code).filter(Boolean);serverLists[k]=items;scheduleServerSave(async()=>{await api('/api/list',{method:'POST',body:JSON.stringify({kind:k,items,deleted})});if(['bookings','transfers'].includes(k))$$('.success h3').forEach(n=>n.textContent='Заявка принята');if(k!=='favs')toast('Сохранено на сервере')});return true}return localStoreSet(k,value)};
moderateStories=function(){return false};
const signinPath=()=>'/signin-with-chatgpt?return_to='+encodeURIComponent(location.pathname+routeHash());
function signinPanel(title){const owner=title==='Вход администратора';return `<div class="wrap section"><section class="panel auth"><h1>${esc(title)}</h1>${serverTestAuth.enabled?`<p class="sub">Демо «Апсуа Тур» · вход по приглашению</p><form id="testLoginForm" style="display:grid;gap:12px"><label class="field">Имя<input class="input" name="name" required minlength="2" maxlength="100" autocomplete="name"></label><label class="field">Почта<input class="input" type="email" name="email" required maxlength="254" autocomplete="email"></label><label class="field">Код приглашения<input class="input" name="code" required maxlength="100" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="AT-…"></label><p class="hint">Используйте личный код от организатора и свою почту. При повторном входе укажите ту же почту. Письмо с кодом не отправляется.</p><p class="err" id="test-login-error" role="alert"></p><button class="btn btn-sea" type="submit">Войти / зарегистрироваться</button></form>`:'<p class="sub">Приём приглашений пока закрыт.</p>'}${owner?`<a class="btn btn-ghost small" style="margin-top:16px" target="_top" href="${signinPath()}">Вход владельца</a>`:''}</section></div>`}

const hostedAccountView=accountView;accountView=function(){if(!serverIdentity){app.innerHTML=signinPanel('Личный кабинет');return}hostedAccountView();if(serverAdmin){const first=adminApp?.tabs()[0]?.[0]||'dash';app.insertAdjacentHTML('afterbegin',`<div class="wrap"><a class="btn btn-sea small" href="#/admin/${first}">Панель управления</a></div>`)}else if(serverEditor)app.insertAdjacentHTML('afterbegin','<div class="wrap"><a class="btn btn-sea small" href="#/admin/tours">Панель заполнения</a></div>')};


const previousUpdateStory=updateStoredStory;updateStoredStory=function(id,change){const original=findStory(id)||store.get('diary',[]).find(x=>x.id===id);if(!original)return false;const before=clone(original),after=clone(original);change(after);let action,payload={id};if(after.views!==before.views){if(!serverIdentity){fetch('/api/view?id='+encodeURIComponent(id),{credentials:'same-origin'}).catch(()=>{});return true}action='view'}else if(JSON.stringify(after.ratings)!==JSON.stringify(before.ratings)){action='rate';payload.rating=after.ratings?.[storyVoteKey()]}else if((after.comments||[]).length>(before.comments||[]).length){action='comment';payload.text=after.comments.at(-1).text;payload.author=serverIdentity?.name}if(action){if(!serverIdentity){toast('Войдите, чтобы оценить историю');return false}const list=serverLists.diary||[],entry=list.find(x=>x.id===id)||C.stories.find(x=>x.id===id);if(entry)Object.assign(entry,after);scheduleServerSave(()=>api('/api/story',{method:'POST',body:JSON.stringify({...payload,action})}));return true}return previousUpdateStory(id,change)};
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement&&e.target.classList.contains('logo-img')&&!e.target.dataset.fallback){e.target.dataset.fallback='1';e.target.src='/assets/brand-logo.png'}},true);
const originalPut=idb.put.bind(idb);idb.put=async function(key,value){if(!serverIdentity){toast('Войдите перед загрузкой файла');return false}try{const blob=value instanceof Blob?value:await (await fetch(value)).blob();const result=await api('/api/media',{method:'POST',headers:{'Content-Type':blob.type},body:blob});mediaMapping[key]=result.url;IMG[key]=result.url;await originalPut(key,result.url);return true}catch(e){toast(e.message);return false}};
const previousLoadStoryMedia=loadStoryMedia;loadStoryMedia=async function(){for(const el of $$('[data-story-media]')){const key=el.dataset.storyMedia;if(key.startsWith('/api/media/'))el.src=key;else if(mediaMapping[key])el.src=mediaMapping[key]}await previousLoadStoryMedia()};
document.addEventListener('submit',e=>{if(['bkForm','trForm','diaForm','revForm','rvForm','questionForm','storyComment'].includes(e.target.id)&&!serverIdentity){e.preventDefault();e.stopImmediatePropagation();openTelegramSignin()}if(['admLogin','admPass','authForm'].includes(e.target.id)){e.preventDefault();e.stopImmediatePropagation();location.href=signinPath()}},true);
document.addEventListener('click',e=>{if(e.target.closest('[data-logout]')){e.preventDefault();e.stopImmediatePropagation();if(serverIdentity?.authKind==='test'){api('/api/test-logout',{method:'POST',body:'{}'}).then(()=>location.reload()).catch(err=>toast(err.message))}else if(serverIdentity?.authKind==='yandex'){api('/api/yandex-logout',{method:'POST',body:'{}'}).then(()=>location.reload()).catch(err=>toast(err.message))}else location.href='/signout-with-chatgpt?return_to=%2F%23%2Faccount'}if(e.target.closest('[data-story-rate]')&&!serverIdentity){e.preventDefault();e.stopImmediatePropagation();toast('Войдите, чтобы поставить оценку');location.hash='#/account'}},true);
// The page shell starts /api/state before this script loads (window.apsuaEarlyState). Use that answer when it is
// a valid success; otherwise (old cached shell, network error, server error, timeout) ask again as before.
async function bootState(){const early=window.apsuaEarlyState;window.apsuaEarlyState=null;if(early){try{const response=await Promise.race([early,new Promise(resolve=>setTimeout(()=>resolve(null),15000))]);if(response?.ok){const data=await response.json();if(data&&typeof data==='object'&&data.content){if(data.lastModifiedAt)updateAdminTimestamp(data.lastModifiedAt);return data}}}catch{}}return api('/api/state',{signal:AbortSignal.timeout(15000)})}
async function hostedBoot(){
 // Local image caches must never block the first page render.
 renderChrome();
 // build 166: the shell keeps #app one screen tall until the first page renders, so the footer never jumps (see site-shell).
 app.innerHTML='<div class="wrap section" role="status"><p class="sub"></p></div>';
 try{
  const data=await bootState();
  window.apsuaLiveRevision=data.liveRevision;
  C=mergeDefaults(data.content,clone(DEFAULT));ensureTransferConfig();syncRouteStops();
  contentRevision=data.revision;serverIdentity=data.user;serverAdmin=data.admin;serverEditor=!!data.editor;serverStaffRole=data.staffRole||'';serverTestAuth=data.testAuth||{enabled:false,until:null};serverTelegramAuth=data.telegramAuth||{enabled:false,bot:''};serverYandexAuth=data.yandexAuth||{enabled:false};window.apsuaYandexMapsKey=typeof data.yandexMapsKey==='string'?data.yandexMapsKey:'';
  Object.assign(serverLists,data.lists||{},{user:data.user});serverReady=true;resetAdminBaseline();
  if(data.admin)sess.set('admin','1');else sess.del('admin');
  favs.clear();(data.user?(data.lists?.favs||[]):localStoreGet('favs',[])).forEach(id=>favs.add(id));
  renderChrome();route();app.classList.add('apsua-ready');window.dispatchEvent(new Event("site-ready"));
  // Legacy browser media is optional; server media already has direct URLs.
  Promise.race([(async()=>{await idb.open();await idb.loadAll()})(),new Promise(resolve=>setTimeout(resolve,2000))]).then(()=>{
   renderChrome();
   if(!window.apsuaRequestSending&&!window.apsuaRequestResultOpen&&!['admin','account'].includes(current)&&!document.querySelector('input:focus,textarea:focus,select:focus'))route();
  }).catch(()=>{});
 }catch(e){
  app.classList.add('apsua-ready');
  // A weak mobile connection must not look like a lost sign-in: retry quietly before showing the error.
  hostedBoot.attempts=(hostedBoot.attempts||0)+1;if(navigator.onLine===false){app.innerHTML='<div class="wrap section" role="status"><h1>Нет соединения</h1><p>Сайт загрузится автоматически, когда появится интернет. Вход в аккаунт сохранён.</p></div>';window.addEventListener('online',()=>{hostedBoot.attempts=0;hostedBoot()},{once:true});return}if(hostedBoot.attempts<3&&e?.status!==401&&e?.status!==403){setTimeout(hostedBoot,1200*hostedBoot.attempts);return}
  window.addEventListener('online',()=>location.reload(),{once:true});
  window.dispatchEvent(new Event("site-ready"));
  app.innerHTML=`<div class="wrap section"><h1>Не удалось загрузить сайт</h1><p>Проверьте соединение и попробуйте ещё раз.</p><button class="btn btn-sea" onclick="location.reload()">Повторить</button></div>`;
 }
}


document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const p=e.target.closest('.map-pin[data-pin],.atlas .dist[data-dist]');if(!p||p.contains(e.relatedTarget))return;if(p.dataset.pin){const id=PIN_DIST[p.dataset.pin];if(id)renderMapSide(id,p.dataset.pin)}else renderMapSide(p.dataset.dist,'')});
document.addEventListener('pointermove',e=>{if(reduce||e.pointerType!=='mouse')return;const box=e.target.closest('.map-box');if(!box)return;const r=box.getBoundingClientRect();box.style.setProperty('--atlas-x',((e.clientX-r.left)/r.width-.5)*5+'px');box.style.setProperty('--atlas-y',((e.clientY-r.top)/r.height-.5)*5+'px')});
document.addEventListener('pointerout',e=>{const box=e.target.closest('.map-box');if(box&&!box.contains(e.relatedTarget)){box.style.setProperty('--atlas-x','0px');box.style.setProperty('--atlas-y','0px')}});




/* Profile and moderation submissions await durable storage before showing success. */
let profileAvatar='',profilePhotoBusy=false,storyPhotoBusy=false,diaryVideoBusy=false;
let profileEditor=null,profileEditorTrigger=null,profileEditorOverflow='',profileEditorTicket=0;
function closeProfileEditor(){profileEditorTicket++;if(!profileEditor)return;profileEditor.remove();profileEditor=null;document.body.style.overflow=profileEditorOverflow;profileEditorTrigger?.focus();profileAvatar=serverIdentity?.avatar||''}
function openProfileEditor(trigger){if(!serverIdentity)return;closeTouristCard();closeProfileEditor();profileAvatar=serverIdentity.avatar||'';profileEditorTrigger=trigger;profileEditorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';const dialog=document.createElement('dialog');dialog.className='profile-editor';dialog.setAttribute('aria-labelledby','profile-editor-title');dialog.innerHTML=`<button class="tourist-close" type="button" data-close-profile aria-label="Закрыть настройки">✕</button><h2 id="profile-editor-title">Редактировать профиль</h2>${profileFormHTML(serverIdentity)}`;document.body.append(dialog);profileEditor=dialog;dialog.addEventListener('cancel',e=>{e.preventDefault();closeProfileEditor()});dialog.addEventListener('click',e=>{if(e.target.closest('[data-close-profile]')){closeProfileEditor();return}if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProfileEditor()}});dialog.showModal();$('[data-close-profile]',dialog)?.focus()}
document.addEventListener('click',e=>{const button=e.target.closest('[data-edit-profile]');if(button){e.preventDefault();openProfileEditor(button)}if(e.target.closest('[data-logout]'))closeProfileEditor()});
const profileAccountView=accountView;accountView=function(){profileAccountView();profileAvatar=serverIdentity?.avatar||''};
function profileMessage(text,error=false){const el=$('#profile-status');if(el){el.textContent=text;el.classList.toggle('err',error)}}
document.addEventListener('change',async e=>{
 if(e.target.id!=='profile-photo')return;
 const file=e.target.files?.[0];if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){profileMessage('Выберите JPG, PNG или WebP до 10 МБ',true);e.target.value='';return}
 const ticket=profileEditorTicket;profilePhotoBusy=true;profileMessage('Загружаем фотографию…');
 try{const resized=await new Promise(resolve=>readPhoto(file,512,resolve));if(!resized)throw new Error('Не удалось прочитать изображение');const blob=await(await fetch(resized)).blob();const result=await api('/api/media',{method:'POST',headers:{'Content-Type':blob.type},body:blob});if(ticket!==profileEditorTicket)return;profileAvatar=result.url;const preview=$('#profile-preview');if(preview)preview.innerHTML=`<img src="${esc(result.url)}" alt="Новый аватар">`;profileMessage('Фото загружено. Нажмите «Сохранить».')}
 catch(err){if(ticket===profileEditorTicket)profileMessage(err.message,true)}finally{profilePhotoBusy=false}
});
document.addEventListener('submit',async e=>{
 const f=e.target;if(!['profileForm','diaForm'].includes(f.id))return;e.preventDefault();e.stopImmediatePropagation();
 if(!serverIdentity){toast('Войдите по приглашению');return}
 if(profilePhotoBusy||storyPhotoBusy||diaryVideoBusy){toast('Дождитесь загрузки файла');return}
 const button=$('button[type="submit"]',f);if(button.disabled)return;
 if(f.id==='profileForm'){
  if(!f.reportValidity())return;button.disabled=true;profileMessage('Сохраняем…');
  try{const values=Object.fromEntries(new FormData(f));const result=await api('/api/profile',{method:'PUT',body:JSON.stringify({...values,avatar:profileAvatar})});serverIdentity=result.user;serverLists.user=result.user;refreshOwnCommentProfile(result.user);closeProfileEditor();accountView();syncAcc();toast('Профиль сохранён')}
  catch(err){profileMessage(err.message,true)}finally{button.disabled=false}return
 }
 const t=$('#dw-title').value.trim(),x=$('#dw-text').value.trim();$('#e-dt').textContent=t.length<3?'Добавьте заголовок.':'';$('#e-dx').textContent=x.length<20?'Расскажите чуть подробнее.':'';
 if(t.length<3||x.length<20)return;
 button.disabled=true;button.textContent='Отправляем…';
 try{
  let img=acc.photo||'';if(img.startsWith('data:')){const blob=await(await fetch(img)).blob();const upload=await api('/api/media',{method:'POST',headers:{'Content-Type':blob.type},body:blob});img=upload.url;acc.photo=img}
  const story={id:(f.dataset.storyId||= 'd'+crypto.randomUUID()),uid:serverIdentity.id,t,x,a:serverIdentity.name+', '+monthNow(),img,scene:['mountains',hash(t)%3],status:'pending',submittedAt:new Date().toISOString(),comments:[],...(diaryVideo?{videoUrl:mediaMapping[diaryVideo]||IMG[diaryVideo]}:{})};
  await serverQueue;await api('/api/list',{method:'POST',body:JSON.stringify({kind:'diary',items:[story]})});serverLists.diary=[story,...(serverLists.diary||[])];acc.photo='';diaryVideo='';accountView();toast('История отправлена на модерацию')
 }catch(err){toast('История не отправлена: '+err.message);button.disabled=false;button.textContent='Повторить отправку'}
},true);
document.addEventListener('click',async e=>{const b=e.target.closest('[data-mod-story]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.disabled)return;b.disabled=true;try{await serverQueue;await api('/api/moderation',{method:'PUT',body:JSON.stringify({id:b.dataset.modStory,status:b.dataset.status})});const item=serverLists.diary?.find(x=>x.id===b.dataset.modStory);if(item)item.status=b.dataset.status;toast('Решение сохранено');await adminApp?.refreshModeration()}catch(err){toast('Решение не сохранено: '+err.message)}finally{b.disabled=false}},true);

let loginAuditLoading=false;
function loginAuditHTML(logins){return logins.length?'<div class="login-audit-list">'+logins.map(row=>'<div class="login-audit-row"><div><b>'+esc(row.name)+'</b><span>'+esc(row.email)+'</span></div><time datetime="'+new Date(row.at).toISOString()+'">'+esc(new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date(row.at)))+'</time></div>').join('')+'</div>':'<p class="sub">Входов по приглашениям пока нет.</p>'}
async function refreshLoginAudit(){
 if(!serverAdmin||serverEditor||loginAuditLoading||!$('#loginAudit'))return;
 loginAuditLoading=true;const target=$('#loginAudit'),button=$('[data-refresh-logins]');if(button)button.disabled=true;
 try{const data=await api('/api/admin/logins');if($('#loginAudit')===target)target.innerHTML=loginAuditHTML(data.logins)}
 catch(err){if($('#loginAudit')===target)target.innerHTML='<p class="err" role="alert">Не удалось загрузить входы: '+esc(err.message)+'</p>'}
 finally{loginAuditLoading=false;if(button)button.disabled=false}
}
document.addEventListener('click',e=>{if(e.target.closest('[data-refresh-logins]'))refreshLoginAudit()});
setInterval(()=>{if(!document.hidden)refreshLoginAudit()},30000);

/* Verified reviews and public tourist cards. */
function profileTarget(uid){return uid?`data-user-profile="${esc(uid)}" role="button" tabindex="0" aria-haspopup="dialog" title="Карточка туриста"`:''}
function orderStatusLabel(status){return {private:'Новая заявка',pending:'Новая заявка',paid:'Оплачено',completed:'Выполнено',confirmed:'Подтверждён',cancelled:'Отменён'}[status]||'Новая заявка'}
document.addEventListener('submit',async e=>{const form=e.target;if(form.id!=='revForm')return;e.preventDefault();e.stopImmediatePropagation();if(!serverIdentity){toast('Войдите, чтобы оставить отзыв');location.hash='#/account';return}const button=$('button[type="submit"]',form);if(button.disabled)return;const text=$('#rv-text').value.trim();if(text.length<10){$('#e-rv').textContent='Напишите хотя бы пару предложений.';return}if(!$('#rv-date').value){$('#e-rv').textContent='Выберите дату экскурсии.';$('#rv-date-btn').classList.add('invalid');$('#rv-date-btn').focus();return}if(!form.reportValidity())return;button.disabled=true;button.textContent='Проверяем бронирование…';try{const data=await api('/api/review',{method:'POST',body:JSON.stringify({bookingCode:$('#rv-booking').value.trim(),date:$('#rv-date').value,tour:$('#rv-tour').value,rating:acc.rate,text})});serverLists.reviews=[data.review,...(serverLists.reviews||[])];acc.rate=5;accountView();toast('Бронирование проверено. Отзыв опубликован')}catch(err){$('#e-rv').textContent=err.message;button.disabled=false;button.textContent='Опубликовать отзыв'}},true);
let touristDialog=null,touristTrigger=null,touristRequest=0,touristOldOverflow='';
function closeTouristCard(){if(!touristDialog)return;touristRequest++;touristDialog.remove();touristDialog=null;document.body.style.overflow=touristOldOverflow;touristTrigger?.focus()}
function touristCardHTML(profile){const days=Math.max(1,Math.floor((Date.now()-Date.parse(profile.joinedAt))/86400000)+1);return `<span class="avatar tourist-photo">${profile.avatar?`<img src="${src(profile.avatar)}" alt="${esc(profile.name)}">`:esc(profile.name[0])}</span><p class="eyebrow">Путешественник Апсуа Тур</p><h2 id="tourist-card-title">${esc(profile.name)}</h2>${profile.city?`<p class="tourist-city">${esc(profile.city)}</p>`:''}<div class="tourist-stats"><div><strong>${days}</strong><span>${plural(days,'день','дня','дней')} с нами</span></div>${typeof profile.excursions==='number'?`<div><strong>${profile.excursions}</strong><span>куплено экскурсий</span></div>`:''}${typeof profile.transfers==='number'?`<div><strong>${profile.transfers}</strong><span>заказано трансферов</span></div>`:''}</div>${profile.about?`<p class="tourist-about">${esc(profile.about)}</p>`:''}${profile.canEdit===true&&!!serverIdentity?.id&&serverIdentity.id===profile.id?'<a class="btn btn-sea small" href="#/account" data-open-own-profile>Мой личный кабинет</a>':''}`}
async function openTouristCard(uid,trigger){closeTouristCard();touristTrigger=trigger;touristOldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';const ticket=++touristRequest;const dialog=document.createElement('dialog');dialog.className='tourist-dialog';dialog.setAttribute('aria-labelledby','tourist-card-title');dialog.innerHTML='<button class="tourist-close" type="button" data-close-tourist aria-label="Закрыть карточку">✕</button><div class="tourist-card-content" aria-live="polite"><h2 id="tourist-card-title">Карточка туриста</h2><p class="sub">Загружаем…</p></div>';document.body.append(dialog);touristDialog=dialog;dialog.addEventListener('cancel',e=>{e.preventDefault();closeTouristCard()});dialog.addEventListener('click',e=>{if(e.target.closest('[data-open-own-profile]')){closeTouristCard();return}if(e.target.closest('[data-close-tourist]')){closeTouristCard();return}if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeTouristCard()}});dialog.showModal();$('[data-close-tourist]',dialog).focus();try{const data=await api('/api/tourist?id='+encodeURIComponent(uid));if(ticket!==touristRequest||touristDialog!==dialog)return;$('.tourist-card-content',dialog).innerHTML=touristCardHTML(data.profile)}catch(err){if(touristDialog===dialog)$('.tourist-card-content',dialog).innerHTML=`<h2 id="tourist-card-title">Карточка туриста</h2><p>${esc(err.message)}</p>`}}
document.addEventListener('click',e=>{const target=e.target.closest('[data-user-profile]');if(!target)return;e.preventDefault();e.stopImmediatePropagation();openTouristCard(target.dataset.userProfile,target)},true);
document.addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key))return;const target=e.target.closest('[data-user-profile]');if(target){e.preventDefault();openTouristCard(target.dataset.userProfile,target)}});

document.addEventListener('submit',async e=>{const form=e.target;if(form.id!=='testLoginForm')return;e.preventDefault();e.stopImmediatePropagation();if(!form.reportValidity())return;const button=$('button[type="submit"]',form);if(button.disabled)return;button.disabled=true;$('#test-login-error').textContent='';try{await api('/api/test-login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(form)))});const state=await api('/api/state');location.hash=state.editor?'#/admin/tours':'#/account';location.reload()}catch(err){$('#test-login-error').textContent=err.message;button.disabled=false}},true);



/* Live theatre programme and restaurant directory. */
const serviceItemsBeforeFeed=serviceItems;
serviceItems=function(){const list=serviceItemsBeforeFeed();if(!C.servicesFeedVersion){const theatre=list.find(x=>x.id==='theatre');if(theatre){theatre.mode='rusdram';theatre.url='https://rusdram.org/posters';theatre.short='Актуальная афиша РУСДРАМа и билеты на спектакли.';theatre.button='Афиша и билеты'}if(!list.some(x=>x.id==='food-delivery'))list.push({id:'food-delivery',title:'Доставка еды',category:'Рестораны',short:'Меню ресторанов и заказ с доставкой.',description:'Выберите ресторан и перейдите к меню или свяжитесь для заказа.',mode:'delivery',group:'',photo:'',hidden:false});C.servicesFeedVersion=1}return list};
const serviceCardBeforeFeed=serviceCard;
serviceCard=function(item){return serviceCardBeforeFeed(item).replace('class="service-card"','class="service-card"'+(item.mode==='rusdram'?' data-theatre-preview':''))};
let theatreFeedPromise=null;
function getTheatreFeed(){if(!theatreFeedPromise)theatreFeedPromise=api('/api/theatre').finally(()=>{theatreFeedPromise=null});return theatreFeedPromise}
function theatreCards(data){if(!data.events?.length)return '<div class="empty">Афишу сейчас не удалось загрузить. Посмотрите актуальные спектакли на сайте театра.</div>';return `${data.stale?'<p class="feed-note">Показана последняя загруженная афиша. Даты и наличие билетов уточняйте на сайте театра.</p>':''}<div class="theatre-grid">${data.events.map(e=>`<article class="theatre-event"><a href="${esc(e.url)}" target="_blank" rel="noopener"><img src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy" referrerpolicy="no-referrer"></a><div><p class="theatre-date">${esc(new Date(e.date).toLocaleString('ru-RU',{timeZone:'Europe/Moscow',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}))}${e.age?' · '+esc(e.age):''}</p><h2>${esc(e.title)}</h2><p class="theatre-description">${esc(e.description)}</p><nav><a class="btn btn-ghost small" href="${esc(e.url)}" target="_blank" rel="noopener">Подробнее ↗</a><a class="btn btn-sea small" href="${esc(e.buy||e.url)}" target="_blank" rel="noopener">Купить билет ↗</a></nav></div></article>`).join('')}</div>`}
const usefulViewBeforeFeed=usefulView;
usefulView=function(id){const list=serviceItems(),item=list.find(x=>x.id===id&&!x.hidden);if(item?.mode==='rusdram'){app.innerHTML=`<div class="wrap useful-page"><a class="btn btn-ghost small" href="#/useful">← Полезное</a>${pageHead('Афиша','РУСДРАМ',item.title,'Спектакли Государственного русского театра драмы имени Ф. А. Искандера.')}<p class="feed-note">Афиша с сайта театра · билеты покупаются у театра</p><div id="theatreFeed" aria-live="polite"><p class="sub">Загружаем афишу…</p></div><p class="theatre-source"><a class="btn btn-ghost" href="https://rusdram.org/posters" target="_blank" rel="noopener">Вся афиша на сайте театра ↗</a></p></div>`;getTheatreFeed().then(data=>{const box=$('#theatreFeed');if(box)box.innerHTML=theatreCards(data)}).catch(()=>{const box=$('#theatreFeed');if(box)box.innerHTML=theatreCards({events:[]})});return}if(item?.mode==='delivery'){const restaurants=list.filter(x=>x.group==='delivery'&&!x.hidden&&x.id!==id);app.innerHTML=`<div class="wrap useful-page"><a class="btn btn-ghost small" href="#/useful">← Полезное</a>${pageHead('Доставка еды','Рестораны',item.title,'Выберите ресторан, посмотрите меню и свяжитесь для заказа.')}<div class="services-grid">${restaurants.map(serviceCard).join('')||'<p class="empty">Список ресторанов готовится. Скоро здесь появятся меню и контакты для заказа.</p>'}</div></div>`;return}usefulViewBeforeFeed(id);if(!id){$$('.service-card').forEach(card=>{const target=list.find(x=>card.getAttribute('href')==='#/useful/'+encodeURIComponent(x.id));if(target?.group==='delivery')card.remove()});if($('[data-theatre-preview]'))getTheatreFeed().then(data=>{if(!data.events?.length)return;$$('[data-theatre-preview]').forEach(card=>{const old=$('img,.service-art',card);if(old)old.outerHTML=`<img src="${esc(data.events[0].image)}" alt="Ближайший спектакль: ${esc(data.events[0].title)}" loading="lazy" referrerpolicy="no-referrer">`})}).catch(()=>{})}};

/* Provider pages retain the site's design and send orders to the provider. */
const serviceItemsBeforePartners=serviceItems;
serviceItems=function(){const list=serviceItemsBeforePartners();if(!C.servicesPartnerVersion){const delivery=list.find(x=>x.id==='food-delivery');if(delivery)Object.assign(delivery,{mode:'partner',partner:'ADelivery',title:'Доставка еды · ADelivery',short:'Еда и продукты из заведений Гудауты.',location:'Гудаута · Абхазия',photo:'https://adlvr.ru/ph/ph-khachapuri-1.jpg',description:'ADelivery — сервис доставки еды и продуктов из кафе, ресторанов и магазинов. Выберите заведение, укажите адрес и оформите заказ в приложении или веб-версии.\nВ приложении доступны статусы заказа и отслеживание курьера. Доступность доставки и её стоимость отображаются при оформлении. По информации сервиса, оплата производится наличными при получении.',url:'https://adlvr.ru/app/',button:'Выбрать заведение',website:'https://adlvr.ru/',appStore:'https://apps.apple.com/ru/app/id6796781470',ruStore:'https://www.rustore.ru/catalog/app/com.adelivery.adelivery',contact:'mailto:adlvr.help@mail.ru',contactLabel:'Поддержка ADelivery',operator:'ООО «Рива» — оператор ADelivery',responsibility:'За работу сервиса, оформление и обработку заказа, доставку, оплату и поддержку отвечает ADelivery и соответствующее заведение в рамках своих условий. «Апсуа Тур» размещает информацию и ссылки; заказ оформляется у поставщика услуги.'});const car=list.find(x=>x.id==='car-rental');if(car)Object.assign(car,{mode:'partner',photo:'https://prokat-007.ru/wp-content/uploads/2026/04/newfitt.jpg',partner:'PROKAT 007',title:'Аренда авто · PROKAT 007',short:'Автомобили для самостоятельных поездок по Абхазии.',location:'Псоу · Гагра · Алахадзы · Пицунда · Новый Афон · Сухум',description:'PROKAT 007 предлагает автомобили разных классов для поездок по Абхазии. На сайте можно посмотреть автопарк и отправить заявку, а место выдачи и возврата согласовать с прокатом.\nНа сайте указаны базовые требования: возраст от 23 лет и водительский стаж от 3 лет. Документы, доступность автомобиля, стоимость, залог, страхование и ограничения маршрута уточняйте у менеджера до бронирования.',url:'https://prokat-007.ru/',website:'https://prokat-007.ru/',button:'Выбрать автомобиль',contact:'https://wa.me/79409114007',contactLabel:'Написать в WhatsApp',phone:'tel:+79409114007',telegram:'https://tlgg.ru/Prokat007_Abh',operator:'ИП Цантекиди София Аристидовна — PROKAT 007',responsibility:'За бронирование, договор, оплату, состояние и выдачу автомобиля, условия аренды и поддержку отвечает PROKAT 007. «Апсуа Тур» размещает информацию и ссылки; договор аренды заключается непосредственно с прокатом.'});C.servicesPartnerVersion=1}return list};
function partnerButton(label,url,primary=false){const safe=serviceURL(url);return safe?`<a class="btn ${primary?'btn-sea':'btn-ghost'}" href="${esc(safe)}" ${/^https?:/.test(safe)?'target="_blank" rel="noopener"':''}>${esc(label)}${/^https?:/.test(safe)?' ↗':''}</a>`:''}
const usefulViewBeforePartners=usefulView;
usefulView=function(id){const item=serviceItems().find(x=>x.id===id&&!x.hidden);if(item?.mode!=='partner'){usefulViewBeforePartners(id);return}app.innerHTML=`<article class="wrap partner-page"><a class="btn btn-ghost small" href="#/useful">← Полезное</a><div class="partner-layout"><div class="partner-visual">${item.photo?`<img src="${src(item.photo)}" alt="${esc(item.partner||item.title)}">`:`<div class="service-art" aria-hidden="true">↗</div>`}<div><span class="eyebrow">${esc(item.category||'Полезное')}</span><b>${esc(item.partner||item.title)}</b><p>${esc(item.short)}</p></div></div><section class="panel partner-content"><p class="eyebrow">Рекомендуемый сервис</p><h1>${esc(item.title)}</h1><p class="sub">${esc(item.location)}</p><div class="prose">${lines(item.description).map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="partner-actions">${partnerButton(item.button||'Открыть сервис',item.url,true)}${item.website&&item.website!==item.url?partnerButton('Сайт сервиса',item.website):''}</div>${item.appStore||item.ruStore?`<section class="partner-download"><h2>Скачать приложение</h2><p>Выберите магазин для своего телефона.</p><div class="partner-actions">${partnerButton('App Store · iPhone',item.appStore)}${partnerButton('RuStore · Android',item.ruStore)}</div></section>`:''}<div class="partner-actions partner-contacts">${partnerButton(item.contactLabel||'Связаться с сервисом',item.contact)}${partnerButton('Позвонить',item.phone)}${partnerButton('Telegram',item.telegram)}</div><aside class="partner-responsibility"><h2>Кто оказывает услугу</h2><b>${esc(item.operator||item.partner)}</b><p>${esc(item.responsibility)}</p><small>Актуальные условия и доступность — на сайте сервиса.</small></aside></section></div></article>`};

/* ---------- Start ---------- */
function setupCategoryRails(){$$('.category-rail').forEach(rail=>{const list=$('.chips',rail);if(!list)return;const update=()=>{const prev=$('[data-category-scroll="-1"]',rail),next=$('[data-category-scroll="1"]',rail);if(prev)prev.disabled=list.scrollLeft<=2;if(next)next.disabled=list.scrollLeft+list.clientWidth>=list.scrollWidth-2};if(!list._categoryReady){list._categoryReady=true;list.addEventListener('scroll',update,{passive:true})}update()})}
function syncPriceControls(){const b=priceBounds(),low=ui.priceMin??b.min,high=ui.priceMax??b.max;for(const [id,value] of [['priceMin',low],['priceMax',high],['priceFromInput',low],['priceToInput',high]]){const el=$('#'+id);if(el)el.value=value}const range=$('.price-range');if(range){const span=b.max-b.min||1;range.style.setProperty('--range-start',(low-b.min)/span*100+'%');range.style.setProperty('--range-end',(high-b.min)/span*100+'%')}const min=$('#priceMin'),max=$('#priceMax');if(min){min.setAttribute('aria-valuetext',rub(low));min.setAttribute('aria-valuemax',high);min.style.zIndex=low>=b.max-1?'4':'2'}if(max){max.setAttribute('aria-valuetext',rub(high));max.setAttribute('aria-valuemin',low)}$$('[data-price-summary]').forEach(node=>{node.textContent='Цена';node.closest('summary')?.setAttribute('aria-label','Фильтр по цене'+(priceFiltered()?': '+priceSummaryText():''));node.closest('.catalog-price')?.classList.toggle('is-active',priceFiltered())})}
/* Price panel: a popover on a computer, a bottom sheet on a phone. It leaves the way it came. */
function closePricePanel(panel){if(!panel?.open||panel.classList.contains('is-closing'))return;if(reduce){panel.open=false;return}panel.classList.add('is-closing');const done=()=>{panel.classList.remove('is-closing');panel.open=false};const sheet=$('fieldset',panel);let finished=false;const finish=()=>{if(finished)return;finished=true;done()};sheet?.addEventListener('animationend',finish,{once:true});setTimeout(finish,320)}
/* A drag on the price thumbs that ends outside the panel still produces a click; it must not close the panel. */
let pricePressInside=false;
document.addEventListener('pointerdown',e=>{pricePressInside=!!e.target.closest?.('.catalog-price>fieldset')},true);
document.addEventListener('click',e=>{
 const panel=e.target.closest('.catalog-price'),pressedInside=pricePressInside;pricePressInside=false;
 if(e.target.closest('.catalog-price>summary')&&panel?.open){e.preventDefault();if(!pressedInside)closePricePanel(panel);return}
 if(e.target.closest('[data-price-done]')){closePricePanel(panel);return}
 if(e.target.closest('[data-price-reset]')){ui.priceMin=null;ui.priceMax=null;syncPriceControls();renderCards();syncCatalogHash();return}
 if(pressedInside)return;
 $$('.catalog-price[open]').forEach(open=>{if(open!==panel)closePricePanel(open)});
});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const open=$('.catalog-price[open]');if(!open)return;closePricePanel(open);$('summary',open)?.focus({preventScroll:true})});
function setPriceBound(id,value){const b=priceBounds();if(value===''||!Number.isFinite(Number(value))){syncPriceControls();return}const v=Math.max(b.min,Math.min(b.max,Math.round(Number(value))));if(id==='priceMin'||id==='priceFromInput')ui.priceMin=Math.min(v,ui.priceMax??b.max);else ui.priceMax=Math.max(v,ui.priceMin??b.min);syncPriceControls();renderCards()}
document.addEventListener('click',e=>{const arrow=e.target.closest('[data-category-scroll]');if(!arrow)return;const rail=arrow.closest('.category-rail'),list=$('.chips',rail);list?.scrollBy({left:Number(arrow.dataset.categoryScroll)*list.clientWidth*.75,behavior:reduce?'auto':'smooth'})});
addEventListener('resize',setupCategoryRails);
document.addEventListener('change',e=>{const id=e.target.id;if(id==='priceFromInput'||id==='priceToInput')setPriceBound(id,e.target.value);if(['priceMin','priceMax','priceFromInput','priceToInput'].includes(id))syncCatalogHash()});
document.addEventListener('input',e=>{const id=e.target.id;if(id==='priceMin'||id==='priceMax')setPriceBound(id,e.target.value)});
/* Device push subscriptions and owner broadcast composer. */
let pushDeviceChanging=false,pushDeviceEnabled=false,pushDeviceEpoch=0;
let pushConfig=null,pushRegistration=null,pushBusy=false,pushField='push-title',pushJobId=null,pushJobText=null;
function pushInstalled(){return navigator.standalone===true||matchMedia('(display-mode: standalone)').matches}
function pushAvailable(){return 'Notification' in window&&'PushManager' in window&&'serviceWorker' in navigator}
const pushAccountBefore=accountView;accountView=function(){pushAccountBefore();if(!serverIdentity)return;$('#push-welcome')?.remove();app.insertAdjacentHTML('beforeend',`<div class="wrap"><section class="panel push-device"><div><h2>Уведомления</h2><p id="push-device-status" class="sub">Проверяем это устройство…</p></div><button class="btn btn-sea small" type="button" id="push-device-toggle" disabled>Включить уведомления</button></section></div>`);refreshPushDevice()};
function pushPreferenceKey(){return 'apsua-push-disabled:'+serverIdentity.id}
function pushOptedOut(){try{return localStorage.getItem(pushPreferenceKey())==='1'}catch{return false}}
function pushSetDisabled(disabled){try{if(disabled)localStorage.setItem(pushPreferenceKey(),'1');else localStorage.removeItem(pushPreferenceKey())}catch{}}
async function pushSubscribe(){
 const key=Uint8Array.from(atob(pushConfig.publicKey.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 return await pushRegistration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
}
function pushDeviceConnected(){
 pushDeviceEnabled=true;$('#push-welcome')?.remove();
 const button=$('#push-device-toggle'),label=$('#push-device-status');
 if(button){button.dataset.enabled='1';button.textContent='Отключить';button.disabled=false}
 if(label)label.textContent='Уведомления включены на этом устройстве.';
}
function pushWelcome(){
 if(pushDeviceChanging||pushDeviceEnabled||!serverIdentity||!pushAvailable()||!pushInstalled()||Notification.permission==='denied'||pushOptedOut()||current==='account'||$('#push-welcome'))return;
 try{if(sessionStorage.getItem('apsua-push-later')==='1'&&Notification.permission!=='granted')return}catch{}
 document.body.insertAdjacentHTML('beforeend',`<aside id="push-welcome" class="push-welcome panel" aria-label="Уведомления"><div><h2>Будьте в курсе</h2><p id="push-device-status" class="sub">Подключаем уведомления…</p></div><div class="push-welcome-actions"><button type="button" class="btn btn-sea small" id="push-device-toggle" disabled>Разрешить уведомления</button><button type="button" class="btn small" id="push-later">Позже</button></div></aside>`);
 refreshPushDevice();
}
window.addEventListener('site-ready',pushWelcome);
window.addEventListener('hashchange',()=>setTimeout(pushWelcome,0));
window.addEventListener('pageshow',pushWelcome);
document.addEventListener('click',e=>{if(e.target.closest('#push-later')){try{sessionStorage.setItem('apsua-push-later','1')}catch{}$('#push-welcome')?.remove()}});
async function refreshPushDevice(){
 if(pushDeviceChanging)return;const epoch=pushDeviceEpoch;
 const label=$('#push-device-status'),button=$('#push-device-toggle');if(!label||!button)return;
 if(!pushAvailable()||!pushInstalled()){label.textContent='Откройте установленное приложение с экрана телефона, чтобы включить уведомления.';$('#push-welcome')?.classList.add('is-ready');return}
 if(Notification.permission==='denied'){label.textContent='Уведомления запрещены. Разрешите их в настройках устройства.';$('#push-welcome')?.classList.add('is-ready');return}
 try{pushConfig=await api('/api/push/config');if(!pushConfig.enabled){label.textContent='Уведомления пока недоступны.';$('#push-welcome')?.classList.add('is-ready');return}const registration=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});
 if(registration.installing){const worker=registration.installing;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{worker.removeEventListener('statechange',changed);reject(new Error('Подождите загрузки обновления и попробуйте ещё раз'))},20000);function changed(){if(worker.state==='activated'){clearTimeout(timer);worker.removeEventListener('statechange',changed);resolve()}else if(worker.state==='redundant'){clearTimeout(timer);worker.removeEventListener('statechange',changed);reject(new Error('Не удалось обновить приложение'))}}worker.addEventListener('statechange',changed);changed()})}
 pushRegistration=await navigator.serviceWorker.ready;
 let subscription=await pushRegistration.pushManager.getSubscription();if(!subscription&&Notification.permission==='granted'&&!pushOptedOut()){try{subscription=await pushSubscribe()}catch{ /* Some browsers still require a tap to renew a subscription. */ }}if(epoch!==pushDeviceEpoch)return;button.dataset.enabled=subscription?'1':'0';button.textContent=subscription?'Отключить':'Включить уведомления';button.disabled=false;label.textContent=subscription?'Уведомления включены на этом устройстве.':'Получайте новости и сообщения «Апсуа Тур».';
 if(subscription){await api('/api/push/subscription',{method:'POST',body:JSON.stringify(subscription.toJSON())});if(epoch===pushDeviceEpoch)pushDeviceConnected()}else if($('#push-welcome')){button.textContent='Разрешить уведомления';label.textContent='Получайте новости и сообщения «Апсуа Тур». Нажмите «Разрешить уведомления» и подтвердите запрос системы.';$('#push-welcome')?.classList.add('is-ready')}
 }catch(err){label.textContent='Не удалось проверить подписку: '+err.message;$('#push-welcome')?.classList.add('is-ready')}
}
document.addEventListener('click',async e=>{
 const button=e.target.closest('#push-device-toggle');if(!button||button.disabled||!serverIdentity)return;
 if(pushDeviceChanging)return;pushDeviceChanging=true;pushDeviceEpoch++;
 button.disabled=true;const label=$('#push-device-status');
 try{
  if(button.dataset.enabled==='1'){const subscription=await pushRegistration.pushManager.getSubscription();if(subscription){await api('/api/push/subscription',{method:'DELETE',body:JSON.stringify({endpoint:subscription.endpoint})});await subscription.unsubscribe()}pushSetDisabled(true);pushDeviceEnabled=false;pushDeviceChanging=false;await refreshPushDevice()}
  else{
   // Start permission request directly inside the user's click, before awaiting network work.
   const permission=await Notification.requestPermission();if(permission!=='granted'){pushDeviceChanging=false;await refreshPushDevice();return}
   const subscription=await pushSubscribe();
   await api('/api/push/subscription',{method:'POST',body:JSON.stringify(subscription.toJSON())});pushSetDisabled(false);pushDeviceConnected();
  }
 }catch(err){if(label)label.textContent='Не удалось изменить подписку: '+err.message;button.disabled=false}
 finally{pushDeviceChanging=false}
});
/* Owner broadcast composer: the push section of the admin panel is in admin-app.js. */
async function loadPushDashboard(){try{const data=await api('/api/admin/push');const target=$('#push-audience');if(target)target.textContent='Подписанных устройств: '+data.devices+(data.newsDevices!=null?' · согласились на новости: '+data.newsDevices:'');const button=$('#push-send-button');window.apsuaPushCounts={devices:data.devices,news:data.newsDevices||0,enabled:data.enabled};if(button&&!pushBusy)button.disabled=!data.enabled||!(($('#push-kind')?.value==='news')?data.newsDevices:data.devices);const history=$('#push-history');if(history)history.innerHTML=data.history.map(job=>`<article class="push-history-row"><b>${esc(job.title)}</b><p>${esc(job.text)}</p><small>${job.audience==='news'?'Новости и предложения · ':''}${new Date(job.created).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})} · Принято push-сервисами: ${job.accepted} · Ошибки: ${job.failed} · Подписок недоступно: ${job.expired}</small>${pushErrorDetails(job)?`<p class="hint">${esc(pushErrorDetails(job))}</p>`:''}${job.status==='pending'?`<button class="btn btn-ghost small" type="button" data-push-resume="${esc(job.id)}" data-push-cursor="${job.cursor}">Продолжить отправку</button>`:''}</article>`).join('')||'<p class="sub">Отправок пока нет.</p>'}catch(err){const target=$('#push-audience');if(target)target.textContent=err.message}}
document.addEventListener('focusin',e=>{if(['push-title','push-text'].includes(e.target.id))pushField=e.target.id});
document.addEventListener('change',e=>{if(e.target.id!=='push-kind')return;const c=window.apsuaPushCounts,button=$('#push-send-button');if(c&&button&&!pushBusy)button.disabled=!c.enabled||!(e.target.value==='news'?c.news:c.devices)});
document.addEventListener('click',e=>{
 if(e.target.closest('#push-emoji-toggle')){const picker=$('#push-emoji-picker');picker.hidden=!picker.hidden;$('#push-emoji-toggle').setAttribute('aria-expanded',String(!picker.hidden))}
 const emoji=e.target.closest('[data-push-emoji]');if(emoji){const input=$('#'+pushField);if(!input)return;const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;if(input.value.length-(end-start)+emoji.dataset.pushEmoji.length>Number(input.maxLength))return;input.setRangeText(emoji.dataset.pushEmoji,start,end,'end');input.focus();input.dispatchEvent(new Event('input',{bubbles:true}))}
});
async function drainPush(job){while(job.status==='pending'&&job.cursor<job.total){const label=$('#push-send-status');if(label)label.textContent=`Отправляем: ${job.cursor} из ${job.total}…`;job=await api('/api/admin/push/batch',{method:'POST',body:JSON.stringify({id:job.id,cursor:job.cursor})})}return job}
function pushErrorDetails(job){return (job.errors||[]).map(x=>`${x.provider}: ${x.code} (${x.count})`).join('; ')}
function pushResult(job){return `Push-сервисы приняли: ${job.accepted}. Ошибок: ${job.failed}. Недоступных подписок: ${job.expired}. ${pushErrorDetails(job)?' Причины: '+pushErrorDetails(job)+'.':''}${job.accepted?' Принятие сервисом не гарантирует показ на телефоне.':''}`}
document.addEventListener('submit',async e=>{
 const form=e.target;if(form.id!=='push-send-form')return;e.preventDefault();e.stopImmediatePropagation();if(pushBusy||!serverAdmin||serverEditor||!form.reportValidity())return;
 pushBusy=true;const button=$('#push-send-button'),label=$('#push-send-status'),fields=[$('#push-title'),$('#push-text'),$('#push-emoji-toggle')];button.disabled=true;fields.forEach(field=>field.disabled=true);
 try{const audience=$('#push-kind')?.value==='news'?'news':'service',message=JSON.stringify({title:$('#push-title').value,text:$('#push-text').value,audience});if(message!==pushJobText){pushJobId=crypto.randomUUID();pushJobText=message}pushJobId=pushJobId||crypto.randomUUID();label.textContent='Готовим отправку…';let job=await api('/api/admin/push',{method:'POST',body:JSON.stringify({id:pushJobId,title:$('#push-title').value,text:$('#push-text').value,audience})});job=await drainPush(job);if(job.status!=='done')throw new Error('Эта отправка ещё выполняется');label.textContent=pushResult(job);if(job.status==='done'){pushJobId=null;pushJobText=null;form.reset()}}
 catch(err){label.textContent='Отправка не завершена: '+err.message+' Проверьте историю перед повторной отправкой.'}
 finally{pushBusy=false;button.disabled=false;fields.forEach(field=>field.disabled=false);loadPushDashboard()}
},true);
document.addEventListener('click',async e=>{const button=e.target.closest('[data-push-resume]');if(!button||pushBusy||!serverAdmin||serverEditor)return;pushBusy=true;button.disabled=true;try{const info=await api('/api/admin/push');const job=info.history.find(x=>x.id===button.dataset.pushResume);if(job){const result=await drainPush(job);$('#push-send-status').textContent=pushResult(result)}}catch(err){$('#push-send-status').textContent=err.message}finally{pushBusy=false;loadPushDashboard()}});

// The changelog lives in /changelog.js and loads only when «Что нового?» opens, so visitors do not download it.
const SITE_CHANGELOG=[];let changelogState=Array.isArray(window.apsuaChangelog)?'ready':'idle';if(changelogState==='ready')SITE_CHANGELOG.push(...window.apsuaChangelog);
function loadChangelog(){if(changelogState!=='idle')return;changelogState='loading';const script=document.createElement('script');script.src='/changelog.js';script.async=true;script.onload=()=>{SITE_CHANGELOG.length=0;if(Array.isArray(window.apsuaChangelog)){SITE_CHANGELOG.push(...window.apsuaChangelog);changelogState='ready'}else changelogState='failed';renderNewsResults()};script.onerror=()=>{changelogState='failed';renderNewsResults()};document.head.append(script)}
const newsKinds={feature:'Новая функция',improvement:'Улучшение',fix:'Исправление'};
const newsPriorities={important:['★','Важно'],normal:['●','Обычное'],minor:['🔧','Мелкое исправление']};
const newsState={search:'',from:'',to:'',type:'',priority:'',sort:'newest',page:0};
function newsFiltered(){const term=newsState.search.trim().toLocaleLowerCase('ru-RU');return SITE_CHANGELOG.filter(x=>(!term||[x.title,x.description,x.version,x.author,newsKinds[x.type]].join(' ').toLocaleLowerCase('ru-RU').includes(term))&&(!newsState.from||x.date>=newsState.from)&&(!newsState.to||x.date<=newsState.to)&&(!newsState.type||x.type===newsState.type)&&(!newsState.priority||x.priority===newsState.priority)).sort((a,b)=>{const av=Number(a.version.split('.')[0])*10+Number(a.version.split('.')[1]),bv=Number(b.version.split('.')[0])*10+Number(b.version.split('.')[1]);if(newsState.sort==='version')return av-bv;const order=a.date.localeCompare(b.date)||av-bv;return newsState.sort==='oldest'?order:-order})}
function newsDate(date){return date.split('-').reverse().join('.')}
function renderNewsResults(){const box=$('#newsResults');if(!box)return;if(changelogState!=='ready'){if(changelogState==='idle')loadChangelog();box.innerHTML=changelogState==='failed'?'<p class="hint" role="status">Не удалось загрузить историю обновлений. Проверьте интернет и откройте раздел ещё раз.</p>':'<p class="hint" role="status">Загружаем историю обновлений…</p>';return}const all=newsFiltered(),size=10,pages=Math.max(1,Math.ceil(all.length/size));newsState.page=Math.max(0,Math.min(newsState.page,pages-1));const list=all.slice(newsState.page*size,(newsState.page+1)*size);box.innerHTML=`<div class="news-result-top"><span role="status">Найдено: <b>${all.length}</b> из ${SITE_CHANGELOG.length}</span><label>К версии <select class="input" data-news-jump><option value="">Выберите</option>${all.map(x=>`<option value="${x.version}">${x.version} · ${esc(x.title)}</option>`).join('')}</select></label></div><div class="news-list">${list.map(x=>{const [icon,label]=newsPriorities[x.priority];return `<article class="news-entry" id="news-${x.version.replace('.','-')}"><div class="news-entry-meta"><b class="news-version">${x.version}</b><time datetime="${x.date}">${newsDate(x.date)}</time><span class="news-priority ${x.priority}"><span aria-hidden="true">${icon}</span> ${label}</span><span class="news-author">Автор: ${esc(x.author||'Имя не записано')}</span><span class="news-kind">${newsKinds[x.type]}</span></div><h2>${esc(x.title)}</h2><p>${esc(x.description)}</p></article>`}).join('')||'<div class="empty">Изменения не найдены. Попробуйте изменить фильтры.</div>'}</div><nav class="news-pages" aria-label="Страницы истории"><button class="btn btn-ghost small" data-news-page="-1" type="button" ${newsState.page===0?'disabled':''}>← Назад</button><span>${newsState.page+1} / ${pages}</span><button class="btn btn-ghost small" data-news-page="1" type="button" ${newsState.page>=pages-1?'disabled':''}>Далее →</button></nav>`}
document.addEventListener('input',e=>{const key=e.target.dataset.newsFilter;if(!key||!(key in newsState))return;newsState[key]=e.target.value;newsState.page=0;renderNewsResults()});
document.addEventListener('change',e=>{if(!e.target.matches('[data-news-jump]')||!e.target.value)return;const version=e.target.value,all=newsFiltered(),index=all.findIndex(x=>x.version===version);if(index<0)return;newsState.page=Math.floor(index/10);renderNewsResults();document.getElementById('news-'+version.replace('.','-'))?.scrollIntoView({block:'center',behavior:'smooth'})});

let contentHistory=[];const contentHistoryState={search:'',from:'',to:'',sort:'newest',page:0};
function contentHistoryFiltered(){const term=contentHistoryState.search.trim().toLocaleLowerCase('ru-RU');return contentHistory.filter(x=>{const date=new Date(x.at).toLocaleDateString('sv-SE',{timeZone:'Europe/Moscow'});return (!term||[x.author||'',...x.changes].join(' ').toLocaleLowerCase('ru-RU').includes(term))&&(!contentHistoryState.from||date>=contentHistoryState.from)&&(!contentHistoryState.to||date<=contentHistoryState.to)}).sort((a,b)=>contentHistoryState.sort==='oldest'?a.at-b.at:b.at-a.at)}
function renderContentHistoryResults(){const box=$('#contentHistoryResults');if(!box)return;const all=contentHistoryFiltered(),pages=Math.max(1,Math.ceil(all.length/10));contentHistoryState.page=Math.max(0,Math.min(contentHistoryState.page,pages-1));box.innerHTML=`<p class="sub" role="status">Найдено записей: ${all.length}</p><div class="news-list">${all.slice(contentHistoryState.page*10,(contentHistoryState.page+1)*10).map(x=>`<article class="news-entry"><div class="news-entry-meta"><b class="news-version">Контент · ${x.id}</b><time datetime="${new Date(x.at).toISOString()}">${new Date(x.at).toLocaleString('ru-RU',{timeZone:'Europe/Moscow',dateStyle:'short',timeStyle:'short'})} МСК</time><span class="news-author">Автор: ${esc(x.author||'Имя не записано')}</span></div><ul class="content-change-list">${x.changes.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></article>`).join('')||'<div class="empty">Записей пока нет. Новые изменения контента появятся здесь после сохранения в админке.</div>'}</div><nav class="news-pages" aria-label="Страницы изменений контента"><button type="button" class="btn btn-ghost small" data-content-page="-1" ${contentHistoryState.page===0?'disabled':''}>← Назад</button><span>${contentHistoryState.page+1} / ${pages}</span><button type="button" class="btn btn-ghost small" data-content-page="1" ${contentHistoryState.page>=pages-1?'disabled':''}>Далее →</button></nav>`}
async function loadContentHistory(){const box=$('#contentHistoryResults');if(!box)return;box.innerHTML='<p class="sub" role="status">Загрузка истории…</p>';try{const data=await api('/api/admin/content-history');if($('#contentHistoryResults')!==box)return;contentHistory=data.entries||[];renderContentHistoryResults()}catch(err){if($('#contentHistoryResults')===box)box.innerHTML=`<p class="err" role="alert">${esc(err.message)}</p><button type="button" class="btn btn-ghost small" data-content-refresh>Повторить</button>`}}
document.addEventListener('input',e=>{const key=e.target.dataset.contentFilter;if(!key||!(key in contentHistoryState))return;contentHistoryState[key]=e.target.value;contentHistoryState.page=0;renderContentHistoryResults()});
document.addEventListener('click',e=>{if(e.target.closest('[data-content-refresh]'))loadContentHistory();const button=e.target.closest('[data-content-page]');if(button){contentHistoryState.page+=Number(button.dataset.contentPage);renderContentHistoryResults();$('#contentHistoryResults')?.scrollIntoView({block:'start'})}});





document.addEventListener('click',e=>{const row=e.target.closest('[data-open-order]');if(row){Object.assign(requestQueueState,{status:'all',kind:'all',query:row.dataset.openOrder,city:'all',from:'',to:'',sort:'attention'});return}const queue=e.target.closest('[data-today-queue]');if(queue){const value=queue.dataset.todayQueue,day=tomorrowISO();Object.assign(requestQueueState,{status:value==='tomorrow'?'active':value,kind:'all',query:'',city:'all',from:value==='tomorrow'?day:'',to:value==='tomorrow'?day:'',sort:value==='tomorrow'?'dateAsc':'attention'})}},true);









let adminBaseline=null,adminDirty=false,adminSaving=false,adminExitBusy=false,adminNavigationPermit=false,adminLastHash=routeHash();
function updateAdminSaveState(){window.apsuaAdminDirty=adminDirty;window.apsuaAdminSaving=adminSaving;$$('[data-admin-save]').forEach(button=>{button.disabled=adminSaving||!adminDirty;button.textContent=adminSaving?'Сохранение…':'Сохранить'});const status=$('#adminDraftStatus');if(status)status.textContent=adminSaving?'Сохранение на сервере…':adminDirty?'Есть несохранённые изменения':'Все изменения сохранены';if(adminDirty)admStatus('Изменения не сохранены')}
function stageAdminContent(){if(!adminBaseline)adminBaseline=clone(C);adminDirty=JSON.stringify(C)!==JSON.stringify(adminBaseline);updateAdminSaveState();return true}
const storeBeforeManualSave=store.set;store.set=function(key,value){if(key==='content'&&serverReady&&serverAdmin)return stageAdminContent();return storeBeforeManualSave(key,value)};
function resetAdminBaseline(){adminBaseline=clone(C);adminDirty=false;updateAdminSaveState()}
window.addEventListener('hashchange',e=>{const target=routeHash();if(adminNavigationPermit||!adminDirty){adminNavigationPermit=false;adminLastHash=target;return}e.stopImmediatePropagation();history.replaceState(null,'',location.pathname+location.search+adminLastHash);adminApp?.exitDraft(()=>{adminLastHash=target;location.hash=target})},true);

function bannerPhotos(target){const item=C[target];return Array.isArray(item?.photos)?item.photos.filter(Boolean):item?.photo?[item.photo]:[]}
// build 166: built-in banner photos also ship as WebP at several widths; the first hero photo is the page's main image.
const BANNER_SRCSET={"assets/lake2.jpg":"assets/opt/lake2-640.webp 640w,assets/opt/lake2-1024.webp 1024w,assets/opt/lake2-1280.webp 1280w,assets/opt/lake2-1600.webp 1600w","assets/ritsa-new.jpg":"assets/opt/ritsa-new-640.webp 640w,assets/opt/ritsa-new-1024.webp 1024w,assets/opt/ritsa-new-1280.webp 1280w,assets/opt/ritsa-new-1500.webp 1500w","assets/ritsa-wide.jpg":"assets/opt/ritsa-wide-640.webp 640w,assets/opt/ritsa-wide-1024.webp 1024w,assets/opt/ritsa-wide-1280.webp 1280w,assets/opt/ritsa-wide-1560.webp 1560w","assets/transfer-coast.webp":"assets/opt/transfer-coast-640.webp 640w,assets/opt/transfer-coast-1024.webp 1024w,assets/opt/transfer-coast-1280.webp 1280w,assets/opt/transfer-coast-1536.webp 1536w","assets/transfer-panorama.webp":"assets/opt/transfer-panorama-640.webp 640w,assets/opt/transfer-panorama-1024.webp 1024w,assets/opt/transfer-panorama-1280.webp 1280w,assets/opt/transfer-panorama-1600.webp 1600w"};
function bannerImages(target,scene,alt){const photos=bannerPhotos(target);return (photos.length?photos:[null]).map((photo,i)=>{const set=typeof photo==='string'&&Object.hasOwn(BANNER_SRCSET,photo)?BANNER_SRCSET[photo]:'';return `<img src="${esc(src(photo,scene,1600,900))}"${set?` srcset="${esc(set)}" sizes="(min-width: 1200px) 1200px, 100vw"`:''} alt="${esc(alt)}" class="${i?'':'on'}" ${i?'loading="lazy"':target==='hero'?'fetchpriority="high"':''}>`}).join('')}
function bannerPhotoEditor(target,label,note=''){const photos=bannerPhotos(target);return `<div class="field"><span>${esc(label)}</span><p class="sub">Первое фото показывается первым. Несколько снимков плавно сменяются. ${esc(note)} Изменения применятся после нажатия «Сохранить».</p><div class="tphotos banner-photo-editor" data-banner-drop="${target}">${photos.map((photo,i)=>`<figure><img src="${esc(src(photo))}" alt="Фото ${i+1}"><figcaption>${i===0?'<em>Первое фото</em>':''}<button type="button" class="ibtn" data-banner-action="left" data-banner-target="${target}" data-banner-index="${i}" aria-label="Переместить фото влево" ${i===0?'disabled':''}>${ICON.left}</button><button type="button" class="ibtn" data-banner-action="right" data-banner-target="${target}" data-banner-index="${i}" aria-label="Переместить фото вправо" ${i===photos.length-1?'disabled':''}>${ICON.right}</button><button type="button" class="ibtn danger" data-banner-action="delete" data-banner-target="${target}" data-banner-index="${i}" aria-label="Удалить фото">${ICON.trash}</button></figcaption></figure>`).join('')}<label class="tph-add">${ICON.plus}<span>Добавить фото</span><input type="file" accept="image/*" multiple data-banner-photos="${target}" hidden></label></div></div>`}
const photoEditorBeforeBanners=F.photo;F.photo=function(key,label,scene,note=''){if(key==='hero.photo'||key==='transfer.photo')return bannerPhotoEditor(key.split('.')[0],label,note);return photoEditorBeforeBanners(key,label,scene,note)};
document.addEventListener('dragover',e=>{const box=e.target.closest('[data-banner-drop]');if(box){e.preventDefault();box.classList.add('drag')}});
document.addEventListener('dragleave',e=>e.target.closest('[data-banner-drop]')?.classList.remove('drag'));
function advanceBanner(box){const images=$$('img',box);if(images.length<2)return;const active=images.findIndex(img=>img.classList.contains('on')),next=(active+1)%images.length;images.forEach((img,i)=>img.classList.toggle('on',i===next))}
setInterval(()=>{if(document.hidden||window.apsuaVisualActive)return;$$('.banner-gallery').forEach(box=>{const rect=box.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight)advanceBanner(box)})},5000);

document.addEventListener('keydown',e=>{if(!popEl||!['departure','district'].includes(popEl.dataset.kind)||!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;const options=$$('[role="option"]',popEl);if(!options.length)return;e.preventDefault();const current=options.indexOf(document.activeElement);const index=e.key==='Home'?0:e.key==='End'?options.length-1:(current+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options[index].focus()});

/* Compact trip selection and booking information. */
function comfortRead(key,fallback){try{return JSON.parse(localStorage.getItem('apsua-'+key)||JSON.stringify(fallback))}catch{return fallback}}
function comfortWrite(key,value){try{localStorage.setItem('apsua-'+key,JSON.stringify(value))}catch{}}
function comfortIds(key,max){const value=comfortRead(key,[]);return Array.isArray(value)?[...new Set(value.filter(id=>typeof id==='string'))].slice(0,max):[]}
let comparedTours=comfortIds('compare-tours',3);
let recentTours=comfortIds('recent-tours',12);
const tomorrowChoice={city:''},tripPicker={city:'',interest:'',duration:'any'};
function tomorrowISO(){const date=today0();date.setDate(date.getDate()+1);return iso(date)}
function rememberTour(id){const t=tourById(id);if(!t||t.hidden)return;recentTours=[id,...recentTours.filter(x=>x!==id)].slice(0,12);comfortWrite('recent-tours',recentTours)}
function availableTomorrow(city){const date=tomorrowISO();return C.tours.map(t=>tourPublic(t,date,city)).filter(Boolean)}
function pickTrips(options){return C.tours.map(t=>tourPublic(t,ui.q.date,options.city)).filter(Boolean).filter(t=>(!options.interest||t.cat===options.interest||tripStyles(t).includes(options.interest))&&(options.duration==='any'||options.duration==='short'&&Number(t.hours)>0&&Number(t.hours)<=6||options.duration==='day'&&Number(t.hours)>6)).sort((a,b)=>(a.price??Infinity)-(b.price??Infinity))}
function compactTrip(t,city='',date=''){const query=new URLSearchParams();if(city)query.set('city',city);if(date)query.set('date',date);return `<a class="comfort-mini" href="#/excursions/${encodeURIComponent(t.id)}${query.size?'?'+query.toString():''}"><img src="${esc(tourCover(t,300,200))}" alt="" loading="lazy"><span><b>${esc(t.title)}</b><small>${esc(t.dur||'')}${t.offerCity?' · '+esc(t.offerCity):''}</small><strong>${tourPriceHTML(t)}${t.price!=null?' / '+(t.offerKind==='individual'?'группа':'чел.'):''}</strong></span>${ICON.right}</a>`}
function recentToursHTML(){const list=recentTours.map(tourById).filter(t=>t&&!t.hidden).map(t=>tourPublic(t,'','')).filter(Boolean).slice(0,4);return list.length?`<details class="comfort-panel recent-panel" open><summary>Недавно смотрели <small>${list.length}</small></summary><div class="comfort-body comfort-mini-grid">${list.map(t=>compactTrip(t)).join('')}</div></details>`:''}
function comfortActionsHTML(){return `<div class="comfort-actions"><button type="button" class="btn btn-ghost small" data-show-tomorrow>Что доступно завтра</button><a class="btn btn-ghost small" href="#/pick">Подберите мне экскурсию</a><a class="btn btn-ghost small" href="#/compare">Сравнить <span data-compare-count>${comparedTours.length||''}</span></a></div><details class="comfort-panel tomorrow-panel" id="tomorrowPanel"><summary>Завтра · ${shortDate(tomorrowISO())}</summary><div class="comfort-body"><label class="field">Город выезда<select class="input" data-tomorrow-city><option value="">Все города</option>${allDepartureCities().map(city=>`<option value="${esc(city)}" ${(tomorrowChoice.city||ui.q.city)===city?'selected':''}>${esc(city)}</option>`).join('')}</select></label><div id="tomorrowResults"></div></div></details>`}
function renderTomorrow(){const box=$('#tomorrowResults');if(!box)return;const city=$('[data-tomorrow-city]')?.value||'',list=availableTomorrow(city);box.innerHTML=`<p class="comfort-note">По расписанию на ${shortDate(tomorrowISO())}. Места подтвердит организатор.</p><div class="comfort-mini-grid">${list.length?list.map(t=>compactTrip(t,city||t.offerCity,tomorrowISO())).join(''):'<p class="sub">На завтра подходящих маршрутов нет. Выберите другой город или дату в каталоге.</p>'}</div>`}
function preTripHTML(t){const info=t.preTrip||{},costs=lines(t.excl);return `<section class="comfort-panel pretrip" aria-labelledby="pretrip-title"><h2 id="pretrip-title">Перед бронированием</h2><div class="comfort-body"><dl class="pretrip-grid"><div><dt>С детьми</dt><dd>${esc(info.children||'Уточните возрастные ограничения у организатора.')}</dd></div><div><dt>Пешая нагрузка</dt><dd>${esc(info.walking||'Уточните длительность прогулок и сложность маршрута.')}</dd></div><div><dt>Что взять</dt><dd>${esc(info.packing||'Уточните список вещей перед поездкой.')}</dd></div><div><dt>Расходы на месте</dt><dd>${costs.length?costs.map(esc).join('<br>'):'Уточните дополнительные расходы у организатора.'}</dd></div></dl></div></section>`}
function compareToggleHTML(id){return `<button class="compare-toggle" type="button" data-compare-tour="${esc(id)}" aria-pressed="${comparedTours.includes(id)}" aria-label="${comparedTours.includes(id)?'Убрать из сравнения':'Добавить к сравнению'}">⇄ ${comparedTours.includes(id)?'Добавлено':'Сравнить'}</button>`}
const cardBeforeComparison=cardHTML;cardHTML=function(t){return cardBeforeComparison(t).replace(/(<span class="tag">[\s\S]*?<\/span>)(<\/div>)/,'$1'+compareToggleHTML(t.id)+'$2')};
function updateComparison(){comparedTours=comparedTours.filter(id=>C.tours.some(t=>t.id===id&&!t.hidden)).slice(0,3);comfortWrite('compare-tours',comparedTours);$$('[data-compare-tour]').forEach(button=>{const selected=comparedTours.includes(button.dataset.compareTour);button.setAttribute('aria-pressed',String(selected));if(!button.hasAttribute('data-comparison-add'))button.innerHTML='⇄ '+(selected?'Добавлено':'Сравнить');button.setAttribute('aria-label',(selected?'Убрать из сравнения: ':'Добавить к сравнению: ')+(tourById(button.dataset.compareTour)?.title||''))});$$('[data-compare-count]').forEach(node=>node.textContent=comparedTours.length||'');let tray=$('#comparisonTray');if(!tray){tray=document.createElement('div');tray.id='comparisonTray';tray.className='comparison-tray';document.body.append(tray)}tray.hidden=!comparedTours.length||current==='admin'||current==='compare';tray.innerHTML=`<span>Сравнить: <b>${comparedTours.length} из 3</b><small class="compare-selected-names">${comparedTours.map(id=>esc(tourById(id)?.title||'')).join(' · ')}</small></span><a class="btn btn-sea small" href="#/compare">Открыть</a><button class="btn btn-ghost small" type="button" data-clear-compare aria-label="Очистить сравнение">✕</button>`}
function toggleComparison(id){if(comparedTours.includes(id))comparedTours=comparedTours.filter(x=>x!==id);else{if(comparedTours.length>=3){toast('Можно сравнить до трёх экскурсий');return}comparedTours.push(id)}updateComparison();if(current==='compare')compareView()}
const comparisonUI={section:'all',differences:false,base:''};
const comparisonRoadData=new Map();
let comparisonRoadContext='';
function comparisonRows(){const departures=t=>[...new Set((tourSeason(t,ui.q.date||iso(today0()))?.departures||[]).filter(d=>d.enabled!==false).map(d=>d.city))];return [
 {id:'price',section:'main',label:'Стоимость',value:t=>t.offerUnavailable?'Недоступна на выбранную дату':tourPriceHTML(t)+(t.price!=null?' / '+(t.offerKind==='individual'?'группа':'человек'):''),key:t=>JSON.stringify([!!t.offerUnavailable,t.price??null,t.offerKind||'group'])},
 {id:'duration',section:'main',label:'Длительность',value:t=>esc(t.dur||'Уточняется')},
 {id:'format',section:'main',label:'Формат',value:t=>t.offerKind==='individual'?'Индивидуальная':esc(t.format||'Уточняется')},
 {id:'children',section:'main',label:'С детьми',value:t=>esc(t.preTrip?.children||'Уточняется')},
 {id:'stops',section:'route',label:'Остановки',value:t=>tourPins(t).map(p=>esc(PIN_NAMES[p]||p)).join(' → ')||'Уточняются'},
 {id:'cities',section:'route',label:'Города выезда',value:t=>departures(t).map(esc).join(', ')||'Уточняются'},
 {id:'distance',section:'route',label:'По дороге до последней остановки',value:t=>comparisonDistanceHTML(t),key:t=>comparisonDistance(t)??'unknown'},
 {id:'walking',section:'route',label:'Пешая нагрузка',value:t=>esc(t.preTrip?.walking||'Уточняется')},
 {id:'included',section:'terms',label:'Включено',value:t=>comparisonList(t.incl)},
 {id:'extra',section:'terms',label:'Дополнительно',value:t=>comparisonList(t.excl)},
 {id:'packing',section:'terms',label:'Что взять',value:t=>esc(t.preTrip?.packing||'Уточняется')},
 {id:'rating',section:'reviews',label:'Рейтинг гостей',value:t=>tourRatingHTML(t),key:t=>JSON.stringify(tourRating(t))},
 {id:'feedback',section:'reviews',label:'Отзывы об экскурсии',value:t=>comparisonReviewsHTML(t)}
]}
function comparisonReviewsHTML(t){const reviews=allReviews().filter(r=>r.t===t.id&&r.src!=='demo'&&Number(r.r)>=1&&Number(r.r)<=5);if(!reviews.length)return '<p class="comparison-no-reviews">Отзывов об этой экскурсии пока нет.</p>';return `<div class="comparison-reviews">${reviews.slice(0,3).map(r=>`<details><summary><span>${esc(r.n||'Гость')}</span><span class="stars" aria-label="${Number(r.r)} из 5">${'★'.repeat(Math.round(Number(r.r)))}</span></summary><p>${esc(r.x||'Отзыв без текста')}</p><small>${esc(r.d||'')}${r.verified?' · По завершённому заказу':''}</small></details>`).join('')}${reviews.length>3?`<small>Показано 3 из ${reviews.length}</small>`:''}<a class="linkbtn" href="#/excursions/${encodeURIComponent(t.id)}">Все отзывы об экскурсии</a></div>`}
function comparisonList(value){const items=lines(value);return items.length?'<ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'Уточняется'}
function comparisonRowDiffers(row,list){if(list.length<2)return false;return new Set(list.map(t=>String(row.key?row.key(t):row.value(t)).replace(/\s+/g,' ').trim().toLocaleLowerCase('ru'))).size>1}
function comparisonContentHTML(list,section=comparisonUI.section,differences=comparisonUI.differences){const base=comparisonBase(list),all=comparisonRows().filter(row=>section==='all'||row.section===section),rows=all.filter(row=>!differences||list.length<2||comparisonRowDiffers(row,list)),same=all.length-rows.length;return `${same?`<p class="compare-shared-note">${rows.length?'Общие параметры скрыты: '+same+'.':'В этом разделе условия совпадают.'} <button type="button" class="linkbtn" data-comparison-all>Показать всё</button></p>`:''}<div class="comparison-scroll"><div class="comparison-cards" style="--compare-count:${list.length};--compare-rows:${rows.length+2}">${list.map(t=>`<article class="comparison-card" aria-label="${esc(t.title)}"><header class="comparison-card-head"><div class="comparison-photo"><img src="${esc(tourCover(t,500,300))}" alt="${esc(t.title)}" loading="lazy"><button type="button" data-remove-compare="${esc(t.id)}" class="comparison-remove" aria-label="Убрать ${esc(t.title)} из сравнения">${ICON.close||'×'}</button></div>${t.id===base?.id?'<span class="comparison-base-mark">Сравниваем с этой</span>':''}<a class="comparison-title" href="#/excursions/${encodeURIComponent(t.id)}">${esc(t.title)}</a></header>${rows.map(row=>`<div class="comparison-value ${row.id==='price'?'is-price':''} ${comparisonRowDiffers(row,list)?'is-different':''}"><span class="comparison-label">${row.label}${comparisonRowDiffers(row,list)?'<i title="Значения отличаются" aria-label="Значения отличаются"></i>':''}</span><div>${row.value(t)}${comparisonDeltaHTML(row,t,base)}</div></div>`).join('')}<footer><a class="btn btn-sea" href="#/excursions/${encodeURIComponent(t.id)}">Подробнее ${ICON.chev}</a></footer></article>`).join('')}</div></div>`}
function comparisonBase(list){return list.find(t=>t.id===comparisonUI.base)||list.filter(t=>!t.offerUnavailable&&Number.isFinite(Number(t.price))&&t.price!=null).sort((a,b)=>Number(b.price)-Number(a.price))[0]||list[0]}
function comparisonHours(t){const hours=Number(t.hours);if(Number.isFinite(hours)&&hours>0)return hours;const match=String(t.dur||'').match(/^\s*(\d+(?:[.,]\d+)?)\s*(?:ч|час)/i);return match?Number(match[1].replace(',','.')):null}
function comparisonCity(list){if(ui.q.city)return ui.q.city;const sets=list.map(t=>(tourSeason(t,ui.q.date||iso(today0()))?.departures||[]).filter(d=>d.enabled!==false).map(d=>d.city));return sets[0]?.find(city=>sets.every(cities=>cities.includes(city)))||''}
function comparisonRoadKey(t){return comparisonRoadContext+'|'+tourPins(t).join(',')+'|'+tourPins(t).map(id=>GEO.pins[id]?.join(',')||'').join(';')}
function comparisonDistance(t){const item=comparisonRoadData.get(comparisonRoadKey(t));return item?.status==='ready'?item.km:null}
function comparisonDistanceHTML(t){const data=comparisonRoadData.get(comparisonRoadKey(t));if(!comparisonRoadContext)return 'Выберите общий город выезда в каталоге';if(data?.status==='ready')return esc(data.km.toLocaleString('ru-RU'))+' км · '+esc(comparisonRoadContext);if(data?.status==='error')return `Не удалось рассчитать <button class="linkbtn" type="button" data-comparison-road-retry="${esc(t.id)}">Повторить</button>`;return 'Рассчитываем по дорогам…'}
function comparisonDeltaHTML(row,t,base){if(!base||base.id===t.id)return '';let delta,label,positive=false;if(row.id==='price'){if(t.offerUnavailable||base.offerUnavailable||t.price==null||base.price==null||(t.offerKind==='individual')!==(base.offerKind==='individual'))return '';delta=Number(t.price)-Number(base.price);if(!Number.isFinite(delta)||!delta)return '';positive=delta<0;label=(positive?'Экономнее на ':'Дороже на ')+rub(Math.abs(delta))}else if(row.id==='duration'){const a=comparisonHours(t),b=comparisonHours(base);if(a==null||b==null)return '';delta=Math.round((a-b)*60);if(!delta)return '';const minutes=Math.abs(delta),time=(Math.floor(minutes/60)?Math.floor(minutes/60)+' ч ':'')+(minutes%60?minutes%60+' мин':'');positive=delta<0;label=(positive?'Короче на ':'Дольше на ')+time.trim()}else if(row.id==='distance'){const a=comparisonDistance(t),b=comparisonDistance(base);if(a==null||b==null)return '';delta=Math.round((a-b)*10)/10;if(!delta)return '';positive=delta<0;label=(positive?'Короче на ':'Длиннее на ')+Math.abs(delta).toLocaleString('ru-RU')+' км'}else return '';return `<span class="comparison-delta ${positive?'is-saving':'is-longer'}" title="По сравнению с ${esc(base.title)}">${esc(label)}</span>`}
async function loadComparisonDistances(list,forceId=''){if(!comparisonRoadContext)return;const context=comparisonRoadContext;await Promise.allSettled(list.map(async t=>{const key=comparisonRoadKey(t),cached=comparisonRoadData.get(key);if(cached&&t.id!==forceId)return;const pins=tourPins(t);comparisonRoadData.set(key,{status:'loading'});try{if(!pins.length||pins.some(id=>!GEO.pins[id]))throw new Error('Нет координат');const data=await api('/api/road-route?'+new URLSearchParams({from:context,stops:pins.join(',')}));if(!Number.isFinite(data.distanceKm)||data.distanceKm<0)throw new Error('Не удалось рассчитать');comparisonRoadData.set(key,{status:'ready',km:data.distanceKm})}catch{comparisonRoadData.set(key,{status:'error'})}if(current==='compare'&&comparisonRoadContext===context)refreshComparisonContent()}))}
document.addEventListener('click',e=>{const retry=e.target.closest('[data-comparison-road-retry]');if(retry){const t=tourById(retry.dataset.comparisonRoadRetry);if(t){loadComparisonDistances([t],t.id);refreshComparisonContent()}}});

function compareView(){current='compare';const list=comparedTours.map(tourById).filter(t=>t&&!t.hidden).map(t=>tourPublic(t)||{...t,offerUnavailable:true}),choices=C.tours.filter(t=>!t.hidden&&!comparedTours.includes(t.id)),base=comparisonBase(list);comparisonRoadContext=comparisonCity(list);app.innerHTML=`<div class="wrap comfort-page comparison-page"><a class="btn btn-ghost small" href="#/excursions">← К экскурсиям</a><header class="comparison-page-head"><div><h1>Сравнить экскурсии</h1><p>${list.length?list.length+' из 3 выбрано':'Добавьте до трёх экскурсий'}${ui.q.date?' · '+esc(shortDate(ui.q.date)):''}${ui.q.city?' · '+esc(ui.q.city):''}</p></div>${list.length<3?`<details class="comparison-add comparison-picker"><summary>＋ Добавить экскурсию</summary><div class="comparison-picker-panel"><label class="comparison-search"><span>Найти экскурсию</span><input class="input" type="search" data-comparison-search placeholder="Название экскурсии" autocomplete="off"></label><div class="comparison-picker-list" role="group" aria-label="Экскурсии для сравнения">${choices.map(t=>`<button type="button" class="comparison-picker-item" data-compare-tour="${esc(t.id)}" data-comparison-add data-comparison-title="${esc(t.title.toLocaleLowerCase('ru'))}" aria-pressed="false"><span>${esc(t.title)}</span><span class="comparison-picker-plus" aria-hidden="true">＋</span></button>`).join('')}</div><p class="comparison-picker-empty" data-comparison-empty ${choices.length?'hidden':''}>${choices.length?'Ничего не найдено. Попробуйте другое название.':'Все экскурсии уже добавлены.'}</p></div></details>`:''}</header>${list.length?`<div class="comparison-controls"><label class="comparison-reference">Сравниваем с<select class="input" data-comparison-base aria-label="Базовая экскурсия для расчёта разницы">${list.map(t=>`<option value="${esc(t.id)}" ${base?.id===t.id?'selected':''}>${esc(t.title)}</option>`).join('')}</select></label><label class="comparison-switch"><input type="checkbox" data-comparison-differences ${comparisonUI.differences?'checked':''} ${list.length<2?'disabled':''}><span aria-hidden="true"></span>Только различия</label></div><p class="comparison-road-note">Километраж — от города выезда до последней остановки, без сбора по отелям и обратной дороги.</p><div id="comparisonContent">${comparisonContentHTML(list)}</div>${list.length===1?'<p class="compare-shared-note">Добавьте ещё одну экскурсию, чтобы увидеть различия.</p>':''}`:'<div class="empty"><p>Нажмите «Добавить экскурсию» выше и выберите до трёх маршрутов.</p><a class="btn btn-sea small" href="#/excursions">Открыть экскурсии</a></div>'}</div>`;updateComparison();setNav('catalog');loadComparisonDistances(list)}
function refreshComparisonContent(){const list=comparedTours.map(tourById).filter(t=>t&&!t.hidden).map(t=>tourPublic(t)||{...t,offerUnavailable:true}),box=$('#comparisonContent');if(box)box.innerHTML=comparisonContentHTML(list);$$('[data-comparison-section]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.comparisonSection===comparisonUI.section)))}
document.addEventListener('click',e=>{const section=e.target.closest('[data-comparison-section]');if(section){comparisonUI.section=section.dataset.comparisonSection;refreshComparisonContent()}if(e.target.closest('[data-comparison-all]')){comparisonUI.differences=false;const check=$('[data-comparison-differences]');if(check)check.checked=false;refreshComparisonContent()}if(current==='compare'&&e.target.closest('[data-clear-compare]'))compareView()});
document.addEventListener('change',e=>{if(e.target.matches('[data-comparison-base]')){comparisonUI.base=e.target.value;refreshComparisonContent()}if(e.target.matches('[data-comparison-differences]')){comparisonUI.differences=e.target.checked;refreshComparisonContent()}});

function pickerView(){current='picker';app.innerHTML=`<div class="wrap comfort-page"><a class="btn btn-ghost small" href="#/excursions">← К экскурсиям</a><header class="page-head"><h1>Подберите мне экскурсию</h1></header><section class="comfort-panel"><form id="tripPicker" class="comfort-body picker-grid"><label class="field">1. Откуда выезжаете?<select class="input" data-picker="city"><option value="">Все города</option>${allDepartureCities().map(city=>`<option value="${esc(city)}" ${tripPicker.city===city?'selected':''}>${esc(city)}</option>`).join('')}</select></label><label class="field">2. Что интересно?<select class="input" data-picker="interest"><option value="">Всё</option>${Object.entries(CAT).map(([k,v])=>`<option value="${k}" ${tripPicker.interest===k?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label class="field">3. Сколько времени?<select class="input" data-picker="duration">${[['any','Любая длительность'],['short','До 6 часов'],['day','Больше 6 часов']].map(([k,v])=>`<option value="${k}" ${tripPicker.duration===k?'selected':''}>${v}</option>`).join('')}</select></label></form></section><div id="pickerResults" aria-live="polite"></div></div>`;renderPicker();setNav('catalog');updateComparison()}
function renderPicker(){const box=$('#pickerResults');if(!box)return;const list=pickTrips(tripPicker);box.innerHTML=`<p class="comfort-note">Подходит: ${list.length}. ${ui.q.date?'На '+shortDate(ui.q.date):'По текущему сезону'}. ${list.length?'Выберите маршрут, чтобы уточнить дату и условия.':''}</p><div class="comfort-mini-grid">${list.length?list.map(t=>compactTrip(t,tripPicker.city||t.offerCity,ui.q.date)).join(''):'<div class="empty">Совпадений нет. Попробуйте другую длительность, интерес или город.</div>'}</div>`}
const homeBeforeComfort=homeView;homeView=function(){homeBeforeComfort();const search=$('.home-search');if(search)search.insertAdjacentHTML('afterend',comfortActionsHTML());const catalog=$('.home-catalog');if(catalog)catalog.insertAdjacentHTML('afterend',recentToursHTML());renderTomorrow();updateComparison()};
const catalogBeforeComfort=catalogView;catalogView=function(...args){catalogBeforeComfort(...args);const header=$('#app .page-head');if(header)header.insertAdjacentHTML('afterend',comfortActionsHTML());const wrap=$('#app>.wrap');if(wrap)wrap.insertAdjacentHTML('beforeend',recentToursHTML());renderTomorrow();updateComparison()};
const tourBeforeComfort=tourView;tourView=function(id){tourBeforeComfort(id);const t=tourById(id),main=$('.tour-main');if(t&&main){rememberTour(id);main.insertAdjacentHTML('afterbegin',preTripHTML(t))}updateComparison()};

document.addEventListener('click',e=>{const compare=e.target.closest('[data-compare-tour]');if(compare){e.preventDefault();toggleComparison(compare.dataset.compareTour)}if(e.target.closest('[data-clear-compare]')){comparedTours=[];updateComparison()}const remove=e.target.closest('[data-remove-compare]');if(remove){comparedTours=comparedTours.filter(id=>id!==remove.dataset.removeCompare);comfortWrite('compare-tours',comparedTours);compareView()}if(e.target.closest('[data-show-tomorrow]')){const panel=$('#tomorrowPanel');if(panel){panel.open=!panel.open;if(panel.open){renderTomorrow();panel.scrollIntoView({block:'nearest',behavior:'smooth'})}}}});
document.addEventListener('change',e=>{if(e.target.matches('[data-tomorrow-city]')){tomorrowChoice.city=e.target.value;renderTomorrow()}const key=e.target.dataset.picker;if(key&&key in tripPicker){tripPicker[key]=e.target.value;renderPicker()}});

const tripStatusNames={private:'Ожидает оператора',pending:'Ожидает оператора',needs_info:'Нужно уточнение',confirmed:'Подтверждена',paid:'Принята в работу',awaiting_payment:'Ожидает оплаты',rejected:'Отклонена',completed:'Завершена',cancelled:'Отменена'};
orderStatusLabel=function(status){return tripStatusNames[status]||'Ожидает оператора'};
const tripStatusNotes={private:'Организатор проверит наличие мест и свяжется с вами.',pending:'Организатор проверит наличие мест и свяжется с вами.',needs_info:'Свяжитесь с организатором, чтобы уточнить детали.',confirmed:'Поездка подтверждена. Проверьте время и место встречи.',paid:'Оплата отмечена. Заявка принята и находится в работе.',awaiting_payment:'Оператор подтвердил заявку. Оплатите счёт, затем дождитесь проверки оплаты сервером.',rejected:'Оператор отклонил заявку. При необходимости свяжитесь с организатором.',completed:'Спасибо за поездку! Вы можете оставить отзыв.',cancelled:'Заявка отменена. При необходимости свяжитесь с организатором.'};
let myOrdersCache=null,myOrdersCacheUserId=null,ordersLoading=false;
function myTripOrders(){if(myOrdersCache&&myOrdersCacheUserId===serverIdentity?.id)return myOrdersCache;const user=serverIdentity?.id;return [...store.get('bookings',[]).map(x=>({...x,kind:'bookings'})),...store.get('transfers',[]).map(x=>({...x,kind:'transfers'}))].filter(x=>x.uid===user||!x.uid&&!serverAdmin).reverse()}
function tripOrderHTML(order){const tour=order.kind==='bookings'?tourById(order.tour):null,status=order.status||'pending',title=tour?.title||order.route||(order.kind==='bookings'?'Экскурсия':'Трансфер'),phone=String(order.contactPhone||C.site.phone||'').replace(/[^+0-9]/g,'');return `<article class="trip-order"><header><b>${esc(title)}</b><span class="trip-status ${esc(status)}">${tripStatusNames[status]||'Отправлена'}</span></header><small>№ ${esc(order.code)}</small><p class="comfort-note">${tripStatusNotes[status]||tripStatusNotes.pending}</p><dl class="trip-order-data"><div><dt>Когда</dt><dd>${order.date?human(fromIso(order.date)):'Дата уточняется'}${order.time?' · '+esc(order.time):''}</dd></div>${order.city?`<div><dt>Выезд</dt><dd>${esc(order.city)}</dd></div>`:''}<div><dt>Место встречи</dt><dd>${esc(order.meetingPoint||'Пока не подтверждено организатором')}</dd></div>${Object.hasOwn(order,'total')?`<div><dt>Стоимость заявки</dt><dd>${order.total==null?'По запросу':rub(order.total)}</dd></div>`:order.price!=null?`<div><dt>Стоимость</dt><dd>${rub(order.price)}</dd></div>`:''}</dl>${order.managerNote?`<p class="trip-manager-note">${esc(order.managerNote)}</p>`:''}<div class="comfort-actions">${['confirmed','paid','completed'].includes(status)&&order.date?`<button class="btn btn-ghost small" type="button" data-trip-calendar="${esc(order.code)}" data-trip-kind="${esc(order.kind)}">${ICON.cal} В календарь</button>`:''}${phone?`<a class="btn btn-ghost small" href="tel:${esc(phone)}">Связаться</a>`:''}${tour?`<a class="btn btn-ghost small" href="#/excursions/${encodeURIComponent(tour.id)}">Экскурсия</a>`:''}${order.kind==='bookings'&&(status==='completed'||status==='paid'&&order.date<=iso(today0()))?'<a class="btn btn-ghost small" href="#/account" data-open-review>Оставить отзыв</a>':''}</div></article>`}
function myOrdersSectionHTML(){const orders=myTripOrders();return `<details class="panel account-section" style="grid-column:1/-1" id="myTripOrders" open><summary><span>Мои бронирования</span><small data-my-order-count>${orders.length}</small></summary><div class="account-section-content"><div class="my-order-tools"><a class="orders-history-link" href="#/orders">Все заказы и история ${ICON.right}</a><button type="button" class="btn btn-ghost small" data-refresh-orders>Обновить</button></div><div id="myOrderList">${orders.length?orders.map(tripOrderHTML).join(''):'<p class="sub">Пока нет заявок. <a href="#/excursions">Выбрать экскурсию</a></p>'}</div><p class="comfort-note" id="myOrdersMessage" role="status"></p></div></details>`}
async function refreshMyOrders(){if(!serverIdentity||ordersLoading||!$('#myTripOrders'))return;ordersLoading=true;const message=$('#myOrdersMessage');try{const data=await api('/api/my-orders');myOrdersCache=data.orders||[];myOrdersCacheUserId=serverIdentity?.id;trackOrderUpdates(myOrdersCache||[]);const list=$('#myOrderList');if(list)list.innerHTML=myOrdersCache.length?myOrdersCache.map(tripOrderHTML).join(''):'<p class="sub">Пока нет заявок. <a href="#/excursions">Выбрать экскурсию</a></p>';const count=$('[data-my-order-count]');if(count)count.textContent=myOrdersCache.length;if(message)message.textContent='Статусы обновлены'}catch(err){if(message)message.textContent='Не удалось обновить: '+err.message}finally{ordersLoading=false}}
const accountBeforeTripStatus=accountView;accountView=function(){accountBeforeTripStatus();refreshMyOrders()};
setInterval(()=>{if(current==='account'&&!document.hidden)refreshMyOrders()},30000);
orderStatusLabel=function(status){return {private:'Новая заявка',pending:'Новая заявка',needs_info:'Нужно уточнение',paid:'Оплачено',completed:'Выполнено',confirmed:'Подтверждено',cancelled:'Отменено'}[status]||'Новая заявка'};

/* Owner-only bridge: visual drafts stay separate from admin content drafts. */
window.apsuaVisualBridge={
 canEdit:()=>serverReady&&serverAdmin&&!serverEditor,
 get:()=>clone(C.visualEditor||{version:1,pages:{}}),
 history:()=>api('/api/admin/visual-history'),
 async save(settings,restoreId){
  if(!serverReady||!serverAdmin||serverEditor)throw new Error('Доступ только владельцу');
  if(adminDirty||adminSaving)throw new Error('Сначала сохраните изменения в админке');
  adminSaving=true;updateAdminSaveState();
  try{const snapshot=clone(C);snapshot.visualEditor=clone(settings);const content=normalizeMedia(clone(snapshot));delete content.site.adminPass;const work=async()=>{const data=await api('/api/content',{method:'PUT',body:JSON.stringify({content,revision:contentRevision,...(restoreId===undefined?{}:{visualRestore:restoreId})})});contentRevision=data.revision};const result=serverQueue.then(work);serverQueue=result.catch(()=>{});await result;C.visualEditor=clone(settings);adminBaseline=snapshot;adminDirty=JSON.stringify(C)!==JSON.stringify(snapshot);window.dispatchEvent(new Event('admin-content-saved'))}finally{adminSaving=false;updateAdminSaveState()}
 },
 canOpen:()=>!adminDirty&&!adminSaving,
 toast
};

/* Shared stop catalog and configurable transfer form. */
const BASE_STOP_POINTS={gagra:[40.27,43.28],pitsunda:[40.34,43.16],ritsa:[40.535,43.478],gudauta:[40.63,43.11],afon:[40.815,43.09],suhum:[41.02,43.003],kamany:[41.1,43.09],gulripsh:[41.102,42.93],dranda:[41.158,42.875],ochamchira:[41.47,42.71],tkuarchal:[41.68,42.84],gal:[41.736,42.625]};
const BASE_STOPS=Object.entries(PIN_NAMES).filter(([id])=>id!=='psou').map(([id,name])=>({id,name,district:PIN_DIST[id],lon:BASE_STOP_POINTS[id]?.[0]??'',lat:BASE_STOP_POINTS[id]?.[1]??''}));
const BASE_MAP_POINTS=clone(GEO.pins);
function stopCatalog(){return Array.isArray(C.routeStops)?C.routeStops:BASE_STOPS}
function syncRouteStops(){for(const id of Object.keys(PIN_NAMES))if(id!=='psou'){delete PIN_NAMES[id];delete PIN_DIST[id];delete GEO.pins[id]}for(const stop of stopCatalog()){PIN_NAMES[stop.id]=stop.name;PIN_DIST[stop.id]=stop.district;PIN_LBL[stop.id]??=[12,-12,'start'];if(stop.lat!==''&&stop.lon!==''&&Number.isFinite(Number(stop.lat))&&Number.isFinite(Number(stop.lon)))GEO.pins[stop.id]=[(Number(stop.lon)-39.75)*416.6666667,(43.75-Number(stop.lat))*570.1333333];else if(BASE_MAP_POINTS[stop.id]&&stop.lat===undefined)GEO.pins[stop.id]=BASE_MAP_POINTS[stop.id]}}
const TRANSFER_TERMINALS=[{id:'sochi',name:'Аэропорт Адлер',add:0},{id:'adler',name:'Ж/д вокзал Адлер',add:0},{id:'sukhum',name:'Аэропорт Сухум',add:0},{id:'sukhum-rail',name:'Ж/д вокзал Сухум',add:0},{id:'gagra-rail',name:'Ж/д вокзал Гагра',add:0}];
function ensureTransferConfig(){const T=C.transfer;if(!T)return;T.from??=[];for(const point of TRANSFER_TERMINALS)if(!T.from.some(x=>x.id===point.id))T.from.push(clone(point));const adler=T.from.find(x=>x.id==='sochi');if(adler?.name==='Аэропорт Сочи')adler.name='Аэропорт Адлер';T.groupPolicy??={enabled:true,start:'05-01',end:'10-31'};T.hotels??=[]}
function transferGroupAvailable(date){const p=C.transfer.groupPolicy||{enabled:true,start:'05-01',end:'10-31'},md=String(date).slice(5);return !!p.enabled&&/^\d{2}-\d{2}$/.test(md)&&(p.start<=p.end?md>=p.start&&md<=p.end:md>=p.start||md<=p.end)}
function transferHotels(){return (C.transfer.hotels||[]).filter(h=>h.city===tr.to&&h.name&&h.address)}
function departureDeadlineOK(date,time,now=Date.now()){const at=Date.parse(date+'T'+time+':00+03:00');return Number.isFinite(at)&&at-now>=12*3600000}
function validateSiteConfig(content){const stops=content.routeStops||[],ids=new Set(),names=new Set();for(const s of stops){if(!s.id||ids.has(s.id)||!s.name?.trim()||names.has(s.name.trim().toLocaleLowerCase('ru')))return 'У каждой остановки должно быть уникальное название';ids.add(s.id);names.add(s.name.trim().toLocaleLowerCase('ru'));if((s.lat==='')!==(s.lon==='')||s.lat!==''&&s.lat!==undefined&&(!Number.isFinite(Number(s.lat))||!Number.isFinite(Number(s.lon))||Number(s.lat)<42||Number(s.lat)>44||Number(s.lon)<39||Number(s.lon)>43))return 'Проверьте координаты остановки: укажите широту и долготу или оставьте обе пустыми'}const policy=content.transfer?.groupPolicy;if(policy&&(!validMonthDay(policy.start)||!validMonthDay(policy.end)))return 'Укажите начало и конец сезона группового трансфера';for(const h of content.transfer?.hotels||[])if(!h.name?.trim()||!h.address?.trim()||!content.transfer.to.some(x=>x.id===h.city))return 'Укажите город, название и адрес каждого отеля';return ''}
function validMonthDay(md){if(!/^\d\d-\d\d$/.test(md||''))return false;const date=new Date('2024-'+md+'T12:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(5,10)===md}

window.addEventListener('admin-content-saved',syncRouteStops);window.addEventListener('admin-content-discarded',syncRouteStops);
let transferSending=false;


/* User journey: recoverable drafts, honest submissions and compact controls. */
window.addEventListener('hashchange',e=>{if(e.oldURL){const previous=routeHash(new URL(e.oldURL));uxScrollPositions.set(previous,scrollY);uxLastHash=previous}},true);
const uxDraftDismissed=new Set();let bookingSending=false,uxRestoringDraft=false;
function uxDraftKey(kind,id=''){return 'apsua-request-draft:'+String(serverIdentity?.id||'guest')+':'+kind+':'+id}
function readRequestDraft(kind,id=''){try{const key=uxDraftKey(kind,id),entry=JSON.parse(localStorage.getItem(key)||'null');if(!entry||Date.now()-entry.at>86400000){localStorage.removeItem(key);return null}return entry.data}catch{return null}}
function removeRequestDraft(kind,id=''){try{localStorage.removeItem(uxDraftKey(kind,id))}catch{}uxDraftDismissed.add(uxDraftKey(kind,id))}
function saveRequestDraft(kind){try{if(kind==='bookings'&&bk&&bk.step!=='done'){captureBookingFields();localStorage.setItem(uxDraftKey(kind,bk.t.id),JSON.stringify({at:Date.now(),data:{tour:bk.t.id,date:bk.date,time:bk.time,adults:bk.adults,kids:bk.kids,kind:bk.kind,city:departureCity,requestCode:bk.requestCode,preferredVehicleId:bk.preferredVehicleId||'',contact:bk.contact||{}}}));uxDraftDismissed.add(uxDraftKey(kind,bk.t.id))}if(kind==='transfers'&&tr.step!=='done'){captureTransferFields();localStorage.setItem(uxDraftKey(kind),JSON.stringify({at:Date.now(),data:Object.fromEntries(['requestCode','preferredVehicleId','direction','from','to','cls','date','time','pax','passengerNames','seat','name','phone','via','address','hotel','flight'].map(k=>[k,tr[k]]))}));uxDraftDismissed.add(uxDraftKey(kind))}}catch{}}
function captureBookingFields(){if(uxRestoringDraft)return;if(!bk||!$('#bkForm'))return;bk.contact=bk.contact||{};for(const [key,id]of [['name','bk-name'],['phone','bk-phone'],['hotel','bk-hotel'],['note','bk-note']]){const el=$('#'+id);if(el)bk.contact[key]=el.value}const via=$('input[name="via"]:checked');if(via)bk.contact.via=via.value}
function draftOfferHTML(kind,id=''){if(uxDraftDismissed.has(uxDraftKey(kind,id))||!readRequestDraft(kind,id))return '';return `<div class="request-draft-offer" role="status"><span>Есть незавершённая заявка</span><button type="button" class="linkbtn" data-draft-continue="${kind}">Продолжить</button><button type="button" class="linkbtn" data-draft-discard="${kind}">Удалить</button></div>`}
function bookingReviewHTML(){if(!bk)return '';return `<div class="request-review"><header><b>Ваша поездка</b><button class="linkbtn" type="button" data-bk="back">Изменить</button></header><span>${esc(bk.t.title)}</span><span>${esc(departureCity)} · ${bk.date?human(fromIso(bk.date)):''} · ${esc(bk.time||'')}</span><span>${bk.adults} взрослых${bk.kids?' · '+bk.kids+' детей':''} · ${bk.kind==='individual'?'индивидуальная':'групповая'}</span><strong>${bookingTotalLabel()}</strong>${lines(bk.t.excl).length?`<details><summary>Дополнительные расходы</summary><ul>${lines(bk.t.excl).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}<small>Стоимость и наличие мест подтвердит диспетчер.</small></div>`}
function transferReviewHTML(){const date=tr.date?fromIso(tr.date):today0(),months=['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'],day=String(date.getDate()).padStart(2,'0'),month=months[date.getMonth()]||'',flight=tr.flight.trim()||'Укажите номер',passengers=(tr.passengerNames||[]).map(x=>String(x).trim()).filter(Boolean).join(', ')||'Укажите имя и фамилию',destination=[tr.hotel.trim(),tr.address.trim()].filter(Boolean).join(' · ')||'Укажите отель или точный адрес',contact=[tr.name.trim(),tr.phone.trim(),tr.via].filter(Boolean).join(' · ');return `<article class="apsua-ticket transfer-booking-ticket" data-ticket-kind="transfers" data-ticket-status="pending" data-ticket-visual="intact"><div class="apsua-ticket-paper"><section class="apsua-ticket-main"><header class="apsua-ticket-heading"><span class="apsua-ticket-kind"><span class="apsua-ticket-badge">${orderTypeIcon('transfers')}</span>ТРАНСФЕР</span><button class="linkbtn" type="button" data-transfer-edit>Изменить</button></header><h3 class="apsua-ticket-title">${esc(transferRouteLabel())}</h3><small class="apsua-ticket-code">Предварительный билет</small><dl class="apsua-ticket-facts"><div><dt>Дата и время</dt><dd>${esc(shortDate(tr.date))} · ${esc(tr.time)}</dd></div><div><dt>Рейс / поезд</dt><dd>${esc(flight)}</dd></div><div><dt>Тип</dt><dd>${esc(tr.cls==='group'?'Групповой':'Индивидуальный')}${tr.seat?' · детское кресло':''}</dd></div><div class="apsua-ticket-wide"><dt>Пассажиры</dt><dd>${esc(passengers)}</dd></div><div class="apsua-ticket-wide"><dt>Куда</dt><dd>${esc(destination)}</dd></div>${contact?`<div class="apsua-ticket-wide"><dt>Контакт</dt><dd>${esc(contact)}</dd></div>`:''}</dl><div class="apsua-ticket-total"><b>${transferPriceLabel()}</b><span>Стоимость подтвердит диспетчер</span></div></section><aside class="apsua-ticket-stub" aria-label="Корешок предварительного билета"><div class="apsua-ticket-stub-top"><span>Апсуа Тур</span><small>ЗАЯВКА</small></div><div class="apsua-ticket-stub-date"><b>${day}</b><span>${month}</span></div><span class="apsua-ticket-stub-foot">ТРАНСФЕР · ${date.getFullYear()}</span></aside></div></article>`}
const bookingBeforeUX=renderBooking;renderBooking=function(){captureBookingFields();bookingBeforeUX();const box=$('#booking');if(!box||!bk)return;if(bk.step==='form'){const form=$('#bkForm');box.querySelector('.summary')?.remove();form?.insertAdjacentHTML('afterbegin',bookingReviewHTML());for(const [key,id]of [['name','bk-name'],['phone','bk-phone'],['hotel','bk-hotel'],['note','bk-note']]){const el=$('#'+id);if(el&&bk.contact?.[key]!=null)el.value=bk.contact[key]}if(bk.contact?.via)$$('input[name="via"]').forEach(el=>el.checked=el.value===bk.contact.via)}if(bk.step==='pick')box.insertAdjacentHTML('afterbegin',draftOfferHTML('bookings',bk.t.id));if(bk.step==='done')box.querySelector('.success h3').textContent='Заявка принята'};
const transferBeforeUX=renderTransfer;renderTransfer=function(){captureTransferFields();transferBeforeUX();const panel=$('#trPanel');if(!panel||tr.step==='done')return;panel.insertAdjacentHTML('afterbegin',draftOfferHTML('transfers'));const form=$('#trForm');form?.querySelector('.total')?.insertAdjacentHTML('beforebegin',`<div id="transferReview">${transferReviewHTML()}</div>`)};
function updateTransferReview(){const box=$('#transferReview');if(box)box.innerHTML=transferReviewHTML()}
function setRequestFieldError(id,errorId,message){const field=$('#'+id),error=$('#'+errorId);field?.classList.toggle('invalid',!!message);field?.setAttribute('aria-invalid',message?'true':'false');if(error)error.textContent=message;return !message}
function validateRequestFields(kind){let good=true;const errors=kind==='bookings'?[
 ['bk-name','e-name',String($('#bk-name')?.value||'').trim().length>=2?'':'Введите имя — минимум 2 символа.'],
 ['bk-phone','e-phone',phoneOk($('#bk-phone')?.value||'')?'':'Введите телефон из 10–11 цифр.'],
 ['bk-ok','e-ok',$('#bk-ok')?.checked?'':'Подтвердите согласие на обработку данных.']
 ]:[['tr-name','te-name',tr.name.trim().length>=2?'':'Введите имя — минимум 2 символа.'],['tr-phone','te-phone',phoneOk(tr.phone)?'':'Введите телефон из 10–11 цифр.'],['tr-via','te-via',['WhatsApp','Telegram','MAX'].includes(tr.via)?'':'Выберите WhatsApp, Telegram или MAX.'],['tr-address','te-address',tr.address.trim()?'':'Укажите улицу, дом или точный адрес объекта.'],['tr-time','te-time',/^\d\d:\d\d$/.test(tr.time)?'':'Укажите время рейса или поезда.']];for(const [id,errorId,message]of errors){if(!setRequestFieldError(id,errorId,message)&&good){$('#'+id)?.focus();good=false}}return good}
window.addEventListener('submit',async e=>{
 const form=e.target,kind=form.id==='bkForm'?'bookings':form.id==='trForm'?'transfers':null;if(!kind)return;e.preventDefault();e.stopImmediatePropagation();if(kind==='bookings'?bookingSending:transferSending)return;
 saveRequestDraft(kind);if(!serverIdentity){openTelegramSignin();return}if(!validateRequestFields(kind))return;
 const error=$(kind==='bookings'?'#bk-error':'#tr-error');if(error)error.textContent='';if(kind==='transfers'&&tr.direction==='departure'&&!departureDeadlineOK(tr.date,tr.time)){error.textContent='До отправления меньше 12 часов. Свяжитесь с менеджером.';return}
 if(kind==='bookings'&&(!bk.date||!bk.time||!tourOffer(tourById(bk.t.id)||bk.t,bk.date,departureCity,bk.kind).times.includes(bk.time))){error.textContent='Расписание изменилось. Выберите дату и время заново.';return}
 const button=$('button[type="submit"]',form);if(kind==='bookings')bookingSending=true;else transferSending=true;button.disabled=true;button.textContent='Отправляем…';window.apsuaRequestSending=true;form.setAttribute('aria-busy','true');const lockedControls=[...form.querySelectorAll('input,select,textarea,button')].map(el=>[el,el.disabled]);lockedControls.forEach(([el])=>el.disabled=true);
 const requestState=kind==='bookings'?bk:tr;
 const payload=kind==='bookings'?{code:bk.requestCode||(bk.requestCode=code('AT')),tour:bk.t.id,date:bk.date,time:bk.time,adults:bk.adults,kids:bk.kids,name:bk.contact.name.trim(),phone:bk.contact.phone.trim(),via:bk.contact.via||'WhatsApp',city:departureCity,format:bk.kind,season:bk.seasonName,total:bkTotal(),priceUnit:bk.kind==='individual'?'group':'person',hotel:bk.contact.hotel||'',note:bk.contact.note||''}:{code:tr.requestCode||(tr.requestCode=code('TR')),direction:tr.direction,terminalId:tr.from,cityId:tr.to,format:tr.cls==='group'?'group':'individual',route:transferRouteLabel(),date:tr.date,time:tr.time,cls:trCls().name,pax:tr.pax,passengerNames:tr.passengerNames.map(x=>x.trim()),seat:tr.seat,name:tr.name.trim(),phone:tr.phone.trim(),via:tr.via,address:tr.address.trim(),hotel:tr.hotel.trim(),flight:tr.flight.trim(),note:[tr.address,tr.hotel,tr.flight,tr.passengerNames.join(', ')].filter(Boolean).join(' · '),price:trPrice()};
 payload.preferredVehicleId=kind==='bookings'?bk.preferredVehicleId||'':tr.preferredVehicleId||'';saveRequestDraft(kind);payload.requestToken=payload.code;delete payload.code;
 try{await serverQueue;const ack=await api('/api/list',{method:'POST',body:JSON.stringify({kind,items:[payload]})});const accepted=ack.records?.find(x=>x.requestToken===payload.requestToken);if(!accepted?.code||!accepted.status)throw new Error('Сервер не вернул номер и статус заявки. Повторите отправку.');Object.assign(payload,accepted);serverLists[kind]=[...(serverLists[kind]||[]).filter(x=>x.code!==payload.code),payload];myOrdersCache=[{...accepted,kind},...myTripOrders().filter(x=>!(x.code===accepted.code&&x.kind===kind))];myOrdersCacheUserId=serverIdentity?.id;trackOrderUpdates(myOrdersCache||[]);openRequestResult({...accepted,kind});removeRequestDraft(kind,kind==='bookings'?payload.tour:'');if(kind==='bookings'&&bk!==requestState){toast('Заявка принята. Она доступна в личном кабинете.');return}toast('Заявка принята. Условия подтвердит диспетчер.');if(kind==='bookings'){bk.acceptedTotal=payload.total;departureCity=payload.city||departureCity;bk.kind=payload.format||bk.kind;bk.date=payload.date;bk.time=payload.time;bk.adults=payload.adults;bk.kids=payload.kids;bk.code=payload.code;bk.via=payload.via;bk.step='done';renderBooking();$('#booking')?.scrollIntoView({block:'start'})}else{Object.assign(tr,{acceptedPrice:payload.price,date:payload.date,time:payload.time,pax:payload.pax,address:payload.address,direction:payload.direction,from:payload.terminalId,to:payload.cityId,cls:payload.format});tr.code=payload.code;tr.step='done';renderTransfer();$('#trPanel')?.scrollIntoView({block:'start'})}}
 catch(err){if(err?.status===401&&typeof handleExpiredSession==='function'){handleExpiredSession(kind);if(error)error.textContent='Сессия входа истекла. Войдите снова — введённые данные заявки сохранены.';button.textContent='Отправить заявку'}else{if(error)error.textContent='Заявка не отправлена: '+err.message;button.textContent='Повторить отправку'}}finally{window.apsuaRequestSending=false;if(kind==='bookings')bookingSending=false;else transferSending=false;lockedControls.forEach(([el,disabled])=>el.disabled=disabled);button.disabled=false;form.removeAttribute('aria-busy')}
},true);
document.addEventListener('input',e=>{if(e.target.closest('#bkForm'))saveRequestDraft('bookings');if(e.target.closest('#trForm')){saveRequestDraft('transfers');updateTransferReview()}const map={'bk-name':'e-name','bk-phone':'e-phone','tr-name':'te-name','tr-phone':'te-phone','tr-via':'te-via','tr-address':'te-address','tr-time':'te-time'};if(map[e.target.id])setRequestFieldError(e.target.id,map[e.target.id],'')});
document.addEventListener('change',e=>{if(e.target.closest('#bkForm'))saveRequestDraft('bookings');if(e.target.closest('#trForm')){saveRequestDraft('transfers');updateTransferReview()}if(['departure-city','booking-kind'].includes(e.target.id))saveRequestDraft('bookings')});
document.addEventListener('click',e=>{
 const anchor=e.target.closest('[data-tour-anchor]');if(anchor){e.preventDefault();const id=anchor.dataset.tourAnchor,target=id==='tour-route'?$('#tourRoadRoute'):$('#'+id);target?.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});return}
 const resume=e.target.closest('[data-draft-continue]'),discard=e.target.closest('[data-draft-discard]');if(resume||discard){const kind=(resume||discard).dataset[resume?'draftContinue':'draftDiscard'],id=kind==='bookings'?bk.t.id:'';if(discard)removeRequestDraft(kind,id);else{const data=readRequestDraft(kind,id);uxDraftDismissed.add(uxDraftKey(kind,id));if(data&&kind==='bookings'){Object.assign(bk,{date:data.date&&fromIso(data.date)>=today0()?data.date:null,time:data.time,adults:Math.max(1,Number(data.adults)||1),kids:Math.max(0,Number(data.kids)||0),kind:data.kind,preferredVehicleId:data.preferredVehicleId||'',requestCode:data.requestCode,contact:data.contact||{},step:'pick'});departureCity=data.city||departureCity}else if(data){Object.assign(tr,data);if(fromIso(tr.date)<today0())tr.date=iso(today0());tr.step='form'}}uxRestoringDraft=true;try{if(kind==='bookings')renderBooking();else renderTransfer()}finally{uxRestoringDraft=false}return}
 if(e.target.closest('[data-transfer-edit]')){$('#tr-from')?.focus();$('#trForm')?.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
 if(e.target.closest('[data-time],[data-step],[data-bk],[data-day],[data-pick-date],[data-cal-any]')&&bk){if(e.target.closest('[data-bk="again"]'))delete bk.requestCode;saveRequestDraft('bookings')}
 if(e.target.closest('[data-pax],[data-tr]')||(e.target.closest('[data-pick-date]')&&current==='transfer')){if(e.target.closest('[data-tr="again"]'))delete tr.requestCode;saveRequestDraft('transfers')}
 const calendar=e.target.closest('[data-trip-calendar]');if(calendar){const order=myTripOrders().find(o=>o.code===calendar.dataset.tripCalendar&&o.kind===calendar.dataset.tripKind);const text=order&&tripCalendarICS(order);if(!text)return;const url=URL.createObjectURL(new Blob([text],{type:'text/calendar;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='apsua-trip-'+order.date+'.ics';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
});
function icsEscape(value){return String(value||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,')}
function icsFold(line){let result='',chunk='',bytes=0;for(const char of line){const n=char.codePointAt(0),size=n<128?1:n<2048?2:n<65536?3:4;if(bytes+size>75){result+=chunk+'\r\n';chunk=' ';bytes=1}chunk+=char;bytes+=size}return result+chunk}
function tripCalendarICS(order){if(!['confirmed','paid','completed'].includes(order.status)||!/^\d{4}-\d\d-\d\d$/.test(order.date||''))return null;const tour=order.kind==='bookings'?tourById(order.tour):null,title=tour?.title||order.route||'Поездка с Апсуа Тур',timed=order.kind==='bookings'&&/^\d\d:\d\d$/.test(order.time||''),date=order.date.replaceAll('-',''),start=timed?'DTSTART:'+new Date(order.date+'T'+order.time+':00+03:00').toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'):'DTSTART;VALUE=DATE:'+date;const description=['Заявка № '+order.code,order.kind==='transfers'&&order.time?'Время '+(order.direction==='departure'?'отправления':'прибытия')+' рейса / поезда: '+order.time:'',order.managerNote||'',order.contactPhone?'Контакт: '+order.contactPhone:''].filter(Boolean).join('\n');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Apsua Tour//Trips//RU','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+icsEscape(order.kind+'-'+order.code)+'@apsua-tour','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'),start,'SUMMARY:'+icsEscape(title),'LOCATION:'+icsEscape(order.meetingPoint||order.address||tour?.meet||''),'DESCRIPTION:'+icsEscape(description),'END:VEVENT','END:VCALENDAR'].map(icsFold).join('\r\n')+'\r\n'}


const requestQueueState={status:'all',kind:'all',query:'',city:'all',from:'',to:'',sort:'attention'};


/* Server-owned request receipt and operator/payment lifecycle. */
let requestResultDialog=null,requestResultOrder=null,resultUpdating=false;
function readReceiptPointer(){try{return JSON.parse(sessionStorage.getItem('apsua-request-result')||'null')}catch{return null}}
window.apsuaRequestResultOpen=!!readReceiptPointer();
function requestPaymentHTML(order){const payment=order.payment;if(payment?.verifiedAt)return `<p class="payment-verified">Оплата подтверждена сервером${order.paymentReviewRequired?' · требуется проверка оператором':''}.</p>`;if(!['confirmed','awaiting_payment'].includes(order.status))return '';if(!payment)return '<p class="comfort-note">Оператор подтвердил заявку. QR для оплаты появится после получения счёта от сервера.</p>';if(Date.parse(payment.expiresAt)<=Date.now())return '<p class="payment-expired">Срок оплаты истёк. Свяжитесь с оператором для получения нового счёта.</p>';const qr=safePaymentURL(payment.qrUrl,true),link=safePaymentURL(payment.paymentUrl);return `<section class="request-payment"><b>Оплата · ${rub(payment.amount)}</b>${qr?`<img class="payment-qr" src="${esc(qr)}" alt="QR-код для оплаты заявки ${esc(order.code)}">`:''}${link?`<a class="btn btn-sea small" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Открыть оплату</a>`:''}<small>Счёт до ${esc(new Date(payment.expiresAt).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'}))} (МСК)</small><p>После оплаты дождитесь подтверждения сервера.</p></section>`}
function safePaymentURL(value,image=false){if(!value)return '';if(image&&/^\/api\/media\/[a-f0-9-]{36}$/.test(value))return value;try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:''}catch{return ''}}
function requestFactsHTML(order){const rows=[['Дата',order.date?human(fromIso(order.date)):'Уточняется'],[order.kind==='transfers'?'Время рейса / поезда':'Время',order.time||'Уточняется'],['Выезд',order.city],['Формат',order.kind==='bookings'?(order.format==='individual'?'Индивидуальная':'Групповая'):transferFormatLabel(order)],['Гости',order.kind==='bookings'?`${order.adults||0} взрослых · ${order.kids||0} детей`:order.pax?`${order.pax} пассажиров`:null],['Имена пассажиров',Array.isArray(order.passengerNames)?order.passengerNames.join(', '):null],['Детское кресло',order.kind==='transfers'?(order.seat?'Нужно':'Не нужно'):null],['Имя',order.name],['Телефон',order.phone],['Связь',order.via],['Отель',order.hotel],['Адрес',order.address],['Рейс / поезд',order.flight],['Комментарий',order.note],['Место встречи',order.meetingPoint||'Диспетчер уточнит'],['Стоимость',Object.hasOwn(order,'total')?(order.total==null?'По запросу':rub(order.total)):order.price==null?'По запросу':rub(order.price)]];return `<dl class="request-facts">${rows.filter(([,value])=>value!=null&&value!=='').map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`}
function requestReceiptHTML(order){const status=order.status==='private'?'pending':order.status||'pending',tour=order.kind==='bookings'?tourById(order.tour):null;return `<div class="request-receipt"><p class="eyebrow">${order.kind==='bookings'?'Экскурсия':'Трансфер'}</p><h3>${esc(tour?.title||order.route||'Заявка на поездку')}</h3><div class="receipt-number"><span>Номер заявки</span><strong>${esc(order.code)}</strong></div><span class="trip-status ${esc(status)}">${tripStatusNames[status]||'Ожидает оператора'}</span><p class="comfort-note">${esc(tripStatusNotes[status]||tripStatusNotes.pending)}</p>${requestFactsHTML(order)}${order.managerNote?`<p class="trip-manager-note">${esc(order.managerNote)}</p>`:''}${requestPaymentHTML(order)}</div>`}
function closeRequestResult(){const dialog=requestResultDialog;if(!dialog)return;requestResultDialog=null;requestResultOrder=null;window.apsuaRequestResultOpen=false;try{sessionStorage.removeItem('apsua-request-result')}catch{}dialog.close();dialog.remove();document.body.style.overflow=dialog._previousOverflow||''}
function openRequestResult(order){if(!order?.code||!order?.kind)return;if(requestResultDialog)closeRequestResult();requestResultOrder=clone(order);window.apsuaRequestResultOpen=true;try{sessionStorage.setItem('apsua-request-result',JSON.stringify({code:order.code,kind:order.kind,uid:serverIdentity?.id}))}catch{}const dialog=document.createElement('dialog');dialog.className='request-result-dialog';dialog.setAttribute('aria-labelledby','request-result-title');dialog.innerHTML=`<header><div class="receipt-dialog-heading"><span class="receipt-heading-icon">${orderTypeIcon(order.kind)}</span><div><small>Апсуа Тур</small><h2 id="request-result-title">Ваша заявка</h2></div></div><button class="circle receipt-close" type="button" data-close-request-result aria-label="Закрыть">${closeReceiptIcon}</button></header><div id="requestResultBody">${requestReceiptHTML(order)}</div><p class="comfort-note" id="requestResultMessage" role="status"></p><footer><button class="btn btn-ghost small" type="button" data-refresh-request-result>Проверить статус / оплату</button><button class="btn btn-sea small" type="button" data-result-account>В личный кабинет</button></footer>`;dialog._previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';document.body.append(dialog);requestResultDialog=dialog;dialog.addEventListener('cancel',e=>{e.preventDefault();closeRequestResult()});dialog.addEventListener('close',()=>{if(requestResultDialog===dialog)closeRequestResult()});dialog.showModal()}
async function refreshRequestResult(){if(!serverIdentity||resultUpdating||!requestResultOrder)return;resultUpdating=true;const current=requestResultOrder,dialog=requestResultDialog,message=$('#requestResultMessage');try{const data=await api('/api/my-orders');myOrdersCache=data.orders||[];myOrdersCacheUserId=serverIdentity?.id;trackOrderUpdates(myOrdersCache||[]);const updated=myOrdersCache.find(o=>o.code===current.code&&o.kind===current.kind);if(!updated)throw new Error('Заявка не найдена в вашем аккаунте');if(requestResultDialog===dialog){requestResultOrder=updated;if(!window.apsuaClarificationDirty)$('#requestResultBody').innerHTML=requestReceiptHTML(updated);if(message)message.textContent='Статус получен от сервера'}}catch(err){if(requestResultDialog===dialog&&message)message.textContent='Не удалось обновить статус: '+err.message}finally{resultUpdating=false}}
async function restoreRequestResult(){const saved=readReceiptPointer();if(!saved){window.apsuaRequestResultOpen=false;return}if(!serverIdentity||saved.uid!==serverIdentity.id){window.apsuaRequestResultOpen=false;try{sessionStorage.removeItem('apsua-request-result')}catch{}return}const cached=myTripOrders().find(o=>o.code===saved.code&&o.kind===saved.kind);if(cached)openRequestResult(cached);try{const data=await api('/api/my-orders');myOrdersCache=data.orders||[];myOrdersCacheUserId=serverIdentity?.id;trackOrderUpdates(myOrdersCache||[]);const order=myOrdersCache.find(o=>o.code===saved.code&&o.kind===saved.kind);if(order)openRequestResult(order);else if(!cached){window.apsuaRequestResultOpen=false;sessionStorage.removeItem('apsua-request-result')}}catch{if(!cached){window.apsuaRequestResultOpen=false;toast('Результат доступен в личном кабинете. Не удалось обновить статус.')}}}
window.addEventListener('site-ready',restoreRequestResult);
setInterval(()=>{if(document.hidden)return;if(requestResultDialog)refreshRequestResult();else if(current==='account')refreshMyOrders()},15000);
document.addEventListener('click',e=>{if(e.target.closest('[data-close-request-result]'))closeRequestResult();if(e.target.closest('[data-refresh-request-result]'))refreshRequestResult();if(e.target.closest('[data-result-account]')){closeRequestResult();location.hash='#/account';if(current==='account')accountView()}const view=e.target.closest('[data-view-request]');if(view){const order=myTripOrders().find(o=>o.code===view.dataset.viewRequest&&o.kind===view.dataset.requestKind);if(order){openRequestResult(order);refreshRequestResult()}}});
const tripOrderBeforeReceipt=tripOrderHTML;tripOrderHTML=function(order){return tripOrderBeforeReceipt(order).replace('<div class="comfort-actions">',`<details class="order-all-data"><summary>Все данные заявки</summary>${requestFactsHTML(order)}${requestPaymentHTML(order)}</details><div class="comfort-actions"><button class="btn btn-ghost small" type="button" data-view-request="${esc(order.code)}" data-request-kind="${esc(order.kind)}">Открыть заявку</button>`)};

document.addEventListener('input',e=>{if(e.target.closest('.order-payment-editor'))e.target.closest('.order-admin-tools').dataset.paymentDirty='1'});

/* Persistent customer access to server-owned orders. */
const orderBagIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>';
const closeReceiptIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
const ordersBanner=document.createElement('aside');ordersBanner.className='orders-banner';ordersBanner.setAttribute('aria-label','Ваши заказы');ordersBanner.hidden=true;document.body.append(ordersBanner);
let customerOrdersLoading=false,customerOrdersError='',ordersFilter='active',ordersKindFilter='all';
function orderIsActive(order){return !['completed','cancelled','rejected'].includes(order.status)}
function customerOrdersSummary(orders){const active=orders.filter(orderIsActive),priority=orders.find(orderHasUnseen)||active.find(o=>o.status==='awaiting_payment')||active.find(o=>o.status==='needs_info')||active[0]||orders[0];return {active,total:orders.length,priority}}
function updateCustomerOrdersBanner(){const orders=serverIdentity?myTripOrders():[],state=customerOrdersSummary(orders);ordersBanner.hidden=!serverIdentity||!state.total||['admin','orders'].includes(current)||window.apsuaRequestResultOpen;if(ordersBanner.hidden)return;const order=state.priority,status=tripStatusNames[order.status]||tripStatusNames.pending,title=order.kind==='bookings'?tourById(order.tour)?.title||'Экскурсия':order.route||'Трансфер',count=state.active.length||state.total;ordersBanner.innerHTML=`<a class="orders-mobile-link" href="#/orders" aria-label="Мои заказы: ${count}"><span class="orders-banner-icon">${orderBagIcon}</span><span><b>Заказы <i>${count}</i></b><small>${esc(state.active.length?status:'История поездок')}</small></span></a><div class="orders-desktop-banner"><span class="orders-banner-icon">${orderBagIcon}</span><div class="orders-banner-copy"><a href="#/orders"><b>${state.active.length?'Ваши заказы':'История заказов'} <i>${count}</i></b></a><button class="linkbtn" type="button" data-view-request="${esc(order.code)}" data-request-kind="${esc(order.kind)}">${esc(title)}</button><small>${esc(customerOrdersError?'Не удалось обновить статус':status)}</small></div><a class="orders-banner-all" href="#/orders" aria-label="Все заказы">${ICON.right}</a></div>`}
/* Customer ticket, build 152. Every value comes from the order as the server returned it:
   no generated numbers, no 0 ₽ for a missing price, the look follows order.status only. */
function orderTicketData(order){const status=typeof order.status==='string'&&order.status?order.status:'pending',kind=order.kind==='transfers'?'transfers':'bookings',tour=kind==='bookings'?tourById(order.tour):null,dateText=String(order.date||''),date=/^\d{4}-\d{2}-\d{2}$/.test(dateText)?fromIso(dateText):null,valid=!!date&&!Number.isNaN(date.getTime())&&iso(date)===dateText,amount=Object.hasOwn(order,'total')?order.total:order.price,num=typeof amount==='number'?amount:typeof amount==='string'&&amount.trim()?Number(amount):NaN;let guests;if(kind==='transfers'){const pax=Number(order.pax);guests=Number.isInteger(pax)&&pax>0?pax+' пасс.':'Уточняется'}else{const a=Number(order.adults),k=Number(order.kids),adults=Number.isInteger(a)&&a>0?a:0,kids=Number.isInteger(k)&&k>0?k:0;guests=adults+kids?`${adults} взр.${kids?' · '+kids+' дет.':''}`:'Уточняется'}
 return {kind,status,tour,visual:['completed','cancelled','rejected'].includes(status)?status:'active',stamp:status==='cancelled'?'ОТМЕНЕНО':status==='rejected'?'ОТКЛОНЕНО':'',statusText:tripStatusNames[status]||'Статус уточняется',note:tripStatusNotes[status]||'',code:String(order.code??'').trim(),title:kind==='transfers'?(order.route||'Трансфер'):(tour?.title||'Экскурсия'),category:kind==='transfers'?'Трансфер':'Экскурсия',date:valid?human(date):'Дата уточняется',day:valid?String(date.getDate()):'—',month:valid?new Intl.DateTimeFormat('ru-RU',{month:'short'}).format(date).replace('.','').toUpperCase():'ДАТА',year:valid?String(date.getFullYear()):'',time:order.time?String(order.time):'Уточняется',timeLabel:kind==='transfers'?'Время рейса / поезда':'Время',guests,guestsLabel:kind==='transfers'?'Пассажиры':'Гости',placeLabel:kind==='transfers'?'Маршрут':'Выезд',place:kind==='transfers'?(order.route||'Уточняется'):(order.city||'Уточняется'),price:Number.isFinite(num)&&num>=0?rub(num):'По запросу'}}
function compactOrderHTML(order){const previous=tripOrderBeforeReceipt(order),start=previous.indexOf('<div class="comfort-actions">'),end=previous.lastIndexOf('</div></article>'),actions=start<0?'':previous.slice(start+'<div class="comfort-actions">'.length,end),t=orderTicketData(order),number=t.code?'№ '+esc(t.code):'Номер уточняется',photo=t.tour?tourCover(t.tour,960,720):'';return `<article class="trip-order order-card apsua-ticket" data-order-fingerprint="${orderCardFingerprint(order)}" data-customer-order="${esc(order.kind+':'+order.code)}" data-ticket-kind="${t.kind}" data-ticket-status="${esc(t.status)}" data-ticket-visual="${t.visual}"><div class="apsua-ticket-paper"><section class="apsua-ticket-main${photo?' has-photo':''}">${photo?`<img class="apsua-ticket-photo" src="${esc(photo)}" alt="" loading="lazy" decoding="async"><span class="apsua-ticket-photo-wash" aria-hidden="true"></span>`:''}<header class="apsua-ticket-heading"><span class="apsua-ticket-kind">${t.tour?'':`<span class="apsua-ticket-badge">${orderTypeIcon(order.kind)}</span>`}${t.category}${orderHasUnseen(order)?'<i class="order-unread-dot" aria-label="Статус изменился"></i>':''}</span><span class="apsua-ticket-state">${esc(t.statusText)}</span></header><h3 class="apsua-ticket-title">${esc(t.title)}</h3><small class="apsua-ticket-code">${number}</small><dl class="apsua-ticket-facts"><div><dt>Дата поездки</dt><dd>${esc(t.date)}</dd></div><div><dt>${t.timeLabel}</dt><dd>${esc(t.time)}</dd></div><div><dt>${t.guestsLabel}</dt><dd>${esc(t.guests)}</dd></div><div><dt>${t.placeLabel}</dt><dd>${esc(t.place)}</dd></div>${order.meetingPoint?`<div class="apsua-ticket-wide"><dt>Место встречи</dt><dd>${esc(order.meetingPoint)}</dd></div>`:''}</dl><div class="apsua-ticket-total"><b class="order-card-price">${esc(t.price)}</b><span>Стоимость заявки</span></div></section><aside class="apsua-ticket-stub" aria-label="Корешок билета: ${esc(t.statusText)}"><div class="apsua-ticket-stub-top"><span>Апсуа Тур</span><small>${number}</small></div><div class="apsua-ticket-stub-date"><b>${esc(t.day)}</b><span>${esc(t.month)}</span></div>${t.stamp?`<strong class="apsua-ticket-stamp" aria-hidden="true">${t.stamp}</strong>`:''}<span class="apsua-ticket-stub-foot">${t.category}${t.year?' · '+t.year:''}</span></aside></div><p class="order-card-note">${esc(t.note||tripStatusNotes.pending)}</p>${order.managerNote?`<p class="trip-manager-note">${esc(order.managerNote)}</p>`:''}<div class="comfort-actions order-card-actions"><button class="btn btn-sea small" type="button" data-view-request="${esc(order.code)}" data-request-kind="${esc(order.kind)}">${t.status==='awaiting_payment'?'QR и оплата':'Открыть заявку'}</button>${actions}</div></article>`}
tripOrderHTML=compactOrderHTML;
function expandedOrderKeys(root){return new Set($$('[data-customer-order]',root).filter(card=>card.querySelector('.order-all-data')?.open).map(card=>card.dataset.customerOrder))}
function restoreExpandedOrders(root,keys){$$('[data-customer-order]',root).forEach(card=>{const details=card.querySelector('.order-all-data');if(details)details.open=keys.has(card.dataset.customerOrder)})}
function renderCustomerOrders(){const target=$('#customerOrderList');if(!target)return;const expanded=expandedOrderKeys(target);const orders=myTripOrders(),filtered=orders.filter(o=>(ordersFilter!=='active'||orderIsActive(o))&&(ordersKindFilter==='all'||o.kind===ordersKindFilter));if(filtered.length)patchOrderCards(target,filtered);else target.innerHTML=`<div class="orders-empty">${orderBagIcon}<b>${customerOrdersLoading?'Загружаем заказы…':ordersFilter==='active'?'Активных заказов нет':'Заказов пока нет'}</b>${orders.length&&ordersFilter==='active'?'<button class="btn btn-ghost small" type="button" data-orders-filter="all">Посмотреть историю</button>':'<a class="btn btn-sea small" href="#/excursions">Выбрать экскурсию</a>'}</div>`;restoreExpandedOrders(target,expanded);$$('[data-orders-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ordersFilter===ordersFilter)));const message=$('#customerOrdersMessage');if(message)message.textContent=customerOrdersError?'Не удалось обновить заказы. Показаны последние полученные данные.':'';const count=$('#customerOrdersCount');if(count)count.textContent=String(orders.length)}
function ordersView(){const query=parseHash().q;ordersKindFilter=['bookings','transfers'].includes(query.kind)?query.kind:'all';if(query.view==='all')ordersFilter='all';if(!serverIdentity){app.innerHTML='<div class="wrap section"><h1>Мои заказы</h1><p class="sub">Войдите, чтобы посмотреть свои заявки.</p><a class="btn btn-sea" href="#/account">Войти</a></div>';return}app.innerHTML=`<section class="wrap orders-page"><header class="orders-page-head"><div><p class="eyebrow">Экскурсии и трансферы</p><h1>Мои заказы <span id="customerOrdersCount">${myTripOrders().length}</span></h1></div><button class="btn btn-ghost small" type="button" data-refresh-customer-orders>Обновить</button></header><div class="orders-page-tools" role="group" aria-label="Показать заказы"><button type="button" data-orders-filter="active" aria-pressed="${ordersFilter==='active'}">Активные</button><button type="button" data-orders-filter="all" aria-pressed="${ordersFilter==='all'}">Все заказы</button><a href="#/account">Личный кабинет ${ICON.right}</a></div>${orderKindFiltersHTML()}<p id="customerOrdersMessage" class="comfort-note" role="status"></p><div id="customerOrderList"></div></section>`;renderCustomerOrders();refreshCustomerOrders()}
async function refreshCustomerOrders(){if(!serverIdentity||customerOrdersLoading)return;const owner=serverIdentity.id;customerOrdersLoading=true;const before=JSON.stringify(myTripOrders()),beforeError=customerOrdersError;try{const data=await api('/api/my-orders');if(serverIdentity?.id!==owner)return;myOrdersCache=data.orders||[];myOrdersCacheUserId=serverIdentity?.id;trackOrderUpdates(myOrdersCache||[]);customerOrdersError='';if(current==='orders'&&(before!==JSON.stringify(myOrdersCache)||beforeError))renderCustomerOrders();if(current==='account'&&$('#myOrderList')){const list=$('#myOrderList');if(myOrdersCache.length)patchOrderCards(list,myOrdersCache);else list.innerHTML='<p class="sub">Пока нет заявок.</p>';const count=$('[data-my-order-count]');if(count)count.textContent=myOrdersCache.length}}catch(err){customerOrdersError=err.message;if(current==='orders')renderCustomerOrders()}finally{customerOrdersLoading=false;if(current==='orders'&&!myOrdersCache?.length)renderCustomerOrders();updateCustomerOrdersBanner()}}
const accountOrdersBeforeBanner=refreshMyOrders;refreshMyOrders=async function(){const root=$('#myOrderList'),expanded=root?expandedOrderKeys(root):new Set();await accountOrdersBeforeBanner();if(root&&root===$('#myOrderList'))restoreExpandedOrders(root,expanded);updateCustomerOrdersBanner()};
const receiptCloseBeforeBanner=closeRequestResult;closeRequestResult=function(){receiptCloseBeforeBanner();updateCustomerOrdersBanner()};
const receiptOpenBeforeBanner=openRequestResult;openRequestResult=function(order){receiptOpenBeforeBanner(order);updateCustomerOrdersBanner()};
const receiptRefreshBeforeBanner=refreshRequestResult;refreshRequestResult=async function(){await receiptRefreshBeforeBanner();updateCustomerOrdersBanner()};
window.addEventListener('site-ready',()=>{updateCustomerOrdersBanner();if(!readReceiptPointer()&&current!=='account')refreshCustomerOrders()});
setInterval(()=>{if(!document.hidden&&serverIdentity&&!requestResultDialog&&!['admin','account'].includes(current))refreshCustomerOrders()},20000);
document.addEventListener('click',e=>{if(e.target.closest('[data-refresh-customer-orders]'))refreshCustomerOrders();const filter=e.target.closest('[data-orders-filter]');if(filter){ordersFilter=filter.dataset.ordersFilter==='all'?'all':'active';renderCustomerOrders()}});

/* Live data patches, thematic order access and persistent unseen changes. */
const excursionOrderIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m2 20 8-14 4 7 3-5 5 12H2Z"/><path d="m7 11 3 2 3-2M15 12l2 2 2-2"/><circle cx="18.5" cy="4" r="1.5"/></svg>';
const transferOrderIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 9 2-5h10l2 5M4 10h16v9H4v-9ZM4 14h16M6 19v2M18 19v2M2 10h2M20 10h2"/><path d="M7 12h1M16 12h1"/></svg>';
function orderTypeIcon(kind){return kind==='transfers'?transferOrderIcon:excursionOrderIcon}
function orderAttentionKey(){return 'apsua-order-attention:'+String(serverIdentity?.id||'guest')}
function readOrderAttention(){try{return JSON.parse(localStorage.getItem(orderAttentionKey())||'null')||{known:{},unread:{}}}catch{return {known:{},unread:{}}}}
function writeOrderAttention(state){try{localStorage.setItem(orderAttentionKey(),JSON.stringify(state))}catch{}}
function orderAttentionId(order){return order.kind+':'+order.code}
function orderFingerprint(order){return String(hash(JSON.stringify([order.clarification?.id,order.clarification?.answeredAt,order.status==='private'?'pending':order.status,order.payment?.id,order.payment?.verifiedAt,order.payment?.expiresAt,order.meetingPoint,order.managerNote,order.contactPhone,order.date,order.time])))}
function trackOrderUpdates(orders){if(!serverIdentity)return;const state=readOrderAttention(),hadKnown=Object.keys(state.known).length>0,ids=new Set();for(const order of orders){if(!order.code||!order.kind)continue;const id=orderAttentionId(order),fingerprint=orderFingerprint(order);ids.add(id);if(state.known[id]!=null&&state.known[id]!==fingerprint||state.known[id]==null&&hadKnown)state.unread[id]=true;state.known[id]=fingerprint}for(const id of Object.keys(state.known))if(!ids.has(id)){delete state.known[id];delete state.unread[id]}writeOrderAttention(state);updateOrderAttentionBadge()}
function orderHasUnseen(order){return !!readOrderAttention().unread[orderAttentionId(order)]}
function markOrderViewed(order){if(document.hidden||!serverIdentity||!order)return;const state=readOrderAttention(),id=orderAttentionId(order);state.known[id]=orderFingerprint(order);delete state.unread[id];writeOrderAttention(state);updateOrderAttentionBadge()}
function updateOrderAttentionBadge(){const count=serverIdentity?Object.keys(readOrderAttention().unread).length:0;const base=String(document.title||'Апсуа Тур').replace(/^\(\d+\)\s*/,'');document.title=(count?'('+count+') ':'')+base;try{const job=count?navigator.setAppBadge?.(count):navigator.clearAppBadge?.();job?.catch?.(()=>{})}catch{}}
function orderKindLinkHTML(kind,orders){const rows=orders.filter(o=>o.kind===kind),unread=rows.filter(orderHasUnseen).length,label=kind==='bookings'?'Экскурсии':'Трансферы',count=rows.filter(orderIsActive).length||rows.length;return `<a class="order-kind-chip${unread?' has-unread':''}" href="#/orders?kind=${kind}${unread?'&view=all':''}" aria-label="${label}: ${count}${unread?', есть изменения статуса':''}"><span class="orders-kind-icon">${orderTypeIcon(kind)}${unread?'<i class="order-unread-dot" aria-hidden="true"></i>':''}</span><span><b>${label}</b><small>${unread?'Статус изменился':count?count+' '+plural(count,'заказ','заказа','заказов'):'Нет заказов'}</small></span></a>`}
function orderKindFiltersHTML(){return `<div class="orders-type-filter" role="group" aria-label="Тип заказа">${[['all','Все',orderBagIcon],['bookings','Экскурсии',excursionOrderIcon],['transfers','Трансферы',transferOrderIcon]].map(([kind,label,icon])=>`<button type="button" data-orders-kind="${kind}" aria-pressed="${ordersKindFilter===kind}">${icon}${label}</button>`).join('')}</div>`}
updateCustomerOrdersBanner=function(){updateOrderAttentionBadge();const orders=serverIdentity?myTripOrders():[],state=customerOrdersSummary(orders);ordersBanner.hidden=!serverIdentity||!state.total||['admin','orders'].includes(current)||window.apsuaRequestResultOpen;if(ordersBanner.hidden)return;const order=state.priority,title=order.kind==='bookings'?tourById(order.tour)?.title||'Экскурсия':order.route||'Трансфер',status=tripStatusNames[order.status]||tripStatusNames.pending,links=orderKindLinkHTML('bookings',orders)+orderKindLinkHTML('transfers',orders);const html=`<div class="orders-mobile-link">${links}</div><div class="orders-desktop-banner orders-desktop-types"><div class="orders-banner-latest"><button type="button" class="linkbtn" data-view-request="${esc(order.code)}" data-request-kind="${esc(order.kind)}">${esc(title)}</button><small>${esc(customerOrdersError?'Не удалось обновить статус':status)}</small></div><div class="orders-kind-links">${links}</div></div>`;if(ordersBanner.innerHTML!==html)ordersBanner.innerHTML=html;updateOrderAttentionBadge()};
const receiptOpenBeforeUnread=openRequestResult;openRequestResult=function(order){markOrderViewed(order);receiptOpenBeforeUnread(order)};
const resultRefreshBeforeUnread=refreshRequestResult;refreshRequestResult=async function(){await resultRefreshBeforeUnread();if(requestResultOrder&&!document.hidden)markOrderViewed(requestResultOrder);updateCustomerOrdersBanner()};
document.addEventListener('click',e=>{const button=e.target.closest('[data-orders-kind]');if(button){ordersKindFilter=button.dataset.ordersKind;$$('[data-orders-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ordersKind===ordersKindFilter)));renderCustomerOrders()}});
function refreshVisibleOrders(){return requestResultDialog?refreshRequestResult():refreshCustomerOrders()}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){updateOrderAttentionBadge();refreshVisibleOrders()}});window.addEventListener('focus',refreshVisibleOrders);window.addEventListener('pageshow',refreshVisibleOrders);
function orderCardFingerprint(order){return String(hash(JSON.stringify(order)))}
function patchOrderCards(root,orders){const existing=[...root.querySelectorAll('[data-customer-order]')];if(!existing.length){root.innerHTML=orders.map(compactOrderHTML).join('');return}const wanted=new Set(orders.map(orderAttentionId));for(const card of existing)if(!wanted.has(card.dataset.customerOrder))card.remove();for(const [index,order]of orders.entries()){const key=orderAttentionId(order);let card=[...root.querySelectorAll('[data-customer-order]')].find(n=>n.dataset.customerOrder===key);const expanded=card?.querySelector('.order-all-data')?.open;if(!card){root.insertAdjacentHTML('beforeend',compactOrderHTML(order));card=[...root.querySelectorAll('[data-customer-order]')].find(n=>n.dataset.customerOrder===key)}else if(card.dataset.orderFingerprint!==orderCardFingerprint(order)&&!card.querySelector('form[data-clarification-reply]')?.contains?.(document.activeElement)){card.outerHTML=compactOrderHTML(order);card=[...root.querySelectorAll('[data-customer-order]')].find(n=>n.dataset.customerOrder===key);const details=card?.querySelector('.order-all-data');if(details)details.open=!!expanded}if(card&&root.children[index]!==card)root.insertBefore(card,root.children[index]||null)}}
refreshMyOrders=refreshCustomerOrders;
window.apsuaPartialUpdatesReady=true;let liveDataSyncing=false,liveDataAgain=false,liveDataSafe=false,liveDataRetryAt=0,liveDataRetryTimer;
async function syncLiveData(event={detail:{contentSafe:true}}){const authEpoch=clientAuthEpoch;liveDataSafe=liveDataSafe||!!event.detail?.contentSafe;if(liveDataSyncing){liveDataAgain=true;return}if(Date.now()<liveDataRetryAt){clearTimeout(liveDataRetryTimer);liveDataRetryTimer=setTimeout(()=>syncLiveData({detail:{contentSafe:liveDataSafe}}),liveDataRetryAt-Date.now());return;}liveDataSyncing=true;try{
 await refreshVisibleOrders();const data=await api('/api/state');if(authEpoch!==clientAuthEpoch)return;const contentChanged=Number(data.revision)>Number(contentRevision),userChanged=Object.hasOwn(data,'user')&&JSON.stringify(data.user)!==JSON.stringify(serverIdentity),rolesChanged=Object.hasOwn(data,'admin')&&(!!data.admin!==serverAdmin||!!data.editor!==serverEditor||(data.staffRole||'')!==serverStaffRole);const adminOrdersChanged=serverAdmin&&current==='admin'&&['bookings','transfers'].some(kind=>JSON.stringify(data.lists?.[kind]||[])!==JSON.stringify(serverLists[kind]||[]));const otherChanged=['reviews','diary','questions'].some(kind=>JSON.stringify(data.lists?.[kind]||[])!==JSON.stringify(serverLists[kind]||[]));
 const safe=!window.apsuaAuthPending&&liveDataSafe&&(window.apsuaLiveCanPatch?.()??true)&&!window.apsuaAdminDirty&&!window.apsuaAdminSaving&&!window.apsuaVisualActive&&!window.apsuaVisualDirty&&!window.apsuaRequestSending&&!window.apsuaRequestResultOpen&&!document.activeElement?.matches?.('input,textarea,select');
 if((contentChanged||otherChanged||adminOrdersChanged||userChanged||rolesChanged)&&!safe){window.dispatchEvent(new Event('site-data-retry'));return}
 if(safe&&(contentChanged||otherChanged||adminOrdersChanged||userChanged||rolesChanged)){
  if(userChanged||rolesChanged){serverIdentity=data.user;serverLists.user=data.user;serverAdmin=!!data.admin;serverEditor=!!data.editor;serverStaffRole=data.staffRole||'';Object.assign(serverLists,data.lists||{});myOrdersCache=null;myOrdersCacheUserId=null;updateCustomerOrdersBanner()}
  const y=scrollY,booking=bk?{...bk,contact:bk.contact?{...bk.contact}:null}:null,transferStep=tr.step;captureBookingFields();
  if(contentChanged){C=mergeDefaults(data.content,clone(DEFAULT));ensureTransferConfig();syncRouteStops();contentRevision=data.revision;resetAdminBaseline()}
  for(const kind of ['reviews','diary','questions'])serverLists[kind]=data.lists?.[kind]||[];
  if(serverAdmin&&current==='admin'){if(adminDirty)return;Object.assign(serverLists,data.lists||{});route()}
  else if(contentChanged||userChanged||rolesChanged||['reviews','diary','account'].includes(current)){renderChrome();route();if(booking&&bk?.t.id===booking.t.id){Object.assign(bk,{date:booking.date,time:booking.time,adults:booking.adults,kids:booking.kids,kind:booking.kind,step:booking.step,contact:booking.contact});renderBooking()}if(current==='transfer'&&transferStep==='done'){tr.step=transferStep;renderTransfer()}scrollTo(0,y)}
 }
 liveDataRetryAt=0;
 }catch{liveDataRetryAt=Date.now()+5000;window.dispatchEvent(new Event('site-data-retry'))}finally{liveDataSyncing=false;liveDataSafe=false;if(liveDataAgain){liveDataAgain=false;setTimeout(()=>syncLiveData({detail:{contentSafe:true}}),100)}}}
window.addEventListener('site-data-updated',syncLiveData);

const orderClarificationLabels={name:'Имя',phone:'Телефон',hotel:'Отель',address:'Точный адрес',flight:'Рейс / поезд',date:'Дата поездки',time:'Время',note:'Комментарий',manual:'Свободный вопрос'};
const clarificationDrafts=new Map();let ordersBannerExpanded=false;
function clarificationDraftKey(order){return order.kind+':'+order.code+':'+order.clarification?.id}
function clarificationReplyHTML(order){const q=order.clarification;if(!q)return '';if(q.answeredAt){if(order.status!=='pending'||q.reviewedAt)return '';return `<p class="clarification-answer-note">${q.field==='manual'?'Ответ передан оператору':'Поле «'+esc(orderClarificationLabels[q.field]||q.field)+'» исправлено'} · ожидает проверки.</p>`}if(order.status!=='needs_info')return '';const value=clarificationDrafts.get(clarificationDraftKey(order))??(q.field==='manual'?'':order[q.field]||''),input=q.field==='date'||q.field==='time'?`<input class="input" name="answer" type="${q.field}" value="${esc(value)}" required>`:`<textarea class="input" name="answer" rows="2" maxlength="2000" required>${esc(value)}</textarea>`;return `<form class="order-answer-form" data-clarification-reply="${esc(q.id)}" data-code="${esc(order.code)}" data-kind="${esc(order.kind)}"><div><b>Нужно уточнение${q.field==='manual'?'':': '+esc(orderClarificationLabels[q.field]||q.field)}</b><p>${esc(q.prompt)}</p></div><label class="field"><span>Ваш ответ</span>${input}</label><small>${q.field==='manual'?'Ответ увидит оператор.':'После отправки выбранное поле заявки исправится автоматически.'}</small><p class="err" data-answer-error role="alert"></p><button type="submit" class="btn btn-sea small">Отправить уточнение</button></form>`}
const receiptBeforeClarification=requestReceiptHTML;requestReceiptHTML=function(order){return receiptBeforeClarification(order)+clarificationReplyHTML(order)};
const compactBeforeClarification=compactOrderHTML;compactOrderHTML=function(order){return compactBeforeClarification(order).replace('<div class="comfort-actions order-card-actions">',clarificationReplyHTML(order)+'<div class="comfort-actions order-card-actions">')};tripOrderHTML=compactOrderHTML;

function updateClarificationDirty(){window.apsuaClarificationDirty=$$('form[data-clarification-reply]').some(form=>clarificationDrafts.has(form.dataset.kind+':'+form.dataset.code+':'+form.dataset.clarificationReply))}
document.addEventListener('input',e=>{const form=e.target.closest('form[data-clarification-reply]');if(form){clarificationDrafts.set(form.dataset.kind+':'+form.dataset.code+':'+form.dataset.clarificationReply,e.target.value);updateClarificationDirty()}});
document.addEventListener('submit',async e=>{const form=e.target;if(!form.dataset.clarificationReply)return;e.preventDefault();e.stopImmediatePropagation();const button=$('button[type=submit]',form),error=$('[data-answer-error]',form),input=$('[name=answer]',form);if(button.disabled)return;if(!input.value.trim()){error.textContent='Введите ответ';input.focus();return}button.disabled=true;button.textContent='Отправляем…';error.textContent='';try{const data=await api('/api/order-clarification',{method:'POST',body:JSON.stringify({code:form.dataset.code,kind:form.dataset.kind,clarificationId:form.dataset.clarificationReply,answer:input.value})});const order=data.order;if(!order?.code)throw new Error('Сервер не вернул результат уточнения');myOrdersCache=[order,...myTripOrders().filter(o=>o.kind!==order.kind||o.code!==order.code)];myOrdersCacheUserId=serverIdentity?.id;const row=serverLists[order.kind]?.find(o=>o.code===order.code);if(row)Object.assign(row,order);clarificationDrafts.delete(form.dataset.kind+':'+form.dataset.code+':'+form.dataset.clarificationReply);window.apsuaClarificationDirty=false;markOrderViewed(order);if(requestResultOrder?.code===order.code&&requestResultOrder.kind===order.kind){requestResultOrder=order;$('#requestResultBody').innerHTML=requestReceiptHTML(order)}if(current==='orders')renderCustomerOrders();if(current==='account')await refreshCustomerOrders();updateCustomerOrdersBanner();toast('Уточнение отправлено оператору')}catch(err){error.textContent=err.message;button.textContent='Повторить отправку'}finally{button.disabled=false;updateClarificationDirty()}},true);
document.addEventListener('click',async e=>{const button=e.target.closest('[data-send-clarification]');if(!button||button.disabled||!serverAdmin||serverEditor)return;const root=button.closest('.order-admin-tools'),editor=button.closest('.order-clarification-editor'),field=$('[data-clarification-field]',root).value,prompt=$('[data-clarification-prompt]',root).value.trim(),error=$('[data-clarification-admin-error]',root);if(!field||field==='manual'&&prompt.length<3){error.textContent='Выберите пункт или напишите свободный вопрос';return}button.disabled=true;error.textContent='';try{await serverQueue;const data=await api('/api/order-status',{method:'PUT',body:JSON.stringify({id:button.dataset.sendClarification,kind:button.dataset.orderKind,status:'needs_info',clarification:{field,prompt}})});const row=serverLists[button.dataset.orderKind]?.find(o=>o.code===button.dataset.sendClarification);if(row)Object.assign(row,data.order);const select=$('[data-order-status]',root);select.value='needs_info';select.dataset.currentStatus='needs_info';$('.clarification-latest',root).innerHTML='<p class="hint">Запрос отправлен. Ожидаем ответ пользователя.</p>';window.dispatchEvent(new CustomEvent('order-operation-saved',{detail:{root:editor}}));toast('Запрос уточнения отправлен')}catch(err){error.textContent=err.message}finally{button.disabled=false}});
const closeBeforeClarification=closeRequestResult;closeRequestResult=function(){closeBeforeClarification();updateClarificationDirty()};
updateCustomerOrdersBanner=function(){updateOrderAttentionBadge();const orders=serverIdentity?myTripOrders().filter(orderIsActive):[],state=customerOrdersSummary(orders);ordersBanner.hidden=!serverIdentity||!orders.length||['admin','orders'].includes(current)||window.apsuaRequestResultOpen;if(ordersBanner.hidden){ordersBannerExpanded=false;ordersBanner.classList.remove('is-expanded');return}const order=state.priority,unread=orders.some(orderHasUnseen),positive=['confirmed','paid'].includes(order.status),icons=`<span class="orders-fold-icons">${orderTypeIcon('bookings')}${orderTypeIcon('transfers')}${unread?'<i class="order-unread-dot" aria-hidden="true"></i>':''}</span>`,links=orderKindLinkHTML('bookings',orders)+orderKindLinkHTML('transfers',orders);ordersBanner.classList.toggle('has-positive',positive);ordersBanner.classList.toggle('is-expanded',ordersBannerExpanded);const html=`<button class="orders-banner-toggle" type="button" data-toggle-orders-banner aria-expanded="${ordersBannerExpanded}">${icons}<b>Заказы <i>${orders.length}</i></b><span class="orders-fold-arrow">${ICON.chev}</span></button><div class="orders-banner-drawer"><div><div class="orders-banner-latest"><button class="linkbtn" type="button" data-view-request="${esc(order.code)}" data-request-kind="${esc(order.kind)}">${esc(order.kind==='bookings'?tourById(order.tour)?.title||'Экскурсия':order.route||'Трансфер')}</button><small>${esc(tripStatusNames[order.status]||tripStatusNames.pending)}</small></div><div class="orders-kind-links">${links}</div></div></div>`;if(ordersBanner.innerHTML!==html)ordersBanner.innerHTML=html};
document.addEventListener('click',e=>{if(e.target.closest('[data-toggle-orders-banner]')){ordersBannerExpanded=!ordersBannerExpanded;ordersBanner.classList.toggle('is-expanded',ordersBannerExpanded);e.target.closest('[data-toggle-orders-banner]').setAttribute('aria-expanded',String(ordersBannerExpanded));return}if(ordersBannerExpanded&&!ordersBanner.contains(e.target)){ordersBannerExpanded=false;ordersBanner.classList.remove('is-expanded');$('[data-toggle-orders-banner]',ordersBanner)?.setAttribute('aria-expanded','false')}});
function outsideDialogBounds(event,dialog){const rect=dialog.getBoundingClientRect();return Number.isFinite(event.clientX)&&Number.isFinite(event.clientY)&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)}
function photoBackdropClick(event,image){if(!image)return true;if(event.target!==image)return true;const r=image.getBoundingClientRect(),w=image.naturalWidth,h=image.naturalHeight;if(!w||!h)return false;const scale=Math.min(r.width/w,r.height/h),left=r.left+(r.width-w*scale)/2,top=r.top+(r.height-h*scale)/2;return event.clientX<left||event.clientX>left+w*scale||event.clientY<top||event.clientY>top+h*scale}
document.addEventListener('click',e=>{const dialog=e.target;if(dialog.tagName==='DIALOG'&&dialog.open&&outsideDialogBounds(e,dialog)){const cancel=new Event('cancel',{cancelable:true});dialog.dispatchEvent(cancel);if(!cancel.defaultPrevented&&dialog.open)dialog.close();return}if(e.target.classList?.contains('question-layer'))$('[data-close-question]',e.target)?.click()});

/* One persistent navigation back control, independent of card redraws. */
function floatingBackState(offset){return Number(offset)>70}
function pageBackCandidate(root){return Array.from(root.querySelectorAll('a')).find(link=>link.classList.contains('tour-back-glass')||/^\s*←\s*\S/.test(link.textContent)||/^Назад(?:\s|$)/.test(link.textContent.trim()))||null}
let floatingBackControl=null,floatingBackSource=null,floatingBackFrame=0;
let floatingBackTop='',floatingBackPositionFrame=0;function queueFloatingBackPosition(){if(floatingBackPositionFrame||typeof requestAnimationFrame!=='function')return;floatingBackPositionFrame=requestAnimationFrame(()=>{floatingBackPositionFrame=0;positionFloatingBack()})}
function positionFloatingBack(){if(!floatingBackControl||floatingBackControl.hidden)return;const header=$('.header'),bottom=header?.getBoundingClientRect?.().bottom||0,top=Math.max(10,bottom+9)+'px';if(top!==floatingBackTop){floatingBackTop=top;floatingBackControl.style.setProperty('--back-top',top)}floatingBackControl.classList.toggle('is-compact',floatingBackState(window.scrollY||0))}
function syncFloatingBack(){const source=pageBackCandidate(app);if(!floatingBackControl){floatingBackControl=document.createElement('a');floatingBackControl.className='floating-page-back';floatingBackControl.hidden=true;document.body.appendChild(floatingBackControl)}if(!source||current==='admin'){floatingBackControl.hidden=true;floatingBackSource=null;return}const label=source.textContent.replace(/^\s*←\s*/,'').trim()||'Назад',href=source.getAttribute('href')||'#/';floatingBackSource=source;$$('.floating-back-source',app).forEach(node=>node.classList.remove('floating-back-source'));const matching=source.classList.contains('tour-back-glass')?$$('.tour-back-glass',app):[source];matching.forEach(node=>{node.classList.add('floating-back-source');node.setAttribute('tabindex','-1');node.setAttribute('aria-hidden','true')});floatingBackControl.href=href;floatingBackControl.setAttribute('aria-label',source.getAttribute('aria-label')||'Назад: '+label);floatingBackControl.title=label;const html=ICON.left+'<span class="floating-back-label">'+esc(label)+'</span>';if(floatingBackControl.innerHTML!==html)floatingBackControl.innerHTML=html;floatingBackControl.hidden=false;positionFloatingBack()}
function scheduleFloatingBack(){if(floatingBackFrame||typeof requestAnimationFrame!=='function')return;floatingBackFrame=requestAnimationFrame(()=>{floatingBackFrame=0;syncFloatingBack()})}
if(typeof MutationObserver!=='undefined'){new MutationObserver(scheduleFloatingBack).observe(app,{childList:true,subtree:true})}
window.addEventListener('scroll',queueFloatingBackPosition,{passive:true});window.addEventListener('resize',queueFloatingBackPosition,{passive:true});window.addEventListener('hashchange',scheduleFloatingBack);window.addEventListener('pageshow',scheduleFloatingBack);scheduleFloatingBack();

// Shared appearance is a content draft; only the isolated sample reflects unsaved edits.
const GLASS_PRESETS=[['Apple','#0071e3','#0071e3'],['Лёд','#ffffff','#e8f3fc'],['Голубой','#208dc2','#125e88'],['Лаванда','#7864b1','#4d427d'],['Персик','#edac80','#b36b49'],['Графит','#444b55','#242a32'],['Мята','#5a987e','#356751']];
function appearanceDefault(dark=false){return {blur:20,opacity:100,shine:0,shadow:0,radius:22,border:0,angle:180,weight:500,neutral:{start:dark?'#3a3a3c':'#e8e8ed',end:dark?'#3a3a3c':'#e8e8ed',text:dark?'#f5f5f7':'#1d1d1f'},accent:{start:dark?'#0a84ff':'#0071e3',end:dark?'#0a84ff':'#0071e3',text:'#ffffff'},panels:{start:dark?'#1c1c1e':'#ffffff',end:dark?'#1c1c1e':'#ffffff',text:dark?'#f5f5f7':'#1d1d1f'}}}
function appearanceNormalize(value,dark=false){const d=appearanceDefault(dark),v=value&&typeof value==='object'?value:{},out={};for(const [k,min,max] of [['blur',0,40],['opacity',20,100],['shine',0,100],['shadow',0,40],['radius',0,28],['border',0,3],['angle',0,360]])out[k]=Math.max(min,Math.min(max,Number.isFinite(Number(v[k]))?Number(v[k]):d[k]));out.weight=[400,500,600,700].includes(Number(v.weight))?Number(v.weight):600;for(const k of ['neutral','accent','panels']){out[k]={};for(const c of ['start','end','text','outline'])out[k][c]=/^#[\da-f]{6}$/i.test(v[k]?.[c]||'')?v[k][c]:(d[k][c]||(dark?'#505761':'#aec6d5'))}return out}
function appearanceRGBA(hex,alpha){return `rgba(${[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',')},${alpha})`}
function appearanceVariables(value,dark=false){const v=appearanceNormalize(value,dark),alpha=v.opacity/100,gradient=(kind,add=0)=>`linear-gradient(${v.angle}deg,${appearanceRGBA(v[kind].start,Math.min(1,alpha+add))},${appearanceRGBA(v[kind].end,Math.min(1,alpha+add))})`,shadow=`0 ${Math.round(v.shadow/2)}px ${v.shadow*2}px rgba(0,0,0,${dark?.3:.1}),inset 0 1px 1px rgba(255,255,255,${v.shine/100})`;return {'--control-bg':gradient('neutral'),'--control-hover':gradient('neutral',.07),'--control-ink':v.neutral.text,'--control-line':v.neutral.outline,'--control-accent-line':v.accent.outline,'--control-accent':gradient('accent'),'--control-accent-hover':gradient('accent',.07),'--control-accent-ink':v.accent.text,'--control-shadow':shadow,'--control-radius':v.radius+'px','--control-blur':v.blur+'px','--control-border-width':v.border+'px','--control-weight':v.weight,'--custom-panel-bg':gradient('panels'),'--custom-panel-ink':v.panels.text,'--custom-panel-line':v.panels.outline}}
function applyAppearance(){const config=(adminDirty&&adminBaseline?adminBaseline:C).controlAppearance;let style=$('#siteControlAppearance');if(!config){style?.remove();return}if(!style){style=document.createElement('style');style.id='siteControlAppearance';document.head.append(style)}style.textContent=['light'].map(mode=>`html[data-theme=${mode}]{${Object.entries(appearanceVariables(config[mode],false)).map(([k,v])=>k+':'+v+';').join('')}}`).join('')+'html body :is(.panel,.card,.glass,.adm-card,.booking,.map-side,.orders-empty,.comfort-panel){background:var(--custom-panel-bg)!important;color:var(--custom-panel-ink)!important;border-color:var(--custom-panel-line)!important;--ink:var(--custom-panel-ink)}'}
let appearanceMode='light',appearanceKind='neutral';
function appearanceDraft(){if(!C.controlAppearance)C.controlAppearance={light:appearanceDefault(),dark:appearanceDefault(true)};return C.controlAppearance}
function appearanceEditorHTML(){const dark=appearanceMode==='dark',v=appearanceNormalize(C.controlAppearance?.[appearanceMode],dark),path='controlAppearance.'+appearanceMode;const color=(key,label)=>`<label class="field"><span>${label}</span><input type="color" value="${v[appearanceKind][key]}" data-k="${path}.${appearanceKind}.${key}" aria-label="${label}"></label>`,range=(key,label,min,max,unit='')=>`<label class="field appearance-range"><span>${label}<output data-appearance-output="${key}">${v[key]}${unit}</output></span><input type="range" min="${min}" max="${max}" value="${v[key]}" data-t="num" data-k="${path}.${key}" data-unit="${unit}"></label>`;return `<div class="appearance-editor" id="appearanceEditor"><div class="appearance-tools"><label class="field"><span>Что настраиваем</span><select class="input" data-appearance-kind>${[['neutral','Обычные кнопки'],['accent','Главные кнопки'],['panels','Плашки и карточки']].map(([k,n])=>`<option value="${k}" ${appearanceKind===k?'selected':''}>${n}</option>`).join('')}</select></label><button type="button" class="btn btn-ghost small" data-appearance-reset>Сбросить оформление</button></div><div class="appearance-palette" aria-label="Готовые градиенты">${GLASS_PRESETS.map(([n,a,b],i)=>`<button type="button" data-appearance-preset="${i}" title="${n}" aria-label="Градиент ${n}"><i style="background:linear-gradient(135deg,${a},${b})"></i><span>${n}</span></button>`).join('')}</div><div class="appearance-colors">${color('start','Начало градиента')}${color('end','Конец градиента')}${color('text','Цвет текста')}${color('outline','Цвет обводки')}</div><div class="appearance-sliders">${range('opacity','Непрозрачность',20,100,'%')}${range('blur','Размытие стекла',0,40,' px')}${range('shine','Блик',0,100,'%')}${range('shadow','Тень',0,40)}${range('radius','Скругление',0,28,' px')}${range('border','Обводка',0,3,' px')}${range('angle','Угол градиента',0,360,'°')}<label class="field"><span>Толщина текста</span><select class="input" data-k="${path}.weight" data-t="num">${[400,500,600,700].map(w=>`<option value="${w}" ${v.weight===w?'selected':''}>${w}</option>`).join('')}</select></label></div><div class="appearance-sample" id="appearanceSample" data-preview-theme="${appearanceMode}"><div class="appearance-sample-panel"><b>Пример плашки</b><span>Результат до сохранения</span><div><button type="button" class="btn btn-ghost">Обычная кнопка</button><button type="button" class="btn btn-sea">Главная кнопка</button></div><div class="appearance-sample-types"><button type="button" class="ibtn" aria-label="Пример кнопки с иконкой">${ICON.plus}</button><button type="button" class="circle" aria-label="Пример стрелки фото">${ICON.right}</button><button type="button" class="btn btn-ghost small">← Назад</button><button type="button" class="chip" aria-pressed="true">Выбрано</button><label class="switch"><input type="checkbox" checked aria-label="Пример переключателя"><i></i><span>Включено</span></label><button type="button" class="day">15</button></div></div></div><p class="hint">Все типы кнопок и переключателей используют эти настройки. Предпросмотр меняется сразу. На сайт настройки попадут после «Сохранить». Слишком прозрачный фон может снизить читаемость текста.</p></div>`}
function refreshAppearancePreview(){const box=$('#appearanceSample');if(!box)return;for(const [k,v] of Object.entries(appearanceVariables(C.controlAppearance?.[appearanceMode],appearanceMode==='dark')))box.style.setProperty(k,String(v));$$('[data-appearance-output]').forEach(n=>{const input=$(`[data-k="controlAppearance.${appearanceMode}.${n.dataset.appearanceOutput}"]`);if(input)n.textContent=input.value+(input.dataset.unit||'')})}
function redrawAppearanceEditor(){const root=$('#appearanceEditor');if(root){root.outerHTML=appearanceEditorHTML();refreshAppearancePreview()}}

const chromeBeforeAppearance=renderChrome;renderChrome=function(...args){const result=chromeBeforeAppearance.apply(this,args);applyAppearance();return result};
document.addEventListener('input',e=>{if(e.target.dataset.k?.startsWith('controlAppearance.')){appearanceDraft();setTimeout(refreshAppearancePreview,0)}});
document.addEventListener('change',e=>{if(e.target.matches('[data-appearance-mode]')){appearanceMode=e.target.value;redrawAppearanceEditor()}if(e.target.matches('[data-appearance-kind]')){appearanceKind=e.target.value;redrawAppearanceEditor()}if(e.target.dataset.k?.startsWith('controlAppearance.'))setTimeout(refreshAppearancePreview,0)});
window.addEventListener('admin-content-saved',applyAppearance);window.addEventListener('admin-content-discarded',applyAppearance);

/* Shared browser/Worker rules. This catalog describes transport, never live inventory. */
(function(root){
 'use strict';
 const types={sedan:'Седан',minivan:'Минивэн',minibus:'Микроавтобус',bus:'Автобус',suv:'Внедорожник',offroad:'Высокая проходимость'};
 const safePhoto=value=>typeof value==='string'&&value.length<=2000&&(/^(?:https:\/\/|\/api\/media\/|\/?assets\/)/i.test(value))&&!/[<>"\u0000-\u001f]/.test(value)?value:'';
 function examples(){return Object.entries(types).map(([type,name])=>({id:'example-'+type,name,type,capacity:null,luggage:null,photos:[],features:[],transfer:type!=='offroad',excursion:true,individual:true,group:['minivan','minibus','bus'].includes(type),hidden:false,example:true,transferClassIds:[]}))}

 // Owner-supplied presentation, 2026-10-16. Editorial model images, not dispatched vehicles.
 function presentationVehicles(){return [{"id":"presentation-toyota-camry","name":"Toyota Camry","type":"sedan","capacity":4,"luggage":null,"photos":["/assets/fleet/camry.webp"],"features":[],"transfer":true,"excursion":false,"individual":true,"group":false,"hidden":false,"example":false,"transferClassIds":[]},{"id":"presentation-hyundai-h1","name":"Hyundai H-1","type":"minivan","capacity":8,"luggage":null,"photos":["/assets/fleet/hyundai-h1.webp"],"features":[],"transfer":true,"excursion":false,"individual":true,"group":true,"hidden":false,"example":false,"transferClassIds":[]},{"id":"presentation-sprinter-vip","name":"Mercedes Sprinter VIP","type":"minibus","capacity":19,"luggage":null,"photos":["/assets/fleet/sprinter-vip.webp"],"features":[],"transfer":true,"excursion":true,"individual":true,"group":true,"hidden":false,"example":false,"transferClassIds":[]},{"id":"presentation-sprinter-transfer","name":"Mercedes Sprinter · 15 мест","type":"minibus","capacity":15,"luggage":null,"photos":["/assets/fleet/sprinter-transfer.webp"],"features":[],"transfer":true,"excursion":false,"individual":true,"group":true,"hidden":false,"example":false,"transferClassIds":[]},{"id":"presentation-toyota-coaster","name":"Toyota Coaster","type":"bus","capacity":22,"luggage":null,"photos":["/assets/fleet/coaster.webp"],"features":[],"transfer":true,"excursion":true,"individual":true,"group":true,"hidden":false,"example":false,"transferClassIds":[]},{"id":"presentation-man-irizar","name":"MAN Irizar","type":"bus","capacity":59,"luggage":null,"photos":["/assets/fleet/man-irizar.webp"],"features":[],"transfer":true,"excursion":false,"individual":true,"group":true,"hidden":false,"example":false,"transferClassIds":[]},{"id":"presentation-uaz-patriot","name":"УАЗ Patriot","type":"offroad","capacity":null,"luggage":null,"photos":["/assets/fleet/patriot.webp"],"features":[],"transfer":false,"excursion":true,"individual":true,"group":true,"hidden":false,"example":false,"transferClassIds":[]},{"id":"presentation-sprinter-vario","name":"Mercedes Sprinter Vario","type":"minibus","capacity":30,"luggage":null,"photos":["/assets/fleet/sprinter-vario.webp"],"features":[],"transfer":false,"excursion":true,"individual":true,"group":true,"hidden":false,"example":false,"transferClassIds":[]},{"id":"presentation-toyota-sequoia","name":"Toyota Sequoia","type":"suv","capacity":7,"luggage":null,"photos":["/assets/fleet/sequoia.webp"],"features":[],"transfer":false,"excursion":true,"individual":true,"group":true,"hidden":false,"example":false,"transferClassIds":[]},{"id":"presentation-sprinter-excursion","name":"Mercedes Sprinter · 8 мест","type":"minibus","capacity":8,"luggage":null,"photos":["/assets/fleet/sprinter-excursion.webp"],"features":[],"transfer":false,"excursion":true,"individual":true,"group":true,"hidden":false,"example":false,"transferClassIds":[]}]}
 function companyDefaults(){return {"title":"О компании «Апсуа Тур»","intro":"Экскурсии, трансферы и размещение в Абхазии. Знакомим с республикой с 2005 года.","body":"В 2005 году «Апсуа Тур» начал работу с автобусных экскурсий и джипинга. С 2011 года развиваем трансферное направление, а с 2017-го — комплексный туристический сервис.\nОрганизуем групповые и индивидуальные поездки по Абхазии: экскурсии к природным и историческим достопримечательностям, пешие и комбинированные маршруты, активный отдых и паломнические программы. Основные города выезда групповых экскурсий — Сухум и Новый Афон.\nПомогаем с трансфером к месту отдыха и обратно, подбором гостиниц, пансионатов и частного размещения. Транспорт подбирается под маршрут и состав группы; конкретный автомобиль подтверждает диспетчер.\nСобственный колл-центр работает круглосуточно. Команда сопровождает поездку от обработки заявки до встречи и обратного трансфера.","partners":"Приглашаем к сотрудничеству туроператоров, отели и организаторов групповых поездок. Обсудим трансфер, экскурсионные программы, размещение и комплексное сопровождение гостей.\nЭкскурсии: apsuatur@mail.ru\nТрансферы: atransfer@mail.ru\nРазмещение: apsua.hotel@mail.ru\nКоммерческое предложение и индивидуальные условия предоставим по запросу."}}
 function vehicles(content,hidden=false){const list=Array.isArray(content?.fleet?.vehicles)?content.fleet.vehicles:presentationVehicles();return list.filter(v=>v&&typeof v.id==='string'&&(hidden||!v.hidden))}
 function eligible(content,options={}){return vehicles(content).filter(v=>{
  if(options.kind==='bookings'){if(!v.excursion)return false;const ids=options.tour?.vehicleIds;if(Array.isArray(ids)&&ids.length&&!ids.includes(v.id))return false}
  // build 166: transfers have two formats only (individual/group); vehicle classes and stored transferClassIds no longer filter cars.
  else if(options.kind==='transfers'){if(!v.transfer)return false}
  if(options.format==='group'?!v.group:!v.individual)return false;
  return !Number(v.capacity)||Number(v.capacity)>=Number(options.pax||1);
 })}
 function preferenceError(content,kind,data){if(!data.preferredVehicleId)return '';if(typeof data.preferredVehicleId!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(data.preferredVehicleId))return 'Некорректный автомобиль';const group=kind==='bookings'?data.format!=='individual':(data.format?data.format==='group':data.clsId==='group');if(group)return 'Для групповой поездки автомобиль назначает диспетчер';const tour=(content.tours||[]).find(t=>t.id===data.tour),pax=kind==='bookings'?Number(data.adults||0)+Number(data.kids||0):data.pax;if(kind==='bookings'&&(!tour||tour.hidden))return 'Маршрут сейчас недоступен';return eligible(content,{kind,tour,format:'individual',pax}).some(v=>!v.example&&v.id===data.preferredVehicleId)?'':'Выбранный автомобиль больше не подходит. Обновите варианты транспорта.'}
 function validate(content){const f=content?.fleet;if(f===undefined)return '';if(!f||typeof f!=='object'||!Array.isArray(f.vehicles)||f.vehicles.length>150)return 'В автопарке допускается не более 150 карточек';const ids=new Set();for(const v of f.vehicles){if(!v||!/^[A-Za-z0-9_-]{1,80}$/.test(v.id||'')||ids.has(v.id)||typeof v.name!=='string'||!v.name.trim()||v.name.length>150||!types[v.type])return 'Проверьте название, тип и уникальность карточек автопарка';ids.add(v.id);for(const k of ['capacity','luggage'])if(v[k]!==''&&v[k]!=null&&(!Number.isInteger(Number(v[k]))||Number(v[k])<0||Number(v[k])>100))return 'Количество мест и багажа: целое число от 0 до 100';for(const k of ['hidden','transfer','excursion','individual','group','example'])if(typeof v[k]!=='boolean')return 'Проверьте назначение транспорта';if(!Array.isArray(v.photos)||v.photos.length>12||v.photos.some(p=>!safePhoto(p)))return 'Фото автомобиля: не более 12 безопасных ссылок';if(!Array.isArray(v.features)||v.features.length>12||v.features.some(x=>typeof x!=='string'||x.length>100))return 'Укажите до 12 кратких особенностей';if(v.transferClassIds!==undefined&&(!Array.isArray(v.transferClassIds)||v.transferClassIds.length>20||v.transferClassIds.some(id=>typeof id!=='string'||id.length>40)))return 'Некорректные данные автомобиля'}
  for(const t of content.tours||[])if(t.vehicleIds!==undefined&&(!Array.isArray(t.vehicleIds)||t.vehicleIds.some(id=>!ids.has(id))))return 'Автомобиль используется в экскурсии: уберите привязку перед удалением';
  for(const [key,max]of [['title',150],['intro',1500],['body',10000],['partners',4000]])if(f.company?.[key]!==undefined&&(typeof f.company[key]!=='string'||f.company[key].length>max))return 'Слишком длинный текст о компании';return '';
 }
 root.ApsuaFleet={types,safePhoto,examples,presentationVehicles,companyDefaults,vehicles,eligible,preferenceError,validate};
})(globalThis);

/* Fleet: public editorial catalog and non-binding preferences. Dispatch is server-owned. */
const Fleet=globalThis.ApsuaFleet;
function fleetIcon(type){const bus=['bus','minibus'].includes(type);return `<svg viewBox="0 0 180 90" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="${bus?'M20 62V22q0-8 9-8h122q9 0 9 8v40H20Z':'M20 62V42l22-7 18-19h52l26 23 22 6v17H20Z'}"/><path d="${bus?'M30 25h116v22H30zM60 25v22M90 25v22M120 25v22':'M48 35h75l-17-12H65L48 35ZM85 23v12'}"/><circle cx="49" cy="65" r="11" fill="var(--surface)"/><circle cx="133" cy="65" r="11" fill="var(--surface)"/><path d="M22 51h12m112 0h12"/></svg>`}
function fleetPhoto(v){const url=(v.photos||[]).map(Fleet.safePhoto).find(Boolean);return url?`<img src="${esc(url)}" alt="${esc(v.name)}" loading="lazy">`:`<span class="fleet-placeholder">${fleetIcon(v.type)}<small>${v.example?'Пример типа транспорта':'Фото добавляется'}</small></span>`}
function fleetCard(v){return `<article class="fleet-card" data-fleet-card="${esc(v.id)}"><button class="fleet-cover" type="button" data-fleet-view="${esc(v.id)}" aria-label="Фото и характеристики: ${esc(v.name)}">${fleetPhoto(v)}</button><div><h3>${esc(v.name)}</h3><small>${esc(Fleet.types[v.type]||'Транспорт')}${v.example?' · Пример':''}</small><p>${Number(v.capacity)?'до '+Number(v.capacity)+' мест':'Количество мест уточняется'}</p></div></article>`}
const fleetFilters={purpose:'all',type:'all',pax:'',text:''};
function fleetPage(){current='fleet';app.innerHTML=`<div class="wrap fleet-page"><header class="page-head"><div><h1>Наш автопарк</h1><p class="sub">Транспорт для трансферов и экскурсий. Конкретный автомобиль и наличие на дату подтверждает диспетчер.</p></div><a class="btn btn-ghost small" href="#/about">О компании и контакты →</a></header><div class="fleet-filters fleet-filters-compact"><label class="field">Тип<select class="input" data-fleet-filter="type"><option value="all">Все типы</option>${Object.entries(Fleet.types).map(([k,n])=>`<option value="${k}" ${fleetFilters.type===k?'selected':''}>${n}</option>`).join('')}</select></label><label class="field fleet-pax-range"><span>Количество мест: <output>${fleetFilters.pax||'любое'}</output></span><input type="range" min="1" max="50" value="${Math.max(1,Math.min(50,Number(fleetFilters.pax)||1))}" data-fleet-filter="pax" aria-label="Минимальное количество мест"><button type="button" class="linkbtn" data-fleet-any>Любое</button></label></div><p class="hint fleet-example-note" ${Fleet.vehicles(C).some(v=>v.example)?'':'hidden'}>Показаны примеры типов транспорта. Фотографии, модели и характеристики добавляются в админке.</p><div class="fleet-grid" id="fleetResults"></div><p class="hint">Фото моделей из презентации компании. Комплектация и внешний вид конкретной машины могут отличаться. Наличие на дату подтверждает диспетчер.</p></div>`;renderFleetResults();setNav('transfer');scrollTo(0,0)}
function renderFleetResults(){const root=$('#fleetResults');if(!root)return;const list=Fleet.vehicles(C).filter(v=>(fleetFilters.type==='all'||v.type===fleetFilters.type)&&(fleetFilters.purpose==='all'||v[fleetFilters.purpose])&&(!fleetFilters.pax||Number(v.capacity)>=Number(fleetFilters.pax))&&String(v.name).toLocaleLowerCase('ru').includes(fleetFilters.text.trim().toLocaleLowerCase('ru')));root.innerHTML=list.map(fleetCard).join('')||'<p class="empty">Нет транспорта по этим условиям. Измените фильтры или уточните вариант у менеджера.</p>'}
function companyPartnerHTML(value){
 const paragraphs=[],contacts=[];
 for(const text of lines(value)){
  const match=text.match(/^(.{1,80}):\s*([^\s<>]+@[^\s<>]+\.[^\s<>]+)$/);
  if(match&&serviceURL('mailto:'+match[2]))contacts.push(`<a href="${esc(serviceURL('mailto:'+match[2]))}"><small>${esc(match[1])}</small><b>${esc(match[2])}</b></a>`);
  else paragraphs.push(`<p>${esc(text)}</p>`);
 }
 return `<div class="company-partners-copy">${paragraphs.join('')||'<p>Обсудим маршруты и условия сотрудничества для ваших гостей.</p>'}</div>${contacts.length?`<div class="company-partner-contacts">${contacts.join('')}</div>`:''}`;
}
function aboutFleetPage(){
 current='about';const c=C.fleet?.company||Fleet.companyDefaults(),s=C.site||{},phone=String(s.phone||'').replace(/[^+0-9]/g,''),phoneURL=phone?serviceURL('tel:'+phone):'',email=serviceURL('mailto:'+String(s.email||'')),messenger=serviceURL(s.messenger||'');
 const contactRows=[phoneURL?`<div><dt>Телефон</dt><dd><a href="${esc(phoneURL)}">${esc(s.phone)}</a></dd></div>`:'',email?`<div><dt>Электронная почта</dt><dd><a href="${esc(email)}">${esc(s.email)}</a></dd></div>`:''].join('');
 app.innerHTML=`<article class="wrap company-page" aria-labelledby="companyTitle"><a class="btn btn-ghost small company-back" href="#/">${ICON.left}На главную</a>
 <div class="company-top"><header class="company-overview"><p class="eyebrow">О компании и контакты</p><h1 id="companyTitle">${esc(c.title||'О компании «Апсуа Тур»')}</h1><p class="sub">${esc(c.intro||'Экскурсии и трансферы по Абхазии.')}</p><a class="btn btn-ghost" href="#/fleet">Наш автопарк${ICON.right}</a></header>
 <section class="company-contact" aria-labelledby="companyContactTitle"><h2 id="companyContactTitle">Связаться с нами</h2>${contactRows?`<dl class="company-contact-list">${contactRows}</dl>`:'<p>Контакты уточняются. Информация появится здесь.</p>'}<div class="company-contact-actions">${phoneURL?`<a class="btn btn-sea" href="${esc(phoneURL)}">Позвонить</a>`:''}${email?`<a class="btn btn-ghost" href="${esc(email)}">Написать письмо</a>`:''}${messenger&&messenger!==phoneURL?`<a class="btn btn-ghost" href="${esc(messenger)}" ${/^https?:/.test(messenger)?'target="_blank" rel="noopener"':''}>Написать в мессенджер${ICON.ext}</a>`:''}</div></section></div>
 <nav class="company-services" aria-label="Направления работы"><a class="company-service" href="#/excursions">${ICON.pin}<span><b>Экскурсии</b><small>Маршруты по Абхазии</small></span>${ICON.right}</a><a class="company-service" href="#/transfer">${transferOrderIcon}<span><b>Трансфер</b><small>Встреча и обратная поездка</small></span>${ICON.right}</a><a class="company-service" href="#/fleet">${ICON.users}<span><b>Автопарк</b><small>Транспорт для вашей поездки</small></span>${ICON.right}</a></nav>
 ${lines(c.body).length?`<section class="company-story" aria-labelledby="companyStoryTitle"><h2 id="companyStoryTitle">Знакомьтесь: «Апсуа Тур»</h2><div class="company-story-copy">${lines(c.body).map(p=>`<p>${esc(p)}</p>`).join('')}</div></section>`:''}
 <section class="company-partners" aria-labelledby="companyPartnersTitle"><h2 id="companyPartnersTitle">Партнёрам</h2>${companyPartnerHTML(c.partners)}</section></article>`;
 setNav('');scrollTo(0,0);
}

function fleetOptions(kind){return kind==='bookings'?{kind,tour:tourById(bk?.t.id),format:bk?.kind==='individual'?'individual':'group',pax:Number(bk?.adults||0)+Number(bk?.kids||0)}:{kind,format:tr.cls==='group'?'group':'individual',pax:tr.pax}}
function fleetTeaserHTML(kind){const opt=fleetOptions(kind),list=Fleet.eligible(C,opt),real=list.filter(v=>!v.example),state=kind==='bookings'?bk:tr;if(!state)return '';if(!real.some(v=>v.id===state.preferredVehicleId))state.preferredVehicleId='';const preview=list.slice(0,3);return `<div class="fleet-trip" data-fleet-trip="${kind}"><details class="fleet-teaser"><summary><span class="fleet-mini-photos">${preview.map(v=>`<span>${fleetPhoto(v)}</span>`).join('')}</span><span><b>${kind==='bookings'?'Транспорт на маршруте':'На чём можно поехать'}</b><small>${opt.format==='group'?'Возможные варианты · назначает диспетчер':'Пожелание для индивидуальной поездки'}</small></span>${ICON.chev}</summary><div class="fleet-teaser-body">${list.length?`<div class="fleet-inline-list">${list.map(fleetCard).join('')}</div>`:'<p class="sub">Подходящий транспорт уточнит менеджер.</p>'}<a class="orders-history-link" href="#/fleet">Весь автопарк →</a><p class="hint">Фото и характеристики — для знакомства. Точную машину назначает диспетчер.</p></div></details>${opt.format==='individual'&&real.length?`<label class="field fleet-preference">Предпочтительный автомобиль · необязательно<select class="input" data-preferred-vehicle="${kind}"><option value="">Без пожеланий — подберите подходящий</option>${real.map(v=>`<option value="${esc(v.id)}" ${v.id===state.preferredVehicleId?'selected':''}>${esc(v.name)}${Number(v.capacity)?' · до '+Number(v.capacity)+' мест':''}</option>`).join('')}</select><small>Это пожелание, а не гарантированная бронь машины. Стоимость и наличие подтвердит диспетчер.</small></label>`:''}</div>`}
function mountFleetTrip(kind){const root=kind==='bookings'?$('#booking'):$('#trForm');if(!root||(kind==='bookings'&&(!bk||bk.step==='done')))return;root.querySelector('[data-fleet-trip]')?.remove();root.insertAdjacentHTML('beforeend',fleetTeaserHTML(kind))}
const bookingBeforeFleet=renderBooking;renderBooking=function(){bookingBeforeFleet();mountFleetTrip('bookings')};
const transferBeforeFleet=renderTransfer;renderTransfer=function(){transferBeforeFleet();mountFleetTrip('transfers')};
const tourBeforeFleet=tourView;tourView=function(id){tourBeforeFleet(id);const main=$('.tour-main');if(main&&!main.querySelector('[data-fleet-tour-note]'))main.insertAdjacentHTML('afterbegin',`<aside class="fleet-tour-note" data-fleet-tour-note>${transferOrderIcon}<span>Транспорт под маршрут и размер группы</span><a href="#/fleet">Наш автопарк →</a></aside>`)};
function assignedVehicleHTML(order){const v=order.assignedVehicle,pref=order.preferredVehicle;let html='';if(v&&typeof v==='object'&&(v.title||v.name||v.model)){const photo=Fleet.safePhoto(v.photo);const phone=String(v.driver?.phone||'').replace(/[^+0-9]/g,'');html=`<section class="fleet-assignment"><b>Ваш автомобиль</b><div>${photo?`<img src="${esc(photo)}" alt="Назначенный автомобиль">`:fleetIcon('minivan')}<span><strong>${esc(v.title||v.name||v.model)}</strong>${v.registration?`<small>Госномер: ${esc(v.registration)}</small>`:''}${v.driver?.name?`<small>Водитель: ${esc(v.driver.name)}</small>`:''}${phone?`<a href="tel:${phone}">Позвонить водителю</a>`:''}</span></div><small>Назначение диспетчера${v.assignedAt&&Number.isFinite(Date.parse(v.assignedAt))?' · '+esc(new Date(v.assignedAt).toLocaleDateString('ru-RU')):''}</small></section>`}else if(['confirmed','paid','awaiting_payment','in_progress'].includes(order.status))html='<p class="fleet-awaiting">Автомобиль ещё не назначен. После назначения данные появятся здесь.</p>';if(pref?.name||order.preferredVehicleId)html+=`<p class="fleet-requested">Пожелание: ${esc(pref?.name||'автомобиль из каталога')}. Окончательный вариант назначает диспетчер.</p>`;return html}
const factsBeforeFleet=requestFactsHTML;requestFactsHTML=function(order){return factsBeforeFleet(order)+assignedVehicleHTML(order)};
const compactBeforeFleet=compactOrderHTML;compactOrderHTML=function(order){const html=compactBeforeFleet(order),v=order.assignedVehicle,title=v&&(v.title||v.name||v.model);return title?html.replace('<p class="order-card-note">',`<p class="fleet-assigned-summary">Автомобиль: <b>${esc(String(title).slice(0,150))}</b>${v.registration?' · '+esc(v.registration):''}</p><p class="order-card-note">`):html};

const orderPrintBeforeFleet=orderFingerprint;orderFingerprint=function(order){return orderPrintBeforeFleet(order)+':'+String(hash(JSON.stringify(order.assignedVehicle||null)))};


const siteValidationBeforeFleet=validateSiteConfig;validateSiteConfig=function(content){return siteValidationBeforeFleet(content)||Fleet.validate(content)};
const chromeBeforeFleet=renderChrome;renderChrome=function(...args){const r=chromeBeforeFleet.apply(this,args),links=$('.footer-links');if(links&&!links.querySelector('[data-fleet-footer]'))links.insertAdjacentHTML('beforeend','<a href="#/fleet" data-fleet-footer>Автопарк</a><a href="#/about" data-fleet-footer>О компании и контакты</a>');return r};

document.addEventListener('input',e=>{if(e.target.dataset.fleetFilter){fleetFilters[e.target.dataset.fleetFilter]=e.target.value;renderFleetResults()}if(e.target.matches('[data-fleet-admin-search]')){const q=e.target.value.toLocaleLowerCase('ru');$$('#fleetAdminVehicles>details').forEach(n=>n.hidden=!n.querySelector('summary').textContent.toLocaleLowerCase('ru').includes(q))}});






/* ---------- 14.0: sign-in with Telegram (the server enables it when TELEGRAM_BOT_TOKEN is set) ---------- */
const signinPanelBeforeTelegram=signinPanel;
signinPanel=function(title){const html=signinPanelBeforeTelegram(title);if(!serverTelegramAuth.enabled||title==='Вход администратора')return html;const failed=/(?:^|[?&])login=failed(?:&|$)/.test(location.search);const box=`<div class="tg-login"><p class="sub">Войдите, чтобы бронировать и следить за заказами.</p>${failed?'<p class="err" role="alert">Не удалось войти через Telegram. Попробуйте ещё раз.</p>':''}<div class="tg-login-button" data-tg-login></div></div>`;return html.replace('<h1>'+esc(title)+'</h1>','<h1>'+esc(title)+'</h1>'+box).replace('<p class="sub">Приём приглашений пока закрыт.</p>','')};
let telegramLoginSDK,telegramSigninDialog=null,telegramAuthAttempt=null,telegramAuthSequence=0,telegramAuthTimer,telegramRecoveryBusy=false,clientAuthEpoch=0;
const telegramReturnKey='apsua-telegram-return',telegramPendingKey='apsua-telegram-pending';
function safeTelegramReturn(value){const hash=String(value||'#/');return hash.length<=600&&!/[\r\n]/.test(hash)&&/^#\/(?:$|(?:excursions|transfer|map|reviews|diary|useful|install|favorites|fleet|about|contacts|contact|compare|pick|orders)(?:[/?]|$))/.test(hash)?hash:'#/'}
function readTelegramStorage(key){try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}}
function telegramReturnContext(){const currentHash=routeHash()||'#/';if(safeTelegramReturn(currentHash)===currentHash)return {hash:currentHash,y:window.scrollY||0};const saved=readTelegramStorage(telegramReturnKey);return saved&&Date.now()-saved.at<3600000?{hash:safeTelegramReturn(saved.hash),y:Number(saved.y)||0}:{hash:'#/',y:0}}
function rememberTelegramPage(hash=routeHash()||'#/',y=window.scrollY||0){if(safeTelegramReturn(hash)!==hash)return;try{sessionStorage.setItem(telegramReturnKey,JSON.stringify({hash,y,at:Date.now()}))}catch{}}
function telegramAuthMessage(text='',pending=false){$$('[data-tg-login]').forEach(slot=>{const button=$('button',slot),status=$('.tg-app-status',slot);if(button){button.disabled=pending;button.textContent=pending?'Подтвердите вход в Telegram':'Войти через Telegram'}if(status){status.hidden=!text;status.textContent=text}})}
function closeTelegramSignin(){if(!telegramSigninDialog)return;const dialog=telegramSigninDialog;telegramSigninDialog=null;dialog.close();dialog.remove();document.body.style.overflow=dialog._oldOverflow||''}
function signinProviders(){const tg=serverTelegramAuth.enabled,ya=typeof serverYandexAuth!=='undefined'&&serverYandexAuth.enabled;return '<div class="signin-providers" aria-label="Способ входа">'+(tg?'<details class="signin-telegram"><summary class="signin-provider"><span class="signin-provider-mark" aria-hidden="true"><img src="/assets/auth-telegram.svg" alt="" width="18" height="18"></span><span>Войти через Telegram</span></summary><div class="signin-telegram-options" data-tg-login></div></details>':'')+(ya?'<button class="signin-provider yandex-login" type="button" data-yandex-login><span class="signin-provider-mark" aria-hidden="true"><img src="/assets/auth-yandex.svg" alt="" width="15" height="18"></span><span>Войти через Яндекс</span></button>':'')+(!tg&&!ya?'<p class="hint">Вход временно недоступен. Попробуйте позже.</p>':'')+'</div>'}
function openTelegramSignin(){if(serverIdentity||!serverTelegramAuth.enabled){location.hash='#/account';return}rememberTelegramPage();if(telegramSigninDialog){telegramSigninDialog.focus();return}const dialog=document.createElement('dialog');dialog.className='telegram-signin-dialog';dialog.setAttribute('aria-labelledby','telegram-signin-title');dialog._oldOverflow=document.body.style.overflow;dialog.innerHTML='<header><h2 id="telegram-signin-title">Войти</h2><button type="button" class="circle receipt-close" data-close-telegram aria-label="Закрыть">'+closeReceiptIcon+'</button></header><p>Бронируйте и следите за заказами.</p>'+signinProviders();dialog.addEventListener('cancel',event=>{event.preventDefault();closeTelegramSignin()});dialog.addEventListener('click',event=>{if(event.target.closest('[data-close-telegram]'))closeTelegramSignin();else if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeTelegramSignin()}});document.body.append(dialog);telegramSigninDialog=dialog;document.body.style.overflow='hidden';dialog.showModal();mountTelegramLogin($('[data-tg-login]',dialog));}
function endTelegramAttempt(error=''){clearTimeout(telegramAuthTimer);telegramAuthAttempt=null;window.apsuaAuthPending=false;try{sessionStorage.removeItem(telegramPendingKey)}catch{}telegramAuthMessage(error,false);if(error)$$('[data-tg-login]').forEach(slot=>slot._refreshTelegramWeb?.())}
function completeTelegramSignin(data,attempt=telegramAuthAttempt){if(!data.user||data.user.authKind!=='telegram')return false;if(attempt&&telegramAuthAttempt!==attempt)return false;const back=attempt?.back||telegramReturnContext(),y=window.scrollY||0;clientAuthEpoch++;serverIdentity=data.user;serverLists.user=data.user;serverAdmin=!!data.admin;serverEditor=!!data.editor;serverStaffRole=data.staffRole||'';Object.assign(serverLists,data.lists||{},{user:data.user});myOrdersCache=null;myOrdersCacheUserId=null;favs.clear();(data.lists?.favs||[]).forEach(id=>favs.add(id));endTelegramAttempt();try{window.Telegram?.Login?.close?.()}catch{}closeTelegramSignin();renderChrome();updateCustomerOrdersBanner();if(current==='account'||/^#\/account(?:\?|$)/.test(routeHash())){const target=safeTelegramReturn(back.hash);if(routeHash()===target)route();else location.hash=target;requestAnimationFrame(()=>scrollTo(0,back.y||0))}else if(['orders','reviews','diary'].includes(current)){route();requestAnimationFrame(()=>scrollTo(0,y))}toast('Вы вошли');window.dispatchEvent(new Event('telegram-signed-in'));return true}
async function recoverTelegramSignin(){
 if(telegramRecoveryBusy||document.hidden)return;
 if(!telegramAuthAttempt){const saved=readTelegramStorage(telegramPendingKey);if(!saved||saved.expires<=Date.now())return;telegramAuthAttempt={id:++telegramAuthSequence,expires:saved.expires,mode:saved.mode==='web'?'web':'oidc',back:{hash:safeTelegramReturn(saved.back?.hash),y:Number(saved.back?.y)||0}};window.apsuaAuthPending=true}
 const attempt=telegramAuthAttempt;if(attempt.expires<=Date.now()){endTelegramAttempt('Время входа истекло. Попробуйте ещё раз.');return}
 telegramRecoveryBusy=true;
 try{
  if(attempt.mode==='web'){
   const state=await api('/api/telegram-login/status').catch(()=>({status:'unknown'}));if(telegramAuthAttempt!==attempt)return;
   if(state.status==='denied'){endTelegramAttempt('Вход отклонён. Можно попробовать снова.');return}
   if(state.status==='approved')await api('/api/telegram-login/finish',{method:'POST',body:'{}'});
   else if(['pending','awaiting'].includes(state.status))return;
  }
  const data=await api('/api/state');if(telegramAuthAttempt===attempt&&data.user?.authKind==='telegram')completeTelegramSignin(data,attempt);
 }catch{}finally{telegramRecoveryBusy=false;if(telegramAuthAttempt===attempt){clearTimeout(telegramAuthTimer);telegramAuthTimer=setTimeout(recoverTelegramSignin,1500)}}
}
function startTelegramAttempt(challenge){const attempt={id:++telegramAuthSequence,expires:challenge.expires,mode:challenge.mode==='web'?'web':'oidc',back:telegramReturnContext()};telegramAuthAttempt=attempt;window.apsuaAuthPending=true;try{sessionStorage.setItem(telegramPendingKey,JSON.stringify({expires:attempt.expires,mode:attempt.mode,back:attempt.back}))}catch{}telegramAuthMessage(attempt.mode==='web'?'В Telegram Web нажмите «Начать», затем «Авторизоваться».':'После подтверждения вернитесь на сайт.',true);clearTimeout(telegramAuthTimer);telegramAuthTimer=setTimeout(recoverTelegramSignin,1500);return attempt}
function loadTelegramLoginSDK(){if(window.Telegram?.Login)return Promise.resolve();if(!telegramLoginSDK)telegramLoginSDK=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://oauth.telegram.org/js/telegram-login.js?6';script.async=true;script.onload=()=>window.Telegram?.Login?resolve():reject(new Error('Не удалось загрузить Telegram'));script.onerror=()=>reject(new Error('Telegram сейчас недоступен. Попробуйте позже.'));document.head.append(script)}).catch(err=>{telegramLoginSDK=null;throw err});return telegramLoginSDK}
function mountTelegramLogin(slot=$('[data-tg-login]')){
 if(!slot||slot.childElementCount||!serverTelegramAuth.enabled)return;
 slot.innerHTML='<button class="btn btn-primary tg-app-open" disabled>Готовим вход…</button><p class="tg-app-status" role="status" hidden></p>';
 const button=$('button',slot),status=$('.tg-app-status',slot),current=()=>slot.isConnected!==false;let challenge;
 const fail=err=>endTelegramAttempt(err?.message||'Не удалось войти. Попробуйте ещё раз.');
 const prepare=async()=>{button.disabled=true;try{const results=await Promise.all([api('/api/telegram-oidc/start',{method:'POST',body:'{}'}),loadTelegramLoginSDK()]);if(!current())return;challenge={...results[0],mode:'oidc'};button.textContent='Войти через Telegram';button.disabled=!!telegramAuthAttempt;if(telegramAuthAttempt)telegramAuthMessage('После подтверждения вернитесь на сайт.',true)}catch(err){if(current())fail(err)}};
 slot._refreshTelegramLogin=prepare;
 button.onclick=()=>{
  if(telegramAuthAttempt)return;
  if(!challenge||Date.now()>=challenge.expires){prepare();return}
  const attempt=startTelegramAttempt(challenge);
  try{const opening=window.Telegram.Login.auth({client_id:Number(challenge.clientId),scope:['profile'],lang:'ru',nonce:challenge.nonce},async answer=>{
   if(telegramAuthAttempt!==attempt)return;
   if(!answer?.id_token){await recoverTelegramSignin();if(telegramAuthAttempt===attempt)fail(new Error(answer?.error?'Вход не завершён. Попробуйте ещё раз.':'Вход отменён'));return}
   try{telegramAuthMessage('Входим…',true);await api('/api/telegram-oidc/finish',{method:'POST',body:JSON.stringify({id_token:answer.id_token})});if(telegramAuthAttempt!==attempt)return;const data=await api('/api/state');if(!completeTelegramSignin(data,attempt)&&telegramAuthAttempt===attempt){telegramAuthMessage('Обновляем вход…',true);recoverTelegramSignin()}}catch(err){challenge=null;if(telegramAuthAttempt===attempt)fail(err)}
  });if(opening?.catch)opening.catch(err=>{if(telegramAuthAttempt===attempt)fail(err)})}catch(err){fail(err)}
 };prepare();
}
rememberTelegramPage();
window.addEventListener('hashchange',event=>{const next=routeHash()||'#/';if(/^#\/account(?:\?|$)/.test(next)&&event.oldURL){const old=routeHash(new URL(event.oldURL))||'#/';rememberTelegramPage(old)}else rememberTelegramPage(next)},true);
document.addEventListener('click',event=>{const link=event.target.closest('a');if(!serverIdentity&&serverTelegramAuth.enabled&&link&&/^(?:(?:\/)?#\/account|\/account)(?:\?.*)?$/.test(link.getAttribute('href')||'')){event.preventDefault();event.stopImmediatePropagation();openTelegramSignin()}},true);
for(const name of ['focus','pageshow','site-ready'])window.addEventListener(name,recoverTelegramSignin);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)recoverTelegramSignin()});

const accountViewBeforeTelegram=accountView;
accountView=function(){accountViewBeforeTelegram();mountTelegramLogin()};
window.addEventListener('click',e=>{if(!e.target.closest('[data-logout]')||serverIdentity?.authKind!=='telegram')return;e.preventDefault();e.stopImmediatePropagation();api('/api/telegram-logout',{method:'POST',body:'{}'}).then(()=>location.reload()).catch(err=>toast(err.message))},true);

/* ---------- 14.0: transport is assigned by the dispatcher — no fleet teaser or vehicle wish in requests ---------- */
mountFleetTrip=function(){};
const tourViewBeforeNoFleet=tourView;tourView=function(id){tourViewBeforeNoFleet(id);$('[data-fleet-tour-note]')?.remove()};

/* ---------- 14.0: request stages — dispatcher answer, QR payment, guide and driver from the server ---------- */
Object.assign(tripStatusNames,{private:'У диспетчера',pending:'У диспетчера',needs_info:'Нужно уточнение',confirmed:'Подтверждена',awaiting_payment:'Ожидает оплаты',paid:'Оплачено',rejected:'Отклонена',completed:'Завершена',cancelled:'Отменена'});
Object.assign(tripStatusNotes,{private:'Диспетчер проверяет места и транспорт. Уведомим, как только он ответит.',pending:'Диспетчер проверяет места и транспорт. Уведомим, как только он ответит.',needs_info:'Диспетчеру нужно уточнение — ответьте на вопрос в заявке.',confirmed:'Заявка подтверждена. QR для оплаты появится здесь, как только сервер выставит счёт.',awaiting_payment:'Заявка подтверждена. Оплатите по QR до указанного срока — статус обновится сам.',paid:'Оплата получена. Данные экскурсовода, водителя и машины появятся здесь после назначения.',rejected:'К сожалению, заявку отклонили.',completed:'Спасибо за поездку! Будем рады вашему отзыву.',cancelled:'Заявка отменена.'});
const orderCancellable=order=>order&&['bookings','transfers'].includes(order.kind)&&['private','pending','needs_info','confirmed','awaiting_payment'].includes(order.status||'pending')&&!order.payment?.verifiedAt;
const digitsPhone=v=>String(v||'').replace(/[^+0-9]/g,'').replace(/(?!^)\+/g,'');
function contactButtonsHTML(person,label){const phone=digitsPhone(person?.phone),wa=digitsPhone(person?.whatsapp||person?.phone).replace(/^\+/,'');if(!phone&&!wa)return'';return `<div class="staff-actions">${phone?`<a class="btn btn-ghost" href="tel:${esc(phone)}" aria-label="Позвонить: ${esc(label)}">Позвонить</a>`:''}${wa?`<a class="btn staff-whatsapp" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp: ${esc(label)}">WhatsApp</a>`:''}</div>`}
function staffPhotoHTML(photo,alt){const src=Fleet.safePhoto(photo);return src?`<img class="staff-photo" src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`:`<span class="staff-photo staff-photo-empty" aria-hidden="true">${ICON.users}</span>`}
assignedVehicleHTML=function(order){const g=order.assignedGuide,v=order.assignedVehicle,d=v?.driver,transfer=order.kind==='transfers';let html='';
 if(order.pickupTime||order.pickupPoint||order.meetingPoint)html+=`<section class="pickup-card"><small>${transfer?'Машина приедет':'Подача машины'}</small>${order.pickupTime?`<strong>${esc(String(order.pickupTime).slice(0,40))}</strong>`:''}${order.pickupPoint||order.meetingPoint?`<span>${esc(String(order.pickupPoint||order.meetingPoint).slice(0,300))}</span>`:''}</section>`;
 if(g&&typeof g==='object'&&g.name)html+=`<section class="staff-card"><small>Экскурсовод</small><div class="staff-row">${staffPhotoHTML(g.photo,'Экскурсовод '+g.name)}<span><strong>${esc(String(g.name).slice(0,120))}</strong>${g.languages?`<small>${esc(String(g.languages).slice(0,120))}</small>`:''}</span></div>${contactButtonsHTML(g,'экскурсовод '+g.name)}</section>`;
 if(v&&typeof v==='object'&&(v.title||v.name||v.model)){const title=String(v.title||v.name||v.model).slice(0,150);html+=`<section class="staff-card vehicle-card"><small>${transfer?'Машина и водитель':'Машина'}</small><div class="vehicle-main"><span><strong>${esc(title)}</strong>${v.color?`<small>${esc(String(v.color).slice(0,60))}</small>`:''}</span>${v.registration?`<b class="plate" aria-label="Госномер ${esc(v.registration)}">${esc(String(v.registration).slice(0,20))}</b>`:''}</div>${d?.name?`<div class="staff-row">${staffPhotoHTML(d.photo,'Водитель '+d.name)}<span><strong>${esc(String(d.name).slice(0,120))}</strong><small>Водитель</small></span></div>${contactButtonsHTML(d,'водитель '+d.name)}`:''}</section>`}
 if(!html&&['confirmed','awaiting_payment','paid'].includes(order.status))html=`<p class="fleet-awaiting">${transfer?'Водителя, машину и госномер пришлём за 24 часа до выезда.':'Экскурсовода и машину назначим и сразу пришлём уведомление.'}</p>`;
 return html};
requestPaymentHTML=function(order){const payment=order.payment;if(payment?.verifiedAt&&['paid','completed'].includes(order.status)&&!order.paymentReviewRequired)return '';if(payment?.verifiedAt)return `<p class="payment-verified">Оплата получена${order.paymentReviewRequired?' · требуется проверка диспетчером':''}.</p>`;if(!['confirmed','awaiting_payment'].includes(order.status))return'';if(!payment)return'<p class="comfort-note">QR для оплаты появится здесь, как только сервер выставит счёт.</p>';const expires=Date.parse(payment.expiresAt);if(expires<=Date.now())return'<p class="payment-expired">Срок оплаты истёк. Статус заявки обновит сервер.</p>';const qr=safePaymentURL(payment.qrUrl,true),link=safePaymentURL(payment.paymentUrl);return `<section class="request-payment sbp-payment"><span class="sbp-amount num">${rub(payment.amount)}</span>${qr?`<img class="payment-qr" src="${esc(qr)}" alt="QR-код СБП для оплаты заявки ${esc(order.code)}">`:''}<p class="sbp-hint"><b>СБП</b>Отсканируйте камерой или в приложении банка</p><p class="sbp-deadline">Оплатить до ${esc(new Date(expires).toLocaleString('ru-RU',{timeZone:'Europe/Moscow',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}))}</p>${link?`<a class="btn btn-sea block" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Открыть в приложении банка</a>`:''}<small>Статус обновится сам после оплаты</small></section>`};
const receiptBeforeStages=requestReceiptHTML;
function receiptNote(order,status){const assigned=!!(order.assignedGuide?.name||order.assignedVehicle?.title||order.assignedVehicle?.name||order.assignedVehicle?.model);if(status==='paid')return assigned?'Всё готово к поездке. Ниже — кто и во сколько за вами приедет.':order.kind==='transfers'?'Оплата получена. Водитель, машина и госномер появятся здесь за 24 часа до выезда.':'Оплата получена. Экскурсовод и машина появятся здесь, как только их назначат.';return tripStatusNotes[status]||tripStatusNotes.pending}
requestReceiptHTML=function(order){const status=order.status==='private'?'pending':order.status||'pending',tour=order.kind==='bookings'?tourById(order.tour):null,number=String(order.dispatchNumber||order.code||'').slice(0,60);
 const rejection=status==='rejected'&&order.rejectionReason?`<section class="rejection-card" role="status"><small>Причина от диспетчера</small><p>${esc(String(order.rejectionReason).slice(0,500))}</p><a class="btn btn-sea block" href="#/excursions">Выбрать другую дату или экскурсию</a></section>`:'';
 const cancel=orderCancellable(order)?`<div class="order-cancel"><button class="btn btn-ghost block order-cancel-btn" type="button" data-cancel-order="${esc(order.code)}" data-cancel-kind="${esc(order.kind)}">Отменить заявку</button><small>Отменить можно бесплатно до оплаты</small></div>`:'';
 return `<div class="request-receipt"><p class="eyebrow">${order.kind==='bookings'?'Экскурсия':'Трансфер'}</p><h3>${esc(tour?.title||order.route||'Заявка на поездку')}</h3><div class="receipt-number"><span>Номер заявки</span><strong>${esc(number)}</strong></div><span class="trip-status ${esc(status)}">${tripStatusNames[status]||'У диспетчера'}</span><p class="comfort-note">${esc(receiptNote(order,status))}</p>${rejection}${requestPaymentHTML(order)}${assignedVehicleHTML(order)}<details class="receipt-details" ${['pending','needs_info','rejected','cancelled'].includes(status)?'open':''}><summary>Детали заявки</summary>${factsBeforeFleet(order)}</details>${order.managerNote?`<p class="trip-manager-note">${esc(order.managerNote)}</p>`:''}${cancel}</div>`};
document.addEventListener('click',async e=>{const b=e.target.closest('[data-cancel-order]');if(!b)return;e.preventDefault();if(b.dataset.confirm!=='1'){b.dataset.confirm='1';b.textContent='Точно отменить? Нажмите ещё раз';setTimeout(()=>{if(b.isConnected){b.dataset.confirm='';b.textContent='Отменить заявку'}},5000);return}b.disabled=true;try{const data=await api('/api/order-cancel',{method:'POST',body:JSON.stringify({code:b.dataset.cancelOrder,kind:b.dataset.cancelKind})});if(myOrdersCache){const i=myOrdersCache.findIndex(o=>o.code===data.order.code&&o.kind===data.order.kind);if(i>=0)myOrdersCache[i]=data.order}if(requestResultOrder&&requestResultOrder.code===data.order.code){requestResultOrder=data.order;const body=$('#requestResultBody');if(body)body.innerHTML=requestReceiptHTML(data.order)}toast('Заявка отменена');if(current==='account')route()}catch(err){b.disabled=false;b.dataset.confirm='';b.textContent='Отменить заявку';toast(err.message)}});

/* ---------- 14.5–14.9: minimal Apple-style redesign — home, cards, tour route, step bars, sign-in ---------- */
const V4_ICON={
 clock:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 tag:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 12.2V5a1.5 1.5 0 011.5-1.5h7.2l8.3 8.3a1.5 1.5 0 010 2.1l-7.1 7.1a1.5 1.5 0 01-2.1 0z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="8.2" cy="8.2" r="1.5" stroke="currentColor" stroke-width="1.7"/></svg>',
 route:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="18" r="2.2" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="6" r="2.2" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 18H15a3 3 0 000-6H9a3 3 0 010-6h6.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
 pin:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-10.8a6.5 6.5 0 0113 0C18.5 15.4 12 21 12 21z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10.2" r="2.4" stroke="currentColor" stroke-width="1.7"/></svg>',
 car:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 15.5l1.7-5.2c.2-.7.9-1.3 1.7-1.3h9.2c.8 0 1.5.6 1.7 1.3l1.7 5.2v3H4zM4 15.5h16M7 18.5v1.8M17 18.5v1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 star:'<svg class="v4star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7.9-5.6-4-3.9 5.6-.8z" fill="currentColor"/></svg>',
 person:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c.6-3.6 3.4-5.8 7-5.8s6.4 2.2 7 5.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
 bell:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 1.8h-15zM10 20.5a2.2 2.2 0 004 0" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 ticket:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7.5A1.5 1.5 0 015.5 6h13A1.5 1.5 0 0120 7.5V10a2 2 0 000 4v2.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 16.5V14a2 2 0 000-4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 11l7-6 7 6v8h-4.5v-5h-5v5H5z" fill="currentColor"/></svg>',
 info:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
 phone:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 4h3l1.5 4-2 1.5a10.5 10.5 0 005.5 5.5l1.5-2 4 1.5v3A2 2 0 0118 19.5 14.5 14.5 0 014.5 6 2 2 0 016.5 4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 doc:'<svg class="v4i" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3.5h7l4.5 4.5v11A1.5 1.5 0 0117 20.5H7A1.5 1.5 0 015.5 19V5A1.5 1.5 0 017 3.5zM14 3.5V8h4.5M9 12.5h6M9 16h6" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
};
const V4_STEP_ART=[
 '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="20" y="8" width="24" height="48" rx="5"/><path d="M27 20h10M27 27h10M27 34h6"/><path d="M27 44h10" stroke="#FF8A00"/></svg>',
 '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="12" y="14" width="40" height="38" rx="6"/><path d="M12 24h40M22 9v9M42 9v9"/><path d="M24 38l6 6 11-12" stroke="#FF8A00"/></svg>',
 '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="12" y="12" width="40" height="40" rx="7"/><path d="M21 21h7v7h-7zM36 21h7v7h-7zM21 36h7v7h-7z"/><path d="M36 36h7v7h-7z" stroke="#FF8A00"/></svg>',
 '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 50l16-22 10 12 9-12 17 22z"/><circle cx="46" cy="16" r="5" stroke="#FF8A00"/></svg>'
];
const V4_STEPS=[['Заявка','Маршрут, дата и откуда забрать.'],['Подтверждение','Диспетчер проверит места.'],['Оплата по СБП','QR — только после подтверждения.'],['В путь','Экскурсовод, водитель и машина — в заявке.']];
const V4_CAT_PHOTO={mount:'assets/lake.jpg',hist:'assets/athos.jpg',nature:'assets/canyon-new.jpg',relax:'assets/labra.jpg',sea:'assets/transfer-coast.webp',food:'assets/ring-new.jpg',active:'assets/waterfall-new.jpg'};
function v4HomeCats(){const present=new Set(C.tours.map(t=>tourPublic(t)).filter(Boolean).flatMap(t=>[t.cat,...tripStyles(t)]));const saved=Array.isArray(C.homeCats)?C.homeCats:[];const base=Object.keys(CAT).filter(k=>present.has(k)).map(k=>({cat:k,title:CAT[k],photo:''}));for(const item of saved){const at=base.findIndex(x=>x.cat===item.cat);if(at>=0)base[at]={...base[at],...item,title:item.title||base[at].title}}return base}
function v4CatPhoto(c){if(c.photo)return src(c.photo,['mount',0],900,1100);const t=C.tours.map(x=>tourPublic(x)).find(x=>x&&x.cat===c.cat);return t?tourCover(t,900,1100):src(V4_CAT_PHOTO[c.cat]||'assets/lake.jpg',['mount',0],900,1100)}
function v4Head(title,link,href,extra=''){return `<div class="v4-head"><h2>${esc(title)}</h2>${extra}${link?`<a href="${esc(href)}"${/^https:/.test(href)?' target="_blank" rel="noopener"':''}>${esc(link)}</a>`:''}</div>`}
function v4Arrows(id){return `<span class="v4-arrows"><button type="button" class="v4-arrow" data-v4-scroll="${id}" data-dir="-1" aria-label="Назад">${ICON.left}</button><button type="button" class="v4-arrow" data-v4-scroll="${id}" data-dir="1" aria-label="Вперёд">${ICON.right}</button></span>`}
function v4Stars(n=5){n=Math.max(1,Math.min(5,Math.round(Number(n)||5)));return `<span class="v4-stars" aria-label="${n} из 5">${V4_ICON.star.repeat(n)}</span>`}
function v4Meta(t){return `<span class="v4-meta"><span>${V4_ICON.clock}${esc(t.dur||'')}</span><span>${V4_ICON.tag}${t.price==null?'По запросу':'от '+rub(t.price)}</span></span>`}
function v4Popular(){const limit=Math.max(1,Math.min(8,Number(C.popularLimit)||8));let pop=C.tours.map(t=>tourPublic(t)).filter(t=>t&&t.popular);if(!pop.length)pop=C.tours.map(t=>tourPublic(t)).filter(Boolean);return pop.slice(0,limit)}
function v4RouteLine(t){const pins=(typeof tourPins==='function'?tourPins(t):[]).filter(id=>PIN_NAMES[id]);if(pins.length<2)return '';return `<span class="v4-routeline">${V4_ICON.route}<span>${pins.map(id=>esc(PIN_NAMES[id])).join(' → ')}</span></span>`}
homeView=function(){
 const H=C.hero,cats=v4HomeCats(),pop=v4Popular(),Y=C.yandex||{},reviews=allReviews().filter(r=>!r.hidden).slice(0,8),stories=allStories().slice(0,6),services=serviceItems().filter(x=>!x.hidden).slice(0,3),useful=[...services.map(s=>({href:'#/useful/'+encodeURIComponent(s.id),title:s.title,sub:s.short||'',icon:s.category==='Транспорт'?V4_ICON.car:V4_ICON.doc})),{href:'#/install',title:'Приложение на телефон',sub:'Иконка на экране «Домой»',icon:V4_ICON.phone}].slice(0,4);
 const hasRating=Y.rating&&Y.count;
 app.innerHTML=`<div class="v4-home">
 <section class="v4-hero" aria-labelledby="v134-hero-title"><div class="v4-hero-media banner-gallery">${bannerImages('hero',['lake',1],'')}</div><div class="v4-hero-copy"><p>${esc(H.eyebrow)}</p><h1 id="v134-hero-title">${esc(H.title)}</h1>${H.lead?`<p class="v4-lead">${esc(H.lead)}</p>`:''}<div class="v4-hero-buttons"><a class="v4-btn v4-btn-white" href="#/excursions">Экскурсии</a><a class="v4-btn v4-btn-glass" href="#/transfer">Трансфер</a></div></div></section>
 <div class="wrap">
 ${cats.length?`<section class="v4-sec">${v4Head('Куда поехать','Карта','#/map')}<div class="v4-rail v4-places" id="v4Places">${cats.map(c=>`<a class="v4-place" href="#/excursions?cat=${encodeURIComponent(c.cat)}"><img src="${esc(v4CatPhoto(c))}" alt="" loading="lazy"><strong>${esc(c.title)}</strong></a>`).join('')}</div></section>`:''}
 ${pop.length?`<section class="v4-sec">${v4Head('Чаще всего бронируют','Все','#/excursions',v4Arrows('v4Pop'))}<div class="v4-rail v4-pop" id="v4Pop">${pop.map(t=>`<a class="v4-tour" href="#/excursions/${esc(t.id)}"><span class="v4-tour-photo"><img src="${esc(tourCover(t,800,960))}" alt="${esc(t.title)}" loading="lazy"></span><strong>${esc(t.title)}</strong>${v4Meta(t)}</a>`).join('')}</div></section>`:''}
 <section class="v4-sec" id="reviews">${yandexHTML()}</section>
 ${stories.length?`<section class="v4-sec">${v4Head('Истории из дневника','Все истории','#/diary',v4Arrows('v4Stories'))}<div class="v4-rail v4-stories" id="v4Stories">${stories.map(s=>{const p=s.img||src(s.photo||(s.photos||[])[0],s.scene||['sea',0],900,600);return `<a class="v4-story" href="#/diary/${encodeURIComponent(s.id)}"><img src="${esc(p)}" alt="" loading="lazy"><strong>${esc(s.t||'История')}</strong><small>${esc(s.a||'')}</small></a>`}).join('')}</div></section>`:''}
 <section class="v4-sec v4-steps-sec"><h2 class="v4-center">Четыре шага до поездки</h2><ol class="v4-steps">${V4_STEPS.map(([t,s],i)=>`<li>${V4_STEP_ART[i]}<strong>${t}</strong><span>${s}</span></li>`).join('')}</ol></section>
 <section class="v4-sec">${v4Head('Вам пригодится','Все','#/useful')}<div class="v4-useful">${useful.map((u,i)=>`<a class="v4-use v4-use-${i%4}" href="${esc(u.href)}">${u.icon}<span class="v4-use-ghost" aria-hidden="true">${u.icon}</span><span><strong>${esc(u.title)}</strong><small>${esc(u.sub)}</small></span></a>`).join('')}</div></section>
 </div></div>`;
 if(typeof setupBannerGalleries==='function')setupBannerGalleries();
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-v4-scroll]');if(!b)return;const rail=document.getElementById(b.dataset.v4Scroll);if(rail){const distance=Number(b.dataset.dir)*rail.clientWidth*.85;if(window.ApsuaRailMotion?.move)window.ApsuaRailMotion.move(rail,distance);else rail.scrollBy({left:distance,behavior:'smooth'})}});

/* Catalogue cards: category, title, route line, time and price with the same thin icons */
cardHTML=function(t){t=tourPublic(t)||t;const fav=favs.has(t.id),pic=tourCover(t,800,600);return `<article class="card v4-card" data-id="${esc(t.id)}"><div class="card-media"><a class="card-photo-link" href="#/excursions/${esc(t.id)}" tabindex="-1" aria-hidden="true"><img src="${esc(pic)}" alt="" loading="lazy" class="on"></a></div><button class="fav" type="button" data-fav="${esc(t.id)}" aria-pressed="${fav}" aria-label="${fav?'Убрать из избранного':'В избранное'}">${ICON.heart}</button><div class="card-body"><span class="v4-cat">${esc(CAT[t.cat]||'')}${t.offerKind==='individual'?' · индивидуальная':''}</span><h3><a href="#/excursions/${esc(t.id)}">${esc(t.title)}</a></h3>${v4RouteLine(t)||`<p class="desc">${esc(t.short||'')}</p>`}${v4Meta(t)}</div></article>`};

/* Tour route: Yandex map (when the key is set) or the road SVG, totals, legs between stops, stay and paid entry */
let v4YandexLoading=null;const v4Key=()=>String(window.apsuaYandexMapsKey||'');
function v4LoadYandex(){if(window.ymaps)return Promise.resolve(window.ymaps);if(!v4Key())return Promise.reject(new Error('no key'));if(!v4YandexLoading)v4YandexLoading=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://api-maps.yandex.ru/2.1/?apikey='+encodeURIComponent(v4Key())+'&lang=ru_RU';s.async=true;s.onload=()=>window.ymaps.ready(()=>resolve(window.ymaps));s.onerror=()=>{v4YandexLoading=null;reject(new Error('Яндекс Карты недоступны'))};document.head.append(s)});return v4YandexLoading}
function v4Duration(min){min=Math.round(Number(min)||0);if(min<60)return min+' мин';const h=Math.floor(min/60),m=min%60;return h+' ч'+(m?' '+m+' мин':'')}
function v4Km(km){return (Math.round(Number(km)*10)/10).toLocaleString('ru-RU')+' км'}
function v4StopInfo(id){return stopCatalog().find(s=>s.id===id)||{}}
function v4RouteDetails(t,city,data){
 const box=$('#tourRoadRoute');if(!box||!data)return;const pins=tourPins(t),stays=Array.isArray(t.routeStays)?t.routeStays:[],legs=Array.isArray(data.legs)?data.legs:[];
 const totalMin=legs.reduce((a,l)=>a+(Number(l.min)||0),0);
 const items=[`<li class="v4-stop v4-stop-home"><span class="v4-stop-dot">${V4_ICON.home}</span><span><strong>${esc(city)}</strong><small>Выезд${t.times?.[0]?' · '+esc(String(t.times[0])):''}</small></span></li>`];
 pins.forEach((id,i)=>{const leg=legs[i],info=v4StopInfo(id),photo=info.photo?src(info.photo,['mount',0],200,200):'';if(leg)items.push(`<li class="v4-leg">${V4_ICON.car}<span>${v4Km(leg.km)} · ${v4Duration(leg.min)}</span></li>`);items.push(`<li class="v4-stop">${photo?`<img src="${esc(photo)}" alt="" loading="lazy">`:''}<span class="v4-stop-dot">${i+1}</span><span><strong>${esc(PIN_NAMES[id]||'Остановка')}</strong>${stays[i]?`<small>${esc(stays[i])}</small>`:''}${info.paid?`<em>${V4_ICON.tag}${esc(info.paid)}</em>`:''}</span></li>`)});
 let panel=$('.v4-route-panel',box);if(!panel){box.insertAdjacentHTML('beforeend','<div class="v4-route-panel"></div>');panel=$('.v4-route-panel',box)}
 panel.innerHTML=`<div class="v4-route-stats"><span>${V4_ICON.route}<b>${v4Km(data.distanceKm)}</b><small>весь путь</small></span>${totalMin?`<span>${V4_ICON.clock}<b>${v4Duration(totalMin)}</b><small>в дороге</small></span>`:''}<span>${V4_ICON.pin}<b>${pins.length}</b><small>${plural(pins.length,'остановка','остановки','остановок')}</small></span></div><ol class="v4-route-stops">${items.join('')}</ol>`;
 box.classList.add('v4-route-ready');
 if(v4Key()&&Array.isArray(data.geo)&&data.geo.length>1)v4LoadYandex().then(ymaps=>{if($('#tourRoadRoute')!==box)return;let holder=$('.v4-ymap',box);if(!holder){box.querySelector('.tour-route-map')?.insertAdjacentHTML('beforebegin','<div class="v4-ymap" role="region" aria-label="Маршрут на Яндекс Карте"></div>');holder=$('.v4-ymap',box)}holder.innerHTML='';const map=new ymaps.Map(holder,{center:data.geo[0],zoom:9,controls:['zoomControl']},{suppressMapOpenBlock:false});map.behaviors.disable('scrollZoom');map.geoObjects.add(new ymaps.Polyline(data.geo,{},{strokeColor:'#0071e3',strokeWidth:5,strokeOpacity:.9}));(data.points||[]).forEach((p,i)=>map.geoObjects.add(new ymaps.Placemark(p,{iconContent:i?String(i):'',hintContent:i?PIN_NAMES[pins[i-1]]||'':city},{preset:i?'islands#blueCircleIcon':'islands#blackHomeCircleIcon'})));map.setBounds(map.geoObjects.getBounds(),{checkZoomRange:true,zoomMargin:30});box.classList.add('v4-has-ymap')}).catch(()=>{});
}
const v4UpdateRoadBefore=updateTourRoadRoute;
updateTourRoadRoute=async function(t,city,force){await v4UpdateRoadBefore(t,city,force);const box=$('#tourRoadRoute');if(!box||box.dataset.tourId!==t.id)return;const pins=tourPins(t),key=city+'|'+pins.join(',')+'|'+pins.map(id=>GEO.pins[id]?.join(',')||'').join(';'),pending=roadRequests.get(key);if(!pending||box.dataset.routeKey!==key||box.dataset.v4RouteKey===key)return;try{const data=await pending;if($('#tourRoadRoute')===box&&box.dataset.routeKey===key&&box.dataset.v4RouteKey!==key){box.dataset.v4RouteKey=key;v4RouteDetails(tourById(t.id)||t,city,data)}}catch{}};

/* Tour bottom bar follows the booking steps: date → people → send */
function v4TourBar(){const mb=$('#mbar');if(!mb||!bk||current!=='tour')return;if(bk.step==='done'){mb.hidden=true;document.body.classList.remove('has-mbar');return}mb.hidden=false;document.body.classList.add('has-mbar');
 let top,sub,label,action,stage;
 if(bk.step==='form'){stage=2;top=bookingTotalLabel();sub=`${bk.adults} взр.${bk.kids?`, ${bk.kids} реб.`:''} · ${shortDate(bk.date)}`;label='Отправить';action='submit'}
 else if(bk.date&&bk.time){stage=1;top=`${shortDate(bk.date)}, ${bk.time}`;sub=esc(bk.t.title);label='Кто едет';action='next'}
 else if(bk.date){stage=1;top=shortDate(bk.date);sub='выберите время выезда';label='Выбрать время';action='time'}
 else{stage=0;top=bookingPriceLabel();sub=bk.kind==='individual'?'за группу':'за взрослого';label='Выбрать дату';action='date'}
 mb.innerHTML=`<div class="v4-bar"><span class="v4-dots" aria-hidden="true">${[0,1,2].map(i=>`<i class="${i<=stage?'on':''}${i===stage?' cur':''}"></i>`).join('')}</span><span class="v4-bar-copy"><b class="num price">${top}</b><small>${sub}${stage?` · <button type="button" class="v4-link" data-v4-bar="edit">изменить</button>`:''}</small></span><button class="btn btn-accent" type="button" data-v4-bar="${action}">${label}</button></div>`}
const v4RenderBookingBefore=renderBooking;renderBooking=function(...a){const r=v4RenderBookingBefore.apply(this,a);v4TourBar();return r};
const v4TourViewBefore=tourView;tourView=function(id){v4TourViewBefore(id);v4TourBar()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-v4-bar]');if(!b)return;e.preventDefault();const a=b.dataset.v4Bar,box=$('#booking');
 if(a==='date'||a==='edit'){if(a==='edit'&&bk&&bk.step==='form'){bk.step='pick';renderBooking()}box?.scrollIntoView({block:'start',behavior:'smooth'});return}
 if(a==='time'){($('.times',box)||box)?.scrollIntoView({block:'center',behavior:'smooth'});return}
 if(a==='next'){$('[data-bk="next"]',box)?.click();return}
 if(a==='submit'){const f=$('#bkForm');if(f){f.requestSubmit?f.requestSubmit():f.querySelector('[type=submit]')?.click()}}});
document.addEventListener('input',e=>{if(e.target.closest?.('#bkForm'))v4TourBar()});

/* Transfer bottom bar on phones: route → details → send */
function v4TransferBar(){const mb=$('#mbar');if(!mb||current!=='transfer')return;if(tr.step==='done'){mb.hidden=true;document.body.classList.remove('has-mbar');return}const f=$('#trForm');if(!f)return;mb.hidden=false;document.body.classList.add('has-mbar');const missing=[...f.querySelectorAll('input[required],select[required]')].find(x=>!x.value.trim());const stage=missing?(['tr-time'].includes(missing.id)?0:1):2;const route=transferRouteLabel?transferRouteLabel():'';
 mb.innerHTML=`<div class="v4-bar"><span class="v4-dots" aria-hidden="true">${[0,1,2].map(i=>`<i class="${i<=stage?'on':''}${i===stage?' cur':''}"></i>`).join('')}</span><span class="v4-bar-copy"><b class="num">${stage===2?transferPriceLabel():esc(route)}</b><small>${stage===2?esc(route):missing?'заполните: '+esc((missing.closest('label')?.querySelector('span')?.textContent||'поле').replace(/\s*·.*$/,'').toLowerCase()):''}</small></span><button class="btn btn-accent" type="button" data-v4-tr="${stage===2?'submit':'next'}">${stage===2?'Отправить':'Дальше'}</button></div>`}
const v4RenderTransferBefore=renderTransfer;renderTransfer=function(...a){const r=v4RenderTransferBefore.apply(this,a);v4TransferBar();return r};
document.addEventListener('input',e=>{if(e.target.closest?.('#trForm'))v4TransferBar()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-v4-tr]');if(!b)return;e.preventDefault();const f=$('#trForm');if(!f)return;if(b.dataset.v4Tr==='submit'){f.requestSubmit?f.requestSubmit():f.querySelector('[type=submit]')?.click();return}const missing=[...f.querySelectorAll('input[required],select[required]')].find(x=>!x.value.trim());if(missing){missing.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(()=>missing.focus({preventScroll:true}),250)}});
const v4RouteBefore=route;route=function(){v4RouteBefore();if(current!=='tour'&&current!=='transfer'){const mb=$('#mbar');if(mb){mb.hidden=true;document.body.classList.remove('has-mbar')}}};

/* Sign-in: one calm card — logo, three reasons, Telegram, staff entry */
const v4SigninBefore=signinPanel;
signinPanel=function(title){const failed=/(?:^|[?&])login=failed(?:&|$)/.test(location.search);const legacy=serverTestAuth.enabled?`<details class="v4-legacy"><summary>Вход по приглашению</summary>${v4SigninBefore(title).replace(/^<div class="wrap section"><section class="panel auth"><h1>[^<]*<\/h1>/,'').replace(/<\/section><\/div>$/,'')}</details>`:'';
 return `<div class="wrap section v4-signin-wrap"><section class="v4-signin" aria-labelledby="v4SigninTitle"><img class="v4-signin-logo" src="/assets/brand-logo.png" alt="Апсуа Тур"><h1 id="v4SigninTitle">Вход в Апсуа Тур</h1><p class="v4-signin-sub">Без паролей — в одно касание</p><ul class="v4-perks"><li>${V4_ICON.ticket}<span>Все заявки в одном месте</span></li><li>${V4_ICON.bell}<span>Уведомления о каждом изменении</span></li><li>${V4_ICON.person}<span>Экскурсовод и водитель — прямо в заявке</span></li></ul>${failed?'<p class="err" role="alert">Не удалось войти. Попробуйте ещё раз.</p>':''}${signinProviders()}${legacy}<p class="v4-legal">Сервис входа передаст сайту только основные данные профиля. Телефон вы укажете в заявке.</p></section></div>`};

/* Header: orders shortcut with a dot when something changed */
function v4HeaderOrders(){const actions=$('.header-actions');if(!actions||$('#v4Orders',actions))return;const fav=$('#favBtn',actions);fav?.insertAdjacentHTML('afterend',`<a class="btn btn-ghost small v4-orders" id="v4Orders" href="#/orders" aria-label="Мои заявки">${V4_ICON.ticket}<i class="v4-orders-dot" hidden></i></a>`)}
function v4OrdersDot(){const dot=$('.v4-orders-dot');if(!dot)return;let on=false;try{on=!!serverIdentity&&myTripOrders().some(orderHasUnseen)}catch{}dot.hidden=!on}
const v4BannerBefore=updateCustomerOrdersBanner;updateCustomerOrdersBanner=function(...a){const r=v4BannerBefore.apply(this,a);v4OrdersDot();return r};
const v4ChromeBefore=renderChrome;renderChrome=function(...a){const r=v4ChromeBefore.apply(this,a);v4HeaderOrders();v4OrdersDot();return r};


// The public review showcase is owned by Yandex; local reviews remain in storage.
yandexHTML=function(){return `<section class="v4-yandex" aria-labelledby="yandexReviewsTitle"><header class="v4-head"><h2 id="yandexReviewsTitle">Отзывы на Яндексе</h2><a href="https://yandex.ru/maps/org/apsua_tur/132935970380/reviews" target="_blank" rel="noopener noreferrer">Все отзывы ↗</a></header><div class="v4-yandex-frame"><iframe title="Отзывы об Апсуа Тур на Яндекс Картах" src="https://yandex.ru/maps-reviews-widget/132935970380?comments" width="560" height="540" loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="v4-yandex-note">Отзывы загружаются с Яндекс Карт. <a href="https://yandex.ru/maps/org/apsua_tur/132935970380/reviews" target="_blank" rel="noopener noreferrer">Открыть на Яндексе ↗</a></p></section>`};
reviewsView=function(){app.innerHTML=`<div class="wrap v4-reviews-page">${yandexHTML()}</div>`};


/* ==========================================================================
   16.5–17.7 (build 146): stable sign-in, smoother booking, page transitions, mobile menu,
   collapsible order panel, booking terms, home order + FAQ, social links, install offer.
   ========================================================================== */
const V17_REDUCE=window.matchMedia?.('(prefers-reduced-motion: reduce)');
const v17Reduced=()=>!!V17_REDUCE?.matches;
const v17Store={get(key,fallback){try{const v=localStorage.getItem(key);return v==null?fallback:JSON.parse(v)}catch{return fallback}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}};
const v17Session={get(key,fallback){try{const v=sessionStorage.getItem(key);return v==null?fallback:JSON.parse(v)}catch{return fallback}},set(key,value){try{sessionStorage.setItem(key,JSON.stringify(value))}catch{}}};
const V17_ICON={
 close:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 chevronDown:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 chevronUp:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 15l6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 ticket:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7.5A1.5 1.5 0 015.5 6h13A1.5 1.5 0 0120 7.5V10a2 2 0 000 4v2.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 16.5V14a2 2 0 000-4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 mountain:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 18l6-9 4 5 2.5-3L21 18z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 car:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 16V11l2-5h12l2 5v5M4 16h16M4 16v2m16-2v2M7 13h.01M17 13h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 theatre:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5h14v6a7 7 0 01-14 0z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 10h.01M15 10h.01M9.5 14a3.5 3.5 0 005 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
 person:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
 heart:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 map:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 star:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 book:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.5h9a3 3 0 013 3V20H8a3 3 0 01-3-3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M5 17a3 3 0 013-3h9" stroke="currentColor" stroke-width="1.7"/></svg>',
 grid:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.8" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" stroke="currentColor" stroke-width="1.7"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" stroke="currentColor" stroke-width="1.7"/></svg>',
 bus:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="13" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M4 11h16M7 20v-3m10 3v-3M8 14h.01M16 14h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
 help:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="M9.6 9.5a2.5 2.5 0 114 2c-.9.6-1.6 1.2-1.6 2.3M12 17h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 download:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v7m-3-3l3 3 3-3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 bell:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15zM10 20.5a2 2 0 004 0" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
 share:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-8a1 1 0 00-1-1h-1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 plusSquare:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.7"/><path d="M12 8.5v7M8.5 12h7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
 vk:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.9 17.6c-5.5 0-8.6-3.8-8.8-10h2.8c.1 4.6 2.1 6.5 3.7 6.9V7.6h2.6v3.9c1.6-.2 3.3-2 3.8-3.9h2.6c-.4 2.4-2.2 4.2-3.5 4.9 1.3.6 3.3 2.2 4.1 5.1h-2.9c-.6-1.9-2.1-3.4-4.1-3.6v3.6h-.3z"/></svg>',
 instagram:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>'
};

/* ---------- Springs: Apple's response/damping model on requestAnimationFrame ---------- */
// Returns a controller; .stop() interrupts, the current value/velocity stay readable so a gesture can take over.
function v17Spring({from,to,velocity=0,response=.35,damping=1,apply,done}){
 const k=Math.pow(2*Math.PI/response,2),c=4*Math.PI*damping/response;let x=from,v=velocity,last=null,frame=0,stopped=false;
 const ctl={get value(){return x},get velocity(){return v},stop(){stopped=true;if(frame)cancelAnimationFrame(frame)}};
 if(v17Reduced()){apply(to);done?.();return ctl}
 const step=now=>{if(stopped)return;if(last===null)last=now-16.7;const dt=Math.min(.032,Math.max(0,(now-last)/1000));last=now;
  for(let i=0;i<2;i++){const h=dt/2,a=-k*(x-to)-c*v;v+=a*h;x+=v*h}
  if(Math.abs(v)<.5&&Math.abs(x-to)<.3){x=to;v=0;apply(to);done?.();return}
  apply(x);frame=requestAnimationFrame(step)};
 frame=requestAnimationFrame(step);return ctl;
}
// Apple's momentum projection (scroll-like deceleration): where a flick would come to rest.
function v17Project(velocity,rate=.998){return (velocity/1000)*rate/(1-rate)}
function v17Tracker(){const pts=[];return {add(x,y,t){pts.push({x,y,t});while(pts.length>5||pts.length>1&&t-pts[0].t>100)pts.shift()},velocity(){if(pts.length<2)return {x:0,y:0};const a=pts[0],b=pts[pts.length-1],dt=Math.max(1,b.t-a.t)/1000;return {x:(b.x-a.x)/dt,y:(b.y-a.y)/dt}}}}

/* ---------- 1. Sign-in that survives: expired sessions keep the order, the server renews active ones ---------- */
function handleExpiredSession(){
 try{captureBookingFields();captureTransferFields()}catch{}
 clientAuthEpoch++;serverIdentity=null;serverLists.user=null;myOrdersCache=null;myOrdersCacheUserId=null;
 try{renderChrome();updateCustomerOrdersBanner()}catch{}
 if(serverTelegramAuth.enabled){openTelegramSignin();const note=$('.telegram-signin-dialog>p');if(note)note.textContent='Время входа истекло. Войдите снова — данные заявки останутся в форме.'}else toast('Войдите снова, чтобы отправить заявку');
}

/* ---------- 2. Page transitions and scroll positions ---------- */
// Each history entry gets an index in v17History.state. A hashchange to an entry that already has an index is a
// back/forward traversal: the saved scroll position is restored. New entries start at the top.
const v17History=typeof history==='object'&&history?history:{state:null,replaceState(){}};
try{v17History.scrollRestoration='manual'}catch{}
const v17Scroll=new Map(Object.entries(v17Session.get('apsua-scroll-positions',{})));
let v17Index=Number(v17History.state?.apsuaIndex)||0,v17MaxIndex=Math.max(v17Index,Number(v17Session.get('apsua-history-max',0))||0),v17ScrollTimer=0;
if(!v17History.state?.apsuaIndex){v17Index=++v17MaxIndex;try{v17History.replaceState({...(v17History.state||{}),apsuaIndex:v17Index},'')}catch{}v17Session.set('apsua-history-max',v17MaxIndex)}
function v17SaveScroll(){v17Scroll.set(String(v17Index),Math.round(window.scrollY||0));if(v17Scroll.size>60)v17Scroll.delete(v17Scroll.keys().next().value);v17Session.set('apsua-scroll-positions',Object.fromEntries(v17Scroll))}
let v17LastY=Math.round(window.scrollY||0);
window.addEventListener('scroll',()=>{v17LastY=Math.round(window.scrollY||0);clearTimeout(v17ScrollTimer);v17ScrollTimer=setTimeout(v17SaveScroll,120)},{passive:true});
window.addEventListener('pagehide',v17SaveScroll);
function v17PageKey(hash){const parts=String(hash||'#/').replace(/^#\/?/,'').split('?')[0].split('/').filter(Boolean);return parts[0]==='admin'?'admin':parts.slice(0,2).join('/')}
let v17PreviousHash=routeHash()||'#/';
function v17PageEnter(direction){
 if(!app||typeof app.animate!=='function')return;
 app.getAnimations?.().forEach(a=>{if(a.id==='v17-page')a.cancel()});
 const frames=v17Reduced()?[{opacity:.35},{opacity:1}]:[{opacity:0,transform:`translate3d(${direction*18}px,0,0)`},{opacity:1,transform:'translate3d(0,0,0)'}];
 const animation=app.animate(frames,{duration:v17Reduced()?140:300,easing:'cubic-bezier(.22,1,.36,1)'});animation.id='v17-page';
}
// Runs after the router (registered later, bubbling): position and animate the new page.
window.addEventListener('hashchange',()=>{
 // The router has already scrolled the new page; the last scroll position seen belongs to the previous one.
 clearTimeout(v17ScrollTimer);v17Scroll.set(String(v17Index),v17LastY);v17Session.set('apsua-scroll-positions',Object.fromEntries(v17Scroll));
 const next=routeHash()||'#/',state=v17History.state||{};let traverse=false,direction=1;
 if(state.apsuaIndex){traverse=true;direction=Number(state.apsuaIndex)<v17Index?-1:1;v17Index=Number(state.apsuaIndex)}
 else{v17Index=++v17MaxIndex;try{v17History.replaceState({...state,apsuaIndex:v17Index},'')}catch{}v17Session.set('apsua-history-max',v17MaxIndex)}
 const samePage=v17PageKey(next)===v17PageKey(v17PreviousHash);v17PreviousHash=next;
 if(/^#\/faq(?:[?/]|$)/.test(next)){requestAnimationFrame(()=>v17ScrollToFaq(false));}
 else if(traverse){const y=v17Scroll.get(String(v17Index));if(y!=null){window.scrollTo({top:y,behavior:'instant'});requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));setTimeout(()=>{if(Math.abs((window.scrollY||0)-y)>2)window.scrollTo({top:y,behavior:'instant'})},180)}}
 if(!samePage&&current!=='admin')v17PageEnter(direction);
 v17CloseMenu(true);
});
function v17ScrollToFaq(smooth){const target=$('#faq');if(!target)return;const top=target.getBoundingClientRect().top+window.scrollY-((($('.header')?.getBoundingClientRect().bottom)||0)+12);window.scrollTo({top:Math.max(0,top),behavior:smooth&&!v17Reduced()?'smooth':'instant'})}
// Links to a section of the page that is already open scroll smoothly instead of re-rendering it.
document.addEventListener('click',e=>{const a=e.target.closest?.('a[href="#/faq"],a[href="/#/faq"]');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey)return;if(current==='home'&&$('#faq')){e.preventDefault();v17CloseMenu(true);v17ScrollToFaq(true);try{v17History.replaceState(v17History.state,'','#/faq')}catch{}}});

/* ---------- 3. Mobile menu (bottom sheet, one-handed) ---------- */
let v17Menu=null,v17MenuSpring=null,v17MenuOpen=false,v17MenuReturn=null,v17MenuOverflow='';
function v17TheatreHref(){try{const item=serviceItems().find(x=>x.mode==='rusdram'&&!x.hidden);return item?'#/useful/'+encodeURIComponent(item.id):'#/useful'}catch{return '#/useful'}}
function v17MenuHTML(){
 const signed=!!serverIdentity,row=(href,icon,label,sub='')=>`<a class="site-menu-row" href="${href}">${icon}<span><b>${esc(label)}</b>${sub?`<small>${esc(sub)}</small>`:''}</span></a>`;
 const tile=(href,icon,label,cls='')=>`<a class="site-menu-tile ${cls}" href="${href}">${icon}<b>${esc(label)}</b></a>`;
 return `<div class="site-menu-scrim" data-menu-close></div><section class="site-menu-sheet" aria-labelledby="siteMenuTitle"><div class="site-menu-grab" data-menu-grab aria-hidden="true"><i></i></div><header class="site-menu-head" data-menu-grab><h2 id="siteMenuTitle">Меню</h2><button type="button" class="site-menu-close" data-menu-close aria-label="Закрыть меню">${V17_ICON.close}</button></header><div class="site-menu-body">
 <nav class="site-menu-tiles" aria-label="Главное">${tile('#/excursions',V17_ICON.mountain,'Экскурсии','accent')}${tile(v17TheatreHref(),V17_ICON.theatre,'Билеты')}${tile('#/transfer',V17_ICON.car,'Трансфер')}${tile('#/orders',V17_ICON.ticket,'Мои брони')}</nav>
 <nav class="site-menu-list" aria-label="Разделы сайта">
  ${row('#/account',V17_ICON.person,signed?'Личный кабинет':'Войти',signed?(serverIdentity.name||''):'Через Telegram — без паролей')}
  ${row('#/',V17_ICON.home,'Главная')}${row('#/map',V17_ICON.map,'Карта')}${row('#/favorites',V17_ICON.heart,'Избранное')}${row('#/reviews',V17_ICON.star,'Отзывы')}${row('#/diary',V17_ICON.book,'Истории путешественников')}${row('#/useful',V17_ICON.grid,'Полезное')}${row('#/fleet',V17_ICON.bus,'Автопарк')}${row('#/faq',V17_ICON.help,'Частые вопросы')}${row('#/contacts',V17_ICON.phone,'Контакты')}
 </nav>
 <nav class="site-menu-list" aria-label="Приложение">${isStandalone()?'':`<button type="button" class="site-menu-row" data-install-open>${V17_ICON.download}<span><b>Установить на телефон</b><small>Иконка на экране «Домой»</small></span></button>`}${row('#/account?notifications=1',V17_ICON.bell,'Уведомления',signed?'Статусы заявок и напоминания':'Доступны после входа')}</nav>
 </div></section>`;
}
function v17EnsureMenu(){if(v17Menu)return v17Menu;v17Menu=document.createElement('div');v17Menu.className='site-menu';v17Menu.id='siteMenu';v17Menu.setAttribute('role','dialog');v17Menu.setAttribute('aria-modal','true');v17Menu.setAttribute('aria-labelledby','siteMenuTitle');v17Menu.hidden=true;document.body.append(v17Menu);return v17Menu}
function v17SheetHeight(){return $('.site-menu-sheet',v17Menu)?.getBoundingClientRect().height||480}
function v17ApplyMenu(y){const sheet=$('.site-menu-sheet',v17Menu),scrim=$('.site-menu-scrim',v17Menu);if(!sheet)return;const h=v17SheetHeight();sheet.style.transform=`translate3d(0,${Math.max(-24,y)}px,0)`;if(scrim)scrim.style.opacity=String(Math.max(0,Math.min(1,1-y/h)))}
function v17MenuY(){const m=/translate3d\(0px?,\s*(-?[\d.]+)px/.exec($('.site-menu-sheet',v17Menu)?.style.transform||'');return m?Number(m[1]):v17SheetHeight()}
function v17OpenMenu(){
 const menu=v17EnsureMenu();if(v17MenuOpen)return;v17MenuOpen=true;v17MenuReturn=document.activeElement;
 menu.innerHTML=v17MenuHTML();menu.hidden=false;const here=publicURL(routeHash())||routeHash()||'/';menu.querySelectorAll('a[href]').forEach(a=>{if(a.getAttribute('href')===here)a.setAttribute('aria-current','page')});document.documentElement.classList.add('menu-open');v17MenuOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
 $('#menuToggle')?.setAttribute('aria-expanded','true');$('#menuToggle')?.setAttribute('aria-label','Закрыть меню');
 const start=v17SheetHeight();v17ApplyMenu(start);v17MenuSpring?.stop();
 v17MenuSpring=v17Spring({from:start,to:0,response:.38,damping:.86,apply:v17ApplyMenu});
 requestAnimationFrame(()=>$('.site-menu-tile',menu)?.focus({preventScroll:true}));
}
function v17CloseMenu(instant=false,velocity=0){
 if(!v17MenuOpen||!v17Menu)return;v17MenuOpen=false;
 $('#menuToggle')?.setAttribute('aria-expanded','false');$('#menuToggle')?.setAttribute('aria-label','Открыть меню');
 document.documentElement.classList.remove('menu-open');document.documentElement.style.overflow=v17MenuOverflow;
 const finish=()=>{if(!v17MenuOpen){v17Menu.hidden=true;v17Menu.innerHTML=''}};
 v17MenuSpring?.stop();
 if(instant){finish()}else{v17MenuSpring=v17Spring({from:v17MenuY(),to:v17SheetHeight()+24,velocity,response:.32,damping:1,apply:v17ApplyMenu,done:finish})}
 if(v17MenuReturn&&document.contains(v17MenuReturn)&&!instant)v17MenuReturn.focus({preventScroll:true});else if(!instant)$('#menuToggle')?.focus({preventScroll:true});
}
document.addEventListener('click',e=>{
 if(e.target.closest?.('#menuToggle')){e.preventDefault();v17MenuOpen?v17CloseMenu():v17OpenMenu();return}
 if(!v17MenuOpen||!v17Menu?.contains(e.target))return;
 if(e.target.closest('[data-menu-close]')){e.preventDefault();v17CloseMenu();return}
 const link=e.target.closest('a[href]');
 if(link){const href=link.getAttribute('href');if(href===publicURL(routeHash())||href===routeHash()||href==='#/'&&!routeHash()){e.preventDefault();v17CloseMenu();if(href==='#/faq'||href==='/faq')v17ScrollToFaq(true);else window.scrollTo({top:0,behavior:v17Reduced()?'instant':'smooth'})}else v17CloseMenu(false)}
});
// Links that another handler takes over (e.g. sign-in opening in a dialog) still close the menu.
window.addEventListener('click',e=>{if(v17MenuOpen&&v17Menu?.contains(e.target)&&e.target.closest?.('a[href]'))setTimeout(()=>v17CloseMenu(false),0)},true);
document.addEventListener('keydown',e=>{
 if(!v17MenuOpen)return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();v17CloseMenu();return}
 if(e.key==='Tab'){const items=[...v17Menu.querySelectorAll('a[href],button:not([disabled])')].filter(x=>x.offsetParent!==null);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}else if(!v17Menu.contains(document.activeElement)){e.preventDefault();first.focus()}}
},true);
// Drag the sheet down to dismiss: 1:1 tracking, momentum projection decides, spring finishes from the finger's velocity.
(()=>{let drag=null;
 document.addEventListener('pointerdown',e=>{if(!v17MenuOpen||e.button>0)return;const grab=e.target.closest?.('[data-menu-grab]');const body=e.target.closest?.('.site-menu-body');if(!grab&&!(body&&body.scrollTop<=0&&e.pointerType!=='mouse'))return;if(e.target.closest('button,a')&&!grab)return;v17MenuSpring?.stop();drag={id:e.pointerId,y0:e.clientY,start:v17MenuY(),moved:false,body:!grab,track:v17Tracker()};drag.track.add(0,e.clientY,e.timeStamp)},true);
 document.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dy=e.clientY-drag.y0;if(!drag.moved){if(Math.abs(dy)<8)return;if(drag.body&&dy<0){drag=null;return}drag.moved=true;try{e.target.setPointerCapture?.(e.pointerId)}catch{}}drag.track.add(0,e.clientY,e.timeStamp);const y=drag.start+dy;v17ApplyMenu(y<0?-(Math.sqrt(-y)*2):y);e.preventDefault()},{passive:false});
 const end=e=>{if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;if(!d.moved)return;const v=d.track.velocity().y,y=v17MenuY(),h=v17SheetHeight();if(y+v17Project(v)>h*.45||v>900){v17CloseMenu(false,v)}else{v17MenuSpring=v17Spring({from:y,to:0,velocity:v,response:.35,damping:.82,apply:v17ApplyMenu})}if(d.moved){const block=ev=>{ev.stopPropagation();ev.preventDefault()};window.addEventListener('click',block,{capture:true,once:true});setTimeout(()=>window.removeEventListener('click',block,true),50)}};
 document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',end,true);
})();
window.addEventListener('resize',()=>{if(v17MenuOpen&&!v17MenuSpring)v17ApplyMenu(0)});

/* ---------- 4. Order panel: compact, collapsible, draggable ---------- */
const DOCK_KEY='apsua-order-dock';
let v17Dock=v17Store.get(DOCK_KEY,{collapsed:false,yOpen:0,yPill:0,side:'right'});if(!v17Dock||typeof v17Dock!=='object')v17Dock={collapsed:false,yOpen:0,yPill:0,side:'right'};
const v17DockY=()=>Number(v17Dock.collapsed?v17Dock.yPill:v17Dock.yOpen)||0;
let v17DockSpring={x:null,y:null},v17DockOffset={x:0,y:0},v17DockDrag=null,v17DockHiddenByKeyboard=false;
function v17DockKind(){return current==='tour'&&bk?'bookings':current==='transfer'?'transfers':null}
function v17TicketWord(n,kind){return kind==='transfers'?plural(n,'пассажир','пассажира','пассажиров'):plural(n,'билет','билета','билетов')}
function v17DockSummary(kind){
 if(kind==='bookings'){const n=(Number(bk.adults)||0)+(Number(bk.kids)||0),total=bkTotal();return {count:n,word:v17TicketWord(n,kind),total:total==null?'по запросу':rub(total)}}
 const n=Number(tr.pax)||1,total=trPrice();return {count:n,word:v17TicketWord(n,kind),total:total==null?'цена по запросу':rub(total)}
}
function v17DockBounds(mb){
 const vw=window.innerWidth,vh=(window.visualViewport?.height)||window.innerHeight,header=($('.header')?.getBoundingClientRect().bottom)||0,nav=$('.mnav'),navTop=nav&&getComputedStyle(nav).display!=='none'?nav.getBoundingClientRect().top:vh;
 const r=mb.getBoundingClientRect(),baseTop=r.top-v17DockOffset.y,baseLeft=r.left-v17DockOffset.x;
 return {minY:header+8-baseTop,maxY:Math.min(navTop,vh)-8-(baseTop+r.height),minX:8-baseLeft,maxX:vw-8-(baseLeft+r.width)};
}
function v17ApplyDock(mb){if(!mb?.style)return;mb.style.transform=v17DockOffset.x||v17DockOffset.y?`translate3d(${v17DockOffset.x.toFixed(1)}px,${v17DockOffset.y.toFixed(1)}px,0)`:''}
function v17SettleDock(mb,{vx=0,vy=0,animate=true}={}){
 if(typeof mb?.getBoundingClientRect!=='function')return;
 const b=v17DockBounds(mb),collapsed=mb.classList.contains('is-collapsed');
 let tx=0,ty=Math.max(b.minY,Math.min(b.maxY,v17DockOffset.y+(animate?v17Project(vy,.99):0)));
 if(collapsed){const projected=v17DockOffset.x+v17Project(vx,.99);const toLeft=animate?projected<(b.minX+b.maxX)/2:v17Dock.side==='left';tx=toLeft?b.minX:Math.min(0,b.maxX);v17Dock.side=toLeft?'left':'right'}
 if(b.maxY<b.minY)ty=0;if(collapsed)v17Dock.yPill=ty;else v17Dock.yOpen=ty;v17Store.set(DOCK_KEY,v17Dock);
 v17DockSpring.x?.stop();v17DockSpring.y?.stop();
 if(!animate||v17Reduced()){v17DockOffset={x:tx,y:ty};v17ApplyDock(mb);return}
 // Independent X and Y springs; a little bounce only because a throw preceded it.
 const momentum=Math.hypot(vx,vy)>300;
 v17DockSpring.x=v17Spring({from:v17DockOffset.x,to:tx,velocity:vx,response:.4,damping:momentum?.8:1,apply:v=>{v17DockOffset.x=v;v17ApplyDock(mb)}});
 v17DockSpring.y=v17Spring({from:v17DockOffset.y,to:ty,velocity:vy,response:.4,damping:momentum?.8:1,apply:v=>{v17DockOffset.y=v;v17ApplyDock(mb)}});
}
function v17DecorateDock(){try{v17DecorateDockNow()}catch(error){console.warn('order panel',error)}}
function v17DecorateDockNow(){
 const mb=$('#mbar'),kind=v17DockKind();if(!mb)return;
 if(mb.hidden||!kind){mb.classList.remove('order-dock','is-collapsed');if(mb.style)mb.style.transform='';return}
 const bar=$('.v4-bar',mb);if(!bar)return;
 mb.classList.add('order-dock');mb.dataset.noPull='';mb.setAttribute('role','region');mb.setAttribute('aria-label','Заказ');
 const sum=v17DockSummary(kind),label=`${sum.count} ${sum.word} · ${sum.total}`;
 if(!$('.dock-grip',mb))bar.insertAdjacentHTML('afterbegin','<span class="dock-grip" data-dock-drag title="Перетащите панель" aria-hidden="true"><i></i></span>');
 if(!$('.dock-collapse',mb))bar.insertAdjacentHTML('beforeend',`<button type="button" class="dock-collapse" data-dock-toggle aria-expanded="true" aria-label="Свернуть панель заказа">${V17_ICON.chevronDown}</button>`);
 let pill=$('.dock-pill',mb);if(!pill){mb.insertAdjacentHTML('beforeend','<button type="button" class="dock-pill" data-dock-toggle data-dock-drag aria-expanded="false"></button>');pill=$('.dock-pill',mb)}
 pill.innerHTML=`<span class="dock-pill-count">${V17_ICON.ticket}<b class="num">${sum.count}</b></span><span class="dock-pill-total num">${esc(sum.total)}</span>${V17_ICON.chevronUp}`;pill.setAttribute('aria-label','Развернуть панель заказа: '+label);
 const collapsed=!!v17Dock.collapsed;mb.classList.toggle('is-collapsed',collapsed);$('.dock-collapse',mb)?.setAttribute('aria-expanded',String(!collapsed));if(collapsed)bar.setAttribute('inert','');else bar.removeAttribute('inert');bar.setAttribute('aria-hidden',String(collapsed));
 // Restore the remembered position, clamped to the current screen.
 if(!v17DockDrag){v17DockOffset={x:0,y:v17DockY()};v17ApplyDock(mb);requestAnimationFrame(()=>{if(!mb.hidden)v17SettleDock(mb,{animate:false})})}
}
function v17ToggleDock(force){
 const mb=$('#mbar');if(!mb)return;const collapsed=force??!v17Dock.collapsed;v17Dock.collapsed=collapsed;v17Store.set(DOCK_KEY,v17Dock);
 // Materialise between the two states: snapshot, switch, then animate from the old size and place (FLIP).
 const before=mb.getBoundingClientRect();v17DecorateDock();v17DockOffset={x:0,y:v17DockY()};v17ApplyDock(mb);v17SettleDock(mb,{animate:false});
 const after=mb.getBoundingClientRect();
 if(!v17Reduced()&&typeof mb.animate==='function'&&after.width&&after.height){mb.animate([{transformOrigin:'0 0',transform:`translate3d(${(before.left-after.left+v17DockOffset.x).toFixed(1)}px,${(before.top-after.top+v17DockOffset.y).toFixed(1)}px,0) scale(${(before.width/after.width).toFixed(3)},${(before.height/after.height).toFixed(3)})`,opacity:.6},{transformOrigin:'0 0',transform:mb.style.transform||'none',opacity:1}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'})}
 requestAnimationFrame(()=>(collapsed?$('.dock-pill',mb):$('.dock-collapse',mb))?.focus({preventScroll:true}));
}
document.addEventListener('pointerdown',e=>{
 const handle=e.target.closest?.('#mbar [data-dock-drag]');if(!handle||e.button>0)return;const mb=$('#mbar');
 v17DockSpring.x?.stop();v17DockSpring.y?.stop();
 v17DockDrag={id:e.pointerId,x0:e.clientX,y0:e.clientY,ox:v17DockOffset.x,oy:v17DockOffset.y,moved:false,track:v17Tracker(),mb,collapsed:mb.classList.contains('is-collapsed')};v17DockDrag.track.add(e.clientX,e.clientY,e.timeStamp);
},true);
document.addEventListener('pointermove',e=>{
 const d=v17DockDrag;if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.x0,dy=e.clientY-d.y0;
 if(!d.moved){if(Math.hypot(dx,dy)<8)return;d.moved=true;d.mb.classList.add('is-dragging');try{e.target.setPointerCapture?.(e.pointerId)}catch{}}
 d.track.add(e.clientX,e.clientY,e.timeStamp);const b=v17DockBounds(d.mb);
 // 1:1 inside the screen, rubber band past its edges.
 const band=(v,min,max)=>v<min?min-Math.sqrt(min-v)*3:v>max?max+Math.sqrt(v-max)*3:v;
 v17DockOffset={x:d.collapsed?band(d.ox+dx,b.minX,b.maxX):0,y:band(d.oy+dy,b.minY,b.maxY)};v17ApplyDock(d.mb);e.preventDefault();
},{passive:false});
function v17DockRelease(e){
 const d=v17DockDrag;if(!d||e.pointerId!==d.id)return;v17DockDrag=null;d.mb.classList.remove('is-dragging');if(!d.moved)return;
 const v=d.track.velocity();v17SettleDock(d.mb,{vx:d.collapsed?v.x:0,vy:v.y});
 // A drag is not a tap: swallow the click that follows the release.
 const block=ev=>{ev.stopPropagation();ev.preventDefault()};window.addEventListener('click',block,{capture:true,once:true});setTimeout(()=>window.removeEventListener('click',block,true),60);
}
document.addEventListener('pointerup',v17DockRelease,true);document.addEventListener('pointercancel',v17DockRelease,true);
document.addEventListener('click',e=>{const t=e.target.closest?.('#mbar [data-dock-toggle]');if(!t)return;e.preventDefault();v17ToggleDock(!t.classList.contains('dock-pill'))});
window.addEventListener('resize',()=>{const mb=$('#mbar');if(mb&&!mb.hidden&&mb.classList.contains('order-dock'))v17SettleDock(mb,{animate:false})});
window.visualViewport?.addEventListener('resize',()=>{const mb=$('#mbar');if(mb&&!mb.hidden&&mb.classList.contains('order-dock'))v17SettleDock(mb,{animate:false})});
// While the phone keyboard is open the panel steps aside, so it never covers the field being typed into.
document.addEventListener('focusin',e=>{if(!e.target.matches?.('input:not([type=checkbox]):not([type=radio]),textarea,select')||!e.target.closest('#app'))return;if(!window.matchMedia?.('(pointer: coarse)').matches)return;document.body.classList.add('dock-keyboard')});
document.addEventListener('focusout',()=>{setTimeout(()=>{if(!document.activeElement?.matches?.('input:not([type=checkbox]):not([type=radio]),textarea,select'))document.body.classList.remove('dock-keyboard')},60)});
if(typeof v4TourBar==='function'){const v17TourBarBefore=v4TourBar;v4TourBar=function(...a){const r=v17TourBarBefore.apply(this,a);v17DecorateDock();return r}}
if(typeof v4TransferBar==='function'){const v17TransferBarBefore=v4TransferBar;v4TransferBar=function(...a){const r=v17TransferBarBefore.apply(this,a);v17DecorateDock();return r}}
const v17RouteBeforeDock=route;route=function(...a){const r=v17RouteBeforeDock.apply(this,a);v17DecorateDock();return r};
window.addEventListener('hashchange',()=>setTimeout(v17DecorateDock,0));

// Selections survive navigation: a booking draft from this visit comes back silently when the tour reopens.
function v17TouchedDraft(id){const list=v17Session.get('apsua-draft-tours',[]);if(!list.includes(id)){list.push(id);v17Session.set('apsua-draft-tours',list.slice(-30))}}
document.addEventListener('click',e=>{if(bk&&e.target.closest?.('#booking [data-day],#booking [data-time],#booking [data-bk],#booking [data-cal-any]'))v17TouchedDraft(bk.t.id)},true);
document.addEventListener('input',e=>{if(bk&&e.target.closest?.('#bkForm'))v17TouchedDraft(bk.t.id)},true);
function v17RestoreBookingDraft(){
 if(!bk||bk.date||bk.step!=='pick')return;const id=bk.t.id;if(!v17Session.get('apsua-draft-tours',[]).includes(id))return;
 const data=readRequestDraft('bookings',id);if(!data)return;uxDraftDismissed.add(uxDraftKey('bookings',id));
 Object.assign(bk,{date:data.date&&fromIso(data.date)>=today0()?data.date:null,time:data.time,adults:Math.max(1,Number(data.adults)||1),kids:Math.max(0,Number(data.kids)||0),kind:data.kind,preferredVehicleId:data.preferredVehicleId||'',requestCode:data.requestCode,contact:data.contact||{},step:'pick'});departureCity=data.city||departureCity;
 uxRestoringDraft=true;try{renderBooking()}finally{uxRestoringDraft=false}
}
const v17TourViewBefore=tourView;tourView=function(id){v17TourViewBefore(id);v17RestoreBookingDraft()};

/* ---------- 5. Booking terms: a real link, a modal over the form, consent checked before sending ---------- */
// Replace this text in the admin panel («Контакты и логотип» → «Условия и вопросы»). Until then it is a demo.
const V17_TERMS_DEMO=`Демонстрационный текст. Окончательные условия бронирования опубликует организатор; до этого уточняйте детали у менеджера.

Заявка
Отправка формы — это заявка, а не оплаченный заказ. Наличие мест, точное время и стоимость подтверждает диспетчер.

Подтверждение и оплата
Статус заявки виден в разделе «Мои заявки». Оплата — только после подтверждения, по счёту или QR-коду, который появится в заявке.

Изменение и отмена
Неоплаченную заявку можно отменить в личном кабинете. Порядок переноса, отмены и возврата для оплаченных поездок сообщит менеджер.

Контактные данные
Имя и телефон из заявки нужны, чтобы связаться с вами по этой поездке.`;
function v17TermsText(){const custom=String(C.site?.bookingTerms||'').trim();return custom||V17_TERMS_DEMO}
function v17Paragraphs(text){return String(text).split(/\n\s*\n/).map(block=>block.trim()).filter(Boolean).map(block=>{const lines=block.split('\n');return lines.length>1&&lines[0].length<80?`<h3>${esc(lines[0])}</h3><p>${lines.slice(1).map(esc).join('<br>')}</p>`:`<p>${lines.map(esc).join('<br>')}</p>`}).join('')}
let v17TermsDialog=null;
function v17OpenTerms(trigger){
 v17TermsDialog?.remove();const demo=!String(C.site?.bookingTerms||'').trim();const dialog=document.createElement('dialog');dialog.className='terms-dialog';dialog.setAttribute('aria-labelledby','termsTitle');
 dialog.innerHTML=`<header><h2 id="termsTitle">Условия бронирования</h2><button type="button" class="circle" data-terms-close aria-label="Закрыть">${V17_ICON.close}</button></header>${demo?'<p class="terms-demo">Демонстрационный текст</p>':''}<div class="terms-body">${v17Paragraphs(v17TermsText())}</div><footer><button type="button" class="btn btn-accent block" data-terms-close>Понятно</button></footer>`;
 const close=()=>{dialog.close();dialog.remove();v17TermsDialog=null;document.body.style.overflow=dialog._overflow||'';trigger?.focus?.({preventScroll:true})};
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});dialog.addEventListener('click',e=>{if(e.target.closest('[data-terms-close]')||e.target===dialog)close()});
 dialog._overflow=document.body.style.overflow;document.body.style.overflow='hidden';document.body.append(dialog);v17TermsDialog=dialog;dialog.showModal();$('.terms-body',dialog)?.focus?.();
}
document.addEventListener('click',e=>{const link=e.target.closest?.('[data-booking-terms]');if(!link)return;e.preventDefault();e.stopPropagation();v17OpenTerms(link)},true);
const V17_CONSENT='Принимаю <button type="button" class="terms-link" data-booking-terms>Условия бронирования</button> и согласен на обработку персональных данных для связи по заявке';
let v17TransferConsent=false;
const v17RenderBookingTerms=renderBooking;renderBooking=function(...a){const r=v17RenderBookingTerms.apply(this,a);const span=$('#bk-ok')?.closest?.('label')?.querySelector?.('span');if(span&&typeof span.querySelector==='function'&&!span.querySelector('[data-booking-terms]'))span.innerHTML=V17_CONSENT;return r};
const v17RenderTransferTerms=renderTransfer;renderTransfer=function(...a){if(tr.step==='done')v17TransferConsent=false;const r=v17RenderTransferTerms.apply(this,a);const form=$('#trForm');if(form&&!$('#tr-ok',form)){const submit=form.querySelector('button[type="submit"]');const html=`<label class="check"><input type="checkbox" id="tr-ok" name="terms" aria-describedby="te-ok" ${v17TransferConsent?'checked':''}><span>${V17_CONSENT}</span></label><small class="err" id="te-ok"></small>`;if(submit)submit.insertAdjacentHTML('beforebegin',html);else form.insertAdjacentHTML('beforeend',html)}return r};
document.addEventListener('change',e=>{if(e.target.id==='tr-ok'){v17TransferConsent=e.target.checked;setRequestFieldError('tr-ok','te-ok','')}if(e.target.id==='bk-ok')setRequestFieldError('bk-ok','e-ok','')});
const v17ValidateBefore=validateRequestFields;validateRequestFields=function(kind){
 let good=v17ValidateBefore(kind);
 if(kind==='bookings'&&!$('#bk-ok')?.checked){setRequestFieldError('bk-ok','e-ok','Примите условия бронирования и согласие на обработку данных.')}
 if(kind==='transfers'){const ok=!!$('#tr-ok')?.checked;if(!setRequestFieldError('tr-ok','te-ok',ok?'':'Примите условия бронирования и согласие на обработку данных.')&&good){$('#tr-ok')?.focus();good=false}}
 return good;
};

/* ---------- 6. Home: offers first, then the rest, «Вам пригодится», reviews, FAQ ---------- */
const V17_FAQ_DEFAULT=[
 ['Как забронировать экскурсию или билет?','Откройте экскурсию, выберите дату, время и количество участников, затем укажите контакты и отправьте заявку. Для отправки нужен вход через Telegram — так заявка сохранится в вашем личном кабинете.'],
 ['Нужно ли оплачивать заказ заранее?','При отправке заявки оплата не нужна. Сначала диспетчер проверит места и подтвердит заявку, после этого в ней появятся данные для оплаты.'],
 ['Как получить подтверждение бронирования?','Статус заявки отображается в разделе «Мои заявки». Если включить уведомления, сайт сообщит о подтверждении и других изменениях. Менеджер также может связаться с вами в выбранном мессенджере.'],
 ['Можно ли отменить или перенести заказ?','Неоплаченную заявку можно отменить в личном кабинете. По вопросам переноса или отмены оплаченной поездки свяжитесь с менеджером — он расскажет о доступных вариантах.'],
 ['Что делать, если мои планы изменились?','Сообщите менеджеру как можно раньше: по телефону или в мессенджере. Он подскажет, какие варианты возможны для вашей заявки.'],
 ['Можно ли оформить групповое бронирование?','Да. Укажите в заявке количество участников. Для большой группы или отдельной программы лучше заранее связаться с менеджером.'],
 ['Как связаться с поддержкой?',null]
];
function v17FaqItems(){
 const custom=String(C.site?.faqText||'').trim();
 if(custom){const items=custom.split(/\n\s*\n/).map(block=>block.trim().split('\n')).filter(lines=>lines[0]?.trim()&&lines.length>1).map(lines=>[lines[0].trim(),lines.slice(1).join('\n').trim()]);if(items.length)return items}
 const s=C.site||{},contacts=[s.phone?`по телефону ${s.phone}`:'',s.email?`на почту ${s.email}`:''].filter(Boolean).join(' или ');
 return V17_FAQ_DEFAULT.map(([q,a])=>[q==='Как связаться с поддержкой?'?`Как связаться с поддержкой ${s.name||'Апсуа Тур'}?`:q,a??(contacts?`Напишите или позвоните нам ${contacts}. Контакты также есть внизу каждой страницы.`:'Контакты указаны внизу каждой страницы.')]);
}
function v17FaqHTML(){return `<section class="v4-sec v17-faq" id="faq" aria-labelledby="faqTitle"><div class="v4-head"><h2 id="faqTitle">Часто задаваемые вопросы</h2></div><div class="faq-list">${v17FaqItems().map(([q,a],i)=>`<details class="faq-item" id="faq-${i+1}"><summary><span>${esc(q)}</span><i aria-hidden="true">${V17_ICON.chevronDown}</i></summary><div class="faq-answer"><p>${esc(a).replace(/\n/g,'<br>')}</p></div></details>`).join('')}</div></section>`}
// Smooth accordion: height animates from the live size, so a quick second tap reverses it mid-way.
document.addEventListener('click',e=>{
 const summary=e.target.closest?.('.faq-item>summary');if(!summary)return;const item=summary.parentElement,answer=$('.faq-answer',item);if(!answer||typeof answer.animate!=='function'||v17Reduced())return;
 e.preventDefault();const running=item._faqAnimation;const from=answer.getBoundingClientRect().height;running?.cancel();
 const opening=!item.open||item.classList.contains('is-closing');item.classList.remove('is-closing');
 if(opening){item.open=true;const to=answer.scrollHeight;item._faqAnimation=answer.animate([{height:from+'px',opacity:from?1:0},{height:to+'px',opacity:1}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});item._faqAnimation.onfinish=()=>{item._faqAnimation=null}}
 else{item.classList.add('is-closing');item._faqAnimation=answer.animate([{height:from+'px',opacity:1},{height:'0px',opacity:0}],{duration:220,easing:'cubic-bezier(.4,0,.2,1)'});item._faqAnimation.onfinish=()=>{item.open=false;item.classList.remove('is-closing');item._faqAnimation=null}}
});
const v17HomeBefore=homeView;homeView=function(...a){
 const r=v17HomeBefore.apply(this,a);const wrap=$('.v4-home>.wrap');if(!wrap)return r;
 const section=node=>node?.closest('.v4-sec');
 const pop=section($('#v4Pop',wrap)),places=section($('#v4Places',wrap)),stories=section($('#v4Stories',wrap)),steps=$('.v4-steps-sec',wrap),useful=section($('.v4-useful',wrap)),reviews=$('#reviews',wrap);
 // Commercial offers right after the banner; reviews after «Вам пригодится»; FAQ right after reviews.
 for(const node of [pop,places,stories,steps,useful,reviews])if(node)wrap.append(node);
 wrap.insertAdjacentHTML('beforeend',v17FaqHTML());
 const frame=$('.v4-yandex-frame iframe',wrap);if(frame)frame.loading='lazy';
 if(/^#\/faq(?:[?/]|$)/.test(routeHash()))requestAnimationFrame(()=>v17ScrollToFaq(false));
 return r;
};

/* ---------- 7. Footer: social links (addresses are set by the owner, never guessed) ---------- */
const V17_SOCIAL=[['vk','ВКонтакте',/^https:\/\/(?:www\.|m\.)?vk\.(?:com|ru)\/[^\s"'<>]+$/],['instagram','Instagram',/^https:\/\/(?:www\.)?instagram\.com\/[^\s"'<>]+$/]];
function v17SocialHTML(){return `<div class="footer-social" aria-label="Мы в соцсетях">${V17_SOCIAL.map(([key,name,pattern])=>{const url=String(C.site?.[key]||'').trim();return pattern.test(url)?`<a class="social-link social-${key}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${name} — откроется в новой вкладке" title="${name}">${V17_ICON[key]}</a>`:`<span class="social-link social-${key} is-pending" role="img" aria-label="${name}: страница скоро появится" title="${name}: страница скоро появится">${V17_ICON[key]}</span>`}).join('')}</div>`}
const v17ChromeBefore=renderChrome;renderChrome=function(...a){const r=v17ChromeBefore.apply(this,a);const brand=$('#contacts .footer-brand');if(brand&&!$('.footer-social',brand))brand.insertAdjacentHTML('beforeend',v17SocialHTML());return r};


/* ---------- 8. Install offer (PWA) ---------- */
const INSTALL_KEY='apsua-install-offer';
let v17InstallEvent=window.apsuaInstallEvent||null,v17InstallBox=null,v17InstallTimer=0;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();v17InstallEvent=e;window.apsuaInstallEvent=e;v17ScheduleInstall()});
window.addEventListener('appinstalled',()=>{const s=v17Store.get(INSTALL_KEY,{});s.installed=Date.now();v17Store.set(INSTALL_KEY,s);v17InstallEvent=null;v17CloseInstall()});
function v17Platform(){const ua=navigator.userAgent||'';if(/Telegram/i.test(ua)||window.TelegramWebviewProxy)return 'telegram';if(isIOS())return /CriOS|FxiOS|EdgiOS|YaBrowser/i.test(ua)?'ios-other':'ios';if(/android/i.test(ua))return 'android';return 'other'}
function v17InstallBusy(){return ['tour','transfer','admin','account','orders'].includes(current)||!!window.apsuaRequestSending||!!window.apsuaRequestResultOpen||!!window.apsuaAuthPending||!!document.querySelector('dialog[open],.lightbox,#push-welcome')||v17MenuOpen||!!document.activeElement?.matches?.('input,textarea,select')}
function v17InstallEligible(){
 if(isStandalone())return false;const s=v17Store.get(INSTALL_KEY,{});if(s.installed||s.dismissed)return false;
 const mobile=window.matchMedia?.('(pointer: coarse)').matches||/android|iphone|ipad|ipod/i.test(navigator.userAgent||'');if(!mobile)return false;
 // At most once per visit and in at most three visits when it was neither accepted nor refused.
 if(v17Session.get('apsua-install-shown',false))return false;if((Number(s.shows)||0)>=3)return false;
 const platform=v17Platform();return platform==='ios'||platform==='ios-other'||platform==='telegram'||!!v17InstallEvent||platform==='android';
}
function v17ScheduleInstall(delay=3500){clearTimeout(v17InstallTimer);v17InstallTimer=setTimeout(()=>{if(!v17InstallEligible())return;if(v17InstallBusy()){v17ScheduleInstall(4000);return}v17ShowInstall(false)},delay)}
window.addEventListener('site-ready',()=>v17ScheduleInstall());
function v17InstallSteps(platform){
 if(platform==='telegram')return `<ol class="install-steps"><li>Нажмите <b>⋯</b> вверху окна Telegram.</li><li>Выберите <b>«Открыть в браузере»</b> (Safari или Chrome).</li><li>В браузере добавьте сайт на экран «Домой».</li></ol>`;
 if(platform==='ios'||platform==='ios-other')return `<ol class="install-steps"><li>Нажмите ${V17_ICON.share}<b>«Поделиться»</b> ${platform==='ios'?'внизу Safari':'в меню браузера'}.</li><li>Выберите ${V17_ICON.plusSquare}<b>«На экран „Домой“»</b>.</li><li>Нажмите <b>«Добавить»</b>.</li></ol>`;
 return `<ol class="install-steps"><li>Откройте меню браузера <b>⋮</b>.</li><li>Выберите <b>«Установить приложение»</b> или <b>«Добавить на главный экран»</b>.</li><li>Подтвердите установку.</li></ol>`;
}
function v17ShowInstall(manual){
 v17CloseInstall(true);const platform=v17Platform(),name=C.site?.name||'Апсуа Тур';
 if(!manual){v17Session.set('apsua-install-shown',true);const s=v17Store.get(INSTALL_KEY,{});s.shows=(Number(s.shows)||0)+1;v17Store.set(INSTALL_KEY,s)}
 if(isStandalone()){toast('Приложение уже установлено и открыто');return}
 const box=document.createElement('aside');box.className='install-offer';box.setAttribute('role','dialog');box.setAttribute('aria-labelledby','installOfferTitle');box.setAttribute('aria-describedby','installOfferText');
 box.innerHTML=`<div class="install-offer-main"><img src="/api/app-icon-180.png" alt="" width="52" height="52"><div><h2 id="installOfferTitle">${esc(name)} всегда под рукой</h2><p id="installOfferText">Добавьте ${esc(name)} на главный экран телефона, чтобы быстрее находить экскурсии, билеты и управлять бронированиями.</p></div><button type="button" class="install-offer-x" data-install-later aria-label="Закрыть">${V17_ICON.close}</button></div><div class="install-offer-steps" hidden>${v17InstallSteps(platform)}</div><div class="install-offer-actions"><button type="button" class="btn btn-ghost" data-install-later>Не сейчас</button><button type="button" class="btn btn-accent" data-install-go>Установить</button></div>`;
 document.body.append(box);v17InstallBox=box;box._manual=manual;
 if(typeof box.animate==='function')box.animate(v17Reduced()?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translate3d(0,24px,0) scale(.98)'},{opacity:1,transform:'none'}],{duration:v17Reduced()?160:420,easing:'cubic-bezier(.22,1,.36,1)'});
 if(manual)requestAnimationFrame(()=>$('[data-install-go]',box)?.focus({preventScroll:true}));
}
function v17CloseInstall(instant=false){const box=v17InstallBox;if(!box)return;v17InstallBox=null;if(instant||typeof box.animate!=='function'||v17Reduced()){box.remove();return}box.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translate3d(0,24px,0)'}],{duration:220,easing:'cubic-bezier(.4,0,.2,1)'}).onfinish=()=>box.remove()}
document.addEventListener('click',async e=>{
 if(e.target.closest?.('[data-install-open]')){e.preventDefault();v17CloseMenu(true);v17ShowInstall(true);return}
 if(!v17InstallBox?.contains(e.target))return;
 if(e.target.closest('[data-install-later]')){const s=v17Store.get(INSTALL_KEY,{});if(!v17InstallBox._manual){s.dismissed=Date.now();v17Store.set(INSTALL_KEY,s)}v17CloseInstall();return}
 if(e.target.closest('[data-install-go]')){
  if(v17InstallEvent){const prompt=v17InstallEvent;v17InstallEvent=null;try{await prompt.prompt();const choice=await prompt.userChoice;const s=v17Store.get(INSTALL_KEY,{});if(choice?.outcome==='accepted')s.installed=Date.now();else s.dismissed=Date.now();v17Store.set(INSTALL_KEY,s)}catch{}v17CloseInstall();return}
  const steps=$('.install-offer-steps',v17InstallBox);if(steps&&steps.hidden){steps.hidden=false;e.target.closest('[data-install-go]').textContent='Готово';v17InstallBox.classList.add('show-steps');return}
  v17CloseInstall();
 }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&v17InstallBox){v17CloseInstall()}});
// The offer steps aside as soon as a booking or a dialog starts.
window.addEventListener('hashchange',()=>{if(v17InstallBox&&!v17InstallBox._manual&&v17InstallBusy())v17CloseInstall(true)});
if(isStandalone()){const s=v17Store.get(INSTALL_KEY,{});if(!s.installed){s.installed=Date.now();v17Store.set(INSTALL_KEY,s)}}

/* ---------- 9. Notifications: explain first, consent to news separately, open from the menu ---------- */
function v17PushExplain(){const status=$('#push-device-status');const panel=status?.closest('.push-device,.push-welcome');if(!panel||$('.push-explain',panel))return;status.insertAdjacentHTML('beforebegin','<p class="push-explain">Сообщим о подтверждении заявки, изменении статуса, назначении водителя и экскурсовода, а накануне напомним о поездке. Разрешение браузер спросит только после нажатия кнопки.</p>')}
async function v17NewsPreference(){
 const panel=$('.push-device');if(!panel||!pushDeviceEnabled||!pushRegistration)return;let box=$('.push-news',panel);
 try{const sub=await pushRegistration.pushManager.getSubscription();if(!sub)return;const data=await api('/api/push/preferences?endpoint='+encodeURIComponent(sub.endpoint));if(!$('.push-device'))return;
  if(!box){panel.insertAdjacentHTML('beforeend','<label class="check push-news"><input type="checkbox" id="push-news"><span>Также присылать новости и специальные предложения. Можно отключить в любой момент.</span></label>');box=$('.push-news',panel)}
  $('#push-news').checked=!!data.news;$('#push-news')._endpoint=sub.endpoint}catch{}
}
document.addEventListener('change',async e=>{if(e.target.id!=='push-news')return;const input=e.target;input.disabled=true;try{const data=await api('/api/push/preferences',{method:'POST',body:JSON.stringify({endpoint:input._endpoint,news:input.checked})});input.checked=!!data.news;toast(data.news?'Новости включены':'Новости отключены')}catch(err){input.checked=!input.checked;toast(err.message)}finally{input.disabled=false}});
if(typeof refreshPushDevice==='function'){const v17RefreshPushBefore=refreshPushDevice;refreshPushDevice=async function(...a){v17PushExplain();const r=await v17RefreshPushBefore.apply(this,a);v17PushExplain();if(pushDeviceEnabled)v17NewsPreference();else $('.push-news')?.remove();return r}}
const v17AccountBefore=accountView;accountView=function(...a){const r=v17AccountBefore.apply(this,a);if(/[?&]notifications=1/.test(routeHash()))requestAnimationFrame(()=>{const panel=$('.push-device');if(panel){panel.scrollIntoView({block:'center',behavior:v17Reduced()?'instant':'smooth'});panel.classList.add('is-highlighted');setTimeout(()=>panel.classList.remove('is-highlighted'),1600)}});return r};


/* ---------- 17.9: targeted mobile usability fixes ---------- */
function syncOrdersNavState(){
 const link=$('.mnav a[href="/orders"],.mnav a[href="#/orders"]'),orders=serverIdentity?myTripOrders().filter(orderIsActive):[];if(!link)return;
 link.querySelector('.order-nav-state')?.remove();if(!orders.length)return;
 const done=orders.some(o=>['confirmed','paid'].includes(o.status)),state=document.createElement('span');state.className='order-nav-state '+(done?'is-ready':'is-waiting');state.setAttribute('aria-label',done?'Статус заказа обновлён':'Заказ ожидает ответа');state.innerHTML=done?'✓':'⌛';link.appendChild(state);
}
const updateOrderBadgeBefore179=updateOrderAttentionBadge;updateOrderAttentionBadge=function(){const out=updateOrderBadgeBefore179();syncOrdersNavState();return out};

const ORDER_BANNER_POSITION='apsua-orders-banner-position-v2';let ordersBannerDrag=null,ordersBannerMoved=false;
function restoreOrdersBannerPosition(){try{const pos=JSON.parse(localStorage.getItem(ORDER_BANNER_POSITION)||'null');if(!pos)return;ordersBanner.style.left=Math.max(8,Math.min(innerWidth-ordersBanner.offsetWidth-8,pos.x))+'px';ordersBanner.style.top=Math.max(($('.header')?.getBoundingClientRect().bottom||0)+8,Math.min(innerHeight-ordersBanner.offsetHeight-80,pos.y))+'px';ordersBanner.style.right='auto';ordersBanner.style.bottom='auto'}catch{}}
document.addEventListener('pointerdown',e=>{const handle=e.target.closest?.('.orders-banner-toggle');if(!handle||e.button>0)return;const r=ordersBanner.getBoundingClientRect();ordersBannerDrag={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top,moved:false};ordersBannerMoved=false;ordersBanner.classList.add('is-drag-ready')},true);
document.addEventListener('pointermove',e=>{const d=ordersBannerDrag;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<7)return;d.moved=true;ordersBannerMoved=true;ordersBanner.classList.add('is-being-dragged');ordersBanner.style.left=d.left+dx+'px';ordersBanner.style.top=d.top+dy+'px';ordersBanner.style.right='auto';ordersBanner.style.bottom='auto';e.preventDefault()},{passive:false,capture:true});
function releaseOrdersBanner(e){const d=ordersBannerDrag;if(!d||d.id!==e.pointerId)return;ordersBannerDrag=null;ordersBanner.classList.remove('is-drag-ready','is-being-dragged');if(!d.moved)return;const r=ordersBanner.getBoundingClientRect(),outside=r.right<44||r.left>innerWidth-44||r.bottom<44||r.top>innerHeight-44;if(outside){ordersBanner.hidden=true;try{localStorage.removeItem(ORDER_BANNER_POSITION)}catch{}}else{const x=Math.max(8,Math.min(innerWidth-r.width-8,r.left)),y=Math.max(($('.header')?.getBoundingClientRect().bottom||0)+8,Math.min(innerHeight-r.height-76,r.top));ordersBanner.style.left=x+'px';ordersBanner.style.top=y+'px';try{localStorage.setItem(ORDER_BANNER_POSITION,JSON.stringify({x,y}))}catch{}}const stop=ev=>{ev.preventDefault();ev.stopImmediatePropagation()};window.addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>window.removeEventListener('click',stop,true),80)}
document.addEventListener('pointerup',releaseOrdersBanner,true);document.addEventListener('pointercancel',releaseOrdersBanner,true);window.addEventListener('resize',()=>{if(!ordersBanner.hidden)restoreOrdersBannerPosition()});window.addEventListener('site-ready',()=>requestAnimationFrame(restoreOrdersBannerPosition));

document.addEventListener('click',e=>{if(e.target.closest('[data-fleet-any]')){fleetFilters.pax='';const range=$('[data-fleet-filter="pax"]');if(range)range.value='1';$('.fleet-pax-range output')?.replaceChildren('любое');renderFleetResults()}},true);
document.addEventListener('input',e=>{if(e.target.matches('[data-fleet-filter="pax"]'))$('.fleet-pax-range output')?.replaceChildren(e.target.value)},true);

/* The tour price pill duplicated the booking form and obscured content on phones. */
const decorateDockBefore179=v17DecorateDock;v17DecorateDock=function(){decorateDockBefore179();const mb=$('#mbar');if(['tour','transfer'].includes(current)&&mb){mb.hidden=true;document.body.classList.remove('has-mbar')}};

/* 19.1 — mobile interface cleanup: keep data and actions, remove duplicated chrome. */
draftOfferHTML=function(){return ''};
renderTransferRates=function(){};
updateCustomerOrdersBanner=function(){updateOrderAttentionBadge();ordersBanner.hidden=true;ordersBannerExpanded=false;ordersBanner.classList.remove('is-expanded','has-positive');v4OrdersDot()};
function v191VehicleIcon(id){
 if(id==='van')return '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M3 18V9.5c0-1.7 1.3-3 3-3h13l5 5h3c1.1 0 2 .9 2 2V18"/><path d="M3 14h26M8 6.5V14M19 6.5V14"/><circle cx="8" cy="18" r="2.5"/><circle cx="24" cy="18" r="2.5"/></svg>';
 if(id==='group')return '<svg viewBox="0 0 32 24" aria-hidden="true"><rect x="3" y="3" width="26" height="16" rx="4"/><path d="M7 7h18v6H7zM3 14h26M8 19v2M24 19v2"/><circle cx="8" cy="17" r="1"/><circle cx="24" cy="17" r="1"/></svg>';
 return '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="m5 12 3-6h16l3 6M3 13h26v6H3zM7 19v2M25 19v2"/><path d="M8 12h16M7 16h2M23 16h2"/></svg>';
}
function v191VehicleLabel(c){const name={standard:'Седан',van:'Минивэн',group:'Автобус'}[c.id]||c.name,n=Number(c.max)||0;return `<span class="vehicle-icon">${v191VehicleIcon(c.id)}</span><b>${esc(name)}</b><small>${n} ${plural(n,'место','места','мест')}</small>`}
const v191RenderTransfer=renderTransfer;renderTransfer=function(...args){const result=v191RenderTransfer.apply(this,args);$$('#trForm .class').forEach(label=>{const input=$('input[name="cls"]',label),content=$('span',label),item=(C.transfer.classes||[]).find(c=>c.id===input?.value);if(content&&item)content.innerHTML=v191VehicleLabel(item)});return result};


/* ==========================================================================
   Build 152 · compact forms. Layout only: prices, availability, validation, drafts
   and submission stay with the existing code. Every helper below is a no-op when
   its target is not on the page.
   ========================================================================== */
/* A name made only of punctuation or spaces (for example a profile saved as «.») is no name. */
function meaningfulName(value){const text=String(value??'').trim();return /[\p{L}\p{N}]/u.test(text)?text:''}
function v152Group(nodes,className=''){const list=nodes.filter(Boolean);if(!list.length)return null;const group=document.createElement('div');group.className=('v152-group '+className).trim();list[0].before(group);for(const node of list)group.append(node);return group}

/* ---------- Excursion booking: a strip of open dates, the month on demand ---------- */
let v152CalendarOpen=false;
const bookingMonthGrid=bookingCalendar;
bookingCalendar=function(t){return bookingMonthGrid(t)};
document.addEventListener('click',e=>{const toggle=e.target.closest('[data-v152-calendar]');if(toggle&&bk){v152CalendarOpen=!v152CalendarOpen;if(v152CalendarOpen&&bk.date){const d=fromIso(bk.date);bookingMonth=new Date(d.getFullYear(),d.getMonth(),1)}renderBooking();$('[data-v152-calendar]')?.focus({preventScroll:true});return}if(e.target.closest('.booking-calendar .cal-date[data-day]'))v152CalendarOpen=false},true);

function v152EnhanceBooking(){const box=$('#booking');if(!box||!bk||typeof box.querySelector!=='function')return;
 if(bk.step==='form'){const name=$('#bk-name');if(name&&!meaningfulName(name.value))name.value='';return}
 if(bk.step!=='pick'||box.querySelector('.v152-group'))return;
 const season=[...box.children].find(n=>n.matches?.('p.hint')&&!n.closest('.request-draft-offer'));season?.classList.add('v152-eyebrow');
 const head=box.querySelector('.booking-price');if(head&&season)season.after(head);
 v152Group([$('#departure-city')?.closest('label'),$('#booking-kind')?.closest('label')],'v152-rows');
 box.querySelector('.people')?.classList.add('v152-group','v152-rows');
 const total=box.querySelector('.total'),next=box.querySelector('[data-bk="next"]');if(total&&next){const cta=v152Group([total,next],'v152-cta');cta?.classList.remove('v152-group')}
 const assure=box.querySelector('.assure');if(assure)assure.innerHTML=`<span>${ICON.shield}Бесплатная отмена до оплаты · оплата по QR после подтверждения</span>`;
}
const v152BookingBefore=renderBooking;renderBooking=function(...a){const r=v152BookingBefore.apply(this,a);v152EnhanceBooking();return r};

/* ---------- Transfer: grouped rows, cars as quiet icons with seats ---------- */
const V152_CARS={standard:['Седан','<path d="M3.5 15.5v-3l2-4.5a2 2 0 0 1 1.8-1.2h9.4a2 2 0 0 1 1.8 1.2l2 4.5v3"/><path d="M2.5 12.5h19M3.5 15.5h17v2a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1M6.5 16.5v1a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1v-2"/><circle cx="7" cy="14" r=".6"/><circle cx="17" cy="14" r=".6"/>'],van:['Минивэн','<path d="M2.5 16.5V8a2 2 0 0 1 2-2h11l5 5v5.5"/><path d="M2.5 16.5h18M15.5 6v5h5M2.5 11h13"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/>'],group:['Автобус','<rect x="4" y="3.5" width="16" height="14" rx="2.5"/><path d="M4 11h16M8 3.5v7.5M16 3.5v7.5M6.5 20v-2.5M17.5 20v-2.5"/><circle cx="7.5" cy="14.5" r=".7"/><circle cx="16.5" cy="14.5" r=".7"/>']};
function v152SeatsLabel(cls){const n=Number(cls?.max)||0;if(!n)return cls?.note||'';return n+' '+plural(n,'место','места','мест')}
function v152EnhanceTransfer(){const form=$('#trForm');if(!form||typeof form.querySelector!=='function'||form.dataset.v152)return;form.dataset.v152='1';
 const shorten=(selector,text)=>{const span=$(selector,form)?.closest('.field,label')?.querySelector('span');if(span)span.textContent=text};
 shorten('#tr-from',tr.direction==='departure'?'Куда':'Откуда');shorten('#tr-to',tr.direction==='departure'?'Откуда':'Куда');
 const dateField=form.querySelector('[data-pop-open="trdate"]')?.closest('.field');if(dateField)dateField.querySelector('span').textContent=tr.direction==='departure'?'Дата отъезда':'Дата прибытия';
 shorten('#tr-time',tr.direction==='departure'?'Время отправления':'Время прибытия');
 shorten('#tr-hotel','Отель');const hotel=$('#tr-hotel');if(hotel)hotel.placeholder='Необязательно';
 shorten('#tr-address','Адрес *');const address=$('#tr-address');if(address)address.placeholder=tr.direction==='departure'?'Откуда забрать':'Куда отвезти';
 shorten('#tr-flight','Рейс / поезд');const flight=$('#tr-flight');if(flight)flight.placeholder='Необязательно';
 shorten('#tr-name','Имя');shorten('#tr-phone','Телефон *');shorten('#tr-via','Связь *');
 const name=$('#tr-name');if(name&&!meaningfulName(name.value)){name.value='';if(!meaningfulName(tr.name))tr.name=''}
 const grids=[...form.querySelectorAll(':scope > .grid2')];
 grids[0]?.classList.add('v152-group','v152-rows');
 form.querySelector('.tr-address-block')?.classList.add('v152-group','v152-rows');
 const pax=form.querySelector('.tr-passengers');pax?.classList.add('v152-group','v152-rows');pax?.querySelector('label.check')?.classList.add('v152-switch');
 const contacts=grids.find(g=>g.querySelector('#tr-name'));if(contacts){const group=document.createElement('div');group.className='v152-group v152-rows';contacts.before(group);group.append(...contacts.children,...[$('#tr-via')?.closest('label'),$('#tr-flight')?.closest('label')].filter(Boolean));contacts.remove()}
 const classes=form.querySelector('.classes');if(classes){classes.classList.add('v152-cars');for(const label of classes.querySelectorAll('label.class')){const input=label.querySelector('input'),cls=(C.transfer.classes||[]).find(c=>c.id===input?.value);if(!input||!cls)continue;const [short,icon]=V152_CARS[cls.id]||[cls.name,'<rect x="3" y="7" width="18" height="10" rx="3"/>'];label.title=cls.name+(cls.note?' · '+cls.note:'');input.setAttribute('aria-label',`${short}, ${v152SeatsLabel(cls)}${cls.id==='group'?', цена за место':''}`);label.querySelector('span').innerHTML=`<svg class="v152-car-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg><b>${esc(short)}</b><small>${esc(v152SeatsLabel(cls))}</small>`}}
 const via=$('#tr-via');if(via){const choices=[...via.options].filter(o=>o.value),group=document.createElement('div');group.className='v152-seg';group.setAttribute('role','radiogroup');group.setAttribute('aria-label','Как связаться с вами');group.innerHTML=choices.map(o=>`<button type="button" role="radio" data-v152-via="${esc(o.value)}" aria-checked="${via.value===o.value}">${esc(o.textContent)}</button>`).join('');via.after(group);via.tabIndex=-1;via.setAttribute('aria-hidden','true');via.classList.add('v152-native')}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v152-via]');if(!b)return;const via=$('#tr-via');if(!via)return;via.value=b.dataset.v152Via;via.dispatchEvent(new Event('input',{bubbles:true}));via.dispatchEvent(new Event('change',{bubbles:true}));$$('[data-v152-via]').forEach(x=>x.setAttribute('aria-checked',String(x===b)))});
document.addEventListener('keydown',e=>{const b=e.target.closest?.('[data-v152-via]');if(!b||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const all=$$('[data-v152-via]'),next=all[(all.indexOf(b)+(['ArrowRight','ArrowDown'].includes(e.key)?1:all.length-1))%all.length];next.focus();next.click()});
/* Validation focuses the native list; the visible choice takes the focus instead. */
document.addEventListener('focusin',e=>{if(e.target.id==='tr-via'&&e.target.classList.contains('v152-native'))($('[data-v152-via][aria-checked="true"]')||$('[data-v152-via]'))?.focus()});
const v152TransferBefore=renderTransfer;renderTransfer=function(...a){const r=v152TransferBefore.apply(this,a);v152EnhanceTransfer();return r};


/* ---------- Account: one grouped list, bookings first; no «Здравствуйте, .» ---------- */
function v152EnhanceAccount(){const grid=document.querySelector('.acc-grid');if(!grid||typeof grid.querySelector!=='function')return;
 const title=document.querySelector('.acc-head h1'),who=title?.querySelector('span');if(title&&who&&!meaningfulName(who.textContent))title.textContent='Здравствуйте';
 const avatar=document.querySelector('.acc-head .avatar');if(avatar&&!avatar.querySelector('img')&&!meaningfulName(avatar.textContent))avatar.innerHTML='<svg viewBox="0 0 24 24" width="55%" height="55%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5"/></svg>';
 if(grid.querySelector('.v152-account-list'))return;const sections=[$('#myTripOrders'),...grid.querySelectorAll(':scope > details.account-section:not(#myTripOrders)')].filter(Boolean);if(!sections.length)return;const list=v152Group(sections,'v152-account-list');list?.classList.remove('v152-group')}
const accountBeforeV152=accountView;accountView=function(...a){const r=accountBeforeV152.apply(this,a);v152EnhanceAccount();return r};

/* ==========================================================================
   Build 152 · stories and destinations. Ratings, comments, views and the catalog
   filter keep their data and handlers; only the presentation changes.
   ========================================================================== */
const V152_EYE='<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1.8 10S4.8 4.2 10 4.2 18.2 10 18.2 10 15.2 15.8 10 15.8 1.8 10 1.8 10Z"/><circle cx="10" cy="10" r="2.6"/></svg>';
const V152_STAR='<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.9l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.52 5.06 17.11 6 11.61l-4-3.9 5.53-.8L10 1.9Z"/></svg>';
function v152Number(n){return Math.max(0,Math.round(Number(n)||0)).toLocaleString('ru-RU').replace(/ /g,' ')}
function v152Score(s){const r=storyScore(s);return r.count?r.average.toFixed(1).replace('.',','):''}
function v152StoryStats(s){const views=Math.max(0,Number(s.views)||0),r=storyScore(s),score=v152Score(s);
 return `<span class="v152-stats"><span title="${views} ${plural(views,'просмотр','просмотра','просмотров')}">${V152_EYE}${v152Number(views)}</span>${score?`<span title="Средняя оценка ${score} из 5, ${r.count} ${plural(r.count,'оценка','оценки','оценок')}">${V152_STAR}${score}</span>`:''}</span>`}
function v152StoryPhotos(s){return [...new Set([s.img||s.photo,...(s.photos||[])].filter(Boolean).map(p=>src(p)).filter(Boolean))]}
function v152When(value){const d=new Date(value);if(!value||Number.isNaN(d.getTime()))return '';const now=new Date(),day=86400000,start=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(),time=d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
 if(d.getTime()>=start)return 'сегодня, '+time;if(d.getTime()>=start-day)return 'вчера, '+time;return d.toLocaleDateString('ru-RU',d.getFullYear()===now.getFullYear()?{day:'numeric',month:'long'}:{day:'numeric',month:'long',year:'numeric'})}
function v152Quote(line){return /^\s*[«"“„]/.test(line)}

/* Home: destinations fit without scrolling and show how many trips each holds */
function v152CategoryCount(cat){return C.tours.map(t=>tourPublic(t)).filter(t=>t&&(t.cat===cat||tripStyles(t).includes(cat))).length}
function v152EnhanceHome(){
 const places=$('#v4Places');if(places&&typeof places.querySelectorAll==='function'){const tiles=[...places.querySelectorAll('.v4-place')];places.classList.add('v152-places');places.style.setProperty('--v152-n',String(Math.max(1,Math.min(6,tiles.length))));places.classList.toggle('is-odd',tiles.length%2===1);
  for(const tile of tiles){const cat=new URLSearchParams((tile.getAttribute('href')||'').split('?')[1]||'').get('cat');if(!cat)continue;const n=v152CategoryCount(cat),title=tile.querySelector('strong')?.textContent||'';let badge=tile.querySelector('.v152-count');if(!badge){badge=document.createElement('span');badge.className='v152-count';tile.appendChild(badge)}badge.textContent=String(n);badge.title=n+' '+plural(n,'направление','направления','направлений');tile.setAttribute('aria-label',title+', '+badge.title)}}
 const stories=$('#v4Stories');if(stories&&typeof stories.querySelectorAll==='function')for(const card of stories.querySelectorAll('.v4-story')){if(card.querySelector('.v152-stats'))continue;const id=decodeURIComponent((card.getAttribute('href')||'').split('/').pop()||''),s=findStory(id);if(!s)continue;card.querySelector('small')?.insertAdjacentHTML('afterend',v152StoryStats(s))}
}
const homeBeforeV152=homeView;homeView=function(...a){const r=homeBeforeV152.apply(this,a);v152EnhanceHome();return r};

/* Story page */
storyView=function(id){const s=findStory(id);if(!s){app.innerHTML='<div class="wrap section"><h1>История не найдена</h1><a class="btn btn-sea" href="#/diary">Все истории</a></div>';return}
 if(!sess.get('view:'+id)){const views=(Number(s.views)||0)+1;updateStoredStory(id,x=>x.views=views);sess.set('view:'+id,'1');s.views=views}
 const own=Number(s.ratings?.[storyVoteKey()]||0),photos=v152StoryPhotos(s),comments=s.comments||[],user=store.get('user',null),author=s.authorName||s.a||'Путешественник',views=Math.max(0,Number(s.views)||0),r=storyScore(s),score=v152Score(s);
 const gallery=photos.length?`<div class="v152-story-media${photos.length>1?' is-many':''}" data-v152-gallery>${photos.length>1?`<div class="v152-story-track" tabindex="0" aria-label="Фото истории, ${photos.length}">`:''}${photos.map((p,i)=>`<button type="button" class="v152-story-photo" data-v152-photo="${i}" aria-label="Открыть фото ${i+1} из ${photos.length}"><img src="${esc(p)}" alt="Фото поездки ${i+1}" ${i?'loading="lazy"':'fetchpriority="high"'}></button>`).join('')}${photos.length>1?`</div><span class="v152-story-count" aria-hidden="true">1 / ${photos.length}</span><button type="button" class="v152-story-arrow prev" data-v152-slide="-1" aria-label="Предыдущее фото">${ICON.left}</button><button type="button" class="v152-story-arrow next" data-v152-slide="1" aria-label="Следующее фото">${ICON.right}</button>`:''}</div>`:'';
 const text=lines(s.x).map(x=>v152Quote(x)?`<blockquote>${esc(x)}</blockquote>`:`<p>${esc(x)}</p>`).join('');
 const video=`${s.videoUrl?`<video class="v152-story-video" src="${src(s.videoUrl)}" controls playsinline preload="metadata"></video>`:''}${s.videoKey?`<video class="v152-story-video" data-story-media="${esc(s.videoKey)}" controls playsinline preload="metadata"></video>`:''}`;
 const commentList=comments.length?`<ul class="v152-comments">${comments.map(c=>{const mine=isMine(c.uid,user),name=mine?user.name:c.author||'Путешественник',avatar=mine?user.avatar:c.avatar,initial=(meaningfulName(name)||'П').trim()[0];return `<li class="v152-comment"><span class="v152-avatar" ${profileTarget(c.uid)}>${avatar?`<img src="${src(avatar)}" alt="" loading="lazy">`:esc(initial.toUpperCase())}</span><div><p class="v152-comment-head"><b ${profileTarget(c.uid)}>${esc(name)}</b>${v152When(c.created)?`<time datetime="${esc(c.created)}">${esc(v152When(c.created))}</time>`:''}</p><p class="v152-comment-text">${esc(c.text)}</p></div></li>`}).join('')}</ul>`:'<p class="v152-empty">Пока никто не написал. Будьте первым.</p>';
 const form=user?`<form id="storyComment" class="v152-compose" data-id="${esc(id)}"><label class="v152-visually-hidden" for="storyCommentText">Комментарий</label><textarea id="storyCommentText" name="text" rows="1" required maxlength="2000" placeholder="Напишите комментарий" data-v152-autosize></textarea><button class="v152-send" type="submit" disabled>Отправить</button></form>`:`<a class="v152-signin" href="#/account">Войти, чтобы написать комментарий</a>`;
 app.innerHTML=`<article class="wrap story-detail v152-story"><a href="#/diary" class="btn btn-ghost small v152-story-back">← Все истории</a>
<header class="v152-story-head"><p class="v152-story-eyebrow">Дневник путешественников</p><h1>${esc(s.t||'История путешествия')}</h1><p class="v152-story-meta"><span class="v152-story-author" ${profileTarget(s.uid)}>${esc(author)}</span><span>${V152_EYE}${v152Number(views)} ${plural(views,'просмотр','просмотра','просмотров')}</span>${score?`<span>${V152_STAR}${score}<small> · ${r.count} ${plural(r.count,'оценка','оценки','оценок')}</small></span>`:''}</p></header>
${gallery}<div class="v152-prose">${text}</div>${video}
<section class="v152-story-card v152-rate-card" aria-labelledby="storyRateTitle"><h2 id="storyRateTitle">Оцените историю</h2><div class="v152-rate" role="radiogroup" aria-label="Оценка истории">${[1,2,3,4,5].map(n=>`<button type="button" role="radio" aria-checked="${own===n}" data-story-rate="${n}" data-story-id="${esc(id)}" class="${n<=own?'on':''}" aria-label="${n} из 5">${V152_STAR}</button>`).join('')}</div><p class="v152-rate-hint">${own?`Ваша оценка — ${own}. Можно изменить.`:'Нажмите на звезду'}</p></section>
<section class="v152-story-card v152-discussion" aria-labelledby="storyTalkTitle"><h2 id="storyTalkTitle">Обсуждение${comments.length?` <span>${comments.length}</span>`:''}</h2>${commentList}${form}</section></article>`;
 loadStoryMedia()};
function v152SyncGallery(track){const box=track.closest('[data-v152-gallery]'),count=box?.querySelector('.v152-story-count'),n=track.children.length;if(!n)return;const i=Math.max(0,Math.min(n-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));if(count)count.textContent=(i+1)+' / '+n;box.querySelector('.v152-story-arrow.prev')?.toggleAttribute('disabled',i===0);box.querySelector('.v152-story-arrow.next')?.toggleAttribute('disabled',i===n-1)}
document.addEventListener('scroll',e=>{const track=e.target?.closest?.('.v152-story-track');if(track)v152SyncGallery(track)},true);
document.addEventListener('click',e=>{const slide=e.target.closest('[data-v152-slide]');if(slide){const track=slide.closest('[data-v152-gallery]')?.querySelector('.v152-story-track');if(track)track.scrollBy({left:Number(slide.dataset.v152Slide)*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return}
 const photo=e.target.closest('[data-v152-photo]');if(photo){const pics=[...photo.closest('[data-v152-gallery]').querySelectorAll('[data-v152-photo] img')].map(img=>img.getAttribute('src'));lightbox(pics,Number(photo.dataset.v152Photo))}});
function v152Autosize(area){area.style.height='auto';area.style.height=Math.min(area.scrollHeight,240)+'px';const send=area.form?.querySelector('.v152-send');if(send)send.disabled=!area.value.trim()}
document.addEventListener('input',e=>{if(e.target.matches?.('[data-v152-autosize]'))v152Autosize(e.target)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)&&e.target.matches?.('[data-v152-autosize]')&&e.target.value.trim()){e.preventDefault();e.target.form?.requestSubmit()}});
document.addEventListener('focusin',e=>{if(e.target.matches?.('[data-v152-autosize]')&&matchMedia('(max-width: 900px)').matches)setTimeout(()=>e.target.scrollIntoView({block:'center',behavior:'smooth'}),300)});

/* Build 152 · the page end always clears the bottom tab bar. The bar's real height is
   measured, so the iPhone home-indicator area is included. */
let v152PageEndFrame=0;
function v152PageEnd(){v152PageEndFrame=0;const bars=[$('.mnav'),$('#admTabbar')].filter(n=>n&&getComputedStyle(n).display!=='none'&&!n.hidden&&n.getBoundingClientRect().height>0);
 const height=bars.reduce((max,n)=>Math.max(max,innerHeight-n.getBoundingClientRect().top),0);document.documentElement.style.setProperty('--v152-tab-space',Math.ceil(height+16)+'px');
 const footer=$('#contacts'),candidate=footer&&getComputedStyle(footer).display!=='none'&&footer.getBoundingClientRect().height>0?footer:app;
 for(const node of $$('.v152-page-end'))if(node!==candidate){node.classList.remove('v152-page-end');node.style.removeProperty('padding-bottom')}
 if(!candidate)return;candidate.style.removeProperty('padding-bottom');if(!height){candidate.classList.remove('v152-page-end');return}
 // Space the page already leaves below its last visible block (paddings, margins), so the bar is cleared without doubling it.
 let node=candidate,trailing=0;for(let depth=0;depth<10;depth++){const child=[...node.children].reverse().find(c=>{const cs=getComputedStyle(c);return cs.display!=='none'&&cs.position!=='fixed'&&cs.position!=='absolute'&&c.getBoundingClientRect().height>0});if(!child)break;trailing+=Math.max(0,node.getBoundingClientRect().bottom-child.getBoundingClientRect().bottom);node=child}
 const pad=Math.max(0,Math.ceil(height+20-trailing+(parseFloat(getComputedStyle(candidate).paddingBottom)||0)));candidate.classList.add('v152-page-end');candidate.style.setProperty('padding-bottom',pad+'px','important')}
function v152QueuePageEnd(){if(v152PageEndFrame||typeof requestAnimationFrame!=='function')return;v152PageEndFrame=requestAnimationFrame(v152PageEnd)}
if(typeof MutationObserver!=='undefined'&&typeof app!=='undefined'&&app)new MutationObserver(v152QueuePageEnd).observe(app,{childList:true});
addEventListener('resize',v152QueuePageEnd);addEventListener('hashchange',v152QueuePageEnd);addEventListener('load',v152QueuePageEnd);v152QueuePageEnd();

/* Build 152 · on a phone: offer to install on the first visit and on every new visit until
   installed; in the installed app, ask for notifications on every new visit until allowed.
   «Позже» only hides the offer for the current visit. */
v17InstallEligible=function(){if(isStandalone())return false;const s=v17Store.get(INSTALL_KEY,{});if(s.installed)return false;
 const mobile=window.matchMedia?.('(pointer: coarse)').matches||/android|iphone|ipad|ipod/i.test(navigator.userAgent||'');if(!mobile)return false;
 return !v17Session.get('apsua-install-shown',false)};
v17InstallBusy=function(){return ['admin','tour','transfer'].includes(current)||!!window.apsuaRequestSending||!!window.apsuaRequestResultOpen||!!window.apsuaAuthPending||!!document.querySelector('dialog[open],.lightbox,#push-welcome')||v17MenuOpen||!!document.activeElement?.matches?.('input,textarea,select')};
const v152ScheduleInstallBefore=v17ScheduleInstall;v17ScheduleInstall=function(delay=1200){return v152ScheduleInstallBefore(delay)};
const v152ShowInstallBefore=v17ShowInstall;v17ShowInstall=function(manual){v152ShowInstallBefore(manual);const box=v17InstallBox;if(!box)return;
 const title=$('#installOfferTitle',box),text=$('#installOfferText',box);if(title)title.textContent='Установите приложение';
 if(text)text.innerHTML='Так будет доступно больше:<ul class="v152-install-perks"><li>уведомления о статусе заявки и напоминание о поездке</li><li>вход в одно касание</li><li>открывается с экрана «Домой», как обычное приложение</li></ul>';
 const later=$('.install-offer-actions [data-install-later]',box);if(later)later.textContent='Позже'};
/* «Позже» and a declined system prompt no longer hide the offer for good. */
document.addEventListener('click',e=>{if(v17InstallBox&&e.target.closest?.('[data-install-later]')&&v17InstallBox.contains(e.target)){setTimeout(()=>{const s=v17Store.get(INSTALL_KEY,{});if(s.dismissed&&!s.installed){delete s.dismissed;v17Store.set(INSTALL_KEY,s)}},0)}},true);
window.addEventListener('appinstalled',()=>{try{sessionStorage.removeItem('apsua-push-later')}catch{}});

function v152PushSteps(){if(isIOS())return 'Откройте «Настройки» → «Уведомления» → «Апсуа Тур» и включите «Допуск уведомлений».';return 'Нажмите и подержите значок «Апсуа Тур» → «О приложении» → «Уведомления» и включите их.'}
function v152PushNudge(){
 const guestNudge=$('.v152-push-nudge[data-kind="guest"]');if(guestNudge&&serverIdentity){guestNudge.remove();v152PushWelcomeBefore()}
 if(!serverReady)return;
 if(!pushInstalled()||!pushAvailable()||pushDeviceEnabled||pushDeviceChanging||current==='account'||current==='admin'||$('#push-welcome'))return;
 try{if(sessionStorage.getItem('apsua-push-later')==='1')return}catch{}
 if(serverIdentity&&Notification.permission!=='denied')return; // the regular prompt handles this case
 if(serverIdentity&&pushOptedOut())return;
 const denied=Notification.permission==='denied';
 document.body.insertAdjacentHTML('beforeend',`<aside id="push-welcome" class="push-welcome panel is-ready v152-push-nudge" data-kind="${denied?'denied':'guest'}" aria-label="Уведомления"><div><h2>${denied?'Уведомления выключены':'Будьте в курсе'}</h2><p class="sub">${denied?'Без них вы не узнаете о подтверждении заявки и назначении водителя. '+v152PushSteps():'Войдите, чтобы получать уведомления о подтверждении заявки, назначении водителя и напоминание о поездке.'}</p></div><div class="push-welcome-actions">${denied?'':'<a class="btn btn-sea small" href="#/account" data-v152-push-login>Войти и включить</a>'}<button type="button" class="btn small" id="push-later">${denied?'Понятно':'Позже'}</button></div></aside>`)}
const v152PushWelcomeBefore=pushWelcome;pushWelcome=function(){v152PushWelcomeBefore();v152PushNudge()};
window.addEventListener('site-ready',()=>{v152PushNudge();setTimeout(v152PushNudge,1500)});window.addEventListener('pageshow',v152PushNudge);window.addEventListener('hashchange',()=>setTimeout(v152PushNudge,0));
document.addEventListener('click',e=>{if(e.target.closest?.('[data-v152-push-login]'))$('#push-welcome')?.remove()});

const STAFF_ROLES={admin:['Администратор','Всё, кроме выдачи доступов'],dispatcher:['Диспетчер','Заявки, статусы и оплата'],editor:['Редактор','Экскурсии и полезное'],observer:['Наблюдатель','Только просмотр заявок']};
let staffRows=[],staffQuery='';
function staffMatches(row){const query=staffQuery.trim().toLocaleLowerCase('ru');return !query||[row.name,row.username,row.username?'@'+row.username:''].some(value=>String(value||'').toLocaleLowerCase('ru').includes(query))}
function staffRowHTML(row){const initial=(row.name||row.username||'T').trim()[0]?.toUpperCase()||'T',seen=row.seenAt?new Date(row.seenAt).toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'}):'';return `<article class="staff-row" data-staff-id="${esc(row.id)}"><span class="staff-avatar">${row.avatar?`<img src="${src(row.avatar)}" alt="">`:esc(initial)}</span><div class="staff-person"><b>${esc(row.name||'Пользователь Telegram')}</b>${row.username?`<span>@${esc(row.username)}</span>`:'<span>Ник не указан</span>'}${seen?`<small>Заходил ${esc(seen)}</small>`:''}</div><label class="staff-role"><span class="sr-only">Доступ для ${esc(row.name||row.username||'пользователя')}</span><select class="input" data-staff-role><option value="">Без доступа</option>${Object.entries(STAFF_ROLES).map(([value,[label]])=>`<option value="${value}" ${row.role===value?'selected':''}>${label}</option>`).join('')}</select><small>${row.role?esc(STAFF_ROLES[row.role]?.[1]||''):''}</small></label></article>`}
function renderStaffRows(){const root=$('#staffRows');if(!root)return;const rows=staffRows.filter(staffMatches);root.innerHTML=rows.map(staffRowHTML).join('')||'<p class="hint">Никого не найдено.</p>'}
document.addEventListener('input',event=>{if(!event.target.matches?.('[data-staff-search]'))return;staffQuery=event.target.value;renderStaffRows()});
document.addEventListener('change',async event=>{const select=event.target.closest?.('[data-staff-role]');if(!select)return;const row=select.closest('[data-staff-id]'),userId=row?.dataset.staffId,previous=staffRows.find(item=>item.id===userId)?.role||'';select.disabled=true;try{const result=await api('/api/admin/staff',{method:'PUT',body:JSON.stringify({userId,role:select.value})});staffRows=result.staff||[];renderStaffRows();toast(select.value?'Доступ обновлён':'Доступ отозван')}catch(error){select.value=previous;toast(error.message)}finally{if(select.isConnected)select.disabled=false}});


/* Build 152 · minimal QR code encoder (byte mode, error correction M, versions 1–10).
   Only used to show the sign-in link as a QR code; no network, no library. */
const V152_QR=(()=>{
 const BLOCKS=[null,[10,1,16,0,0],[16,1,28,0,0],[26,1,44,0,0],[18,2,32,0,0],[24,2,43,0,0],[16,4,27,0,0],[18,4,31,0,0],[22,2,38,2,39],[22,3,36,2,37],[26,4,43,1,44]];
 const ALIGN=[null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
 const EXP=new Array(512),LOG=new Array(256);for(let i=0,x=1;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d}for(let i=255;i<512;i++)EXP[i]=EXP[i-255];
 const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
 function rs(data,n){let gen=[1];for(let i=0;i<n;i++){const next=new Array(gen.length+1).fill(0);for(let j=0;j<gen.length;j++){next[j]^=gen[j];next[j+1]^=mul(gen[j],EXP[i])}gen=next}
  const res=new Array(n).fill(0);for(const d of data){const f=d^res[0];res.shift();res.push(0);for(let j=0;j<n;j++)res[j]^=mul(gen[j+1],f)}return res}
 function encode(text){
  const bytes=[...new TextEncoder().encode(String(text))];let version=0;
  for(let v=1;v<=10;v++){const b=BLOCKS[v],cap=b[1]*b[2]+b[3]*b[4];if(4+(v<10?8:16)+bytes.length*8<=cap*8){version=v;break}}
  if(!version)throw new Error('QR: text too long');
  const [ecLen,g1,d1,g2,d2]=BLOCKS[version],cap=g1*d1+g2*d2,bits=[];const put=(val,len)=>{for(let i=len-1;i>=0;i--)bits.push((val>>>i)&1)};
  put(4,4);put(bytes.length,version<10?8:16);for(const b of bytes)put(b,8);put(0,Math.min(4,cap*8-bits.length));while(bits.length%8)bits.push(0);
  const data=[];for(let i=0;i<bits.length;i+=8)data.push(bits.slice(i,i+8).reduce((a,b)=>a<<1|b,0));for(let pad=0xEC;data.length<cap;pad^=0xEC^0x11)data.push(pad);
  const blocks=[];let at=0;for(let i=0;i<g1+g2;i++){const len=i<g1?d1:d2,chunk=data.slice(at,at+len);at+=len;blocks.push({data:chunk,ec:rs(chunk,ecLen)})}
  const words=[];for(let i=0;i<Math.max(d1,d2);i++)for(const b of blocks)if(i<b.data.length)words.push(b.data[i]);for(let i=0;i<ecLen;i++)for(const b of blocks)words.push(b.ec[i]);
  const size=17+4*version,mod=[...Array(size)].map(()=>new Array(size).fill(false)),fn=[...Array(size)].map(()=>new Array(size).fill(false));
  const set=(x,y,dark)=>{mod[y][x]=dark;fn[y][x]=true};
  for(let i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
  for(const [cx,cy] of [[3,3],[size-4,3],[3,size-4]])for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy;if(x>=0&&x<size&&y>=0&&y<size){const d=Math.max(Math.abs(dx),Math.abs(dy));set(x,y,d!==2&&d!==4)}}
  const al=ALIGN[version],last=al.length-1;for(let i=0;i<al.length;i++)for(let j=0;j<al.length;j++){if(i===0&&j===0||i===0&&j===last||i===last&&j===0)continue;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(al[i]+dx,al[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}
  const format=mask=>{const d=mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412,bit=i=>((b>>>i)&1)===1;
   for(let i=0;i<=5;i++)set(8,i,bit(i));set(8,7,bit(6));set(8,8,bit(7));set(7,8,bit(8));for(let i=9;i<15;i++)set(14-i,8,bit(i));
   for(let i=0;i<8;i++)set(size-1-i,8,bit(i));for(let i=8;i<15;i++)set(8,size-15+i,bit(i));set(8,size-8,true)};
  format(0);
  if(version>=7){let r=version;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(version<<12)|r;for(let i=0;i<18;i++){const bit=((b>>>i)&1)===1,a=size-11+i%3,c=Math.floor(i/3);set(a,c,bit);set(c,a,bit)}}
  let n=0;for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;if(!fn[y][x]&&n<words.length*8){mod[y][x]=((words[n>>>3]>>>(7-(n&7)))&1)===1;n++}}}
  const MASKS=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
  const apply=m=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!fn[y][x]&&MASKS[m](x,y))mod[y][x]=!mod[y][x]};
  const penalty=()=>{let p=0;for(let pass=0;pass<2;pass++)for(let a=0;a<size;a++){let run=1;for(let b=1;b<size;b++){const cur=pass?mod[b][a]:mod[a][b],prev=pass?mod[b-1][a]:mod[a][b-1];if(cur===prev){run++;if(run===5)p+=3;else if(run>5)p++}else run=1}}
   for(let y=0;y<size-1;y++)for(let x=0;x<size-1;x++){const c=mod[y][x];if(c===mod[y][x+1]&&c===mod[y+1][x]&&c===mod[y+1][x+1])p+=3}
   const pat=[1,0,1,1,1,0,1];for(let pass=0;pass<2;pass++)for(let a=0;a<size;a++)for(let b=0;b+6<size;b++){let ok=true;for(let k=0;k<7&&ok;k++)ok=(pass?mod[b+k][a]:mod[a][b+k])===!!pat[k];if(!ok)continue;const light=(s,e)=>{for(let k=s;k<e;k++){if(k<0||k>=size)continue;if(pass?mod[k][a]:mod[a][k])return false}return true};if(light(b-4,b)||light(b+7,b+11))p+=40}
   let dark=0;for(const row of mod)for(const c of row)if(c)dark++;p+=Math.floor(Math.abs(dark*20-size*size*10)/(size*size))*10;return p};
  let best=0,bestScore=Infinity;for(let m=0;m<8;m++){apply(m);format(m);const s=penalty();if(s<bestScore){bestScore=s;best=m}apply(m)}
  apply(best);format(best);return mod}
 function svg(text,label='QR-код'){const m=encode(text),size=m.length,q=4,total=size+2*q;let d='';for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(m[y][x])d+=`M${x+q} ${y+q}h1v1h-1z`;
  return `<svg class="v152-qr-svg" viewBox="0 0 ${total} ${total}" role="img" aria-label="${label}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#fff"/><path d="${d}" fill="#1d1d1f"/></svg>`}
 return {encode,svg}})();

/* Build 152 · Telegram sign-in through the site's bot on every device. On a phone the button
   opens the bot chat in the Telegram app; on a computer a QR code (scan with the phone) and
   buttons for Telegram Desktop and Telegram Web. No phone number or code is needed: the bot
   asks to press «Авторизоваться», and the page finishes the sign-in by itself. The official
   Telegram window (phone number) stays as a fallback link. */
const V152_TG_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.4 4.3 2.9 11.4c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2.8-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.3-1.5ZM9.6 14.6l-.4 4.1-1.4-4.5 10.2-6.4-8.4 6.8Z"/></svg>';
function v152Desktop(){return !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches}
function v152TelegramLinks(data){let url='',web='';try{const u=new URL(data.url);if(u.origin==='https://t.me'&&/^\/[A-Za-z0-9_]{5,32}$/.test(u.pathname)&&/^login_[a-f0-9]{32}$/.test(u.searchParams.get('start')||''))url=u.href}catch{}
 try{const w=new URL(data.webUrl);if(w.origin==='https://web.telegram.org'&&w.pathname==='/k/')web=w.href}catch{}
 if(!url)throw new Error('Некорректная ссылка Telegram');const u=new URL(url);return {url,web,app:'tg://resolve?domain='+u.pathname.slice(1)+'&start='+u.searchParams.get('start')}}
telegramAuthMessage=function(text='',pending=false){$$('[data-tg-login]').forEach(slot=>{const status=$('.tg-app-status',slot);slot.classList.toggle('is-waiting',pending);const lock=pending&&telegramAuthAttempt?.mode!=='web';for(const open of $$('.tg-app-open',slot)){if(open.tagName==='BUTTON')open.disabled=lock;else if(lock)open.setAttribute('aria-disabled','true');else if(open.getAttribute('href')!=='#')open.removeAttribute('aria-disabled')}if(status){status.hidden=!text;status.textContent=text}})};
const V152_TG_WAIT='Нажмите в Telegram «Начать», затем «Авторизоваться» — и вернитесь сюда.';
mountTelegramLogin=function(slot=$('[data-tg-login]')){
 if(!slot||slot.childElementCount||!serverTelegramAuth.enabled)return;
 const desktop=v152Desktop();slot.classList.add('v152-tg',desktop?'is-desktop':'is-phone');
 slot.innerHTML=desktop
  ?`<div class="v152-tg-qr" aria-live="polite"><span class="v152-tg-qr-box" data-v152-tg-qr><span class="v152-tg-qr-wait">Готовим QR…</span></span><div class="v152-tg-qr-text"><h3>Войдите с телефона</h3><p>Наведите камеру телефона на код. Откроется Telegram: нажмите «Начать», затем «Авторизоваться». Вход на этом компьютере завершится сам.</p><div class="v152-tg-actions"><a class="btn btn-primary tg-app-open" data-v152-tg-open="app" href="#" aria-disabled="true">${V152_TG_ICON}Открыть Telegram</a><a class="btn btn-ghost tg-app-open" data-v152-tg-open="web" href="#" target="_blank" rel="noopener noreferrer" aria-disabled="true">Telegram Web</a></div></div></div><p class="tg-app-status" role="status" hidden></p><button type="button" class="v152-tg-alt" data-v152-tg-phone>Войти по номеру телефона</button>`
  :`<a class="btn btn-primary tg-app-open" data-v152-tg-open="url" href="#" target="_blank" rel="noopener noreferrer" aria-disabled="true">${V152_TG_ICON}Войти через Telegram</a><p class="v152-tg-steps">Откроется чат с ботом «Апсуа Тур». Нажмите «Начать», затем «Авторизоваться» и вернитесь на сайт. Номер и код не нужны.</p><p class="tg-app-status" role="status" hidden></p><button type="button" class="v152-tg-alt" data-v152-tg-phone>Нет Telegram на этом телефоне? Войти по номеру</button>`;
 const current=()=>slot.isConnected!==false,fail=err=>endTelegramAttempt(err?.message||'Не удалось войти. Попробуйте ещё раз.');
 slot._bot=null;slot._oidc=null;slot._botError='';
 const paint=()=>{const bot=slot._bot;for(const a of $$('[data-v152-tg-open]',slot)){const href=bot?bot.links[a.dataset.v152TgOpen]:'';if(href){a.href=href;a.removeAttribute('aria-disabled');a.hidden=false}else{a.setAttribute('href','#');if(a.dataset.v152TgOpen==='web'&&bot)a.hidden=true;else a.setAttribute('aria-disabled','true')}}
  const box=$('[data-v152-tg-qr]',slot);if(box){box.innerHTML=bot?V152_QR.svg(bot.links.url,'QR-код для входа через Telegram'):`<span class="v152-tg-qr-wait">${slot._botError?'QR недоступен':'Готовим QR…'}</span>`}
  const alt=$('[data-v152-tg-phone]',slot),noBot=!bot&&!!slot._botError;slot.classList.toggle('has-bot',!!bot);slot.classList.toggle('no-bot',noBot);
  // Without the bot the official Telegram window becomes the main way in.
  if(alt){alt.className=noBot?'btn btn-primary v152-tg-alt is-main':'v152-tg-alt';alt.innerHTML=noBot?V152_TG_ICON+'Войти через Telegram':(desktop?'Войти по номеру телефона':'Нет Telegram на этом телефоне? Войти по номеру')}
  // On a computer the QR code can be scanned without any click, so the page listens for the approval right away.
  if(desktop&&bot&&!telegramAuthAttempt&&current())startTelegramAttempt(bot);
  if(telegramAuthAttempt)telegramAuthMessage(telegramAuthAttempt.mode==='web'?(desktop?'Ждём подтверждения в Telegram…':V152_TG_WAIT):'После подтверждения вернитесь на сайт.',true)};
 const prepareBot=async()=>{try{const data=await api('/api/telegram-login/start',{method:'POST',body:JSON.stringify({mode:'web'})});if(!current())return;slot._bot={...data,mode:'web',links:v152TelegramLinks(data)};slot._botError='';clearTimeout(slot._botTimer);slot._botTimer=setTimeout(()=>{if(current()&&!telegramAuthAttempt){slot._bot=null;prepareBot()}},Math.max(5000,Number(data.expires)-Date.now()-15000))}catch(err){if(!current())return;slot._bot=null;slot._botError=err?.message||'unavailable'}paint()};
 const prepareOIDC=async()=>{try{const results=await Promise.all([api('/api/telegram-oidc/start',{method:'POST',body:'{}'}),loadTelegramLoginSDK()]);if(current())slot._oidc={...results[0],mode:'oidc'}}catch{if(current())slot._oidc=null}};
 slot._refreshTelegramWeb=slot._refreshTelegramLogin=()=>{slot._bot=null;paint();prepareBot();prepareOIDC()};
 slot._v152Fail=fail;paint();prepareBot();prepareOIDC();
};
document.addEventListener('click',e=>{const open=e.target.closest?.('[data-v152-tg-open]');if(!open)return;const slot=open.closest('[data-tg-login]');if(!slot)return;
 if(telegramAuthAttempt){if(telegramAuthAttempt.mode!=='web')e.preventDefault();return}
 const bot=slot._bot;if(!bot||Date.now()>=bot.expires||open.hasAttribute('aria-disabled')){e.preventDefault();slot._refreshTelegramLogin?.();return}
 startTelegramAttempt(bot);telegramAuthMessage(V152_TG_WAIT,true)});
document.addEventListener('click',e=>{const alt=e.target.closest?.('[data-v152-tg-phone]');if(!alt)return;const slot=alt.closest('[data-tg-login]');if(!slot)return;e.preventDefault();
 if(telegramAuthAttempt?.mode==='web')endTelegramAttempt();if(telegramAuthAttempt)return;
 const challenge=slot._oidc,fail=slot._v152Fail||(err=>endTelegramAttempt(err?.message||'Не удалось войти.'));
 if(!challenge||Date.now()>=challenge.expires||!window.Telegram?.Login){telegramAuthMessage('Готовим вход по номеру… Нажмите ещё раз через секунду.',false);slot._refreshTelegramLogin?.();return}
 const attempt=startTelegramAttempt(challenge);slot._oidc=null;
 try{const opening=window.Telegram.Login.auth({client_id:Number(challenge.clientId),scope:['profile'],lang:'ru',nonce:challenge.nonce},async answer=>{
  if(telegramAuthAttempt!==attempt)return;
  if(!answer?.id_token){await recoverTelegramSignin();if(telegramAuthAttempt===attempt)fail(new Error(answer?.error?'Вход не завершён. Попробуйте ещё раз.':'Вход отменён'));return}
  try{telegramAuthMessage('Входим…',true);await api('/api/telegram-oidc/finish',{method:'POST',body:JSON.stringify({id_token:answer.id_token})});if(telegramAuthAttempt!==attempt)return;const data=await api('/api/state');if(!completeTelegramSignin(data,attempt)&&telegramAuthAttempt===attempt){telegramAuthMessage('Обновляем вход…',true);recoverTelegramSignin()}}catch(err){if(telegramAuthAttempt===attempt)fail(err)}
 });if(opening?.catch)opening.catch(err=>{if(telegramAuthAttempt===attempt)fail(err)})}catch(err){fail(err)}});

/* A desktop QR wait stops when the sign-in window is closed. */
const closeTelegramSigninBeforeV152=closeTelegramSignin;closeTelegramSignin=function(...a){const r=closeTelegramSigninBeforeV152.apply(this,a);if(telegramAuthAttempt?.mode==='web'&&!serverIdentity&&!$('[data-tg-login]'))endTelegramAttempt();return r};

/* ==========================================================================
   Build 152 · lighter photos. New uploads are re-encoded (WebP when the browser can,
   otherwise JPEG) and get a small copy for cards. Photos uploaded earlier get light
   copies on the next admin save. Originals stay in storage; C.mediaLight maps an
   uploaded photo to its light copies: {"/api/media/<id>": {t: card copy, f: full copy}}.
   ========================================================================== */
const V152_MEDIA=/^\/api\/media\/[a-f0-9-]{36}$/,V152_THUMB=1000,V152_FULL=1800;
let v152WebP=null;
function v152CanWebP(){if(v152WebP!==null)return v152WebP;try{const c=document.createElement('canvas');c.width=c.height=2;v152WebP=c.toDataURL('image/webp').startsWith('data:image/webp')}catch{v152WebP=false}return v152WebP}
// Halving steps keep detail when a large photo is reduced a lot.
function v152Draw(source,width,height,opaque){let w=source.width,h=source.height,img=source;
 while(w/2>=width*1.6&&h/2>=height*1.6){const c=document.createElement('canvas');c.width=Math.round(w/2);c.height=Math.round(h/2);const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(img,0,0,c.width,c.height);img=c;w=c.width;h=c.height}
 const c=document.createElement('canvas');c.width=width;c.height=height;const g=c.getContext('2d');g.imageSmoothingQuality='high';if(opaque){g.fillStyle='#fff';g.fillRect(0,0,width,height)}g.drawImage(img,0,0,width,height);return c}
function v152Encode(canvas,keepAlpha){if(keepAlpha)return canvas.toDataURL('image/png');return v152CanWebP()?canvas.toDataURL('image/webp',.82):canvas.toDataURL('image/jpeg',.84)}
function v152Resize(image,max,keepAlpha=false){const k=Math.min(1,max/Math.max(image.width,image.height)),w=Math.max(1,Math.round(image.width*k)),h=Math.max(1,Math.round(image.height*k));return v152Encode(v152Draw(image,w,h,!keepAlpha),keepAlpha)}
// Same contract as before (callback with a data URL or ''), with better scaling and WebP.
readPhoto=function(file,max,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{try{const alpha=/png|webp|svg/.test(file.type)&&max<=800;cb(v152Resize(im,max,alpha))}catch{cb('')}};im.onerror=()=>cb('');im.src=r.result};r.onerror=()=>cb('');r.readAsDataURL(file)};
async function v152Upload(dataUrl){const blob=await(await fetch(dataUrl)).blob();const result=await api('/api/media',{method:'POST',headers:{'Content-Type':blob.type},body:blob});return result.url}
function v152MediaUrl(value){const v=String(value||'');if(V152_MEDIA.test(v))return v;if(v.startsWith('img:')){const u=mediaMapping?.[v.slice(4)]||IMG[v.slice(4)];return V152_MEDIA.test(String(u||''))?u:''}return ''}
function v152Light(){if(!C.mediaLight||typeof C.mediaLight!=='object'||Array.isArray(C.mediaLight))C.mediaLight={};return C.mediaLight}
// New uploads: the stored file is already light; a card copy is added next to it.
const storePhotoBeforeV152=storePhoto;storePhoto=async function(file,max){const value=await storePhotoBeforeV152(file,max);try{const url=v152MediaUrl(value);if(url&&max>V152_THUMB&&!serverEditor){const image=await v152LoadImage(url);if(image&&Math.max(image.width,image.height)>V152_THUMB*1.15){const thumb=await v152Upload(v152Resize(image,V152_THUMB));v152Light()[url]={...(v152Light()[url]||{}),t:thumb}}}}catch{}return value};
function v152LoadImage(url){return new Promise(resolve=>{const im=new Image();im.decoding='async';im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=url})}

// Show the light copies: card copy in lists and rails, full copy in banners and galleries.
const V152_FULL_ZONE='.v4-hero,.tour-gallery,.gallery,[data-gallery-main],.v152-story-media,.photo-lightbox,.lightbox,.adm,.v152-season';
const V152_BUILTIN_LIGHT={"assets/lake2.jpg":{t:"assets/lake2-card.webp"},"assets/ritsa-new.jpg":{t:"assets/ritsa-new-card.webp"},"assets/ritsa-wide.jpg":{t:"assets/ritsa-wide-card.webp"},"assets/athos.jpg":{t:"assets/athos-card.webp"},"assets/ring-new.jpg":{t:"assets/ring-new-card.webp"}};
function v152UseLight(root=app){const light={...V152_BUILTIN_LIGHT,...(C?.mediaLight&&typeof C.mediaLight==='object'?C.mediaLight:{})};if(!root)return;
 const images=[];if(root.matches?.('img'))images.push(root);if(typeof root.querySelectorAll==='function')images.push(...root.querySelectorAll('img'));
 for(const img of images){const original=img.dataset.v152Src||img.getAttribute('src')||'';const entry=light&&light[original];if(!entry||entry.skip)continue;const full=!!img.closest(V152_FULL_ZONE),target=full?(entry.f||original):(entry.t||entry.f||original);if(target!==img.getAttribute('src')){img.dataset.v152Src=original;img.setAttribute('src',target)}if(!img.hasAttribute('decoding'))img.decoding='async'}}
const lightboxBeforeV152=lightbox;lightbox=function(pics,i){const light=C?.mediaLight||{};return lightboxBeforeV152((pics||[]).map(p=>light[p]?.f||p),i)};
let v152LightFrame=0,v152LightRoots=new Set();
function v152QueueLight(root){if(root?.nodeType===1)v152LightRoots.add(root);if(v152LightFrame)return;v152LightFrame=requestAnimationFrame(()=>{v152LightFrame=0;const roots=[...v152LightRoots];v152LightRoots.clear();for(const node of roots)if(node.isConnected)v152UseLight(node)})}
if(typeof MutationObserver!=='undefined'&&typeof app!=='undefined'&&app)new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)v152QueueLight(node)}).observe(app,{childList:true,subtree:true});
// Swap to light copies in the same task as the render, so the heavy originals are never requested.
const v152LightWrap=fn=>function(...a){const r=fn.apply(this,a);try{v152UseLight(app)}catch{}return r};
tourView=v152LightWrap(tourView);catalogView=v152LightWrap(catalogView);renderCards=v152LightWrap(renderCards);diaryView=v152LightWrap(diaryView);reviewsView=v152LightWrap(reviewsView);usefulView=v152LightWrap(usefulView);fleetPage=v152LightWrap(fleetPage);

/* ==========================================================================
   Build 152 · seasonal banner. Three supplied motion banners rotate every four
   seconds. Each one can open its own excursion or a safe external link.
   ========================================================================== */
const V152_SEASON_MEDIA=[
 {id:'mandarins',title:'Мандариновый сезон',webm:'assets/seasonal/mandarins.webm',mp4:'assets/seasonal/mandarins.mp4',poster:'assets/seasonal/mandarins-poster.webp'},
 {id:'autumn',title:'Осенние экскурсии',webm:'assets/seasonal/autumn.webm',mp4:'assets/seasonal/autumn.mp4',poster:'assets/seasonal/autumn-poster.webp'},
 {id:'transfer',title:'Трансфер в Абхазию и обратно',webm:'assets/seasonal/transfer.webm',mp4:'assets/seasonal/transfer.mp4',poster:'assets/seasonal/transfer-poster.webp'}
];
const V152_SEASON_DEFAULT={show:true,items:V152_SEASON_MEDIA.map(()=>({mode:'tour',tour:'',url:''}))};
function v152Season(){const saved=C.seasonBanner&&typeof C.seasonBanner==='object'?C.seasonBanner:{},legacyTour=String(saved.tour||'');const raw=Array.isArray(saved.items)?saved.items:[];return {show:saved.show!==false,items:V152_SEASON_MEDIA.map((media,i)=>{const item=raw[i]&&typeof raw[i]==='object'?raw[i]:{};return {...media,mode:item.mode==='url'?'url':'tour',tour:String(item.tour||(i===0?legacyTour:'')||''),url:String(item.url||'')}})}}
function v152SeasonTarget(item){if(item.mode==='url'){const safe=serviceURL(item.url);if(safe)return {href:safe,label:item.title,external:/^https?:/i.test(safe)}}const tour=item.tour&&C.tours.find(t=>t.id===item.tour&&tourPublic(t));return {href:tour?'#/excursions/'+encodeURIComponent(tour.id):'#/excursions',label:tour?`${item.title}: ${tour.title}`:item.title,external:false}}
function v152SeasonHTML(){const s=v152Season();if(!s.show)return '';const slides=s.items.map((item,i)=>{const target=v152SeasonTarget(item);return `<a class="v152-season-slide${i?'':' is-active'}" href="${esc(target.href)}" aria-label="${esc(target.label)}" data-season-slide="${i}" aria-hidden="${i?'true':'false'}"${target.external?' target="_blank" rel="noopener"':''}><video muted loop playsinline preload="none" poster="${esc(item.poster)}" data-webm="${esc(item.webm)}" data-mp4="${esc(item.mp4)}" aria-hidden="true"></video></a>`}).join('');return `<section class="v4-sec v152-season-sec"><div class="v152-season" aria-roledescription="карусель" aria-label="Сезонные предложения">${slides}<div class="v152-season-dots" aria-hidden="true">${s.items.map((_,i)=>`<i class="${i?'':'is-active'}"></i>`).join('')}</div></div></section>`}
let v152SeasonTimer=0,v152SeasonDeck=null,v152SeasonVisible=true,v152SeasonObserver=null;
function v152SeasonSource(video){if(video.dataset.loaded)return;let src=video.dataset.mp4||video.dataset.webm||'';try{if(video.canPlayType?.('video/webm'))src=video.dataset.webm||src}catch{}if(!src)return;video.src=src;video.dataset.loaded='1';video.load?.()}
function v152SeasonUnload(video){video.pause?.();video.removeAttribute('src');delete video.dataset.loaded;video.load?.()}
function v152SeasonActivate(deck,index){const slides=$$('[data-season-slide]',deck),dots=$$('.v152-season-dots i',deck);if(!slides.length)return;const active=((index%slides.length)+slides.length)%slides.length;slides.forEach((slide,i)=>{const on=i===active;slide.classList.toggle('is-active',on);slide.setAttribute('aria-hidden',String(!on));slide.tabIndex=on?0:-1;const video=$('video',slide);if(!video)return;if(on&&v152SeasonVisible&&!document.hidden){v152SeasonSource(video);try{video.currentTime=0}catch{}video.play?.().catch?.(()=>{})}else v152SeasonUnload(video)});dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===active));deck.dataset.seasonIndex=String(active)}
function v152SeasonTick(){const deck=v152SeasonDeck;if(!deck?.isConnected||!v152SeasonVisible||document.hidden)return;v152SeasonActivate(deck,Number(deck.dataset.seasonIndex||0)+1)}
function v152StartSeason(){const deck=$('.v152-season');if(!deck){if(v152SeasonTimer)clearInterval(v152SeasonTimer);v152SeasonTimer=0;v152SeasonObserver?.disconnect();v152SeasonObserver=null;if(v152SeasonDeck)$$('video',v152SeasonDeck).forEach(v152SeasonUnload);v152SeasonDeck=null;return}if(deck===v152SeasonDeck&&v152SeasonTimer)return;if(v152SeasonTimer)clearInterval(v152SeasonTimer);v152SeasonObserver?.disconnect();if(v152SeasonDeck&&v152SeasonDeck!==deck)$$('video',v152SeasonDeck).forEach(v152SeasonUnload);v152SeasonDeck=deck;v152SeasonVisible=true;
 if(typeof IntersectionObserver!=='undefined'){v152SeasonObserver=new IntersectionObserver(entries=>{const visible=!!entries[0]?.isIntersecting;if(visible===v152SeasonVisible)return;v152SeasonVisible=visible;v152SeasonActivate(deck,Number(deck.dataset.seasonIndex||0))},{rootMargin:'100px 0px'});v152SeasonObserver.observe(deck)}
 v152SeasonActivate(deck,Number(deck.dataset.seasonIndex||0));v152SeasonTimer=setInterval(v152SeasonTick,4000)}
if(typeof document==='object')document.addEventListener('visibilitychange',()=>{if(v152SeasonDeck?.isConnected)v152SeasonActivate(v152SeasonDeck,Number(v152SeasonDeck.dataset.seasonIndex||0))});
function v152PlaceSeason(){const wrap=$('.v4-home>.wrap');if(!wrap||typeof wrap.querySelector!=='function')return;wrap.querySelector('.v152-season-sec')?.remove();const html=v152SeasonHTML();if(!html)return;const pop=$('#v4Pop')?.closest('.v4-sec'),places=$('#v4Places')?.closest('.v4-sec');
 if(pop)pop.insertAdjacentHTML('afterend',html);else if(places)places.insertAdjacentHTML('beforebegin',html);else wrap.insertAdjacentHTML('afterbegin',html);v152StartSeason()}
if(typeof MutationObserver!=='undefined'&&typeof app!=='undefined'&&app)new MutationObserver(()=>{if($('.v152-season')!==v152SeasonDeck)v152StartSeason()}).observe(app,{childList:true,subtree:true});
const homeBeforeSeason=homeView;homeView=function(...a){const r=homeBeforeSeason.apply(this,a);v152PlaceSeason();v152UseLight(app);return r};


/* ==========================================================================
   Build 152 · back without reloading. List pages are kept when you leave them; going back
   shows the same page instantly, at the same place, with rails where they were. A page is
   rebuilt when the site data, the signed-in user or favourites changed, or after 10 minutes.
   ========================================================================== */
const V152_KEEP=/^#\/(?:|excursions(?:\?[^/]*)?|favorites|diary|reviews|useful|fleet)$/,V152_KEEP_MS=600000,v152Kept=new Map();
function v152PageSig(){let lists='';try{lists=['diary','reviews','bookings','transfers'].map(k=>Array.isArray(serverLists?.[k])?serverLists[k].length:0).join('.')}catch{}return [contentRevision,serverIdentity?.id||'',[...(favs||[])].sort().join(','),lists,typeof myOrdersCache==='object'&&myOrdersCache?myOrdersCache.length:''].join('|')}
let v152ShownHash=typeof location==='object'?routeHash()||'#/':'#/',v152ShownCurrent='',v152Traverse=false,v152KeepObserver=null;
// The router replaces the page; the removed page is kept as it was (with its listeners, scroll of rails and loaded photos).
if(typeof MutationObserver!=='undefined'&&typeof app!=='undefined'&&app){v152KeepObserver=new MutationObserver(records=>{const hash=routeHash()||'#/';if(hash===v152ShownHash)return;
 v152Traverse=typeof history==='object'&&!!history?.state?.apsuaIndex;const first=records.find(r=>r.removedNodes.length);const old=v152ShownHash;
 if(first&&V152_KEEP.test(old)&&!document.body.classList.contains('is-admin')&&!/^#\/admin/.test(old)){v152Kept.delete(old);v152Kept.set(old,{nodes:[...first.removedNodes],y:v152LeaveY,at:Date.now(),sig:v152PageSig(),current:v152ShownCurrent});while(v152Kept.size>6)v152Kept.delete(v152Kept.keys().next().value)}});v152KeepObserver.observe(app,{childList:true})}
let v152LeaveY=0;if(typeof window==='object')window.addEventListener('scroll',()=>{v152LeaveY=Math.round(window.scrollY||0)},{passive:true});
// Removing nodes from the page resets their horizontal scroll: remember rails' positions as they move.
const v152Scrolled=new Set();if(typeof document==='object'&&document.addEventListener)document.addEventListener('scroll',e=>{const n=e.target;if(n&&n.nodeType===1&&app?.contains(n)){n._v152x=n.scrollLeft;n._v152y=n.scrollTop;v152Scrolled.add(n)}},{capture:true,passive:true});
function v152RestoreInner(nodes){for(const n of [...v152Scrolled]){if(!n.isConnected){if(!nodes.some(root=>root.contains?.(n)))v152Scrolled.delete(n);continue}if(n._v152x)n.scrollLeft=n._v152x;if(n._v152y)n.scrollTop=n._v152y}}
// Filters change the address without a page change; the kept page must be filed under the current address.
if(typeof history==='object'&&history?.replaceState){const replaceBeforeV152=history.replaceState.bind(history);history.replaceState=function(...a){const before=routeHash(),index=history.state?.apsuaIndex;if(index&&(a[0]==null||typeof a[0]==='object'&&!Array.isArray(a[0])&&!a[0].apsuaIndex))a[0]={...(a[0]||{}),apsuaIndex:index};const r=replaceBeforeV152(...a);if(a.length>2&&a[2]!=null&&before===v152ShownHash&&routeHash()!==before)v152ShownHash=routeHash()||'#/';return r}}
// After the router and the scroll bookkeeping: on back/forward show the kept page before anything is painted.
let v152Restored=null;
window.addEventListener('hashchange',()=>{const hash=routeHash()||'#/',kept=v152Kept.get(hash);v152Restored=null;
 const done=()=>{v152ShownHash=hash;v152ShownCurrent=current;v152LeaveY=Math.round(window.scrollY||0)};
 if(!kept){done();return}v152Kept.delete(hash);
 if(!v152Traverse||Date.now()-kept.at>V152_KEEP_MS||kept.sig!==v152PageSig()||kept.current!==current){done();return}
 app.replaceChildren(...kept.nodes);v152KeepObserver?.takeRecords();v152RestoreInner(kept.nodes);v152Restored={hash,y:kept.y};done();v152LeaveY=kept.y;
 app.getAnimations?.().forEach(a=>{if(a.id==='v17-page')a.cancel()});window.scrollTo({top:kept.y,behavior:'instant'});
 requestAnimationFrame(()=>{if(v152Restored?.hash===hash)window.scrollTo({top:kept.y,behavior:'instant'})});
 setTimeout(()=>{if(v152Restored?.hash===hash&&Math.abs((window.scrollY||0)-kept.y)>2)window.scrollTo({top:kept.y,behavior:'instant'})},200)});
window.addEventListener('site-ready',()=>{v152ShownHash=routeHash()||'#/';v152ShownCurrent=current});
// A tab the phone unloaded in the background reopens at the same place.
(()=>{let nav='';try{nav=performance.getEntriesByType('navigation')[0]?.type||''}catch{}if(!(document.wasDiscarded||nav==='reload'||nav==='back_forward'))return;const y=v17Scroll.get(String(v17Index));if(!y)return;
 // Late redraws during start-up may jump to the top; hold the place until the visitor scrolls or 2 s pass.
 let until=0,touched=false;const stop=()=>{touched=true};for(const t of ['pointerdown','touchstart','wheel','keydown'])window.addEventListener(t,stop,{once:true,passive:true});
 const hold=()=>{if(touched||Date.now()>until){window.removeEventListener('scroll',guard);return}if(Math.abs((window.scrollY||0)-y)>2&&document.documentElement.scrollHeight>=y+innerHeight*.5)window.scrollTo({top:y,behavior:'instant'})};
 const guard=()=>requestAnimationFrame(hold);
 window.addEventListener('site-ready',()=>{until=Date.now()+2000;window.addEventListener('scroll',guard,{passive:true});requestAnimationFrame(hold);setTimeout(hold,300);setTimeout(hold,900)},{once:true})})();









document.addEventListener('input',e=>{if(!e.target.matches('[data-comparison-search]'))return;const picker=e.target.closest('.comparison-picker'),q=e.target.value.trim().toLocaleLowerCase('ru');let visible=0;$$('[data-comparison-title]',picker).forEach(row=>{row.hidden=!row.dataset.comparisonTitle.includes(q);if(!row.hidden)visible++});const empty=$('[data-comparison-empty]',picker);if(empty)empty.hidden=visible>0});

/* 21.8–22.3 — transfer, catalog, comparison and desktop account corrections. */
function syncTransferPassengerNames(){
 tr.passengerNames=Array.from({length:tr.pax},(_,i)=>String(tr.passengerNames?.[i]||''));
}
function captureTransferPassengerNames(){
 const fields=$$('[data-transfer-passenger-name]');
 if(fields.length)tr.passengerNames=fields.map(field=>field.value);
 syncTransferPassengerNames();
}
function enhanceTransferForm(){
 const form=$('#trForm');if(!form)return;
 if(tr.cls!=='group')tr.cls='individual';
 const direction=form.querySelector('.tr-direction');
 const classes=form.querySelector('.classes'),oldClasses=classes?.closest?.('.field')||classes?.parentElement;
 if(direction&&oldClasses){
  const groupAllowed=transferGroupAvailable(tr.date);
  oldClasses.className='field transfer-kind-field';
  oldClasses.innerHTML=`<span>Тип трансфера</span><div class="transfer-kind" role="radiogroup" aria-label="Тип трансфера"><label><input type="radio" name="cls" value="individual" ${tr.cls!=='group'?'checked':''}><span><b>Индивидуальный</b><small>Автомобиль только для вашей компании</small></span></label><label class="${groupAllowed?'':'is-disabled'}"><input type="radio" name="cls" value="group" ${tr.cls==='group'?'checked':''} ${groupAllowed?'':'disabled'}><span><b>Групповой</b><small>${groupAllowed?'Цена рассчитывается за пассажира':'Недоступен на выбранную дату'}</small></span></label></div>`;
  direction.insertAdjacentElement('afterend',oldClasses);
 }
 const flight=$('#tr-flight');if(flight){flight.required=true;flight.placeholder='SU 1120';flight.setAttribute('aria-describedby','te-flight');const label=flight.closest?.('.field')||flight.parentElement;label?.querySelector?.('span')?.replaceChildren?.('Номер рейса / поезда *');if(!$('#te-flight'))flight.insertAdjacentHTML?.('afterend','<small class="err" id="te-flight" aria-live="polite"></small>')}
 const routeGrid=form.querySelector('.grid2:not(.tr-passengers)'),flightField=flight?.closest?.('.field')||flight?.parentElement;
 if(routeGrid&&flightField)routeGrid.insertAdjacentElement?.('afterend',flightField);
 const addressBlock=form.querySelector('.tr-address-block'),passengerBlock=form.querySelector('.tr-passengers'),grids=[...form.querySelectorAll?.('.grid2')||[]],contactGrid=grids.find(grid=>grid!==routeGrid&&grid!==passengerBlock)||$('#tr-name')?.parentElement?.parentElement;
 routeGrid?.classList?.add('transfer-route-fields');addressBlock?.classList?.add('transfer-address-fields');contactGrid?.classList?.add('transfer-contact-fields');
 if(routeGrid&&!form.querySelector('.transfer-route-title'))routeGrid.insertAdjacentHTML?.('beforebegin','<h3 class="transfer-form-title transfer-route-title">Маршрут и рейс</h3>');
 if(addressBlock&&!form.querySelector('.transfer-address-title'))addressBlock.insertAdjacentHTML?.('beforebegin','<h3 class="transfer-form-title transfer-address-title">Место подачи</h3>');
 if(passengerBlock&&!form.querySelector('.transfer-passenger-title')){const max=trCls().max;passengerBlock.insertAdjacentHTML?.('beforebegin',`<div class="transfer-form-title transfer-passenger-title transfer-pax-caps"><h3>Пассажиры${tr.pax>=max?`<small>(до ${max})</small>`:''}</h3><span aria-hidden="true">Детское кресло</span></div>`)}
 const contactName=$('#tr-name');if(contactName)contactName.placeholder='Как к вам обращаться';
 if(contactGrid&&!form.querySelector('.transfer-contact-title'))contactGrid.insertAdjacentHTML?.('beforebegin','<h3 class="transfer-form-title transfer-contact-title">Контакт для связи</h3>');
 syncTransferPassengerNames();
 const passengers=form.querySelector('.tr-passengers');
 if(passengers&&!$('#transferPassengerNames'))passengers.insertAdjacentHTML('afterend',`<fieldset class="transfer-passenger-names" id="transferPassengerNames"><legend>Пассажиры</legend><p>Укажите имя и фамилию каждого пассажира</p><div>${tr.passengerNames.map((name,i)=>`<label class="field"><span>${i+1}. Имя и фамилия</span><input class="input" data-transfer-passenger-name="${i}" value="${esc(name)}" autocomplete="off" required minlength="3" placeholder="Имя и фамилия"><small class="err" id="te-passenger-${i}" aria-live="polite"></small></label>`).join('')}</div></fieldset>`);
 const review=$('#transferReview');if(review)review.classList.add('transfer-ticket-preview');
}
const renderTransferFinal=renderTransfer;
renderTransfer=function(){captureTransferPassengerNames();if(tr.cls!=='group')tr.cls='individual';renderTransferFinal();enhanceTransferForm()};
const captureTransferFieldsFinal=captureTransferFields;
captureTransferFields=function(){captureTransferFieldsFinal();captureTransferPassengerNames()};
const validateRequestFieldsFinal=validateRequestFields;
validateRequestFields=function(kind){let good=validateRequestFieldsFinal(kind);if(kind!=='transfers')return good;captureTransferPassengerNames();const flight=tr.flight.trim();if(!setRequestFieldError('tr-flight','te-flight',flight?'':'Укажите номер рейса или поезда.')&&good){$('#tr-flight')?.focus();good=false}tr.passengerNames.forEach((name,i)=>{const field=$(`[data-transfer-passenger-name="${i}"]`);if(!field)return;const message=name.trim().length>=3?'':'Укажите имя и фамилию пассажира.';field.classList.toggle('invalid',!!message);field.setAttribute('aria-invalid',message?'true':'false');const error=$('#te-passenger-'+i);if(error)error.textContent=message;if(message&&good){field.focus();good=false}});return good};
document.addEventListener('input',e=>{if(!e.target.closest?.('#trForm'))return;captureTransferFields();if(e.target.matches('[data-transfer-passenger-name]'))tr.passengerNames[Number(e.target.dataset.transferPassengerName)]=e.target.value;updateTransferReview()},true);

document.addEventListener('click',e=>{const clear=e.target.closest('#comparisonTray [data-clear-compare]');if(!clear)return;e.preventDefault();e.stopImmediatePropagation();comparedTours=[];updateComparison()},true);



/* Account dashboard: reuse the existing forms, orders and push subscription. */
function accountPreferenceKey(){return 'apsua-account-contact:'+(serverIdentity?.id||'')}
function accountContactPreferences(){try{return JSON.parse(localStorage.getItem(accountPreferenceKey())||'{}')}catch{return {}}}
const ACCOUNT_GEAR='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/><path d="M10 3.5h4l.5 2.2 2 .9 1.9-1.1 2.8 2.8-1.1 1.9.9 2 .1 2-2.2.5-.9 2 1.1 1.9-2.8 2.8-1.9-1.1-2 .9L14 20.5h-4l-.5-2.2-2-.9-1.9 1.1-2.8-2.8 1.1-1.9-.9-2L3 10l2.2-.5.9-2L5 5.6l2.8-2.8 1.9 1.1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const ACCOUNT_EXIT='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 4H5v16h5M13 8l4 4-4 4M8 12h9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function accountDashboard(){
 const grid=document.querySelector('#app .acc-grid'),head=document.querySelector('#app .acc-head'),group=grid?.querySelector('.v152-account-list');
 if(!serverIdentity||!grid||!head||!group||typeof document.createElement!=='function')return;
 const sections=[...group.querySelectorAll(':scope > details.account-section')],booking=sections.find(x=>x.id==='myTripOrders'),reviews=sections.find(x=>x!==booking&&x.querySelector('#revForm')),stories=sections.find(x=>x!==booking&&x.querySelector('#diaForm'));
 if(!booking||!reviews||!stories)return;
 const wrap=grid.parentElement,oldPush=document.querySelector('#app .push-device'),name=meaningfulName(serverIdentity.name||'');
 const shell=document.createElement('div');shell.className='account-dashboard';shell.innerHTML=`<aside class="account-dashboard-sidebar"><div class="account-dashboard-profile"></div><nav aria-label="Разделы кабинета" class="account-dashboard-nav"><button type="button" data-account-go="bookings" class="is-active">${V17_ICON.ticket}<span>Мои бронирования</span></button><button type="button" data-account-go="reviews">${V17_ICON.star}<span>Мои отзывы</span></button><button type="button" data-account-go="stories">${ICON.img}<span>Мои истории</span></button><button type="button" data-account-go="notifications">${V17_ICON.bell}<span>Уведомления</span></button><button type="button" data-edit-profile>${V17_ICON.person}<span>Личные данные</span></button><a href="#/favorites">${V17_ICON.heart}<span>Избранное</span></a><button type="button" data-account-go="settings">${ACCOUNT_GEAR}<span>Настройки</span></button><button type="button" data-logout>${ACCOUNT_EXIT}<span>Выйти</span></button></nav></aside><div class="account-dashboard-main"><div class="account-dashboard-hero"><small>ЛИЧНЫЙ КАБИНЕТ</small><h2>${name?'Добро пожаловать, '+esc(name)+'!':'Добро пожаловать!'}</h2><p>Управляйте бронированиями, оставляйте отзывы и делитесь историями путешествий.</p></div><nav class="account-dashboard-mobile" aria-label="Разделы кабинета"><button type="button" data-account-go="bookings" class="is-active">${V17_ICON.ticket}<span>Бронирования</span></button><button type="button" data-account-go="reviews">${V17_ICON.star}<span>Отзывы</span></button><button type="button" data-account-go="stories">${ICON.img}<span>Истории</span></button><button type="button" data-account-go="settings">${ACCOUNT_GEAR}<span>Настройки</span></button></nav><div class="account-dashboard-sections"></div><section class="panel account-dashboard-settings" hidden><h2>Настройки</h2><div class="account-settings-push"></div><div class="account-settings-block"><h3>Способ связи</h3><p>Сохраните данные на этом устройстве, чтобы подставлять их в новые заявки. В каждой заявке их можно изменить.</p><form id="accountContactSettings"><label class="field"><span>Телефон</span><input class="input" name="phone" type="tel" autocomplete="tel" maxlength="40" value="${esc(accountContactPreferences().phone||'')}"></label><label class="field"><span>Мессенджер</span><select class="input" name="via"><option value="">Выберите способ связи</option>${['WhatsApp','Telegram','MAX'].map(v=>`<option value="${v}" ${accountContactPreferences().via===v?'selected':''}>${v}</option>`).join('')}</select></label><button class="btn btn-sea small" type="submit">Сохранить</button><span class="sub" role="status" id="accountSettingsStatus"></span></form></div><div class="account-settings-block"><h3>Данные на устройстве</h3><p>Удалить список недавно просмотренных экскурсий с этого устройства.</p><button class="btn btn-ghost small" type="button" data-account-clear-recent>Очистить список</button></div><div class="account-settings-block"><h3>Аккаунт</h3><p>Управление личными данными и выход из аккаунта.</p><div class="account-settings-actions"><button class="btn btn-ghost small" type="button" data-edit-profile>Личные данные</button><button class="btn btn-ghost small" type="button" data-logout>Выйти</button></div></div></section></div><aside class="account-dashboard-right"><div class="account-dashboard-push"></div><section class="panel account-useful"><h2>Полезные ссылки</h2><a href="#/excursions">Все экскурсии <span>›</span></a><a href="#/transfer">Трансфер <span>›</span></a><a href="#/map">Интерактивная карта <span>›</span></a><a href="#/reviews">Отзывы путешественников <span>›</span></a><a href="#/diary">Дневник <span>›</span></a><a href="#/useful">Полезное <span>›</span></a></section></aside>`;
 grid.before(shell);shell.querySelector('.account-dashboard-profile').append(head);const dest=shell.querySelector('.account-dashboard-sections');dest.append(booking,reviews,stories);grid.remove();if(oldPush)shell.querySelector('.account-dashboard-push').append(oldPush);wrap.classList.add('account-dashboard-wrap');
}
const accountBeforeDashboard=accountView;accountView=function(...args){const result=accountBeforeDashboard.apply(this,args);accountDashboard();return result};
document.addEventListener('click',e=>{const button=e.target.closest?.('[data-account-go]');if(button){const shell=button.closest('.account-dashboard');if(!shell)return;const kind=button.dataset.accountGo,settings=shell.querySelector('.account-dashboard-settings'),sections=shell.querySelector('.account-dashboard-sections'),push=shell.querySelector('.push-device');settings.hidden=kind!=='settings';sections.hidden=kind==='settings';if(push){const place=kind==='settings'?shell.querySelector('.account-settings-push'):shell.querySelector('.account-dashboard-push');place.append(push)}shell.querySelectorAll('[data-account-go]').forEach(x=>x.classList.toggle('is-active',x.dataset.accountGo===kind));let target=kind==='settings'?settings:kind==='notifications'?push:kind==='bookings'?sections.children[0]:kind==='reviews'?sections.children[1]:sections.children[2];if(target?.tagName==='DETAILS')target.open=true;target?.scrollIntoView({block:'start',behavior:'smooth'});return}if(e.target.closest?.('[data-account-clear-recent]')){recentTours=[];comfortWrite('recent-tours',[]);toast('Список недавно просмотренных очищен')}});
document.addEventListener('submit',e=>{if(e.target.id!=='accountContactSettings')return;e.preventDefault();const form=e.target,data=new FormData(form),phone=String(data.get('phone')||'').trim(),via=String(data.get('via')||'');try{localStorage.setItem(accountPreferenceKey(),JSON.stringify({phone,via}));$('#accountSettingsStatus').textContent='Сохранено на этом устройстве.'}catch{$('#accountSettingsStatus').textContent='Не удалось сохранить настройки.'}});
const bookingBeforeAccountPreferences=renderBooking;renderBooking=function(...args){const result=bookingBeforeAccountPreferences.apply(this,args);if(serverIdentity&&bk?.step==='form'&&!bk.contact?.phone){const prefs=accountContactPreferences(),phone=$('#bk-phone');if(phone&&!phone.value&&prefs.phone)phone.value=prefs.phone;if(prefs.via&&!bk.contact?.via)$$('#bkForm input[name="via"]').forEach(el=>el.checked=el.value===prefs.via)}return result};
const transferBeforeAccountPreferences=renderTransfer;renderTransfer=function(...args){if(serverIdentity&&tr.step!=='done'&&!$('#trForm')){const prefs=accountContactPreferences();if(!tr.phone&&prefs.phone)tr.phone=prefs.phone;if(!tr.via&&prefs.via)tr.via=prefs.via}return transferBeforeAccountPreferences.apply(this,args)};

document.addEventListener('click',event=>{const button=event.target.closest?.('[data-yandex-login]');if(!button)return;event.preventDefault();rememberTelegramPage();const back=safeTelegramReturn(routeHash()||'#/');location.href='/api/yandex-auth/start?return_to='+encodeURIComponent(back)},true);

hostedBoot();
})();
