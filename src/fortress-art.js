import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mesh,box,cyl,beam,sphere,mat,mergeStatic,sunBadge} from './art.js';
import {worldMaterial,material} from './materials.js';
import {windowArch} from './environment-design.js';
import {siegeConfig,SIEGE_OFFSET} from './siege-rules.js';

const stone=(g,size,pos,m,r=.08)=>mesh(new RoundedBoxGeometry(...size,1,r),m,g,...pos);
function arch(g,x,y,z,width,height,depth,m){
 const r=width/2,top=height-r;
 // Separate tapered voussoirs leave a genuine open passage below the arch.
 for(let i=0;i<17;i++){const a=i*Math.PI/17,b=(i+1)*Math.PI/17,s=new T.Shape();s.moveTo(Math.cos(a)*r,Math.sin(a)*r);s.absarc(0,0,r,a,b,false);s.lineTo(Math.cos(b)*(r+.6),Math.sin(b)*(r+.6));s.absarc(0,0,r+.6,b,a,true);s.closePath();mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.03,bevelSize:.025,bevelSegments:1}),m,g,x,y+top,z-depth/2);}
 for(const side of [-1,1])for(let j=0;j<Math.ceil(top/.7);j++)stone(g,[.60,.66,depth],[x+side*(r+.3),y+.35+j*.7,z],m);
}
function crown(g,x,y,z,r,m){for(let i=0;i<8;i++){const a=i*Math.PI/4,xx=x+Math.sin(a)*r,zz=z+Math.cos(a)*r;cyl(g,0,.24,1.3+(i%2)*.5,[xx,y+.65,zz],m,5);beam(g,[x,y-.2,z],[xx,y+.1,zz],.1,m);}cyl(g,r,r,.16,[x,y-.2,z],m,24);}
function banner(w,x,y,z,width,height,m,trim){
 const f=mesh(new T.PlaneGeometry(width,height,8,14),m,w.dynamic,x,y,z),p=f.geometry.attributes.position;
 for(let i=0;i<p.count;i++){const xx=p.getX(i),yy=p.getY(i);p.setZ(i,Math.sin(xx*5)*.08);if(yy< -height*.42)p.setY(i,yy+Math.abs(xx)*.65);}f.userData.base=new Float32Array(p.array);w.flags.push(f);
 beam(w.static,[x-width*.6,y+height*.5,z],[x+width*.6,y+height*.5,z],.06,trim);
 // Broken crown heraldry, visibly distinct from Hearthwatch's sun.
 const emblem=new T.Group();w.static.add(emblem);emblem.position.set(x,y+.3,z+.12);const ring=mesh(new T.TorusGeometry(width*.23,.035,5,24,Math.PI*1.65),trim,emblem);ring.rotation.z=.3;
 for(let i=-1;i<=1;i++){beam(emblem,[i*width*.15,-.1,0],[i*width*.23,width*(i===0?.42:.28),0],.04,trim);}
}
export function buildEnemyFortress(w,mission){
 const oldStatic=w.static,oldDynamic=w.dynamic,height=w.height,first=w.physics.fixed.length,navStart=w.nav.length;
 const solid=new T.Group(),moving=new T.Group();solid.position.z=moving.position.z=SIEGE_OFFSET;oldStatic.add(solid);oldDynamic.add(moving);
 w.static=solid;w.dynamic=moving;w.height=(x,z)=>height.call(w,x,z+SIEGE_OFFSET);
 try{buildLocalFortress(w,mission);}finally{w.static=oldStatic;w.dynamic=oldDynamic;w.height=height;}
 for(const c of w.physics.fixed.slice(first)){const p=c.translation();c.setTranslation({x:p.x,y:p.y,z:p.z+SIEGE_OFFSET});}
 for(const n of w.nav.slice(navStart))n.z+=SIEGE_OFFSET;
 for(const p of Object.values(w.enemyFortress.parts)){p.z+=SIEGE_OFFSET;p.front+=SIEGE_OFFSET;}
}
function buildLocalFortress(w,mission){
 const c=siegeConfig(mission),g=w.static,base=3,final=c.final;
 const m={stone:worldMaterial('stone',final?0x363b43:0x53535a,2.2),cap:worldMaterial('stone',0x85817e,1.3),iron:material('steel',0x292b36,{metalness:.72,roughness:.5}),dark:mat(0x10141c),roof:worldMaterial('stone',0x303340,1.1),bronze:material('steel',0x9c7154,{metalness:.65,roughness:.54}),cloth:material('cloth',final?0x572136:({snow:0x343969,forest:0x522c54,desert:0x823820,river:0x6b273b,quarry:0x4b315e}[mission.biome]||0x712d2b),{side:T.DoubleSide}),glass:mat(final?0xceb1ec:0xffbb77,.3,.25,{emissive:final?0x8d45c9:0xda501e,emissiveIntensity:1.5})};
 w.enemyFortress={parts:{},final};
 function wall(x,z,sx,sz,h){w.solid([sx,h,sz],[x,base+h/2,z],m.stone,'enemy-wall');for(const y of [.45,h*.47,h-.2])stone(g,[sx+.3,.26,sz+.3],[x,base+y,z],m.cap);const axis=sx>sz?'x':'z',len=Math.max(sx,sz);for(let i=0;i<=Math.floor(len/1.8);i++){const d=-len/2+i*len/Math.floor(len/1.8);stone(g,[axis==='x'?.9:sz+.3,1.1,axis==='x'?sz+.3:.9],[x+(axis==='x'?d:0),base+h+.55,z+(axis==='z'?d:0)],m.stone);}}
 function turret(parent,x,z,y,rad,height){
 cyl(parent,rad,rad+.65,height,[x,y+height/2,z],m.stone,24);
 for(const dy of [.3,height*.34,height*.69,height-.1]){cyl(parent,rad+.24,rad+.4,.32,[x,y+dy,z],m.cap,24);}
 for(let i=0;i<8;i++){const a=i*Math.PI/4,xx=x+Math.sin(a)*(rad+.1),zz=z+Math.cos(a)*(rad+.1);const rib=stone(parent,[.37,height*.92,.7],[xx,y+height*.46,zz],m.cap);rib.rotation.y=a;windowArch(parent,x+Math.sin(a)*(rad+.4),y+height*.58,z+Math.cos(a)*(rad+.4),.60,2.5,{...m,dark:m.glass},a);}
 cyl(parent,rad+.65,rad+.25,.6,[x,y+height,z],m.iron,24);crown(parent,x,y+height+.5,z,rad+.25,m.iron);
 const roofH=rad*2.6;cyl(parent,0,rad+.12,roofH,[x,y+height+roofH/2,z],m.roof,16);for(let j=1;j<7;j++)cyl(parent,rad*(1-j/7),rad*(1-j/7)+.12,.13,[x,y+height+j*roofH/7,z],m.iron,24);cyl(parent,0,.22,2.6,[x,y+height+roofH+1.2,z],m.bronze,6);
 }
 // The wide forecourt remains playable; textured foundations meet a flattened plateau.
 const paving=mesh(new T.PlaneGeometry(76,62),worldMaterial('cobble',0x7b7975,1.8),g,0,base+.018,-169);paving.rotation.x=-Math.PI/2;
 wall(-24,-144,27,3,8);wall(24,-144,27,3,8);wall(-38,-171,3,56,9);wall(38,-171,3,56,9);wall(0,-198,76,3,10);
 for(const x of [-38,38])for(const z of [-144,-198]){turret(g,x,z,base,3.2,12);w.physics.addBox(x,base+9,z,7.6,18,7.6,'enemy-wall');w.nav.push({x,z,hx:4.4,hz:4.4,top:base+18});}
 // Gatehouse with an actual vaulted opening; no invisible wall after destruction.
 arch(g,0,base,-143,9,11,3.6,m.cap);box(g,[10.2,3.4,3.6],[0,base+12.5,-143],m.stone);crown(g,0,base+14.4,-143,3.1,m.bronze);
 for(const side of [-1,1]){const x=side*5.5;wall(side*7.8,-143,3.5,3.8,11);w.solid([1.7,14,3.8],[x,base+7,-143],m.stone,'enemy-wall');turret(g,x,-143,base+13,1.0,5);banner(w,side*24,base+5.0,-142.25,2.6,5.8,m.cloth,m.bronze);w.torch(side*8,base,-137,true);}
 function part(id,x,z,sx,sz,h,build){const root=new T.Group();build(root);root.updateMatrixWorld(true);const model=mergeStatic(root);w.dynamic.add(model);const collider=w.physics.addBox(x,base+h/2,z,sx,h,sz,'enemy-fortification');const nav={x,z,hx:sx/2+.6,hz:sz/2+.6,top:base+h};w.nav.push(nav);w.enemyFortress.parts[id]={model,collider,nav,x,z,y:base,front:z+sz/2+.25};}
 part('gate',0,-143,8.6,1.4,7.3,p=>{stone(p,[8.5,7.2,.95],[0,base+3.6,-143],m.iron);for(let i=-6;i<=6;i++){box(p,[.17,7.2,1.25],[i*.63,base+3.6,-143],m.bronze);cyl(p,0,.15,.8,[i*.63,base+7.5,-143],m.iron,4);}for(const y of [1,3.3,5.5]){box(p,[8.5,.21,1.3],[0,base+y,-143],m.bronze);for(let i=-5;i<=5;i++)sphere(p,.10,[i*.76,base+y,-142.28],m.iron,8);}const badge=mesh(new T.TorusGeometry(1.05,.12,8,32),m.bronze,p,0,base+4.0,-142.2);for(const side of [-1,1])beam(p,[side*.65,base+3.4,-142.15],[side*1.25,base+5.5,-142.15],.13,m.bronze);});
 for(const [id,x]of [['west',-14],['east',14]])part(id,x,-143,10,10,16,p=>{turret(p,x,-143,base,4.65,12);for(const xx of [-1,1]){const barrel=cyl(p,.26,.39,3.3,[x+xx*.8,base+8.8,-137.8],m.iron,12);barrel.rotation.x=Math.PI/2;beam(p,[x+xx*.8,base+7.8,-140],[x+xx*.8,base+8.6,-137.8],.18,m.bronze);}for(const dy of [3,6])windowArch(p,x,base+dy,-138.15,1.1,1.8,{...m,dark:m.glass});});
 part('keep',0,-180,20,20,final?34:25,p=>{
 const h=final?29:22;stone(p,[19,h,19],[0,base+h/2,-180],m.stone,.28);
 for(const y of [.7,5.6,12,h-.5])stone(p,[20,.5,20],[0,base+y,-180],m.cap);
 for(const x of [-10,10])for(const z of [-170,-190])turret(p,x,z,base,2.1,h-1);
 arch(p,0,base,-169.6,5.2,7.5,.7,m.cap);box(p,[5,6.4,.18],[0,base+3.2,-169.85],m.dark);
 for(const x of [-6,0,6])for(const y of [10.5,16.4])windowArch(p,x,base+y,-170.35,1.5,3.6,{...m,dark:m.glass});
 for(const x of [-8,-4,4,8]){stone(p,[.7,h,1],[x,base+h/2,-169.8],m.cap);beam(p,[x*1.5,base+1,-165],[x,base+10,-170],.45,m.stone);}
 for(let i=0;i<3;i++){const roof=cyl(p,0,14-i*3,6,[0,base+h+3+i*3,-180],m.roof,4);roof.rotation.y=Math.PI/4;}
 const eye=mesh(new T.TorusGeometry(2.3,.2,8,40),m.bronze,p,0,base+h-4,-169.2);const gem=mesh(new T.OctahedronGeometry(1.55,0),m.glass,p,0,base+h-4,-169);gem.scale.set(.7,1,.45);cyl(p,.25,.65,3,[0,base+h+12,-180],m.iron,8);crown(p,0,base+h+13,-180,3,m.bronze);
 });
 // Red standards, ossuary niches, chains and iron braziers give the silhouette scale.
 for(const side of [-1,1])for(let i=0;i<4;i++){const x=side*(20+i*4.8),z=-141.9;windowArch(g,x,base+1.8,z,.55,2.1,m);if(i%2===0){const skull=sphere(g,.24,[x,base+4.5,z+.1],m.cap,10);skull.scale.set(.8,1,.7);for(const eye of [-1,1])sphere(g,.065,[x+eye*.09,base+4.55,z+.26],m.dark,8);}for(let j=0;j<5;j++)stone(g,[3.8,.1,.14],[x,base+.5+j*1.32,z],m.cap);}
 for(const x of [-6.5,6.5]){const curve=new T.CatmullRomCurve3([new T.Vector3(x,base+12,-141),new T.Vector3(x*1.15,base+7,-138),new T.Vector3(x*1.3,base+.4,-132)]);mesh(new T.TubeGeometry(curve,24,.09,6,false),m.iron,g);}
 for(const side of [-1,1])for(let i=0;i<5;i++){const z=-124+i*4,x=side*(10+i*.6),y=w.height(x,z);cyl(g,.30,.43,1.8,[x,y+.9,z],m.stone,8);crown(g,x,y+2,z,.35,m.iron);if(i%2===0)w.torch(x,y+1.8,z);}
 const rally=w.flag(-7,w.height(-7,-106),-106,1.3);rally.name='Siege rally standard';
 w.root.userData.enemyFortress={name:mission.name,final,parts:4,revision:1};
}

