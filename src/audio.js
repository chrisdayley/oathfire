import {MusicDirector} from './music.js';
// Original SFX synthesis and score, with a locally hosted CC0 sampled orchestra.
export class Soundscape{
 constructor(){this.ctx=null;this.volume=.55;this.musicVolume=.5;this.history=[];this.lastFoot=0;this.music=null;}
 async unlock(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.volume;this.compressor=this.ctx.createDynamicsCompressor();this.compressor.threshold.value=-15;this.compressor.ratio.value=5;this.master.connect(this.compressor);this.compressor.connect(this.ctx.destination);this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);const d=this.noise.getChannelData(0);let pink=0;for(let i=0;i<d.length;i++){pink=.96*pink+.04*(Math.random()*2-1);d[i]=pink*3;}}
 if(this.ctx?.state==='suspended')await this.ctx.resume();if(!this.music)this.music=new MusicDirector(this);else this.music.retry();}
 settings(s){this.volume=s.volume;this.musicVolume=s.music;if(this.master)this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.08);this.music?.settings(this.musicVolume);}
 tone(f,dur=.2,type='sine',gain=.12,delay=0,end=null){if(!this.ctx||this.ctx.state!=='running')return;let t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(15,end),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.03);}
 hiss(dur=.25,gain=.25,filter='highpass',freq=1100,delay=0,end=350){if(!this.ctx||this.ctx.state!=='running')return;const t=this.ctx.currentTime+delay,b=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();b.buffer=this.noise;f.type=filter;f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(end,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);b.connect(f);f.connect(g);g.connect(this.master);b.start(t,Math.random());b.stop(t+dur+.03);}
 play(name,power=1){if(!this.ctx)return;this.history.push({name,t:this.ctx.currentTime});if(this.history.length>80)this.history.shift();const p=Math.min(power,1.7);
 // Each technique has an authored pitch/rhythm signature in addition to its material sound.
 const signatures={fireball:[138,[0,.06,.19],'sawtooth'],inferno:[55,[0,.11,.22,.33,.44],'sawtooth'],quench:[720,[0,.05,.17],'sine'],thorns:[277,[0,.13,.20],'triangle'],seedward:[349,[0,.19,.38],'sine'],briarstorm:[466,[0,.045,.09,.135,.18],'triangle'],grove:[196,[0,.24,.48],'sine'],verdant:[622,[0,.08,.25,.4],'triangle'],windstep:[830,[0,.045],'sine'],rally:[146,[0,.12,.28],'sawtooth'],march:[220,[0,.2,.4,.6],'triangle'],step:[185,[0,.045],'triangle'],bulwark:[98,[0,.12,.24],'square'],sunwall:[392,[0,.08,.16,.32],'triangle'],tether:[523,[0,.18,.36],'sine'],sanctuary:[261,[0,.16,.32,.48],'sine'],volley:[1046,[0,.10],'sine'],guide:[784,[0,.06,.18],'triangle'],mark:[1396,[0,.21],'sine'],overdrive:[164,[0,.07,.14,.28],'sawtooth'],mine:[82,[0,.18,.24],'square'],forgefall:[65,[0,.28,.34],'sawtooth'],reversal:[988,[0,.09,.27],'triangle']};
 const sig=signatures[name];if(sig)sig[1].forEach((d,i)=>this.tone(sig[0]*(1+i*.25),.24,sig[2],.024*p,d,sig[0]*(1+(i+1)*.16)));

  if(name==='chest-found'){[660,880].forEach((f,i)=>this.tone(f,.35,'sine',.055,i*.08));}
  else if(name==='chest-unlock'){this.tone(130,.2,'triangle',.1);this.hiss(.12,.32,'bandpass',2400,0,600);this.tone(65,.7,'sawtooth',.035,.22,120);this.hiss(.5,.13,'bandpass',350,.3,1000);}
  else if(name.startsWith('chest-reveal-')){const r=Number(name.slice(-1))||0;[262,330,392,523,659,784].slice(0,3+r).forEach((f,i)=>this.tone(f,.65+r*.1,'sine',.065,i*.07));this.hiss(.4,.18,'highpass',1700,0,4800);}
  else if(name==='frost'){this.tone(1480,.35,'sine',.08*p,0,620);this.hiss(.4,.3*p,'highpass',6500,0,2200);this.tone(1960,.22,'triangle',.035*p,.1,1100);}
  else if(name==='storm'){this.hiss(.16,.65*p,'highpass',5300,0,400);this.tone(73,.42,'sawtooth',.09*p,0,31);this.hiss(.28,.34*p,'bandpass',2100,.10,200);}
  else if(name==='shell'){this.tone(58,.45,'sine',.22*p,0,25);this.hiss(.48,.9*p,'lowpass',2500,0,90);}
  else if(name==='stone'){this.tone(115,.28,'triangle',.14*p,0,34);this.hiss(.35,.50*p,'bandpass',950,0,150);}
  else if(name==='repair'){[920,1380].forEach((f,i)=>this.tone(f,.12,'triangle',.06*p,i*.12));}
  else if(name==='sword'){this.hiss(.18,.55*p,'bandpass',2800,0,650);this.tone(800,.10,'triangle',.025*p,0,280);}
  else if(name==='spear'){this.hiss(.13,.4*p,'highpass',4200,0,1100);this.tone(190,.09,'triangle',.04*p);}
  else if(name==='hammer'){this.hiss(.30,.50*p,'lowpass',1500,0,250);this.tone(85,.18,'sine',.10*p,0,42);}
  else if(name==='metal'){for(const [f,v]of [[1230,.09],[1820,.065],[2710,.04]])this.tone(f,.30,'triangle',v*p,0,f*.92);this.hiss(.075,.34*p,'highpass',5000,0,1900);this.tone(105,.10,'sine',.10*p);}
  else if(name==='impact'){this.hiss(.18,.5*p,'lowpass',1800,0,170);this.tone(110,.18,'sine',.12*p,0,42);}
  else if(name==='bow'){this.tone(280,.11,'triangle',.16*p,0,85);this.hiss(.14,.25*p,'bandpass',2600,0,700);}
  else if(name==='bolt'){this.tone(105,.28,'sawtooth',.12*p,0,35);this.hiss(.22,.65*p,'bandpass',1800,0,200);}
  else if(name==='charge'){this.tone(110,.5,'triangle',.08,0,330);this.hiss(.45,.13,'bandpass',300,0,1600);}
  else if(name==='jump'){this.hiss(.15,.17,'highpass',900,0,250);}
  else if(name==='land'){this.hiss(.13,.28*p,'lowpass',700,0,150);this.tone(55,.10,'sine',.08*p);}
  else if(name==='foot'){const t=this.ctx.currentTime;if(t-this.lastFoot<.14)return;this.lastFoot=t;this.hiss(.065,.17*p,'lowpass',Math.random()*800+500,0,160);}
  else if(name==='fireball'||name==='inferno'){this.hiss(.62,.65*p,'lowpass',450,0,2600);this.tone(110,.38,'sawtooth',.07*p,0,450);this.tone(620,.30,'triangle',.045*p,.17,160);}
  else if(name==='quench'){this.hiss(.55,.6*p,'bandpass',2300,0,600);[760,570,440].forEach((f,i)=>this.tone(f,.18,'sine',.065,.07*i,f*.7));}
  else if(name==='thorns'||name==='seedward'||name==='briarstorm'||name==='grove'||name==='verdant'){[310,430,590].forEach((f,i)=>{this.hiss(.12,.24,'bandpass',f*3,i*.085,f);this.tone(f,.23,'triangle',.075,i*.06,f*.8);});}
  else if(name==='windstep'){this.hiss(.34,.47,'highpass',650,0,3500);this.tone(620,.32,'sine',.06,0,1250);}
  else if(name==='rally'||name==='march'){[196,294,392].forEach((f,i)=>this.tone(f,.6,'sawtooth',.035,i*.06));this.tone(98,.4,'sine',.08);}
  else if(name==='step'||name==='bulwark'||name==='sunwall'){this.tone(175,.3,'triangle',.12,0,70);[530,790].forEach(f=>this.tone(f,.4,'triangle',.05));this.hiss(.2,.38,'bandpass',1400,0,350);}
  else if(name==='tether'||name==='sanctuary'){[330,495,660,990].forEach((f,i)=>this.tone(f,.8,'sine',.05,i*.045));}
  else if(name==='volley'||name==='guide'){[880,1174].forEach((f,i)=>this.tone(f,.15,'sine',.10,i*.12));}
  else if(name==='mark'){this.tone(880,.26,'sine',.09,0,1320);this.tone(1760,.34,'triangle',.035,.08);}
  else if(name==='overdrive'){[180,240,360].forEach((f,i)=>this.tone(f,.18,'sawtooth',.065,i*.09));this.hiss(.4,.3,'bandpass',600,0,1700);}
  else if(name==='mine'){[120,160,220].forEach((f,i)=>this.tone(f,.18,'square',.035,i*.08));this.hiss(.3,.3,'lowpass',700,0,2300);}
  else if(name==='forgefall'){this.tone(70,.55,'sawtooth',.13,0,32);this.hiss(.6,.7,'lowpass',2500,0,100);[430,620].forEach(f=>this.tone(f,.4,'triangle',.065,.1));}
  else if(name==='reversal'){this.tone(980,.3,'triangle',.06,0,220);this.hiss(.42,.5,'bandpass',3500,0,500);}
  else if(name==='loot'||name==='upgrade'||name==='level'){[392,494,587,784].forEach((f,i)=>this.tone(f,.5,'sine',.065,i*.075));}
  else if(name==='ui'){this.tone(520,.06,'sine',.025);}
  else if(name==='death'){this.tone(110,.5,'triangle',.10,0,35);this.hiss(.35,.4,'lowpass',1600,0,120);}
  else if(name==='victory'){[196,247,294,392,494,587].forEach((f,i)=>this.tone(f,.8,'triangle',.06,i*.13));}
  else this.hiss(.2,.2,'bandpass',1400,0,500);
 }
 updateMusic(game){this.music?.update(game);}
 suspend(){this.music?.setPaused(true);if(this.ctx?.state==='running')this.ctx.suspend();}
}
