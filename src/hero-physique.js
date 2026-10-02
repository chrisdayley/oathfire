import * as T from 'three';

export const HERO_PHYSIQUES={
 warden:{shoulder:.278,chest:1.18,depth:1.18,arm:1.28,forearm:1.22,thigh:1.30,calf:1.24,waist:1.12},
 ashwright:{shoulder:.285,chest:1.23,depth:1.24,arm:1.35,forearm:1.27,thigh:1.32,calf:1.27,waist:1.18},
 ranger:{shoulder:.264,chest:1.10,depth:1.10,arm:1.17,forearm:1.15,thigh:1.20,calf:1.17,waist:1.07}
};
export const heroPhysique=c=>!c.enemy?HERO_PHYSIQUES[c.design]:null;
export function fitHeroPart(c,id,group){
 const p=heroPhysique(c);if(!p)return;
 id=id.replaceAll('.','');let x=1,z=1;
 if(id==='chest'){x=p.chest;z=p.depth;}
 else if(id==='spine'){x=p.waist;z=p.depth;}
 else if(id==='hips'){x=p.waist;z=1.13;}
 else if(id.startsWith('upperarm')){x=z=p.arm;}
 else if(id.startsWith('lowerarm')){x=z=p.forearm;}
 else if(id.startsWith('upperleg')){x=p.thigh;z=p.thigh*.98;}
 else if(id.startsWith('lowerleg')){x=z=p.calf;}
 else if(id.startsWith('foot')){x=1.09;z=1.07;}
 else if(/wrist|hand/.test(id)){x=z=1.09;}
 else if(id==='head'){x=1.035;z=1.035;}
 group.scale.set(x,1,z);
}

let anatomy=null,micro=null;
export async function loadHeroAnatomy(){const r=await fetch(import.meta.env.BASE_URL+'models/hero-anatomy.json');if(!r.ok)throw Error('Hero anatomy could not load');anatomy=await r.json();}
export function heroSkin(map,smith=false){
 if(!micro){const size=128,data=new Uint8Array(size*size*4);let seed=47;for(let i=0;i<size*size;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const pore=122+(seed>>>27);data.set([pore,pore,pore,255],i*4);}micro=new T.DataTexture(data,size,size);micro.wrapS=micro.wrapT=T.RepeatWrapping;micro.repeat.set(22,22);micro.magFilter=T.LinearFilter;micro.minFilter=T.LinearMipmapLinearFilter;micro.generateMipmaps=true;micro.needsUpdate=true;micro.userData.shared=true;}
 const m=new T.MeshPhysicalMaterial({name:'Living skin',map,color:smith?0xf2dbc9:0xffefe1,roughness:.72,metalness:0,bumpMap:micro,bumpScale:.0012,sheen:.16,sheenRoughness:.85,sheenColor:0xc28369});
 return m;
}

// Continuous muscle surfaces and original elbow weights, bound to the current
// animation skeleton. Armor remains separate so equipped designs still fit.
export function attachHeroAnatomy(c,skeleton){
 if(c.design!=='ashwright'||c.enemy||!anatomy||!c.anatomyMaterial)return;
 const inverse=c.visual.matrixWorld.clone().invert(),a=new T.Vector3(),b=new T.Vector3();
 for(const side of ['l','r']){
  const src=anatomy.arms[side],upper=c.sockets['upperarm'+side],lower=c.sockets['lowerarm'+side],ui=skeleton.bones.indexOf(upper),li=skeleton.bones.indexOf(lower),positions=[],indices=[],weights=[];
  for(let i=0;i<src.blend.length;i++){
   const w=src.blend[i],scale=1.16;
   a.fromArray(src.upper,i*3);a.x*=scale;a.z*=scale;
   b.fromArray(src.lower,i*3);b.x*=scale;b.z*=scale;
   a.applyMatrix4(upper.matrixWorld).multiplyScalar(1-w);b.applyMatrix4(lower.matrixWorld).multiplyScalar(w);a.add(b).applyMatrix4(inverse);
   positions.push(a.x,a.y,a.z);indices.push(ui,li,0,0);weights.push(1-w,w,0,0);
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(src.uv,2));geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));geo.setIndex(src.indices);geo.computeVertexNormals();
  const mesh=new T.SkinnedMesh(geo,c.anatomyMaterial);mesh.name='Anatomical muscular arm '+side;mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;c.visual.add(mesh);mesh.bind(skeleton);c.body.push(mesh);
 }
}
