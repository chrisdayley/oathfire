import {createRequire} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),out=process.env.QA_OUT||'output/hero-271';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']}),p=await browser.newPage({viewport:{width:844,height:390}}),report={checks:[],errors:[]};p.on('pageerror',e=>report.errors.push(e.message));const check=(n,b)=>{assert.ok(b,n);report.checks.push(n);console.log('PASS',n);};
try{
 await p.goto(process.env.GAME_URL||'http://127.0.0.1:4179');await p.waitForFunction(()=>window.__oathfire?.ready);await p.locator('#new-game').click();await p.locator('[data-hero="ashwright"]').click();await p.locator('#begin-oath').click();await p.locator('#story-skip').click();
 await p.waitForFunction(()=>window.__oathfire.audio.foley?.state==='ready');
 report.comparisons=await p.evaluate(()=>{
  const g=window.__oathfire,rows=[];g.store.data.guide.active=false;
  for(const rank of [1,2,3])for(const action of ['staff','charged-staff','furnace']){
   const h=g.store.data.heroes.ashwright;h.skills.fireball=rank;h.equipped.weapon=g.store.data.inventory.find(i=>i.type==='staff').id;
   g.beginMission(0);g.ui.open('army');g.battle.nextWave=9999;g.hero.pos.set(0,g.world.height(0,-38),-38);g.physics.teleport(g.hero.phys,g.hero.pos);g.hero.cooldown=0;g.hero.focus=999;g.hero.stamina=999;g.view.yaw=0;
   const target=g.spawnEnemy('hollow',{x:0,z:-45},{hp:10000}),neighbor=g.spawnEnemy('hollow',{x:2.4,z:-45},{hp:10000});target.stats.armor=0;neighbor.stats.armor=0;g.physics.step();const beforeFocus=g.hero.focus;g.audio.foley.limits.clear();g.audio.foley.history=[];
   if(action==='furnace')g.combat.cast('fireball');else g.combat.attack(g.hero,action==='charged-staff');
   let initial=null,visual=null;
   for(let i=0;i<390;i++){g.combat.update(1/60);if(g.combat.projectiles[0])visual={furnace:!!g.combat.projectiles[0].furnace,scale:g.combat.projectiles[0].model.scale.x,rank:g.combat.projectiles[0].rank};if(initial===null&&target.hp<10000)initial={direct:10000-target.hp,neighbor:10000-neighbor.hp,sunder:neighbor.sunder||0};}
   rows.push({rank,action,initial,damage:10000-target.hp,neighbor:10000-neighbor.hp,spent:beforeFocus-g.hero.focus,zones:g.combat.zones.length,sounds:g.audio.foley.history.map(e=>({key:e.key,tag:e.tag})),visual});
  }return rows;
 });console.log(JSON.stringify(report.comparisons,null,2));
 for(const rank of [1,2,3]){
  const rows=report.comparisons.filter(r=>r.rank===rank),staff=rows.find(r=>r.action==='staff'),charged=rows.find(r=>r.action==='charged-staff'),f=rows.find(r=>r.action==='furnace');
  check('Rank '+rank+' Furnace impact exceeds a charged rune-staff hit',f.initial.direct>charged.initial.direct);
  check('Rank '+rank+' Furnace burns after impact and reaches the nearby enemy',f.damage>f.initial.direct&&f.neighbor>f.initial.neighbor&&f.initial.neighbor>0&&f.zones===0);
  check('Rank '+rank+' staff does not inherit spell effects',staff.damage===staff.initial.direct&&staff.neighbor===0&&staff.visual.rank===1&&!staff.visual.furnace);
  check('Rank '+rank+' has a distinct larger projectile and spends 17 magic',f.visual.furnace&&f.visual.scale>staff.visual.scale&&f.spent===17);
  check('Rank '+rank+' staff and Furnace have different casting sounds',staff.sounds.some(s=>s.tag==='rune-bolt')&&!staff.sounds.some(s=>s.key==='cast-fireball')&&f.sounds.some(s=>s.key==='cast-fireball'));
  check('Rank '+rank+' armor weakening matches its learned rank',f.initial.sunder===[0,4,6][rank-1]);
 }
 const fires=report.comparisons.filter(r=>r.action==='furnace');check('All three ranks deal their declared complete damage',fires.map(r=>r.damage).join(',')==='106,158,226');
 check('Training the ability leaves ordinary staff damage unchanged',new Set(report.comparisons.filter(r=>r.action==='staff').map(r=>r.damage)).size===1);
 await p.evaluate(()=>{const g=window.__oathfire,h=g.store.data.heroes.ashwright;h.skills.fireball=1;h.equipped.weapon=g.store.data.inventory.find(i=>i.type==='hammer').id;g.beginMission(0);g.battle.nextWave=9999;g.spawnEnemy('brute',{x:0,z:-40},{hp:10000});g.spawnEnemy('hollow',{x:2,z:-41},{hp:10000});g.view.pitch=.1;});
 await p.waitForTimeout(900);const casts=await p.evaluate(()=>window.__oathfire.combat.stats.casts.fireball);await p.locator('#spell-0').click();await p.waitForTimeout(330);await p.screenshot({path:out+'/furnace-projectile.png'});await p.waitForTimeout(450);await p.screenshot({path:out+'/furnace-ground.png'});
 check('The actual combat ability button casts the unique spell',await p.evaluate(n=>window.__oathfire.combat.stats.casts.fireball===n+1,casts));
 check('No combat runtime errors',report.errors.length===0);
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e.stack);}finally{fs.writeFileSync(out+'/furnace-report.json',JSON.stringify(report,null,2));await browser.close();}
