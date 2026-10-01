import {ARMORS,ARMOR_DROPS,armorBonuses} from './armor.js';
import {NEW_UNITS,NEW_DEFENSES,DEFAULT_LAYOUT} from './roster.js';
import {HEROES,UNITS,DEFENSES,WEAPONS,FORGE,RARITIES,AFFIXES,MISSIONS,clamp,unitCost} from './data.js';
export const SAVE_KEY='oathfire.campaign.v1';
const copy=o=>JSON.parse(JSON.stringify(o));
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
export function makeItem(type='sword',rarity=0,level=1,rand=Math.random,armorKind){
 const affixes=Object.keys(AFFIXES),affix=rarity>0?affixes[Math.floor(rand()*affixes.length)]:null;
 if(type==='armor'){armorKind??=ARMOR_DROPS[Math.floor(rand()*ARMOR_DROPS.length)];if(!Object.hasOwn(ARMORS,armorKind))throw Error('Unknown armor pattern');}
 const base=WEAPONS[type]?.damage|| (type==='armor'?ARMORS[armorKind].base:type==='shield'?9:8);
 const roll=.94+rand()*.15;
 return {id:uid(),type,...(type==='armor'?{armorKind}:{}),rarity,level:clamp(level,1,30),plus:0,base:Math.round(base*roll*(1+Math.min(level-1,20)*.022)),affix,rune:null,temper:null,awakened:false,name:(affix?AFFIXES[affix].name+' ':'')+({armor:ARMORS[armorKind]?.name,shield:'Oath shield',relic:'Beacon relic'}[type]||WEAPONS[type].name)};
}
export function newSave(hero='warden'){
 const inventory=['sword','spear','bow','hammer','staff','armor','shield','relic'].map(type=>makeItem(type,0,1,()=>.4,'hearth'));
 const heroes=Object.fromEntries(Object.entries(HEROES).map(([id,h])=>[id,{level:1,xp:0,questPoints:0,skills:{},capstone:null,slots:[...h.starter],equipped:{weapon:inventory.find(i=>i.type===h.weapon).id,armor:inventory[5].id,shield:inventory[6].id,relic:inventory[7].id},form:'mobile'}]));
 return {version:1,rosterVersion:2,guide:{active:true,done:[],seen:[],distance:0},defenseLayout:[...DEFAULT_LAYOUT],created:Date.now(),updated:Date.now(),hero,heroes,supplies:360,salvage:35,potions:3,units:Object.fromEntries(Object.keys(UNITS).map(k=>[k,1])),defenses:Object.fromEntries(Object.keys(DEFENSES).map(k=>[k,1])),doctrines:{shield:'sentinel',tower:'longwatch',ballista:'piercing'},inventory,completed:[],treasures:[],deeds:[],visits:[],journal:['The ember survived. Hearthwatch is yours to defend.'],settings:{volume:.55,music:.28,quality:'auto',sensitivity:1,shake:.4,firstPerson:false,showHints:true,leftHanded:false},battle:null,position:{x:0,y:0,z:9},timePlayed:0,kills:0,bestCombo:0,ending:null};
}
export function heroData(s){return s.heroes[s.hero];}
export function skillRank(s,id){return heroData(s).skills[id]||0;}
export function skillSpent(s,tree){const h=heroData(s);return HEROES[s.hero].skills.filter(n=>!tree||n.tree===tree).reduce((v,n)=>v+(h.skills[n.id]||0)*(n.cost||1),0);}
export function skillPoints(s){const h=heroData(s);return h.level-1+h.questPoints-skillSpent(s);}
export function skillGate(s,id){const n=HEROES[s.hero].skills.find(x=>x.id===id),h=heroData(s);if(!n)return 'Unknown technique';if(skillRank(s,id)>=n.max)return 'Fully trained';if(h.level<(n.level||(n.parent?5:2)))return 'Requires hero level '+(n.level||(n.parent?5:2));if(n.parent&&skillRank(s,n.parent)<2)return 'Requires '+HEROES[s.hero].skills.find(x=>x.id===n.parent).name+' II';if(n.gate&&skillSpent(s,n.tree)<n.gate)return 'Requires '+n.gate+' points in '+HEROES[s.hero].trees[n.tree];if(skillPoints(s)<(n.cost||1))return 'Earn another skill point';return null;}
export function equipped(s,slot='weapon'){return s.inventory.find(i=>i.id===heroData(s).equipped[slot]);}
export function itemValue(i){if(!i)return 0;return Math.round(i.base*RARITIES[i.rarity].mult*FORGE[i.plus]*(i.awakened?1.12:1));}
export function heroStats(s){
 const h=heroData(s),base=HEROES[s.hero],items=Object.values(h.equipped).map(id=>s.inventory.find(i=>i.id===id)).filter(Boolean),has=a=>items.filter(i=>i.affix===a).length;
 const weapon=equipped(s),armor=equipped(s,'armor'),r=skillRank(s,'body'),l=skillRank(s,'lore'),a=armorBonuses(armor);
 return {hp:base.hp+(h.level-1)*4+[0,18,34,48,60,70][r]+has('vital')*24+a.hp,focus:base.focus+[0,6,11,15,18,20][l]+has('focus')*15+Math.floor(itemValue(equipped(s,'relic'))*.5)+a.focus,stamina:100+(r>=3?10:0)+Math.floor(itemValue(equipped(s,'shield'))*.4)+a.stamina,armor:base.armor+itemValue(armor),damage:Math.round(itemValue(weapon)*(skillRank(s,'burden')? .85:1)),weapon:weapon?.type||base.weapon,speed:(5.2+(s.hero==='ranger'?.4:0))*(1+a.speed),attackSpeed:has('swift')||weapon?.temper==='swift'?1.1:1,guardCost:(has('guard')||weapon?.temper==='guard'?.8:1)*(1-a.guardReduction),healFactor:(skillRank(s,'borrowed')?.7:1)*(1+a.healing),supportRadius:[5,6,7,7.5,8,8.5][skillRank(s,'presence')]+a.supportRadius,focusRegen:3.5*(1+a.focusRecovery),staminaRegen:18*(1+a.staminaRecovery),fireResistance:a.fireResistance,heavyBonus:a.heavyBonus,allyBonus:a.allyBonus,affixes:items.map(i=>i.affix).filter(Boolean)};
}
export function xpToNext(level){return Math.round(90+level*32+level*level*3);}
export function grantXP(s,amount){const h=heroData(s);h.xp+=Math.max(0,amount);let gained=0;while(h.level<30&&h.xp>=xpToNext(h.level)){h.xp-=xpToNext(h.level);h.level++;gained++;}if(h.level===30)h.xp=Math.min(h.xp,xpToNext(30));return gained;}
export function campaignCap(s){return s.completed.length>=10?10:s.completed.length>=5?7:5;}
export function unitUnlocked(s,id){return s.completed.length>=UNITS[id].unlock;}
export function upgradeUnit(s,id){if(!UNITS[id]||!unitUnlocked(s,id))throw Error('Complete '+UNITS[id]?.unlock+' campaign victories to unlock this regiment.');let r=s.units[id];if(r>=10)throw Error('This regiment is fully trained.');if(r>=campaignCap(s))throw Error('Reclaim the next act to unlock further training.');const cost=unitCost(id,r);if(s.supplies<cost)throw Error('Not enough Supplies.');s.supplies-=cost;s.units[id]++;return s.units[id];}
export function defenseUnlocked(s,id){return !!DEFENSES[id]&&s.completed.length>=(DEFENSES[id].unlock||0);}
export function setEmplacement(s,slot,id){if(s.battle)throw Error('Refit defenses at Hearthwatch.');if(!Number.isInteger(slot)||slot<0||slot>3||id==='gate'||!defenseUnlocked(s,id))throw Error('That emplacement or defense is not available.');s.defenseLayout[slot]=id;}
export function upgradeDefense(s,id){if(!DEFENSES[id])throw Error('Unknown defense');if(!defenseUnlocked(s,id))throw Error('Reclaim '+DEFENSES[id].unlock+' castles to recover these plans.');let r=s.defenses[id];if(r>=10)throw Error('This defense is fully built.');if(r>=campaignCap(s))throw Error('Reclaim the next act to unlock further construction.');const cost=DEFENSES[id].costs[r-1];if(s.supplies<cost)throw Error('Not enough Supplies.');s.supplies-=cost;s.defenses[id]++;return s.defenses[id];}
export function trainSkill(s,id){const g=skillGate(s,id);if(g)throw Error(g);const h=heroData(s),n=HEROES[s.hero].skills.find(x=>x.id===id);h.skills[id]=(h.skills[id]||0)+1;if(n.capstone){h.capstone=id;h.slots=h.slots.map((k,i)=>HEROES[s.hero].skills.find(n=>n.id===k)?.capstone&&k!==id?HEROES[s.hero].starter[i]:k);}return h.skills[id];}
export function forgeCost(item){return {supplies:35+item.plus*30+item.rarity*12,salvage:5+item.plus*3};}
export function forgeItem(s,id){const i=s.inventory.find(x=>x.id===id);if(!i)throw Error('Item not found');if(i.plus>=10)throw Error('Fully forged');const c=forgeCost(i);if(s.supplies<c.supplies||s.salvage<c.salvage)throw Error('You need more Supplies or Salvage.');s.supplies-=c.supplies;s.salvage-=c.salvage;i.plus++;if(i.plus===10&&s.completed.length>=10)i.awakened=true;return i;}
export function setRune(s,id,rune){const i=s.inventory.find(x=>x.id===id);if(!i||i.plus<3)throw Error('Forge to +3 to unlock a rune socket.');if(!['ember','frost','vital'].includes(rune))throw Error('Unknown rune');if(s.salvage<8)throw Error('Requires 8 Salvage.');if(i.rune===rune)throw Error('That rune is already equipped.');s.salvage-=8;i.rune=rune;}
export function setTemper(s,id,temper){const i=s.inventory.find(x=>x.id===id);if(!i||i.plus<6)throw Error('Forge to +6 to choose a temper.');if(!['swift','sunder','guard'].includes(temper))throw Error('Unknown temper');if(s.salvage<15)throw Error('Requires 15 Salvage.');s.salvage-=15;i.temper=temper;}
export function equipItem(s,id){const i=s.inventory.find(x=>x.id===id);if(!i)throw Error('Item not found');const slot=WEAPONS[i.type]?'weapon':i.type;heroData(s).equipped[slot]=id;}
export function salvageItem(s,id){const i=s.inventory.find(x=>x.id===id);if(!i)throw Error('Item not found');if(Object.values(s.heroes).some(h=>Object.values(h.equipped).includes(id)))throw Error('Unequip this item from every hero before salvaging it.');s.salvage+=4+i.rarity*5+i.plus*3;s.supplies+=10+i.rarity*15;s.inventory=s.inventory.filter(x=>x.id!==id);}
export function lootRoll(s,quality=0,rand=Math.random,forcedType=null){const n=rand(),rarity=clamp(n>.99?4:n>.91?3:n>.67?2:n>.28?1:0,quality,4);const types=['sword','spear','hammer','bow','staff','armor','armor','armor','shield','relic'];const i=makeItem(forcedType||types[Math.floor(rand()*types.length)],rarity,heroData(s).level,rand);if(s.inventory.length>=160){s.salvage+=6+rarity*5;return null;}s.inventory.push(i);return i;}
export function claimTreasure(s,id,quality=1){if(s.treasures.includes(id))throw Error('This treasure has already been collected.');s.treasures.push(id);s.supplies+=65+quality*20;s.salvage+=12+quality*5;const item=lootRoll(s,quality);const h=heroData(s);if(s.treasures.length%3===0&&h.questPoints<6)h.questPoints++;s.journal.push('Discovered '+id.replaceAll('-',' ')+'.');return item;}
export function completeMission(s,id){const m=MISSIONS[id];if(!m)throw Error('Unknown expedition');const first=!s.completed.includes(id);if(first)s.completed.push(id);if(s.completed.length>=10)for(const i of s.inventory)if(i.plus===10)i.awakened=true;s.supplies+=first?m.reward:Math.round(m.reward*.55);s.salvage+=first?25+id*3:15;grantXP(s,m.xp);const item=lootRoll(s,m.boss?3:first?1:0,Math.random,first&&id===0?'armor':null);if(first&&m.boss){const h=heroData(s);h.questPoints=Math.min(6,h.questPoints+1);}if(first)s.journal.push(m.name+' reclaimed. '+m.story);s.battle=null;if(id===14)s.ending='The fallen are free. The ember belongs to the living.';return {first,item,reward:first?m.reward:Math.round(m.reward*.55)};}
export function migrateSave(s){
 // Only add the newly introduced fields. Invalid old ranks still fail validation.
 if(s?.version===1&&s.rosterVersion===undefined){
  if(s.units)for(const id of Object.keys(NEW_UNITS))if(s.units[id]===undefined)s.units[id]=1;
  if(s.defenses)for(const id of Object.keys(NEW_DEFENSES))if(s.defenses[id]===undefined)s.defenses[id]=1;
  s.defenseLayout=[...DEFAULT_LAYOUT];s.guide={active:!s.battle&&s.completed?.length===0,done:[],seen:[],distance:0};s.rosterVersion=2;
 }
 return s;
}
export function validateSave(s){
 migrateSave(s);
 if(!s||s.version!==1||!HEROES[s.hero]||!Array.isArray(s.inventory)||s.inventory.length>160)throw Error('This is not a compatible Oathfire save.');
 for(const k of ['supplies','salvage','potions','kills','timePlayed'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1e8)throw Error('Invalid campaign resource.');
 for(const [k,u]of Object.entries(UNITS))if(!Number.isInteger(s.units?.[k])||s.units[k]<1||s.units[k]>10)throw Error('Invalid regiment rank.');
 for(const k of Object.keys(DEFENSES))if(!Number.isInteger(s.defenses?.[k])||s.defenses[k]<1||s.defenses[k]>10)throw Error('Invalid defense rank.');
 if(s.rosterVersion!==2||!Array.isArray(s.defenseLayout)||s.defenseLayout.length!==4||s.defenseLayout.some(id=>id==='gate'||!defenseUnlocked(s,id)))throw Error('Invalid castle emplacements.');
 const guide=s.guide;if(!guide||typeof guide.active!=='boolean'||!Array.isArray(guide.done)||!Array.isArray(guide.seen)||guide.done.length>32||guide.seen.length>100||[...guide.done,...guide.seen].some(x=>typeof x!=='string'||x.length>64)||!Number.isFinite(guide.distance)||guide.distance<0)throw Error('Invalid journey guide.');
 for(const id of Object.keys(HEROES)){const h=s.heroes?.[id];if(!h||!Number.isInteger(h.level)||h.level<1||h.level>30||!Number.isFinite(h.xp)||h.xp<0||!Number.isInteger(h.questPoints)||h.questPoints<0||h.questPoints>6)throw Error('Invalid hero progress.');for(const [key,r]of Object.entries(h.skills)){const n=HEROES[id].skills.find(n=>n.id===key);if(!n||!Number.isInteger(r)||r<0||r>n.max)throw Error('Invalid technique rank.');}const spend=HEROES[id].skills.reduce((sum,n)=>sum+(h.skills[n.id]||0)*(n.cost||1),0);if(spend>h.level-1+h.questPoints)throw Error('Invalid skill point budget.');}
 const ids=new Set();for(const i of s.inventory){if(!i||typeof i.id!=='string'||ids.has(i.id)||!['armor','shield','relic',...Object.keys(WEAPONS)].includes(i.type)||!Number.isInteger(i.rarity)||i.rarity<0||i.rarity>4||!Number.isInteger(i.plus)||i.plus<0||i.plus>10||!Number.isFinite(i.base)||i.base<0||i.base>10000)throw Error('Invalid inventory.');ids.add(i.id);i.name=String(i.name).slice(0,90);}
 for(const h of Object.values(s.heroes))for(const [slot,id]of Object.entries(h.equipped)){const i=s.inventory.find(i=>i.id===id);if(!i||!(slot==='weapon'?WEAPONS[i.type]:slot===i.type))throw Error('Invalid equipped item.');}
 for(const k of ['completed','treasures','deeds','visits','journal'])if(!Array.isArray(s[k])||s[k].length>2000)throw Error('Invalid campaign journal.');
 if(s.completed.some(x=>!Number.isInteger(x)||x<0||x>=MISSIONS.length))throw Error('Invalid territory.');s.completed=[...new Set(s.completed)];s.treasures=[...new Set(s.treasures.map(x=>String(x).slice(0,80)))];

 for(const id of Object.keys(HEROES)){const h=s.heroes[id];if(!h.skills||!h.equipped||!Array.isArray(h.slots)||h.slots.length!==2)throw Error('Incomplete hero data.');for(const slot of ['weapon','armor','shield','relic'])if(!h.equipped[slot])throw Error('Missing equipped item.');if(h.slots.some(k=>!HEROES[id].starter.includes(k)&&!(h.skills[k]>0)))throw Error('Untrained technique in a slot.');}
 for(const i of s.inventory){if(!Number.isInteger(i.level)||i.level<1||i.level>30||i.affix&&!AFFIXES[i.affix]||i.rune&&!['ember','frost','vital'].includes(i.rune)||i.temper&&!['swift','sunder','guard'].includes(i.temper)||i.armorKind!==undefined&&(i.type!=='armor'||!Object.hasOwn(ARMORS,i.armorKind)))throw Error('Invalid equipment modifiers.');}
 const cfg=s.settings;if(!cfg||!['auto','high','low'].includes(cfg.quality))throw Error('Invalid graphics preference.');for(const k of ['volume','music','shake'])if(!Number.isFinite(cfg[k])||cfg[k]<0||cfg[k]>1)throw Error('Invalid sound or camera preference.');if(!Number.isFinite(cfg.sensitivity)||cfg.sensitivity<.4||cfg.sensitivity>2)throw Error('Invalid sensitivity.');
 const pos=p=>p&&['x','y','z'].every(k=>Number.isFinite(p[k])&&Math.abs(p[k])<1000);if(!pos(s.position))throw Error('Invalid saved location.');
 if(s.battle){const b=s.battle;if(!Number.isInteger(b.id)||!MISSIONS[b.id]||!Number.isInteger(b.wave)||b.wave<0||b.wave>MISSIONS[b.id].waves||!pos(b.hero?.pos)||!Array.isArray(b.enemies)||!Array.isArray(b.allies)||b.enemies.length>100||b.allies.length>24)throw Error('Invalid battle checkpoint.');for(const k of ['nextWave','command','gate','maxGate','core','time'])if(!Number.isFinite(b[k])||Math.abs(b[k])>1e7)throw Error('Invalid battle values.');if(b.enemies.some(e=>!['hollow','archer','knight','mage','brute','boss'].includes(e.type))||b.allies.some(e=>!UNITS[e.unit]))throw Error('Unknown saved soldier.');for(const e of [...b.enemies,...b.allies])if(!pos(e.pos)||!Number.isFinite(e.hp)||e.hp<=0||e.hp>1e7)throw Error('Invalid saved soldier.');for(const k of ['hp','focus','stamina'])if(!Number.isFinite(b.hero[k])||b.hero[k]<0||b.hero[k]>10000)throw Error('Invalid hero condition.');}
 return s;
}
export class SaveStore{
 constructor(){this.data=null;this.db=null;this.error=null;this.listeners=new Set();}
 async open(){try{this.db=await new Promise((resolve,reject)=>{const q=indexedDB.open('oathfire',1);q.onupgradeneeded=()=>q.result.createObjectStore('campaign');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}catch(e){this.error='Browser storage is limited. Export a save backup from Settings.';}
  let saved=null;try{saved=JSON.parse(localStorage.getItem(SAVE_KEY));}catch{}
  if(!saved&&this.db)try{saved=await new Promise(resolve=>{const q=this.db.transaction('campaign').objectStore('campaign').get('current');q.onsuccess=()=>resolve(q.result);q.onerror=()=>resolve(null);});}catch{}
  try{if(saved)this.data=validateSave(saved);}catch{try{this.data=validateSave(JSON.parse(localStorage.getItem(SAVE_KEY+'.backup')));this.error='Recovered your previous save checkpoint.';}catch{this.error='Saved data could not be read. Start a journey or import your backup.';}}
  return this.data;
 }
 start(hero){this.data=newSave(hero);this.persist();return this.data;}
 commit(fn){if(!this.data)throw Error('Start a journey first.');const next=copy(this.data),result=fn(next);validateSave(next);next.updated=Date.now();this.data=next;this.persist();this.listeners.forEach(f=>f(next));return result;}
 persist(){if(!this.data)return;try{const old=localStorage.getItem(SAVE_KEY);if(old)localStorage.setItem(SAVE_KEY+'.backup',old);localStorage.setItem(SAVE_KEY,JSON.stringify(this.data));}catch{this.error='Save storage is full. Export your progress in Settings.';}if(this.db){try{const tx=this.db.transaction('campaign','readwrite');tx.objectStore('campaign').put(copy(this.data),'current');tx.onerror=()=>this.error='Save storage failed. Export a backup.';}catch{}}
 }
 export(){return JSON.stringify({format:'Oathfire campaign',savedAt:new Date().toISOString(),campaign:this.data},null,2);}
 import(raw){const p=JSON.parse(raw);const next=validateSave(p.campaign||p);this.data=copy(next);this.persist();this.listeners.forEach(f=>f(this.data));return this.data;}
}
