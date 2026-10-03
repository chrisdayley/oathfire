import test from 'node:test';
import assert from 'node:assert/strict';
import {newSave,validateSave,completeMission,heroData} from '../src/state.js';
import {MISSIONS} from '../src/data.js';
import {territoryIncome,territoryIncomeSources} from '../src/campaign.js';
import {settleBattle,acknowledgeReport} from '../src/battle-rewards.js';
import {newBattleLedger,validateBattleReport} from '../src/battle-record.js';
import {TOWN_IDS} from '../src/war-campaign.js';
const campaign=()=>{const s=newSave();s.completed=[0,1,2];s.settlements=[24,25];s.war.captured=[24,25];s.war.nextAttackDay=99;s.war.nextRaidDay=99;return s;};
const battle=(s,id)=>({id,reportID:crypto.randomUUID(),time:80,wave:MISSIONS[id].waves,gate:1000,maxGate:1245,core:650,ledger:newBattleLedger(heroData(s).level),research:[]});
const finish=(s,id,win=true,options)=>settleBattle(s,battle(s,id),win,options);

test('Home victories, siege replays, reliefs, defeats and withdrawals all collect one daily payment',()=>{
 for(const [id,win,reason] of [[3,true,''],[24,true,''],[34,true,''],[3,false,'Defeat'],[24,false,'Withdrawal']]){
  const s=campaign(),before=s.supplies;if(id===34)s.war.raids=[{town:25,started:1,deadline:4}];
  const r=finish(s,id,win,{reason});assert.equal(r.income,70);assert.deepEqual(r.incomeSources,[{town:24,amount:28},{town:25,amount:42}]);
  assert.equal(s.supplies-before,r.supplies);assert.equal(r.supplies,70+(win?(r.first?MISSIONS[id].reward:Math.round(MISSIONS[id].reward*.55)):0));
  assert.equal(s.war.day,2);validateSave(s);
 }
});
test('Newly conquered and recaptured towns start paying on the conquest day',()=>{
 const s=campaign();s.settlements=[24];const r=finish(s,25);assert.equal(r.first,false);assert.equal(r.income,70);assert.equal(r.war.captured,25);
 const fresh=campaign();fresh.settlements=[];fresh.war.captured=[];const first=finish(fresh,24);assert.equal(first.first,true);assert.equal(first.income,28);assert.deepEqual(first.incomeSources,[{town:24,amount:28}]);
});
test('Expired invasions remove a town before that day pays; threatened towns continue to contribute',()=>{
 const s=campaign();s.war.day=3;s.war.raids=[{town:24,started:1,deadline:4},{town:25,started:2,deadline:5}];
 const before=s.supplies,r=finish(s,3,false);assert.deepEqual(r.war.lost,[24]);assert.equal(r.income,42);assert.equal(s.supplies-before,42);assert.deepEqual(r.incomeSources,[{town:25,amount:42}]);assert.equal(s.war.raids[0].town,25);validateSave(s);
});
test('A lost relief pays only surviving towns; successful deadline relief preserves all income',()=>{
 for(const win of [true,false]){const s=campaign();s.war.day=3;s.war.raids=[{town:25,started:1,deadline:4}];const r=finish(s,34,win);assert.equal(r.income,win?70:28);assert.equal(territoryIncome(s),r.income);validateSave(s);}
});
test('Final fortress victory pays all eight towns and ends the war',()=>{
 const s=campaign();s.completed=Array.from({length:24},(_,i)=>i);s.settlements=[...TOWN_IDS];s.war.captured=[...TOWN_IDS];
 const r=finish(s,32);assert.equal(r.income,772);assert.equal(r.incomeSources.length,8);assert.ok(r.war.complete);validateSave(s);
});
test('Reloading, acknowledging, and presenting the report cannot collect again',()=>{
 const s=campaign(),b=battle(s,3),r=settleBattle(s,b,false),amount=s.supplies;
 for(let i=0;i<3;i++){const loaded=validateSave(JSON.parse(JSON.stringify(s)));acknowledgeReport(loaded);settleBattle(loaded,b,false);assert.equal(loaded.supplies,amount);assert.equal(loaded.war.day,2);assert.deepEqual(loaded.lastBattle.incomeSources,r.incomeSources);}
});
test('Daily breakdown validation rejects forged ownership, duplicate towns and incorrect totals while accepting old reports',()=>{
 const s=campaign(),r=finish(s,3);
 for(const edit of [n=>n.incomeSources.push(n.incomeSources[0]),n=>n.incomeSources[0].town=26,n=>n.incomeSources[0].amount=-2,n=>n.incomeSources[0].amount=1.5,n=>n.incomeSources=null,n=>n.income++,n=>n.supplies=0,n=>delete n.war]){const bad=structuredClone(r);edit(bad);assert.throws(()=>validateBattleReport(bad));}
 delete r.incomeSources;assert.doesNotThrow(()=>validateBattleReport(r));delete r.war;assert.doesNotThrow(()=>validateBattleReport(r));
});
test('Legacy saves receive no backdated rewards, and mission reward helpers do not pay outside a day transition',()=>{
 const s=campaign(),amount=s.supplies;delete s.war;validateSave(s);assert.equal(s.supplies,amount);assert.equal(s.war.day,1);
 const before=s.supplies,result=completeMission(s,3);assert.equal(s.supplies-before,result.reward);assert.equal(result.income,0);assert.equal(s.war.day,1);
 const none=newSave(),r=finish(none,0,false);assert.equal(r.income,0);assert.deepEqual(r.incomeSources,[]);validateSave(none);
});
test('Town projections are deterministic and never count duplicate holdings twice',()=>{
 assert.deepEqual(territoryIncomeSources({settlements:[25,24,25]}),[{town:24,amount:28},{town:25,amount:42}]);assert.equal(territoryIncome({settlements:TOWN_IDS}),772);
});
