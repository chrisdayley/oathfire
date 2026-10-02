import {WEAPONS,AFFIXES} from './data.js';
import {weaponPattern} from './weapon-patterns.js';
import {armorDefinition} from './armor.js';

export function equipmentName(item){
 if(!item)return 'Empty slot';
 const name=typeof item.name==='string'?item.name.trim():'';
 if(name&&!['undefined','null'].includes(name))return name;
 const base=item.type==='armor'?armorDefinition(item).name:WEAPONS[item.type]?weaponPattern(item).name:item.type==='shield'?'Oath shield':'Beacon relic';
 return (AFFIXES[item.affix]?AFFIXES[item.affix].name+' ':'')+base;
}
