import {battleUnitStats,battleDefenseStats,researchComplete,RESEARCH,WAR_BANDS} from './research.js';
import {UNITS,DEFENSES,unitStats,defenseFiringStats} from './data.js';
export const statNumber=n=>Number(n.toFixed(2));
const n=statNumber;
const ability=(name,text,unlock=1)=>({name,text,unlock});
export function unitInspection(id,rank,battle=null){
 const u=UNITS[id],s=battleUnitStats(id,rank,battle),abilities=[];
 if(s.healAmount)s.healAmount*=s.healFactor;
 if(id==='shield')abilities.push(ability('Shield company','Recruit '+s.count+' soldier'+(s.count===1?'':'s')+' for '+s.cost+' Command. Rank IV musters two; VIII musters three. Each soldier counts toward the army limit.'),ability('Linked shields','While holding, take 15% less projectile damage with another Shieldward within 2m.',5));
 if(id==='bow')abilities.push(ability('Longwatch arrows','Physical arrows reach '+n(s.reach)+'m. Every rank adds 1.5m. Cover blocks arrows; a clear firing lane matters.'));
 if(id==='pike')abilities.push(ability('Siege hunter','Thrusts deal '+n(s.siegeBonus*100-100)+'% bonus damage to fortifications, siege brutes and captains ('+n(s.damage*s.siegeBonus)+' before armor). Each thrust hits one target.'));
 if(id==='lantern')abilities.push(ability('Mending light','Every '+n(s.healInterval)+' s, heal the most wounded hero or soldier within '+n(s.healRange)+' m for '+n(s.healAmount)+' health. Each rank improves healing, radius and cadence.'));
 if(id==='breaker')abilities.push(ability('Armor breaker','Sweeps ignore '+n(s.armorPierce*100)+'% of armor and stagger for '+n(s.stagger)+' s. Captains suffer 30% of normal stagger.'));
 if(id==='crew')abilities.push(ability('Driving bolts','Bolts push enemies at '+n(s.knockback)+' m/s, ignore 50% armor and deal '+n(s.siegeBonus*100-100)+'% bonus damage to fortifications, siege brutes and captains. Captains receive 35% of the push; terrain blocks displacement.'));
 if(id==='rider')abilities.push(ability('Riding charge','Travel '+n(s.chargeDistance)+' m above 4 m/s to charge. Your next hit deals '+n(s.chargeDamage)+'× damage and stuns for '+n(s.chargeStun)+' s (30% duration against captains). Travel again to recharge.'));
 if(id==='giant')abilities.push(ability('Earthshaker sweep','Sweep enemies within '+n(s.reach)+'m. Hits stagger for '+n(s.stagger)+'s and push at '+n(s.knockback)+'m/s. Captains receive 30% stagger and 35% push.'));
 if(id==='banner')abilities.push(ability('Dawn standard','Soldiers within '+n(s.auraRadius)+'m gain '+n(s.auraStrength*100)+'% damage and movement speed. Only the strongest standard or Rally bonus applies.'),ability('Forward command','Generate '+n(s.commandRate*60)+' Command per minute before Logistics while an enemy is within 24m. Only the strongest eligible standard generates Command; the 220 cap still applies.'));
 if(id==='engineer')abilities.push(ability('Field repairs','Restore '+n(s.repairAmount)+' gate health every '+n(s.repairInterval)+' s within 9m. Cannot rebuild a fallen gate. On defense, engineers fight within 4m. In sieges, they advance and deal 2.5× damage to fortifications.'));
 if(id==='assassin')abilities.push(ability('Backline hunter','Prioritize enemy archers, bombers and spellcasters. Ignore '+n(s.armorPierce*100)+'% armor and move at '+n(s.speed)+'m/s.'));
 if(id==='pyre')abilities.push(ability('Bursting fireball','Direct hit: '+s.damage+'. The '+n(s.blastRadius)+'m impact burst adds '+n(s.damage*.35)+' damage to enemies, including the original target.'),ability('Lingering embers','Leave a 2.1m ember field for 3s, dealing '+n(s.burnDps)+' fire damage/s.',5),ability('Splintering flame','Release three 16-damage fragments, each with an impact burst.',9));
 if(id==='marksman')abilities.push(ability('Armor-piercing shot','Bolts ignore '+n(s.armorPierce*100)+'% armor and reach '+n(s.reach)+'m. A powerful shot every '+n(s.attackInterval)+'s.'));
 if(id==='frost')abilities.push(ability('Rime shard','Slow movement by '+n(s.slowStrength*100)+'% for '+n(s.slowDuration)+' s. Repeated hits refresh the slow; only the strongest slow applies.'));
 if(id==='dawn')abilities.push(ability('Battle renewal','Every '+s.healEvery+' landed hits heal the most wounded hero or soldier within '+n(s.healRange)+'m for '+n(s.healAmount)+' health. Can heal itself; rank VII heals every second hit.'));
 const active=key=>researchComplete(battle,key);for(const [key,applies]of [['fastShot',['bow','marksman'].includes(id)],['mageFortune',['pyre','frost'].includes(id)],['infantry',id==='shield'],['veterans',WAR_BANDS.forge.includes(id)],['crossfire',['bow','staff','crossbow'].includes(u.weapon)]])if(applies&&active(key))abilities.push(ability('Battle research · '+RESEARCH[key].name,RESEARCH[key].description));
 return {...s,count:s.count,dps:s.damage/s.attackInterval,mitigation:100*(1-100/(100+s.armor*2)),abilities};
}
export function defenseInspection(id,rank,doctrine,battle=null){
 const s=battleDefenseStats(id,rank,doctrine,battle),abilities=[],protectedEmplacement=id!=='gate';
 if(id==='gate')abilities.push(ability('Hold the breach','The gate absorbs siege attacks before enemies can reach the beacon. At 0 health it opens the breach; the beacon has 650 health. The gate does not attack.'),ability('Repairable fortification','Field engineers within 9 m repair a damaged gate every 3 s. Once the gate falls, it cannot be rebuilt until you leave the battle.'));
 if(id==='tower'){
  abilities.push(ability('Watchfire','Fire one physical arrow at the nearest enemy in range. The Stats tab includes any active firing doctrine.'));
  abilities.push(ability('Firing doctrine',(doctrine==='longwatch'?'Longwatch: +20% range and a 20% longer attack cycle.':'Suppression: −15% range and 25% faster firing.')+' Choose your doctrine at Hearthwatch.',5));
  abilities.push(ability(doctrine==='longwatch'?'Mark the approach':'Suppress the approach',doctrine==='longwatch'?'Hits mark enemies for '+(rank>=9?3:2)+' s. Marked enemies take 20% more hero damage and 15% more allied damage.':'Hits slow movement by 35% for '+(rank>=9?1:.7)+' s. Repeated hits refresh the slow.',8));
  abilities.push(ability('Coordinated volley','When ready, replace a normal shot with three arrows, each at 50% damage'+(rank>=10?' ('+n(s.damage*.5)+' each)':'')+'. 150% total damage if all hit; 18 s cooldown.',10));
 }
 if(id==='ballista'){
  abilities.push(ability('Heavy bolt','Prioritize the enemy with the highest maximum health in range. Bolts are physical projectiles and can be stopped by cover.'));
  abilities.push(ability('Bolt doctrine',doctrine==='pinning'?'Pinning: deal 15% less damage'+(rank>=5?' (included in Stats)':'')+' and slow movement by 35% for 2 s.':'Piercing: hit a second aligned enemy within 12 m of the first for 50% damage'+(rank>=5?' ('+n(s.damage*.5)+')':'')+'. A bolt cannot chain again.',5));
  abilities.push(ability('Sunlance charge','A 0.65 s winding charge replaces one normal shot when ready. Deal 180% damage to fortifications, siege brutes and captains'+(rank>=10?' ('+n(s.damage*1.8)+')':'')+', or 120% to other enemies'+(rank>=10?' ('+n(s.damage*1.2)+')':'')+'. 22 s cooldown.',10));
 }
 if(id==='cannon')abilities.push(ability('Explosive iron shot','Prioritize the most armored enemy. Direct hits ignore 50% of armor and create a 3 m fire blast for '+n(s.damage*.45)+' additional damage. The original target can take both the hit and blast.'));
 if(id==='frost')abilities.push(ability('Rime lock','A physical ice shard slows the target’s movement by 35% for 3 s. Hits refresh the duration without stacking the slow strength.'));
 if(id==='mortar')abilities.push(ability('Arcing bombardment','A lobbed stone deals '+s.damage+' area damage within 4 m. It cannot target enemies 9 m or closer; protect its blind spot with soldiers.'));
 if(id==='sanctuary')abilities.push(ability('Sheltering ember','Every '+n(s.interval)+' s, heal up to four wounded heroes or soldiers in range for '+s.damage+' health each, prioritizing the lowest health percentage. Also grants 30% damage reduction for 2 s. The brazier deals no damage.'));
 if(id==='storm')abilities.push(ability('Chain lightning','Hit up to three enemies for '+s.damage+', '+n(s.damage*.65)+', then '+n(s.damage*.4)+' damage before armor. Each jump must reach a different enemy within 7 m of the previous target.'));
 if(id==='gate'&&researchComplete(battle,'demolition'))abilities.push(ability('Battle research · TNT',RESEARCH.demolition.description));if(id!=='gate'&&id!=='sanctuary'&&researchComplete(battle,'crossfire'))abilities.push(ability('Battle research · Crossfire',RESEARCH.crossfire.description));
 return {...s,protected:protectedEmplacement,dps:s.interval?s.damage/s.interval:0,minRange:id==='mortar'?9:0,abilities,role:DEFENSES[id].desc};
}
