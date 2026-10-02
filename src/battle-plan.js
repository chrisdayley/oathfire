// Two preparation choices; permanent gear bonuses are separate and additive.
export const PLAN_LIMIT=2;
export const BATTLE_PERKS={
 provisions:{name:'Supply wagons',unlock:0,icon:'campaign',desc:'+25 starting Command.',start:25},
 signals:{name:'Signal fires',unlock:0,icon:'fire',desc:'+0.15 Command per second.',income:.15},
 veterans:{name:'Veteran drills',unlock:0,icon:'troops',desc:'+10% health for recruited troops.',health:.10},
 bounty:{name:'Spoils of war',unlock:2,icon:'sword',desc:'+1 Command per hero kill.',kill:1},
 battlements:{name:'Eagle watch',unlock:3,icon:'bow',desc:'Wall troops gain another +15% range.',wall:.15},
 masonry:{name:'Deep foundations',unlock:5,icon:'defenses',desc:'+20% gate health.',gate:.20}
};
export function planBonuses(ids=[]){const result={start:0,income:0,health:0,kill:0,wall:0,gate:0};for(const id of new Set(ids))for(const key of Object.keys(result))result[key]+=BATTLE_PERKS[id]?.[key]||0;return result;}
export function toggleBattlePerk(s,id){if(s.battle)throw Error('Choose your battle plan at Hearthwatch.');const p=BATTLE_PERKS[id];if(!p||s.completed.length<p.unlock)throw Error('Win '+(p?.unlock||0)+' main defenses to unlock this perk.');s.battlePerks??=[];if(s.battlePerks.includes(id)){s.battlePerks=s.battlePerks.filter(x=>x!==id);return;}if(s.battlePerks.length>=PLAN_LIMIT)throw Error('Remove a selected perk before choosing another.');s.battlePerks.push(id);}
export function validateBattlePerks(ids,completed=null){if(!Array.isArray(ids)||ids.length>PLAN_LIMIT||new Set(ids).size!==ids.length||ids.some(id=>!Object.hasOwn(BATTLE_PERKS,id)||completed!==null&&completed<BATTLE_PERKS[id].unlock))throw Error('Invalid battle preparation.');}
export function itemCommandBonuses(i){const b={start:0,income:0,kill:0,elite:0,capacity:0};if(!i||!['sword','spear','hammer','bow','staff','armor'].includes(i.type))return b;const r=i.rarity||0,f=1+(i.plus||0)*.025;
 if(i.affix==='muster'&&r>=3)b.start+=Math.round((18+(r-3)*9)*f);
 if(i.affix==='logistic'&&r>=4)b.income+=(.12+(r-4)*.08)*f;
 if(i.affix==='bounty'&&r>=3)b.kill+=(1+(r-3)*.5)*f;
 if(i.affix==='conquest'&&r>=5)b.elite+=Math.round((8+(r-5)*6)*f);
 if(i.affix==='reserves'&&r>=4)b.capacity+=Math.round((35+(r-4)*20)*f);
 if(i.type==='armor'&&i.armorKind==='marshal'&&r>=3){b.start+=Math.round((15+(r-3)*5)*f);if(r>=4)b.income+=(.10+(r-4)*.05)*f;}
 if(i.weaponPattern==='dawnfang'&&r>=3)b.start+=Math.round((15+(r-3)*5)*f);
 if(i.weaponPattern==='oathbell'&&r>=4)b.income+=(.10+(r-4)*.05)*f;
 for(const k of Object.keys(b))b[k]=Math.round(b[k]*100)/100;return b;
}
export function commandGear(s){const b={start:0,income:0,kill:0,elite:0,capacity:0},ids=Object.values(s?.heroes?.[s.hero]?.equipped||{});for(const i of s?.inventory||[])if(ids.includes(i.id)){const bonus=itemCommandBonuses(i);for(const k of Object.keys(b))b[k]+=bonus[k];}for(const k of Object.keys(b))b[k]=Math.round(b[k]*100)/100;return b;}
export function commandBenefits(i){const b=itemCommandBonuses(i);return [b.start&&'+'+b.start+' starting Command',b.income&&'+'+b.income.toFixed(2)+' Command / second',b.kill&&'+'+b.kill+' Command / hero kill',b.elite&&'+'+b.elite+' extra Command / hero elite kill',b.capacity&&'+'+b.capacity+' Command capacity'].filter(Boolean);}
