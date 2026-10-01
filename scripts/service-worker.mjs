import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(d,f.name)):[path.join(d,f.name)]);
const files=walk('dist').filter(f=>!f.includes('/art/')&&(!f.includes('/models/')||f.endsWith('/Knight.glb'))&&!f.includes('/licenses/')&&!f.endsWith('sw.js')&&!f.endsWith('.map'));
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
  e.respondWith(cached(e.request).then(r=>r||fetch(e.request)));
});
`);
console.log('Offline cache:',version,urls.length,'files');
