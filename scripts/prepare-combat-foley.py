"""Recorded steel impacts: CC0 StarNinjas, Kenney and Peludo. No synthesized ringing."""
from pathlib import Path
import sys,json,hashlib,subprocess
import numpy as np
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'work/foley/python'))
import soundfile as sf
RATE=32000;OUT=ROOT/'public/sfx';WORK=ROOT/'work/mounts';SOURCES={};clips={}
def sample(path,rate=1,limit=.9):
 p=ROOT/path;SOURCES[str(path)]=hashlib.sha256(p.read_bytes()).hexdigest();a,sr=sf.read(p,always_2d=True);a=a.mean(axis=1);a=np.interp(np.arange(0,len(a),sr/RATE*rate),np.arange(len(a)),a);a-=a.mean();active=np.flatnonzero(np.abs(a)>.04*np.max(np.abs(a)));a=a[max(0,active[0]-64):] if len(active) else a;a=a[:int(limit*RATE)];return a/max(.01,np.max(np.abs(a)))
def mix(seconds,*layers):
 a=np.zeros(int(seconds*RATE))
 for x,offset,gain in layers:
  start=int(offset*RATE);n=min(len(x),len(a)-start);a[start:start+n]+=x[:n]*gain
 a[:64]*=np.linspace(0,1,64);a[-1000:]*=np.linspace(1,0,1000);a-=a.mean();a*=min(.21/max(.0001,np.sqrt(np.mean(a*a))),.85/max(.001,np.max(np.abs(a))));return a
def add(k,x):clips.setdefault(k,[]).append(x)
for i in range(4):
 blade=sample(f'work/mounts/audio/sword_clash.{[2,4,6,8][i]}.ogg',.9,1.1)
 scrape=sample(f'work/mounts/audio/sword - StarNinjas/sword.{[1,3,6,8][i]}.ogg',.88,.65)
 clang=sample(f'work/foley/source/impact/Audio/impactMetal_heavy_{i:03}.ogg',.79,.9)
 body=sample(f'work/foley/source/impact/Audio/impactSoft_heavy_{i:03}.ogg',.84,.28)
 wood=sample(f'work/foley/source/impact/Audio/impactWood_light_{i:03}.ogg',.95,.24)
 for weapon in ['sword','spear','hammer']:
  add('hit-'+weapon+'-armor',mix(.78,(blade,0,.78),(scrape,.016,.38),(body,0,.48)))
  add('hit-'+weapon+'-armor-heavy',mix(1.15,(clang,0,.76),(blade,.014,.70),(scrape,.028,.57),(body,0,.86)))
  add('hit-'+weapon+'-body',mix(.53,(body,0,.80),(scrape,.008,.44),(blade,.01,.24)))
  add('hit-'+weapon+'-body-heavy',mix(.78,(body,0,1),(clang,.016,.38),(scrape,.015,.56)))
 for weapon in ['bow','crossbow']:
  # A short plate crack carries a woody shaft vibration. No bell-like tone.
  add('hit-'+weapon+'-armor',mix(.48,(clang,0,.48),(body,0,.68),(wood,.026,.64),(blade,.003,.24)))
 add('parry',mix(.83,(blade,0,.82),(clang,.018,.42)))
 for surface in ['stone','dirt','water']:
  src='concrete' if surface=='stone' else 'grass'
  step=sample(f'work/foley/source/impact/Audio/footstep_{src}_{i:03}.ogg',.84,.28)
  if surface=='water':step=sample('work/foley/source/splash1.wav',1.4,.26)
  add('hoof-'+surface,mix(.26,(wood,0,.65 if surface=='stone' else .30),(step,0,.64),(body,0,.28)))
manifest=json.loads((OUT/'foley.json').read_text());chunks=[np.zeros(int(.12*RATE))];cursor=.12
for key,variants in clips.items():
 entries=[]
 for a in variants:
  entries.append({'offset':round(cursor,6),'duration':round(len(a)/RATE,6)});chunks.extend([a,np.zeros(int(.12*RATE))]);cursor+=len(a)/RATE+.12
 manifest['clips'][key]={'bank':'combat-v221','variants':entries,'recorded':True}
a=np.concatenate(chunks);wav=WORK/'combat-v221.wav';sf.write(wav,a,RATE,subtype='PCM_16');target=OUT/'combat-v221.m4a';subprocess.run(['afconvert',str(wav),str(target),'-f','m4af','-d','aac','-b','96000','-q','127'],check=True)
manifest['banks']['combat-v221']={'file':target.name,'bytes':target.stat().st_size,'seconds':len(a)/RATE,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()};manifest['sources'].update(SOURCES);(OUT/'foley.json').write_text(json.dumps(manifest,indent=2)+'\n')
(OUT/'combat-v221-provenance.json').write_text(json.dumps({'license':'CC0-1.0','sources':['https://opengameart.org/content/20-sword-sound-effects-attacks-and-clashes','https://opengameart.org/content/water-splash-and-sand-footsteps','https://kenney.nl/assets/impact-sounds'],'files':SOURCES,'cues':list(clips)},indent=2)+'\n')
# A short, labeled-in-document audition: light sword, heavy sword, arrow on armor.
preview=np.concatenate([clips[k][0] for k in ['hit-sword-armor','hit-sword-armor-heavy','hit-bow-armor']]);sf.write(WORK/'combat-preview.wav',preview,RATE,subtype='PCM_16');print(len(clips),'cues',sum(map(len,clips.values())),'variations',target.stat().st_size,'bytes')
