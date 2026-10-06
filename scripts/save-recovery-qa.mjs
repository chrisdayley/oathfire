import {createRequire} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'/Users/christopherdayley/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.GAME_URL||'http://127.0.0.1:4180',out=process.env.QA_OUT||'work/qa-save';fs.mkdirSync(out,{recursive:true});
const legacy=JSON.parse(fs.readFileSync('tests/fixtures/saves/v215-interrupted-battle.json')),victory=JSON.parse(fs.readFileSync('tests/fixtures/saves/v215-victory.json'));
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']}),context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),page=await context.newPage(),report={url:base,checks:[],errors:[]};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS',name);};page.on('pageerror',e=>report.errors.push(e.message));
const ready=()=>page.waitForFunction(()=>window.__oathfire?.ready,{},{timeout:90000});
const seed=async(local={},database={})=>{
 await page.evaluate(async({local,database})=>{const g=window.__oathfire;g.mode='title';g.ui.results.hide();g.ui.unlocks.hide();g.battle=null;g.store.data=null;localStorage.clear();for(const [suffix,v]of Object.entries(local))localStorage.setItem('oathfire.campaign.v1'+suffix,typeof v==='string'?v:JSON.stringify(v));const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('oathfire',1);q.onupgradeneeded=()=>q.result.createObjectStore('campaign');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});await new Promise((resolve,reject)=>{const tx=db.transaction('campaign','readwrite'),store=tx.objectStore('campaign');store.clear();for(const [k,v]of Object.entries(database))store.put(v,k);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();},{local,database});await page.reload();await ready();
};
try{
 await page.goto(base);await ready();
 check('Title reports actual release 2.21.1',await page.locator('#title-screen .version').innerText().then(t=>t.includes('2.21.1')));
 await seed({'':'broken JSON'}, {current:legacy});
 check('Corrupt browser save recovers real IndexedDB campaign',await page.evaluate(()=>window.__oathfire.store.data?.battle?.wave===2));
 await page.locator('#continue-game').click();await page.waitForFunction(()=>window.__oathfire.battle?.id===1);
 check('Recovered legacy river battle actually starts with retained hero, enemies and inventory',await page.evaluate(()=>{const g=window.__oathfire;return g.hero.hp>0&&g.enemies.some(e=>e.id==='legacy-archer')&&g.store.data.inventory.length===9&&g.store.data.hero==='ashwright';}));
 await page.reload();await ready();check('Resumed battle reloads without another save error',await page.evaluate(()=>window.__oathfire.store.data?.battle?.id===1&&!window.__oathfire.store.recovery));
 const old={...legacy,updated:10},recent={...legacy,updated:20,supplies:1234};await seed({'':old},{current:recent});
 check('Newer database checkpoint wins over older readable local save',await page.evaluate(()=>window.__oathfire.store.data.supplies===1234));
 await seed({'':'truncated', '.backup':legacy});check('Malformed primary still reads browser backup',await page.evaluate(()=>window.__oathfire.store.data.hero==='ashwright'));
 const broken=structuredClone(legacy);broken.battle.hero.hp=-3;
 await seed({'':broken,'.backup':broken},{current:broken});
 check('Interrupted battle offers recovery instead of only starting over',await page.locator('#title-recovery').innerText().then(t=>t==='Recover latest campaign'));
 await page.locator('#title-recovery').click();await page.screenshot({path:out+'/recovery-phone.png'});
 check('Recovery actions fit the landscape phone screen',await page.locator('#recover-campaign').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));
 await page.locator('#recover-campaign').click();await page.waitForFunction(()=>window.__oathfire.mode==='play');
 check('Recovery returns to a playable town with all earned progress',await page.evaluate(expected=>{const g=window.__oathfire,s=g.store.data;return !g.battle&&g.hero.hp>0&&['inventory','heroes','supplies','salvage','completed','units','defenses'].every(k=>JSON.stringify(s[k])===JSON.stringify(expected[k]))&&JSON.parse(localStorage.getItem('oathfire.campaign.v1.recovery')).copies.some(c=>JSON.parse(c.raw).battle.hero.hp===-3);},legacy));
 await page.reload();await ready();await page.locator('#continue-game').click();await page.waitForFunction(()=>window.__oathfire.mode==='play');check('Recovered campaign remains playable after a full reload',await page.evaluate(()=>window.__oathfire.hero.hp>0&&!window.__oathfire.battle));
 await seed({'':victory});await page.locator('#continue-game').click();await page.waitForFunction(()=>window.__oathfire.mode==='result');
 check('Old completed battle opens rewards without paying them again',await page.evaluate(s=>{const g=window.__oathfire;return g.store.data.supplies===s.supplies&&g.store.data.inventory.length===s.inventory.length&&g.store.data.lastBattle.id===s.lastBattle.id;},victory));
 await seed({'':'unreadable original bytes'});await page.locator('#title-recovery').click();const download=page.waitForEvent('download');await page.locator('#export-recovery').click();const file=await download;await file.saveAs(out+'/recovery-export.json');check('Unreadable original save can be exported from the title screen',JSON.parse(fs.readFileSync(out+'/recovery-export.json')).copies[0].raw==='unreadable original bytes');
 await page.locator('#close-recovery').click();await page.locator('#new-game').click();await page.locator('#begin-oath').click();check('New game cannot silently overwrite a rejected save',await page.locator('#dialog').innerText().then(t=>t.includes('Begin a new campaign?')));
 await seed({'':legacy});await page.evaluate(()=>navigator.serviceWorker.ready);await context.setOffline(true);await page.reload();await ready();
 check('Existing progress loads offline with no data reset',await page.evaluate(()=>window.__oathfire.store.data.hero==='ashwright'&&window.__oathfire.store.data.battle.wave===2));
 check('No runtime errors during recovery, resume, rewards and reload',report.errors.length===0);
}finally{fs.writeFileSync(out+'/browser-report.json',JSON.stringify(report,null,2));await browser.close();}
