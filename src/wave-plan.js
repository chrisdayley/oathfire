import {missionRoster} from './campaign.js';

export const DEFENSE_FIELD_LIMIT=72;
const heavies=new Set(['knight','brute','bulwark','reaver','mortar','warpriest']);
export function createAssault(mission,wave,camp=false){
 const stage=mission.kind==='relief'?mission.unlockMain+1:mission.id;
 const original=missionRoster(mission,wave),baseline=Math.max(28,Math.ceil(missionRoster(mission,1).length*(stage<2?2.45:stage<8?2.8:3.15)))-(camp?2:0);
 const multiplier=wave===1?1:wave===2?1.5:2.5+(wave-3);
 const total=Math.ceil(baseline*multiplier);
 const duration=Math.min(120,66+(wave-1)*7+stage*1.3),packets=Math.min(12,9+Math.floor((wave-1)/3)+Math.floor(stage/8));
 // Reuse the unlocked roster, shifting heavily armored enemies toward the tail.
 const roster=Array.from({length:total},(_,i)=>original[i%original.length]);
 roster.sort((a,b)=>Number(heavies.has(a))-Number(heavies.has(b)));
 if(mission.introduced){const at=roster.indexOf(mission.introduced);if(at>1)[roster[1],roster[at]]=[roster[at],roster[1]];}
 const weights=Array.from({length:packets},(_,i)=>1+i*.23),sum=weights.reduce((a,b)=>a+b,0);
 const sizes=weights.map(w=>Math.max(1,Math.floor(total*w/sum)));
 for(let n=total-sizes.reduce((a,b)=>a+b,0),i=packets-1;n>0;n--,i=(i-1+packets)%packets)sizes[i]++;
 // An actual advance party, followed by overlapping formations. Borrow from
 // the middle, preserving the largest force for the end of each wave.
 const opening=Math.min(12,5+Math.floor(stage/3)+Math.floor((wave-1)/2));
 for(let i=1;sizes[0]<opening;i=i%(packets-2)+1){if(sizes[i]>1){sizes[i]--;sizes[0]++;}}
 const entries=[];let index=0,seed=(mission.seed+wave*811)>>>0;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let packet=0;packet<packets;packet++){
  const phase=packet/(packets-1),at=duration*phase,width=24+Math.min(20,stage*2);
  for(let i=0;i<sizes[packet];i++)entries.push({at,type:roster[index++],x:((packet+i)%3-1)*width+(rand()-.5)*12,z:-78-rand()*20,assaultBoost:1+phase*.18});
 }
 if(mission.boss&&wave===mission.waves)entries.push({at:duration,type:'boss',x:0,z:-104,assaultBoost:1.18});
 return {version:1,wave,duration,elapsed:0,cursor:0,entries};
}
export const assaultPending=b=>!!b.assault&&b.assault.cursor<b.assault.entries.length;
export function advanceAssault(plan,dt,slots){
 if(!plan)return [];
 plan.elapsed+=dt;const due=[];
 // Limit one frame's model construction even when a saved packet is overdue.
 while(plan.cursor<plan.entries.length&&plan.entries[plan.cursor].at<=plan.elapsed&&due.length<Math.min(4,slots))due.push(plan.entries[plan.cursor++]);
 return due;
}
export function validateAssault(b,enemies){
 const p=b.assault;if(p==null)return;
 if(b.siege||p.version!==1||p.wave!==b.wave||!Number.isFinite(p.duration)||p.duration<60||p.duration>120||!Number.isFinite(p.elapsed)||p.elapsed<0||p.elapsed>1e7||!Array.isArray(p.entries)||p.entries.length<1||p.entries.length>1024||!Number.isInteger(p.cursor)||p.cursor<0||p.cursor>p.entries.length)throw Error('Invalid reinforcement schedule.');
 let previous=-1;
 for(const e of p.entries){if(!Object.hasOwn(enemies,e.type)||!Number.isFinite(e.at)||e.at<0||e.at<previous||e.at>p.duration||!Number.isFinite(e.x)||Math.abs(e.x)>65||!Number.isFinite(e.z)||e.z> -70||e.z< -110||!Number.isFinite(e.assaultBoost)||e.assaultBoost<1||e.assaultBoost>1.2)throw Error('Invalid reinforcement.');previous=e.at;}
}
