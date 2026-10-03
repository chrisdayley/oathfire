import * as T from 'three';
import {heroArmorProfile} from './hero-armor-profile.js';
const mesh=(g,geo,m,name)=>{const o=new T.Mesh(geo,m);o.name=name;o.castShadow=o.receiveShadow=true;g.add(o);return o;};
function line(g,points,m,r=.003,name='Armor rolled edge'){
 return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(12,points.length*3),r,5,false),m,name);
}
function shell(g,rings,m,name,front=0,back=Math.PI*2){
 const p=[],uv=[],idx=[],n=28;
 rings.forEach(([y,rx,rz],j)=>{for(let i=0;i<=n;i++){const a=front+(back-front)*i/n;p.push(Math.sin(a)*rx,y,Math.cos(a)*rz);uv.push(i/n,j/(rings.length-1));if(j<rings.length-1&&i<n){const k=j*(n+1)+i;idx.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}});
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,m,name);
}
function rivet(g,p,m,r=.004){const o=mesh(g,new T.SphereGeometry(r,8,6),m,'Armor fastening rivet');o.position.set(...p);return o;}
function facet(g,points,m,name){
 const p=points.flat(),idx=[];for(let i=1;i<points.length-1;i++)idx.push(0,i,i+1);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(([x,y])=>[x*4+.5,y*3+.5]),2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,m,name);
}
export function fitHeroArmor(c,part,m){
 const p=heroArmorProfile(c);if(!p)return;
 const chest=part('chest'),head=part('head'),spine=part('spine');
 // Overlapping collar closes the neck opening beneath every equipped helmet.
 shell(chest,[[.16,.134,.091],[.205,.085,.075],[.244,.075,.07]],p.rarity>=2?m.steel:m.leather,'Fitted neck gorget');
 if(p.rarity>=2)line(chest,[[-.071,.24,0],[0,.245,.072],[.071,.24,0]],m.gold);
 // Cape clasps sit above the shoulder straps, with narrow leather ties.
 for(const s of [-1,1]){
  line(chest,[[s*.16,.18,-.20],[s*.185,.188,-.06],[s*.147,.17,.12]],m.leather,.010,'Mantle shoulder fastening');
  rivet(chest,[s*.15,.165,.13],m.gold,.010);
 }
 // The ranger's quiver sits against the side of the harness. Two leather
 // suspension straps join its rim and lower ring to the existing baldric.
 if(c.design==='ranger'){
  line(chest,[[-.195,.184,.07],[-.11,.245,-.10],[.13,.25,-.23],[.29,.13,-.25],[.36,.09,-.22]],m.leather,.012,'Quiver shoulder suspension');
  line(chest,[[.162,-.15,.108],[.222,-.18,.005],[.29,-.22,-.12],[.36,-.25,-.22]],m.leather,.010,'Quiver lower belt attachment');
  for(const y of [.09,-.25])rivet(chest,[.36,y,-.283],m.gold,.008);
 }
 // A sculpted median crest and layered nape transform the plain iron cap as
 // rarity grows, without inflating the head or hiding it inside a hood.
 line(head,[[0,.20,.09],[0,.256,.04],[0,.265,-.03],[0,.215,-.117]],p.rarity>=2?m.gold:m.steel,p.rarity>=4?.0045:.003,'Helmet median ridge');
 for(let i=0;i<(p.rarity>=4?3:1);i++)shell(head,[[.08-i*.025,.100+i*.004,.124+i*.006],[.047-i*.025,.099+i*.007,.127+i*.007]],m.steel,'Overlapping helmet nape',Math.PI*.59,Math.PI*1.41);
 for(const s of [-1,1])for(let i=0;i<(p.rarity>=2?3:1);i++)rivet(head,[s*.089,.086+i*.038,-.061],m.gold,.003);
 if(p.plate){
  // Two folded face plates leave a real eye slit above the closed lower visor.
  for(const s of [-1,1]){
   facet(head,[[0,.104,.149],[s*.078,.112,.115],[s*.092,.04,.103],[s*.040,-.005,.131],[0,.008,.156]],m.steel,'Closed plate visor');
   line(head,[[s*.077,.114,.117],[0,.107,.151],[s*-.077,.114,.117]],m.gold,.0025);
   for(let i=0;i<3;i++)line(head,[[s*(.025+i*.014),.05,.15-i*.005],[s*(.027+i*.014),.076,.147-i*.005]],m.dark,.0025,'Visor ventilation');
  }
  line(head,[[0,.005,.157],[0,.1,.153]],m.gold,.003);
 }
 if(p.sleeves){
  for(const side of ['l','r']){
   const upper=part('upperarm'+side),fore=part('lowerarm'+side),hand=part('hand'+side);
   shell(upper,[[.05,.092,.087],[.10,.090,.087],[.19,.078,.073],[.282,.061,.061]],m.steel,'Closed upper-arm rerebrace');
   shell(fore,[[-.026,.061,.061],[.03,.065,.065],[.065,.068,.064]],m.mail,'Flexible elbow mail');
   for(let j=0;j<3;j++)shell(upper,[[.085+j*.044,.100-j*.008,.096-j*.008],[.115+j*.044,.097-j*.008,.093-j*.008]],m.steel,'Descending shoulder lame');
   for(const sign of [-1,1])line(upper,[[sign*.069,.10,-.068],[sign*.062,.18,-.065],[sign*.043,.26,-.052]],m.gold,.0025,'Rerebrace edge flute');
   shell(fore,[[-.035,.033,.058],[-.018,.065,.082],[.018,.066,.084],[.048,.048,.064]],m.steel,'Articulated elbow cop');
   for(const sign of [-1,1]){
    facet(fore,[[sign*.053,-.02,-.055],[sign*.081,.006,-.051],[sign*.083,.05,-.022],[sign*.061,.062,-.04],[sign*.043,.01,-.072]],m.steel,'Swept elbow wing');
    rivet(fore,[sign*.073,.007,0],m.gold,.006);
   }
   shell(fore,[[.035,.070,.068],[.095,.067,.064],[.225,.046,.046]],m.steel,'Enclosed fitted vambrace');
   for(const yy of [.055,.202]){const r=yy<.1?.073:.051;line(fore,Array.from({length:25},(_,i)=>[Math.sin(i*Math.PI/12)*r,yy,Math.cos(i*Math.PI/12)*r]),m.gold,.003);}
   shell(hand,[[.007,.041,.035],[.045,.047,.033],[.075,.04,.029]],m.steel,'Articulated plate gauntlet');
  }
 }
 if(p.plate){
  // A fitted cuirass, four abdominal lames and cuisses cover the whole body;
  // the cloth underneath remains visible only at bending joints.
  shell(chest,[[-.16,.16,.12],[-.10,.18,.14],[.025,.215,.155],[.12,.216,.135],[.19,.158,.092]],m.steel,'Full plate cuirass');
  for(let j=0;j<4;j++){
   const y=.025+j*.046,rx=.164+j*.009,rz=.121+j*.006;
   shell(spine,[[y,rx,rz],[y+.052,rx+.006,rz+.006]],m.steel,'Overlapping abdominal fauld');
   line(spine,Array.from({length:25},(_,i)=>[Math.sin(i*Math.PI/12)*(rx+.006),y+.052,Math.cos(i*Math.PI/12)*(rz+.006)]),m.gold,.0025);
  }
  for(const s of [-1,1]){
   line(chest,[[s*.11,.163,-.087],[s*.168,.09,-.118],[s*.13,-.10,-.124]],m.gold,.003,'Backplate chased border');
   for(let j=0;j<4;j++)rivet(chest,[s*(.13+j*.007),.12-j*.052,-.128],m.gold);
   const thigh=part('upperleg'+(s>0?'l':'r'));
   shell(thigh,[[.025,.105,.105],[.12,.104,.099],[.31,.075,.078],[.395,.064,.067]],m.steel,'Enclosed thigh cuisse');
   const shin=part('lowerleg'+(s>0?'l':'r'));
   shell(shin,[[.018,.075,.077],[.085,.081,.083],[.18,.075,.077],[.29,.056,.058],[.401,.047,.047]],m.steel,'Closed greave and calf plate');
   shell(shin,[[-.05,.048,.072],[-.018,.079,.098],[.025,.076,.092],[.06,.065,.079]],m.steel,'Overlapping knee cop');
   for(const sign of [-1,1]){
    line(shin,[[sign*.052,.038,.059],[sign*.068,.13,.056],[sign*.048,.29,.039],[sign*.035,.387,.027]],m.gold,.0028,'Calf plate chased seam');
    for(const y of [.094,.278])rivet(shin,[sign*(y<.2?.08:.058),y,0],m.gold,.004);
   }
   line(shin,[[-.048,.018,-.081],[0,.04,-.102],[.048,.018,-.081]],m.gold,.003,'Knee rolled lip');
  }
 }
 c.visual.userData.armorCoverage={...p};
}
