import {departureBlock,nextDefense,raidFor} from './war-campaign.js';
import {FINAL_FORTRESS} from './siege-rules.js';
// Campaign IDs 0–14 are stable so existing journeys continue without losing progress.
export const MAIN_COUNT=24;
export const EXTRA_LOCATIONS=[
 ['The Pale Orchard','forest','What the crown concealed','Beyond Veyr’s throne, the trees flower with stolen memories. Hold the orchard beacon while Sera follows their roots.'],
 ['Starfall Observatory','quarry','A signal from the dark','The astronomers have found a second voice beneath the broken oath. Defend their instruments and recover its coordinates.'],
 ['Saltwind Bastion','desert','The fleet comes home','A refugee fleet needs the harbor beacon. Hold the coast against the Regent’s siege batteries.'],
 ['Winterglass Pass','snow','A mountain of mirrors','The Glass Regent turns our own beacons against us. Establish a light on the pass that his mirrors cannot command.'],
 ['The Mirror Citadel','snow','The Regent of Glass','Defeat the Glass Regent and free the winter cities from his reflections.'],
 ['The Unwritten Coast','river','An army without names','The original oath was sealed beneath the sea. Hold the newly revealed coast while the tide gives us a road.'],
 ['The Cinder Stair','quarry','Every fire has a beginning','The first beacon waits above the siege terraces. Protect the climbing parties from the Host’s oldest war machines.'],
 ['The Door of Names','forest','A door that opens both ways','All the rescued voices gather here. Keep their road open against the final counterattack.'],
 ['The Last Dawn','plain','The king comes to Hearthwatch','The King’s Hand leads the last great assault on Hearthwatch. Break his six waves, then carry the war to the Obsidian Crown.']
];
export const SETTLEMENTS=[
 {name:'Willowmill',biome:'plain',title:'Bread for the road',story:'Rescue the millers and reopen the valley’s grain road.',unlockMain:0,income:28,map:[26,72],icon:'mill'},
 {name:'Reedhaven',biome:'river',title:'The lantern harbor',story:'Free the river harbor so its traders can provision Hearthwatch.',unlockMain:2,income:42,map:[43,75],icon:'port'},
 {name:'Coppergate',biome:'quarry',title:'Hammers after midnight',story:'Reclaim the miners’ market and restore the copper caravans.',unlockMain:5,income:62,map:[57,59],icon:'city'},
 {name:'Whitepine',biome:'snow',title:'A hearth beneath the snow',story:'Break the winter blockade and bring the mountain families home.',unlockMain:8,income:80,map:[41,29],icon:'city'},
 {name:'Sunspire',biome:'desert',title:'The caravans return',story:'Rescue the oasis city and its golden road through the dunes.',unlockMain:11,income:102,map:[79,61],icon:'city'},
 {name:'Briarhaven',biome:'forest',title:'A garden worth defending',story:'Free the woodland refuge. Its herbalists will support each expedition.',unlockMain:14,income:126,map:[37,44],icon:'mill'},
 {name:'Greywake',biome:'river',title:'Sails on the horizon',story:'Reopen the coastal shipyards under the Regent’s siege.',unlockMain:17,income:152,map:[78,37],icon:'port'},
 {name:'Dawnmere',biome:'snow',title:'The city that remembers',story:'Rescue the last northern city and unite its people behind the first ember.',unlockMain:20,income:180,map:[69,20],icon:'city'}
];
const POS=[[19,76],[33,70],[48,60],[32,55],[22,48],[62,69],[53,74],[45,20],[22,33],[76,71],[26,58],[52,50],[65,60],[59,23],[60,39],[39,50],[52,36],[82,54],[66,30],[77,26],[82,41],[72,47],[79,18],[89,11]];
const INTRO={0:'hollow',1:'archer',2:'runner',3:'knight',5:'bomber',6:'herald',7:'longbow',8:'brute',10:'bulwark',12:'mender',14:'mage',16:'reaver',18:'mortar',20:'wraith',22:'warpriest'};
export const ENEMY_INTEL={
 hollow:'Infantry · modest health, vulnerable to flanking.',archer:'Briar goblin archers · block their arrows and close the distance.',runner:'Raven goblin scouts · rush past the front. Pikeguard and slows stop them.',knight:'Ironjaw orc knights · armored melee. Charged strikes strip their guard.',bomber:'Cinder goblin sappers · lob timed bombs at a marked location. Leave the orange circle before detonation.',herald:'Red-banner orc heralds · nearby enemies gain damage and speed. Hunt the banner bearer first.',longbow:'Blackfeather goblin hunters · long range, slow powerful arrows. Use cover and rush between shots.',brute:'Kiln ogre wallbreakers · heavy armor and large health pools. Focus ballistae and armor piercing troops.',bulwark:'Ironhide ogre bulwarks · front shields absorb most direct hits. Flank them or break the guard with a charged attack.',mender:'Mossback troll menders · heal injured enemies every six seconds. Separate them from their escort.',mage:'Grave callers · cold bolts slow your movement. Keep your distance from the front line.',reaver:'Bloodscar orc reavers · become faster and strike harder below half health. Finish one before wounding the next.',mortar:'Bombard ogres · bombard large areas from long range. Dodge the red warning rings and attack the crew.',wraith:'Mirror wraiths · briefly phase toward nearby targets. Their violet arrival ring reveals the landing.',warpriest:'Hex-crowned troll warpriests · protect and heal an escort. Kill the priest to collapse its formation.'};
