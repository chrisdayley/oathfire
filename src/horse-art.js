import * as T from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {mesh,beam,compactRigid} from './art.js';
import {material} from './materials.js';
import {MOUNTS} from './mount-rules.js';

// Anatomical surfaces are continuous ring lofts: the ribcage, sloping neck,
// long facial plane and tapered limbs have their own contours, not ball joints.
function loft(parent,rings,mat,axis='z',sides=20){
 const smooth=[];for(let i=0;i<rings.length-1;i++){const a=rings[Math.max(0,i-1)],b=rings[i],c=rings[i+1],d=rings[Math.min(rings.length-1,i+2)];for(let j=0;j<4;j++){const t=j/4;smooth.push(b.map((v,k)=>k===0?v+(c[k]-v)*t:Math.max(k>1?.001:-Infinity,.5*((2*v)+(-a[k]+c[k])*t+(2*a[k]-5*v+4*c[k]-d[k])*t*t+(-a[k]+3*v-3*c[k]+d[k])*t*t*t))));}}smooth.push(rings.at(-1));rings=smooth;
 const pos=[],uv=[],idx=[],colors=[];
 for(let i=0;i<rings.length;i++){const [a,c,rx,ry]=rings[i];for(let j=0;j<=sides;j++){const t=j/sides*Math.PI*2,x=Math.cos(t)*rx,q=Math.sin(t)*ry;pos.push(x,axis==='z'?c+q:a,axis==='z'?a:c+q);uv.push(j/sides,i/(rings.length-1));if(mat.userData.horseCoat){const shade=.81+.16*Math.sin(t)+.025*Math.sin(i*.4+j*.7),dapple=mat.userData.dapple?.045*Math.sin(i*2.71+j*1.78)*Math.sin(j*2.19-i*.51):0;colors.push(shade+dapple,shade+dapple,shade+dapple);}}}
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;const flip=(rings.at(-1)[0]>rings[0][0])===(axis==='z');if(flip)idx.push(a,a+1,b,b,a+1,b+1);else idx.push(a,b,a+1,b,b+1,a+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);if(colors.length)geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();return mesh(geo,mat,parent);
}
const oval=(g,scale,pos,m)=>{const geo=new T.SphereGeometry(1,18,12);if(m.userData.horseCoat){const col=new Float32Array(geo.attributes.position.count*3).fill(.88);geo.setAttribute('color',new T.BufferAttribute(col,3));}const o=mesh(geo,m,g,...pos);o.scale.set(...scale);return o;};
function line(g,points,r,m){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(8,points.length*5),r,6,false),m,g);}
function plate(g,points,m,edge){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();let geo=new T.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelThickness:.012,bevelSize:.014,bevelSegments:2,steps:1});const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,p.getZ(i)+.06*Math.cos(x*4)+.025*Math.sin(y*6));}p.needsUpdate=true;geo.deleteAttribute('normal');const flat=geo;geo=mergeVertices(geo,.0001);flat.dispose();geo.computeVertexNormals();const o=mesh(geo,m,g);if(edge){const p=points.map(([x,y])=>[x,y,.045+.06*Math.cos(x*4)+.025*Math.sin(y*6)]);p.push(p[0]);line(o,p,.010,edge);}return o;}
function heraldry(g,r,metal,glow=null){const badge=new T.Group();g.add(badge);const disk=mesh(new T.CylinderGeometry(r*.43,r*.43,.018,18),metal,badge);disk.rotation.x=Math.PI/2;for(let i=0;i<12;i++){const a=i*Math.PI/6;const ray=plate(badge,[[0,r*.50],[-r*.095,r*.69],[0,r],[r*.06,r*.66]],metal);ray.rotation.z=a;}if(glow){const gem=oval(badge,[r*.27,r*.27,.032],[0,0,.04],glow);}return badge;}
let hair;
function hairTexture(){if(hair)return hair;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#a7a19a';x.fillRect(0,0,256,256);let seed=721;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;for(let i=0;i<12500;i++){const v=rand()*40+120;x.strokeStyle=`rgba(${v},${v},${v},.14)`;const a=rand()*256,b=rand()*256;x.beginPath();x.moveTo(a,b);x.lineTo(a+(rand()-.5)*2,b+2+rand()*6);x.stroke();}hair=new T.CanvasTexture(c);hair.wrapS=hair.wrapT=T.RepeatWrapping;hair.colorSpace=T.SRGBColorSpace;hair.userData.shared=true;return hair;}
export function makeHorse(def=MOUNTS[0]){
 const g=new T.Group(),body=new T.Group(),neck=new T.Group(),head=new T.Group();g.name='Horse_'+def.id;g.add(body);body.add(neck);body.add(head);
 const coat=new T.MeshStandardMaterial({color:def.coat,map:hairTexture(),roughness:.62,metalness:.015,bumpMap:hairTexture(),bumpScale:.012,vertexColors:true});coat.userData.horseCoat=true;coat.userData.dapple=def.rarity===2;const dark=new T.MeshStandardMaterial({color:0x191b20,roughness:.77});const muzzle=new T.MeshStandardMaterial({color:new T.Color(def.coat).multiplyScalar(.48),roughness:.62});const mane=material('cloth',def.rarity===6?0x9b947e:0x29272a,{roughness:.98});const leather=material('leather',0x382b22,{roughness:.72}),cloth=material('cloth',def.cloth,{roughness:.85}),steel=material('steel',def.metal,{roughness:.57,metalness:.84}),gold=material('steel',def.trim,{roughness:.51,metalness:.8});const glow=def.glow?new T.MeshStandardMaterial({color:def.glow,emissive:def.glow,emissiveIntensity:1.5,roughness:.36,metalness:.3}):null;
 const r=def.rarity;
 loft(body,[[-.96,1.37,.015,.05],[-.87,1.37,.22,.32],[-.67,1.38,.38,.46],[-.38,1.39,.415,.47],[0,1.38,.40,.46],[.32,1.4,.37,.45],[.57,1.44,.325,.43],[.73,1.46,.21,.31],[.82,1.46,.02,.08]],coat,'z',28);
 // Scapula ridges, muscular croup and a rising wither merge into the barrel.
 for(const side of [-1,1]){const shoulder=oval(body,[.115,.36,.23],[side*.275,1.36,.52],coat);shoulder.rotation.x=-.17;const thigh=oval(body,[.12,.33,.245],[side*.29,1.36,-.66],coat);thigh.rotation.x=.2;}
 loft(neck,[[1.35,.49,.23,.28],[1.57,.56,.27,.34],[1.82,.67,.245,.29],[2.04,.81,.195,.24],[2.23,.92,.145,.18],[2.31,.94,.07,.095]],coat,'y',24);
 head.position.set(0,2.18,1.04);head.rotation.x=.45;
 loft(head,[[-.20,.065,.03,.06],[-.10,.06,.13,.22],[.02,.01,.18,.25],[.19,-.08,.145,.21],[.40,-.21,.103,.13],[.60,-.27,.115,.115],[.71,-.265,.105,.095],[.78,-.26,.012,.024]],coat,'z',24);
 for(const side of [-1,1]){oval(head,[.12,.16,.14],[side*.095,-.10,.045],coat);const ear=new T.Group();ear.position.set(side*.095,.22,-.045);ear.rotation.z=side*-.17;loft(ear,[[0,0,.06,.045],[.08,0,.055,.038],[.20,.02,.025,.018],[.27,.03,.001,.001]],coat,'y',12);oval(ear,[.027,.068,.012],[0,.105,.027],muzzle);head.add(ear);const eye=oval(head,[.025,.036,.042],[side*.16,.022,.10],dark);oval(head,[.012,.012,.012],[side*.183,.035,.115],steel);const brow=oval(head,[.022,.02,.065],[side*.159,.064,.11],coat);brow.rotation.x=.18;oval(head,[.019,.034,.053],[side*.110,-.249,.658],dark);line(head,[[side*.08,-.327,.45],[side*.11,-.335,.66],[side*.078,-.328,.737]],.005,muzzle);}
 oval(head,[.10,.046,.115],[0,-.30,.698],muzzle);
 // Leather bridle, noseband, cheek straps, bit rings and a double rein.
 for(const side of [-1,1]){line(head,[[side*.14,.18,-.03],[side*.185,.045,.075],[side*.135,-.22,.47],[side*.127,-.30,.56]],.014,leather);line(head,[[side*.137,-.21,.47],[0,-.085,.47],[-side*.137,-.21,.47]],.013,leather);const bit=mesh(new T.TorusGeometry(.047,.009,7,16),gold,head,side*.14,-.25,.51);bit.rotation.y=Math.PI/2;line(body,[[side*.18,1.74,1.38],[side*.27,1.68,1.15],[side*.22,1.8,.18]],.009,leather);}
 for(let i=0;i<38;i++){const t=i/37;line(neck,[[0,1.50+t*.81,.24+t*.58],[-.04,1.5+t*.81,.18+t*.58],[-.09,1.36+t*.83,.12+t*.59]],.012,mane);}
 const tail=new T.Group();tail.position.set(0,1.54,-.89);body.add(tail);for(let i=0;i<42;i++){const a=(i-20.5)*.0035,b=Math.sin(i*2.41)*.055;line(tail,[[a,0,b],[a*1.4,-.24,-.18+b],[a*1.8,-.67,-.22+b],[a*1.6+Math.sin(i)*.02,-1.05-(i%5)*.03,-.15+b]],.008,mane);}
 // Cloth covers curve around the back. Their skirt gives the armor a distinct silhouette.
 const blanket=mesh(new T.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI*.57),cloth,body,0,1.42,-.14);blanket.scale.set(.455,.49,.70);
 for(const side of [-1,1]){line(body,[[side*.04,1.80,-.68],[side*.32,1.61,-.68],[side*.43,1.27,-.64]],.012,gold);if(r>=3){const skirt=plate(body,[[-.44,.05],[.48,.05],[.48,-.38],[.27,-.58],[-.32,-.54],[-.46,-.35]],cloth,gold);skirt.position.set(side*.414,1.40,-.14);skirt.rotation.y=side*Math.PI/2;if(r>=4){const sun=heraldry(skirt,.15,gold,glow);sun.position.set(0,-.21,.048);}}}
 loft(body,[[-.44,1.96,.035,.015],[-.39,1.995,.29,.065],[-.24,1.94,.27,.045],[0,1.94,.245,.045],[.15,2.005,.26,.064],[.22,2.01,.08,.015]],leather,'z',20);for(const side of [-1,1]){line(body,[[side*.24,2.00,-.38],[side*.27,1.97,-.15],[side*.235,2.01,.14]],.009,gold);const flap=plate(body,[[-.15,.11],[.15,.10],[.12,-.27],[-.07,-.33],[-.15,-.20]],leather);flap.position.set(side*.37,1.66,-.10);flap.rotation.y=side*Math.PI/2;}
 for(const side of [-1,1]){line(body,[[side*.28,1.95,-.02],[side*.46,1.23,-.035],[side*.50,.86,.09]],.018,leather);const stirrup=mesh(new T.TorusGeometry(.087,.014,6,14),steel,body,side*.50,.87,.085);stirrup.rotation.y=Math.PI/2;line(body,[[side*.35,1.54,.37],[side*.37,1.18,.66],[0,1.18,.80]],.031,leather);}
 const legs=[];
 for(const side of [-1,1])for(const front of [false,true]){const hip=new T.Group();hip.position.set(side*.26,1.27,front?.55:-.64);const knee=new T.Group();knee.position.set(0,-.49,front?.01:-.085);const fetlock=new T.Group();fetlock.position.set(0,-.48,front?0:.10);g.add(hip);hip.add(knee);knee.add(fetlock);
  loft(hip,[[0,0,.14,.17],[-.12,front?.025:.02,.125,.14],[-.30,front?.015:-.015,.076,.086],[-.49,front?.01:-.085,.061,.075],[-.55,front?.01:-.085,.057,.07]],coat,'y');
  loft(knee,[[.045,0,.067,.075],[-.07,front?0:.035,.062,.065],[-.30,front?0:.10,.044,.048],[-.43,front?0:.10,.046,.052],[-.50,front?0:.1,.068,.076]],coat,'y',16);
  loft(fetlock,[[.035,0,.065,.075],[-.06,.018,.055,.065],[-.12,.055,.058,.07],[-.17,.077,.085,.105]],coat,'y',16);
  const foot=mesh(new T.CylinderGeometry(.075,.097,.13,12),dark,fetlock,0,-.20,.09);foot.scale.z=1.30;foot.rotation.x=-.12;const shoe=mesh(new T.TorusGeometry(.075,.009,5,14,Math.PI*1.75),steel,fetlock,0,-.263,.093);shoe.rotation.x=Math.PI/2;
  if(r>=3){const shin=loft(knee,[[.0,.012,.075,.083],[-.12,.04,.075,.081],[-.35,.09,.063,.071]],steel,'y',16);if(glow)line(knee,[[side*.075,-.03,.018],[side*.064,-.19,.05],[side*.059,-.34,.09]],.008,glow);}
  compactRigid(fetlock);fetlock.traverse(o=>{if(o.isMesh)o.userData.keep=true;});compactRigid(knee); // Keep articulated descendants out of the rigid batch below.
  hip.userData.keep=true;legs.push({hip,knee,fetlock,front,side,phase:front?(side<0?0:.5):(side<0?.75:.25)});
 }
 // Curved overlapping lames protect neck, chest and hindquarters.
 if(r>=2){const face=plate(head,[[-.105,.16],[.105,.16],[.11,-.07],[.062,-.32],[0,-.39],[-.062,-.32],[-.11,-.07]],steel,gold);face.position.set(0,.03,.22);face.rotation.x=-.70;for(const side of [-1,1])for(let i=0;i<(r>=3?5:2);i++){const lame=plate(neck,[[-.12,.10],[.12,.12],[.16,-.07],[.06,-.13],[-.10,-.09]],steel,gold);lame.position.set(side*(.28-i*.023),1.52+i*.13,.64+i*.065);lame.rotation.set(.08,side*Math.PI/2,-side*.1);lame.scale.setScalar(.88);for(const x of [-.085,.08])oval(lame,[.011,.011,.009],[x,.055,.097],gold);}const chest=plate(body,[[-.29,.18],[.29,.18],[.29,-.08],[.13,-.38],[0,-.46],[-.13,-.38],[-.29,-.08]],steel,gold);chest.position.set(0,1.40,.785);chest.rotation.x=.16;if(r>=4){const s=heraldry(chest,.18,gold,glow);s.position.set(0,-.06,.06);}for(const side of [-1,1])for(let i=0;i<(r>=3?3:1);i++){const haunch=plate(body,[[-.21,.14],[.18,.16],[.24,-.13],[.05,-.29],[-.18,-.24]],steel,gold);haunch.position.set(side*(.38+i*.006),1.5-i*.14,-.60);haunch.rotation.y=side*Math.PI/2;haunch.scale.setScalar(.88);for(const x of [-.12,.12])oval(haunch,[.014,.014,.009],[x,.085,.102],gold);}}
 if(r>=4){for(const side of [-1,1])for(let i=0;i<3;i++){const crest=plate(head,[[0,0],[side*.075,.015],[side*.13,.085],[side*.16,.19-i*.025],[side*.13,.245-i*.02],[side*.075,.16],[side*.028,.13]],r===4?gold:steel,gold);crest.position.set(side*.065,.19,-.07+i*.07);crest.rotation.y=side*.35;}line(neck,[[0,2.33,.98],[0,2.26,.88],[0,2.04,.63],[0,1.86,.45]],.018,gold);
 for(const side of [-1,1])for(let i=0;i<4;i++){const lame=plate(body,[[-.20,.13],[.18,.14],[.22,-.08],[.10,-.22],[-.14,-.18]],steel,gold);lame.position.set(side*(.39+i*.01),1.61-i*.12,.41);lame.rotation.y=side*Math.PI/2;}
 }
 if(r>=5){for(const side of [-1,1]){for(let i=0;i<4;i++){const flank=plate(body,[[-.19,.12],[.18,.12],[.16,-.13],[0,-.24],[-.18,-.12]],steel,gold);flank.position.set(side*.459,1.56,-.46+i*.22);flank.rotation.y=side*Math.PI/2;line(flank,[[-.1,.04,.12],[0,-.12,.11],[.09,.03,.12]],.006,glow);}if(r===6){const drop=plate(body,[[-.25,.03],[.25,.03],[.22,-.48],[0,-.68],[-.22,-.48]],cloth,gold);drop.position.set(side*.463,1.03,-.18);drop.rotation.y=side*Math.PI/2;const badge=heraldry(drop,.13,gold,glow);badge.position.set(0,-.26,.07);}}}
 if(glow){for(const side of [-1,1]){line(body,[[side*.405,1.57,-.7],[side*.437,1.35,-.57],[side*.445,1.08,-.51]],.009,glow);line(neck,[[side*.18,2.19,.88],[side*.25,1.93,.70],[side*.30,1.61,.55]],.009,glow);}const forehead=heraldry(head,.065,gold,glow);forehead.position.set(0,.03,.345);forehead.rotation.x=-.65;}
 // Batch each rigid part separately; knees, head and tail remain animated.
 compactRigid(head);compactRigid(neck);compactRigid(tail);
 head.traverse(o=>{if(o.isMesh)o.userData.keep=true;});neck.traverse(o=>{if(o.isMesh)o.userData.keep=true;});tail.traverse(o=>{if(o.isMesh)o.userData.keep=true;});compactRigid(body);
 const hoofRunes=[];if(glow)for(const l of legs){const ring=mesh(new T.TorusGeometry(.12,.006,4,20),glow,g,l.side*.26,.02,l.front?.55:-.64);ring.rotation.x=Math.PI/2;hoofRunes.push(ring);}
 g.scale.setScalar(def.scale);g.userData.definition=def;g.userData.seat=1.96*def.scale;g.userData.gait=0;g.userData.contacts=[];
 let phase=0,lastSpeed=0;
 g.userData.animate=(time,speed,dt=.016,grounded=true)=>{
  lastSpeed=T.MathUtils.lerp(lastSpeed,speed,1-Math.exp(-dt*9));const moving=lastSpeed>.15,canter=lastSpeed>4.2,cycle=moving?(canter?1.8+lastSpeed*.05:.65+lastSpeed*.20):0,old=phase;phase+=dt*cycle;const stride=Math.min(1,lastSpeed/5),lift=canter?.78:.46;
  g.userData.contacts=[];
  for(const l of legs){const offset=canter?(l.front?(l.side<0?1/6:5/6):(l.side<0?.5:1/6)):l.phase,p=(phase+offset)%1,a=p*Math.PI*2;l.hip.rotation.x=grounded?Math.sin(a)*lift*stride:l.front?-.65:.5;l.knee.rotation.x=grounded?(l.front?1:-1)*Math.pow(Math.max(0,Math.sin(a+.3)),2)*(.70+stride*.4)*stride:l.front?1.1:-1;l.fetlock.rotation.x=grounded?-.18*Math.sin(a)*stride:0;if(moving&&grounded&&Math.floor(old+offset+.5)!==Math.floor(phase+offset+.5))g.userData.contacts.push({foot:l.side<0?'left':'right',front:l.front});}
  const bob=moving&&grounded?(canter?Math.sin(phase*Math.PI*2)*.037:Math.sin(phase*Math.PI*4)*.015)*stride:Math.sin(time*1.7)*.005;body.position.y=bob;head.rotation.x=.45+Math.sin(phase*Math.PI*2)*(canter?.055:.025)*stride;head.rotation.y=Math.sin(time*.7)*.025*(1-stride);tail.rotation.x=-stride*.23;tail.rotation.z=Math.sin(time*3.2)*(.045+stride*.05);g.rotation.x=grounded?Math.sin(phase*Math.PI*2)*.01*stride:-.08;for(let i=0;i<hoofRunes.length;i++){const a=hoofRunes[i];a.visible=moving&&grounded;a.material.emissiveIntensity=1.3+Math.sin(time*4)*.3;}
  g.userData.bob=bob*def.scale;g.userData.gait=phase;
 };
 g.userData.dispose=()=>{const geos=new Set(),mats=new Set();g.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(a=>a.dispose());mats.forEach(a=>a.dispose());};return g;
}
export class HorsePreview{
 constructor(def){this.root=makeHorse(def);this.root.rotation.y=-.65;this.weaponType='horse';this.inspection=true;this.time=0;this.speed=0;}
 update(dt){this.time+=dt;this.root.userData.animate(this.time,this.speed,dt,true);}
 attack(){this.speed=this.speed?0:6;}
 dispose(){this.root.userData.dispose();this.root.removeFromParent();}
}
