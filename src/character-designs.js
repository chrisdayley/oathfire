import {CREATURES,buildCreature,creatureWidth} from './enemy-creatures.js';
import {fitTroopPart} from './troop-identity.js';
import {attachHeroCape} from './hero-cape.js';
import {heroPhysique,fitHeroPart,attachHeroAnatomy} from './hero-physique.js';
import {prepareHeroJointFoundation,attachHeroJointFoundation} from './hero-joint-foundation.js';
import {armorStyle} from './equipment-style.js';
import {decorateArmor} from './equipment-visuals.js';
import {dressHost} from './host-atelier.js';
import {buildLiving,textile} from './atelier.js';
import {armorDefinition,armorKind} from './armor.js';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {material} from './materials.js';
import {mesh,box,cyl,beam,sunBadge,compactRigid,weapon,shield,equipmentShield} from './art.js';

export const HOST_DESIGNS={
 runner:{name:'Raven goblin scout',subtitle:'Fast assault scout',description:'A lean blue-green goblin scout with a low hood and light harness. Runs ahead of the host. Slows and pikes interrupt its rush.',color:0x364348,base:'archer'},
 bomber:{name:'Cinder goblin sapper',subtitle:'Timed explosives',description:'An ochre goblin sapper wearing soot goggles and iron bombs on its belt. Move out of its marked blast zones and eliminate it from range.',color:0x745135,base:'hollow'},
 herald:{name:'Red-banner orc herald',subtitle:'Damage and speed aura',description:'An armored orc carrying the red clan standard high over its shoulders. Strengthens nearby allies; focus the banner carrier first.',color:0x7b3432,base:'knight'},
 longbow:{name:'Blackfeather goblin hunter',subtitle:'Long range marksman',description:'A dark-green goblin hunter with black feathers and an oversized bow. Its long-range volleys threaten wall troops; use cavalry or assassins.',color:0x30343c,base:'archer'},
 bulwark:{name:'Ironhide ogre bulwark',subtitle:'Frontal shield tank',description:'A thickset ogre wearing reinforced body bands and a skullcap. Its immense shield protects its front. Flank it or use charged attacks.',color:0x43524f,base:'knight'},
 mender:{name:'Mossback troll mender',subtitle:'Enemy healer',description:'A blue-green troll shaman wearing a moss-colored hide mantle, bone crown and fetish necklace. Heals nearby enemies; prioritize this support.',color:0x607e67,base:'mage'},
 reaver:{name:'Bloodscar orc reaver',subtitle:'Wounded berserker',description:'A red-crested orc berserker with exposed scarred muscles and leather shoulder guards. Enrages below half health; finish it decisively.',color:0x74352f,base:'knight'},
 mortar:{name:'Bombard ogre',subtitle:'Long range bombardment',description:'A grey-skinned ogre carrying a heavy bombard and iron shot. Red circles warn of explosive shells. Fast troops can close its firing distance.',color:0x514d43,base:'brute'},
 wraith:{name:'Mirror wraith',subtitle:'Phasing duelist',description:'A pale spirit concealed by a faceted mirror mask and torn violet vestments. Watch the arrival ring before its blink attack.',color:0x6b5a80,base:'mage'},
 warpriest:{name:'Hex-crowned troll warpriest',subtitle:'Armored support commander',description:'A violet troll elder with a tall bone crown and purple ceremonial mantle. Shields and heals its escort. Eliminate it before the frontline.',color:0x584970,base:'mage'},
 regent:{name:'The Glass Regent',subtitle:'Captain of the winter cities',description:'A crown of tall frostglass shards rises from a silver mask. His mirrored armor catches the violet light of imprisoned beacons.',color:0x7592ad,base:'veyr'},
 hollowking:{name:'The Hollow King',subtitle:'The first broken promise',description:'A charred antler crown surrounds a caged ember. Black layered plate and an enormous golden reliquary mark the final keeper.',color:0x2b202d,base:'castellan'},
 hollow:{name:'Ash-clan raider',subtitle:'Levy of the Hollow Host',description:'A tusked ash-clan orc in scavenged leather and one iron shoulder guard. An inexpensive frontline attacker; cut it down before it reaches the walls.',color:0x746450},
 archer:{name:'Briar goblin archer',subtitle:'Hollow bowman',description:'A green-skinned goblin with long ears, a patched hood and a packed arrow quiver. Fragile ranged support; close the distance or send fast troops.',color:0x424844},
 knight:{name:'Ironjaw orc knight',subtitle:'Armored line breaker',description:'A broad-jawed orc with an open iron helm, jaw guard and hammered cuirass. Use armor-piercing attacks against its heavy protection.',color:0x313b3d},
 mage:{name:'Grave caller',subtitle:'Keeper of stolen voices',description:'A pale spectral grave caller under a pointed mourning hood. Its lantern staff channels stolen magic. Fragile beneath its robes.',color:0x303c37},
 brute:{name:'Kiln ogre wallbreaker',subtitle:'Walking siege furnace',description:'A massive, tusked kiln ogre with a scarred belly, crossed load harness and ribbed impact plate. Built to batter walls; concentrate heavy ranged fire.',color:0x493a30},
 bell:{name:'The Bell Knight',subtitle:'Captain of the first march',description:'An inverted bronze bell forms its helm. A ribbed cuirass, chained relics and a processional glaive announce its approach.',color:0x66533b},
 castellan:{name:'The Ash Castellan',subtitle:'Lord of the burnt strongholds',description:'Overlapping basalt plates, a furnace mask and a broken corona. Glowing seams cut through a charred ceremonial mantle.',color:0x4c302a},
 veyr:{name:'Marshal Veyr',subtitle:'The oath that broke the March',description:'An elongated crown and a ruined sun halo rise above tarnished royal armor. His torn black cloak carries the kingdom’s extinguished light.',color:0x293337}
};
for(const [id,creature] of Object.entries(CREATURES))HOST_DESIGNS[id].species=creature.family;
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
 const wide=creatureWidth(c.design)??(c.design==='brute'?1.48:['giant','breaker','castellan'].includes(c.design)?1.2:c.design==='ashwright'?1.06:c.design==='ranger'?.97:1);
 const set=(id,x,y,z=0)=>{const b=bone(c,id);if(b){b.position.set(x,y,z);b.scale.set(1,1,1);}};
 const hips=bone(c,'hips');if(hips){const raw=hips.position.clone();hips.position.set(raw.x*.5,1.02+(raw.y-.4056634)*.45,raw.z*.5);hips.scale.set(wide,1,1);}
 set('spine',0,.16);set('chest',0,.27);set('head',0,heroPhysique(c)?.245:.285);if(c.design==='brute'&&!creatureWidth(c.design))bone(c,'head').scale.x=.74;
 for(const [suffix,side]of [['l',1],['r',-1]]){
  set('upperleg.'+suffix,(heroPhysique(c)?.128:.14)*side,.02);set('lowerleg.'+suffix,0,.44);set('foot.'+suffix,0,.425);set('toes.'+suffix,0,.17);
  set('upperarm.'+suffix,(heroPhysique(c)?.shoulder||.245)*side,.13);set('lowerarm.'+suffix,0,.305);set('wrist.'+suffix,0,.255);set('hand.'+suffix,0,.055);set('handslot.'+suffix,0,.063,-.026);
 }
}

