// Stable contracts are permanent. An injured horse rests at Hearthwatch; it
// cannot be healed by mounting again or by reloading a suspended battle.
export const MOUNT_UNLOCK=11; // The twelfth defense brings the royal herd home.
export const MOUNTS=[
 {id:'courser',name:'Hearthland Courser',rarity:0,gate:12,cost:2400,hp:320,speed:8.1,armor:8,scale:1,coat:0x77412c,cloth:0x55452e,metal:0x646460,trim:0x88715b,bonus:'Sure-footed: jump low obstacles and ride while attacking.'},
 {id:'ranger',name:'Marchland Ranger',rarity:1,gate:13,cost:4000,hp:420,speed:8.6,armor:14,scale:1.02,coat:0x493024,cloth:0x596247,metal:0x7a7c70,trim:0x9c8355,stamina:.12,bonus:'Long stride: +12% stamina recovery while mounted.'},
 {id:'charger',name:'Stormgray Charger',rarity:2,gate:15,cost:6500,hp:540,speed:9,armor:23,scale:1.06,coat:0x8a9293,cloth:0x243e75,metal:0x9aa8af,trim:0xc6b484,projectile:.18,bonus:'Arrowguard: your horse takes 18% less projectile damage.'},
 {id:'dreadmane',name:'Crimson Dreadmane',rarity:3,gate:17,cost:9800,hp:680,speed:9.4,armor:34,scale:1.09,coat:0x27282d,cloth:0x762c37,metal:0x4b5665,trim:0xb39369,melee:.15,bonus:'War saddle: +15% damage with mounted melee attacks.'},
 {id:'suncrest',name:'Suncrest Destrier',rarity:4,gate:19,cost:14500,hp:850,speed:9.8,armor:46,scale:1.17,coat:0xc6c5b5,cloth:0x203d68,metal:0xabb5bd,trim:0xc9a24f,heavy:.25,bonus:'Royal charge: +25% charged melee damage. Heavy hits stagger ordinary enemies.'},
 {id:'nightstar',name:'Nightstar Colossus',rarity:5,gate:21,cost:21500,hp:1040,speed:10.3,armor:58,scale:1.24,coat:0x262731,cloth:0x493166,metal:0x535c77,trim:0x9eb4ce,glow:0x63d5f2,magic:.18,bonus:'Astral conduit: +18% spell damage from the saddle. Luminous armor and hoof runes.'},
 {id:'dawnsovereign',name:'Dawn Sovereign',rarity:6,gate:23,cost:31000,hp:1320,speed:10.8,armor:72,scale:1.30,coat:0xd1cab6,cloth:0xe2d7b8,metal:0xbba568,trim:0xf0d18c,glow:0xffb84b,ward:.20,heavy:.30,bonus:'Sovereign ward: 20% less rider damage and +30% charged melee damage. Radiant full barding.'}
];
export const mountDefinition=id=>MOUNTS.find(m=>m.id===id)||null;
export const stableUnlocked=s=>s.completed.includes(MOUNT_UNLOCK);
export const mountUnlocked=(s,id)=>{const m=mountDefinition(id);return !!m&&stableUnlocked(s)&&s.completed.length>=m.gate;};
export function ensureMounts(s){return s.mounts??={owned:[],selected:null,riding:false,hp:{}};}
export function hireMount(s,id){const m=mountDefinition(id),state=ensureMounts(s);if(!mountUnlocked(s,id))throw Error('This horse is not yet available.');if(s.battle)throw Error('Hire horses at the Hearthwatch stables.');if(state.owned.includes(id))throw Error('You already have this stable contract.');if(s.supplies<m.cost)throw Error('Not enough Supplies.');s.supplies-=m.cost;state.owned.push(id);state.selected=id;state.hp[id]=m.hp;state.riding=false;return m;}
export function selectMount(s,id){const state=ensureMounts(s);if(s.battle)throw Error('Choose a horse at the stables between battles.');if(!state.owned.includes(id))throw Error('Hire this horse first.');state.selected=id;state.riding=false;}
export function restMounts(s){const state=ensureMounts(s);for(const id of state.owned)state.hp[id]=mountDefinition(id).hp;state.riding=false;}
export function validateMounts(s){const m=ensureMounts(s);if(!Array.isArray(m.owned)||m.owned.length>7||new Set(m.owned).size!==m.owned.length||m.owned.some(id=>!mountDefinition(id))||typeof m.riding!=='boolean'||m.selected!==null&&!m.owned.includes(m.selected)||m.riding&&!m.selected||!m.hp||typeof m.hp!=='object')throw Error('Invalid stable contract.');for(const id of m.owned)if(!Number.isFinite(m.hp[id])||m.hp[id]<0||m.hp[id]>mountDefinition(id).hp)throw Error('Invalid mount health.');if(m.riding&&m.hp[m.selected]<=0)throw Error('An injured horse cannot be ridden.');return m;}
export function mountedDamage(m,amount,opt={}){if(!m)return amount;if(opt.weapon&&!['bow','crossbow','staff'].includes(opt.weapon)&&!opt.secondary)return amount*(1+(m.melee||0)+(opt.heavy?m.heavy||0:0));if(!opt.weapon||opt.element&& !['arrow','bolt'].includes(opt.element))return amount*(1+(m.magic||0));return amount;}
export function mountWounds(m,damage,raw,opt={}){return {rider:damage*.72*(1-(m.ward||0)),horse:raw*.45*100/(100+m.armor*2)*(opt.projectile?1-(m.projectile||0):1)};}
