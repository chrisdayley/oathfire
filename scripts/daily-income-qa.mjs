import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {newSave} from '../src/state.js';
import {TOWN_IDS} from '../src/war-campaign.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.QA_OUT||'work/qa-daily-income',base=process.env.GAME_URL||'http://127.0.0.1:4180';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']}),report={url:base,checks:[],errors:[],screens:[]};
const check=(label,value)=>{assert.ok(value,label);report.checks.push(label);console.log('PASS',label);};
try{
 const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base);await page.waitForFunction(()=>window.__oathfire?.ready);
 const campaign=()=>{const s=newSave();s.completed=[0,1,2];s.settlements=[24,25];s.war.captured=[24,25];s.war.nextAttackDay=99;s.war.nextRaidDay=99;s.guide.active=false;s.guide.seen=['prologue'];return s;};
 const load=s=>page.evaluate(async s=>{const g=window.__oathfire;g.store.import(JSON.stringify(s));await g.start(null,true);g.ui.close();g.tick=()=>{};},s);
 const snapshot=()=>page.evaluate(()=>{const s=window.__oathfire.store.data;return {supplies:s.supplies,day:s.war.day,income:s.lastBattle?.income,sources:s.lastBattle?.incomeSources,held:s.settlements};});
 const shot=async name=>{await page.screenshot({path:out+'/'+name+'.png'});report.screens.push(name);};
 const map=async()=>{await page.locator('[data-result=home]').click();if(await page.locator('[data-unlock=choices]').isVisible())await page.locator('[data-unlock=choices]').click();await page.locator('[data-unlock=skip-map]').click();};
 await load(campaign());const before=await snapshot();
 await page.evaluate(()=>{const g=window.__oathfire;g.beginMission(3);g.battle.time=80;g.defeat('Your army withdrew to Hearthwatch.');});
 const paid=await snapshot();check('Withdrawal advances one day and pays all held towns',paid.day===2&&paid.supplies-before.supplies===70&&paid.income===70&&paid.sources.length===2);
 await page.locator('.daily-income summary').click();check('Report itemizes Willowmill and Reedhaven with their separate rewards',await page.locator('.income-towns').innerText().then(t=>t.includes('Willowmill')&&t.includes('+28')&&t.includes('Reedhaven')&&t.includes('+42')));await shot('01-daily-income-landscape');
 await page.reload();await page.waitForFunction(()=>window.__oathfire?.ready);await page.evaluate(async()=>{const g=window.__oathfire;await g.start(null,true);g.tick=()=>{};});check('Reload preserves the payment without collecting again',JSON.stringify(await snapshot())===JSON.stringify(paid));
 await map();check('Final map reports the paid daily income',await page.locator('.war-changes').innerText().then(t=>t.includes('Town income: +70 Supplies')));await page.locator('[data-war-select="24"]').click();check('Town map detail labels Supplies per day',await page.locator('#unlock-sequence .war-detail').innerText().then(t=>t.includes('+28 Supplies / day')));await shot('02-daily-income-map');
 await page.locator('[data-unlock=go]').click();check('Returning home does not advance time or pay again',JSON.stringify(await snapshot())===JSON.stringify(paid));
 const expired=campaign();expired.war.day=3;expired.war.raids=[{town:24,started:1,deadline:4}];await load(expired);await page.evaluate(()=>{const g=window.__oathfire;g.beginMission(3);g.defeat('The beacon fell.');});
 const lost=await snapshot();check('A town lost to an invasion stops paying on that same day',lost.income===42&&lost.held.length===1&&lost.sources[0].town===25);await map();check('Map shows the lost town and the remaining income together',await page.locator('.war-changes').innerText().then(t=>t.includes('Willowmill lost')&&t.includes('+42 Supplies')));await shot('03-lost-town-income');
 const full=campaign();full.completed=Array.from({length:24},(_,i)=>i);full.settlements=[...TOWN_IDS];full.war.captured=[...TOWN_IDS];await load(full);await page.evaluate(()=>{const g=window.__oathfire;g.beginMission(0);g.defeat('Daily income QA fixture.');});
 check('All eight towns pay 772 Supplies on one day',await snapshot().then(s=>s.income===772&&s.sources.length===8));
 for(const [width,height] of [[844,390],[667,375],[390,844],[320,568]]){
  await page.setViewportSize({width,height});await page.locator('[data-result=tab][data-id=loot]').click();await page.locator('.daily-income summary').click();
  const content=await page.locator('.daily-income').evaluate(el=>{const r=el.getBoundingClientRect(),safe=document.getElementById('ui-safe-area').getBoundingClientRect();return {horizontal:r.left>=safe.left-1&&r.right<=safe.right+1,rows:[...el.querySelectorAll('.income-towns>div')].map(row=>row.scrollWidth<=row.clientWidth+1),text:el.innerText};});
  check(width+'×'+height+' town list fits horizontally and names remain visible',content.horizontal&&content.rows.every(Boolean)&&content.text.includes('Dawnmere')&&content.text.includes('+180'));
  await page.locator('.income-towns>div').last().scrollIntoViewIfNeeded();check(width+'×'+height+' final town can be reached inside the report',await page.locator('.income-towns>div').last().evaluate(el=>{const r=el.getBoundingClientRect(),m=document.querySelector('#battle-result main').getBoundingClientRect();return r.top>=m.top-1&&r.bottom<=m.bottom+1;}));await shot('04-eight-towns-'+width);
 }
 check('No browser runtime errors',report.errors.length===0);
}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser.close();}
