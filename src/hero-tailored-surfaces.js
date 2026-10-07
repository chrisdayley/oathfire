import * as T from 'three';
import {ART} from './materials.js';
import {characterBounce} from './hero-surfaces.js';
const reliefMaps=new Map();
export function tailoredSurface(kind,color,extra={}){
 const metal=kind==='steel',cloth=kind==='cloth',origin=metal?[0,.5]:cloth?[0,0]:[.5,.5];
 if(!reliefMaps.has(kind)&&ART.textures['hero-crafted']){const t=ART.textures['hero-crafted'].clone();t.repeat.set(.49,.49);t.offset.set(origin[0]+.005,origin[1]+.005);t.needsUpdate=true;t.userData.shared=true;reliefMaps.set(kind,t);}const relief=reliefMaps.get(kind);
 const m=new T.MeshStandardMaterial({color,map:ART.textures['hero-crafted'],bumpMap:relief,bumpScale:metal?.0008:.00035,roughness:metal?.58:.91,metalness:metal?.8:0,side:T.DoubleSide,...extra});
 m.onBeforeCompile=s=>{characterBounce(s,.045);s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`\n#ifdef USE_MAP\n vec2 craftedUV=vec2(${origin[0].toFixed(2)},${origin[1].toFixed(2)})+vec2(.005)+fract(vMapUv*${cloth?'3.0':'1.0'})*.49;\n vec3 scan=texture2D(map,craftedUV).rgb;\n float grain=dot(scan,vec3(.2126,.7152,.0722));\n float edgeWear=pow(abs(fract(vMapUv.y)-.5)*2.0,28.0);
 diffuseColor.rgb*=mix(vec3(1.),vec3(1.16,1.11,1.04),edgeWear*.55);
 diffuseColor.rgb*=clamp(pow(grain/${metal?'.46':cloth?'.052':'.071'},.45),.55,1.30);\n#endif\n`);};
 m.customProgramCacheKey=()=> 'tailored-material-224-'+kind;return m;
}
