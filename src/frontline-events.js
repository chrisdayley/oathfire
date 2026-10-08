import * as T from 'three';
import {box,cyl,beam,mesh} from './art.js';
import {material} from './materials.js';
import {TURNING_POINTS} from './frontline-rules.js';
import {DEFENSE_FIELD_LIMIT} from './wave-plan.js';
import {commandCap} from './command-economy.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),UP=new T.Vector3(0,1,0);
export function combatNotice(g,text,color='#f6dc9e',pos=g.hero.pos){
 g.combatFeedback={text,until:(g.battle?.time??g.time)+2.5};
 g.fx.damageText(pos.clone().addScaledVector(UP,2.5),text,color);
}
export function attachEncounterModel(g,e,stage=g.battle?.id??0){
 if(e.encounterRole==='commander'){const banner=new T.Group();e.character.root.add(banner);e.character.gear.push(banner);const iron=g.world.materials.iron.clone(),gold=g.world.materials.gold.clone(),cloth=material('cloth',0x693d81,{side:T.DoubleSide});beam(banner,[-.5,1.2,-.25],[-.5,3.5,-.25],.035,iron);beam(banner,[-.6,3.4,-.25],[.45,3.4,-.25],.028,gold);mesh(new T.PlaneGeometry(.95,1.4),cloth,banner,-.04,2.64,-.25);mesh(new T.OctahedronGeometry(.18),gold,banner,-.04,2.7,-.18);return;}if(!['ram','battery'].includes(e.encounterRole))return;
 for(const child of e.character.root.children)child.visible=false;
 const root=new T.Group(),wood=g.world.materials.wood.clone(),iron=g.world.materials.iron.clone(),gold=g.world.materials.gold.clone();
 e.character.root.add(root);e.character.gear.push(root);e.encounterModel=root;e.character.root.userData.encounterModel=root;
 const ram=e.encounterRole==='ram';root.scale.setScalar(1/e.character.root.scale.x);
 box(root,[2.5,.3,3.8],[0,.7,0],wood);
 root.userData.wheels=[];
 for(const x of [-1.25,1.25])for(const z of [-1.25,1.25]){
  const wheel=new T.Group();wheel.position.set(x,.55,z);root.add(wheel);root.userData.wheels.push(wheel);
  const rim=mesh(new T.TorusGeometry(.47,.085,6,20),iron,wheel);rim.rotation.y=Math.PI/2;
  const hub=cyl(wheel,.16,.16,.28,[0,0,0],gold,12);hub.rotation.z=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(wheel,[0,0,0],[0,Math.sin(a)*.46,Math.cos(a)*.46],.045,wood);}
 }
 for(const x of [-1,1])for(const z of [-1.5,1.5])beam(root,[x,.8,z],[x,2.8,z],.13,wood);
 if(ram){
  const log=cyl(root,.32,.4,4.6,[0,1.4,.25],wood,14);log.rotation.x=Math.PI/2;root.userData.log=log;
  for(const z of [-1.3,1.2]){beam(root,[-1,2.7,z],[1,2.7,z],.16,wood);beam(root,[0,2.7,z],[0,1.6,z],.028,iron);}
  const head=mesh(new T.ConeGeometry(.53,.85,5),iron,root,0,1.4,2.7);head.rotation.x=Math.PI/2;root.userData.head=head;
  for(const side of [-1,1]){const roof=box(root,[1.6,.16,4.3],[side*.67,2.8,0],iron);roof.rotation.z=-side*.4;for(let i=0;i<10;i++)box(root,[.07,.08,.08],[side*1.4,2.53,-1.8+i*.4],gold);}
  // Exposed rear axle is readable from behind and matches its vulnerability.
  box(root,[1.8,.2,.22],[0,1.03,-1.95],material('steel',0xce923f));
 }else{
  const barrel=cyl(root,.43,.57,2.7,[0,1.8,0],iron,16);barrel.rotation.x=.7;root.userData.barrel=barrel;
  for(const z of [-1,1])beam(root,[-1,.8,z],[0,2.2,0],.12,wood);
  const ring=mesh(new T.TorusGeometry(.5,.08,6,20),gold,root,0,2.83,-.87);ring.rotation.x=-.7;
 }
 root.userData.kind=e.encounterRole;
 if(ram){const savedHP=e.hp;e.stats={...e.stats,hp:Math.round(380*(1+stage*.11)),armor:22,speed:1.7,damage:38+stage*2,range:3.2,scale:1.4};e.hp=e.restoredHealth?Math.min(savedHP,e.stats.hp):e.stats.hp;}
}
export function tickTurningPoint(g,dt){
 const b=g.battle,t=b?.turningPoint;if(!t||t.phase==='resolved')return;
 if(t.phase==='waiting'&&(b.assault?.elapsed||0)>=20){t.phase='warning';g.toast(TURNING_POINTS[t.kind].warning);g.audio.play('rally',.55);}
 if(t.phase==='warning'){
  t.remaining=Math.max(0,t.remaining-dt);
  const count=t.kind==='commander'?1:3;
  if(t.remaining===0&&g.enemies.filter(e=>!e.dead).length+count<=DEFENSE_FIELD_LIMIT){
   for(let i=0;i<count;i++){
    const x=t.kind==='bombers'?36+i*2:t.kind==='ram'?0:-24,z=t.kind==='ram'?-78:-70-i*3;
    const escort=t.kind==='ram'&&i>0;const e=g.spawnEnemy(escort?'hollow':TURNING_POINTS[t.kind].type,{x:escort?(i===1?-3:3):x,z:escort?z+2:z},{waveTier:b.wave,...(t.kind==='bombers'||escort?{}:{encounterRole:t.kind})});
    t.ids.push(e.id);
   }
   t.phase='active';g.checkpoint();
  }
 }
 if(t.phase==='active'&&t.ids.length&&!t.ids.some(id=>g.enemies.some(e=>e.id===id&&!e.dead))){
  t.phase='resolved';b.command=Math.min(commandCap(b),b.command+12);g.toast(TURNING_POINTS[t.kind].name+' defeated · +12 Command');g.audio.play('upgrade',.6);g.checkpoint();
 }
}
// These special units use the same physics, targeting and damage system as the army.
export function encounterAI(g,e,dt){
 if(e.encounterRole==='ram'){
  if(e.stun>0){e.velocity.set(0,0,0);g.physics.move(e.phys,e.velocity,dt);return true;}
  const goal=g.castleGoal(e),d=distance(e.pos,goal);e.facing=Math.atan2(goal.x-e.pos.x,goal.z-e.pos.z);e.character.root.rotation.y=e.facing;
  for(const wheel of e.encounterModel?.userData.wheels||[])wheel.rotation.x+=dt*e.speed/.47;if(d>3.1){if(!e.path?.length||e.think<=0){e.path=g.findPath(e.pos,goal);e.pathIndex=0;e.think=.7;}e.think-=dt;while(e.pathIndex<e.path.length-1&&distance(e.pos,e.path[e.pathIndex])<1)e.pathIndex++;
   const p=e.path[e.pathIndex]||goal;e.velocity.copy(p).sub(e.pos).setY(0).normalize().multiplyScalar(e.stats.speed);g.physics.move(e.phys,e.velocity,dt);e.speed=e.stats.speed;
  }else{e.velocity.set(0,0,0);g.physics.move(e.phys,e.velocity,dt);e.speed=0;if(e.cooldown<=0){e.cooldown=4;e.ramWindup=1.3;g.fx.ring(e.pos,2,0xe89a53,1.3);}}
  if(e.ramWindup>0){e.ramWindup-=dt;const log=e.encounterModel?.userData.log;if(log){log.position.z=.25-Math.sin((1-e.ramWindup/1.3)*Math.PI)*.55;e.encounterModel.userData.head.position.z=2.45+log.position.z;}
   if(e.ramWindup<=0&&distance(e.pos,goal)<4){g.damageGate(e.stats.damage);g.audio.impact({element:'stone',position:e.pos,heavy:true,hero:true});g.fx.emit('dust',goal,25,{speed:3});}}
  return true;
 }
 if(e.encounterRole==='commander'){
  if(e.stun>0)return false;
  const t=g.battle.turningPoint;
  if(e.channel>0){e.channel=Math.max(0,e.channel-dt);e.velocity.set(0,0,0);g.physics.move(e.phys,e.velocity,dt);e.speed=0;
   if(e.channel===0&&t&&t.rallies<2){const free=DEFENSE_FIELD_LIMIT-g.enemies.filter(a=>!a.dead).length;for(let i=0;i<Math.min(3,free);i++)g.spawnEnemy('hollow',{x:e.pos.x+(i-1)*2,z:e.pos.z-6},{waveTier:g.battle.wave});t.rallies++;e.nextRally=18;g.toast('The marshal called reinforcements. A charged blow interrupts its next rally.');}
   return true;
  }
  e.nextRally=(e.nextRally??8)-dt;
  if(t?.rallies<2&&e.nextRally<=0){e.channel=4;e.character.cast('rally',3);g.fx.ring(e.pos,3,0xbe6eeb,4);g.toast('Marshal raising its banner · charged strike to interrupt');return true;}
 }
 if(e.encounterRole==='battery'){e.velocity.set(0,0,0);g.physics.move(e.phys,e.velocity,dt);e.speed=0;const target=[g.hero,...g.allies].filter(a=>!a.dead&&distance(a.pos,e.pos)<75).sort((a,b)=>distance(a.pos,e.pos)-distance(b.pos,e.pos))[0];
  if(target){e.facing=Math.atan2(target.pos.x-e.pos.x,target.pos.z-e.pos.z);e.character.root.rotation.y=e.facing;if(e.cooldown<=0&&!(e.stun>0))g.batteryAttack(e,target);}return true;}
 return false;
}
export function interruptEnemy(g,e){
 if(!e||e.dead||e.team!=='enemy')return false;
 const interrupted=e.channel>0||e.throwWindup>0||e.ramWindup>0;
 e.channel=0;e.throwWindup=0;e.ramWindup=0;e.attackToken=(e.attackToken||0)+1;
 if(e.encounterRole==='commander')e.nextRally=10;
 if(interrupted){e.stun=Math.max(e.stun||0,1.1);e.cooldown=Math.max(e.cooldown,2);combatNotice(g,'INTERRUPTED','#d8c3ff',e.pos);}
 return interrupted;
}
