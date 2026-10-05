import * as T from 'three';
import {box,beam,cyl,mesh} from './art.js';
import {craftedRoof} from './architecture.js';
import {makeHorse} from './horse-art.js';
import {MOUNTS,stableUnlocked} from './mount-rules.js';
export function buildStable(w,save){const m=w.materials,g=new T.Group();g.position.set(25,0,26);w.static.add(g);
 for(const x of [-4,4]){box(g,[.3,3.4,7],[x,1.7,0],m.wood);w.physics.addBox(25+x,1.7,26,.3,3.4,7,'stable-wall');}
 box(g,[8,3.2,.25],[0,1.6,3.5],m.wood);w.physics.addBox(25,1.6,29.5,8,3.2,.25,'stable-wall');
 for(const x of [-4,0,4]){box(g,[.25,3.8,.25],[x,1.9,-3.5],m.wood);beam(g,[x,2.65,-3.5],[x+(x<=0?1:-1),3.7,-3.5],.08,m.wood);}
 craftedRoof(g,m,{y:3.7,width:9,depth:8,rise:2.4,dormers:0,tint:0x405265});
 for(const x of [-2,2]){for(const y of [.4,.8,1.2])box(g,[3.5,.12,.12],[x,y,-2.5],m.wood);for(const dx of [-1.75,1.75])box(g,[.13,1.5,.13],[x+dx,.75,-2.5],m.wood);for(const z of [-.5,1.5]){box(g,[.13,1.4,.13],[0,.7,z],m.wood);box(g,[.12,.14,2],[0,1,z+.5],m.wood);}}
 for(const x of [-2,2])w.physics.addBox(25+x,.75,23.5,3.5,1.5,.18,'stable-fence');w.physics.addBox(25,.7,27, .18,1.4,4,'stable-fence');
 const sign=box(g,[2.3,.68,.1],[0,3.20,-3.66],m.teal);for(const x of [-1.1,1.1])beam(g,[x,3.8,-3.67],[x,3.5,-3.67],.022,m.iron);const shoe=mesh(new T.TorusGeometry(.23,.04,7,18,Math.PI*1.7),m.gold,g,0,3.19,-3.75);shoe.rotation.z=-Math.PI*.35;
 for(const x of [-2.7,2.7]){cyl(g,.48,.45,.65,[x,.35,2.7],m.wood,12);for(const y of [.12,.55]){const ring=mesh(new T.TorusGeometry(.47,.025,5,20),m.iron,g,x,y,2.7);ring.rotation.x=Math.PI/2;}}
 w.stableHorses=[];if(save&&stableUnlocked(save))for(const [i,x]of [-1.8,1.8].entries()){const horse=makeHorse(MOUNTS[i]);horse.position.set(25+x,.03,26);horse.rotation.y=Math.PI+(i?.15:-.1);w.dynamic.add(horse);w.stableHorses.push(horse);}
}
