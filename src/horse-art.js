import * as T from 'three';
import {form,cord,bead,leaf} from './model-craft.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {mesh,beam,compactRigid} from './art.js';
import {material} from './materials.js';
import {heroSurface} from './hero-surfaces.js';
import {MOUNTS} from './mount-rules.js';

// Anatomical surfaces are continuous ring lofts: the ribcage, sloping neck,
// long facial plane and tapered limbs have their own contours, not ball joints.
function loft(parent,rings,mat,axis='z',sides=20){
 const smooth=[];for(let i=0;i<rings.length-1;i++){const a=rings[Math.max(0,i-1)],b=rings[i],c=rings[i+1],d=rings[Math.min(rings.length-1,i+2)];for(let j=0;j<4;j++){const t=j/4;smooth.push(b.map((v,k)=>k===0?v+(c[k]-v)*t:Math.max(k>1?.001:-Infinity,.5*((2*v)+(-a[k]+c[k])*t+(2*a[k]-5*v+4*c[k]-d[k])*t*t+(-a[k]+3*v-3*c[k]+d[k])*t*t*t))));}}smooth.push(rings.at(-1));rings=smooth;
 const pos=[],uv=[],idx=[],colors=[];
 for(let i=0;i<rings.length;i++){const [a,c,rx,ry]=rings[i];for(let j=0;j<=sides;j++){const t=j/sides*Math.PI*2,x=Math.cos(t)*rx,q=Math.sin(t)*ry;pos.push(x,axis==='z'?c+q:a,axis==='z'?a:c+q);uv.push(j/sides,i/(rings.length-1));if(mat.userData.horseCoat){const shade=.86+.12*Math.sin(t),dapple=mat.userData.dapple?.045*Math.sin(i*2.71+j*1.78)*Math.sin(j*2.19-i*.51):0;colors.push(shade+dapple,shade+dapple,shade+dapple);}}}
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;const flip=(rings.at(-1)[0]>rings[0][0])===(axis==='z');if(flip)idx.push(a,a+1,b,b,a+1,b+1);else idx.push(a,b,a+1,b,b+1,a+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);if(colors.length)geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();return mesh(geo,mat,parent);
}
const oval=(g,scale,pos,m)=>{const geo=new T.SphereGeometry(1,18,12);if(m.userData.horseCoat){const col=new Float32Array(geo.attributes.position.count*3).fill(.88);geo.setAttribute('color',new T.BufferAttribute(col,3));}const o=mesh(geo,m,g,...pos);o.scale.set(...scale);return o;};
function line(g,points,r,m){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(8,points.length*5),r,6,false),m,g);}
function plate(g,points,m,edge){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();let geo=new T.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelThickness:.012,bevelSize:.014,bevelSegments:2,steps:1});const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,p.getZ(i)+.06*Math.cos(x*4)+.025*Math.sin(y*6));}p.needsUpdate=true;geo.deleteAttribute('normal');const flat=geo;geo=mergeVertices(geo,.0001);flat.dispose();geo.computeVertexNormals();const o=mesh(geo,m,g);if(edge){const p=points.map(([x,y])=>[x,y,.045+.06*Math.cos(x*4)+.025*Math.sin(y*6)]);p.push(p[0]);line(o,p,.010,edge);}return o;}
function heraldry(g,r,metal,glow=null){const badge=new T.Group();g.add(badge);const disk=mesh(new T.CylinderGeometry(r*.43,r*.43,.018,18),metal,badge);disk.rotation.x=Math.PI/2;for(let i=0;i<12;i++){const a=i*Math.PI/6;const ray=plate(badge,[[0,r*.50],[-r*.095,r*.69],[0,r],[r*.06,r*.66]],metal);ray.rotation.z=a;ray.scale.z=.20;}if(glow){const gem=oval(badge,[r*.27,r*.27,.032],[0,0,.04],glow);}return badge;}
let hair;
function hairTexture(){if(hair)return hair;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#a7a19a';x.fillRect(0,0,256,256);let seed=721;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;for(let i=0;i<12500;i++){const v=rand()*40+120;x.strokeStyle=`rgba(${v},${v},${v},.14)`;const a=rand()*256,b=rand()*256;x.beginPath();x.moveTo(a,b);x.lineTo(a+(rand()-.5)*2,b+2+rand()*6);x.stroke();}hair=new T.CanvasTexture(c);hair.wrapS=hair.wrapT=T.RepeatWrapping;hair.colorSpace=T.SRGBColorSpace;hair.userData.shared=true;return hair;}
export function makeHorse(def=MOUNTS[0]){
 const g=new T.Group(),body=new T.Group(),neck=new T.Group(),head=new T.Group();g.name='Horse_'+def.id;g.add(body);body.add(neck);body.add(head);
 const coat=new T.MeshPhysicalMaterial({color:def.coat,map:hairTexture(),roughness:.68,metalness:0,bumpMap:hairTexture(),bumpScale:.0018,vertexColors:true,sheen:.3,sheenRoughness:.58,sheenColor:0xb8a48b});coat.userData.horseCoat=true;coat.userData.dapple=def.rarity===2;const dark=new T.MeshStandardMaterial({color:0x191b20,roughness:.77});const muzzle=new T.MeshStandardMaterial({color:new T.Color(def.coat).multiplyScalar(.48),roughness:.62});const mane=material('cloth',def.rarity===6?0x9b947e:0x29272a,{roughness:.98});const leather=material('leather',0x382b22,{roughness:.72}),cloth=material('cloth',def.cloth,{roughness:.85}),steel=heroSurface('steel',def.metal,{roughness:.49,metalness:.82}),gold=heroSurface('steel',def.trim,{roughness:.43,metalness:.83});const glow=def.glow?new T.MeshStandardMaterial({color:def.glow,emissive:def.glow,emissiveIntensity:1.5,roughness:.36,metalness:.3}):null;
 const r=def.rarity;
 coat.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vCoatPoint;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCoatPoint=position;');
  shader.fragmentShader='varying vec3 vCoatPoint;\nfloat coatHash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}\nfloat coatNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(coatHash(i),coatHash(i+vec3(1,0,0)),f.x),mix(coatHash(i+vec3(0,1,0)),coatHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(coatHash(i+vec3(0,0,1)),coatHash(i+vec3(1,0,1)),f.x),mix(coatHash(i+vec3(0,1,1)),coatHash(i+vec3(1,1,1)),f.x),f.y),f.z);}\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float hide=coatNoise(vCoatPoint*8.)*.72+coatNoise(vCoatPoint*34.)*.28;
   diffuseColor.rgb*=mix(vec3(.68,.64,.60),vec3(1.08,1.045,1.01),smoothstep(.12,.85,hide));
   ${r===2?'float dap=coatNoise(vCoatPoint*23.);diffuseColor.rgb*=.74+.38*smoothstep(.35,.66,dap);':''}
  `);
 };coat.customProgramCacheKey=()=> 'horse-hide-v223-'+r;
 // The barrel, withers, scapula and haunch are one continuous anatomical
 // surface: no detached spherical shoulders or saddlebag-shaped thighs.
 const barrel=loft(body,[[-1.00,1.43,.018,.045],[-.91,1.45,.20,.27],[-.73,1.44,.355,.375],[-.48,1.39,.39,.405],[-.17,1.39,.37,.42],[.12,1.43,.345,.40],[.39,1.47,.34,.38],[.60,1.48,.30,.355],[.77,1.48,.19,.27],[.84,1.46,.02,.09]],coat,'z',32);
 const bp=barrel.geometry.attributes.position;for(let i=0;i<bp.count;i++){const x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i),side=Math.sign(x),shoulder=Math.exp(-(((z-.47)/.22)**2))*Math.exp(-(((y-1.48)/.3)**2)),haunch=Math.exp(-(((z+.68)/.22)**2))*Math.exp(-(((y-1.45)/.28)**2));bp.setX(i,x+side*(shoulder*.016+haunch*.022)*Math.min(1,Math.abs(x)*4));}barrel.geometry.computeVertexNormals();
 loft(neck,[[1.42,.52,.205,.255],[1.64,.57,.23,.285],[1.86,.67,.194,.245],[2.06,.79,.15,.20],[2.24,.90,.105,.133],[2.31,.92,.051,.055]],coat,'y',28);
 head.position.set(0,2.20,.96);head.rotation.x=.57;
 // Poll, cheekbone, nasal bridge and small elastic muzzle. Eye-to-nose
 // distance is long and slender; the skull is no longer nearly barrel-length.
 loft(head,[[-.16,.025,.012,.028],[-.10,.025,.102,.148],[.005,.0,.128,.176],[.10,-.020,.112,.144],[.23,-.045,.073,.096],[.37,-.071,.073,.077],[.48,-.080,.084,.073],[.545,-.084,.066,.052],[.57,-.083,.005,.014]],coat,'z',28);
 const gloss=new T.MeshStandardMaterial({color:0x120f0b,roughness:.12,metalness:.08});
 for(const side of [-1,1]){
  // Smooth mandibular cheek and jaw tendon meet the throat without a ball.
  const cheek=loft(head,[[-.10,-.048,.065,.060],[-.035,-.080,.097,.085],[.07,-.104,.096,.083],[.155,-.089,.066,.058],[.205,-.060,.020,.025]],coat,'z',20);cheek.scale.x=.88;
  const ear=new T.Group();ear.position.set(side*.078,.14,-.075);ear.rotation.set(-.10,0,side*-.17);loft(ear,[[0,0,.043,.033],[.064,.002,.039,.028],[.135,.017,.025,.018],[.205,.029,.001,.001]],coat,'y',16);oval(ear,[.022,.066,.009],[0,.085,.026],muzzle);head.add(ear);
  oval(head,[.016,.022,.030],[side*.124,.031,.055],gloss);
  line(head,[[side*.119,.050,.027],[side*.133,.058,.055],[side*.124,.042,.085]],.008,coat);
  line(head,[[side*.124,.012,.032],[side*.129,.006,.058],[side*.120,.015,.085]],.004,muzzle);
  // Recessed nostril rim and lip seam sit on the muzzle, not outside its edge.
  const nostril=oval(head,[.008,.022,.033],[side*.077,-.066,.485],dark);nostril.rotation.x=.35;
  line(head,[[side*.074,-.043,.466],[side*.081,-.047,.489],[side*.075,-.078,.514]],.004,muzzle);
  line(head,[[side*.061,-.132,.412],[side*.075,-.145,.480],[side*.048,-.131,.544]],.003,muzzle);
  // Split cheek pieces, noseband, buckles and small bit rings.
  line(head,[[side*.096,.11,-.065],[side*.136,.024,-.003],[side*.103,-.031,.27],[side*.094,-.114,.392]],.009,leather);
  const bit=mesh(new T.TorusGeometry(.031,.006,7,18),gold,head,side*.095,-.10,.388);bit.rotation.y=Math.PI/2;
  const buckle=mesh(new T.TorusGeometry(.014,.003,5,4),gold,head,side*.124,.019,.172);buckle.rotation.y=Math.PI/2;
  line(body,[[side*.14,1.88,1.22],[side*.20,1.74,.91],[side*.19,1.96,.14]],.006,leather);
 }
 line(head,[[-.086,-.069,.40],[-.062,-.004,.407],[0,.010,.41],[.062,-.004,.407],[.086,-.069,.40]],.010,leather);
 line(head,[[-.103,.101,-.043],[0,.158,-.061],[.103,.101,-.043]],.010,leather);
 // A dense tapered mane surface with fine strands, not parallel thick pipes.
 const maneSurface=loft(neck,[[1.48,.26,.018,.04],[1.68,.34,.043,.075],[1.92,.49,.046,.078],[2.13,.67,.038,.075],[2.29,.84,.019,.05],[2.35,.90,.006,.015]],mane,'y',18);
 for(let i=0;i<27;i++){const t=i/26;line(neck,[[0,1.53+t*.77,.25+t*.60],[-.025,1.48+t*.78,.18+t*.59],[-.045,1.36+t*.84,.16+t*.58]],.0025,i%5?mane:dark);}
 for(let i=-3;i<=3;i++)line(head,[[i*.008,.15,-.08],[i*.010,.175,.03],[i*.008,.115,.17]],.0035,mane);
 const tail=new T.Group();tail.position.set(0,1.55,-.91);body.add(tail);
 loft(tail,[[.02,0,.047,.04],[-.17,-.14,.071,.052],[-.43,-.23,.081,.060],[-.72,-.24,.073,.054],[-1.01,-.21,.043,.038],[-1.14,-.18,.005,.004]],mane,'y',20);
 for(let i=0;i<23;i++){const a=(i-11)*.005,b=Math.sin(i*2.41)*.040;line(tail,[[a,0,b],[a*1.4,-.24,-.18+b],[a*1.4,-.67,-.27+b],[a*.8,-1.07-(i%5)*.012,-.18+b]],.0018,dark);}
 // Cloth covers curve around the back. Their skirt gives the armor a distinct silhouette.
 const blanket=mesh(new T.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI*.57),cloth,body,0,1.42,-.14);blanket.scale.set(.455,.49,.70);
 for(const side of [-1,1]){line(body,[[side*.04,1.80,-.68],[side*.32,1.61,-.68],[side*.43,1.27,-.64]],.012,gold);if(r>=3){const skirt=plate(body,[[-.44,.05],[.48,.05],[.48,-.38],[.27,-.58],[-.32,-.54],[-.46,-.35]],cloth,gold);skirt.position.set(side*.414,1.40,-.14);skirt.rotation.y=side*Math.PI/2;}}
 loft(body,[[-.51,1.82,.09,.025],[-.38,1.855,.27,.095],[-.17,1.85,.29,.08],[.04,1.865,.255,.093],[.22,1.88,.19,.075],[.27,1.88,.03,.018]],leather,'z',24);
 loft(body,[[-.44,1.96,.035,.015],[-.39,1.995,.29,.065],[-.24,1.94,.27,.045],[0,1.94,.245,.045],[.15,2.005,.26,.064],[.22,2.01,.08,.015]],leather,'z',20);for(const side of [-1,1]){line(body,[[side*.24,2.00,-.38],[side*.27,1.97,-.15],[side*.235,2.01,.14]],.009,gold);const flap=plate(body,[[-.15,.11],[.15,.10],[.12,-.27],[-.07,-.33],[-.15,-.20]],leather);flap.position.set(side*.37,1.66,-.10);flap.rotation.y=side*Math.PI/2;}
 for(const side of [-1,1]){line(body,[[side*.28,1.95,-.02],[side*.46,1.37,-.035],[side*.50,1.11,.09]],.018,leather);const stirrup=mesh(new T.TorusGeometry(.087,.014,6,14),steel,body,side*.50,1.12,.085);stirrup.rotation.y=Math.PI/2;line(body,[[side*.30,1.72,.30],[side*.36,1.42,.30],[side*.24,1.105,.30],[0,1.04,.30]],.031,leather);}
 const legs=[];
 for(const side of [-1,1])for(const front of [false,true]){const hip=new T.Group();hip.position.set(side*.26,1.27,front?.55:-.64);const knee=new T.Group();knee.position.set(0,-.49,front?.01:-.085);const fetlock=new T.Group();fetlock.position.set(0,-.48,front?0:.10);g.add(hip);hip.add(knee);knee.add(fetlock);
  loft(hip,[[.27,-.025,.075,.10],[.10,0,.16,.195],[0,0,.14,.17],[-.12,front?.025:.02,.125,.14],[-.30,front?.015:-.015,.076,.086],[-.49,front?.01:-.085,.061,.075],[-.55,front?.01:-.085,.057,.07]],coat,'y');
  loft(knee,[[.052,0,.073,.083],[.012,.005,.079,.087],[-.07,front?0:.035,.068,.074],[-.30,front?0:.10,.044,.048],[-.43,front?0:.10,.046,.052],[-.50,front?0:.1,.074,.083]],coat,'y',16);
  loft(fetlock,[[.035,0,.065,.075],[-.06,.018,.055,.065],[-.12,.055,.058,.07],[-.17,.077,.085,.105]],coat,'y',16);
  const foot=mesh(new T.CylinderGeometry(.075,.097,.13,12),dark,fetlock,0,-.20,.09);foot.scale.z=1.30;foot.rotation.x=-.12;const shoe=mesh(new T.TorusGeometry(.075,.009,5,14,Math.PI*1.75),steel,fetlock,0,-.263,.093);shoe.rotation.x=Math.PI/2;
  if(r>=3){const shin=loft(knee,[[.0,.012,.075,.083],[-.12,.04,.075,.081],[-.35,.09,.063,.071]],steel,'y',16);if(glow)line(knee,[[side*.075,-.03,.018],[side*.064,-.19,.05],[side*.059,-.34,.09]],.008,glow);}
  compactRigid(fetlock);fetlock.traverse(o=>{if(o.isMesh)o.userData.keep=true;});compactRigid(knee); // Keep articulated descendants out of the rigid batch below.
  hip.userData.keep=true;legs.push({hip,knee,fetlock,front,side,phase:front?(side<0?0:.5):(side<0?.75:.25)});
 }
 // Barding follows the anatomy: chamfron over the nasal plane, articulated
 // crinet wrapped around the neck, convex chest and croup shells.
 if(r>=2){
  const faceRings=[[-.085,.04,.107,.13],[.0,.03,.138,.178],[.12,.0,.115,.142],[.27,-.04,.088,.108],[.42,-.069,.090,.096],[.51,-.077,.060,.073]];
  const p=[],uv=[],ix=[],n=14;faceRings.forEach(([z,y,rx,ry],j)=>{for(let i=0;i<=n;i++){const a=.12+(Math.PI-.24)*i/n;p.push(Math.cos(a)*rx,y+Math.sin(a)*ry+.013,z);uv.push(i/n,j/(faceRings.length-1));if(j<faceRings.length-1&&i<n){const k=j*(n+1)+i;ix.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}});
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();const chamfron=mesh(geo,steel,head);chamfron.material.side=T.DoubleSide;
  for(const side of [-1,1])line(head,faceRings.map(([z,y,rx,ry])=>[side*rx*.96,y+ry*.15+.014,z]),.006,gold);
  line(head,faceRings.map(([z,y,rx,ry])=>[0,y+ry+.016,z]),.008,gold);
  // Rare horses have a half crinet; elite tiers cover the complete neck.
  const count=r>=4?9:r>=3?7:3;
  for(let i=0;i<count;i++){
   const t=i/8,y=1.49+t*.77,z=.54+t*.36,rx=.255-t*.143,rz=.292-t*.153;
   form(neck,[[y,rx*.99,rz,z],[y+.07,rx,rz+.006,z+.022],[y+.117,rx*.90,rz*.91,z+.049]],steel,{sides:24,name:'Articulated crinet'});
   cord(neck,Array.from({length:25},(_,j)=>{const a=j*Math.PI/12;return[Math.sin(a)*rx,y+.07,z+.022+Math.cos(a)*(rz+.01)];}),.006,gold);
   for(const side of [-1,1]){bead(neck,[side*rx,y+.066,z+.022],.013,gold);if(r>=4)line(neck,[[side*rx*.42,y+.07,z+rz*.92],[side*rx*.30,y+.108,z+rz*.90]],.004,gold);}
  }
  for(const side of [-1,1]){
   // Broad convex peytral and croup shells with overlapping lower skirts.
   for(const [z,span]of [[.48,.24],[-.65,.28]]){
    const cap=form(body,[[1.24,.37,.19,z],[1.44,.411,span*1.04,z],[1.65,.359,span*.96,z],[1.82,.19,span*.64,z],[1.87,.060,span*.35,z],[1.881,.012,span*.20,z]],steel,{start:side>0?.2:Math.PI+.2,arc:Math.PI-.4,sides:18,name:'Convex horse barding'});
    for(let i=0;i<(r>=4?4:2);i++){
     const h=1.45-i*.115,pl=plate(body,[[-span,.10],[span,.10],[span+.016,-.04],[.07,-.16],[-span,-.09]],steel,gold);pl.position.set(side*(.35+i*.008),h,z);pl.rotation.y=side*Math.PI/2;
     for(const x of [-span*.7,span*.7])bead(pl,[x,.062,.111],.01,gold);
     if(r>=4)for(let k=-1;k<=1;k++)line(pl,[[k*.08,.065,.114],[k*.075,-.055,.106]],.004,gold);
    }
   }
   // Neck/shoulder seam is readable as cloth underneath rigid metal.
   line(body,[[side*.26,1.73,.48],[side*.40,1.48,.58],[side*.31,1.18,.62]],.01,gold);
  }
  const chest=plate(body,[[-.26,.17],[.26,.17],[.28,-.04],[.15,-.29],[0,-.36],[-.15,-.29],[-.28,-.04]],steel,gold);chest.position.set(0,1.48,.79);chest.rotation.x=.20;
  if(r>=4){const badge=heraldry(chest,.135,gold,glow);badge.position.set(0,-.028,.085);}
 }
 if(r>=4){
  for(const side of [-1,1]){
   for(let i=0;i<(r===6?5:3);i++){
    const crest=leaf(head,[[0,0],[side*.04,.06],[side*.075,.17],[side*.048,.235],[side*.024,.17],[0,.09]],r===6?gold:steel,{name:'Swept royal chamfron feathers'});crest.position.set(side*.062,.13,-.09+i*.035);crest.rotation.z=-side*.35;
   }
   // Chased borders and inset enamel read as different materials at phone scale.
   const flank=plate(body,[[-.29,.10],[.30,.10],[.28,-.31],[.07,-.47],[-.23,-.39]],cloth,gold);flank.position.set(side*.414,1.49,-.18);flank.rotation.y=side*Math.PI/2;
   const badge=heraldry(flank,.12,gold,glow);badge.position.set(0,-.16,.09);
   for(let k=0;k<5;k++){const a=k*Math.PI/4;line(flank,[[Math.cos(a)*.14,-.16+Math.sin(a)*.14,.095],[Math.cos(a)*.18,-.16+Math.sin(a)*.18,.10]],.003,gold);}
   if(r>=5)line(flank,[[-.24,.035,.106],[-.22,-.31,.11],[.05,-.41,.106],[.23,-.29,.11],[.245,.035,.106]],.005,glow);
   if(r===6){const drop=plate(body,[[-.23,.03],[.23,.03],[.19,-.42],[0,-.57],[-.19,-.42]],cloth,gold);drop.position.set(side*.442,1.08,-.18);drop.rotation.y=side*Math.PI/2;const sigil=heraldry(drop,.105,gold,glow);sigil.position.set(0,-.23,.08);}
  }
 }
 if(glow){for(const side of [-1,1]){
  line(neck,[[side*.112,2.24,1.045],[side*.157,2.04,.976],[side*.23,1.72,.82]],.006,glow);
  line(head,[[side*.035,.177,.04],[side*.033,.106,.24],[side*.023,.033,.44]],.004,glow);
 }}
 // Batch each rigid part separately; knees, head and tail remain animated.
 compactRigid(head);compactRigid(neck);compactRigid(tail);
 head.traverse(o=>{if(o.isMesh)o.userData.keep=true;});neck.traverse(o=>{if(o.isMesh)o.userData.keep=true;});tail.traverse(o=>{if(o.isMesh)o.userData.keep=true;});compactRigid(body);
 const hoofRunes=[];if(glow)for(const l of legs){const ring=mesh(new T.TorusGeometry(.12,.006,4,20),glow,g,l.side*.26,.02,l.front?.55:-.64);ring.rotation.x=Math.PI/2;hoofRunes.push(ring);}
 g.scale.setScalar(def.scale);g.userData.definition=def;g.userData.anatomyVersion=223;g.userData.headLength=.73;g.userData.saddleSupport=true;g.userData.seat=1.96*def.scale;g.userData.gait=0;g.userData.contacts=[];
 let phase=0,lastSpeed=0;
 g.userData.animate=(time,speed,dt=.016,grounded=true)=>{
  lastSpeed=T.MathUtils.lerp(lastSpeed,speed,1-Math.exp(-dt*9));const moving=lastSpeed>.15,canter=lastSpeed>4.2,cycle=moving?(canter?1.8+lastSpeed*.05:.65+lastSpeed*.20):0,old=phase;phase+=dt*cycle;const stride=Math.min(1,lastSpeed/5),lift=canter?.78:.46;
  g.userData.contacts=[];
  for(const l of legs){const offset=canter?(l.front?(l.side<0?1/6:5/6):(l.side<0?.5:1/6)):l.phase,p=(phase+offset)%1,a=p*Math.PI*2;l.hip.rotation.x=grounded?Math.sin(a)*lift*stride:l.front?-.65:.5;l.knee.rotation.x=grounded?(l.front?1:-1)*Math.pow(Math.max(0,Math.sin(a+.3)),2)*(.70+stride*.4)*stride:l.front?1.1:-1;l.fetlock.rotation.x=grounded?-.18*Math.sin(a)*stride:0;if(moving&&grounded&&Math.floor(old+offset+.5)!==Math.floor(phase+offset+.5))g.userData.contacts.push({foot:l.side<0?'left':'right',front:l.front});}
  const bob=moving&&grounded?(canter?Math.sin(phase*Math.PI*2)*.037:Math.sin(phase*Math.PI*4)*.015)*stride:Math.sin(time*1.7)*.005;body.position.y=bob;head.rotation.x=.57+Math.sin(phase*Math.PI*2)*(canter?.055:.025)*stride;head.rotation.y=Math.sin(time*.7)*.025*(1-stride);tail.rotation.x=-stride*.23;tail.rotation.z=Math.sin(time*3.2)*(.045+stride*.05);g.rotation.x=grounded?Math.sin(phase*Math.PI*2)*.01*stride:-.08;for(let i=0;i<hoofRunes.length;i++){const a=hoofRunes[i];a.visible=moving&&grounded;a.material.emissiveIntensity=1.3+Math.sin(time*4)*.3;}
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
