import * as T from 'three';
import {form,cord,leaf,bead,foldedCloth} from './model-craft.js';
import {heroSurface} from './hero-surfaces.js';

// Equipment is attached to the existing articulated bones and merged by the
// character batcher. No separate animated rig or gameplay statistics.
export function specialistDress(c,part,m){
 const id=c.design,r=c.rank;
 if(!['breaker','giant','crew','engineer','assassin','marksman','pyre','frost','lantern','dawn','rider','banner'].includes(id))return;
 const chest=part('chest'),head=part('head'),hips=part('hips');
 const steel=heroSurface('steel',id==='giant'?0x777c76:id==='breaker'?0x454c51:id==='dawn'?0xd2cebb:0x84909a);
 const trim=heroSurface('steel',r>=7?0xcfa85f:0x9d8966),hide=heroSurface('leather',id==='giant'?0x584739:0x373536);
 const cloth=m.cloth,under=m.dark;
 const glow=new T.MeshStandardMaterial({color:id==='frost'?0xadefff:id==='pyre'||id==='breaker'?0xffb36b:0xf1d598,emissive:id==='frost'?0x3187b4:id==='pyre'||id==='breaker'?0xb63c12:0x7b6524,emissiveIntensity:r>=8?.65:.12,roughness:.5});
 c.materials.push(steel,trim,hide,glow);
 const plate=(g,pts,pos,mat=steel,name='Articulated specialist plate')=>{const a=leaf(g,pts,mat,{name,depth:.008,bow:.012});a.position.set(...pos);return a;};
 const band=(g,y,rx,rz,mat=trim)=>form(g,[[y,rx,rz],[y+.017,rx,rz]],mat,{name:'Rolled equipment binding'});
 const lames=(g,count,width,z,mat=steel)=>{for(let j=0;j<count;j++){
  plate(g,[[-width,0],[-width*.82,-.07],[0,-.092],[width*.82,-.07],[width,0],[0,.018]],[0,.13-j*.064,z],mat,'Overlapping fitted lamellar');
  for(const s of [-1,1])bead(g,[s*width*.76,.115-j*.064,z+.025],.0045,trim);
 }};
 const shoulder=(side,broad=false)=>{const a=part('upperarm'+side);for(let j=0;j<3+Math.floor(r/4);j++){
  const w=(broad?.15:.12)-j*.008;form(a,[[j*.045-.055,w*.70,w*.60],[j*.045-.026,w,w*.86],[j*.045+.043,w*.93,w*.90]],steel,{sides:16,name:'Beveled overlapping shoulder armor'});
  band(a,j*.045+.043,w*.93,w*.90);
 }};
 if(id==='breaker'){
  // A squat, enclosed breacher with ribbed blackened cuirass and copper vents.
  lames(chest,5,.215,.158);for(const s of [-1,1]){
   cord(chest,[[s*.15,.18,.14],[s*.19,.02,.20],[s*.14,-.14,.17]],.015,trim,'Breacher load-bearing brass rib');
   const a=part('lowerarm'+(s>0?'l':'r'));form(a,[[-.025,.070,.069],[.08,.087,.083],[.23,.057,.055]],steel,{sides:16,name:'Heavy impact gauntlet'});band(a,.08,.089,.085);
  }shoulder('l',true);shoulder('r');
  form(head,[[.12,.135,.139],[.23,.126,.123],[.30,.066,.07],[.318,.002,.002]],steel,{sides:24,name:'Enclosed breacher helmet'});
  plate(head,[[-.098,.15],[.098,.15],[.095,.104],[-.095,.104]],[0,0,.174],under,'Recessed horizontal eye slit');
  for(let j=-2;j<=2;j++)cord(chest,[[j*.034,-.1,.197],[j*.034,.07,.198]],.004,r>=7?glow:trim,'Furnace rib inlay');
  lames(hips,3,.16,.166); 
 }else if(id==='giant'){
  // Oathbound: stone-and-bronze monument, not a scaled forge worker.
  form(chest,[[-.16,.19,.14],[-.02,.274,.19],[.14,.252,.17],[.22,.17,.105]],steel,{sides:12,name:'Titan carved stone cuirass'});
  for(const s of [-1,1]){
   cord(chest,[[s*.19,.22,.09],[s*.23,.08,.19],[s*.17,-.13,.176]],.027,hide,'Titan crossed binding');
   const a=part('upperarm'+(s>0?'l':'r'));
   form(a,[[-.065,.10,.09],[-.025,.174,.151],[.06,.168,.145],[.18,.113,.107]],steel,{sides:7,name:'Weathered monolith shoulder'});
   for(let j=0;j<3;j++)band(part('lowerarm'+(s>0?'l':'r')),.045+j*.067,.077-j*.006,.075-j*.006);
   for(let j=0;j<4;j++){const chain=new T.Mesh(new T.TorusGeometry(.025,.007,5,10),trim);chain.position.set(s*(.18-j*.025),.10-j*.046,.207);chain.rotation.y=j%2?Math.PI/2:0;chest.add(chain);}
  }
  // Open brow crown and hanging beard preserve a visible, complete human face.
  form(head,[[.171,.127,.128],[.196,.13,.13]],trim,{sides:28,name:'Fitted titan brow circlet'});
  for(let j=-3;j<=3;j++){const x=j*.019;cord(head,[[x,.037,.133],[x*1.13,-.009,.122],[x*.82,-.057+Math.abs(j)*.009,.094]],.008,m.hair,'Jaw following grey beard');}
  foldedCloth(hips,[[.08,.19,.143],[-.18,.225,.157],[-.36,.24,.16]],hide,'Titan battle kilt',16);
  plate(chest,[[-.048,.065],[0,.1],[.048,.065],[.038,-.025],[0,-.067],[-.038,-.025]],[0,.045,.20],trim,'Oath seal');
  if(r>=5)for(const s of [-1,1])cord(chest,[[s*.035,.10,.22],[s*.075,.01,.222],[s*.04,-.055,.219]],.006,glow,'Inscribed oath channels');
 }else if(['crew','engineer','marksman'].includes(id)){
  // Workers carry equipment; marksmen wear an articulated blue brigandine.
  lames(chest,id==='marksman'?5:3,.196,.165,id==='marksman'?steel:hide);
  for(const s of [-1,1]){cord(chest,[[s*.19,.17,.135],[-s*.13,-.17,.185]],.025,hide,'Equipment bandolier');for(let j=0;j<5;j++){
   form(chest,[[.11-j*.042,.011,.011], [.14-j*.042,.011,.011]],trim,{sides:8,name:'Bandolier cartridge'}).position.set(s*(.12-j*.024),0,.206);
  }}
  if(id==='marksman'){shoulder('l');for(const s of [-1,1])plate(hips,[[-.07,.07],[.07,.07],[.11,-.39],[0,-.49],[-.09,-.40]],[s*.12,0,-.145],cloth,'Split marksman greatcoat');}
  else {for(let i=0;i<3;i++){const reel=new T.Mesh(new T.TorusGeometry(.065+i*.009,.008,5,18),hide);reel.position.set(.14,.06,-.31-i*.01);chest.add(reel);}if(id==='engineer')for(let i=0;i<4;i++)cord(chest,[[-.14+i*.025,-.15,-.29],[-.14+i*.025,.30,-.29]],.01,trim,'Survey rods');else{form(chest,[[-.20,.065,.065],[.23,.065,.065]],steel,{sides:12,name:'Siege crew powder canister'}).position.set(-.17,0,-.26);}}
 }else if(id==='assassin'){
  for(const s of [-1,1]){lames(part('upperarm'+(s>0?'l':'r')),3,.087,-.103,hide);for(let j=0;j<4;j++)plate(hips,[[-.035,0],[.035,0],[.045,-.19],[0,-.28],[-.045,-.19]],[s*(.05+j*.035),-.06,.135-j*.008],hide,'Layered stealth coat scale');}
  cord(chest,[[-.17,.18,.13],[.15,-.15,.185]],.031,hide,'Oblique blade belt');
 }else if(['pyre','frost','lantern'].includes(id)){
  for(const s of [-1,1]){const a=part('upperarm'+(s>0?'l':'r'));foldedCloth(a,[[-.03,.095,.091],[.12,.09,.088],[.27,.081,.078]],cloth,'Tailored caster sleeve');band(a,.25,.083,.08);}
  if(id==='pyre'){for(const s of [-1,1])for(let j=0;j<3;j++)plate(chest,[[-.033,0],[.033,0],[.06,.16],[0,.25],[-.05,.16]],[s*(.17+j*.033),.06-j*.03,.065],r>=7?trim:steel,'Flame-shaped ceremonial collar');lames(chest,3,.15,.174,hide);}
  if(id==='frost'){for(const s of [-1,1])for(let j=0;j<5;j++){const crystal=new T.Mesh(new T.OctahedronGeometry(.027,0),glow);crystal.scale.set(.7,2+j*.18,.6);crystal.position.set(s*(.16+j*.017),.16-j*.026,.13);crystal.rotation.z=s*-.45;chest.add(crystal);}}
  if(id==='lantern'){form(head,[[.2,.13,.125],[.3,.09,.085],[.43,.015,.02]],cloth,{sides:4,name:'Healer folded mitre'});cord(chest,[[0,.20,.145],[-.1,.03,.19],[0,-.08,.20],[.1,.03,.19],[0,.20,.145]],.009,trim,'Healer ceremonial chain');}
 }else if(['dawn','rider','banner'].includes(id)){
  lames(chest,4,.208,.171);shoulder('l');shoulder('r');
  for(const s of [-1,1]){for(let j=0;j<3;j++)cord(chest,[[s*(.04+j*.035),-.1,.19],[s*(.055+j*.035),.035,.20],[s*(.04+j*.035),.12,.17]],.003,trim,'Fluted plate ridge');}
  if(id==='dawn')for(const s of [-1,1])for(let j=0;j<4;j++)plate(head,[[-.012,0],[.018,.03],[.034,.14],[.014,.18],[0,.08]],[s*(.115+j*.009),.16,-.03-j*.03],trim,'Dawn winged coronet').rotation.z=s*-.45;
 }
 // Earned rank adds visible reinforced greaves and engraved fastening points.
 for(const side of ['l','r'])if(r>=4){const shin=part('lowerleg'+side);plate(shin,[[-.057,0],[0,-.027],[.057,0],[.039,.32],[0,.37],[-.039,.32]],[0,.01,-.083],steel,'Specialist fitted greave').rotation.y=Math.PI;for(let j=0;j<Math.min(6,r-2);j++)bead(shin,[.041,.045+j*.038,-.09],.004,trim);}
 c.visual.userData.specialistDesign={version:227,role:id,rank:r};
}
