import * as T from 'three';
import {mesh,box,cyl,beam} from './art.js';
import {cutStone} from './building-materials.js';
import {material,ART} from './materials.js';
import {seeded} from './data.js';
import {stoneArch,cutBlockGeometry} from './stone-arch.js';

// Shallow architectural relief lies against existing solid walls. The gateway,
// vendors, stairs and wall garrison retain their original collision envelopes.
export function architecturalDetail(w){
 const g=w.static,m=w.materials,r=seeded(214),pal=[0xb3a792,0xc0b39d,0xa99f8c,0xc7bba8].map(cutStone),dark=cutStone(0x827b68);
 const beveled=(size,pos,mat=pal[0],radius=.024)=>mesh(cutBlockGeometry(...size,radius),mat,g,...pos);
 let stones=0;
 function courses(x,y,z,width,height,angle=0){
  const root=new T.Group();root.position.set(x,y,z);root.rotation.y=angle;g.add(root);let row=0,yy=0;
  while(yy<height-.1){const h=Math.min(height-yy,.31+r()*.19);let xx=-width/2;while(xx<width/2-.02){const span=Math.min(width/2-xx,.53+r()*.54),depth=.10+r()*.055;
   const stone=mesh(cutBlockGeometry(span-.025,h-.021,depth,.014),pal[Math.floor(r()*pal.length)],root,xx+span/2,yy+h/2,depth*.19);stone.rotation.z=(r()-.5)*.012;xx+=span;stones++;
  }yy+=h;row++;}return root;
 }
 // Continuous gate soffit follows the two existing arch faces. The top slab
 // remains structural, but can no longer be seen as a flat false ceiling.
 const gp=[],gu=[],gi=[];for(let j=0;j<=8;j++)for(let i=0;i<=28;i++){const a=i/28*Math.PI;gp.push(Math.cos(a)*4.07,4.11+Math.sin(a)*1.93,-19.65+j*5.3/8);gu.push(i/28,j/8);if(j<8&&i<28){const n=j*29+i;gi.push(n,n+1,n+29,n+1,n+30,n+29);}}
 const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(gp,3));gg.setAttribute('uv',new T.Float32BufferAttribute(gu,2));gg.setIndex(gi);gg.computeVertexNormals();const gm=cutStone(0x9f9785);gm.side=T.DoubleSide;mesh(gg,gm,g);
 for(const zz of [-19.62,-16.95,-14.48])stoneArch(g,pal,{y:4.11,z:zz,rx:3.97,ry:1.84,band:.14,depth:.20,count:25});
 // Broad, irregular flagstones establish the principal route, surrounded by
 // smaller existing setts. Low geometry stays below the collision step limit.
 for(let z=-14;z<18;){const length=.63+r()*.38,edge=3.16+Math.sin(z*.47)*.24;let x=-edge;while(x<edge-.1){const width=Math.min(edge-x,.62+r()*.50),cx=x+width/2,cz=z+length/2;if(Math.hypot(cx,cz-6)>2.55){const t=beveled([width-.046,.008,length-.035],[cx,.019,cz],pal[Math.floor(r()*4)],.010);t.rotation.y=(r()-.5)*.043;t.castShadow=false;}x+=width;}z+=length;}
 // Four gatehouse faces, the keep, and flanking walls share credible 30–45cm
 // courses, with separate quoins, load-bearing voussoirs and worn foundations.
 for(const side of [-1,1]){
  courses(side*6.4,.06,-14.42,4.17,7.91);courses(side*6.4,.06,-19.58,4.17,7.91,Math.PI);
  courses(side*7,.05,18.22,7.2,9.86,Math.PI);
  for(const z of [-14.30,-19.70])for(const x of [side*4.36,side*8.44])for(let i=0;i<16;i++)beveled([i%2?.48:.68,.46,.32],[x,.27+i*.49,z],pal[(i+1)%4],.035);
  for(const x of [side*4.39,side*9.61])for(let i=0;i<20;i++)beveled([i%2?.5:.74,.45,.34],[x,.25+i*.49,18.03],pal[i%4]);
  for(const z of [-15.37,-18.63])courses(side*20.8,.12,z,23.7,4.48,z<-17?Math.PI:0);
  for(const x of [side*6.4,side*20.8])beveled([Math.abs(x)<8?4.4:25.2,.4,.45],[x,.21,-15.14],dark,.045);
 }
 // Jambs, inset shadow reveals and a projecting lintel tie the hall portal to
 // the building rather than leaving a floating ornamental arch in front of it.
 for(const side of [-1,1]){box(g,[.22,5.7,1.7],[side*3.37,2.85,18.2],m.stoneDark);for(let i=0;i<11;i++)beveled([.47,.46,1.4],[side*3.59,.26+i*.5,18.27],pal[i%4]);}

 // An actual oak doorway closes the rear of the two-metre-deep entry recess.
 // It covers the unrelated tower behind it; the mission table stays in front.
 const door=new T.Shape();door.moveTo(-3.2,0);door.lineTo(3.2,0);door.lineTo(3.2,4.65);door.absellipse(0,4.65,3.2,2.03,0,Math.PI,false);door.lineTo(-3.2,0);
 const doorGeo=new T.ExtrudeGeometry(door,{depth:.25,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:1,curveSegments:24});mesh(doorGeo,m.wood,g,0,.04,20.36);
 w.physics.addBox(0,3.2,20.5,6.4,6.4,.4,'great-hall-door');w.nav.push({x:0,z:20.5,hx:3.5,hz:.5,top:6.4});
 for(let i=0;i<18;i++){const x=-3.03+i*.356,h=4.65+Math.sqrt(Math.max(0,1-(x/3.2)**2))*2.03;box(g,[.018,h,.055],[x,h/2+.04,20.31],m.iron);}
 for(const x of [-1.6,1.6])for(const y of [.7,2.1,3.75,5.1]){beveled([2.94,.115,.07],[x,y,20.26],m.iron,.012);for(let i=0;i<7;i++)mesh(new T.SphereGeometry(.041,6,4),m.gold,g,x-1.23+i*.41,y,20.205);}
 for(const x of [-.24,.24]){const ring=mesh(new T.TorusGeometry(.13,.027,7,16),m.gold,g,x,2.6,20.16);beveled([.17,.29,.065],[x,2.71,20.22],m.iron);}
 // Barrel vault with a shadowed soffit: true curved geometry instead of a
 // painted arch on a solid rectangle. Its clear height exceeds jumping height.
 const vp=[],vu=[],vi=[];for(let j=0;j<=1;j++)for(let i=0;i<=24;i++){const a=i/24*Math.PI;vp.push(Math.cos(a)*3.3,4.65+Math.sin(a)*2.1,18.15+j*2.15);vu.push(i/24,j);if(j===0&&i<24)vi.push(i,i+1,i+25,i+1,i+26,i+25);}const vault=new T.BufferGeometry();vault.setAttribute('position',new T.Float32BufferAttribute(vp,3));vault.setAttribute('uv',new T.Float32BufferAttribute(vu,2));vault.setIndex(vi);vault.computeVertexNormals();const vaultMat=cutStone(0x99907c);vaultMat.side=T.DoubleSide;mesh(vault,vaultMat,g);
 for(const side of [-1,1])box(g,[.23,4.65,2.1],[side*3.3,2.325,19.25],dark);
 // The great hall has tall lancets with dark recessed stone reveals, not flat
 // black rectangles. Copper leadwork and dim amber glazing add material depth.
 const glass=material('steel',0x3b483f,{metalness:.25,roughness:.38,emissive:0x8c5728,emissiveIntensity:.19});
 for(const x of [-7,7]){for(const dx of [-.38,.38]){box(g,[.42,2.1,.06],[x+dx,6.05,17.76],glass);for(let i=0;i<5;i++)beam(g,[x+dx-.2,5.13+i*.4,17.70],[x+dx+.2,5.45+i*.4,17.70],.014,m.iron,5);}for(const dx of [-.72,.72])beveled([.19,2.85,.50],[x+dx,6.03,17.67],pal[2]);}
 // Perimeter foundation dirt stays at the edge; plant growth does not fill the
 // centre of the yard or cover the player's navigation and mission table.
 const soil=material('leather',0x5b5140,{roughness:1,transparent:true,opacity:.46,depthWrite:false});
 for(const [x,z,width,depth]of [[0,-15.2,62,.9],[-32.7,8,1,47],[32.7,8,1,47],[-24,8.6,11,.7],[25,9.6,10,.7],[0,18.05,23,.7]]){const p=mesh(new T.PlaneGeometry(width,depth),soil,g,x,.021,z);p.rotation.x=-Math.PI/2;p.castShadow=false;}
 // Deep workshop side doors, shaped brackets, pegged timber joints, shutters,
 // rainwater shoes and plinth courses replace visually unsupported flat beams.
 const shutter=[material('leather',0x384b50,{roughness:.96}),material('leather',0x624036,{roughness:.96})];
 for(const [x,z,width]of [[-24,12,10.8],[25,13,9.8],[-25,25,7.8],[25,26,7.8]]){
  const side=-Math.sign(x),face=x+side*(width/2+.14),angle=side>0?Math.PI/2:-Math.PI/2;
  for(let row=0;row<3;row++)for(let i=0;i<8;i++)beveled([.28,.30,.66],[face,.17+row*.32,z-2.55+i*.72],pal[(row+i)%4]);
  for(const zz of [z-1.5,z+1.5])for(const dz of [-.64,.64]){const sx=face+side*.24;beveled([.17,1.78,.31],[sx,5,zz+dz],shutter[x<0?0:1]);for(const y of [4.38,5.52])box(g,[.21,.055,.32],[sx+side*.07,y,zz+dz],m.iron);}
  for(const yy of [1,3.7,6.3])for(const zz of [z-2.6,z,z+2.6]){const peg=cyl(g,.035,.035,.10,[face+side*.17,yy,zz],m.iron,8);peg.rotation.z=Math.PI/2;}
  for(let i=0;i<6;i++){const zz=z-2.5+i;beam(g,[face+side*.1,3.1,zz],[face+side*.42,3.7,zz],.09,m.wood,6);}
  // A stone gutter with a copper downpipe anchors the building to the courtyard.
  const px=x+(width/2-.23),pz=z-3.26;beam(g,[px,6.26,pz],[px,.50,pz],.046,m.iron,8);beam(g,[px,.5,pz],[px,.19,pz-.4],.05,m.iron,8);
 }
 // One canopy per stall is supplied by royalCourtyard. The furniture below it
 // has planks and open supporting legs, with appropriately scaled wares.
 const clay=material('leather',0x98654d,{normalScale:new T.Vector2(.10,.10),roughness:.91}),apple=material('leather',0x89422a,{normalScale:new T.Vector2(.05,.05),roughness:.64}),pear=material('leather',0xa38e44,{normalScale:new T.Vector2(.04,.04),roughness:.64});
 for(const [x,z]of [[-21,2.7],[21.8,3.6],[-21,18.5],[22.5,20]]){
  for(const dx of [-2.6,2.6])w.physics.addBox(x+dx,1.6,z-1.1,.13,3.2,.13,'stall-post');
  const cz=z+.45;w.physics.addBox(x,.6,cz,4.65,1.2,.95,'market-counter');w.nav.push({x,z:cz,hx:2.65,hz:.75,top:1.2});
  for(let i=0;i<10;i++)beveled([.46,.10,.96],[x-2.10+i*.466,1.12,cz],m.wood,.015);
  for(const dx of [-2.1,2.1])for(const dz of [-.34,.34])box(g,[.15,1.09,.15],[x+dx,.545,cz+dz],m.wood);
  for(const dz of [-.43,.43]){box(g,[4.5,.15,.09],[x,.83,cz+dz],m.wood);beam(g,[x-2.1,.13,cz+dz],[x+2.1,.87,cz+dz],.043,m.wood,6);}
  for(const xx of [-1.4,-.5]){const basket=cyl(g,.37,.29,.20,[x+xx,1.27,cz],m.wood,14);const rim=mesh(new T.TorusGeometry(.36,.027,6,20),m.wood,g,x+xx,1.37,cz);rim.rotation.x=Math.PI/2;for(let j=0;j<16;j++){const a=j*2.4,rr=Math.sqrt(j/16)*.27;mesh(new T.SphereGeometry(.073,8,6),xx<-1?apple:pear,g,x+xx+Math.cos(a)*rr,1.39+(j%3)*.035,cz+Math.sin(a)*rr);}}
  for(let i=0;i<4;i++){const profile=[[0,0],[.11,.02],[.18,.16],[.13,.28],[.065,.33],[.065,.43],[.075,.46],[.05,.46],[.05,.39]].map(([a,b])=>new T.Vector2(a,b));mesh(new T.LatheGeometry(profile,14),clay,g,x+.42+i*.38,1.18,cz+(i%2)*.13-.08);}
 }
 // Ivy grows in irregular patches and trailing clusters instead of a regular
 // sticker strip. Cards batch with the existing static geometry.
 const ivy=material('cloth',0xa8b185,{map:ART.textures['hornbeam-leaf'],alphaTest:.5,side:T.DoubleSide,roughness:1});
 for(const [x,z,height,width]of [[-8.8,-14.2,6.5,1.0],[9,-14.18,4.5,1.1],[-10.7,18.0,7,1.0],[-32.9,12,4.8,1.3],[31.9,29,3.4,1.3]])for(let i=0;i<160;i++){
  const t=r(),yy=.2+t*height,xx=x+Math.sin(yy*1.6)*.24+(r()-.5)*width*(1-t*.65);if(r()>.88)continue;const p=mesh(new T.PlaneGeometry(.15+r()*.19,.19+r()*.20),ivy,g,xx,yy,z+.06+r()*.04);p.rotation.set((r()-.5)*.5,(r()-.5)*.9,r()*Math.PI);p.castShadow=false;
 }
 // Restrained contact shade anchors nearby furniture/foundations where the
 // mobile directional-shadow map cannot retain sub-centimetre contact detail.
 const contact=new T.ShaderMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,vertexShader:'varying vec2 contactUv;void main(){contactUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 contactUv;void main(){vec2 q=abs(contactUv-.5)*2.;float a=(1.-smoothstep(.32,1.,max(q.x,q.y)))*.23;gl_FragColor=vec4(.055,.047,.035,a);}'});
 for(const [x,z,width,depth]of [[-24,12,12,7.4],[25,13,11.2,7.4],[-25,25,9,8.4],[25,26,9,8.4],[-21,3.15,5.5,1.9],[21.8,4.05,5.5,1.9],[-21,18.95,5.5,1.9],[22.5,20.45,5.5,1.9],[-17,8,1.7,1.7],[0,15.5,3.8,2.8]]){const shade=mesh(new T.PlaneGeometry(width,depth),contact,g,x,.032,z);shade.rotation.x=-Math.PI/2;shade.castShadow=false;}
 // Ease exposed joinery and crenellation edges. These share geometry by size
 // and retain the same footprints, rather than expanding collision surfaces.
 const softened=new Map();g.traverse(o=>{if(!o.isMesh||o.geometry.type!=='BoxGeometry'||![m.wood,m.cap].includes(o.material))return;const {width,height,depth}=o.geometry.parameters;if(Math.min(width,height,depth)<.09)return;const key=[width,height,depth].join(',');if(!softened.has(key))softened.set(key,cutBlockGeometry(width,height,depth,.022));o.geometry=softened.get(key);});
 w.root.userData.architecturalDetail={revision:214,reliefStones:stones,softenedJoinery:softened.size,existingCollisionPlan:true};
}
