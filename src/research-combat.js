import {standardIncome} from './regiments.js';
import * as T from 'three';
import {researchComplete,battleUnitStats,battleDefenseStats,WAR_BANDS,RESEARCH,commandIncome} from './research.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const isVeteranRecruit=(g,id)=>WAR_BANDS.forge.includes(id)&&researchComplete(g.battle,'veterans')&&(g.random||Math.random)()<.25;
export function finishResearch(g,ids){const b=g.battle,s=g.store.data;if(!b)return;const fraction=g.hero.hp/g.hero.stats.hp;g.hero.stats=g.heroStats();g.hero.hp=g.hero.stats.hp*fraction;
 for(const a of g.allies){if(a.dead)continue;const health=a.hp/a.stats.hp;a.stats=battleUnitStats(a.unit,s.units[a.unit],b,a);a.hp=Math.min(a.stats.hp,a.stats.hp*health);}
 if(ids.some(id=>id==='gate'||id==='gate2')){b.maxGate=battleDefenseStats('gate',s.defenses.gate,s.doctrines.gate,b).hp;if(b.gate>0)b.gate=b.maxGate;}
 if(ids.includes('windlass'))for(const t of g.world.towerObjects)if(['tower','ballista','cannon','mortar'].includes(t.id)&&t.cooldown>0)t.cooldown/=1.2;
 if(ids.includes('reinforcements'))b.reserveArchers=(b.reserveArchers||0)+2;if(ids.includes('rally'))b.command+=70;
 for(const id of ids)g.toast(RESEARCH[id].name+' ready · active this battle.');g.audio.play('upgrade');g.fx.ward(g.hero.pos,2,1);g.checkpoint();}
export function tickResearch(g,dt){const b=g.battle;if(!b)return;b.standardIncome=standardIncome(g);if(b.command<220)b.command=Math.min(220,b.command+dt*commandIncome(b));if(researchComplete(b,'regeneration')&&!g.hero.dead)g.hero.hp=Math.min(g.hero.stats.hp,g.hero.hp+dt);
 if(researchComplete(b,'anchor')){g.hero.knock=null;g.hero.stun=0;}
 while(b.reserveArchers>0&&g.allies.filter(a=>!a.dead).length<24){g.spawnAlly('bow',{x:(b.reserveArchers-3)*1.2,y:0,z:-24});b.reserveArchers--;if(b.ledger)b.ledger.reinforcements++;}
}
export function gateDemolition(g){const b=g.battle;if(!b||b.demolitionUsed||!researchComplete(b,'demolition'))return;b.demolitionUsed=true;const p=new T.Vector3(0,0,-20),owner={team:'ally',defense:'gate',pos:p,stats:{}};g.combat.burst(p,9,200,owner,'fire');for(const e of g.enemies)if(!e.dead&&dist(e.pos,p)<9)e.stun=Math.max(e.stun||0,e.type==='boss'?3:15);g.audio.play('shell',1.2);}
export function researchRangedAttack(g,e,target){if(e.team!=='ally'||!g.battle)return;if(['bow','marksman'].includes(e.unit)&&researchComplete(g.battle,'fastShot')&&(g.random||Math.random)()<.25){e.cooldown=.35;g.fx.emit('spark',e.pos,4,{speed:1});}
 if(!['pyre','frost'].includes(e.unit)||!researchComplete(g.battle,'mageFortune')||(e.rainReady||0)>g.battle.time||(g.random||Math.random)()>=.25||!target)return;
 e.rainReady=g.battle.time+8;const center=target.pos.clone(),ice=e.unit==='frost';e.character.cast(ice?'quench':'inferno',2);g.audio.play(ice?'frost':'inferno',.4);g.fx.ring(center,3.5,ice?0x9edce7:0xf3a34e,1.7);
 for(let i=0;i<5;i++)g.combat.later(.15+i*.1,()=>{if(e.dead||!g.battle)return;const a=i*Math.PI*.8,origin=center.clone().add(new T.Vector3(Math.sin(a)*2,7+i*.3,Math.cos(a)*2));g.combat.shoot(e,null,{origin,direction:new T.Vector3(0,-1,0),damage:e.stats.damage*.4,type:ice?'frost':'fire',speed:14,rank:1,slow:ice?3:0,blast:{radius:2.3,damage:e.stats.damage*.2}});});}
export function researchHit(g,t,source,opt,amount,armor){const b=g.battle,heroAttack=source===g.hero&&!opt.secondary&&(opt.weapon||opt.projectile);if(!b)return {amount,armor};
 if(heroAttack&&researchComplete(b,'imbue')){armor=0;g.fx.emit('arcane',t.pos,4,{speed:1});}
 if(heroAttack&&researchComplete(b,'siegeHero')&&['brute','boss'].includes(t.type))amount+=10;
 if(t===g.hero&&researchComplete(b,'siegeHero')&&['brute','boss'].includes(source?.type))amount*=.5;
 if(t.team==='ally'&&t.unit==='shield'&&researchComplete(b,'infantry')&&(g.random||Math.random)()<.2){amount*=.1;g.fx.emit('spark',t.pos,8);g.audio.play('metal',.25);}
 if(source?.team==='ally'&&(source.defense||['bow','staff','crossbow'].includes(source.weapon))&&(t.slow>0||t.rimeTime>0||t.marked>0)&&researchComplete(b,'crossfire'))amount*=1.2;
 return {amount,armor};}
export function researchOnHit(g,t,source,opt){if(source===g.hero&&!opt.secondary&&(opt.weapon||opt.projectile)&&researchComplete(g.battle,'impact')&&(g.random||Math.random)()<.05)t.stun=Math.max(t.stun||0,t.type==='boss'?1:5);
 if(t===g.hero&&t.hp<=0&&g.battle&&!g.battle.lastOathUsed&&researchComplete(g.battle,'lastOath')){g.battle.lastOathUsed=true;t.hp=Math.ceil(t.stats.hp*.3);t.invuln=3;g.fx.ward(t.pos,3,3);g.audio.play('sanctuary');g.toast('The last oath holds · one life saved.');g.checkpoint();}}
