import test from 'node:test';import assert from 'node:assert/strict';
import {HEROES,unitStats,unitCost,UNITS,MISSIONS} from '../src/data.js';
import {newSave,heroData,skillRank,skillPoints,skillGate,trainSkill,equipTechnique,validateSave,upgradeUnit,completeMission} from '../src/state.js';
import {TACTICAL_STATS} from '../src/unit-progression.js';
import {createUnlockReview,reviewCard} from '../src/unlocks.js';
import {validateUnlockReview} from '../src/battle-record.js';
import {standardIncome,supportRegiment,regimentBonus,movementFactor,regimentHit} from '../src/regiments.js';
import * as T from 'three';
test('Every order learns an actual new active at level two without spending on passive prerequisites',()=>{
 for(const id of Object.keys(HEROES)){const s=newSave(id),h=heroData(s),node=HEROES[id].skills.find(n=>n.active&&n.learnLevel===2);
  assert.ok(node);assert.match(skillGate(s,node.id),/level 2/);assert.throws(()=>trainSkill(s,node.id));h.level=2;
  assert.equal(skillGate(s,node.id),null);trainSkill(s,node.id);assert.equal(skillRank(s,node.id),1);assert.equal(skillPoints(s),0);
  equipTechnique(s,node.id,0);assert.equal(h.slots[0],node.id);validateSave(s);
 }
});
test('Starter abilities are rank one for free; buying rank two changes an effect and costs exactly one point',()=>{
 for(const [id,hero]of Object.entries(HEROES)){const s=newSave(id),h=heroData(s);for(const spell of hero.starter)assert.equal(skillRank(s,spell),1);assert.equal(skillPoints(s),0);h.level=2;trainSkill(s,hero.starter[0]);assert.equal(skillRank(s,hero.starter[0]),2);assert.equal(skillPoints(s),0);assert.match(skillGate(s,hero.starter[0]),/level 6/);validateSave(s);}
});
test('All active rank gates are reachable; equipped techniques are owned, distinct and signature-exclusive',()=>{
 for(const id of Object.keys(HEROES)){const s=newSave(id),h=heroData(s);h.level=30;h.questPoints=6;for(const n of HEROES[id].skills.filter(n=>n.active)){while(skillRank(s,n.id)<n.max)trainSkill(s,n.id);equipTechnique(s,n.id,0);equipTechnique(s,n.id,1);assert.notEqual(h.slots[0],h.slots[1]);assert.equal(h.slots[1],n.id);validateSave(s);}
  assert.throws(()=>equipTechnique(s,'body',0));assert.throws(()=>equipTechnique(s,'missing',0));s.battle={};assert.throws(()=>equipTechnique(s,HEROES[id].starter[0],0));
 }
});
test('Old trained starters keep their effects and refund their formerly wasted first point',()=>{
 const s=newSave(),h=heroData(s);h.level=6;h.skills={step:3,rally:2};h.slots=['step','rally'];const inventory=JSON.stringify(s.inventory);validateSave(s);assert.equal(skillRank(s,'step'),3);assert.equal(skillRank(s,'rally'),2);assert.equal(skillPoints(s),2);assert.equal(JSON.stringify(s.inventory),inventory);
});
test('Crossing multiple ability levels creates valid specific reveals, never awards or spends points',()=>{
 for(const hero of Object.keys(HEROES)){const s=newSave(hero);heroData(s).level=18;const before=skillPoints(s),q=createUnlockReview(s,{completed:0},{win:true,first:false,endLevel:18,stats:{startLevel:1}});validateUnlockReview(q);const cards=q.cards.filter(c=>c.kind==='ability');assert.equal(cards.length,HEROES[hero].skills.filter(n=>n.active&&n.learnLevel>1).length);for(const card of cards){const d=reviewCard(s,card);assert.match(d.eyebrow,/ACTIVE/);assert.ok(d.text&&d.stats.length===4);}assert.equal(skillPoints(s),before);}
 assert.throws(()=>validateUnlockReview({version:1,cards:[{kind:'ability',id:'inferno',hero:'warden'}],cursor:0,complete:false}));
});
test('Every regiment gains a real tactical stat at every one of its nine upgrades',()=>{
 for(const id of Object.keys(UNITS))for(let r=1;r<10;r++){const a=unitStats(id,r),b=unitStats(id,r+1);assert.ok(b.hp>a.hp&&b.damage>a.damage,id+r);assert.ok(TACTICAL_STATS[id].some(([key,,,mult=1,direction=1])=>(b[key]-a[key])*direction>0),id+r);assert.ok(unitCost(id,r)>=320);if(r>1)assert.ok(unitCost(id,r)>unitCost(id,r-1));}
 assert.equal(unitStats('bow',10).reach,38.5);assert.equal(unitStats('frost',10).slowStrength,.575);assert.equal(unitStats('marksman',10).armorPierce,.925);
});
test('One first victory cannot fund five trainings, even including starting funds and a generous chest allowance',()=>{
 const s=newSave();completeMission(s,0);assert.equal(s.supplies,540);upgradeUnit(s,'bow');assert.equal(s.supplies,220);assert.throws(()=>upgradeUnit(s,'bow'));s.supplies=360+MISSIONS[0].reward+300;
 let bought=0;for(const id of ['shield','bow','pike','banner']){try{upgradeUnit(s,id);bought++;}catch{}}assert.ok(bought<=2);assert.ok(unitStats('bow',2).hp>=unitStats('bow',1).hp*1.19);
});
const actor=(unit,rank,x=0)=>({unit,team:'ally',stats:unitStats(unit,rank),pos:new T.Vector3(x,0,0),hp:1,character:{attack(){},cast(){}},speed:0});
const game=()=>({allies:[],enemies:[],hero:actor('shield',1),battle:{command:0,gate:1,maxGate:1000},gatePos:new T.Vector3(),fx:{emit(){},ring(){},ward(){}},audio:{play(){}}});
test('Standard aura uses the strongest nearby source; Command stacks from living standards globally',()=>{
 const g=game(),a=actor('banner',1),b=actor('banner',10),troop=actor('bow',1);g.allies=[a,b,troop];g.enemies=[{pos:new T.Vector3(0,0,-10)}];supportRegiment(g,troop,.5);assert.equal(regimentBonus(troop),1.285);assert.equal(standardIncome(g),.725);b.dead=true;supportRegiment(g,troop,.5);assert.equal(regimentBonus(troop),1.15);assert.equal(standardIncome(g),.25);g.enemies[0].pos.z=-30;assert.equal(standardIncome(g),.25);troop.pos.x=50;supportRegiment(g,troop,.5);assert.equal(regimentBonus(troop),1);
});
test('Engineers repair more often, Sunsworn heal every second hit, crew push, giants stagger and mounted charges reload earlier',()=>{
 const g=game(),engineer=actor('engineer',10);supportRegiment(g,engineer,.1);assert.equal(g.battle.gate,77);assert.equal(engineer.repairTimer,2.1);g.battle.gate=0;engineer.repairTimer=0;supportRegiment(g,engineer,3);assert.equal(g.battle.gate,0);
 const dawn=actor('dawn',10),target={pos:new T.Vector3(0,0,2)},crew=actor('crew',10),giant=actor('giant',10),rider=actor('rider',10);g.hero.stats.hp=300;g.hero.hp=100;dawn.hp=dawn.stats.hp;g.allies=[dawn];regimentHit(g,target,dawn,{});assert.equal(g.hero.hp,100);regimentHit(g,target,dawn,{});assert.equal(g.hero.hp,150);
 regimentHit(g,target,crew,{});assert.equal(target.knock.length(),5.38);regimentHit(g,target,giant,{});assert.equal(target.stun,.84);rider.speed=5;supportRegiment(g,rider,.85);assert.equal(rider.cavalryCharge,true);regimentHit(g,target,rider,{});assert.equal(target.stun,1.24);assert.equal(rider.cavalryCharge,false);
 assert.equal(movementFactor({rimeTime:4,rimeStrength:.575,slow:3}),.42500000000000004);assert.equal(movementFactor({rimeTime:0,rimeStrength:.575,slow:3}),.65);
});

test('Learning a second signature keeps the current combat loadout until it is equipped',()=>{const s=newSave(),h=heroData(s);h.level=20;trainSkill(s,'sunwall');equipTechnique(s,'sunwall',0);const slots=[...h.slots];trainSkill(s,'march');assert.deepEqual(h.slots,slots);assert.equal(h.capstone,'sunwall');equipTechnique(s,'march',1);assert.equal(h.capstone,'march');assert.equal(h.slots.filter(id=>HEROES.warden.skills.find(n=>n.id===id)?.capstone).length,1);validateSave(s);});

test('Earned levels still reveal new actives after a defeat without unlocking mission rewards',()=>{const s=newSave();heroData(s).level=2;const q=createUnlockReview(s,{completed:0},{win:false,first:false,endLevel:2,stats:{startLevel:1}});assert.deepEqual(q.cards.map(c=>c.kind),['hero','ability']);assert.equal(q.cards[1].id,'volley');assert.equal(q.complete,false);validateUnlockReview(q);});
