// Save-safe rules shared by combat, the map, reports and regression tests.
export const FINAL_FORTRESS=32;
export const isSiege=m=>m?.mode==='siege';
export const SIEGE_PARTS=['gate','west','east','keep'];
export const SIEGE_NAMES={gate:'Ironbound gate',west:'West bastion',east:'East bastion',keep:'Dread keep'};
export const SIEGE_RALLY={x:0,y:3,z:-108};
export function siegeConfig(m){
 const final=m.id===FINAL_FORTRESS,stage=final?23:m.unlockMain||0;
 return {final,stage,command:final?180:55+Math.floor(stage/3)*10,hp:{gate:420+stage*72,west:280+stage*48,east:280+stage*48,keep:760+stage*130},
  interval:final?15:26-Math.min(9,stage*.4),minimum:final?5:9,stepSeconds:final?38:55,
  initial:final?12:4+Math.floor(stage/4),limit:final?58:42,damage:final?33:10+stage*.6,
  rewardSalvage:final?110:25+stage*3};
}
export function siegePressure(m,time,gateBroken=false){const c=siegeConfig(m);return Math.min(6,1+Math.floor(Math.max(0,time)/c.stepSeconds)+(gateBroken?1:0));}
export function siegeInterval(m,pressure){const c=siegeConfig(m);return Math.max(c.minimum,c.interval-(pressure-1)*(c.final?2:3));}
export function siegePacket(m,pressure){return (siegeConfig(m).final?3:2)+(pressure-1);}
export function newSiegeState(m){const c=siegeConfig(m);return {version:1,hp:{...c.hp},nextSpawn:8,pressure:1,spawned:0,packets:0,damage:0,heroDamage:0,armyDamage:0,destroyed:0};}
export function validateSiegeState(value,m){
 if(value===undefined)return; // A suspended pre-siege settlement is migrated on resume.
 if(!isSiege(m)||value?.version!==1)throw Error('Invalid siege checkpoint.');
 const c=siegeConfig(m);
 for(const part of SIEGE_PARTS)if(!Number.isFinite(value.hp?.[part])||value.hp[part]<0||value.hp[part]>c.hp[part])throw Error('Invalid fortress health.');
 for(const k of ['spawned','packets','destroyed','pressure'])if(!Number.isInteger(value[k])||value[k]<0||value[k]>1e7)throw Error('Invalid siege progress.');
 if(value.pressure<1||value.pressure>6||value.destroyed>4)throw Error('Invalid siege pressure.');
 for(const k of ['damage','heroDamage','armyDamage'])if(!Number.isFinite(value[k])||value[k]<0||value[k]>1e9)throw Error('Invalid siege damage.');
 if(!Number.isFinite(value.nextSpawn)||value.nextSpawn< -1||value.nextSpawn>60)throw Error('Invalid siege reinforcements.');
}
export function castleReserved(world,x,z,margin=0){return !!world.siegeMode&&Math.abs(x)<43+margin&&z< -125+margin&&z> -205-margin;}
