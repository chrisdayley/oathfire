import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_URL||'http://127.0.0.1:4179',out=process.env.QA_OUT||'output/hero-271';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--autoplay-policy=document-user-activation-required']}),page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),report={checks:[],errors:[]};
page.on('pageerror',e=>report.errors.push(e.message));const check=(name,pass)=>{assert.ok(pass,name);report.checks.push(name);console.log('PASS',name);};
try{
 await page.goto(base);await page.waitForFunction(()=>window.__oathfire?.ready);await page.locator('#new-game').tap();
 for(const [width,height] of [[844,390],[667,375],[390,844]]){
  await page.setViewportSize({width,height});if(width<height&&await page.locator('#portrait-continue').isVisible())await page.locator('#portrait-continue').tap();
  for(const id of ['warden','ashwright','ranger']){
   await page.locator('[data-hero="'+id+'"]').tap();await page.waitForTimeout(200);
   const state=await page.evaluate(()=>{const g=window.__oathfire,el=document.querySelector('.hero-selection-details'),m=g.ui.heroSelection.model;return {heading:document.querySelector('.hero-selection-heading').innerText,overflow:el.scrollHeight-el.clientHeight,weapon:m.weaponType,preview:g.ui.preview===m,save:g.store.data,stage:document.querySelector('#hero-selection-stage').getBoundingClientRect().toJSON(),text:document.querySelector('#hero-selection').innerText};});
   check(id+' '+width+'×'+height+' shows a live starter model',state.preview&&state.stage.width>150&&state.stage.height>150);
   await page.screenshot({path:out+'/'+id+'-'+width+'.png'});check(id+' '+width+'×'+height+' fits without scrolling',state.overflow<=2);
   check(id+' preview uses the correct starting weapon',state.weapon===({warden:'sword',ashwright:'hammer',ranger:'bow'}[id]));
   check('Browsing '+id+' does not create or overwrite a campaign',state.save===null);
   await page.locator('#hero-attack').tap();await page.waitForTimeout(500);await page.locator('#hero-cast').tap();
   await page.screenshot({path:out+'/'+id+'-'+width+'.png'});
  }
 }
 await page.locator('#cancel-choice').tap();check('Back returns to the title and releases the preview',await page.evaluate(()=>!document.querySelector('#title-screen').hidden&&!window.__oathfire.ui.preview));
 await page.locator('#new-game').tap();await page.locator('[data-hero="ashwright"]').tap();await page.locator('#begin-oath').tap();await page.locator('#story-skip').tap();
 check('Begin creates the selected hero with its real loadout',await page.evaluate(()=>window.__oathfire.store.data.hero==='ashwright'&&window.__oathfire.heroStats().weapon==='hammer'));
 const saved=await page.evaluate(()=>{window.__oathfire.ui.title();return JSON.stringify(window.__oathfire.store.data);});
 await page.locator('#new-game').tap();await page.locator('[data-hero="ranger"]').tap();await page.locator('#begin-oath').tap();await page.locator('#cancel-dialog').tap();
 check('Cancel replacing a campaign returns to the selected preview',await page.evaluate(()=>!document.querySelector('#hero-selection').hidden&&document.querySelector('[data-hero="ranger"]').getAttribute('aria-pressed')==='true'));
 check('Cancel leaves the existing campaign untouched',await page.evaluate(saved=>JSON.stringify(window.__oathfire.store.data)===saved,saved));
 check('No character-selection runtime errors',report.errors.length===0);
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e.stack);}finally{fs.writeFileSync(out+'/selection-report.json',JSON.stringify(report,null,2));await browser.close();}
