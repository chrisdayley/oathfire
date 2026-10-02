import {armorStyle} from './equipment-style.js';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ART,material} from './materials.js';
import {armorDefinition,armorKind} from './armor.js';

const MODELS=new Map();
export async function loadAtelier(){
 const loader=new GLTFLoader();
 await Promise.all(['warden','ashwright','ranger','bow'].map(async id=>{
  const {scene}=await loader.loadAsync(import.meta.env.BASE_URL+'models/atelier/'+id+'.glb');
  scene.updateMatrixWorld(true);const parts=[];
  scene.traverse(o=>{if(!o.isMesh)return;const geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);for(const key of Object.keys(geometry.attributes))if(!['position','normal','uv'].includes(key))geometry.deleteAttribute(key);if(!geometry.attributes.uv){const p=geometry.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)*4;uv[i*2+1]=p.getY(i)*4;}geometry.setAttribute('uv',new T.BufferAttribute(uv,2));}geometry.userData.shared=true;parts.push({geometry,props:o.userData,name:o.name});});
  MODELS.set(id,parts);
 }));
}
const flipped=new Map();
function texture(id){if(!ART.textures[id])return null;if(!flipped.has(id)){const t=ART.textures[id].clone();t.flipY=false;t.needsUpdate=true;t.userData.shared=true;flipped.set(id,t);}return flipped.get(id);}
export function attachAtelier(c,part,profile,palette,textile){
 const template=MODELS.get(c.design);if(!template)return null;
 const armor=c.armor?armorDefinition(c.armor):null,kind=c.armor?armorKind(c.armor):null,forge=c.armor?.plus||0,hero=profile.hero,smith=c.design==='ashwright';
 const style=hero&&c.armor?armorStyle(c.armor):null,rank=profile.rank;const signature=!kind||kind==='hearth',veteran=rank>=5,royal=rank>=8;
 const heroCloth=smith?(royal?0x33232c:veteran?0x682e31:0x3c2826):c.design==='ranger'?(royal?0x49356c:veteran?0x294979:0x203e62):(royal?0x733246:veteran?0x284b77:0x143849);
 const clothHex=style?.cloth??(hero&&signature?heroCloth:armor?.cloth??palette.cloth),trimHex=style?.trim??(hero&&signature?(royal?0xd6b16a:smith?0xb48853:palette.trim):armor?.trim??palette.trim),steelHex=style?.metal??(hero&&signature?(royal?0xc2c3b7:0x8c99a5):armor?.steel??palette.steel);
 const light=['trail','spellweave','dawn'].includes(kind);
 const mats={
  steel:material(light?'leather':'steel',steelHex,{roughness:style?.roughness??(light?.84:.57),metalness:style?.tier===0?.35:light?.12:.82,envMapIntensity:.8,side:T.DoubleSide}),
  ivory:material('steel',style?.metal??(signature?(royal?0xd4c9ad:0xb8b7aa):armor?.steel??0xb8b7aa),{roughness:.57,metalness:.62,side:T.DoubleSide}),
  gold:material('steel',trimHex,{roughness:.56,metalness:.76,side:T.DoubleSide}),
  leather:material('leather',smith?0x77604e:0x625142,{roughness:.83,side:T.DoubleSide}),
  dark:material('cloth',0x27272b,{roughness:.93,side:T.DoubleSide}),
  cloth:material('cloth',clothHex,{roughness:.89,side:T.DoubleSide}),
  mail:material('steel',0x899194,{map:textile('mail'),roughness:.70,metalness:.65,side:T.DoubleSide}),
  skin:new T.MeshStandardMaterial({color:smith?0xb79c86:c.design==='ranger'?0xd0b7a3:0xd3b69d,map:texture('human-skin'),roughness:.94,side:T.DoubleSide}),
  hair:material('cloth',smith?0x615a53:0x2c211b,{roughness:.94}),
  eye:new T.MeshStandardMaterial({color:0x9d998d,roughness:.6}),
  iris:new T.MeshStandardMaterial({color:0x3a5046,roughness:.47}),
  ember:new T.MeshStandardMaterial({color:0xffbc55,emissive:0xe46b21,emissiveIntensity:1.5,roughness:.4})
 };
 if((!style&&hero||rank>=7)&&!smith&&signature&&ART.textures['royal-brocade']){mats.cloth.map=texture('royal-brocade');mats.cloth.color.setHex(style?clothHex:royal?0xd1a3ba:0xa6b1bc);}
 c.materials.push(...Object.values(mats));const groups=new Map();let pieces=0;
 for(const p of template){const u=p.props;if(rank<(u.minRank||1)||rank>(u.maxRank||10)||(u.minForge&&forge<u.minForge)||(u.armorKind&&u.armorKind!==kind))continue;
  if(style?.tier===0&&/engraved|Sun cabochon|Sun ray|Embroidered|Rolled pauldron rim|Overlapping shoulder lame|Royal|Earned rank seal/i.test(p.name))continue;
  if(!groups.has(u.socket))groups.set(u.socket,part(u.socket));
  const mesh=new T.Mesh(p.geometry,mats[u.surface]);mesh.name=p.name;mesh.castShadow=mesh.receiveShadow=true;groups.get(u.socket).add(mesh);pieces++;
 }
 // Match each equipped armor family's fabric and plate treatment, retaining hero identity.
 if(kind==='spellweave'){mats.ivory.color.setHex(style?.cloth??armor.cloth);mats.ivory.metalness=.2;}
 if(kind==='trail'){mats.ivory.color.setHex(style?.metal??armor.steel);mats.ivory.metalness=.05;}
 if(kind==='hearth'&&smith)mats.cloth.map=null;
 c.atelier={...profile,rarity:style?.tier,clothHex,trimHex,palette,source:'blender-authored-glb',pieces};
 return {cloth:mats.cloth,brass:mats.gold,profile};
}
