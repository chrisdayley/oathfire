import test from 'node:test';import assert from 'node:assert/strict';
import {newSave,validateSave,heroData} from '../src/state.js';
import {RESEARCH,startResearch,advanceResearch} from '../src/research.js';
import {BATTLE_PERKS,toggleBattlePerk} from '../src/battle-plan.js';
import {startingCommand,upgradeLogistics} from '../src/command-economy.js';
import {PERK_REQUIREMENTS,RESEARCH_REQUIREMENTS,perkUnlocked,researchUnlocked,strategySnapshot,newlyAvailableStrategy} from '../src/strategy-progression.js';
import {settleBattle} from '../src/battle-rewards.js';
import {newBattleLedger} from '../src/battle-record.js';
const finish=(s,id,win=true)=>settleBattle(s,{id,reportID:crypto.randomUUID(),time:80,wave:3,gate:1000,maxGate:1245,core:650,ledger:newBattleLedger(heroData(s).level),research:[]},win);
test('Every perk and every research project is locked at the beginning, including through action handlers',()=>{
 const s=newSave();assert.deepEqual(Object.keys(RESEARCH).sort(),Object.keys(RESEARCH_REQUIREMENTS).sort());assert.deepEqual(Object.keys(BATTLE_PERKS).sort(),Object.keys(PERK_REQUIREMENTS).sort());
 for(const id of Object.keys(RESEARCH)){assert.ok(!researchUnlocked(s,id));assert.throws(()=>startResearch({research:[]},s,id));}
 for(const id of Object.keys(BATTLE_PERKS)){assert.ok(!perkUnlocked(s,id));assert.throws(()=>toggleBattlePerk(s,id));}
 s.battlePerks=['provisions'];assert.equal(startingCommand(s),55);assert.throws(()=>validateSave(s));
});
test('Starter plans are earned at distinct defense and construction milestones',()=>{
 const s=newSave();finish(s,0);assert.deepEqual(strategySnapshot(s),{research:[],perks:[]});const second=finish(s,1);
 assert.deepEqual(second.tutorial.cards.filter(c=>c.kind==='perk'),[{kind:'perk',id:'provisions'}]);assert.ok(!researchUnlocked(s,'gate'));assert.ok(!perkUnlocked(s,'signals'));
 const before=strategySnapshot(s);s.supplies=1000;upgradeLogistics(s);assert.deepEqual(newlyAvailableStrategy(s,before),[{kind:'perk',id:'signals'}]);assert.ok(!researchUnlocked(s,'heroHealth'));
 s.defenses.gate=2;assert.ok(researchUnlocked(s,'gate'));assert.ok(!researchUnlocked(s,'gate2'));finish(s,2);assert.ok(perkUnlocked(s,'veterans'));assert.ok(!perkUnlocked(s,'bounty'));
});
test('Territory research depends on holding its specific town, not simply winning more home defenses',()=>{
 const s=newSave();s.completed=Array.from({length:24},(_,i)=>i);assert.ok(!researchUnlocked(s,'longbow'));assert.ok(!researchUnlocked(s,'forgeRunes'));
 const captured=finish(s,25);assert.ok(researchUnlocked(s,'longbow'));assert.ok(perkUnlocked(s,'battlements'));assert.ok(captured.tutorial.cards.some(c=>c.kind==='research'&&c.id==='longbow'));assert.ok(captured.tutorial.cards.some(c=>c.kind==='perk'&&c.id==='battlements'));
 assert.ok(!researchUnlocked(s,'fastShot'));const replay=finish(s,25);assert.ok(!replay.tutorial.cards.some(c=>['research','perk'].includes(c.kind)));
});
test('Loss removes access and selected territory perks, while recapture restores research with a reveal',()=>{
 const s=newSave();s.completed=[0,1,2];s.settlements=[25];s.war.captured=[25];s.war.raids=[{town:25,started:1,deadline:4}];toggleBattlePerk(s,'battlements');
 finish(s,34,false);assert.ok(!researchUnlocked(s,'longbow'));assert.deepEqual(s.battlePerks,[]);validateSave(s);
 const r=finish(s,25);assert.equal(r.first,false);assert.ok(researchUnlocked(s,'longbow'));assert.ok(r.tutorial.cards.some(c=>c.id==='longbow'));
});
test('Castle research needs both construction and campaign progress, and max progression earns the whole catalog',()=>{
 const s=newSave();s.castleLogistics=4;s.defenses.gate=5;s.defenses.tower=2;assert.deepEqual(strategySnapshot(s),{research:[],perks:[]});
 s.completed=Array.from({length:4},(_,i)=>i);assert.ok(researchUnlocked(s,'imbue'));assert.ok(!researchUnlocked(s,'heroDamage2'));assert.ok(!researchUnlocked(s,'rally'));
 s.completed=Array.from({length:24},(_,i)=>i);s.settlements=Array.from({length:8},(_,i)=>24+i);const unlocked=strategySnapshot(s);assert.equal(unlocked.research.length,33);assert.equal(unlocked.perks.length,6);
});
test('Old selected starter perks migrate safely; an already running battle retains its snapshot and timers',()=>{
 const s=newSave();delete s.strategyVersion;s.battlePerks=['provisions','signals'];const items=JSON.stringify(s.inventory);
 s.battle={id:0,perks:['provisions','signals'],research:[{id:'longbow',remaining:13,complete:false}],wave:1,nextWave:5,command:80,gate:1245,maxGate:1245,core:650,time:12,hero:{pos:{x:0,y:0,z:-27},hp:100,focus:50,stamina:100},allies:[],enemies:[]};
 validateSave(s);assert.equal(s.strategyVersion,1);assert.deepEqual(s.battlePerks,[]);assert.deepEqual(s.battle.perks,['provisions','signals']);assert.equal(s.battle.research[0].remaining,13);assert.equal(JSON.stringify(s.inventory),items);
 assert.throws(()=>startResearch(s.battle,s,'gate'));assert.deepEqual(advanceResearch(s.battle,13),['longbow']);validateSave(JSON.parse(JSON.stringify(s)));
});
test('Migrating progressed saves keeps earned selections and refuses unknown or malformed perk IDs',()=>{
 const s=newSave();delete s.strategyVersion;s.completed=[0,1,2];s.castleLogistics=1;s.battlePerks=['provisions','signals'];validateSave(s);assert.deepEqual(s.battlePerks,['provisions','signals']);
 for(const bad of [{},['unknown']]){const b=newSave();delete b.strategyVersion;b.battlePerks=bad;assert.throws(()=>validateSave(b));}
});
