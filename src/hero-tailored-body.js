import * as T from 'three';
import {form,cord,bead,leaf,foldedCloth,add} from './model-craft.js';
import {heroArmorProfile} from './hero-armor-profile.js';

const ring=(g,y,x,z,m,r=.0025)=>cord(g,Array.from({length:33},(_,i)=>[Math.sin(i*Math.PI/16)*x,y,Math.cos(i*Math.PI/16)*z]),r,m,'Rolled garment edge');
function panel(g,rings,m,name,{fold=.008,tip=0}={}){
 const p=[],uv=[],ix=[],cols=20,rows=rings.length-1;
 rings.forEach(([y,cx,width,z],j)=>{for(let i=0;i<=cols;i++){const u=i/cols,x=(u-.5)*width,t=j/rows;p.push(cx+x,y+tip*Math.abs(u-.5)*2*t**5,z+Math.sin(u*Math.PI*5+t*2)*fold*(.3+.7*t)-x*x*.25);uv.push(u,1-t);if(j<rows&&i<cols){const k=j*(cols+1)+i;ix.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}}});
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();return add(g,geo,m,name);
}
function buckle(g,x,y,z,m,size=.022){const o=add(g,new T.TorusGeometry(size,.003,5,4),m,'Cast belt buckle');o.position.set(x,y,z);o.rotation.z=Math.PI/4;cord(g,[[x-size,y,z],[x+size,y,z]],.0025,m,'Buckle tongue');}
function plate(g,rings,m,name){
 const o=form(g,rings,m,{sides:40,name}),p=o.geometry.attributes.position;
 // Broad plate surfaces have a central keel, flatter breast, and rounded
 // side returns. They are not a second elliptical barrel over the chest.
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i);if(z>0){const a=Math.atan2(x,z);p.setZ(i,z+Math.max(0,Math.cos(a))*.009*Math.exp(-x*x/ .003));}else p.setZ(i,z*.90);}
 o.geometry.computeVertexNormals();return o;
}
const BREAST_ROWS=[[-.177,.170,.135,.104],[-.104,.191,.157,.123],[-.024,.209,.166,.133],[.053,.210,.156,.127],[.126,.186,.126,.112],[.182,.151,.101,.086]];
function breastSection(y){
 let lo=BREAST_ROWS[0],hi=lo;
 for(const row of BREAST_ROWS){hi=row;if(row[0]>=y)break;lo=row;}
 const t=hi[0]===lo[0]?0:Math.max(0,Math.min(1,(y-lo[0])/(hi[0]-lo[0])));
 return lo.map((n,i)=>n+(hi[i]-n)*t);
}
function breastDepth(x,y){
 const [,w,d]=breastSection(y),u=Math.min(.998,Math.abs(x)/w);
 return d*Math.pow(Math.sqrt(1-u*u),.72)+.010*Math.exp(-((x/.029)**2));
}
function cuirass(g,m,rank){
 // Broad forged planes narrow to the natural waist. The sternum has a
 // shallow central keel; the front and back differ in depth and curvature.
 // This is the sole breast/back shell, over the fitted padded foundation.
 const positions=[],uv=[],indices=[],sides=48;
 for(let j=0;j<BREAST_ROWS.length;j++)for(let i=0;i<=sides;i++){
  const [y,w,front,back]=BREAST_ROWS[j],a=i/sides*Math.PI*2,s=Math.sin(a),co=Math.cos(a),x=s*w;
  let z=co>=0?front*Math.pow(co,.72)+.010*Math.exp(-((x/.029)**2)):back*co;
  let yy=y;
  if(j===0)yy+=.017*Math.abs(s);
  if(j===BREAST_ROWS.length-1)yy+=.015*Math.abs(s)-.013*Math.max(0,co);
  positions.push(x,yy,z);uv.push(i/sides,j/(BREAST_ROWS.length-1));
  if(j<BREAST_ROWS.length-1&&i<sides){const k=j*(sides+1)+i;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
 add(g,geo,m.ivory,'Fitted keeled breast and backplate');
 // Rolled neckline and lower return give thin plate a readable thickness.
 for(const j of [0,BREAST_ROWS.length-1]){
  const points=[];for(let i=0;i<=sides;i++){const k=(j*(sides+1)+i)*3;points.push([positions[k],positions[k+1],positions[k+2]]);}
  cord(g,points,.0025,rank>=2?m.gold:m.steel,'Breastplate rolled return');
 }
 // Two angled clavicle plates follow the shell, leaving a true neck opening.
 for(const s of [-1,1]){
  const shape=[[.023,.156],[.115,.173],[.169,.129],[.145,.109],[.080,.136]];
  const p=shape.map(([x,y])=>[s*x,y,breastDepth(s*x,y)+.0045]);
  const v=p.flat(),ix=[];for(let i=1;i<p.length-1;i++)ix.push(0,i,i+1);
  const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(v,3));cg.setAttribute('uv',new T.Float32BufferAttribute(p.flatMap(([x,y])=>[x*3+.5,y*3+.5]),2));cg.setIndex(ix);cg.computeVertexNormals();add(g,cg,m.steel,'Overlapping clavicle plate');
  cord(g,[...p,p[0]],.002,rank>=2?m.gold:m.steel,'Clavicle plate folded rim');
  for(const [x,y]of [[.123,.149],[.147,.127]])bead(g,[s*x,y,breastDepth(s*x,y)+.008],.0035,m.gold,'Clavicle fastening');
 }
 // Side buckles attach the two fitted halves; no ornamental cage across it.
 for(const s of [-1,1])for(const y of [-.117,.022]){
  const [,w]=breastSection(y);cord(g,[[s*(w-.025),y,.061],[s*(w+.001),y,.015],[s*(w-.015),y,-.056]],.006,m.leather,'Breastplate side fastening');
  bead(g,[s*(w+.002),y,.021],.004,m.gold,'Cuirass side rivet');
 }
}
function shoulder(g,m,rank,scale=1,role='warden'){
 const smith=role==='ashwright',ranger=role==='ranger';
 // A low, ridged roof over the deltoid replaces the spherical bowl. The
 // flatter outer face and angled returns catch broad rather than round light.
 const rows=smith?[[-.073,.018,.040],[-.062,.078,.086],[-.033,.115,.095],[.015,.113,.093],[.049,.101,.083]]:
  ranger?[[-.078,.014,.034],[-.06,.056,.078],[-.031,.096,.102],[.012,.103,.095],[.054,.087,.077]]:
  [[-.084,.016,.038],[-.067,.073,.085],[-.037,.115,.100],[.007,.114,.096],[.052,.098,.082]];
 const o=form(g,rows,m.steel,{sides:32,name:'Forged ridged pauldron shell'}),p=o.geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  p.setXYZ(i,x*scale,y-.010*Math.exp(-((z/.028)**2))*Math.exp(-(((y+.035)/.055)**2)),Math.sign(z)*Math.pow(Math.abs(z)/.105,.70)*.105*scale);
 }
 o.geometry.computeVertexNormals();
 // The three visible plates are real overlapping lames, not bands floating
 // on a hidden second pauldron. Each one slopes down toward the outer arm.
 const count=smith?2:ranger?2:3;
 for(let j=0;j<count;j++){
  const y=.040+j*.037,rx=(.106-j*.010)*scale,rz=(.087-j*.008)*scale;
  const lame=form(g,[[y,rx,rz],[y+.020,rx+.003,rz+.003],[y+.057,rx-.007,rz-.006]],j===0?m.ivory:m.steel,{sides:32,name:'Overlapping shaped shoulder lame'});
  const a=lame.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getZ(i);a.setY(i,a.getY(i)+.009*Math.abs(x)/rx);a.setZ(i,Math.sign(z)*Math.pow(Math.abs(z)/(rz+.003),.78)*(rz+.003));}lame.geometry.computeVertexNormals();
  const edge=Array.from({length:33},(_,i)=>{const t=i*Math.PI/16,x=Math.sin(t)*(rx-.007),z=Math.cos(t)*(rz-.006);return[x,y+.057+.009*Math.abs(x)/rx,Math.sign(z)*Math.pow(Math.abs(z)/(rz+.003),.78)*(rz+.003)];});
  cord(g,edge,.0025,rank>=2?m.gold:m.steel,'Rolled shoulder lame edge');
  for(const s of [-1,1])bead(g,[s*(rx-.01),y+.024,-.048],.0033,m.gold,'Sliding shoulder rivet');
 }
 const ridge=[[-.086*scale,-.036,-.003],[-.040*scale,-.075,0],[0,-.090,0],[.040*scale,-.074,0],[.086*scale,-.037,-.003]];
 cord(g,ridge,.0035,rank>=2?m.gold:m.steel,'Pauldron structural ridge');
}
function boot(g,m,steel){
 const o=form(g,[[-.015,.040,.039],[.03,.058,.053],[.095,.064,.056],[.16,.057,.046],[.218,.035,.027],[.24,.008,.011]],steel?m.steel:m.leather,{name:'Anatomically shaped boot',sides:28});
 if(steel)for(let j=0;j<4;j++){const y=.075+j*.034,x=.066-j*.006,z=.058-j*.006;form(g,[[y,x,z],[y+.028,x-.002,z-.002]],m.steel,{start:Math.PI*.5,arc:Math.PI,name:'Sabatons overlapping instep'});cord(g,[[-x*.9,y,-.018],[0,y,-z-.002],[x*.9,y,-.018]],.002,m.gold);}
 else for(let j=0;j<3;j++)cord(g,[[-.042,.065+j*.03,-.043],[.038,.08+j*.03,-.043]],.0015,m.dark,'Boot crossing laces');
}
function lantern(g,m,x){
 const h=new T.Group();h.position.set(x,-.095,.06);g.add(h);
 for(const y of [-.16,.032]){const cap=add(h,new T.CylinderGeometry(.037,.044,.018,10),m.gold,'Lantern pierced cap');cap.position.y=y;}
 const glass=m.ember.clone();glass.transparent=true;glass.opacity=.67;const core=add(h,new T.SphereGeometry(1,12,10),glass,'Amber lantern glass');core.scale.set(.028,.078,.028);core.position.y=-.064;
 for(let i=0;i<6;i++){const a=i*Math.PI/3;cord(h,[[Math.sin(a)*.038,-.155,Math.cos(a)*.038],[Math.sin(a)*.035,.025,Math.cos(a)*.035]],.004,m.dark,'Lantern cage upright');}
 const loop=add(h,new T.TorusGeometry(.021,.003,5,16),m.gold,'Lantern hanging ring');loop.position.y=.059;cord(h,[[0,.081,0],[0,.135,-.024]],.004,m.gold,'Lantern suspension');return glass;
}
function wrappedScarf(g,m,role){
 form(g,[[.165,.096,.09],[.218,.082,.078],[.259,.068,.067]],m.cloth,{name:'Fitted wool neck wrap',sides:36});
 for(let layer=0;layer<2;layer++){
  const path=new T.CatmullRomCurve3([new T.Vector3(-.173,.168-layer*.018,.100),new T.Vector3(-.088,.119-layer*.030,.160),new T.Vector3(.028,.128-layer*.028,.178),new T.Vector3(.157,.183-layer*.018,.113)]),v=[],u=[],ix=[],cols=36,rows=6;
  for(let j=0;j<=cols;j++){const t=j/cols,p=path.getPoint(t);for(let k=0;k<=rows;k++){const q=k/rows;v.push(p.x,p.y+(q-.5)*.047,p.z+Math.sin(q*Math.PI)*.007+Math.sin(t*21+q*5)*.0018);u.push(t,q);if(j<cols&&k<rows){const n=j*(rows+1)+k;ix.push(n,n+1,n+rows+1,n+1,n+rows+2,n+rows+1);}}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(u,2));geo.setIndex(ix);geo.computeVertexNormals();add(g,geo,m.cloth,'Overlapping diagonal scarf wrap');
 }
 if(role==='ranger')panel(g,[[.13,-.135,.064,.157],[.015,-.159,.060,.163],[-.13,-.141,.066,.181],[-.235,-.127,.061,.165]],m.cloth,'Loose ranger scarf tail',{fold:.006,tip:.02});
}
function helmet(head,m,r,role){
 const smith=role==='ashwright',ranger=role==='ranger';
 const cap=form(head,[[.279,.003,.005,-.014],[.27,.045,.052,-.014],[.248,.08,.09,-.012],[.216,.102,.112,-.010],[.171,.106,.124,-.005],[.138,.104,.125,-.005]],m.steel,{name:'Close fitted open-faced helmet',sides:36});
 const pos=cap.geometry.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i),z=pos.getZ(i);if(y<.2&&z>.02)pos.setY(i,y+.048*(z-.02)/.11);}cap.geometry.computeVertexNormals();
 cord(head,[[-.106,.139,.014],[-.08,.157,.09],[0,.185,.124],[.08,.157,.09],[.106,.139,.014]],.0035,r>=2?m.gold:m.steel,'Helmet rolled brow');
 form(head,[[.027,.088,.118,-.015],[.085,.104,.128,-.01],[.15,.105,.124,-.008]],m.steel,{start:1.35,arc:Math.PI*2-2.7,name:'Fitted helmet nape'});
 if(!smith&&!ranger||r>=4)for(const s of [-1,1]){const cheek=leaf(head,[[s*.088,.143],[s*.109,.089],[s*.095,.018],[s*.072,.005],[s*.068,.049]],m.steel,{name:'Helmet hinged cheek',bow:.004});cheek.position.z=.055;bead(head,[s*.099,.113,.066],.0045,m.gold);}
 if(r>=5&&!smith){
  for(const s of [-1,1]){
   const visor=leaf(head,[[0,.102],[s*.075,.111],[s*.092,.055],[s*.04,-.004],[0,.006]],m.steel,{name:'Closed ridged visor',bow:.014});visor.position.z=.142;
   for(let j=0;j<3;j++)cord(head,[[s*(.023+j*.015),.037,.171-j*.004],[s*(.026+j*.015),.063,.170-j*.004]],.002,m.dark,'Visor breathing slots');
  }
  cord(head,[[0,.010,.163],[0,.098,.160],[0,.18,.136],[0,.268,.022]],.0035,m.gold,'Helm central ridge');
 }else if(!smith&&!ranger){
  const nasal=leaf(head,[[-.010,.182],[.010,.182],[.012,.072],[0,.055],[-.012,.072]],m.steel,{name:'Shaped nasal bar',bow:.004});nasal.position.z=.157;
 }
 if(r>=3){const band=cord(head,[[0,.269,.045],[0,.278,-.025],[0,.21,-.137]],.0035,m.gold,'Helmet chased crest');}
}
function beard(head,m,c){
 const hair=m.hair.clone();hair.color.setHex(0x716d65);hair.roughness=.93;c.materials.push(hair);
 const b=form(head,[[-.062,.025,.019,.079],[-.049,.047,.033,.083],[-.01,.072,.056,.064],[.025,.080,.078,.042],[.069,.077,.087,.012]],hair,{start:-1.8,arc:3.6,name:'Sculpted mature beard'});
 const p=b.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);const chinClearance=.008*Math.exp(-((x/.045)**2))*Math.exp(-((y/.038)**2));p.setZ(i,p.getZ(i)+chinClearance+Math.sin(x*180+y*33)*.0025+Math.sin(x*61+y*85)*.003);}b.geometry.computeVertexNormals();
 const pale=hair.clone();pale.color.setHex(0xa8a398);c.materials.push(pale);
 for(let i=0;i<44;i++){const a=-1.55+i/43*3.1,x=Math.sin(a)*.071,z=.025+Math.cos(a)*.086;cord(head,[[x,.047,z],[x*.98,.005,z+.008],[x*.74,-.031,z-.004],[x*.53,-.055,z-.02]],.0008,i%4===0?pale:hair,'Fine irregular beard strands');}
 for(const s of [-1,1])cord(head,[[0,.046,.139],[s*.023,.047,.136],[s*.040,.035,.124],[s*.049,.028,.114]],.0045,hair,'Natural swept moustache');
}
export function tailoredHero(c,part,m){
 const p=heroArmorProfile(c);if(!p)return;const r=p.rarity,role=c.design,smith=role==='ashwright',ranger=role==='ranger',warden=role==='warden',steel=warden||p.plate;
 const chest=part('chest'),spine=part('spine'),hips=part('hips'),head=part('head');
 // One continuous clothed torso under one outer armor system.
 form(hips,[[-.12,.156,.107],[0,.175,.123],[.19,.164,.117]],m.dark,{name:'Tailored pelvic foundation'});
 form(spine,[[-.04,.167,.127],[.12,.174,.133],[.28,.194,.145]],warden?m.mail:m.leather,{name:'Continuous fitted waist'});
 form(chest,[[-.17,.156,.103],[-.07,.185,.125],[.045,.204,.130],[.135,.187,.107],[.20,.140,.075]],warden?m.mail:ranger?m.leather:m.dark,{name:'Fitted torso undergarment'});
 form(chest,[[.181,.067,.060],[.26,.059,.056]],m.skin,{name:'Natural neck'});
 // Protect exposed atlas neck sampling from lips/eye areas of the face atlas.
 const neck=chest.children.at(-1),nuv=neck.geometry.attributes.uv,npos=neck.geometry.attributes.position;for(let i=0;i<nuv.count;i++)nuv.setXY(i,.35+npos.getX(i)*.12,.20+npos.getY(i)*.10);
 if(steel){
  cuirass(chest,m,r);
  // Lower plackart follows the waist, with a peaked top instead of a rib cage.
  const pl=plate(chest,[[-.31,.153,.13],[-.25,.166,.14],[-.17,.178,.151],[-.052,.200,.165]],m.steel,'Fitted overlapping plackart');
  form(chest,[[.163,.125,.095],[.217,.074,.068],[.252,.068,.063]],m.steel,{name:'Anatomical plate gorget'});ring(chest,.248,.069,.064,m.gold,.0025);
  for(let j=0;j<3;j++){const y=-.29+j*.049;form(chest,[[y,.168+j*.009,.146+j*.008],[y+.044,.163+j*.009,.144+j*.008]],m.steel,{name:'Three articulated waist lames'});ring(chest,y,.168+j*.009,.146+j*.008,m.gold,.002);}
 }
 if(smith){
  wrappedScarf(chest,{...m,cloth:m.dark},role);
  if(!p.plate){
   panel(chest,[[.15,0,.23,.156],[.03,0,.31,.17],[-.17,0,.30,.152]],m.leather,'Tailored smith bib',{fold:.003});
   for(const s of [-1,1]){cord(chest,[[s*.155,.175,.051],[s*.12,.12,.165],[s*.114,-.12,.176]],.012,m.leather,'Apron shoulder strap');buckle(chest,s*.118,.089,.183,m.gold,.016);}
  }
  for(const s of [-1,1]){panel(hips,[[.11,s*.085,.178,.145],[-.10,s*.09,.20,.156],[-.30,s*.104,.213,.17],[-.48,s*.122,.228,.163]],p.plate?m.dark:m.leather,'Sculpted forge apron',{fold:.008,tip:.018});cord(hips,[[s*.16,.06,.159],[s*.18,-.20,.182],[s*.215,-.465,.176]],.0016,m.stitch,'Apron stitched hem');}
  for(const s of [-1,1]){const pouch=form(hips,[[-.16,.042,.015],[-.15,.047,.027],[-.058,.045,.025],[-.04,.035,.016]],m.leather,{name:'Soft leather tool pouch'});pouch.position.set(s*.101,0,.161);const flap=leaf(hips,[[-.047,-.044],[.047,-.044],[.042,-.072],[0,-.090],[-.04,-.072]],m.leather,{bow:.009,name:'Folded tool pouch flap'});flap.position.set(s*.101,0,.194);bead(hips,[s*.101,-.068,.210],.004,m.gold);}
  c.materials.push(lantern(hips,m,-.213));beard(head,m,c);
 }
 if(warden){
  const inset=m.cloth.clone();inset.color.setHex(r>=5?0x254555:0xb3ae94);inset.onBeforeCompile=m.cloth.onBeforeCompile;inset.customProgramCacheKey=m.cloth.customProgramCacheKey;c.materials.push(inset);
  for(const s of [-1,1]){
   const skirt=panel(hips,[[.12,s*.085,.155,.149],[-.1,s*.093,.159,.167],[-.32,s*.104,.18,.173],[-.61,s*.13,.19,.157]],m.cloth,'Ranked split mantle',{fold:.012,tip:.065});
   if(r>=2){const geo=skirt.geometry.clone(),p=geo.attributes.position,uv=geo.attributes.uv,index=geo.index.array,selected=[];for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)+.005);for(let i=0;i<index.length;i+=3){const center=(uv.getX(index[i])+uv.getX(index[i+1])+uv.getX(index[i+2]))/3;if(center>.25&&center<.45)selected.push(index[i],index[i+1],index[i+2]);}geo.setIndex(selected);const band=add(hips,geo,inset,'Ranked split mantle ivory inset');band.castShadow=false;}
   cord(hips,[[s*.155,.09,.159],[s*.17,-.2,.182],[s*.224,-.54,.176]],.002,m.gold,'Surcoat embroidered outer border');
   const tasset=plate(hips,[[.06,.052,.011],[-.035,.061,.018],[-.14,.064,.023],[-.255,.045,.017]],m.ivory,'Shaped side tasset');tasset.position.set(s*.163,0,.095);tasset.rotation.y=s*.48;
  }
 }
 if(ranger){
  wrappedScarf(chest,m,role);
  form(head,[[.012,.108,.128,-.035],[.14,.139,.153,-.032],[.24,.130,.145,-.038],[.292,.068,.08,-.04],[.313,.009,.026,-.043]],m.cloth,{start:.90,arc:Math.PI*2-1.80,name:'Fitted ranger hood'});
  for(const s of [-1,1])cord(head,[[s*.075,.02,.064],[s*.105,.145,.067],[s*.089,.235,.06],[s*.050,.292,.017],[0,.313,-.018]],.0025,m.leather,'Hood seam');
  for(const s of [-1,1]){
   for(let j=0;j<4;j++){const a=panel(hips,[[.025,0,.117,.015],[-.035,.002,.143,.029],[-.105,.009,.145,.022],[-.160,.014,.083,.010],[-.207,.018,.006,.006]],j%2?m.leather:m.cloth,'Split leather coat',{fold:.007});a.position.set(s*(.104+j*.022),-.02-j*.096,.121-j*.006);a.rotation.y=s*.25;a.rotation.z=s*-.08;}
   const chestpiece=panel(chest,[[.15,s*.092,.035,.124],[.092,s*.103,.156,.137],[-.015,s*.098,.167,.164],[-.13,s*.085,.147,.143],[-.26,s*.075,.130,.147]],s<0?m.leather:m.steel,'Curved asymmetric brigandine',{fold:.002});const cp=chestpiece.geometry.attributes.position;for(let k=0;k<cp.count;k++)cp.setZ(k,cp.getZ(k)-cp.getX(k)**2*.9);chestpiece.geometry.computeVertexNormals();for(let j=0;j<5;j++)bead(chest,[s*.13,.072-j*.051,.158],.0028,m.gold,'Brigandine fastening rivet');
  }
  cord(chest,[[-.178,.17,.055],[-.1,.087,.174],[.04,-.05,.185],[.161,-.16,.097]],.015,m.leather,'Diagonal bow harness');for(const y of [-.13,.065])cord(chest,[[.15,y,-.133],[.25,y,-.18],[.33,y,-.19]],.005,m.leather,'Quiver suspension strap');buckle(chest,-.04,.035,.193,m.gold,.018);c.materials.push(lantern(hips,m,-.21));
 }
 form(hips,[[.11,.186,.148],[.177,.186,.148]],m.leather,{name:'Fitted equipment belt'});ring(hips,.15,.182,.140,m.stitch,.0015);buckle(hips,.015,.124,.147,m.gold,.025);
 for(const s of [-1,1]){
  const side=s>0?'l':'r',arm=part('upperarm'+side),fore=part('lowerarm'+side),thigh=part('upperleg'+side),shin=part('lowerleg'+side),foot=part('foot'+side);
  if(!smith||p.sleeves){form(arm,[[-.044,.03,.032],[.01,.085,.082],[.105,.077,.074],[.21,.060,.060],[.298,.05,.05]],p.sleeves||warden?m.mail:m.dark,{name:'Fitted upper sleeve'});form(fore,[[-.027,.049,.046],[.07,.062,.057],[.16,.049,.049],[.25,.038,.038]],warden||p.sleeves?m.mail:m.dark,{name:'Flexible forearm sleeve'});}
  shoulder(arm,m,r,ranger?(s>0?1.05:.93):smith?.96:.90,role);
  if(p.sleeves)form(arm,[[.115,.080,.078],[.205,.065,.065],[.282,.053,.055]],m.steel,{name:'Closed articulated upper arm plate'});
  if(warden||p.sleeves){
   form(fore,[[.037,.058,.061],[.090,.062,.064],[.19,.047,.05],[.23,.041,.043]],m.steel,{name:'Single fitted vambrace'});ring(fore,.232,.042,.044,m.gold,.002);
   const elbow=add(fore,new T.SphereGeometry(1,20,12),m.steel,'Shaped elbow cop');elbow.scale.set(.064,.042,.069);elbow.position.y=.01;
  }else{form(fore,[[.125,.053,.051],[.21,.043,.043],[.24,.04,.04]],m.leather,{name:'Leather wrist bracer'});for(const y of [.14,.214])ring(fore,y,y<.2?.055:.044,y<.2?.053:.045,m.gold,.002);}
  const pants=form(thigh,[[-.035,.102,.105],[.065,.106,.106],[.17,.093,.086],[.31,.071,.067],[.438,.050,.051]],m.dark,{name:'Shaped cloth breeches'});const pp=pants.geometry.attributes.position;for(let i=0;i<pp.count;i++){const y=pp.getY(i),k=1+.026*Math.sin(y*72+pp.getX(i)*15);pp.setX(i,pp.getX(i)*k);pp.setZ(i,pp.getZ(i)*k);}pants.geometry.computeVertexNormals();
  form(shin,[[-.027,.054,.059],[.07,.067,.063],[.16,.062,.059],[.30,.043,.045],[.421,.039,.041]],m.leather,{name:'Fitted riding boot shaft'});
  if(steel){
   form(shin,[[.03,.062,.068],[.10,.071,.071],[.21,.057,.06],[.365,.042,.046]],m.steel,{name:'One shaped greave'});const knee=add(shin,new T.SphereGeometry(1,20,12),m.steel,'Convex knee defense');knee.scale.set(.065,.055,.069);knee.position.set(0,.011,-.019);cord(shin,[[0,.046,-.086],[0,.15,-.075],[0,.345,-.052]],.0028,m.gold,'Greave central keel');
   if(p.plate){form(thigh,[[.03,.108,.109],[.15,.101,.09],[.31,.073,.073]],m.steel,{name:'Tailored plate cuisse'});}
  }else if(ranger){const gr=leaf(shin,[[-.047,.02],[0,-.014],[.047,.02],[.041,.18],[.025,.32],[-.03,.28]],m.steel,{bow:.017,name:'Hunter shin splint'});gr.position.z=-.073;gr.rotation.y=Math.PI;}
  for(const y of [.105,.28]){ring(shin,y,y<.2?.071:.049,y<.2?.073:.051,m.dark,.007);buckle(shin,s*(y<.2?.070:.05),y,-.01,m.gold,.008);}
  boot(foot,m,steel);
 }
 helmet(head,m,r,role);
 if(r>=2)for(const side of [-1,1]){for(let j=0;j<7;j++)bead(hips,[side*(.157+j*.006),.045-j*.068,.18],.0025,m.gold,'Hand-set garment rivets');}
 
 // Signature heraldry is inset into the plate; prestige upgrades keep class
 // tailoring instead of adding the same huge halo and spikes to every hero.
 if(r>=2&&warden){const ringo=add(chest,new T.TorusGeometry(.034,.0025,5,24),m.gold,'Inset sun seal');ringo.position.set(0,.039,breastDepth(0,.039)+.004);for(let j=0;j<12;j++){const a=j*Math.PI/6;const points=[.04,.052].map(rad=>{const x=Math.sin(a)*rad,y=.039+Math.cos(a)*rad;return[x,y,breastDepth(x,y)+.004];});cord(chest,points,.0018,m.gold,'Sun engraved rays');}}
 if(r>=3){
  for(const s of [-1,1]){
   if(steel)cord(chest,[[s*.055,.173],[s*.125,.150],[s*.175,.10]].map(([x,y])=>[x,y,breastDepth(x,y)+.003]),.002,m.gold,'Upper breastplate rolled border');
   for(let j=0;j<5;j++)bead(chest,[s*(.155-j*.009),-.17-j*.024,.102+j*.009],.0028,m.gold,'Plackart rivet');
  }
 }
 if(r>=4){
  // Class-specific raised work is kept close to the armor rather than a halo.
  if(warden){
   // A fitted comb follows the crown. Detached paired points read as cat
   // ears, so prestige is expressed through the helmet's actual construction.
   cord(head,[[0,.186,.127],[0,.248,.089],[0,.286,.013],[0,.278,-.06],[0,.223,-.133]],r>=6?.007:.005,m.gold,'Fitted sunward helmet comb');
   for(const s of [-1,1])cord(head,[[s*.045,.186,.117],[s*.067,.233,.071],[s*.052,.260,-.015],[s*.041,.23,-.112]],.0025,m.gold,'Helmet crown chased seam');
  }
  if(smith){for(const s of [-1,1])for(let j=0;j<3;j++)cord(head,[[s*.096,.07+j*.022,.061],[s*.104,.071+j*.022,.011]],.003,m.gold,'Forgemaster helmet vent');}
  if(ranger)for(const side of [-1,1]){const clasp=add(head,new T.TorusGeometry(.012,.002,5,16),m.gold,'Ranger temple hood clasp');clasp.position.set(side*.102,.153,.07);}
 }
 if(r>=5){
  const glow=m.ember.clone();glow.color.setHex(smith?0xffa652:warden?0xe4c777:0x6cb6d0);glow.emissive.copy(glow.color);glow.emissiveIntensity=.75;c.materials.push(glow);
  for(const s of [-1,1]){cord(chest,[[s*.125,.13],[s*.15,.045],[s*.115,-.064]].map(([x,y])=>[x,y,breastDepth(x,y)+.003]),.0028,glow,'Inlaid prestige channels');
   for(let j=0;j<3;j++)cord(chest,[[s*(.060+j*.024),-.052],[s*(.073+j*.024),.004],[s*(.083+j*.020),.061]].map(([x,y])=>[x,y,breastDepth(x,y)+.002]),.0015,m.gold,'Hand-chased breastplate flutes');
  }
 }

 c.visual.userData.armorCoverage={...p};c.visual.userData.coutureVersion=224;c.visual.userData.tailoring={system:'single outer shell',signature:role};
}
