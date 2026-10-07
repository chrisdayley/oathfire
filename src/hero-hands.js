import * as T from 'three';
import {form,add,cord} from './model-craft.js';

// A closed cylindrical grasp: four fingers curl around the negative-Z handle
// socket, while the thumb crosses from the opposite side. The former authored
// fingers curled away from that socket, leaving an open claw below the weapon.
function digit(g,points,radius,mat,name){
 const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),geo=new T.TubeGeometry(path,24,radius,10,false),p=geo.attributes.position;
 for(let row=0;row<=24;row++){const t=row/24,center=path.getPointAt(t),taper=1-.22*t;for(let j=0;j<=10;j++){const i=row*11+j;p.setXYZ(i,center.x+(p.getX(i)-center.x)*taper,center.y+(p.getY(i)-center.y)*taper,center.z+(p.getZ(i)-center.z)*taper);}}
 geo.computeVertexNormals();add(g,geo,mat,name);
 // Rounded fingertip closes the tube, including close armory views.
 const end=add(g,new T.SphereGeometry(radius*.79,10,8),mat,name+' tip');end.position.copy(path.getPoint(1));
}
export function tailoredHands(c,part,m){
 const armored=(c.armor?.rarity||0)>=4;
 for(const [side,sign]of [['r',-1],['l',1]]){
  const hand=part('hand'+side),wrist=part('wrist'+side);
  form(wrist,[[-.014,.036,.033],[.020,.037,.034],[.070,.040,.034]],m.leather,{sides:28,name:'Continuous glove cuff'});
  form(hand,[[-.013,.034,.029],[.018,.041,.031],[.052,.040,.030],[.076,.034,.024]],m.leather,{sides:32,name:'Fitted glove palm'});
  for(let j=0;j<4;j++){
   const x=(j-1.5)*.018,length=1-Math.abs(j-1.4)*.06;
   digit(hand,[[x,.058,.012],[x,.082,.004],[x,.095*length,-.020],[x,.084*length,-.048],[x,.059,-.050],[x,.051,-.036]],.010,m.leather,'Curled gripping finger');
   if(armored){const plate=add(hand,new T.SphereGeometry(1,12,8),m.steel,'Individual knuckle plate');plate.position.set(x,.070,.019);plate.scale.set(.011,.021,.010);}
   else cord(hand,[[x-.003,.027,.031],[x,.045,.032],[x,.065,.025]],.0007,m.stitch,'Glove dorsal seam');
  }
  digit(hand,[[sign*.033,.016,.011],[sign*.045,.038,-.002],[sign*.041,.058,-.029],[sign*.025,.062,-.053],[sign*.007,.055,-.054]],.014,m.leather,'Opposed gripping thumb');
  if(armored){
   const plate=form(hand,[[.003,.036,.031],[.034,.041,.034],[.059,.036,.030]],m.steel,{sides:24,start:-Math.PI*.47,arc:Math.PI*.94,name:'Fitted gauntlet backplate'});
   cord(hand,[[-.033,.005,.018],[0,.002,.035],[.033,.005,.018]],.0018,m.gold,'Gauntlet rolled wrist edge');
  }
 }
 c.visual.userData.gripConstruction=226;
}
