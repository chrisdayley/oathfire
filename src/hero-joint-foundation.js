import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {heroArmorProfile} from './hero-armor-profile.js';

const softNames=new Set(['Natural neck','Continuous fitted waist','Fitted torso undergarment','Tailored pelvic foundation','Fitted upper sleeve','Flexible forearm sleeve','Shaped cloth breeches']);
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const socket=(c,id)=>c.sockets[id]||c.sockets[id.replaceAll('.','')];

export function prepareHeroJointFoundation(c,pieces,physique){
 if(!physique)return null;
 const materials=new Map(),shells=[];let face=null;
 for(const {group}of pieces)group.traverse(o=>{
  if(!o.isMesh)return;if(softNames.has(o.name)&&!materials.has(o.name))materials.set(o.name,o.material);
  if(o.name.startsWith('Anatomical face')){const p=o.geometry.attributes.position,u=o.geometry.attributes.uv;face=[];for(let i=0;i<p.count;i++)if(p.getY(i)<.026)face.push([p.getX(i),p.getY(i),p.getZ(i),u.getX(i),u.getY(i)]);}
  if(/^(Fitted keeled breast and backplate|Fitted overlapping plackart)$/.test(o.name)){
   const transform=socket(c,'chest').matrixWorld.clone().invert().multiply(o.matrixWorld),p=o.geometry.attributes.position,index=o.geometry.index,vertices=[];
   for(let i=0;i<p.count;i++)vertices.push(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(transform));
   for(let i=0;i<(index?.count||p.count);i+=3)shells.push([0,1,2].map(k=>vertices[index?index.getX(i+k):i+k]));
  }
 });
 if(!materials.has('Fitted torso undergarment'))return null;
 return {physique,materials,face,fitTrunk:shells.length?trunkClearance(shells):null,replaces:name=>softNames.has(name)};
}

// Use the actual equipped breast/plackart cross sections, including physique
// scaling, rather than duplicating their widths here. Only the waist and
// clavicle need correction; the middle chest and exposed cloth stay unchanged.
function trunkClearance(triangles){
 const sections=new Map(),cross=(a,b)=>a.x*b.z-a.z*b.x;
 return (x,t,z)=>{
  const y=t-.43;if(y>=-.09&&y<=.095)return[x,z];
  // A soft waist tuck stays inside the overlapping shells at the side seam,
  // where their individual cross sections can overestimate the visible waist.
  const waist=smooth(-.40,-.28,y)*(1-smooth(-.19,-.09,y));x*=1-.12*waist;z*=1-.04*waist;
  const key=Math.round(y*1e6);let segments=sections.get(key);
  if(!segments){segments=[];for(const tri of triangles){const points=[];for(let i=0;i<3;i++){const a=tri[i],b=tri[(i+1)%3],da=a.y-y,db=b.y-y;if(da*db<0||Math.abs(da)<1e-7&&Math.abs(db)>1e-7){const u=da/(da-db);points.push({x:a.x+(b.x-a.x)*u,z:a.z+(b.z-a.z)*u});}}if(points.length===2)segments.push(points);}sections.set(key,segments);}
  const length=Math.hypot(x,z);if(length<1e-8||!segments.length)return[x,z];const dir={x:x/length,z:z/length};let radius=Infinity;
  for(const [a,b]of segments){const edge={x:b.x-a.x,z:b.z-a.z},den=cross(dir,edge);if(Math.abs(den)<1e-9)continue;const r=cross(a,edge)/den,u=cross(a,dir)/den;if(r>0&&u>=-.00001&&u<=1.00001)radius=Math.min(radius,r);}
  // Six millimetres minimum plus a small reserve for trunk blending in motion.
  if(Number.isFinite(radius)&&length>radius-.008){const fit=Math.max(.01,radius-.008)/length;return[x*fit,z*fit];}return[x,z];
 };
}

