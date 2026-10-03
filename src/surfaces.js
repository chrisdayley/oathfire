import * as T from 'three';
import {ART,worldMaterial} from './materials.js';
export function stoneSurface(){return worldMaterial('stone',0xc6c0ae,2.5,{normalScale:new T.Vector2(.75,.75),roughness:.93});}
export function groundSurface(biome='plain'){
 const grassy=!['snow','desert','quarry'].includes(biome),m=worldMaterial(grassy?'grass':'soil',biome==='snow'?0xdce5e5:biome==='desert'?0xddc496:grassy?0xc4c9af:0xb8b3a4,3.5,{roughness:1});
 if(biome==='snow'){m.map=null;m.normalScale.set(.22,.22);}
 if(grassy){const compile=m.onBeforeCompile;m.onBeforeCompile=s=>{compile(s);s.uniforms.pathMap={value:ART.textures['soil-color']};s.fragmentShader='uniform sampler2D pathMap;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float meadow=sin(vSurfaceWorld.x*.055+vSurfaceWorld.z*.031)*.5+.5;
 diffuseColor.rgb*=mix(vec3(.90,1.22,.84),vec3(.95,1.35,.87),meadow);
 float roadDistance=abs(vSurfaceWorld.x-sin(vSurfaceWorld.z*.025)*4.);
 float verge=sin(vSurfaceWorld.z*.43+sin(vSurfaceWorld.x*.51))*sin(vSurfaceWorld.z*.17)*.7;
 float road=1.-smoothstep(2.7+verge,5.1+verge,roadDistance);
 float meadowPatch=sin(vSurfaceWorld.x*.17+sin(vSurfaceWorld.z*.09)*2.)*cos(vSurfaceWorld.z*.13)+sin(vSurfaceWorld.x*.53+vSurfaceWorld.z*.32)*.22;
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.78,.72,.56),smoothstep(.3,1.,meadowPatch)*.35);

 diffuseColor.rgb=mix(diffuseColor.rgb,texture2D(pathMap,vSurfaceWorld.xz/3.5).rgb*.88,road);
 ${biome==='river'?`
 float rz=vSurfaceWorld.z,rx=12.+sin(rz*.045)*15.+140.*pow(max(0.,(rz+65.)/40.),2.);
 float rw=6.8+sin(rz*.071)*.65+sin(rz*.019)*.45;
 float bankDistance=abs(vSurfaceWorld.x-rx)-rw;
 float bank=(1.-smoothstep(-.5,2.6,bankDistance+sin(rz*1.2)*.16))*step(rz,-24.);
 vec3 bankSoil=texture2D(pathMap,vSurfaceWorld.xz/2.).rgb*vec3(.42,.40,.32);
 diffuseColor.rgb=mix(diffuseColor.rgb,bankSoil,bank);
 `:''}
 `);};m.customProgramCacheKey=()=> 'oathfire-grass-path-v5-'+biome;}
 return m;
}
