import * as T from 'three';
import {box,cyl,mesh,beam} from './art.js';
import {material,worldMaterial} from './materials.js';
import {seeded,BIOMES} from './data.js';

// The fire is a moving, tapered volume made from three intersecting flame sheets.
// Its silhouette comes from noise, rather than an opaque crystal or cone.
export function flameVolume(size=1){
 const m=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
 void main(){float y=vUv.y;float n=noise(vec2(vUv.x*6.,y*7.-time*3.));float curl=(sin(y*9.-time*3.)*.07+sin(y*17.-time*4.)*.03)*y;float width=(1.-y)*.43+.018;float core=1.-abs(vUv.x-.5+curl)/width;float f=core-.68*n-.43*y+noise(vec2(vUv.x*12.+time*.4,y*16.-time*6.))*.17;float a=smoothstep(.03,.28,f)*smoothstep(0.,.07,y)*smoothstep(1.,.78,y);vec3 col=mix(vec3(.65,.035,.003),vec3(1.,.34,.015),smoothstep(.08,.6,f));col=mix(col,vec3(1.,.84,.32),smoothstep(.58,.94,f)*(1.-y));gl_FragColor=vec4(col*.95,a*.60);}`});
 const g=new T.Group();for(let i=0;i<3;i++){const p=new T.Mesh(new T.PlaneGeometry(size*.9,size*1.5),m);p.position.y=size*.75;p.rotation.y=i*Math.PI/3;g.add(p);}g.userData.flameMaterial=m;return g;
}
function archShape(radius,depth,segments=16){const shape=new T.Shape();shape.absarc(0,0,radius,0,Math.PI,false);shape.lineTo(-radius,0);const hole=new T.Path();hole.absarc(0,0,radius-depth,0,Math.PI,true);shape.holes.push(hole);return new T.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:1,steps:1,curveSegments:segments});}
export function windowArch(parent,x,y,z,w,h,m,angle=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=angle;parent.add(g);const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h-w/2);shape.absarc(0,h-w/2,w/2,0,Math.PI,false);shape.lineTo(-w/2,0);mesh(new T.ShapeGeometry(shape),m.dark,g,0,0,-.035);const top=mesh(archShape(w/2+.15,.16,10),m.cap,g,0,h-w/2,-.10);for(const side of [-1,1])box(g,[.16,h-w/2,.23],[side*(w/2+.06),(h-w/2)/2,0],m.cap);box(g,[w+.42,.16,.48],[0,-.07,.04],m.cap);beam(g,[0,.08,.01],[0,h-.16,.01],.032,m.iron);beam(g,[-w/2+.05,h*.42,.01],[w/2-.05,h*.42,.01],.024,m.iron);return g;}
export function refineCastle(world){const m=world.materials,g=world.static;
 // Voussoirs follow the existing collision opening. Two complete faces give the
 // passage depth when seen from either the courtyard or the open field.
 for(const [z,angle]of [[-14.48,0],[-19.52,Math.PI]]){
  const face=new T.Group();face.position.z=z;face.rotation.y=angle;g.add(face);
  const radius=4.1,rise=1.44,cy=4.72;
  for(let i=0;i<19;i++){const a0=i*Math.PI/19+.008,a1=(i+1)*Math.PI/19-.008,points=[];for(const [a,r,rr]of [[a0,radius,rise],[a1,radius,rise],[a1,radius+.44,rise+.44],[a0,radius+.44,rise+.44]])points.push(new T.Vector2(Math.cos(a)*r,cy+Math.sin(a)*rr));const s=new T.Shape(points);const block=mesh(new T.ExtrudeGeometry(s,{depth:.24,bevelEnabled:true,bevelThickness:.018,bevelSize:.02,bevelSegments:1,steps:1}),m.cap,face,0,0,0);}
  for(const side of [-1,1])for(let j=0;j<8;j++)box(face,[.55,.55,.29],[side*4.23,.31+j*.58,.04],j%2?m.cap:m.stoneDark);
  for(const x of [-6.4,6.4]){windowArch(face,x,4.9,.10,.8,1.8,m);for(const xx of [-1.3,0,1.3]){box(face,[.40,.66,.5],[x+xx,7.64,.05],m.cap);box(face,[.6,.18,.7],[x+xx,7.95,.05],m.cap);}box(face,[4.5,.23,.6],[x,7.98,.04],m.cap);}
 }
 // Arrow slits, projecting corbels, layered tower cornices and corner quoins.
 for(const x of [-33,33])for(const z of [-17,34]){
  for(const y of [.25,4.75,6.30])cyl(g,3.13,3.22,.22,[x,y,z],m.cap,24);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,dx=Math.sin(a)*3.12,dz=Math.cos(a)*3.12;windowArch(g,x+dx,2.8,z+dz,.44,1.65,m,a);const corbel=box(g,[.34,.64,.60],[x+dx*.96,5.83,z+dz*.96],m.stoneDark);corbel.rotation.y=a;}
 }
 for(const x of [-19,19])for(const offset of [-10,-5,5,10])windowArch(g,x+offset,2.4,-15.43,.32,1.35,m);
 for(const side of [-1,1])for(const z of [-8,0,8,16,24]){box(g,[.38,.30,2.6],[side*33.34,4.7,z],m.cap);for(let j=0;j<4;j++)box(g,[.45,.54,.78],[side*33.25,.29+j*.59,z],m.stoneDark);}
 for(const x of [-7,7]){windowArch(g,x,4.6,18.2,1.4,3.05,m,Math.PI);windowArch(g,x,4.6,19.76,1.4,3.05,m);}
 for(const x of [-9.8,9.8]){box(g,[.8,10,.6],[x,5,18.05],m.stoneDark);for(const y of [1,4,7,9.7])box(g,[1,.18,.85],[x,y,18],m.cap);}
 for(const z of [22,27,31])for(const x of [-11.85,11.85])windowArch(g,x,5,z,1.1,2.5,m,x>0?Math.PI/2:-Math.PI/2);
 // Timber joints and recessed shutters make the market feel built, not extruded.
 for(const x of [-24,25]){for(const dx of [-4.3,4.3]){beam(g,[x+dx,0,15.08],[x+dx,3.8,15.08],.09,m.wood);beam(g,[x+dx,1.1,15.12],[x+dx-Math.sign(dx)*2.3,3.7,15.12],.08,m.wood);}for(const dx of [-3.0,3.0])for(let i=0;i<5;i++)box(g,[.18,1.0,.12],[x+dx-.4+i*.19,2.1,15.16],m.wood);}
}
export function createBeacon(world){const m=world.materials,g=new T.Group();
 for(const [radius,y,h]of [[2.5,.13,.26],[2.08,.33,.17],[1.22,.56,.3]])cyl(g,radius,radius+.11,h,[0,y,0],m.cap,32);
 cyl(g,.57,.78,.85,[0,1.0,0],m.stone,16);cyl(g,.91,.65,.21,[0,1.48,0],m.iron,24);cyl(g,.94,.69,.34,[0,1.70,0],m.iron,24);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(g,[Math.sin(a)*.68,1.47,Math.cos(a)*.68],[Math.sin(a)*.92,2.07,Math.cos(a)*.92],.029,m.iron);}
 for(let i=0;i<5;i++){const log=cyl(g,.08,.09,1.10,[0,1.80,0],m.wood,8);log.rotation.z=Math.PI/2;log.rotation.y=i*Math.PI/5;}
 const fire=flameVolume(1.05);fire.position.y=1.80;g.add(fire);world.fireplaces.push({g,flame:fire,base:1.8});const light=new T.PointLight(0xff9038,10,9,2);light.position.y=2.5;g.add(light);g.position.set(0,0,6);return g;
}
function leafGeometry(){const p=[0,-.1,0,-.085,.06,.018,-.052,.19,.012,0,.28,0,.052,.19,.012,.085,.06,.018,0,.075,.035],uv=[.5,0,0,.4,.2,.75,.5,1,.8,.75,1,.4,.5,.5],idx=[];for(let i=0;i<6;i++)idx.push(i,(i+1)%6,6);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
export function detailedTree(world,x,y,z,h,pine,r){const trunk=world.materials.trunk||(world.materials.trunk=worldMaterial('timber',0x807568,1.8));
 cyl(world.static,.08,.30,h*.8,[x,y+h*.4,z],trunk,10);world.physics.addBox(x,y+h*.3,z,.55,h*.6,.55,'tree');world.nav.push({x,z,hx:.5,hz:.5,top:y+h});world.leafInstances ||= [];
 for(let b=0;b<9;b++){const a=b*2.4+r()*.5,spread=h*(pine?.24:.28)*(1-b*.055),by=y+h*(.36+b*.055),ex=x+Math.sin(a)*spread,ez=z+Math.cos(a)*spread,ey=by+h*.10;beam(world.static,[x,by,z],[ex,ey,ez],.025+(9-b)*.005,trunk,7);
  for(let fork=0;fork<3;fork++){const fa=a+(fork-1)*.6,fx=ex+Math.sin(fa)*spread*.40,fz=ez+Math.cos(fa)*spread*.4,fy=ey+(r()-.25)*h*.13;beam(world.static,[ex,ey,ez],[fx,fy,fz],.018,trunk,6);
   const count=pine?48:90;for(let i=0;i<count;i++){const theta=r()*Math.PI*2,radius=Math.sqrt(r())*spread*.56;world.leafInstances.push({x:fx+Math.cos(theta)*radius,y:fy+(r()-.5)*spread*.75,z:fz+Math.sin(theta)*radius,rx:r()*6,ry:r()*6,rz:r()*6,s:pine?.60+r()*.5:.65+r()*.6,v:r()});}
  }
 }
}
export function plantLeaves(world){const entries=world.leafInstances||[];if(!entries.length)return;const base=BIOMES[world.biome].grass,m=new T.MeshStandardMaterial({color:0xffffff,roughness:1,side:T.DoubleSide,emissive:base,emissiveIntensity:.035});m.onBeforeCompile=s=>{s.uniforms.uWind={value:0};world.leafShader=s;s.vertexShader='uniform float uWind;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x+=sin(uWind*1.3+instanceMatrix[3].x+instanceMatrix[3].z*.3)*position.y*.23;');};
 const bins=new Map();for(const e of entries){const key=Math.floor(e.x/32)+','+Math.floor(e.z/32);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(e);}const geo=leafGeometry(),d=new T.Object3D(),c=new T.Color();for(const group of bins.values()){const leaves=new T.InstancedMesh(geo,m,group.length);for(let i=0;i<group.length;i++){const e=group[i];d.position.set(e.x,e.y,e.z);d.rotation.set(e.rx,e.ry,e.rz);d.scale.setScalar(e.s);d.updateMatrix();leaves.setMatrixAt(i,d.matrix);c.setHex(world.biome==='snow'?0x79938c:e.v>.88?0xab7341:e.v>.65?0x9d914f:0x657b46);c.multiplyScalar(.8+e.v*.35);leaves.setColorAt(i,c);}leaves.castShadow=leaves.receiveShadow=true;leaves.computeBoundingSphere();world.root.add(leaves);}world.leafInstances=[];

}
export function mountainRidges(world){const g=new T.BufferGeometry(),pos=[],uv=[],colors=[],idx=[],segments=180,rings=5,base=new T.Color(0x68716b);for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;const ridge=36+Math.sin(a*7+.4)*18+Math.sin(a*13)*12+Math.cos(a*23)*5;const dist=240+j*44;const rise=[-7,9,1,.63,.27,-.1][j];const y=j===0?-12:j===1?ridge*.23:j===2?ridge:ridge*rise;pos.push(Math.sin(a)*dist,y,-75+Math.cos(a)*dist);uv.push(i/segments*8,j*.5);const col=base.clone().multiplyScalar(.75+j*.10);if(y>57)col.lerp(new T.Color(0xb5c0b8),.65);colors.push(col.r,col.g,col.b);if(j<rings&&i<segments){const n=j*(segments+1)+i;idx.push(n,n+1,n+segments+1,n+1,n+segments+2,n+segments+1);}}g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(idx);g.computeVertexNormals();const ridges=mesh(g,worldMaterial('rock',0xc1c5b6,18,{vertexColors:true,roughness:1}),world.root);ridges.castShadow=false;}
