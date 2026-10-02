import * as T from 'three';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {loadCourtyard} from './courtyard-assets.js';

// Locally bundled CC0 scans. Shared textures survive scene and character disposal.
export const ART={textures:{},panoramas:{},sky:null};
export async function loadArt(){
 await loadCourtyard();
 const loader=new T.TextureLoader();
 await Promise.all(['stone','cobble','soil','steel','leather','timber','cloth','grass','rock'].flatMap(name=>['color','normal','rough'].map(async role=>{
  const t=await loader.loadAsync(import.meta.env.BASE_URL+'materials/'+name+'-'+role+'.jpg');
  t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;t.userData.shared=true;
  if(role==='color')t.colorSpace=T.SRGBColorSpace;
  ART.textures[name+'-'+role]=t;
 })));
 await Promise.all([['plain','crownlands'],['snow','northern'],['desert','sunlands']].map(async([biome,file])=>{const t=await loader.loadAsync(import.meta.env.BASE_URL+'scenery/'+file+'-panorama.jpg');t.colorSpace=T.SRGBColorSpace;t.mapping=T.EquirectangularReflectionMapping;t.userData.shared=true;ART.panoramas[biome]=t;}));
 const woodland=await loader.loadAsync(import.meta.env.BASE_URL+'scenery/woodland-atlas.webp');woodland.colorSpace=T.SRGBColorSpace;woodland.userData.shared=true;woodland.anisotropy=4;ART.textures.woodland=woodland;
 const meadow=await loader.loadAsync(import.meta.env.BASE_URL+'scenery/meadow-clump.webp');meadow.colorSpace=T.SRGBColorSpace;meadow.anisotropy=4;meadow.userData.shared=true;ART.textures.meadow=meadow;
 const skin=await loader.loadAsync(import.meta.env.BASE_URL+'materials/human-skin.png');skin.colorSpace=T.SRGBColorSpace;skin.anisotropy=4;skin.userData.shared=true;ART.textures['human-skin']=skin;
 const brocade=await loader.loadAsync(import.meta.env.BASE_URL+'materials/royal-brocade.png');brocade.colorSpace=T.SRGBColorSpace;brocade.anisotropy=4;brocade.wrapS=brocade.wrapT=T.RepeatWrapping;brocade.userData.shared=true;ART.textures['royal-brocade']=brocade;
 const leaf=await loader.loadAsync(import.meta.env.BASE_URL+'materials/hornbeam-leaf.png');leaf.colorSpace=T.SRGBColorSpace;leaf.anisotropy=4;leaf.userData.shared=true;ART.textures['hornbeam-leaf']=leaf;
 ART.sky=await new RGBELoader().loadAsync(import.meta.env.BASE_URL+'materials/hearthwatch-sunset.hdr');
 ART.sky.mapping=T.EquirectangularReflectionMapping;ART.sky.userData.shared=true;
}
export function material(name,color=0xffffff,extra={}){
 const metal=name==='steel',cloth=name==='cloth';
 const m=new T.MeshStandardMaterial({color,roughness:metal?.68:.95,metalness:metal?.82:0,
  map:cloth||metal?null:ART.textures[name+'-color'],normalMap:ART.textures[name+'-normal'],roughnessMap:ART.textures[name+'-rough'],
  normalScale:new T.Vector2(metal?.08:cloth?.18:.75,metal?.08:cloth?.18:.75),...extra});
 if(metal){m.onBeforeCompile=s=>{s.uniforms.wearMap={value:ART.textures['steel-color']};s.fragmentShader='uniform sampler2D wearMap;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float wear=dot(texture2D(wearMap,vNormalMapUv).rgb,vec3(.333));
 diffuseColor.rgb*=.64+sqrt(max(.0,wear))*.58;`);};m.customProgramCacheKey=()=> 'oathfire-worn-steel';}
 return m;
}
export function worldMaterial(name,color=0xffffff,metres=2.5,extra={}){
 const m=material(name,color,extra);
 m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 vSurfaceWorld;varying vec3 vSurfaceNormal;\n'+s.vertexShader;s.fragmentShader='varying vec3 vSurfaceWorld;varying vec3 vSurfaceNormal;\n'+s.fragmentShader;
  s.vertexShader=s.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
  vec3 pWorld=(modelMatrix*vec4(position,1.)).xyz;
  vec3 nWorld=abs(normalize(mat3(modelMatrix)*normal));
  vSurfaceWorld=pWorld;vSurfaceNormal=normalize(mat3(modelMatrix)*normal);
  vec2 surfaceUV=(nWorld.y>.6?pWorld.xz:nWorld.x>nWorld.z?pWorld.zy:pWorld.xy)/${metres.toFixed(3)};
  #ifdef USE_MAP
   vMapUv=surfaceUV;
  #endif
  #ifdef USE_NORMALMAP
   vNormalMapUv=surfaceUV;
  #endif
  #ifdef USE_ROUGHNESSMAP
   vRoughnessMapUv=surfaceUV;
  #endif`);
  const tri=`vec3 triN=normalize(vSurfaceNormal);vec3 triW=pow(abs(triN),vec3(6.));triW/=max(.0001,triW.x+triW.y+triW.z);vec3 triP=vSurfaceWorld/${metres.toFixed(3)};`;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`${tri}
  #ifdef USE_MAP
  diffuseColor *= texture2D(map,triP.zy)*triW.x+texture2D(map,triP.xz)*triW.y+texture2D(map,triP.xy)*triW.z;
  #endif`);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`float roughnessFactor=roughness;
  #ifdef USE_ROUGHNESSMAP
  roughnessFactor *= texture2D(roughnessMap,triP.zy).g*triW.x+texture2D(roughnessMap,triP.xz).g*triW.y+texture2D(roughnessMap,triP.xy).g*triW.z;
  #endif`);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`
  #ifdef USE_NORMALMAP_TANGENTSPACE
  vec3 tx=texture2D(normalMap,triP.zy).xyz*2.-1.,ty=texture2D(normalMap,triP.xz).xyz*2.-1.,tz=texture2D(normalMap,triP.xy).xyz*2.-1.;
  vec3 perturb=vec3(0.,tx.y,tx.x)*triW.x+vec3(ty.x,0.,ty.y)*triW.y+vec3(tz.x,tz.y,0.)*triW.z;
  normal=normalize(mat3(viewMatrix)*(triN+perturb*normalScale.x*.65));
  #endif`);
 };
 m.customProgramCacheKey=()=>name+'-world-2-'+metres;
 return m;
}
