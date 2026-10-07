import * as T from 'three';
import {box,cyl,mesh,sunBadge} from './art.js';
import {material} from './materials.js';
import {cutStone} from './building-materials.js';
import {Character} from './characters.js';
import {seeded} from './data.js';
import {CASTLE_STYLES,castleGrowth,ensureCastle} from './castle-customization.js';
export function buildCastleAppearance(w,s){
 if(!s)return;const a=ensureCastle(s),growth=castleGrowth(s),style=CASTLE_STYLES[a.style],active=id=>a.enabled.includes(id),g=w.static,rand=seeded(4819),stone=cutStone(style.stone),gold=material('steel',0xb9a06c,{metalness:.72,roughness:.4}),cloth=material('cloth',style.color,{side:T.DoubleSide});
 w.root.userData.castleAppearance={style:a.style,enabled:[...a.enabled],growth};w.cosmeticPeople=[];w.cosmeticMagic=[];
 // Trees remain inside already blocked decorative garden islands. Growth has no collision effect.
 for(const [x,z]of [[-11,-5],[11,-5],...(active('grove')?[[-11,14],[11,14]]:[])])w.tree.call({...w,physics:{addBox(){}},nav:[]},x,.55,z,(3.6+(active('grove')?1:0))*growth.treeScale,false,rand);
 if(active('rugs'))for(const x of [-2.4,2.4]){
  const rug=mesh(new T.PlaneGeometry(2,9,1,1),cloth,g,x,.061,12);rug.rotation.x=-Math.PI/2;rug.castShadow=false;
  const edge=material('cloth',0xc6ac71);for(const dx of [-.92,.92]){const line=mesh(new T.PlaneGeometry(.07,8.85),edge,g,x+dx,.064,12);line.rotation.x=-Math.PI/2;line.castShadow=false;}
  for(const z of [8.1,15.9]){const line=mesh(new T.PlaneGeometry(1.85,.09),edge,g,x,.066,z);line.rotation.x=-Math.PI/2;line.castShadow=false;}
  for(const z of [10,13.7]){const badge=sunBadge(g,.58,edge);badge.position.set(x,.069,z);badge.rotation.x=-Math.PI/2;}
 }
 // A distant architectural extension increases silhouette grandeur without changing the walkable fortress.
 if(a.style!=='hearth')for(const x of [-18,18]){
  const h=a.style==='moon'?24:20,z=43;
  cyl(g,2.4,3.2,h,[x,h/2,z],stone,16);cyl(g,2.9,2.9,.5,[x,h-.7,z],gold,16);
  for(let i=0;i<12;i++){const t=i*Math.PI/6;cyl(g,.16,.2,2.3,[x+Math.cos(t)*2.55,h+.4,z+Math.sin(t)*2.55],stone,6);}
  const roof=mesh(new T.ConeGeometry(3.25,a.style==='moon'?8:5,16),material('steel',style.color,{roughness:.55}),g,x,h+2,z);
  for(let j=0;j<4;j++){const zf=z-2.48;box(g,[.65,1.8,.1],[x,5+j*3.3,zf],w.materials.dark);box(g,[.8,.12,.2],[x,4+j*3.3,zf],gold);}
  const badge=sunBadge(g,1.35,gold);badge.position.set(x,h-5,z-2.65);
 }
 if(active('walls'))for(const x of [-23,-13,13,23]){
  cyl(g,.32,.5,4,[x,9,-19],stone,10);cyl(g,.12,.24,2,[x,12,-19],gold,8);mesh(new T.OctahedronGeometry(.38),gold,g,x,13.25,-19);
  const banner=mesh(new T.PlaneGeometry(1.7,4),cloth,g,x,8.3,-19.7);const badge=sunBadge(g,.58,gold);badge.position.set(x,8.5,-19.78);badge.rotation.y=Math.PI;
 }
 if(active('festival')){
  for(const x of [-18,18])for(let i=0;i<3+growth.stage;i++){
   const c=new Character(i%2?'Rogue':'Barbarian',{weapon:null,height:1.7+(i%3)*.07,color:[0x745247,style.color,0x8e7b52][i%3]});if(c.held)c.held.visible=false;if(c.heldShield)c.heldShield.visible=false;c.root.position.set(x+(i%2)*1.3,0,3+i*2.5);c.root.rotation.y=x<0?Math.PI/2:-Math.PI/2;w.dynamic.add(c.root);w.cosmeticPeople.push(c);
  }
  for(const x of [-16,16])for(let i=0;i<7;i++){const flag=mesh(new T.ConeGeometry(.35,.8,3),i%2?cloth:material('cloth',0xc19254),g,x,4.4-Math.sin(i/6*Math.PI)*.45,2+i*1.8);flag.rotation.z=Math.PI;}
 }
 if(active('magic')){
  const m=new T.MeshStandardMaterial({color:0x87d9ed,emissive:0x42a6d0,emissiveIntensity:2,transparent:true,opacity:.5,depthWrite:false});
  for(const x of [-8,8]){const ring=mesh(new T.TorusGeometry(1.3,.022,6,48),m,w.dynamic,x,4.3,6);ring.rotation.x=Math.PI/2;w.cosmeticMagic.push(ring);for(let i=0;i<9;i++){const orb=mesh(new T.OctahedronGeometry(.06),m,w.dynamic,x+Math.cos(i)*1.9,2.5+i*.25,6+Math.sin(i)*1.9);orb.userData.baseY=orb.position.y;w.cosmeticMagic.push(orb);}}
 }
}
export function updateCastleAppearance(w,dt,time){for(const c of w.cosmeticPeople||[])c.update(dt,{speed:0,grounded:true});for(const o of w.cosmeticMagic||[]){o.rotation.z+=dt*.3;if(o.userData.baseY!==undefined)o.position.y=o.userData.baseY+Math.sin(time*1.3+o.position.x)*.22;}}