export function decorateMissions(locations){return [...locations,...EXTRA_LOCATIONS].map(([name,biome,title,story],id)=>{const act=1+Math.floor(id/5),boss=[4,9,14,19,23].includes(id),bossIndex=[4,9,14,19,23].indexOf(id);return {id,name,originBiome:biome,biome:'plain',title,story,kind:'main',mode:'defense',act:Math.min(5,act),boss,bossName:['The Bell Knight','The Ash Castellan','Marshal Veyr','The Glass Regent','The King’s Hand'][bossIndex],bossMusic:['bell','castellan','veyr','regent','hollow'][bossIndex],waves:id<5?3:id<10?4:id<18?5:6,reward:180+id*55,xp:115+id*32,scale:id<6?.85+id*.07:id<10?1.25+(id-6)*.105:1.7+(id-10)*.105,seed:7919,map:POS[id],introduced:INTRO[id]||null,recommended:Math.min(10,1+Math.floor(id/2.5))};}).concat(SETTLEMENTS.map((m,i)=>({...m,id:MAIN_COUNT+i,kind:'settlement',mode:'siege',act:Math.min(5,1+Math.floor(m.unlockMain/5)),boss:false,waves:6,reward:220+i*70,xp:130+i*60,scale:1+m.unlockMain*.085,seed:90217+i*3511,recommended:Math.min(10,2+i)}))).concat([{id:FINAL_FORTRESS,name:'The Obsidian Crown',biome:'quarry',title:'Break the throne of the dead',story:'Storm the Hollow King’s mountain fortress. Break the iron gate, silence the ember bastions, and shatter the dread keep before its armies overwhelm your expedition.',kind:'fortress',mode:'siege',act:5,boss:true,bossName:'The Hollow King',bossMusic:'hollow',waves:6,reward:1900,xp:1250,scale:3.25,seed:188731,map:[91,27],recommended:10,icon:'fortress'}]).concat(SETTLEMENTS.map((m,i)=>({...m,id:33+i,town:24+i,name:'Relieve '+m.name,kind:'relief',mode:'relief',act:Math.min(5,1+Math.floor(m.unlockMain/5)),boss:false,waves:m.unlockMain<10?2:3,reward:100+i*30,xp:100+i*35,scale:1+m.unlockMain*.075,seed:90217+i*3511,recommended:Math.min(10,2+i),title:'Break the invading army',story:'The Hollow Host is closing on '+m.name+'. Destroy every attacking wave before its beacon falls.'})));}
export function missionWon(s,m){if(m.kind==='relief')return false;return (m.kind==='settlement'?s.settlements||[]:m.kind==='fortress'?s.fortresses||[]:s.completed).includes(m.id);}
export function missionUnlocked(s,m){if(!m||departureBlock(s,m))return false;if(m.kind==='relief')return !!raidFor(s,m.town);if(m.id===FINAL_FORTRESS)return s.completed.length===24&&(s.settlements||[]).length===8&&!(s.war?.raids.length);if(missionWon(s,m))return true;if(m.kind==='settlement')return s.completed.includes(m.unlockMain);return m.id===0||s.completed.includes(m.id-1);}
export function missionLockReason(s,m){const blocked=departureBlock(s,m);if(blocked)return blocked;if(m.id===32)return 'Required: 24 defenses, all 8 towns held, no active invasions.';if(m.kind==='relief')return 'No invading army here.';return m.kind==='settlement'?'Complete Hearthwatch assault '+(m.unlockMain+1)+' to reveal this route.':'Complete the previous Hearthwatch assault.';}
export function nextCampaignMission(s,missions){const defense=nextDefense(s),raids=[...(s.war?.raids||[])].sort((a,b)=>a.deadline-b.deadline);if(defense!==undefined&&departureBlock(s,{id:-1}))return missions[defense];if(raids.length)return missions[raids[0].town+9];const town=missions.find(m=>m.kind==='settlement'&&!missionWon(s,m)&&missionUnlocked(s,m));if(town)return town;if(defense!==undefined)return missions[defense];return missions[32];}
export function territoryIncomeSources(s){return [...new Set(s.settlements||[])].sort((a,b)=>a-b).filter(id=>SETTLEMENTS[id-MAIN_COUNT]).map(town=>({town,amount:SETTLEMENTS[town-MAIN_COUNT].income}));}
export function territoryIncome(s){return territoryIncomeSources(s).reduce((n,row)=>n+row.amount,0);}
export function missionRoster(m,wave=1){
 const stage=['settlement','relief'].includes(m.kind)?m.unlockMain+1:m.kind==='fortress'?23:m.id,unlocked=Object.entries(INTRO).filter(([id])=>Number(id)<=stage).map(([,type])=>type),latest=unlocked.at(-1);
 const base=stage<6?7+Math.floor(stage*.5):stage<10?10+Math.floor((stage-6)*1.5):16+Math.floor((stage-10)*.65),count=Math.min(58,Math.ceil(base*(1+(wave-1)*(stage<6?.65:.36)))),roster=[];
 const cap=type=>['herald','mender','warpriest','mortar'].includes(type)?2:type==='brute'?3:Infinity;let rotation=wave-1;
 for(let i=0;i<count;i++){
  let type=i%4===0?'hollow':i%4===1&&m.introduced?latest:unlocked[rotation++%unlocked.length];
  if(roster.filter(t=>t===type).length>=cap(type)){const available=unlocked.filter(t=>roster.filter(v=>v===t).length<cap(t));type=available[(i+wave)%available.length]||'hollow';}
  roster.push(type);
 }
 if(m.introduced)roster[Math.min(1,roster.length-1)]=m.introduced;
 return roster;
}
export const waveReady=(mission,battle,alive)=>battle.wave<mission.waves&&battle.nextWave<=0&&alive===0&&(!battle.assault||battle.assault.cursor>=battle.assault.entries.length);
export function rosterIntel(m){return [...new Set(missionRoster(m,1))].filter(t=>t!=='hollow').map(t=>ENEMY_INTEL[t]);}

export const REGIONAL_LOOT={plain:['dawnfang','oathbell'],river:['tidecaller','stormlance'],forest:['briarthorn','pyrecrown'],quarry:['faultbreaker','emberbrand'],snow:['rimespire','starsong'],desert:['emberbrand','stormlance']};
