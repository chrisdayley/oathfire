import * as T from 'three';
import {shell,plaque,textile} from './atelier.js';
import {mesh,box,cyl,beam} from './art.js';
import {material} from './materials.js';
const trace=(g,ps,r,m)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(ps.map(p=>new T.Vector3(...p))),18,r,5,false),m,g);
export function dressHost(c,part,role,m){
 const chest=part('chest'),hips=part('hips'),head=part('head'),v=c.design,plate=!['hollow','archer','mage'].includes(role),giant=role==='brute';
 const iron=material('steel',giant?0x514c44:0x3c4546,{roughness:.76,roughnessMap:null,metalness:.65}),edge=material('steel',0x9b8770,{roughness:.72,roughnessMap:null,metalness:.60}),rag=material('cloth',['herald','reaver'].includes(v)?0x632e26:role==='mage'?0x513653:['bomber','mortar'].includes(v)?0x694327:role==='archer'?0x484f63:0x403936,{side:T.DoubleSide,roughness:1}),ash=material('cloth',0xaaa493,{roughness:1});c.materials.push(iron,edge,rag,ash);
 if(plate){
  // A pointed sallet over a forged faceplate: no rounded toy helmet or neck peg.
  shell(head,[[-.03,.094,.09],[.09,.131,.125],[.18,.14,.13],[.28,.10,.09],[.335,.018,.045]],iron,{square:.58,segments:16});
  plaque(head,[[-.12,.19],[0,.21],[.12,.19],[.095,.019],[0,-.028],[-.095,.019]],[0,0,.12],edge,.015);
  plaque(head,[[-.109,.16],[-.015,.144],[0,.127],[.015,.144],[.109,.16],[.089,.132],[.017,.113],[-.017,.113],[-.089,.132]],[0,0,.14],m.black,.009);
  for(const side of [-1,1])box(head,[.052,.008,.003],[side*.052,.141,.153],m.glow);
  trace(head,[[0,-.026,.139],[0,.125,.16],[0,.225,.139],[0,.33,.04]],.008,iron);
  shell(chest,[[.12,.244,.14],[.24,.14,.09],[.31,.09,.084]],iron,{square:.60});
  for(const side of [-1,1]){for(let j=0;j<4;j++)trace(chest,[[side*(.05+j*.04),-.13,.13],[side*(.065+j*.039),0,.17],[side*(.063+j*.034),.13,.133]],.005,edge);
   const arm=part('upperarm.'+(side>0?'l':'r'));for(let j=0;j<4;j++){const pauldron=plaque(arm,[[-.12,-.05],[0,-.085],[.13,-.04],[.15,.038],[.085,.098],[-.12,.072]],[0,j*.044,-.123],iron,.10);pauldron.rotation.z=side*.15;trace(arm,[[-.12,j*.044+.064,-.13],[.06,j*.044+.096,-.13],[.15,j*.044+.035,-.13]],.006,edge);}
   const blade=plaque(arm,[[0,0],[.028,-.15],[.078,-.23],[.12,-.19],[.10,-.025],[.07,.055]],[side*.087,-.015,-.02],iron);blade.scale.x=side;
   for(let j=0;j<4;j++){const t=plaque(hips,[[-.074,0],[.070,0],[.08,-.074],[.025,-.10],[-.085,-.08]],[side*.135,-.016-j*.064,.123],iron);t.rotation.y=side*.18;}
  }
 }
 if(giant){
  // Riveted furnace shoulders and back exhausts tell the bombard silhouette at a glance.
  for(const side of [-1,1]){const arm=part('upperarm.'+(side>0?'l':'r'));shell(arm,[[-.11,.09,.10],[-.04,.22,.20],[.13,.23,.18],[.20,.17,.15]],iron,{segments:8,square:.55});for(let j=0;j<4;j++){box(arm,[.30,.018,.032],[0,-.03+j*.055,-.19],edge);for(const xx of [-.14,.14])mesh(new T.SphereGeometry(.009,6,4),edge,arm,xx,-.03+j*.055,-.211);}const stack=cyl(chest,.073,.097,.65,[side*.15,.36,-.20],iron,10);cyl(chest,.104,.104,.08,[side*.15,.66,-.20],edge,10);}
  const hatch=plaque(chest,[[-.14,-.13],[.14,-.13],[.16,.13],[0,.18],[-.16,.13]],[0,0,.165],iron,.018);for(let j=0;j<6;j++)box(chest,[.19,.009,.020],[0,-.075+j*.038,.204],m.glow);
 }
 if(role==='mage'||['bell','castellan','veyr'].includes(role)){
  for(const side of [-1,1]){const drape=shell(hips,[[.1,.171,.135],[-.25,.23,.16],[-.66,.28,.19]],rag,{start:side>0?.3:3.5,end:side>0?2.8:6.0,square:.8});const p=drape.geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)<-.6)p.setY(i,p.getY(i)+(Math.sin(p.getX(i)*71)+1)*.055);p.needsUpdate=true;for(let j=0;j<3;j++)trace(chest,[[side*(.13+j*.025),.19,.10],[side*(.12+j*.025),0,.17],[side*(.14+j*.023),-.30,.15]],.005,edge);}
 }
 if(['hollow','archer'].includes(role)){for(const side of [-1,1])trace(chest,[[side*.15,.18,.01],[side*.19,-.10,.09],[side*.13,-.26,.04]],.025,rag);for(let i=0;i<4;i++){const strip=plaque(hips,[[-.035,0],[.04,0],[.056,-.33],[.022,-.27],[-.026,-.40]],[-.12+i*.08,-.05,.10],rag,.003);strip.rotation.z=(i-1.5)*.06;}}
 if(['archer','runner','longbow'].includes(v)){for(const side of [-1,1])for(let i=0;i<5;i++){const feather=plaque(head,[[0,0],[.012,.05],[.033,.17],[-.017,.135]],[side*.12,.18-i*.013,-.02-i*.025],rag,.004);feather.rotation.z=side*(.2+i*.17);}if(v==='runner')plaque(head,[[-.052,.16],[.05,.16],[.025,.105],[0,.03],[-.028,.11]],[0,0,.115],edge,.13);}
 if(v==='mender'||v==='hollowking'){for(const side of [-1,1]){trace(head,[[side*.09,.22,-.035],[side*.18,.37,-.04],[side*.20,.55,-.08],[side*.30,.68,-.04]],.016,m.bone);for(let i=0;i<3;i++)trace(head,[[side*(.14+i*.03),.33+i*.09,-.04],[side*(.26+i*.02),.39+i*.08,-.03],[side*(.28+i*.035),.49+i*.08,0]],.010,m.bone);}}
 if(v==='herald'||role==='veyr'){const fm=rag.clone();fm.map=textile('heraldry','#56272a','#9f8b72');fm.color.setHex(0xffffff);c.materials.push(fm);const standard=mesh(new T.PlaneGeometry(.60,.90,8,12),fm,chest,-.02,.42,-.24);const p=standard.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.sin(y*10)*.045);if(y<-.40)p.setY(i,y+Math.abs(Math.sin(x*23))*.10);}beam(chest,[-.33,-.2,-.25],[-.33,1.07,-.25],.018,iron);}
 if(v==='bomber'){for(const side of [-1,1])for(let i=0;i<3;i++){const z=.05+i*.07;cyl(hips,.04,.05,.17,[side*.18,-.04,z],edge,10);trace(hips,[[side*.18,.06,z],[side*.20,.12,z],[side*.23,.14,z]],.005,m.glow);}}
}
