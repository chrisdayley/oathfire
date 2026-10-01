// Real sampled orchestral instruments, a shared concert-hall reverb, and scheduled note envelopes.
// Production assets are public files, not source-relative bundles.
const assetBase=()=> (import.meta.env?.BASE_URL||'/')+'music/chamber/';
const PERCUSSION=new Set(['snare','drum','cymbal','triangle']);
const PLUCKED=new Set(['pizzicato','spiccato','celloshort','brassshort','harp','glock','celesta','bell','timpani',...PERCUSSION]);
const GAINS={violin:.52,solo:.67,spiccato:.54,celloshort:.5,brassshort:.43,celesta:.35,viola:.47,cello:.52,bass:.65,pizzicato:.59,harp:.55,flute:.43,oboe:.43,clarinet:.43,bassoon:.46,horn:.58,trumpet:.47,trombone:.54,tuba:.65,timpani:.66,glock:.35,bell:.42,snare:.48,drum:.82,cymbal:.35,triangle:.32};
export async function loadOrchestra(context,base=assetBase()){
 const response=await fetch(base+'orchestra.json');if(!response.ok)throw Error('Orchestra manifest: '+response.status);const manifest=await response.json(),buffers={},entries=Object.entries(manifest.instruments);let next=0;
 await Promise.all(Array.from({length:4},async()=>{while(next<entries.length){const [id,entry]=entries[next++],r=await fetch(base+entry.file);if(!r.ok)throw Error('Orchestra '+id+': '+r.status);buffers[id]=await context.decodeAudioData(await r.arrayBuffer());}}));
 return {manifest,buffers};
}
export function hallImpulse(context){const rate=context.sampleRate,length=Math.floor(rate*2.65),buffer=context.createBuffer(2,length,rate);let seed=83107;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296*2-1;};for(let c=0;c<2;c++){const d=buffer.getChannelData(c);let low=0;for(let i=0;i<length;i++){low=low*.55+random()*.45;const seconds=i/rate;d[i]=seconds<.026?0:low*Math.pow(1-i/length,2.8)*.45;}for(const [time,amplitude]of [[.033,.22],[.054,.15],[.089,.10],[.127,.07]])d[Math.floor((time+c*.004)*rate)]+=amplitude;}return buffer;}
export class Orchestra{
 constructor(context,bank,destination){this.ctx=context;this.bank=bank;this.voices=new Set();this.maxVoices=0;this.notesPlayed=0;this.serial=0;this.groups=new Set();this.output=context.createGain();this.output.gain.value=1.30;this.output.connect(destination);this.dry=context.createGain();this.dry.gain.value=.92;this.dry.connect(this.output);this.reverb=context.createConvolver();this.reverb.buffer=hallImpulse(context);this.wet=context.createGain();this.wet.gain.value=.32;this.reverb.connect(this.wet);this.wet.connect(this.output);}
 group(){const gain=this.ctx.createGain();gain.connect(this.dry);const send=this.ctx.createGain();send.gain.value=.66;gain.connect(send);send.connect(this.reverb);const group={gain,send,voices:new Set(),retired:false};this.groups.add(group);return group;}
 note(event,when,beatSeconds,group,resume={}){
  if(group.retired||this.voices.size>=112)return false;
  const definition=this.bank.manifest.instruments[event.instrument],buffer=this.bank.buffers[event.instrument];if(!definition||!buffer)return false;
  const percussion=PERCUSSION.has(event.instrument),layer=event.velocity>.69?'forte':'soft';
  const candidates=definition.samples.filter(s=>!s.layer||s.layer==='all'||s.layer===layer),pool=candidates.length?candidates:definition.samples;
  const distance=Math.min(...pool.map(s=>Math.abs(s.root-event.pitch))),ranked=percussion?pool:pool.filter(s=>Math.abs(s.root-event.pitch)===distance),sample=resume.sample||ranked[this.serial++%ranked.length];
  const variation=((this.serial*17)%11-5)*.7,rate=percussion?1:2**((event.pitch-sample.root+(sample.tune||0)/100+variation/100)/12),plucked=PLUCKED.has(event.instrument),elapsed=resume.elapsed||0;
  const duration=Math.max(.01,event.duration*beatSeconds-elapsed),looping=!plucked&&sample.loopEnd>sample.loopStart,available=looping?duration+1:sample.duration/rate-elapsed;if(available<=.025)return false;
  const release=event.instrument==='cymbal'?1.7:plucked?Math.min(1,available*.25):event.legato?.22:.42,hold=Math.min(duration,Math.max(.03,available-release)),end=when+Math.min(available,hold+release);
  const source=this.ctx.createBufferSource(),envelope=this.ctx.createGain(),pan=this.ctx.createStereoPanner(),filter=this.ctx.createBiquadFilter();source.buffer=buffer;source.playbackRate.value=rate;source.loop=looping;if(looping){source.loopStart=sample.loopStart;source.loopEnd=sample.loopEnd;}
  const gain=event.velocity*(GAINS[event.instrument]||.5)*(event.role==='melody'?1.12:1),attack=plucked?.003:Math.min(event.legato?.035:.11,hold*.22),swell=event.expression||.1;
  envelope.gain.setValueAtTime(0,when);envelope.gain.linearRampToValueAtTime(gain*(1-swell*.45),when+attack);envelope.gain.linearRampToValueAtTime(gain*(1+swell*.3),when+Math.max(attack,hold*.58));envelope.gain.linearRampToValueAtTime(gain*(1-swell*.4),when+hold);envelope.gain.setTargetAtTime(.00001,when+hold,release/5);
  filter.type='lowpass';filter.frequency.setValueAtTime(percussion?14500:4800+event.velocity*8500,when);filter.Q.value=.15;pan.pan.value=event.pan||0;source.connect(filter);filter.connect(envelope);envelope.connect(pan);pan.connect(group.gain);
  const voice={source,envelope,pan,filter,group,start:when,end,event,beatSeconds,sample,elapsed};this.voices.add(voice);group.voices.add(voice);this.notesPlayed++;this.maxVoices=Math.max(this.maxVoices,this.voices.size);
  source.onended=()=>{source.disconnect();filter.disconnect();envelope.disconnect();pan.disconnect();this.voices.delete(voice);group.voices.delete(voice);};
  let offset=sample.offset+elapsed*rate;if(looping&&offset>=sample.loopEnd)offset=sample.loopStart+(offset-sample.loopStart)%(sample.loopEnd-sample.loopStart);
  source.start(when,offset);source.stop(end+.01);return true;
 }
 fadeGroup(group,seconds=.8){if(!group||group.retired)return;group.retired=true;const t=this.ctx.currentTime;group.gain.gain.cancelScheduledValues(t);group.gain.gain.setValueAtTime(group.gain.gain.value,t);group.gain.gain.linearRampToValueAtTime(0,t+seconds);for(const v of group.voices)try{v.source.stop(t+seconds+.02);}catch{}const release=()=>{group.gain.disconnect();group.send.disconnect();this.groups.delete(group);};if(typeof setTimeout==='function')setTimeout(release,(seconds+.1)*1000);}
 cancelFuture(group,now=this.ctx.currentTime){for(const v of [...group.voices])if(v.start>now)try{v.source.stop(now);}catch{}}
 debug(){return {loaded:Object.keys(this.bank.buffers).length,voices:this.voices.size,maxVoices:this.maxVoices,notes:this.notesPlayed,decodedMB:Math.round(Object.values(this.bank.buffers).reduce((n,b)=>n+b.length*b.numberOfChannels*4,0)/104857.6)/10};}
}
