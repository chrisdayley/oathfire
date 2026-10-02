import * as T from 'three';
import {box,cyl,beam,mesh,sunBadge} from './art.js';
import {craftedRoof} from './architecture.js';
export function logisticsPreview(m,rank){
 const g=new T.Group();g.name='Command lodge rank '+rank;
 box(g,[5,.25,4],[0,.125,0],m.cap);box(g,[4,2.7,3],[0,1.6,0],m.stone);
 for(const x of [-2,2])for(const z of [-1.51,1.51])beam(g,[x,.3,z],[x,2.9,z],.09,m.wood);
 craftedRoof(g,m,{x:0,y:2.95,z:0,width:4.8,depth:3.8,rise:1.5,tiles:true,dormers:1,tint:0x426d84});
 box(g,[.9,1.8,.12],[0,1.2,1.55],m.wood);for(const x of [-1.25,1.25]){box(g,[.65,.9,.08],[x,1.7,1.55],m.dark);for(const dy of [-.2,.2])beam(g,[x-.34,1.7+dy,1.62],[x+.34,1.7+dy,1.62],.025,m.gold);}
 const badge=sunBadge(g,.3,m.gold);badge.position.set(0,2.55,1.61);
 for(let i=0;i<Math.max(1,rank);i++){const x=-1.6+i*.8;beam(g,[x,3.9,0],[x,5,0],.025,m.gold);box(g,[.35,.5,.04],[x+.16,4.65,0],i<rank?m.teal:m.wood);}
 if(rank>=2)for(const x of [-2.25,2.25])cyl(g,.2,.3,2,[x,1,1.5],m.iron,10);
 if(rank>=3)for(const x of [-2.1,2.1])box(g,[.3,2.2,3.4],[x,1.2,0],m.cap);
 if(rank>=4)for(const x of [-1.8,1.8]){const b=sunBadge(g,.22,m.gold);b.position.set(x,2.4,1.76);}
 if(rank>=5){const b=sunBadge(g,.45,m.gold);b.position.set(0,4,1.05);}
 return g;
}
