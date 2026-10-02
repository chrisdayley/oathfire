import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {worldMaterial} from './materials.js';
const templates=new Map();
export async function loadCourtyard(){const loader=new GLTFLoader();await Promise.all(['large_castle_door','wooden_barrels_01','wooden_lantern_01','round_wooden_table_01','castle-arch'].map(async id=>{
 const {scene}=await loader.loadAsync(import.meta.env.BASE_URL+'models/courtyard/'+id+'.glb');scene.updateMatrixWorld(true);
 scene.traverse(o=>{if(o.isMesh){for(const key of Object.keys(o.geometry.attributes))if(!['position','normal','uv'].includes(key))o.geometry.deleteAttribute(key);if(!o.geometry.attributes.uv)o.geometry.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(o.geometry.attributes.position.count*2),2));for(const m of Array.isArray(o.material)?o.material:[o.material])for(const value of Object.values(m))if(value?.isTexture){value.userData.shared=true;value.anisotropy=4;}}});templates.set(id,scene);
}));}
export function courtyardProp(w,id,x,y,z,height=1,angle=0,solid=true){
 const original=templates.get(id);if(!original)return null;
 const g=original.clone(true),materials=w.authoredMaterials||(w.authoredMaterials=new Map());g.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();if(id==='castle-arch'){if(!materials.has(id))materials.set(id,worldMaterial('stone',0xc2ad88,1.9,{roughness:.93}));o.material=materials.get(id);}else{const convert=m=>{if(!materials.has(m))materials.set(m,m.clone());return materials.get(m);};o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);}o.castShadow=o.receiveShadow=true;}});
 const bounds=new T.Box3().setFromObject(g),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=height/size.y;
 if(id==='castle-arch'){g.position.set(x,y,z);g.rotation.y=angle;}else{g.scale.setScalar(scale);g.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);const container=new T.Group();container.add(g);container.position.set(x,y,z);container.rotation.y=angle;w.static.add(container);if(solid){w.physics.addBox(x,y+height/2,z,size.x*scale,height,size.z*scale,'authored-prop',angle);w.nav.push({x,z,hx:size.x*scale/2+.6,hz:size.z*scale/2+.6,top:y+height});}return container;}
 w.static.add(g);return g;
}
