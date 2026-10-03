import {createRequire} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';import {newSave} from '../src/state.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.GAME_URL||'http://127.0.0.1:4179',out=process.env.QA_OUT||'work/qa-assault-balance';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=metal']}),report={errors:[],scenarios:[]};
try{for(const strategy of ['idle','active']){
 const page=await browser.newPage({viewport:{width:844,height:390}});page.on('pageerror',e=>report.errors.push(e.message));await page.addInitScript(()=>{let n=701;Math.random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};});await page.goto(base);await page.waitForFunction(()=>window.__oathfire?.ready);
 const s=newSave('warden');s.guide.active=false;s.guide.seen.push('prologue');await page.evaluate(async s=>{const g=window.__oathfire;g.store.import(JSON.stringify(s));await g.start(null,true);g.ui.close();g.beginMission(0);g.testTick=g.tick.bind(g);g.tick=()=>{};g.audio.music?.setPaused(true);g.audio.play=()=>{};g.audio.impact=()=>{};},s);
 let result;for(let batch=0;batch<85;batch++){
  result=await page.evaluate(strategy=>{const g=window.__oathfire;for(let i=0;i<600&&g.battle&&g.mode==='play';i++){
   const h=g.hero;g.input.keys.clear();
   if(strategy==='active'){
    const target=g.enemies.filter(e=>!e.dead).sort((a,b)=>a.pos.distanceTo(h.pos)-b.pos.distanceTo(h.pos))[0];
    if(target){const d=target.pos.clone().sub(h.pos).setY(0);if(d.length()>2.1){const path=g.findPath(h.pos,target.pos),p=path.find(p=>Math.hypot(h.pos.x-p.x,h.pos.z-p.z)>1)||target.pos;g.view.yaw=Math.atan2(h.pos.x-p.x,h.pos.z-p.z);g.input.keys.add('KeyW');}else{g.view.yaw=Math.atan2(-d.x,-d.z);if(h.cooldown<=0)g.combat.attack(h,h.stamina>40&&h.combo%3===0);}if(d.length()<8&&!(h.cooldowns.rally>0))g.combat.cast('rally');}
    if(h.hp<h.stats.hp*.45&&g.store.data.potions>0)g.potion();
    const allies=g.allies.filter(e=>!e.dead),type=allies.filter(a=>a.unit==='bow').length<5?'bow':'shield',cost=type==='bow'?28:22;if(g.battle.command>=cost&&allies.length<12)g.recruit(type);
   }
   g.testTick(1/60);
  }
  g.input.clear();return{mode:g.mode,time:g.battle?.time||g.store.data.lastBattle?.time,hp:g.hero.hp,gate:g.battle?.gate,core:g.battle?.core,wave:g.battle?.wave,alive:g.enemies.filter(e=>!e.dead).length,army:g.allies.filter(e=>!e.dead).length,report:g.store.data.lastBattle};},strategy);
  if(batch%6===0||result.mode==='result')console.log(strategy,batch,JSON.stringify({mode:result.mode,time:result.time,hp:result.hp,gate:result.gate,wave:result.wave,alive:result.alive,army:result.army,win:result.report?.win}));
  if(result.mode==='result')break;
 }
 report.scenarios.push({strategy,...result});await page.screenshot({path:out+'/'+strategy+'.jpg',quality:86});await page.close();
 }
 const active=report.scenarios.find(r=>r.strategy==='active'),idle=report.scenarios.find(r=>r.strategy==='idle');assert.equal(active.report?.win,true,'A novice Warden with starter equipment and active combat can win');assert.notEqual(idle.report?.win,true,'The unattended castle does not win automatically');assert.equal(report.errors.length,0);console.log('PASS active first defense wins; idle castle does not.');
}catch(e){report.failure=e.stack;console.error(e.stack);process.exitCode=1;}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser.close();}
