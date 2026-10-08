import * as T from 'three';
import {form,cord,leaf,bead,add} from './model-craft.js';
import {heroSurface} from './hero-surfaces.js';
import {CREATURES} from './enemy-creatures.js';
export function creatureWeapon(id,type){
 if(!CREATURES[id]||type==='bow')return null;
 const g=new T.Group(),iron=heroSurface('steel',0x62665d),dark=heroSurface('steel',0x303833),wood=heroSurface('leather',0x514333),edge=heroSurface('steel',0x948268),bone=heroSurface('leather',0xc4b695);
 const ember=new T.MeshStandardMaterial({color:id==='bomber'?0xffac54:0x9ac3a9,emissive:id==='bomber'?0xc9400f:0x307552,emissiveIntensity:.9,roughness:.4});
 const rod=(pts,r,m,name)=>cord(g,pts,r,m,name);
 const wrap=(y,r=.033)=>form(g,[[y,r,r],[y+.026,r,r]],wood,{sides:12,name:'Bound weapon grip'});
 if(type==='sword'){
  form(g,[[-.22,.027,.027],[.02,.029,.029]],wood,{name:'Creature blade grip'});for(let j=0;j<7;j++)wrap(-.21+j*.029);
  const scout=id==='runner',blade=leaf(g,scout?[[-.028,0],[.035,0],[.044,.48],[.015,.64],[-.045,.36]]:[[-.045,0],[.047,0],[.088,.50],[.13,.75],[.036,.86],[-.019,.70],[-.043,.33]],iron,{depth:.021,bow:.004,name:scout?'Hooked scout knife':'Broad orc cleaver'});blade.position.set(0,.025,-.01);
  rod([[-.095,0,0],[0,.034,0],[.13,.075,0]],.019,edge,'Forged blade guard');if(!scout)for(let j=0;j<3;j++)rod([[-.02,.30+j*.1,.017],[.028,.32+j*.1,.017]],.003,dark,'Battle-worn blade incision');
 }else if(type==='spear'){
  rod([[0,-.65,0],[0,1.42,0]],.027,wood,'Orc banner spear shaft');for(let j=0;j<7;j++)wrap(-.19+j*.04,.034);
  const tip=leaf(g,[[-.035,0],[-.08,.16],[0,.48],[.08,.16],[.035,0]],iron,{depth:.025,bow:.007,name:'Leaf-shaped orc spearhead'});tip.position.set(0,1.37,-.012);
  form(g,[[1.27,.043,.043],[1.43,.043,.043]],edge,{sides:12,name:'Spearhead socket'});
 }else if(type==='hammer'){
  form(g,[[-.35,.036,.036],[.60,.045,.045],[1.08,.084,.080],[1.24,.04,.04]],wood,{sides:16,name:'Knotted ogre war club'});
  for(let j=0;j<9;j++)wrap(-.33+j*.035,.043);
  for(const y of [.77,1.06])form(g,[[y,.096,.094],[y+.055,.098,.096]],iron,{sides:12,name:'Iron club binding'});
  for(let j=0;j<5;j++){const a=j*Math.PI*2/5;rod([[Math.sin(a)*.078,.94,Math.cos(a)*.078],[Math.sin(a)*.15,.98,Math.cos(a)*.15]],.012,iron,'Club iron tooth');}
 }else if(type==='staff'){
  rod([[0,-.4,0],[.014,.4,.02],[-.025,1.12,.0],[.03,1.49,-.01]],.027,wood,'Gnarled shaman staff');for(let j=0;j<7;j++)wrap(-.18+j*.035,.033);
  if(id==='bomber'){form(g,[[1.1,.047,.047],[1.32,.075,.075],[1.43,.054,.054]],wood,{sides:10,name:'Sapper firebrand'});for(let j=0;j<3;j++){const flame=add(g,new T.OctahedronGeometry(.055,1),ember,'Burning torch ember');flame.position.set((j-1)*.026,1.48+j*.021,0);flame.scale.y=2;}}
  else{for(const s of [-1,1])rod([[0,1.11,0],[s*.14,1.40,0],[s*.12,1.69,.015]],.018,bone,'Forked ritual staff');const stone=add(g,new T.IcosahedronGeometry(.09,1),ember,'Shaman focus stone');stone.position.set(0,1.45,0);stone.scale.y=1.3;for(const s of [-1,1]){rod([[s*.12,1.56,0],[s*.18,1.28,0]],.004,wood,'Fetish binding');bead(g,[s*.18,1.27,0],.025,bone,'Carved staff talisman');}}
 }else if(type==='crossbow'){
  form(g,[[-.3,.065,.065],[.18,.08,.08]],wood,{sides:10,name:'Bombard handstock'});
  form(g,[[.12,.12,.12],[.65,.14,.14],[.72,.17,.17]],iron,{sides:20,name:'Hand bombard tube'});
  form(g,[[.72,.17,.17],[.74,.17,.17]],edge,{sides:20,name:'Bombard muzzle rim'});const bore=add(g,new T.CircleGeometry(.13,24),dark,'Bombard bore');bore.rotation.x=-Math.PI/2;bore.position.y=.745;
 }
 g.userData.type=type;g.userData.creatureWeapon=id;return g;
}
