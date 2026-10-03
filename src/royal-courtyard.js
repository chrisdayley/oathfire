import {cutStone,oak,slate} from './building-materials.js';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {courtyardProp} from './courtyard-assets.js';
import {material,worldMaterial} from './materials.js';
import {mesh,box,cyl,beam} from './art.js';
import {seeded} from './data.js';

// The forge → market → gate route is built over the existing walkable physics plan.
export function royalCourtyard(w){
 const g=w.static,m=w.materials,r=seeded(1937),stone=cutStone(0xb8ab95),darkStone=cutStone(0x898575),wood=oak(),iron=material('steel',0x313b3b,{roughness:.78}),brick=cutStone(0x937659),tile=slate(0x4d5865),cream=material('cloth',0xcbb798,{side:T.DoubleSide}),wine=material('cloth',0x692d38,{side:T.DoubleSide});
 const block=(size,pos,mat=stone,radius=.04)=>mesh(new RoundedBoxGeometry(...size,1,radius),mat,g,...pos);
 courtyardProp(w,'castle-arch',0,0,-14.15,1,0,false);courtyardProp(w,'castle-arch',0,0,-19.85,1,Math.PI,false);
 for(const side of [-1,1])for(const z of [-14.35,-19.65]){w.physics.addBox(side*4.10,2.35,z,.56,4.7,.6,'carved-gate-pier');w.nav.push({x:side*4.10,z,hx:.40,hz:.42,top:4.7});}
 // A pointed, ribbed arcade lines the market-side wall; openings are recessed.
 for(const x of [-30.9,30.9])for(const z of [4,10,16,23]){
  const side=Math.sign(x);for(const dz of [-1.4,1.4]){cyl(g,.16,.21,3.1,[x,1.55,z+dz],stone,16);block([.52,.18,.52],[x,3.15,z+dz]);block([.48,.20,.48],[x,.10,z+dz]);}
  for(let i=0;i<13;i++){const a=i*Math.PI/12;const o=block([.39,.32,.41],[x,3.12+Math.sin(a)*1.24,z+Math.cos(a)*1.39]);o.rotation.x=a;}
  box(g,[.07,3.45,2.45],[x+side*.27,1.73,z],material('cloth',0x302b24));
 }
 // Imported doors are separate workshop entrances; the mission gate stays open.
 for(const [x,z,angle]of [[-24,8.92,Math.PI],[25,9.92,Math.PI],[-25,21.42,Math.PI],[25,22.42,Math.PI]])courtyardProp(w,'large_castle_door',x,.03,z,2.7,angle,false);
 // The forge hood is a shaped brick chimney; the open workbench remains reachable.
 for(const x of [-23.15,-20.85])block([.52,2.8,1.6],[x,1.4,7.40],brick,.06);
 block([3.5,.36,2.1],[-22,2.92,7.4],brick,.05);
 const hood=mesh(new T.CylinderGeometry(1.06,1.80,1.75,4,1,false),brick,g,-22,3.95,7.4);hood.rotation.y=Math.PI/4;hood.scale.z=.70;
 for(let row=0;row<10;row++)block([1.45,.32,1.24],[-22,4.8+row*.32,7.4],row%3?brick:darkStone,.025);
 block([1.83,.25,1.63],[-22,8.08,7.4],stone);w.physics.addBox(-22,4.75,7.4,1.55,6.3,1.4,'forge-chimney');
 // Slate roof shingles, deep timber eaves and projecting supports cast real shadows.
 for(const [x,z,width]of [[-24,12,10.8],[25,13,9.8]]){
  for(let j=0;j<7;j++){const xx=x-width*.46+j*width*.153;beam(g,[xx,3.87,z-3.15],[xx,3.21,z-2.70],.09,wood);block([.19,.33,.75],[xx,3.81,z-3.17],wood,.025);}
 }
 // A continuous stall frontage makes a sequence of places rather than isolated cubes.
 for(const [x,z,cloth]of [[-21,2.7,wine],[21.8,3.6,cream],[-21,18.5,cream],[22.5,20,wine]]){
  for(const dx of [-2.6,2.6]){beam(g,[x+dx,0,z-1.1],[x+dx,3.3,z-1.1],.06,wood);beam(g,[x+dx,3.1,z-1.1],[x+dx,3.4,z+2],.06,wood);}
  const canopy=new T.PlaneGeometry(5.4,3.5,18,12),p=canopy.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*5)*.026-Math.cos(p.getX(i)*.58)*.28+p.getY(i)*.12);canopy.computeVertexNormals();const awn=mesh(canopy,cloth,g,x,3.12,z+.35);awn.rotation.x=-Math.PI/2;
  for(let i=0;i<18;i++){const hem=mesh(new T.SphereGeometry(.18,8,6,0,Math.PI*2,0,Math.PI/2),i%3?cloth:cream,g,x-2.55+i*.30,2.94,z-1.40);hem.scale.set(1,.65,.18);hem.rotation.z=Math.PI;}
  for(const dx of [-1.65,1.7])courtyardProp(w,'wooden_lantern_01',x+dx,2.03,z-1.28,.48,0,false);
 }
 for(const [x,z,angle]of [[-27,7,0],[-19.4,11.7,1.3],[26.8,7.7,.2],[28,18.5,.5],[-27,21.5,1]])courtyardProp(w,'wooden_barrels_01',x,.01,z,1.05,angle,true);
 for(const [x,z]of [[-17,3],[17.4,17]]){
  courtyardProp(w,'round_wooden_table_01',x,.02,z,.87,0,true);
  for(let i=0;i<3;i++){cyl(g,.07,.085,.14,[x-.25+i*.21,.96,z],material('steel',0xaa865b,{roughness:.68}),12);}
 }
 // Lamps, hanging herbs and ropes add detail close to the player's eye line.
 const herbs=material('cloth',0x626438,{side:T.DoubleSide});for(const [x,z]of [[-26.5,8.1],[-19,8.2],[20,8.8],[27.5,9.8]]){
  beam(g,[x,3.8,z],[x,2.98,z],.015,iron);courtyardProp(w,'wooden_lantern_01',x,2.43,z,.56,0,false);
  for(let j=0;j<5;j++){const xx=x+.23+j*.12;beam(g,[xx,3.04,z],[xx,2.70,z],.003,wood);for(let i=0;i<7;i++){const leaf=mesh(new T.PlaneGeometry(.07,.12),herbs,g,xx+Math.sin(i*2)*.03,2.75-i*.027,z+.02);leaf.rotation.z=i*.8;}}
 }
 // A low stone-lined rill follows the forge edge without crossing the main path.
 const water=new T.MeshStandardMaterial({color:0x536d69,roughness:.19,metalness:.45,transparent:true,opacity:.84});const stream=mesh(new T.PlaneGeometry(.62,16),water,g,-18.2,.045,-3);stream.rotation.x=-Math.PI/2;
 for(const side of [-1,1])for(let i=0;i<24;i++)block([.25,.14,.63],[-18.2+side*.47,.075,-10.5+i*.65],darkStone,.035);
 // Small scattered masonry makes the ground transition into the gardens organically.
 for(const [x,z]of [[-11,5],[12,5],[-14,20],[14,23]])for(let i=0;i<38;i++){
  const a=r()*Math.PI*2,rad=1.5+r()*.35;const rock=block([.13+r()*.12,.08+r()*.08,.16+r()*.12],[x+Math.sin(a)*rad,.03,z+Math.cos(a)*rad],darkStone,.025);rock.rotation.y=r()*6;
 }
 w.root.userData.artRoute={name:'Forge · Royal market · Sun gate',source:'Blender architectural kit + CC0 Poly Haven props',props:4,openGateWidth:8};
}
