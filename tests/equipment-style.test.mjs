import test from 'node:test';import assert from 'node:assert/strict';
import {equipmentStyle,armorStyle,equipmentMagic,exaltedRarity,MAGIC_COLORS} from '../src/equipment-style.js';
import {newSave,makeItem,equipItem,equipped,validateSave,completeMission,lootRoll,itemValue} from '../src/state.js';
import {RARITIES,MISSIONS} from '../src/data.js';
import {newBattleLedger,validateBattleLedger} from '../src/battle-record.js';
import {rollBattleChest,grantChest} from '../src/battle-rewards.js';
const weapon=(extra={})=>({type:'sword',weaponPattern:'hearthblade',rarity:0,plus:0,level:1,...extra});
test('Armor prestige follows equipped rarity regardless of hero level or forging',()=>{
 for(const kind of ['hearth','bastion','trail','spellweave','ember','dawn','marshal']){const tiers=RARITIES.map((_,rarity)=>armorStyle({armorKind:kind,rarity,level:1,plus:0}));assert.equal(new Set(tiers.map(s=>s.cloth)).size,7);assert.equal(tiers[0].rank,1);assert.equal(tiers[4].rank,8);assert.ok(tiers[5].glow&&tiers[6].glow);assert.ok(tiers.slice(0,5).every(s=>!s.glow));assert.deepEqual(armorStyle({armorKind:kind,rarity:0,level:30,plus:10}),tiers[0]);}
});
test('Exalted weapons grow around the same grip without changing combat reach',()=>{
 const tiers=RARITIES.map((_,rarity)=>equipmentStyle({rarity}));for(let n=1;n<7;n++){assert.ok(tiers[n].length>tiers[n-1].length);assert.ok(tiers[n].width>tiers[n-1].width);}assert.ok(tiers[6].length/tiers[0].length>1.8);assert.ok(tiers[5].glow&&tiers[6].glow);
});
test('Magic auras follow live rune, active named power and affix effects',()=>{
 assert.deepEqual(equipmentMagic(weapon()),[]);assert.deepEqual(equipmentMagic(weapon({weaponPattern:'emberbrand'})),[]);
 assert.deepEqual(equipmentMagic(weapon({weaponPattern:'emberbrand',rarity:2,level:5}))[0],{element:'fire',color:MAGIC_COLORS.fire});
 assert.deepEqual(equipmentMagic(weapon({weaponPattern:'emberbrand',rarity:2,level:5,rune:'frost'})).map(x=>x.element),['frost','fire']);
 for(const [affix,element]of Object.entries({ember:'fire',vampiric:'vampiric',focus:'arcane',vital:'nature',command:'holy',guard:'holy',swift:'wind',sunder:'earth'}))assert.equal(equipmentMagic(weapon({affix}))[0].element,element);
 assert.equal(equipmentMagic(weapon({type:'staff',weaponPattern:'pilgrimstaff'}))[0].element,'arcane');
 assert.equal(equipmentMagic(weapon({type:'spear',weaponPattern:'stormlance',rarity:5,level:20}))[0].element,'storm');
});
test('Mythic and Godly are late-game drops while all seven tiers remain obtainable',()=>{
 const s=newSave();assert.equal(exaltedRarity(s,.9999),4);s.completed=Array.from({length:12},(_,i)=>i);assert.equal(exaltedRarity(s,.998),5);s.completed=Array.from({length:20},(_,i)=>i);assert.equal(exaltedRarity(s,.998),6);assert.equal(exaltedRarity(s,.997),5);assert.equal(exaltedRarity(s,.98),4);assert.equal(new Set(Array.from({length:10000},(_,i)=>exaltedRarity(s,i/10000))).size,7);
 const result=lootRoll(s,0,()=>.999,'armor');assert.equal(result.rarity,6);assert.ok(itemValue(result)>itemValue({...result,rarity:4}));
});
test('The final fortress and final defense guarantee Mythic and Godly on first victory only',()=>{
 const s=newSave();s.completed=Array.from({length:23},(_,i)=>i);const fortress=Object.values(MISSIONS).find(m=>m.kind==='fortress');assert.ok(fortress);let result=completeMission(s,fortress.id);assert.equal(result.item.rarity,5);result=completeMission(s,23);assert.equal(result.item.rarity,6);assert.equal(result.first,true);validateSave(s);
});
test('Exalted equipped items and recovered chest contents survive save validation unchanged',()=>{
 const s=newSave();for(const rarity of [5,6])for(const type of ['sword','armor','shield']){const i=makeItem(type,rarity,20,()=>.4);s.inventory.push(i);equipItem(s,i.id);}const saved=structuredClone(s);validateSave(saved);assert.deepEqual(saved.inventory,s.inventory);assert.equal(equipped(saved,'armor').rarity,6);
 const ledger=newBattleLedger(20);ledger.foundItems=[makeItem('armor',6,20,()=>.4)];validateBattleLedger(ledger);ledger.foundItems[0].rarity=7;assert.throws(()=>validateBattleLedger(ledger));s.inventory[0].rarity=7;assert.throws(()=>validateSave(s));
});
test('Recovered late-campaign chests can contain Godly gear without duplicate grants',()=>{
 const s=newSave();s.completed=Array.from({length:20},(_,i)=>i);let n=0;const rng=()=>n++===0?0:.999;const battle={id:20,ledger:newBattleLedger(20)},c=rollBattleChest(s,battle,{type:'boss',pos:{x:0,y:0,z:0}},rng);assert.equal(c.rarity,4);assert.ok(c.rewards.items.every(i=>i.rarity===6));validateBattleLedger(battle.ledger);grantChest(s,c);const len=s.inventory.length;grantChest(s,c);assert.equal(s.inventory.length,len);
});
