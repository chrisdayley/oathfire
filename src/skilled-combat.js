import * as T from 'three';
import {equipped} from './state.js';
import {positionalStrike} from './frontline-rules.js';
import {combatNotice,interruptEnemy} from './frontline-events.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function skilledHit(g,t,source,opt,amount,armor){
 if(source!==g.hero||t.team!=='enemy'||opt.secondary)return {amount,armor};
 const strike=positionalStrike(t,source,opt);amount*=strike.multiplier;armor*=strike.armorFactor;
 if(strike.rear)combatNotice(g,'REAR STRIKE','#efce93',t.pos);
 if(opt.heavy){interruptEnemy(g,t);if(opt.weapon==='hammer'&&(t.rimeTime>0||t.slow>0)){amount*=1.65;t.rimeTime=0;t.slow=0;t.stun=Math.max(t.stun||0,1.2);g.fx.emit('water',t.pos,24,{speed:3});g.audio.play('frost',.6,{position:t.pos,rank:3});combatNotice(g,'SHATTER','#a5e7f2',t.pos);}}
 return {amount,armor};
}
export function perfectGuard(g,source,opt){
 const h=g.hero;h.riposte=Math.max(h.riposte||0,2);combatNotice(g,'PERFECT GUARD','#ffe2a2');
 if(source?.team==='enemy'&&distance(source.pos,h.pos)<5&&!opt.projectile){interruptEnemy(g,source);source.stun=Math.max(source.stun||0,.85);source.character.play('Hit_A',.08,true,.3);}
 if(g.store.data.hero==='warden'&&(h.oathPulseUntil??-Infinity)<=g.time){h.oathPulseUntil=g.time+5;for(const a of g.allies)if(!a.dead&&distance(a.pos,h.pos)<7){a.protect=Math.max(a.protect||0,3);a.protectStrength=Math.max(a.protectStrength||0,.25);}g.fx.ring(h.pos,7,0xe6c370,.6);}
}
export function emberRemains(g,e){
 if(g.store.data.hero!=='ashwright'||e.training||!(e.burn>0||g.time-(e.lastHeroFire??-100)<1.1)||equipped(g.store.data,'armor')?.armorKind!=='ember')return;
 // A capped, short-lived pickup; walking to it trades positioning for recovery.
 g.healingEmbers??=[];if(g.healingEmbers.length>=8)return;
 g.healingEmbers.push({pos:e.pos.clone(),time:6,tick:0});
}
export function tickCombatSkills(g,dt){
 for(let i=(g.healingEmbers?.length||0)-1;i>=0;i--){const ember=g.healingEmbers[i];ember.time-=dt;ember.tick-=dt;
  if(ember.tick<=0){ember.tick=.4;g.fx.emit('ember',ember.pos.clone().add(new T.Vector3(0,.6,0)),3,{speed:.4,life:.6});}
  if(distance(ember.pos,g.hero.pos)<2.5&&Math.abs(ember.pos.y-g.hero.pos.y)<3){g.hero.hp=Math.min(g.heroStats().hp,g.hero.hp+12);g.fx.ring(ember.pos,1.2,0xeab777,.4);combatNotice(g,'+12 EMBER HEAL','#facb84');g.healingEmbers.splice(i,1);}
  else if(ember.time<=0)g.healingEmbers.splice(i,1);
 }
}
