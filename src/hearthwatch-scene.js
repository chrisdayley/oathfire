import * as T from 'three';
import {box,cyl,mesh} from './art.js';
import {cutStone,oak} from './building-materials.js';
import {worldMaterial,material} from './materials.js';

// Broad authored surfaces, limited materials and no additional shadow maps.
// The central gate route (|x|<6) and every NPC approach remain unobstructed.
export const GARDEN_POSITIONS=[[-11,-5],[11,-5],[-11,14],[11,14]];
export function lightHearthwatch(view){
 view.sun.color.setHex(0xffdfb2);view.sun.intensity=2.3;
 view.scene.environmentIntensity=.40;view.renderer.toneMappingExposure=.92;
 for(const light of view.scene.children)if(light.isHemisphereLight){light.color.setHex(0x9bbbd4);light.groundColor.setHex(0x39382b);light.intensity=.55;}
}
export function dressHearthwatch(w){
 const g=w.static,stone=cutStone(0xc8b68e),dark=cutStone(0x706e60),wood=oak(),iron=material('steel',0x292f2c,{roughness:.56}),soil=worldMaterial('soil',0x5c5040,2),leaf=new T.MeshStandardMaterial({color:0x667b42,roughness:.96}),flower=new T.MeshStandardMaterial({color:0xc8985d,roughness:.85}),glow=new T.MeshStandardMaterial({color:0xffd290,emissive:0xffa644,emissiveIntensity:1.8,roughness:.45});
 // Limestone avenues and their edging divide one huge paving texture into
 // legible streets. Flat meshes never change terrain height or player saves.
 const path=worldMaterial('rock',0xd2c3a4,2.2,{normalScale:new T.Vector2(.18,.18),roughness:.92});
 const surface=(width,depth,x,z,mat,y=.025)=>{const o=mesh(new T.PlaneGeometry(width,depth),mat,g,x,y,z);o.rotation.x=-Math.PI/2;o.castShadow=false;return o;};
 surface(8.6,45,0,7,path);surface(42,4.3,0,6,path,.027);
 for(const x of [-4.5,4.5])surface(.24,45,x,7,dark,.029);
 for(const z of [3.7,8.3])surface(42,.18,0,z,dark,.031);
 // An eight-part rose inlaid around the beacon gives the square a focal point.
 const disc=mesh(new T.CircleGeometry(4.6,48),dark,g,0,.032,6);disc.rotation.x=-Math.PI/2;disc.castShadow=false;
 const rim=mesh(new T.RingGeometry(4.25,4.48,48),stone,g,0,.037,6);rim.rotation.x=-Math.PI/2;rim.castShadow=false;
 for(let i=0;i<8;i++){const a=i*Math.PI/4,s=new T.Shape();s.moveTo(0,0);s.lineTo(Math.sin(a-.12)*2.2,Math.cos(a-.12)*2.2);s.lineTo(Math.sin(a)*4.03,Math.cos(a)*4.03);s.lineTo(Math.sin(a+.12)*2.2,Math.cos(a+.12)*2.2);s.closePath();const o=mesh(new T.ShapeGeometry(s),i%2?stone:path,g,0,.040,6);o.rotation.x=-Math.PI/2;o.castShadow=false;}
 // Planted seating islands frame the square, set away from service coordinates.
 for(const [x,z]of GARDEN_POSITIONS){
  box(g,[4.1,.16,2.8],[x,.08,z],dark);box(g,[3.8,.32,2.5],[x,.30,z],stone);box(g,[3.36,.09,2.05],[x,.50,z],soil);
  for(const xx of [-1.4,1.4])box(g,[.22,.22,2.5],[x+xx,.57,z],stone);
  for(let i=0;i<14;i++){const xx=x-1.45+(i%7)*.48,zz=z-.70+Math.floor(i/7)*1.15,plant=mesh(new T.IcosahedronGeometry(.32,1),leaf,g,xx,.79,zz);plant.scale.set(1,.62,1);if(i%3===0){const bloom=mesh(new T.SphereGeometry(.105,6,4),flower,g,xx,.99,zz);bloom.scale.y=.55;}}
  // Bench seats face the avenue; modeled rails and legs cast actual shadows.
  const bx=x-Math.sign(x)*2.48;box(g,[.72,.14,2.65],[bx,.56,z],wood);box(g,[.13,.65,2.65],[bx+Math.sign(x)*.37,.92,z],wood);
  for(const dz of [-.96,.96]){box(g,[.12,.56,.17],[bx-.22,.28,z+dz],iron);box(g,[.12,.56,.17],[bx+.22,.28,z+dz],iron);}
  w.physics.addBox(x,.52,z,4.1,1.04,2.8,'town-garden');w.nav.push({x,z,hx:2.35,hz:1.7,top:1.04,bottom:0});
  w.physics.addBox(bx,.64,z,.92,1.28,2.65,'town-bench');w.nav.push({x:bx,z,hx:.76,hz:1.62,top:1.28,bottom:0});
 }
 // Two lantern pairs add visual rhythm. Only two unshadowed lights are added.
 for(const [index,[x,z]]of [[-8,-7],[8,-7],[-8,17],[8,17]].entries()){
  cyl(g,.24,.34,.22,[x,.11,z],stone,12);cyl(g,.055,.09,2.65,[x,1.42,z],iron,10);
  const lamp=new T.Group();lamp.position.set(x,2.73,z);g.add(lamp);box(lamp,[.42,.48,.42],[0,0,0],glow);cyl(lamp,0,.36,.22,[0,.35,0],iron,4).rotation.y=Math.PI/4;
  for(const dx of [-.23,.23])for(const dz of [-.23,.23])box(lamp,[.035,.64,.035],[dx,0,dz],iron);
  box(lamp,[.53,.07,.53],[0,-.29,0],iron);
  if(index<2){const light=new T.PointLight(0xffb767,15,7,2);light.position.set(x,2.7,z);w.dynamic.add(light);}
 }
 // The beacon now lights nearby stone; retain its established animation.
 w.beacon?.traverse(o=>{if(o.isPointLight){o.intensity=28;o.distance=13;o.color.setHex(0xffb35e);}});
 w.scene.backgroundIntensity=.80;
 w.scene.userData.hearthwatchScene={gardens:GARDEN_POSITIONS.length,extraLights:2,shadowLights:0};
}
