import * as T from 'three';
import {box,cyl,mesh,mat} from './art.js';
import {worldMaterial,material} from './materials.js';
export const CHEST_COLORS=[0xcbbd9a,0x93b98f,0x73bcea,0xc397ed,0xffce69];
export function warChest(rarity=0){const root=new T.Group(),wood=worldMaterial('timber',0xa48765,1.5),trim=material('steel',rarity>=3?0xb99d59:0x727879,{roughness:.45,metalness:.85}),dark=mat(0x130f0c,.9),gold=material('steel',0xc9a35b,{roughness:.34,metalness:.9}),glow=mat(CHEST_COLORS[rarity],.3,.5,{emissive:CHEST_COLORS[rarity],emissiveIntensity:.8});
 box(root,[2.65,.16,1.55],[0,.15,0],wood);box(root,[2.40,.07,1.30],[0,.27,0],dark);
 for(const x of [-1.28,1.28])box(root,[.16,1.12,1.55],[x,.77,0],wood);
 for(const z of [-.74,.74])for(let i=0;i<4;i++)box(root,[2.7,.25,.13],[0,.37+i*.26,z],wood);
 for(const x of [-.96,.96]){for(const z of [-.83,.83]){box(root,[.14,1.12,.06],[x,.78,z],trim);for(const y of [.31,.58,.86,1.21])mesh(new T.SphereGeometry(.032,8,6),gold,root,x,y,z+Math.sign(z)*.04);}box(root,[.14,.08,1.65],[x,.19,0],trim);}
 for(const z of [-.81,.81])box(root,[2.78,.12,.09],[0,1.30,z],trim);
 const lid=new T.Group();lid.position.set(0,1.35,-.8);root.add(lid);
 for(let j=0;j<8;j++){const z=(j+.5)*.2,y=.12+Math.sin((j+.5)/8*Math.PI)*.38,p=box(lid,[2.75,.13,.215],[0,y,z],wood);p.rotation.x=-Math.atan(Math.cos((j+.5)/8*Math.PI)*.38*Math.PI/1.6);for(const x of [-.96,.96]){const strap=box(lid,[.16,.08,.218],[x,y+.08,z],trim);strap.rotation.x=p.rotation.x;}}
 for(const x of [-1.31,1.31]){const shape=new T.Shape();shape.moveTo(-.8,0);shape.lineTo(.8,0);shape.absellipse(0,0,.8,.5,0,Math.PI,false,0);shape.closePath();const cap=mesh(new T.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:false}),wood,lid,x,.12,.8);cap.rotation.y=Math.PI/2;}
 const lock=new T.Group();lock.position.set(0,1.18,.9);root.add(lock);box(lock,[.32,.40,.14],[0,0,0],gold);mesh(new T.OctahedronGeometry(.09,0),glow,lock,0,0,.10);
 for(let i=0;i<18;i++){const coin=cyl(root,.085,.085,.03,[(i%6-2.5)*.25,.99+Math.floor(i/6)*.028,(Math.floor(i/6)-1)*.28],gold,12);coin.rotation.z=(i%3-1)*.16;}
 const gem=mesh(new T.IcosahedronGeometry(.17,0),glow,root,.23,1.13,-.12);gem.rotation.set(.2,.6,.3);root.userData={lid,lock,glow,rarity};return root;}
export function disposeChest(root){const geometry=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.material)materials.add(o.material);});geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());root.removeFromParent();}
