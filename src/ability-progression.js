// Shared by combat, training, saves and the preview. Values are total effects, not promises.
export const ACTIVE_RANKS=10;
export const RANK_COSTS=[1,1,1,2,2,2,3,3,4,5];
export const rankLevels=learn=>[1,2,6,9,12,15,18,21,24,27].map((v,i)=>Math.max(v,learn+i));
export const earnedSkillPoints=level=>level-1+Math.max(0,level-4)+Math.floor(Math.max(0,level-9)/2);
export const rankCost=(node,rank)=>node.active?rank===1?(node.cost||1):RANK_COSTS[rank-1]:node.cost||1;
export function trainedCost(node,rank,starter=false){let sum=0;for(let r=starter?2:1;r<=rank;r++)sum+=rankCost(node,r);return sum;}
const path=(id,name,description,pose)=>({id,name,description,pose});
export const EVOLUTIONS={
 fireball:[path('corona','Furnace Corona','Release a 9m circle of fire around you: 180 damage, then 32 fire damage/s for 6s. Push enemies back. 26 focus · 8s recovery.','nova'),path('sun','Falling Sun','Launch one enormous fireball: 420 direct + 170 blast damage in 6m. Burns for 32 damage/s over 6s. 30 focus · 10s recovery.','lance')],
 step:[path('ram','Dawnbreaker','Dash through the front line, dealing 100 damage in a 4m shockwave and stunning for 2s.','charge'),path('haven','Sheltering Advance','Leave a 6m sanctuary at your departure point: allies recover 14 HP/s for 6s.','ward')],
 rally:[path('warcry','Lion’s Warcry','Allies gain 35% damage and 35% attack speed for 10s.','nova'),path('rescue','Rally the Fallen','Instantly heal nearby living allies for 100 HP and grant 45% protection for 10s.','ward')],
 volley:[path('piercer','Sunspear Signal','Archers fire one 260% damage bolt that pierces three enemies.','lance'),path('rain','Golden Arrow Rain','Archers fire four 85% damage arrows across nearby targets.','rain')],
 tether:[path('pilgrim','Pilgrim’s Beacon','A 5m ward follows you for 10s, healing allies for 16 HP/s.','ward'),path('prison','Beacon Prison','Anchor an 8m field for 8s, dealing 24 holy damage/s to enemies.','nova')],
 sunwall:[path('citadel','Citadel of Dawn','Protect nearby allies by 60% for 12s and restore 35 stamina.','ward'),path('judgment','Daybreak Judgment','A 10m shockwave deals 320 holy damage and stuns enemies for 3s.','nova')],
 march:[path('pilgrim','Unbroken March','A healing standard follows you for 12s at 22 HP/s in 7m.','ward'),path('warcry','Conqueror’s Standard','Allies in 10m gain 35% damage and 35% attack speed for 12s.','rain')],
 reversal:[path('nova','Dawn Nova','Detonate a 12m dawn nova for 380 damage and 3s stun.','nova'),path('lance','Spear of Daylight','Launch a piercing holy spear for 580 damage through four enemies.','lance')],
 quench:[path('tide','Glacial Tide','Heal yourself for 150 and allies for 130. Freeze nearby enemies for 3s.','nova'),path('spring','Wellspring','Leave a 7m healing spring for 10s at 20 HP/s.','ward')],
 bulwark:[path('citadel','Adamant Shell','Nearby allies take 60% less damage for 12s.','ward'),path('shatter','Shatterguard','Exploding rune plates deal 280 damage in 8m and strip 20% armor for 10s.','nova')],
 overdrive:[path('siege','Siegebreaker Engine','Defenses fire 55% faster for 16s.','charge'),path('legion','Runeforged Legion','Nearby troops gain 50% attack speed for 16s.','rain')],
 mine:[path('cluster','Cinder Constellation','Plant five mines for 180 damage each across a wide fan.','rain'),path('volcano','Sleeping Volcano','One enormous trap erupts for 450 damage in 7m and burns for 24 damage/s for 6s.','nova')],
 forgefall:[path('meteor','Starfall Forge','Three delayed meteors strike the target area, each for 190 damage in 5m.','rain'),path('quake','Worldbreaker','A 12m hammer shockwave deals 400 damage and stuns for 3s.','charge')],
 sanctuary:[path('pilgrim','Traveling Sanctuary','A 7m healing sanctuary follows you for 12s at 22 HP/s.','ward'),path('bastion','Sanctified Bastion','An anchored 10m sanctuary heals 30 HP/s for 12s.','rain')],
 inferno:[path('nova','Heart of the Furnace','A 12m inferno deals 400 damage; burning ground deals 40 damage/s for 8s.','nova'),path('lance','Solar Lance','Fire a 620-damage projectile through four enemies.','lance')],
 windstep:[path('razor','Razorwind','Dash 10m; razor leaves strike nearby enemies for 150 damage.','charge'),path('ghost','Ghostleaf','Dash 10m with 2s invulnerability and restore 25 stamina.','ward')],
 thorns:[path('forest','Briar Labyrinth','Root up to 12 enemies in 9m for 5s and deal 100 damage each.','rain'),path('impale','Elderthorn Impaler','One giant thorn deals 420 damage and roots its target for 6s.','lance')],
 mark:[path('hunt','The Great Hunt','Mark up to 10 enemies within 10m for 12s: +35% hero and +25% allied damage.','rain'),path('execution','Executioner’s Eye','One target takes +65% hero and +40% allied damage for 14s.','lance')],
 guide:[path('piercer','Moonpiercer','Archers fire one 260% damage arrow through three enemies.','lance'),path('rain','Silver Arrow Rain','Archers fire four 85% damage arrows across nearby targets.','rain')],
 seedward:[path('pilgrim','Wandering Grove','A 6m grove follows you, healing 18 HP/s for 10s.','ward'),path('bramble','Bramble Sanctuary','A 7m grove heals 16 HP/s and damages enemies for 28/s over 10s.','nova')],
 briarstorm:[path('tempest','Emerald Tempest','Three thorn showers strike the target area for 180 damage each in 6m.','rain'),path('impale','Worldroot','A giant root eruption deals 360 damage in 10m and roots for 5s.','nova')],
 grove:[path('pilgrim','Heartwood Guardian','A 7m grove follows you for 12s at 22 HP/s.','ward'),path('bramble','Thornheart Grove','An anchored 10m grove heals 24 HP/s and deals 32 damage/s for 12s.','rain')],
 verdant:[path('nova','Verdant Reckoning','A 12m root eruption deals 360 damage and roots for 5s.','nova'),path('lance','Elderwood Spear','Launch a 580-damage thorn spear through four enemies.','lance')]
};
export const evolutionFor=(id,key)=>EVOLUTIONS[id]?.find(p=>p.id===key)||null;
export function abilityProfile(id,rank=1,evolution=null){
 const r=Math.max(1,Math.min(10,rank)),t=Math.max(0,r-3),e=r===10?evolutionFor(id,evolution):null;
 const p={id,rank:r,evolution:e?.id||null,pose:e?.pose||null,power:1+t*.16,radius:4+t*.3,duration:5+t*.45,damage:Math.round(140*(1+(r-1)*.16)),heal:12+(r-1)*2,protection:.3,haste:.18,bonus:0,count:1};
 switch(id){
 case 'fireball':Object.assign(p,{impact:[58,78,104][Math.min(2,r-1)]+t*22,blast:[24,32,42][Math.min(2,r-1)]+t*8,radius:[3,3.5,4][Math.min(2,r-1)]+t*.2,burn:8+(r-1)*4,duration:Math.min(6,r+2),sunder:r===1?0:Math.min(10,2+r*2)});break;
 case 'step':case 'windstep':Object.assign(p,{distance:(id==='windstep'?(r<3?5:7):(r<3?3:5))+t*.35,protection:.3+t*.015,duration:Math.min(3,r)+t*.4,bonus:r>=3?.3+t*.035:0});break;
 case 'rally':Object.assign(p,{radiusBonus:t*.5,duration:5+Math.max(0,r-2)*.6,haste:r>=2?.18+t*.015:0,bonus:r>=2?.1+t*.015:0});break;
 case 'volley':case 'guide':Object.assign(p,{count:r>=3?2:1,multiplier:r>=3?.8+t*.1:1.2+(r-1)*.15,duration:4+t*.5});break;
 case 'quench':Object.assign(p,{heal:[18,28,36][Math.min(2,r-1)]+t*12,allyHeal:20+r*8,radius:4+r*.6,duration:3+t*.3});break;
 case 'bulwark':case 'tether':Object.assign(p,{radius:6+t*.5,duration:(r>=3?6:4)+t*.55,protection:.3+t*.025});break;
 case 'overdrive':Object.assign(p,{duration:6+r*2,haste:.18+t*.025,defenseHaste:.3+t*.02});break;
 case 'mine':Object.assign(p,{count:r>=3?3:1,damage:38+r*6+t*9,radius:3+t*.2,duration:14});break;
 case 'thorns':Object.assign(p,{count:r>=3?4+Math.floor(t/2):r===2?2:1,damage:18+r*3+t*7,radius:(r>=3?4:3)+t*.35,duration:(r>=2?2.5:2)+t*.2});break;
 case 'mark':Object.assign(p,{duration:5+(r-1)*1.5,heroBonus:.2+t*.02,allyBonus:.15+t*.015});break;
 case 'seedward':Object.assign(p,{radius:4+t*.3,heal:3+r,duration:(r>=3?5:4)+t*.5});break;
 case 'sunwall':Object.assign(p,{radius:9+(r-1)*.25,damage:50+(r-1)*18,duration:8+(r-1)*.4,protection:.3+(r-1)*.025});break;
 case 'march':case 'sanctuary':case 'grove':Object.assign(p,{radius:7+(r-1)*.25,duration:8+(r-1)*.4,heal:12+(r-1)*1.5});break;
 }
 // Round UI-facing values once; runtime consumes these exact values.
 for(const key of Object.keys(p))if(typeof p[key]==='number')p[key]=Math.round(p[key]*100)/100;
 return p;
}
export function abilityStats(id,rank){const p=abilityProfile(id,rank),pct=n=>Math.round(n*100)+'%';
 switch(id){
 case 'fireball':return [['Direct damage',p.impact],['Blast damage',p.blast],['Blast radius',p.radius+'m'],['Burn',p.burn+'/s × '+p.duration+'s']];
 case 'step':case 'windstep':return [['Dash',p.distance+'m'],['Protection',pct(p.protection)],['Protection time',p.duration+'s'],['Next strike bonus',pct(p.bonus)]];
 case 'rally':return [['Added radius',p.radiusBonus+'m'],['Duration',p.duration+'s'],['Attack speed',pct(p.haste)],['Damage bonus',pct(p.bonus)]];
 case 'volley':case 'guide':return [['Shots / archer',p.count],['Damage / shot',pct(p.multiplier)],['Mark duration',p.duration+'s']];
 case 'quench':return [['Self healing',p.heal],['Troop healing',p.allyHeal],['Radius',p.radius+'m'],['Slow time',p.duration+'s']];
 case 'bulwark':case 'tether':case 'sunwall':return [['Damage reduced',pct(p.protection)],['Duration',p.duration+'s'],...(id==='sunwall'?[]:[['Applies to',rank===1?'Self':'Nearby allies']]),['Radius',p.radius+'m'],...(id==='sunwall'?[['Damage',p.damage]]:[])];
 case 'overdrive':return [['Defense fire rate',pct(p.defenseHaste)],['Troop attack speed',pct(p.haste)],['Duration',p.duration+'s']];
 case 'mine':case 'thorns':return [[id==='mine'?'Traps':'Targets',p.count],['Damage',p.damage],['Radius',p.radius+'m'],['Duration',p.duration+'s']];
 case 'mark':return [['Hero damage bonus',pct(p.heroBonus)],['Troop damage bonus',pct(p.allyBonus)],['Duration',p.duration+'s']];
 case 'seedward':case 'march':case 'sanctuary':case 'grove':return [['Healing',p.heal+' HP/s'],['Radius',p.radius+'m'],['Duration',p.duration+'s']];
 default:return [['Damage',p.damage],['Radius',(8+(rank-1)*.25)+'m'],['Burn / root time',(4+(rank-1)*.3).toFixed(1)+'s']];
 }
}
