import * as T from 'three';
import {box,cyl,mesh,beam,sunBadge} from './art.js';
import {flameVolume} from './environment-design.js';
import {DEFENSES,defenseStats} from './data.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),UP=new T.Vector3(0,1,0);
export function fortificationModel(kind,rank,m){
 const g=new T.Group(),aim=new T.Group();g.name=kind+'-rank-'+rank;g.add(aim);g.userData.aim=aim;
 const glow=new T.MeshStandardMaterial({color:kind==='frost'?0xb2e9f2:kind==='storm'?0xacc8ff:0xffc67c,emissive:kind==='frost'?0x3d819c:kind==='storm'?0x627dbc:0xd9621d,emissiveIntensity:1.4,roughness:.3});
 cyl(g,1.65,1.85,.4,[0,.2,0],rank>=3?m.stone:m.wood,8);
 if(kind==='cannon'){
  box(aim,[1.3,.35,2.3],[0,.8,0],m.wood);for(const x of [-.9,.9]){const wheel=cyl(aim,.68,.68,.18,[x,.8,.15],m.wood,20);wheel.rotation.z=Math.PI/2;const rim=mesh(new T.TorusGeometry(.63,.055,6,20),m.iron,aim,x,.8,.15);rim.rotation.y=Math.PI/2;for(let i=0;i<6;i++){const a=i*Math.PI/3;beam(aim,[x,.8,.15],[x,.8+Math.sin(a)*.59,.15+Math.cos(a)*.59],.045,m.iron);}}
  const barrel=new T.Group();barrel.position.set(0,1.75,-.35);barrel.rotation.x=Math.PI/2-.08;aim.add(barrel);cyl(barrel,.34,.46,2.55,[0,0,0],m.iron,24);cyl(barrel,.26,.26,.02,[0,1.29,0],m.dark,24);for(const y of [-1,-.3,.6,1.22])cyl(barrel,.37,.37,.10,[0,y,0],rank>=6?m.gold:m.iron,24);
  for(let i=0;i<3;i++)mesh(new T.SphereGeometry(.23,12,8),m.iron,g,1.15,.65,1-i*.5);
 }else if(kind==='mortar'){
  for(const x of [-.95,.95]){box(g,[.22,2.2,.28],[x,1.5,0],m.wood);beam(g,[x,.5,-1.4],[x,2.55,0],.09,m.wood);beam(g,[x,.5,1.4],[x,2.55,0],.09,m.wood);}
  const arm=new T.Group();arm.position.y=2.5;arm.rotation.x=-.38;aim.add(arm);g.userData.throwArm=arm;box(arm,[.22,.23,3.4],[0,0,-.5],m.wood);box(arm,[1,.8,.65],[0,-.25,1.1],m.stone);cyl(arm,.48,.2,.28,[0,.18,-2.1],m.iron,12);mesh(new T.IcosahedronGeometry(.37,1),m.stone,arm,0,.47,-2.1);for(let i=0;i<4;i++)mesh(new T.IcosahedronGeometry(.28,1),m.stone,g,1.35,.62,1-i*.5);
 }else if(kind==='frost'){
  cyl(g,.55,.9,2,[0,1.4,0],m.stone,6);const gem=mesh(new T.OctahedronGeometry(.75,0),glow,aim,0,3.25,0);gem.scale.set(.72,1.6,.72);g.userData.crystal=gem;for(let i=0;i<4;i++){const a=i*Math.PI/2;beam(g,[Math.sin(a)*.8,1,Math.cos(a)*.8],[Math.sin(a)*.5,3,Math.cos(a)*.5],.065,m.gold);}
 }else if(kind==='storm'){
  cyl(g,.22,.38,3.6,[0,2.2,0],m.iron,12);for(let i=0;i<4;i++){const ring=mesh(new T.TorusGeometry(.65-i*.09,.095,8,24),m.gold,aim,0,1.7+i*.5,0);ring.rotation.x=Math.PI/2;}
  for(const x of [-.32,.32])beam(aim,[0,3.3,0],[x,4.1,0],.06,m.iron);mesh(new T.SphereGeometry(.19,12,8),glow,aim,0,3.85,0);
 }else if(kind==='sanctuary'){
  cyl(g,.45,.8,1.5,[0,1.1,0],m.stone,8);cyl(g,.95,.45,.48,[0,2.05,0],m.gold,16);const fire=flameVolume(.8);fire.position.y=2.25;g.add(fire);g.userData.fire=fire;for(const x of [-1.2,1.2]){cyl(g,.10,.16,3.6,[x,2.1,.55],m.gold,10);beam(g,[x,3.9,.55],[0,4.35,.55],.08,m.gold);}const crest=sunBadge(g,.45,m.gold);crest.position.set(0,3.85,.55);
 }
 // Accumulating construction provides a distinct geometry change at every rank.
 if(rank>=2)for(const z of [-1.3,1.3])box(g,[3,.13,.16],[0,.43,z],m.iron);
 if(rank>=3)cyl(g,1.8,1.9,.25,[0,.55,0],m.stone,8);
 if(rank>=4)for(const x of [-1.3,1.3])for(const z of [-1.3,1.3])cyl(g,.16,.30,1.1,[x,.55,z],m.stone,6);
 if(rank>=5)for(const x of [-1,1])box(g,[.18,.85,1.3],[x,1.1,.15],m.iron);
 if(rank>=6){const trim=mesh(new T.TorusGeometry(1.55,.06,6,24),m.gold,g,0,.72,0);trim.rotation.x=Math.PI/2;}
 if(rank>=7)for(const x of [-1.6,1.6])box(g,[.25,.6,2.7],[x,.9,0],m.stone);
 if(rank>=8)for(const x of [-1.4,1.4]){beam(g,[x,.4,1.25],[x,3,1.25],.045,m.gold);box(g,[.52,.9,.045],[x+.2,2.4,1.25],m.teal);}
 if(rank>=9){const badge=sunBadge(g,.38,m.gold);badge.position.set(0,.95,-1.7);badge.rotation.y=Math.PI;}
 if(rank>=10)for(const x of [-1.55,1.55]){cyl(g,.07,.22,1.3,[x,1.6,-1.25],m.gold,8);mesh(new T.OctahedronGeometry(.16),glow,g,x,2.4,-1.25);}
 g.userData.muzzle=new T.Vector3(0,['frost','storm','sanctuary'].includes(kind)?4:2,-2.2);return g;
}
export function tickFortification(g,t,dt,alive){
 t.cooldown=(t.cooldown||0)-dt;if(t.cooldown>0)return;
 const st=defenseStats(t.id,t.level),d=DEFENSES[t.id],owner={team:'ally',pos:t.model.position,stats:{},defense:t.id,rank:t.level},pos=t.model.position;
 if(t.id==='sanctuary'){
  const wounded=[g.hero,...g.allies].filter(a=>!a.dead&&a.hp<a.stats.hp&&distance(a.pos,pos)<st.range).sort((a,b)=>a.hp/a.stats.hp-b.hp/b.stats.hp).slice(0,4);
  if(!wounded.length)return;for(const a of wounded){a.hp=Math.min(a.stats.hp,a.hp+st.damage);a.protect=Math.max(a.protect||0,2);g.fx.ward(a.pos,.9,1);}
  g.fx.ward(pos,st.range,1);g.audio.play('sanctuary',.35);t.cooldown=d.interval;return;
 }
 const candidates=alive.filter(e=>distance(e.pos,pos)<st.range&&(t.id!=='mortar'||distance(e.pos,pos)>9));
 candidates.sort((a,b)=>t.id==='cannon'?b.stats.armor-a.stats.armor:distance(a.pos,pos)-distance(b.pos,pos));const target=candidates[0];if(!target)return;
 t.cooldown=d.interval/(g.battle.overdrive>0?1.3:1);t.recoil=.35;const direction=target.pos.clone().sub(pos).setY(0).normalize();t.model.userData.aim.rotation.y=Math.atan2(direction.x,direction.z)+Math.PI;
 const origin=pos.clone().addScaledVector(UP,['storm','frost'].includes(t.id)?4.65:2.5).addScaledVector(direction,['cannon','mortar'].includes(t.id)?2.25:0);
 if(t.id==='storm'){
  const hit=new Set();let from=origin,to=target;for(let i=0;i<3&&to;i++){hit.add(to);const end=to.pos.clone().addScaledVector(UP,1.1);let a=from;for(let j=1;j<=6;j++){const p=from.clone().lerp(end,j/6);if(j<6)p.add(new T.Vector3(Math.sin(j*5+g.time)*.4,.2*Math.sin(j),0));g.fx.slash(a,p,0xafd7ff);a=p;}g.combat.hit(to,st.damage*[1,.65,.4][i],owner,{secondary:true});g.fx.emit('arcane',end,8,{speed:2});from=end;to=alive.filter(e=>!e.dead&&!hit.has(e)&&distance(e.pos,from)<7).sort((a,b)=>distance(a.pos,from)-distance(b.pos,from))[0];}g.audio.play('storm',.4);
 }else{
  const type=t.id==='frost'?'frost':t.id==='mortar'?'stone':'shell';g.audio.play(type,.4);t.crew?.attack(t.id==='mortar'?'hammer':'crossbow',true,0,1.2);
  g.combat.shoot(owner,target,{damage:t.id==='mortar'?0:st.damage,type,speed:t.id==='mortar'?20:t.id==='frost'?25:32,origin,rank:t.level,gravity:t.id==='mortar'?14:0,blast:t.id==='mortar'?{radius:4,damage:st.damage}:t.id==='cannon'?{radius:3,damage:st.damage*.45}:null,slow:t.id==='frost'?3:0,pierce:t.id==='cannon'?.5:0});
  if(t.id==='cannon')g.fx.emit('smoke',origin,14,{speed:1.8,life:.7});
 }
}
export function updateFortification(t,time){const u=t.model.userData;if(u.throwArm)u.throwArm.rotation.x=-.38+Math.sin(t.recoil/.35*Math.PI)*1.25;if(u.crystal)u.crystal.rotation.y=time*.25;if(u.fire?.userData.flameMaterial)u.fire.userData.flameMaterial.uniforms.time.value=time;}