export function enrichHearthwatch(w){
 const g=w.static,m=w.materials,copper=material('steel',0x637d78,{metalness:.55,roughness:.6}),warm=mat(0xf5ce8d,.35,.1,{emissive:0xc56c27,emissiveIntensity:.5}),ruby=mat(0x942f40,.36,.15,{emissive:0x802238,emissiveIntensity:.5}),blue=mat(0x236b9a,.4,.15,{emissive:0x165785,emissiveIntensity:.4});
 // A jewel-like rose window and carved gable give the great hall a focal point.
 const rose=new T.Group();rose.position.set(0,8.3,17.71);rose.rotation.y=Math.PI;g.add(rose);mesh(new T.CircleGeometry(1.79,48),m.dark,rose,0,0,-.02);arch(g,0,0,18.0,6.4,6.9,.5,m.cap);
 for(const r of [1.65,1.9,2.07])mesh(new T.TorusGeometry(r,r>1.8?.09:.055,8,48),r>1.8?m.cap:m.gold,rose);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,pane=mesh(new T.CircleGeometry(.43,16),i%3===0?ruby:i%2?warm:blue,rose,Math.sin(a)*1.15,Math.cos(a)*1.15,.025);mesh(new T.TorusGeometry(.45,.047,6,20),m.cap,rose,pane.position.x,pane.position.y,.05);beam(rose,[Math.sin(a)*.45,Math.cos(a)*.45,.08],[Math.sin(a)*1.77,Math.cos(a)*1.77,.08],.055,m.cap);}
 mesh(new T.CircleGeometry(.52,24),warm,rose);sunBadge(rose,.48,m.gold);
 const shape=new T.Shape();shape.moveTo(-5,0);shape.lineTo(0,5);shape.lineTo(5,0);shape.closePath();const gable=mesh(new T.ExtrudeGeometry(shape,{depth:.7,bevelEnabled:true,bevelThickness:.06,bevelSize:.08,bevelSegments:1}),m.stone,g,0,10.4,18.2);gable.rotation.y=Math.PI;
 for(const side of [-1,1]){beam(g,[0,15.5,17.85],[side*5.2,10.3,17.85],.16,m.cap);for(let i=1;i<7;i++){const x=side*i*.65,y=15.45-i*.65;const leaf=mesh(new T.OctahedronGeometry(.24,0),m.cap,g,x,y+.16,17.82);leaf.scale.set(.65,1,.55);}cyl(g,0,.26,2,[side*5.1,11.4,17.8],m.gold,8);}
 const crest=sunBadge(g,.60,m.gold);crest.position.set(0,12.35,17.4);crest.rotation.y=Math.PI;
 // Sculpted flying buttresses, layered stone feet, and carved capitals.
 for(const x of [-10.5,-4.6,4.6,10.5]){for(let i=0;i<4;i++)stone(g,[1.1-i*.1,1.3,1.8-i*.22],[x,.65+i*1.3,17.75+i*.13],m.cap);beam(g,[x,3.8,16.6],[x,7.6,18.1],.28,m.stone);for(let i=0;i<4;i++)stone(g,[.88-i*.12,.15,1.1-i*.13],[x,5.6+i*.15,18.05],i%2?m.gold:m.cap);}
 // Weathered copper ribs articulate the high central roof instead of a flat cone.
 for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(g,[Math.sin(a)*4.65,18.75,30+Math.cos(a)*4.65],[Math.sin(a)*.25,23.4,30+Math.cos(a)*.25],.045,copper);}
 // Gallery corbels, carved medallions and illuminated paired windows.
 for(const x of [-30.4,30.4])for(const z of [-8,0,8,16,24]){const face=x<0?Math.PI/2:-Math.PI/2;for(const dz of [-.55,.55])windowArch(g,x,2.0,z+dz,.65,1.8,{...m,dark:warm},face);const corbel=stone(g,[.8,.9,.55],[x,4.65,z],m.cap);corbel.rotation.z=x<0?-.22:.22;}
 // Color is concentrated around shops: indigo, oxblood and saffron cloth, garlands and fruit.
 const fabrics=[material('cloth',0x304c88,{side:T.DoubleSide}),material('cloth',0x8d3446,{side:T.DoubleSide}),material('cloth',0xc19a54,{side:T.DoubleSide})];
 for(const [index,x,z]of [[0,-21.5,3.3],[1,22,3.8],[2,-22,19],[0,23,20]]){const f=mesh(new T.PlaneGeometry(3.4,1.1,10,6),fabrics[index],w.dynamic,x,2.85,z-2.02),p=f.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*5)*.09);f.userData.base=new Float32Array(p.array);w.flags.push(f);for(let i=0;i<15;i++){const flower=sphere(g,.08,[x-1.5+i*.21,3.5+Math.sin(i*.25)*.3,z-2.06],i%3?m.leaf:ruby,6);}}
 w.root.userData.hearthwatchDetail=3;
}
