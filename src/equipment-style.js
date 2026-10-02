import {weaponPattern,weaponPower} from './weapon-patterns.js';

export const EQUIPMENT_TIERS=[
 {name:'Common',rank:1,length:.92,width:.88,metal:0x737a79,trim:0x655e50,roughness:.88},
 {name:'Uncommon',rank:2,length:1,width:.98,metal:0x89938e,trim:0x92836a,roughness:.72},
 {name:'Rare',rank:4,length:1.08,width:1.08,metal:0xa4bbc8,trim:0xb9bdc4,roughness:.50},
 {name:'Epic',rank:6,length:1.17,width:1.18,metal:0x455477,trim:0xc5a87c,roughness:.42},
 {name:'Legendary',rank:8,length:1.30,width:1.32,metal:0x364651,trim:0xe3b65c,roughness:.33},
 {name:'Mythic',rank:9,length:1.50,width:1.47,metal:0x2b334e,trim:0xc3cced,roughness:.28,glow:0x70dfff},
 {name:'Godly',rank:10,length:1.72,width:1.62,metal:0xe4e6dc,trim:0xf4cb6b,roughness:.25,glow:0xffdc80}
];
export const itemTier=i=>Math.max(0,Math.min(6,i?.rarity||0));
export const equipmentStyle=i=>({...EQUIPMENT_TIERS[itemTier(i)],tier:itemTier(i)});
export const MAGIC_COLORS={fire:0xff702a,frost:0x79e1ff,storm:0xa7a4ff,nature:0x70ed97,holy:0xffdc84,arcane:0xcf8bff,vampiric:0xe33a72,water:0x63dfd4,earth:0xffb663,wind:0xc4f3fa};
const runeElements={ember:'fire',frost:'frost',vital:'nature'},powerElements={kindle:'fire',dawn:'holy',rime:'frost',storm:'storm',quake:'earth',ward:'holy',root:'nature',pierce:'arcane',nova:'fire',tide:'water'},affixElements={ember:'fire',vampiric:'vampiric',focus:'arcane',vital:'nature',command:'holy',guard:'holy',swift:'wind',sunder:'earth'};
// Socketed magic is dominant; a second channel preserves the identity of an active named power.
export function equipmentMagic(i){
 if(!i)return [];
 const power=weaponPower(i),effects=[runeElements[i.rune],power?.active?powerElements[power.id]:null,affixElements[i.affix],affixElements[i.temper]];
 if(i.type==='staff')effects.push(powerElements[weaponPattern(i).power]||'arcane');
 return [...new Set(effects.filter(Boolean))].slice(0,2).map(element=>({element,color:MAGIC_COLORS[element]}));
}
const CLOTH={
 hearth:[0x544c40,0x394951,0x244777,0x672d55,0x792f40,0x29274d,0xe9ddbd],
 bastion:[0x4c4742,0x37434d,0x243955,0x432f52,0x652735,0x152d49,0x203c74],
 trail:[0x594b36,0x465637,0x215d51,0x244f66,0x143d31,0x152d3b,0xe7dfb9],
 spellweave:[0x554e59,0x4c4863,0x383b80,0x663183,0x482856,0x291f54,0xddd4e9],
 ember:[0x534332,0x70422e,0x842f25,0x632336,0x7f2824,0x322033,0xebe1c1],
 dawn:[0x655b45,0x847359,0x547887,0x797193,0xbda57a,0x526186,0xf0e6cf],
 marshal:[0x594936,0x6b463c,0x763849,0x642e58,0x9a293d,0x482550,0x803445]
};
export function armorStyle(i){const s=equipmentStyle(i),kind=i?.armorKind||'hearth';return {...s,kind,cloth:(CLOTH[kind]||CLOTH.hearth)[s.tier],glow:s.tier>=5?({ember:MAGIC_COLORS.fire,trail:MAGIC_COLORS.nature,spellweave:s.tier===6?0xe7b8ff:MAGIC_COLORS.arcane,dawn:MAGIC_COLORS.holy,bastion:MAGIC_COLORS.frost,marshal:MAGIC_COLORS.holy}[kind]||s.glow):null};}
// A rare endgame roll upgrades a reward; early campaigns retain their original loot odds.
export function exaltedRarity(save,roll,floor=0){const cleared=save.completed.length;return Math.max(floor,cleared>=20&&roll>=.998?6:cleared>=12&&roll>=.985?5:roll>(cleared>=12?.95:.99)?4:roll>.91?3:roll>.67?2:roll>.28?1:0);}
