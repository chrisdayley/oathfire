import './soundtrack.css';
import {Soundscape} from './audio.js';
import {MUSIC_TITLES} from './music-score.js';
const sound=new Soundscape(),$=id=>document.getElementById(id);
const tracks=[
 {id:'castle',kind:'castle',act:1,wave:0,waves:1,label:'CASTLE · 3:35 SUITE',description:'A lyrical morning prelude opens into a bright court dance, with singing violin, woodwind answers and a full royal return.'},
 {id:'march1',kind:'battle',act:1,wave:1,waves:3,label:'ACT I · THE HEARTHGUARD',description:'A soaring violin hook, crisp marching percussion and off-beat string figures.'},
 {id:'march2',kind:'battle',act:2,wave:1,waves:4,label:'ACT II · THE ASHEN ROAD',description:'A lilting minor melody, warm horn answers and sweeping strings above an urgent bass line.'},
 {id:'march3',kind:'battle',act:3,wave:1,waves:5,label:'ACT III · THE LAST BANNER',description:'A broad, hopeful melody over urgent strings, rising into full brass as the waves gather.'},
 {id:'march4',kind:'battle',act:4,wave:1,waves:6,label:'ACT IV · THE GLASS REGENT',description:'A windborne melody and silver woodwinds gather into a mountain march.'},
 {id:'march5',kind:'battle',act:5,wave:1,waves:6,label:'ACT V · THE FIRST EMBER',description:'The returning banner theme opens into the last, brightest orchestral ascent.'},
 {id:'regent',kind:'boss',act:4,wave:6,waves:6,label:'BOSS · THE GLASS REGENT',description:'Glittering celesta, cold chromatic turns and cutting brass.'},
 {id:'hollow',kind:'boss',act:5,wave:6,waves:6,label:'BOSS · THE HOLLOW KING',description:'A dark rising anthem, great bells and the full weight of the orchestra.'},
 {id:'victory',kind:'result',act:1,wave:0,waves:1,label:'VICTORY · CARRY THE LIGHT HOME',description:'The kingdom melody returns on warm horns and harp.'},
 {id:'defeat',kind:'result',act:1,wave:0,waves:1,label:'DEFEAT · STILL, AN EMBER',description:'A quiet violin promise with space to breathe.'},
 {id:'bell',kind:'boss',act:1,wave:3,waves:3,label:'BOSS · THE BELL KNIGHT',description:'Ominous tolling bells, tense Phrygian horns and relentless marching drums.'},
 {id:'castellan',kind:'boss',act:2,wave:4,waves:4,label:'BOSS · THE ASH CASTELLAN',description:'A fast furnace dance, hammering low brass and racing strings.'},
 {id:'veyr',kind:'boss',act:3,wave:5,waves:5,label:'BOSS · MARSHAL VEYR',description:'A defiant, high-reaching theme carried by strings and brass above a relentless march.'}
];let selected=tracks[0],playing=false,starting=false,analyser,bins;
const list=document.querySelector('.track-list');list.innerHTML=tracks.map((t,i)=>'<button class="track '+(i===0?'active':'')+'" data-track="'+t.id+'"><em>'+String(i+1).padStart(2,'0')+'</em><span><small>'+t.label+'</small><b>'+MUSIC_TITLES[t.id]+'</b><p>'+t.description+'</p></span></button>').join('');
const bars=document.querySelector('.visualizer');bars.innerHTML=Array.from({length:38},()=>'<i></i>').join('');
const pieceStatus=()=>selected.kind==='castle'?'A complete 3:35 suite before the repeat.':'Continuous score · themes develop without restarting.';
function draw(){document.querySelectorAll('[data-track]').forEach(b=>(b.classList.toggle('active',b.dataset.track===selected.id),b.setAttribute('aria-pressed',b.dataset.track===selected.id)));$('track-title').textContent=MUSIC_TITLES[selected.id];$('track-description').textContent=selected.description;$('kind').textContent=selected.label;$('wave-controls').hidden=selected.kind!=='battle';$('waves').innerHTML=Array.from({length:selected.waves},(_,i)=>'<button data-wave="'+(i+1)+'" class="'+(selected.wave===i+1?'active':'')+'">Wave '+(i+1)+'</button>').join('');$('play').textContent=playing?'Pause score':'Play score';}
async function play(){if(starting)return;starting=true;$('play').disabled=true;$('status').textContent='Preparing the orchestra…';await sound.unlock();sound.settings({volume:0,music:Number($('volume').value)});if(!sound.music){$('status').textContent='This browser does not support Web Audio.';$('play').disabled=false;starting=false;return;}await sound.music.ready;if(sound.music.state!=='ready'){$('status').textContent='Music could not load. Press Play to retry.';$('play').disabled=false;starting=false;return;}if(!analyser){analyser=sound.ctx.createAnalyser();analyser.fftSize=256;sound.music.bus.connect(analyser);bins=new Uint8Array(analyser.frequencyBinCount);}sound.music.setPaused(false);if(sound.music.scene.id!==selected.id)sound.music.change({...selected,key:selected.id});playing=true;starting=false;$('play').disabled=false;$('status').textContent=pieceStatus();draw();}
$('play').onclick=()=>{if(playing){sound.music.setPaused(true);playing=false;draw();$('status').textContent='Paused · Press Play to resume.';}else play();};
list.onclick=e=>{const button=e.target.closest('[data-track]');if(!button)return;selected={...tracks.find(t=>t.id===button.dataset.track)};if(sound.music){sound.music.change({...selected,key:selected.id});sound.music.setPaused(!playing);}draw();if(playing)$('status').textContent=pieceStatus();else play();};
$('waves').onclick=e=>{const button=e.target.closest('[data-wave]');if(!button)return;selected.wave=Number(button.dataset.wave);if(sound.music)sound.music.scene={...selected,key:selected.id};draw();};
$('volume').oninput=()=>sound.settings({volume:0,music:Number($('volume').value)});
let hiddenPause=false;document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){hiddenPause=true;sound.suspend();playing=false;draw();$('status').textContent='Paused while this page is in the background.';}else if(hiddenPause){hiddenPause=false;$('status').textContent='Press Play to resume.';}});
setInterval(()=>{const m=sound.music;if(!m)return;const p=m.debug();$('chapter').textContent=p.chapter||'The orchestra is ready';const seconds=Math.floor(m.checkpoint().elapsed);$('clock').textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');if(analyser&&playing){analyser.getByteFrequencyData(bins);[...bars.children].forEach((b,i)=>b.style.height=(3+bins[i*2]/255*25)+'px');}else for(const b of bars.children)b.style.height='3px';},120);
draw();window.__oathfireMusic={sound,tracks,get selected(){return selected;}};
