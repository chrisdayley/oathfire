import {RIVER_LEVEL,inRiver} from './river-profile.js';
// Contacts measured from the retargeted Knight clips (heel plant, not toe-off).
export const FOOT_CONTACTS={Walking_A:[{phase:.98,foot:'left'},{phase:.48,foot:'right'}],Running_A:[{phase:.15,foot:'left'},{phase:.65,foot:'right'}]};
export class FootstepTracker{
 constructor(){this.previous=null;this.airTime=0;this.wasGrounded=null;this.sinceContact=99;this.steps=0;}
 update({clip,time,duration,dt,speed,grounded,enabled=true}){
  this.sinceContact+=dt;const events=[];
  if(!enabled||dt<=0){this.previous=null;this.airTime=0;this.wasGrounded=grounded;return events;}
  if(!grounded)this.airTime+=dt;
  if(grounded&&this.wasGrounded===false&&this.airTime>.18){events.push({kind:'land',foot:'both',strength:Math.min(1.4,.6+this.airTime)});this.sinceContact=0;}
  if(grounded)this.airTime=0;this.wasGrounded=grounded;
  const markers=FOOT_CONTACTS[clip];
  if(!markers||!grounded||speed<.3){this.previous=null;return events;}
  const phase=time/duration,prev=this.previous;this.previous={clip,phase};
  if(!prev||prev.clip!==clip)return events;
  const wrapped=phase<prev.phase,travel=(wrapped?1:0)+phase-prev.phase;
  // Seeking or switching clips never replays a backlog of footsteps.
  if(travel>.4||travel<=0)return events;
  for(const marker of markers){const crossed=wrapped?marker.phase>prev.phase||marker.phase<=phase:marker.phase>prev.phase&&marker.phase<=phase;
   if(crossed&&this.sinceContact>.18){events.push({kind:'step',foot:marker.foot,phase:marker.phase,clip,strength:clip==='Running_A'?1:.72});this.sinceContact=0;this.steps++;}
  }
  return events;
 }
}
export function armorFoley(kind){return kind==='trail'?'leather':['spellweave','dawn'].includes(kind)?'cloth':'plate';}
export function groundSurfaceAt(biome,x,y,z,kind='ground',minZ=-230){
 if(kind==='bridge')return 'wood';
 if(['crate','barrel','wood','furniture'].includes(kind))return 'wood';
 if(kind!=='ground')return 'stone';
 if(z>=minZ&&((biome==='river'&&inRiver(x,z)&&y<RIVER_LEVEL+.14)||(biome!=='river'&&z<=-15&&Math.abs(x-(-85+Math.sin(z*.032)*9))<11&&y<-1.26)))return 'water';
 if(Math.abs(x)<=33&&z>=-16.5&&z<=32.5&&y<.4)return 'stone';
 if(biome==='snow')return 'snow';
 if(biome==='quarry')return 'stone';
 if(biome==='desert'||Math.abs(x-Math.sin(z*.025)*4)<4&&z<20)return 'dirt';
 return 'grass';
}
