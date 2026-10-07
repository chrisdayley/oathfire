import * as T from 'three';
import {form,cord,bead,leaf,foldedCloth,add} from './model-craft.js';
import {finishHeroCostume} from './hero-costume-finish.js';
import {heroArmorProfile} from './hero-armor-profile.js';
import {heroHair} from './hero-hair.js';

const ring=(g,y,x,z,m,r=.0025)=>cord(g,Array.from({length:33},(_,i)=>[Math.sin(i*Math.PI/16)*x,y,Math.cos(i*Math.PI/16)*z]),r,m,'Rolled garment edge');
function panel(g,rings,m,name,{fold=.008,tip=0}={}){
 const anchors=rings;rings=[];for(let j=0;j<anchors.length-1;j++)for(let k=0;k<4;k++){const t=k/4;rings.push(anchors[j].map((v,i)=>v+(anchors[j+1][i]-v)*t));}rings.push(anchors.at(-1));
 const p=[],uv=[],ix=[],cols=20,rows=rings.length-1;
 rings.forEach(([y,cx,width,z],j)=>{for(let i=0;i<=cols;i++){const u=i/cols,x=(u-.5)*width,t=j/rows;p.push(cx+x,y+tip*Math.abs(u-.5)*2*t**5,z+(Math.sin(u*Math.PI*4.2+t*1.7)*.68+Math.sin(u*19-t*3.1)*.32)*fold*(.3+.7*t)+Math.sin(t*17+u*3)*fold*.20*Math.exp(-t*3)-x*x*.25);uv.push(u,1-t);if(j<rows&&i<cols){const k=j*(cols+1)+i;ix.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}}});
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();return add(g,geo,m,name);
}
function buckle(g,x,y,z,m,size=.022){const o=add(g,new T.TorusGeometry(size,.003,5,4),m,'Cast belt buckle');o.position.set(x,y,z);o.rotation.z=Math.PI/4;cord(g,[[x-size,y,z],[x+size,y,z]],.0025,m,'Buckle tongue');}
function plate(g,rings,m,name){
 const o=form(g,rings,m,{sides:40,arc:Math.PI*2-.008,name}),p=o.geometry.attributes.position;
 // Broad plate surfaces have a central keel, flatter breast, and rounded
 // side returns. They are not a second elliptical barrel over the chest.
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i);if(z>0){const a=Math.atan2(x,z);p.setZ(i,z+Math.max(0,Math.cos(a))*.009*Math.exp(-x*x/ .003));}else p.setZ(i,z*.90);}
 o.geometry.computeVertexNormals();return o;
}
const BREAST_ROWS=[[-.177,.1518,.124,.104],[-.104,.17296,.145,.117],[-.024,.203,.149,.125],[.053,.211,.140,.119],[.126,.197,.123,.105],[.182,.151,.101,.086],[.207,.107,.083,.074],[.221,.076,.067,.064]];
function breastSection(y){
 let lo=BREAST_ROWS[0],hi=lo;
 for(const row of BREAST_ROWS){hi=row;if(row[0]>=y)break;lo=row;}
 const t=hi[0]===lo[0]?0:Math.max(0,Math.min(1,(y-lo[0])/(hi[0]-lo[0])));
 return lo.map((n,i)=>n+(hi[i]-n)*t);
}
function breastDepth(x,y){
 const [,w,d]=breastSection(y),u=Math.min(.998,Math.abs(x)/w);
 // Forged front planes meet at a sternum ridge and turn sharply around the
 // ribs. The cross section is deliberately not an inflated ellipse.
 const plane=u<.48?1-.15*u:u<.80?.928-(u-.48)*.71:.7008-(u-.80)*3.50;
 return d*Math.max(.004,plane)+.008*Math.exp(-((x/.018)**2));
}
function cuirass(g,m,rank){
 // Broad forged planes narrow to the natural waist. The sternum has a
 // shallow central keel; the front and back differ in depth and curvature.
 // This is the sole breast/back shell, over the fitted padded foundation.
 const positions=[],uv=[],indices=[],sides=48;
 for(let j=0;j<BREAST_ROWS.length;j++)for(let i=0;i<=sides;i++){
  const [y,w,front,back]=BREAST_ROWS[j],a=i/sides*Math.PI*2,s=Math.sin(a),co=Math.cos(a),x=s*w;
  let z=co>=0?breastDepth(x,y):back*co;
  let yy=y;
  if(j===0)yy+=.017*Math.abs(s);
  if(j===BREAST_ROWS.length-1)yy+=.015*Math.abs(s)-.013*Math.max(0,co);
  positions.push(x,yy,z);uv.push(i/sides,j/(BREAST_ROWS.length-1));
  if(j<BREAST_ROWS.length-1&&i<sides){const k=j*(sides+1)+i;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
 add(g,geo,m.steel,'Fitted keeled breast and backplate');
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
 // Flat side straps follow the actual armor surface. Protruding leather
 // tubes read as cuts through the plate when seen from the front.
 for(const side of [-1,1])for(const y of [-.117,.022]){
  const [,w,d,back]=breastSection(y),start=side>0?1.24:Math.PI*2-1.90;
  const strap=form(g,[[y-.006,w+.002,d+.002],[y+.006,w+.002,d+.002]],m.leather,{start,arc:.66,sides:12,name:'Flush cuirass side strap'}),v=strap.geometry.attributes.position;
  for(let i=0;i<v.count;i++){const x=v.getX(i),z=v.getZ(i);v.setZ(i,z>=0?breastDepth(x,y)+.002:back*z/(d+.002)-.002);}strap.geometry.computeVertexNormals();
  bead(g,[side*(w+.0025),y,.006],.003,m.gold,'Cuirass side fastening rivet');
 }

}
// Thin open-backed plates sit over the flexible foundation. The ends are
// rolled edges rather than closed disks, so joints no longer resemble beads.
function limbShell(g,rows,m,name,{front=1,arc=Math.PI*2-.008,edge=null,keel=.0025,shape=null}={}){
 const start=(front<0?Math.PI:0)-arc/2,o=form(g,rows,m,{start,arc,sides:36,name}),p=o.geometry.attributes.position;
 const deform=(x,y,z)=>{const q=[x,y,z+front*keel*Math.exp(-((x/.023)**2))];return shape?shape(...q):q;};
 for(let i=0;i<p.count;i++)p.setXYZ(i,...deform(p.getX(i),p.getY(i),p.getZ(i)));o.geometry.computeVertexNormals();
 if(edge)for(const j of [rows.length-1]){const [y,rx,rz,offset=0]=rows[j];cord(g,Array.from({length:13},(_,i)=>{const a=start+arc*i/12;return deform(Math.sin(a)*rx,y,offset+Math.cos(a)*rz);}),.0018,edge,name+' turned rim');}
 return o;
}
function forgedLegPlate(g,rows,m,name,rank=0){
 const section=y=>{let a=rows[0],b=a;for(const r of rows){b=r;if(y<=r[0])break;a=r;}const t=a[0]===b[0]?0:Math.max(0,Math.min(1,(y-a[0])/(b[0]-a[0])));return a.map((v,i)=>v+(b[i]-v)*t);};
 return limbShell(g,rows,m.steel,name,{front:-1,arc:Math.PI*2-.008,edge:rank>=3?m.gold:m.steel,keel:.002,shape:(x,y,z)=>{
  if(z>=0)return[x,y,z];const [,rx,rz]=section(y),u=Math.min(1,Math.abs(x)/rx);
  const plane=u<.44?1.04-.14*u:u<.78?.9784-(u-.44)*.68:.7472-(u-.78)*3.39;
  const envelope=Math.sin(Math.PI*Math.max(0,Math.min(1,(y-rows[0][0])/(rows.at(-1)[0]-rows[0][0]))))**.5;
  const flute=rank>=3?(.007*Math.exp(-(((u-.34)/.075)**2))+.005*Math.exp(-(((u-.65)/.07)**2)))*envelope:0;
  return[x,y,-Math.max(-z,rz*Math.max(0,plane))-flute];
 }});
}
function jointDefense(g,m,side,knee=false,rank=0){
 const outline=knee?[[0,-.061],[.044,-.046],[.061,-.017],[.057,.033],[.025,.062],[-.025,.062],[-.057,.033],[-.061,-.017],[-.044,-.046]]:
  [[0,-.043],[.041,-.030],[.056,0],[.039,.037],[0,.048],[-.039,.037],[-.056,0],[-.041,-.030]];
 const front=knee?-1:1,centerY=knee?.015:.010,base=knee?.025:.029,depth=knee?.061:.038,p=[],uv=[],ix=[],layers=5,n=outline.length;
 for(let j=0;j<=layers;j++){const t=j/layers;for(let i=0;i<=n;i++){const [x,y]=outline[i%n],xx=x*t,yy=y*t,z=front*(base+depth*Math.pow(1-t,.72)+.004*Math.exp(-((xx/.025)**2)));p.push(xx,centerY+yy,z);uv.push(xx*6+.5,yy*6+.5);if(j<layers&&i<n){const q=j*(n+1)+i;ix.push(q,q+1,q+n+1,q+1,q+n+2,q+n+1);}}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();add(g,geo,m.steel,knee?'Ridged polygonal poleyn':'Forged pointed elbow couter');
 const rim=outline.map(([x,y])=>[x,centerY+y,front*(base+.004*Math.exp(-((x/.025)**2)))]);cord(g,[...rim,rim[0]],.002,rank>=3?m.gold:m.steel,'Turned joint defense rim');
 // A shaped side wing covers the flexible joint from the outer side.
 if(knee||rank>=2){const wing=leaf(g,knee?[[-.021,-.043],[.023,-.061],[.063,-.025],[.057,.025],[.018,.057],[-.021,.032]]:[[-.024,-.040],[.016,-.060],[.062,-.034],[.070,.008],[.031,.056],[-.022,.035]],m.ivory,{depth:.005,bow:.016,name:knee?'Swept poleyn side wing':'Integrated swept couter wing'});wing.position.set(side*(knee?.047:.044),centerY,front*.020);wing.rotation.y=side*(knee?1.0:1.12);wing.scale.x=side;}

}
function shoulder(g,m,rank,scale=1,role='warden',side=1){
 const smith=role==='ashwright',ranger=role==='ranger',edge=rank>=3?m.gold:m.steel;
 // Low asymmetric saddle: close to the deltoid, broad at its crown and
 // tapering into the upper-arm lames instead of forming a spherical cap.
 const rows=[[-.112,.001,.001],[-.102,.039,.043],[-.079,.069,.069],[-.053,.095,.087],[-.039,.104,.092],[.026,.103,.089],[.056,.106,.090]].map(([y,x,z])=>[y,x*scale,z*scale]);
 const cap=limbShell(g,rows,m.steel,'Fitted saddle pauldron',{arc:Math.PI*2-.008,edge,keel:.005,shape:(x,y,z)=>[x,y-.012*(1-Math.min(1,Math.abs(x)/(.105*scale)))*Math.max(0,1-Math.abs(y+.012)/.065),z*(z>0?.94:1.03)]});
 const count=smith?1:ranger?2:rank>=4?4:3;
 if(!smith&&rank>=2)limbShell(g,[[.026,.100*scale,.086*scale],[.088,.094*scale,.081*scale],[.172,.073*scale,.064*scale]],m.recess,'Recessed pauldron sliding bed',{arc:5.05,keel:0});
 for(let j=0;j<count;j++){
  const y=.034+j*.032,rx=(.101-j*.008)*scale,rz=(.085-j*.006)*scale;
  limbShell(g,[[y,rx+.003,rz+.003],[y+.020,rx+.006,rz+.006],[y+.042,rx+.005,rz+.005],[y+.049,rx+.009,rz+.008],[y+.055,rx+.002,rz+.002]],j%2===0?m.ivory:m.steel,'Shingled pauldron lame',{arc:4.90,edge:m.ivory,keel:.005,shape:(x,yy,z)=>[x,yy+.010*Math.abs(x)/rx,z]});
 }
 if(role==='warden'&&rank>=3){
  const vertices=cap.geometry.attributes.position;
  for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i),out=Math.max(0,Math.min(1,(-side*x-.044)/.046)),sweep=Math.exp(-(((y+.026)/.046)**2))*out;
   vertices.setXYZ(i,x-side*.022*sweep,y-.016*sweep,z*(1-.10*sweep));
  }cap.geometry.computeVertexNormals();
 }


}
function articulatedFauld(hips,m,r,role){
 const edge=r>=3?m.gold:m.steel,rows=r>=4?4:3;
 for(let j=0;j<rows;j++){
  const y=.110-j*.045,w=.169+j*.013,d=.139+j*.008;
  limbShell(hips,[[y,w,d],[y-.026,w+.006,d+.003],[y-.053,w+.012,d+.006]],m.steel,'Overlapping flared fauld lame',{arc:5.78,edge,keel:.002});
 }
 for(const side of [-1,1]){
  const count=r>=5?5:r>=2?4:3,length=r>=5?.285:.245;
  for(let j=0;j<count;j++){
   const t=j/(count-1),half=.081-.022*t,center=side*(.115+.016*t),y=-.020-j*length/count,z=.169+.008*Math.sin(t*Math.PI),positions=[],uv=[],ix=[],cols=16,rows=8;
   for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
    const v=row/rows,u=col/cols*2-1,xx=u*half*(1-.12*v),yy=y+.019-v*.077+.012*u*u*v*v,zz=.009+.019*(1-u*u)-.019*u*u+.003*Math.sin(v*Math.PI);
    positions.push(xx,yy,zz);uv.push(col/cols,v);
    if(row<rows&&col<cols){const k=row*(cols+1)+col;ix.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}
   }
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();
   const plate=add(hips,geo,j%2===0?m.steel:m.ivory,'Curved overlapping articulated tasset');plate.position.set(center,0,z-.010);plate.rotation.y=side*.17;plate.userData.heroLegFollow={bone:'upperleg.'+(side>0?'l':'r'),weight:.94};
   const lip=[];for(let col=0;col<=cols;col++){const k=rows*(cols+1)+col,v=new T.Vector3().fromBufferAttribute(geo.attributes.position,k);v.z+=.001;plate.updateMatrix();v.applyMatrix4(plate.matrix);lip.push(v.toArray());}
   const hem=cord(hips,lip,.0024,m.ivory,'Rolled articulated tasset return');hem.userData.heroLegFollow={...plate.userData.heroLegFollow};
   const lining=geo.clone();lining.translate(0,0,-.005);const under=add(hips,lining,m.recess,'Recessed articulated tasset backing');under.position.copy(plate.position);under.rotation.copy(plate.rotation);under.userData.heroLegFollow={...plate.userData.heroLegFollow};
  }
 }

}
function boot(g,m,steel){
 // A broad toe box, raised instep and flat welt keep the foot from reading
 // as a pointed slipper. +Y follows the toe; +Z points toward the sole.
 const rows=[[-.026,.039,.040,.004],[.026,.053,.052,.003],[.088,.060,.051,.006],[.155,.053,.039,.013],[.220,.039,.026,.023],[.246,.029,.018,.027]];
 const o=form(g,rows,steel?m.recess:m.leather,{name:'Fitted square-toe boot foundation',sides:32}),p=o.geometry.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(y>.12)p.setX(i,Math.sign(x)*Math.pow(Math.abs(x)/.06,.72)*.06);if(z>.032)p.setZ(i,.032+(z-.032)*.38);}o.geometry.computeVertexNormals();
 if(steel){
  const section=y=>{let a=rows[0],b=a;for(const row of rows){b=row;if(y<=row[0])break;a=row;}const t=a[0]===b[0]?0:(y-a[0])/(b[0]-a[0]);return a.map((v,i)=>v+(b[i]-v)*t);};
  for(let j=0;j<5;j++){
   const y=.039+j*.038,lame=[];
   for(const [dy,raise]of [[0,.005],[.027,.006],[.041,.010],[.046,.004]]){const [,rx,rz,off]=section(y+dy);lame.push([y+dy,rx+.003,rz+raise,off-.002]);}
   limbShell(g,lame,j%2===0?m.ivory:m.steel,'Overlapping sabaton instep plate',{front:-1,arc:3.15,edge:m.ivory,keel:.004});
  }

 }else for(let j=0;j<3;j++)cord(g,[[-.033,.057+j*.033,-.043],[.034,.069+j*.033,-.042]],.0015,m.dark,'Boot crossing laces');
}
function lantern(g,m,x){
 const h=new T.Group();h.position.set(x,-.095,.06);g.add(h);
 for(const y of [-.16,.032]){const cap=add(h,new T.CylinderGeometry(.037,.044,.018,10),m.gold,'Lantern pierced cap');cap.position.y=y;}
 const glass=m.ember.clone();glass.transparent=true;glass.opacity=.67;const core=add(h,new T.SphereGeometry(1,12,10),glass,'Amber lantern glass');core.scale.set(.028,.078,.028);core.position.y=-.064;
 for(let i=0;i<6;i++){const a=i*Math.PI/3;cord(h,[[Math.sin(a)*.038,-.155,Math.cos(a)*.038],[Math.sin(a)*.035,.025,Math.cos(a)*.035]],.004,m.dark,'Lantern cage upright');}
 const loop=add(h,new T.TorusGeometry(.021,.003,5,16),m.gold,'Lantern hanging ring');loop.position.y=.059;cord(h,[[0,.081,0],[0,.135,-.024]],.004,m.gold,'Lantern suspension');return glass;
}
function wrappedScarf(g,m,role,plateCoverage=false){
 form(g,[[.165,.096,.09],[.218,.082,.078],[.259,.068,.067]],m.cloth,{name:'Fitted wool neck wrap',sides:36});
 for(let layer=0;layer<2;layer++){
  const path=new T.CatmullRomCurve3([new T.Vector3(-.173,.168-layer*.018,.100),new T.Vector3(-.088,.119-layer*.030,.160),new T.Vector3(.028,.128-layer*.028,.178),new T.Vector3(.157,.183-layer*.018,.113)]),v=[],u=[],ix=[],cols=36,rows=6;
  for(let j=0;j<=cols;j++){const t=j/cols,p=path.getPoint(t);for(let k=0;k<=rows;k++){const q=k/rows;v.push(p.x,p.y+(q-.5)*.047,p.z+Math.sin(q*Math.PI)*.007+Math.sin(t*21+q*5)*.0018);u.push(t,q);if(j<cols&&k<rows){const n=j*(rows+1)+k;ix.push(n,n+1,n+rows+1,n+1,n+rows+2,n+rows+1);}}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(u,2));geo.setIndex(ix);if(plateCoverage){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.max(p.getZ(i),breastDepth(x,y)+.018)+(role==='ranger'?.024:0));}}geo.computeVertexNormals();add(g,geo,m.cloth,'Overlapping diagonal scarf wrap');
 }
 if(role==='ranger'){
  const tail=panel(g,[[.13,-.135,.061,.166],[.015,-.159,.058,.191],[-.13,-.141,.062,.175],[-.235,-.127,.056,.177]],m.cloth,'Loose ranger scarf tail',{fold:.004,tip:.02});
  if(plateCoverage){const p=tail.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)+.045);tail.geometry.computeVertexNormals();}
 }
}
function rangerHood(head,m,enclosed=false){
 // The opening narrows below the ear into the scarf. Above it the cloth lies
 // a few millimetres over the helmet instead of forming a separate tall box.
 const anchors=[[-.040,.075,.078,-.003,.78],[.005,.089,.107,-.012,.86],[.073,.115,.130,-.015,.98],[.145,.118,.134,-.010,.96],[.207,.113,.125,-.010,.91],[.249,.089,.107,-.012,.76],[.274,.058,.072,-.013,.47],[.288,.031,.039,-.018,.27],[.296,.002,.004,-.021,0]],rows=[];
 for(let j=0;j<anchors.length-1;j++)for(let k=0;k<5;k++){
  const t=k/5,smooth=t*t*(3-2*t);rows.push(anchors[j].map((v,i)=>v+(anchors[j+1][i]-v)*(i===0?t:smooth)));
 }rows.push(anchors.at(-1));
 const sides=64,positions=[],uv=[],indices=[],edges=[[],[]],bell=(v,w)=>Math.exp(-((v/w)**2));
 for(let j=0;j<rows.length;j++){
  const [y,rx,rz,offset,start]=rows[j];
  for(let i=0;i<=sides;i++){
   const u=i/sides,a=start+u*(Math.PI*2-start*2),sa=Math.sin(a),co=Math.cos(a),rear=Math.max(0,-co),low=Math.max(0,Math.min(1,(.13-y)/.17));
   const edgeFade=Math.sin(u*Math.PI)**.6;
   // Broad diagonal folds collect behind the temple and at the lower nape.
   // They have unequal spacing and depth, with shallow valleys beside them.
   let folds=0;
   for(const side of [-1,1]){
    const sideAngle=side<0?Math.PI*2-a:a,k=side<0?.85:1;
    folds+=k*((.0078*bell(sideAngle-(1.75+(y-.08)*1.6),.21)-.0025*bell(sideAngle-(2.01+(y-.08)*1.6),.19))*bell(y-.104,.113)+(.007*bell(sideAngle-(2.37-(y-.02)*1.8),.23)-.002*bell(sideAngle-(2.64-(y-.02)*1.8),.20))*bell(y-.022,.094));
   }
   // Two broad diagonal gathers bend from the cheek toward the nape, where
   // excess cloth settles. They break up the smooth rear/side shell without
   // cutting inward through the helmet below it.
   const sideA=Math.min(a,Math.PI*2-a),sideWeight=bell(sideA-1.95,.90),asym=sa<0?.92:1;
   folds+=sideWeight*asym*(.0095*bell(y-(.119+.052*(sideA-1.7)),.019)+.008*bell(y-(.018+.046*(sideA-1.7)+.003*Math.sin(sideA*3)),.023));
   folds*=edgeFade;
   const earRoom=enclosed?.014*bell(y-.115,.095):0;const x=sa*(rx+folds+earRoom),yy=y-.018*rear*low+Math.sin(a*3.1+y*16)*.002*edgeFade*Math.sin(j/(rows.length-1)*Math.PI),z=offset+co*(rz+folds+earRoom*.40)-.009*rear*low;
   positions.push(x,yy,z);uv.push(u,j/(rows.length-1));
   if(i===0)edges[0].push([x,yy,z]);if(i===sides)edges[1].push([x,yy,z]);
   if(j<rows.length-1&&i<sides){const q=j*(sides+1)+i;indices.push(q,q+1,q+sides+1,q+1,q+sides+2,q+sides+1);}
  }
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();add(head,geometry,m.cloth,'Draped close ranger hood');
 // A cloth roll follows the actual curved edge; a thin stitched inset avoids
 // the old straight leather cords hanging in front of the hood.
 for(const edge of edges){cord(head,edge,.0028,m.cloth,'Soft rolled hood opening');cord(head,edge.map(([x,y,z])=>[x+Math.sign(x)*.0015,y,z-.0015]),.00065,m.stitch,'Hood opening hand stitching');}
}
function closedBascinet(head,m,rank,role){
 const rows=[[-.054,.061,.075,.088],[-.026,.079,.088,.126],[.026,.104,.108,.150],[.075,.113,.119,.164],[.107,.117,.122,.164],[.122,.116,.122,.160],[.172,.110,.119,.142],[.222,.092,.104,.112],[.258,.057,.071,.068],[.275,.005,.012,.010]],sides=64,p=[],uv=[],shell=[],visor=[];
 const point=(row,a)=>{const [y,w,back,front]=row,x=Math.sin(a)*w,co=Math.cos(a),u=Math.abs(Math.sin(a));
  const plane=u<.40?1-.13*u:u<.78?.948-(u-.4)*.94:.5908-(u-.78)*2.68;
  return[x,y,co>=0?front*Math.max(.004,plane)+.007*Math.exp(-((x/.016)**2)):-.012+back*co];};
 for(let j=0;j<rows.length;j++)for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2;p.push(...point(rows[j],a));uv.push(i/sides,j/(rows.length-1));if(j<rows.length-1&&i<sides){const mid=(i+.5)/sides*Math.PI*2,front=Math.cos(mid)>.62;if(j===4&&front)continue;const k=j*(sides+1)+i,target=j<4&&Math.cos(mid)>.25?visor:shell;target.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex([...shell,...visor]);geo.computeVertexNormals();const vg=geo.clone();geo.setIndex(shell);vg.setIndex(visor);add(head,geo,m.steel,'Continuous high bascinet crown ears and nape');add(head,vg,m.ivory,'Integrated ridged visor and throat bevor');
 for(const j of [4,5])cord(head,Array.from({length:25},(_,i)=>point(rows[j],-.90+i*.075)),.0022,m.steel,'Bascinet eye slit folded lip');
 for(const side of [-1,1]){
  const hinge=add(head,new T.CylinderGeometry(.008,.008,.005,12),m.gold,'Flush visor pivot');hinge.rotation.z=Math.PI/2;hinge.position.set(side*.124,.112,.012);
  for(let i=0;i<3;i++)cord(head,[[side*(.030+i*.017),.045,.163-i*.013],[side*(.030+i*.017),.060,.167-i*.013]],.0016,m.recess,'Recessed visor breathing vent');
 }
 // The ridge is part of the shell profile. Only its short crest is gilded.
 if(role==='warden')cord(head,[[0,.177,.144],[0,.227,.113],[0,.275,.015],[0,.258,-.073],[0,.223,-.116]],rank>=6?.004:.003,m.gold,'Bascinet fitted crown crest');
}
function helmet(head,m,r,role){
 const smith=role==='ashwright',ranger=role==='ranger';
 if(r>=5&&!smith){closedBascinet(head,m,r,role);return;}
 const cap=form(head,[[.279,.003,.005,-.014],[.270,.041,.049,-.014],[.251,.072,.086,-.012],[.228,.094,.106,-.010],[.199,.105,.119,-.006],[.165,.104,.125,-.004]],m.steel,{name:smith?'Low open forge helmet':ranger?'Close hunter helmet within hood':'Keeled sunward helmet',sides:60});
 const pos=cap.geometry.attributes.position;
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),front=Math.max(0,(z-.014)/.115),crest=!smith&&!ranger?.007*Math.exp(-((x/.026)**2))*Math.max(0,(y-.20)/.08):0;
  pos.setY(i,y+(y<.215?front*.025*(.215-y)/.050:0)+crest-(smith?.009:0));
 }cap.geometry.computeVertexNormals();
 const brow=[[-.104,.159,.014],[-.084,.171,.082],[-.043,.186,.116],[0,.190,.124],[.043,.186,.116],[.084,.171,.082],[.104,.159,.014]].map(([x,y,z])=>[x,y-(smith?.009:0),z]);
 cord(head,brow,.0026,r>=2?m.gold:m.steel,'Close rolled helmet brow');
 // A short, turned nape follows the neck. It replaces the straight hanging
 // bucket wall, leaving room for natural temple and sideburn hair.
 const nape=form(head,[[.072,.078,.100,-.014],[.103,.096,.118,-.010],[.166,.104,.124,-.006]],m.steel,{start:1.40,arc:Math.PI*2-2.80,name:'Shaped helmet nape defense',sides:40});
 const np=nape.geometry.attributes.position;for(let i=0;i<np.count;i++){const y=np.getY(i),x=np.getX(i);np.setY(i,y+Math.max(0,(.106-y)/.034)*.019*Math.abs(x)/.10);}nape.geometry.computeVertexNormals();
 const patch=(pts,name,mat=m.steel)=>{const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pts.flat(),3));geo.setAttribute('uv',new T.Float32BufferAttribute(pts.flatMap(([x,y])=>[x*4+.5,y*4+.5]),2));const ix=[];for(let i=1;i<pts.length-1;i++)ix.push(0,i,i+1);geo.setIndex(ix);geo.computeVertexNormals();return add(head,geo,mat,name);};
 if(!smith&&!ranger||r>=4)for(const side of [-1,1]){
  const pts=[[side*.092,.146,.036],[side*.096,.096,.064],[side*.083,.036,.075],[side*.065,.022,.067],[side*.064,.071,.076],[side*.080,.120,.066]];
  patch(pts,'Fitted angled helmet cheek');cord(head,[...pts,pts[0]],.0017,r>=2?m.gold:m.steel,'Turned cheekguard edge');bead(head,[side*.094,.128,.055],.003,m.gold,'Cheekguard hinge');
 }
 if(r>=5&&!smith){
  // A late bascinet encloses the forehead down to the actual eye line. The
  // former open cap left a broad exposed band above a separate face mask.
  for(const side of [-1,1]){
   const browPlate=[[0,.186,.140],[side*.050,.182,.134],[side*.095,.160,.092],[side*.096,.111,.096],[side*.065,.118,.134],[side*.018,.121,.148],[0,.116,.151]];
   patch(browPlate,'Continuous bascinet forehead and temple');
   cord(head,[browPlate[3],browPlate[4],browPlate[5],browPlate[6]],.0018,m.steel,'Narrow bascinet eye opening');
  }
  for(const side of [-1,1]){
   const pts=[[0,.105,.176],[side*.047,.109,.159],[side*.084,.081,.112],[side*.081,.025,.098],[side*.039,-.002,.143],[0,.004,.155]];
   patch(pts,'Wraparound ridged closed visor');cord(head,[...pts,pts[0]],.0018,m.gold,'Visor folded return');
   patch([[0,.010,.158],[side*.040,.000,.143],[side*.081,.025,.098],[side*.071,-.024,.067],[side*.029,-.039,.071],[0,-.035,.090]],'Articulated jaw and throat bevor');
   for(let j=0;j<3;j++)cord(head,[[side*(.022+j*.014),.035,.164-j*.015],[side*(.026+j*.014),.059,.170-j*.014]],.0014,m.dark,'Inset visor breathing slot');
  }
  cord(head,[[0,.006,.157],[0,.102,.178],[0,.185,.135],[0,.281,.021]],.0028,m.gold,'Helm central ridge');
 }else if(!smith&&!ranger){
  const rows=[[.188,.123,.006],[.145,.128,.0058],[.100,.141,.0056],[.075,.149,.005]];
  for(let j=0;j<rows.length-1;j++){
   const [y,z,w]=rows[j],[y2,z2,w2]=rows[j+1];
   for(const side of [-1,1])patch([[0,y,z+.002],[side*w,y,z],[side*w2,y2,z2],[0,y2,z2+.002]],'Close fitted ridged nasal guard');
  }
 }
 if(r>=3)cord(head,[[0,.274,.045],[0,.281,-.025],[0,.221,-.130]],.0027,m.gold,'Helmet chased crest');
 if(smith)for(const side of [-1,1]){
  for(const y of [.181,.191])bead(head,[side*.105,y,.004],.0025,m.gold,'Forge helmet fastening');
 }
}
export function tailoredHero(c,part,m){
 const p=heroArmorProfile(c);if(!p)return;const r=p.rarity,role=c.design,smith=role==='ashwright',ranger=role==='ranger',warden=role==='warden',steel=warden||p.plate;
 const recess=m.steel.clone();recess.color.multiplyScalar(.37);recess.roughness=.68;recess.onBeforeCompile=m.steel.onBeforeCompile;recess.customProgramCacheKey=m.steel.customProgramCacheKey;c.materials.push(recess);m={...m,recess};
 const scoutPlate=m.steel.clone();scoutPlate.color.setHex(0x504a3e);scoutPlate.onBeforeCompile=m.steel.onBeforeCompile;scoutPlate.customProgramCacheKey=m.steel.customProgramCacheKey;c.materials.push(scoutPlate);
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
  const pl=plate(chest,[[-.30,.14076,.127],[-.245,.1518,.133],[-.190,.16284,.139],[-.158,.16652,.146]],m.steel,'Fitted overlapping plackart');
  const pv=pl.geometry.attributes.position;
  for(let i=0;i<pv.count;i++){
   const x=pv.getX(i),z=pv.getZ(i),y=pv.getY(i),u=Math.min(1,Math.abs(x)/.16652);
   if(z>0){
    if(y>-.18){const yy=y+.061*Math.max(0,1-u/.84);pv.setY(i,yy);pv.setZ(i,breastDepth(x,yy)+.007);}
    else {const t=Math.max(0,Math.min(1,(y+.30)/.11)),w=.14076+(.16284-.14076)*t,v=Math.min(.999,Math.abs(x)/w),depth=.127+.012*t;
     const plane=v<.48?1-.15*v:v<.80?.928-(v-.48)*.71:.7008-(v-.80)*3.50;
     pv.setZ(i,depth*Math.max(.004,plane)+.010*Math.exp(-((x/.022)**2)));
     if(y<-.27)pv.setY(i,y+.025*u-.012*(1-u));
    }
   }
  }pl.geometry.computeVertexNormals();
  cord(chest,Array.from({length:31},(_,i)=>{const x=(i/30-.5)*.31,u=Math.min(1,Math.abs(x)/.16652),y=-.158+.061*Math.max(0,1-u/.84);return[x,y,breastDepth(x,y)+.009];}),.002,m.gold,'Plackart pointed folded overlap');
  if(r>=5){
   const gorget=form(chest,[[.157,.108,.085],[.185,.094,.076],[.218,.077,.069],[.248,.070,.067]],m.steel,{name:'High anatomical plate gorget',sides:40}),v=gorget.geometry.attributes.position;
   for(let i=0;i<v.count;i++){const y=v.getY(i),z=v.getZ(i);if(y>.215)v.setY(i,y+(-.019*Math.max(0,z/.067)+.010*Math.max(0,-z/.067))*(y-.215)/.033);}
   gorget.geometry.computeVertexNormals();
   cord(chest,Array.from({length:17},(_,i)=>{const a=i*Math.PI/8,z=Math.cos(a)*.067;return[Math.sin(a)*.070,.248-.019*Math.max(0,z/.067)+.010*Math.max(0,-z/.067),z];}),.0018,m.steel,'Gorget folded throat rim');
  }else{
   form(chest,[[.157,.108,.085],[.183,.094,.076],[.204,.076,.067],[.219,.069,.064]],m.steel,{name:'Low fitted gorget within cuirass'});ring(chest,.219,.069,.064,r>=3?m.gold:m.steel,.0018);
  }
  articulatedFauld(hips,m,r,role);
 }
 if(smith){
  wrappedScarf(chest,{...m,cloth:m.dark},role,p.plate);
  {
   const lift=p.plate?.039:0;
   panel(chest,[[.15,0,.23,.156+lift],[.03,0,.31,.17+lift],[-.07,0,.254,.161+lift],[-.122,0,.186,.155+lift],[-.17,0,.176,.152+lift]],m.leather,'Tailored smith bib',{fold:.003});
   for(const s of [-1,1]){cord(chest,[[s*.155,.175,.051],[s*.12,.12,.165+lift],[s*.112,-.073,.176+lift]],.012,m.leather,'Apron shoulder strap');buckle(chest,s*.118,.089,.183+lift,m.gold,.016);}
  }
  for(const s of [-1,1]){panel(hips,[[.11,s*.085,.178,.145],[-.10,s*.09,.20,.156],[-.30,s*.104,.213,.17],[-.48,s*.122,.228,.163]],p.plate?m.dark:m.leather,'Sculpted forge apron',{fold:.008,tip:.018});cord(hips,[[s*.16,.06,.159],[s*.18,-.20,.182],[s*.215,-.465,.176]],.0016,m.stitch,'Apron stitched hem');}
  for(const s of [-1,1]){const pouch=form(hips,[[-.16,.042,.015],[-.15,.047,.027],[-.058,.045,.025],[-.04,.035,.016]],m.leather,{name:'Soft leather tool pouch'});pouch.position.set(s*.101,0,.161);const flap=leaf(hips,[[-.047,-.044],[.047,-.044],[.042,-.072],[0,-.090],[-.04,-.072]],m.leather,{bow:.009,name:'Folded tool pouch flap'});flap.position.set(s*.101,0,.194);bead(hips,[s*.101,-.068,.210],.004,m.gold);}
  c.materials.push(lantern(hips,m,-.213));
 }
 if(warden){
  const inset=m.cloth.clone();inset.color.setHex(r>=5?0x254555:0xb3ae94);inset.onBeforeCompile=m.cloth.onBeforeCompile;inset.customProgramCacheKey=m.cloth.customProgramCacheKey;c.materials.push(inset);
  for(const s of [-1,1]){
   const skirt=panel(hips,[[.12,s*.041,.067,.150],[-.1,s*.042,.067,.174],[-.25,s*.042,.063,.180],[-.40,s*.045,.062,.166]],m.cloth,'Ranked split mantle',{fold:.012,tip:.065});
   if(r>=2){const geo=skirt.geometry.clone(),p=geo.attributes.position,uv=geo.attributes.uv,index=geo.index.array,selected=[];for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)+.005);for(let i=0;i<index.length;i+=3){const center=(uv.getX(index[i])+uv.getX(index[i+1])+uv.getX(index[i+2]))/3;if(center>.25&&center<.45)selected.push(index[i],index[i+1],index[i+2]);}geo.setIndex(selected);const band=add(hips,geo,inset,'Ranked split mantle ivory inset');band.castShadow=false;}
   cord(hips,[[s*.067,.09,.168],[s*.066,-.18,.191],[s*.073,-.345,.179]],.002,m.gold,'Surcoat embroidered outer border');

  }
 }
 if(ranger){
  wrappedScarf(chest,m,role,p.plate);
  rangerHood(head,m,p.plate);
  for(const s of [-1,1]){
   for(let j=0;j<2;j++){const length=(s<0?.32:.47)+j*.065,a=panel(hips,[[.11,0,.13,.016],[-.055,s*.018,.152,.027],[-length*.52,s*.035,.154,.033],[-length*.87,s*.053,.125,.018],[-length,s*.044,.073,.009]],j===0&&s>0?m.cloth:m.leather,'Split leather coat',{fold:.009,tip:.017});a.position.set(s*(.095+j*.077),0,.144-j*.047);a.rotation.y=s*(.29+j*.36);a.rotation.z=s*-.09;}
   const chestpiece=panel(chest,[[.15,s*.092,.035,.124],[.092,s*.103,.156,.137],[-.015,s*.098,.167,.164],[-.13,s*.085,.147,.143],[-.26,s*.075,.130,.147]],s<0?m.leather:m.steel,'Curved asymmetric brigandine',{fold:.002});const cp=chestpiece.geometry.attributes.position;for(let k=0;k<cp.count;k++)cp.setZ(k,cp.getZ(k)-cp.getX(k)**2*.9+(p.plate?.035:0));chestpiece.geometry.computeVertexNormals();for(let j=0;j<5;j++)bead(chest,[s*.13,.072-j*.051,.158+(p.plate?.035:0)],.0028,m.gold,'Brigandine fastening rivet');
  }
  cord(chest,[[-.178,.17,.055],[-.1,.087,.174],[.04,-.05,.185],[.161,-.16,.097]].map(([x,y,z])=>[x,y,z+(p.plate?.043:0)]),.015,m.leather,'Diagonal bow harness');for(const y of [-.13,.065])cord(chest,[[.15,y,-.133],[.25,y,-.18],[.33,y,-.19]],.005,m.leather,'Quiver suspension strap');buckle(chest,-.04,.035,.193+(p.plate?.043:0),m.gold,.018);c.materials.push(lantern(hips,m,-.21));
 }
 form(hips,[[.11,.172,.148],[.177,.172,.148]],m.leather,{name:'Fitted equipment belt'});ring(hips,.15,.170,.140,m.stitch,.0015);buckle(hips,.015,.124,.147,m.gold,.025);
 for(const s of [-1,1]){
  const side=s>0?'l':'r',arm=part('upperarm'+side),fore=part('lowerarm'+side),thigh=part('upperleg'+side),shin=part('lowerleg'+side),foot=part('foot'+side);
  if(!smith||p.sleeves){form(arm,[[-.044,.03,.032],[.01,.085,.082],[.105,.077,.074],[.21,.060,.060],[.298,.05,.05]],p.sleeves||warden?m.mail:m.dark,{name:'Fitted upper sleeve'});form(fore,[[-.027,.049,.046],[.07,.062,.057],[.16,.049,.049],[.25,.038,.038]],warden||p.sleeves?m.mail:m.dark,{name:'Flexible forearm sleeve'});}
  shoulder(arm,smith?{...m,ivory:m.steel}:ranger&&s<0?{...m,steel:p.plate?scoutPlate:m.leather,ivory:p.plate?scoutPlate:m.leather}:m,r,ranger?(s>0?1.02:.94):smith?.94:.91,role,s);
  if(p.sleeves||warden){
   limbShell(arm,[[.126,.075,.073],[.175,.071,.069],[.215,.061,.063],[.263,.053,.055],[.286,.057,.058],[.294,.055,.056]],m.recess,'Close upper arm articulated backing');
   limbShell(arm,[[.132,.078,.076],[.175,.074,.074],[.217,.067,.070],[.227,.071,.074],[.233,.065,.068]],m.steel,'Overlapping upper rerebrace plate',{arc:5.36,edge:m.ivory,keel:.005});
   limbShell(arm,[[.215,.064,.066],[.257,.059,.061],[.284,.063,.065],[.294,.055,.058]],m.ivory,'Flared elbow rerebrace plate',{arc:5.20,edge:m.steel,keel:.004});
  }
  if(warden||p.sleeves){
   limbShell(fore,[[.022,.059,.060],[.093,.064,.063],[.192,.051,.051],[.255,.042,.043]],m.recess,'Vambrace recessed articulated backing');
   limbShell(fore,[[.037,.064,.065],[.080,.070,.069],[.129,.063,.063],[.145,.066,.066],[.153,.058,.060]],m.steel,'Forged overlapping dorsal vambrace',{arc:4.85,edge:m.ivory,keel:.007});
   limbShell(fore,[[.143,.057,.058],[.181,.055,.056],[.205,.057,.058],[.213,.050,.052]],m.ivory,'Sliding lower vambrace plate',{arc:4.78,edge:m.steel,keel:.005});
   limbShell(fore,[[.204,.050,.052],[.240,.047,.050],[.255,.049,.052],[.263,.043,.046]],m.steel,'Articulated gauntlet cuff defense',{arc:4.85,edge:m.ivory,keel:.004});
   jointDefense(fore,m,s,false,r);
  }else{form(fore,[[.125,.053,.051],[.21,.043,.043],[.24,.04,.04]],m.leather,{name:'Leather wrist bracer'});for(const y of [.14,.214])ring(fore,y,y<.2?.055:.044,y<.2?.053:.045,m.gold,.002);}
  const pants=form(thigh,[[-.035,.102,.105],[.065,.106,.106],[.17,.093,.086],[.31,.071,.067],[.438,.050,.051]],m.dark,{name:'Shaped cloth breeches'});const pp=pants.geometry.attributes.position;for(let i=0;i<pp.count;i++){const y=pp.getY(i),k=1+.026*Math.sin(y*72+pp.getX(i)*15);pp.setX(i,pp.getX(i)*k);pp.setZ(i,pp.getZ(i)*k);}pants.geometry.computeVertexNormals();
  form(shin,[[-.027,.054,.059],[.07,.067,.063],[.16,.062,.059],[.30,.043,.045],[.421,.039,.041]],m.leather,{name:'Fitted riding boot shaft'});
  if(steel){
   forgedLegPlate(shin,[[.040,.065,.068],[.085,.070,.071],[.125,.072,.070],[.185,.067,.067],[.235,.060,.062],[.32,.048,.052],[.401,.044,.047]],m,'Faceted fluted anatomical greave',r);jointDefense(shin,m,s,true,r);
   if(p.plate||warden&&r>=2){
    forgedLegPlate(thigh,[[.030,.115,.112],[.115,.112,.105],[.225,.098,.090],[.303,.082,.079],[.367,.068,.068]],m,'Formed fluted cuisse',r);
    for(let j=0;j<2;j++){const y=.333+j*.040,rx=.077-j*.008,rz=.077-j*.006;limbShell(thigh,[[y,rx,rz],[y+.028,rx-.003,rz-.002],[y+.055,rx-.008,rz-.006]],m.steel,'Articulating lower cuisse lame',{front:-1,arc:3.82,edge:r>=3?m.gold:m.steel,keel:.004});}
   }
  }else if(ranger){const gr=leaf(shin,[[-.047,.02],[0,-.014],[.047,.02],[.041,.18],[.025,.32],[-.03,.28]],m.steel,{bow:.017,name:'Hunter shin splint'});gr.position.z=-.073;gr.rotation.y=Math.PI;}
  if(!steel)for(const y of [.105,.28]){ring(shin,y,y<.2?.071:.049,y<.2?.073:.051,m.dark,.004);buckle(shin,s*(y<.2?.070:.05),y,-.01,m.gold,.008);}
  boot(foot,m,steel);
 }
 finishHeroCostume(c,part,m,p);
 helmet(head,m,r,role);
 heroHair(c,head,m,p);
 if(r>=5&&!smith)for(const o of [...head.children])if(/forelock/i.test(o.name)){o.geometry?.dispose();o.removeFromParent();}

 
 // Signature heraldry is inset into the plate; prestige upgrades keep class
 // tailoring instead of adding the same huge halo and spikes to every hero.
 if(r>=2&&warden){const ringo=add(chest,new T.TorusGeometry(.034,.0025,5,24),m.gold,'Inset sun seal');ringo.position.set(0,.039,breastDepth(0,.039)+.004);for(let j=0;j<12;j++){const a=j*Math.PI/6;const points=[.04,.052].map(rad=>{const x=Math.sin(a)*rad,y=.039+Math.cos(a)*rad;return[x,y,breastDepth(x,y)+.004];});cord(chest,points,.0018,m.gold,'Sun engraved rays');}}
 if(r>=3){
  for(const s of [-1,1]){
   if(steel)cord(chest,[[s*.055,.173],[s*.125,.150],[s*.175,.10]].map(([x,y])=>[x,y,breastDepth(x,y)+.003]),.002,m.gold,'Upper breastplate rolled border');

  }
 }
 if(r>=4){
  // Class-specific raised work is kept close to the armor rather than a halo.
  if(warden&&r<5){
   // A fitted comb follows the crown. Detached paired points read as cat
   // ears, so prestige is expressed through the helmet's actual construction.
   cord(head,[[0,.186,.127],[0,.248,.089],[0,.286,.013],[0,.278,-.06],[0,.223,-.133]],r>=6?.007:.005,m.gold,'Fitted sunward helmet comb');
   for(const s of [-1,1])cord(head,[[s*.045,.186,.117],[s*.067,.233,.071],[s*.052,.260,-.015],[s*.041,.23,-.112]],.0025,m.gold,'Helmet crown chased seam');
  }
  if(smith){for(const side of [-1,1])for(let j=0;j<3;j++)cord(head,[[side*.093,.167+j*.012,.045],[side*.103,.166+j*.012,.018]],.0015,m.dark,'Inset forge helmet vent');}
  if(ranger)for(const side of [-1,1]){const clasp=add(head,new T.TorusGeometry(.012,.002,5,16),m.gold,'Ranger temple hood clasp');clasp.position.set(side*.102,.153,.07);}
 }
 if(r>=5){
  const glow=m.ember.clone();glow.color.setHex(smith?0xffa652:warden?0xe4c777:0x6cb6d0);glow.emissive.copy(glow.color);glow.emissiveIntensity=.75;c.materials.push(glow);
  for(const s of [-1,1]){cord(chest,[[s*.125,.13],[s*.15,.045],[s*.115,-.064]].map(([x,y])=>[x,y,breastDepth(x,y)+.003]),.0028,glow,'Inlaid prestige channels');

  }
 }

 c.visual.userData.armorCoverage={...p};c.visual.userData.coutureVersion=226;c.visual.userData.tailoring={system:'single outer shell',signature:role};
}
