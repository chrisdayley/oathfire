import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {newSave} from '../src/state.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.GAME_URL||'http://127.0.0.1:4179',out=process.env.QA_OUT||'work/qa-physique';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']}),page=await browser.newPage({viewport:{width:1100,height:780}}),report={base,checks:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS',name)};
try{
 await page.goto(base+'/art-studio.html?role=ashwright&rarity=0');await page.waitForFunction(()=>window.__atelier?.current?.phase>1.4);
 report.rigs=await page.evaluate(()=>{
  const C=window.__atelier.current.constructor,results=[];
  for(const design of ['warden','ashwright','ranger'])for(const weapon of ['sword','hammer','bow','staff','spear']){
   const c=new C('Knight',{design,weapon,armor:{type:'armor',armorKind:'hearth',rarity:0},weaponItem:{type:weapon,rarity:0}}),vec=c.root.position.clone(),world=id=>c.sockets[id].getWorldPosition(vec.clone()),row={design,weapon,gaits:{}};
   for(const [gait,speed]of [['walk',2],['run',4.5]]){
    const bends=[],z=[],contacts=[],grips=[];for(let i=0;i<150;i++){
     c.update(1/60,{speed});c.root.updateMatrixWorld(true);if(i<60)continue;
     const shoulder=world('upperarmr'),elbow=world('lowerarmr'),wrist=world('wristr');bends.push(shoulder.sub(elbow).angleTo(wrist.sub(elbow))*180/Math.PI);z.push(world('wristl').z-world('chest').z);contacts.push(...c.footContacts);
     if(weapon==='hammer'&&!c.heldShield)grips.push(world('handslotl').distanceTo(c.held.localToWorld(vec.clone().set(0,.33,0))));
    }
    row.gaits[gait]={clip:c.actionName,minBend:Math.min(...bends),maxBend:Math.max(...bends),leftSwing:Math.max(...z)-Math.min(...z),contacts:contacts.length,maxGripError:Math.max(0,...grips)};
   }
   for(let i=0;i<30;i++)c.update(1/60,{speed:4.5,grounded:false});row.jump=c.actionName==='Jump_Idle'&&c.footContacts.length===0;
   c.update(1/60,{speed:4.5,guarding:true});row.guard=c.actionName==='Blocking'&&c.motionWeight===0;
   c.update(1/60,{speed:4.5,charging:true});row.charge=c.current.paused&&c.motionWeight===0;
   c.attack(weapon,false,0,.65);for(let i=0;i<12;i++)c.update(1/60,{speed:4.5});row.attack=c.actionLock>0&&c.motionWeight===0;
   c.cast('fireball',2);for(let i=0;i<10;i++)c.update(1/60,{speed:4.5});row.cast=c.actionLock>0&&c.motionWeight===0;
   for(let i=0;i<150;i++)c.update(1/60,{speed:0});row.stop=c.actionName==='Idle'&&c.motionWeight<.001;
   row.anatomicalArms=c.body.filter(m=>m.name.startsWith('Anatomical muscular arm')).length;
   row.finite=c.body.every(m=>{m.skeleton.update();for(let i=0;i<m.geometry.attributes.position.count;i+=37){vec.fromBufferAttribute(m.geometry.attributes.position,i);m.applyBoneTransform(i,vec);if(!vec.toArray().every(Number.isFinite))return false;}return true;});
   results.push(row);c.dispose();
  }
  return results;
 });
 for(const r of report.rigs){
  const n=r.design+'/'+r.weapon;check(n+' has separate walk/run clips and bent elbows',r.gaits.walk.clip==='Walking_A'&&r.gaits.run.clip==='Running_A'&&r.gaits.run.maxBend<165&&r.gaits.run.minBend>20);
  check(n+' preserves jump, guard, charge, attack, cast and stop',r.jump&&r.guard&&r.charge&&r.attack&&r.cast&&r.stop&&r.finite);
  check(n+' foot contacts remain attached to the gait',r.gaits.run.contacts>=3&&r.gaits.walk.contacts>=2);
  if(r.weapon==='hammer')check(n+' support hand follows the hammer grip',r.gaits.run.maxGripError<.065);
  if(r.design==='ashwright')check(n+' uses two skinned anatomical arms',r.anatomicalArms===2);
 }
 const archer=report.rigs.find(r=>r.design==='ranger'&&r.weapon==='bow');check('Unencumbered arm swings visibly through the running stride',archer.gaits.run.leftSwing>.18);
 // Actual rendered models at both plain and elaborate equipment tiers.
 for(const role of ['warden','ashwright','ranger']){
  await page.selectOption('#role',role);await page.selectOption('#rarity','0');await page.waitForFunction(()=>window.__atelier.current.phase>1.4);await page.evaluate(()=>{window.__atelier.setSpeed(4.5);window.__atelier.setAngle(.35);});await page.waitForFunction(()=>window.__atelier.current.motionWeight>.99);await page.screenshot({path:out+'/'+role+'-run-common.jpg',quality:90});
  await page.evaluate(()=>window.__atelier.setAngle(1.4));await page.waitForTimeout(100);await page.screenshot({path:out+'/'+role+'-run-side.jpg',quality:88});
  await page.selectOption('#rarity','6');await page.waitForFunction(()=>window.__atelier.current.phase>1.4);await page.evaluate(()=>window.__atelier.setAngle(.35));await page.waitForTimeout(100);await page.screenshot({path:out+'/'+role+'-run-godly-front.jpg',quality:90});await page.evaluate(()=>window.__atelier.setAngle(3.5));await page.waitForTimeout(100);await page.screenshot({path:out+'/'+role+'-run-godly-back.jpg',quality:88});
 }
 await page.setViewportSize({width:844,height:390});await page.goto(base);await page.waitForFunction(()=>window.__oathfire?.ready);
 const save=newSave('ashwright');save.guide.active=false;save.guide.seen.push('prologue');save.completed=[0];
 await page.evaluate(async s=>{const g=window.__oathfire;g.store.import(JSON.stringify(s));await g.start(null,true);},save);await page.waitForFunction(()=>window.__oathfire.hero);if(await page.locator('#story-skip').isVisible())await page.locator('#story-skip').click();
 const before=await page.evaluate(()=>window.__oathfire.hero.pos.toArray());await page.keyboard.down('KeyD');await page.waitForFunction(()=>window.__oathfire.hero.character.motionWeight>.98);await page.waitForTimeout(600);await page.screenshot({path:out+'/gameplay-running-mobile.jpg',quality:90});await page.keyboard.up('KeyD');
 check('Third-person movement travels through the world using the new run',await page.evaluate(before=>{const h=window.__oathfire.hero;return h.pos.distanceTo(h.pos.clone().fromArray(before))>1&&h.character.gaitSpeed>2.5;},before));
 await page.waitForFunction(()=>window.__oathfire.hero.character.actionName==='Idle');
 await page.keyboard.down('KeyK');await page.waitForFunction(()=>window.__oathfire.hero.character.actionName==='Blocking');check('Live guard takes control of the upper-body pose',await page.evaluate(()=>window.__oathfire.hero.character.motionWeight===0));await page.keyboard.up('KeyK');
 await page.keyboard.press('KeyJ');await page.waitForFunction(()=>window.__oathfire.combat.stats.light>=1);check('Light attacks still trigger',true);await page.waitForFunction(()=>window.__oathfire.hero.cooldown<=0);await page.keyboard.down('KeyJ');await page.waitForFunction(()=>window.__oathfire.hero.charge>.45);await page.keyboard.up('KeyJ');await page.waitForFunction(()=>window.__oathfire.combat.stats.heavy>=1);check('Charged attacks still trigger',true);
 await page.waitForFunction(()=>window.__oathfire.hero.phys.grounded);await page.keyboard.press('Space');await page.waitForFunction(()=>!window.__oathfire.hero.phys.grounded);check('Jump leaves the ground and has no footfall events',await page.evaluate(()=>window.__oathfire.hero.character.footContacts.length===0));await page.waitForFunction(()=>window.__oathfire.hero.phys.grounded);
 await page.keyboard.press('KeyQ');await page.waitForFunction(()=>window.__oathfire.combat.stats.casts.fireball>=1);check('Ashwright still casts Furnace Fireball',true);
 report.physics=await page.evaluate(()=>{const g=window.__oathfire,h=g.hero;g.input.clear();const run=(n,move,jump=false)=>{let max=-99;for(let i=0;i<n;i++){g.physics.move(h.phys,move,1/60,jump&&i===0);g.physics.step();g.physics.position(h.phys,h.pos);max=Math.max(max,h.pos.y);}return {p:h.pos.toArray(),max};};g.physics.teleport(h.phys,{x:8,y:0,z:-28.5});run(20,{x:0,y:0,z:0});const blocked=run(60,{x:0,y:0,z:-5});g.physics.teleport(h.phys,{x:8,y:0,z:-29.4});run(20,{x:0,y:0,z:0});const jumped=run(65,{x:0,y:0,z:-5},true);return {blocked,jumped};});check('Rock collisions and jumping over low obstacles still work',report.physics.blocked.p[2]>-32&&report.physics.jumped.max>1&&report.physics.jumped.p[2]<-32.8);
 await page.evaluate(()=>window.__oathfire.ui.open('hero'));await page.waitForFunction(()=>window.__oathfire.ui.preview?.phase>1.4);await page.screenshot({path:out+'/character-menu-mobile.jpg',quality:90});check('The character menu uses the same muscular hero',await page.evaluate(()=>window.__oathfire.ui.preview.body.filter(m=>m.name.startsWith('Anatomical muscular arm')).length===2));
 await page.evaluate(()=>window.__oathfire.checkpoint());const checkpoint=await page.evaluate(()=>JSON.stringify(window.__oathfire.store.data.heroes));await page.reload();await page.waitForFunction(()=>window.__oathfire?.ready);check('Hero progress survives reload',checkpoint===await page.evaluate(()=>JSON.stringify(window.__oathfire.store.data.heroes)));
 if(process.env.QA_OFFLINE==='1'){await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>window.__oathfire?.ready&&navigator.serviceWorker.controller);await page.context().setOffline(true);await page.reload();await page.waitForFunction(()=>window.__oathfire?.ready);await page.locator('#continue-game').click();await page.waitForFunction(()=>window.__oathfire.hero);check('Offline startup loads the anatomical hero and existing save',await page.evaluate(()=>window.__oathfire.hero.character.body.filter(m=>m.name.startsWith('Anatomical muscular arm')).length===2));await page.context().setOffline(false);}
 check('No browser runtime errors',report.errors.length===0);
}catch(e){report.failure=e.message;console.error(e.stack);await page.screenshot({path:out+'/failure.jpg',quality:85}).catch(()=>{});process.exitCode=1;}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser.close();}