export function buildAppearance(c){
 const armor=c.armor?armorDefinition(c.armor):null,kind=c.armor?armorKind(c.armor):null,light=['trail','spellweave','dawn'].includes(kind),plus=c.armor?.plus||0;
 const variant=c.design,role=HOST_DESIGNS[variant]?.base||variant,rank=c.armor&&!c.enemy?armorStyle(c.armor).rank:c.rank,undead=!!HOST_DESIGNS[variant],bare=role==='hollow'||role==='archer',caster=role==='mage',brute=role==='brute',royal=['bell','castellan','veyr'].includes(role),hood=(kind&&kind!=='hearth')?light:['ranger','bow','rider','archer','mage','marksman','assassin','frost','pyre','lantern'].includes(role);
 const charcoal=material('steel',undead?0x55594f:0x737e7c,{roughness:.72,metalness:.84});
 const steel=material(kind==='trail'?'leather':kind==='spellweave'?'cloth':'steel',armor?armor.steel:role==='castellan'?0x504038:role==='veyr'?0x65716d:undead?0x444c47:0x949f9e,{roughness:light?.85:.54,metalness:light?.18:.88});
 const brass=material('steel',armor?armor.trim:undead?0x9a7645:0xb59b60,{roughness:.52,metalness:.78});
 const leather=material('leather',undead?0x74634d:0x746858,{roughness:.92,metalness:0});
 const cloth=material('cloth',armor?armor.cloth:undead?(HOST_DESIGNS[variant]?.color||0x3b4036):['ashwright','breaker'].includes(role)?0x6c4d31:['banner','engineer','assassin','pyre','marksman','frost','dawn','lantern'].includes(role)?c.color:0x102d34,{side:T.DoubleSide,roughness:1});
 const boneMat=material('stone',0xa19a80,{normalScale:new T.Vector2(.13,.13),roughness:1});
 const black=new T.MeshStandardMaterial({color:0x090e10,roughness:.94});
 const glow=new T.MeshStandardMaterial({color:kind==='ember'?0xffac48:kind==='spellweave'?0x9ac6ea:role==='brute'||role==='castellan'?0xff8535:0x85c9b1,emissive:kind==='ember'?0xce5520:kind==='spellweave'?0x568cb4:role==='brute'||role==='castellan'?0xed4a10:0x519f80,emissiveIntensity:1.6,roughness:.6});
 const mats=[charcoal,steel,brass,leather,cloth,boneMat,black,glow];c.materials.push(...mats);
 const pieces=[],part=id=>{const b=bone(c,id);if(!b)return new T.Group();const g=new T.Group();fitHeroPart(c,id,g);fitTroopPart(c,id,g);b.add(g);pieces.push({bone:b,group:g});return g;};
 let living=null;const creature=undead?buildCreature(c,part):null;
 if(!undead){living=buildLiving(c,part);}else if(!creature){
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
 if(!brute&&!bare){const skirt=new T.PlaneGeometry(.30,role==='mage'||kind==='spellweave'||kind==='dawn'?.85:.46,8,10),p=skirt.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setXYZ(i,p.getX(i)*(1+(.25-y)*.20),y,Math.sin(p.getX(i)*42)*.012);}skirt.computeVertexNormals();const tab=mesh(skirt,cloth,hips,0,-(role==='mage'||kind==='spellweave'||kind==='dawn'?.44:.27),.156);tab.rotation.x=-.10;if(!undead){const sigil=sunBadge(hips,.073,brass);sigil.position.set(0,-.25,.178);}}
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
   const cap=mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*.53),steel,arm,0,.014,0);cap.scale.set(light?.105:.127,light?.060:.096,light?.103:.129);cap.rotation.z=Math.PI;const count=light?1:rank>=3||undead?3:2;for(let i=0;i<count;i++)loft(arm,[[.010+i*.049,.125-i*.009,.126-i*.009],[.085+i*.049,.110-i*.009,.108-i*.009]],i===0?steel:charcoal,18);
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
  // Forged sallets and burial masks are supplied by dressHost.
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
 if(role==='archer'||['ranger','bow','rider','marksman'].includes(role)){
  const quiver=cyl(chest,.065,.055,.52,[.19,-.03,-.19],leather,12);quiver.rotation.z=-.20;
  for(let i=0;i<6;i++){beam(chest,[.16+i*.012,-.04,-.19],[.12+i*.02,.48+(i%3)*.025,-.20],.007,charcoal,6);const f=box(chest,[.036,.09,.007],[.12+i*.02,.42+(i%3)*.025,-.20],boneMat);f.rotation.z=-.1;}
  strip(chest,[[-.22,.17,.08],[0,.02,.166],[.18,-.15,.11]],.021,leather);
 }
 if(role==='ashwright'||role==='breaker'||role==='giant'||role==='engineer'){
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
  for(const side of [-1,1]){const a=part('upperarm.'+(side<0?'r':'l'));const shoulder=mesh(new T.IcosahedronGeometry(1,1),charcoal,a,0,.035,0);shoulder.scale.set(.12,.12,.12);for(let i=0;i<3;i++){const nail=mesh(new T.ConeGeometry(.038,.15,5),steel,a,side*.10,.02+i*.065,-.13);nail.rotation.x=-.8;}}
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
 // Regiment silhouettes: visible equipment explains each specialist's role.
 if(role==='banner'){
  beam(chest,[-.18,-.2,-.2],[-.18,1.2,-.2],.022,brass);beam(chest,[-.48,1.04,-.2],[.22,1.04,-.2],.019,brass);const flag=mesh(new T.PlaneGeometry(.62,.72,4,5),cloth,chest,-.13,.63,-.22);const badge=sunBadge(chest,.15,brass);badge.position.set(-.13,.66,-.198);for(let i=0;i<rank;i++)box(chest,[.035,.055,.012],[-.39+i*.057,.26,-.2],brass);
 }
 if(role==='engineer'){
  box(chest,[.38,.42,.20],[0,-.01,-.29],leather);for(const x of [-.14,.14])box(chest,[.035,.46,.24],[x,0,-.28],brass);beam(chest,[-.28,.28,-.31],[.23,-.22,-.31],.025,charcoal);box(chest,[.22,.08,.09],[-.25,.26,-.31],steel);for(let i=0;i<3;i++)cyl(hips,.035,.035,.19,[.20,-.01-i*.035,.05+i*.06],brass,8);const visor=box(head,[.25,.055,.025],[0,.19,.146],brass);for(const x of [-.065,.065])ellipsoid(head,[.042,.032,.012],[x,.19,.169],black);
 }
 if(role==='assassin'){
  for(const x of [-.18,.18]){beam(chest,[x,.16,.10],[-x,-.16,.13],.022,leather);box(hips,[.045,.30,.04],[x,-.14,.1],charcoal);}for(const side of [-1,1]){const a=part('lowerarm.'+(side<0?'r':'l'));mesh(new T.ConeGeometry(.025,.29,4),steel,a,0,.13,-.075);}box(head,[.15,.08,.025],[0,.05,.14],cloth);
 }
 if(role==='marksman'){
  cyl(chest,.05,.05,.44,[-.20,.04,-.22],brass,12);const lens=ellipsoid(head,[.045,.025,.014],[-.048,.145,.143],black);ring(head,.17,.17,.18,.014,leather);for(let i=0;i<5;i++)box(chest,[.012,.12,.018],[-.08+i*.04,-.08,.164],brass);
 }
 if(role==='frost'||role==='pyre'||role==='lantern'){
  const elemental=new T.MeshStandardMaterial({color:role==='frost'?0xa3dae7:role==='pyre'?0xe0a473:0xe1d0a0,emissive:role==='frost'?0x2e718e:role==='pyre'?0xa5411d:0x897240,emissiveIntensity:.75});c.materials.push(elemental);for(const x of [-.12,.12]){const shard=mesh(new T.OctahedronGeometry(.039,0),elemental,head,x,.23,.065);shard.scale.y=2;}for(let i=0;i<3;i++)cyl(hips,.028,.028,.17,[.20+i*.017,-.1,.045+i*.055],role==='frost'?elemental:brass,8);loft(chest,[[.11,.245,.16],[.23,.14,.10]],cloth,18);const book=box(hips,[.16,.22,.065],[-.21,-.08,.12],leather);box(hips,[.12,.017,.07],[-.21,-.08,.13],brass);
 }
 if(role==='dawn'){
  const halo=mesh(new T.TorusGeometry(.22,.012,6,32),brass,head,0,.18,-.12);for(const side of [-1,1])for(let i=0;i<3;i++){const wing=mesh(new T.ConeGeometry(.033,.20-i*.035,5),brass,chest,side*(.24+i*.042),.22-i*.018,0);wing.rotation.z=-side*.55;}const badge=sunBadge(chest,.09,brass);badge.position.set(0,.05,.19);
 }
 // Armor silhouettes are bound to the same animated skeleton as the body.
 if(kind==='bastion'){
  loft(chest,[[.08,.255,.17],[.24,.18,.12],[.31,.155,.10]],charcoal,18);
  for(const side of [-1,1]){const shoulder=part('upperarm.'+(side<0?'r':'l'));for(let j=0;j<4;j++)loft(shoulder,[[j*.045-.015,.16-j*.01,.15-j*.008],[j*.045+.045,.15-j*.01,.14-j*.008]],j%2?steel:charcoal,16);for(let j=0;j<3;j++)strip(chest,[[side*(.05+j*.05),-.13,.15],[side*(.07+j*.05),.04,.177],[side*(.06+j*.04),.19,.13]],.009,brass);}
 }
 if(kind==='trail'){
  for(const side of [-1,1])strip(chest,[[side*.20,.18,.08],[-side*.17,-.12,.14]],.023,leather);
  for(const side of [-1,1]){const bag=box(hips,[.12,.15,.08],[side*.205,.015,.08],leather);bag.rotation.z=side*.12;box(hips,[.075,.025,.018],[side*.21,.06,.13],brass);}
  for(let j=0;j<3;j++)cyl(chest,.026,.028,.13,[.12+j*.04,-.06+j*.05,.18],brass,8);
 }
 if(kind==='spellweave'){
  loft(chest,[[.12,.24,.16],[.24,.155,.115],[.32,.13,.09]],cloth,18);
  for(const side of [-1,1]){strip(chest,[[side*.22,.15,.10],[side*.18,-.10,.155]],.014,brass);const crystal=mesh(new T.OctahedronGeometry(.045,0),glow,chest,side*.19,.06,.165);crystal.scale.y=1.8;}
  for(let j=0;j<5;j++){const a=j/5*Math.PI*2;ellipsoid(chest,[.012,.017,.012],[Math.sin(a)*.068,.03+Math.cos(a)*.068,.185],glow);}
 }
 if(kind==='ember'){
  for(const side of [-1,1])for(let j=0;j<3;j++)strip(chest,[[side*.05,-.11+j*.07,.175],[side*.13,-.07+j*.07,.165],[side*.17,-.04+j*.07,.13]],.008,glow);
  for(const suffix of ['l','r']){const a=part('upperarm.'+suffix);for(let j=0;j<3;j++)loft(a,[[j*.055,.139-j*.012,.14-j*.013],[j*.055+.035,.13-j*.012,.13-j*.013]],brass,12);}
 }
 if(kind==='dawn'){
  loft(chest,[[.105,.245,.165],[.23,.15,.105]],cloth,20);ring(chest,.244,.166,.105,.012,brass);
  const medallion=sunBadge(chest,.09,brass);medallion.position.set(0,.01,.195);
  for(const side of [-1,1]){strip(chest,[[side*.15,.21,.09],[side*.13,-.13,.166]],.018,brass);for(let j=0;j<3;j++){const bead=mesh(new T.TorusGeometry(.016,.005,5,12),brass,hips,side*.17,-.12-j*.032,.16);bead.rotation.y=j%2*Math.PI/2;}}
 }
 if(kind==='marshal'){
  const mantle=loft(chest,[[.09,.257,.168],[.20,.20,.13]],cloth,20);mantle.rotation.z=.045;
  beam(chest,[-.18,-.15,-.24],[-.18,.58,-.24],.013,brass);const flag=mesh(new T.PlaneGeometry(.20,.33,3,5),cloth,chest,-.065,.36,-.24);const sigil=sunBadge(chest,.056,brass);sigil.position.set(-.065,.37,-.225);
  for(let j=0;j<4;j++)strip(chest,[[-.16,.12-j*.024,.15],[0,.075-j*.024,.183],[.16,.12-j*.024,.15]],.006,brass);
 }
 if(c.armor){
  // Each forge rank adds a metal seal; +3/+6/+10 also change the construction.
  for(let j=0;j<plus;j++){const a=(j-4.5)*.22;ellipsoid(chest,[.009,.012,.007],[Math.sin(a)*.13,-.055-Math.cos(a)*.065,.187],brass);}
  if(plus>=3)for(const side of [-1,1])strip(chest,[[side*.20,.16,.10],[side*.20,.01,.16],[side*.14,-.13,.14]],.008,brass);
  if(plus>=6)for(const suffix of ['l','r']){const a=part('upperarm.'+suffix);ring(a,light?.109:.137,light?.107:.139,.035,.009,brass);}
  if(plus>=10){const gem=mesh(new T.OctahedronGeometry(.033,0),glow,chest,0,.055,.202);gem.scale.y=1.5;for(const side of [-1,1])strip(chest,[[0,.045,.194],[side*.055,.10,.174],[side*.075,.17,.14]],.006,brass);}
 }
 // Enemy silhouettes keep their own identifiers and equipment, even when sharing a rig.
 if(variant==='herald'){cyl(chest,.017,.017,1.35,[-.20,.36,-.19],charcoal,8);const flag=mesh(new T.PlaneGeometry(.52,.63,1,1),cloth,chest,-.44,.73,-.19);flag.rotation.y=.2;for(let j=0;j<3;j++)box(chest,[.025,.4,.013],[-.63+j*.16,.7,-.175],brass);}
 if(variant==='bomber')for(let j=0;j<3;j++){ellipsoid(hips,[.07,.085,.07],[.20,-.03-j*.10,.11],charcoal);cyl(hips,.008,.008,.07,[.20,.055-j*.10,.11],glow,6);}
 if(['runner','longbow'].includes(variant))for(const side of [-1,1])for(let j=0;j<4;j++){const feather=box(head,[.023,.22+j*.03,.065],[side*(.12+j*.027),.13,-.05-j*.035],charcoal);feather.rotation.z=-side*.6;}
 if(['mender','wraith','warpriest','regent','hollowking'].includes(variant)){const hue=new T.MeshStandardMaterial({color:variant==='mender'?0xb5d9a7:0xb5a1e4,emissive:variant==='mender'?0x4c8548:0x604387,emissiveIntensity:.7,metalness:.35,roughness:.3});c.materials.push(hue);for(const side of [-1,1])for(let j=0;j<(variant==='regent'?4:2);j++){const shard=mesh(new T.OctahedronGeometry(.042,0),hue,head,side*(.12+j*.033),.30+j*.07,-.03);shard.scale.y=3+j;}}
 if(variant==='reaver')for(const side of [-1,1]){const fin=mesh(new T.ConeGeometry(.055,.4,4),brass,chest,side*.28,.25,-.01);fin.rotation.z=-side*.5;}
 if(variant==='mortar'){cyl(chest,.095,.13,.66,[.29,.22,-.13],charcoal,12).rotation.x=1.1;cyl(chest,.115,.115,.07,[.29,.40,.17],brass,12).rotation.x=1.1;}
 }
 if(undead&&!creature)dressHost(c,part,role,{black,glow,bone:boneMat});else if(!undead)decorateArmor(c,part);
 // Bake rigid armor and anatomical pieces into a few genuinely skinned draw calls.
 c.visual.updateMatrixWorld(true);const skeleton=new T.Skeleton(Object.values(c.sockets).filter(b=>b.isBone));skeleton.calculateInverses();
 const foundation=prepareHeroJointFoundation(c,pieces,heroPhysique(c));
 const bins=new Map(),inverse=c.visual.matrixWorld.clone().invert();
 for(const piece of pieces){const index=skeleton.bones.indexOf(piece.bone);piece.group.traverse(o=>{if(!o.isMesh)return;if(foundation?.replaces(o.name)){if(!o.geometry.userData.shared)o.geometry.dispose();return;}const geo=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(inverse.clone().multiply(o.matrixWorld));const count=geo.attributes.position.count,indices=new Uint16Array(count*4),weights=new Float32Array(count*4);for(let i=0;i<count;i++){indices[i*4]=index;weights[i*4]=1;
 if(c.atelier&&o.userData.heroLegFollow){
  // Each rigid tasset lame follows the thigh as a hinged packet. Constant
  // weights preserve the plate shape while the small hip contribution keeps
  // the suspension beneath the fauld during a stride.
  const follow=o.userData.heroLegFollow,leg=skeleton.bones.indexOf(bone(c,follow.bone));
  if(leg>=0){const weight=Math.max(0,Math.min(1,follow.weight));indices[i*4+1]=leg;weights[i*4]=1-weight;weights[i*4+1]=weight;}
 }else if(c.atelier&&/Split leather coat|Ranked split mantle|Sculpted forge apron|Dawn stole|Marshal sash|Surcoat embroidered|Apron stitched|Hand-set garment rivet/.test(o.name)){
  const local=o.geometry.attributes.position,vertex=o.geometry.index?o.geometry.index.getX(i):i,yy=local.getY(vertex)+o.position.y,xx=local.getX(vertex)+o.position.x,drop=Math.max(0,-yy-(piece.bone.name==='chest'?.32:.08));
  const leg=skeleton.bones.indexOf(bone(c,xx>=0?'upperleg.l':'upperleg.r'));if(leg>=0){const follow=Math.min(.68,drop*1.6);indices[i*4+1]=leg;weights[i*4]=1-follow;weights[i*4+1]=follow;}
 }
}geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));if(!bins.has(o.material))bins.set(o.material,[]);bins.get(o.material).push(geo);if(!o.geometry.userData.shared)o.geometry.dispose();});piece.group.removeFromParent();}
 c.body=[];for(const [mat,geos]of bins){const geometry=mergeGeometries(geos,false);if(!geometry)throw Error('Character mesh merge failed');geos.forEach(g=>g.dispose());const body=new T.SkinnedMesh(geometry,mat);body.name='Oathfire_'+role+'_'+mat.uuid.slice(0,6);body.castShadow=body.receiveShadow=true;body.frustumCulled=false;c.visual.add(body);body.bind(skeleton);c.body.push(body);}
 attachHeroAnatomy(c,skeleton);
 attachHeroJointFoundation(c,skeleton,foundation);
 // Cloth silhouette is a tailored mantle, with a ragged hem for the Hollow Host.
 if(!attachHeroCape(c)&&!bare&&!brute&&(undead?(!creature||creature.cloak):living.profile.cloak)){const height=c.armor?.rarity===0?.72:kind==='trail'?.72:kind==='spellweave'||kind==='dawn'?1.35:caster?1.26:royal?1.36:rank>=7?1.28:living?.profile.ranger?.91:1.02,width=kind==='marshal'?.70:royal?.68:rank>=8?.72:.61,geo=new T.PlaneGeometry(width,height,12,18),p=geo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),drop=(height*.5-y)/height,x=p.getX(i);p.setXYZ(i,x*(.65+drop*.55),y,(Math.cos(x*29)*(.006+drop*.018)+Math.sin(drop*8+x*17)*.009*drop-.065*Math.min(1,drop*5)-drop*.045));if(undead&&drop>.94)p.setY(i,y+(Math.sin(x*90)+1)*.05);}geo.computeVertexNormals();const cm=(living?.cloth||cloth).clone();if(!undead&&(rank>=6||living.profile.hero&&(!c.armor||c.armor.rarity>=2))){cm.map=textile('heraldry','#'+new T.Color(c.atelier.clothHex).getHexString(),'#'+new T.Color(c.atelier.trimHex).getHexString());cm.color.setHex(0xffffff);}if(c.armor?.rarity>=5&&!undead){cm.emissive.setHex(armorStyle(c.armor).glow);cm.emissiveMap=textile('heraldry','#000000','#ffffff');cm.emissiveIntensity=.4;cm.userData.equipmentPulse=.4;}c.materials.push(cm);const cape=mesh(geo,cm,bone(c,'chest'),0,-height*.5+.19,heroPhysique(c)?-.21:-.205);cape.rotation.x=.15;c.cape=cape;c.capeBase=new Float32Array(geo.attributes.position.array);c.capeHeight=height;c.gear.push(cape);}
 c.held=compactRigid(weapon(c.weaponType,rank,c.color,c.temper,c.design,c.weaponItem));if(heroPhysique(c)&&['sword','hammer'].includes(c.weaponType))c.held.scale.multiplyScalar(.82);c.held.rotation.y=Math.PI;c.heldRest=c.held.quaternion.clone();bone(c,'handslot.r').add(c.held);c.gear.push(c.held);
 if(['sword','spear'].includes(c.weaponType)&&!caster&&!brute&&role!=='bell'&&role!=='assassin'){
  c.heldShield=compactRigid(c.shieldItem&&!undead?equipmentShield(c.shieldItem):shield(c.design==='warden'?Math.max(4,rank):rank,undead?0x343c38:(c.armor?.rarity===6?0x73889b:c.atelier?.clothHex||0x234b4d),undead?role:null));if(heroPhysique(c)&&c.shieldItem)c.heldShield.scale.multiplyScalar(.88);if(heroPhysique(c)&&!c.shieldItem){c.heldShield.scale.x=.82;c.heldShield.scale.y=.94;}if(variant==='bulwark')c.heldShield.scale.set(1.35,1.45,1.15);c.heldShield.rotation.y=Math.PI;c.heldShield.rotation.z=-Math.PI/2;c.heldShield.position.set(0,-.02,.05);bone(c,'handslot.l').add(c.heldShield);c.gear.push(c.heldShield);
 }else c.heldShield=null;
 c.visual.userData.design=role;c.visual.userData.armorKind=kind;c.visual.userData.bodySource=c.atelier?.source||'original-oathfire-skinned-geometry';
}
