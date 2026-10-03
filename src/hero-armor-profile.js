export function heroArmorProfile(c){
 if(c.enemy||!['warden','ashwright','ranger'].includes(c.design))return null;
 const rarity=Math.max(0,Math.min(6,c.armor?.rarity||0));
 return {rarity,helmet:true,sleeves:rarity>=4,plate:rarity>=5,cape:true,capeLength:rarity>=4?1.44:rarity>=2?1.36:1.24};
}