function weightsAt(t,chain){
 const weights=new Array(chain.length).fill(0);weights[0]=1;
 for(let j=1;j<chain.length;j++){
  const w=smooth(chain[j].at-chain[j].band,chain[j].at+chain[j].band,t);
  for(let k=0;k<j;k++)weights[k]*=1-w;weights[j]=w;
 }
 return weights;
}
function sampledRows(anchors){
 const rows=[];
 for(let j=0;j<anchors.length-1;j++){
  const a=anchors[j],b=anchors[j+1],steps=Math.max(2,Math.ceil((b[0]-a[0])/.018));
  for(let k=0;k<steps;k++){const t=k/steps,u=t*t*(3-2*t);rows.push([a[0]+(b[0]-a[0])*t,...a.slice(1).map((v,i)=>v+(b[i+1]-v)*u)]);}
 }rows.push(anchors.at(-1));return rows;
}
function continuousTube(c,skeleton,chain,anchors,{skin=false,anchor=null,folds=0,colorAt=null,fitTrunk=null}={}){
 const rows=sampledRows(anchors),sides=28,positions=[],uvs=[],skinIndices=[],skinWeights=[],indices=[],colors=[],inverse=c.visual.matrixWorld.clone().invert();
 const chestFit=fitTrunk?socket(c,'chest'):null,chestInverse=chestFit?.matrixWorld.clone().invert();
 const bindings=chain.map(d=>({...d,bone:socket(c,d.id)}));
 for(const d of bindings){if(!d.bone)throw Error('Missing foundation bone '+d.id);d.index=skeleton.bones.indexOf(d.bone);}
 let parentIndex=-1,anchorPoint;
 if(anchor){const b=socket(c,anchor.id);parentIndex=skeleton.bones.indexOf(b);anchorPoint=new T.Vector3(...anchor.point).applyMatrix4(b.matrixWorld);}
 for(let j=0;j<rows.length;j++){
  const [t,rx,rz,z=0]=rows[j],ws=weightsAt(t,bindings),rootWeight=anchor?1-smooth(anchor.from,anchor.to,t):0;
  for(let i=0;i<=sides;i++){
   const a=i/sides*Math.PI*2,ripple=1+folds*(Math.sin(a*5+t*13)*.6+Math.sin(a*9-t*19)*.4),x=Math.sin(a)*rx*ripple,zz=Math.cos(a)*rz*ripple+z,point=new T.Vector3(),baseCenter=new T.Vector3();
   for(let k=0;k<bindings.length;k++){
    const d=bindings[k],local=new T.Vector3(x,t-d.at,zz);point.addScaledVector(local.applyMatrix4(d.bone.matrixWorld),ws[k]);
    if(anchor)baseCenter.addScaledVector(new T.Vector3(0,t-d.at,0).applyMatrix4(d.bone.matrixWorld),ws[k]);
   }
   // A buried shoulder/hip root follows the torso. The same surface then
   // transitions into the moving limb; there is no separate open-ended cuff.
   if(anchor&&rootWeight>0)point.addScaledVector(anchorPoint.clone().sub(baseCenter),rootWeight);
   if(chestFit){point.applyMatrix4(chestInverse);const [xx,zf]=fitTrunk(point.x,point.y+.43,point.z);point.x=xx;point.z=zf;point.applyMatrix4(chestFit.matrixWorld);}
   point.applyMatrix4(inverse);positions.push(point.x,point.y,point.z);if(colorAt)colors.push(...colorAt(a,t));
   const ids=[],ww=[];for(let k=0;k<bindings.length;k++)if(ws[k]>0){ids.push(bindings[k].index);ww.push(ws[k]*(1-rootWeight));}
   if(rootWeight>0){ids.push(parentIndex);ww.push(rootWeight);}
   while(ids.length<4){ids.push(0);ww.push(0);}skinIndices.push(...ids.slice(0,4));skinWeights.push(...ww.slice(0,4));
   if(skin)uvs.push(.35+x*.12,.215+(t-rows[0][0])*.08);else uvs.push(i/sides,(t-rows[0][0])*2.5);
   if(j<rows.length-1&&i<sides){const n=j*(sides+1)+i;indices.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}
  }
 }
 // Root and distal caps are buried under adjacent surfaces. Closed ends keep
 // the mesh watertight even when seen from an unusual attack camera angle.
 for(const j of [0,rows.length-1]){
  const center=positions.length/3,mean=new T.Vector3();for(let i=0;i<sides;i++)mean.add(new T.Vector3().fromArray(positions,(j*(sides+1)+i)*3));mean.multiplyScalar(1/sides);positions.push(mean.x,mean.y,mean.z);uvs.push(.5,.5);if(colorAt)colors.push(...colors.slice(j*(sides+1)*3,j*(sides+1)*3+3));skinIndices.push(...skinIndices.slice(j*(sides+1)*4,j*(sides+1)*4+4));skinWeights.push(...skinWeights.slice(j*(sides+1)*4,j*(sides+1)*4+4));
  for(let i=0;i<sides;i++){const n=j*(sides+1)+i;indices.push(...(j===0?[center,n+1,n]:[center,n,n+1]));}
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinIndices,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(skinWeights,4));geometry.setIndex(indices);if(colorAt)geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();return geometry;
}

