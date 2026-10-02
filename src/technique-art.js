import * as T from 'three';
import {evolutionFor} from './ability-progression.js';
const FIRE=new Set(['fireball','mine','inferno','forgefall']),LEAF=new Set(['windstep','thorns','mark','guide','seedward','briarstorm','grove','verdant']);
export function techniqueArt(fx,id,origin,target,rank,path){
 const e=evolutionFor(id,path),pose=e?.pose||(id==='fireball'?'lance':id==='volley'||id==='guide'?'rain':'ward'),seed=[...id].reduce((n,c)=>n+c.charCodeAt(0),0),fire=FIRE.has(id),leaf=LEAF.has(id),color=fire?0xff8d29:leaf?0x73d5b1:id==='quench'?0x80d8ef:0xf9d893;
 const g=new T.Group();g.name='technique-'+id+'-'+(path||'rank-'+rank);g.position.copy(origin);g.position.y+=.08;
 const material=new T.MeshBasicMaterial({color,transparent:true,opacity:fire?.35:.6,depthWrite:false,side:T.DoubleSide,blending:fire?T.NormalBlending:T.AdditiveBlending});
 const add=(geo,x,y,z)=>{const m=new T.Mesh(geo,material);m.position.set(x,y,z);g.add(m);return m;};
 const size=1+rank*.045+(e?.35:0),count=4+Math.floor(rank/2);
 const rune=add(new T.RingGeometry(.8,.84,64),0,0,0);rune.rotation.x=-Math.PI/2;
 for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const m=add(new T.OctahedronGeometry(.045+rank*.002),Math.sin(a),.03,Math.cos(a));m.scale.set(.5,1,2.5);m.rotation.y=a;}
 if((pose==='nova'||path==='impact')&&fire){flameCircle(fx,origin,path==='corona'?8:3,.9);fx.emit('ember',origin,35,{speed:5,life:1.2,size:.06});}
 else if(pose==='nova'||path==='impact'){
  for(let i=0;i<3;i++){const ring=add(new T.TorusGeometry(1+i*.2,.028,5,64),0,.12+i*.15,0);ring.rotation.x=-Math.PI/2;}
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const curve=new T.CatmullRomCurve3([new T.Vector3(Math.sin(a),0,Math.cos(a)),new T.Vector3(Math.sin(a+.15)*1.1,fire?1.5:.8,Math.cos(a+.15)*1.1),new T.Vector3(Math.sin(a+.22)*.8,fire?2.8:1.4,Math.cos(a+.22)*.8)]);add(new T.TubeGeometry(curve,12,.07,5,false),0,0,0);}
 }else if(pose==='lance'){
  const orb=add(new T.IcosahedronGeometry(id==='fireball'?.28:.15,2),0,1.35,.6);orb.scale.setScalar(path==='sun'?1.7:1);
  for(let i=0;i<3;i++){const ring=add(new T.TorusGeometry(.35+i*.10,.022,6,40),0,1.35,.6);ring.rotation.set(i*.75,i*.7,0);}
 }else if(pose==='rain'){
  for(let i=0;i<count;i++){const a=i/count*Math.PI*2,m=add(new T.ConeGeometry(.045,.9,5),Math.sin(a)*1.3,2+(i%3)*.3,Math.cos(a)*1.3);m.rotation.x=Math.PI;}
 }else if(pose==='charge'){
  for(let i=0;i<4;i++){const m=add(new T.TorusGeometry(.7+i*.16,.026,6,32,Math.PI),0,.7,.2-i*.2);m.rotation.z=Math.PI/2;}
 }else{
  for(let i=0;i<3+Math.floor(rank/3);i++){const a=i/(3+Math.floor(rank/3))*Math.PI*2,m=add(new T.CircleGeometry(.28,6),Math.sin(a)*1.2,1,Math.cos(a)*1.2);m.rotation.y=a;m.scale.y=1.6;}
 }
 if(pose==='lance'||pose==='charge')g.rotation.y=Math.atan2(target.x-origin.x,target.z-origin.z);g.scale.setScalar(size);fx.scene.add(g);const duration=e?1.8:1.15;
 fx.objects.push({m:g,t:duration,max:duration,update:(o,f)=>{const rise=Math.min(1,f*5);material.opacity=(1-f)*(fire?.35:.6);const expand=pose==='nova'?1+f*(fire?1:3):pose==='charge'?1+f*1.2:1;o.scale.set(size*expand,rise*size,size*expand);if(pose==='lance'){o.children.slice(count+1).forEach(m=>{m.position.z=.6+f*(path==='sun'?3:1.8);m.rotation.z+=.06;});}else if(pose==='rain')o.children.slice(count+1).forEach((m,i)=>m.position.y=2.5-f*3+(i%3)*.3);else o.rotation.y=Math.sin(seed)*f*.3;}});
 fx.emit(fire?'fire':leaf?'leaf':id==='quench'?'water':'holy',origin.clone().add(new T.Vector3(0,.5,0)),12+rank*2,{speed:e?3:1.5,life:.8,size:fire?.4:.09});
 return g;
}
export function castPose(c,id,rank,path){const e=evolutionFor(id,path),duration=e?.pose==='lance'?.95:e?.pose==='nova'?1.05:.5+Math.min(rank,5)*.06;return {id,rank,path,pose:e?.pose,t:0,duration,seed:[...id].reduce((s,v)=>s+v.charCodeAt(0),0)};}
export function animateCast(c,cast){const f=Math.sin(Math.min(1,cast.t/cast.duration)*Math.PI),r=Math.min(3,cast.rank),a=c.sockets.upperarmr,b=c.sockets.upperarml,body=c.sockets.spine;
 if(cast.pose==='nova'){if(a)a.rotation.z-=.72*f;if(b)b.rotation.z+=.72*f;if(body)body.rotation.x-=.13*f;}
 else if(cast.pose==='lance'){if(a)a.rotation.x-=.7*f;if(b)b.rotation.x-=.45*f;if(body)body.rotation.y+=.24*f;}
 else if(cast.pose==='rain'){if(a)a.rotation.x-=.55*f;if(b)b.rotation.z+=.35*f;}
 else if(cast.pose==='charge'){if(a)a.rotation.z-=.38*f;if(body)body.rotation.x+=.18*f;}
 else if(cast.pose==='ward'){if(a)a.rotation.z-=.38*f;if(b)b.rotation.z+=.38*f;}
 else{if(a)a.rotation.z+=Math.sin(cast.seed)*.12*f*r;if(b)b.rotation.x+=Math.cos(cast.seed)*.15*f*r;}
}

