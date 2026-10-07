import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {dressHearthwatch,lightHearthwatch} from '../src/hearthwatch-scene.js';
import {Physics,initPhysics} from '../src/physics.js';
import {ART} from '../src/materials.js';
import {SERVICES} from '../src/data.js';
for(const name of ['stone','rock','soil','timber','steel'])for(const role of ['color','normal','rough'])ART.textures[name+'-'+role]=new T.Texture();
await initPhysics();
test('Authored courtyard colliders leave the gate avenue and all service reach areas clear',()=>{
 const physics=new Physics(),scene=new T.Scene(),w={static:new T.Group(),dynamic:new T.Group(),scene,nav:[],physics};
 physics.addBox(0,-.1,0,90,.2,90,'ground');dressHearthwatch(w);
 function walk(x,z,velocity,seconds){const a=physics.actor({},{x,y:0,z});for(let i=0;i<30;i++){physics.move(a,{x:0,z:0},1/60);physics.step();}for(let i=0;i<seconds*60;i++){physics.move(a,velocity,1/60);physics.step();}const p=physics.position(a).clone();physics.removeActor(a);return p;}
 const gate=walk(4,-10,{x:0,z:-3},5);assert.ok(gate.z<-24,'Central gate lane traverses normally');
 const garden=walk(11,-9,{x:0,z:3},3);assert.ok(garden.z<-6.65&&garden.z>-7.4,'Planter has matching collision');
 for(const service of SERVICES)for(const o of w.nav){const dx=Math.max(0,Math.abs(service.x-o.x)-o.hx),dz=Math.max(0,Math.abs(service.z-o.z)-o.hz);assert.ok(Math.hypot(dx,dz)>4.5,service.name+' reach zone remains clear');}
 assert.equal(w.dynamic.children.filter(o=>o.isPointLight).length,2);assert.ok(w.dynamic.children.every(o=>!o.castShadow));
 w.static.traverse(o=>{if(o.geometry)assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));});
});
test('Courtyard lighting balances warm sun and cool fill without adding shadow lights',()=>{
 const scene=new T.Scene(),sun=new T.DirectionalLight(),fill=new T.HemisphereLight();scene.add(fill);const renderer={toneMappingExposure:1};lightHearthwatch({scene,sun,renderer});
 assert.equal(sun.color.getHex(),0xffdfb2);assert.equal(fill.color.getHex(),0x9bbbd4);assert.equal(fill.intensity,.55);assert.equal(renderer.toneMappingExposure,.92);assert.equal(scene.children.length,1);
});
