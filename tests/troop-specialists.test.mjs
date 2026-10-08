import test from 'node:test';
import assert from 'node:assert/strict';
import {specialistWeapon} from '../src/troop-weapons.js';
import {TROOP_IDENTITY} from '../src/troop-identity.js';
test('Specialist weapons retain their actual attack class and finite geometry across ranks',()=>{
 for(let rank=1;rank<=10;rank++)for(const id of ['breaker','giant','engineer','crew','marksman']){
  const g=specialistWeapon(id,rank);assert.equal(g.userData.type,['breaker','giant','engineer'].includes(id)?'hammer':'crossbow');let count=0;
  g.traverse(o=>{if(o.isMesh){assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));count++;}});assert.ok(count>10);
 }
 assert.equal(specialistWeapon('warden',10),null);
});
test('Ashbreakers and giants have separate head silhouettes and equipment geometry',()=>{
 assert.notEqual(TROOP_IDENTITY.breaker.head,TROOP_IDENTITY.giant.head);
 const names=id=>{const a=[];specialistWeapon(id,8).traverse(o=>a.push(o.name));return a;};
 assert.ok(names('breaker').includes('Armor piercing beak'));assert.ok(!names('giant').includes('Armor piercing beak'));assert.ok(names('giant').includes('Ancient carved oathstone'));
});