// The authored head has a packed skin atlas. A generic UV patch made the
// touching neck a different color and revealed a jagged cut line. Sample the
// actual lower head skin into continuous vertex colors, keeping its material.
const skinPixels=new WeakMap();
function neckSurface(c,prepared,source){
 const tex=source?.map,image=tex?.image,face=prepared.face;
 if(!image||!face?.length)return{material:source};
 let pixels=skinPixels.get(tex);
 if(!pixels){const canvas=document.createElement('canvas');canvas.width=Math.min(256,image.width);canvas.height=Math.round(image.height*canvas.width/image.width);const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);pixels={data:ctx.getImageData(0,0,canvas.width,canvas.height).data,width:canvas.width,height:canvas.height};skinPixels.set(tex,pixels);}
 const samples=[];
 for(let i=0;i<28;i++){
  const a=i/28*Math.PI*2,x=Math.sin(a)*.061,z=Math.cos(a)*(Math.cos(a)>0?.108:.059),nearest=face.map(v=>({v,d:(v[0]-x)**2+(v[1]-.007)**2+(v[2]-z)**2})).sort((a,b)=>a.d-b.d).slice(0,18),color=new T.Color(0,0,0);let total=0;
  for(const {v,d}of nearest){const u=Math.max(0,Math.min(.999999,v[3])),vv=Math.max(0,Math.min(.999999,tex.flipY?1-v[4]:v[4])),offset=(Math.floor(vv*pixels.height)*pixels.width+Math.floor(u*pixels.width))*4,w=1/(d+.000005),q=new T.Color().setRGB(pixels.data[offset]/255,pixels.data[offset+1]/255,pixels.data[offset+2]/255);if(q.r>q.g*1.85||q.g>q.b*1.8)continue;if(tex.colorSpace===T.SRGBColorSpace)q.convertSRGBToLinear();color.r+=q.r*w;color.g+=q.g*w;color.b+=q.b*w;total+=w;}
  if(total>0)color.multiplyScalar(1/total);else color.setRGB(.78,.54,.40).convertSRGBToLinear();samples.push(color);
 }
 const mean=new T.Color(0,0,0);for(const color of samples){mean.r+=color.r/28;mean.g+=color.g/28;mean.b+=color.b/28;}
 const material=source.clone();material.name='Continuous neck matched to head';material.map=null;material.vertexColors=true;material.onBeforeCompile=source.onBeforeCompile;material.customProgramCacheKey=source.customProgramCacheKey;c.materials.push(material);
 return{material,colorAt:(a,t)=>{const u=(a/(Math.PI*2)*28)%28,i=Math.floor(u),color=samples[i].clone().lerp(samples[(i+1)%28],u-i);color.lerp(mean,1-smooth(.184,.241,t)*.88);return color.toArray();}};
}

