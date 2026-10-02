import {equipmentStyle,equipmentMagic} from './equipment-style.js';
import {decorateWeapon,decorateShield} from './equipment-visuals.js';
import {weaponPattern,DEFAULT_PATTERNS} from './weapon-patterns.js';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {seeded} from './data.js';
import {material} from './materials.js';
const geoCache=new Map();
export function boxGeo(x=1,y=1,z=1){const key=`b${x},${y},${z}`;if(!geoCache.has(key)){const g=new T.BoxGeometry(x,y,z);g.userData.shared=true;geoCache.set(key,g);}return geoCache.get(key);}
export function mat(color,roughness=.75,metalness=0,extra={}){return new T.MeshStandardMaterial({color,roughness,metalness,...extra});}
export function mesh(geo,material,parent,x=0,y=0,z=0){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;if(parent)parent.add(m);return m;}
export function box(parent,size,pos,material){return mesh(boxGeo(...size),material,parent,...pos);}
function forgedBlock(parent,size,pos,material){return mesh(new RoundedBoxGeometry(...size,2,.016),material,parent,...pos);}
export function cyl(parent,rt,rb,h,pos,material,segments=10){return mesh(new T.CylinderGeometry(rt,rb,h,segments),material,parent,...pos);}
export function sphere(parent,r,pos,material,segments=10){return mesh(new T.SphereGeometry(r,segments,Math.max(6,segments/2)),material,parent,...pos);}
export function beam(parent,a,b,r,material,segments=8){const p=new T.Vector3(...a),q=new T.Vector3(...b),m=mesh(new T.CylinderGeometry(r,r,p.distanceTo(q),segments),material,parent);m.position.copy(p).add(q).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.sub(p).normalize());return m;}
export function stoneTexture(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),r=seeded(1234);x.fillStyle='#565951';x.fillRect(0,0,512,512);for(let row=0;row<8;row++)for(let col=-1;col<5;col++){let px=col*128+(row%2)*64,py=row*64,v=Math.floor(146+r()*30);x.fillStyle=`rgb(${v},${v+2},${v-4})`;x.fillRect(px+3,py+3,122,58);x.fillStyle='rgba(255,250,218,.10)';x.fillRect(px+4,py+4,120,2);x.fillStyle='rgba(18,29,20,.15)';x.fillRect(px+4,py+58,120,3);}for(let i=0;i<26000;i++){let b=r()>.5;x.fillStyle=b?'rgba(250,250,225,.04)':'rgba(15,20,12,.035)';x.fillRect(r()*512,r()*512,1+r()*3,1+r()*3);}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(.4,.4);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
export function woodTexture(){const c=document.createElement('canvas');c.width=128;c.height=512;const x=c.getContext('2d'),r=seeded(666);x.fillStyle='#a7855a';x.fillRect(0,0,128,512);for(let i=0;i<160;i++){x.strokeStyle=`rgba(55,32,12,${.04+r()*.12})`;x.beginPath();x.moveTo(r()*128,0);x.bezierCurveTo(r()*128,140,r()*128,320,r()*128,512);x.stroke();}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;return t;}
export function sunBadge(parent,r=.23,material=mat(0xd8b66e,.3,.72)){const g=new T.Group();parent.add(g);const disk=cyl(g,r*.22,r*.22,.018,[0,0,.008],material,24);disk.rotation.x=Math.PI/2;const rim=mesh(new T.TorusGeometry(r*.35,r*.024,5,32),material,g,0,0,.012);for(let i=0;i<16;i++){const a=i*Math.PI/8,len=i%2?r*.66:r;const shape=new T.Shape();shape.moveTo(-r*.059,r*.40);shape.lineTo(0,len);shape.lineTo(r*.059,r*.40);shape.lineTo(0,r*.33);shape.closePath();const ray=mesh(new T.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:false}),material,g);ray.rotation.z=-a;}return g;}
function forgedBlade(parent,m,length=1.08){const p=[],uv=[],idx=[];const stations=[[.13,.039],[length*.75,.033],[length,.018],[length+.13,0]];for(let j=0;j<stations.length;j++){const [y,w]=stations[j];for(const [x,z]of [[-w,0],[0,w*.42],[w,0],[0,-w*.42]]){p.push(x,y,z);uv.push(x/.08+.5,y);}if(j<stations.length-1)for(let i=0;i<4;i++){const a=j*4+i,b=j*4+(i+1)%4;idx.push(a,b,a+4,b,b+4,a+4);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(geo,m,parent);}
export function weapon(type='sword',level=1,color=0x62988f,temper=null,design=null,item=null){
 if(item)return equipmentWeapon(item,level);
 const g=new T.Group(),steel=material('steel',level>=8?0xc1c5b9:0x929c9e,{roughness:.72,metalness:.65}),gold=material('steel',0xb6995e,{roughness:.7,metalness:.6}),wood=material('timber',0x655943),wrap=material('leather',0x554c3d),ember=mat(0xffb442,.32,.35,{emissive:0xee6f17,emissiveIntensity:.9});
 if(type==='sword'){
  forgedBlade(g,steel,1.0+level*.012);const guard=new T.CatmullRomCurve3([new T.Vector3(-.185,.10,0),new T.Vector3(-.10,.14,0),new T.Vector3(0,.15,0),new T.Vector3(.10,.14,0),new T.Vector3(.185,.10,0)]);mesh(new T.TubeGeometry(guard,16,.022,8,false),level>=5?gold:steel,g);cyl(g,.027,.031,.25,[0,-.015,0],wrap,12);for(let i=0;i<12;i++){const band=mesh(new T.TorusGeometry(.030,.0025,4,10),wrap,g,0,-.125+i*.021,0);band.rotation.x=Math.PI/2;}const pommel=cyl(g,.043,.043,.030,[0,-.167,0],gold,16);pommel.rotation.x=Math.PI/2;if(level>=3){const fuller=box(g,[.009,.68,.002],[0,.53,.015],steel);fuller.material=material('steel',0x343e3f,{metalness:.8,roughness:.6});}if(level>=7){for(const side of [-1,1])sphere(g,.026,[side*.18,.10,0],gold,12);}if(level>=10||temper==='ember')box(g,[.007,.85,.002],[0,.60,.018],ember);
 }else if(type==='spear'){
  cyl(g,.03,.038,2.4,[0,.32,0],wood);for(let i=0;i<4;i++)cyl(g,.041,.041,.06,[0,-.15+i*.12,0],wrap);const tip=cyl(g,0,.12,.48,[0,1.76,0],steel,4);tip.rotation.y=Math.PI/4;cyl(g,.065,.065,.14,[0,1.48,0],gold);if(level>=5){const flag=mesh(new T.PlaneGeometry(.3,.52,1,3),mat(color,.85,0,{side:T.DoubleSide}),g,.15,1.08,0);flag.rotation.y=.3;}if(level>=8){for(const s of [-1,1])beam(g,[0,1.47,0],[s*.19,1.65,0],.028,gold);}
 }else if(type==='hammer'){
  cyl(g,.045,.052,1.25,[0,.22,0],wood);cyl(g,.056,.056,.36,[0,-.25,0],wrap);forgedBlock(g,[.55+level*.012,.32,.35],[0,.94,0],steel);forgedBlock(g,[.13,.39,.39],[0,.94,0],gold);for(const s of [-1,1])forgedBlock(g,[.05,.34,.38],[s*(.29+level*.006),.94,0],gold);if(level>=6){const b=sunBadge(g,.11,gold);b.position.set(0,.95,.19);}if(level>=9)box(g,[.07,.15,.37],[0,1.13,0],ember);
 }else if(type==='bow'){
  const curve=new T.CatmullRomCurve3([new T.Vector3(level>=5?.10:0,-.84,0),new T.Vector3(level>=5?.02:.16,-.65,0),new T.Vector3(.22,-.42,0),new T.Vector3(.27,0,0),new T.Vector3(.22,.42,0),new T.Vector3(level>=5?.02:.16,.65,0),new T.Vector3(level>=5?.10:0,.84,0)]);mesh(new T.TubeGeometry(curve,28,.018+level*.0005,8,false),wood,g);beam(g,[level>=5?.10:0,-.84,0],[level>=5?.10:0,.84,0],.0025,mat(0xefe0bd));cyl(g,.046,.046,.22,[.265,0,0],wrap);if(level>=3)for(const y of [-.60,.6])sphere(g,.045,[.10,y,0],gold,8);if(level>=7)for(const y of [-.45,.45])beam(g,[.20,y,0],[.05,y*1.4,.01],.014,gold);if(level>=5)for(const sign of [-1,1]){beam(g,[.08,sign*.79,0],[.02,sign*.62,0],.025,gold);beam(g,[.23,sign*.38,-.022],[.06,sign*.63,-.022],.012,gold);}if(level>=8){for(const sign of [-1,1]){const s=new T.Shape();s.moveTo(.27,sign*.15);s.quadraticCurveTo(.10,sign*.29,.11,sign*.44);s.lineTo(.22,sign*.38);s.quadraticCurveTo(.15,sign*.28,.28,sign*.23);mesh(new T.ExtrudeGeometry(s,{depth:.017,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:1,steps:1}),gold,g,0,0,-.008);}}g.rotation.z=Math.PI/2;g.rotation.y=Math.PI/2;
 }else if(type==='crossbow'){
  box(g,[.10,.75,.13],[0,.22,0],wood);beam(g,[-.43,.5,0],[.43,.5,0],.04,steel);beam(g,[-.43,.5,0],[0,.2,0],.008,wrap);beam(g,[.43,.5,0],[0,.2,0],.008,wrap);box(g,[.14,.22,.2],[0,-.13,0],wood);
 }else{
  cyl(g,.027,.039,1.85,[0,.42,0],wood,14);for(let i=0;i<7;i++)cyl(g,.037,.037,.018,[0,-.11+i*.035,0],wrap,12);cyl(g,.06,.05,.15,[0,1.35,0],gold,12);
  if(design==='mage'){
   const cage=material('steel',0x4b514b,{roughness:.85}),soul=mat(0x97bea6,.6,0,{emissive:0x68a284,emissiveIntensity:1.4});const lamp=sphere(g,.083,[0,1.57,0],soul,16);lamp.scale.y=1.45;
   for(const y of [1.43,1.73]){const rim=mesh(new T.TorusGeometry(.125,.013,6,16),cage,g,0,y,0);rim.rotation.x=Math.PI/2;}for(let i=0;i<6;i++){const a=i*Math.PI/3;beam(g,[Math.sin(a)*.125,1.43,Math.cos(a)*.125],[Math.sin(a)*.125,1.73,Math.cos(a)*.125],.009,cage,6);}cyl(g,0,.155,.16,[0,1.81,0],cage,8);g.userData.crystal=lamp;
  }else{
   const head=mesh(new T.OctahedronGeometry(.13+level*.004,1),mat(temper==='frost'||design==='frost'?0x8fd4df:0xe4b95e,.25,.25,{emissive:temper==='frost'||design==='frost'?0x338aa0:0xdf6925,emissiveIntensity:.7}),g,0,1.54,0);for(let i=0;i<4;i++){const a=i*Math.PI*.5;const curve=new T.CatmullRomCurve3([new T.Vector3(0,1.32,0),new T.Vector3(Math.sin(a)*.16,1.51,Math.cos(a)*.16),new T.Vector3(Math.sin(a)*.11,1.73,Math.cos(a)*.11)]);mesh(new T.TubeGeometry(curve,10,.014,6,false),gold,g);}g.userData.crystal=head;
  }

 }
 if(design==='pyre'){for(const x of [-.13,.13])beam(g,[x,1.35,0],[x,1.76,0],.019,steel);sphere(g,.11,[0,1.64,0],ember,12);}if(design==='marksman'&&type==='crossbow'){cyl(g,.04,.04,.4,[.10,.42,.10],gold,12);for(let i=0;i<level;i++)box(g,[.035,.012,.15],[0,.02+i*.034,0],gold);}
 g.userData.type=type;return g;
}
export function shield(level=1,color=0x497d79,enemy=null){
 const g=new T.Group(),wood=material(level<4?'timber':'leather',level<4?0x817564:color,{roughness:.9}),edge=material('steel',enemy?0x6b695e:level>=8?0xac9561:0x8d9895,{roughness:.6,metalness:.78});
 if(level>=4&&!enemy){wood.map=null;wood.color.setHex(color);}
 const w=.275+level*.008,h=.38+level*.025;let points=[];
 if(enemy==='knight'||enemy==='veyr'){points=[[-w*.6,h], [w*.6,h],[w,h*.56],[w*.79,-h*.65],[0,-h*1.24],[-w*.79,-h*.65],[-w,h*.56]];}
 else if(level<4){for(let i=0;i<32;i++){const a=i/32*Math.PI*2;points.push([Math.cos(a)*w,Math.sin(a)*w]);}}
 else points=[[-w,h],[0,h*1.08],[w,h],[w*.94,h*.1],[w*.65,-h*.57],[0,-h*1.13],[-w*.65,-h*.57],[-w*.94,h*.1]];
 const curveZ=x=>.045+.065*(1-(x/w)**2),pos=[0,0,curveZ(0)],uv=[.5,.5],idx=[];for(const [x,y]of points){pos.push(x,y,curveZ(x));uv.push(x/(w*2)+.5,y/(h*2)+.5);}for(let i=0;i<points.length;i++)idx.push(0,1+i,1+(i+1)%points.length);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();wood.side=T.DoubleSide;mesh(geo,wood,g);
 const rimPoints=points.map(([x,y])=>new T.Vector3(x,y,curveZ(x)));rimPoints.push(rimPoints[0]);mesh(new T.TubeGeometry(new T.CatmullRomCurve3(rimPoints,false,'catmullrom',.06),points.length*4,.018,7,false),edge,g);
 for(let i=0;i<points.length;i++){const [x,y]=points[i];sphere(g,.011,[x*.88,y*.9,curveZ(x*.88)+.013],edge,8);}
 for(const x of [-.10,.10])beam(g,[x,-.14,.01],[x,.15,.01],.024,material('leather',0x494035));
 if(enemy){const dark=material('steel',0x242b27,{roughness:.93});for(const x of [-.05,.05])box(g,[.025,h*1.3,.014],[x,0,.125],dark);if(enemy==='knight'||enemy==='veyr'){const skull=sphere(g,.064,[0,.11,.15],edge,12);skull.scale.y=1.2;for(const x of [-.025,.025])sphere(g,.017,[x,.123,.204],dark,8);}}
 else if(level>=3){const badge=sunBadge(g,.155,edge);badge.position.set(0,.085,.128);}else{const boss=sphere(g,.072,[0,0,.09],edge,16);boss.scale.z=.55;}
 if(level>=9&&!enemy){for(const side of [-1,1]){beam(g,[side*w*.82,h*.75,.092],[side*w*.51,-h*.50,.095],.008,edge);for(let j=0;j<4;j++){const y=.3-j*.12;beam(g,[side*.19,y,.111],[side*.12,y-.09,.127],.009,edge);}}}if(level>=6&&!enemy)for(const x of [-w*.70,w*.70])box(g,[.014,h*1.25,.008],[x,.06,curveZ(x)+.014],edge);
 return g;
}
export function arrowMesh(heavy=false,fire=false){const g=new T.Group(),shaft=mat(0x755238),metal=mat(0xc0cbc5,.22,.8),feather=mat(0xdfd9c0,.85,0,{side:T.DoubleSide});const len=heavy?1.45:.90;const s=cyl(g,heavy?.028:.012,heavy?.028:.012,len,[0,0,0],shaft,6);s.rotation.x=Math.PI/2;const tip=cyl(g,0,heavy?.085:.045,heavy?.22:.13,[0,0,len*.5+.05],metal,4);tip.rotation.x=Math.PI/2;for(let i=0;i<3;i++){const f=mesh(new T.PlaneGeometry(heavy?.16:.10,heavy?.25:.18),feather,g,0,0,-len*.35);f.rotation.y=i*Math.PI*2/3;f.rotation.x=Math.PI/2;}return g;}
export function mergeStatic(group,chunkSize=0){
 group.updateMatrixWorld(true);const bins=new Map(),center=new T.Vector3();
 group.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||Array.isArray(o.material)||o.userData.keep)return;
  let tile='';if(chunkSize){o.geometry.computeBoundingBox();o.geometry.boundingBox.getCenter(center).applyMatrix4(o.matrixWorld);tile=':'+Math.floor((center.x+chunkSize/2)/chunkSize)+','+Math.floor((center.z+chunkSize/2)/chunkSize);}
  const key=o.material.uuid+':'+o.castShadow+tile;if(!bins.has(key))bins.set(key,{material:o.material,shadow:o.castShadow,geometries:[],meshes:[]});
  const transformed=o.geometry.clone().applyMatrix4(o.matrixWorld),g=transformed.index?transformed.toNonIndexed():transformed;if(g!==transformed)transformed.dispose();bins.get(key).geometries.push(g);bins.get(key).meshes.push(o);
 });
 const merged=new T.Group();for(const bin of bins.values()){const geometry=mergeGeometries(bin.geometries,false);if(!geometry)continue;geometry.computeBoundingSphere();const m=new T.Mesh(geometry,bin.material);m.castShadow=bin.shadow;m.receiveShadow=true;merged.add(m);for(const o of bin.meshes)o.removeFromParent();for(const g of bin.geometries)g.dispose();}return merged;
}
// Merge rigid pieces within a local attachment; bone-attached groups stay separate.
export function compactRigid(group){group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),bins=new Map();group.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||Array.isArray(o.material)||o.userData.keep)return;const key=o.material.uuid;if(!bins.has(key))bins.set(key,{material:o.material,meshes:[]});bins.get(key).meshes.push(o);});for(const {material,meshes}of bins.values()){if(meshes.length<2)continue;const geos=meshes.map(o=>{const g=o.geometry.clone();g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(g.index){const flat=g.toNonIndexed();g.dispose();return flat;}return g;});const geo=mergeGeometries(geos,false);if(geo){const m=new T.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;const old=new Set();meshes.forEach(o=>{if(!o.geometry.userData.shared)old.add(o.geometry);o.removeFromParent();});old.forEach(g=>g.dispose());group.add(m);}geos.forEach(g=>g.dispose());}return group;}

