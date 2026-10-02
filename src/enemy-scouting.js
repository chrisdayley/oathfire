import {ENEMIES,MISSIONS} from './data.js';
import {missionRoster,missionWon} from './campaign.js';
export const ENEMY_GUIDE={
 hollow:['Line infantry','Slow melee soldiers advance on your gate.','Shieldwards hold them; archers and sweeping attacks clear groups.'],
 archer:['Ranged infantry','Fires physical arrows from behind the front line.','Block or use cover, then close the gap. Wall archers outrange them.'],
 runner:['Fast flanker','Much faster than ordinary infantry; reaches exposed archers quickly.','Keep Shieldwards in front and use roots or frost to stop the rush.'],
 knight:['Armored infantry','Armor reduces ordinary physical hits.','Use charged melee strikes and focus one knight at a time. Keep archers behind your Shieldwards.'],
 bomber:['Area bombardment','Marks a blast circle, then throws an explosive bomb.','Leave the orange marker. Spread troops and hunt the bomber.'],
 herald:['Army buffer','A 9 m aura increases nearby enemies’ damage and speed.','Kill the banner bearer before fighting its escort.'],
 longbow:['Wall hunter','Powerful long-range arrows; prioritizes exposed wall troops.','Shield the approach and charge the archer between its slow shots.'],
 brute:['Siege tank','Large health and armor; threatens the gate in melee.','Pikeguard and siege crews deal bonus damage to it.'],
 bulwark:['Shield tank','Frontal shields block 70% of normal hits.','Flank its shield or use a charged attack to break its armor.'],
 mender:['Enemy healer','Every 6 s heals up to two nearby injured allies.','Focus the healer first; do not spread damage across its escort.'],
 mage:['Frost caster','Ranged cold bolts slow you for 2 s.','Dodge bolts, use cover and send fast troops into its back line.'],
 reaver:['Berserker','Below half health it gains attack damage and attack speed.','Finish one quickly; avoid leaving several wounded reavers alive.'],
 mortar:['Siege artillery','Long-range shells mark a wide blast zone; can strike the wall.','Move out of the red circle. Cavalry and assassins reach the crew.'],
 wraith:['Blink attacker','Teleports toward a nearby target after a violet warning.','Watch its landing ring, then block or move before it arrives.'],
 warpriest:['Protected healer','Protects nearby enemies and heals three allies every 6 s.','Focus the priest to remove both its healing and protection.'],
 boss:['Fallen commander','A heavily armored captain arrives with the final wave.','Bring Pikeguard and a Lanternkeeper. Avoid heavy strikes and save Command for reinforcements.']
};
export const bossDesign=m=>m.id===23?'hollowking':m.id===19?'regent':m.id===14?'veyr':m.id===9?'castellan':'bell';
export function missionEnemies(m){const types=[...new Set(Array.from({length:m.waves},(_,i)=>missionRoster(m,i+1)).flat())];if(m.boss)types.push('boss');return types;}
export function scoutCards(s,m){const known=new Set(s.enemyIntel||[]);for(const past of MISSIONS)if(missionWon(s,past))for(const type of missionEnemies(past))known.add(type==='boss'?bossDesign(past):type);
 return missionEnemies(m).map(type=>{const base=ENEMIES[type],boss=type==='boss',design=boss?bossDesign(m):type,wave=boss?m.waves:1,power=1+(wave-1)*.18;return {type,design,new:!known.has(design),name:boss?m.bossName:base.name,model:base.model,weapon:boss?(m.id===14?'sword':m.id===9?'hammer':'spear'):base.weapon,scale:base.scale||1,hp:Math.round(base.hp*m.scale*power),damage:Math.round(base.damage*(.8+m.scale*.2)*(1+(wave-1)*.1)),armor:base.armor||0,range:base.range,guide:ENEMY_GUIDE[type]};}).sort((a,b)=>Number(b.new)-Number(a.new));}
