import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {movementState,carryDirection} from '../src/hero-locomotion.js';
import {heroPhysique,fitHeroPart} from '../src/hero-physique.js';

test('Walking and running blend smoothly and do not chatter near the speed boundary',()=>{
 const c={design:'warden'};let prev=0;
 for(let i=0;i<60;i++){const n=movementState(c,4.5,1/60);assert.ok(n>=prev&&n-prev<1);prev=n;}
 assert.equal(c.running,true);
 for(let i=0;i<120;i++)movementState(c,i%2?3.05:3.4,1/60);
 assert.equal(c.running,true);
 for(let i=0;i<60;i++)movementState(c,2,1/60);
 assert.equal(c.running,false);
 for(let i=0;i<60;i++)movementState(c,0,1/60);
 assert.ok(c.gaitSpeed<.001);
});
test('Physique changes widen armor and limbs without changing segment lengths or enemy rigs',()=>{
 for(const design of ['warden','ashwright','ranger']){
  const c={design},g=new T.Group();assert.ok(heroPhysique(c));
  for(const socket of ['chest','upperarm.l','lowerarm.r','upperleg.l','lowerleg.r']){fitHeroPart(c,socket,g);assert.ok(g.scale.x>1&&g.scale.z>1);assert.equal(g.scale.y,1);}
 }
 const enemy={design:'warden',enemy:true},g=new T.Group();fitHeroPart(enemy,'chest',g);assert.deepEqual(g.scale.toArray(),[1,1,1]);assert.equal(heroPhysique(enemy),null);assert.equal(movementState(enemy,4.5,1/60),4.5);
});
test('Heroes brace melee weapons while idle and moving; troop poses stay compatible',()=>{
 for(const type of ['sword','hammer']){const c={design:'warden',weaponType:type};assert.ok(carryDirection(c,4.5).y>.3);assert.ok(type==='sword'?carryDirection(c,0).y<-.5:carryDirection(c,0).y>.3);assert.ok(carryDirection({...c,enemy:true},4.5).y<0);}
 const hammer={design:'ashwright',weaponType:'hammer'};
 const foot=carryDirection(hammer,0).clone(),mounted=carryDirection({...hammer,mounted:true},0).clone();
 assert.ok(mounted.x>foot.x&&mounted.y<foot.y&&mounted.y>0,'Mounted maul is carried out to the side, below the rider face');
});
test('Muscle mesh contains continuous elbow weights, finite UVs, mirrored topology and valid triangles',()=>{
 const mesh=JSON.parse(fs.readFileSync(new URL('../public/models/hero-anatomy.json',import.meta.url)));
 assert.equal(mesh.license,'CC0-1.0');assert.equal(mesh.arms.l.blend.length,mesh.arms.r.blend.length);
 for(const a of Object.values(mesh.arms)){
  const n=a.blend.length;assert.ok(n>500&&n<1000);assert.equal(a.upper.length,n*3);assert.equal(a.lower.length,n*3);assert.equal(a.uv.length,n*2);
  for(const key of ['upper','lower','uv','blend'])assert.ok(a[key].every(Number.isFinite));
  assert.ok(a.blend.every(w=>w>=0&&w<=1));assert.ok(a.blend.filter(w=>w>.05&&w<.95).length>30);
  assert.ok(a.indices.every(i=>Number.isInteger(i)&&i>=0&&i<n));assert.ok(a.uv.every(v=>v>=0&&v<=1));
 }
});
