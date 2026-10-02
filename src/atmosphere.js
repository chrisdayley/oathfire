import * as T from 'three';
import {worldMaterial,ART} from './materials.js';
import {seeded} from './data.js';
// Scenery stays beyond the collision boundary, with three overlapping depth planes.
export function atmosphere(w){
 const snow=w.biome==='snow',sand=w.biome==='desert',r=seeded(w.seed+321),baseZ=w.minZ;
 const hillHeight=(x,z,layer)=>-4+Math.sin(Math.PI*Math.max(0,Math.min(1,(-z+baseZ-5)/180)))*(8+layer*5)+Math.sin(x*.017+layer)*4+Math.cos(x*.033-z*.02)*2;
 for(let layer=0;layer<3;layer++){
  const geo=new T.PlaneGeometry(490,100,64,16);geo.rotateX(-Math.PI/2);geo.translate(0,0,baseZ-45-layer*55);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++)p.setY(i,hillHeight(p.getX(i),p.getZ(i),layer));geo.computeVertexNormals();
  const color=snow?[0xb8c7c8,0x9bafb7,0x96aab9][layer]:sand?[0xb39d77,0xac9c84,0x9da09b][layer]:[0x687555,0x708578,0x819693][layer];
  const m=worldMaterial(sand?'soil':snow?'rock':'grass',color,10+layer*4,{roughness:1});const hill=new T.Mesh(geo,m);hill.receiveShadow=false;w.root.add(hill);
  const foliage=new T.MeshBasicMaterial({map:ART.textures.woodland,color:snow?0xa8b9c3:layer===0?0x7e9977:0x91a89b,alphaTest:.48,side:T.DoubleSide,fog:true});const treeGeo=new T.PlaneGeometry(1,1),uv=treeGeo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)/3);
  const trees=new T.InstancedMesh(treeGeo,foliage,42),o=new T.Object3D();for(let i=0;i<42;i++){const cluster=i%3,x=[-116,42,151][cluster]+(r()-.5)*72,z=baseZ-45-layer*55+(r()-.5)*35,h=(7+r()*10)*(sand?.6:1);o.position.set(x,hillHeight(x,z,layer)+h*.46,z);o.rotation.y=(r()-.5)*.6;o.scale.set(h*.72,h,1);o.updateMatrix();trees.setMatrixAt(i,o.matrix);}trees.computeBoundingSphere();w.root.add(trees);
 }
 if(!w.siegeMode){const geo=new T.CylinderGeometry(640,640,240,96,1,true),mat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.BackSide,uniforms:{haze:{value:new T.Color(snow?0xbbcbd6:sand?0xc6b99e:0xb5beb3)}},vertexShader:'varying float height;void main(){height=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying float height;uniform vec3 haze;void main(){float a=(1.-smoothstep(-10.,100.,height))*.43;gl_FragColor=vec4(haze,a);}'}),haze=new T.Mesh(geo,mat);haze.position.set(0,35,-90);haze.renderOrder=-1;w.root.add(haze);}
 w.root.userData.atmosphere={layers:3,treeClusters:9,haze:!w.siegeMode};
}
