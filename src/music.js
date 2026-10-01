import {Orchestra,loadOrchestra} from './orchestra.js';
import {scoreBar,scoreProfile,musicScene,CASTLE_BARS,MUSIC_TITLES} from './music-score.js';
export class MusicDirector{
 constructor(sound){this.sound=sound;this.ctx=sound.ctx;this.volume=sound.musicVolume;this.scene={id:'castle',kind:'castle',act:1,wave:0,waves:1,key:'castle'};this.state='loading';this.error=null;this.pending=[];this.nextBar=0;this.barsStarted=0;this.currentBar=0;this.elapsed=0;this.paused=false;this.ducked=false;this.history=[];this.nextTime=this.ctx.currentTime+.12;this.bus=this.ctx.createGain();this.bus.gain.value=this.volume;this.bus.connect(sound.compressor);this.timer=setInterval(()=>this.pump(),35);this.ready=this.load();}
 async load(){try{const bank=await loadOrchestra(this.ctx);this.orchestra=new Orchestra(this.ctx,bank,this.bus);this.group=this.orchestra.group();this.state='ready';this.nextTime=this.ctx.currentTime+.12;if(this.paused)this.pauseAt=this.ctx.currentTime;this.pump();return true;}catch(error){this.state='unavailable';this.error=error.message;console.warn('Music could not load:',error.message);return false;}}
 retry(){if(this.state==='unavailable'){this.state='loading';this.error=null;this.ready=this.load();}return this.ready;}
 settings(volume){this.volume=Math.max(0,Math.min(1,Number(volume)||0));this.applyVolume();}
 applyVolume(){this.bus.gain.setTargetAtTime(this.volume*(this.ducked?.52:1),this.ctx.currentTime,.14);}
 update(game){const scene=musicScene(game),changed=scene.id!==this.scene.id||scene.key!==this.scene.key;
 if(changed)this.change(scene,game.battle?.music);else if(scene.wave!==this.scene.wave){this.scene=scene;this.history.push({event:'wave',wave:scene.wave,at:this.ctx.currentTime});this.history=this.history.slice(-30);}
 const battleMenu=!!game.battle&&(!!game.menu||!!game.ui?.modal||game.mode==='title'),hidden=typeof document!=='undefined'&&document.hidden;this.setPaused(battleMenu||hidden);
 const ducked=!!game.menu||!!game.ui?.modal;if(ducked!==this.ducked){this.ducked=ducked;this.applyVolume();}
 }
 change(scene,saved=null){this.scene=scene;const resume=saved&&saved.id===scene.id&&Number.isInteger(saved.bar)&&saved.bar>=0;this.nextBar=resume?saved.bar:0;this.currentBar=this.nextBar;this.resumeBeat=resume?saved.beat||0:0;this.elapsed=resume?Math.max(0,(saved.elapsed||0)-this.resumeBeat*60/scoreBar(scene,this.nextBar).bpm):0;this.barStart=null;this.barsStarted=0;this.pending=[];this.paused=false;this.nextTime=this.ctx.currentTime+.08;if(this.orchestra){this.orchestra.fadeGroup(this.group,.45);this.group=this.orchestra.group();this.group.gain.gain.setValueAtTime(0,this.ctx.currentTime);this.group.gain.gain.linearRampToValueAtTime(1,this.nextTime+.7);}this.history.push({event:'scene',id:scene.id,at:this.ctx.currentTime,resumed:!!resume});this.history=this.history.slice(-30);}
 setPaused(paused){if(paused===this.paused)return;const now=this.ctx.currentTime;if(paused){this.pauseAt=now;this.paused=true;this.resumeVoices=this.group?[...this.group.voices].filter(v=>v.end>now).map(v=>({event:v.event,beat:v.beatSeconds,sample:v.sample,elapsed:v.elapsed+Math.max(0,now-v.start),delay:Math.max(0,v.start-now)})):[];if(this.orchestra){this.orchestra.fadeGroup(this.group,.12);this.group=this.orchestra.group();}}
 else{this.paused=false;const shift=now-this.pauseAt+.04;this.nextTime+=shift;if(this.barStart!==null)this.barStart+=shift;for(const n of this.pending){n.time+=shift;n.group=this.group;}if(this.group){this.group.gain.gain.setValueAtTime(0,now);this.group.gain.gain.linearRampToValueAtTime(1,now+.12);for(const n of this.resumeVoices||[])this.orchestra.note(n.event,now+.04+n.delay,n.beat,this.group,n);}this.resumeVoices=[];}}
 pump(){if(this.state!=='ready'||this.paused||this.ctx.state!=='running')return;const now=this.ctx.currentTime;
 // Don't try to replay missed notes after background throttling.
 if(this.nextTime<now-1){this.nextTime=now+.1;this.pending=[];}
 if(this.nextTime<now+.14){
  const b=scoreBar(this.scene,this.nextBar),beat=60/b.bpm,offset=Math.min(this.resumeBeat||0,b.beats)*beat,start=this.nextTime-offset;
  this.resumeBeat=0;this.barStart=start;this.barBeatSeconds=beat;this.barBeats=b.beats;
  this.pending.push(...b.events.flatMap((e,i)=>{
   const time=start+e.beat*beat+((i%5)-2)*.0015,elapsed=Math.max(0,this.nextTime-time);
   if(offset&&elapsed>e.duration*beat+.2)return [];
   return [{event:e,time:offset?Math.max(time,this.nextTime):time,beat,group:this.group,resume:offset?{elapsed}:undefined}];
  }));
  this.currentBar=this.nextBar;this.barsStarted++;this.nextBar++;this.nextTime=start+b.beats*beat;this.elapsed+=b.beats*beat;this.chapter=b.chapter;this.lastProfile={bpm:b.bpm,intensity:b.intensity,beats:b.beats,events:b.events.length};
  if(this.scene.id==='castle'&&this.nextBar>=CASTLE_BARS)this.nextBar=0;
 }
 const ready=this.pending.filter(n=>n.time<=now+.18);this.pending=this.pending.filter(n=>n.time>now+.18);
 for(const n of ready){if(n.time<now-.15)continue;this.orchestra.note(n.event,Math.max(now+.004,n.time),n.beat,n.group,n.resume);}
 }
 checkpoint(){const now=this.paused?this.pauseAt:this.ctx.currentTime,beat=this.barStart==null?this.resumeBeat||0:Math.max(0,Math.min(this.barBeats,(now-this.barStart)/this.barBeatSeconds));return {id:this.scene.id,bar:this.currentBar,beat,elapsed:this.barStart==null?this.elapsed+beat*60/scoreBar(this.scene,this.currentBar).bpm:Math.max(0,this.elapsed-Math.max(0,this.nextTime-now))};}
 debug(){return {state:this.state,error:this.error,id:this.scene.id,title:MUSIC_TITLES[this.scene.id],bar:this.currentBar,nextBar:this.nextBar,elapsed:this.elapsed,paused:this.paused,volume:this.volume,busGain:this.bus.gain.value,chapter:this.chapter,wave:this.scene.wave,profile:this.lastProfile,...this.orchestra?.debug()};}
 dispose(){clearInterval(this.timer);if(this.orchestra)this.orchestra.fadeGroup(this.group,.1);this.bus.disconnect();}
}
export function validateMusicCheckpoint(m){if(m===undefined)return;if(!m||!Object.hasOwn(MUSIC_TITLES,m.id)||!Number.isInteger(m.bar)||m.bar<0||m.bar>1e7||!Number.isFinite(m.elapsed)||m.elapsed<0||m.elapsed>1e9||(m.beat!==undefined&&(!Number.isFinite(m.beat)||m.beat<0||m.beat>4)))throw Error('Invalid music checkpoint.');}
