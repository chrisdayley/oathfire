import test from 'node:test';import assert from 'node:assert/strict';
import {ARMOR_DROPS,armorBonuses,armorKind} from '../src/armor.js';
import {newSave,makeItem,heroStats,heroData,equipped,equipItem,forgeItem,setRune,setTemper,lootRoll,completeMission,validateSave,salvageItem} from '../src/state.js';
const armor=(s,kind,rarity=0)=>{const i=makeItem('armor',rarity,1,()=>.4,kind);i.affix=null;s.inventory.push(i);return i;};
test('Armor occupies its own slot per hero and carrying a spare grants no benefits',()=>{
 const s=newSave(),before=heroStats(s),weapon=equipped(s).id,old=equipped(s,'armor').id,n=armor(s,'spellweave');
 assert.deepEqual(heroStats(s),before);equipItem(s,n.id);assert.equal(equipped(s).id,weapon);assert.equal(heroStats(s).focus,before.focus+20);assert.equal(s.heroes.ranger.equipped.armor,old);
 s.hero='ranger';assert.equal(equipped(s,'armor').id,old);assert.throws(()=>salvageItem(s,n.id));validateSave(s);
});
test('Each armor pattern changes the intended build with exact common-rank bonuses',()=>{
 const s=newSave(),base=heroStats(s),read=kind=>{equipItem(s,armor(s,kind).id);return heroStats(s);};
 let st=read('bastion');assert.equal(st.armor,base.armor+7);assert.equal(st.stamina,base.stamina+14);assert.equal(st.guardCost,.84);assert.equal(st.speed,base.speed*.96);
 st=read('trail');assert.equal(st.armor,base.armor-4);assert.equal(st.speed,base.speed*1.08);assert.equal(st.staminaRegen,22.5);
 st=read('spellweave');assert.equal(st.armor,base.armor-6);assert.equal(st.focus,base.focus+20);assert.equal(st.focusRegen,4.55);
 st=read('ember');assert.equal(st.fireResistance,.25);assert.equal(st.heavyBonus,.12);
 st=read('dawn');assert.equal(st.hp,base.hp+24);assert.equal(st.healFactor,1.2);
 st=read('marshal');assert.equal(st.supportRadius,7);assert.equal(st.allyBonus,.10);
});
test('Rarity, ten forge ranks, awakening and armor-specific sockets strengthen actual buffs',()=>{
 const s=newSave();s.supplies=100000;s.salvage=10000;s.completed=Array.from({length:10},(_,i)=>i);
 const i=armor(s,'ember',4);equipItem(s,i.id);let b=armorBonuses(i);assert.equal(b.fireResistance,.35);assert.throws(()=>setRune(s,i.id,'ember'));
 for(let rank=1;rank<=10;rank++){forgeItem(s,i.id);const next=armorBonuses(i);assert.ok(next.heavyBonus>b.heavyBonus);b=next;}
 assert.equal(i.awakened,true);assert.throws(()=>forgeItem(s,i.id));setRune(s,i.id,'ember');setTemper(s,i.id,'sunder');assert.ok(heroStats(s).fireResistance>.6);assert.ok(heroStats(s).heavyBonus>.32);
 setRune(s,i.id,'frost');assert.equal(heroStats(s).stamina,115);setRune(s,i.id,'vital');assert.equal(heroStats(s).hp,284);
 setTemper(s,i.id,'swift');assert.equal(heroStats(s).speed,5.2*1.05);setTemper(s,i.id,'guard');assert.equal(heroStats(s).guardCost,.85);
 assert.equal(i.id,equipped(s,'armor').id);validateSave(s);
});
test('Armor enters normal randomized treasure/reward loot and the first defense guarantees a pattern',()=>{
 const s=newSave();let seed=1717;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);const found=new Set();let armors=0;
 for(let k=0;k<1000;k++){const i=lootRoll(s,0,rng);if(i.type==='armor'){armors++;found.add(i.armorKind);}s.inventory.pop();}
 assert.equal(found.size,6);assert.ok(armors>240&&armors<360);assert.deepEqual([...found].sort(),[...ARMOR_DROPS].sort());
 const r=completeMission(s,0);assert.equal(r.item.type,'armor');assert.ok(r.item.rarity>=1);assert.ok(ARMOR_DROPS.includes(r.item.armorKind));
});
test('Legacy armor preserves its identity, investment and resources',()=>{
 const s=newSave();delete equipped(s,'armor').armorKind;const i=equipped(s,'armor');i.plus=7;i.rune='vital';i.temper='guard';i.affix='command';i.name='Captain’s Hearthwatch plate';
 s.supplies=723;s.salvage=39;s.units.shield=4;const inventory=JSON.stringify(s.inventory),heroes=JSON.stringify(s.heroes);
 validateSave(s);assert.equal(JSON.stringify(s.inventory),inventory);assert.equal(JSON.stringify(s.heroes),heroes);assert.equal(s.supplies,723);assert.equal(s.salvage,39);assert.equal(s.units.shield,4);assert.equal(armorKind(i),'hearth');
 // Previously inert armor sockets now have documented defensive effects; gear identity stays intact.
 assert.equal(heroStats(s).hp,284);assert.equal(heroStats(s).guardCost,.85);
});
test('Save validation rejects unknown patterns without silently replacing equipment',()=>{
 for(const kind of ['missing','toString','__proto__']){const s=newSave();equipped(s,'armor').armorKind=kind;assert.throws(()=>validateSave(s));}
 const s=newSave();equipped(s).armorKind='ember';assert.throws(()=>validateSave(s));
});
test('A full inventory converts a reward to salvage and does not overwrite equipped armor',()=>{
 const s=newSave(),id=equipped(s,'armor').id;while(s.inventory.length<160)s.inventory.push(makeItem());const salvage=s.salvage;
 assert.equal(lootRoll(s,2,()=>.5,'armor'),null);assert.equal(s.inventory.length,160);assert.equal(equipped(s,'armor').id,id);assert.ok(s.salvage>salvage);
});
