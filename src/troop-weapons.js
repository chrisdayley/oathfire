import * as T from 'three';
import {form,cord,leaf,bead,add} from './model-craft.js';
import {heroSurface} from './hero-surfaces.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function specialistWeapon(id,rank){
 if(!['breaker','giant','marksman','crew','engineer'].includes(id))return null;
 const g=new T.Group(),metal=heroSurface('steel',id==='giant'?0x687067:0x65717b),edge=heroSurface('steel',rank>=7?0xb39965:0x8d938d),wood=heroSurface('leather',0x493a2c),dark=heroSurface('steel',0x292e30);
 const block=(size,pos,m,name)=>{const o=add(g,new RoundedBoxGeometry(...size,3,.012),m,name);o.position.set(...pos);return o;};
 const rod=(a,b,r,m,name)=>cord(g,[a,b],r,m,name);
 if(id==='breaker'||id==='giant'||id==='engineer'){
  const titan=id==='giant';form(g,[[-.40,.03,.03],[.85,.034,.034]],wood,{sides:12,name:'Wrapped hardwood haft'});
  for(let i=0;i<13;i++)form(g,[[-.35+i*.035,.039,.039],[-.339+i*.035,.039,.039]],i%3?wood:edge,{sides:12,name:'Bound grip'});
  if(titan){block([.49,.39,.29],[0,.86,0],metal,'Ancient carved oathstone');for(const s of [-1,1])block([.052,.43,.33],[s*.19,.86,0],edge,'Stone retaining iron');
   for(const s of [-1,1])rod([[s*.09,.99,.151],[s*.04,.9,.153],[s*.09,.78,.151]][0],[s*.04,.9,.153],.006,edge,'Carved rune');
   for(let i=0;i<4;i++){const o=add(g,new T.TorusGeometry(.022,.006,5,10),dark,'Maul binding chain');o.position.set(-.11+i*.071,.94,.169);o.rotation.y=i%2?.7:0;}
  }else{
   block([.39,.20,.21],[0,.87,0],metal,'Forged breaching hammer');block([.07,.25,.25],[-.215,.87,0],edge,'Hardened striking face');
   const pick=leaf(g,[[0,.075],[.13,.05],[.30,-.06],[.14,-.03],[0,-.055]],metal,{depth:.065,name:'Armor piercing beak'});pick.position.set(.17,.87,-.032);
   block([.068,.25,.24],[0,.87,0],dark,'Hammer eye');for(const s of [-1,1])for(const y of [.82,.93])bead(g,[s*.115,y,.113],.011,edge,'Hammer face rivet');
   for(let i=0;i<rank;i++)rod([-.15+i*.03,.90,.114],[-.14+i*.03,.94,.114],.0025,edge,'Earned forge engraving');
  }
  block([.075,.08,.075],[0,.69,0],edge,'Reinforced haft collar');
 }else{
  block([.09,.70,.11],[0,.16,0],wood,'Carved crossbow stock');block([.15,.24,.16],[0,-.14,0],wood,'Shouldered crossbow butt');
  for(const s of [-1,1])rod([s*.015,.48,0],[s*.32,.43,0],.025,metal,'Steel prod');
  cord(g,[[-.32,.43,0],[0,.12,.03],[.32,.43,0]],.0035,edge,'Tensioned bowstring');rod([0,.11,.074],[0,.68,.074],.004,wood,'Loaded quarrel');
  block([.035,.038,.07],[0,.7,.075],metal,'Quarrel head');for(const y of [.05,.25,.40])block([.116,.025,.126],[0,y,0],edge,'Stock binding');
  if(id==='marksman'){rod([.082,.10,.10],[.082,.49,.10],.024,dark,'Range sight barrel');for(const y of [.12,.45]){const o=form(g,[[y,.035,.035],[y+.028,.035,.035]],edge,{sides:16,name:'Sight lens housing'});o.position.set(.082,0,.10);}}
  if(id==='crew')for(const s of [-1,1])rod([s*.07,.25,0],[s*.23,-.17,.08],.016,metal,'Siege weapon crank');
 }
 if(id==='engineer')g.scale.set(.65,.78,.65);
 g.userData.type=['breaker','giant','engineer'].includes(id)?'hammer':'crossbow';g.userData.specialistWeapon=id;return g;
}
