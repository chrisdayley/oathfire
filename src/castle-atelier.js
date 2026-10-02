import {craftedRoof} from './architecture.js';
import * as T from 'three';
import {box,cyl,mesh,beam,sunBadge} from './art.js';
import {ART,material,worldMaterial} from './materials.js';
import {textile} from './atelier.js';
import {windowArch,detailedTree} from './environment-design.js';
import {seeded} from './data.js';

export function dressCastle(w){
 const g=w.static,m=w.materials,r=seeded(2409),slate=worldMaterial('stone',0x3e5159,1.1,{roughness:.92}),plaster=material('cloth',0xc5b69b,{normalScale:new T.Vector2(.08,.08),roughness:1}),cloth=material('cloth',0xffffff,{map:textile('banner','#15444a'),side:T.DoubleSide,roughness:1}),cream=material('cloth',0xc6b999,{side:T.DoubleSide,roughness:1});
 function cornice(x,y,z,rad){for(const [dy,rr,h]of [[-.17,rad+.12,.22],[0,rad+.28,.15],[.18,rad+.15,.13]])cyl(g,rr,rr+.025,h,[x,y+dy,z],m.cap,24);}
 function spire(x,z,base,rad,h){cyl(g,rad,rad+.15,h,[x,base+h/2,z],m.stone,24);for(const y of [base+.4,base+h*.54,base+h-.25])cornice(x,y,z,rad);const roof=cyl(g,0,rad+1,h*.43,[x,base+h+h*.215,z],slate,24);for(let j=0;j<7;j++){const yy=base+h+j*h*.43/7,rr=(rad+1)*(1-j/7);cyl(g,rr,rr+.08,.08,[x,yy,z],m.iron,24);}cyl(g,.06,.17,1.3,[x,base+h*1.43+.45,z],m.gold,8);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])windowArch(g,x+Math.sin(a)*(rad+.02),base+h*.6,z+Math.cos(a)*(rad+.02),.50,1.7,m,a);w.flag(x,base+h*1.43+.95,z,.54);}
 function banner(x,y,z,width,height,angle=0){const p=mesh(new T.PlaneGeometry(width,height,8,14),cloth,w.dynamic,x,y,z);p.rotation.y=angle;const a=p.geometry.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i);a.setZ(i,Math.sin(xx*8)*.035);if(yy<-height*.43)a.setY(i,yy+(Math.abs(xx)/width)*.6);}p.userData.base=new Float32Array(a.array);w.flags.push(p);beam(g,[x-width*.57,y+height*.51,z],[x+width*.57,y+height*.51,z],.055,m.gold);}
 // Gatehouse: twin round turrets and a crenellated gallery over the existing arch.
 for(const side of [-1,1]){const x=side*7.4;spire(x,-17,7.8,1.55,5.7);w.physics.addBox(x,10.6,-17,2.9,5.7,2.9,'gate-turret');banner(side*6.4,5.0,-14.26,1.45,4.6);banner(side*6.4,5.0,-19.76,1.45,4.6,Math.PI);for(const y of [1.1,3,6.3,8.3])box(g,[4.3,.17,5.3],[side*6.4,y,-17],m.cap);}
 box(g,[10.9,.35,5.6],[0,8.5,-17],m.cap);for(const z of [-14.28,-19.72]){box(g,[10.5,1.05,.45],[0,9.13,z],m.stone);for(let i=0;i<11;i++)box(g,[.48,.65,.52],[-5+i,9.95,z],m.cap);for(let i=-4;i<=4;i++){box(g,[.30,.72,.65],[i,8.09,z],m.cap);box(g,[.45,.17,.85],[i,8.39,z],m.cap);}}
 const sigil=sunBadge(g,.55,m.gold);sigil.position.set(0,7.40,-14.10);const back=sunBadge(g,.55,m.gold);back.position.set(0,7.4,-19.86);back.rotation.y=Math.PI;
 // Portcullis teeth hang above head height; the playable passage stays open.
 for(let i=-6;i<=6;i++){beam(g,[i*.49,6.7,-15.3],[i*.49,5.98+Math.abs(i)*.018,-15.3],.027,m.iron,6);}beam(g,[-3.5,6.33,-15.3],[3.5,6.33,-15.3],.06,m.iron);
 // A second ring of spires and stone balconies changes the whole skyline.
 for(const x of [-33,33])for(const z of [-17,34]){spire(x,z,6.6,2.0,5.0);w.physics.addBox(x,9,z,3.8,5,3.8,'turret');}
 for(const x of [-9.9,9.9]){spire(x,27,10.7,2.0,6.0);w.physics.addBox(x,13.7,27,3.8,6,3.8,'keep-turret');banner(x>0?7:-7,6.0,17.95,1.9,4.8,Math.PI);}
 for(const y of [3.2,8.8,10.15])box(g,[23.6,.22,1.9],[0,y,18.9],m.cap);
 // High windows, projecting balconies and sandstone tracery on the great hall.
 for(const x of [-6.8,6.8]){const wm={...m,dark:material('cloth',0x292b21,{emissive:0x9b5c21,emissiveIntensity:.42})};windowArch(g,x,4.6,17.84,1.2,3.0,wm,Math.PI);box(g,[3.4,.24,1.25],[x,4.18,17.5],m.cap);for(let i=-3;i<=3;i++)box(g,[.11,.69,.13],[x+i*.40,4.59,16.97],m.cap);box(g,[3.6,.16,.26],[x,4.96,16.98],m.cap);}
 for(const side of [-1,1])for(const z of [2,10,20]){const x=side*33.15;box(g,[.65,4.4,1.1],[x,2.2,z],m.cap);box(g,[.95,.23,1.45],[x,4.5,z],m.cap);banner(x-side*.48,3.2,z,1.2,2.8,side>0?-Math.PI/2:Math.PI/2);}
 // Half timber upper stories and slate gables over existing building colliders.
 for(const [x,z,width]of [[-24,12,10.8],[25,13,9.8],[-25,25,7.8],[25,26,7.8]]){
  box(g,[width,2.8,5.8],[x,5.0,z],plaster);w.physics.addBox(x,5,z,width,2.8,5.8,'upper-storey');box(g,[width+.25,.21,6.0],[x,6.4,z],m.wood);
  craftedRoof(g,m,{x,y:6.55,z,width:width+.85,depth:6.7,rise:3.2,dormers:2,tint:x<0?0x354960:0x74523e});
  for(const side of [-1,1]){const zz=z+side*2.94;for(let i=-2;i<=2;i++){box(g,[.15,2.8,.16],[x+i*width*.21,5,zz],m.wood);if(i<2)beam(g,[x+i*width*.21,3.7,zz],[x+(i+1)*width*.21,6.2,zz],.06,m.wood);}for(const dx of [-width*.28,width*.28]){windowArch(g,x+dx,4.6,zz+side*.06,.8,1.2,m,side<0?Math.PI:0);for(const sx of [-.60,.60])box(g,[.26,1.05,.11],[x+dx+sx,5.15,zz+side*.08],m.wood);}box(g,[width,.16,.18],[x,3.74,zz],m.wood);}
  box(g,[.95,3.8,.8],[x+width*.31,7.2,z+1],m.stone);box(g,[1.18,.20,1.03],[x+width*.31,9.1,z+1],m.cap);
 }
 // Draped market awnings replace flat planes; stalls stay at the courtyard edge.
 for(const [x,z]of [[-21.5,3.3],[22,3.8],[-22,19],[23,20]]){
  const awning=mesh(new T.PlaneGeometry(6.8,3.8,12,8),cream,g,x,3.1,z);awning.rotation.x=-Math.PI/2;const a=awning.geometry.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,-Math.cos(a.getX(i)*Math.PI/6.8)*.27+(a.getY(i)+1.9)*.12);awning.geometry.computeVertexNormals();
  for(const dx of [-3.2,3.2]){w.solid([.13,3.5,.13],[x+dx,1.75,z-1.8],m.wood,'stall-post');beam(g,[x+dx,2.1,z-1.8],[x+dx,3.2,z-.8],.06,m.wood);}
  for(let i=0;i<14;i++){const val=box(g,[.44,.28,.045],[x-3.12+i*.48,3.02,z-1.9],i%2?cream:m.teal);}
  w.solid([3.4,.88,.80],[x,.44,z+.35],m.wood,'market-counter');for(let i=0;i<8;i++){const sack=cyl(g,.19,.23,.34,[x-1.2+i*.34,1.05,z+.34],i%3===0?m.teal:m.wood,8);}
 }
 // Small planted islands give the square depth without blocking the road or vendors.
 for(const [x,z]of [[-11,5],[12,5],[-14,20],[14,23]]){
  const soil=worldMaterial('soil',0x4b5040,1.4);cyl(g,1.55,1.7,.24,[x,.12,z],m.stoneDark,20);cyl(g,1.40,1.40,.03,[x,.255,z],soil,20);w.physics.addBox(x,.19,z,3,.38,3,'planter');w.nav.push({x,z,hx:1.7,hz:1.7,top:.4});detailedTree(w,x,.27,z,6.2,false,r);w.physics.addBox(x,2.6,z,.55,5.2,.55,'tree');
  for(const sign of [-1,1]){const bx=x+sign*2.1;w.solid([.62,.47,1.8],[bx,.235,z],m.wood,'bench');box(g,[.12,.6,1.9],[bx+sign*.29,.67,z],m.wood);}
 }
 // Ivy made from batched leaf geometry clings to selected wall seams.
 const ivy=material('cloth',0xabc784,{map:ART.textures['hornbeam-leaf'],alphaTest:.45,side:T.DoubleSide,roughness:1});for(const side of [-1,1])for(let i=0;i<200;i++){const y=.25+r()*7.0,x=side*(8.8+r()*.9+Math.sin(y*2)*.18),z=-14.25+r()*.08;const leaf=mesh(new T.PlaneGeometry(.11+r()*.12,.13+r()*.14),ivy,g,x,y,z);leaf.rotation.z=r()*Math.PI;}
 // Coopered barrels, crates and cart wheels beside the workshops.
 for(const [x,z]of [[-19,11],[-28,7],[19,12],[29,19],[-18,22]]){
  w.physics.addBox(x,.525,z,.82,1.05,.82,'barrel');w.nav.push({x,z,hx:.95,hz:.95,top:1.05});const profile=[[0,0],[.34,.03],[.42,.18],[.47,.5],[.42,.88],[.34,1.03],[0,1.03]].map(([r,y])=>new T.Vector2(r,y));mesh(new T.LatheGeometry(profile,20),m.wood,g,x,0,z);for(const y of [.08,.30,.78,1.0])cyl(g,.46,.46,.045,[x,y,z],m.iron,16);for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(g,[x+Math.cos(a)*.425,.07,z+Math.sin(a)*.425],[x+Math.cos(a)*.425,1.01,z+Math.sin(a)*.425],.015,m.dark);}
 }
 // A pair of broad steps on the side route are solid Rapier surfaces.
 for(const x of [-17,17])for(let i=0;i<3;i++)w.solid([2.4,.13*(i+1),.43],[x,.065*(i+1),27+i*.43],m.cap,'courtyard-step');

}
