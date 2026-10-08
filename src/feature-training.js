import {UNITS,DEFENSES,HEROES,SPELLS} from './data.js';
import {heroData,campaignCap} from './state.js';
import {strategySnapshot} from './strategy-progression.js';
import {BATTLE_PERKS} from './battle-plan.js';
import {RESEARCH} from './research.js';
import {MOUNTS,mountUnlocked} from './mount-rules.js';
import {CASTLE_STYLES,DECORATIONS,victoryCount} from './castle-customization.js';

// Eligibility comes from the same campaign gates as purchases. Acknowledging a
// lesson changes only the guide history, never ownership or progression.
export function featureLessons(s){
 const cards=[],add=(id,title,benefit,where,steps,tab,icon='banner')=>cards.push({id,title,benefit,where,steps,tab,icon}),wins=s.completed.length,h=heroData(s);
 if(wins){
  add('forge','Your armory','Compare loot, equip it, and improve its power.','Torren · Forge · West courtyard',['Speak to Torren and choose Armory.','Choose a weapon or armor, then compare and equip it.','Open Improve to review stat gains and the Salvage cost.'],'equipment','hammer');
  add('market','Battle supplies','Restock potions and buy supplies between battles.','Iona · Quartermaster · East courtyard',['Speak to Iona to open the Market.','Choose supplies, check their cost, then buy.'],'shop','bag');
  add('logistics','Command lodge','Invest in more starting Command and passive income.','Nell · Engineer · East of the gate',['Speak to Nell and open Command lodge.','Compare the next benefit and Supplies cost before upgrading.'],'defenses','tower');
 }
 for(const[id,u]of Object.entries(UNITS))if(u.unlock>0&&u.unlock<=wins)add('unit:'+id,u.name,u.role,'Captain Rowan · Barracks · West of the gate',['Speak to Rowan and select '+u.name+'.','Use Upgrade to compare its next stats and cost.','In battle: COMMAND → Troops → '+u.name+' to recruit with Command.'],'troops');
 for(const[id,d]of Object.entries(DEFENSES))if(d.unlock>0&&d.unlock<=wins)add('defense:'+id,d.name,d.desc,'Nell · Engineer · East of the gate',['Speak to Nell and select '+d.name+'.','Upgrade its permanent rank with Supplies.','Refit an emplacement to bring it into your next defense.'],'defenses','tower');
 for(const cap of [7,10])if(campaignCap(s)>=cap)add('ranks:'+cap,'Training ranks up to '+cap,'Your troops and defenses can now advance beyond their previous cap.','Rowan · Regiments / Nell · Defenses',['Visit Rowan for troops or Nell for defenses.','Select a unit or defense and open Upgrade.','Review its tactical benefit and cost, then confirm.'],'troops');
 const strategy=strategySnapshot(s);
 for(const id of strategy.perks){const p=BATTLE_PERKS[id];add('perk:'+id,p.name,p.desc,'Sera · War table · South courtyard',['Speak to Sera and select your next battle.','Open Scout & prepare, then select '+p.name+'.','Choose up to two perks; they apply when the battle begins.'],'campaign','map');}
 for(const id of strategy.research){const r=RESEARCH[id];add('research:'+id,r.name,r.summary,'During battle · RESEARCH button',['Use Sera’s war table to begin a battle.','Tap RESEARCH and choose '+r.name+'.','Wait '+r.seconds+' seconds for completion. The bonus lasts for this battle only.'],'campaign','map');}
 for(const n of HEROES[s.hero].skills.filter(n=>n.active&&n.learnLevel<=h.level)){
  add('ability:'+s.hero+':'+n.id,n.name,SPELLS[n.id].desc,'Character menu · Active abilities',['Open Character → Abilities → '+n.name+'.','Spend skill points to learn or improve it.','Open Equip and assign it to combat button 1 or 2.'],'hero','sun');
  if((h.skills[n.id]||0)>=10)add('evolution:'+s.hero+':'+n.id,n.name+' evolutions','Choose a new animation and tactical effect for this mastered ability.','Character menu · Active abilities',['Select '+n.name+' and open Evolutions.','Preview both paths and choose one.','Keep the ability equipped to use the evolved version.'],'hero','sun');
 }
 const gates=[...new Set(HEROES[s.hero].skills.filter(n=>n.active).flatMap(n=>n.rankLevels||[]))].filter(level=>level>1&&level<=h.level).sort((a,b)=>a-b);
 for(const level of gates){const names=HEROES[s.hero].skills.filter(n=>n.active&&(n.rankLevels||[]).includes(level)&&n.learnLevel<level).map(n=>n.name);if(names.length)add('ability-ranks:'+s.hero+':'+level,'Higher ability ranks · Level '+level,'New training ranks are available for '+names.join(', ')+'.','Character menu · Active abilities',['Open Character → Abilities and choose a learned ability.','Compare the next rank’s effects and skill-point cost.','Improve it when you have enough points. Later ranks cost more points.'],'hero','sun');}
 for(const m of MOUNTS)if(mountUnlocked(s,m.id))add('mount:'+m.id,m.name,m.bonus,'Orrin · Royal stables · Southeast courtyard',['Speak to Orrin and select '+m.name+'.','Compare its stats, then hire for '+m.cost.toLocaleString('en-US')+' Supplies.','Return to the world and tap Mount. You can attack and cast while riding.'],'stable');
 for(const[kind,table]of [['style',CASTLE_STYLES],['decoration',DECORATIONS]])for(const[id,d]of Object.entries(table))if(d.wins>0&&victoryCount(s)>=d.wins)add(kind+':'+id,d.name,d.desc||'A new architectural style for your castle. Appearance only.','Nell · Castle styles & courtyard',['Speak to Nell and choose Castle styles & courtyard.','Select '+d.name+' and review its price or earned reward.','Apply the style or toggle the decoration. It does not change battle stats.'],'defenses','tower');
 for(const[rank,id,title,cost]of [[3,'runes','Rune sockets',8],[6,'temper','Weapon tempering',15]])if(s.inventory.some(i=>i.plus>=rank))add('forge:'+id,title,'Your forged equipment has a new customization option.','Torren · Forge · West courtyard',['Speak to Torren and select an item forged to +'+rank+' or higher.','Open '+(id==='runes'?'Rune':'Temper')+' and compare the effects.','Choose an effect for '+cost+' Salvage.'],'equipment','hammer');
 return cards;
}
export function unseenFeatureLessons(s){const seen=new Set(s.guide.featureLessons||[]);return featureLessons(s).filter(c=>!seen.has(c.id));}
export function acknowledgeFeature(s,id){if(!featureLessons(s).some(c=>c.id===id))return false;s.guide.featureLessons??=[];if(!s.guide.featureLessons.includes(id))s.guide.featureLessons.push(id);return true;}
