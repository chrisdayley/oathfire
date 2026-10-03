// Body armor has one identity plus independently rolled rarity/affix and forge choices.
// Items from older saves have no armorKind and retain their original Hearthwatch stats.
export const ARMORS={
 hearth:{name:'Hearthwatch plate',role:'Balanced plate',base:12,steel:0x949f9e,cloth:0x102d34,trim:0xb59b60,lore:'The keep’s old armory still carries the marks of those who held it before you.',bonuses:{}},
 bastion:{name:'Bastion harness',role:'Hold the line',base:19,steel:0x53626c,cloth:0x192839,trim:0xb7afb0,lore:'Layered siege plate. Built for the moment the gate gives way.',bonuses:{stamina:14,guardReduction:.16,speed:-.04}},
 trail:{name:'Wayfarer leathers',role:'Mobile skirmisher',base:8,steel:0x66533b,cloth:0x30493b,trim:0x94825a,lore:'Weathered leather, quiet buckles and the green mantle of the old border scouts.',bonuses:{speed:.08,staminaRecovery:.25}},
 spellweave:{name:'Starwoven vestments',role:'Sustained spellcasting',base:6,steel:0x687787,cloth:0x292b50,trim:0xa8bacb,lore:'Silver channels carry a little of the beacon’s light back to its bearer.',bonuses:{focus:20,focusRecovery:.30}},
 ember:{name:'Cinderforged mail',role:'Fire and charged strikes',base:14,steel:0x494543,cloth:0x512c23,trim:0xb67c48,lore:'Tempered in the ruins of Emberfall. As the Ashwright, enemies killed while burning leave an ember for 6 seconds. Approach it to recover 12 health.',bonuses:{fireResistance:.25,heavyBonus:.12}},
 dawn:{name:'Dawnkeeper mantle',role:'Health and recovery',base:10,steel:0xb8b9aa,cloth:0xb4aa85,trim:0xbda161,lore:'A pale mantle worn by the healers who stayed behind when the road fell.',bonuses:{hp:24,healing:.20}},
 marshal:{name:'Marchwarden cuirass',role:'Command your army',base:11,steel:0x666758,cloth:0x552c36,trim:0xc0a16a,lore:'Its crimson standard tells the scattered living where to rally.',bonuses:{supportRadius:2,allyBonus:.10}}
};
export const ARMOR_DROPS=Object.keys(ARMORS).filter(k=>k!=='hearth');
export const armorKind=i=>i?.type==='armor'&&Object.hasOwn(ARMORS,i.armorKind)?i.armorKind:'hearth';
export const armorDefinition=i=>ARMORS[armorKind(i)];
export function armorBonuses(i){
 const b={hp:0,focus:0,stamina:0,speed:0,guardReduction:0,staminaRecovery:0,focusRecovery:0,fireResistance:0,heavyBonus:0,healing:0,supportRadius:0,allyBonus:0};
 if(i?.type!=='armor')return b;
 const scale=(1+i.rarity*.10+i.plus*.03)*(i.awakened?1.12:1);
 for(const [key,value]of Object.entries(armorDefinition(i).bonuses))b[key]=value<0?value:value*scale;
 if(i.rune==='ember')b.fireResistance+=.15;
 if(i.rune==='frost')b.stamina+=12;
 if(i.rune==='vital')b.hp+=24;
 if(i.temper==='swift')b.speed+=.05;
 if(i.temper==='sunder')b.heavyBonus+=.10;
 if(i.temper==='guard')b.guardReduction+=.15;
 for(const key of ['hp','focus','stamina'])b[key]=Math.round(b[key]);
 b.fireResistance=Math.min(.65,b.fireResistance);b.guardReduction=Math.min(.55,b.guardReduction);
 return b;
}
const pct=n=>Number((n*100).toFixed(1))+'%';
export function armorBenefits(i){const b=armorBonuses(i),lines=[];
 for(const [key,label]of [['hp','maximum health'],['focus','maximum focus'],['stamina','maximum stamina']])if(b[key])lines.push('+'+b[key]+' '+label);
 if(b.speed)lines.push((b.speed>0?'+':'−')+pct(Math.abs(b.speed))+' movement speed');
 if(b.guardReduction)lines.push('−'+pct(b.guardReduction)+' block stamina cost');
 if(b.staminaRecovery)lines.push('+'+pct(b.staminaRecovery)+' stamina recovery while not attacking or guarding');
 if(b.focusRecovery)lines.push('+'+pct(b.focusRecovery)+' focus recovery');
 if(b.fireResistance)lines.push('−'+pct(b.fireResistance)+' incoming fire damage');
 if(b.heavyBonus)lines.push('+'+pct(b.heavyBonus)+' charged weapon damage');
 if(b.healing)lines.push('+'+pct(b.healing)+' healing from draughts and your Quench spell');
 if(b.supportRadius)lines.push('+'+Number(b.supportRadius.toFixed(1))+' m command radius');
 if(b.allyBonus)lines.push('+'+pct(b.allyBonus)+' damage for troops inside your command radius');
 return lines;
}
