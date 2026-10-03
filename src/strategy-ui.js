import {RESEARCH} from './research.js';
import {BATTLE_PERKS} from './battle-plan.js';
import {RESEARCH_REQUIREMENTS,PERK_REQUIREMENTS,newlyAvailableStrategy,requirementText} from './strategy-progression.js';
const data=c=>c.kind==='perk'?BATTLE_PERKS[c.id]:RESEARCH[c.id];
export function announceStrategyUnlocks(ui,before){const cards=newlyAvailableStrategy(ui.g.store.data,before);if(!cards.length)return;ui.dialog('<small>CASTLE PLANS LEARNED</small><h2>New battle options</h2>'+cards.map(c=>'<div class="strategy-earned"><b>'+data(c).name+'</b><p>'+(data(c).summary||data(c).desc)+'</p><small>'+(c.kind==='perk'?'Select before battle at the war table.':'Select Research during a battle.')+'</small></div>').join('')+'<div class="dialog-actions"><button class="primary" id="strategy-unlocks-done">Continue</button></div>');document.getElementById('strategy-unlocks-done').onclick=()=>document.getElementById('dialog').hidden=true;}
export function strategyRewards({town,building,rank}){
 const rows=[];for(const [kind,rules] of [['perk',PERK_REQUIREMENTS],['research',RESEARCH_REQUIREMENTS]])for(const [id,r] of Object.entries(rules))if(town?r.town===town:r[building]===rank){rows.push({kind,id,requirement:r});}
 return rows;
}
export function strategyRewardList(source){const rows=strategyRewards(source);return rows.length?'<div class="strategy-rewards"><small>BATTLE PLANS</small>'+rows.map(c=>'<div><b>'+data(c).name+(source.town&&c.requirement.defenses?' · '+c.requirement.defenses+' defenses':'')+'</b><small>'+requirementText(c.requirement)+'</small></div>').join('')+'</div>':'';}
