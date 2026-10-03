import * as T from 'three';
import {TOWN_PROJECTS,projectEarned,projectAcknowledged,claimHomecoming} from './frontline-rules.js';
import {box,cyl,beam,mesh,sunBadge} from './art.js';
import {material} from './materials.js';
import {MISSIONS} from './data.js';
export function buildHomeProgress(w,s){
 if(!s)return;const m=w.materials,earned=TOWN_PROJECTS.filter(p=>projectEarned(s,p));
 w.root.userData.homeProjects=earned.map(p=>p.id);
 for(const p of earned){
  const g=new T.Group();g.position.set(p.x,0,p.z);w.static.add(g);const cloth=material('cloth',p.color,{side:T.DoubleSide});
  const flag=w.flag(p.x,0,p.z,1.0);flag.traverse(o=>{if(o.isMesh&&o.geometry.type==='PlaneGeometry'){o.material=o.material.clone();o.material.color.setHex(p.color);}});
  if(['mill','harbor','forge'].includes(p.id)){
   for(const x of [-2,2])beam(g,[x,0,0],[x,3.4,0],.06,m.wood);
   const geo=new T.PlaneGeometry(4.6,2.5,12,8),a=geo.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,-.16*Math.cos(a.getX(i)*1.4));geo.computeVertexNormals();const canopy=mesh(geo,cloth,g,0,3.35,-1);canopy.rotation.x=-Math.PI/2;
   box(g,[3.5,.18,1.2],[0,.95,-.6],m.wood);
   for(let i=0;i<9;i++){const x=-1.45+i*.35;if(p.id==='mill'){const loaf=mesh(new T.SphereGeometry(.18,10,8),material('cloth',0xbb8044),g,x,1.12,-.6);loaf.scale.set(1.2,.65,1.7);}else if(p.id==='harbor')cyl(g,.11,.18,.4,[x,1.18,-.6],material('cloth',i%2?0x958164:0xa16c4f),12);else{box(g,[.08,1.05,.05],[x,1.5,-.6],m.iron);box(g,[.32,.07,.08],[x,1.13,-.6],m.gold);}}
   w.physics.addBox(p.x,.55,p.z-.6,3.5,1.1,1.2,'homecoming-stall');w.nav.push({x:p.x,z:p.z-.6,hx:2,hz:.9,top:1.2});
  }else if(p.id==='masonry'){
   for(const side of [-1,1]){const x=side*10;for(let i=0;i<7;i++)box(w.static,[2.3-i*.17,.7,1.4],[x,.35+i*.7,-14],m.cap);const badge=sunBadge(w.static,.65,m.gold);badge.position.set(x,4.8,-13.2);w.physics.addBox(x,2.5,-14,2.3,5,1.4,'restored-buttress');w.nav.push({x,z:-14,hx:1.4,hz:1,top:5});}
  }else if(p.id==='fletchers'){
   for(const x of [-2,2]){beam(g,[x,0,0],[x,2.2,0],.05,m.wood);const target=cyl(g,.65,.65,.14,[x,1.65,0],cloth,20);target.rotation.x=Math.PI/2;const bull=cyl(g,.2,.2,.16,[x,1.65,.08],m.gold,16);bull.rotation.x=Math.PI/2;}
   for(let i=0;i<8;i++){const x=-1.1+i*.3;beam(g,[x,.2,-.8],[x,1.6,-.7],.012,m.wood);mesh(new T.ConeGeometry(.06,.18,4),m.iron,g,x,1.7,-.7);}
  }else if(['garden','orchard'].includes(p.id)){
   for(const x of [-2,2])beam(g,[x,0,0],[x,3.1,0],.08,m.wood);for(let i=0;i<6;i++)beam(g,[-2,3.1,-i*.4],[2,3.1,-i*.4],.055,m.wood);
   for(let i=0;i<28;i++){const x=Math.sin(i*2.4)*2.3,z=-1+Math.cos(i*2.4)*1.4,y=.5+(i%4)*.16;beam(g,[x,0,z],[x,y,z],.012,m.leaf);mesh(new T.IcosahedronGeometry(.17,1),i%3?cloth:m.gold,g,x,y,z);}
   if(p.id==='orchard')for(const x of [-2.4,2.4]){beam(g,[x,0,-1],[x,2.8,-1],.08,m.wood);mesh(new T.IcosahedronGeometry(.95,2),material('cloth',0x849866),g,x,2.7,-1);for(let i=0;i<8;i++)mesh(new T.SphereGeometry(.12,8,6),cloth,g,x+Math.sin(i)*.8,2.7+Math.cos(i*2)*.6,-1+Math.cos(i)*.7);}
  }else{
   cyl(g,1.5,1.7,.35,[0,.175,0],m.cap,16);cyl(g,.7,1,1.5,[0,1.1,0],m.stone,12);const badge=sunBadge(g,1.3,m.gold);badge.position.set(0,2.7,0);w.physics.addBox(p.x,1,p.z,2,2,2,'sun-monument');w.nav.push({x:p.x,z:p.z,hx:1.3,hz:1.3,top:2.8});
  }
 }
}
export function homecomingDialog(ui,tab){
 const s=ui.g.store.data,projects=TOWN_PROJECTS.filter(p=>p.tab===tab),p=projects.find(p=>projectEarned(s,p)&&!projectAcknowledged(s,p));
 if(!p){const request=projects.find(p=>!projectEarned(s,p)&&!s.guide.seen.includes('home-request-'+p.id));if(!request)return false;ui.dialog('<small>'+request.person.toUpperCase()+' · A REQUEST FOR THE ROAD</small><h2>'+request.name+'</h2><p>'+request.ask+'</p><p>Reclaim '+MISSIONS[request.town].name+' when its route opens at the war table. Its people will permanently improve Hearthwatch.</p><div class="dialog-actions"><button class="primary" id="home-request-continue">Continue to '+request.person+'</button></div>');document.getElementById('home-request-continue').onclick=()=>{ui.g.store.commit(s=>s.guide.seen.push('home-request-'+request.id));document.getElementById('dialog').hidden=true;ui.open(tab);};return true;}
 ui.dialog('<small>'+p.person.toUpperCase()+' · '+MISSIONS[p.town].name+' RECLAIMED</small><h2>'+p.name+'</h2><p>'+p.detail+'</p><p class="homecoming-note">These improvements are permanent. Holding '+MISSIONS[p.town].name+' also keeps its daily tribute and research available.</p><div class="dialog-actions"><button id="homecoming-look">See the improvements</button><button class="primary" id="homecoming-service">Continue to '+p.person+'</button></div>');
 const finish=()=>{ui.g.store.commit(s=>claimHomecoming(s,p.id));document.getElementById('dialog').hidden=true;};
 document.getElementById('homecoming-service').onclick=()=>{finish();ui.open(tab);};
 document.getElementById('homecoming-look').onclick=()=>{finish();ui.close();ui.g.homeProjectTarget=p;ui.g.toast(p.name+' · follow the gold marker in the courtyard.');};return true;
}
export function projectRequest(ui,tab){const p=TOWN_PROJECTS.find(p=>p.tab===tab&&!projectEarned(ui.g.store.data,p));return p?'<div class="home-project-request"><b>'+p.name+'</b><span>'+p.ask+'</span></div>':'';}
