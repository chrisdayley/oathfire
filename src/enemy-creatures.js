import * as T from 'three';
import {HEAD_LOD} from './head-mesh.js';
import {heroSurface} from './hero-surfaces.js';
import {form,cord,leaf,bead,foldedCloth,add} from './model-craft.js';

// Species changes rendering, not save IDs, attack mechanics, or collision size.
export const CREATURES={
 hollow:{family:'orc',skin:0x727b48,cloth:0x6c4436,title:'Ash-clan raider'},
 archer:{family:'goblin',skin:0x819253,cloth:0x4d5e3e,title:'Briar goblin archer'},
 runner:{family:'goblin',skin:0x759188,cloth:0x344b5b,title:'Raven goblin scout'},
 bomber:{family:'goblin',skin:0x9b9661,cloth:0x92502f,title:'Cinder goblin sapper'},
 longbow:{family:'goblin',skin:0x677952,cloth:0x303b44,title:'Blackfeather goblin hunter'},
 knight:{family:'orc',skin:0x69704f,cloth:0x703b37,title:'Ironjaw orc knight'},
 herald:{family:'orc',skin:0x73845f,cloth:0x80373c,title:'Red-banner orc herald'},
 reaver:{family:'orc',skin:0x8d6251,cloth:0x51292c,title:'Bloodscar orc reaver'},
 bulwark:{family:'ogre',skin:0x90836e,cloth:0x454f51,title:'Ironhide ogre bulwark'},
 brute:{family:'ogre',skin:0x9a8066,cloth:0x66402d,title:'Kiln ogre wallbreaker'},
 mortar:{family:'ogre',skin:0x86816e,cloth:0x524a35,title:'Bombard ogre'},
 mender:{family:'troll',skin:0x668c86,cloth:0x625e39,title:'Mossback troll mender'},
 warpriest:{family:'troll',skin:0x7a7295,cloth:0x593650,title:'Hex-crowned troll warpriest'},
 mage:{family:'wraith',skin:0x9baaaa,cloth:0x354445,title:'Grave caller'},
 wraith:{family:'wraith',skin:0xa1a6bd,cloth:0x59496d,title:'Mirror wraith'}
};
export const creatureWidth=id=>({goblin:.88,orc:1.15,ogre:1.5,troll:1.05,wraith:.92}[CREATURES[id]?.family]||null);
const anatomy=new T.BufferGeometry();anatomy.setAttribute('position',new T.Float32BufferAttribute(HEAD_LOD.positions,3));anatomy.setAttribute('uv',new T.Float32BufferAttribute(HEAD_LOD.uvs,2));anatomy.setIndex(HEAD_LOD.indices);anatomy.computeVertexNormals();
function harnessRibbon(g,points,m){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),positions=[],uv=[],indices=[];
 for(let i=0;i<=18;i++){const p=curve.getPoint(i/18),t=curve.getTangent(i/18),n=new T.Vector3(t.y,-t.x,0).normalize().multiplyScalar(.030);
  for(const [sign,z] of [[-1,.006],[1,.006],[-1,-.006],[1,-.006]]){positions.push(p.x+n.x*sign,p.y+n.y*sign,p.z+z);uv.push((sign+1)/2,i/18*2);}
  if(i<18){const k=i*4;for(const [a,b] of [[0,1],[1,3],[3,2],[2,0]])indices.push(k+a,k+b,k+4+a,k+b,k+4+b,k+4+a);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return add(g,geo,m,'Flat leather ogre load harness');
}
export function buildCreature(c,part){
 const d=CREATURES[c.design];if(!d)return null;
 const id=c.design,f=d.family,goblin=f==='goblin',ogre=f==='ogre',orc=f==='orc',troll=f==='troll',ghost=f==='wraith';
 const skin=new T.MeshStandardMaterial({color:d.skin,metalness:0,roughness:.84});
 skin.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 creatureSurface;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n creatureSurface=position;');shader.fragmentShader='varying vec3 creatureSurface;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float grain=sin(creatureSurface.x*113.)*sin(creatureSurface.y*147.)*sin(creatureSurface.z*131.);
 float mottling=sin(creatureSurface.x*21.+sin(creatureSurface.z*17.))*sin(creatureSurface.y*23.);
 diffuseColor.rgb*=.93+.075*mottling+.025*grain;
 `);};skin.customProgramCacheKey=()=> 'creature-hide-228';
 skin.color.multiplyScalar(.77);
 const cloth=heroSurface('cloth',d.cloth,{side:T.DoubleSide}),hide=heroSurface('leather',0x493b2d),iron=heroSurface('steel',ogre?0x555951:0x556168),edge=heroSurface('steel',0x9d8660),ivory=heroSurface('leather',0xc5bc96),dark=new T.MeshStandardMaterial({color:0x151b17,roughness:.9});
 const eye=new T.MeshStandardMaterial({color:ghost?0xb4dfff:0xdbb974,emissive:ghost?0x4986c5:0x77491e,emissiveIntensity:ghost?.9:.25,roughness:.4});
 c.materials.push(skin,cloth,hide,iron,edge,ivory,dark,eye);
 const head=part('head'),chest=part('chest'),spine=part('spine'),hips=part('hips');if(ogre)head.scale.set(1.16,1.12,1.10);
 const limb=ghost?cloth:skin;
 const bulge=(g,xyz,pos,m,name)=>{const o=add(g,new T.SphereGeometry(1,20,14),m,name);o.scale.set(...xyz);o.position.set(...pos);return o;};
 const plate=(g,points,pos,m=iron,name='Forged enemy armor')=>{const o=leaf(g,points,m,{name,depth:.012,bow:.016});o.position.set(...pos);return o;};
 const belt=(g,y,rx,rz,m=hide)=>form(g,[[y,rx,rz],[y+.037,rx,rz]],m,{sides:20,name:'Bound leather strap'});
 const tuft=(g,x,y,z,size,m=cloth)=>{const o=plate(g,[[-size*.25,0],[size*.25,0],[size*.35,-size*.7],[0,-size],[-size*.3,-size*.6]],[x,y,z],m,'Overlapping hide fringe');return o;};
 // Closed, overlapping surfaces cover all joints; flesh replaces every rib cage.
 form(hips,[[-.10,.155,.12],[.04,.18,.13],[.19,.155,.115]],skin,{name:'Creature pelvic anatomy'});
 form(spine,[[0,.153,.116],[.12,ogre?.215:.17,ogre?.17:.12],[.28,ogre?.228:.19,ogre?.19:.137]],skin,{name:'Continuous abdomen'});
 form(chest,[[-.16,ogre?.236:.18,ogre?.19:.125],[-.03,ogre?.26:.223,ogre?.21:.15],[.11,ogre?.249:.221,ogre?.182:.14],[.22,.123,.088]],skin,{name:'Sculpted creature torso'});
 form(chest,[[.17,ogre?.106:.076,ogre?.095:.075],[.33,ogre?.089:.068,ogre?.085:.072]],skin,{name:'Connected neck'});
 if(ogre)bulge(spine,[.23,.19,.12],[0,.12,.095],skin,'Ogre belly and abdominal mass');

 for(const [suffix,s]of [['l',1],['r',-1]]){
  const arm=part('upperarm'+suffix),fore=part('lowerarm'+suffix),hand=part('hand'+suffix),wrist=part('wrist'+suffix),thigh=part('upperleg'+suffix),shin=part('lowerleg'+suffix),foot=part('foot'+suffix);
  const w=ogre?1.35:orc?1.13:goblin?.88:1;
  
  form(arm,[[-.075,.015*w,.018*w],[-.035,.070*w,.073*w],[.08,.086*w,.085*w],[.17,.078*w,.078*w],[.31,.055*w,.055*w]],limb,{name:'Tapered muscular upper arm'});
  bulge(fore,[.054*w,.059,.055*w],[0,0,0],limb,'Closed elbow');
  form(fore,[[-.045,.059*w,.060*w],[.075,.066*w,.068*w],[.19,.047*w,.048*w],[.275,.037*w,.04*w]],limb,{name:'Tapered creature forearm'});
  bulge(wrist,[.039*w,.060,.035*w],[0,.025,0],skin,'Connected wrist');
  form(hand,[[-.03,.038*w,.032*w],[.04,.045*w,.035*w],[.105,.038*w,.025*w]],skin,{name:'Creature palm'});
  for(let i=0;i<4;i++)cord(hand,[[(i-1.5)*.019*w,.055,.017],[(i-1.5)*.020*w,.12,.032],[(i-1.5)*.018*w,.12,.059]],.009*w,skin,'Curled gripping finger');
  cord(hand,[[s*.039*w,.0,.0],[s*.059*w,.065,.031],[s*.034*w,.092,.043]],.011*w,skin,'Gripping thumb');
  form(thigh,[[-.04,.092*w,.087*w],[.13,.101*w,.09*w],[.3,.072*w,.07*w],[.455,.055*w,.056*w]],goblin||ghost?cloth:limb,{name:'Creature thigh'});
  bulge(shin,[.059*w,.059,.06*w],[0,.01,0],limb,'Knee continuity');
  form(shin,[[-.025,.057*w,.057*w],[.13,.073*w,.067*w],[.3,.047*w,.05*w],[.45,.045*w,.046*w]],limb,{name:'Tapered creature calf'});
  const shoe=new T.Group();shoe.rotation.x=-Math.PI*.75;foot.add(shoe);bulge(shoe,[.071*w,.065,.133],[0,.004,.065],goblin||ogre?skin:ghost?cloth:hide,'Anatomical foot');
  if(goblin||ogre)for(let j=0;j<3;j++)bulge(shoe,[.02*w,.025,.046],[(j-1)*.041*w,-.005,.172],ivory,'Creature toenail');
  for(const y of [.045,.17])belt(fore,y,(y<.1?.071:.058)*w,(y<.1?.073:.059)*w);belt(shin,.24,.059*w,.054*w);
  if(!ghost&&!goblin){plate(fore,[[-.054,0],[.054,0],[.045,.17],[0,.22],[-.047,.17]],[0,.02,-.076*w],iron,'Riveted forearm guard').rotation.y=Math.PI;for(const yy of [.05,.17])bead(fore,[0,yy,-.091*w],.006,edge);}
 }
 // Deform an anatomical mesh rather than using a sphere for the face.
 const face=anatomy.clone(),p=face.attributes.position;
 for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const lower=Math.max(0,1-y/.14),nose=Math.exp(-Math.pow(x/.024,2)-Math.pow((y-.08)/.045,2));x*=goblin?1.13:ogre?1.40:orc?1.18:troll?1.05:1;y=y*(ogre?.93:troll?1.16:1.02);z+=nose*(goblin?.073:troll?.047:ogre?.02:.016);if(orc||ogre)z+=lower*.032;p.setXYZ(i,x,y,z);}face.computeVertexNormals();add(head,face,skin,'Sculpted '+f+' face');
 for(const s of [-1,1]){
  bulge(head,[.019,.010,.013],[s*.041,.114,.125],dark,'Recessed eye socket');bulge(head,[.006,.005,.004],[s*.041,.114,.138],eye,'Creature eye');
  cord(head,[[s*.013,.128,.144],[s*.045,.144,.143],[s*.08,.140,.122]],goblin?.010:ogre?.023:.014,skin,'Heavy brow ridge');
  if(goblin||troll||orc){const ear=plate(head,[[0,.044],[s*.045,.066],[s*(goblin?.15:.10),.10],[s*.108,.028],[s*.066,-.013],[0,-.026]],[s*.097,.092,-.005],skin,'Long pointed '+f+' ear');const inner=plate(head,[[0,.025],[s*(goblin?.11:.06),.065],[s*.049,-.01]],[s*.11,.096,.016],skin,'Recessed ear interior');}
  else bulge(head,[.031,.049,.032],[s*.125,.105,0],skin,'Ogre ear');
  if(orc||ogre||troll)cord(head,[[s*.057,.004,.128],[s*.067,.036,.170],[s*.072,.082,.172]],ogre?.013:.010,ivory,'Upward jaw tusk');
 }
 cord(head,[[-.046,.020,.141],[0,.011,.16],[.046,.020,.141]],.004,dark,'Mouth seam');
 belt(hips,.10,.184,.145);plate(hips,[[-.037,.027],[.037,.027],[.037,-.025],[-.037,-.025]],[0,.137,.15],edge,'Belt buckle');
 for(let j=0;j<5;j++)tuft(hips,(j-2)*.069,-.015,.137,.26+(j%2)*.06,cloth);
 // Roles add functional, readable silhouette differences within each species.
 if(goblin){
  form(spine,[[0,.16,.126],[.15,.18,.137],[.28,.207,.148]],hide,{name:'Fitted jerkin waist'});
  form(chest,[[-.16,.186,.133],[-.025,.225,.159],[.105,.221,.151],[.18,.159,.102]],hide,{sides:24,name:'Fitted goblin leather jerkin'});
  for(const side of [-1,1]){cord(chest,[[side*.17,.14,.137],[side*.17,-.02,.172],[side*.14,-.14,.149]],.004,edge,'Jerkin stitched seam');for(let j=0;j<5;j++)bead(chest,[side*.145,.11-j*.05,.175],.004,edge,'Jerkin fastening');}
  foldedCloth(chest,[[.12,.228,.151],[.23,.135,.09]],cloth,'Goblin shoulder shawl',10);
  for(const s of [-1,1])cord(chest,[[s*.17,.19,.085],[-s*.11,-.15,.155]],.019,hide,'Scavenged harness');
  if(id==='bomber'){for(const s of [-1,1])for(let j=0;j<2;j++){const pos=[s*.185,-.04-j*.115,.13];bulge(hips,[.058,.059,.058],pos,iron,'Iron powder bomb');cord(hips,[[pos[0],pos[1]+.05,pos[2]],[pos[0]+.025,pos[1]+.105,pos[2]]],.005,ivory,'Bomb fuse');bead(hips,[pos[0]+.025,pos[1]+.105,pos[2]],.009,eye,'Smoldering fuse');}form(head,[[.175,.135,.13],[.24,.12,.10],[.29,.035,.036]],hide,{name:'Sapper leather cap'});for(const s of [-1,1]){const rim=add(head,new T.TorusGeometry(.033,.008,6,16),edge,'Soot goggles');rim.position.set(s*.044,.162,.145);}}
  else {form(head,[[.16,.13,.13],[.26,.102,.094],[.31,.03,.024]],cloth,{start:.9,arc:Math.PI*2-1.8,name:'Goblin scout hood'});if(id!=='runner'){const quiver=form(chest,[[-.25,.06,.06],[.26,.065,.065]],hide,{name:'Hunter quiver'});quiver.position.set(.16,0,-.21);for(let j=0;j<5;j++){cord(chest,[[.13+j*.016,-.14,-.21],[.10+j*.016,.43,-.23]],.003,edge,'Spare arrow');tuft(chest,.1+j*.016,.43,-.23,.09,cloth);}}if(id==='longbow')for(let j=0;j<5;j++)tuft(head,.08+j*.012,.38-j*.018,-.03-j*.025,.16,dark);}
 }else if(orc){
  if(id==='knight'||id==='herald'){form(chest,[[-.14,.19,.14],[.02,.238,.173],[.15,.224,.14],[.21,.13,.09]],iron,{sides:20,name:'Orc hammered cuirass'});for(let j=0;j<3;j++)belt(spine,.05+j*.055,.18+j*.007,.139,iron);}
  for(const s of [-1,1]){const a=part('upperarm'+(s>0?'l':'r'));for(let j=0;j<(id==='hollow'?1:3);j++)form(a,[[-.05+j*.05,.072,.076],[j*.05,.12,.113],[.095+j*.05,.107,.104]],id==='reaver'?hide:iron,{sides:12,name:'Asymmetric orc shoulder plate'});}
  if(id==='reaver'){for(let j=-2;j<=2;j++)cord(head,[[j*.014,.22,.04],[j*.015,.35,-.015],[j*.015,.33,-.10]],.014,cloth,'Berserker red crest');for(const s of [-1,1])cord(chest,[[s*.05,.12,.151],[s*.13,-.02,.17],[s*.10,-.09,.15]],.006,cloth,'Bloodscar war paint');}
  if(id==='knight'){form(head,[[.16,.14,.139],[.26,.12,.115],[.32,.025,.027]],iron,{name:'Open orc warhelm'});plate(head,[[-.11,.075],[.11,.075],[.09,-.025],[-.09,-.025]],[0,0,.17],iron,'Riveted iron jaw guard');}
  if(id==='herald'){cord(chest,[[-.22,-.17,-.19],[-.22,.98,-.19]],.018,hide,'War banner mast');const banner=plate(chest,[[0,0],[.48,0],[.43,-.61],[.24,-.52],[.06,-.65]],[ -.22,.90,-.2],cloth,'Torn red clan banner');for(const s of [-1,1])cord(chest,[[.015+s*.10,.71,-.17],[.015,.51,-.17],[.015+s*.10,.4,-.17]],.013,ivory,'Clan banner mark');}
 }else if(ogre){
  for(const s of [-1,1]){harnessRibbon(chest,[[s*.20,.2,.13],[s*.12,.10,.25+(s>0?.013:0)],[-s*.04,-.015,.266+(s>0?.013:0)],[-s*.15,-.14,.251]],hide);const a=part('upperarm'+(s>0?'l':'r'));form(a,[[-.07,.11,.11],[0,.18,.165],[.16,.155,.15]],iron,{sides:10,name:'Ogre riveted shoulder slab'});for(let j=0;j<4;j++)bead(a,[.125,.025+j*.03,-.12],.009,edge);}
  if(id==='brute'){plate(chest,[[-.17,.13],[.17,.13],[.19,-.13],[0,-.21],[-.19,-.13]],[0,0,.206],iron,'Wallbreaker impact breastplate');for(let j=0;j<4;j++)cord(chest,[[-.14,.08-j*.059,.24],[.14,.08-j*.059,.24]],.008,edge,'Reinforced impact ribs');}
  if(id==='mortar'){const gun=form(chest,[[-.1,.10,.10],[.5,.12,.12],[.58,.145,.145]],iron,{sides:20,name:'Ogre bombard barrel'});gun.position.set(.20,.08,-.25);gun.rotation.x=.45;const bore=add(chest,new T.CircleGeometry(.10,20),dark,'Dark cannon bore');bore.rotation.x=-Math.PI/2+.45;bore.position.set(.20,.60,.045);for(let j=0;j<3;j++)bulge(hips,[.065,.065,.065],[-.20,-.06-j*.1,.13],iron,'Bombard ammunition');}
  if(id==='bulwark'){form(head,[[.17,.157,.15],[.26,.136,.125],[.30,.07,.07]],iron,{name:'Ogre reinforced skullcap'});for(let j=0;j<3;j++)belt(chest,-.10+j*.095,.25,.198,iron);}
 }else if(troll){
  foldedCloth(chest,[[.08,.25,.18],[.2,.21,.14],[.27,.095,.075]],cloth,'Troll hide mantle',14);
  for(const s of [-1,1])for(let j=0;j<5;j++)tuft(chest,s*(.10+j*.033),.17-j*.019,.16-j*.01,.19,id==='mender'?hide:cloth);
  for(let j=-3;j<=3;j++){const s=j<0?-1:1;cord(head,[[j*.025,.23,-.012],[j*.042,.34,-.055],[j*.048+s*.025,.40-Math.abs(j)*.013,-.09]],.011,ivory,'Shaman bone crown');}
  for(const s of [-1,1])cord(chest,[[s*.16,.19,.11],[s*.13,-.07,.17],[0,-.15,.18]],.007,ivory,'Troll fetish necklace');for(let j=-2;j<=2;j++)bead(chest,[j*.045,-.11+Math.abs(j)*.025,.187],.017,ivory,'Carved bone talisman');
  }else if(ghost){
  foldedCloth(chest,[[.22,.13,.095],[.13,.235,.166],[-.08,.212,.156],[-.34,.183,.15]],cloth,'Spectral continuous robe');
  const robe=foldedCloth(hips,[[.15,.184,.15],[-.28,.255,.20],[-.64,.285,.22],[-.94,.285,.23]],cloth,'Torn spectral lower robes',14);
  const rp=robe.geometry.attributes.position;for(let i=0;i<rp.count;i++)if(rp.getY(i)<-.90)rp.setY(i,rp.getY(i)+.055*(1+Math.sin(rp.getX(i)*64)));robe.geometry.computeVertexNormals();
  for(const side of ['l','r']){form(part('upperarm'+side),[[-.07,.022,.024],[.03,.101,.10],[.29,.079,.079]],cloth,{name:'Spectral shoulder sleeve'});foldedCloth(part('lowerarm'+side),[[-.035,.065,.069],[.11,.075,.073],[.26,.09,.084]],cloth,'Spectral bell sleeve');}
  form(head,[[-.02,.11,.13],[.15,.15,.16],[.30,.08,.10],[.38,.006,.03]],cloth,{start:.80,arc:Math.PI*2-1.6,name:'Spectral pointed hood'});
  for(const s of [-1,1])plate(chest,[[-.052,.19],[.055,.19],[.12,-.56],[.034,-.8],[-.065,-.65]],[s*.145,0,.16],cloth,'Torn specter vestment');
  if(id==='wraith'){plate(head,[[-.092,.17],[0,.22],[.092,.17],[.076,.02],[0,-.017],[-.076,.02]],[0,0,.145],iron,'Faceted mirror mask');for(const s of [-1,1])cord(head,[[s*.018,.117,.178],[s*.07,.13,.173]],.007,eye,'Mirror eye slit');}
 }
 c.visual.userData.creature={family:f,design:id,version:228};c.visual.userData.completeHead=true;
 return {family:f,cloak:ghost||troll};
}
