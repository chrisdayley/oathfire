import {UNITS,unitCost} from './data.js';
import {unitInspection} from './inspection.js';
import {TACTICAL_STATS} from './unit-progression.js';

// Tactical advice describes existing combat behavior, not additional bonuses.
export const UNIT_TACTICS={
 shield:{role:'Frontline infantry',use:'Durable swordsmen hold enemies in place while your ranged troops fire safely.',strong:'Light infantry; protecting archers',weak:'Armor-piercing shots and blast damage'},
 bow:{role:'Ranged support',use:'Fast-firing archers punish exposed enemies from behind your frontline. Keep their firing lanes clear.',strong:'Light infantry and exposed casters',weak:'Armored enemies and fast flankers'},
 pike:{role:'Anti-siege infantry',use:'Long pikes reach past the front rank and deal bonus damage to fortifications, siege brutes and captains.',strong:'Siege brutes, captains and fortifications',weak:'Ranged fire and surrounding crowds'},
 lantern:{role:'Combat healer',use:'Restores health to the most wounded nearby ally. Escort your frontline to keep its soldiers fighting.',strong:'Sustaining wounded heroes and infantry',weak:'Burst damage and isolated flankers'},
 breaker:{role:'Armor-breaking infantry',use:'Heavy hammer sweeps ignore armor and stagger enemies. Let faster troops pin targets in place.',strong:'Armored infantry and crowded melee',weak:'Long-range fire and mobile enemies'},
 crew:{role:'Siege crossbow',use:'Heavy bolts pierce armor, push enemies back and deal bonus damage to siege targets.',strong:'Siege brutes, captains and fortifications',weak:'Fast melee attackers at close range'},
 rider:{role:'Charging cavalry',use:'Build speed to land a powerful stunning charge. Reposition between charges to strike again.',strong:'Exposed archers, casters and flanks',weak:'Crowded fronts that stop the run-up'},
 giant:{role:'Frontline crowd breaker',use:'A resilient giant sweeps several enemies at once, staggering and pushing them away.',strong:'Packed infantry and crowded breaches',weak:'Armor-piercing ranged focus fire'},
 banner:{role:'Command & army support',use:'Generates Command while alive. Nearby soldiers gain damage and speed; protect your standard behind the line.',strong:'Funding reinforcements; supporting groups',weak:'Assassins and concentrated ranged fire'},
 engineer:{role:'Repair & siege support',use:'Repairs your gate on defense. In sieges, advances with the army and deals 2.5× damage to fortifications.',strong:'Gate damage and enemy fortifications',weak:'Enemy infantry; cannot rebuild a fallen gate'},
 assassin:{role:'Backline hunter',use:'Fast blades prioritize archers, bombers and casters. Their strikes ignore much of the target’s armor.',strong:'Enemy archers, bombers and casters',weak:'Crowded melee and area attacks'},
 pyre:{role:'Area-damage mage',use:'Fireballs burst around their target. Protect this fragile caster while it burns closely packed enemies.',strong:'Packed infantry and clustered ranged troops',weak:'Fast flankers and scattered enemies'},
 marksman:{role:'Armor-piercing ranged',use:'Slow, powerful crossbow shots strike from exceptional range and ignore most enemy armor.',strong:'Armored enemies and distant priority targets',weak:'Numerous light troops and fast flankers'},
 frost:{role:'Ranged crowd control',use:'Ice shards slow the target, giving your archers more time to fire and your hero room to reposition.',strong:'Fast attackers and advancing heavy units',weak:'Large groups and concentrated ranged fire'},
 dawn:{role:'Armored battle healer',use:'A heavily armored swordsman heals a wounded nearby ally after repeated hits. Keep it in sustained melee.',strong:'Sustained frontline fighting; protecting allies',weak:'Burst damage and armor-piercing fire'}
};
export const formatStat=(value,suffix='',mult=1)=>Number((value*mult).toFixed(2))+suffix;
const CORE=[['hp','Health',''],['damage','Damage / hit',''],['armor','Armor',''],['reach','Range',' m'],['attackInterval','Attack cycle',' s',1,-1],['speed','Movement',' m/s'],['count','Soldiers / recruit',''],['armorPierce','Armor ignored','%',100]];
export function regimentStats(id,rank,battle=null){
 const stats=unitInspection(id,rank,battle);
 const rows=[...CORE,...(TACTICAL_STATS[id]||[]).filter(([key])=>!CORE.some(([k])=>k===key))];
 return {stats,rows:rows.filter(([key])=>key!=='burnDps'||rank>=5).map(([key,label,suffix,mult=1,direction=1])=>({key,label,suffix,mult,direction,value:stats[key]||0,text:formatStat(stats[key]||0,suffix,mult)}))};
}
export function regimentUpgrade(id,rank){
 if(!UNITS[id]||rank>=10||rank<1)return null;
 const before=regimentStats(id,rank),after=regimentStats(id,rank+1);
 const rows=[...after.rows,{key:'cost',label:'Recruitment cost',suffix:' Command',mult:1,direction:-1}].map(row=>{
  const from=row.key==='burnDps'&&rank<5?0:before.stats[row.key]||0,to=after.stats[row.key]||0;
  return {...row,from,to,delta:to-from,before:formatStat(from,row.suffix,row.mult),after:formatStat(to,row.suffix,row.mult),change:(to>from?'+':'')+formatStat(to-from,row.suffix,row.mult)};
 }).filter(row=>Math.abs(row.delta)>.00001);
 return {id,rank,next:rank+1,cost:unitCost(id,rank),rows,abilities:after.stats.abilities.filter(a=>a.unlock===rank+1)};
}
