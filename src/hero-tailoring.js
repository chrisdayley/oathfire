import {heroArmorProfile} from './hero-armor-profile.js';
import * as T from 'three';

const add=(g,geo,m,name)=>{const o=new T.Mesh(geo,m);o.name=name;o.castShadow=o.receiveShadow=true;g.add(o);return o;};
function seam(g,points,m,r=.0025,name='Tailored seam'){
 return add(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(8,points.length*4),r,5,false),m,name);
}
function panel(g,points,z,m,name){
 const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
 const o=add(g,new T.ExtrudeGeometry(s,{depth:.004,bevelEnabled:true,bevelSize:.003,bevelThickness:.002,bevelSegments:1}),m,name);o.position.z=z;return o;
}
// Fitted, convex plates with a central ridge and overlapping lower lames.
// Their small changes in surface angle catch light while joints stay recessed.
function shoulder(g,mats,smith,rank){
 const rows=[[-.06,.044,.042],[-.035,.095,.075],[.013,.11,.092],[.062,.102,.085],[.095,.087,.069]],p=[],uv=[],idx=[],n=12;
 rows.forEach(([y,rx,rz],j)=>{for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,x=Math.sin(a)*rx,z=Math.cos(a)*rz;p.push(x,y,z);uv.push(i/n,j/(rows.length-1));if(j<rows.length-1&&i<n){const k=j*(n+1)+i;idx.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}});
 const top=p.length/3;p.push(0,-.075,0);uv.push(.5,0);for(let i=0;i<n;i++)idx.push(top,i+1,i);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();add(g,geo,mats.steel,'Articulated shoulder shell');
 for(const y of [.012,.089]){const ring=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*2;ring.push([Math.sin(a)*(y>.05?.09:.112),y,Math.cos(a)*(y>.05?.072:.095)]);}seam(g,ring,rank>=4?mats.gold:mats.steel,.004);}
 for(const z of [-1,1]){seam(g,[[0,-.041,z*.074],[0,.018,z*.098],[0,.09,z*.075]],mats.steel,.004);for(const x of [-.063,.063]){const bolt=add(g,new T.SphereGeometry(.006,8,6),mats.gold,'Pauldron fastening');bolt.position.set(x,.028,z*.079);}}
 if(!smith||rank>=4)for(let j=0;j<(smith?1:2);j++){
  const yy=.10+j*.038;
  panel(g,[[-.083,yy],[0,yy-.011],[.083,yy],[.072,yy+.031],[0,yy+.044],[-.072,yy+.031]],-.075-j*.002,mats.steel,'Shoulder overlapping lame');
 }
}
export function tailorHero(c,part,mats,rank){
 if(c.enemy||!['warden','ashwright','ranger'].includes(c.design))return;
 const smith=c.design==='ashwright';
 if(c.design!=='warden'&&!heroArmorProfile(c)?.sleeves)for(const side of ['l','r'])shoulder(part('upperarm'+side),mats,smith,rank);
 if(!smith||heroArmorProfile(c)?.plate)return;
 const chest=part('chest'),hips=part('hips');
 // Follow the authored apron waves, including their weighting to each leg.
 const z=(x,y)=>{const t=(.13-y)/.89,u=x/(.355*(.85+t*.25))+.5;return .165+Math.cos(u*Math.PI*6)*(.008+t*.011)+t*.03+.009;};
 for(const side of [-1,1]){
  const pts=[];for(let i=0;i<=12;i++){const y=.12-i*.071,x=side*(.139+i*.0033);pts.push([x,y,z(x,y)]);}seam(chest,pts,mats.dark,.003,'Sculpted forge apron stitched hem');
  for(let i=0;i<26;i++){const y=.1-i*.031,x=side*(.132+i*.00142);seam(chest,[[x-.003,y,z(x,y)+.004],[x+.003,y-.005,z(x,y)+.004]],mats.stitch,.0016,'Sculpted forge apron stitching');}
  // Structured tool pouches with folded flaps and metal snaps.
  const x=side*.088;
  panel(chest,[[x-.052,-.31],[x+.052,-.31],[x+.048,-.445],[x-.05,-.445]],.22,mats.dark,'Sculpted forge apron pocket shadow');
  panel(chest,[[x-.047,-.308],[x+.047,-.308],[x+.047,-.419],[x-.047,-.429]],.229,mats.leather,'Sculpted forge apron tool pocket');
  panel(chest,[[x-.049,-.306],[x+.049,-.306],[x+.048,-.339],[x,-.358],[x-.048,-.339]],.239,mats.leather,'Sculpted forge apron folded flap');
  const rivet=add(chest,new T.SphereGeometry(.005,8,6),mats.gold,'Sculpted forge apron pocket snap');rivet.position.set(x,-.346,.247);
  seam(chest,[[x-.044,-.354,.237],[x-.044,-.421,.238],[x+.043,-.421,.238]],mats.stitch,.0016,'Sculpted forge apron pocket seam');
  seam(chest,[[side*.016,-.5,z(side*.016,-.5)],[side*.016,-.61,z(side*.016,-.61)],[side*.017,-.72,z(side*.017,-.72)]],mats.dark,.003,'Sculpted forge apron split seam');
 }
 // Narrow belts and a restrained forged buckle replace broad featureless straps.
 panel(chest,[[-.155,-.155],[.155,-.155],[.155,-.185],[-.155,-.185]],.213,mats.dark,'Apron waist strap');
 const buckle=add(chest,new T.TorusGeometry(.022,.004,5,4),mats.gold,'Apron waist buckle');buckle.position.set(.03,-.17,.226);buckle.rotation.z=Math.PI/4;
 for(const side of [-1,1])for(let j=0;j<4;j++){const rivet=add(hips,new T.SphereGeometry(.0045,6,4),mats.gold,'Belt rivet');rivet.position.set(side*(.06+j*.026),.13,.149);}
}
