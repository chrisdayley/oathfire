import {castleReserved} from './siege-rules.js';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {box,cyl,mesh,beam} from './art.js';
import {material,worldMaterial} from './materials.js';
import {windowArch} from './environment-design.js';
import {seeded} from './data.js';

// Built geometry is merged with the landscape; plants use shared instanced meshes.
// Decorative horizons sit beyond the playable bounds. Solid foreground props register
// both Rapier colliders and navigation footprints, preserving the wide combat lanes.
export function livingWorld(w){
 const r=seeded(w.seed+61283),g=w.static,m=w.materials;
 const slate=worldMaterial('stone',0x394957,1.1),ochre=worldMaterial('stone',0xc4ac83,2),rose=worldMaterial('stone',0xa58373,2),white=worldMaterial('stone',0xe0d4b3,2),red=material('cloth',0x813f39),blue=material('cloth',0x354c79),copper=material('steel',0xa67945,{metalness:.55,roughness:.55});
 const terraceMat=worldMaterial('soil',0x747956,12);
 const roofMats=[slate,worldMaterial('stone',0x734e3e,1.2),worldMaterial('stone',0x56604f,1.2)];
 function house(x,y,z,size=1,variant=0,solid=false){
  const h=new T.Group();h.position.set(x,y,z);g.add(h);const sx=4.8*size,sz=4*size,hh=3.4*size;
  box(h,[sx,hh,sz],[0,hh/2,0],[white,ochre,rose][variant%3]);
  for(const zz of [-sz/2-.025,sz/2+.025]){for(const xx of [-sx/2+.12,0,sx/2-.12])box(h,[.13*size,hh,.14*size],[xx,hh/2,zz],m.wood);box(h,[sx,.14*size,.15*size],[0,hh*.55,zz],m.wood);for(const xx of [-sx*.25,sx*.25])windowArch(h,xx,hh*.6,zz,.48*size,.72*size,m,zz<0?Math.PI:0);}
  const roof=mesh(new T.ConeGeometry(1,1,4),roofMats[variant%3],h,0,hh+size*.95,0);roof.scale.set(sx*.82,1.9*size,sz*.86);roof.rotation.y=Math.PI/4;
  box(h,[.53*size,2.3*size,.6*size],[sx*.29,hh+.8*size,.3*size],m.stone);box(h,[.75*size,.16*size,.8*size],[sx*.29,hh+1.96*size,.3*size],m.cap);
  for(const xx of [-sx*.35,sx*.35])box(h,[.36*size,.67*size,.08*size],[xx,hh*.30,-sz/2-.055],variant%2?blue:red);
  if(solid){w.physics.addBox(x,y+hh/2,z,sx,hh,sz,'cottage');w.nav.push({x,z,hx:sx/2+.6,hz:sz/2+.6,top:y+hh});}
 }
 function spire(x,y,z,s=1){cyl(g,1.6*s,1.8*s,9*s,[x,y+4.5*s,z],m.stone,16);for(const yy of [2,6,8.5])cyl(g,1.78*s,1.8*s,.20*s,[x,y+yy*s,z],m.cap,16);cyl(g,0,2.25*s,4.6*s,[x,y+11.3*s,z],slate,16);beam(g,[x,y+13.5*s,z],[x,y+14.6*s,z],.05*s,copper);for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5])windowArch(g,x+Math.sin(angle)*1.61*s,y+6.3*s,z+Math.cos(angle)*1.61*s,.45*s,1.3*s,m,angle);}
 // A terraced settlement, a distant abbey, a viaduct and watermill tell the eye
 // what lies beyond each edge of the arena instead of surrounding it with a ring.
 for(const side of [-1,1])for(let row=0;row<3;row++)for(let i=0;i<6;i++){
  const x=side*(142+row*19)+r()*6,z=-40-i*29-row*8,y=2+row*3+r()*2;
  const terrace=mesh(new T.CylinderGeometry(12,17,6,12),terraceMat,g,x,y-3,z);house(x,y,z,1.1+r()*.5,i+row);
  if(i%2===0)spire(x+side*7,y,z+8,.62);
 }
 box(g,[48,7,29],[-172,9,-207],m.stone);house(-172,12.5,-207,4,0);for(const x of [-197,-149])spire(x,8,-197,2.5);
 for(let i=0;i<9;i++){const x=126+i*10,z=-132,y=2;cyl(g,1.25,1.9,12,[x,6,z],m.stone,10);box(g,[11,.8,5],[x,12,z],m.cap);for(const edge of [-2.3,2.3])box(g,[11,.7,.4],[x,12.8,z+edge],m.stone);if(i<8){const arch=new T.Mesh(new T.TorusGeometry(4.7,.55,5,14,Math.PI),m.cap);arch.position.set(x+5,7.7,z);g.add(arch);}}
 // A mill beside the hidden mill chest is also a useful orientation landmark.
 const mx=66,mz=-42,my=w.height(mx,mz);house(mx,my,mz,1.8,1,true);const wheel=new T.Group();wheel.position.set(mx-4.8,my+2.6,mz);wheel.rotation.y=Math.PI/2;w.dynamic.add(wheel);const rim=mesh(new T.TorusGeometry(2.35,.13,6,32),m.wood,wheel);for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(wheel,[0,0,0],[Math.sin(a)*2.35,Math.cos(a)*2.35,0],.065,m.wood);const blade=box(wheel,[.75,.30,.65],[Math.sin(a)*2.33,Math.cos(a)*2.33,0],m.wood);blade.rotation.z=-a;}w.scenicMotion.push({object:wheel,axis:'z',speed:.13});w.physics.addBox(mx-4.8,my+2.6,mz,.7,4.7,4.7,'mill-wheel');w.nav.push({x:mx-4.8,z:mz,hx:1,hz:2.9,top:my+5});
 // Broken roadside masonry and milestone lanterns leave the center and flank paths open.
 for(const [x,z]of [[-28,-49],[32,-88],[-41,-130],[40,-169],[82,-98]]){if(castleReserved(w,x,z,8))continue;const y=w.height(x,z);for(let i=0;i<5;i++){const xx=x+i*1.18,hh=.7+(i%3)*.40;w.solid([1.08,hh,.70],[xx,y+hh/2,z],m.stone,'ruin-wall');box(g,[1.14,.12,.78],[xx,y+hh+.06,z],m.cap);}cyl(g,.43,.58,2.4,[x-1,y+1.2,z],m.stoneDark,8);cyl(g,.62,.45,.18,[x-1,y+2.48,z],m.cap,8);}
 // Pebbles, ferns and wildflowers form irregular islands rather than a uniform lawn.
 const plantMats=[material('cloth',0x667549,{side:T.DoubleSide}),material('cloth',0xb79554,{side:T.DoubleSide}),material('cloth',0x785185,{side:T.DoubleSide}),material('cloth',0xd8c499,{side:T.DoubleSide})];
 const fernGeo=new T.BufferGeometry(),fp=[],fi=[];for(let b=0;b<7;b++){const a=b*2.4;for(let j=0;j<5;j++){const t=j/5,len=.6*(1-t),rad=.20+j*.09,yy=.12+Math.sin(t*Math.PI)*.35;for(const side of [-1,1]){const off=fp.length/3;fp.push(Math.sin(a)*rad,yy,Math.cos(a)*rad,Math.sin(a)*rad+Math.cos(a)*len*side,yy+.04,Math.cos(a)*rad-Math.sin(a)*len*side,Math.sin(a)*(rad+.10),yy+.05,Math.cos(a)*(rad+.10));fi.push(off,off+1,off+2);}}}fernGeo.setAttribute('position',new T.Float32BufferAttribute(fp,3));fernGeo.setIndex(fi);fernGeo.computeVertexNormals();
 const petals=[];for(let k=0;k<5;k++){const a=k*Math.PI*2/5,p=new T.PlaneGeometry(.11,.052,1,1);p.rotateX(-Math.PI/2);p.rotateY(-a);p.translate(Math.cos(a)*.035,.37,Math.sin(a)*.035);petals.push(p);}const stalk=new T.CylinderGeometry(.004,.006,.36,3);stalk.translate(0,.18,0);petals.push(stalk);const flowerGeo=mergeGeometries(petals);petals.forEach(p=>p.dispose());const pebbleGeo=new T.IcosahedronGeometry(.15,0);
 for(let type=0;type<5;type++){const n=type===0?1400:type===4?1200:700,mat=type===4?m.stoneDark:plantMats[type],im=new T.InstancedMesh(type===0?fernGeo:type===4?pebbleGeo:flowerGeo,mat,n),o=new T.Object3D();for(let i=0;i<n;i++){let x=(r()-.5)*232,z=-29-r()*192;const patch=Math.sin(x*.14+z*.067)*Math.cos(z*.16);if(castleReserved(w,x,z,2)||Math.abs(x-Math.sin(z*.025)*4)<8||patch<-.18){x=(x<0?-1:1)*(85+r()*29);}o.position.set(x,w.height(x,z)+.02,z);o.rotation.set(type===4?r()*3:0,r()*6.28,type===4?r()*3:0);const size=w.biome==='snow'?.38:w.biome==='desert'?.65:1;o.scale.setScalar((.45+r()*.75)*size);o.updateMatrix();im.setMatrixAt(i,o.matrix);}im.receiveShadow=true;im.castShadow=false;im.computeBoundingSphere();w.root.add(im);}
 // A ruined wayside chapel and orchard farms create navigable flank landmarks.
 const cx=-67,cz=-115,cy=w.height(cx,cz);
 for(const side of [-1,1]){for(let j=0;j<5;j++){const zz=cz+j*2.8,hh=j%3===0?3.4:1.4+j*.2;w.solid([.8,hh,2.5],[cx+side*5,cy+hh/2,zz],m.stone,'chapel-wall');box(g,[1.05,.16,2.6],[cx+side*5,cy+hh+.08,zz],m.cap);}for(let j=0;j<4;j++){const zz=cz+j*3.5;w.solid([1.0,4.5,.8],[cx+side*4.6,cy+2.25,zz],m.stoneDark,'chapel-column');box(g,[1.3,.24,1.1],[cx+side*4.6,cy+4.6,zz],m.cap);}}
 const arch=new T.Mesh(new T.TorusGeometry(4.6,.34,6,20,Math.PI),m.cap);arch.position.set(cx,cy+4.45,cz);g.add(arch);for(const side of [-1,1])windowArch(g,cx+side*3.8,cy+.5,cz-.43,.65,2.8,m,Math.PI);
 for(let i=0;i<13;i++){const a=r()*6.28,rr=4+r()*7;const x=cx+Math.sin(a)*rr,z=cz+7+Math.cos(a)*rr;const stone=box(g,[.6+r()*.5,.3+r()*.4,.5],[x,w.height(x,z)+.15,z],m.cap);stone.rotation.y=a;}
 for(const [x,z]of [[84,-72],[-91,-174]]){const y=w.height(x,z);house(x,y,z,1.6,x>0?2:1,true);for(let line=0;line<2;line++){const zz=z+6+line*9;for(let j=0;j<8;j++){const xx=x-9+j*2.6,yy=w.height(xx,zz);w.solid([.12,1.2,.12],[xx,yy+.6,zz],m.wood,'fence-post');if(j<7)for(const h of [.45,.9]){beam(g,[xx,yy+h,zz],[xx+2.6,w.height(xx+2.6,zz)+h,zz],.044,m.wood);w.physics.addBox(xx+1.3,yy+h,zz,2.6,.09,.10,'fence-rail');}if(j<7)w.nav.push({x:xx+1.3,z:zz,hx:1.9,hz:.65,top:yy+1.2});}}}
 // Banners and equipment mark the supply camp, with the approach kept open.
 for(const [x,z]of [[-53,-73],[-43,-73]]){const y=w.height(x,z);w.solid([1.8,.8,1.1],[x,y+.4,z],m.wood,'supply-crate');for(const dx of [-.65,.65])box(g,[.07,.84,1.15],[x+dx,y+.42,z],m.iron);}
 // Flower beds and handcarts break up the paved courtyard at its edges.
 for(const [x,z]of [[-14,-2],[14,-2],[-16,12],[16,13]]){const soil=worldMaterial('soil',0x635344,1);w.solid([2.8,.35,1.1],[x,.175,z],m.cap,'flower-bed');box(g,[2.58,.04,.89],[x,.37,z],soil);for(let j=0;j<35;j++){const xx=x+(r()-.5)*2.5,zz=z+(r()-.5)*.8,h=.5+r()*.45;beam(g,[xx,.38,zz],[xx,h,zz],.009,plantMats[0]);const fl=mesh(flowerGeo,j%3===0?red:j%3===1?plantMats[2]:plantMats[3],g,xx,h-.34,zz);fl.scale.setScalar(1.4);}}
 for(const [x,z]of [[-17,16],[18,20]]){w.solid([1.8,.75,2.6],[x,.65,z],m.wood,'handcart');for(const side of [-1,1]){const wheel=mesh(new T.TorusGeometry(.48,.075,6,16),m.wood,g,x+side*1.04,.48,z+.3);wheel.rotation.y=Math.PI/2;for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(g,[x+side*1.04,.48,z+.3],[x+side*1.04,.48+Math.sin(a)*.47,z+.3+Math.cos(a)*.47],.022,m.wood);}beam(g,[x+side*.7,.65,z-1.2],[x+side*.7,.8,z-3],.06,m.wood);}for(let i=0;i<4;i++){const sack=mesh(new T.SphereGeometry(1,10,6),i%2?red:ochre,g,x+(i%2-.5)*.6,1.12,z+Math.floor(i/2)*.7-.4);sack.scale.set(.34,.45,.39);}}
 // Battlements are individually dressed with uneven mortar courses, cut corner
 // stones, brighter shutters, hanging lamps and overlapping slate shingles.
 const shades=[white,ochre,rose,m.cap,m.stoneDark];
 for(const side of [-1,1])for(let row=0;row<10;row++)for(let i=0;i<10;i++){
  const x=side*(7.7+i*2.40+(row%2)*.8),y=.3+row*.48,z=-15.46;if(Math.abs(x)>31)continue;
  const b=box(g,[1.00+r()*1.15,.35+r()*.055,.09+r()*.05],[x,y,z],shades[Math.floor(r()*5)]);b.rotation.z=(r()-.5)*.014;
 }
 for(const [x,z,width]of [[-24,12,10.8],[25,13,9.8],[-25,25,7.8],[25,26,7.8]]){
  // Roof courses follow the four-sided gable, adding a readable layered silhouette.
  for(let j=0;j<9;j++){const yy=6.5+j*.22,rr=1-j/10;for(const sign of [-1,1]){box(g,[width*rr+.4,.09,.20],[x,yy,z+sign*2.95*rr],roofMats[j%3]);}}
  for(const dx of [-width*.28,width*.28]){for(const xx of [-.60,.60]){box(g,[.28,1.04,.15],[x+dx+xx,5.15,z-3.08],x<0?red:blue);for(const yy of [4.77,5.43])box(g,[.30,.06,.18],[x+dx+xx,yy,z-3.09],m.iron);}box(g,[1.85,.21,.54],[x+dx,4.35,z-3.05],m.wood);for(let j=0;j<12;j++){const fl=mesh(new T.IcosahedronGeometry(.07,0),j%2?red:plantMats[2],g,x+dx-.65+j*.12,4.60+r()*.12,z-3.11);beam(g,[fl.position.x,4.4,z-3.11],fl.position.toArray(),.008,plantMats[0]);}}
  for(const sign of [-1,1]){const xx=x+sign*(width/2-.3);beam(g,[xx,2.7,z-3],[xx,2.7,z-3.8],.045,m.iron);beam(g,[xx,2.7,z-3.8],[xx,2.25,z-3.8],.018,m.iron);const glass=material('cloth',0xffc772,{emissive:0xff913d,emissiveIntensity:.9});box(g,[.24,.38,.24],[xx,2.08,z-3.8],glass);for(const dx of [-.14,.14])for(const dz of [-.14,.14])beam(g,[xx+dx,1.85,z-3.8+dz],[xx+dx,2.32,z-3.8+dz],.015,m.iron);cyl(g,0,.25,.21,[xx,2.43,z-3.8],m.iron,4);}
 }
 // Colorful striped drapes, baskets of produce, pottery and lumber at market edges.
 for(const [x,z]of [[-21.5,3.3],[22,3.8],[-22,19],[23,20]]){
  for(let i=0;i<7;i++){const cloth=mesh(new T.PlaneGeometry(.46,3.75,1,10),x<0?red:blue,g,x-2.85+i*.96,3.105,z);cloth.rotation.x=-Math.PI/2;const a=cloth.geometry.attributes.position;for(let j=0;j<a.count;j++)a.setZ(j,-Math.cos((x-2.85+i*.96-x)*Math.PI/6.8)*.27+(a.getY(j)+1.9)*.12+.006);cloth.geometry.computeVertexNormals();}
  for(let j=0;j<5;j++){const xx=x-1.15+j*.54;for(let k=0;k<9;k++){const fruit=mesh(new T.IcosahedronGeometry(.075,1),j%2?red:plantMats[1],g,xx+(k%3-.5)*.095,1.25+Math.floor(k/3)*.034,z+.28+(k%2)*.11);}}
  for(const dx of [-2.5,2.5]){const xx=x+dx;w.solid([.6,.75,.6],[xx,.375,z+.5],m.wood,'market-crate');for(let j=0;j<5;j++)box(g,[.65,.07,.04],[xx,.08+j*.14,z+.17],m.iron);const pot=cyl(g,.20,.28,.42,[xx,.99,z+.5],rose,12);cyl(g,.21,.21,.05,[xx,1.22,z+.5],m.dark,12);}
 }
 for(const x of [-29,29])for(let i=0;i<9;i++){const log=cyl(g,.14,.16,1.5,[x+(i%3)*.26,.18+Math.floor(i/3)*.24,10],m.wood,8);log.rotation.x=Math.PI/2;}
 w.root.userData.dressing={villages:36,abbey:true,viaduct:true,mill:true,plants:4700,revision:2};
}

