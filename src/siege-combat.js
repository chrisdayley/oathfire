import {recordDamage} from './battle-record.js';
import {researchHit} from './research-combat.js';
import {triggerWeaponPower} from './weapon-powers.js';
import * as T from 'three';
import {MISSIONS,seeded} from './data.js';
import {mesh,mat} from './art.js';
import {missionRoster} from './campaign.js';
import {isSiege,SIEGE_OUTPOSTS,SIEGE_GATE_Z,SIEGE_PARTS,SIEGE_NAMES,siegeConfig,newSiegeState,siegePressure,siegeInterval,siegePacket} from './siege-rules.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function attackPoint(target,from){
 if(!target.structure)return target.pos;
 const n=target.nav,hx=n.hx-.6,hz=n.hz-.6,p=target.pos.clone();
 p.x=Math.max(n.x-hx-.24,Math.min(n.x+hx+.24,from.x));p.z=Math.max(n.z-hz-.24,Math.min(n.z+hz+.24,from.z));
 if(Math.abs(from.x-n.x)<=hx&&Math.abs(from.z-n.z)<=hz)p.z=n.z+hz+.24;
 return p;
}
export function attackTargets(g){return [...g.enemies,...(g.siegeTargets||[]).filter(t=>!t.dead&&(t.part!=='keep'||g.battle?.siege?.hp.gate===0))];}
export function siegeObjective(g){return (g.siegeTargets||[]).find(t=>!t.dead&&t.part===(g.battle?.siege?.hp.gate>0?'gate':'keep'));}
export function initializeSiege(g,saved){
 const m=MISSIONS[g.battle.id];if(!isSiege(m))return;
 const state=g.battle.siege??=newSiegeState(m),c=siegeConfig(m);
 g.siegeTargets=SIEGE_PARTS.map(part=>{const p=g.world.enemyFortress.parts[part],t={id:'fortress-'+part,part,type:'fortification',structure:true,team:'enemy',pos:new T.Vector3(p.x,p.y,p.front),stats:{hp:c.hp[part],armor:part==='keep'?22:12,scale:1},hp:state.hp[part],dead:state.hp[part]<=0,model:p.model,phys:{collider:p.collider},nav:p.nav,cooldown:5+(part==='east'?3:0)};g.physics.meta.set(p.collider.handle,{kind:'enemy-fortification',entity:t});if(t.dead)collapse(g,t,false);return t;});
 g.battle.wave=state.pressure;g.battle.nextWave=60;
 if(!saved?.siege){g.battle.siege=newSiegeState(m);for(let i=0;i<c.initial;i++)spawnReinforcement(g,i,1,-112);g.battle.siege.spawned=c.initial;}
}
function spawnReinforcement(g,index,pressure,atZ=null){const m=MISSIONS[g.battle.id],roster=missionRoster(m,pressure),side=index%2?-1:1,x=side*(23+(index%3)*2.1),front=SIEGE_OUTPOSTS.find((p,i)=>!g.battle.siege.outposts[i]&&p.z<g.hero.pos.z+50),z=(atZ??(front?front.z-65:SIEGE_GATE_Z+8))+(index%2)*2;const type=roster[(index+g.battle.siege.spawned)%roster.length];let spawn={x,z};const blocked=p=>g.world.nav.some(n=>Math.abs(p.x-n.x)<n.hx+.5&&Math.abs(p.z-n.z)<n.hz+.5);if(blocked(spawn)){search:for(let radius=3;radius<=24;radius+=3)for(let a=0;a<8;a++){const p={x:x+Math.cos(a*Math.PI/4)*radius,z:z+Math.sin(a*Math.PI/4)*radius};if(!blocked(p)){spawn=p;break search;}}}g.spawnEnemy(type,{...spawn,y:g.world.height(spawn.x,spawn.z)},{waveTier:Math.max(1,Math.min(6,pressure))});}
function collapse(g,t,animate){
 if(t.phys?.collider){g.physics.remove(t.phys.collider);t.phys=null;}
 g.world.nav=g.world.nav.filter(n=>n!==t.nav);g.navGrid=null;
 for(const a of g.allies){a.path=[];a.think=0;}
 const r=seeded(t.part.charCodeAt(0)*173),debris=new T.Group(),material=mat(0x69676a,.97);for(let i=0;i<18;i++){const x=t.nav.x+(r()-.5)*(t.nav.hx-.8)*1.7,z=t.nav.z+(r()-.5)*(t.nav.hz-.8)*1.7,stone=mesh(new T.IcosahedronGeometry(.35+r()*.45,0),material,debris,x,t.pos.y+.07,z);stone.scale.set(1,.28,1);stone.rotation.y=r()*6.28;}g.world.dynamic.add(debris);if(!animate){t.model.visible=false;return;}
 g.fx.emit('dust',t.pos.clone().add(new T.Vector3(0,2,0)),65,{speed:7,life:1.6,size:1.2});g.fx.emit('fire',t.pos.clone().add(new T.Vector3(0,3,0)),35,{speed:4,life:1.2});g.audio.impact({element:'stone',position:t.pos,heavy:true,hero:true});g.view.shake=.8;
 // Sink and tilt the intact geometry, then leave a low debris bed in its footprint.
 const model=t.model,token=g.battle?.reportID;let steps=0;const sink=()=>{if(g.battle?.reportID!==token){model.visible=false;return;}steps++;model.position.y-=1.7;model.rotation.z+=t.part==='gate'?.008:.002;if(steps<15)g.combat.later(.06,sink);else model.visible=false;};g.combat.later(.03,sink);
}
export function hitFortification(g,t,amount,source,opt){
 if(!g.battle?.siege||t.dead||source?.team==='enemy'||g.mode!=='play'||!Number.isFinite(amount)||amount<=0)return;
 const st=g.battle.siege;if(t.part==='keep'&&st.hp.gate>0)return;
 let bonus=source?.unit==='crew'||source?.unit==='pike'?source.stats.siegeBonus||1:source?.unit==='engineer'?2.5:1;
 if(source===g.hero&&opt.heavy)bonus*=1.25;
 let armor=t.stats.armor*(1-(opt.pierce||source?.stats?.armorPierce||0));({amount,armor}=researchHit(g,t,source,opt,amount,armor));if(t.marked>0)bonus*=source===g.hero?1.2:1.15;if(source?.team==='ally'&&distance(source.pos,g.hero.pos)<g.heroStats().supportRadius)bonus*=1+g.heroStats().allyBonus;const damage=Math.min(t.hp,Math.max(1,Math.round(amount*bonus*100/(100+armor*2))));
 recordDamage(g.battle,t,source,g.hero,damage);t.hp=Math.max(0,t.hp-damage);st.hp[t.part]=t.hp;st.damage+=damage;st[source===g.hero?'heroDamage':'armyDamage']+=damage;g.combat.stats.hits++;
 if(distance(g.hero.pos,t.pos)<45){g.fx.damageText(t.pos.clone().add(new T.Vector3(0,2,0)),damage,'#edbe7f');g.fx.emit(opt.fire?'fire':'spark',t.pos.clone().add(new T.Vector3(0,1.3,0)),opt.heavy?18:7,{speed:2});if(!opt.silent)g.audio.impact({element:'stone',weapon:opt.weapon||source?.weapon,position:t.pos,heavy:!!opt.heavy,hero:source===g.hero});}
 if(source===g.hero&&!opt.secondary)triggerWeaponPower(g,t,opt);if(t.hp===0&&!t.dead){t.dead=true;st.destroyed++;collapse(g,t,true);g.toast(t.part==='gate'?'Gate breached! Push through and destroy the dread keep.':t.part==='keep'?'The keep is destroyed. The city is free.':SIEGE_NAMES[t.part]+' destroyed · its guns are silent.');g.checkpoint();if(t.part==='keep')g.combat.later(.9,()=>{if(g.battle?.siege?.hp.keep===0&&!g.hero.dead)g.victory();});}
}
export function tickSiege(g,dt){
 const b=g.battle,st=b.siege,m=MISSIONS[b.id],c=siegeConfig(m);
 // Dormant roadside garrisons activate before the leading soldier reaches them.
 const lead=Math.min(g.hero.pos.z,...g.allies.filter(a=>!a.dead).map(a=>a.pos.z));
 SIEGE_OUTPOSTS.forEach((p,i)=>{
  if(!st.activated[i]&&lead<p.z+135){st.activated[i]=true;const n=Math.min(c.limit-g.enemies.filter(e=>!e.dead).length,c.initial+i+2);for(let j=0;j<n;j++)spawnReinforcement(g,j,Math.max(1,st.pressure),p.z-7);st.spawned+=Math.max(0,n);}
  const flag=g.world.siegeCampFlags?.[i];if(flag&&!flag.userData.friendly&&st.outposts[i]){flag.userData.friendly=true;flag.traverse(o=>{if(o.isMesh&&o.material?.color&&o.geometry.type==='PlaneGeometry')o.material.color.setHex(0x247d91);});}
 });
 const campIndex=SIEGE_OUTPOSTS.findIndex((p,i)=>!st.outposts[i]&&distance(p,g.hero.pos)<13);
 if(campIndex>=0){const p=SIEGE_OUTPOSTS[campIndex],safe=!g.enemies.some(e=>!e.dead&&distance(e.pos,p)<35);st.capture=safe?Math.min(6,st.capture+dt):0;if(st.capture>=6){st.outposts[campIndex]=true;st.activated[campIndex]=true;st.capture=0;for(const a of [g.hero,...g.allies])if(!a.dead&&distance(a.pos,p)<50)a.hp=Math.min(a.stats.hp,a.hp+a.stats.hp*.35);g.fx.ward(g.hero.pos,2,1);g.toast(p.name+' secured · nearby army healed 35% · recruit here.');g.audio.play('rally');g.checkpoint();}}else st.capture=0;
 st.frontier=Math.min(st.frontier??g.hero.pos.z,lead);const pressure=Math.max(st.pressure,siegePressure(m,b.time,st.hp.gate===0,st.frontier));
 if(pressure>st.pressure){st.pressure=pressure;b.wave=pressure;g.toast('Enemy reinforcements intensify · pressure '+pressure+'/6');g.audio.play('rally',.4);}
 st.nextSpawn-=dt;
 if(st.nextSpawn<=0){const alive=g.enemies.filter(e=>!e.dead).length,n=Math.min(c.limit-alive,siegePacket(m,pressure));for(let i=0;i<n;i++)spawnReinforcement(g,st.packets*5+i,pressure);st.spawned+=Math.max(0,n);st.packets++;st.nextSpawn=siegeInterval(m,pressure)*(b.camp?1.2:1);}
 for(const t of g.siegeTargets){if(t.marked>0)t.marked=Math.max(0,t.marked-dt);if(t.dead||!['west','east'].includes(t.part))continue;t.cooldown-=dt;if(t.cooldown>0)continue;const targets=[g.hero,...g.allies].filter(a=>!a.dead&&distance(a.pos,t.pos)<48).sort((a,b)=>distance(a.pos,t.pos)-distance(b.pos,t.pos)),target=targets[0];if(!target)continue;t.cooldown=c.final?3.4:5;const origin=t.pos.clone().add(new T.Vector3(0,8.8,1));g.fx.emit('fire',origin,12,{speed:2});g.audio.play('bolt',.4,{position:origin});g.combat.shoot(t,target,{damage:c.damage,type:c.final?'grave':'bolt',speed:24,origin,rank:3});}
 // Destroying the core is the only victory condition, including after save/resume.
 if(st.hp.keep===0&&!g.hero.dead)g.victory();
}
