import * as T from 'three';
import {ART,worldMaterial} from './materials.js';
export function stoneSurface(){return worldMaterial('stone',0xc6c0ae,2.5,{normalScale:new T.Vector2(.75,.75),roughness:.93});}
export function groundSurface(biome='plain'){
 const grassy=!['snow','desert','quarry'].includes(biome),m=worldMaterial(grassy?'grass':'soil',biome==='snow'?0xdce5e5:biome==='desert'?0xddc496:grassy?0xc4c9af:0xb8b3a4,3.5,{roughness:1});
 if(biome==='snow'){m.map=null;m.normalScale.set(.22,.22);}
 if(grassy){const compile=m.onBeforeCompile;m.onBeforeCompile=s=>{compile(s);s.uniforms.pathMap={value:ART.textures['soil-color']};s.fragmentShader='uniform sampler2D pathMap;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float roadDistance=abs(vSurfaceWorld.x-sin(vSurfaceWorld.z*.025)*4.);float road=1.-smoothstep(3.1,5.6,roadDistance);
 diffuseColor.rgb=mix(diffuseColor.rgb,texture2D(pathMap,vSurfaceWorld.xz/3.5).rgb*.88,road);
 `);};m.customProgramCacheKey=()=> 'oathfire-grass-path-v2';}
 return m;
}
