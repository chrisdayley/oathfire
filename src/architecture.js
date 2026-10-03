import {cutBlockGeometry} from './stone-arch.js';
import {slate as slateMaterial,limePlaster} from './building-materials.js';
import * as T from 'three';
import {mesh,box,cyl,beam} from './art.js';
import {material,worldMaterial} from './materials.js';

const cached=(m,key,create)=>{m.architectureCache ||= new Map();if(!m.architectureCache.has(key))m.architectureCache.set(key,create());return m.architectureCache.get(key);};
// Roof dimensions are real metres. Courses follow the same curved surface as
// the roof, so tiles, dormers and eaves never float above an unrelated pyramid.
export function roofHeight(t,rise){return rise*Math.pow(Math.max(0,1-t),1.28);}
export function craftedRoof(parent,m,{x=0,y=0,z=0,width=8,depth=6,rise=2.8,angle=0,tiles=true,dormers=0,tint=0x49546a}={}){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=angle;parent.add(g);
 const slate=cached(m,'slate'+tint,()=>slateMaterial(tint)),edge=m.wood,cap=m.gold;
 const hw=width/2,hd=depth/2,rows=Math.max(6,Math.ceil(depth*1.4)),cols=Math.ceil(width/.43),pos=[],uv=[],idx=[];
 for(const side of [-1,1]){const start=pos.length/3;for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){const t=row/rows;pos.push(-hw+col*width/cols,roofHeight(t,rise),side*t*hd);uv.push(col/cols*width,row/rows*depth*.5);}for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const a=start+row*(cols+1)+col;idx.push(...(side<0?[a,a+1,a+cols+1,a+1,a+cols+2,a+cols+1]:[a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2]));}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,slate,g);
 // Close both gables with timber and pale plaster; no hollow triangle ends.
 for(const side of [-1,1]){const p=[],u=[],ix=[];for(let row=0;row<=rows*2;row++){const zz=-hd+row*depth/(rows*2),yy=roofHeight(Math.abs(zz)/hd,rise);p.push(side*(hw-.20),-.12,zz,side*(hw-.20),yy,zz);u.push(row/rows,0,row/rows,yy/2);if(row<rows*2){const a=row*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}}const end=new T.BufferGeometry();end.setAttribute('position',new T.Float32BufferAttribute(p,3));end.setAttribute('uv',new T.Float32BufferAttribute(u,2));end.setIndex(ix);end.computeVertexNormals();const plaster=cached(m,'gable',()=>Object.assign(limePlaster(0xb9ad95),{side:T.DoubleSide}));mesh(end,plaster,g);for(let j=-2;j<=2;j++){const zz=j*hd/3;box(g,[.18,roofHeight(Math.abs(zz)/hd,rise),.16],[side*(hw-.10),roofHeight(Math.abs(zz)/hd,rise)/2,zz],edge);}for(const sign of [-1,1])for(let j=0;j<rows;j++){const t=j/rows,t2=(j+1)/rows;beam(g,[side*(hw+.025),roofHeight(t,rise)+.03,sign*t*hd],[side*(hw+.025),roofHeight(t2,rise)+.03,sign*t2*hd],.085,edge,6);}}
 for(const side of [-1,1]){box(g,[width+.25,.24,.20],[0,-.04,side*hd],edge);for(let i=0;i<cols;i+=2){const xx=-hw+(i+.5)*width/cols;beam(g,[xx,-.38,side*(hd-.5)],[xx,.01,side*(hd+.08)],.07,edge,5);}if(tiles)for(let row=0;row<rows;row++){const t=(row+.50)/rows,yy=roofHeight(t,rise)+.035,zz=side*t*hd,slope=rise*1.28*Math.pow(1-t,.28)/hd;for(let col=0;col<cols;col++){const xx=-hw+(col+.5)*width/cols;const variation=.87+((col*7+row*13)%11)*.022;const tileMat=cached(m,'slate'+tint+'tone'+((col*7+row*13)%5),()=>slateMaterial(new T.Color(tint).multiplyScalar(variation).getHex()));const tile=mesh(cutBlockGeometry(width/cols-.014,.035,hd/rows*1.23,.007),tileMat,g,xx+(row%2?width/cols*.22:0),yy+((col+row)%3)*.004,zz);tile.rotation.x=side*Math.atan(slope);tile.rotation.y=Math.sin(col*13+row*7)*.013;}}}
 // Clay ridge caps and finials break the silhouette at normal camera distance.
 for(let i=0;i<Math.ceil(width/.65);i++){const capTile=cyl(g,.14,.14,.64,[-hw+.32+i*.65,rise+.09,0],slate,8);capTile.rotation.z=Math.PI/2;}
 for(const xx of [-hw,hw]){cyl(g,.045,.11,.64,[xx,rise+.30,0],cap,8);mesh(new T.SphereGeometry(.10,8,6),cap,g,xx,rise+.62,0);}
 for(let i=0;i<dormers;i++)dormer(g,m,(i-(dormers-1)/2)*width/(dormers+1),roofHeight(.56,rise)-.28,-hd*.56,Math.min(1.75,width/(dormers+2)));
 g.userData.craftedRoof=true;return g;
}
function dormer(g,m,x,y,z,width){const h=1.3;box(g,[width,h,1.5],[x,y+h/2,z+.35],m.stone);const dark=cached(m,'dormerGlass',()=>material('cloth',0x483d2d,{emissive:0xd59140,emissiveIntensity:.35}));box(g,[width*.64,.90,.06],[x,y+.65,z-.42],dark);for(const dx of [-width*.37,0,width*.37])box(g,[.075,.99,.10],[x+dx,y+.65,z-.47],m.wood);box(g,[width*.82,.10,.20],[x,y+.14,z-.48],m.wood);box(g,[width*.8,.05,.10],[x,y+.7,z-.48],m.wood);craftedRoof(g,m,{x,y:y+h,z:z+.28,width:1.8,depth:width+ .35,rise:.77,angle:Math.PI/2,tiles:false});}

