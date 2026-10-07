import * as T from 'three';
import {form,cord,bead,leaf,foldedCloth} from './model-craft.js';
import {heroArmorProfile} from './hero-armor-profile.js';

export function heroCouture(c,part,m){
 const p=heroArmorProfile(c);if(!p)return;
 const smith=c.design==='ashwright',ranger=c.design==='ranger',rank=p.rarity;
 const head=part('head'),chest=part('chest'),hips=part('hips');
 // Continuous forged cap with a raised front brow, sized to the authored
 // skull. The old cap cut through the forehead and left jagged skin fragments.
 const cap=form(head,[[.285,.002,.004,-.016],[.277,.050,.058,-.016],[.258,.085,.095,-.014],[.225,.106,.117,-.012],[.185,.112,.126,-.008],[.156,.109,.127,-.008]],m.steel,{sides:32,name:'Fitted continuous hero helmet'});
 // Reverse descending rings to outward normals; both sides remain metallic.
 const hp=cap.geometry.attributes.position;for(let i=0;i<hp.count;i++){const y=hp.getY(i),z=hp.getZ(i);if(y<.2&&z>.01)hp.setY(i,y+.036*(z-.01)/.12);hp.setX(i,hp.getX(i)*.93);hp.setY(i,hp.getY(i)*.94-.004);}cap.geometry.computeVertexNormals();
 cord(head,[[-.108,.152,.012],[-.080,.164,.081],[0,.177,.124],[.080,.164,.081],[.101,.152,.012]],.004,rank>=2?m.gold:m.steel,'Rolled helmet brow');
 form(head,[[.028,.089,.123,-.009],[.080,.101,.131,-.008],[.157,.105,.130,-.008]],m.steel,{start:1.13,arc:Math.PI*2-2.26,name:'Continuous helmet side and nape'});
 for(const s of [-1,1]){
  const cheek=leaf(head,[[s*.088,.149],[s*.108,.105],[s*.103,.018],[s*.062,-.012],[s*.060,.034],[s*.078,.083]],m.steel,{name:'Curved cheek guard',bow:.005});cheek.position.z=.052;
  bead(head,[s*.097,.112,.069],.005,m.gold);
 }
 if(!ranger&&!smith||rank>=4){
  const nasal=leaf(head,[[-.014,.17],[.014,.17],[.01,.106],[.017,.063],[0,.046],[-.017,.063],[-.01,.106]],m.steel,{name:'Ridged nasal guard',bow:.006});nasal.position.z=.142;const np=nasal.geometry.attributes.position;for(let i=0;i<np.count;i++){const y=np.getY(i);np.setZ(i,np.getZ(i)+.036*Math.exp(-(((y-.075)/.041)**2)));}nasal.geometry.computeVertexNormals();
 }
 // Ashwright returns to the older, weathered master smith in the concept.
 if(smith&&!p.plate){
  const beard=m.hair.clone();beard.color.setHex(0x625f58);beard.roughness=.96;c.materials.push(beard);
  form(head,[[-.105,.008,.022,.081],[-.083,.030,.033,.084],[-.041,.061,.061,.065],[.010,.084,.082,.048],[.036,.085,.091,.026],[.065,.080,.084,.014]],beard,{start:-1.72,arc:3.44,name:'Full sculpted smith beard'});
  const silver=beard.clone();silver.color.setHex(0x9a968b);c.materials.push(silver);
  for(let i=0;i<37;i++){const a=-1.38+i/36*2.76,x=Math.sin(a)*.076,z=Math.cos(a)*.085+.036;
   cord(head,[[x,.046+Math.sin(i*1.7)*.009,z],[x*.91,.003,z*.91+.024],[x*.50,-.077,z*.60+.052]],.0014,i%4===0?silver:beard,'Beard grain');}
  for(const s of [-1,1])cord(head,[[0,.043,.136],[s*.022,.049,.132],[s*.047,.029,.118],[s*.063,.008,.095]],.009,beard,'Swept moustache');
  // Real folds in the scarf, broad leather collar and layered tool belt.
  foldedCloth(chest,[[.167,.160,.136],[.211,.123,.115],[.255,.088,.080]],m.dark,'Forge scarf');
  for(let j=0;j<3;j++)cord(chest,[[-.12,.182+j*.013,.064],[0,.17+j*.013,.137],[.12,.183+j*.013,.064]],.006,m.dark);
  for(const s of [-1,1]){
   const lapel=leaf(chest,[[s*.05,.20],[s*.145,.17],[s*.158,-.13],[s*.095,-.18],[s*.075,.04]],m.leather,{name:'Folded apron lapel',bow:.008});lapel.position.z=.146;
   cord(chest,[[s*.135,.15,.170],[s*.145,-.08,.172],[s*.107,-.147,.174]],.003,m.stitch);
   for(let j=0;j<5;j++)bead(chest,[s*.126,.117-j*.047,.181],.004,m.gold);
  }
  // Lantern has glass, a cage, suspension ring and a lit ember, not a box.
  const lantern=new T.Group();hips.add(lantern);lantern.position.set(-.245,-.13,.028);
  form(lantern,[[-.16,.037,.037],[-.12,.049,.049],[.09,.042,.042],[.12,.024,.024]],m.gold,{sides:8,name:'Smith lantern frame'});
  form(lantern,[[-.12,.034,.034],[.08,.034,.034]],m.ember,{sides:10,name:'Contained furnace ember'});
  for(let i=0;i<6;i++){const a=i*Math.PI/3;cord(lantern,[[Math.sin(a)*.045,-.12,Math.cos(a)*.045],[Math.sin(a)*.043,.09,Math.cos(a)*.043]],.006,m.dark);}
  const ring=new T.Mesh(new T.TorusGeometry(.026,.004,6,14),m.gold);ring.position.y=.144;lantern.add(ring);
 }
 if(ranger&&!p.plate){
  // Hood lies over the steel cap; the face remains visible under its brow.
  form(head,[[.03,.110,.126,-.03],[.12,.142,.144,-.033],[.23,.139,.145,-.04],[.30,.067,.079,-.045],[.319,.002,.02,-.053]],m.cloth,{start:.91,arc:Math.PI*2-1.82,name:'Ranger tailored hood'});
  for(const s of [-1,1])cord(head,[[s*.088,.03,.073],[s*.110,.14,.063],[s*.099,.24,.060],[s*.052,.291,.019],[0,.32,-.034]],.004,m.leather);
  foldedCloth(chest,[[.12,.204,.154],[.20,.147,.12],[.25,.097,.077]],m.cloth,'Ranger wrapped cowl');
  // Layered scalloped leather scales produce a readable hunter silhouette.
  for(const s of [-1,1])for(let j=0;j<4;j++){
   const plate=leaf(hips,[[-.065,0],[.068,.018],[.073,-.08],[0,-.14],[-.065,-.08]],j%2?m.leather:m.cloth,{name:'Ranger leaf skirt'});plate.position.set(s*.16,-.03-j*.085,.06);plate.rotation.y=s*.75;
  }
 }
 if(!smith||p.sleeves){
  // Rounded shoulder cups and fitted fluting replace paper-thin open edges.
  for(const s of [-1,1]){
   const arm=part('upperarm'+(s>0?'l':'r')),scale=ranger?.92:1;
   for(let j=0;j<(rank>=4?4:2);j++){
    const rx=(.116-j*.009)*scale,rz=(.114-j*.006)*scale,y=-.035+j*.048;
    form(arm,[[y,rx*.67,rz*.70],[y+.024,rx,rz],[y+.088,rx*.91,rz*.97]],m.steel,{name:'Contoured overlapping shoulder plate'});
    cord(arm,Array.from({length:25},(_,i)=>[Math.sin(i*Math.PI/12)*rx*.915,y+.084,Math.cos(i*Math.PI/12)*rz*.975]),.0035,rank>=2?m.gold:m.steel);
   }
   for(let j=0;j<3;j++)cord(arm,[[(j-1)*.038,-.021,-.070],[(j-1)*.042,.02,-.112],[(j-1)*.037,.10,-.106]],.003,m.gold,'Pauldron fluting');
  }
 }
 if(!smith&&!ranger||p.plate){
  // Small-radius convex breast/back plates and abdominal articulation.
  form(chest,[[-.155,.154,.115],[-.105,.178,.139],[-.025,.209,.163],[.052,.225,.169],[.13,.211,.142],[.19,.166,.098]],m.steel,{name:'Shaped cuirass',sides:32});
  for(const s of [-1,1]){
   for(let i=0;i<4;i++)cord(chest,[[s*(.035+i*.032),-.115,.134],[s*(.042+i*.04),-.02,.16],[s*(.044+i*.04),.080,.159],[s*(.028+i*.035),.151,.119]],.0026,rank>=2?m.gold:m.steel,'Cuirass raised flute');
   for(let j=0;j<4;j++){
    const plate=leaf(hips,[[-.066,0],[.065,0],[.074,-.063],[0,-.091],[-.075,-.063]],m.steel,{name:'Articulated hip tasset',bow:.022});plate.position.set(s*.165,-.03-j*.061,.068);plate.rotation.y=s*.54;
   }
  }
 }
 // Closed, shaped greaves, elbow pieces and sabatons keep a readable adult
 // limb underneath every plate. Rounded shells catch light at their edges.
 for(const side of ['l','r']){
  const shin=part('lowerleg'+side),foot=part('foot'+side),fore=part('lowerarm'+side);
  const armored=!smith&&!ranger||p.sleeves,boot=armored?m.steel:m.leather;
  if(armored){
   form(shin,[[.0,.060,.076],[.053,.084,.091],[.13,.085,.084],[.23,.066,.067],[.35,.048,.056],[.405,.047,.055]],m.steel,{name:'Sculpted closed greave'});
   for(const sign of [-1,1])cord(shin,[[sign*.053,.05,-.076],[sign*.061,.125,-.067],[sign*.042,.25,-.055],[sign*.028,.382,-.050]],.003,rank>=2?m.gold:m.steel,'Greave fluting');
   form(fore,[[.027,.064,.066],[.078,.073,.075],[.16,.058,.059],[.238,.044,.046]],m.steel,{name:'Shaped vambrace'});
   for(const yy of [.045,.211])cord(fore,Array.from({length:25},(_,i)=>[Math.sin(i*Math.PI/12)*(yy<.1?.071:.05),yy,Math.cos(i*Math.PI/12)*(yy<.1?.072:.052)]),.003,m.gold);
  }
  form(foot,[[-.015,.055,.053],[.045,.074,.072],[.125,.077,.073],[.205,.057,.058],[.235,.012,.028]],boot,{name:'Contoured fitted boot'});
  if(armored)for(let j=0;j<4;j++){
   const y=.06+j*.044,width=.077-j*.006;
   form(foot,[[y,width,.076-j*.004],[y+.038,width*.94,.075-j*.004]],m.steel,{name:'Articulated sabaton',start:Math.PI*.5,arc:Math.PI});
   cord(foot,[[ -width*.9,y,-.030],[0,y+.008,-.079+j*.004],[width*.9,y,-.030]],.003,rank>=2?m.gold:m.steel);
  }
 }
 c.visual.userData.coutureVersion=223;
}