export function distantRanges(w){
 const r=seeded(971),m=worldMaterial('rock',0xb4b9bc,24,{vertexColors:true,roughness:1});
 // Continuous low country connects the arena to the horizon; towns never sit in a void.
 const land=new T.PlaneGeometry(1000,900,100,90);land.rotateX(-Math.PI/2);land.translate(0,0,-120);const lp=land.attributes.position,indices=[];for(let i=0;i<lp.count;i++){const x=lp.getX(i),z=lp.getZ(i);lp.setY(i,-3+Math.sin(x*.018)*Math.cos(z*.024)*2.2);}for(let i=0;i<land.index.count;i+=3){const ids=[land.index.getX(i),land.index.getX(i+1),land.index.getX(i+2)],x=ids.reduce((n,k)=>n+lp.getX(k),0)/3,z=ids.reduce((n,k)=>n+lp.getZ(k),0)/3;if(Math.abs(x)>124||z< -230||z>54)indices.push(...ids);}land.setIndex(indices);land.computeVertexNormals();const lowland=mesh(land,worldMaterial(w.biome==='snow'?'rock':'grass',w.biome==='snow'?0xd7dfdc:w.biome==='desert'?0xbda878:0xaab19a,7),w.root);lowland.castShadow=false;
 // Jagged ranges in three staggered depths: angular rock, snow line, atmospheric color.
 for(let band=0;band<3;band++){const n=240,rows=10,pos=[],uv=[],colors=[],idx=[];for(let row=0;row<=rows;row++)for(let i=0;i<=n;i++){
  const a=i/n*Math.PI*2,dist=350+band*125+row*22,peaks=18+Math.abs(Math.sin(a*7+band*.7))*36+Math.abs(Math.sin(a*19+band))*14+Math.sin(a*37)*6;
  const ridge=Math.max(0,1-Math.abs(row-4)/4),y=-8+peaks*ridge*(.65+band*.38);pos.push(Math.sin(a)*dist,y,-82+Math.cos(a)*dist);uv.push(i/n*40,row*2);
  const c=new T.Color(band===0?0x8c9993:band===1?0x9ba7b7:0xb2bdce);c.multiplyScalar(.77+r()*.24);if(y>70+band*8)c.lerp(new T.Color(0xe4dfd8),Math.min(.9,(y-70-band*8)/27));colors.push(c.r,c.g,c.b);if(row<rows&&i<n){const k=row*(n+1)+i;idx.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(idx);geo.computeVertexNormals();const ridge=mesh(geo,m,w.root);ridge.castShadow=false;
 }
 // Alpha-tested branching woodland cards form a detailed horizon with few triangles.
 const atlas=woodlandAtlas(),treeMat=new T.MeshStandardMaterial({map:atlas,alphaTest:.52,side:T.DoubleSide,roughness:1,color:0xffffff}),geo=new T.PlaneGeometry(1,1),im=new T.InstancedMesh(geo,treeMat,1000),o=new T.Object3D(),col=new T.Color();
 for(let i=0;i<500;i++){const side=i%2?-1:1,x=side*(136+r()*97),z=-245+r()*280,y=1+r()*3,h=7+r()*12,wide=h*(.6+r()*.2);for(let face=0;face<2;face++){o.position.set(x,y+h/2,z);o.rotation.y=face*Math.PI/2;o.scale.set(wide,h,1);o.updateMatrix();im.setMatrixAt(i*2+face,o.matrix);col.setHex(i%7===0?0xb3a272:i%9===0?0xb08862:0x9aad8c);im.setColorAt(i*2+face,col);}}im.castShadow=false;im.computeBoundingSphere();w.root.add(im);
}
let woodlandTexture;
function woodlandAtlas(){if(woodlandTexture)return woodlandTexture;const c=document.createElement('canvas');c.width=512;c.height=640;const x=c.getContext('2d'),r=seeded(4562);x.clearRect(0,0,512,640);
 function branch(px,py,len,a,width,depth){const ex=px+Math.cos(a)*len,ey=py+Math.sin(a)*len;x.strokeStyle='#67503b';x.lineWidth=width;x.lineCap='round';x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(a+.14)*len*.6,py+Math.sin(a+.14)*len*.6,ex,ey);x.stroke();if(depth>0){branch(ex,ey,len*.75,a-.40-r()*.28,width*.64,depth-1);branch(ex,ey,len*.66,a+.33+r()*.3,width*.60,depth-1);}else for(let i=0;i<100;i++){const angle=r()*6.28,rr=Math.sqrt(r())*46;x.fillStyle=['#536142','#78834e','#899357','#626f43','#a3a868'][Math.floor(r()*5)];x.beginPath();x.ellipse(ex+Math.cos(angle)*rr,ey+Math.sin(angle)*rr*.9,3+r()*5,2+r()*4,r()*6,0,6.28);x.fill();}}
 branch(256,639,167,-Math.PI/2,24,5);woodlandTexture=new T.CanvasTexture(c);woodlandTexture.colorSpace=T.SRGBColorSpace;woodlandTexture.userData.shared=true;return woodlandTexture;}