export function attachHeroJointFoundation(c,skeleton,prepared){
 if(!prepared)return;
 const {physique:p,materials:m}=prepared,coverage=heroArmorProfile(c),smith=c.design==='ashwright',bareArms=smith&&!coverage.sleeves,bins=new Map(),records=[];
 const add=(name,mat,chain,rows,opts)=>{
  if(!mat)throw Error('Missing foundation material for '+name);
  const geometry=continuousTube(c,skeleton,chain,rows,opts);if(!bins.has(mat))bins.set(mat,[]);bins.get(mat).push(geometry);records.push({name,vertices:geometry.attributes.position.count});
 };
 const torso=m.get('Fitted torso undergarment'),cloth=m.get('Shaped cloth breeches')||torso,skin=m.get('Natural neck')||c.anatomyMaterial;
 // One torso from the pelvis through the waist to the collar, shared between
 // all three trunk bones. Plate and belts remain separate rigid armor on top.
 add('Continuous weighted torso',torso,[{id:'hips',at:0,band:0},{id:'spine',at:.16,band:.115},{id:'chest',at:.43,band:.105}],
  [[-.14,.151*p.waist,.105*1.13],[0,.173*p.waist,.120*1.13],[.12,.161*p.waist,.115*p.depth],[.26,.168*p.waist,.126*p.depth],[.39,.183*p.chest,.124*p.depth],[.48,.201*p.chest,.127*p.depth],[.565,.183*p.chest,.105*p.depth],[.625,.137*p.chest,.074*p.depth]],{folds:.009,fitTrunk:prepared.fitTrunk});
 const neck=neckSurface(c,prepared,skin);
 add('Continuous weighted neck',neck.material,[{id:'chest',at:0,band:0},{id:'head',at:.245,band:.054}],
  [[.164,.076,.061],[.195,.064,.055],[.225,.055,.051],[.248,.054,.051],[.267,.048,.047],[.286,.038,.038]],{skin:true,colorAt:neck.colorAt});
 for(const [side,sign]of [['l',1],['r',-1]]){
  const upper='upperarm'+side,lower='lowerarm'+side,wrist='wrist'+side,armMaterial=bareArms?skin:m.get('Fitted upper sleeve')||torso;
  const armAnchor={id:'chest',point:[sign*.152*p.chest,.087,0],from:-.092,to:.060};
  if(bareArms){
   // The original two-bone muscular arm stays intact. Only its missing root
   // joins the chest here, inside the shoulder armor and existing deltoid.
   add('Muscular shoulder root '+side,skin,[{id:upper,at:0,band:0}],
    [[-.092,.072,.067],[-.045,.077,.073],[.010,.082,.078],[.060,.083,.077],[.096,.077,.071]],{skin:true,anchor:armAnchor});
  }else{
   add('Continuous sleeve '+side,armMaterial,[{id:upper,at:0,band:0},{id:lower,at:.305,band:.068},{id:wrist,at:.56,band:.040}],
    [[-.092,.061*p.arm,.058*p.arm],[-.025,.067*p.arm,.065*p.arm],[.055,.070*p.arm,.067*p.arm],[.16,.061*p.arm,.059*p.arm],[.255,.047*p.arm,.047*p.arm],[.305,.047*p.forearm,.046*p.forearm],[.365,.053*p.forearm,.049*p.forearm],[.47,.041*p.forearm,.041*p.forearm],[.56,.031*p.forearm,.033*p.forearm],[.595,.033,.035]],{anchor:armAnchor,folds:.006});
  }
  add('Continuous trouser and knee '+side,cloth,[{id:'upperleg'+side,at:0,band:0},{id:'lowerleg'+side,at:.44,band:.078},{id:'foot'+side,at:.865,band:.043}],
   [[-.074,.080*p.thigh,.090*p.thigh],[-.020,.096*p.thigh,.100*p.thigh],[.07,.103*p.thigh,.104*p.thigh],[.19,.088*p.thigh,.084*p.thigh],[.34,.064*p.thigh,.063*p.thigh],[.44,.049*p.calf,.052*p.calf],[.515,.058*p.calf,.055*p.calf],[.65,.052*p.calf,.048*p.calf],[.82,.036*p.calf,.038*p.calf],[.895,.032,.035]],
   {anchor:{id:'hips',point:[sign*.096,.034,0],from:-.074,to:.065},folds:.012});
 }
 for(const [material,geometries]of bins){
  const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)throw Error('Joint foundation merge failed');
  const mesh=new T.SkinnedMesh(geometry,material);mesh.name='Continuous hero joint foundation';mesh.userData.heroJointFoundation=true;mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;c.visual.add(mesh);mesh.bind(skeleton);c.body.push(mesh);
 }
 c.jointFoundation={version:1,components:records};
}
