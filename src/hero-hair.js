import * as T from 'three';
import {add,form} from './model-craft.js';

let strandBump;
function hairTexture(){
 if(strandBump)return strandBump;
 const w=96,h=128,data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const wave=x+Math.sin(y*.038)*1.7+Math.sin(y*.101+x*.03)*.55;
  const value=Math.round(126+Math.sin(wave*2.1)*32+Math.sin(wave*4.7+y*.025)*13+Math.sin(x*31.7+y*18.1)*5),i=(y*w+x)*4;
  data[i]=data[i+1]=data[i+2]=value;data[i+3]=255;
 }
 strandBump=new T.DataTexture(data,w,h);strandBump.wrapS=strandBump.wrapT=T.RepeatWrapping;strandBump.magFilter=T.LinearFilter;strandBump.minFilter=T.LinearMipmapLinearFilter;strandBump.generateMipmaps=true;strandBump.needsUpdate=true;strandBump.userData.shared=true;return strandBump;
}
function palette(c,gray){
 const colors=gray?[0x60655f,0x71766d]:[0x22231b,0x2a2b21];
 return [null,...colors.map(color=>{const m=new T.MeshStandardMaterial({color,roughness:.81,metalness:0,bumpMap:hairTexture(),bumpScale:.0014});m.name=gray?'Silver and charcoal hair':'Dark natural hair';c.materials.push(m);return m;})];
}

