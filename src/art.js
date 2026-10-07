import {heroSurface} from './hero-surfaces.js';
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
 const g=new T.Group(),wood=(level>=4&&!enemy?heroSurface:material)(level<4?'timber':level>=8&&!enemy?'steel':'leather',level<4?0x817564:color,{roughness:.75,metalness:level>=8&&!enemy?.45:0}),edge=material('steel',enemy?0x6b695e:level>=8?0xac9561:0x8d9895,{roughness:.6,metalness:.78});
 if(level>=4&&!enemy)wood.color.setHex(color);
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

// Weapon-only sweeps retain a flattened, tapered section instead of a pipe.
// Width is in the curve plane; depth is the forged edge or bow lamination.
function weaponSweep(parent,points,widths,depths,m,name,segments=36){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),positions=[],uv=[],indices=[],section=[[-1,0],[-.72,.78],[0,1],[.72,.78],[1,0],[.72,-.78],[0,-1],[-.72,-.78]];
 const at=(values,t)=>{const f=t*(values.length-1),i=Math.min(values.length-2,Math.floor(f));return T.MathUtils.lerp(values[i],values[i+1],f-i);};
 for(let j=0;j<=segments;j++){const t=j/segments,p=curve.getPoint(t),v=curve.getTangent(t),normal=new T.Vector3(-v.y,v.x,0).normalize(),w=at(widths,t),d=at(depths,t);
  for(let i=0;i<8;i++){const [a,b]=section[i],q=p.clone().addScaledVector(normal,a*w);positions.push(q.x,q.y,q.z+b*d);uv.push(i/8,t*3);if(j<segments){const n=j*8+i,k=j*8+(i+1)%8;indices.push(n,k,n+8,k,k+8,n+8);}}
 }
 for(const j of [0,segments]){const p=curve.getPoint(j/segments),n=positions.length/3;positions.push(p.x,p.y,p.z);uv.push(.5,j/segments);for(let i=0;i<8;i++){const a=j*8+i,b=j*8+(i+1)%8;indices.push(...(j===0?[n,b,a]:[n,a,b]));}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const o=mesh(geo,m,parent);o.name=name;return o;
}
function weaponCord(parent,points,r,m,name){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const o=mesh(new T.TubeGeometry(curve,Math.max(16,points.length*5),r,6,false),m,parent);o.name=name;return o;}
function leatherLacing(parent,x,y,length,r,m,turns=11){
 const points=[];for(let i=0;i<=turns*12;i++){const t=i/(turns*12),a=t*turns*Math.PI*2;points.push([x+Math.sin(a)*r,y+t*length,Math.cos(a)*r]);}return weaponCord(parent,points,.0019,m,'Spiral leather binding');
}
function groundBlade(parent,stations,metal,edge){
 // Flat ground bevels meet at a thin cutting edge and a raised medial ridge.
 const p=[],uv=[],index=[],groups=[],section=[[-1,0],[-.66,.68],[0,1],[.66,.68],[1,0],[.66,-.68],[0,-1],[-.66,-.68]];
 for(let side=0;side<8;side++){const begin=index.length;for(let j=0;j<stations.length;j++){const [y,w,d]=stations[j];for(const s of [side,(side+1)%8]){p.push(section[s][0]*w,y,section[s][1]*d);uv.push(s/8,y*2.5);}if(j<stations.length-1){const k=side*stations.length*2+j*2;index.push(k,k+1,k+2,k+1,k+3,k+2);}}groups.push([begin,index.length-begin,[0,3,4,7].includes(side)?1:0]);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(index);for(const group of groups)geo.addGroup(...group);geo.computeVertexNormals();const o=mesh(geo,[metal,edge],parent);o.name='Forged blade with ground cutting bevels';return o;
}

// Named hero equipment uses the same geometry in the hand and on the inspection plinth.
function equipmentWeapon(item,rank){
 const d=weaponPattern(item),style=equipmentStyle(item),magic=equipmentMagic(item),aura=magic[0]?.color||style.glow,g=new T.Group(),type=d.type,variant=style.tier===0?0:d.shape;
 const metal=heroSurface('steel',style.metal,{roughness:Math.max(.42,style.roughness*.85),metalness:.80,normalScale:new T.Vector2(.055,.055)}),edge=heroSurface('steel',0xbcc7ca,{roughness:.31,metalness:.86,normalScale:new T.Vector2(.026,.026)}),trim=heroSurface('steel',style.trim,{roughness:.47,metalness:.77,normalScale:new T.Vector2(.045,.045)}),dark=heroSurface('steel',0x434d50,{roughness:.64,metalness:.63,normalScale:new T.Vector2(.07,.07)}),wood=heroSurface('timber',variant===1?0x686556:0x806a50),leather=heroSurface('leather',0x403329),glow=mat(aura||style.trim,.35,.35,{emissive:aura||0,emissiveIntensity:aura?.8:0});
 const line=(a,b,r=.007,m=trim)=>beam(g,a,b,r,m,8);
 const gem=(x,y,z,r=.025)=>{const o=mesh(new T.OctahedronGeometry(r,1),glow,g,x,y,z);o.scale.y=1.4;return o;};
 const wrap=(x,y,n,r=.036)=>{for(let i=0;i<n;i++){const ring=mesh(new T.TorusGeometry(r,.003,4,12),i%4===0?dark:leather,g,x,y+i*.021,0);ring.rotation.x=Math.PI/2+.13;}};
 const rivet=(x,y,z)=>{const o=sphere(g,.006,[x,y,z],trim,8);o.scale.z=.6;};
 const plate=(points,z,m)=>{const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(new T.ExtrudeGeometry(s,{depth:.01,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1}),m,g,0,0,z);};
 if(type==='sword'){
  const width=variant===1?.043:variant===2?.037:.034,tip=variant===2?1.27:1.15;
  groundBlade(g,[[.165,width,.012],[.25,width*.97,.014],[.77,width*.85,.011],[tip-.20,width*.65,.008],[tip,.0006,.0003]],metal,edge);
  // A fine inset fuller leaves the bevels visible. It ends before the point.
  for(const z of [-1,1])weaponCord(g,[[0,.26,z*.0144],[0,.60,z*.0125],[0,tip-.22,z*.0094]],.0018,dark,'Recessed blade fuller');
  const handle=mesh(new T.LatheGeometry([new T.Vector2(.024,-.145),new T.Vector2(.029,-.12),new T.Vector2(.026,.01),new T.Vector2(.024,.10)],16),leather,g);handle.scale.z=.82;handle.name='Waisted leather sword grip';
  leatherLacing(g,0,-.13,.223,.028,leather,13);
  for(const y of [-.148,.10])cyl(g,.030,.030,.017,[0,y,0],dark,16);
  cyl(g,.023,.025,.043,[0,.126,0],dark,16).name='Sword grip bolster';
  const pommel=cyl(g,.041,.041,.031,[0,-.191,0],metal,24);pommel.rotation.x=Math.PI/2;pommel.scale.y=.80;pommel.name='Peened wheel pommel';
  for(const z of [-.019,.019]){const rim=mesh(new T.TorusGeometry(.033,.0032,6,28),style.tier>=2?trim:edge,g,0,-.191,z);rivet(0,-.191,z*1.25);}
  cyl(g,.015,.022,.018,[0,-.228,0],dark,12);
  weaponSweep(g,[[-.193,.143,0],[-.15,.157,0],[-.069,.170,0],[0,.158,0],[.069,.170,0],[.15,.157,0],[.193,.143,0]],[.010,.014,.024,.014,.010],[.010,.015,.022,.015,.010],style.tier>=2?trim:metal,'Swept forged crossguard',32);
  for(const side of [-1,1]){
   const end=sphere(g,.015,[side*.193,.143,0],metal,12);end.scale.set(.72,1.25,.9);
   if(style.tier>=2){weaponCord(g,[[side*.02,.165,.023],[side*.075,.175,.019],[side*.143,.161,.015]],.0017,dark,'Crossguard engraved line');rivet(side*.115,.165,.018);}
  }
  // The chappe protects the grip/blade join; a small solar seal identifies the order.
  plate([[-.028,.14],[-.031,.197],[0,.219],[.031,.197],[.028,.14]],-.016,dark);
  if(style.tier>=2){const seal=sunBadge(g,.028,trim);seal.position.set(0,.177,.014);seal.scale.z=.30;}
  if(variant===2)for(const side of [-1,1])plate([[side*.088,.166],[side*.15,.208],[side*.17,.228],[side*.135,.204],[side*.060,.184]],-.010,trim);
  for(let n=0;n<Math.min(5,item.plus||0);n++)line([-.012,.237+n*.023,.015],[.004,.242+n*.023,.015],.0008,trim);
 }else if(type==='spear'){
  cyl(g,.024,.030,2.18,[0,.22,0],wood,12);cyl(g,.036,.034,.34,[0,-.05,0],leather,12);wrap(0,-.21,16,.036);
  const tip=cyl(g,0,variant===1?.1:.075,.5,[0,1.54,0],edge,4);tip.rotation.y=Math.PI/4;cyl(g,.047,.036,.18,[0,1.28,0],metal,12);
  for(const z of [-.038,.038])line([0,1.35,z],[0,1.70,z*.25],.008,metal);
  for(const yy of [1.2,1.25,1.3])cyl(g,.048,.048,.014,[0,yy,0],trim,12);
  if(variant)for(const side of [-1,1]){line([0,1.25,0],[side*.105,1.40,0],.012);line([side*.105,1.40,0],[side*.10,variant===1?1.59:1.72,0],.009,metal);}
 }else if(type==='hammer'){
  const haft=cyl(g,.024,.033,1.35,[0,.22,0],wood,16);haft.scale.z=.87;haft.name='Tapered ash haft';
  cyl(g,.036,.035,.37,[0,-.26,0],leather,16);leatherLacing(g,0,-.432,.345,.0365,leather,18);
  for(const y of [-.458,-.067])cyl(g,.039,.038,.023,[0,y,0],dark,16);
  const pommel=mesh(new T.LatheGeometry([new T.Vector2(.020,-.493),new T.Vector2(.034,-.486),new T.Vector2(.041,-.470),new T.Vector2(.036,-.454)],16),metal,g);pommel.name='Forged haft heel';
  const width=variant===1?.47:.38,half=width*.5,cheekDepth=y=>.094-Math.max(0,Math.abs(y-.94)-.0627)*.89;
  if(variant===2){
   const bell=mesh(new T.LatheGeometry([new T.Vector2(.125,.790),new T.Vector2(.150,.805),new T.Vector2(.150,.833),new T.Vector2(.102,.92),new T.Vector2(.080,1.047),new T.Vector2(.040,1.085)],24),metal,g);bell.name='Forged bell maul';
   for(const y of [.811,1.033])cyl(g,y<.9?.153:.084,y<.9?.153:.084,.012,[0,y,0],edge,24);
   for(let k=0;k<8;k++){const angle=k*Math.PI/4;weaponCord(g,[[Math.sin(angle)*.134,.817,Math.cos(angle)*.134],[Math.sin(angle)*.095,.934,Math.cos(angle)*.095],[Math.sin(angle)*.078,1.024,Math.cos(angle)*.078]],.0028,trim,'Bell forged flute');}
  }else{
   // An octagonal hammer core widens into hardened striking faces rather than a cuboid.
   const profile=[[0,.085],[.65,.085],[1,.055],[1,-.055],[.65,-.085],[-.65,-.085],[-1,-.055],[-1,.055],[-.65,.085]],shape=new T.Shape();
   profile.forEach(([u,v],i)=>i?shape.lineTo(u*.087,v*1.14):shape.moveTo(u*.087,v*1.14));shape.closePath();
   const core=mesh(new T.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSize:.007,bevelThickness:.008,bevelSegments:2,steps:1}),metal,g,-half,.94,0);core.rotation.y=Math.PI/2;core.name='Octagonal forged hammer core';
   for(const side of [-1,1]){
    const face=mesh(new RoundedBoxGeometry(.028,.235,.194,3,.015),edge,g,side*(half+.008),.94,0);face.name='Hardened striking face';
    const collar=mesh(new RoundedBoxGeometry(.018,.232,.194,2,.012),dark,g,side*(half-.024),.94,0);collar.name='Shrunk iron striking collar';
    for(const z of [-1,1]){
     for(const yy of [.866,1.011])weaponCord(g,[[side*.049,yy,z*cheekDepth(yy)],[side*(half-.065),yy,z*cheekDepth(yy)],[side*(half-.045),yy+(.94-yy)*.18,z*cheekDepth(yy+(.94-yy)*.18)]],.0016,trim,'Inset cheek engraving');
     for(const y of [.875,1.003])rivet(side*(half-.054),y,z*cheekDepth(y));
    }
    if(variant===1)for(let k=0;k<2;k++){const tooth=cyl(g,0,.018,.037,[side*(half+.036),.898+k*.081,0],dark,4);tooth.rotation.z=-side*Math.PI/2;}
   }
   for(const z of [-1,1]){const seal=sunBadge(g,style.tier>=2?.051:.035,style.tier>=2?trim:dark);seal.position.set(0,.944,z*.094);seal.rotation.y=z<0?Math.PI:0;seal.scale.z=.38;}
  }
  // Langets brace the head to the wood; pin heads make the assembly legible.
  for(const z of [-1,1]){
   plate([[-.021,.59],[-.026,1.065],[.026,1.065],[.021,.59],[0,.565]],z*.030,dark);
   for(const y of [.64,.744,1.065])rivet(0,y,z*.047);
  }
  for(const yy of [.68,.765,1.074])cyl(g,.038,.036,.018,[0,yy,0],trim,16);
 }else if(type==='bow'){
  for(const side of [-1,1]){
   const points=[[.23,0,0],[variant===2?.284:.264,side*.25,0],[.210,side*.47,0],[variant===1?.050:.090,side*.690,0],[variant===1?-.024:.027,side*.795,0],[variant===1?-.040:.080,side*.85,0]];
   weaponSweep(g,points,[.023,.022,.018,.013,.008,.0045],[.013,.012,.010,.008,.005,.003],wood,'Tapered recurved bow limb',44);
   const backing=points.map(([x,y,z])=>[x,y,z+.010]);
   weaponSweep(g,backing,[.018,.018,.014,.010,.005,.003],[.0025,.0022,.002,.0015,.001,.0006],variant===2?metal:dark,'Bonded horn backing',44);
   const tip=points.at(-1),nock=cyl(g,.007,.009,.035,[tip[0],tip[1]-side*.01,0],style.tier>=2?trim:dark,10);nock.rotation.z=-side*.70;nock.name='Horn string nock';
   for(const f of [.27,.66]){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),p=curve.getPoint(f),v=curve.getTangent(f),n=new T.Vector3(-v.y,v.x,0);weaponCord(g,[[p.x-n.x*.015,p.y-n.y*.015,.011],[p.x,p.y,.014],[p.x+n.x*.015,p.y+n.y*.015,.011]],.003,style.tier>=2?trim:leather,'Bow limb binding');}
   if(style.tier>=2){const p=points[1];const fastening=cyl(g,.011,.011,.006,[p[0],p[1],.019],trim,12);fastening.rotation.x=Math.PI/2;rivet(p[0],p[1],.023);}
   if(variant===1)for(let j=0;j<2;j++){const yy=side*(.26+j*.15),xx=.262-j*.025;plate([[xx-.012,yy],[xx-.041,yy+side*.035],[xx-.050,yy+side*.080],[xx-.01,yy+side*.053]],-.005,trim);}
  }
  const tipX=variant===1?-.04:.08;line([tipX,-.85,0],[tipX,.85,0],.0012,mat(0xc9c2ac));
  for(let k=0;k<8;k++)line([tipX-.0015,-.032+k*.008,0],[tipX+.0015,-.032+k*.008,0],.001,leather);
  cyl(g,.028,.027,.208,[.23,0,0],leather,16);leatherLacing(g,.23,-.103,.208,.028,leather,12);
  for(const y of [-.112,.112])cyl(g,.031,.031,.012,[.23,y,0],style.tier>=2?trim:dark,16);
  // An arrow shelf is fitted just above the grip, never across the bowstring.
  line([.229,.13,0],[.209,.13,.035],.005,dark);g.rotation.set(0,Math.PI/2,Math.PI/2);
 }else{
  cyl(g,.028,.034,1.82,[0,.38,0],wood,12);cyl(g,.039,.039,.3,[0,-.12,0],leather,12);wrap(0,-.25,14,.039);
  const radius=variant===2?.18:.14;mesh(new T.TorusGeometry(radius,.012,8,32),trim,g,0,1.50,0);gem(0,1.51,0,variant===2?.087:.09);
  for(const side of [-1,1]){line([0,1.24,0],[side*.10,1.33,0],.016,metal);line([side*.10,1.33,0],[side*.12,1.6,0],.009);}
  for(const yy of [1.08,1.16,1.24])cyl(g,.05,.048,.018,[0,yy,0],trim,12);
  if(variant===1)for(const side of [-1,1])gem(side*.13,1.66,0,.031);
  if(variant===2){mesh(new T.TorusGeometry(.215,.005,5,32,Math.PI*1.6),metal,g,0,1.5,0).rotation.z=.6;gem(0,1.77,0,.023);}
 }
 if(!['sword','hammer','bow'].includes(type))for(let j=0;j<=(item.plus||0);j++)cyl(g,.043,.043,.008,[0,-.10+j*.027,0],trim,10);
 g.userData={type,itemId:item.id,pattern:item.weaponPattern||DEFAULT_PATTERNS[type],power:d.power||null,forge:item.plus,craftedWeapon:['sword','hammer','bow'].includes(type),weaponVariant:variant};decorateWeapon(g,item);for(const child of g.children){if(type==='bow')child.position.x-=.23;else if(type==='hammer')child.position.y+=.24;else if(type==='staff')child.position.y+=.10;else if(type==='spear')child.position.y+=.05;}return g;
}

export function equipmentShield(item){const s=equipmentStyle(item),colors=[0x695b46,0x5b6458,0x315e89,0x563c75,0x233950,0x283854,0x73889b],g=shield(s.rank,colors[s.tier]);g.scale.x=.84;g.scale.y=.94;g.userData={type:'shield',itemId:item.id,rarity:s.tier};decorateShield(g,item);return g;}
