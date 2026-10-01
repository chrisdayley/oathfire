import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||(process.argv.includes('--playwright-module')?process.argv[process.argv.indexOf('--playwright-module')+1]:'playwright'));
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage(),out='output/foley';
fs.mkdirSync(out,{recursive:true});
try{
 await page.goto((process.env.GAME_URL||'http://127.0.0.1:4179')+'/soundtrack.html');
 await page.locator('#play').click();
 await page.waitForFunction(()=>window.__oathfireMusic?.sound.foley?.state==='ready');
 const result=await page.evaluate(async()=>{
  const f=window.__oathfireMusic.sound.foley,clips=[];
  for(const [key,clip] of Object.entries(f.manifest.clips))for(const [index,v]of clip.variants.entries()){
   const b=f.buffers[clip.bank],samples=b.getChannelData(0).subarray(Math.round(v.offset*b.sampleRate),Math.round((v.offset+v.duration)*b.sampleRate));
   let peak=0,sum=0,dc=0,clipped=0,finite=true,hash=2166136261;
   for(const x of samples){finite&&=Number.isFinite(x);peak=Math.max(peak,Math.abs(x));sum+=x*x;dc+=x;if(Math.abs(x)>=1)clipped++;hash=Math.imul(hash^Math.round(x*32767),16777619);}
   clips.push({key,index,peak,rms:Math.sqrt(sum/samples.length),dc:dc/samples.length,clipped,finite,hash:hash>>>0,bounds:v.offset+v.duration<=b.duration+.01});
  }
  const sequences={movement:[],weapons:[],magic:[],crowd:[]};
  let time=.2;
  for(const surface of ['stone','dirt','grass','water','wood','snow']){
   for(let i=0;i<8;i++){
    const step=i<4?.52:.35;
    sequences.movement.push({key:'step-'+surface,at:time,gain:.65*.40*(i<4?.72:1),index:i%5,pan:i%2?.07:-.07},{key:'gear-plate',at:time+.018,gain:.65*.21,index:i%4});time+=step;
   }time+=.8;
  }
  time=.2;
  for(const weapon of ['sword','spear','hammer','bow','crossbow'])for(const heavy of [false,true])for(const material of ['body','armor']){
   sequences.weapons.push({key:'swing-'+weapon+(heavy?'-heavy':''),at:time,gain:.48,index:heavy?1:0},{key:'hit-'+weapon+'-'+material,at:time+.15,gain:.83*(heavy?1.22:1),pitch:heavy?.88:1});time+=1.25;
  }
  time=.2;
  for(const [id,family]of [['fireball','fire'],['frost','ice'],['storm','storm'],['quench','water'],['thorns','nature'],['forgefall','earth'],['sanctuary','holy'],['windstep','wind'],['mark','arcane'],['grave','grave'],['rally','command']]){
   sequences.magic.push({key:'cast-'+id,at:time,gain:.72},{key:'rank-'+family,at:time+.12,gain:.32,pitch:.84});time+=4;
  }
  for(let i=0;i<30;i++)sequences.crowd.push({key:i%2?'hit-sword-armor':'cast-fireball',at:.2+i*.08,gain:.15,pan:Math.sin(i)*.8});
  sequences.crowd.push({key:'cast-inferno',at:.4,gain:.72},{key:'rank-fire',at:.52,gain:.32,pitch:.84},{key:'parry',at:.8,gain:1});
  const renders=[];
  for(const [name,notes]of Object.entries(sequences)){
   const seconds=Math.max(...notes.map(n=>n.at+f.manifest.clips[n.key].variants[n.index||0].duration/(n.pitch||1)))+.5;
   const ctx=new OfflineAudioContext(2,Math.ceil(seconds*32000),32000),master=ctx.createGain(),compressor=ctx.createDynamicsCompressor();
   master.gain.value=.55;compressor.threshold.value=-15;compressor.ratio.value=5;master.connect(compressor);compressor.connect(ctx.destination);
   for(const note of notes){const clip=f.manifest.clips[note.key],v=clip.variants[note.index||0],source=ctx.createBufferSource(),gain=ctx.createGain(),pan=ctx.createStereoPanner();source.buffer=f.buffers[clip.bank];source.playbackRate.value=note.pitch||1;gain.gain.value=note.gain;pan.pan.value=note.pan||0;source.connect(gain);gain.connect(pan);pan.connect(master);source.start(note.at,v.offset,v.duration);}
   const rendered=await ctx.startRendering(),length=44+rendered.length*4,bytes=new ArrayBuffer(length),view=new DataView(bytes),label=(offset,s)=>[...s].forEach((c,i)=>view.setUint8(offset+i,c.charCodeAt(0)));
   label(0,'RIFF');view.setUint32(4,length-8,true);label(8,'WAVE');label(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,32000,true);view.setUint32(28,128000,true);view.setUint16(32,4,true);view.setUint16(34,16,true);label(36,'data');view.setUint32(40,length-44,true);
   let peak=0,sum=0,clipped=0;
   for(let i=0;i<rendered.length;i++)for(let c=0;c<2;c++){const x=rendered.getChannelData(c)[i];peak=Math.max(peak,Math.abs(x));sum+=x*x;if(Math.abs(x)>=1)clipped++;view.setInt16(44+(i*2+c)*2,Math.round(Math.max(-1,Math.min(1,x))*32767),true);}
   let encoded='';const u=new Uint8Array(bytes);for(let i=0;i<u.length;i+=0x8000)encoded+=String.fromCharCode(...u.subarray(i,i+0x8000));
   renders.push({name,seconds:rendered.duration,peak,rms:Math.sqrt(sum/(rendered.length*2)),clipped,wav:btoa(encoded)});
  }
  return {clips,renders};
 });
 for(const r of result.renders){fs.writeFileSync(out+'/'+r.name+'.wav',Buffer.from(r.wav,'base64'));delete r.wav;assert.equal(r.clipped,0,r.name+' mix clipping');assert.ok(r.rms>.005,r.name+' mix audible');console.log('RENDER',JSON.stringify(r));}
 assert.equal(result.clips.length,191);
 assert.ok(result.clips.every(c=>c.finite&&c.bounds&&c.clipped===0&&c.rms>.005),'All decoded clips are audible, finite, unclipped and in bounds');
 for(const material of ['armor','body','wood','stone'])assert.equal(new Set(result.clips.filter(c=>c.index===0&&c.key.startsWith('hit-')&&c.key.endsWith('-'+material)).map(c=>c.hash)).size,5,'Five distinct weapon contacts for '+material);
 fs.writeFileSync(out+'/render-report.json',JSON.stringify(result,null,2));
 console.log('PASS 191 decoded clips and four rendered mixes; distinct weapon contacts; no clipping');
}finally{await browser.close();}
