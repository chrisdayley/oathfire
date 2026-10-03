import {rankLevels,abilityStats} from './ability-progression.js';
import {furnaceDescriptions} from './furnace-fireball.js';
import {decorateMissions} from './campaign.js';
import {NEW_UNITS,NEW_DEFENSES} from './roster.js';
import {WARDEN_SKILLS} from './warden-skills.js';
import {trainedUnit,trainingCost} from './unit-progression.js';
import {ARMY_SPEC} from './army-spec.js';
export const BUILD='oathfire-2.20.0-turning-tide';
export const ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
export const HEROES={
 warden:{name:'The Warden',role:'Frontline tank',subtitle:'Protect the front line and strengthen nearby troops. Highest starting health and armor.',model:'Knight',weapon:'sword',color:0x4e9691,hp:260,focus:70,armor:14,skills:WARDEN_SKILLS,trees:{iron:'Iron Oath',banner:'War Banner',ember:'Ember Rite'},starter:['step','rally']},
 ashwright:{name:'The Ashwright',role:'Battle mage',subtitle:'Explosive fire magic, a heavy war hammer and healing. Highest starting magic.',model:'Mage',weapon:'hammer',color:0xe7a255,hp:230,focus:110,armor:8,trees:{iron:'Siegewright',banner:'Runekeeper',ember:'Furnace'},starter:['fireball','quench']},
 ranger:{name:'The Veilranger',role:'Ranged skirmisher',subtitle:'Fight from range, root enemies and dodge attacks. Fastest movement.',model:'Rogue_Hooded',weapon:'bow',color:0x75a778,hp:235,focus:85,armor:10,trees:{iron:'Hunter',banner:'Wayfinder',ember:'Thorncaller'},starter:['windstep','thorns']}
};
// Other orders use the same explicit budget and gates, with their own active techniques.
const altNames={ashwright:['Forged Body','Hammercraft','Runic Bulwark','Siegecraft','Iron Conductor','Forgefall','Rune Capacity','Quench Burst','Overdrive','Mender’s Rune','Living Furnace','Sanctuary','Furnace Lore','Furnace Fireball','Cinder Mine','Thermal Conduit','Hungry Flame','Inferno'],ranger:['Trail-Hardened','Bow Mastery','Hunter’s Mark','Crescent Cut','Patient Hunter','Briarstorm','Wayfinder','Windstep','Guiding Volley','Wild Remedy','Fleet Captain','Living Grove','Root Lore','Thornsnare','Seed Ward','Briar Surge','Wild Bargain','Verdant Reversal']};
const altIds={ashwright:{step:'bulwark',rally:'quench',volley:'overdrive',sunwall:'forgefall',edge:'fireball',tether:'mine',march:'sanctuary',reversal:'inferno'},ranger:{step:'mark',rally:'windstep',volley:'guide',sunwall:'briarstorm',edge:'thorns',tether:'seedward',march:'grove',reversal:'verdant'}};
const special={
 fireball:furnaceDescriptions,
 quench:['A shattered flask heals 18 and slows nearby enemies 20% for 3s.','Heal 28 and clear burning; the splash widens.','Heal 36; three outward water jets slow enemies 35%.'],
 bulwark:['Raise a protective rune: 20% damage reduction for 4s.','A second plate grants 30% reduction.','Three plates shelter nearby allies for 6s.'],
 overdrive:['An allied defense fires 20% faster for 6s.','Gain 30% firing speed for 8s.','Nearby allies also gain 15% attack speed.'],
 mine:['Set an ember mine: 38 damage on proximity.','Mine leaves 3s of fire.','Three small mines form a protective arc.'],
 windstep:['Dash 5m with a leaf wake. Costs 12 stamina.','Dash cooldown falls to 6s; recover 6 stamina after landing.','Dash 7m and empower the next arrow by 30%.'],
 thorns:['Roots snare one enemy for 2s and inflict 18 damage.','Two targets are rooted for 2.5s.','Roots form a 4m ring, snaring up to four enemies.'],
 mark:['Mark an enemy: your attacks deal 20% more damage for 5s.','Allied arrows also gain 15% damage against the target.','Weak-point brackets persist 8s; your first hit crits.'],
 guide:['An allied bow squad fires a coordinated arrow.','Marked targets take an additional 10% troop damage.','The squad releases two separately aimed arrows.'],
 seedward:['A seeded ward heals nearby allies 3 health/s for 4s.','Ward also reduces incoming fire damage 15%.','Roots follow the hero for 5s.']
};
for(const id of ['ashwright','ranger'])HEROES[id].skills=WARDEN_SKILLS.map((s,i)=>{const a={...s,id:altIds[id][s.id]||s.id,name:altNames[id][i]};if(s.parent)a.parent=altIds[id][s.parent]||s.parent;if(special[a.id])a.effects=special[a.id];else if(s.capstone)a.effects=[id==='ashwright'?'A unique charged rune detonation strikes enemies around you for 140 fire damage. 30s cooldown.':'A visible thorn-arrow storm strikes enemies around the marked ground for 110 damage. 30s cooldown.'];return a;});
export const WEAPONS={sword:{name:'Sword',damage:25,speed:.64,reach:2.65,heavy:1.9,icon:'sword'},spear:{name:'Spear',damage:23,speed:.72,reach:3.8,heavy:2.1,icon:'spear'},hammer:{name:'War hammer',damage:34,speed:.90,reach:2.75,heavy:2.3,icon:'hammer'},bow:{name:'Longbow',damage:23,speed:.82,reach:34,heavy:2,icon:'bow'},staff:{name:'Rune staff',damage:26,speed:.86,reach:28,heavy:1.85,icon:'fire'}};
export const SPELLS={
 step:{name:'Shieldstep',icon:'shield',cost:16,cooldown:12,type:'stamina',desc:'Advance under guard. Higher ranks extend protection.'},rally:{name:'Rally',icon:'banner',cost:12,cooldown:20,desc:'Steady nearby allies. Training adds damage, healing and guard.'},volley:{name:'Signal volley',icon:'bow',cost:15,cooldown:18,desc:'Order allied archers to concentrate on your target.'},tether:{name:'Beacon tether',icon:'sun',cost:15,cooldown:18,desc:'Raise a protective ward around the ground ahead.'},
 fireball:{name:'Furnace fireball',icon:'fire',cost:17,cooldown:4.2,desc:'Hurl a furnace orb that explodes and leaves burning ground. Higher ranks enlarge the blast and weaken enemy armor.'},quench:{name:'Quench burst',icon:'water',cost:22,cooldown:15,desc:'A healing splash that slows enemies and extinguishes fire.'},bulwark:{name:'Runic bulwark',icon:'shield',cost:20,cooldown:16,desc:'Raise protective stone-light plates.'},overdrive:{name:'Overdrive',icon:'gear',cost:22,cooldown:18,desc:'Empower an allied tower or siege engine.'},mine:{name:'Cinder mine',icon:'fire',cost:20,cooldown:12,desc:'A visible proximity trap.'},
 windstep:{name:'Windstep',icon:'wind',cost:12,cooldown:8,type:'stamina',desc:'A quick directional step, with a trailing leaf wake.'},thorns:{name:'Thornsnare',icon:'leaf',cost:18,cooldown:8,desc:'Root enemies with growing thorn tendrils.'},mark:{name:'Hunter’s mark',icon:'eye',cost:12,cooldown:12,desc:'Expose a target for your weapon and allied archers.'},guide:{name:'Guiding volley',icon:'bow',cost:17,cooldown:18,desc:'Direct your archers toward a marked enemy.'},seedward:{name:'Seed ward',icon:'leaf',cost:22,cooldown:18,desc:'Grow a healing sanctuary for nearby allies.'}
};
for(const [id,name,icon] of [['sunwall','Sunwall','sun'],['march','Living standard','banner'],['reversal','Dawn reversal','fire'],['forgefall','Forgefall','hammer'],['sanctuary','Sanctuary','sun'],['inferno','Inferno','fire'],['briarstorm','Briarstorm','leaf'],['grove','Living grove','leaf'],['verdant','Verdant reversal','leaf']])SPELLS[id]={name,icon,cost:32,cooldown:30,desc:'A signature capstone technique. Only one capstone can be active.'};
export const UNITS={
 shield:{name:'Shieldward',role:'Hold the line',model:'Knight',weapon:'sword',cost:14,trainingBase:22,count:1,hp:120,damage:16,speed:3.0,reach:2.4,unlock:0,color:0x468e8a,spec:ARMY_SPEC.shield},
 bow:{name:'Longbows',role:'Elevated ranged support',model:'Rogue_Hooded',weapon:'bow',cost:30,trainingBase:28,count:1,hp:72,damage:16,speed:3.4,reach:25,unlock:0,color:0x81995e},
 pike:{name:'Pikeguard',role:'Stop charges and giants',model:'Knight',weapon:'spear',cost:45,trainingBase:26,count:1,hp:110,damage:19,speed:3.0,reach:3.6,unlock:1,color:0x7599ac},
 lantern:{name:'Lanternkeepers',role:'Heal nearby soldiers',model:'Mage',weapon:'staff',cost:75,trainingBase:55,count:1,hp:84,damage:10,speed:3.2,reach:18,unlock:3,color:0xe9bc66},
 breaker:{name:'Ashbreakers',role:'Crush armored enemies',model:'Barbarian',weapon:'hammer',cost:90,trainingBase:65,count:1,hp:180,damage:34,speed:2.7,reach:2.8,unlock:5,color:0xa96b42},
 crew:{name:'Siege crew',role:'Heavy bolts against siege',model:'Knight',weapon:'crossbow',cost:120,trainingBase:80,count:1,hp:115,damage:54,speed:2.7,reach:30,unlock:6,color:0xb8a475},
 rider:{name:'Stormriders',role:'Elite cavalry · fast, armored, devastating charges',model:'Knight',weapon:'spear',cost:150,trainingBase:100,count:1,hp:230,damage:38,speed:6.3,reach:3.4,unlock:8,color:0x658baf},
 giant:{name:'Oathbound giant',role:'Break a crowded front',model:'Barbarian',weapon:'hammer',cost:195,trainingBase:120,count:1,hp:460,damage:62,speed:2.6,reach:4.4,unlock:11,color:0x8caa9b,scale:1.75},
 ...NEW_UNITS
};
export const DEFENSES={gate:{name:'Wall & gate',desc:'Protect the beacon. Each level rebuilds the gatehouse.',baseHp:1100,costs:[90,130,180,250,330,440,580,760,990]},tower:{...ARMY_SPEC.tower,desc:'Arrows control the approaches.',name:'Archer tower'},ballista:{...ARMY_SPEC.ballista,desc:'Heavy bolts answer armored siege units.',name:'Ballista'},...NEW_DEFENSES};
export const ENEMIES={
 runner:{name:'Raven runner',model:'Skeleton_Rogue',weapon:'sword',hp:46,damage:10,speed:4.4,range:1.9,xp:16,scale:.83},
 bomber:{name:'Cinder bomber',model:'Skeleton_Minion',weapon:'staff',hp:82,damage:23,speed:1.85,range:20,xp:25,mechanic:'bomb'},
 herald:{name:'War herald',model:'Skeleton_Warrior',weapon:'spear',hp:145,damage:10,speed:1.8,range:3,xp:34,mechanic:'aura'},
 longbow:{name:'Blackfeather hunter',model:'Skeleton_Rogue',weapon:'bow',hp:88,damage:24,speed:1.8,range:48,xp:28},
 bulwark:{name:'Grave bulwark',model:'Skeleton_Warrior',weapon:'sword',hp:320,damage:21,speed:1.35,range:2.7,xp:42,armor:22,scale:1.2,mechanic:'shield'},
 mender:{name:'Bone mender',model:'Skeleton_Mage',weapon:'staff',hp:130,damage:10,speed:1.7,range:22,xp:40,mechanic:'heal'},
 reaver:{name:'Blood reaver',model:'Skeleton_Warrior',weapon:'hammer',hp:260,damage:28,speed:2.7,range:2.8,xp:44,armor:8,mechanic:'rage'},
 mortar:{name:'Ash mortar',model:'Skeleton_Warrior',weapon:'crossbow',hp:270,damage:36,speed:1.15,range:39,xp:55,armor:12,mechanic:'mortar'},
 wraith:{name:'Mirror wraith',model:'Skeleton_Rogue',weapon:'sword',hp:190,damage:25,speed:2.9,range:2.6,xp:45,mechanic:'blink'},
 warpriest:{name:'Hollow warpriest',model:'Skeleton_Mage',weapon:'staff',hp:350,damage:25,speed:1.6,range:26,xp:65,armor:14,mechanic:'priest'},
 hollow:{name:'Hollow soldier',model:'Skeleton_Minion',weapon:'sword',hp:62,damage:9,speed:2.1,range:2.3,xp:12},
 archer:{name:'Bone archer',model:'Skeleton_Rogue',weapon:'bow',hp:48,damage:9,speed:1.9,range:22,xp:15},
 knight:{name:'Hollow knight',model:'Skeleton_Warrior',weapon:'sword',hp:135,damage:15,speed:1.8,range:2.5,xp:23,armor:10},
 mage:{name:'Grave caller',model:'Skeleton_Mage',weapon:'staff',hp:85,damage:15,speed:1.7,range:25,xp:25},
 brute:{name:'Siege brute',model:'Skeleton_Warrior',weapon:'hammer',hp:290,damage:30,speed:1.3,range:3.7,xp:40,scale:1.5,armor:16},
 boss:{name:'The Bell Knight',model:'Skeleton_Warrior',weapon:'spear',hp:850,damage:28,speed:2.1,range:4,xp:140,scale:1.45,armor:20}
};
const locations=[['Hearthwatch Fields','plain','A line in the grass','Hold the open approaches while the first refugees reach the keep.'],['Reedwater Ford','river','Across the shallows','Use both crossings. Secure the crossing so Nell can bring her engineers and cannon plans home.'],['Sunken Quarry','quarry','Stone remembers','Take the high terraces and silence the grave callers.'],['Thorn Abbey','forest','A lantern in the dark','Protect the lantern order’s road and recover the cinder adepts’ lost writings.'],['The Bell Road','plain','The first broken oath','The Bell Knight leads the Hollow Host himself.'],['Ashen Foundry','desert','Fire under the stone','Recover Torren’s old forge and train the Ashbreakers.'],['The Split Crossing','river','Two fronts','The enemy arrives across both banks.'],['Frostmere','snow','The silent lake','Ice opens wide flanking routes around the shattered watch.'],['Westwind Downs','plain','Riders of the old dawn','Hold long enough for the riders to return.'],['The Buried Crown','desert','A name beneath the sand','Break Veyr’s second captain at the buried city.'],['Blackroot Reach','forest','The roots of the oath','Grave callers gather under the ancient canopy.'],['The Giant’s Stair','quarry','A promise in stone','An oathbound giant waits beyond the quarry walls.'],['Glasswater','river','The last crossing','Hold the river approaches to the Hollow March.'],['The Frozen Beacon','snow','A fire remembered','Relight the last uncorrupted beacon.'],['Crown of Ash','desert','No more borrowed souls','Face Marshal Veyr. Break the oath that binds the fallen.']];
export const MISSIONS=decorateMissions(locations);
export const BIOMES={plain:{name:'Hearthwatch Fields',ground:0x6f8050,grass:0x708850,rock:0x858374,fog:0xa3b2a7,sky:0xc3cfc5,sun:0xffd395,water:0x537e7a},river:{name:'Reedwater Delta',ground:0x63816d,grass:0x76996f,rock:0x788784,fog:0x96afb1,sky:0xc1d3d2,sun:0xf4d5a2,water:0x4b9895},quarry:{name:'Sunken Quarry',ground:0x938579,grass:0x737b52,rock:0xb5a799,fog:0xafb8b5,sky:0xc0caca,sun:0xffd7a0,water:0x567f7d},forest:{name:'Thorn Abbey',ground:0x4e6550,grass:0x587a50,rock:0x6e7e76,fog:0x7e9a8e,sky:0xabc7b1,sun:0xf6d99b,water:0x477e73},snow:{name:'Frostmere',ground:0xc4d2d1,grass:0xa1bbbd,rock:0x91a8ad,fog:0xa7c3cf,sky:0xc6dce4,sun:0xffe3c3,water:0x669bac},desert:{name:'Crown of Ash',ground:0xb4a17b,grass:0x969466,rock:0x9b8d77,fog:0xbba998,sky:0xd3c0a2,sun:0xffc185,water:0x647f70}};
export const RARITIES=[{name:'Common',color:'#b9c0b7',mult:1},{name:'Uncommon',color:'#92bf98',mult:1.09},{name:'Rare',color:'#80b8d2',mult:1.20},{name:'Epic',color:'#c6a0db',mult:1.34},{name:'Legendary',color:'#edc374',mult:1.52},{name:'Mythic',color:'#75d9ff',mult:1.75},{name:'Godly',color:'#ffe7a6',mult:2.05}];
export const FORGE=[1,1.04,1.07,1.10,1.13,1.17,1.20,1.23,1.26,1.30,1.35];
export const AFFIXES={muster:{name:'Mustering',minRarity:3,command:true,desc:'Start battles with additional Command. Scales with rarity and forging.'},logistic:{name:'Provisioned',minRarity:4,command:true,desc:'Generate extra Command each second. Scales with rarity and forging.'},bounty:{name:'Triumphant',minRarity:3,command:true,desc:'Hero kills award extra Command. Scales with rarity and forging.'},conquest:{name:'Conquering',minRarity:5,command:true,desc:'Hero kills of armored elites and bosses award a large Command bounty.'},reserves:{name:'Quartermaster’s',minRarity:4,command:true,desc:'Increase the amount of Command you can bank.'},sunder:{name:'Sundering',desc:'Heavy hits strip 20% armor for 4s.'},vampiric:{name:'Returning',desc:'Restore 2 health on a melee hit.'},swift:{name:'Quickened',desc:'Attack recovery is 10% faster.'},ember:{name:'Kindled',desc:'Weapon hits add a short fire burn.'},guard:{name:'Steadfast',desc:'Blocking consumes 20% less stamina.'},command:{name:'Captain’s',desc:'Nearby allies deal 8% more damage.'},vital:{name:'Enduring',desc:'+24 maximum health.'},focus:{name:'Runed',desc:'+15 maximum focus.'}};
export const SERVICES=[{id:'forge',name:'Torren · Forge',x:-19,z:8,icon:'hammer',tab:'equipment',line:'Good steel deserves a second life.'},{id:'market',name:'Iona · Quartermaster',x:20,z:8,icon:'bag',tab:'shop',line:'A kingdom begins with someone coming home.'},{id:'troops',name:'Captain Rowan · Barracks',x:-18,z:-4,icon:'banner',tab:'troops',line:'Give them ground worth holding.'},{id:'defenses',name:'Nell · Engineer',x:19,z:-5,icon:'tower',tab:'defenses',line:'A good wall is a promise made of stone.'},{id:'campaign',name:'Sera · War table',x:0,z:17,icon:'map',tab:'campaign',line:'There is always another way around.'},{id:'hero',name:'Oath shrine',x:-10,z:23,icon:'sun',tab:'hero',line:'Choose what you will carry into the dark.'}];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function seeded(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function unitStats(id,level){const u=UNITS[id];return trainedUnit(id,u,level,WEAPONS[u.weapon]||WEAPONS.bow);}
export function unitCost(id,level){return trainingCost(UNITS[id],level);}
export function defenseStats(id,level){const u=DEFENSES[id];return id==='gate'?{hp:1100+level*130+level*level*15,damage:0,range:0}:{hp:u.hp[level-1],damage:u.damage[level-1],range:u.third[level-1]};}
// Both the battlefield and inspection screens use these doctrine-adjusted values.
export function defenseFiringStats(id,level,doctrine){const st=defenseStats(id,level);let interval=DEFENSES[id].interval||0;
 if(level>=5&&id==='tower'){st.range*=doctrine==='longwatch'?1.2:.85;interval*=doctrine==='longwatch'?1.2:.8;}
 if(level>=5&&id==='ballista'&&doctrine==='pinning')st.damage*=.85;
 return {...st,interval};
}
// The playable build's tooltips are a contract with the combat code. The original
// concept book also describes future formation behaviors, which are not tooltips.
const liveEffects={
 body:['+18 maximum health.','+34 maximum health in total.','+48 maximum health and +10 maximum stamina in total.','+60 maximum health; retain +10 stamina.','+70 maximum health; perfect guards restore 4 additional stamina.'],
 riposte:['A perfect guard empowers your next strike within 2s for +40% damage.','Perfect guards also restore 8 stamina.','The counter cleaves up to two additional enemies within 3m for 60% base damage. These hits cannot trigger more counters.'],
 step:['Advance 3m with a shield wake and 30% protection for 1s. Costs 16 stamina; 12s cooldown.','The shield wake protects you for 2s.','Advance 5m. The longer shield trail lets you cross openings and reach a threatened flank.'],
 breaker:['Charged melee attacks stagger enemies 20% longer.','Charged melee attacks stagger enemies 35% longer.','Charged melee attacks stagger enemies 45% longer and strip 20% armor for 4s.'],
 bastion:['While you guard, allies within 6m take 20% less damage. Tradeoff: your guarded movement is 25% slower.'],
 presence:['Your Rally and command aura reach 6m.','Your Rally and command aura reach 7m.','Your Rally and command aura reach 7.5m.','Your Rally and command aura reach 8m.','Your Rally and command aura reach 8.5m.'],
 rally:['Grant yourself and nearby soldiers 15% movement speed and weapon damage for 5s. Your own guard gains 30% protection for 2s.','Rallied allies also gain 18% attack speed for 4s.','Rallied allies also take 30% less damage for 3s.'],
 volley:['Signal your allied archers to fire at 120% damage. Without an archer, fire one signal arrow yourself.','Mark your target for 4s; it takes 15% more allied damage and 20% more hero damage.','Each archer releases two separately travelling arrows at 80% damage each.'],
 medic:['Rally heals the three most injured allied soldiers in range for 12 health.','Rally heals those three soldiers for 20 health.','Rally heals those three soldiers for 26 health.'],
 burden:['Nearby allied soldiers deal 20% more weapon damage. Tradeoff: your own weapon damage is reduced by 15%.'],
 lore:['+6 maximum focus.','+11 maximum focus in total.','+15 maximum focus in total.','+18 maximum focus in total.','+20 maximum focus in total.'],
 edge:['A riposte counter ignites its primary target for 12 fire damage over 4s.','The burn jumps to one nearby enemy when the target dies.','The death also leaves a 2m ember patch for 3s. Patches do not inflict a new burn.'],
 tether:['Raise a visible ward that reduces incoming damage 30% for 4s.','The ward also protects allied soldiers within 6m.','The ward and its protection last 6s.'],
 volatile:['Guarded hits store 10% of prevented damage, up to 20. Your next charged melee hit releases it as fire.','Store 15% of prevented damage, up to 30.','Store 20% of prevented damage, up to 40. The release explodes around the point of your heavy strike.'],
 borrowed:['Your active techniques cost 25% less focus or stamina. Tradeoff: your hero receives 30% less healing.'],
 sunwall:['Raise a golden shield wall for 8s: you and nearby allies take 30% less damage. The opening pulse deals 50 damage within 5m.'],
 march:['Plant a living standard for 8s. Allies within 7m recover 12 health/s; you gain 30% protection and +15% movement and damage.'],
 reversal:['Unleash a dawn burst: 140 damage within 8m, followed by a 6m ember field for 4s. Become invulnerable for 1s.']
};
for(const [id,h]of Object.entries(HEROES))for(const n of h.skills){if(liveEffects[n.id])n.effects=liveEffects[n.id];if(n.capstone&&id!=='warden'){n.effects=['sanctuary','grove'].includes(n.id)?['Create an 8-second sanctuary: allies within 7m recover 12 health/s, and you gain 30% protection.']:['briarstorm','verdant'].includes(n.id)?['Release a thorn storm dealing 140 damage within 8m. Gain 1s of invulnerability.']:['Detonate the forge: 140 fire damage within 8m and a 6m burning field for 4s. Gain 1s of invulnerability.'];}}
// Live regiment training changes base stats at every rank. Named formation perks
// are implemented only at the stated thresholds below.
ARMY_SPEC.shield.effects=['Hold assigned ground with sword and shield.','More health and a reinforced shield.','Shoulder armor steadies the melee silhouette.','Bracers complete the blocking arm.','Adjacent shields take 15% less projectile damage while holding.','Heavier bracers accompany the stronger guard.','Veteran cloak and permanent durability increase.','A command pennant makes the formation visible at distance.','Winged armor and a longer weapon profile.','A crested war harness completes the regiment’s ten-rank progression.'];

for(const [id,active]of [["ashwright","Quench Burst"],["ranger","Windstep"]]){const h=HEROES[id];h.skills.find(n=>n.id==="medic").effects=[12,20,26].map(v=>active+" heals the three most injured allied soldiers in command range for "+v+" health.");h.skills.find(n=>n.id==="presence").effects=[6,7,7.5,8,8.5].map(v=>"Your support techniques and command aura reach "+v+"m.");}

// Active techniques unlock through hero levels, independently of passive trees.
const techniqueLevels={step:1,rally:1,volley:2,tether:5,sunwall:10,march:14,reversal:18,fireball:1,quench:1,bulwark:2,mine:5,overdrive:8,forgefall:10,sanctuary:14,inferno:18,windstep:1,thorns:1,mark:2,seedward:5,guide:8,briarstorm:10,grove:14,verdant:18};
for(const hero of Object.values(HEROES))for(const skill of hero.skills)if(SPELLS[skill.id]){
 skill.active=true;skill.learnLevel=techniqueLevels[skill.id];skill.rankLevels=skill.max===1?[skill.learnLevel]:[skill.learnLevel,skill.learnLevel===1?2:skill.learnLevel+3,skill.learnLevel===1?6:skill.learnLevel+8];
}
const activeEffects={
 fireball:furnaceDescriptions,
 quench:['Heal yourself for 18 and nearby soldiers for 28. Slow enemies 35% for 3s within 4.6m.','Heal yourself for 28 and soldiers for 36. Splash radius grows to 5.2m.','Heal yourself for 36 and soldiers for 44. Splash radius grows to 5.8m.'],
 bulwark:['Protect yourself: 30% less damage for 4s.','Also shelter soldiers within 6m.','Protection lasts 6s; three rune plates surround you.'],
 overdrive:['All defenses fire 30% faster for 8s. Allies within 12m attack 18% faster for 8s.','Defenses are accelerated for 10s.','Defenses are accelerated for 12s.'],
 mine:['Place one proximity mine for 14s. It explodes for 44 fire damage within 3m.','The mine deals 50 fire damage.','Place three mines in an arc, each dealing 56 fire damage.'],
 windstep:['Dash 5m, protected during the step. 8s cooldown.','Cooldown falls to 6s; protection lasts 2s.','Dash 7m and empower your next weapon attack by 30%.'],
 thorns:['Root one enemy for 2s and deal 21 damage.','Root two enemies for 2.5s and deal 24 damage each.','Root up to four enemies within 4m for 2.5s; deal 27 damage each.'],
 mark:['Mark a target for 5s: it takes 20% more hero damage and 15% more allied damage.','The mark lasts 6.5s.','The mark lasts 8s.'],
 seedward:['A 4m grove heals your hero and soldiers for 4 HP/s for 4s.','Healing rises to 5 HP/s.','Healing rises to 6 HP/s and lasts 5s.']
};
for(const hero of Object.values(HEROES))for(const skill of hero.skills){if(activeEffects[skill.id])skill.effects=activeEffects[skill.id];if(skill.id==='guide')skill.effects=[...liveEffects.volley];}

for(const hero of Object.values(HEROES))for(const skill of hero.skills)if(skill.active){skill.max=10;skill.rankLevels=rankLevels(skill.learnLevel);skill.effects=Array.from({length:10},(_,i)=>abilityStats(skill.id,i+1).map(([k,v])=>k+': '+v).join(' · '));}
