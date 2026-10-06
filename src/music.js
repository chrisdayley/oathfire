import {musicScene,MUSIC_TITLES} from './music-score.js';
import {RECORDINGS,RECORDING_TITLES,cuePlan,waveCue,validateRecordingCheckpoint} from './recorded-score.js';
// A silent PCM frame primes both reusable HTML media decks during the first gesture.
export function crossfadeGains(progress){const t=Math.max(0,Math.min(1,progress));const smooth=t*t*(3-2*t);return [Math.cos(smooth*Math.PI/2),Math.sin(smooth*Math.PI/2)];}
const SILENCE='data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==';
// Finished, licensed stereo orchestral mixes streamed through two reusable decks.
// Battle cues move forward; only the 3:20 castle piece loops. No pitched-note synthesis.
export class MusicDirector{
 constructor(sound){this.sound=sound;this.ctx=sound.ctx;this.volume=sound.musicVolume;this.scene={id:'castle',kind:'castle',act:1,wave:0,waves:1,key:'castle'};this.state='loading';this.error=null;this.paused=false;this.ducked=false;this.played=[];this.history=[];this.elapsed=0;this.wave=0;this.active=0;this.serial=0;this.request=0;this.transition=null;this.bus=this.ctx.createGain();this.bus.gain.value=this.volume*.64;this.bus.connect(sound.compressor);this.decks=[0,1].map(()=>{const audio=new Audio();audio.preload='auto';audio.playsInline=true;const gain=this.ctx.createGain();gain.gain.value=0;const source=this.ctx.createMediaElementSource(audio);const analyser=this.ctx.createAnalyser();analyser.fftSize=1024;source.connect(analyser);analyser.connect(gain);gain.connect(this.bus);return {audio,gain,source,analyser,samples:new Float32Array(1024),token:0,track:null};});this.lastTime=this.ctx.currentTime;this.timer=setInterval(()=>this.pump(),100);this.prime();this.ready=this.start('three-sheets-to-the-wind',0,true);}
 settings(volume){this.volume=Math.max(0,Math.min(1,Number(volume)||0));this.applyVolume();}
 applyVolume(){this.bus.gain.setTargetAtTime(this.volume*.64*(this.ducked?.58:1),this.ctx.currentTime,.18);}
 prime(){for(const deck of this.decks){deck.audio.src=SILENCE;const token=deck.token;deck.audio.play().then(()=>{if(deck.token===token)deck.audio.pause();}).catch(()=>{});}}
 // Called synchronously by a trusted tap/key; also repairs an externally paused media deck.
 activate(){if(this.state==='unavailable'||(this.error&&this.pendingCue))return this.retry();if(this.state==='ready'&&!this.paused&&this.decks[this.active].audio.paused)this.playActive();return this.ready;}
 playActive(){if(this.decks[this.active].audio.ended)return;const serial=this.serial;this.decks[this.active].audio.play().catch(e=>{if(serial===this.serial&&!this.paused){this.state='unavailable';this.error=e.message;}});}
 retry(){if(this.state==='unavailable'||(this.error&&this.pendingCue)){const cue=this.pendingCue||{track:this.track||cuePlan(this.scene)[0],seconds:this.decks[this.active].audio.currentTime||this.position||0};const initial=this.state==='unavailable';this.error=null;this.ready=this.start(cue.track,cue.seconds,initial);}return this.ready;}
 async start(track,seconds=0,initial=false){
  const request=++this.request;
  // Never reclaim the outgoing player while its fade is still audible.
  if(this.transition)await this.transition.finished;
  if(request!==this.request)return false;
  const serial=++this.serial,index=initial?this.active:1-this.active,deck=this.decks[index],old=this.decks[this.active];
  this.pendingCue={track,seconds};deck.token=serial;deck.audio.pause();deck.gain.gain.cancelScheduledValues(this.ctx.currentTime);deck.gain.gain.setValueAtTime(0,this.ctx.currentTime);deck.audio.loop=this.scene.id==='castle';this.state='loading';
  try{
   if(deck.track!==track){deck.audio.src=import.meta.env.BASE_URL+'music/recordings/'+track+'.m4a';deck.track=track;deck.audio.load();}
   // play() is requested during the gesture too; the prior track keeps playing
   // through network/decode delays. A metadata event alone is not playable audio.
   if(!this.paused)deck.audio.play().catch(()=>{});
   await this.mediaReady(deck.audio);
   if(serial!==this.serial)return false;
   deck.audio.currentTime=Math.min(seconds,Math.max(0,RECORDINGS[track].seconds-.1));
   if(!this.paused)await deck.audio.play();
   if(serial!==this.serial){if(deck.token===serial)deck.audio.pause();return false;}
   deck.sceneId=this.scene.id;deck.wave=this.wave;this.active=index;this.track=track;this.pendingCue=null;this.position=seconds;this.state='ready';this.error=null;
   if(!this.played.includes(track))this.played.push(track);
   this.chapter=RECORDINGS[track].title+' · Scott Buckley';this.history.push({event:'cue',track,wave:this.scene.wave,seconds});this.history=this.history.slice(-30);
   const now=this.ctx.currentTime;
   if(initial||old===deck||!old.track){deck.gain.gain.setValueAtTime(1,now);this.preloadNext();}
   else{
    let resolve;const finished=new Promise(done=>resolve=done);
    this.transition={from:old,to:deck,elapsed:0,lead:0,duration:this.scene.kind==='battle'?8:5,finished,resolve};
    old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(1,now);deck.gain.gain.setValueAtTime(0,now);
   }
   return true;
  }catch(e){
   if(serial===this.serial){deck.audio.pause();this.error=e.message;
    // A missing next recording must not silence the one already playing.
    if(old!==deck&&old.track&&!old.audio.ended){this.active=this.decks.indexOf(old);this.track=old.track;this.state='ready';old.gain.gain.setValueAtTime(1,this.ctx.currentTime);}
    else this.state='unavailable';console.warn('Music:',e.message);
   }return false;
  }
 }
 mediaReady(audio){
  if(audio.readyState>=3)return Promise.resolve();
  return new Promise((resolve,reject)=>{const clean=()=>{clearTimeout(timer);audio.removeEventListener('canplay',done);audio.removeEventListener('error',fail);};const done=()=>{clean();resolve();},fail=()=>{clean();reject(Error('Orchestral recording unavailable.'));};const timer=setTimeout(fail,25000);audio.addEventListener('canplay',done,{once:true});audio.addEventListener('error',fail,{once:true});});
 }
 preloadNext(){
  if(this.transition||this.state!=='ready'||this.scene.id==='castle')return;
  const next=cuePlan(this.scene).find(id=>!this.played.includes(id));if(!next)return;
  const deck=this.decks[1-this.active];if(deck.track===next)return;
  deck.audio.pause();deck.gain.gain.setValueAtTime(0,this.ctx.currentTime);deck.track=next;deck.audio.src=import.meta.env.BASE_URL+'music/recordings/'+next+'.m4a';deck.audio.load();
 }
 advanceTransition(dt){
  const t=this.transition;if(!t)return;
  // Keep the previous orchestra audible through a quiet intro or buffer stall.
  if(t.to.audio.paused||t.to.audio.readyState<3){
   if(t.elapsed>0){const now=this.ctx.currentTime;for(const [deck,value]of [[t.from,1],[t.to,0]]){deck.gain.gain.cancelScheduledValues(now);deck.gain.gain.setTargetAtTime(value,now,.15);}}
   return;
  }
  if(t.elapsed===0){
   t.lead+=dt;t.to.analyser.getFloatTimeDomainData(t.to.samples);let energy=0;for(const x of t.to.samples)energy+=x*x;
   if(Math.sqrt(energy/t.to.samples.length)<.008&&t.lead<10&&!t.from.audio.ended)return;
  }
  t.elapsed=Math.min(t.duration,t.elapsed+dt);const p=t.elapsed/t.duration,now=this.ctx.currentTime;
  const [outgoing,incoming]=crossfadeGains(p);
  for(const [deck,value]of [[t.from,outgoing],[t.to,incoming]]){deck.gain.gain.cancelScheduledValues(now);deck.gain.gain.setValueAtTime(deck.gain.gain.value,now);deck.gain.gain.linearRampToValueAtTime(value,now+.11);}
  if(p===1){t.from.audio.pause();t.from.gain.gain.setValueAtTime(0,now);t.to.gain.gain.setValueAtTime(1,now);this.transition=null;t.resolve();this.preloadNext();}
 }
 update(game){const scene=musicScene(game);if(scene.id!==this.scene.id||scene.key!==this.scene.key)this.change(scene,game.battle?.music);else this.scene=scene;this.setPaused((!!game.battle&&(!!game.menu||!!game.ui?.modal||game.mode==='title'))||document.hidden);const ducked=!!game.menu||!!game.ui?.modal;if(ducked!==this.ducked){this.ducked=ducked;this.applyVolume();}}
 change(scene,saved=null){this.scene=scene;const r=saved?.id===scene.id?saved.recording:null;this.elapsed=saved?.id===scene.id?saved.elapsed||0:0;this.played=r?[...r.played]:[];this.wave=r?.wave??(scene.wave||0);const track=r?.track||cuePlan(scene)[0],seconds=r?.seconds||(scene.id==='victory'?137:scene.id==='defeat'?0:0);this.ready=this.start(track,seconds);}
 setPaused(paused){if(paused===this.paused)return;this.paused=paused;this.lastTime=this.ctx.currentTime;if(paused){for(const d of this.decks)d.audio.pause();}else if(this.decks[this.active].track){this.playActive();if(this.transition)this.transition.from.audio.play().catch(()=>{});}}
 pump(){const now=this.ctx.currentTime,dt=Math.max(0,Math.min(.5,now-this.lastTime));this.lastTime=now;if(this.paused||this.state!=='ready'||this.ctx.state!=='running')return;const deck=this.decks[this.active];if(!deck.audio.paused)this.elapsed+=dt;this.position=deck.audio.currentTime;this.advanceTransition(dt);if(this.transition)return;
  if((this.scene.wave||0)>this.wave){this.wave=this.scene.wave;const next=waveCue(this.scene,this.played);if(next){this.ready=this.start(next);return;}}
  if(!deck.audio.loop&&deck.audio.duration&&deck.audio.currentTime>deck.audio.duration-22.0){const next=cuePlan(this.scene).find(id=>!this.played.includes(id));if(next)this.ready=this.start(next);}
 }
 checkpoint(){const t=this.transition,audible=t&&t.from.sceneId===this.scene.id&&t.elapsed<t.duration*.5?t.from:this.decks[this.active],sameScene=audible.sceneId===this.scene.id;const cue={track:sameScene?audible.track:cuePlan(this.scene)[0],seconds:sameScene?audible.audio.currentTime||0:0};return {id:this.scene.id,bar:Math.floor(this.elapsed/2),beat:0,elapsed:this.elapsed,recording:{...cue,played:[...new Set([...this.played.filter(id=>cuePlan(this.scene).includes(id)&&(id!==t?.to.track||id===cue.track)),cue.track])],wave:sameScene?audible.wave??this.wave:this.scene.wave||0}};}
 debug(){return {state:this.state,error:this.error,context:this.ctx.state,id:this.scene.id,title:RECORDING_TITLES[this.scene.id],track:this.track,bar:Math.floor(this.elapsed/2),elapsed:this.elapsed,paused:this.paused,volume:this.volume,busGain:this.bus.gain.value,chapter:this.chapter,wave:this.scene.wave,played:[...this.played],recorded:true,position:this.decks[this.active].audio.currentTime,duration:this.decks[this.active].audio.duration,activeDecks:this.decks.filter(d=>!d.audio.paused).length,transition:this.transition?{seconds:this.transition.elapsed,duration:this.transition.duration,from:this.transition.from.track,to:this.transition.to.track}:null,profile:{intensity:Math.min(1,.35+(this.scene.wave||0)*.15)}};}
 dispose(){clearInterval(this.timer);this.serial++;this.request++;this.transition?.resolve();for(const d of this.decks){d.audio.pause();d.audio.removeAttribute('src');d.audio.load();d.source.disconnect();d.analyser.disconnect();d.gain.disconnect();}this.bus.disconnect();}
}
export function validateMusicCheckpoint(m){if(m===undefined)return;if(!m||!Object.hasOwn(MUSIC_TITLES,m.id)||!Number.isInteger(m.bar)||m.bar<0||m.bar>1e7||!Number.isFinite(m.elapsed)||m.elapsed<0||m.elapsed>1e9||(m.beat!==undefined&&(!Number.isFinite(m.beat)||m.beat<0||m.beat>4)))throw Error('Invalid music checkpoint.');validateRecordingCheckpoint(m.recording);}
