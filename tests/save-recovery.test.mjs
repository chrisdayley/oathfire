import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SaveStore,SAVE_KEY,newSave,validateSave,recoverInterruptedBattle} from '../src/state.js';
const fixture=name=>JSON.parse(fs.readFileSync(new URL('./fixtures/saves/'+name+'.json',import.meta.url)));
const storage=()=>{const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v))};return values;};
for(const name of ['v215-interrupted-battle','v215-victory'])test('Actual 2.15 save migrates without losing progress: '+name,()=>{
 const original=fixture(name),s=validateSave(structuredClone(original));
 for(const key of ['inventory','heroes','completed','supplies','salvage','units','defenses','battle'])assert.deepEqual(s[key],original[key],key);
 assert.equal(s.lastBattle?.id,original.lastBattle?.id);assert.equal(s.war.day,1);assert.deepEqual(s.mounts.owned,[]);
});
test('Unreadable primary JSON still recovers a valid browser backup',async()=>{
 const values=storage(),save=fixture('v215-interrupted-battle');values.set(SAVE_KEY,'{"broken":');values.set(SAVE_KEY+'.backup',JSON.stringify(save));
 const store=new SaveStore();await store.open();assert.equal(store.data.hero,'ashwright');assert.equal(store.data.battle.wave,2);assert.equal(values.get(SAVE_KEY),'{"broken":');assert.match(store.error,/Recovered/);
});
test('Newest valid copy wins instead of an older readable primary',async()=>{
 const values=storage(),a=newSave(),b=structuredClone(a);a.updated=10;b.updated=20;b.supplies=900;
 values.set(SAVE_KEY,JSON.stringify(a));values.set(SAVE_KEY+'.good',JSON.stringify(b));const store=new SaveStore();await store.open();assert.equal(store.data.supplies,900);
});
test('Invalid checkpoints cannot replace any working save or poison backup rotation',()=>{
 const values=storage(),store=new SaveStore();store.start('warden');store.commit(s=>s.supplies=421);const before=new Map(values);
 store.data.battle={id:1,hero:{hp:-20}};assert.equal(store.persist(),false);assert.deepEqual(values,before);assert.match(store.error,/last valid checkpoint is protected/);
 store.data.battle=null;store.data.supplies=422;assert.equal(store.persist(),true);assert.equal(JSON.parse(values.get(SAVE_KEY+'.backup')).supplies,421);
});
test('Broken battle recovery requires an explicit action, preserves campaign and archives originals',async()=>{
 const values=storage(),save=fixture('v215-interrupted-battle');save.battle.hero.hp=-3;const original=JSON.stringify(save);values.set(SAVE_KEY,original);values.set(SAVE_KEY+'.backup',original);
 const store=new SaveStore();await store.open();assert.equal(store.data,null);assert.ok(store.recovery);assert.equal(values.get(SAVE_KEY),original);
 store.recover();for(const key of ['inventory','heroes','completed','supplies','salvage','units','defenses'])assert.deepEqual(store.data[key],save[key]);
 assert.equal(store.data.battle,null);assert.deepEqual(store.data.position,{x:0,y:0,z:9});assert.equal(JSON.parse(values.get(SAVE_KEY+'.recovery')).copies[0].raw,original);assert.doesNotThrow(()=>validateSave(JSON.parse(values.get(SAVE_KEY))));
});
test('Battle recovery never hides broken campaign equipment or ranks',()=>{
 const s=fixture('v215-interrupted-battle');s.units.shield=500;assert.equal(recoverInterruptedBattle(s),null);s.units.shield=1;s.inventory=[];assert.equal(recoverInterruptedBattle(s),null);
});
test('An earlier valid checkpoint does not erase a newer recoverable campaign',async()=>{
 const values=storage(),early=fixture('v215-interrupted-battle'),later=structuredClone(early);later.updated++;later.supplies=850;later.battle.hero.hp=-1;
 values.set(SAVE_KEY,JSON.stringify(later));values.set(SAVE_KEY+'.backup',JSON.stringify(early));const store=new SaveStore();await store.open();assert.equal(store.data.supplies,early.supplies);assert.equal(store.recovery.data.supplies,850);
 store.persist();assert.ok(JSON.parse(values.get(SAVE_KEY+'.recovery')).copies.some(c=>JSON.parse(c.raw).supplies===850));
});
test('Unreadable-only saves remain exportable and are not silently replaced',async()=>{
 const values=storage(),raw='broken campaign bytes';values.set(SAVE_KEY,raw);const store=new SaveStore();await store.open();assert.equal(store.hasStoredSave,true);assert.equal(store.data,null);assert.equal(store.recovery,null);assert.equal(JSON.parse(store.exportRecovery()).copies[0].raw,raw);assert.equal(values.get(SAVE_KEY),raw);
});
test('Recovering a battle cannot lose originals when archiving is denied',async()=>{
 const values=storage(),s=fixture('v215-interrupted-battle');s.battle.hero.hp=-1;const raw=JSON.stringify(s);values.set(SAVE_KEY,raw);const store=new SaveStore();await store.open();globalThis.localStorage.setItem=()=>{throw Error('quota');};assert.throws(()=>store.recover(),/Export recovery/);assert.equal(values.get(SAVE_KEY),raw);assert.equal(store.data,null);
});

test('Training visibility is optional for older saves and persists without changing progression',()=>{
 const s=fixture('v215-victory'),before=structuredClone(s);assert.doesNotThrow(()=>validateSave(s));
 s.guide.hidden=true;assert.doesNotThrow(()=>validateSave(s));assert.equal(s.guide.hidden,true);
 for(const key of ['inventory','heroes','completed','supplies','salvage'])assert.deepEqual(s[key],before[key]);
 s.guide.hidden='true';assert.throws(()=>validateSave(s),/guide visibility/);
});
