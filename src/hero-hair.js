import * as T from 'three';
import {add} from './model-craft.js';
import {characterBounce} from './hero-surfaces.js';

let strandBump;
let croppedHair;
function croppedHairTexture(){
 if(croppedHair)return croppedHair;
 const size=256,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');let seed=119;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 ctx.fillStyle='#99958f';ctx.fillRect(0,0,size,size);
 for(let i=0;i<8500;i++){
  const x=random()*size,y=random()*size,length=2.5+random()*10,value=Math.floor(75+random()*154),bend=(random()-.5)*2.4;
  ctx.strokeStyle=`rgb(${value},${Math.max(0,value-3)},${Math.max(0,value-7)})`;ctx.lineWidth=.35+random()*.45;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+bend*.3,y+length*.5,x+bend,y+length);ctx.stroke();
 }
 const pixels=ctx.getImageData(0,0,size,size);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=155+Math.floor(random()*100);ctx.putImageData(pixels,0,0);
 croppedHair=new T.CanvasTexture(canvas);croppedHair.colorSpace=T.SRGBColorSpace;croppedHair.wrapS=croppedHair.wrapT=T.RepeatWrapping;croppedHair.userData.shared=true;return croppedHair;
}
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
 const colors=gray?[0x9f9b94,0xb3afa7]:[0x22231b,0x2a2b21];
 return [null,...colors.map(color=>{const m=new T.MeshStandardMaterial({color,roughness:.81,metalness:0,bumpMap:hairTexture(),bumpScale:gray?.0006:.0014});m.name=gray?'Silver and charcoal hair':'Dark natural hair';if(gray){m.map=croppedHairTexture();m.color.multiplyScalar(1.55);m.onBeforeCompile=shader=>characterBounce(shader,.14);m.customProgramCacheKey=()=> 'short-silver-hair-v225';}c.materials.push(m);return m;})];
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
let beardFit,beardSource;
function fittedBeardSurface(head){
 if(beardFit)return beardFit;
 let face;head.parent?.traverse(o=>{if(o.isMesh&&o.name.startsWith('Anatomical face'))face=o.geometry;});
 if(!face)return null;
 beardSource=face.clone();
 const p=face.attributes.position,ix=face.index,triangles=[],read=i=>new T.Vector3().fromBufferAttribute(p,i);
 for(let i=0;i<(ix?.count||p.count);i+=3){const tri=[read(ix?ix.getX(i):i),read(ix?ix.getX(i+1):i+1),read(ix?ix.getX(i+2):i+2)];if(Math.min(...tri.map(v=>v.y))<.09&&Math.max(...tri.map(v=>v.y))>-.031)triangles.push(tri);}
 const ray=new T.Ray(),hit=new T.Vector3(),dir=new T.Vector3();
 // Fit the beard to the actual sculpted face rather than an independent
 // ellipse. This keeps its cheeks and jaw in contact when viewed from the side.
 beardFit=(a,y)=>{
  dir.set(Math.sin(a),0,Math.cos(a));ray.origin.copy(dir).multiplyScalar(.4);ray.origin.y=Math.max(y,-.020);ray.origin.z+=.012;ray.direction.copy(dir).negate();let distance=Infinity;
  for(const tri of triangles)if(ray.intersectTriangle(...tri,false,hit))distance=Math.min(distance,ray.origin.distanceTo(hit));
  if(!Number.isFinite(distance))return null;
  const point=ray.at(distance,new T.Vector3()).addScaledVector(dir,.0026);point.y=y;return point.toArray();
 };return beardFit;
}
function beardBounds(a){const s=Math.abs(Math.sin(a));return[.023+.060*s**1.6,-.028+.036*s**2.2];}
function closeBeardGeometry(){
 const source=beardSource,p=source.attributes.position,n=source.attributes.normal,index=source.index,positions=[],normals=[],uv=[],colors=[];
 const clip=(poly,value)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],av=value(a.p),bv=value(b.p);if(av>=0)out.push(a);if((av>=0)!==(bv>=0)){const t=av/(av-bv);out.push({p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize()});}}return out;};
 const angle=p=>Math.atan2(p.x,p.z-.012);
 for(let i=0;i<(index?.count||p.count);i+=3){
  let poly=[0,1,2].map(k=>{const v=index?index.getX(i+k):i+k;return{p:new T.Vector3().fromBufferAttribute(p,v),n:new T.Vector3().fromBufferAttribute(n,v)};});
  for(const value of [q=>beardBounds(angle(q))[0]-q.y,q=>q.y-beardBounds(angle(q))[1],q=>1.38+(q.y-.07)*2-Math.abs(angle(q)),q=>q.z-.017])poly=clip(poly,value);
  for(let k=1;k<poly.length-1;k++)for(const v of [poly[0],poly[k],poly[k+1]]){
   const a=angle(v.p),[top,bottom]=beardBounds(a),t=(top-v.p.y)/(top-bottom),depth=.0019+.00045*Math.sin(a*73+t*8);
   v.p.clone().addScaledVector(v.n,depth).toArray(positions,positions.length);v.n.toArray(normals,normals.length);uv.push(a*.85,t*.62);
   const edge=Math.min((top-v.p.y)/.005,(v.p.y-bottom)/.004,(1.38+(v.p.y-.07)*2-Math.abs(a))/.04);colors.push(1,1,1,Math.max(0,Math.min(1,edge)));
  }
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,4));return geometry;
}
function matureBeard(head,m,c){
 // The lower edge follows the mandible up toward the ear. Sideburns narrow
 // into the cheek; they never form tall flat flaps hanging beside the neck.
 const fit=fittedBeardSurface(head),beard=m[1].clone();beard.name='Close cropped silver beard';beard.map=beard.bumpMap=croppedHairTexture();beard.color.setHex(0xeeeae2);beard.bumpScale=.0005;beard.vertexColors=true;beard.alphaTest=.36;beard.onBeforeCompile=m[1].onBeforeCompile;beard.customProgramCacheKey=m[1].customProgramCacheKey;c.materials.push(beard);
 function surface(a,t){
  const growth=a*(1-.040*t)+Math.sin(t*8+a*11)*.006*Math.sin(t*Math.PI),sa=Math.sin(growth),ca=Math.cos(growth),cheek=Math.abs(Math.sin(a));
  const [top,bottom]=beardBounds(a);
  const x=sa*(.079-.005*t**1.6),y=top*(1-t)+bottom*t+Math.sin(a*41+t*4)*.00025;
  const side=.030+.007*Math.sin(t*Math.PI),front=.132+.005*Math.sin(t*Math.PI)-.020*t;
  const relief=(Math.sin(a*49+t*7)*.00028+Math.sin(a*81-t*11)*.00014)*(Math.sin(t*Math.PI)*.5+.5);
  const point=fit?.(growth,y)||[x,y,side+(front-side)*ca];point[0]+=sa*relief;point[2]+=ca*relief;return point;
 }
 if(beardSource)add(head,closeBeardGeometry(),beard,'Jaw-fitted short gray beard');
 // Fine overlapping tufts settle into that surface. Only their irregular
 // lower ends separate; the roots do not look like individual attached scales.
 for(let j=0;j<64;j++){
  const a=-1.20+j/63*2.40,begin=.065+(j%7)*.071,end=Math.min(.72,begin+.12+(j%3)*.055),pts=[];
  for(let k=0;k<4;k++){const t=begin+(end-begin)*k/3,q=surface(a+Math.sin(k*1.6+j)*.004,t);q[2]+=.00025;pts.push(q);}
  lock(head,pts,.00085+(j%3)*.00012,.00022,m[1],'Fine joined gray beard tuft',[Math.sin(a)*.5,0,Math.cos(a)],j*.63);
 }
 // A small soul patch follows the chin, without a squared-off protrusion.
 for(let j=0;j<9;j++){
  const a=(j-4)*.032,pts=[.015,.10,.24,.39].map(t=>surface(a,t));
  lock(head,pts,.0008,.00018,m[1],'Short gray chin tuft',[0,0,1],j);
 }
 // The moustache is a dense, shallow fan rather than two curled tubes. Fine
 // overlapping hairs broaden it under the nose and narrow toward the corners.
 for(const side of [-1,1])for(let j=0;j<11;j++){
  const q=j/10,y=.055-q*.007,z=.137+Math.sin(q*Math.PI)*.0018,points=[[side*.002,y,z],[side*.016,y-.0005,z+.0005],[side*.029,y-.004,z-.002],[side*(.037+q*.002),.038-q*.001,.126+q*.001]];
  const fitted=points.map(([x,y,z])=>fit?.(Math.atan2(x,z-.012),y)||[x,y,z]);
  lock(head,fitted,.00115,.00032,m[j%5===0?2:1],'Natural gray moustache fibers',[0,.15,1],j*.7);
 }
 // Very short wisps soften the cheek boundary and vary its growth direction.
 for(const side of [-1,1])for(let j=0;j<20;j++){
  const a=side*(.37+j/19*.87),root=surface(a,.048),tip=surface(a-side*.013,.115+(j%3)*.014);tip[2]+=.00015;
  lock(head,[root,[(root[0]+tip[0])/2,(root[1]+tip[1])/2,Math.max(root[2],tip[2])+.00012],tip],.00065,.00014,m[1],'Short irregular cheek whisker',[Math.sin(a)*.55,0,Math.cos(a)],j);
 }

}
function templeHair(head,m,role){
 const smith=role==='ashwright',ranger=role==='ranger';
 for(const side of [-1,1]){
  // Closely overlapping temple hair starts underneath the crown rather than
  // sitting outside the head as a row of scales. The nape stays within steel.
  for(let j=0;j<17;j++){
   const x=side*(.077+j*.00032),y=.157-j*.0023+(smith?Math.sin(j*2.8)*.0014:0),z=.076-j*.003;
   const length=smith?.018+.004*Math.sin(j*1.7):.026;
   lock(head,[[x,y+.012,z],[side*.081,y-.002,z+.003],[side*.080,y-length*.65,z+.006],[side*.078,y-length,z+.004]],smith?.0025:.0048,smith?.0009:.0017,m[j%9===0?2:1],smith?'Fine swept silver temple':'Fine short dark temple',[side*.8,0,.6],j*.8);
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
 if(c.design==='ashwright')matureBeard(head,materials,c);
}
