import {heroArmorProfile} from './hero-armor-profile.js';
import {characterBounce} from './hero-surfaces.js';
import * as T from 'three';

export const HERO_PHYSIQUES={
 warden:{shoulder:.265,chest:1.17,depth:1.10,arm:1.16,forearm:1.15,thigh:1.20,calf:1.18,waist:1.01},
 ashwright:{shoulder:.268,chest:1.16,depth:1.10,arm:1.23,forearm:1.20,thigh:1.25,calf:1.21,waist:1.02},
 ranger:{shoulder:.253,chest:1.10,depth:1.06,arm:1.12,forearm:1.10,thigh:1.16,calf:1.13,waist:1.04}
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
 const m=new T.MeshPhysicalMaterial({name:'Living skin',map,color:smith?0xc3ac9d:0xcdb9a8,roughness:.72,metalness:0,bumpMap:micro,bumpScale:.0012,sheen:.10,sheenRoughness:.85,sheenColor:0xc28369});
 m.onBeforeCompile=shader=>characterBounce(shader,.055);m.customProgramCacheKey=()=> 'skin-sky-bounce-v222';return m;
}

// Continuous muscle surfaces and original elbow weights, bound to the current
// animation skeleton. Armor remains separate so equipped designs still fit.
export function attachHeroAnatomy(c,skeleton){
 if(c.design!=='ashwright'||c.enemy||!anatomy||!c.anatomyMaterial||heroArmorProfile(c)?.sleeves)return;
 const skin=c.anatomyMaterial.clone();skin.vertexColors=true;skin.onBeforeCompile=c.anatomyMaterial.onBeforeCompile;skin.customProgramCacheKey=c.anatomyMaterial.customProgramCacheKey;c.materials.push(skin);
 const inverse=c.visual.matrixWorld.clone().invert(),a=new T.Vector3(),b=new T.Vector3();
 for(const side of ['l','r']){
  const src=anatomy.arms[side],upper=c.sockets['upperarm'+side],lower=c.sockets['lowerarm'+side],ui=skeleton.bones.indexOf(upper),li=skeleton.bones.indexOf(lower),positions=[],indices=[],weights=[],colors=[];
  for(let i=0;i<src.blend.length;i++){
   const w=src.blend[i],scale=1.16;
   a.fromArray(src.upper,i*3);sculptMuscle(a,false,scale);
   b.fromArray(src.lower,i*3);sculptMuscle(b,true,scale);
   const uy=src.upper[i*3+1],ux=src.upper[i*3],uz=src.upper[i*3+2],ly=src.lower[i*3+1],lx=src.lower[i*3],lz=src.lower[i*3+2];
   const gauss=(x,c,r)=>Math.exp(-(((x-c)/r)**2));
   // Creases follow the length of the actual muscles, not an artificial ring.
   const division=gauss(uz,0,.026)*gauss(uy,.145,.085),deltoidJoin=gauss(uy,.105,.021)*gauss(Math.abs(ux),.073,.025),wristTendon=gauss(lx,.025,.009)*gauss(ly,.18,.08);
   const inner=gauss(uz,-.047,.040)*(1-w)+gauss(lz,-.032,.032)*w;
   const shade=(division*.21+deltoidJoin*.24)*(1-w)+wristTendon*.1*w+inner*.075;
   const elbow=gauss(uy,.265,.065)*(1-w)+gauss(ly,.005,.04)*w;
   const warm=.035*Math.sin(uy*19+ux*13)+.018*Math.sin(ly*24)+elbow*.025,mottle=.95+.040*Math.sin(ux*270+uy*128+uz*91);
   colors.push(mottle*(1-shade)+warm-inner*.022,mottle*(1-shade*.95)-warm*.2,mottle*(1-shade*.85)-warm*.6+inner*.02);

   a.applyMatrix4(upper.matrixWorld).multiplyScalar(1-w);b.applyMatrix4(lower.matrixWorld).multiplyScalar(w);a.add(b).applyMatrix4(inverse);
   positions.push(a.x,a.y,a.z);indices.push(ui,li,0,0);weights.push(1-w,w,0,0);
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(src.uv,2));geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));geo.setIndex(src.indices);geo.computeVertexNormals();
  const mesh=new T.SkinnedMesh(geo,skin);mesh.name='Anatomical muscular arm '+side;mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;c.visual.add(mesh);mesh.bind(skeleton);c.body.push(mesh);
 }
}

function sculptMuscle(p,forearm,scale){
 const g=(y,c,w)=>Math.exp(-(((y-c)/w)**2)),y=p.y;
 if(forearm){const belly=g(y,.065,.065),wrist=g(y,.235,.034);p.x*=scale*(1+.14*belly-.09*wrist);p.z*=scale*(1+.15*belly-.08*wrist);p.z-=.006*g(y,.15,.095)*g(p.x,.018,.013);}
 else{const deltoid=g(y,.045,.045),biceps=g(y,.158,.065),insertion=g(y,.257,.027);const division=g(p.z,0,.025)*g(y,.15,.08),join=g(y,.103,.022);p.x*=scale*(1+.10*deltoid+.09*biceps-.17*division-.07*join-.10*insertion);p.z*=scale*(1+.1*deltoid+.16*biceps-.05*join-.12*insertion);p.z+=(p.z<0?-.012:.007)*biceps*Math.abs(p.z)/.085;}
}
