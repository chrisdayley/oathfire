import * as T from 'three';
import {material} from './materials.js';
import {armorStyle,equipmentStyle,equipmentMagic} from './equipment-style.js';

const add=(g,geo,m,p=[0,0,0])=>{const o=new T.Mesh(geo,m);o.position.set(...p);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
const line=(g,points,r,m)=>add(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(8,points.length*4),r,6,false),m);
function plate(g,points,pos,m,depth=.012){const shape=new T.Shape();points.forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();return add(g,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:2,steps:1}),m,pos);}
function jewel(g,pos,size,m){const o=add(g,new T.OctahedronGeometry(size,0),m,pos);o.scale.set(.72,1.3,.45);return o;}
function rune(g,x,y,z,size,m){line(g,[[x-size*.5,y,z],[x,y+size,z],[x+size*.5,y,z],[x,y-size*.6,z],[x-size*.5,y,z]],.0035,m);line(g,[[x,y+size*.7,z],[x,y-size*.3,z]],.0025,m);}
function arc(g,pos,r,start,end,m,width=.008){const ps=[];for(let i=0;i<=28;i++){const a=start+(end-start)*i/28;ps.push([pos[0]+Math.sin(a)*r,pos[1]+Math.cos(a)*r,pos[2]]);}return line(g,ps,width,m);}
function lightMaterial(color,intensity=1){const m=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,metalness:.2,roughness:.3});m.userData.equipmentPulse=intensity;return m;}
let glowTexture;
function halo(g,pos,color,size,opacity=.2){
 if(!glowTexture){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,1,32,32,31);gr.addColorStop(0,'rgba(255,255,255,.8)');gr.addColorStop(.3,'rgba(255,255,255,.28)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);glowTexture=new T.CanvasTexture(c);glowTexture.userData.shared=true;}
 const m=new T.SpriteMaterial({map:glowTexture,color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});m.userData.equipmentHalo=opacity;
 const o=new T.Sprite(m);o.position.set(...pos);o.scale.setScalar(size);o.userData.keep=true;g.add(o);return o;
}
export function animateEquipment(root,time){
 if(!root)return;let cache=root.userData.equipmentEffects;
 if(!cache){const materials=new Set();root.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(m.userData.equipmentPulse||m.userData.equipmentHalo)materials.add(m);});cache=root.userData.equipmentEffects=[...materials];}
 for(const m of cache){if(m.userData.equipmentPulse)m.emissiveIntensity=m.userData.equipmentPulse*(.85+.15*Math.sin(time*2.2));if(m.userData.equipmentHalo)m.opacity=m.userData.equipmentHalo*(.8+.2*Math.sin(time*2.2));}
}

