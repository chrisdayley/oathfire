import {UNITS,DEFENSES,unitStats,defenseFiringStats} from './data.js';
export const statNumber=n=>Number(n.toFixed(2));
const n=statNumber;
const ability=(name,text,unlock=1)=>({name,text,unlock});
export function unitInspection(id,rank){
 const u=UNITS[id],s=unitStats(id,rank),abilities=[];
 if(id==='shield')abilities.push(ability('Linked shields','While Hold here is ordered, take 15% less projectile damage when another living Shieldward is within 2 m. This protection does not stack.',5));
 if(id==='bow')abilities.push(ability('Arrow fire','Physical arrows strike one enemy. Terrain and walls block shots; keep a clear line of fire.'));
 if(id==='pike')abilities.push(ability('Siege hunter','Deal 50% more damage to siege brutes and fallen captains: '+n(s.damage*1.5)+' damage per thrust before armor. Thrusts strike one target.'));
 if(id==='lantern')abilities.push(ability('Mending light','Every 3 s, heal the most wounded hero or soldier within 10 m for '+(12+rank*2)+' health. Targets are chosen by missing health percentage.'));
 if(id==='breaker')abilities.push(ability('Armor breaker','Melee attacks ignore 55% of the target’s armor. Hammer sweeps can hit several enemies in reach.'));
 if(id==='crew')abilities.push(ability('Siegebreaker bolts','Bolts ignore 50% of armor and deal 35% more damage to siege brutes and fallen captains: '+n(s.damage*1.35)+' damage before armor.'));
 if(id==='rider')abilities.push(ability('Riding charge','Travel 6 m at more than 4 m/s to charge the next hit. It deals 60% extra damage ('+n(s.damage*1.6)+' before armor) and stuns for 0.7 s. Travel another 6 m to charge again.'));
 if(id==='giant')abilities.push(ability('Giant’s sweep','The hammer can strike several enemies across its forward arc. Its long reach helps clear a crowded front line.'));
 if(id==='banner')abilities.push(ability('Dawn standard','Allied soldiers within 9 m gain 15% damage and movement speed. The aura refreshes every 0.5 s, fades shortly after leaving, and does not stack with another standard.'));
 if(id==='engineer')abilities.push(ability('Field repairs','Restore '+(18+rank*4)+' gate health every 3 s while within 9 m of a damaged, standing gate. Engineers cannot rebuild a fallen gate. They fight enemies within 4 m.'));
 if(id==='assassin')abilities.push(ability('Backline hunter','Prioritize grave callers and archers within 36 m. Melee strikes ignore 50% of the target’s armor.'));
 if(id==='pyre')abilities.push(
  ability('Bursting fireball','A direct hit deals '+s.damage+' damage, then bursts within 1.6 m for another '+n(s.damage*.35)+' fire damage. The burst can hit the original target and nearby enemies.'),
  ability('Lingering embers','Impacts leave a 2.1 m ember field for 3 s, dealing 3 fire damage per second before armor.',5),
  ability('Splintering flame','Impacts release three smaller fireballs, each with 16 direct damage and its own impact burst.',9));
 if(id==='marksman')abilities.push(ability('Armor-piercing shot','Crossbow bolts ignore 70% of the target’s armor. Powerful single-target shots have a 2.8 s attack cycle.'));
 if(id==='frost')abilities.push(ability('Rime shard','Hits slow movement by 35% for '+n(2+rank*.2)+' s. Further hits refresh the duration; slow strength does not stack.'));
 if(id==='dawn')abilities.push(ability('Third-strike renewal','Every third landed hit heals the most wounded hero or soldier within 7 m for '+(12+rank*2)+' health. The Sun sworn can heal itself.'));
 return {...s,count:u.count,dps:s.damage/s.attackInterval,mitigation:100*(1-100/(100+s.armor*2)),abilities};
}
export function defenseInspection(id,rank,doctrine){
 const s=defenseFiringStats(id,rank,doctrine),abilities=[],protectedEmplacement=id!=='gate';
 if(id==='gate')abilities.push(ability('Hold the breach','The gate absorbs siege attacks before enemies can reach the beacon. At 0 health it opens the breach; the beacon has 650 health. The gate does not attack.'),ability('Repairable fortification','Field engineers within 9 m repair a damaged gate every 3 s. Once the gate falls, it cannot be rebuilt until you leave the battle.'));
 if(id==='tower'){
  abilities.push(ability('Watchfire','Fire one physical arrow at the nearest enemy in range. Damage and range above include any active firing doctrine.'));
  abilities.push(ability('Firing doctrine',(doctrine==='longwatch'?'Longwatch: +20% range and a 20% longer attack cycle.':'Suppression: −15% range and 25% faster firing.')+' Choose your doctrine at Hearthwatch.',5));
  abilities.push(ability(doctrine==='longwatch'?'Mark the approach':'Suppress the approach',doctrine==='longwatch'?'Hits mark enemies for '+(rank>=9?3:2)+' s. Marked enemies take 20% more hero damage and 15% more allied damage.':'Hits slow movement by 35% for '+(rank>=9?1:.7)+' s. Repeated hits refresh the slow.',8));
  abilities.push(ability('Coordinated volley','When ready, replace a normal shot with three arrows, each at 50% damage'+(rank>=10?' ('+n(s.damage*.5)+' each)':'')+'. 150% total damage if all hit; 18 s cooldown.',10));
 }
 if(id==='ballista'){
  abilities.push(ability('Heavy bolt','Prioritize the enemy with the highest maximum health in range. Bolts are physical projectiles and can be stopped by cover.'));
  abilities.push(ability('Bolt doctrine',doctrine==='pinning'?'Pinning: deal 15% less damage'+(rank>=5?' (already included above)':'')+' and slow movement by 35% for 2 s.':'Piercing: hit a second aligned enemy within 12 m of the first for 50% damage'+(rank>=5?' ('+n(s.damage*.5)+')':'')+'. A bolt cannot chain again.',5));
  abilities.push(ability('Sunlance charge','A 0.65 s winding charge replaces one normal shot when ready. Deal 180% damage to siege brutes and captains'+(rank>=10?' ('+n(s.damage*1.8)+')':'')+', or 120% to other enemies'+(rank>=10?' ('+n(s.damage*1.2)+')':'')+'. 22 s cooldown.',10));
 }
 if(id==='cannon')abilities.push(ability('Explosive iron shot','Prioritize the most armored enemy. Direct hits ignore 50% of armor and create a 3 m fire blast for '+n(s.damage*.45)+' additional damage. The original target can take both the hit and blast.'));
 if(id==='frost')abilities.push(ability('Rime lock','A physical ice shard slows the target’s movement by 35% for 3 s. Hits refresh the duration without stacking the slow strength.'));
 if(id==='mortar')abilities.push(ability('Arcing bombardment','A lobbed stone deals '+s.damage+' area damage within 4 m. It cannot target enemies 9 m or closer; protect its blind spot with soldiers.'));
 if(id==='sanctuary')abilities.push(ability('Sheltering ember','Every 4 s, heal up to four wounded heroes or soldiers in range for '+s.damage+' health each, prioritizing the lowest health percentage. Also grants 30% damage reduction for 2 s. The brazier deals no damage.'));
 if(id==='storm')abilities.push(ability('Chain lightning','Hit up to three enemies for '+s.damage+', '+n(s.damage*.65)+', then '+n(s.damage*.4)+' damage before armor. Each jump must reach a different enemy within 7 m of the previous target.'));
 return {...s,protected:protectedEmplacement,dps:s.interval?s.damage/s.interval:0,minRange:id==='mortar'?9:0,abilities,role:DEFENSES[id].desc};
}
