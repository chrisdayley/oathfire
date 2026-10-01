import * as T from 'three';
import {box,cyl,mesh,beam} from './art.js';
import {material} from './materials.js';
export function makeMount(rank,color){
 const g=new T.Group(),coat=material('leather',0x81664a,{normalScale:new T.Vector2(.15,.15),roughness:.9}),mane=material('cloth',0x222723),hoof=material('steel',0x343b36,{roughness:.9,metalness:.05}),plate=material('steel',0x778989,{roughness:.6}),gold=material('steel',0xa88b53),cloth=material('cloth',color),leather=material('leather',0x443b2d);
 const oval=(parent,scale,pos,m)=>{const o=mesh(new T.SphereGeometry(1,16,10),m,parent,...pos);o.scale.set(...scale);return o;};
 const body=oval(g,[.38,.46,.86],[0,1.17,0],coat);oval(g,[.34,.42,.36],[0,1.17,-.57],coat);oval(g,[.33,.44,.29],[0,1.22,.52],coat);
 const neck=oval(g,[.225,.59,.245],[0,1.64,.63],coat);neck.rotation.x=.42;
 const head=new T.Group();head.position.set(0,2.02,.84);head.rotation.x=-.28;g.add(head);oval(head,[.155,.21,.26],[0,0,.04],coat);const nose=oval(head,[.135,.13,.25],[0,-.11,.28],coat);oval(head,[.142,.11,.11],[0,-.13,.47],leather);
 for(const x of [-.10,.10]){const ear=oval(head,[.048,.17,.043],[x,.26,-.02],coat);ear.rotation.z=-x*2;oval(head,[.012,.025,.035],[x*1.5,.022,.13],hoof);oval(head,[.017,.023,.027],[x*1.2,-.13,.47],hoof);}
 const saddle=oval(g,[.31,.08,.37],[0,1.59,-.03],leather);for(const z of [-.30,.28]){const pommel=oval(g,[.29,.13,.085],[0,1.64,z],leather);}
 const blanket=mesh(new T.SphereGeometry(1,16,10,0,Math.PI*2,0,Math.PI*.56),cloth,g,0,1.18,-.02);blanket.scale.set(.405,.40,.63);
 for(const side of [-1,1]){beam(g,[side*.25,1.58,0],[side*.44,.82,.08],.014,leather);const stirrup=mesh(new T.TorusGeometry(.105,.016,6,12,Math.PI*1.8),plate,g,side*.44,.78,.08);stirrup.rotation.y=Math.PI/2;beam(head,[side*.14,-.07,.40],[side*.16,.16,-.03],.018,leather);beam(g,[side*.13,1.98,1.16],[side*.18,1.7,-.15],.011,leather);}
 const tail=new T.Group();tail.position.set(0,1.28,-.80);g.add(tail);for(let i=0;i<5;i++){const curve=new T.CatmullRomCurve3([new T.Vector3((i-2)*.025,0,0),new T.Vector3((i-2)*.03,-.23,-.24),new T.Vector3((i-2)*.025,-.77,-.19)]);mesh(new T.TubeGeometry(curve,12,.026,5,false),mane,tail);}
 for(let i=0;i<10;i++){const lock=oval(g,[.026,.10,.073],[0,1.61+i*.051,.44+i*.039],mane);lock.rotation.x=-.3;}
 const legs=[];for(const x of [-.25,.25])for(const z of [-.55,.56]){const hip=new T.Group();hip.position.set(x,1.11,z);const upper=oval(hip,[.096,.28,.116],[0,-.22,0],coat);const knee=new T.Group();knee.position.y=-.48;oval(knee,[.065,.055,.077],[0,0,0],coat);cyl(knee,.055,.037,.47,[0,-.23,0],coat,10);const foot=oval(knee,[.081,.075,.11],[0,-.50,.028],hoof);hip.add(knee);g.add(hip);legs.push({hip,knee,phase:x*z>0?0:Math.PI});}
 for(let i=1;i<rank;i++){const side=i%2?-1:1,section=Math.floor((i-1)/2);const bard=oval(g,[.045,.20,.20],[side*.39,1.18,-.52+section*.26],i>=7?gold:plate);}
 if(rank>=6){const chamfron=oval(head,[.135,.041,.29],[0,.14,.16],plate);}
 if(rank>=10){const crest=oval(head,[.018,.22,.10],[0,.40,0],cloth);}
 g.userData.animate=(time,speed)=>{const gait=time*(speed>4?10:6);for(const l of legs){l.hip.rotation.x=Math.sin(gait+l.phase)*Math.min(.65,speed*.17);l.knee.rotation.x=Math.max(0,Math.sin(gait+l.phase+.7))*.85*Math.min(1,speed/3);}head.rotation.x=-.28+Math.sin(time*2)*.025+Math.sin(gait)*speed*.004;tail.rotation.z=Math.sin(time*3)*.10;body.position.y=1.17+Math.abs(Math.sin(gait))*Math.min(.065,speed*.01);};return g;
}
