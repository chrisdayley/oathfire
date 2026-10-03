import test from 'node:test';
import assert from 'node:assert/strict';
import {newSave,makeItem,heroData,validateSave,heroStats} from '../src/state.js';
import {MISSIONS,UNITS,unitStats,AFFIXES} from '../src/data.js';
import {toggleBattlePerk,validateBattlePerks,commandGear,itemCommandBonuses,commandBenefits} from '../src/battle-plan.js';
import {startingCommand,commandBreakdown,commandCap,heroKillCommand} from '../src/command-economy.js';
import {WALL_POSTS,wallCount,fieldCount,freeWallSlot,validateGarrison,recruitKey,parseRecruitKey} from '../src/wall-garrison.js';
import {battleUnitStats,battleDefenseStats} from '../src/research.js';
import {missionRoster,waveReady} from '../src/campaign.js';
import {scoutCards,missionEnemies} from '../src/enemy-scouting.js';
import {settleBattle} from '../src/battle-rewards.js';
import {newBattleLedger} from '../src/battle-record.js';

test('Two preparation slots enforce unlocks, toggles and town-only editing',()=>{
 const s=newSave();s.completed=[0,1];s.castleLogistics=1;toggleBattlePerk(s,'provisions');toggleBattlePerk(s,'signals');assert.deepEqual(s.battlePerks,['provisions','signals']);assert.equal(startingCommand(s),80);assert.throws(()=>toggleBattlePerk(s,'veterans'));toggleBattlePerk(s,'signals');assert.throws(()=>toggleBattlePerk(s,'bounty'));s.completed=[0,1,2,3,4];toggleBattlePerk(s,'bounty');assert.equal(heroKillCommand({perks:s.battlePerks},'hollow'),3);assert.throws(()=>validateBattlePerks(['provisions','provisions']));assert.throws(()=>validateBattlePerks(['bounty'],0));s.battle={};assert.throws(()=>toggleBattlePerk(s,'provisions'));
});
test('Old campaigns migrate preparation fields without changing inventory or campaign progress',()=>{
 const s=newSave();delete s.battlePerks;delete s.enemyIntel;const inventory=JSON.stringify(s.inventory);validateSave(s);assert.deepEqual(s.battlePerks,[]);assert.deepEqual(s.enemyIntel,[]);assert.equal(JSON.stringify(s.inventory),inventory);
});
test('Only equipped eligible gear contributes; forging and different Command affixes have real distinct benefits',()=>{
 const s=newSave(),h=heroData(s),weapon=makeItem('sword',5,12),armor=makeItem('armor',4,12);weapon.weaponPattern='dawnfang';weapon.affix='bounty';armor.armorKind='marshal';armor.affix='logistic';s.inventory.push(weapon,armor);const before=commandGear(s);h.equipped.weapon=weapon.id;h.equipped.armor=armor.id;const b=commandGear(s);assert.equal(b.start,45);assert.equal(b.kill,2);assert.equal(b.income,.22);assert.notDeepEqual(b,before);assert.equal(heroStats(s).startingCommand,b.start);assert.ok(Math.abs(commandBreakdown({commandGear:b,perks:['signals']}).total-1.12)<1e-9);assert.equal(heroKillCommand({commandGear:b},'hollow'),4);assert.ok(commandBenefits(armor).some(x=>x.includes('0.22')));const old=itemCommandBonuses(weapon);weapon.plus=10;assert.ok(itemCommandBonuses(weapon).start>old.start);assert.ok(itemCommandBonuses(weapon).kill>old.kill);
 const reserves={type:'armor',rarity:6,affix:'reserves'},elite={type:'sword',rarity:5,affix:'conquest'};assert.equal(commandCap({commandGear:itemCommandBonuses(reserves)}),295);assert.equal(heroKillCommand({commandGear:itemCommandBonuses(elite)},'knight'),10);assert.equal(heroKillCommand({commandGear:itemCommandBonuses(elite)},'hollow'),2);assert.deepEqual(itemCommandBonuses({type:'shield',rarity:6,affix:'muster'}),{start:0,income:0,kill:0,elite:0,capacity:0});assert.equal(itemCommandBonuses({type:'sword',rarity:2,affix:'muster'}).start,0);
});
test('Loot rolls never place high-tier Command affixes on low-tier gear or unsupported slots',()=>{
 for(const type of ['sword','armor','shield','relic'])for(let rarity=0;rarity<=6;rarity++)for(let n=0;n<80;n++){const i=makeItem(type,rarity,12),a=AFFIXES[i.affix];if(a?.command){assert.ok(['sword','armor'].includes(type));assert.ok(rarity>=a.minRarity);}}
});
test('Wall and field capacities are independent; wall posts are unique, recoverable and defense-only',()=>{
 const field=Array.from({length:24},()=>({unit:'shield'})),wall=WALL_POSTS.map((pos,wallSlot)=>({unit:'bow',wallSlot,pos})),all=[...field,...wall];assert.equal(fieldCount(all),24);assert.equal(wallCount(all),8);assert.equal(freeWallSlot(all),-1);assert.doesNotThrow(()=>validateGarrison(all,false));assert.throws(()=>validateGarrison([...all,{unit:'shield'}],false));assert.throws(()=>validateGarrison(wall,true));assert.throws(()=>validateGarrison([{unit:'bow',wallSlot:0},{unit:'bow',wallSlot:0}],false));assert.throws(()=>validateGarrison([{unit:'shield',wallSlot:0}],false));wall[2].dead=true;assert.equal(freeWallSlot(all),2);assert.equal(wallCount(all),7);assert.deepEqual(parseRecruitKey(recruitKey('bow',true)),{id:'bow',wall:true});
});
test('Wall range stacks with research and Eagle watch; troop and gate health perks affect actual combat stats',()=>{
 const base=unitStats('bow',1),b={perks:['battlements','veterans'],research:[]},field=battleUnitStats('bow',1,b),wall=battleUnitStats('bow',1,b,{wallSlot:0});assert.equal(wall.reach,47.5);assert.equal(wall.speed,0);assert.equal(field.reach,base.reach);assert.equal(wall.hp,Math.round(base.hp*1.1));assert.equal(wall.cost,field.cost);b.research.push({id:'longbow',complete:true});assert.equal(battleUnitStats('bow',1,b,{wallSlot:0}).reach,59.38);assert.equal(battleUnitStats('bow',1,null,{wall:true}).reach,43.75);const gate=battleDefenseStats('gate',1,null,null);assert.equal(battleDefenseStats('gate',1,null,{perks:['masonry']}).hp,Math.round(gate.hp*1.2));
});
test('Debut missions prominently feature each new enemy and every mission has real scouting data',()=>{
 for(const m of MISSIONS){const cards=scoutCards(newSave(),m);assert.ok(cards.length>0);assert.equal(cards.filter(c=>!c.encounterRole).length,missionEnemies(m).length);for(const c of cards){assert.ok(c.hp>0&&c.damage>0&&c.range>0);assert.ok(c.name&&c.model&&c.design&&c.guide.length===3);}if(m.kind==='main'&&m.introduced){const first=missionRoster(m,1);assert.ok(first.includes(m.introduced));assert.ok(first.filter(x=>x===m.introduced).length>=Math.min(2,first.length/4),m.name);}}
 const s=newSave();s.completed=[0,1];const cards=scoutCards(s,MISSIONS[2]);assert.deepEqual(cards.filter(c=>c.new&&!c.encounterRole).map(c=>c.type),['runner']);s.enemyIntel=['runner','ironjaw'];assert.ok(scoutCards(s,MISSIONS[2]).every(c=>!c.new));
});
test('Stormriders unlock after eight victories and are costly, fast, armored charge cavalry',()=>{
 assert.equal(UNITS.rider.unlock,8);const a=unitStats('rider',1),b=unitStats('rider',10);assert.equal(a.cost,150);assert.equal(a.speed,7.2);assert.equal(a.damage,38);assert.equal(a.armorPierce,.25);assert.ok(b.chargeDamage>a.chargeDamage);assert.ok(b.speed>a.speed);assert.ok(b.armorPierce>a.armorPierce);
});
test('Victory awaits celebration acknowledgement without duplicating rewards; legacy reports remain valid',()=>{
 const s=newSave(),b={id:0,reportID:'celebration',time:100,wave:3,gate:500,maxGate:500,core:650,ledger:newBattleLedger(),research:[]};const r=settleBattle(s,b,true);assert.equal(r.celebrated,false);assert.equal(r.acknowledged,false);const rewards=[s.supplies,s.inventory.length];r.celebrated=true;settleBattle(s,b,true);assert.deepEqual([s.supplies,s.inventory.length],rewards);assert.equal(s.lastBattle.celebrated,true);delete r.celebrated;validateSave(s);
});

test('Mixed reinforcement slots rotate independently so later waves cannot collapse back to two types',()=>{for(const m of MISSIONS.filter(m=>m.kind==='main'&&m.id>=3))for(let wave=1;wave<=m.waves;wave++){const roster=missionRoster(m,wave);assert.ok(new Set(roster).size>=4,m.name+' wave '+wave);for(const type of ['herald','mender','warpriest','mortar'])assert.ok(roster.filter(t=>t===type).length<=2);assert.ok(roster.filter(t=>t==='brute').length<=3);}});

test('All defense missions wait for the last soldier before starting another wave',()=>{for(let id=0;id<24;id++){assert.equal(waveReady(MISSIONS[id],{wave:1,nextWave:-5},1),false);assert.equal(waveReady(MISSIONS[id],{wave:1,nextWave:0},0),true);}assert.equal(waveReady(MISSIONS[6],{wave:1,nextWave:0},12),false);assert.equal(waveReady(MISSIONS[10],{wave:1,nextWave:0},38),false);assert.equal(waveReady(MISSIONS[0],{wave:3,nextWave:-5},0),false);});
