import {heroStats} from './state.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function supportRegiment(g,e,dt){
 if(e.team!=='ally')return;
 const rank=g.store.data.units[e.unit];
 if(e.unit==='banner'){
  e.auraTimer=(e.auraTimer||0)-dt;if(e.auraTimer<=0){e.auraTimer=.5;for(const a of g.allies)if(!a.dead&&dist(a.pos,e.pos)<9)a.buff=Math.max(a.buff||0,.65);}
  e.bannerFX=(e.bannerFX||0)-dt;if(e.bannerFX<=0){e.bannerFX=3;g.fx.ring(e.pos,9,0xe2c584,.6);}
 }
 if(e.unit==='engineer'&&g.battle){
  e.repairTimer=(e.repairTimer||0)-dt;if(e.repairTimer<=0&&dist(e.pos,g.gatePos)<9&&g.battle.gate>0&&g.battle.gate<g.battle.maxGate){e.repairTimer=3;g.battle.gate=Math.min(g.battle.maxGate,g.battle.gate+18+rank*4);e.character.attack('hammer',false,0,.8);g.fx.emit('spark',g.gatePos.clone().setY(1.2),12);g.audio.play('repair',.25);}
 }
 if(e.unit==='rider'){e.chargeDistance=(e.chargeDistance||0)+(e.speed>4?e.speed*dt:0);if(e.chargeDistance>=6)e.cavalryCharge=true;}
}
export function regimentHit(g,t,source,opt){
 if(source?.team!=='ally'||!source.unit||opt.secondary)return;
 const rank=g.store.data.units[source.unit];
 if(source.unit==='dawn'){
  source.landed=(source.landed||0)+1;if(source.landed%3===0){const allies=[g.hero,...g.allies].filter(a=>!a.dead&&a.hp<a.stats.hp&&dist(a.pos,source.pos)<7).sort((a,b)=>a.hp/a.stats.hp-b.hp/b.stats.hp);const a=allies[0];if(a){a.hp=Math.min(a===g.hero?heroStats(g.store.data).hp:a.stats.hp,a.hp+12+rank*2);g.fx.ward(a.pos,1,.7);g.audio.play('tether',.25);}}
 }
 if(source.unit==='rider'&&source.cavalryCharge){t.stun=Math.max(t.stun||0,.7);source.cavalryCharge=false;source.chargeDistance=0;g.fx.emit('dust',t.pos,15,{speed:2});}
}
