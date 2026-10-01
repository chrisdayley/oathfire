// Original Oathfire score. Numbers in the themes are scale degrees, not random notes.
// Castle is a finite 72-bar suite. Battle/duel measures develop without wrapping the score cursor.
export const MUSIC_TITLES={castle:'Banners in the Morning',march1:'The Hearthguard March',march2:'Standards through the Ash',march3:'The Last Banner',bell:'The Bell That Calls the Dead',castellan:'The Furnace Crown',veyr:'No More Borrowed Souls',victory:'The Oath Holds',defeat:'An Ember Remains'};
export const CASTLE_BARS=72,CASTLE_BPM=108,CASTLE_SECONDS=CASTLE_BARS*4*60/CASTLE_BPM;
const MAJOR=[0,2,4,5,7,9,11],MINOR=[0,2,3,5,7,8,10],HARMONIC=[0,2,3,5,7,8,11],PHRYGIAN=[0,1,3,5,7,8,10];
const bar=(degrees,rhythm=[1,1,1,1])=>degrees.map((d,i)=>[d,rhythm[i]]);
// Eight-bar sentences: a singable call, answer, lift, and cadence.
const ROYAL=[bar([0,2,4,7],[1,.5,.5,2]),bar([6,5,4,2]),bar([3,5,7,6],[1,.5,.5,2]),bar([4,2,1,null],[1,1,1,1]),bar([0,2,4,5],[.5,.5,1,2]),bar([6,5,4,3]),bar([2,4,1,6],[1,.5,.5,2]),bar([7,4,2,0],[1,.5,.5,2])];
const GARDEN=[bar([4,5,6,4],[.5,.5,2,1]),bar([3,4,5,3],[.5,.5,2,1]),bar([2,4,7,6]),bar([5,4,2,1],[1,.5,.5,2]),bar([0,1,2,4],[.5,.5,1,2]),bar([5,7,6,5]),bar([4,3,2,1],[.5,.5,1,2]),bar([0,null,4,7],[2,.5,.5,1])];
const DAWN=[bar([7,6,4,2],[1.5,.5,1,1]),bar([5,4,3,1]),bar([6,7,8,7],[1,.5,.5,2]),bar([4,3,2,null]),bar([5,6,7,9],[.5,.5,1,2]),bar([8,7,6,4]),bar([5,4,2,1],[1,1,.5,1.5]),bar([7,4,2,0],[1,1,1,1])];
const MARCH=[bar([0,0,4,4],[.75,.25,1,2]),bar([5,4,2,0],[1,.5,.5,2]),bar([3,3,5,7],[.75,.25,1,2]),bar([6,5,4,null]),bar([0,2,4,7],[.5,.5,1,2]),bar([8,7,5,4]),bar([3,2,1,6],[1,.5,.5,2]),bar([7,4,0,null],[1,1,1,1])];
const ASH=[bar([0,4,3,2],[1.5,.5,1,1]),bar([1,2,3,1],[.75,.25,1,2]),bar([5,7,6,5],[1,.5,.5,2]),bar([4,3,2,null]),bar([0,0,2,4],[.75,.25,1,2]),bar([6,5,3,2]),bar([1,6,5,4],[.5,.5,1,2]),bar([0,4,7,null],[1,1,1,1])];
const LAST=[bar([7,7,6,4],[.75,.25,1,2]),bar([5,4,2,3],[1,.5,.5,2]),bar([4,6,7,9],[1,.5,.5,2]),bar([8,7,6,null]),bar([7,4,5,6],[1,1,.5,1.5]),bar([8,7,5,3]),bar([4,3,1,6],[.75,.25,1,2]),bar([7,4,0,null])];
const BELL=[bar([0,null,1,4],[1,.5,.5,2]),bar([3,1,0,null]),bar([5,5,4,1],[.75,.25,1,2]),bar([0,-1,0,null],[1,.5,1.5,1]),bar([7,4,1,0]),bar([3,4,5,4],[.5,.5,1,2]),bar([1,4,3,1],[1,.5,.5,2]),bar([0,null,7,6],[2,1,.5,.5])];
const CROWN=[bar([0,2,3,0],[.5,.5,.5,1.5]),bar([5,4,2,0],[.5,.5,1,1]),bar([3,5,7,6],[.5,.5,.5,1.5]),bar([4,3,1,null],[1,.5,.5,1]),bar([0,0,4,5],[.5,.5,1,1]),bar([6,5,4,2],[.5,.5,.5,1.5]),bar([1,3,6,5],[.5,.5,1,1]),bar([7,4,0,null],[.5,.5,1,1])];
const VEYR=[bar([0,6,7,3],[1,.5,.5,2]),bar([4,3,1,0],[.75,.25,1,2]),bar([5,7,8,7],[1,.5,.5,2]),bar([6,4,1,null]),bar([7,6,4,3]),bar([5,4,2,1],[.5,.5,1,2]),bar([0,2,4,6],[.75,.25,1,2]),bar([7,6,7,0],[1,.5,.5,2])];
const CHORDS={royal:[0,4,3,4,0,5,1,4],garden:[0,3,5,4,1,3,4,0],dawn:[5,3,0,4,3,1,4,0],minor:[0,5,3,4,0,3,1,4],siege:[0,1,0,4,5,3,1,4],crown:[0,0,5,4,3,5,1,4]};
const phraseVariation=(notes,variation,beats)=>{
 if(variation===0)return notes;
 const copy=notes.map(([d,dur])=>[d,dur]);
 if(variation%4===1){const i=copy.findIndex(([d,dur])=>d!==null&&dur>=1);if(i>=0){const [d,dur]=copy[i];copy.splice(i,1,[d,dur-.25],[d+1,.25]);}}
 if(variation%4===2){const i=copy.findIndex(([d,dur])=>d!==null&&dur>=1);if(i>=0){const [d,dur]=copy[i];copy.splice(i,1,[d,.5],[d+2,dur-.5]);}}
 if(variation%4===3)for(let i=0;i<copy.length;i++)if(copy[i][0]!==null&&i===copy.length-1)copy[i][0]+=7;
 return copy;
};
const degree=(root,scale,d)=>root+12*Math.floor(d/7)+scale[((d%7)+7)%7];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const noise=(a,b=0)=>{let n=(a*374761393+b*668265263)>>>0;n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967296;};
export function musicScene(game){
 const b=game.battle;
 if(game.mode==='result')return {id:game.store?.data?.lastBattle?.win?'victory':'defeat',kind:'result',act:1,wave:0,waves:1,boss:null,key:'result-'+game.store?.data?.lastBattle?.id};
 if(b){const boss=game.enemies?.find(e=>e.type==='boss'&&!e.dead&&!e.training),act=1+Math.floor(b.id/5),id=(boss||b.bossTheme)?(b.id===14?'veyr':b.id===9?'castellan':'bell'):'march'+act;return {id,kind:boss||b.bossTheme?'boss':'battle',act,wave:b.wave,waves:3+Math.floor(b.id/5),boss:boss?.name||null,key:b.reportID||'mission-'+b.id};}
 return {id:'castle',kind:'castle',act:1,wave:0,waves:1,boss:null,key:'castle'};
}
export function scoreProfile(scene){const id=scene.id,boss=scene.kind==='boss',wave=clamp(scene.wave||0,0,scene.waves||5),intensity=boss?1:scene.kind==='battle'?clamp(.26+.14*wave+.04*((scene.act||1)-1),.26,.98):scene.kind==='result'?.48:.38;
 const root=({castle:62,march1:62,march2:60,march3:64,bell:62,castellan:60,veyr:61,victory:62,defeat:62})[id]??62;
 return {id,title:MUSIC_TITLES[id]||MUSIC_TITLES.castle,kind:scene.kind,root,scale:id==='castle'||id==='victory'?MAJOR:id==='bell'?PHRYGIAN:id==='veyr'||id==='castellan'?HARMONIC:MINOR,beats:id==='castellan'?3:4,bpm:id==='castle'?108:id==='bell'?132:id==='castellan'?150:id==='veyr'?156:id==='victory'?100:id==='defeat'?68:104+wave*5+((scene.act||1)-1)*4,intensity,loopBars:id==='castle'?72:null};}