// Flattened, gently twisting bundles carry the hair silhouette. Their rounded
// ends and unequal overlapping lengths avoid cones, needle spikes and tubes.
function lock(g,points,width,depth,material,name,normal=[0,0,1],phase=0){
 const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments=width<.0045?6:8,sides=width<.0045?5:6,p=[],uv=[],ix=[],reference=new T.Vector3(...normal).normalize();
 for(let j=0;j<=segments;j++){
  const t=j/segments,center=path.getPoint(t),tangent=path.getTangent(t).normalize(),out=reference.clone().addScaledVector(tangent,-reference.dot(tangent)).normalize(),across=new T.Vector3().crossVectors(out,tangent).normalize();
  const taper=.19+.77*Math.pow(Math.sin(Math.PI*(.12+t*.88)),.62),roll=Math.sin(t*4.2+phase)*.13;
  for(let i=0;i<=sides;i++){
   const a=i/sides*Math.PI*2+roll,flute=1+.09*Math.cos(a*3+Math.sin(t*4+phase)*.35),q=center.clone().addScaledVector(across,Math.cos(a)*width*.5*taper*flute).addScaledVector(out,Math.sin(a)*depth*taper);
   p.push(q.x,q.y,q.z);uv.push(i/sides,t);
   if(j<segments&&i<sides){const k=j*(sides+1)+i;ix.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
  }
 }
 for(const j of [0,segments]){const center=path.getPoint(j/segments),k=p.length/3;p.push(center.x,center.y,center.z);uv.push(.5,j/segments);for(let i=0;i<sides;i++){const a=j*(sides+1)+i;ix.push(...(j===0?[k,a+1,a]:[k,a,a+1]));}}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(ix);geometry.computeVertexNormals();return add(g,geometry,material,name);
}
function matureBeard(head,m){
 // One softly corrugated surface joins the fine tufts, with a cheek-shaped
 // hairline and a wide irregular chin. The lip is left open above its center.
 const positions=[],uv=[],ix=[],cols=80,rows=18;
 function surface(a,t){
  const growth=a*(1-.14*t)+Math.sin(t*8+a*11)*.017*Math.sin(t*Math.PI),sa=Math.sin(growth),ca=Math.cos(growth),top=.024+.056*Math.abs(Math.sin(a))**.80+Math.sin(a*59)*.0016,bottom=-.027+.004*Math.abs(sa)+Math.sin(a*17.3+.4)*.002;
  const x=sa*(.079-.014*t**1.6),y=top*(1-t)+bottom*t+Math.sin(a*41+t*4)*.0008;
  const side=.027+.038*Math.sin(t*Math.PI*.68),front=.132+.004*Math.sin(t*Math.PI)-.019*t**2;
  const relief=(Math.sin(a*49+t*7)*.0007+Math.sin(a*81-t*11)*.0004)*(Math.sin(t*Math.PI)*.5+.5);
  return[x,y,side+(front-side)*ca+relief];
 }
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
  const a=-1.66+i/cols*3.32,t=j/rows,q=surface(a,t);positions.push(...q);uv.push(i/cols*3,1-t);
  if(j<rows&&i<cols){const k=j*(cols+1)+i;ix.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(ix);geometry.computeVertexNormals();add(head,geometry,m[1],'Sculpted irregular short gray beard');
 // Fine overlapping tufts settle into that surface. Only their irregular
 // lower ends separate; the roots do not look like individual attached scales.
 for(let j=0;j<88;j++){
  const a=-1.58+j/87*3.16,begin=.01+(j%7)*.11,end=Math.min(1.025,begin+.22+(j%3)*.12),pts=[];
  for(let k=0;k<4;k++){const t=begin+(end-begin)*k/3,q=surface(a+Math.sin(k*1.6+j)*.005,t);q[2]+=.0003;pts.push(q);}
  lock(head,pts,.0030+(j%3)*.0004,.0008,m[j%13===0?2:1],'Fine joined gray beard tuft',[Math.sin(a)*.5,0,Math.cos(a)],j*.63);
 }
 // A small soul patch follows the chin, without a squared-off protrusion.
 for(let j=0;j<9;j++){
  const x=(j-4)*.0025,y=.029+Math.sin(j*2.1)*.002;
  lock(head,[[x,y,.134],[x,y-.008,.135],[x*.85,.005,.133],[x*.7,-.010,.127]],.0032,.0010,m[j%3?1:2],'Short gray chin tuft',[0,0,1],j);
 }
 // The moustache is a dense, shallow fan rather than two curled tubes. Fine
 // overlapping hairs broaden it under the nose and narrow toward the corners.
 for(const side of [-1,1])for(let j=0;j<13;j++){
  const q=j/12,y=.056-q*.008,z=.138+Math.sin(q*Math.PI)*.003;
  lock(head,[[side*.002,y,z],[side*.017,y-.0005,z+.001],[side*.029,y-.006,z-.003],[side*(.041+q*.003),.034-q*.002,.124+q*.001]],.0035,.0013,m[j%5===0?2:1],'Natural gray moustache fibers',[0,.15,1],j*.7);
 }
 // Very short wisps soften the cheek boundary and vary its growth direction.
 for(const side of [-1,1])for(let j=0;j<24;j++){
  const a=side*(.37+j/23*1.24),root=surface(a,.025),tip=surface(a-side*.028,.15+(j%3)*.035);root[1]+=.0012;tip[2]+=.0006;
  lock(head,[root,[(root[0]+tip[0])/2,(root[1]+tip[1])/2,Math.max(root[2],tip[2])+.0005],tip],.0027,.0007,m[j%7===0?2:1],'Short irregular cheek whisker',[Math.sin(a)*.55,0,Math.cos(a)],j);
 }

}
function templeHair(head,m,role){
 const smith=role==='ashwright',ranger=role==='ranger';
 for(const side of [-1,1]){
  // Closely overlapping temple hair starts underneath the crown rather than
  // sitting outside the head as a row of scales. The nape stays within steel.
  for(let j=0;j<17;j++){
   const x=side*(.077+j*.00032),y=.157-j*.0023,z=.076-j*.003;
   lock(head,[[x,y+.012,z],[side*.081,y-.002,z+.003],[side*.080,y-.018,z+.006],[side*.078,y-(smith?.034:.026),z+.004]],.0048,.0017,m[j%9===0?2:1],smith?'Fine swept silver temple':'Fine short dark temple',[side*.8,0,.6],j*.8);
  }
 }
 // A few restrained forelocks make class identity visible beneath the brow.
 // Roots sit under the steel. Asymmetric direction avoids a uniform fringe.
 const locks=smith?[
  [[-.071,.172,.110],[-.056,.176,.122],[-.037,.174,.130],[-.017,.166,.135]],
  [[-.049,.178,.122],[-.032,.178,.130],[-.011,.172,.138],[.007,.161,.139]],
  [[.071,.169,.107],[.059,.175,.121],[.045,.176,.131],[.027,.170,.137]]
 ]:ranger?[
  [[-.064,.170,.115],[-.050,.171,.128],[-.036,.159,.139],[-.029,.139,.142]],
  [[-.036,.180,.127],[-.018,.178,.134],[.003,.164,.141],[.015,.143,.141]],
  [[.001,.182,.128],[.024,.177,.134],[.043,.163,.132],[.052,.150,.124]],
  [[.035,.180,.121],[.056,.171,.126],[.063,.158,.122],[.068,.147,.113]]
 ]:[
  [[-.065,.170,.114],[-.046,.177,.125],[-.028,.168,.136],[-.033,.149,.140]],
  [[-.039,.183,.125],[-.019,.184,.134],[.006,.170,.138],[.018,.153,.140]],
  [[.002,.187,.123],[.025,.184,.132],[.042,.170,.131],[.035,.155,.135]],
  [[.038,.177,.119],[.056,.174,.126],[.069,.157,.116],[.067,.148,.111]]
 ];
 locks.forEach((points,j)=>{
  for(let k=0;k<5;k++){
   const strand=points.map(([x,y,z],i)=>[x+(k-2)*.0025+Math.sin(i*2+j+k)*.001,y+(k-2)*.0006*Math.sin(i)+(i===3?Math.sin(k*2+j)*.003:0),z-.007+Math.sin(k/4*Math.PI)*.001]);
   lock(head,strand,smith?.0048:.0055,.0018,m[k===3?2:1],smith?'Swept gray forelock':ranger?'Loose ranger forelock':'Tousled warden forelock',[0,.1,1],j*.79+k*.12);
  }
 });
}
export function heroHair(c,head,_materials,profile){
 if(!head||!profile)return;
 const materials=palette(c,c.design==='ashwright');
 templeHair(head,materials,c.design);
 if(c.design==='ashwright')matureBeard(head,materials);
}
