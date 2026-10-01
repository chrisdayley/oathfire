import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {material} from './materials.js';
import {mesh,box,cyl,beam,sunBadge,compactRigid,weapon,shield} from './art.js';

export const HOST_DESIGNS={
 hollow:{name:'The Unburied',subtitle:'Levy of the Hollow Host',description:'Exposed ribs, burial linen and a broken iron cap. These are the ordinary dead pressed back into service.',color:0x746450},
 archer:{name:'Duskbone Stalker',subtitle:'Hollow bowman',description:'A narrow ash-grey hood, leather rib harness and a tall quiver distinguish the ranged hunters.',color:0x424844},
 knight:{name:'Ossuary Knight',subtitle:'Armored line breaker',description:'Blackened fluted plate, an angular sallet and a serrated coffin shield. Cold light leaks through the visor.',color:0x313b3d},
 mage:{name:'Grave Caller',subtitle:'Keeper of stolen voices',description:'A funerary mask hangs beneath a tall iron crown. Split mourning robes and a lantern staff frame the exposed rib cage.',color:0x303c37},
 brute:{name:'Kiln Brute',subtitle:'Walking siege furnace',description:'A small iron muzzle sits between massive stone-and-steel shoulders. A caged ember burns inside its breastplate.',color:0x493a30},
 bell:{name:'The Bell Knight',subtitle:'Captain of the first march',description:'An inverted bronze bell forms its helm. A ribbed cuirass, chained relics and a processional glaive announce its approach.',color:0x66533b},
 castellan:{name:'The Ash Castellan',subtitle:'Lord of the burnt strongholds',description:'Overlapping basalt plates, a furnace mask and a broken corona. Glowing seams cut through a charred ceremonial mantle.',color:0x4c302a},
 veyr:{name:'Marshal Veyr',subtitle:'The oath that broke the March',description:'An elongated crown and a ruined sun halo rise above tarnished royal armor. His torn black cloak carries the kingdom’s extinguished light.',color:0x293337}
};
const bone=(c,id)=>c.sockets[id]||c.sockets[id.replaceAll('.','')];
const Y=new T.Vector3(0,1,0);
const ellipsoid=(g,s,p,m)=>{const tiny=Math.max(...s)<.022;const o=mesh(new T.SphereGeometry(1,tiny?6:12,tiny?4:8),m,g,...p);o.scale.set(...s);return o;};
function ring(g,rx,rz,y,r,m){const points=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI*2;points.push(new T.Vector3(Math.sin(a)*rx,y,Math.cos(a)*rz));}return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),32,r,5,false),m,g);}
function loft(g,rings,m,segments=20){const p=[],uv=[],idx=[];for(let j=0;j<rings.length;j++){const [y,rx,rz,z=0]=rings[j];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;p.push(Math.sin(a)*rx,y,Math.cos(a)*rz+z);uv.push(i/segments,j/(rings.length-1));if(j<rings.length-1&&i<segments){const n=j*(segments+1)+i;idx.push(n,n+1,n+segments+1,n+1,n+segments+2,n+segments+1);}}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(geo,m,g);}
function strip(g,points,width,m){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(8,points.length*4),width,5,false),m,g);}
function studs(g,rx,rz,y,count,m){for(let i=0;i<count;i++){const a=i/count*Math.PI*2;ellipsoid(g,[.009,.009,.009],[Math.sin(a)*rx,y,Math.cos(a)*rz],m);}}