export function scoreBar(scene,index){
 const p=scoreProfile(scene),castle=p.kind==='castle',result=p.kind==='result',boss=p.kind==='boss',local=castle?index%CASTLE_BARS:index,section=Math.floor(local/8),inPhrase=local%8;
 const forms=[ROYAL,ROYAL,DAWN,GARDEN,GARDEN,DAWN,ROYAL,DAWN,ROYAL],themes={march1:MARCH,march2:ASH,march3:LAST,bell:BELL,castellan:CROWN,veyr:VEYR,victory:ROYAL,defeat:DAWN};
 const theme=castle?forms[section]:themes[p.id]||MARCH;
 const progression=castle?[CHORDS.royal,CHORDS.royal,CHORDS.dawn,CHORDS.garden,CHORDS.garden,CHORDS.dawn,CHORDS.royal,CHORDS.dawn,CHORDS.garden][section]:p.id==='bell'?CHORDS.siege:p.id==='castellan'?CHORDS.crown:section%3===1?CHORDS.dawn:CHORDS.minor;
 // Later passages move through closely related keys and new countermelodies, never seek to bar zero.
 const movement=castle||result?0:Math.floor(index/32),transposition=castle?section===4?5:0:result?0:[0,0,5,0,-2,3,0,7][movement%8],root=p.root+transposition;
 const chord=progression[inPhrase],notes=phraseVariation(theme[inPhrase],castle?Math.floor(section/2):section,p.beats),events=[];
 const add=(instrument,pitch,beat,duration,velocity=.6,pan=0,role='support')=>{if(pitch===null||duration<=0||beat>=p.beats)return;events.push({instrument,pitch:clamp(pitch,24,96),beat:Math.max(0,beat),duration:Math.min(duration,p.beats-beat+.12),velocity:clamp(velocity*(.94+noise(index,events.length)*.12),.04,1),pan,role});};
 const n=d=>degree(root,p.scale,d),chordNote=(d,octave=0)=>n(chord+d)+octave;
 const power=p.intensity,phraseArc=.88+.12*Math.sin(inPhrase/7*Math.PI),strong=castle?[.58,.76,.70,.58,.55,.66,.86,.77,.66][section]:.57+power*.37;
 // Bass line and inner string voices use voice-leading in their own registers.
 add('bass',chordNote(0,-24),0,p.beats*.94,strong*.7,.22);add('cello',chordNote(0,-12),0,p.beats>3?1.85:1.4,strong*.65,.30);add('cello',chordNote(4,-24),p.beats/2,p.beats/2-.1,strong*.6,.26);
 for(const d of [2,4]){const pitch=chordNote(d,-12);add('viola',pitch,0,p.beats-.14,strong*.48,-.08);}
 // A second string desk sustains the upper harmony, leaving room for the tune.
 for(const d of [0,4])add('violin',chordNote(d),0,p.beats-.12,strong*.30,-.30,'pad');
 let melodyBeat=0;const melodyInstrument=castle?(section===0?'horn':section===3||section===4?'oboe':section===5?'flute':'violin'):p.id==='bell'?'horn':p.id==='castellan'?'trombone':p.id==='veyr'?'trumpet':result?(p.id==='defeat'?'oboe':'horn'):section%4===2?'horn':'trumpet';
 for(const [d,duration]of notes){if(d!==null){const pitch=n(d)+(melodyInstrument==='flute'?12:melodyInstrument==='trombone'?-12:0);add(melodyInstrument,pitch,melodyBeat,duration*.91,Math.min(1,strong*phraseArc*1.04),melodyInstrument==='violin'?-.27:melodyInstrument==='oboe'?-.1:.1,'melody');if((castle&&section>=6)||(!castle&&!result&&power>.68))add('violin',n(d),melodyBeat,duration*.94,strong*.46,-.38,'doubling');if((castle&&section===2)||(!castle&&!result&&power>.8))add('flute',n(d)+12,melodyBeat,duration*.86,strong*.25,-.13,'doubling');}melodyBeat+=duration;}
 if(castle){
  // Royal processional -> garden dance -> woodwind bridge -> full return -> coda.
  const arp=section===3||section===4?[0,2,4,7,4,2,0,4]:[0,4,2,4,7,4,2,4];
  for(let j=0;j<8;j++){add('harp',chordNote(arp[j],0),j*.5,.7,strong*.35,-.48);if(section!==0&&section!==5)add('pizzicato',chordNote(arp[(j+section)%8]),j*.5,.30,strong*.34,-.18);}
  if([0,1,2,6,7,8].includes(section))for(const d of [0,2,4])add('horn',chordNote(d,-12),.03,section===0?1.65:3.5,strong*.29,.24);
  if(inPhrase===0||inPhrase===4){add('triangle',81,0,2,.17, .35);if(section>=6)add('cymbal',49,0,3,.14,.1);}
  if(section===0||section>=6){add('timpani',chordNote(0,-24),0,1.1,.36,.12);add('timpani',chordNote(4,-24),2,.9,.22,.12);}
  if([1,2,6,7].includes(section)){for(const beat of [1,3])add('snare',38,beat,.23,.12,.18);}
  if(section===4||section===5)for(let j=0;j<2;j++)add('clarinet',chordNote((inPhrase+j)%2?4:2),j*2,1.7,strong*.36,.05,'countermelody');
  if(section===7||section===8)add('glock',n(theme[inPhrase][0][0]??0)+12,0,2.1,.15,.1);
  if(local===71){events.length=0;for(const [inst,oct,v,pan]of [['bass',-24,.38,.2],['cello',-12,.44,.25],['violin',0,.5,-.3],['horn',-12,.35,.2],['harp',12,.27,-.4]])for(const d of [0,2,4])add(inst,n(d)+oct,0,3.6,v,pan);add('triangle',81,0,3,.14,.3);}
 }else if(result){
  add('clarinet',chordNote(2),0,p.beats-.25,.23,.05,'countermelody');
  add('flute',chordNote(4)+12,2,1.7,.17,-.1);
  if(p.id==='victory')add('timpani',chordNote(0,-24),0,1.2,.3,.15);
  else add('horn',chordNote(0,-12),0,p.beats-.3,.19,.22);
  for(let j=0;j<4;j++)add('harp',chordNote([0,2,4,7][j]),j,1.4,.24,-.4);
  if(p.id==='victory'&&index<8){for(const d of [0,2,4])add('horn',chordNote(d),0,3.6,.3,.2);if(index%4===0)add('cymbal',49,0,3,.22,.2);}
 }else{
  // An audible wave escalation: more moving strings, brass desks and drum subdivisions.
  const steps=power>.75?16:power>.43?8:4,step=p.beats/steps,ostinato=[0,4,2,4,0,4,7,4,2,4,0,2,4,7,4,2];
  for(let j=0;j<steps;j++)add('spiccato',chordNote(ostinato[(j+section)%ostinato.length]),j*step,Math.max(.12,step*.72),(.31+power*.30)*(j%4===0?1:.78),-.34,'ostinato');
  if(power>.5)for(let j=0;j<p.beats*2;j++)add('cello',chordNote(j%2?4:0,-24),j*.5,.32,.3+power*.14,.29,'ostinato');
  for(const beat of [0,p.beats/2]){add('drum',36,beat,1.1,.38+power*.35,.12);add('timpani',chordNote(beat===0?0:4,-24),beat,.8,.3+power*.35,.17);}
  const snareBeats=p.beats===3?[.5,1.5,2.5]:[1,3];for(const beat of snareBeats){add('snare',38,beat,.18,.32+power*.3,.2);if(power>.5)add('snare',38,beat-.125,.10,.18+power*.15,.18);}
  if(power>.65)for(let j=0;j<4;j++)add('snare',38,p.beats-.5+j*.125,.10,(.18+j*.055)*power,.2);
  for(const d of [0,2,4]){add('horn',chordNote(d,-12),0,p.beats-.2,(.18+power*.33)*phraseArc,.25);if(power>.58)add('trombone',chordNote(d,-24),0,p.beats/2-.1,.17+power*.26,.33);}
  if(power>.73){add('tuba',chordNote(0,-24),0,p.beats-.25,.46,.36);add('trumpet',chordNote(4),p.beats/2,p.beats/2-.15,.24,.1,'harmony');}
  if(inPhrase===0||inPhrase===4)add('cymbal',49,0,3,.23+power*.3,.1);
  if(section%3===1||boss){const answer=[4,2,5,4,7,6,4,2];for(let j=0;j<2;j++)add('bassoon',chordNote(answer[(inPhrase+j)%8],-12),j*p.beats/2,p.beats/2-.2,.30,.03,'countermelody');}
  if(p.id==='bell'){add('bell',n(inPhrase%2?1:0)-12,0,3.5,.60,.03);if(inPhrase%2===1)add('bell',n(4)-12,2,1.8,.35,-.15);}
  if(p.id==='castellan'){for(const beat of [0,1.5,2])add('trombone',chordNote(0,-12),beat,.28,.65,.35,'hammer');add('bell',n(chord),0,2,.23,-.1);}
  if(p.id==='veyr'){for(let j=0;j<8;j++)add('violin',n([7,6,4,3,7,8,6,4][(j+inPhrase)%8]),j*.5,.42,.42,-.48,'countermelody');if(inPhrase%2===0)add('bell',n(0),0,3,.43,.0);add('glock',n(7)+12,0,2,.22,.1);}
  // At the end of each sentence, a newly voiced horn response develops the theme.
  if(section>0&&inPhrase>=6){const shift=(Math.floor(section/4)%3)-1;for(let j=0;j<3;j++)add('clarinet',n(chord+[2,4,7][(j+section)%3]+shift),j*p.beats/3,p.beats/3-.1,.30,.02,'development');}
 }
 events.sort((a,b)=>a.beat-b.beat);
 return {...p,index,local,section,chapter:castle?['Processional','Hearthwatch theme','The banners rise','Garden dance','Woodwind promenade','The sunlit court','Royal return','Bells over Hearthwatch','Homeward cadence'][section]:result?p.id==='victory'?'Home is still standing':'The ember survives':'Movement '+(movement+1)+' · phrase '+(section+1),root,events};
}
export function scoreHash(bar){return JSON.stringify(bar.events.map(e=>[e.instrument,e.pitch,e.beat,e.duration,+e.velocity.toFixed(4)]));}
