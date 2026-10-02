import {abilityProfile} from './ability-progression.js';
export const furnaceFireball=rank=>{const {impact,blast,radius,burn,duration,sunder}=abilityProfile('fireball',rank);return {impact,blast,radius,burn,duration,sunder};};
export const furnaceDescriptions=Array.from({length:10},(_,i)=>{const r=furnaceFireball(i+1);return r.impact+' direct + '+r.blast+' blast damage. Burns a '+r.radius+'m area for '+r.burn+' damage/s over '+r.duration+'s.'+(r.sunder?' Blast reduces enemy armor 20% for '+r.sunder+'s.':'');});