export function rigRole(model,options){return options.design|| (options.enemy?({Skeleton_Minion:'hollow',Skeleton_Rogue:'archer',Skeleton_Mage:'mage',Skeleton_Warrior:options.height>2.5?'brute':'knight'}[model]||'hollow'):{Knight:'warden',Mage:'ashwright',Rogue_Hooded:'ranger',Barbarian:'breaker'}[model]||'warden');}
export function recordRest(c){c.rest=new Map();for(const b of Object.values(c.sockets))if(b.isBone)c.rest.set(b,b.position.clone());}
export function resetRigTranslations(c){for(const [b,p]of c.rest)b.position.copy(p);}
export function adultPose(c){
 const wide=c.design==='brute'?1.48:['giant','breaker','castellan'].includes(c.design)?1.2:1;
 const set=(id,x,y,z=0)=>{const b=bone(c,id);if(b){b.position.set(x,y,z);b.scale.set(1,1,1);}};
 const hips=bone(c,'hips');if(hips){const raw=hips.position.clone();hips.position.set(raw.x*.5,1.02+(raw.y-.4056634)*.45,raw.z*.5);hips.scale.set(wide,1,1);}
 set('spine',0,.16);set('chest',0,.27);set('head',0,.285);if(c.design==='brute')bone(c,'head').scale.x=.74;
 for(const [suffix,side]of [['l',1],['r',-1]]){
  set('upperleg.'+suffix,.14*side,.02);set('lowerleg.'+suffix,0,.44);set('foot.'+suffix,0,.425);set('toes.'+suffix,0,.17);
  set('upperarm.'+suffix,.245*side,.13);set('lowerarm.'+suffix,0,.305);set('wrist.'+suffix,0,.255);set('hand.'+suffix,0,.055);set('handslot.'+suffix,0,.063,-.026);
 }
}