// Added before skinning, so every plate, inset and rune follows the existing body animation.
export function decorateArmor(c,part){
 if(!c.armor||c.enemy)return;
 const s=armorStyle(c.armor),r=s.tier;c.equipmentAppearance={rarity:r,armor:s.kind,rank:s.rank,glowing:r>=5};if(r<2)return;
 const steel=material('steel',s.metal,{metalness:.86,roughness:s.roughness}),gold=material('steel',s.trim,{metalness:.8,roughness:.32}),dark=material('steel',0x182631,{roughness:.5}),gem=lightMaterial(s.glow||({ember:0xdd7c39,trail:0x2e8962,spellweave:0x8564b1}[s.kind]||0x638fa8),s.glow?2.0:0);
 c.materials.push(steel,gold,dark,gem);
 const chest=part('chest'),hips=part('hips'),head=part('head');chest.scale.z*=c.design==='ashwright'?.95:.84;
 if(r>=2){
  for(const side of [-1,1]){
   line(chest,[[side*.025,-.14,.17],[side*.12,-.06,.187],[side*.195,.08,.145],[side*.155,.18,.115]],.006,gold);
   line(chest,[[side*.02,-.1,.18],[side*.10,-.04,.193],[side*.14,.08,.16]],.003,gold);
  }
  jewel(chest,[0,.035,.21],.036,gem);
 }
 if(r>=3){
  for(const side of [-1,1]){
   for(let j=0;j<r-1;j++){
    const p=plate(hips,[[-.058,.025],[.058,.025],[.067,-.045],[0,-.095],[-.068,-.045]],[side*.145,-.025-j*.043,.16+j*.008],j%2?steel:gold,.009);p.rotation.y=side*.18;
   }
   const fore=part('lowerarm.'+(side>0?'l':'r'));
   for(let j=0;j<3;j++)plate(fore,[[-.047,0],[0,-.025],[.047,0],[.035,.055],[-.035,.055]],[0,.035+j*.045,-.082],steel,.006);
   line(fore,[[0,.006,-.096],[0,.13,-.096],[0,.20,-.070]],.004,gold);
  }
  const crownY=c.design==='ranger'?.22:.17;
  line(head,[[-.097,crownY-.025,.06],[-.07,crownY,.107],[0,crownY+.007,.13],[.07,crownY,.107],[.097,crownY-.025,.06]],.006,gold);
  jewel(head,[0,crownY+.007,.14],.022,gem);
 }
 if(r>=4){
  // Open, swept wing plates give the shoulders a royal silhouette without hiding the arms.
  for(const side of [-1,1]){
   const arm=part('upperarm.'+(side>0?'l':'r'));
   for(let j=0;j<Math.min(5,r-1);j++){
    const length=.13+j*.027+(r-4)*.018,x=side*(.02+j*.033),z=-.135+j*.018;
    const fin=plate(arm,[[-.034,.07],[.027,.068],[.04,-length*.55],[.008,-length],[-.024,-length*.68]],[x,.008,z],j%2?steel:gold,.018);fin.rotation.z=-side*(.25+j*.10);
    line(arm,[[x,.073,z+.024],[x+side*.015,-length*.5,z+.024],[x,-length*.85,z+.024]],.0035,r>=5?gem:gold);
   }
   const shin=part('lowerleg.'+(side>0?'l':'r'));
   plate(shin,[[-.048,.015],[0,-.035],[.048,.015],[.03,.30],[0,.37],[-.03,.30]],[0,0,-.076],steel,.012);
   line(shin,[[0,-.018,-.1],[0,.17,-.094],[0,.34,-.08]],.005,r>=5?gem:gold);
   for(let j=0;j<3;j++)line(chest,[[side*.08,.15-j*.026,.15],[side*.11,.12-j*.026,.177],[side*.16,.15-j*.026,.145]],.004,gold);
  }
  arc(chest,[0,.04,.213],.075,0,Math.PI*2,gold,.004);
  for(let j=0;j<8;j++){const a=j*Math.PI/4;line(chest,[[Math.sin(a)*.085,.04+Math.cos(a)*.085,.207],[Math.sin(a)*.11,.04+Math.cos(a)*.11,.197]],.004,gold);}
 }
 if(r>=5){
  for(const side of [-1,1]){
   line(chest,[[side*.05,-.12,.196],[side*.075,.005,.214],[side*.04,.10,.19],[side*.12,.18,.12]],.006,gem);
   const fore=part('lowerarm.'+(side>0?'l':'r'));for(let j=0;j<3;j++)rune(fore,0,.03+j*.05,-.101,.021,gem);
   // Helmet crests remain open over the face for the Ashwright and ranger.
   const wing=plate(head,[[-.023,0],[.005,.105],[.063,.17],[.054,.065],[.025,-.024]],[side*.11,.15,-.075],gold,.012);wing.scale.x=side;
   line(head,[[side*.12,.16,-.05],[side*.14,.25,-.05],[side*.17,.31,-.05]],.005,gem);
  }
  jewel(chest,[0,.04,.235],.053,gem);
 }
 if(r===6){
  // A broken solar nimbus is visible above the shoulders from both camera directions.
  for(let i=0;i<6;i++){const a=i*Math.PI/3;arc(chest,[0,.30,-.25],.40,a+.09,a+.86,gold,.014);arc(chest,[0,.30,-.26],.435,a+.12,a+.83,gem,.006);}
  for(const side of [-1,1])for(let j=0;j<3;j++){
   const p=plate(chest,[[-.025,0],[.016,.16],[.035,.29],[.065,.22],[.025,-.035]],[side*(.23+j*.07),.17-j*.04,-.22],j%2?gold:steel,.012);p.rotation.z=-side*(.24+j*.18);
   jewel(chest,[side*(.23+j*.07),.29-j*.035,-.205],.021,gem);
  }
 }
 c.equipmentAppearance={rarity:r,armor:s.kind,rank:s.rank,glowing:r>=5};
}

