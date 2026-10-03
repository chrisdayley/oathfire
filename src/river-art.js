import * as T from 'three';
import {RIVER_LEVEL,riverCenter,riverWidth} from './river-profile.js';
import {seeded} from './data.js';
import {mesh,beam,cyl} from './art.js';
import {worldMaterial} from './materials.js';

// Shallow-water absorption, two travelling ripple scales and broken shore foam.
// Uses the existing lit/environment-reflected material; no extra render target.
export function buildRiver(w){
 const main=w.biome==='river',positions=[],uv=[],indices=[],depths=[],start=w.minZ-6,end=main?-24:-15;
 const rows=Math.ceil((end-start)/1.2),cols=16,level=main?RIVER_LEVEL:-1.4;
 for(let j=0;j<=rows;j++){
  const z=start+(end-start)*j/rows,center=main?riverCenter(z):-85+Math.sin(z*.032)*9,half=main?riverWidth(z)+3:11;
  for(let i=0;i<=cols;i++){
   const x=center+(i/cols*2-1)*half,depth=level-w.height(x,z);
   positions.push(x,level,z);uv.push(x*.14,z*.14);depths.push(depth);
   if(i<cols&&j<rows){const a=j*(cols+1)+i;indices.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2);}
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('riverDepth',new T.Float32BufferAttribute(depths,1));geo.setIndex(indices);geo.computeVertexNormals();
 const flow={value:0};
 const material=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.34,metalness:0,ior:1.333,specularIntensity:.22,envMapIntensity:.42,clearcoat:0,side:T.DoubleSide});
 material.onBeforeCompile=s=>{
  s.uniforms.riverTime=flow;
  s.vertexShader='attribute float riverDepth; varying float vRiverDepth; varying vec3 vRiverWorld; uniform float riverTime;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vRiverDepth=riverDepth; vRiverWorld=position;
   transformed.y+=sin(position.x*1.4+position.z*.8-riverTime*2.1)*.017*smoothstep(0.,.5,riverDepth);`);
  s.fragmentShader=`varying float vRiverDepth; varying vec3 vRiverWorld; uniform float riverTime;
float riverHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float riverNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(riverHash(i),riverHash(i+vec2(1,0)),f.x),mix(riverHash(i+vec2(0,1)),riverHash(i+vec2(1,1)),f.x),f.y);}
float riverWave(vec2 p){float t=riverTime;vec2 warp=vec2(riverNoise(p*.4+vec2(0.,-t*.13)),riverNoise(p*.51+vec2(17.,t*.08)))*2.;return sin(p.x*3.1+p.y*2.+warp.x*4.-t*2.1)*.024+sin(p.x*5.4-p.y*4.1+warp.y*5.+t*2.7)*.012+sin(p.x*11.3+p.y*8.7+warp.x*3.-t*3.2)*.003;}
`+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 q=vRiverWorld.xz;
   float ripple=riverWave(q)*20.;
   float small=sin(q.x*7.3-q.y*4.6+riverTime*3.7);
   float shoal=1.-smoothstep(.0,1.1,vRiverDepth);
   vec3 deep=vec3(.027,.125,.14), shallow=vec3(.18,.24,.18);
   diffuseColor.rgb=mix(deep,shallow,shoal)*(.93+.07*ripple);
   float strand=(1.-smoothstep(.025,.17,abs(vRiverDepth-.055))) * smoothstep(.1,.7,sin(q.y*2.+q.x*.9-riverTime*1.5));
   float glint=pow(max(0.,ripple*.65+small*.35),10.)*.05;
   diffuseColor.rgb+=vec3(.45,.53,.48)*(strand*.42+glint);
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float dhx=(riverWave(q+vec2(.04,0))-riverWave(q-vec2(.04,0)))/.08;
   float dhz=(riverWave(q+vec2(0,.04))-riverWave(q-vec2(0,.04)))/.08;
   vec3 riverNormal=normalize(vec3(-dhx,1.,-dhz));
   normal=normalize(mat3(viewMatrix)*riverNormal);
  `);
 };
 material.customProgramCacheKey=()=> 'oathfire-flowing-river-v2';
 const water=mesh(geo,material,w.dynamic);water.name='Flowing river';water.castShadow=false;water.receiveShadow=true;water.userData.flow=flow;w.water=water;
 if(!main)return;
 const r=seeded(w.seed+4701),reedMat=new T.MeshStandardMaterial({color:0x737443,roughness:1,side:T.DoubleSide}),seedMat=new T.MeshStandardMaterial({color:0x645035,roughness:1});
 const stones=new T.InstancedMesh(new T.IcosahedronGeometry(.22,1),worldMaterial('rock',0x8b9383,.8),520),o=new T.Object3D();let stoneCount=0;
 const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute([-.035,0,0,.035,0,0,-.025,.65,.08,.025,.65,.08,0,1,.22],3));leafGeo.setIndex([0,1,2,1,3,2,2,3,4]);leafGeo.computeVertexNormals();
 const leaves=new T.InstancedMesh(leafGeo,reedMat,1600);let leafCount=0;
 reedMat.onBeforeCompile=s=>{s.uniforms.riverTime=flow;s.vertexShader='uniform float riverTime;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   #ifdef USE_INSTANCING
   transformed.x+=sin(riverTime*1.3+instanceMatrix[3].z*.3)*position.y*position.y*.065;
   #endif`);};
 for(let z=-32;z>Math.max(w.minZ,-280);z-=2.2){
  // Broad, uninterrupted shallows at the two crossings.
  if(Math.abs(z+63)<5||Math.abs(z+126)<5)continue;
  for(const side of [-1,1]){
   const x=riverCenter(z)+side*(riverWidth(z)-.2+r()*.8);if(Math.abs(x)>120)continue;
   const y=w.height(x,z);
   for(let k=0;k<6;k++){
    const xx=x+(r()-.5)*1.5,zz=z+(r()-.5)*1.8,h=.75+r()*.8;
    if(leafCount<1600){o.position.set(xx,w.height(xx,zz)-.04,zz);o.rotation.set(0,r()*Math.PI*2,0);o.scale.set(1.3,h,1.3);o.updateMatrix();leaves.setMatrixAt(leafCount++,o.matrix);}
   }
   if(r()>.55){beam(w.static,[x,y,z],[x+.07,y+1.1,z],.014,reedMat,4);cyl(w.static,.045,.035,.24,[x+.07,y+1.12,z],seedMat,5);}
   for(let k=0;k<2&&stoneCount<520;k++){const xx=x+side*(.4+r()*1.7),zz=z+(r()-.5)*2;o.position.set(xx,w.height(xx,zz)+.04,zz);o.rotation.set(r(),r()*6,r());o.scale.set(.7+r(),.3+r()*.4,.7+r());o.updateMatrix();stones.setMatrixAt(stoneCount++,o.matrix);}
  }
 }
 stones.count=stoneCount;leaves.count=leafCount;stones.computeBoundingSphere();leaves.computeBoundingSphere();stones.receiveShadow=true;leaves.receiveShadow=true;w.root.add(stones,leaves);
}
