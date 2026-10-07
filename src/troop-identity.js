import * as T from 'three';
import {form,cord,bead,leaf,foldedCloth} from './model-craft.js';

// One recognizable role at every rank. Advancement enriches that role instead
// of turning every specialist into the same plate-armored, quiver-wearing knight.
export const TROOP_IDENTITY={
 shield:{cloth:0x286b72,accent:0xbea76d,width:1,head:'sallet',mark:'Layered shield infantry'},
 bow:{cloth:0x305c3e,accent:0xc8ac6b,width:.96,head:'hood',mark:'Asymmetric bow shoulder and feathered hood'},
 pike:{cloth:0x923d37,accent:0xcbb984,width:1.02,head:'morion',mark:'Combed morion and regiment sash'},
 lantern:{cloth:0xe5d4ac,accent:0xc69743,width:.94,head:'cowl',mark:'Ivory healer vestments and lantern reliquary'},
 breaker:{cloth:0x623527,accent:0xb58b55,width:1.22,head:'forge',mark:'Heavy forge mask and furnace shoulders'},
 crew:{cloth:0x435761,accent:0xc19a62,width:1.09,head:'goggles',mark:'Goggles, bolts and reinforced work harness'},
 rider:{cloth:0x293f85,accent:0xd2bb7e,width:1.05,head:'cavalry',mark:'Closed lance helm, plume and barded charger'},
 giant:{cloth:0x455941,accent:0xa78658,width:1.34,head:'forge',mark:'Massive chain harness and slab pauldrons'},
 banner:{cloth:0xb68838,accent:0xeee0ac,width:1.02,head:'officer',mark:'Command sash, officer crest and tall standard'},
 engineer:{cloth:0x84633d,accent:0xbdae91,width:1.09,head:'goggles',mark:'Rivet goggles, tool harness and survey pack'},
 assassin:{cloth:0x392e4e,accent:0x9e9cab,width:.86,head:'hood',mark:'Narrow dark hood, face wrap and blade harness'},
 pyre:{cloth:0x8c3024,accent:0xe5a646,width:.98,head:'cowl',mark:'Crimson split robes and furnace crown'},
 marksman:{cloth:0x384e70,accent:0xaebcc5,width:.95,head:'scout',mark:'Slouch hat, ammunition belts and optics'},
 frost:{cloth:0x80a7ba,accent:0xe0e3dc,width:.94,head:'cowl',mark:'Pale fur mantle, crystal diadem and blue robes'},
 dawn:{cloth:0xeee3c4,accent:0xd2a54b,width:1.14,head:'paladin',mark:'Ivory fluted plate, sun crown and reliquary'}
};
export function fitTroopPart(c,id,g){const p=TROOP_IDENTITY[c.design];if(!p||c.enemy)return;id=id.replaceAll('.','');if(/chest|spine|hips/.test(id))g.scale.set(p.width,1,Math.sqrt(p.width));if(/upperarm|lowerarm|upperleg|lowerleg/.test(id))g.scale.set(Math.sqrt(p.width),1,Math.sqrt(p.width));}
export function troopIdentity(c,part,m){
 const d=TROOP_IDENTITY[c.design];if(!d)return;const r=c.rank,hero=['warden','ranger','ashwright'].includes(c.design);if(hero)return;
 const head=part('head'),chest=part('chest'),hips=part('hips'),gold=m.edge||m.gold,leather=m.leather,dark=m.dark,metal=m.steel;
 const cloth=m.cloth.clone();cloth.map=null;cloth.color.setHex(d.cloth);cloth.roughness=.88;c.materials.push(cloth);
 const accent=gold.clone();accent.color.setHex(d.accent);c.materials.push(accent);
 const gem=new T.MeshStandardMaterial({color:c.design==='frost'?0xa5edff:c.design==='pyre'?0xffb641:0xf5dfa0,emissive:c.design==='frost'?0x278ba6:c.design==='pyre'?0xc53b0e:0xa47723,emissiveIntensity:r>=7?.8:.25,roughness:.3});c.materials.push(gem);
 if(c.design==='bow'){
  // A tailored closed sleeve replaces the source asset's open shoulder tube.
  for(const side of ['l','r'])form(part('upperarm'+side),[[-.069,.012,.016],[-.046,.071,.068],[.026,.091,.087],[.12,.082,.080],[.21,.06,.064],[.285,.051,.052]],cloth,{name:'Closed archer shoulder and sleeve'});
  foldedCloth(chest,[[.150,.195,.131],[.193,.143,.107],[.243,.083,.075]],cloth,'Fitted archer collar');
 }
 if(['morion','officer','scout'].includes(d.head)){
  const brim=form(head,[[.147,.135,.137],[.139,.207,.211],[.149,.231,.178],[.160,.144,.148]],d.head==='scout'?leather:metal,{name:'Swept helmet brim',sides:28});
  const pos=brim.geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,pos.getY(i)+.12*Math.max(0,Math.abs(pos.getZ(i))-.09));brim.geometry.computeVertexNormals();
  if(d.head!=='scout'){const comb=leaf(head,[[-.10,0],[-.07,.14],[.01,.19],[.092,.11],[.12,-.02]],r>=7?accent:metal,{name:'Morion crest'});comb.position.set(0,.258,.006);comb.rotation.y=Math.PI/2;}
 }
 if(['sallet','cavalry','paladin'].includes(d.head)){
  form(head,[[.05,.105,.137,-.01],[.092,.126,.161,-.018],[.16,.129,.144,-.010]],metal,{start:1.15,arc:Math.PI*2-2.3,name:'Closed rear sallet'});
  if(d.head!=='sallet'||r>=6){const nasal=leaf(head,[[-.014,.28],[.014,.28],[.020,.10],[0,.071],[-.020,.10]],accent,{name:'Helmet median crest'});nasal.position.z=.133;}
  if(r>=5||d.head==='cavalry')for(let i=0;i<9;i++){const x=(i-4)*.006;cord(head,[[x,.27,-.012],[x,.46+(r>=8?.1:0),-.10],[x,.39,-.29],[x,.19,-.40]],.008,cloth,'Cavalry crest plume');}
 }
 if(d.head==='goggles'){
  cord(head,[[-.13,.13,-.01],[-.08,.13,.129],[0,.13,.15],[.08,.13,.129],[.13,.13,-.01]],.015,leather,'Goggle strap');
  for(const s of [-1,1]){const lens=new T.Mesh(new T.CylinderGeometry(.034,.034,.018,14),dark);lens.rotation.x=Math.PI/2;lens.position.set(s*.05,.133,.141);head.add(lens);const rim=new T.Mesh(new T.TorusGeometry(.036,.008,6,14),accent);rim.position.set(s*.05,.133,.154);head.add(rim);}
  for(const s of [-1,1])for(let i=0;i<4;i++){
   const vial=new T.Mesh(new T.CylinderGeometry(.014,.014,.084,8),metal);vial.position.set(s*(.07+i*.032),.082-i*.027,.176);vial.rotation.z=s*.48;chest.add(vial);
  }
 }
 if(d.head==='forge'){
  const mask=leaf(head,[[-.105,.14],[.105,.14],[.111,.045],[.057,-.03],[-.065,-.03],[-.11,.045]],metal,{name:'Forgemaster face mask',bow:.060});mask.position.z=.154;
  for(let i=-2;i<=2;i++)cord(head,[[i*.027,.027,.219],[i*.027,.088,.220]],.0035,dark,'Forge mask vent');
  for(const s of [-1,1]){
   const arm=part('upperarm'+(s>0?'l':'r'));form(arm,[[-.06,.10,.09],[-.01,.174,.152],[.09,.16,.15],[.18,.135,.125]],metal,{name:'Heavy forge shoulder'});
   for(let j=0;j<4;j++)bead(arm,[s*.143,.022+j*.033,-.073],.010,accent);
  }
 }
 if(d.head==='cowl'){
  form(head,[[.01,.112,.13,-.02],[.16,.159,.16,-.03],[.29,.102,.12,-.045],[.345,.014,.03,-.05]],cloth,{start:.80,arc:Math.PI*2-1.60,name:'Caster pointed cowl'});
  foldedCloth(chest,[[.10,.256,.170],[.19,.203,.14],[.27,.105,.09]],cloth,'Caster shoulder mantle');
  for(const s of [-1,1]){
   const stole=leaf(chest,[[-.049,.17],[.049,.17],[.072,-.70],[.024,-.91],[-.06,-.83]],cloth,{name:'Split caster vestment'});stole.position.set(s*.13,0,.181);stole.rotation.z=s*-.05;
   cord(chest,[[s*.168,.10,.195],[s*.175,-.40,.214],[s*.20,-.73,.216]],.005,accent,'Vestment embroidered edge');
  }
  if(c.design==='frost')for(let i=0;i<22;i++){const a=-1.3+i/21*2.6;const fur=leaf(chest,[[-.021,0],[.02,0],[.028,-.07],[.006,-.13],[-.03,-.08]],accent,{name:'Layered fur mantle'});fur.position.set(Math.sin(a)*.218,.17,Math.cos(a)*.156);fur.rotation.y=a;}
  if(r>=4)for(let i=-2;i<=2;i++){const shard=new T.Mesh(new T.OctahedronGeometry(.025),gem);shard.position.set(i*.042,.255+(2-Math.abs(i))*.018,.115);shard.scale.y=1.5+r*.08;head.add(shard);}
  if(c.design==='lantern'){
   const lamp=part('hips');for(const s of [-1,1]){const l=new T.Group();l.position.set(s*.21,-.09,.09);lamp.add(l);form(l,[[-.13,.035,.035],[.065,.037,.037]],gem,{sides:8,name:'Healer reliquary'});for(let i=0;i<4;i++){const a=i*Math.PI/2;cord(l,[[Math.sin(a)*.042,-.14,Math.cos(a)*.042],[Math.sin(a)*.042,.09,Math.cos(a)*.042]],.006,accent);}}
  }
 }
 if(c.design==='assassin'){
  form(head,[[-.018,.073,.128,.040],[.067,.100,.167,.033]],cloth,{start:-1.7,arc:3.4,name:'Assassin face wrap'});
  for(const s of [-1,1]){cord(chest,[[s*.18,.17,-.11],[-s*.13,-.11,-.156]],.025,leather,'Crossed blade harness');const dagger=leaf(chest,[[-.026,0],[.026,0],[.018,.25],[0,.32],[-.018,.25]],metal,{name:'Back carried dagger'});dagger.position.set(s*.13,.06,-.172);dagger.rotation.z=s*.6;}
 }
 if(['pike','banner','dawn'].includes(c.design))cord(chest,[[-.19,.17,.14],[-.09,.06,.192],[.06,-.075,.180],[.17,-.16,.12]],.036,cloth,'Regimental sash');
 if(c.design==='bow'&&r>=3||c.design==='marksman')for(let i=0;i<Math.min(5,1+Math.floor(r/2));i++){
  const feather=leaf(head,[[0,0],[-.023,.11],[-.019,.21],[0,.27],[.019,.17],[.023,.08]],r>=7?accent:cloth,{depth:.001,bow:.005,name:'Scout flight feather'});feather.position.set(.077+i*.007,.122,-.065-i*.016);cord(head,[[.067,.10,-.057],[.083+i*.007,.145,-.066-i*.016]],.004,leather,'Feather fastening');feather.rotation.z=-.35-i*.12;
 }
 c.visual.userData.troopIdentity={role:c.design,mark:d.mark,rank:r};
}
