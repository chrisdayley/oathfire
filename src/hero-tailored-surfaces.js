import * as T from 'three';
import {ART} from './materials.js';
import {characterBounce} from './hero-surfaces.js';
const normalMaps=new Map();
function scannedNormal(kind){
 const source=ART.textures[(kind==='steel'?'steel':kind==='cloth'?'cloth':'leather')+'-normal'];
 if(!source)return null;
 if(!normalMaps.has(kind)){const t=source.clone();t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='steel'?1.4:3,kind==='steel'?1.4:3);t.userData.shared=true;t.needsUpdate=true;normalMaps.set(kind,t);}
 return normalMaps.get(kind);
}
export function tailoredSurface(kind,color,extra={}){
 const metal=kind==='steel',cloth=kind==='cloth',origin=metal?[0,.5]:cloth?[0,0]:[.5,.5];
 const m=new T.MeshStandardMaterial({color,map:ART.textures['hero-crafted'],normalMap:scannedNormal(kind),normalScale:new T.Vector2(metal?.045:cloth?.22:.25,metal?.045:cloth?.22:.25),roughness:metal?.58:.91,metalness:metal?.8:0,side:T.DoubleSide,...extra});
 m.onBeforeCompile=s=>{characterBounce(s,.045);s.fragmentShader=`
 float forgeHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float forgeNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(forgeHash(i),forgeHash(i+vec2(1.,0.)),f.x),mix(forgeHash(i+vec2(0.,1.)),forgeHash(i+vec2(1.)),f.x),f.y);}
 float forgeScuff(vec2 p){
  vec2 cell=floor(p),f=fract(p)-.5;float seed=forgeHash(cell),a=(forgeHash(cell+7.1)-.5)*1.8;
  f=mat2(cos(a),-sin(a),sin(a),cos(a))*f;
  float length=mix(.11,.34,forgeHash(cell+3.3)),width=mix(.006,.017,forgeHash(cell+9.2));
  return step(.82,seed)*(1.-smoothstep(length*.55,length,abs(f.x)))*(1.-smoothstep(width,width*2.,abs(f.y)));
 }
 `+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`\n#ifdef USE_MAP\n vec2 craftedUV=vec2(${origin[0].toFixed(2)},${origin[1].toFixed(2)})+vec2(.005)+fract(vMapUv*${cloth?'3.0':'1.0'})*.49;\n vec3 scan=texture2D(map,craftedUV).rgb;\n float grain=dot(scan,vec3(.2126,.7152,.0722));\n float edgeWear=pow(abs(fract(vMapUv.y)-.5)*2.0,28.0);
 diffuseColor.rgb*=mix(vec3(1.),vec3(1.16,1.11,1.04),edgeWear*.55);
 float patina=forgeNoise(vMapUv*4.7)*.7+forgeNoise(vMapUv*23.)*.3;
 diffuseColor.rgb*=mix(vec3(${metal?'.82,.88,.94':cloth?'.86,.89,.92':'.81,.75,.69'}),vec3(1.08,1.045,1.),smoothstep(.1,.9,patina));
 ${metal?`float scuff=forgeScuff(vMapUv*vec2(23.,17.));
 float abrasion=forgeNoise(vMapUv*vec2(31.,9.))*forgeNoise(vMapUv*7.);
 float margin=min(fract(vMapUv.y),1.-fract(vMapUv.y));
 float recess=exp(-pow((margin-.026)/.017,2.))*(.4+.6*forgeNoise(vMapUv*43.));
 diffuseColor.rgb*=1.-recess*.17;
 diffuseColor.rgb*=1.-scuff*.28;
 diffuseColor.rgb*=mix(.89,1.04,smoothstep(.08,.65,abrasion));`:''}
 diffuseColor.rgb*=clamp(pow(grain/${metal?'.46':cloth?'.052':'.071'},${metal?'.18':'.38'}),${metal?'.82':'.62'},1.20);\n#endif\n`);
 // Uneven polish is visible through moving highlights, not painted white
 // noise. The same authored scan drives local roughness and muted patina.
 s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
 #ifdef USE_MAP
 vec2 finishUV=vec2(${origin[0].toFixed(2)},${origin[1].toFixed(2)})+vec2(.005)+fract(vMapUv*${cloth?'3.0':'1.0'})*.49;
 float finishGrain=dot(texture2D(map,finishUV).rgb,vec3(.2126,.7152,.0722));
 float borderPolish=pow(abs(fract(vMapUv.y)-.5)*2.,24.);
 roughnessFactor=clamp(roughnessFactor+${metal?'(finishGrain-.46)*.30-borderPolish*.12+(forgeNoise(vMapUv*6.7)-.5)*.16+forgeScuff(vMapUv*vec2(23.,17.))*.18+exp(-pow((min(fract(vMapUv.y),1.-fract(vMapUv.y))-.026)/.017,2.))*.10':cloth?'(finishGrain-.052)*.2':'(finishGrain-.071)*.9-borderPolish*.10'},${metal?'.28':'.55'},.98);
 #endif`);
 };
 m.customProgramCacheKey=()=> 'tailored-material-226-'+kind;return m;
}
