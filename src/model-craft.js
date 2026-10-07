import * as T from 'three';

// Shared curved surfaces for small, readable construction details. Everything
// binds into the existing skeleton/rigid batches, rather than extra draw calls.
export function form(g,rings,m,{sides=24,start=0,arc=Math.PI*2,name='Contoured shell'}={}){
 const p=[],uv=[],ix=[];
 for(let j=0;j<rings.length;j++)for(let i=0;i<=sides;i++){
  const [y,rx,rz,z=0]=rings[j],a=start+arc*i/sides;
  p.push(Math.sin(a)*rx,y,z+Math.cos(a)*rz);uv.push(i/sides,j/(rings.length-1));
  if(j<rings.length-1&&i<sides){const k=j*(sides+1)+i;ix.push(...(rings.at(-1)[0]>=rings[0][0]?[k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1]:[k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2]));}
 }
 // Closed sleeves and plates need end faces: an uncapped loft exposes the
 // hollow inside during shoulder/arm movement. Partial cowls remain open.
 if(Math.abs(arc-Math.PI*2)<.0001){
  const ascending=rings.at(-1)[0]>=rings[0][0];
  for(const j of [0,rings.length-1]){
   const [y,rx,rz,z=0]=rings[j],center=p.length/3;p.push(0,y,z);uv.push(.5,.5);
   const rim=p.length/3;
   for(let i=0;i<=sides;i++){const a=start+arc*i/sides;p.push(Math.sin(a)*rx,y,z+Math.cos(a)*rz);uv.push(.5+.5*Math.sin(a),.5+.5*Math.cos(a));}
   const up=ascending?j>0:j===0;
   for(let i=0;i<sides;i++)ix.push(...(up?[center,rim+i,rim+i+1]:[center,rim+i+1,rim+i]));
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();return add(g,geo,m,name);
}
export function add(g,geo,m,name){const o=new T.Mesh(geo,m);o.name=name;o.castShadow=o.receiveShadow=true;g.add(o);return o;}
export function cord(g,pts,r,m,name='Rolled edge'){return add(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),Math.max(8,pts.length*4),r,5,false),m,name);}
export function bead(g,p,r,m,name='Rivet'){const o=add(g,new T.SphereGeometry(r,8,6),m,name);o.position.set(...p);return o;}
export function leaf(g,points,m,{depth=.008,bow=.018,name='Forged leaf'}={}){
 const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
 const geo=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:2,steps:1});const p=geo.attributes.position;
 for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)+bow*Math.cos(p.getX(i)*12));geo.computeVertexNormals();return add(g,geo,m,name);
}
export function foldedCloth(g,rings,m,name='Folded cloth',folds=12){
 const o=form(g,rings,m,{sides:48,name}),p=o.geometry.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(x,z),ripple=1+.055*Math.cos(a*folds)+.023*Math.sin(a*7+p.getY(i)*19);p.setX(i,x*ripple);p.setZ(i,z*ripple);}o.geometry.computeVertexNormals();return o;
}
