import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mesh,cyl,box,beam} from './art.js';
import {material,ART} from './materials.js';

export function sack(parent,pos,mat,scale=1){
 const root=new T.Group();root.position.set(...pos);root.scale.setScalar(scale);parent.add(root);
 const profile=[[0,0],[.22,.025],[.34,.13],[.35,.33],[.29,.50],[.14,.60],[.065,.65],[.10,.72],[.04,.72]].map(([x,y])=>new T.Vector2(x,y));
 const geo=new T.LatheGeometry(profile,24),p=geo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),a=Math.atan2(p.getZ(i),p.getX(i)),f=1+Math.sin(a*9+y*3)*(.045+Math.max(0,y-.42)*.52);p.setXYZ(i,p.getX(i)*f,y,p.getZ(i)*f*.80);}geo.computeVertexNormals();mesh(geo,mat,root);
 const tie=mesh(new T.TorusGeometry(.072,.015,6,18),mat,root,0,.652,0);tie.rotation.x=Math.PI/2;beam(root,[.03,.65,.07],[.15,.51,.10],.010,mat,5);return root;
}
export function burlap(){const m=material('cloth',0x99856a,{map:ART.textures['cloth-color'],normalScale:new T.Vector2(.35,.35),roughness:1});m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
float burlapWeave=dot(texture2D(map,vMapUv).rgb,vec3(.333));diffuseColor.rgb*=.68+sqrt(max(.0,burlapWeave))*.42;
#endif`);};m.customProgramCacheKey=()=> 'undyed-burlap-214';return m;}
export function forgeCraft(w){
 const g=w.static,m=w.materials,iron=material('steel',0x343a3e,{metalness:.40,roughness:.81,normalScale:new T.Vector2(.12,.12)}),face=material('steel',0x74787a,{metalness:.54,roughness:.61,normalScale:new T.Vector2(.08,.08)});
 // The broad stump, narrowed waist, square heel and round horn are distinct
 // forged surfaces. Beveled shoulders catch the key light without blue plastic.
 const stump=new T.LatheGeometry([[0,0],[.52,.03],[.45,.18],[.43,.57],[.47,.63],[0,.63]].map(([x,y])=>new T.Vector2(x,y)),16);mesh(stump,m.wood,g,-17,0,8);
 const shape=new T.Shape();shape.moveTo(-.48,0);shape.lineTo(.48,0);shape.lineTo(.43,.15);shape.lineTo(.21,.26);shape.lineTo(.22,.44);shape.lineTo(.52,.56);shape.lineTo(.53,.73);shape.lineTo(-.66,.73);shape.lineTo(-.66,.54);shape.lineTo(-.25,.44);shape.lineTo(-.25,.23);shape.lineTo(-.48,.13);shape.closePath();
 const body=new T.ExtrudeGeometry(shape,{depth:.48,bevelEnabled:true,bevelThickness:.045,bevelSize:.04,bevelSegments:2});mesh(body,iron,g,-17,.61,7.76);
 mesh(new RoundedBoxGeometry(1.20,.055,.59,2,.02),face,g,-17.055,1.39,8);
 const horn=mesh(new T.ConeGeometry(.215,.88,16),iron,g,-16.10,1.235,8);horn.rotation.z=-Math.PI/2;horn.scale.z=.88;
 const hole=cyl(g,.052,.052,.015,[-17.45,1.423,8.02],m.dark,10);
 w.physics.addBox(-16.8,.7,8,2.05,1.4,.91,'anvil');w.nav.push({x:-16.8,z:8,hx:1.3,hz:.65,top:1.4});
 // Charcoal and a blackened hearth give the existing fire somewhere to burn.
 const soot=material('cloth',0x171411,{roughness:1}),coal=material('rock',0x282522,{roughness:1}),ember=material('rock',0x75351b,{emissive:0xe94609,emissiveIntensity:1.3,roughness:1});
 box(g,[1.70,1.15,.08],[-22,1.63,8.19],soot);box(g,[1.67,.07,1.38],[-22,1.25,7.35],soot);
 for(let i=0;i<38;i++){const c=mesh(new T.IcosahedronGeometry(.08+(i%4)*.012,1),i%4?coal:ember,g,-22+Math.sin(i*2.4)*(.2+(i%5)*.11),1.32,7.35+Math.cos(i*2.4)*.48);c.scale.y=.65;}
 const glow=new T.PointLight(0xff762d,6,5.4,2);glow.position.set(-22,1.7,6.9);w.dynamic.add(glow);
 // Tools are hung on a connected rack beside the forge, with visible handles.
 for(const x of [-24.5,-23])box(g,[.09,2.8,.12],[x,1.4,8.72],m.wood);box(g,[1.65,.12,.12],[-23.75,2.52,8.70],m.wood);
 for(let i=0;i<4;i++){const x=-24.30+i*.35;beam(g,[x,2.45,8.6],[x,1.53,8.6],.025,i%2?iron:m.wood,8);if(i%2)beam(g,[x,1.54,8.6],[x+.12,1.39,8.6],.024,iron,6);else mesh(new RoundedBoxGeometry(.25,.13,.15,1,.025),iron,g,x,1.57,8.6);}
}
