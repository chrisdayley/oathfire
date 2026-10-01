// Original themes. Phrases are authored as pitches + durations, with breaths,
// harmonic answers and contrasting middle sections. References inform craft, not notes.
import {MISSIONS} from './data.js';
export const MUSIC_TITLES={castle:'A Kingdom Wakes',march1:'Run with the Banners',march2:'Across the Amber River',march3:'Names in the Starlight',march4:'Wings over Winter',march5:'The Road We Choose',bell:'The Broken Bell',castellan:'Dance of the Furnace King',veyr:'A Crown Cannot Hold the Dawn',regent:'The Regent of Glass',hollow:'Until Every Voice Is Free',victory:'Carry the Light Home',defeat:'Still, an Ember'};
export const CASTLE_BARS=96,CASTLE_BPM=112;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Each sentence has its own rhythm: a held summit, pickup, turn, and room to breathe.
// Pitch offsets in semitones. R is a rest, colon specifies quarter-note duration.
const parse=s=>s.split(' ').map(t=>{const [p,d='1']=t.split(':');return[p==='R'?null:Number(p),Number(d)];});
const sentences=rows=>rows.map(parse);
const HOME=sentences([
 '7:.5 9:.5 14:1.5 12:.5 11:1','9:1.5 7:.5 4:1 R:1','5:.75 7:.25 9:1 12:1.5 9:.5','7:2 2:.5 4:.5 7:1',
 '9:.5 11:.5 12:2 16:.5 14:.5','12:1 9:.5 7:.5 5:1 R:1','4:1.5 7:.5 11:.5 9:.5 7:.5 2:.5','4:3 R:.5 7:.5',
 '16:1.5 14:.5 12:1 11:.5 9:.5','7:1 9:.5 11:.5 14:1 R:1','12:.75 11:.25 9:1 5:1.5 7:.5','9:2 7:1 R:1',
 '4:.5 5:.5 7:1 12:1 14:1','16:1.5 19:.5 17:.5 16:.5 14:1','12:1 11:.5 9:.5 7:1 11:1','12:3 R:1'
]);
const FESTIVAL=sentences([
 '4:.5 7:.5 9:1 7:.5 4:.5 2:1','5:1.5 9:.5 12:1 R:1','11:.5 9:.5 7:1 2:1 4:1','7:2 R:1 9:.5 11:.5',
 '12:1 16:1 14:.5 12:.5 9:1','7:.75 9:.25 11:1 7:1 R:1','5:.5 7:.5 9:1 14:1 11:1','12:3 R:1'
]);
const ROAD=sentences([
 '7:.75 10:.25 14:1.5 12:.5 10:1','9:1 7:.5 5:.5 2:1 R:.5 5:.5','7:1.5 9:.5 10:.5 12:.5 14:1','12:.75 10:.25 9:1 7:1 R:1',
 '3:.5 7:.5 10:1.5 14:.5 15:1','14:1.5 12:.5 10:1 7:.5 5:.5','9:1 13:.5 16:.5 14:1 13:1','14:2 R:1 2:.5 5:.5',
 '7:1 14:.75 12:.25 10:1 9:1','7:1.5 5:.5 2:1 R:1','3:.5 5:.5 7:1 12:1.5 10:.5','9:2 7:.5 5:.5 2:1',
 '10:.75 12:.25 14:1 17:1.5 15:.5','14:1 12:.5 10:.5 9:1 7:1','5:1 9:.5 13:.5 16:1 13:1','14:3 R:1'
]);
const RIVER=sentences([
 '0:.5 7:.5 9:1.5 10:.5 14:1','12:1 10:.5 9:.5 7:1 R:1','5:1.5 7:.5 10:1 9:1','7:2 3:1 R:.5 5:.5',
 '7:.75 9:.25 10:1 15:1 14:1','12:1.5 10:.5 7:1 R:1','9:.5 13:.5 16:1 19:1.5 16:.5','14:3 R:1',
 '17:1 14:.5 12:.5 10:1 14:1','15:1.5 14:.5 12:.5 10:.5 9:1','7:.5 10:.5 12:2 14:.5 15:.5','14:2 10:1 R:1',
 '12:1 7:.75 9:.25 10:1 14:1','15:1 17:1 19:1.5 17:.5','16:.5 14:.5 13:1 9:1 13:1','14:3 R:1'
]);
const STARS=sentences([
 '14:1.5 12:.5 7:1 10:1','15:2 14:.5 12:.5 10:1','9:.5 10:.5 14:1 12:1.5 9:.5','7:2 R:1 5:.5 7:.5',
 '10:1 14:1 17:1.5 15:.5','14:1.5 10:.5 7:1 R:1','9:.5 13:.5 16:1 14:.5 13:.5 9:1','14:3 R:1',
 '19:1.5 17:.5 15:1 14:1','12:1 10:.5 7:.5 10:1 R:1','9:1.5 10:.5 12:1 14:1','15:2 12:1 10:1',
 '7:.75 10:.25 14:1.5 17:.5 19:1','22:1 19:1 17:.5 15:.5 14:1','16:1.5 14:.5 13:1 9:1','14:3 R:1'
]);
const WINTER=sentences([
 '7:1 14:1 17:.75 15:.25 14:1','12:1.5 10:.5 7:1 R:1','9:.5 10:.5 12:1.5 15:.5 14:1','10:2 7:1 R:1',
 '5:.75 9:.25 12:1 14:1 17:1','15:1.5 12:.5 10:1 7:1','9:1 13:1 16:.5 14:.5 13:1','14:3 R:1'
]);
const BELL=sentences([
 '0:1.5 1:.5 7:1 R:.5 8:.5','7:1 5:1 3:1 R:1','1:.75 3:.25 7:1.5 8:.5 12:1','10:2 8:.5 7:.5 3:1',
 '5:.5 7:.5 8:1 13:1.5 12:.5','10:1 8:1 7:1 R:1','3:1 1:.5 0:.5 -1:1 7:1','0:3 R:1'
]);
const FURNACE=sentences([
 '0:.5 3:.5 7:1 12:.75 11:.25 7:1','8:1.5 7:.5 5:.5 3:.5 0:1','3:.75 7:.25 12:1 15:1 14:1','11:2 7:1 R:1',
 '12:.5 15:.5 19:1 20:1.5 19:.5','17:1 15:.5 12:.5 8:1 7:1','11:.5 14:.5 17:1 19:1 11:1','12:3 R:1'
]);
const VEYR=sentences([
 '0:.75 7:.25 12:1.5 11:.5 8:1','7:1.5 3:.5 5:1 R:1','8:1 12:.5 15:.5 14:1 12:1','11:2 7:.5 8:.5 11:1',
 '12:.5 14:.5 15:1 19:1.5 17:.5','15:1 12:1 8:1 5:1','7:.75 11:.25 14:1 17:1 19:1','12:3 R:1',
 '19:2 20:.5 19:.5 17:1','15:1.5 14:.5 12:1 R:1','8:.5 12:.5 15:1 17:1 20:1','19:2 14:1 11:1',
 '12:.75 14:.25 15:1 19:1 24:1','23:1 20:.5 19:.5 17:1 15:1','14:1.5 11:.5 7:1 11:1','12:3 R:1'
]);
const REGENT=sentences(['7:.5 8:.5 12:1 15:1 14:1','13:1.5 12:.5 8:1 R:1','5:1 8:.5 12:.5 17:1.5 15:.5','14:2 13:.5 12:.5 8:1','7:.75 8:.25 12:1 19:1 20:1','17:1.5 15:.5 12:1 8:1','13:.5 14:.5 17:1 20:1 19:1','12:3 R:1']);
const HOLLOW=sentences(['0:1 7:.5 8:.5 15:1.5 14:.5','12:1 8:1 7:1 R:1','3:.75 7:.25 12:1 14:.5 15:.5 19:1','20:2 19:.5 15:.5 12:1','17:.5 19:.5 20:1 24:1 23:1','20:1.5 19:.5 15:1 12:1','14:1 11:.5 7:.5 11:1 14:1','12:3 R:1']);
const THEME={castle:HOME,march1:ROAD,march2:RIVER,march3:STARS,march4:WINTER,march5:STARS,bell:BELL,castellan:FURNACE,veyr:VEYR,regent:REGENT,hollow:HOLLOW,victory:HOME,defeat:STARS};
// Root offsets + chord intervals. Dominants use a real leading tone; suspensions resolve.
const MAJOR=[[0,[0,4,7,14]],[9,[0,3,7,10]],[5,[0,4,7,11]],[7,[0,5,7,10]],[0,[0,4,7,11]],[5,[0,4,7,9]],[2,[0,3,7,10]],[7,[0,4,7,10]]];
const MINOR=[[0,[0,3,7,14]],[10,[0,4,7,14]],[5,[0,3,7,10]],[7,[0,5,7,10]],[3,[0,4,7,11]],[8,[0,4,7,11]],[7,[0,4,7,10]],[0,[0,3,7,14]]];
const BRIDGE=[[3,[0,4,7,11]],[10,[0,4,7,14]],[8,[0,4,7,11]],[5,[0,3,7,10]],[1,[0,4,7,11]],[8,[0,4,7,11]],[7,[0,5,7,10]],[7,[0,4,7,10]]];
const palettes={castle:60,march1:62,march2:57,march3:64,march4:59,march5:62,bell:50,castellan:60,veyr:62,regent:61,hollow:57,victory:60,defeat:62};
export function musicScene(game){const b=game.battle;
 if(game.mode==='result')return {id:game.store?.data?.lastBattle?.win?'victory':'defeat',kind:'result',act:1,wave:0,waves:1,key:'result-'+game.store?.data?.lastBattle?.id};
 if(b){const mission=MISSIONS[b.id],boss=game.enemies?.find(e=>e.type==='boss'&&!e.dead&&!e.training),act=mission?.act||1,id=boss||b.bossTheme?mission?.bossMusic||'bell':'march'+Math.min(5,act);return {id,kind:boss||b.bossTheme?'boss':'battle',act,wave:b.wave,waves:mission?.waves||3,key:b.reportID||'mission-'+b.id};}
 return {id:'castle',kind:'castle',act:1,wave:0,waves:1,key:'castle'};
}
export function scoreProfile(scene){const boss=scene.kind==='boss',wave=clamp(scene.wave||0,0,scene.waves||6),intensity=boss?.96:scene.kind==='battle'?clamp(.25+wave*.11+(scene.act-1)*.04,.25,.96):.48;const bpm={castle:112,march1:132,march2:138,march3:144,march4:140,march5:148,bell:126,castellan:156,veyr:150,regent:146,hollow:164,victory:108,defeat:76}[scene.id]||132;return {id:scene.id,title:MUSIC_TITLES[scene.id],kind:scene.kind,root:palettes[scene.id]||60,beats:4,bpm,intensity,loopBars:scene.id==='castle'?CASTLE_BARS:null};}
export function scoreBar(scene,index){const p=scoreProfile(scene),castle=scene.id==='castle',result=scene.kind==='result',boss=scene.kind==='boss',local=castle?index%CASTLE_BARS:index,part=Math.floor(local/8),bar=local%8,form=part%12;
 let bpm=p.bpm,root=p.root,theme=THEME[p.id]||ROAD,bridge=[4,5,8].includes(form),quiet=castle?form===0||form===4||form===5:result||form===4;
 if(castle){bpm=form===0?92:form===4||form===5?96:112;theme=bridge?FESTIVAL:HOME;}
 else if(!result){if(bridge){theme=p.id==='bell'?REGENT:p.id==='castellan'?RIVER:p.id==='regent'?BELL:WINTER;} // A distinct middle melody, not a transposed first phrase.
  // Extended development changes tonal centre once per complete 96-bar movement.
  root += [0,5,-2,3,7][Math.floor(index/96)%5];}
 const melodicIndex=bridge?bar:(local%16),melody=theme[melodicIndex%theme.length],progression=castle||p.id==='victory'?MAJOR:bridge?BRIDGE:MINOR;
 const [bassOffset,intervals]=progression[bar],bass=root+bassOffset-24,chord=intervals.map(x=>root+bassOffset+x),events=[];
 const arc=.82+.18*Math.sin(Math.PI*(local%16)/15),power=p.intensity,full=castle?[2,3,7,10,11].includes(form):!quiet,level=(castle?.63:.52+power*.27)*arc;
 const add=(instrument,pitch,beat,duration,velocity,pan=0,role='support',expression=0)=>{if(pitch==null)return;events.push({instrument,pitch:clamp(pitch,26,96),beat,duration,velocity:clamp(velocity,.025,.98),pan,role,expression,legato:role==='melody'&&duration>.48});};
 // Melody gets space above the orchestra. Entries pass between solo violin and woodwinds.
 const lead=castle?form===0?'oboe':bridge?'flute':form===3||form===10?'violin':'solo':result?p.id==='victory'?'horn':'solo':boss?(form%3===1?'horn':'violin'):form%3===0?'solo':form%3===1?'violin':'flute';
 let at=0;for(let j=0;j<melody.length;j++){const [offset,d]=melody[j];if(offset!==null){const pitch=root+offset+(lead==='flute'&&root<61?12:lead==='horn'?-12:0);add(lead,pitch,at,d*(d>.5?1.035:.93),level*(j===0?1.12:1),lead==='violin'?-.3:lead==='flute'?-.06:-.13,'melody',.22);if(full&&power>.68)add('violin',root+offset,at,d*.98,level*.27,-.4,'doubling',.15);if(full&&form===10&&offset>=7)add('flute',root+offset+12,at,d*.92,level*.22,.08,'doubling');}at+=d;}
 // Moving bass with a pickup on the end of sentences. Inner voices change register carefully.
 add('bass',bass,0,3.85,level*.46,.32,'bass',.1);add('cello',bass+12,0,bar%2?1.8:3.85,level*.35,.24,'harmony',.3);
 if(bar%2)add('cello',bass+7,2,1.8,level*.32,.24,'answer',.2);
 if(bar===7){add('celloshort',root-12+11,3.5,.42,level*.45,.25,'pickup');}
 if(!quiet||castle&&form!==0){for(let j=0;j<3;j++){let note=chord[j];while(note>67)note-=12;while(note<48)note+=12;add(j===0?'viola':'violin',note,j*.018,3.9,level*(j===0?.27:.20),j===0?-.04:-.36,'harmony',.35);}}
 // Broken chords and off-beat accents breathe; the last beat is often left clear for the answer.
 const pattern=castle?[0,2,1,3,2,1,0,2]:[0,2,1,2,3,2,1,2];
 for(let j=0;j<8;j++){const pitch=chord[pattern[j]];add(castle?'harp':'spiccato',pitch+(castle?0:-12),j*.5,castle?.95:.30,level*(j%3===0?.36:.23),castle?-.48:-.32,'motion');}
 if(castle&&full)for(const beat of [.75,2.25,3.5])add('pizzicato',chord[beat<2?1:2],beat,.24,level*.33,-.2,'dance');
 // A countermelody only answers the lead's long holds or rests; not continuous competing notes.
 if((bar===1||bar===3||bar===7)&&form>0){const answer=[chord[2],chord[1]+12,chord[0]+12];for(let j=0;j<3;j++)add(castle?'clarinet':'horn',answer[j]-(castle?0:12),2.5+j*.5,.46,level*.36,.14,'countermelody');}
 if(castle){
  if(full){for(const d of [0,2])add('horn',chord[d]-12,.06,3.5,level*.28,.22,'warmth',.35);add('timpani',bass,0,1.4,.26,.22);if(bar%2===0)add('triangle',81,0,2,.12,.36);}
  if(form===3||form===7||form===10)for(const beat of [1.5,3.5])add('snare',38,beat,.22,.10,.18,'rhythm');
  if(bridge&&bar%2===0)add('celesta',chord[2]+12,.5,2.2,.16,.1,'light');
 }else if(!result){
  // A second desk, martial rhythm, low brass and high counter-line enter with each wave.
  if(power>.43&&!quiet)for(let j=0;j<8;j++)add('celloshort',bass+(j%4===3?7:12),j*.5,.29,level*(j%2?.3:.4),.28,'pulse');
  for(const beat of [0,2.5]){add('drum',36,beat,1.4,(quiet?.18:.28)+power*.24,.18,'rhythm');add('timpani',bass+(beat?7:0),beat,1.1,.25+power*.19,.24,'rhythm');}
  for(const beat of [1,3]){add('snare',38,beat,.25,.20+power*.20,.23,'rhythm');if(power>.5)add('snare',38,beat-.125,.1,.095,.24,'grace');}
  if(bar===7)for(let j=0;j<6;j++)add('snare',38,3+j/6,.12,.12+j*.018,.23,'fill');
  if(full){for(const j of [0,1])add('horn',chord[j]-12,.03,3.85,level*.34,.18,'brass',.4);if(power>.62){add('trombone',bass+12,0,1.4,level*.43,.3,'brass');for(const beat of [.75,2.5])add('brassshort',chord[2],beat,.36,level*.35,.13,'accent');}}
  if(power>.78&&!quiet){for(let j=0;j<8;j++)add('spiccato',chord[(j+1)%3]+12,j*.5+.25,.16,level*.20,-.4,'lift');add('tuba',bass,0,3.6,level*.3,.37,'bass');}
  if(bar===0||bar===4&&power>.7)add('cymbal',49,0,3,.2+power*.18,.25,'arrival');
  if(p.id==='bell'&&bar%2===0)add('bell',root+(bar===4?1:0),0,4,.46,.06,'identity');
  if(p.id==='castellan')for(const beat of [0,1.5,3])add('trombone',bass+12,beat,.3,.46,.35,'identity');
  if(p.id==='regent'&&bar%2===0)for(const beat of [0,1.5,3])add('celesta',chord[2]+12,beat,.9,.28,.1,'identity');
  if(p.id==='hollow'&&form!==4){add('bell',root+12,0,3,.24,.03,'identity');for(const beat of [0,1.5,3])add('brassshort',root+7,beat,.35,.36,.12,'identity');}
 }else{for(let j=0;j<4;j++)add('harp',chord[j],j,1.7,.21,-.4);if(p.id==='victory'&&bar===0)add('cymbal',49,0,3,.17,.22);}
 const names=['The first light','A road to follow','The answering banner','Dance in the court','Beyond the river','Remember their names','The returning theme','All our voices','A quiet promise','The rising road','The open gates','Home is ahead'];
 return {...p,bpm,index,local,section:part,chapter:names[form]+' · '+(Math.floor(index/96)+1),root,events:events.sort((a,b)=>a.beat-b.beat)};
}
export const CASTLE_SECONDS=Array.from({length:CASTLE_BARS},(_,i)=>scoreBar({id:'castle',kind:'castle',act:1,wave:0,waves:1},i)).reduce((n,b)=>n+b.beats*60/b.bpm,0);
export function scoreHash(bar){return JSON.stringify(bar.events.map(e=>[e.instrument,e.pitch,e.beat,e.duration,+e.velocity.toFixed(4)]));}
