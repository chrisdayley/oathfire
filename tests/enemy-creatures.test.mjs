import test from 'node:test';import assert from 'node:assert/strict';import {CREATURES,creatureWidth} from '../src/enemy-creatures.js';import {creatureWeapon} from '../src/enemy-armaments.js';import {ENEMIES} from '../src/data.js';
test('Every nonboss enemy has a creature identity while combat IDs remain stable',()=>{
 assert.deepEqual(Object.keys(CREATURES).sort(),Object.keys(ENEMIES).filter(id=>id!=='boss').sort());
 assert.equal(new Set(Object.values(CREATURES).map(x=>x.family)).size,5);
 for(const id in CREATURES){assert.ok(creatureWidth(id)>.7&&creatureWidth(id)<1.7);assert.ok(ENEMIES[id].hp>0);}
 assert.equal(creatureWidth('warden'),null);
});
test('Creature weapons preserve their attack class and have valid geometry',()=>{
 for(const id in CREATURES){const type=ENEMIES[id].weapon,w=creatureWeapon(id,type);if(type==='bow'){assert.equal(w,null);continue;}assert.equal(w.userData.type,type);let count=0;w.traverse(o=>{if(o.isMesh){count++;assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));}});assert.ok(count>2,id);}
 assert.equal(creatureWeapon('warden','sword'),null);assert.equal(creatureWeapon('bell','spear'),null);
});
