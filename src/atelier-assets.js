import {sculptHeroFace} from './hero-face-sculpt.js';
import {tailoredHero} from './hero-tailored-body.js';
import {tailoredSurface} from './hero-tailored-surfaces.js';
import {troopIdentity} from './troop-identity.js';
import {heroArmorProfile} from './hero-armor-profile.js';
import {heroSurface} from './hero-surfaces.js';
import {heroSkin,loadHeroAnatomy} from './hero-physique.js';
import {armorStyle} from './equipment-style.js';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ART,material} from './materials.js';
import {armorDefinition,armorKind} from './armor.js';

const MODELS=new Map();
export async function loadAtelier(){
 await loadHeroAnatomy();const loader=new GLTFLoader();
 await Promise.all(['warden','ashwright','ranger','bow'].map(async id=>{
  const {scene}=await loader.loadAsync(import.meta.env.BASE_URL+'models/atelier/'+id+'.glb');
  scene.updateMatrixWorld(true);const parts=[];
  scene.traverse(o=>{if(!o.isMesh)return;const geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);for(const key of Object.keys(geometry.attributes))if(!['position','normal','uv'].includes(key))geometry.deleteAttribute(key);if(!geometry.attributes.uv){const p=geometry.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)*4;uv[i*2+1]=p.getY(i)*4;}geometry.setAttribute('uv',new T.BufferAttribute(uv,2));}geometry.userData.shared=true;parts.push({geometry,props:o.userData,name:o.name.replaceAll('_',' ')});});
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
 const classCloth={warden:[0x514637,0x3b504b,0x294e57,0x245663,0x2c4368,0x202d41,0xc8c3af],ranger:[0x443f31,0x354c3d,0x2a5350,0x245663,0x344762,0x39304c,0x2b4855],ashwright:[0x493c32,0x493c32,0x403932,0x393b3c,0x492e35,0x292931,0x8b8070]};
 const clothHex=(hero&&signature?classCloth[c.design][style?.tier||0]:style?.cloth)??(hero&&signature?heroCloth:armor?.cloth??palette.cloth),trimHex=style?.trim??(hero&&signature?(royal?0xd6b16a:smith?0xb48853:palette.trim):armor?.trim??palette.trim),steelHex=style?.metal??(hero&&signature?(royal?0xc2c3b7:0x8c99a5):armor?.steel??palette.steel);
 const coverage=heroArmorProfile(c),light=['trail','spellweave','dawn'].includes(kind)&&!coverage?.plate;
 const surface=hero?tailoredSurface:heroSurface;
 const mats={
  steel:surface(light?'leather':'steel',hero&&signature?(smith?0x837668:0x9b9c94):steelHex,{roughness:Math.max(.48,style?.roughness??(light?.84:.57)),metalness:style?.tier===0?.35:light?.12:.82,envMapIntensity:.8,side:T.DoubleSide}),
  ivory:surface('steel',(hero&&signature?0xb7b3a1:style?.metal)??(signature?(royal?0xd4c9ad:0xb8b7aa):armor?.steel??0xb8b7aa),{roughness:.60,metalness:.78,side:T.DoubleSide}),
  gold:surface('steel',trimHex,{roughness:.58,metalness:.8,side:T.DoubleSide}),
  leather:surface('leather',smith?0x5b4c3e:0x55483b,{roughness:.83,side:T.DoubleSide}),
  stitch:surface('leather',0xab9475,{roughness:.96,side:T.DoubleSide}),
  dark:surface('cloth',0x27272b,{roughness:.93,side:T.DoubleSide}),
  cloth:surface('cloth',clothHex,{roughness:.89,side:T.DoubleSide}),
  mail:material('steel',0x899194,{map:textile('mail'),roughness:.70,metalness:.65,side:T.DoubleSide}),
  skin:heroSkin(texture(smith?'ashwright-skin':c.design==='warden'?'warden-skin':'human-skin'),smith),
  hair:material('cloth',smith?0x615a53:0x2c211b,{roughness:.94}),
  eye:new T.MeshStandardMaterial({color:0x9d998d,roughness:.6}),
  iris:new T.MeshStandardMaterial({color:0x3a5046,roughness:.47}),
  ember:new T.MeshStandardMaterial({color:0xffbc55,emissive:0xe46b21,emissiveIntensity:1.5,roughness:.4})
 };
 if(!hero&&rank>=7&&!smith&&signature&&ART.textures['royal-brocade']){mats.cloth.map=texture('royal-brocade');mats.cloth.color.setHex(style||!hero?clothHex:royal?0xd1a3ba:0xa6b1bc);}
 c.materials.push(...Object.values(mats));const groups=new Map();let pieces=0;c.anatomyMaterial=hero?mats.skin:null;
 for(const p of template){const u=p.props;if(hero&&!/^(Anatomical face|Eye|Iris|Pupil|Eyebrow|Glove|Gloved|Articulated finger|Quiver$|Visible arrow shaft|Arrow fletching)/.test(p.name))continue;if((hero||c.design==='bow')&&/^Articulated gorget/.test(p.name))continue;if(hero&&/^Forged BreastPlate/.test(p.name))continue;if(c.design==='bow'&&/^Tailored sleeve/.test(p.name))continue;if(hero&&/^(Sculpted boot|Boot instep)/.test(p.name))continue;if(hero&&/^(Forged shoulder cap|Overlapping shoulder lame|Rolled pauldron rim)/.test(p.name))continue;if(smith&&/^Forging tool pocket/.test(p.name))continue;if(smith&&!coverage?.sleeves&&/^(Tailored sleeve|Forearm sleeve|Elbow joint)/.test(p.name))continue;if(!hero&&coverage?.plate&&/^(Fitted coat|Waisted gambeson|Sculpted forge apron|Apron|Draped shoulder cowl|Overlapping brigandine breast|Asymmetric ranger cuirass|Braided grey beard|Anatomical face|Eye|Iris|Pupil|Eyebrow|Soft neck)/.test(p.name))continue;if(rank<(u.minRank||1)||rank>(u.maxRank||10)||(u.minForge&&forge<u.minForge)||(u.armorKind&&u.armorKind!==kind))continue;
  if(style?.tier===0&&/engraved|Sun cabochon|Sun ray|Embroidered|Rolled pauldron rim|Overlapping shoulder lame|Royal|Earned rank seal/i.test(p.name))continue;
  if(!groups.has(u.socket))groups.set(u.socket,part(u.socket));
  let geometry=p.geometry;if(hero&&/^Anatomical face/.test(p.name))geometry=sculptHeroFace(p.geometry.clone(),c.design);if(hero&&/^Eyebrow/.test(p.name)){geometry=p.geometry.clone();geometry.userData.shared=false;const a=geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i);a.setY(i,.129+(y-.129)*(smith?.58:.72));a.setZ(i,a.getZ(i)+.0015);}geometry.computeVertexNormals();}if(coverage&&/^(Quiver$|Visible arrow shaft|Arrow fletching)/.test(p.name)){geometry=p.geometry.clone();geometry.userData.shared=false;geometry.translate(.17,0,.025);}if(smith&&p.name==='Sculpted forge apron'){geometry=p.geometry.clone();geometry.userData.shared=false;const a=geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i);a.setX(i,x*(y>.0?.88:y<-.40?1.04:.91));if(y<-.48&&Math.abs(x)<.035)a.setY(i,y+Math.max(0,1-Math.abs(x)/.035)*Math.min(.13,(-y-.48)*.5));}geometry.computeVertexNormals();}if((hero||c.design==='bow')&&p.name==='Soft neck'){geometry=p.geometry.clone();geometry.userData.shared=false;const pos=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,.11+pos.getX(i)*.15,.58+pos.getY(i)*.12);}const mesh=new T.Mesh(geometry,(hero||c.design==='bow')&&p.name==='Soft neck'?mats.skin:(coverage?.sleeves&&/^(Tailored sleeve|Forearm sleeve|Elbow joint)/.test(p.name)?mats.mail:coverage?.plate&&/^(Glove|Gloved|Articulated finger)/.test(p.name)?mats.steel:mats[u.surface]));mesh.name=p.name;mesh.castShadow=mesh.receiveShadow=true;groups.get(u.socket).add(mesh);pieces++;
 }
 if(hero)tailoredHero(c,part,mats);else troopIdentity(c,part,mats);
 // Match each equipped armor family's fabric and plate treatment, retaining hero identity.
 if(kind==='spellweave'&&!coverage?.plate){mats.ivory.color.setHex(style?.cloth??armor.cloth);mats.ivory.metalness=.2;}
 if(kind==='trail'&&!coverage?.plate){mats.ivory.color.setHex(style?.metal??armor.steel);mats.ivory.metalness=.05;}

 c.visual.userData.completeHead=true;
 c.atelier={...profile,rarity:style?.tier,clothHex,trimHex,palette,source:hero?'concept-tailored-rig':'blender-authored-glb',pieces};
 return {cloth:mats.cloth,brass:mats.gold,profile};
}
