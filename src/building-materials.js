import * as T from 'three';
import {worldMaterial} from './materials.js';

// These use the bundled CC0 scans at architectural scale. A carved stone is
// rock, never another miniature brick wall. Weather is continuous across joins.
const noise=`
float buildingHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float buildingNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(buildingHash(i),buildingHash(i+vec2(1.,0.)),f.x),mix(buildingHash(i+vec2(0.,1.)),buildingHash(i+vec2(1.)),f.x),f.y);}
`;
function weather(m,{strength=.2,plaster=false,paving=false}={}){
 const compile=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=s=>{compile(s);s.fragmentShader=noise+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec3 bw=vSurfaceWorld;
 float age=buildingNoise(bw.xz*.23+bw.y*.037)*.65+buildingNoise(bw.xz*.81+bw.y*.11)*.35;
 float runnels=buildingNoise(vec2(bw.x+bw.z,bw.y*.075)*1.7);
 float damp=(1.-smoothstep(.1,2.4,bw.y))*(.25+age*.75);
 diffuseColor.rgb*=1.-${strength.toFixed(3)}*age-.11*runnels;
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.53,.59,.44),damp*.32);
 ${plaster?'diffuseColor.rgb*=.91+.16*buildingNoise(bw.xy*7.+bw.z);':''}
 ${paving?`float soilAge=buildingNoise(bw.xz*.115);
 float footway=1.-smoothstep(2.3,6.,abs(bw.x));
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.56,.48,.34),smoothstep(.43,.79,soilAge)*.45*(1.-footway*.6));`:''}
 `);};
 m.customProgramCacheKey=()=>key+'-weather214-'+strength+'-'+plaster+'-'+paving;m.name=plaster?'Weathered lime plaster':paving?'Worn courtyard setts':'Weathered architectural stone';return m;
}
export const masonry=(color=0xd1c4ad)=>weather(worldMaterial('stone',color,3.25,{normalScale:new T.Vector2(.62,.62),roughness:.96}),{strength:.18});
export const cutStone=(color=0xb9ac94)=>weather(worldMaterial('rock',color,2.3,{normalScale:new T.Vector2(.27,.27),roughness:.91}),{strength:.16});
export const limePlaster=(color=0xc0b49a)=>weather(worldMaterial('rock',color,2.3,{map:null,normalScale:new T.Vector2(.095,.095),roughness:1}),{strength:.12,plaster:true});
export const slate=(color=0x66717a)=>weather(worldMaterial('rock',new T.Color(color).lerp(new T.Color(0x859095),.34).getHex(),1.1,{normalScale:new T.Vector2(.37,.37),roughness:.83}),{strength:.12});
export const oak=()=>weather(worldMaterial('timber',0x766453,1.45,{normalScale:new T.Vector2(.36,.36),roughness:.91}),{strength:.11});
export const paving=()=>weather(worldMaterial('cobble',0xaaa08b,2.55,{normalScale:new T.Vector2(.52,.52),roughness:.86}),{strength:.24,paving:true});