// Soft procedural flame cards. No solid ribbons, quads or billboard silhouettes.
export function flameCircle(fx,pos,radius,duration=.8){
 const group=new T.Group();group.name='flame-corona';group.position.copy(pos);
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0},fade:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;vec4 p=vec4(position,1.);\n#ifdef USE_INSTANCING\np=instanceMatrix*p;\n#endif\ngl_Position=projectionMatrix*modelViewMatrix*p;}',fragmentShader:`varying vec2 vUv;uniform float time;uniform float fade;void main(){float y=vUv.y;float sway=sin(y*9.-time*8.)*.10+sin(y*17.+time*11.)*.05;float width=(1.-y)*.40;float x=abs(vUv.x-.5+sway*y);float body=1.-smoothstep(width*.3,width+.04,x);float edge=smoothstep(0.,.12,y)*(1.-smoothstep(.65,1.,y));float alpha=body*edge*fade*.66;vec3 col=mix(vec3(1.,.58,.08),vec3(.88,.13,.018),y);gl_FragColor=vec4(col,alpha);}`});
 const count=Math.min(28,Math.max(12,Math.round(radius*3))),geometry=new T.PlaneGeometry(.65,1.25);
 const flames=new T.InstancedMesh(geometry,material,count),m=new T.Object3D();for(let i=0;i<count;i++){const a=i/count*Math.PI*2;m.position.set(Math.sin(a)*radius,.65+(i%3)*.07,Math.cos(a)*radius);m.rotation.y=a;m.scale.y=.8+(i%4)*.12;m.updateMatrix();flames.setMatrixAt(i,m.matrix);}flames.computeBoundingSphere();group.add(flames);
 fx.scene.add(group);fx.objects.push({m:group,t:duration,max:duration,update:(o,f)=>{material.uniforms.time.value=f*duration;material.uniforms.fade.value=Math.min(1,f*8,(1-f)*5);o.scale.x=o.scale.z=.90+Math.min(1,f*5)*.1;}});return group;
}
