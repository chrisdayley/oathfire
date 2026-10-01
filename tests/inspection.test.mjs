import test from 'node:test';import assert from 'node:assert/strict';
import {UNITS,DEFENSES,unitStats,defenseStats,defenseFiringStats} from '../src/data.js';
import {unitInspection,defenseInspection} from '../src/inspection.js';
test('Every soldier and rank exposes finite per-soldier values and an ability description',()=>{
 for(const [id,u]of Object.entries(UNITS))for(let rank=1;rank<=10;rank++){
  const s=unitInspection(id,rank),base=unitStats(id,rank);for(const key of ['hp','damage','armor','attackInterval','speed','reach','count','cost','dps'])assert.ok(Number.isFinite(s[key])&&s[key]>0,id+' '+rank+' '+key);
  assert.equal(s.hp,base.hp);assert.equal(s.damage,base.damage);assert.equal(s.count,base.count);assert.equal(s.dps,s.damage/s.attackInterval);assert.ok(s.abilities.length);assert.ok(s.abilities.every(a=>a.text&&!/undefined|NaN/.test(a.text)));
 }
});
test('Inspection distinguishes slow marksmen, ordinary archers, armor and deployment costs',()=>{
 const bow=unitInspection('bow',1),marks=unitInspection('marksman',1),shield=unitInspection('shield',5),dawn=unitInspection('dawn',10);
 assert.equal(bow.attackInterval,1.5);assert.equal(marks.attackInterval,2.8);assert.equal(shield.armor,20);assert.equal(dawn.armor,44);assert.equal(shield.cost,25);assert.equal(shield.count,1);assert.equal(shield.abilities[0].unlock,5);
});
test('Healing and control descriptions expose their exact rank-scaled amounts and timers',()=>{
 assert.match(unitInspection('lantern',1).abilities[0].text,/14 health/);assert.match(unitInspection('lantern',10).abilities[0].text,/32 health/);
 assert.match(unitInspection('engineer',10).abilities[0].text,/58 gate health every 3 s/);
 assert.match(unitInspection('frost',1).abilities[0].text,/35% for 2.2 s/);assert.match(unitInspection('frost',10).abilities[0].text,/35% for 4 s/);
 assert.match(unitInspection('dawn',10).abilities[0].text,/32 health/);assert.deepEqual(unitInspection('pyre',1).abilities.map(a=>a.unlock),[1,5,9]);
});
test('Doctrine previews and the battlefield share the same range, cadence and damage',()=>{
 const normal=defenseStats('tower',5),long=defenseFiringStats('tower',5,'longwatch'),fast=defenseFiringStats('tower',5,'suppression');
 assert.equal(long.range,normal.range*1.2);assert.equal(long.interval,1.4*1.2);assert.equal(fast.range,normal.range*.85);assert.equal(fast.interval,1.4*.8);
 assert.equal(defenseFiringStats('tower',4,'suppression').range,25);assert.equal(defenseFiringStats('tower',4,'suppression').interval,1.4);
 const pin=defenseInspection('ballista',5,'pinning');assert.equal(pin.damage,107*.85);assert.equal(pin.interval,4);assert.equal(pin.dps,pin.damage/4);
 assert.equal(defenseInspection('ballista',4,'pinning').damage,95);
});
test('Defense descriptions expose true gate health, protected emplacements and special limits',()=>{
 for(const id of Object.keys(DEFENSES))for(let rank=1;rank<=10;rank++){
  const s=defenseInspection(id,rank,id==='tower'?'longwatch':'piercing');assert.equal(s.protected,id!=='gate');assert.equal(s.hp,defenseStats(id,rank).hp);assert.ok(s.abilities.length);assert.ok(s.abilities.every(a=>!/(undefined|NaN)/.test(a.text)));
 }
 assert.equal(defenseInspection('gate',1).hp,1245);assert.equal(defenseInspection('gate',10).hp,3900);
 assert.equal(defenseInspection('sanctuary',1).damage,14);assert.equal(defenseInspection('sanctuary',1).dps,3.5);
 assert.equal(defenseInspection('mortar',1).minRange,9);assert.match(defenseInspection('storm',1).abilities[0].text,/35, 22.75, then 14/);
 assert.match(defenseInspection('tower',8,'suppression').abilities[2].text,/35% for 0.7 s/);
 assert.match(defenseInspection('tower',9,'suppression').abilities[2].text,/35% for 1 s/);
});
