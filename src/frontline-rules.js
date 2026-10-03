// Pure encounter rules. Optional state leaves already suspended battles intact.
export const TURNING_POINTS={
 ram:{name:'Ironjaw ram',warning:'A ram is approaching the gate. Flank it and strike its exposed rear.',counter:'Charged melee hits deal double damage to the ram. Rear attacks bypass most of its armor.',type:'brute'},
 commander:{name:'Grave marshal',warning:'A marshal is gathering reinforcements. Interrupt the raised banner with a charged hit.',counter:'A charged strike or perfect block interrupts its four-second rally.',type:'herald'},
 bombers:{name:'Cinder flank',warning:'Bomb carriers are approaching from the east. Interrupt their throws or leave the marked ground.',counter:'Their orange circles mark the impact. Charged hits interrupt a throw before release.',type:'bomber'}
};
export function turningPointFor(m,wave){
 if(m.mode==='siege'||m.kind==='relief')return null;
 if(m.id>=5&&wave===3)return 'bombers';
 if(m.id>=3&&wave===1)return 'commander';
 if(m.id>=1&&wave===2)return 'ram';
 return null;
}
export function newTurningPoint(m,wave){const kind=turningPointFor(m,wave);return kind?{kind,wave,phase:'waiting',remaining:12,ids:[],rallies:0}:null;}
export const turningPointPending=b=>!!b?.turningPoint&&['waiting','warning'].includes(b.turningPoint.phase);
export const ROUTES=[
 {id:'artillery',name:'Ash battery',x:-42,z:-283,kind:'destroy',description:'Destroy the mortar on the west flank.',benefit:'Road bombardment silenced'},
 {id:'infirmary',name:'Pilgrim camp',x:42,z:-498,kind:'capture',description:'Clear the east camp. Occupy it for 6 seconds.',benefit:'Forward recruitment · 50% nearby healing'},
 {id:'signal',name:'Hornwatch',x:-42,z:-715,kind:'capture',description:'Clear the west signal post. Occupy it for 6 seconds.',benefit:'30% longer between reinforcements'}
];
export const routeState=()=>({artillery:false,infirmary:false,signal:false,activated:false,capture:0,capturing:null});
export function validateFrontline(b){
 const t=b.turningPoint;
 if(t!==undefined&&t!==null&&(!TURNING_POINTS[t.kind]||!['waiting','warning','active','resolved'].includes(t.phase)||!Number.isInteger(t.wave)||t.wave!==b.wave||!Number.isFinite(t.remaining)||t.remaining<0||t.remaining>12||!Array.isArray(t.ids)||t.ids.length>3||t.ids.some(id=>typeof id!=='string'||id.length>100)||!Number.isInteger(t.rallies)||t.rallies<0||t.rallies>2))throw Error('Invalid battlefield turning point.');
 const r=b.siege?.routes;if(r!==undefined){if(!r||['artillery','infirmary','signal','activated'].some(k=>typeof r[k]!=='boolean')||!Number.isFinite(r.capture)||r.capture<0||r.capture>6||r.capturing!==null&&!['infirmary','signal'].includes(r.capturing))throw Error('Invalid siege route.');}
 for(const e of b.enemies||[]){if(e.encounterRole!==undefined&&!['ram','commander','battery'].includes(e.encounterRole))throw Error('Invalid encounter soldier.');if(e.channel!==undefined&&(!Number.isFinite(e.channel)||e.channel<0||e.channel>30))throw Error('Invalid enemy channel.');}
}
export function positionalStrike(target,source,opt){
 if(target.team!=='enemy'||!source?.pos||opt.secondary)return {multiplier:1,armorFactor:1,rear:false};
 const dx=source.pos.x-target.pos.x,dz=source.pos.z-target.pos.z,len=Math.hypot(dx,dz)||1;
 const rear=(Math.sin(target.facing)*dx+Math.cos(target.facing)*dz)/len<-.55;
 const melee=opt.weapon&&!['bow','staff','crossbow'].includes(opt.weapon)&&!opt.projectile;
 return {multiplier:target.encounterRole==='ram'&&melee&&opt.heavy?2:rear&&melee?1.2:1,armorFactor:rear&&melee?.35:1,rear:!!(rear&&melee)};
}
export const TOWN_PROJECTS=[
 {town:24,id:'mill',name:'Bread for Hearthwatch',person:'Iona',tab:'shop',x:20,z:2,color:0xc69652,detail:'Willowmill’s millers have returned. Fresh bread, grain carts and a golden market canopy now fill the square.',ask:'Free Willowmill so its millers can supply our market.'},
 {town:25,id:'fletchers',name:'The bowyers return',person:'Rowan',tab:'troops',x:-15,z:-5,color:0x476fa2,detail:'Reedhaven’s bowyers have rebuilt the practice range with blue banners, arrow racks and new targets.',ask:'Reclaim Reedhaven and bring its bowyers home.'},
 {town:26,id:'masonry',name:'Stone that will stand',person:'Nell',tab:'defenses',x:12,z:-13,color:0xb59b69,detail:'Coppergate’s masons have finished carved gate buttresses, pale stone caps and gilded wall crests.',ask:'Rescue Coppergate. Its masons can restore the gate frontage.'},
 {town:27,id:'garden',name:'The winter garden',person:'Iona',tab:'shop',x:13,z:22,color:0x7a6aa7,detail:'Whitepine’s herbalists have planted violet flowers and built an herb-drying arbor beside the apothecary.',ask:'Bring Whitepine’s herbalists safely into the alliance.'},
 {town:28,id:'forge',name:'Fire in the old forge',person:'Torren',tab:'equipment',x:-18,z:5,color:0xc05a31,detail:'Sunspire’s smiths have installed a copper forge canopy, rune-lit braziers and a display of ceremonial blades.',ask:'Free Sunspire. Its smiths know how to rekindle our old forge.'},
 {town:29,id:'orchard',name:'Roots of a new home',person:'Iona',tab:'shop',x:-13,z:22,color:0x779353,detail:'Briarhaven’s gardeners have planted a flowering orchard and hung green festival pennants.',ask:'Reclaim Briarhaven so its gardeners can restore our orchard.'},
 {town:30,id:'harbor',name:'Merchants of Greywake',person:'Iona',tab:'shop',x:22,z:18,color:0x8a4267,detail:'Greywake’s traders have opened a purple-draped spice stall with amphorae, carpets and merchant lanterns.',ask:'Open the road to Greywake and bring its merchants here.'},
 {town:31,id:'dawn',name:'The dawn procession',person:'Sera',tab:'campaign',x:0,z:20,color:0xdfc68a,detail:'Dawnmere’s artisans have raised a sun monument and hung ivory-and-gold banners for the returning army.',ask:'Liberate Dawnmere. Let its artisans raise a monument to everyone we saved.'}
];
export const projectEarned=(s,p)=>(s?.war?.captured||s?.settlements||[]).includes(p.town);
export const projectAcknowledged=(s,p)=>s.guide.seen.includes('home-project-'+p.id);
export function claimHomecoming(s,id){const p=TOWN_PROJECTS.find(p=>p.id===id);if(!p||!projectEarned(s,p)||projectAcknowledged(s,p))return false;s.guide.seen.push('home-project-'+p.id);s.journal.push(p.name+' — '+p.detail);return true;}
