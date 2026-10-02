import * as T from 'three';
import {ART} from './materials.js';
const maps=new Map();
export function characterBounce(shader,strength=.10){
 // A soft camera-side sky bounce keeps skin and armor legible against backlit
 // scenery. Curved normals retain form; cast shadows and the sun stay intact.
 shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
  float skyFacing=.20+.60*max(0.,normal.z)+.20*max(0.,normal.y);
  reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.83,.92,1.)*skyFacing*${strength.toFixed(3)};
 `);
}
function detailMap(name,repeat=1){const key=name+repeat;if(!ART.textures[name])return null;if(!maps.has(key)){const t=ART.textures[name].clone();t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.userData.shared=true;t.needsUpdate=true;maps.set(key,t);}return maps.get(key);}
// Dedicated character/weapon surfaces: small-scale scratches, worn relief and
// dark recesses. World surfaces keep their own larger texture scale.
export function heroSurface(kind,color,extra={}){
 const metal=kind==='steel',cloth=kind==='cloth',source=metal?'steel':cloth?'cloth':kind;
 const m=new T.MeshStandardMaterial({color,map:detailMap(source+'-color',metal?1.6:2),normalMap:detailMap(source+'-normal',metal?1.6:2),roughnessMap:detailMap(source+'-rough',metal?1.6:2),roughness:metal?.62:.94,metalness:metal?.82:0,normalScale:new T.Vector2(metal?.32:cloth?.32:.5,metal?.32:cloth?.32:.5),envMapIntensity:metal?.65:.45,...extra});
 m.onBeforeCompile=shader=>{
  characterBounce(shader,metal?.085:.11);
  if(kind==='leather'||cloth)shader.fragmentShader=`
   float hideHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float hideNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hideHash(i),hideHash(i+vec2(1.,0.)),f.x),mix(hideHash(i+vec2(0.,1.)),hideHash(i+vec2(1.)),f.x),f.y);}
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`\n#ifdef USE_MAP\n vec4 surfaceSample=texture2D(map,vMapUv);\n float grain=dot(surfaceSample.rgb,vec3(.2126,.7152,.0722));\n diffuseColor.rgb*=mix(vec3(${metal?'.48':'.36'}),vec3(${metal?'1.3':'1.4'}),vec3(pow(grain,.58)));\n#endif\n`);
  if(metal)shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`float roughnessFactor=roughness;\n#ifdef USE_ROUGHNESSMAP\nroughnessFactor*=.65+.35*texture2D(roughnessMap,vRoughnessMapUv).g;\n#endif`);
  else if(kind==='leather'||cloth)shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   #ifdef USE_MAP
    float patina=hideNoise(vMapUv*9.)*.6+hideNoise(vMapUv*27.)*.3+hideNoise(vMapUv*86.)*.1;
    diffuseColor.rgb*=mix(vec3(.70,.66,.62),vec3(1.12,1.08,1.02),smoothstep(.1,.9,patina));
   #endif
  `);
 };
 m.customProgramCacheKey=()=> 'crafted-hero-surface-'+kind;
 return m;
}
