import {STANDARD_LIMIT} from './command-economy.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const regimentBonus=e=>1+Math.max(e.buff>0?.15:0,e.standardBonus||0);
export const movementFactor=e=>1-Math.max(e.slow>0?.35:0,e.rimeTime>0?e.rimeStrength||0:0);
export function standardIncome(g){return g.allies.filter(a=>!a.dead&&a.unit==='banner').map(a=>a.stats.commandRate).sort((a,b)=>b-a).slice(0,STANDARD_LIMIT).reduce((sum,n)=>sum+n,0);}
export function supportRegiment(g,e,dt){
 if(e.team!=='ally')return;
 const s=e.stats;
 e.standardBonus=Math.max(0,...g.allies.filter(a=>!a.dead&&a.unit==='banner'&&dist(a.pos,e.pos)<a.stats.auraRadius).map(a=>a.stats.auraStrength));
 if(e.unit==='banner'){e.bannerFX=(e.bannerFX||0)-dt;if(e.bannerFX<=0){e.bannerFX=3;g.fx.ring(e.pos,s.auraRadius,0xe2c584,.6);}}
 if(e.unit==='engineer'&&g.battle&&!g.battle.siege){
  const b=g.battle,ready=!e.dead&&!(e.stun>0)&&b.gate>0&&b.gate<b.maxGate&&dist(e.pos,g.gatePos)<2.0&&!g.enemies.some(a=>!a.dead&&dist(a.pos,e.pos)<4);
  if(!ready){e.repairSwing=null;e.repairTimer=0;}
  else {
   e.facing=Math.atan2(g.gatePos.x-e.pos.x,g.gatePos.z-e.pos.z);e.character.root.rotation.y=e.facing;
   e.repairTimer=Math.max(0,(e.repairTimer||0)-dt);
   if(!e.repairSwing&&e.repairTimer===0){e.repairSwing={time:0,hit:false};e.character.attack('hammer',true,0,1.1);e.repairTimer=s.repairInterval;}
   if(e.repairSwing){const swing=e.repairSwing;swing.time+=dt;
    if(!swing.hit&&swing.time>=.58){swing.hit=true;b.gate=Math.min(b.maxGate,b.gate+s.repairAmount);g.fx.emit('spark',g.gatePos.clone().setY(1.2),9);g.audio.play('repair',.35);}
    if(swing.time>=1.1)e.repairSwing=null;
   }
   return true;
  }
 }
 if(e.unit==='rider'){e.chargeDistance=(e.chargeDistance||0)+(e.speed>4?e.speed*dt:0);if(e.chargeDistance>=s.chargeDistance)e.cavalryCharge=true;}
}
export function regimentHit(g,t,source,opt){
 if(source?.team!=='ally'||!source.unit||opt.secondary)return;
 const s=source.stats;
 if(source.unit==='dawn'){
  source.landed=(source.landed||0)+1;if(source.landed%s.healEvery===0){const allies=[g.hero,...g.allies].filter(a=>!a.dead&&a.hp<a.stats.hp&&dist(a.pos,source.pos)<s.healRange).sort((a,b)=>a.hp/a.stats.hp-b.hp/b.stats.hp);const a=allies[0];if(a){a.hp=Math.min(a.stats.hp,a.hp+s.healAmount*(s.healFactor||1));g.fx.ward(a.pos,1,.7);g.audio.play('tether',.25);}}
 }
 if(s.stagger)t.stun=Math.max(t.stun||0,s.stagger*(t.type==='boss'?.3:1));
 if(s.knockback){t.knock=t.pos.clone().sub(source.pos).setY(0).normalize().multiplyScalar(s.knockback*(t.type==='boss'?.35:1));g.fx.emit('dust',t.pos,6,{speed:1.3});}
 if(source.unit==='rider'&&source.cavalryCharge){t.stun=Math.max(t.stun||0,s.chargeStun*(t.type==='boss'?.3:1));source.cavalryCharge=false;source.chargeDistance=0;g.fx.emit('dust',t.pos,15,{speed:2});}
}
