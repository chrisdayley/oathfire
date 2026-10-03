import {createRequire} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';
import {newSave} from '../src/state.js';import {riverCenter,RIVER_LEVEL} from '../src/river-profile.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_URL||'http://127.0.0.1:4180',out=process.env.QA_OUT||'work/qa-river-release';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']}),report={checks:[],errors:[],scenarios:[]};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS',name);};
try{
 const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGL|GL_INVALID/.test(m.text()))report.errors.push(m.text());});
 await page.addInitScript(()=>{let n=701;Math.random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};});
 await page.goto(base);await page.waitForFunction(()=>window.__oathfire?.ready);
 const s=newSave('ashwright');s.guide.active=false;s.guide.seen.push('prologue');s.completed=[0];s.heroes.ashwright.level=4;
 await page.evaluate(async s=>{const g=window.__oathfire;g.store.import(JSON.stringify(s));await g.start(null,true);g.ui.close();g.beginMission(1);g.manualTick=g.tick.bind(g);g.tick=()=>{};g.audio.play=()=>{};g.audio.impact=()=>{};},s);
 const prices=await page.evaluate(()=>{const g=window.__oathfire;g.battle.command=55;const before=g.allies.length;g.recruit('bow',true);const afterBow=g.battle.command;g.recruit('shield');g.ui.hud(1);return{afterBow,afterShield:g.battle.command,newUnits:g.allies.length-before,quick:[...document.querySelectorAll('[data-quick-recruit] b')].map(e=>e.textContent)};});
 check('Archer purchases debit 30 Command for exactly one soldier',prices.afterBow===25&&prices.newUnits===2);
 check('Foot soldier costs 14 and the HUD shows the same recruitment prices',prices.afterShield===11&&prices.quick.includes('14')&&prices.quick.includes('30'));
 for(const z of [-63,-126]){
  const x=riverCenter(z);const crossed=await page.evaluate(({x,z})=>{const g=window.__oathfire;g.physics.teleport(g.hero.phys,{x:x-11,y:g.world.height(x-11,z)+.1,z});g.physics.step();g.physics.position(g.hero.phys,g.hero.pos);let steps=0,minY=100;for(;steps<700&&g.hero.pos.x<x+10;steps++){g.view.yaw=-Math.PI/2;g.input.keys.add('KeyW');g.manualTick(1/60);minY=Math.min(minY,g.hero.pos.y);}g.input.clear();return {x:g.hero.pos.x,z:g.hero.pos.z,steps,minY};},{x,z});
  report.scenarios.push({ford:z,...crossed});check('Hero physically crosses the ford at '+z+' without a gap or impassable bank',crossed.x>x+9&&crossed.minY>RIVER_LEVEL-1);
 }
 // A pre-update saved actor can be beneath the new bank. Restore position, not
 // kills or wave progress, while preserving wall posts and the pending schedule.
 const restored=await page.evaluate(()=>{const g=window.__oathfire;g.checkpoint();const s=structuredClone(g.store.data.battle);s.wave=2;s.command=137;s.time=200;s.hero.pos={x:27,y:-2.98,z:-82};s.enemies=[{id:'legacy-straggler',type:'hollow',hp:60,waveTier:2,pos:{x:27,y:-2.98,z:-82}}];s.assault=undefined;const wallBefore=s.allies.find(a=>Number.isInteger(a.wallSlot))?.pos.y;g.beginMission(1,s);const e=g.enemies[0];return {wallBefore,wave:g.battle.wave,command:g.battle.command,time:g.battle.time,hp:e.hp,enemyY:e.pos.y,ground:g.world.height(e.pos.x,e.pos.z),heroY:g.hero.pos.y,wall:g.allies.find(a=>Number.isInteger(a.wallSlot))?.pos.y};});
 check('Existing battle resumes with its wave, Command, clock and surviving enemy health intact',restored.wave===2&&restored.command===137&&restored.time===200&&restored.hp===60);
 report.restored=restored;console.log('restore',JSON.stringify(restored));
 check('Old below-bank positions are raised to solid ground without moving wall archers',restored.enemyY>=restored.ground&&restored.heroY>=restored.ground&&restored.wall===restored.wallBefore);
 await page.evaluate(()=>{const g=window.__oathfire;g.ui.hud(1);});check('Wave cleanup is labeled enemies left, not a countdown',await page.locator('#combat-wave').innerText().then(x=>x.includes('1 enemy left')));
 // Real simulation of the reported arrangement. Extra Command only sets up
 // the eight-archer fixture; this scenario checks navigation, not affordability.
 await page.evaluate(()=>{const g=window.__oathfire;g.beginMission(1);g.battle.command=500;for(let i=0;i<8;i++)g.recruit('bow',true);g.physics.teleport(g.hero.phys,{x:18,y:0,z:-28});g.hero.invuln=9999;});
 const waves=new Set();let result;
 for(let n=0;n<65;n++){
  result=await page.evaluate(()=>{const g=window.__oathfire;for(let i=0;i<600&&g.mode==='play';i++)g.manualTick(1/60);return {mode:g.mode,wave:g.battle?.wave,time:g.battle?.time??g.store.data.lastBattle?.time,pending:g.battle?.assault?g.battle.assault.entries.length-g.battle.assault.cursor:0,alive:g.enemies.filter(e=>!e.dead).length,win:g.store.data.lastBattle?.win};});
  if(result.wave)waves.add(result.wave);if(n%10===0)console.log('river wave',JSON.stringify(result));if(result.mode==='result')break;
 }
 report.scenarios.push({garrison:result,waves:[...waves]});check('Full wall garrison advances through waves one, two and three',waves.has(1)&&waves.has(2)&&waves.has(3));check('Mission two finishes through normal combat with no stranded survivors',result.win===true&&result.alive===0&&result.time<600);
 // Reopen the river for still images and deterministic animation checks.
 await page.evaluate(()=>{const g=window.__oathfire;g.ui.close();g.ui.modal=false;document.querySelectorAll('#victory-transition,#battle-result,#unlock-sequence').forEach(e=>e.hidden=true);g.beginMission(1);g.view.update=()=>{};g.hero.character.root.visible=false;g.view.camera.position.set(24,1.4,-82);g.view.camera.lookAt(13,-.4,-88);g.time=20;g.world.update(0,20);g.view.render(false);});
 await page.screenshot({path:out+'/river-bank-mobile.jpg',quality:88});const frameA=await page.locator('canvas').first().screenshot();
 await page.evaluate(()=>{const g=window.__oathfire;g.time=22;g.world.update(0,22);g.view.render(false);});const frameB=await page.locator('canvas').first().screenshot();
 check('Moving water renders different ripple frames',!frameA.equals(frameB));
 for(const [name,pos,target]of [['near',[21,2.5,-34],[14,-.5,-69]],['ford',[0,1.5,-63],[15,-.5,-65]],['wide',[36,9,-38],[10,-.6,-100]]]){await page.evaluate(({pos,target})=>{const g=window.__oathfire;g.view.camera.position.set(...pos);g.view.camera.lookAt(...target);g.view.render(false);},{pos,target});await page.screenshot({path:out+'/river-'+name+'.jpg',quality:88});}
 check('No runtime or shader errors',report.errors.length===0);
}catch(e){report.failure=e.stack;console.error(e.stack);process.exitCode=1;}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser.close();}