// Named hero equipment uses the same geometry in the hand and on the inspection plinth.
function equipmentWeapon(item,rank){
 const d=weaponPattern(item),style=equipmentStyle(item),magic=equipmentMagic(item),aura=magic[0]?.color||style.glow,g=new T.Group(),type=d.type,variant=style.tier===0?0:d.shape,metal=material('steel',style.metal,{roughness:style.roughness,metalness:style.tier===0?.5:.85}),trim=material('steel',style.trim,{roughness:style.roughness,metalness:.78}),dark=material('steel',0x263637,{roughness:.6}),wood=material('timber',variant===1?0x48523c:0x645547),leather=material('leather',0x383b32),glow=mat(aura||style.trim,.3,.4,{emissive:aura||0,emissiveIntensity:aura?.8:0});
 const line=(a,b,r=.013,m=trim)=>beam(g,a,b,r,m,8);
 const gem=(x,y,z,r=.04)=>{const o=mesh(new T.OctahedronGeometry(r,0),glow,g,x,y,z);o.scale.y=1.5;return o;};
 if(type==='sword'){
  const shape=new T.Shape(),width=variant===1?.065:variant===2?.055:.043,tip=variant===2?1.27:1.15;
  shape.moveTo(-width,.16);shape.lineTo(-width,.90);shape.lineTo(variant===1?-.02:0,tip);if(variant===1){shape.lineTo(0,tip-.17);shape.lineTo(.02,tip);}shape.lineTo(width,.9);shape.lineTo(width,.16);shape.closePath();mesh(new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.008,bevelThickness:.007,bevelSegments:1,steps:1}),metal,g,0,0,-.0125);
  cyl(g,.028,.034,.28,[0,-.015,0],leather,12);if(style.tier===0)cyl(g,.038,.038,.035,[0,-.18,0],metal,12);else gem(0,-.19,0,.048);
  for(const side of [-1,1]){line([0,.17,0],[side*.18,variant===1?.10:.21,0],.023);if(variant===2){line([side*.09,.19,0],[side*.23,.32,0],.015);line([side*.08,.2,0],[side*.18,.35,0],.011);}else if(variant===1)gem(side*.17,.10,0,.029);}
  line([0,.28,.027],[0,.97,.027],.005,variant?glow:dark);for(let n=0;n<(item.plus||0)+1;n++)line([-.025,.32+n*.055,.027],[.01,.34+n*.055,.027],.0025,trim);
 }else if(type==='spear'){
  cyl(g,.027,.033,2.18,[0,.22,0],wood,12);cyl(g,.04,.04,.32,[0,-.05,0],leather,12);
  const tip=cyl(g,0,variant===1?.10:.08,.5,[0,1.54,0],variant===1?glow:metal,4);tip.rotation.y=Math.PI/4;cyl(g,.06,.05,.16,[0,1.28,0],trim,10);
  if(variant)for(const side of [-1,1]){line([0,1.25,0],[side*.16,1.40,0],.024);line([side*.16,1.40,0],[side*.13,variant===1?1.66:1.84,0],.015,variant===1?glow:metal);}
  if(variant===2){const ring=mesh(new T.TorusGeometry(.11,.014,6,24),trim,g,0,1.4,0);gem(0,1.39,.02,.055);}
 }else if(type==='hammer'){
  cyl(g,.038,.05,1.35,[0,.22,0],wood,12);cyl(g,.057,.053,.35,[0,-.26,0],leather,12);
  for(let j=0;j<12;j++)cyl(g,.054,.054,.011,[0,-.41+j*.026,0],trim,12);for(const side of [-1,1])for(const yy of [.86,1.02]){sphere(g,.018,[side*.15,yy,.18],dark,8);}if(variant===2){const bell=cyl(g,.13,.24,.44,[0,1.03,0],trim,16);cyl(g,.24,.24,.06,[0,.82,0],dark,16);gem(0,1.1,.17,.07);}
  else{forgedBlock(g,[variant===1?.70:.52,.32,.35],[0,.94,0],metal);forgedBlock(g,[.13,.38,.40],[0,.94,0],trim);for(const side of [-1,1]){forgedBlock(g,[.075,.38,.4],[side*(variant===1?.37:.28),.94,0],trim);if(variant===1)for(let j=0;j<3;j++){const tooth=cyl(g,0,.052,.17,[side*.42,.84+j*.10,0],dark,4);tooth.rotation.z=-side*Math.PI/2;}}gem(0,.97,.22,.06);}
 }else if(type==='bow'){
  for(const side of [-1,1]){const curve=new T.CatmullRomCurve3([new T.Vector3(.23,0,0),new T.Vector3(variant===2?.37:.27,side*.31,0),new T.Vector3(.03,side*.74,0),new T.Vector3(variant===1?-.08:.08,side*.85,0)]);mesh(new T.TubeGeometry(curve,24,.03,8,false),variant===2?metal:wood,g);if(variant===1)for(let j=0;j<3;j++)line([.24-j*.035,side*(.25+j*.12),0],[.39-j*.035,side*(.32+j*.12),0],.015,trim);if(variant===2){line([.3,side*.26,0],[.09,side*.65,0],.01,trim);gem(.25,side*.3,.03,.04);}}
  line([variant===1?-.08:.08,-.85,0],[variant===1?-.08:.08,.85,0],.004,mat(0xe9ddba));cyl(g,.045,.045,.21,[.23,0,0],leather,10);g.rotation.set(0,Math.PI/2,Math.PI/2);
 }else{
  cyl(g,.031,.039,1.82,[0,.38,0],wood,12);cyl(g,.043,.043,.27,[0,-.12,0],leather,12);
  const ring=mesh(new T.TorusGeometry(variant===2?.20:.15,.019,8,28),trim,g,0,1.50,0);gem(0,1.51,0,variant===2?.10:.12);
  if(variant===1)for(const side of [-1,1]){line([0,1.27,0],[side*.19,1.59,0],.025);gem(side*.14,1.68,0,.067);}if(variant===2){mesh(new T.TorusGeometry(.25,.008,5,32,Math.PI*1.6),metal,g,0,1.5,0).rotation.z=.6;gem(0,1.88,0,.04);}
 }
 if(type!=='sword')for(let j=0;j<=item.plus;j++)cyl(g,.043,.043,.015,[type==='bow'?.23:0,-.10+j*.027,0],trim,10);
 g.userData={type,itemId:item.id,pattern:item.weaponPattern||DEFAULT_PATTERNS[type],power:d.power||null,forge:item.plus};decorateWeapon(g,item);for(const child of g.children){if(type==='bow')child.position.x-=.23;else if(type==='hammer')child.position.y+=.24;else if(type==='staff')child.position.y+=.10;else if(type==='spear')child.position.y+=.05;}return g;
}

export function equipmentShield(item){const s=equipmentStyle(item),colors=[0x695b46,0x5b6458,0x315e89,0x563c75,0x233950,0x283854,0xe1deca],g=shield(s.rank,colors[s.tier]);g.userData={type:'shield',itemId:item.id,rarity:s.tier};decorateShield(g,item);return g;}
