import test from 'node:test';
import assert from 'node:assert/strict';
import {UNITS,unitCost} from '../src/data.js';
import {unitInspection} from '../src/inspection.js';
import {UNIT_TACTICS,regimentStats,regimentUpgrade} from '../src/regiment-details.js';
import {newSave,upgradeUnit} from '../src/state.js';
import {equipmentName} from '../src/equipment-name.js';

test('Every troop and rank exposes combat-derived stats and tactical advice',()=>{
 for(const id of Object.keys(UNITS))for(let rank=1;rank<=10;rank++){
  const {rows}=regimentStats(id,rank),actual=unitInspection(id,rank);
  for(const row of rows){assert.equal(row.value,actual[row.key]||0,id+rank+row.key);assert.ok(Number.isFinite(row.value));}
  assert.ok(rows.some(r=>r.key==='hp')&&rows.some(r=>r.key==='reach')&&rows.some(r=>r.key==='attackInterval'));
  assert.ok(UNIT_TACTICS[id].strong&&UNIT_TACTICS[id].weak&&UNIT_TACTICS[id].use);
 }
});
test('All 135 training quotes match the actual purchase and include each changed stat',()=>{
 for(const id of Object.keys(UNITS))for(let rank=1;rank<10;rank++){
  const s=newSave();s.completed=Array.from({length:15},(_,i)=>i);s.supplies=10000;s.units[id]=rank;
  const quote=regimentUpgrade(id,rank),saved=JSON.stringify(s);
  assert.equal(quote.cost,unitCost(id,rank));assert.equal(JSON.stringify(s),saved);
  upgradeUnit(s,id);assert.equal(s.supplies,10000-quote.cost);assert.equal(s.units[id],quote.next);
  for(const row of quote.rows){assert.equal(row.to,unitInspection(id,s.units[id])[row.key]||0);assert.equal(row.delta,row.to-row.from);}
  for(const r of regimentStats(id,rank+1).rows){if(r.key==='burnDps'&&rank===4)continue;if((unitInspection(id,rank)[r.key]||0)!==r.value)assert.ok(quote.rows.some(q=>q.key===r.key),id+rank+r.key);}
 }
 assert.equal(regimentUpgrade('bow',10),null);
});
test('Training preview includes recruitment tradeoffs, new abilities and inactive burn gates',()=>{
 const shield=regimentUpgrade('shield',3);assert.equal(shield.rows.find(r=>r.key==='count').delta,1);assert.ok(shield.rows.find(r=>r.key==='cost').delta>0);
 assert.equal(regimentUpgrade('shield',4).abilities[0].name,'Linked shields');
 assert.ok(!regimentStats('pyre',4).rows.some(r=>r.key==='burnDps'));
 assert.equal(regimentUpgrade('pyre',4).rows.find(r=>r.key==='burnDps').from,0);
 assert.equal(regimentUpgrade('pyre',4).abilities[0].name,'Lingering embers');
 const healing=regimentUpgrade('dawn',6).rows.find(r=>r.key==='healEvery');assert.equal(healing.delta,-1);assert.equal(healing.direction,-1);
 const command=regimentUpgrade('banner',1).rows.find(r=>r.key==='commandRate');assert.equal(command.change,'+1.5');
});

test('Equipment labels retain full rolled names and recover missing legacy names',()=>{
 const s=newSave();
 for(const item of s.inventory){
  assert.equal(equipmentName(item),item.name);
  for(const name of ['',undefined,null,'undefined','null','  '])assert.ok(!/undefined|null|Empty slot/.test(equipmentName({...item,name})));
 }
 assert.equal(equipmentName({...s.inventory[0],name:'Infernal Dawnfang of the Last Ember'}),'Infernal Dawnfang of the Last Ember');
});
