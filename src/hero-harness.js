import {heroArmorProfile} from './hero-armor-profile.js';
import * as T from 'three';
let harness=null;
const cache=new Map();
export async function loadHeroHarness(){const r=await fetch(import.meta.env.BASE_URL+'models/forged-harness.json');if(!r.ok)throw Error('Forged harness could not load');harness=await r.json();}
function geometry(id,slot,side){const key=id+slot+side;if(cache.has(key))return cache.get(key);const src=harness[id],p=[],uv=[],indices=[];
 for(const raw of src.positions){let [x,y,z]=raw;if(id==='upperleg'){x*=1.14;z*=1.12;}if(id==='upperarm'){x*=1.03;z*=1.03;}if(id==='helmet'){x*=.88;y=y*.88+.018;z*=.88;}p.push(x*side,y,z);uv.push(x*4+.5,y*3+.5);}
 src.triangles.forEach((triangle,i)=>{if(src.materials[i]===slot)indices.push(...(side<0?[triangle[2],triangle[1],triangle[0]]:triangle));});if(!indices.length)return null;
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.userData.shared=true;cache.set(key,g);return g;
}
export function usesForgedHarness(c){const p=heroArmorProfile(c);return !!p&&(c.design==='warden'||p.sleeves);}
export function replaceHarnessPart(c,name){
 const profile=heroArmorProfile(c);if(!profile)return false;if(/^(Forged Helmet|Sculpted hood|Embroidered hood edge|Royal hood feather|Hair scalp|Swept hair lock)/.test(name))return true;if(!usesForgedHarness(c))return false;
 if(c.design!=='warden'&&!profile.plate&&/^(Knee cop|Fluted greave|Fitted greave|Greave|Sculpted boot|Boot instep)/.test(name))return false;
 return /^(Forged Helmet|Forged shoulder cap|Overlapping shoulder lame|Rolled pauldron rim|Curved vambrace|Vambrace strap|Knee cop|Fluted greave|Fitted greave|Greave central ridge|Greave leather fastening|Greave fastening buckle|Sculpted boot|Boot instep lacing|Royal layered hip plate)/.test(name);
}
export function attachHeroHarness(c,part,mats,rank){
 const profile=heroArmorProfile(c);if(!harness||!profile)return;
 const kinds=[...(usesForgedHarness(c)?['upperarm','lowerarm',...((c.design==='warden'||profile.plate)?['upperleg','knee','lowerleg','foot']:[])]:[]),'helmet'];
 for(const id of kinds.filter(id=>!['helmet','foot'].includes(id)))for(const side of id==='helmet'?[1]:[-1,1]){
  const bone=id==='helmet'?'head':(id==='knee'?'lowerleg':id)+(side>0?'l':'r'),parent=part(bone);
  harness[id].slots.forEach(([name],i)=>{const geo=geometry(id,i,side);if(!geo)return;const material=name.startsWith('Black')?mats.dark:name==='Gold'?(rank>=4?mats.gold:mats.steel):mats.steel;const mesh=new T.Mesh(geo,material);mesh.name='Forged '+id+' '+name;mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);});
 }
}
