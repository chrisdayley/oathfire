import * as T from 'three';
import {abilityProfile,evolutionFor} from './ability-progression.js';
import {heroData,skillRank} from './state.js';
const UP=new T.Vector3(0,1,0),distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function techniqueResource(id,rank,path){if(id==='fireball'&&rank===10){if(path==='corona')return {cost:26,cooldown:8};if(path==='sun')return {cost:30,cooldown:10};}return null;}
export function performTechnique(combat,id,r,target,point){
 const g=combat.g,h=g.hero,s=g.store.data,p=abilityProfile(id,r,heroData(s).evolutions?.[id]),ev=p.evolution;
 const dir=new T.Vector3(Math.sin(h.facing),0,Math.cos(h.facing));
 const near=(center,radius)=>g.enemies.filter(e=>!e.dead&&distance(e.pos,center)<radius&&Math.abs(e.pos.y-center.y)<4);
 const friends=(radius,center=h.pos)=>[h,...g.allies].filter(a=>!a.dead&&distance(a.pos,center)<radius);
 const heal=(a,n)=>{a.hp=Math.min(a===h?g.heroStats().hp:a.stats.hp,a.hp+n*(a===h?g.heroStats().healFactor:1));};
 const protect=(a,time,amount)=>{a.protect=Math.max(a.protect||0,time);a.protectStrength=Math.max(a.protectStrength||.3,amount);};
 const mark=(e,time,hero=.2,ally=.15)=>{e.marked=time;e.markHero=hero;e.markAlly=ally;};
 const zone=(center,radius,time,damage,kind,healing=0,follow=false)=>{const z=combat.zone(center,radius,time,damage,h,kind,healing);z.follow=follow?h:null;if(follow)z.followVisual=g.fx.ring(center,radius,kind==='leaf'?0x80c79f:0xebc875,time);return z;};
 const stun=(center,radius,time,root=false)=>{for(const e of near(center,radius))e[root?'rooted':'stun']=Math.max(e[root?'rooted':'stun']||0,time);};
 const burst=(center,radius,damage,kind)=>combat.burst(center,radius,damage,h,kind);
 g.fx.technique?.(id,h.pos,point,r,ev);
 if(id==='step'||id==='windstep'){
  const from=h.pos.clone();h.dash=.24;h.dashVelocity=dir.clone().multiplyScalar((ev&&id==='windstep'?10:p.distance)/.24);h.invuln=ev==='ghost'?2:.24;protect(h,p.duration,p.protection);if(p.bonus){h.empowered=5;h.empoweredBonus=p.bonus;}if(ev==='ghost')h.stamina=Math.min(g.heroStats().stamina,h.stamina+25);
  if(ev==='haven')zone(from,6,6,0,'holy',14);
  if(ev==='ram'||ev==='razor')combat.later(.24,()=>{if(h.dead)return;burst(h.pos,4,ev==='ram'?100:150,ev==='ram'?'holy':'leaf');if(ev==='ram')stun(h.pos,4,2);});
 }else if(id==='fireball'){
  if(ev==='corona'){combat.later(.35,()=>{if(h.dead)return;burst(h.pos,9,180,'fire');zone(h.pos,9,6,32,'fire');for(const e of near(h.pos,9))e.knock=e.pos.clone().sub(h.pos).setY(0).normalize().multiplyScalar(7);});}
  else{const f={impact:p.impact,blast:p.blast,radius:p.radius,burn:p.burn,duration:p.duration,sunder:p.sunder,...(ev==='sun'?{impact:420,blast:170,radius:6,burn:32,duration:6}:{})};combat.later(ev==='sun'?.52:.24,()=>{if(!h.dead)combat.shoot(h,target,{damage:f.impact,type:'fire',speed:ev==='sun'?16:22,rank:r,furnace:f,heavy:ev==='sun'});});}
 }else if(id==='quench'){
  heal(h,ev==='tide'?150:p.heal);h.burn=0;const radius=ev?7:p.radius;for(const a of friends(radius).filter(a=>a!==h))heal(a,ev==='tide'?130:p.allyHeal);g.fx.emit('water',h.pos,45,{speed:4});for(const e of near(h.pos,radius))e.slow=p.duration;if(ev==='tide')stun(h.pos,radius,3,true);if(ev==='spring')zone(h.pos,7,10,0,'water',20);
 }else if(id==='rally'||id==='march'&&ev==='warcry'){
  const radius=id==='march'?10:g.heroStats().supportRadius+p.radiusBonus,duration=ev==='warcry'?(id==='march'?12:10):p.duration;for(const a of friends(radius)){a.buff=duration;a.haste=duration;a.hasteStrength=ev==='warcry'?.35:p.haste;a.buffDamage=ev==='warcry'?.35:p.bonus;if(r>=3)protect(a,duration,ev==='rescue'?.45:.3);if(ev==='rescue')heal(a,100);}g.fx.ward(h.pos,radius,2);const medic=skillRank(s,'medic');if(medic)for(const a of friends(radius).filter(a=>a!==h).sort((a,b)=>a.hp/a.stats.hp-b.hp/b.stats.hp).slice(0,3))heal(a,[0,12,20,26][medic]);
 }else if(id==='thorns'){
  const radius=ev==='forest'?9:p.radius,count=ev==='forest'?12:ev==='impale'?1:p.count,damage=ev==='impale'?420:ev==='forest'?100:p.damage,duration=ev==='impale'?6:ev==='forest'?5:p.duration;
  for(const e of near(point,radius).sort((a,b)=>distance(a.pos,point)-distance(b.pos,point)).slice(0,count)){e.rooted=duration;g.fx.roots(e.pos,ev==='impale'?3:1.5,duration,ev==='impale'?14:7);combat.hit(e,damage,h,{secondary:true});}
 }else if(id==='mark'){
  for(const e of ev==='hunt'?near(point,10).slice(0,10):target?[target]:[]){mark(e,ev==='execution'?14:ev==='hunt'?12:p.duration,ev==='execution'?.65:ev==='hunt'?.35:p.heroBonus,ev==='execution'?.4:ev==='hunt'?.25:p.allyBonus);g.fx.ring(e.pos,1.4,0xe5ba70,5);}
 }else if(id==='volley'||id==='guide'){
  if(r>=2&&target)mark(target,p.duration);const archers=g.allies.filter(a=>!a.dead&&['bow','crossbow'].includes(a.weapon)),sources=archers.length?archers:[h];
  const count=ev==='rain'?4:ev==='piercer'?1:p.count,mult=ev==='rain'?.85:ev==='piercer'?2.6:p.multiplier,targets=near(point,12);
  for(const a of sources){a.character.attack('bow',false,0,.6);for(let i=0;i<count;i++)combat.later(.08+i*.18,()=>{if(!a.dead)combat.shoot(a,ev==='rain'?(targets[i%Math.max(1,targets.length)]||target):target,{damage:(a===h?g.heroStats().damage:a.stats.damage)*mult,type:ev==='piercer'?'bolt':'arrow',speed:36,rank:r,passThrough:ev==='piercer'?3:1});});}
 }else if(id==='bulwark'||id==='tether'){
  if(ev==='shatter'){burst(h.pos,8,280,'holy');for(const e of near(h.pos,8))e.sunder=10;}
  else if(ev==='pilgrim')zone(h.pos,5,10,0,'holy',16,true);
  else if(ev==='prison')zone(point,8,8,24,'holy');
  else for(const a of r>=2?friends(p.radius):[h])protect(a,ev==='citadel'?12:p.duration,ev==='citadel'?.6:p.protection);
  g.fx.ward(h.pos,ev==='prison'?2:p.radius,Math.min(10,p.duration));
 }else if(id==='overdrive'){
  if(g.battle){g.battle.overdrive=ev?16:p.duration;g.battle.overdriveStrength=ev==='siege'?.55:p.defenseHaste;}
  for(const a of friends(12)){a.haste=ev?16:p.duration;a.hasteStrength=ev==='legion'?.5:p.haste;}
 }else if(id==='mine'){
  const count=ev==='cluster'?5:ev==='volcano'?1:p.count;for(let i=0;i<count;i++){const a=h.facing+(i-(count-1)/2)*.7,pos=h.pos.clone().add(new T.Vector3(Math.sin(a)*3,0,Math.cos(a)*3));pos.y=g.world.height(pos.x,pos.z);g.fx.ring(pos,ev==='volcano'?2:.75,0xea8d42,14);combat.zones.push({pos,r:ev==='volcano'?4:2,blastRadius:ev==='volcano'?7:p.radius,time:14,damage:ev==='volcano'?450:ev==='cluster'?180:p.damage,owner:h,kind:'mine',tick:0,volcano:ev==='volcano'});}
 }else if(id==='seedward')zone(h.pos,ev==='pilgrim'?6:ev==='bramble'?7:p.radius,ev?10:p.duration,ev==='bramble'?28:0,'leaf',ev==='pilgrim'?18:ev==='bramble'?16:p.heal,ev==='pilgrim');
 else if(id==='sunwall'){
  if(ev==='judgment'){burst(h.pos,10,320,'holy');stun(h.pos,10,3);}else{for(const a of friends(p.radius)){protect(a,ev==='citadel'?12:p.duration,ev==='citadel'?.6:p.protection);}if(ev==='citadel')h.stamina=Math.min(g.heroStats().stamina,h.stamina+35);burst(h.pos,5,p.damage,'holy');}
 }else if(['march','sanctuary','grove'].includes(id)){
  const radius=ev==='bastion'||ev==='bramble'?10:p.radius,kind=id==='grove'?'leaf':'holy';zone(h.pos,radius,ev?12:p.duration,ev==='bramble'?32:0,kind,ev==='pilgrim'?22:ev==='bastion'?30:ev==='bramble'?24:p.heal,ev==='pilgrim');protect(h,p.duration,.3);h.buff=p.duration;
 }else{
  const kind=['briarstorm','verdant'].includes(id)?'leaf':id==='reversal'?'holy':'fire',center=id==='briarstorm'?point:h.pos;
  if(ev==='lance'){combat.later(.4,()=>!h.dead&&combat.shoot(h,target,{damage:id==='inferno'?620:580,type:kind==='leaf'?'thorn':'holy',speed:34,rank:r,passThrough:4,pierce:.35,heavy:true}));}
  else if(ev==='meteor'||ev==='tempest'){for(let i=0;i<3;i++)combat.later(.3+i*.5,()=>{if(h.dead)return;g.fx.technique?.(id,point,point,r,'impact');burst(point,ev==='meteor'?5:6,ev==='meteor'?190:180,kind);});}
  else{const radius=ev==='impale'?10:ev?12:8+(r-1)*.25,damage=ev==='quake'||id==='inferno'&&ev==='nova'?400:ev==='impale'||id==='verdant'&&ev==='nova'?360:ev==='nova'?380:p.damage;burst(center,radius,damage,kind);if(ev)stun(center,radius,kind==='leaf'?5:3,kind==='leaf');if(kind==='leaf')g.fx.roots(center,radius,4+(r-1)*.3,15);else if(kind==='fire')zone(center,ev?12:6,ev?8:4+(r-1)*.3,ev?40:12+(r-1)*2,'fire');}h.invuln=1;
 }
}
