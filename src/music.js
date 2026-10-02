import {musicScene,MUSIC_TITLES} from './music-score.js';
import {RECORDINGS,RECORDING_TITLES,cuePlan,waveCue,validateRecordingCheckpoint} from './recorded-score.js';
// A silent PCM frame primes both reusable HTML media decks during the first gesture.
const SILENCE='data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==';
// Finished, licensed stereo orchestral mixes streamed through two reusable decks.
// Battle cues move forward; only the 3:20 castle piece loops. No pitched-note synthesis.
export class MusicDirector{
 constructor(sound){this.sound=sound;this.ctx=sound.ctx;this.volume=sound.musicVolume;this.scene={id:'castle',kind:'castle',act:1,wave:0,waves:1,key:'castle'};this.state='loading';this.error=null;this.paused=false;this.ducked=false;this.played=[];this.history=[];this.elapsed=0;this.wave=0;this.active=0;this.serial=0;this.bus=this.ctx.createGain();this.bus.gain.value=this.volume*.64;this.bus.connect(sound.compressor);this.decks=[0,1].map(()=>{const audio=new Audio();audio.preload='auto';audio.playsInline=true;const gain=this.ctx.createGain();gain.gain.value=0;const source=this.ctx.createMediaElementSource(audio);source.connect(gain);gain.connect(this.bus);return {audio,gain,source,token:0};});this.lastTime=this.ctx.currentTime;this.timer=setInterval(()=>this.pump(),100);this.prime();this.ready=this.start('three-sheets-to-the-wind',0,true);}
 settings(volume){this.volume=Math.max(0,Math.min(1,Number(volume)||0));this.applyVolume();}
 applyVolume(){this.bus.gain.setTargetAtTime(this.volume*.64*(this.ducked?.58:1),this.ctx.currentTime,.18);}
 prime(){for(const deck of this.decks){deck.audio.src=SILENCE;const token=deck.token;deck.audio.play().then(()=>{if(deck.token===token)deck.audio.pause();}).catch(()=>{});}}
 // Called synchronously by a trusted tap/key; also repairs an externally paused media deck.
 activate(){if(this.state==='unavailable')return this.retry();if(this.state==='ready'&&!this.paused&&this.decks[this.active].audio.paused)this.playActive();return this.ready;}
 playActive(){const serial=this.serial;this.decks[this.active].audio.play().catch(e=>{if(serial===this.serial&&!this.paused){this.state='unavailable';this.error=e.message;}});}
 retry(){if(this.state==='unavailable'){const cue=this.pendingCue||{track:this.track||cuePlan(this.scene)[0],seconds:this.decks[this.active].audio.currentTime||this.position||0};this.error=null;this.ready=this.start(cue.track,cue.seconds,true);}return this.ready;}
 async start(track,seconds=0,initial=false){
  this.pendingCue={track,seconds};const serial=++this.serial,index=initial?this.active:1-this.active,deck=this.decks[index],old=this.decks[this.active];deck.token=serial;deck.audio.pause();deck.gain.gain.cancelScheduledValues(this.ctx.currentTime);deck.gain.gain.setValueAtTime(0,this.ctx.currentTime);deck.audio.src=import.meta.env.BASE_URL+'music/recordings/'+track+'.m4a';deck.audio.loop=this.scene.id==='castle';this.state='loading';
  try{
   await new Promise((resolve,reject)=>{const done=()=>{clearTimeout(timer);deck.audio.removeEventListener('loadedmetadata',done);deck.audio.removeEventListener('error',fail);resolve();};const fail=()=>{clearTimeout(timer);deck.audio.removeEventListener('loadedmetadata',done);deck.audio.removeEventListener('error',fail);reject(Error('Orchestral recording unavailable.'));};const timer=setTimeout(fail,25000);deck.audio.addEventListener('loadedmetadata',done,{once:true});deck.audio.addEventListener('error',fail,{once:true});deck.audio.load();
    // Do not wait for network metadata before asking the browser to play: that loses user activation.
    if(!this.paused)deck.audio.play().catch(()=>{});});
   if(serial!==this.serial)return false;deck.audio.currentTime=Math.min(seconds,Math.max(0,RECORDINGS[track].seconds-.1));
   // play() reuses media elements activated by the user's sound gesture.
   if(!this.paused)await deck.audio.play();if(serial!==this.serial){if(deck.token===serial)deck.audio.pause();return false;}
   this.active=index;this.track=track;this.pendingCue=null;this.position=seconds;this.state='ready';this.error=null;if(!this.played.includes(track))this.played.push(track);this.chapter=RECORDINGS[track].title+' · Scott Buckley';this.history.push({event:'cue',track,wave:this.scene.wave,seconds});this.history=this.history.slice(-30);
   const now=this.ctx.currentTime;deck.gain.gain.setValueAtTime(initial?1:0,now);deck.gain.gain.linearRampToValueAtTime(1,now+(initial?.04:1.6));if(old!==deck){old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(old.gain.gain.value,now);old.gain.gain.linearRampToValueAtTime(0,now+1.6);const oldToken=old.token;setTimeout(()=>{if(old.token===oldToken&&this.decks[this.active]!==old)old.audio.pause();},1700);}return true;
  }catch(e){if(serial===this.serial){this.state='unavailable';this.error=e.message;console.warn('Music:',e.message);}return false;}
 }
 update(game){const scene=musicScene(game);if(scene.id!==this.scene.id||scene.key!==this.scene.key)this.change(scene,game.battle?.music);else this.scene=scene;this.setPaused((!!game.battle&&(!!game.menu||!!game.ui?.modal||game.mode==='title'))||document.hidden);const ducked=!!game.menu||!!game.ui?.modal;if(ducked!==this.ducked){this.ducked=ducked;this.applyVolume();}}
 change(scene,saved=null){this.scene=scene;const r=saved?.id===scene.id?saved.recording:null;this.elapsed=saved?.id===scene.id?saved.elapsed||0:0;this.played=r?[...r.played]:[];this.wave=r?.wave??(scene.wave||0);const track=r?.track||cuePlan(scene)[0],seconds=r?.seconds||(scene.id==='victory'?137:scene.id==='defeat'?0:0);this.ready=this.start(track,seconds);}
 setPaused(paused){if(paused===this.paused)return;this.paused=paused;this.lastTime=this.ctx.currentTime;if(paused){for(const d of this.decks)d.audio.pause();}else if(this.state==='ready')this.playActive();}
 pump(){const now=this.ctx.currentTime,dt=Math.max(0,Math.min(.5,now-this.lastTime));this.lastTime=now;if(this.paused||this.state!=='ready'||this.ctx.state!=='running')return;const deck=this.decks[this.active];if(!deck.audio.paused)this.elapsed+=dt;this.position=deck.audio.currentTime;
  if((this.scene.wave||0)>this.wave){this.wave=this.scene.wave;const next=waveCue(this.scene,this.played);if(next){this.ready=this.start(next);return;}}
  if(!deck.audio.loop&&deck.audio.duration&&deck.audio.currentTime>deck.audio.duration-2.0){const next=cuePlan(this.scene).find(id=>!this.played.includes(id));if(next)this.ready=this.start(next);}
 }
 checkpoint(){const cue=this.pendingCue||{track:this.track,seconds:this.decks[this.active].audio.currentTime||0};return {id:this.scene.id,bar:Math.floor(this.elapsed/2),beat:0,elapsed:this.elapsed,...(cue.track?{recording:{track:cue.track,seconds:cue.seconds,played:[...new Set([...this.played,cue.track])],wave:this.wave}}:{})};}
 debug(){return {state:this.state,error:this.error,context:this.ctx.state,id:this.scene.id,title:RECORDING_TITLES[this.scene.id],track:this.track,bar:Math.floor(this.elapsed/2),elapsed:this.elapsed,paused:this.paused,volume:this.volume,busGain:this.bus.gain.value,chapter:this.chapter,wave:this.scene.wave,played:[...this.played],recorded:true,position:this.decks[this.active].audio.currentTime,duration:this.decks[this.active].audio.duration,activeDecks:this.decks.filter(d=>!d.audio.paused).length,profile:{intensity:Math.min(1,.35+(this.scene.wave||0)*.15)}};}
 dispose(){clearInterval(this.timer);this.serial++;for(const d of this.decks){d.audio.pause();d.audio.removeAttribute('src');d.audio.load();d.source.disconnect();d.gain.disconnect();}this.bus.disconnect();}
}
export function validateMusicCheckpoint(m){if(m===undefined)return;if(!m||!Object.hasOwn(MUSIC_TITLES,m.id)||!Number.isInteger(m.bar)||m.bar<0||m.bar>1e7||!Number.isFinite(m.elapsed)||m.elapsed<0||m.elapsed>1e9||(m.beat!==undefined&&(!Number.isFinite(m.beat)||m.beat<0||m.beat>4)))throw Error('Invalid music checkpoint.');validateRecordingCheckpoint(m.recording);}
