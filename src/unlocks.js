import {UNITS,DEFENSES,MISSIONS,HEROES,SPELLS,unitStats,defenseStats} from './data.js';
import {heroStats,skillPoints,campaignCap} from './state.js';
import {RESEARCH,RESEARCH_LIMIT} from './research.js';
export const UNIT_LESSONS={
 pike:['Stop the heavy charge','Pikes deal 50% extra damage to siege brutes and captains. Put them behind your shield line.'],
 banner:['Your army fights together','Soldiers within 9m gain 15% damage and speed. Near enemies, the strongest standard also earns Command.'],
 engineer:['Keep the gate standing','Repairs the gate every 3 seconds within 9m. Deploy before it falls; a destroyed gate cannot be rebuilt in battle.'],
 lantern:['Bring the wounded home','Heals the most wounded nearby ally every 3 seconds. Protect these fragile healers behind your infantry.'],
 assassin:['Hunt their back line','Fast blades seek archers and spellcasters and ignore half their armor. Use them when your front line is secure.'],
 pyre:['Break the crowd','Fireballs burst on impact. Shield these casters while they punish tightly packed enemy formations.'],
 breaker:['Crack their armor','Hammer swings ignore 55% of enemy armor and can hit several foes. Send them against armored front lines.'],
 crew:['Bring down the giants','Bolts ignore 50% of armor and deal 35% extra damage to brutes and captains. Keep a clear firing lane.'],
 marksman:['Pick off distant threats','Crossbows ignore 70% of armor and reach 34m. Their powerful shots have a slow 2.8-second reload.'],
 frost:['Slow the advance','Ice shards slow a target by 35%. Pair them with archers to keep dangerous enemies at a distance.'],
 rider:['Find the open flank','Ride 6m at speed to charge the next hit: +60% damage and a short stun. Give cavalry room to move.'],
 dawn:['Hold, strike, restore','Every third hit heals a wounded nearby ally. These armored champions anchor your late-campaign army.'],
 giant:['Break their formation','Long-reaching hammer sweeps hit several enemies. Support this expensive frontline soldier with healers.']
};
export function createUnlockReview(save,before,report){
 const cards=[];if(!report.win&&report.endLevel<=report.stats.startLevel)return {version:1,cards,cursor:0,complete:true};
 const count=save.completed.length;if(report.win&&report.first&&MISSIONS[report.mission].kind==='main'){
  for(const [id,u]of Object.entries(UNITS))if(u.unlock>before.completed&&u.unlock<=count)cards.push({kind:'unit',id});
  for(const [id,d]of Object.entries(DEFENSES))if(d.unlock>before.completed&&d.unlock<=count)cards.push({kind:'defense',id});
  for(const [id,r]of Object.entries(RESEARCH))if(r.unlock>before.completed&&r.unlock<=count)cards.push({kind:'research',id});
  for(const m of MISSIONS)if(m.kind==='settlement'&&m.unlockMain===report.mission)cards.push({kind:'territory',id:String(m.id)});
  if(count===1)cards.push({kind:'lesson',id:'equipment'},{kind:'lesson',id:'exploration'});
  if(count===5||count===10)cards.push({kind:'lesson',id:'ranks',rank:campaignCap(save)});
 }
 if(report.endLevel>report.stats.startLevel){cards.push({kind:'hero',id:save.hero,from:report.stats.startLevel,to:report.endLevel});for(const n of HEROES[save.hero].skills.filter(n=>n.active&&n.learnLevel>report.stats.startLevel&&n.learnLevel<=report.endLevel))cards.push({kind:'ability',id:n.id,hero:save.hero});}
 if(report.rescued&&report.first)cards.push({kind:'lesson',id:'tribute',mission:report.mission});
 return {version:1,cards,cursor:0,complete:false,started:false};
}
export function reviewCard(save,card){
 if(card.kind==='unit'){const u=UNITS[card.id],rank=save.units[card.id],s=unitStats(card.id,rank),lesson=UNIT_LESSONS[card.id]||[u.role,u.role];return {eyebrow:'NEW REGIMENT · RANK '+rank,title:u.name,subtitle:lesson[0],text:lesson[1],stats:[['Health',s.hp],['Damage',s.damage],['Armor',s.armor],['Reach',s.reach+'m']],note:s.count+' soldier'+(s.count===1?'':'s')+' · '+s.cost+' Command per squad',tip:'Recruit from COMMAND → Troops in battle. Train permanent ranks with Rowan in town.',tab:'troops'};}
 if(card.kind==='defense'){const d=DEFENSES[card.id],rank=save.defenses[card.id],s=defenseStats(card.id,rank);return {eyebrow:'NEW DEFENSE PLAN · RANK '+rank,title:d.name,subtitle:'A new way to hold the field',text:d.desc,stats:[['Health',s.hp],['Power',s.damage],['Range',s.range+'m'],['Fires every',d.interval+'s']],note:'Fits one of your four weapon emplacements',tip:'Visit Nell → Defenses to choose an emplacement. Supplies improve its permanent rank.',tab:'defenses'};}
 if(card.kind==='research'){const r=RESEARCH[card.id];return {eyebrow:'NEW COMBAT RESEARCH',title:r.name,subtitle:r.summary,text:({veterans:'New Forge soldiers have a 25% chance to become veterans: +50% health, +100% damage and +100% armor. Includes Ashbreakers, crew, engineers, marksmen and giants.',mageFortune:'Cinder adepts and Rime scholars gain 50% health and damage. Each shot has a 25% chance to call five elemental projectiles; 8-second cooldown per caster.'})[card.id]||r.description,stats:[['Research time',r.seconds+'s'],['Battle slots',RESEARCH_LIMIT],['Command cost','Free'],['Lasts','This battle']],note:'A tactical choice for each battle',tip:'In battle, open COMMAND → Research. Choose up to four projects; their bonuses end with the battle.',tab:'campaign'};}
 if(card.kind==='territory'){const m=MISSIONS[Number(card.id)];return {eyebrow:'A NEW RESCUE ON YOUR MAP',title:m.name,subtitle:m.title,text:m.story+' This optional expedition supports your main campaign.',stats:[['Tribute','+'+m.income],['Objective','Destroy keep'],['Suggested rank',m.recommended],['Rescue','Optional']],note:'After rescue: Supplies after every main-mission victory',tip:'Open War table → Campaign and select '+m.name+'. Prepare your army before traveling.',tab:'campaign'};}
 if(card.kind==='ability'){const n=HEROES[card.hero].skills.find(n=>n.id===card.id),spell=SPELLS[card.id];return {eyebrow:'NEW ACTIVE ABILITY · READY TO LEARN',title:n.name,subtitle:HEROES[card.hero].name,text:n.effects[0],stats:[['Hero level',n.learnLevel],['Learn cost',(n.cost||1)+' point'+((n.cost||1)>1?'s':'')],[spell.type||'Focus',spell.cost],['Recovery',spell.cooldown+'s']],note:'Learn with a skill point, then equip to a combat button.',tip:'Character → Abilities → '+n.name+'. Choose button 1 or 2 after learning.',tab:'hero'};}
 if(card.kind==='hero'){const gains=levelGains(save,card);return {eyebrow:'LEVEL UP',title:HEROES[card.id].name,from:card.from,to:card.to,stats:gains.map(g=>[g.label,g.after]),gains,learned:[],tab:'hero'};}
 const definitions={
  equipment:{eyebrow:'A NEW TOOL FOR SURVIVAL',title:'Your growing armory',subtitle:'Armor changes more than protection',text:'Your first victory awards armor. Different sets improve healing, magic, defense or movement. Equipped armor appears on your hero.',stats:[['Armor slot','1'],['Rune socket','Forge +3'],['Upgrade currency','Salvage'],['Preview','Before / after']],note:'Loot is already saved in your inventory',tip:'Visit Torren → Armory. Select the armor slot, compare an item, then equip or improve it.',tab:'equipment'},
  exploration:{eyebrow:'THERE IS LIFE BETWEEN BATTLES',title:'Make Hearthwatch yours',subtitle:'Explore, prepare, then choose your next oath',text:'Climb the western rampart for a hidden cache. Visit your vendors, practice attacks, or explore the courtyard before setting out.',stats:[['Hidden treasure','Rampart'],['Vendors','5'],['Training','Courtyard'],['Travel','War table']],note:'Rescued settlements pay Supplies after main-mission victories',tip:'Roam freely in town, or open War table to compare your next mission and optional rescues.',tab:'campaign'},
  ranks:{eyebrow:'THE ARMORY OPENS ITS VAULTS',title:'New training ranks',subtitle:'Your army is ready for greater things',text:'Troops and defenses can now reach rank '+card.rank+'. Inspect Upgrade to compare current stats, next-rank benefits and the new appearance.',stats:[['Previous cap',card.rank===7?5:7],['New rank cap',card.rank],['Troop choices',15],['Defense plans',8]],note:'Ranks are permanent across battles',tip:'Visit Rowan for regiments or Nell for defenses. You choose where your Supplies go.',tab:'troops'},
  tribute:{eyebrow:'ANOTHER LIGHT ANSWERS',title:MISSIONS[card.mission]?.name||'A land restored',subtitle:'The people can help you now',text:'This rescued settlement sends Supplies whenever you win a main mission. Replaying a main mission earns tribute too.',stats:[['Tribute','+'+(MISSIONS[card.mission]?.income||0)],['Paid after','Main victories'],['Duration','Permanent'],['Collection','Automatic']],note:'Tribute appears in the battle summary',tip:'Use the extra Supplies to train soldiers, improve defenses, or buy equipment.',tab:'campaign'}
 };return definitions[card.id];
}

export function levelGains(save,card){const at=level=>heroStats({...save,hero:card.id,heroes:{...save.heroes,[card.id]:{...save.heroes[card.id],level}}}),a=at(card.from),b=at(card.to);const gains=[['hp','Maximum health'],['stamina','Stamina'],['focus','Focus'],['armor','Armor'],['damage','Damage']].filter(([key])=>b[key]>a[key]).map(([key,label])=>({label,before:a[key],after:b[key],delta:b[key]-a[key]}));gains.push({label:'Skill points earned',before:0,after:card.to-card.from,delta:card.to-card.from});return gains;}
