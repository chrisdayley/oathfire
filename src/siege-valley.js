import * as T from 'three';
import {SIEGE_OUTPOSTS,SIEGE_GATE_Z} from './siege-rules.js';
import {seeded} from './data.js';
import {ART,material,worldMaterial} from './materials.js';
import {box,cyl,beam,mesh} from './art.js';
import {craftedRoof} from './architecture.js';

export function buildSiegeValley(w){
 const m=w.materials,r=seeded(w.seed+227),g=w.static;
 w.siegeCampFlags=[];
 // Roadside watch posts are visible destinations, with a clear central fighting lane.
 for(const [i,p]of SIEGE_OUTPOSTS.entries()){
  const y=w.height(p.x,p.z),flag=w.flag(p.x,y,p.z,1.5);w.siegeCampFlags.push(flag);
  flag.traverse(o=>{if(o.isMesh&&o.material?.map===m.teal.map){o.material=o.material.clone();o.material.color.setHex(0x9b4250);}});
  for(const side of [-1,1]){
   const x=side*29,z=p.z-8,yy=w.height(x,z);
   w.solid([7,3.6,8],[x,yy+1.8,z],m.stone,'road-watch');
   craftedRoof(g,m,{x,y:yy+3.6,z,width:8,depth:9,rise:3,tiles:true,dormers:1,tint:i%2?0x544b72:0x537477});
   for(const sx of [-1,1]){beam(g,[x+sx*3.55,yy,z+4.1],[x+sx*3.55,yy+3.6,z+4.1],.11,m.wood);box(g,[1.1,1.4,.10],[x+sx*1.9,yy+2,z+4.05],m.dark);}
   w.torch(x-2.7,yy,z+5,true);
   for(let j=0;j<5;j++){const xx=side*(8+j*2.7);w.solid([2.3,1.1,.8],[xx,w.height(xx,z+12)+.55,z+12],m.stone,'road-barricade');}
   for(let j=0;j<4;j++){const xx=x+(r()-.5)*10,zz=z+9+r()*7,hh=w.height(xx,zz);const barrel=cyl(g,.38,.38,.9,[xx,hh+.45,zz],m.wood,12);for(const dy of [.15,.72])cyl(g,.4,.4,.07,[xx,hh+dy,zz],m.iron,12);}
  }
 }
 // Physical trees and weathered milestones, spread over the full 945 m route.
 for(let z=-140;z>SIEGE_GATE_Z+75;z-=85){
  for(const side of [-1,1]){
   for(let k=0;k<3;k++){const x=side*(44+r()*59),zz=z+(r()-.5)*55;w.tree(x,w.height(x,zz),zz,6+r()*7,w.biome==='snow',r);}
   const x=side*10,y=w.height(x,z);cyl(g,.25,.4,1.3,[x,y+.65,z],m.cap,8);box(g,[.65,.24,.65],[x,y+1.35,z],m.cap);
  }
 }
 // Dense, inexpensive painted woodland and meadow strips; grouped per stretch for culling.
 const treeMat=new T.MeshBasicMaterial({map:ART.textures.woodland,alphaTest:.5,side:T.DoubleSide,color:w.biome==='snow'?0xbacbd7:0xd2caaa});
 const grassMat=new T.MeshStandardMaterial({map:ART.textures.meadow,alphaTest:.4,side:T.DoubleSide,roughness:.96,color:w.biome==='snow'?0xcad2ce:0xd5d4b5});
 for(let start=-230;start>w.minZ;start-=128){
  for(const [type,count,mat]of [['tree',140,treeMat],['grass',430,grassMat]]){
   const geo=new T.PlaneGeometry(1,1);if(type==='tree'){const uv=geo.attributes.uv;for(let j=0;j<uv.count;j++)uv.setX(j,uv.getX(j)/3);}
   const im=new T.InstancedMesh(geo,mat,count),o=new T.Object3D();
   for(let j=0;j<count;j++){const side=j%2?-1:1,x=side*(type==='tree'?126+r()*130:8+r()*105),z=start-r()*128,h=type==='tree'?9+r()*13:.5+r()*.5;
    if(Math.abs(x)<48&&z<SIEGE_GATE_Z+25){o.scale.setScalar(0);}else{o.scale.set(type==='tree'?h*.75:h*1.6,h,1);}
    o.position.set(x,w.height(x,z)+h*.46,z);o.rotation.y=r()*Math.PI;o.updateMatrix();im.setMatrixAt(j,o.matrix);
   }im.castShadow=false;im.computeBoundingSphere();w.root.add(im);
  }
 }
 w.root.userData.siegeDistance=945;
}