function stretchWeapon(g,s,type){
 g.updateMatrixWorld(true);const inverse=g.matrixWorld.clone().invert();
 g.traverse(o=>{if(!o.isMesh)return;const local=inverse.clone().multiply(o.matrixWorld),back=local.clone().invert(),geometry=o.geometry.clone(),p=geometry.attributes.position,v=new T.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(local);if(type==='bow'){v.y*=1+(s.length-1)*.65;v.x=.23+(v.x-.23)*s.width;}else{const weight=Math.max(0,Math.min(1,(v.y-.10)/.24));v.y=v.y>.12?.12+(v.y-.12)*s.length:v.y;v.x*=1+(s.width-1)*weight;v.z*=1+(s.width-1)*weight;}v.applyMatrix4(back);p.setXYZ(i,v.x,v.y,v.z);}
  geometry.userData.shared=false;geometry.computeVertexNormals();geometry.computeBoundingSphere();if(!o.geometry.userData.shared)o.geometry.dispose();o.geometry=geometry;
 });
}
export function decorateWeapon(g,item){
 const s=equipmentStyle(item),r=s.tier,type=item.type,channels=equipmentMagic(item),color=channels[0]?.color||s.glow;
 const gold=material('steel',s.trim,{metalness:.85,roughness:s.roughness}),steel=material('steel',s.metal,{metalness:.86,roughness:s.roughness}),glow=lightMaterial(color||s.trim,color?(r>=5?2:.8):0);
 const tip=type==='sword'?1.04:type==='hammer'?.98:type==='spear'?1.57:1.5;
 if(r>=2){
  if(type==='bow')for(const side of [-1,1])line(g,[[.27,side*.19,.02],[.22,side*.49,.025],[.06,side*.72,.015]],.009,gold);
  else for(let j=0;j<Math.min(5,r+1);j++){const y=type==='sword'?.3+j*.085:tip-.20+j*.06;rune(g,0,y,type==='hammer'?.215:.042,type==='hammer'?.045:.023,gold);}
 }
 if(r>=3){
  if(type==='sword')for(const side of [-1,1]){
   plate(g,[[0,0],[side*.12,.035],[side*.28,.19],[side*.21,.17],[side*.11,.09]],[side*.04,.16,0],gold,.027);
   line(g,[[side*.012,.23,.04],[side*.042,.40,.04],[side*.031,.63,.04]],.005,gold);
  }
  else if(type==='bow')for(const side of [-1,1])for(let j=0;j<r-1;j++){
   plate(g,[[0,0],[.095,side*.035],[.035,side*.16],[-.02,side*.12]],[.22-j*.018,side*(.20+j*.085),.015],j%2?gold:steel,.014);
  }
  else if(type==='hammer')for(const side of [-1,1]){
   plate(g,[[-.09,-.13],[0,-.18],[.09,-.13],[.095,.14],[0,.18],[-.095,.14]],[side*.23,.95,.215],gold,.014);
   jewel(g,[side*.23,.96,.245],.065,glow);
  }
  else for(const side of [-1,1]){
   line(g,[[0,tip-.23,0],[side*.17,tip-.06,0],[side*.22,tip+.16,0],[side*.12,tip+.25,0]],.015,gold);
   jewel(g,[side*.17,tip+.02,.035],.035,glow);
  }
 }
 if(r>=4){
  if(type==='sword'){plate(g,[[-.07,.19],[-.088,.35],[-.063,.61],[0,.73],[.063,.61],[.088,.35],[.07,.19]],[0,0,-.012],steel,.03);line(g,[[0,.26,.038],[0,.72,.038],[0,.98,.031]],.007,color?glow:gold);}
  else if(type==='hammer'){for(const side of [-1,1])for(let j=0;j<3;j++)plate(g,[[0,-.035],[side*.14,0],[0,.035]],[side*.32,.85+j*.10,0],steel,.035);}
  else if(type==='bow')for(const side of [-1,1])jewel(g,[.19,side*.39,.05],.06,glow);
  else arc(g,[0,tip,.02],.23,-2.6,2.6,gold,.012);
 }
 if(r>=5){
  if(type==='sword')for(const side of [-1,1])line(g,[[side*.024,.27,.056],[side*.033,.50,.053],[side*.024,.87,.04],[0,1.11,.02]],.006,glow);
  else if(type==='bow')for(const side of [-1,1])line(g,[[.29,side*.17,.042],[.27,side*.38,.043],[.13,side*.64,.03],[.075,side*.83,.025]],.007,glow);
  else if(type==='hammer')for(const side of [-1,1])line(g,[[side*.33,.83,.25],[side*.18,.94,.25],[side*.32,1.08,.25]],.009,glow);
  else{line(g,[[0,.10,.045],[0,tip-.24,.045]],.008,glow);for(let j=0;j<3;j++)rune(g,0,tip-.4+j*.11,.05,.04,glow);}
 }
 if(r===6){
  if(type==='sword')for(const side of [-1,1])for(let j=0;j<3;j++)plate(g,[[0,0],[side*.05,.02],[side*.13,.13],[side*.018,.095]],[side*.058,.27+j*.095,.015],gold,.021);
  else if(type==='bow')for(const side of [-1,1])arc(g,[.15,side*.45,.04],.20,side>0?.4:3.5,side>0?2.7:5.8,glow,.006);
  else{arc(g,[0,tip,.05],type==='hammer'?.24:.31,.12,Math.PI*1.92,gold,.014);arc(g,[0,tip,.05],type==='hammer'?.28:.35,.5,Math.PI*1.77,glow,.006);}
 }
 // Size changes are baked around the grip, keeping the hand socket and animation intact.
 stretchWeapon(g,s,type);
 if(color){
  const aura=channels.length?channels:[{element:r===6?'divine':'mythic',color}];
  if(type==='bow')for(const side of [-1,1]){const yy=side*.5*(1+(s.length-1)*.65);halo(g,[.23,yy,.015],color,r>=5?.50:.30,r>=5?.30:.17);}
  else{
   const height=.12+(tip-.12)*s.length;
   halo(g,[0,height,.025],color,r>=5?.65:.34,r>=5?.32:.20);
   if(type==='sword')halo(g,[0,height*.60,.025],color,r>=5?.52:.30,.16);
   if(aura[1])halo(g,[0,.17,.04],aura[1].color,.24,.2);
  }
  // Low-rarity enchanted blades get a fine effect-colored channel, never a full neon silhouette.
  if(r<5&&type==='sword')line(g,[[0,.25,.052],[0,.12+.83*s.length,.035]],.0035,glow);
  if(r<5&&['spear','staff'].includes(type))line(g,[[0,.3,.045],[0,.12+(tip-.33)*s.length,.045]],.0035,glow);
 }
 Object.assign(g.userData,{rarity:r,lengthScale:s.length,widthScale:s.width,magic:channels,glowing:r>=5||channels.length>0});
}

export function decorateShield(g,item){
 const s=equipmentStyle(item),r=s.tier;if(r<2)return;
 const gold=material('steel',s.trim,{metalness:.86,roughness:s.roughness}),glow=lightMaterial(equipmentMagic(item)[0]?.color||s.glow||s.trim,s.glow?2:0);
 for(const side of [-1,1])line(g,[[side*.25,.43,.095],[side*.27,.05,.095],[side*.16,-.30,.10],[0,-.54,.125]],.009,gold);
 if(r>=4)for(const side of [-1,1])for(let j=0;j<4;j++)plate(g,[[0,0],[side*.07,.06],[side*.11,.15],[side*.015,.10]],[side*.07,.1-j*.09,.13],gold,.009);
 if(r>=5){arc(g,[0,.075,.16],.11,0,Math.PI*2,glow,.007);for(let j=0;j<5;j++)rune(g,0,-.04-j*.06,.153,.023,glow);halo(g,[0,.06,.17],glow.color.getHex(),.45,.22);}
 g.userData.rarity=r;g.userData.glowing=r>=5;
}
