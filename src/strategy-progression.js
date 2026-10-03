// Campaign requirements are checked when choosing a plan or starting a project.
// A suspended battle keeps its already selected perks and research.
export const PERK_REQUIREMENTS={
 provisions:{defenses:2},signals:{defenses:2,lodge:1},veterans:{defenses:3},
 bounty:{defenses:5},battlements:{town:25},masonry:{defenses:4,gate:3}
};
export const RESEARCH_REQUIREMENTS={
 shield:{town:24},pike:{town:24,defenses:2},infantry:{town:24,defenses:4},
 longbow:{town:25},reinforcements:{town:25},
 demolition:{town:26},veterans:{town:26},payload:{town:26},
 anchor:{town:27},regeneration:{town:27},spears:{town:27},
 impact:{town:28},mageFortune:{town:28},runic:{town:28},
 fastShot:{town:29},wildPath:{town:29},crossfire:{town:29},
 elite:{town:30},resolve:{town:30},forgeRunes:{town:31},lastOath:{town:31},
 gate:{defenses:2,gate:2},windlass:{defenses:2,tower:2},
 imbue:{defenses:4,lodge:2},heroHealth:{defenses:4,lodge:2},heroDamage:{defenses:4,lodge:2},
 siegeHero:{defenses:6,lodge:3},gate2:{defenses:8,gate:5},rally:{defenses:8,lodge:3},logistics:{defenses:8,lodge:3},
 heroDamage2:{defenses:12,lodge:4},heroHealth2:{defenses:12,lodge:4},wards:{defenses:12,lodge:4}
};
const towns=['Willowmill','Reedhaven','Coppergate','Whitepine','Sunspire','Briarhaven','Greywake','Dawnmere'];
const roman=['0','I','II','III','IV','V','VI','VII','VIII','IX','X'];
export function requirementMet(s,r){return !!r&&(!r.defenses||(s.completed?.length||0)>=r.defenses)&&(!r.town||s.settlements?.includes(r.town))&&(!r.lodge||(s.castleLogistics||0)>=r.lodge)&&(!r.gate||(s.defenses?.gate||1)>=r.gate)&&(!r.tower||(s.defenses?.tower||1)>=r.tower);}
export const perkUnlocked=(s,id)=>requirementMet(s,PERK_REQUIREMENTS[id]);
export const researchUnlocked=(s,id)=>requirementMet(s,RESEARCH_REQUIREMENTS[id]);
export function requirementText(r){if(!r)return 'Unknown requirement';return [r.town&&'Hold '+towns[r.town-24],r.defenses&&'Win '+r.defenses+' home defenses',r.lodge&&'Command lodge '+roman[r.lodge],r.gate&&'Gate '+roman[r.gate],r.tower&&'Archer tower '+roman[r.tower]].filter(Boolean).join(' · ');}
export const researchRequirement=id=>requirementText(RESEARCH_REQUIREMENTS[id]);
export const perkRequirement=id=>requirementText(PERK_REQUIREMENTS[id]);
export function strategySnapshot(s){return {research:Object.keys(RESEARCH_REQUIREMENTS).filter(id=>researchUnlocked(s,id)),perks:Object.keys(PERK_REQUIREMENTS).filter(id=>perkUnlocked(s,id))};}
export function newlyAvailableStrategy(s,before){const now=strategySnapshot(s);return [...now.perks.filter(id=>!before.perks.includes(id)).map(id=>({kind:'perk',id})),...now.research.filter(id=>!before.research.includes(id)).map(id=>({kind:'research',id}))];}
export function removeUnavailablePerks(s){if(Array.isArray(s.battlePerks))s.battlePerks=s.battlePerks.filter(id=>!Object.hasOwn(PERK_REQUIREMENTS,id)||perkUnlocked(s,id));}
