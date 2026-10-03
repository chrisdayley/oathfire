import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS,ENEMIES} from '../src/data.js';
import {newSave,validateSave} from '../src/state.js';
import {waveReady} from '../src/campaign.js';
import {createAssault,advanceAssault,assaultPending,validateAssault} from '../src/wave-plan.js';
import {enemyTarget,rememberAttacker,TROOP_HUNTERS} from '../src/enemy-orders.js';
import {heroArmorProfile} from '../src/hero-armor-profile.js';

test('Every defense wave delivers 1–2 minutes of reinforcements, escalating toward the end',()=>{
 for(const m of MISSIONS.filter(m=>m.mode==='defense'))for(let w=1;w<=m.waves;w++){
  const p=createAssault(m,w),b={wave:w,assault:p};validateAssault(b,ENEMIES);
  assert.ok(p.duration>=60&&p.duration<=120);assert.ok(p.entries.every(e=>ENEMIES[e.type]));
  assert.ok(new Set(p.entries.map(e=>e.at)).size>=7);
  assert.ok(p.entries.filter(e=>e.at>p.duration*2/3).length>p.entries.filter(e=>e.at<p.duration/3).length);
  assert.ok(p.entries.at(-1).assaultBoost>p.entries[0].assaultBoost);
  assert.deepEqual(p,createAssault(m,w));
  if(m.introduced)assert.ok(p.entries.some(e=>e.type===m.introduced));
  assert.equal(p.entries.filter(e=>e.type==='boss').length,Number(m.boss&&w===m.waves));
  if(m.boss&&w===m.waves)assert.equal(p.entries.at(-1).type,'boss');
 }
});
test('Capacity defers every overdue soldier without losing a packet or releasing a burst on resume',()=>{
 const p=createAssault(MISSIONS[18],5),count=p.entries.length;
 assert.deepEqual(advanceAssault(p,150,0),[]);assert.equal(p.cursor,0);
 const sent=[];while(p.cursor<count){const group=advanceAssault(p,0,58);assert.ok(group.length<=4);sent.push(...group);}
 assert.deepEqual(sent,p.entries);assert.equal(advanceAssault(p,9,58).length,0);
});
test('Cleared gaps and final-wave gaps never count as a completed wave',()=>{
 const m=MISSIONS[0],b={wave:1,nextWave:0,assault:createAssault(m,1)};
 advanceAssault(b.assault,0,58);assert.equal(waveReady(m,b,0),false);assert.equal(assaultPending(b),true);
 b.assault.cursor=b.assault.entries.length;assert.equal(waveReady(m,b,1),false);assert.equal(waveReady(m,b,0),true);
 b.wave=m.waves;assert.equal(waveReady(m,b,0),false);
});
test('Suspended assaults retain exact remaining reinforcements; old saved waves remain valid',()=>{
 const s=newSave();s.battle={id:0,wave:1,nextWave:8,command:50,gate:500,maxGate:1000,core:650,time:27,hero:{pos:{x:0,y:0,z:-27},hp:100,focus:100,stamina:100},enemies:[],allies:[],assault:createAssault(MISSIONS[0],1)};
 advanceAssault(s.battle.assault,27,58);const snapshot=JSON.stringify(s);const loaded=validateSave(JSON.parse(snapshot));assert.deepEqual(loaded.battle.assault,s.battle.assault);
 const a=advanceAssault(loaded.battle.assault,50,58),b=advanceAssault(s.battle.assault,50,58);assert.deepEqual(a,b);
 for(const mutate of [p=>p.cursor=-1,p=>p.cursor=10000,p=>p.entries[0].type='no',p=>p.entries[0].at=-1,p=>p.entries[0].assaultBoost=9]){const invalid=JSON.parse(snapshot);mutate(invalid.battle.assault);assert.throws(()=>validateSave(invalid));}
 delete loaded.battle.assault;assert.doesNotThrow(()=>validateSave(loaded));
});
const fighter=(id,x=1)=>({id,pos:{x,z:0},team:id==='hero'?'hero':'ally'});
test('Unprovoked assault units ignore nearby heroes and troops, while hunters deliberately acquire them',()=>{
 const hero=fighter('hero'),ally=fighter('ally',2);
 for(const type of Object.keys(ENEMIES)){const e={type,team:'enemy',pos:{x:0,z:0}};assert.equal(!!enemyTarget(e,[hero,ally]),TROOP_HUNTERS.has(type),type);}
 assert.equal(enemyTarget({type:'longbow',pos:{x:0,z:0}},[hero,{...ally,wallSlot:1}]).wallSlot,1);
});
test('Attacked infantry retaliate against the attacker, then resume the castle when reprisal expires or is impossible',()=>{
 const e={type:'hollow',team:'enemy',pos:{x:0,z:0}},hero=fighter('hero'),ally=fighter('ally',5);
 rememberAttacker(e,ally,20);assert.equal(enemyTarget(e,[hero,ally],{now:21}),ally);
 assert.equal(enemyTarget(e,[hero,ally],{now:30}),null);
 rememberAttacker(e,hero,30);assert.equal(enemyTarget(e,[{...hero,dead:true},ally],{now:31}),null);
 rememberAttacker(e,ally,32);assert.equal(enemyTarget(e,[hero,ally],{now:33,reachable:t=>t.id!=='ally'}),null);
 rememberAttacker(e,hero,34);assert.equal(enemyTarget(e,[{...hero,pos:{x:100,z:0}},ally],{now:35}),null);
 rememberAttacker(e,{...hero,team:'enemy'},40);assert.equal(e.reprisal,undefined);
});
test('Siege garrisons keep defending their fortress rather than abandoning the invading army',()=>{
 const hero=fighter('hero'),e={type:'hollow',team:'enemy',pos:{x:0,z:0}};
 assert.equal(enemyTarget(e,[hero],{siege:true}),hero);
});
test('Every hero armor family includes a helmet; Legendary gets sleeves and Mythic/Godly full plate',()=>{
 for(const design of ['warden','ashwright','ranger'])for(const armorKind of ['hearth','trail','spellweave','bastion','ember','dawn','marshal'])for(let rarity=0;rarity<7;rarity++){
  const p=heroArmorProfile({design,armor:{armorKind,rarity}});assert.ok(p.helmet&&p.cape);assert.equal(p.sleeves,rarity>=4);assert.equal(p.plate,rarity>=5);assert.ok(p.capeLength>=1.2);
 }
 assert.equal(heroArmorProfile({design:'hollow',enemy:true}),null);
});
