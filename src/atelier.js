import * as T from 'three';
import {HEAD,HEAD_LOD} from './head-mesh.js';
import {material,ART} from './materials.js';
import {armorDefinition,armorKind} from './armor.js';
import {mesh,box,cyl,beam,sunBadge} from './art.js';

export const RANK_DRESS=['Hearth levy','Sworn recruit','Border veteran','Steel watch','Dawn guard','Oath captain','Sun marshal','Crowned vanguard','Radiant champion','Sovereign guard'];
export function dressProfile(role,rank,kind=null){
 const ranger=['bow','ranger','rider','marksman','assassin'].includes(role),mage=['lantern','pyre','frost'].includes(role),smith=['ashwright','breaker','engineer','giant','crew'].includes(role),hero=['warden','ranger','ashwright'].includes(role);
 return {ranger,mage,smith,hero,rank,plate:(hero&&!ranger&&!smith)||rank>=5,mail:rank>=3||hero,cloak:hero||mage||rank>=4,hood:ranger&&rank>=3,elite:rank>=8,ivory:rank>=5&&rank<8,blackened:rank>=8,kind,title:RANK_DRESS[Math.min(9,rank-1)]};
}
// Saturated liveries are earned gradually; classes remain recognizable at a distance.
export function rankPalette(role,rank){
 const category=['bow','ranger','rider','marksman','assassin'].includes(role)?'ranger':['lantern','pyre','frost'].includes(role)?'mage':['ashwright','breaker','engineer','giant','crew'].includes(role)?'smith':'guard';
 const colors={ranger:[0x60533e,0x365568,0x235b91,0x2446a1,0x263983],guard:[0x69503c,0x684847,0x8b2839,0x962b46,0xe5d8bb],mage:[0x635477,0x624077,0x673796,0x8532a1,0x4b286b],smith:[0x5b4939,0x65432e,0x8a462c,0x522b26,0x302330]};
 const band=Math.min(4,Math.floor((rank-1)/2));let cloth=colors[category][band];if(role==='frost')cloth=[0x658087,0x427587,0x438ea2,0x6facbd,0xb4d8e3][band];if(role==='pyre')cloth=[0x694133,0x853729,0xa13920,0xbb4c23,0x812122][band];
 return {cloth,steel:rank>=9?0x343740:rank>=7?0xd2d4d2:rank>=5?0xaeb4bf:0x8c929a,trim:rank>=9?0xe4bb59:rank>=7?0xcfab63:rank>=5?0xc1ab7c:0x887354,jewel:category==='ranger'?0x59a6fa:category==='guard'?0xbe213d:category==='smith'?0xf19b47:0xc485f0,category};
}
const textureCache=new Map();
// Hand drawn weave, stitched diamonds, linked mail and heraldry, with mipmaps for mobile.
export function textile(kind='weave',color='#174a50',gold='#bc9855'){
 const key=[kind,color,gold].join(':');if(textureCache.has(key))return textureCache.get(key);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const x=canvas.getContext('2d');x.fillStyle=color;x.fillRect(0,0,512,512);
 let seed=371;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<11000;i++){x.fillStyle=rand()>.5?'rgba(255,245,218,.08)':'rgba(0,0,0,.12)';x.fillRect(rand()*512,rand()*512,1,1+rand()*3);}
 if(kind==='quilt'){x.lineWidth=2;for(let i=-512;i<1024;i+=64){x.strokeStyle='rgba(0,0,0,.40)';x.beginPath();x.moveTo(i,0);x.lineTo(i+512,512);x.stroke();x.beginPath();x.moveTo(i,0);x.lineTo(i-512,512);x.stroke();x.setLineDash([2,5]);x.strokeStyle='rgba(233,212,166,.24)';x.beginPath();x.moveTo(i+3,0);x.lineTo(i+515,512);x.stroke();x.setLineDash([]);}}
 if(kind==='mail'){x.fillStyle='#242b2a';x.fillRect(0,0,512,512);for(let j=-1;j<34;j++)for(let i=-1;i<33;i++){x.lineWidth=3;x.strokeStyle='#101716';x.beginPath();x.ellipse(i*16+(j%2)*8,j*16,6,9,.3,0,Math.PI*2);x.stroke();x.lineWidth=1.5;x.strokeStyle='#a3aaa0';x.beginPath();x.ellipse(i*16+(j%2)*8+1,j*16-1,6,8,.3,.1,Math.PI*1.3);x.stroke();}}
 if(kind==='heraldry'||kind==='banner'){
  x.strokeStyle=gold;x.lineWidth=5;x.strokeRect(27,18,458,476);x.lineWidth=1;x.strokeRect(35,26,442,460);x.strokeStyle=gold;x.fillStyle=gold;
  for(const xx of [52,460])for(let y=48;y<486;y+=31){x.beginPath();x.moveTo(xx,y-9);x.lineTo(xx+6,y);x.lineTo(xx,y+9);x.lineTo(xx-6,y);x.closePath();x.stroke();}
  const cy=kind==='banner'?235:230,r=55;x.beginPath();x.arc(256,cy,r,0,Math.PI*2);x.lineWidth=4;x.stroke();x.beginPath();x.arc(256,cy,r-8,0,Math.PI*2);x.fill();
  for(let i=0;i<16;i++){const a=i*Math.PI/8;const r2=i%2?91:110;x.beginPath();x.moveTo(256+Math.cos(a-.055)*65,cy+Math.sin(a-.055)*65);x.lineTo(256+Math.cos(a)*r2,cy+Math.sin(a)*r2);x.lineTo(256+Math.cos(a+.055)*65,cy+Math.sin(a+.055)*65);x.closePath();x.fill();}
  for(let i=0;i<14;i++){const a=i*.48;x.globalAlpha=.24;x.beginPath();x.arc(256,cy,130+i*3,a,a+.22);x.stroke();}x.globalAlpha=1;
 }
 const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;t.wrapS=t.wrapT=T.RepeatWrapping;t.userData.shared=true;textureCache.set(key,t);return t;
}
const orb=(g,s,p,m)=>{const o=mesh(new T.SphereGeometry(1,12,8),m,g,...p);o.scale.set(...s);return o;};
const tube=(g,pts,w,m)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),Math.max(8,pts.length*3),w,5,false),m,g);
export function shell(g,rings,m,{segments=16,start=0,end=Math.PI*2,square=.86}={}){
 const pos=[],uv=[],idx=[];for(let j=0;j<rings.length;j++){const[y,rx,rz,z=0]=rings[j];for(let i=0;i<=segments;i++){const a=start+(end-start)*i/segments,s=Math.sin(a),c=Math.cos(a);pos.push(Math.sign(s)*Math.abs(s)**square*rx,y,Math.sign(c)*Math.abs(c)**square*rz+z);uv.push(i/segments,j/(rings.length-1));if(j<rings.length-1&&i<segments){const n=j*(segments+1)+i;idx.push(n,n+1,n+segments+1,n+1,n+segments+2,n+segments+1);}}}
 for(const j of [0,rings.length-1]){const n=pos.length/3;pos.push(0,rings[j][0],rings[j][3]||0);uv.push(.5,.5);for(let i=0;i<segments;i++){const q=j*(segments+1)+i;idx.push(...(j===0?[n,q+1,q]:[n,q,q+1]));}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(geo,m,g);
}
export function plaque(g,pts,pos,m,depth=.012){const shape=new T.Shape();pts.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.004,bevelSize:.005,bevelSegments:1,steps:1,curveSegments:4});return mesh(geo,m,g,...pos);}
function rim(g,rx,rz,y,m,width=.004){const ps=[];for(let i=0;i<=24;i++){const a=i*Math.PI/12;ps.push([Math.sin(a)*rx,y,Math.cos(a)*rz]);}return tube(g,ps,width,m);}
const headGeo=new T.BufferGeometry();headGeo.setAttribute('position',new T.Float32BufferAttribute(HEAD.positions,3));headGeo.setAttribute('uv',new T.Float32BufferAttribute(HEAD.uvs,2));headGeo.setIndex(HEAD.indices);headGeo.computeVertexNormals();
const headLow=new T.BufferGeometry();headLow.setAttribute('position',new T.Float32BufferAttribute(HEAD_LOD.positions,3));headLow.setAttribute('uv',new T.Float32BufferAttribute(HEAD_LOD.uvs,2));headLow.setIndex(HEAD_LOD.indices);headLow.computeVertexNormals();
function face(g,m,p){
 const geo=(p.hero?headGeo:headLow).clone(),colors=[],a=geo.attributes.position;
 for(let i=0;i<a.count;i++){const y=a.getY(i),z=a.getZ(i),xx=Math.abs(a.getX(i)),col=new T.Color(0xc89774);if(p.smith)col.setHex(0xb58b6b);const beard=p.smith&&y<.06&&z>.055;col.multiplyScalar(beard?.47:.85+Math.max(0,z)*1.0);if(y>.010&&y<.042&&xx<.041&&z>.14)col.lerp(new T.Color(0x96584d),.55);colors.push(col.r,col.g,col.b);}geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));mesh(geo,m.skin,g);
 for(const side of [-1,1]){orb(g,[.023,.018,.023],[side*.0354,.110,.101],m.eye);orb(g,[.008,.008,.004],[side*.0354,.110,.125],m.iris);orb(g,[.0035,.006,.002],[side*.0354,.110,.128],m.dark);tube(g,[[side*.018,.134,.155],[side*.037,.14,.151],[side*.065,.135,.127]],.0035,m.hair);}
 // Sculpted hair cap follows the skull, with swept locks rather than a sphere.
 if(!p.hood){const hp=geo.clone(),idx=[];for(let i=0;i<hp.index.count;i+=3){const tri=[hp.index.getX(i),hp.index.getX(i+1),hp.index.getX(i+2)];if(tri.every(n=>a.getY(n)>(a.getZ(n)>.055?.183:.105)))idx.push(...tri);}hp.setIndex(idx);hp.deleteAttribute('color');for(let i=0;i<hp.attributes.position.count;i++){const x=hp.attributes.position.getX(i),y=hp.attributes.position.getY(i),z=hp.attributes.position.getZ(i);hp.attributes.position.setXYZ(i,x*1.025,y+.008,z*1.03-.003);}hp.computeVertexNormals();mesh(hp,m.hair,g);for(let i=0;i<17;i++){const x=(i-8)*.011;tube(g,[[x,.182+Math.abs(i-8)*.003,.103],[x-.021,.243,.060],[x-.029,.251,-.012],[x-.02,.20,-.079]],.006,m.hair);}}
 if(p.smith){for(let i=-4;i<=4;i++)tube(g,[[i*.012,.036,.127],[i*.014,-.008,.097],[i*.007,-.034,.074]],.008,m.hair);}
}
export function buildLiving(c,part){
 const role=c.design,rank=c.rank,armor=c.armor?armorDefinition(c.armor):null,kind=c.armor?armorKind(c.armor):null,p=dressProfile(role,rank,kind),ranged=p.ranger||role==='crew';
 const palette=rankPalette(role,rank),clothHex=armor?.cloth??palette.cloth,trimHex=armor?.trim??palette.trim,plateHex=armor?.steel??palette.steel;
 const m={cloth:material('cloth',clothHex,{side:T.DoubleSide,roughness:1}),quilt:material('cloth',0xffffff,{map:textile('quilt',p.ranger?'#54432f':'#67513c'),side:T.DoubleSide,roughness:1}),mail:material('steel',0xb6b5a5,{map:textile('mail'),roughness:.82,metalness:.45}),steel:material('steel',plateHex,{roughness:.56,metalness:.72,envMapIntensity:.82}),edge:material('steel',trimHex,{roughness:.60,metalness:.70}),dark:material('leather',0x24282a,{roughness:.95}),leather:material('leather',p.ranger?0x605344:0x4b3e31,{roughness:.94}),skin:new T.MeshStandardMaterial({color:0xb4a294,map:ART.textures['human-skin'],roughness:.87}),eye:new T.MeshStandardMaterial({color:0xada994,roughness:.6}),iris:new T.MeshStandardMaterial({color:0x4b5548,roughness:.5}),hair:material('cloth',p.smith?0x615446:0x30271f,{roughness:1})};
 // Explicitly preserve a different fabric construction for each equipped armor family.
 if(kind==='trail'){p.plate=false;m.steel.color.setHex(armor.steel);m.steel.metalness=.12;m.steel.roughness=.95;}
 if(kind==='spellweave'||kind==='dawn'){p.mage=true;p.plate=false;}
 c.materials.push(...Object.values(m));c.atelier={...p,clothHex,trimHex,palette};
 const hips=part('hips'),spine=part('spine'),chest=part('chest'),head=part('head');
 shell(hips,[[-.12,.166,.105],[0,.17,.113],[.17,.153,.105]],m.quilt);
 shell(spine,[[0,.15,.102],[.11,.17,.118],[.26,.207,.139]],p.mail?m.mail:m.quilt);
 const coat=p.plate?m.steel:p.mail?m.mail:m.quilt;
 shell(chest,[[-.16,.154,.108],[-.10,.176,.127],[.025,.222,.150],[.12,.226,.133],[.19,.168,.093]],coat,{square:.70,segments:20});
 // Neck, gorget, shaped shoulder straps and the raised medial ridge of plate.
 cyl(chest,.060,.070,.20,[0,.26,0],m.leather,12);
 shell(chest,[[.145,.195,.112],[.215,.106,.081],[.248,.081,.069]],p.plate?m.steel:m.cloth);rim(chest,.081,.069,.248,m.edge);
 if(p.plate){tube(chest,[[0,-.16,.118],[0,-.02,.175],[0,.07,.157],[0,.155,.13]],.004,m.edge);rim(chest,.155,.112,-.156,m.edge);for(const side of [-1,1]){tube(chest,[[side*.14,.176,.079],[side*.205,.11,.11],[side*.17,-.08,.112]],.004,m.edge);for(let i=0;i<3;i++)shell(spine,[[.032+i*.05,.169+i*.008,.124],[.080+i*.05,.177+i*.008,.136]],i===2?m.steel:m.dark);}}
 else {for(const side of [-1,1]){const b=box(chest,[.039,.34,.021],[side*.12,.02,.154],m.leather);b.rotation.z=side*.30;const buckle=box(chest,[.053,.055,.012],[side*.14,.1,.168],m.edge);box(chest,[.027,.03,.013],[side*.14,.1,.177],m.dark);}if(rank>=2)for(let y=-.12;y<.14;y+=.045)orb(chest,[.006,.006,.004],[.015,y,.155],m.edge);}
 // A fitted belt and individual hanging straps; split coat panels leave room for the legs.
 shell(hips,[[.115,.174,.131],[.178,.177,.13]],m.leather);box(hips,[.078,.064,.018],[.018,.148,.14],m.edge);box(hips,[.051,.040,.019],[.018,.148,.152],m.dark);
 for(const side of [-1,1]){const pouch=box(hips,[.072,.096,.04],[side*.16,.06,.119],m.leather);pouch.rotation.z=side*.1;box(hips,[.076,.018,.046],[side*.16,.083,.124],m.edge);const skirt=plaque(hips,[[0,0],[.15,-.016],[.18,-.29],[.07,-.35],[-.015,-.32]],[side>0?.02:-.17,-.03,.116],rank>=7?m.cloth:m.quilt,.004);if(p.plate&&rank>=4)for(let i=0;i<3;i++){const t=plaque(hips,[[-.06,0],[.067,0],[.076,-.075],[.045,-.1],[-.069,-.084]],[side*.168,-.04-i*.063,.09],m.steel);t.rotation.y=side*.4;}}
 for(const [suffix,side]of [['l',1],['r',-1]]){
  const arm=part('upperarm.'+suffix),fore=part('lowerarm.'+suffix),hand=part('hand.'+suffix),wrist=part('wrist.'+suffix),thigh=part('upperleg.'+suffix),shin=part('lowerleg.'+suffix),foot=part('foot.'+suffix);
  orb(arm,[.094,.066,.088],[0,0,0],p.mail?m.mail:m.quilt);shell(arm,[[0,.09,.084],[.09,.085,.080],[.275,.053,.054]],p.mail?m.mail:m.quilt);shell(fore,[[0,.057,.055],[.06,.065,.063],[.245,.041,.039]],m.leather);
  shell(thigh,[[0,.10,.095],[.11,.096,.090],[.24,.080,.071],[.415,.056,.058]],m.quilt);shell(shin,[[0,.062,.064],[.12,.078,.066],[.26,.055,.052],[.405,.043,.042]],m.leather);
  // Boots are tapered feet with a sole and cuff, not rounded doll feet.
  const shoe=new T.Group();shoe.rotation.x=-Math.PI*.75;foot.add(shoe);orb(shoe,[.068,.060,.145],[0,-.010,.082],m.leather);shell(shoe,[[-.050,.067,.140,.072],[-.033,.070,.144,.073]],m.dark,{square:.8});orb(shoe,[.062,.072,.069],[0,.022,-.017],m.leather);rim(shin,.054,.052,.28,m.edge,.004);
  for(let i=0;i<3;i++)shell(shin,[[.21+i*.044,.063-i*.005,.055-i*.003],[.232+i*.044,.063-i*.005,.055-i*.003]],m.dark);
  orb(wrist,[.037,.038,.035],[0,.02,0],m.leather);shell(hand,[[0,.038,.032],[.056,.045,.03],[.091,.032,.025]],m.leather,{square:.5});for(let i=0;i<4;i++)tube(hand,[[(i-1.5)*.019,.055,.023],[(i-1.5)*.018,.107,.027],[(i-1.5)*.016,.113,.045]],.008,m.leather);tube(hand,[[side*.04,.015,0],[side*.056,.051,.024],[side*.042,.075,.043]],.009,m.leather);
  // Narrow ranger pauldrons remain asymmetric and leave the string arm clear.
  if(rank>=2||p.hero){const size=(p.ranger?(side<0?.66:.84):1)*(rank>=8?1.19:rank>=5?1.09:.93),plates=(rank>=8?4:rank>=4?3:1);const shoulderMat=(rank>=4||p.hero)&&!p.smith?m.steel:m.leather;
   for(let i=0;i<plates;i++){const a=shell(arm,[[-.036+i*.033,.088,.074],[-.012+i*.033,.126-i*.008,.101-i*.005],[.058+i*.042,.113-i*.007,.105-i*.006]],shoulderMat,{square:.48,segments:10});a.scale.set(size,1,size);rim(arm,(.114-i*.007)*size,(.106-i*.006)*size,.075+i*.046,m.edge,rank>=7?.006:.003);}
   if(rank>=6||p.hero){const seal=sunBadge(arm,.04,m.edge);seal.position.set(0,.033,-.127*size);seal.rotation.x=Math.PI;}
  }
  if(rank>=4||p.hero){const bracer=plaque(fore,[[-.058,0],[0,-.015],[.058,0],[.046,.19],[0,.235],[-.043,.19]],[0,.015,-.067],m.steel);bracer.rotation.y=Math.PI;for(const y of [.045,.18])shell(fore,[[y,.067-y*.09,.063-y*.065],[y+.019,.067-y*.09,.063-y*.065]],m.edge);}
  if((rank>=5||p.hero)&&!p.mage){const gr=plaque(shin,[[-.067,0],[0,-.051],[.067,0],[.049,.25],[.038,.375],[-.038,.375],[-.049,.25]],[0,.015,-.075],m.steel);gr.rotation.y=Math.PI;tube(shin,[[0,.005,-.092],[0,.14,-.088],[0,.36,-.060]],.004,m.edge);const knee=plaque(shin,[[-.065,0],[-.042,.059],[.038,.059],[.075,0],[.03,-.045],[-.035,-.045]],[0,-.01,-.084],m.steel);knee.rotation.y=Math.PI;
   for(let i=0;i<4;i++){const sabaton=orb(shoe,[.073-i*.004,.042,.037],[0,.023-i*.006,.040+i*.043],m.steel);}
  }
  if(rank>=9){const wing=plaque(arm,[[0,0],[.04,.14],[.10,.12],[.07,.20],[.16,.16],[.10,.28],[.20,.23],[.075,-.04]],[side*.065,-.026,-.11],m.edge);wing.scale.x=side;wing.rotation.z=side*-.3;}
 }
 if(p.hero||p.hood||p.smith||rank<4)face(head,m,p);
 if(p.hood){shell(head,[[-.03,.093,.10,-.005],[.07,.134,.135,-.015],[.18,.135,.139,-.019],[.27,.085,.10,-.030],[.303,.005,.025,-.036]],m.cloth,{segments:20,start:.69,end:Math.PI*2-.69,square:1});for(const side of [-1,1])tube(head,[[side*.076,-.03,.077],[side*.104,.065,.093],[side*.104,.178,.083],[side*.062,.273,.056],[0,.303,-.010]],.007,rank>=6?m.edge:m.leather);}
 else if((!p.hero||role==='warden'&&rank>=8)&&!p.smith&&rank>=2){
  const helm=mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*.52),m.steel,head,0,.162,-.008);helm.scale.set(.137,.149,.139);rim(head,.145,.148,.155,m.edge,.006);
  if(rank<4){shell(head,[[.154,.166,.170],[.168,.138,.139]],m.steel);}
  else {plaque(head,[[-.12,.12],[-.052,.153],[0,.14],[.052,.153],[.12,.12],[.095,-.004],[0,-.043],[-.095,-.004]],[0,0,.134],m.steel,.023);box(head,[.207,.009,.024],[0,.132,.159],m.dark);for(const xx of [-.075,-.050,.050,.075])for(let j=0;j<3;j++)orb(head,[.003,.004,.002],[xx,.021+j*.021,.165],m.dark);tube(head,[[0,-.032,.166],[0,.10,.169],[0,.29,.020]],.005,m.edge);}
 }
 if(rank>=6){const crest=sunBadge(chest,rank>=8?.070:.052,m.edge);crest.position.set(0,.029,.171);}
 if(p.smith){const apron=plaque(chest,[[-.153,.135],[.15,.135],[.16,-.3],[.185,-.72],[0,-.78],[-.18,-.72]],[0,-.02,.164],m.leather,.005);for(const side of [-1,1]){tube(chest,[[side*.15,.20,.094],[side*.11,.11,.187],[side*.11,-.13,.177]],.016,m.leather);box(chest,[.05,.057,.013],[side*.12,.125,.189],m.edge);}for(let i=0;i<3;i++)box(hips,[.052,.10,.034],[-.065+i*.065,-.10,.184],m.dark);}
 if(p.mage){for(const side of [-1,1]){const stole=plaque(chest,[[-.048,.17],[.05,.17],[.09,-.7],[.02,-.92],[-.06,-.88]],[side*.135,0,.152],m.cloth,.004);stole.rotation.z=side*-.08;tube(chest,[[side*.16,.16,.16],[side*.15,-.3,.178],[side*.20,-.8,.17]],.006,m.edge);}const jewel=mesh(new T.OctahedronGeometry(.039),m.eye,chest,0,.19,.102);jewel.material=m.edge;}
 if(ranged){const q=cyl(chest,.075,.059,.51,[.18,-.08,-.23],m.leather,12);q.rotation.z=-.25;for(const y of [-.27,.13])rim(chest,.077,.061,y,m.edge).position.set(.18,0,-.23);for(let i=0;i<5+(rank>=6?3:0);i++){const x=.13+i*.014,z=-.22+(i%2)*.027,top=.37+(i%3)*.025;beam(chest,[x,-.17,z],[x-.06,top,z],.004,m.leather,5);for(const turn of [0,Math.PI/2]){const f=plaque(chest,[[0,0],[.025,.013],[.025,.085],[0,.07]],[x-.06,top-.08,z],rank>=7?m.edge:m.cloth,.002);f.rotation.y=turn;}}
  tube(chest,[[-.205,.177,.07],[.02,-.01,.183],[.17,-.16,.10]],.022,m.leather);
 }
 if(role==='banner'){beam(chest,[-.21,-.1,-.18],[-.21,1.0,-.18],.017,m.edge,8);const fm=m.cloth.clone();fm.map=textile('banner','#'+new T.Color(clothHex).getHexString());fm.color.setHex(0xffffff);c.materials.push(fm);mesh(new T.PlaneGeometry(.41,.55,5,5),fm,chest,-.02,.70,-.18);}
 if(role==='engineer'||role==='crew'){box(chest,[.30,.34,.12],[0,-.01,-.22],m.leather);for(const side of [-1,1])tube(chest,[[side*.14,.19,-.06],[side*.21,0,.13],[side*.12,-.12,.12]],.017,m.leather);beam(chest,[.18,-.1,-.27],[.18,.35,-.27],.024,m.leather);box(chest,[.20,.07,.07],[.18,.35,-.27],m.steel);}
 if(rank>=8&&!p.smith&&!p.ranger){for(const side of [-1,1])for(let i=0;i<5;i++){const crest=plaque(head,[[-.008,0],[.008,-.008],[.022,.055],[.027,.13+i*.013],[.014,.16+i*.012],[-.004,.048]],[side*(.115+i*.009),.175-i*.007,-.025-i*.018],m.edge,.004);crest.rotation.z=-side*(.38+i*.08);}}
 if(rank>=10&&!p.smith&&!p.ranger){for(let i=0;i<14;i++)tube(head,[[0,.27,-.015-i*.006],[0,.37-i*.005,-.03-i*.011],[0,.41-i*.007,-.16-i*.010],[0,.27-i*.009,-.24-i*.008]],.008,m.cloth);}
 if(p.ranger&&rank>=8){for(let i=0;i<rank-6;i++)tube(head,[[.098,.02,-.06],[.13+i*.009,.10,-.08],[.12+i*.012,.18+i*.012,-.12]],.005,m.edge);}
 if(p.plate){for(const side of [-1,1]){for(let j=0;j<7;j++)orb(chest,[.0035,.0035,.0025],[side*(.12+j*.009),.14-j*.038,.14+Math.sin(j*.7)*.022],m.edge);for(let j=0;j<3;j++)tube(chest,[[side*(.040+j*.03),-.12,.14],[side*(.063+j*.03),-.015,.156],[side*(.068+j*.032),.08,.143]],.0025,m.edge);}
  if(rank>=6||p.hero){for(const side of [-1,1]){const front=plaque(hips,[[-.060,0],[.061,0],[.08,-.40],[.035,-.53],[-.053,-.50]],[side*.073,.095,.157],m.cloth,.004);front.rotation.z=side*-.035;tube(hips,[[side*.12,.09,.175],[side*.13,-.23,.175],[side*.13,-.38,.175]],.004,m.edge);const med=sunBadge(hips,.043,m.edge);med.position.set(side*.073,-.23,.18);}for(const side of [-1,1]){const thigh=part('upperleg.'+(side>0?'l':'r'));for(let j=0;j<4;j++){const t=plaque(thigh,[[-.072,0],[.072,0],[.065,.068],[0,.085],[-.065,.068]],[0,.045+j*.068,-.093],m.steel);t.rotation.y=Math.PI;tube(thigh,[[-.066,.107+j*.068,-.103],[0,.127+j*.068,-.103],[.066,.107+j*.068,-.103]],.003,m.edge);}}}}
 for(let i=0;i<rank;i++){const sleeve=part('lowerarm.l');const pip=plaque(sleeve,[[-.006,0],[0,.009],[.006,0],[0,-.009]],[(i%2-.5)*.018,.035+Math.floor(i/2)*.022,-.069],m.edge,.003);}
 // Enamel insets sit within metal frames, with engraved ribs and rank-specific regalia.
 const enamel=material('steel',clothHex,{roughness:.30,metalness:.32,envMapIntensity:.8}),gem=new T.MeshPhysicalMaterial({color:palette.jewel,metalness:.28,roughness:.12,clearcoat:1});c.materials.push(enamel,gem);
 if(rank>=3){for(const side of [-1,1]){const a=part('upperarm.'+(side>0?'l':'r'));const inset=plaque(a,[[-.050,0],[.045,0],[.062,.058],[0,.096],[-.060,.058]],[0,.038,-.128],enamel);inset.rotation.y=Math.PI;}}
 if(rank>=5){for(const side of [-1,1]){plaque(chest,[[0,0],[.060,.02],[.085,.10],[.054,.155],[.007,.133]],[side>0?.06:-.14,-.06,.151],enamel,.008);for(let j=0;j<3;j++)tube(chest,[[side*(.084+j*.018),-.01,.172],[side*(.105+j*.018),.055,.166],[side*(.10+j*.018),.115,.149]],.0025,m.edge);}}
 if(rank>=6){for(const side of [-1,1]){const jewel=mesh(new T.OctahedronGeometry(.021),gem,chest,side*.128,.175,.099);jewel.scale.z=.42;}}
 if(rank>=7){for(const side of [-1,1]){const a=part('lowerarm.'+(side>0?'l':'r'));plaque(a,[[-.025,0],[.025,0],[.032,.10],[0,.15],[-.032,.10]],[0,.038,-.076],enamel,.01);for(let i=0;i<rank-6;i++)tube(a,[[side*.032,.04+i*.025,-.082],[0,.052+i*.025,-.090],[-side*.032,.04+i*.025,-.082]],.0025,m.edge);}}
 if(rank>=8){for(const side of [-1,1]){const t=plaque(hips,[[-.07,0],[.07,0],[.063,-.30],[0,-.40],[-.063,-.30]],[side*.19,-.13,.07],enamel,.014);t.rotation.y=side*.6;const s=part('upperarm.'+(side>0?'l':'r'));for(let j=0;j<3;j++){const flute=plaque(s,[[-.014,0],[.014,0],[.02,.13],[0,.18],[-.02,.13]],[-.068+j*.068,.015,-.140],m.edge,.005);flute.rotation.y=Math.PI;}}}
 if(rank>=9){for(const side of [-1,1]){const jewel=mesh(new T.OctahedronGeometry(.033),gem,chest,side*.18,.137,.118);jewel.scale.z=.4;}const med=mesh(new T.OctahedronGeometry(.036),gem,hips,0,.15,.178);med.scale.z=.35;}
 if(rank>=10){for(const side of [-1,1])tube(chest,[[side*.14,.16,.135],[side*.20,.08,.17],[side*.15,-.035,.18],[side*.06,-.055,.17]],.006,m.edge);}
 // Family identity on visible armor: straps, pale vestments, cinder channels, or command sash.
 if(kind==='bastion')for(const side of [-1,1])plaque(chest,[[-.035,0],[.04,0],[.08,.15],[-.055,.18]],[side*.14,.085,.115],m.steel);
 if(kind==='ember')for(const side of [-1,1])tube(chest,[[side*.1,-.13,.14],[side*.13,0,.16],[side*.10,.13,.132]],.007,m.edge);
 if(kind==='spellweave'){for(const side of [-1,1])plaque(chest,[[-.04,0],[.045,0],[.065,.20],[.01,.28],[-.045,.18]],[side*.15,.12,.01],m.edge,.006);}
 if(kind==='dawn'){shell(chest,[[.10,.23,.13],[.19,.20,.11],[.24,.12,.08]],m.cloth);for(const x of [-.18,.18])tube(chest,[[x,.19,.07],[x,.10,.16],[x,-.19,.16]],.012,m.edge);}
 if(kind==='marshal')tube(chest,[[-.20,.17,.11],[0,-.005,.182],[.16,-.14,.13]],.042,m.cloth);
 const forge=c.armor?.plus||0;for(let i=0;i<forge;i++){const x=(i%2?1:-1)*(.072+Math.floor(i/2)*.013),y=.12-Math.floor(i/2)*.048;const clasp=plaque(chest,[[-.009,0],[0,.014],[.009,0],[0,-.014]],[x,y,.173],m.edge,.005);}if(forge>=3){const rune=mesh(new T.OctahedronGeometry(.023),m.edge,chest,0,.157,.16);}if(forge>=7){for(const side of [-1,1])shell(part('upperarm.'+(side>0?'l':'r')),[[-.02,.14,.13],[.04,.16,.14],[.12,.135,.12]],m.steel,{square:.55});}
 return {cloth:m.cloth,brass:m.edge,profile:p};
}