export function craftedHouse(w,x,y,z,{width=7,depth=6,height=6,angle=0,tint=0xb8ab8c,roof=0x3f4f66,dormers=1,detail=true}={}){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=angle;w.static.add(g);const m=w.materials,plaster=cached(m,'plaster'+tint,()=>limePlaster(tint)),glass=cached(m,'houseGlass',()=>material('cloth',0x5d5946,{emissive:0xbd8240,emissiveIntensity:.22}));
 box(g,[width,height,depth],[0,height/2,0],plaster);box(g,[width+.22,.45,depth+.2],[0,.23,0],m.stoneDark);
 for(const side of [-1,1]){for(const yy of [.65,height*.5,height-.1])box(g,[width+.14,.18,.14],[0,yy,side*(depth/2+.025)],m.wood);for(let i=-2;i<=2;i++)box(g,[.18,height,.15],[i*width*.235,height/2,side*(depth/2+.055)],m.wood);for(const xx of [-width*.27,width*.27])for(const yy of [height*.3,height*.72]){box(g,[.82,1.1,.07],[xx,yy,side*(depth/2+.12)],glass);for(const dx of [-.52,.52])box(g,[.21,1.24,.13],[xx+dx,yy,side*(depth/2+.17)],m.teal);for(const dx of [-.4,0,.4])box(g,[.045,1.12,.1],[xx+dx,yy,side*(depth/2+.18)],m.wood);box(g,[1.38,.13,.34],[xx,yy-.64,side*(depth/2+.22)],m.cap);}if(detail)for(let i=-2;i<2;i++)beam(g,[i*width*.235,height*.53,side*(depth/2+.08)],[(i+1)*width*.235,height-.18,side*(depth/2+.08)],.06,m.wood);}
 craftedRoof(g,m,{y:height,width:width+.85,depth:depth+1,rise:depth*.47,tiles:detail,dormers,tint:roof});
 box(g,[.68,2.8,.73],[width*.32,height+1.2,.45],m.stone);for(const yy of [height+2.3,height+2.55])box(g,[.86,.16,.92],[width*.32,yy,.45],m.cap);return g;
}
