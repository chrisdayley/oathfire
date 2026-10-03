import {stoneArch} from './stone-arch.js';
import {cutStone,masonry,slate as roofSlate} from './building-materials.js';
import * as T from 'three';
import {craftedRoof,craftedHouse} from './architecture.js';
import {ART,material,worldMaterial} from './materials.js';
import {box,cyl,mesh,beam,sunBadge,compactRigid} from './art.js';
import {windowArch} from './environment-design.js';
import {seeded} from './data.js';

export function buildScenography(w){
 const m=w.materials,g=w.static,r=seeded(46292),snow=w.biome==='snow',arid=w.biome==='desert';
 const ivory=cutStone(0xbfb5a1),warm=masonry(0xb5ac95),copper=material('steel',0x9b7950,{metalness:.65,roughness:.55}),slate=roofSlate(0x45536a),cloth=material('cloth',0xd4b67a,{side:T.DoubleSide});
 const motion={mills:[],birds:null,smoke:null};w.scenography=motion;
 // Architecture has thickness, recessed glazing and supports. This occupies the
 // original buildings or space beyond the walls; it never narrows the combat lane.
 for(const [x,z,width]of [[-24,12,10.8],[25,13,9.8],[-25,25,7.8],[25,26,7.8]]){
  const front=z-3.14;for(const dx of [-width*.43,0,width*.43]){box(g,[.26,6.3,.26],[x+dx,3.15,front],m.wood);for(const yy of [.8,3.7]){const brace=beam(g,[x+dx,yy,front],[x+dx+(dx>0?-.7:.7),yy+.75,front],.075,m.wood);}}
  // Richly modeled facing gable ends are visible from the central square.
  const face=x-Math.sign(x)*(width/2+.07);for(const zz of [z-2.6,z,z+2.6])box(g,[.19,6.4,.18],[face,3.2,zz],m.wood);for(const yy of [1,3.7,6.3])box(g,[.24,.18,6],[face,yy,z],m.wood);
  for(const zz of [z-1.5,z+1.5]){windowArch(g,face-Math.sign(x)*.13,4.2,zz,.95,1.6,m,x<0?Math.PI/2:-Math.PI/2);box(g,[.65,.21,1.55],[face-Math.sign(x)*.22,4.02,zz],m.wood);for(let i=0;i<8;i++){const pot=mesh(new T.SphereGeometry(.09,5,4),i%2?cloth:m.teal,g,face-Math.sign(x)*.3,4.18+r()*.15,zz-.5+i*.15);}}
  // Decorative corbels beneath upper storeys support the overhang.
  for(let i=0;i<8;i++){const xx=x-width*.43+i*width*.86/7;beam(g,[xx,3.0,front+.3],[xx,3.65,front-.22],.09,m.wood);box(g,[.24,.2,.64],[xx,3.65,front],m.wood);}
 }
 // The great hall entry is a deep three-ring portal; its columns stay beside
 // the usable opening and its high arch remains above the hero's jump height.
 for(const side of [-1,1])for(let layer=0;layer<3;layer++){const x=side*(3.62+layer*.26),z=17.75-layer*.21;cyl(g,.13,.19,5.55,[x,2.775,z],ivory,14);cyl(g,.25,.24,.2,[x,.15,z],warm,12);cyl(g,.22,.27,.28,[x,5.4,z],ivory,12);if(side===1)stoneArch(g,ivory,{y:5.4,z:z-.08,rx:3.46+layer*.26,ry:2.23+layer*.13,band:.22,depth:.25,count:25});}
 // Intricate stone balustrades, golden medallions, gallery canopies and rain chains.
 for(const x of [-7,7]){for(let i=-4;i<=4;i++){const xx=x+i*.38;cyl(g,.045,.065,.70,[xx,4.58,16.75],ivory,8);cyl(g,.095,.065,.12,[xx,4.46,16.75],ivory,8);}craftedRoof(g,m,{x,y:7.9,z:18.0,width:3.8,depth:1.8,rise:.7,tiles:true,tint:0x426371});const badge=sunBadge(g,.3,copper);badge.position.set(x,7.15,17.36);}
 // Massed upper town rises behind the walls: houses are staggered on stone
 // terraces, with a cathedral and tall turrets rather than a flat block skyline.
 for(const side of [-1,1])for(let row=0;row<2;row++)for(let i=0;i<4;i++){
  const x=side*(48+row*14+i*.9),z=22+i*14+row*3,base=2.5+row*5,h=7+(i%3)*1.6;
  box(g,[13,base+3,15],[x,(base-3)/2,z],warm);if(z<54){w.physics.addBox(x,(base+h)/2,z,13,base+h,15,'upper-town');w.nav.push({x,z,hx:7,hz:8,top:base+h});}for(const yy of [base-1,base+.2])box(g,[13.5,.35,15.4],[x,yy,z],ivory);
  craftedHouse(w,x,base,z,{width:8.5+(i%2),depth:8,height:h,angle:side*.14,tint:[0xcab389,0xb6a38b,0xc9b5a8,0xb5ad86][i],roof:[0x52657b,0x915e44,0x476661,0x5b435a][i],dormers:2,detail:false});
 }
 const cathedral=new T.Group();cathedral.position.set(0,6,64);g.add(cathedral);box(cathedral,[25,19,18],[0,9.5,0],ivory);craftedRoof(cathedral,m,{y:19,width:27,depth:20,rise:8.8,dormers:4,tint:0x395667});
 for(const x of [-15.5,15.5]){cyl(cathedral,3.5,4.2,35,[x,17.5,-6],warm,24);for(const y of [1,8,17,27,34.5])cyl(cathedral,3.8,4,.5,[x,y,-6],ivory,24);for(const y of [10,20,29])for(const dx of [-1.2,1.2])windowArch(cathedral,x+dx,y,-9.55,.75,3.4,m,Math.PI);cyl(cathedral,0,4.6,12,[x,41,-6],slate,24);cyl(cathedral,.09,.2,3,[x,48,-6],copper,10);for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(cathedral,[x+Math.sin(a)*4.6,35,-6+Math.cos(a)*4.6],[x,47,-6],.055,copper,5);}}
 for(const x of [-9,-5,0,5,9]){windowArch(cathedral,x,11,-9.05,1.4,5.2,m,Math.PI);box(cathedral,[.65,18,1.3],[x+2,9,-9.3],warm);}
 // Three windmills are real animated landmarks, backed by rounded farm hills.
 for(const [x,z,size]of [[-150,-56,1.1],[148,-187,1.45],[69,-268,1.7]]){
  const y=7+size*3;const hill=mesh(new T.SphereGeometry(1,28,16),worldMaterial(snow?'rock':'grass',snow?0xc3d0ce:arid?0xb49b68:0xa9a46a,8),g,x,-8,z);hill.scale.set(37,21,31);
  cyl(g,2.3*size,3.3*size,12*size,[x,y+6*size,z],ivory,24);for(const yy of [1,7,11.8])cyl(g,2.6*size,3.0*size,.28*size,[x,y+yy*size,z],warm,24);cyl(g,0,3.2*size,4.4*size,[x,y+14.2*size,z],slate,24);for(const side of [-1,1])windowArch(g,x+side*.85*size,y+5*size,z-2.65*size,.70*size,1.65*size,m,Math.PI);
  const sails=new T.Group();sails.position.set(x,y+10.3*size,z-3.1*size);sails.scale.setScalar(size);w.dynamic.add(sails);cyl(sails,.34,.34,1,[0,0,0],copper,12).rotation.x=Math.PI/2;
  for(let i=0;i<4;i++){const arm=new T.Group();arm.rotation.z=i*Math.PI/2;sails.add(arm);beam(arm,[0,0,0],[0,8.5,0],.10,m.wood);for(const dx of [0,1.55])beam(arm,[dx,2.3,0],[dx,8.4,0],.055,m.wood);for(let j=0;j<10;j++){const yy=2.3+j*.65;beam(arm,[-.2,yy,0],[1.8,yy,0],.034,m.wood);}mesh(new T.PlaneGeometry(1.44,5.4),cloth,arm,.77,5.35,.035);}
  compactRigid(sails);motion.mills.push(sails);craftedHouse(w,x+11*size,y-4,z+5,{width:7*size,depth:6*size,height:4.8*size,dormers:1,detail:false,tint:0xbeb08b,roof:0x82563d});
 }
 // Village fields have furrows, hedgerows and rolling profiles, breaking up the
 // formerly empty apron between the arena, distant towns and painted mountains.
 for(const side of [-1,1])for(let patch=0;patch<5;patch++){
  const x=side*(135+patch%2*27),z=-32-patch*41,col=snow?0xafc5ce:arid?0xb49562:[0xb3a267,0x7b8b46,0xa49554,0x778a51,0x997e50][patch];
  const land=new T.PlaneGeometry(23,29,6,8);land.rotateX(-Math.PI/2);const p=land.attributes.position;for(let k=0;k<p.count;k++)p.setY(k,.2+Math.cos(p.getX(k)*.08)*1.3+Math.sin(p.getZ(k)*.13)*.45);land.computeVertexNormals();const field=mesh(land,worldMaterial('soil',col,3.5),g,x,-1.3,z);field.castShadow=false;
  for(let i=0;i<12;i++)beam(g,[x-10+i*1.8,.2,z-13],[x-10+i*1.8,.2,z+13],.055,m.wood,4);
 }
 // Cobbles get grass at their edges, scattered petals and pots with real profiles.
 const terracotta=worldMaterial('stone',0xa86445,1),lavender=material('cloth',0xb77ab2),goldFlower=material('cloth',0xd9a83b),leaf=material('cloth',0x57724a,{side:T.DoubleSide});
 for(const [x,z]of [[-19.3,4],[-16.6,10],[19.4,8],[22,18],[-26.5,19]]){w.physics.addBox(x,.36,z,.66,.72,.66,'flower-pot');w.nav.push({x,z,hx:.65,hz:.65,top:.72});const profile=[[0,0],[.22,.04],[.30,.12],[.40,.45],[.26,.68],[.28,.72],[.21,.72],[.20,.57]].map(([a,b])=>new T.Vector2(a,b));mesh(new T.LatheGeometry(profile,18),terracotta,g,x,0,z);for(let i=0;i<18;i++){const a=r()*6.28,rad=r()*.25,xx=x+Math.sin(a)*rad,zz=z+Math.cos(a)*rad,h=.85+r()*.4;beam(g,[xx,.5,zz],[xx,h,zz],.009,leaf,4);for(let j=0;j<4;j++){const petal=mesh(new T.SphereGeometry(.035,4,3),i%3?lavender:goldFlower,g,xx+Math.sin(j)*.025,h+j*.025,zz);}}}
 // A small flock and thin chimney plumes bring gentle life without physics cost.
 const birdGeo=new T.BufferGeometry();birdGeo.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.65,.13,.2,-.35,0,-.12,0,0,0,.35,0,-.12,.65,.13,.2],3));birdGeo.computeVertexNormals();const birds=new T.InstancedMesh(birdGeo,new T.MeshBasicMaterial({color:0x343a43,side:T.DoubleSide}),12);birds.frustumCulled=false;w.dynamic.add(birds);motion.birds=birds;motion.dummy=new T.Object3D();
 const smokeGeo=new T.BufferGeometry(),puffs=[];for(let i=0;i<48;i++)puffs.push(0,0,0);smokeGeo.setAttribute('position',new T.Float32BufferAttribute(puffs,3));const smokeMat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{clock:{value:0}},vertexShader:'uniform float clock;varying float age;void main(){float seed=position.x;age=fract(clock*.075+seed);vec3 p=vec3(position.y,position.z,12.0);p.x+=sin(age*5.0+seed*13.0)*.7+age*3.0;p.y+=age*7.0;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((18.0+age*42.0)/max(1.0,-mv.z)*22.0,2.0,85.0);}',fragmentShader:'varying float age;void main(){float d=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-d),2.)*.12*sin(age*3.14159);gl_FragColor=vec4(.67,.65,.62,a);}'});
 const sp=smokeGeo.attributes.position;for(let i=0;i<48;i++)sp.setXYZ(i,i/48,-21.5+(i%2)*46,8.3+(i%2)*1.8);const smoke=new T.Points(smokeGeo,smokeMat);smoke.frustumCulled=false;w.dynamic.add(smoke);motion.smoke=smoke;
 w.root.userData.scenography={revision:1,paintedVista:true,windmills:3,upperTown:16,cathedralHeight:55,roofStyle:'Curved slate courses, timber gables and glazed dormers',birds:12};
}
export function updateScenography(w,dt,time){const s=w.scenography;if(!s)return;for(const mill of s.mills)mill.rotation.z-=dt*.13;if(s.smoke)s.smoke.material.uniforms.clock.value=time;if(s.birds){const d=s.dummy;for(let i=0;i<12;i++){const a=time*.028+i*.12;d.position.set(Math.sin(a)*55+i*.5,23+Math.sin(time*.31+i)*1.2,-66+Math.cos(a)*55);d.rotation.set(0,-a,Math.sin(time*3.3+i)*.19);d.scale.setScalar(.6);d.updateMatrix();s.birds.setMatrixAt(i,d.matrix);}s.birds.instanceMatrix.needsUpdate=true;}}
