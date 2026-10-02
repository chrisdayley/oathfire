import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(d,f.name)):[path.join(d,f.name)]);
const files=walk('dist').filter(f=>!f.includes('/art/')&&(!f.includes('/models/')||f.endsWith('/Knight.glb')||f.includes('/models/atelier/')||f.includes('/models/courtyard/'))&&!f.includes('/licenses/')&&!f.endsWith('sw.js')&&!f.endsWith('.map')&&!f.includes('/music/chamber/')&&!f.includes('/music/orchestra/'));
const hash=crypto.createHash('sha256');
for(const f of files)hash.update(fs.readFileSync(f));
hash.update(fs.readFileSync('scripts/service-worker.mjs'));
const version=hash.digest('hex').slice(0,12),urls=files.map(f=>'./'+f.slice(5));
fs.writeFileSync('dist/sw.js',`const CACHE='oathfire-${version}';
const FILES=${JSON.stringify(urls)};
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('oathfire-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// These are public static assets. Ignore server Vary: Origin differences between
// precache requests and the browser's anonymous module/stylesheet requests.
const cached=async request=>(await caches.open(CACHE)).match(request,{ignoreVary:true});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).catch(async()=>await cached(e.request)||await cached('./index.html')));
    return;
  }
  e.respondWith(cached(e.request).then(async r=>{
    if(!r)return fetch(e.request);
    const range=e.request.headers.get('range');
    if(!range)return r;
    // Safari media seeking and resume require a byte-range response offline too.
    const match=/^bytes=(\\d*)-(\\d*)$/.exec(range);if(!match)return fetch(e.request);
    const data=await r.arrayBuffer(),length=data.byteLength;
    const start=match[1]?Number(match[1]):Math.max(0,length-Number(match[2]));
    const end=match[1]&&match[2]?Math.min(Number(match[2]),length-1):length-1;
    if(start> end||start>=length)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+length}});
    const headers=new Headers(r.headers);headers.delete('content-encoding');headers.set('Accept-Ranges','bytes');headers.set('Content-Range','bytes '+start+'-'+end+'/'+length);headers.set('Content-Length',String(end-start+1));
    return new Response(data.slice(start,end+1),{status:206,statusText:'Partial Content',headers});
  }));
});
`);
console.log('Offline cache:',version,urls.length,'files');
