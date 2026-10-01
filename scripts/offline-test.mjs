import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.argv[2]||'playwright');
const browser=await chromium.launch({headless:true,args:process.platform==='darwin'?['--use-angle=metal']:[]});
const page=await browser.newPage();
page.on('requestfailed',r=>console.log('FAILED',r.url(),r.failure()));
page.on('pageerror',e=>console.log('ERROR',e.message));
page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});
try {
 await page.goto(process.argv[3]||'http://127.0.0.1:4180/');
 await page.waitForFunction(()=>window.__oathfire?.ready,{timeout:45000});
 await page.evaluate(()=>navigator.serviceWorker.ready);
 console.log('CACHE',JSON.stringify(await page.evaluate(async()=>({url:location.href,controller:navigator.serviceWorker.controller?.scriptURL,keys:await caches.keys(),entries:await Promise.all((await caches.keys()).map(async k=>[k,(await(await caches.open(k)).keys()).map(r=>r.url)])),assets:[...document.querySelectorAll('script[src],link[rel="stylesheet"]')].map(e=>e.src||e.href)}))));
 await page.context().setOffline(true);
 await page.reload();
 await page.waitForFunction(()=>window.__oathfire?.ready,{timeout:45000});
 console.log('PASS Offline game loaded');
}finally {await browser.close();}
