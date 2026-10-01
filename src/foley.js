export const SPELL_FAMILIES={fireball:'fire',inferno:'fire',mine:'fire',forgefall:'earth',reversal:'holy',quench:'water',frost:'ice',storm:'storm',thorns:'nature',seedward:'nature',briarstorm:'nature',grove:'nature',verdant:'nature',windstep:'wind',rally:'command',march:'command',step:'holy',bulwark:'earth',sunwall:'holy',tether:'holy',sanctuary:'holy',volley:'wind',guide:'wind',mark:'arcane',overdrive:'arcane',grave:'grave',holy:'holy'};
const WEAPONS=new Set(['sword','spear','hammer','bow','crossbow']);
export function impactMaterial(target){if(!target)return 'stone';if(target.character?.visual?.userData.armorKind)return ['trail','spellweave','dawn'].includes(target.character.visual.userData.armorKind)?'body':'armor';return ['knight','boss'].includes(target.type)||(target.stats?.armor||0)>=12?'armor':'body';}
export function soundPosition(listener,position){if(!position||!listener)return {gain:1,pan:0};const x=position.x-listener.x,z=position.z-listener.z,d=Math.hypot(x,z);return {gain:d>42?0:1/(1+(d/9)**1.6),pan:d<.2?0:Math.max(-.85,Math.min(.85,(x*Math.cos(listener.yaw)-z*Math.sin(listener.yaw))/Math.max(3,d)))};}
export class Foley{
 constructor(sound){this.sound=sound;this.ctx=sound.ctx;this.state='loading';this.voices=new Set();this.choices=new Map();this.history=[];this.maxVoices=0;this.dropped=0;this.limits=new Map();this.listener=null;this.serial=0;this.footVolume=.65;this.ready=this.load();}
 async load(){try{const base=(import.meta.env?.BASE_URL||'/')+'sfx/',r=await fetch(base+'foley.json');if(!r.ok)throw Error('Foley manifest '+r.status);const manifest=await r.json(),buffers={};await Promise.all(Object.entries(manifest.banks).map(async([id,bank])=>{const response=await fetch(base+bank.file);if(!response.ok)throw Error('Foley '+id+' '+response.status);buffers[id]=await this.ctx.decodeAudioData(await response.arrayBuffer());}));this.manifest=manifest;this.buffers=buffers;this.state='ready';this.error=null;return true;}catch(e){this.state='unavailable';this.error=e.message;console.warn('Sound effects could not load:',e.message);return false;}}
 retry(){if(this.state==='unavailable'){this.state='loading';this.ready=this.load();}return this.ready;}
 log(event){this.history.push({at:this.ctx.currentTime,...event});if(this.history.length>160)this.history.shift();}
 cue(key,{gain=1,pan=0,pitch=1,delay=0,priority=1,tag=null}={}){
  if(this.state!=='ready'||this.ctx.state!=='running'||gain<=.001)return false;
  const clip=this.manifest.clips[key];if(!clip)return false;
  if(this.voices.size>=40){const expendable=[...this.voices].find(v=>v.priority<priority);if(expendable){expendable.source.stop();this.voices.delete(expendable);}else{this.dropped++;return false;}}
  const index=((this.choices.get(key)??-1)+1)%clip.variants.length;this.choices.set(key,index);const v=clip.variants[index],source=this.ctx.createBufferSource(),volume=this.ctx.createGain(),panner=this.ctx.createStereoPanner(),start=this.ctx.currentTime+delay;
  source.buffer=this.buffers[clip.bank];source.playbackRate.value=pitch;source.loop=false;volume.gain.value=Math.min(1.5,gain);panner.pan.value=pan;source.connect(volume);volume.connect(panner);panner.connect(this.sound.master);
  const voice={source,volume,panner,priority,key,start,end:start+v.duration/pitch};this.voices.add(voice);this.maxVoices=Math.max(this.maxVoices,this.voices.size);source.onended=()=>{this.voices.delete(voice);source.disconnect();volume.disconnect();panner.disconnect();};source.start(start,v.offset,v.duration);this.log({key,index,gain,pan,pitch,tag});return true;
 }
 limited(key,seconds){const now=this.ctx.currentTime,last=this.limits.get(key)??-100;if(now-last<seconds)return true;this.limits.set(key,now);return false;}
 footstep({surface,armor='plate',foot='left',kind='step',strength=1,speed=4,clip,phase}){
  if(this.state!=='ready')return;const landing=kind==='land',power=this.footVolume*(landing?.75:.40)*strength,pan=foot==='left'?-.07:foot==='right'?.07:0;
  this.cue('step-'+surface,{gain:power,pan,pitch:landing?.89:.97+(this.serial++%5)*.015,priority:3,tag:'foot-contact'});
  this.cue('gear-'+armor,{gain:this.footVolume*(armor==='plate'?.21:.15)*(landing?1.2:strength),pan:-pan*.5,pitch:.95+(this.serial%4)*.022,delay:.018,priority:2,tag:'armor-movement'});
  this.log({event:'footfall',kind,surface,armor,foot,speed,clip,phase});
 }
 play(name,power=1,options={}){
  if(this.state!=='ready')return false;
  const spatial=soundPosition(this.listener,options.position),gain=spatial.gain*power,pan=spatial.pan;
  if(WEAPONS.has(name)||name==='bolt'){
   const weapon=name==='bolt'?'crossbow':name,heavy=options.heavy??power>1;
   if(!this.limited('swing-'+weapon+(power<.4?'army':''),power<.4?.10:.025))this.cue('swing-'+weapon+(heavy?'-heavy':''),{gain:gain*.48,pan,pitch:.97+(this.serial++%4)*.02,priority:power>=.5?3:1});return true;
  }
  if(SPELL_FAMILIES[name]){
   const rank=Math.max(1,Math.min(5,options.rank||1));if(this.limited('cast-'+name,power<.4?.18:.035))return true;
   this.cue('cast-'+name,{gain:gain*.72,pan,priority:power>=.5?4:1,tag:'spell-rank-'+rank});
   if(rank>=2)this.cue('rank-'+SPELL_FAMILIES[name],{gain:gain*(rank>=3?.32:.18),pan:-pan*.4,pitch:rank>=3?.84:1.12,delay:.12,priority:power>=.5?3:1,tag:'rank-resonance'});
   return true;
  }
  if(name==='shell'||name==='stone'){this.cue('impact-'+name,{gain:gain*.75,pan,priority:2});return true;}
  return false;
 }
 impact({weapon='sword',element=null,target=null,position,heavy=false,hero=false,kind='stone'}){
  const spatial=soundPosition(this.listener,position),material=target?impactMaterial(target):['bridge','wood','crate','barrel','gate'].includes(kind)?'wood':'stone';
  const key=element&&['fire','frost','storm','water','nature','holy','grave','stone','shell'].includes(element)?'impact-'+element:'hit-'+(WEAPONS.has(weapon)?weapon:'sword')+'-'+material;
  if(this.limited(key,hero?.035:.09))return;this.cue(key,{gain:spatial.gain*(hero?.83:.35)*(heavy?1.22:1),pan:spatial.pan,pitch:heavy?.88:.98+(this.serial++%3)*.018,priority:hero?4:1,tag:target?'confirmed-hit':'world-contact'});
 }
 parry(position,perfect=false){const spatial=soundPosition(this.listener,position);if(!this.limited('parry',.07))this.cue('parry',{gain:spatial.gain*(perfect?1:.66),pan:spatial.pan,pitch:perfect?1.13:.97,priority:4,tag:perfect?'perfect-block':'block'});}
 stop(){const now=this.ctx.currentTime;for(const v of this.voices){v.volume.gain.cancelScheduledValues(now);v.volume.gain.setTargetAtTime(0,now,.012);try{v.source.stop(now+.06);}catch{}}}
 debug(){return {state:this.state,error:this.error,voices:this.voices.size,maxVoices:this.maxVoices,dropped:this.dropped,banks:Object.keys(this.buffers||{}).length,cues:Object.keys(this.manifest?.clips||{}).length,decodedMB:Math.round(Object.values(this.buffers||{}).reduce((s,b)=>s+b.length*b.numberOfChannels*4,0)/104857.6)/10};}
}
