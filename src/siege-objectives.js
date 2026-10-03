import * as T from 'three';
import {ROUTES,routeState} from './frontline-rules.js';
import {box,cyl,beam,mesh} from './art.js';
import {material} from './materials.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function buildSiegeObjectives(w){
 w.routeFlags={};
 for(const p of ROUTES){
  const y=w.height(p.x,p.z),g=new T.Group();g.position.set(p.x,y,p.z);w.static.add(g);
  const cloth=material('cloth',p.id==='infirmary'?0x9b8864:p.id==='signal'?0x6d4056:0x483d35,{side:T.DoubleSide});
  const flag=w.flag(p.x+4,y,p.z,1.35);w.routeFlags[p.id]=flag;
  flag.traverse(o=>{if(o.isMesh&&o.geometry.type==='PlaneGeometry'){o.material=o.material.clone();o.material.color.setHex(0x934d53);}});
  // Physical cover frames a broad walkable entrance facing the central road.
  for(const dz of [-6,6]){w.solid([9,1.2,.9],[p.x,y+.6,p.z+dz],w.materials.stone,'flank-cover');box(g,[9.2,.18,1.1],[0,1.28,dz],w.materials.cap);}
  if(p.id==='infirmary'){
   for(const dx of [-3,3])beam(g,[dx,0,-2],[dx,3.7,-2],.07,w.materials.wood);
   const canopy=mesh(new T.ConeGeometry(4.5,2,4,1,true),cloth,g,0,3.1,-2);canopy.rotation.y=Math.PI/4;
   for(const dx of [-2,2]){box(g,[1.1,.2,2.7],[dx,.5,-2],w.materials.wood);box(g,[.98,.1,2.5],[dx,.65,-2],cloth);}
  }else if(p.id==='signal'){
   beam(g,[-2,0,-2],[-2,4,-2],.12,w.materials.wood);beam(g,[2,0,-2],[2,4,-2],.12,w.materials.wood);beam(g,[-2,4,-2],[2,4,-2],.14,w.materials.wood);
   const horn=mesh(new T.ConeGeometry(.75,2.6,16,1,true),w.materials.gold,g,0,3.2,-2);horn.rotation.z=Math.PI/2;
   for(const dx of [-3,3]){cyl(g,.55,.65,1.1,[dx,.55,2],w.materials.wood,12);}
  }else for(const dx of [-3,3])for(let i=0;i<5;i++)mesh(new T.SphereGeometry(.2,8,6),w.materials.iron,g,dx+(i%2)*.38,.2+Math.floor(i/4)*.34,2+Math.floor(i/2)*.38);
  // Stone markers and lanterns make the turn into each flank legible from the road.
  for(let i=0;i<7;i++){const x=Math.sign(p.x)*(9+i*4.3),z=p.z+13-i*.85,yy=w.height(x,z);cyl(w.static,.24,.32,.9,[x,yy+.45,z],w.materials.cap,8);}
  w.torch(p.x-4,y,p.z+4,true);
 }
 w.root.userData.tacticalRoutes=ROUTES.map(p=>({id:p.id,x:p.x,z:p.z}));
}
export function tickSiegeObjectives(g,dt){
 const b=g.battle,st=b?.siege;if(!st)return;const r=st.routes??=routeState();
 const battery=ROUTES[0];
 if(!r.activated&&g.hero.pos.z<battery.z+100&&g.enemies.filter(e=>!e.dead).length<58){
  r.activated=true;g.spawnEnemy('mortar',{x:battery.x,z:battery.z},{waveTier:Math.min(6,st.pressure),encounterRole:'battery'});
  g.toast('Ash battery ahead · follow the west markers to silence its bombardment.');g.checkpoint();
 }
 if(r.activated&&!r.artillery&&!g.enemies.some(e=>e.encounterRole==='battery'&&!e.dead)){r.artillery=true;g.toast('Ash battery destroyed · this road is clear of bombardment.');g.checkpoint();}
 for(const p of ROUTES){const flag=g.world.routeFlags?.[p.id];if(flag&&r[p.id]&&!flag.userData.friendly){flag.userData.friendly=true;flag.traverse(o=>{if(o.isMesh&&o.geometry.type==='PlaneGeometry')o.material.color.setHex(0x3d92a0);});}}
 const p=ROUTES.find(p=>p.kind==='capture'&&!r[p.id]&&distance(g.hero.pos,p)<10);
 if(p){const clear=!g.enemies.some(e=>!e.dead&&distance(e.pos,p)<26);if(r.capturing!==p.id){r.capture=0;r.capturing=p.id;}r.capture=clear?Math.min(6,r.capture+dt):0;
  if(r.capture>=6){r[p.id]=true;r.capture=0;r.capturing=null;
   if(p.id==='infirmary')for(const a of [g.hero,...g.allies])if(!a.dead&&distance(a.pos,p)<50)a.hp=Math.min(a.stats.hp,a.hp+a.stats.hp*.5);
   g.fx.ward(g.hero.pos,3,1);g.audio.play('rally');g.toast(p.name+' secured · '+p.benefit);g.checkpoint();}
 }else{r.capturing=null;r.capture=0;}
}
