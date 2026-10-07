import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS,ENEMIES} from '../src/data.js';
import {createAssault,advanceAssault,validateAssault,DEFENSE_FIELD_LIMIT} from '../src/wave-plan.js';

test('Defense openings contain a fighting group, with short reinforcement gaps and a larger final wave',()=>{
 for(const m of MISSIONS.filter(m=>m.mode==='defense')){
  let first=0;
  for(let w=1;w<=m.waves;w++){
   const p=createAssault(m,w),times=[...new Set(p.entries.map(e=>e.at))];
   assert.ok(p.entries.filter(e=>e.at===0).length>=5,`${m.name} wave ${w} opens with a group`);
   assert.ok(times.slice(1).every((t,i)=>t-times[i]<=12.1),'Reinforcements continue at most twelve seconds apart');
   if(w===1)first=p.entries.length;
   if(w===m.waves)assert.ok(p.entries.length>=first*1.4);
   validateAssault({wave:w,assault:p},ENEMIES);
  }
 }
});
test('Later defenses sustain large formations within a bounded live population',()=>{
 const p=createAssault(MISSIONS[19],6);assert.ok(p.entries.length>=170);
 const packets=new Map();for(const e of p.entries)packets.set(e.at,(packets.get(e.at)||0)+1);
 assert.ok(Math.max(...packets.values())>=20);
 let live=0,total=0;for(let i=0;i<1000;i++){
  const added=advanceAssault(p,.25,DEFENSE_FIELD_LIMIT-live);live+=added.length;total+=added.length;
  assert.ok(live<=DEFENSE_FIELD_LIMIT);if(i>600)live=Math.max(0,live-1);
 }
 assert.equal(total,p.entries.length,'Capacity back-pressure never discards reinforcements');
});
test('An interrupted older small wave keeps its exact schedule',()=>{
 const p={version:1,wave:1,duration:72,elapsed:36,cursor:1,entries:[{at:0,type:'hollow',x:0,z:-84,assaultBoost:1},{at:72,type:'hollow',x:12,z:-90,assaultBoost:1.18}]};
 const snapshot=JSON.stringify(p);validateAssault({wave:1,assault:p},ENEMIES);assert.equal(JSON.stringify(p),snapshot);
 assert.deepEqual(advanceAssault(p,36,DEFENSE_FIELD_LIMIT),[p.entries[1]]);
});