export function buildAppearance(c){
 const role=c.design,rank=c.rank,undead=!!HOST_DESIGNS[role],bare=role==='hollow'||role==='archer',caster=role==='mage',brute=role==='brute',royal=['bell','castellan','veyr'].includes(role),hood=['ranger','bow','rider','archer','mage'].includes(role);
 const charcoal=material('steel',undead?0x55594f:0x737e7c,{roughness:.72,metalness:.84});
 const steel=material('steel',role==='castellan'?0x504038:role==='veyr'?0x65716d:undead?0x444c47:0x949f9e,{roughness:.54,metalness:.88});
 const brass=material('steel',undead?0x9a7645:0xb59b60,{roughness:.52,metalness:.78});
 const leather=material('leather',undead?0x74634d:0x746858,{roughness:.92,metalness:0});
 const cloth=material('cloth',undead?(HOST_DESIGNS[role]?.color||0x3b4036):['ashwright','breaker'].includes(role)?0x6c4d31:0x102d34,{side:T.DoubleSide,roughness:1});
 const boneMat=material('stone',0xa19a80,{normalScale:new T.Vector2(.13,.13),roughness:1});
 const black=new T.MeshStandardMaterial({color:0x090e10,roughness:.94});
 const glow=new T.MeshStandardMaterial({color:role==='brute'||role==='castellan'?0xff8535:0x85c9b1,emissive:role==='brute'||role==='castellan'?0xed4a10:0x519f80,emissiveIntensity:1.6,roughness:.6});
 const mats=[charcoal,steel,brass,leather,cloth,boneMat,black,glow];c.materials.push(...mats);
 const pieces=[],part=id=>{const b=bone(c,id);if(!b)return new T.Group();const g=new T.Group();b.add(g);pieces.push({bone:b,group:g});return g;};
 const hips=part('hips'),spine=part('spine'),chest=part('chest'),head=part('head');
 if(!bare)ellipsoid(hips,[.165,.15,.115],[0,0,0],leather);if(!bare)ellipsoid(hips,[.158,.18,.103],[0,.16,0],cloth);
 if(bare||caster){for(let i=0;i<4;i++)ellipsoid(chest,[.030,.020,.031],[0,.175+i*.033,0],boneMat);}else cyl(chest,.062,.072,.14,[0,.225,0],charcoal,16);
 if(!bare&&!caster)loft(spine,[[0,.145,.102],[.12,.175,.115],[.25,.205,.13]],cloth);
 if(!bare&&!caster){
  loft(chest,[[-.15,.155,.117],[-.08,.192,.153],[.025,.232,.166],[.11,.235,.150],[.175,.207,.122],[.21,.143,.095]],steel);
  ring(chest,.155,.118,-.15,.007,brass);ring(chest,.144,.096,.205,.006,charcoal);for(const side of [-1,1]){strip(chest,[[side*.144,.20,.03],[side*.218,.14,.04],[side*.229,.07,.07]],.012,charcoal);for(let i=0;i<4;i++)ellipsoid(chest,[.004,.004,.004],[side*(.19-i*.008),.13-i*.065,.12+i*.004],brass);}ring(chest,.20,.13,-.04,.006,charcoal);
  for(const x of [-.16,.16])strip(chest,[[x,-.12,.09],[x*.75,.06,.137],[x*.68,.18,.105]],.008,brass);
  strip(chest,[[0,-.14,.125],[0,-.065,.164],[0,.025,.18],[0,.18,.126]],.007,brass);
  for(let i=0;i<3;i++)loft(spine,[[.025+i*.052,.173+i*.007,.123],[.06+i*.052,.18+i*.007,.129]],charcoal);
 }else{
  for(let side of [-1,1])for(let i=0;i<5;i++)strip(chest,[[0,.13-i*.052,-.065],[side*(.15-i*.011),.10-i*.045,-.02],[side*(.20-i*.014),.075-i*.044,.075],[side*.055,.05-i*.042,.13]],.012,boneMat);
  beam(chest,[0,-.10,.12],[0,.15,.13],.016,boneMat,8);
  for(let i=0;i<5;i++)ellipsoid(spine,[.037,.027,.035],[0,.04+i*.052,-.075],boneMat);
  for(const side of [-1,1])strip(hips,[[side*.03,.08,.06],[side*.15,.06,.09],[side*.12,-.08,.06],[side*.02,-.08,0]],.025,boneMat);
 }
 // A narrow waist belt, buckle, tassets and tailored split tabard.
 loft(hips,[[.035,.177,.13],[.10,.177,.13]],leather);box(hips,[.075,.057,.015],[0,.069,.143],brass);box(hips,[.047,.031,.02],[0,.069,.15],black);
 if(rank>=2||royal)for(let i=0;i<7;i++)ellipsoid(hips,[.006,.006,.007],[-.12+i*.04,.067,.141],brass);
 if(!bare){for(const side of [-1,1])for(let i=0;i<2+(rank>=6?1:0);i++){const plate=loft(hips,[[-.04-i*.075,.18,.12],[-.12-i*.075,.19,.14]],i%2?charcoal:steel,12);plate.rotation.z=side*.07;plate.scale.x=.5;plate.position.x=side*.105;}}
 if(!brute&&!bare){const skirt=new T.PlaneGeometry(.30,role==='mage'?.85:.46,8,10),p=skirt.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setXYZ(i,p.getX(i)*(1+(.25-y)*.20),y,Math.sin(p.getX(i)*42)*.012);}skirt.computeVertexNormals();const tab=mesh(skirt,cloth,hips,0,-(role==='mage'?.44:.27),.156);tab.rotation.x=-.10;if(!undead){const sigil=sunBadge(hips,.073,brass);sigil.position.set(0,-.25,.178);}}
 for(const suffix of ['l','r']){
  const arm=part('upperarm.'+suffix),fore=part('lowerarm.'+suffix),wrist=part('wrist.'+suffix),hand=part('hand.'+suffix),thigh=part('upperleg.'+suffix),shin=part('lowerleg.'+suffix),foot=part('foot.'+suffix);
  if(bare||caster){for(const [g,length]of [[arm,.305],[fore,.255],[thigh,.44],[shin,.425]]){beam(g,[0,.025,0],[0,length-.02,0],g===thigh?.035:.022,boneMat,8);for(const y of [.025,length-.025])ellipsoid(g,[.039,.024,.032],[0,y,0],boneMat);}if(role==='archer'){loft(arm,[[.03,.065,.06],[.22,.047,.043]],leather,12);loft(shin,[[.04,.06,.05],[.35,.045,.04]],cloth,12);}}
  else{
   loft(arm,[[0,.082,.08],[.08,.087,.08],[.28,.061,.058]],cloth,16);
   loft(fore,[[.02,.066,.061],[.08,.070,.065],[.24,.044,.043]],rank>=4||undead?steel:leather,16);
   loft(thigh,[[.01,.102,.09],[.13,.105,.087],[.40,.065,.061]],cloth,16);
   loft(shin,[[.015,.078,.070],[.15,.085,.071],[.39,.049,.051]],steel,16);
   ring(fore,.067,.063,.04,.007,brass);ring(shin,.077,.07,.04,.009,charcoal);
   if(rank>=4||undead)ring(fore,.046,.045,.23,.008,brass);
   if(rank>=6||royal)strip(shin,[[0,.04,-.075],[0,.15,-.08],[0,.39,-.052]],.007,brass);
   // Overlapping shoulder lames remain attached to the shoulder's full skeletal motion.
   const cap=mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*.53),steel,arm,0,.014,0);cap.scale.set(.127,.096,.129);cap.rotation.z=Math.PI;const count=rank>=3||undead?3:2;for(let i=0;i<count;i++)loft(arm,[[.010+i*.049,.125-i*.009,.126-i*.009],[.085+i*.049,.110-i*.009,.108-i*.009]],i===0?steel:charcoal,18);
   if(rank>=3||royal)ring(arm,.125,.127,.019,.006,brass);
   ellipsoid(shin,[.083,.074,.085],[0,.01,0],steel);ellipsoid(fore,[.074,.042,.071],[0,.006,0],charcoal);for(const side of [-1,1])ellipsoid(fore,[.018,.047,.039],[side*.066,.01,0],steel);
   if(rank>=5||royal)for(let i=0;i<3;i++)box(thigh,[.055,.10,.015],[(i-1)*.048,.12,-.082],steel);
  }
  ellipsoid(wrist,[.04,.045,.04],[0,.022,0],bare?boneMat:leather);
  ellipsoid(hand,[.051,.067,.036],[0,.035,0],bare?boneMat:charcoal);
  for(let i=0;i<4;i++){const finger=beam(hand,[(i-1.5)*.022,.07,.002],[(i-1.5)*.019,.115,.030],.009,bare?boneMat:leather,6);}
  beam(hand,[suffix==='l'?.043:-.043,.02,.015],[suffix==='l'?.061:-.061,.058,.025],.014,bare?boneMat:leather,6);
  if(bare||caster){for(let i=0;i<5;i++){beam(foot,[(i-2)*.020,.018,0],[(i-2)*.022,.185-Math.abs(i-2)*.009,.030],.010,boneMat,6);ellipsoid(foot,[.012,.019,.010],[(i-2)*.022,.192-Math.abs(i-2)*.009,.030],boneMat);}}else{const boot=ellipsoid(foot,[.076,.137,.071],[0,.084,.012],charcoal);boot.rotation.x=.23;}
  if(!bare&&!caster)for(let i=0;i<4;i++){const plate=ellipsoid(foot,[.078-i*.004,.027,.063],[0,.025+i*.044,.055],steel);plate.rotation.x=.2;}
  if(rank>=8&&!undead)studs(arm,.128,.12,.012,8,brass);
 }
 // Human-size heads and fitted helms replace the oversized source character meshes.
 if(bare||caster){
  // A recessed face plate with actual eye and nasal openings; the sockets
  // contain darkness behind bone rather than protruding black eyeballs.
  ellipsoid(head,[.104,.123,.089],[0,.168,-.035],boneMat);
  const face=new T.Shape();face.moveTo(-.086,.206);face.quadraticCurveTo(0,.273,.086,.206);face.lineTo(.099,.137);face.lineTo(.071,.075);face.lineTo(.048,.053);face.lineTo(-.048,.053);face.lineTo(-.071,.075);face.lineTo(-.099,.137);face.closePath();
  for(const x of [-.043,.043]){const hole=new T.Path();hole.absellipse(x,.158,.029,.023,0,Math.PI*2,true);face.holes.push(hole);ellipsoid(head,[.029,.024,.008],[x,.158,.051],black);ellipsoid(head,[.003,.003,.004],[x,.157,.063],glow);}
  const nose=new T.Path();nose.moveTo(0,.134);nose.lineTo(-.015,.094);nose.lineTo(.015,.094);nose.closePath();face.holes.push(nose);box(head,[.025,.040,.008],[0,.107,.059],black);
  const mask=mesh(new T.ExtrudeGeometry(face,{depth:.018,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,steps:1}),boneMat,head,0,0,.070);
  for(const side of [-1,1])strip(head,[[side*.078,.114,.055],[side*.074,.044,.039],[side*.049,.017,.070],[side*.008,.012,.081]],.012,boneMat);
  for(let i=0;i<8;i++)box(head,[.009,.016,.012],[-.038+i*.011,.046,.091],boneMat);
 }else if(hood){
  ellipsoid(head,[.11,.135,.10],[0,.13,.02],leather);box(head,[.14,.075,.02],[0,.045,.119],cloth);for(const x of [-.04,.04])box(head,[.032,.008,.01],[x,.143,.117],black);
 }else{
  const helmet=mesh(new T.SphereGeometry(1,24,14,0,Math.PI*2,0,Math.PI*.64),steel,head,0,.12,0);helmet.scale.set(.146,.19,.15);
  loft(head,[[-.025,.09,.085],[.07,.138,.142],[.13,.146,.15]],steel,20);
  box(head,[.235,.015,.018],[0,.145,.145],black);box(head,[.014,.12,.017],[0,.065,.15],brass);
  for(const x of [-.075,-.044,.044,.075])box(head,[.008,.042,.016],[x,.046,.142],black);
  ring(head,.142,.15,.124,.008,brass);ring(head,.105,.095,-.013,.009,charcoal);
  for(const x of [-.10,.10])ellipsoid(head,[.008,.008,.008],[x,.086,.121],brass);
  if(undead){for(const x of [-.053,.053])box(head,[.035,.005,.004],[x,.145,.157],glow);}
 }
 if(hood){
  const outer=mesh(new T.SphereGeometry(1,18,12,Math.PI*.16,Math.PI*1.68,0,Math.PI*.75),cloth,head,0,.15,-.022);outer.scale.set(.167,.21,.177);outer.rotation.y=Math.PI/2;
  strip(head,[[-.135,-.025,.11],[-.145,.13,.14],[-.09,.29,.12],[0,.33,.075],[.09,.29,.12],[.145,.13,.14],[.135,-.025,.11]],.018,leather);
  loft(chest,[[.14,.17,.125],[.23,.145,.10]],cloth,18);
 }
 if(role==='hollow'){
  const helm=mesh(new T.SphereGeometry(1,12,8,0,Math.PI*2,0,1.65),charcoal,head,0,.19,0);helm.scale.set(.13,.12,.125);ring(head,.137,.128,.18,.010,charcoal);
  const pauldron=part('upperarm.l');loft(pauldron,[[-.04,.12,.115],[.08,.10,.09]],charcoal,10);
  for(let i=0;i<3;i++)loft(spine,[[.025+i*.055,.17,.12],[.05+i*.055,.17,.12]],cloth,12);
 }
 if(role==='archer'||['ranger','bow','rider'].includes(role)){
  const quiver=cyl(chest,.065,.055,.52,[.19,-.03,-.19],leather,12);quiver.rotation.z=-.20;
  for(let i=0;i<6;i++){beam(chest,[.16+i*.012,-.04,-.19],[.12+i*.02,.48+(i%3)*.025,-.20],.007,charcoal,6);const f=box(chest,[.036,.09,.007],[.12+i*.02,.42+(i%3)*.025,-.20],boneMat);f.rotation.z=-.1;}
  strip(chest,[[-.22,.17,.08],[0,.02,.166],[.18,-.15,.11]],.021,leather);
 }
 if(role==='ashwright'||role==='breaker'||role==='giant'){
  for(const side of [-1,1])strip(chest,[[side*.16,.18,.08],[side*.13,-.13,.14]],.025,leather);
  const apron=box(hips,[.31,.34,.025],[0,-.16,.17],leather);apron.rotation.x=-.08;
  for(let i=0;i<3;i++)box(head,[.018,.065,.018],[(i-1)*.044,.058,.161],brass);
  const rune=sunBadge(chest,.065,brass);rune.position.set(0,.065,.181);
 }
 if(caster){
  for(let i=0;i<7;i++){const a=(i-3)*.42;const tine=mesh(new T.ConeGeometry(.018,.24+Math.abs(i-3)*.018,4),charcoal,head,Math.sin(a)*.16,.39,Math.cos(a)*.12-.04);tine.rotation.z=-a*.18;}
  loft(chest,[[.11,.235,.158],[.23,.135,.092]],cloth,18);ring(chest,.234,.159,.11,.005,brass);
  for(const side of [-1,1]){const shroud=mesh(new T.PlaneGeometry(.20,.82,4,8),cloth,chest,side*.205,-.22,.045);shroud.rotation.z=side*.10;}
 }
 if(brute){
  for(const side of [-1,1]){const a=part('upperarm.'+(side<0?'r':'l'));const shoulder=mesh(new T.IcosahedronGeometry(1,1),charcoal,a,0,.035,0);shoulder.scale.set(.19,.17,.19);for(let i=0;i<3;i++){const nail=mesh(new T.ConeGeometry(.038,.15,5),steel,a,side*.10,.02+i*.065,-.13);nail.rotation.x=-.8;}}
  ellipsoid(chest,[.123,.14,.065],[0,.018,.148],glow);for(let i=-2;i<=2;i++)beam(chest,[i*.045,-.11,.207],[i*.047,.16,.195],.012,charcoal,8);
  for(const x of [-.15,.15])cyl(chest,.040,.052,.36,[x,.32,-.10],charcoal,10);
  box(head,[.22,.14,.08],[0,.06,.13],charcoal);for(let i=0;i<4;i++)box(head,[.023,.09,.012],[-.07+i*.047,.06,.179],brass);
 }
 if(role==='knight'){
  const crest=loft(head,[[.20,.04,.135],[.34,.018,.09],[.40,.002,.03]],charcoal,8);
  for(const side of [-1,1]){const shoulder=part('upperarm.'+(side<0?'r':'l'));for(let i=0;i<3;i++){const spike=mesh(new T.ConeGeometry(.026,.11+i*.02,4),steel,shoulder,side*.10,.015+i*.055,-.04);spike.rotation.z=side*.5;}}
 }
 if(royal){
  if(role==='bell'){loft(head,[[.0,.17,.15],[.08,.155,.14],[.29,.10,.10],[.36,.065,.064]],brass,24);ring(head,.171,.154,.013,.016,charcoal);box(head,[.18,.012,.035],[0,.14,.14],black);for(const side of [-1,1])for(let j=0;j<3;j++){const chain=mesh(new T.TorusGeometry(.025,.007,5,12),brass,chest,side*.21,-.06-j*.046,.14);chain.rotation.y=j%2*Math.PI/2;}}
  if(role==='castellan'){for(const side of [-1,1])for(let j=0;j<3;j++){const shard=mesh(new T.ConeGeometry(.065,.31-j*.04,5),charcoal,chest,side*(.19+j*.065),.22,-.05);shard.rotation.z=-side*(.3+j*.15);}for(let j=0;j<3;j++)strip(chest,[[-.12+j*.06,-.1,.14],[-.05+j*.06,.015,.158],[-.10+j*.06,.12,.14]],.004,glow);}
  if(role==='veyr'){for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const tine=mesh(new T.ConeGeometry(.014,.20+(i%2)*.06,4),brass,head,Math.sin(a)*.135,.38,Math.cos(a)*.11);tine.rotation.z=-Math.sin(a)*.25;}const halo=mesh(new T.TorusGeometry(.24,.012,6,32,Math.PI*1.55),brass,head,0,.25,-.16);halo.rotation.z=-.8;}
  for(const side of [-1,1]){const collar=loft(chest,[[.10,.255,.16],[.205,.16,.105]],charcoal,12);collar.scale.x=.5;collar.position.x=side*.12;collar.rotation.z=-side*.12;}
 }
 // Every permanent rank changes actual construction, not only paint.
 if(!undead){
  if(rank>=5){const badge=sunBadge(chest,.069,brass);badge.position.set(0,.078,.166);}
  if(rank>=7){for(const side of [-1,1]){strip(chest,[[side*.22,.10,.06],[side*.23,.03,.07],[side*.17,-.09,.12]],.009,brass);}}
  if(rank>=9){for(const side of [-1,1]){const wing=mesh(new T.ConeGeometry(.035,.17,5),brass,head,side*.13,.24,-.02);wing.rotation.z=-side*.30;}}
  if(rank>=10){for(let i=0;i<10;i++){const blade=mesh(new T.ConeGeometry(.021,.14,5),cloth,head,0,.31,-.10+i*.022);blade.rotation.x=-.3;}}
 }
 // Bake rigid armor and anatomical pieces into a few genuinely skinned draw calls.
 c.visual.updateMatrixWorld(true);const skeleton=new T.Skeleton(Object.values(c.sockets).filter(b=>b.isBone));skeleton.calculateInverses();
 const bins=new Map(),inverse=c.visual.matrixWorld.clone().invert();
 for(const piece of pieces){const index=skeleton.bones.indexOf(piece.bone);piece.group.traverse(o=>{if(!o.isMesh)return;const geo=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(inverse.clone().multiply(o.matrixWorld));const count=geo.attributes.position.count,indices=new Uint16Array(count*4),weights=new Float32Array(count*4);for(let i=0;i<count;i++){indices[i*4]=index;weights[i*4]=1;}geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));if(!bins.has(o.material))bins.set(o.material,[]);bins.get(o.material).push(geo);});piece.group.removeFromParent();}
 c.body=[];for(const [mat,geos]of bins){const geometry=mergeGeometries(geos,false);if(!geometry)throw Error('Character mesh merge failed');geos.forEach(g=>g.dispose());const body=new T.SkinnedMesh(geometry,mat);body.name='Oathfire_'+role+'_'+mat.uuid.slice(0,6);body.castShadow=body.receiveShadow=true;body.frustumCulled=false;c.visual.add(body);body.bind(skeleton);c.body.push(body);}
 // Cloth silhouette is a tailored mantle, with a ragged hem for the Hollow Host.
 if(!bare&&!brute){const height=caster?1.26:royal?1.36:rank>=7?1.23:1.02,width=royal?.62:.54,geo=new T.PlaneGeometry(width,height,12,18),p=geo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),drop=(height*.5-y)/height,x=p.getX(i);p.setXYZ(i,x*(.65+drop*.55),y,(Math.cos(x*38)*.014+drop*.07));if(undead&&drop>.94)p.setY(i,y+(Math.sin(x*90)+1)*.05);}geo.computeVertexNormals();const cape=mesh(geo,cloth,bone(c,'chest'),0,-height*.5+.19,-.15);cape.rotation.x=.15;c.cape=cape;c.capeBase=new Float32Array(geo.attributes.position.array);c.capeHeight=height;c.gear.push(cape);}
 c.held=compactRigid(weapon(c.weaponType,rank,c.color,c.temper,c.design));c.held.rotation.y=Math.PI;c.heldRest=c.held.quaternion.clone();bone(c,'handslot.r').add(c.held);c.gear.push(c.held);
 if(['sword','spear'].includes(c.weaponType)&&!caster&&!brute&&role!=='bell'){
  c.heldShield=compactRigid(shield(c.design==='warden'?Math.max(4,rank):rank,undead?0x343c38:0x234b4d,undead?role:null));c.heldShield.rotation.y=Math.PI;c.heldShield.rotation.z=-Math.PI/2;c.heldShield.position.set(0,-.02,.05);bone(c,'handslot.l').add(c.heldShield);c.gear.push(c.heldShield);
 }else c.heldShield=null;
 c.visual.userData.design=role;c.visual.userData.bodySource='original-oathfire-skinned-geometry';
}
