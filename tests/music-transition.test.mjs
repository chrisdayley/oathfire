import test from 'node:test';
import assert from 'node:assert/strict';
import {crossfadeGains,MusicDirector,validateMusicCheckpoint} from '../src/music.js';
function deck(track,sceneId='march1',wave=1){
 const gain={value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;}};
 return {track,sceneId,wave,gain:{gain},audio:{paused:false,readyState:4,ended:false,currentTime:31,pause(){this.paused=true;}},samples:new Float32Array(16),analyser:{getFloatTimeDomainData(a){a.fill(.1);}}};
}
function director(){const from=deck('into-the-wilds'),to=deck('legionnaire','march1',2);from.gain.gain.value=1;return Object.assign(Object.create(MusicDirector.prototype),{ctx:{currentTime:5},scene:{id:'march1',kind:'battle',act:1,wave:2},wave:2,elapsed:90,active:1,decks:[from,to],track:to.track,played:[from.track,to.track],preloadNext(){this.preloaded=true;},transition:{from,to,elapsed:0,lead:0,duration:8,resolve(){}}});}
test('Crossfade keeps constant power and smooth monotonic gain without clipping either deck',()=>{
 let prev=0;for(let i=0;i<=100;i++){const [a,b]=crossfadeGains(i/100);assert.ok(Math.abs(a*a+b*b-1)<1e-12);assert.ok(b>=prev&&a>=0&&a<=1&&b<=1);prev=b;}
 assert.deepEqual(crossfadeGains(-1),[1,0]);assert.ok(crossfadeGains(2)[0]<1e-10);assert.ok(crossfadeGains(.001)[1]<.00001);
});
test('A quiet introduction or stalled incoming stream cannot fade the current orchestra out',()=>{
 const m=director(),t=m.transition;t.to.analyser.getFloatTimeDomainData=a=>a.fill(0);
 for(let i=0;i<20;i++)m.advanceTransition(.1);
 assert.equal(t.elapsed,0);assert.equal(t.from.gain.gain.value,1);assert.equal(t.from.audio.paused,false);
 t.to.audio.readyState=2;t.to.analyser.getFloatTimeDomainData=a=>a.fill(.1);m.advanceTransition(1);assert.equal(t.elapsed,0);
 t.to.audio.readyState=4;m.advanceTransition(.5);assert.equal(t.elapsed,.5);assert.ok(t.from.gain.gain.value>.99);
});
test('Both recordings stay alive through the complete eight-second fade; outgoing retires only at its end',()=>{
 const m=director(),t=m.transition;for(let i=0;i<15;i++)m.advanceTransition(.5);
 assert.equal(t.from.audio.paused,false);assert.equal(t.to.audio.paused,false);assert.ok(t.to.gain.gain.value>.99);
 m.advanceTransition(.5);assert.equal(t.from.audio.paused,true);assert.equal(t.to.gain.gain.value,1);assert.equal(m.transition,null);assert.equal(m.preloaded,true);
});
test('Mid-transition saves restore the dominant recording with its wave and correct playhead',()=>{
 const m=director();let save=m.checkpoint();validateMusicCheckpoint(save);assert.equal(save.recording.track,'into-the-wilds');assert.equal(save.recording.wave,1);assert.deepEqual(save.recording.played,['into-the-wilds']);
 m.transition.elapsed=6;save=m.checkpoint();validateMusicCheckpoint(save);assert.equal(save.recording.track,'legionnaire');assert.equal(save.recording.wave,2);assert.equal(save.recording.seconds,31);
});
test('Entering battle cannot save a town recording as battle music, even while still loading',()=>{
 const m=director();m.transition.from.sceneId='castle';m.transition.from.track='three-sheets-to-the-wind';let save=m.checkpoint();assert.equal(save.recording.track,'legionnaire');validateMusicCheckpoint(save);
 m.transition=null;m.active=0;save=m.checkpoint();validateMusicCheckpoint(save);assert.equal(save.recording.track,'into-the-wilds');assert.equal(save.recording.seconds,0);assert.ok(!save.recording.played.includes('three-sheets-to-the-wind'));
});

test('A late buffer stall restores the outgoing recording while the blend clock waits',()=>{
 const m=director(),t=m.transition;m.advanceTransition(7);t.to.audio.readyState=2;m.advanceTransition(.1);
 assert.equal(t.elapsed,7);assert.equal(t.from.gain.gain.value,1);assert.equal(t.to.gain.gain.value,0);
 t.to.audio.readyState=4;m.advanceTransition(.5);assert.equal(t.elapsed,7.5);assert.ok(t.to.gain.gain.value>.9);
});
