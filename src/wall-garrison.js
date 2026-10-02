export const FIELD_LIMIT=24,WALL_LIMIT=8;
export const WALL_UNITS=['bow','marksman','pyre','frost','crew'];
// The front curtain wall is 5.1m high; slots sit behind its outer parapet.
export const WALL_POSTS=[-26,-22,-18,-14,14,18,22,26].map(x=>({x,y:5.16,z:-16.6}));
export const isWallUnit=e=>Number.isInteger(e?.wallSlot);
export const fieldCount=allies=>allies.filter(a=>!a.dead&&!isWallUnit(a)).length;
export const wallCount=allies=>allies.filter(a=>!a.dead&&isWallUnit(a)).length;
export const canGarrison=id=>WALL_UNITS.includes(id);
export function freeWallSlot(allies){return WALL_POSTS.findIndex((_,i)=>!allies.some(a=>!a.dead&&a.wallSlot===i));}
export const recruitKey=(id,wall=false)=>wall?'wall:'+id:id;
export const parseRecruitKey=key=>({id:key.startsWith('wall:')?key.slice(5):key,wall:key.startsWith('wall:')});
export function wallStats(st,b){return {...st,reach:Math.round(st.reach*(1.75+(b?.perks?.includes('battlements')?.15:0))*100)/100,speed:0};}
export function validateGarrison(allies,siege){if(!Array.isArray(allies))return;const seen=new Set();for(const a of allies){if(a.wallSlot===undefined)continue;if(siege||!Number.isInteger(a.wallSlot)||a.wallSlot<0||a.wallSlot>=WALL_LIMIT||seen.has(a.wallSlot)||!canGarrison(a.unit))throw Error('Invalid wall garrison.');seen.add(a.wallSlot);}if(fieldCount(allies)>FIELD_LIMIT||wallCount(allies)>WALL_LIMIT)throw Error('Invalid army capacity.');}
