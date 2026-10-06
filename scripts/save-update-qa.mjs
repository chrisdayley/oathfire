import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'/Users/christopherdayley/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
let updated=false;const sw=fs.readFileSync('dist/sw.js','utf8'),checks=[];
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.m4a':'audio/mp4','.mp3':'audio/mpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name==='/sw.js'){res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});return res.end(updated?sw:sw.replace("const CACHE='oathfire-","const CACHE='oathfire-previous-"));}const file=path.resolve('dist','.'+(name==='/'?'/index.html':name));if(!file.startsWith(path.resolve('dist')+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']}),context=await browser.newContext(),page=await context.newPage();
try{
 await page.goto(url);await page.waitForFunction(()=>window.__oathfire?.ready,{},{timeout:90000});await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>window.__oathfire?.ready);
 await page.evaluate(async()=>{const g=window.__oathfire;await g.start('ashwright');document.getElementById('story-skip')?.click();g.store.commit(s=>s.supplies=777);g.checkpoint();});
 updated=true;await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.waiting,{},{timeout:90000});
 await page.waitForFunction(()=>!!document.getElementById('game-update'));
 assert.ok(await page.locator('#game-update').isHidden());checks.push('Waiting update does not cover active play or reload mid-game');
 await page.evaluate(()=>window.__oathfire.ui.open('pause'));await page.waitForFunction(()=>!document.getElementById('game-update').hidden);await page.locator('#game-update').click();await page.waitForEvent('load');await page.waitForFunction(()=>window.__oathfire?.ready,{},{timeout:90000});
 assert.equal(await page.evaluate(()=>window.__oathfire.store.data.supplies),777);checks.push('Save & reload activates the waiting worker and preserves campaign resources');
 assert.ok(await page.evaluate(async()=>!(await caches.keys()).some(k=>k.startsWith('oathfire-previous-'))));checks.push('Only superseded asset cache is removed; both save stores remain intact');
 await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.__oathfire?.ready,{},{timeout:90000});assert.equal(await page.evaluate(()=>window.__oathfire.store.data.hero),'ashwright');checks.push('Updated installed game reloads offline with existing hero');
 console.log(checks.join('\n'));
}finally{fs.writeFileSync('work/qa-save/update-report.json',JSON.stringify({checks},null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
