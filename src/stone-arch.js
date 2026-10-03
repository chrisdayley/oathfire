import * as T from 'three';
import {mesh} from './art.js';

// A straight chamfer uses 28 triangles instead of a rounded box's 108. Thousands
// of small architectural blocks need a bevel highlight, not a rounded shell.
export function cutBlockGeometry(width,height,depth,bevel=.02){
 const b=Math.min(bevel,width*.2,height*.2,depth*.2),x=width/2-b,y=height/2-b,shape=new T.Shape();shape.moveTo(-x,-y);shape.lineTo(x,-y);shape.lineTo(x,y);shape.lineTo(-x,y);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:depth-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:1,steps:1});g.translate(0,0,-depth/2+b);return g;
}

// Wedge-shaped voussoirs follow both elliptical edges. Rotating rectangular
// blocks around an ellipse leaves saw-tooth gaps and false load-bearing joints.
export function stoneArch(parent,materials,{x=0,y=0,z=0,rx=3,ry=2,band=.25,depth=.35,count=23}={}){
 const stones=[];for(let i=0;i<count;i++){const a=(i+.025)/count*Math.PI,b=(i+.975)/count*Math.PI,shape=new T.Shape();shape.moveTo(Math.cos(a)*rx,Math.sin(a)*ry);shape.lineTo(Math.cos(a)*(rx+band),Math.sin(a)*(ry+band));for(let j=1;j<=3;j++){const t=a+(b-a)*j/3;shape.lineTo(Math.cos(t)*(rx+band),Math.sin(t)*(ry+band));}shape.lineTo(Math.cos(b)*rx,Math.sin(b)*ry);for(let j=1;j<=3;j++){const t=b-(b-a)*j/3;shape.lineTo(Math.cos(t)*rx,Math.sin(t)*ry);}shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.006,bevelSize:.009,bevelSegments:1,steps:1});stones.push(mesh(geo,Array.isArray(materials)?materials[i%materials.length]:materials,parent,x,y,z));}return stones;
}
