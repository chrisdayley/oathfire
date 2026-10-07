import * as T from 'three';
import {add,cord,bead,form,leaf} from './model-craft.js';

// Construction details follow the actual garment's outer edge, including its
// folds. They share its bone weights rather than floating in front of cloth.
function sewnPanel(g,o,m){
 const p=o.geometry.attributes.position,cols=21,rows=p.count/cols,edge=[];
 for(let j=0;j<rows;j++)edge.push(j*cols);
 for(let i=1;i<cols;i++)edge.push((rows-1)*cols+i);
 for(let j=rows-2;j>=0;j--)edge.push(j*cols+cols-1);
 o.updateMatrix();
 const points=edge.map(i=>new T.Vector3(p.getX(i),p.getY(i),p.getZ(i)+.0025).applyMatrix4(o.matrix).toArray());
 cord(g,points,.0013,m.stitch,o.name+' sewn leather piping');
 for(let j=0;j<points.length-1;j+=2){const a=new T.Vector3(...points[j]),b=new T.Vector3(...points[j+1]),d=b.clone().sub(a).multiplyScalar(.35);cord(g,[a.toArray(),a.add(d).toArray()],.00065,m.stitch,o.name+' saddle stitch');}
}
function rivetedStrap(g,path,m,width=.012){
 const curve=new T.CatmullRomCurve3(path.map(p=>new T.Vector3(...p))),p=[],uv=[],ix=[];
 for(let j=0;j<=24;j++){const t=j/24,v=curve.getPoint(t);for(let i=0;i<2;i++){p.push(v.x+(i-.5)*width,v.y,v.z);uv.push(i,t);}if(j<24){const n=j*2;ix.push(n,n+1,n+2,n+1,n+3,n+2);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();add(g,geo,m.leather,'Folded equipment strap');
 for(const t of [.12,.85])bead(g,curve.getPoint(t).toArray(),.0027,m.gold,'Harness double rivet');
}
export function finishHeroCostume(c,part,m,profile){
 const r=profile.rarity,smith=c.design==='ashwright',warden=c.design==='warden',hips=part('hips'),chest=part('chest');
 for(const g of [hips,chest])for(const o of [...g.children])if(/^(Split leather coat|Ranked split mantle$|Sculpted forge apron$|Tailored smith bib$)/.test(o.name))sewnPanel(g,o,m);
 // A loose belt end, keeper loops, punched holes and paired rivets make the
 // waist read as leather hardware instead of a smooth cylindrical ring.
 const tip=leaf(hips,[[-.016,.095],[.016,.095],[.014,-.071],[.004,-.089],[-.012,-.076]],m.leather,{depth:.003,bow:.003,name:'Hanging belt tongue'});tip.position.set(.065,0,.164);tip.rotation.z=-.09;
 for(let j=0;j<4;j++)bead(hips,[.065+j*.001,.054-j*.025,.174],.0016,m.dark,'Punched belt holes');
 for(const x of [-.072,.112]){const loop=add(hips,new T.TorusGeometry(.009,.0025,5,4),m.gold,'Belt keeper');loop.position.set(x,.143,.148);loop.scale.set(.65,1.8,1);}
 if(smith){
  // The smith carries recognisable forging tools in fitted leather loops.
  for(const [x,y,z,len]of [[.178,-.044,.145,.20],[.211,-.055,.119,.17]]){
   cord(hips,[[x,y+.06,z],[x-.018,y-len,z+.008]],.008,m.leather,'Leather-wrapped forge tool handle');
   rivetedStrap(hips,[[x-.026,y,.161],[x-.005,y-.009,.18],[x+.012,y,.15]],m,.020);
   const tool=add(hips,new T.BoxGeometry(.053,.025,.024),m.steel,'Small smith finishing hammer');tool.position.set(x+.004,y+.068,z);tool.rotation.z=-.10;
  }
  for(const s of [-1,1])for(let j=0;j<3;j++){
   const y=.03-j*.022;cord(chest,[[s*.115,y,.178],[s*.136,y-.003,.173]],.0011,m.stitch,'Apron strap saddle stitch');
  }
 }else if(warden&&r>=2){
  // Tassets are articulated plates hung from the belt, not a robe over bare
  // trousers. Thin overlaps and side hinges leave the leg silhouette visible.
  for(const s of [-1,1])for(let j=0;j<3;j++){
   const plate=leaf(hips,[[-.046,.018],[.047,.019],[.052,-.040],[.030,-.065],[-.044,-.056]],j%2?m.steel:m.ivory,{depth:.004,bow:.008,name:'Articulated side tasset lame'});plate.position.set(s*(.166+j*.004),-.068-j*.058,.122);plate.rotation.y=s*.5;
   for(const x of [-.027,.027])bead(hips,[s*(.166+j*.004)+x,-.065-j*.058,.151-Math.abs(x)*.35],.0027,m.gold,'Tasset pivot rivet');
  }
 }
 for(const side of ['l','r']){
  const fore=part('lowerarm'+side),shin=part('lowerleg'+side),foot=part('foot'+side),arm=part('upperarm'+side);
  // Sewn cuff, plate edges and buckles remain restrained on low tiers.
  for(const y of [.16,.225])for(const a of [-1.1,-.55,0,.55,1.1]){const rad=y<.2?.052:.043;cord(fore,[[Math.sin(a)*rad,y,Math.cos(a)*rad+.001],[Math.sin(a+.12)*rad,y,Math.cos(a+.12)*rad+.001]],.001,m.stitch,'Bracer saddle seam');}
  if(warden||profile.sleeves){
   const wing=leaf(fore,[[-.029,-.008],[.029,-.006],[.040,.024],[.018,.052],[-.022,.042]],m.steel,{depth:.004,bow:.009,name:'Elbow articulated side wing'});wing.position.set(side==='l'?.049:-.049,.004,.008);wing.rotation.y=side==='l'?Math.PI/2:-Math.PI/2;
   for(const s of [-1,1])cord(shin,[[s*.029,.046,-.076],[s*.036,.12,-.068],[s*.021,.31,-.049]],.0016,r>=3?m.gold:m.ivory,'Greave chased margin');
  }
  // Thin heel and stitched welt give boots a firm sole rather than a rounded
  // slipper silhouette. These follow the authored foot's +Y toe direction.
  const sole=form(foot,[[.02,.051,.008,.041],[.10,.064,.009,.049],[.177,.055,.008,.043],[.225,.027,.007,.024]],m.dark,{sides:24,name:'Boot layered leather outsole'});
  for(const s of [-1,1])cord(foot,[[s*.046,.034,.045],[s*.061,.11,.054],[s*.051,.174,.047],[s*.025,.220,.029]],.002,m.stitch,'Boot stitched welt');
  if(r>=3){
   // Small warm rivets and a fluted center distinguish forged plate from
   // generic smooth shoulder balls at the normal gameplay distance.
   for(const s of [-1,1])for(let j=0;j<3;j++)bead(arm,[s*(.072-j*.006),.064+j*.039,.068-j*.004],.0028,m.gold,'Pauldron border fastening');
  }
 }
 c.visual.userData.costumeConstruction=225;
}
