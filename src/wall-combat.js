import * as T from 'three';
import {researchRangedAttack} from './research-combat.js';
import {regimentBonus} from './regiments.js';
const up=new T.Vector3(0,1,0),still=new T.Vector3();
// Garrison units stay on the parapet. Their real projectiles still hit scenery.
export function tickWallSoldier(g,e,dt){
 e.speed=0;e.velocity.set(0,0,0);e.knock=null;g.physics.move(e.phys,still,dt);
 const origin=e.pos.clone().add(new T.Vector3(0,1.6,-1.3));
 const target=g.enemies.filter(t=>!t.dead&&Math.hypot(t.pos.x-e.pos.x,t.pos.z-e.pos.z)<e.stats.reach&&g.physics.lineClear(origin,t.pos.clone().addScaledVector(up,1.05))).sort((a,b)=>a.pos.distanceToSquared(e.pos)-b.pos.distanceToSquared(e.pos))[0];
 if(!target||e.cooldown>0||e.stun>0)return;
 e.facing=Math.atan2(target.pos.x-e.pos.x,target.pos.z-e.pos.z);e.character.root.rotation.y=e.facing;
 e.cooldown=e.stats.attackInterval/(e.haste>0?1.18:1);e.character.attack(e.weapon,false,0,.75);
 const type=e.unit==='frost'?'frost':e.weapon==='staff'?'fire':e.weapon==='crossbow'?'bolt':'arrow',rank=g.store.data.units[e.unit];
 g.audio.play(type==='arrow'?'bow':type==='fire'?'fireball':type,.18,{position:e.pos});
 g.combat.later(.3,()=>{if(!e.dead)g.combat.shoot(e,target,{origin,damage:e.stats.damage*regimentBonus(e),type,speed:type==='fire'?24:34,rank:e.unit==='pyre'?Math.min(3,1+Math.floor((rank-1)/4)):1,slow:e.unit==='frost'?e.stats.slowDuration:0});});
 researchRangedAttack(g,e,target);
}
