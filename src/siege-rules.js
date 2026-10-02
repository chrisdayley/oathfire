// Save-safe rules shared by combat, the map, reports and regression tests.
export const FINAL_FORTRESS=32;
export const isSiege=m=>m?.mode==='siege';
export const SIEGE_PARTS=['gate','west','east','keep'];
export const SIEGE_NAMES={gate:'Ironbound gate',west:'West bastion',east:'East bastion',keep:'Dread keep'};
export const SIEGE_RALLY={x:0,y:0,z:-30};
// Gate-to-gate distance: 945 m. The assault route is half the previous length.
export const SIEGE_OFFSET=-819;
export const SIEGE_GATE_Z=-143+SIEGE_OFFSET;
export const SIEGE_MIN_Z=-205+SIEGE_OFFSET-26;
export const SIEGE_OUTPOSTS=[
 {name:'Old road watch',x:-16,z:-169},
 {name:'The broken crossing',x:18,z:-381},
 {name:'Highland redoubt',x:-18,z:-592},
 {name:'Crownward camp',x:16,z:-804}
];
export function siegeRally(b){const n=b?.siege?.outposts?.lastIndexOf(true)??-1;return n<0?SIEGE_RALLY:{x:SIEGE_OUTPOSTS[n].x,y:0,z:SIEGE_OUTPOSTS[n].z+8};}
export function siegeMarchFactor(g,e){return g.battle?.siege&&!e.attacking&&!e.charging&&!e.guarding&&e.pos.z< -35&&e.pos.z>SIEGE_GATE_Z+90&&!g.enemies.some(n=>!n.dead&&Math.hypot(n.pos.x-e.pos.x,n.pos.z-e.pos.z)<60)?1.65*(e===g.hero?1:Math.max(1,(g.hero.stats.speed||5)/e.stats.speed)):1;}
export function siegeConfig(m){
 const final=m.id===FINAL_FORTRESS,stage=final?23:m.unlockMain||0;
 return {final,stage,command:final?350:55+Math.floor(stage/3)*10,hp:{gate:1050+stage*150,west:650+stage*95,east:650+stage*95,keep:2100+stage*280},
  interval:final?15:20-Math.min(6,stage*.3),minimum:final?6:7,stepSeconds:final?75:Math.max(95,150-stage*2),
  initial:final?14:5+Math.floor(stage/4),limit:final?58:42,damage:final?44:14+stage*.8,
  rewardSalvage:final?110:25+stage*3};
}
export function siegePressure(m,time,gateBroken=false,frontier=-Infinity){const c=siegeConfig(m),roadCap=frontier<SIEGE_GATE_Z+120?6:Math.min(5,2+Math.floor(Math.max(0,-frontier-175)/200));return Math.min(6,roadCap+(gateBroken?1:0),1+Math.floor(Math.max(0,time)/c.stepSeconds)+(gateBroken?1:0));}
export function siegeInterval(m,pressure){const c=siegeConfig(m);return Math.max(c.minimum,c.interval-(pressure-1)*(c.final?2:3));}
export function siegePacket(m,pressure){return (siegeConfig(m).final?4:3)+(pressure-1);}
export function newSiegeState(m){const c=siegeConfig(m);return {version:3,frontier:-27,outposts:[false,false,false,false],activated:[false,false,false,false],capture:0,hp:{...c.hp},nextSpawn:5,pressure:1,spawned:0,packets:0,damage:0,heroDamage:0,armyDamage:0,destroyed:0};}
export function validateSiegeState(value,m){
 if(value===undefined)return; // A suspended pre-siege settlement is migrated on resume.
 if(!isSiege(m)||![1,2,3].includes(value?.version))throw Error('Invalid siege checkpoint.');
 if(value.version>=2){if(value.frontier!==undefined&&(!Number.isFinite(value.frontier)||value.frontier< -2400||value.frontier>55))throw Error('Invalid siege frontier.');for(const key of ['outposts','activated'])if(!Array.isArray(value[key])||value[key].length!==4||value[key].some(v=>typeof v!=='boolean'))throw Error('Invalid siege road progress.');if(!Number.isFinite(value.capture)||value.capture<0||value.capture>6)throw Error('Invalid camp capture.');}
 const c=siegeConfig(m);
 for(const part of SIEGE_PARTS)if(!Number.isFinite(value.hp?.[part])||value.hp[part]<0||value.hp[part]>c.hp[part])throw Error('Invalid fortress health.');
 for(const k of ['spawned','packets','destroyed','pressure'])if(!Number.isInteger(value[k])||value[k]<0||value[k]>1e7)throw Error('Invalid siege progress.');
 if(value.pressure<1||value.pressure>6||value.destroyed>4)throw Error('Invalid siege pressure.');
 for(const k of ['damage','heroDamage','armyDamage'])if(!Number.isFinite(value[k])||value[k]<0||value[k]>1e9)throw Error('Invalid siege damage.');
 if(!Number.isFinite(value.nextSpawn)||value.nextSpawn< -1||value.nextSpawn>60)throw Error('Invalid siege reinforcements.');
}
export function castleReserved(world,x,z,margin=0){return !!world.siegeMode&&Math.abs(x)<43+margin&&z< -125+SIEGE_OFFSET+margin&&z> -205+SIEGE_OFFSET-margin;}

// Preserve suspended assaults when shortening the road. Fortress-local distances
// are translated intact; only the open road is compressed. Never mutate input.
export function migrateSiegeCheckpoint(saved,m){
 if(!saved?.siege||!isSiege(m)||saved.siege.version>=3)return saved;
 const next=structuredClone(saved),st=next.siege,legacy=st.version===1;
 const mapZ=z=>legacy?z+SIEGE_OFFSET:z>=-27?z:z<=-1889?z+945:-27+(z+27)*(917/1862);
 const move=p=>{if(p&&Number.isFinite(p.z))p.z=mapZ(p.z);};
 move(next.hero?.pos);move(next.holdPoint);for(const a of [...(next.allies||[]),...(next.enemies||[])])move(a.pos);for(const chest of next.ledger?.chests||[])move(chest.pos);
 st.frontier=mapZ(st.frontier??saved.hero?.pos?.z??-27);
 if(legacy){st.outposts=[true,true,true,true];st.activated=[true,true,true,true];st.capture=0;}
 st.version=3;return next;
}
