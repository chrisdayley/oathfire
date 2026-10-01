// Stable equipment identities: the same definition drives held models, inspection and combat.
export const WEAPON_PATTERNS={
 hearthblade:{type:'sword',name:'Hearthwatch longsword',shape:0,color:0x94a8ad,trim:0xa68e61,lore:'A dependable blade carried by the old bridge watch.'},
 emberbrand:{type:'sword',name:'Emberbrand',shape:1,color:0x656572,trim:0xd0a06a,glow:0xf88b35,power:'kindle',title:'Cinder Wake',lore:'Its split fuller holds a spark of the recovered foundry.'},
 dawnfang:{type:'sword',name:'Dawnfang',shape:2,color:0xd0d6cb,trim:0xdfc581,glow:0xffe4a0,power:'dawn',title:'Mercy of the Dawn',lore:'A winged crossguard frames the pale blade of the Lantern Order.'},
 watchpike:{type:'spear',name:'Bridgewatch partisan',shape:0,color:0xa6ada9,trim:0xa88b5c,lore:'Long enough to keep a gate clear.'},
 rimespire:{type:'spear',name:'Rimespire',shape:1,color:0xb0d6e0,trim:0x7595b3,glow:0x91dbed,power:'rime',title:'Winter’s Reach',lore:'A fork of blue frostglass, recovered from the silent lake.'},
 stormlance:{type:'spear',name:'Stormlance',shape:2,color:0x8ba2c3,trim:0xd1bd75,glow:0x9ab9ff,power:'storm',title:'Threefold Thunder',lore:'Copper prongs cradle the storm that once shattered Westwind.'},
 forgehammer:{type:'hammer',name:'Torren’s war maul',shape:0,color:0x8e9490,trim:0xb99259,lore:'Stone breaks. The promise holds.'},
 faultbreaker:{type:'hammer',name:'Faultbreaker',shape:1,color:0x555e57,trim:0xd19b61,glow:0xf5ae63,power:'quake',title:'Stonewake',lore:'A serrated basalt hammer with a furnace seam at its heart.'},
 oathbell:{type:'hammer',name:'Oathbell',shape:2,color:0x8b9c93,trim:0xd8be79,glow:0xe4cf8a,power:'ward',title:'The Sheltering Bell',lore:'Forged from the first captain’s broken bell.'},
 ashbow:{type:'bow',name:'Greenwood longbow',shape:0,color:0x7d7754,trim:0xb0a474,lore:'A quiet curve of seasoned greenwood.'},
 briarthorn:{type:'bow',name:'Briarthorn',shape:1,color:0x769274,trim:0xb49c68,glow:0xa1d38a,power:'root',title:'The Forest Answers',lore:'Living branches curl around the hand that draws it.'},
 starsong:{type:'bow',name:'Starsong',shape:2,color:0x879dbd,trim:0xd0d7da,glow:0xaebfff,power:'pierce',title:'Starfall Arrow',lore:'Silver crescent limbs guide an arrow through a crowded front.'},
 pilgrimstaff:{type:'staff',name:'Pilgrim’s rune staff',shape:0,color:0x8a8168,trim:0xc3ad78,lore:'The first ember warms every pilgrim’s hand.'},
 pyrecrown:{type:'staff',name:'Pyrecrown',shape:1,color:0x776256,trim:0xc99251,glow:0xff863c,power:'nova',title:'Crown of Embers',lore:'Three burning shards orbit a crown of dark copper.'},
 tidecaller:{type:'staff',name:'Tidecaller',shape:2,color:0x7ba4af,trim:0xc0d0c1,glow:0x8ce1e1,power:'tide',title:'Returning Tide',lore:'An opal lens carries the sound of a river coming home.'}
};
export const DEFAULT_PATTERNS={sword:'hearthblade',spear:'watchpike',hammer:'forgehammer',bow:'ashbow',staff:'pilgrimstaff'};
export function weaponPattern(i){return WEAPON_PATTERNS[i?.weaponPattern]||WEAPON_PATTERNS[DEFAULT_PATTERNS[i?.type]]||WEAPON_PATTERNS.hearthblade;}
export function rollWeaponPattern(type,level,rarity,rand=Math.random){const list=Object.entries(WEAPON_PATTERNS).filter(([,p])=>p.type===type);return list[level>=4||rarity>=2?1+Math.min(1,Math.floor(rand()*2)):0]?.[0];}
export function weaponPower(i){const d=weaponPattern(i);if(!d.power)return null;const active=(i.level>=5&&i.rarity>=2)||i.plus>=6,scale=1+i.plus*.045+i.rarity*.06,damage=Math.round(22*scale),heal=Math.round(12*scale),cooldown=10;
 const descriptions={kindle:'Charged hits release a 3m fire burst for '+damage+' damage and ignite the target for 3s.',dawn:'Charged hits heal you and allies within 5m for '+heal+' health.',rime:'Charged hits root enemies within 3m for 2.5s and deal '+damage+' frost damage.',storm:'Charged hits arc to up to three nearby enemies for '+damage+' lightning damage each.',quake:'Charged hits create a 5m shockwave for '+damage+' damage and stagger enemies.',ward:'Charged hits grant you and allies within 6m 30% protection for 4s.',root:'Charged arrows root the target and enemies within 3m for 2.5s.',pierce:'Charged arrows ignore armor and strike up to two enemies behind the first for '+damage+' damage.',nova:'Casting a technique releases a 4m fire nova at your aim point for '+damage+' damage.',tide:'Casting a technique heals you and allies within 6m for '+heal+' health and returns 4 focus.'};
 return {id:d.power,title:d.title,active,damage,heal,cooldown,description:descriptions[d.power],requirement:'Active at item level 5 + Rare quality, or Forge +6.'};
}
