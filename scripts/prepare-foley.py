"""Original Oathfire sound design from CC0 foley. Python: numpy, soundfile; encoder: macOS afconvert."""
from pathlib import Path
import sys,json,hashlib,subprocess,zipfile,wave
import numpy as np
ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/'work/foley';OUT=ROOT/'public/sfx'
WORK.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(WORK/'python'))
import soundfile as sf
RATE=32000
DOWNLOADS={
 'impact.zip':'https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip',
 'rpg.zip':'https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip',
 'armor.zip':'https://opengameart.org/sites/default/files/footsteps.zip',
 'steps.zip':'https://opengameart.org/sites/default/files/%5Bkdd%5DDifferentSteps_0.zip',
 'source/splash1.wav':'https://opengameart.org/sites/default/files/splash1_0.wav',
 'source/splash2.wav':'https://opengameart.org/sites/default/files/splash2_0.wav'}
for name,url in DOWNLOADS.items():
 p=WORK/name;p.parent.mkdir(parents=True,exist_ok=True)
 if not p.exists():subprocess.run(['curl','-fsSL','--retry','3',url,'-o',str(p)],check=True)
 if p.suffix=='.zip' and not (WORK/'source'/p.stem).exists():zipfile.ZipFile(p).extractall(WORK/'source'/p.stem)
SOURCES={};groups={};meta={};rng=np.random.default_rng(82931)
def norm(a,rms=.13,peak=.75):
 a=np.asarray(a,dtype=np.float64);a-=a.mean() if len(a) else 0
 if len(a):a*=min(rms/max(.00001,np.sqrt(np.mean(a*a))),peak/max(.00001,np.max(np.abs(a))))
 return a
def fade(a,attack=.003,release=.03):
 a=a.copy();n=min(len(a)//3,int(RATE*attack));m=min(len(a)//3,int(RATE*release))
 if n:a[:n]*=np.linspace(0,1,n)
 if m:a[-m:]*=np.linspace(1,0,m)
 return a
def resize(a,rate=1):return np.interp(np.arange(0,len(a),rate),np.arange(len(a)),a)
def source(name,rate=1,limit=None):
 p=WORK/'source'/name;SOURCES[name]=hashlib.sha256(p.read_bytes()).hexdigest();a,sr=sf.read(p,always_2d=True);a=a.mean(axis=1)
 a=resize(a,sr/RATE*rate);a=norm(a)
 active=np.flatnonzero(np.abs(a)>.025*np.max(np.abs(a)))
 if len(active):a=a[max(0,active[0]-int(.004*RATE)):]
 if limit:a=a[:int(limit*RATE)]
 return fade(a)
def mix(seconds,*layers):
 a=np.zeros(int(seconds*RATE))
 for sample,start,gain in layers:
  i=int(start*RATE);n=min(len(sample),len(a)-i)
  if n>0:a[i:i+n]+=sample[:n]*gain
 return fade(a,release=.05)
def bandnoise(seconds,low=40,high=1200,seed=1):
 n=int(RATE*seconds);r=np.random.default_rng(seed);a=r.normal(size=n);f=np.fft.rfftfreq(n,1/RATE);mask=(1-np.exp(-(f/max(1,low))**4))*np.exp(-(f/high)**4);a=np.fft.irfft(np.fft.rfft(a)*mask,n);return norm(a,.2,.9)
def boom(seconds=.4,freq=90,seed=0):
 t=np.arange(int(RATE*seconds))/RATE;phase=2*np.pi*(freq*.36*t+(freq-freq*.36)*.06*(1-np.exp(-t/.06)));return fade((np.sin(phase)*.50+bandnoise(seconds,35,850,seed)*.4)*np.exp(-t/(seconds*.24)),.002,.03)
def resonator(seconds,freq,seed=0,bright=.5):
 t=np.arange(int(seconds*RATE))/RATE;a=np.zeros(len(t));r=np.random.default_rng(seed)
 for k,ratio in enumerate([1,1.503,2.006,2.731,4.017,5.412]):a+=np.sin(2*np.pi*freq*ratio*t+r.uniform(-.02,.02))/(1+k)**(1.1-bright*.3)*np.exp(-t*(1.5+k*.6)/seconds)
 return fade(norm(a,.12),.008,.08)
def breath(seconds,seed=1,low=70,high=3200):
 t=np.arange(int(seconds*RATE))/RATE;env=(1-np.exp(-t*45))*np.exp(-t*3/seconds)*(1+.15*np.sin(t*22));return bandnoise(seconds,low,high,seed)*env
def choir(seconds,root=146,seed=1):
 t=np.arange(int(seconds*RATE))/RATE;a=np.zeros(len(t));r=np.random.default_rng(seed)
 for ratio in [1,1.5,2]:
  for k in range(1,24):
   hz=root*ratio*k;weight=sum(np.exp(-((hz-formant)/width)**2) for formant,width in [(650,180),(1100,240),(2300,440)])/(k**.6)
   a+=np.sin(2*np.pi*hz*t+.02*np.sin(t*(3+r.uniform(0,1))))*weight
 env=np.sin(np.linspace(0,np.pi,len(t)))**.8
 return norm(a,.075)*env
def tail(a,wet=.2):
 result=np.pad(a,(0,int(RATE*.85)))
 for offset,g in [(.073,.4),(.131,.31),(.219,.23),(.337,.18),(.509,.13),(.731,.08)]:
  i=int(offset*RATE);result[i:i+len(a)]+=a*wet*g
 return fade(result,release=.15)
def add(group,key,a,**info):
 groups.setdefault(group,{}).setdefault(key,[]).append(norm(fade(a),info.pop('rms',.14),.78));meta.setdefault(key,{}).update(info)

# A contact is one foot, with short natural variation. Gear is a quieter separate layer.
for surface,src in [('stone','concrete'),('grass','grass'),('wood','wood'),('snow','snow')]:
 for i in range(5):add('steps','step-'+surface,source(f'impact/Audio/footstep_{src}_{i:03}.ogg',limit=.42),rms=.13)
for i in range(5):
 grit=source('steps/gravel.ogg',rate=.88+i*.06,limit=.30);earth=source('steps/mud02.ogg',rate=.92+i*.025,limit=.32)
 add('steps','step-dirt',mix(.36,(grit,0,.64),(earth,0,.50)),rms=.11)
 splash=source('splash'+str(1+i%2)+'.wav',rate=.88+i*.07,limit=.46)
 add('steps','step-water',mix(.49,(splash,0,.85),(boom(.18,65,i),0,.20)),rms=.12)
for kind,pattern in [('plate','step_metal*.ogg'),('leather','step_lth*.ogg'),('cloth','step_cloth*.ogg')]:
 for p in sorted((WORK/'source/armor/footsteps').glob(pattern)):
  a=source('armor/footsteps/'+p.name,limit=.30)
  add('gear','gear-'+kind,a,rms=.08 if kind=='plate' else .07)

# Sweeps are separate from contact: misses get air, confirmed hits get material/body.
for weapon in ['sword','spear','hammer','bow','crossbow']:
 for heavy in [False,True]:
  for i in range(3):
   seconds=(.40 if heavy else .23) if weapon not in ['bow','crossbow'] else .28
   a=source('rpg/Audio/'+('knifeSlice.ogg' if i%2==0 else 'knifeSlice2.ogg'),rate=(.7 if heavy else 1.1)*(1+i*.045),limit=seconds)
   whoosh=breath(seconds,34+i,70 if weapon=='hammer' else 250,1800 if weapon=='hammer' else 6200)
   if weapon in ['bow','crossbow']:
    a=source('rpg/Audio/creak'+str(i+1)+'.ogg',rate=1.7,limit=.16);whoosh=resonator(.23,130 if weapon=='crossbow' else 240,seed=i)*.4
   add('weapons','swing-'+weapon+('-heavy' if heavy else ''),mix(seconds,(a,0,.38),(whoosh,0,.62)),rms=.14)
for weapon in ['sword','spear','hammer','bow','crossbow']:
 for material in ['armor','body','stone','wood']:
  for i in range(3):
   impact=source('impact/Audio/'+({'armor':'impactMetal_medium','body':'impactPunch_heavy','stone':'impactMining','wood':'impactWood_medium'}[material])+f'_{i:03}.ogg',rate={'hammer':.76,'spear':1.12,'bow':1.28,'crossbow':.94}.get(weapon,1),limit=.5)
   body=source(f'impact/Audio/impactSoft_heavy_{i:03}.ogg',rate=.85,limit=.20)
   ring=resonator(.48,390 if weapon=='hammer' else 920 if weapon=='spear' else 630,i,bright=.35) if material=='armor' else np.zeros(1)
   shaft=source(f'impact/Audio/impactWood_light_{i:03}.ogg',rate=1.25 if weapon=='bow' else .91,limit=.16) if weapon in ['bow','crossbow'] else np.zeros(1)
   add('impacts',f'hit-{weapon}-{material}',mix(.60,(impact,0,.60 if weapon=='bow' else .73),(body,0,.46),(shaft,.014,.42),(ring,0,.035 if weapon in ['bow','crossbow'] else .12),(boom(.22,72,i),0,.15 if weapon=='hammer' else .09 if weapon=='crossbow' else .06)),rms=.20)
for i in range(3):
 a=source(f'impact/Audio/impactPlate_heavy_{i:03}.ogg',rate=.85,limit=.65)
 add('impacts','parry',mix(.75,(a,0,.6),(resonator(.65,820,i),0,.26),(boom(.18,95,i),0,.3)),rms=.22)

# Elemental textures plus a short attack, body and spacious decay. No copied game audio.
SPELLS={
 'fireball':('fire',1.5,110,[0,.16]),'inferno':('fire',2.65,67,[0,.22,.48,.76]),'mine':('fire',1.05,85,[0,.19,.32]),
 'forgefall':('earth',2.4,55,[0,.38,.47]),'reversal':('holy',1.85,196,[0,.18,.36]),
 'quench':('water',1.65,220,[0,.14,.30]),'frost':('ice',1.65,622,[0,.11,.26]),'storm':('storm',1.65,73,[0,.08,.31]),
 'thorns':('nature',1.25,174,[0,.13,.27]),'seedward':('nature',1.85,220,[0,.21,.42]),'briarstorm':('nature',2.4,146,[0,.07,.18,.34,.48]),
 'grove':('nature',2.4,196,[0,.27,.52]),'verdant':('nature',2.5,261,[0,.12,.29,.50]),'windstep':('wind',1.0,310,[0,.12]),
 'rally':('command',1.75,146,[0,.21,.42]),'march':('command',2.3,196,[0,.26,.52,.78]),
 'step':('holy',1.15,146,[0,.12]),'bulwark':('earth',1.85,98,[0,.19,.38]),'sunwall':('holy',2.65,261,[0,.12,.28,.49]),
 'tether':('holy',1.75,220,[0,.24,.47]),'sanctuary':('holy',2.6,174,[0,.22,.45,.68]),
 'volley':('wind',1.05,392,[0,.17]),'guide':('wind',1.45,494,[0,.11,.33]),'mark':('arcane',1.25,349,[0,.23]),
 'overdrive':('arcane',1.75,146,[0,.12,.29,.46]),'grave':('grave',1.9,82,[0,.21,.46]),'holy':('holy',1.3,261,[0,.18])}
def magic(family,seconds,root,beats,seed):
 layers=[]
 if family=='fire':
  layers=[(breath(seconds,seed,32,3400),0,1.7),(boom(.65,root,seed),.05,.65)]
  for i,t in enumerate(beats):layers.append((bandnoise(.09,800,6500,seed+i)*np.exp(-np.arange(int(.09*RATE))/RATE*44),t,.34))
 elif family in ['ice','arcane']:
  layers=[(breath(seconds,seed,450,7400),0,.8)]
  glass=source('impact/Audio/impactGlass_light_002.ogg',rate=1.12 if family=='ice' else .67,limit=.5)
  for i,t in enumerate(beats):layers.extend([(resonator(seconds*.62,root*[1,1.498,2.01,2.49][i%4],seed+i,.8),t,.55),(glass,t,.28)])
 elif family=='storm':
  layers=[(boom(.85,root,seed),.06,.95),(breath(seconds,seed,25,700),.05,1.3)]
  for i,t in enumerate(beats):layers.append((bandnoise(.13,1800,11000,seed+i)*np.exp(-np.arange(int(.13*RATE))/RATE*29),t,.95))
 elif family=='water':
  layers=[(source('splash1.wav',rate=.76,limit=1.1),0,.9),(choir(seconds,root,seed),.1,.6),(resonator(1.1,root*2.0,seed),.14,.24)]
 elif family in ['nature','earth']:
  layers=[(breath(seconds,seed,35,1250),0,.85),(boom(.5,root*.5,seed),.05,.25)]
  for i,t in enumerate(beats):layers.append((source('rpg/Audio/creak'+str(i%3+1)+'.ogg',rate=.7+i*.1,limit=.4),t,.33))
  if family=='nature':layers.extend([(choir(seconds,root,seed),.07,.67),(source('steps/leaves01.ogg',limit=.4),0,.45)])
  else:layers.extend([(source('impact/Audio/impactMining_001.ogg',rate=.65,limit=.6),.12,.9),(resonator(1.3,root,seed),0,.30)])
 elif family=='wind':
  layers=[(breath(seconds,seed,200,5400),0,1.4),(choir(seconds*.75,root*.5,seed),0,.24)]
  for i,t in enumerate(beats):layers.append((breath(.3,seed+i+10,500,4100),t,.45))
 elif family=='grave':layers=[(choir(seconds,root,seed),0,1),(breath(seconds,seed,35,1700),0,1),(resonator(seconds*.9,root*1.06,seed),.05,.4)]
 else:
  layers=[(choir(seconds,root,seed),0,1.3 if family=='holy' else 1.6),(breath(seconds*.6,seed,130,2000),0,.45),(boom(.35,root*.5,seed),0,.25)]
  for i,t in enumerate(beats):layers.append((resonator(seconds*.65,root*[1,1.5,2,3][i%4],seed+i),t,.32 if family=='holy' else .19))
 return tail(mix(seconds,*layers),.25 if family in ['holy','grave','ice','arcane'] else .15)
for id,(family,seconds,root,beats) in SPELLS.items():
 seed=int(hashlib.sha256(id.encode()).hexdigest()[:6],16)
 add('magic','cast-'+id,magic(family,seconds,root,beats,seed),family=family,rms=.17)
for family in ['fire','ice','storm','water','nature','holy','grave','earth','arcane','wind','command']:
 add('magic','rank-'+family,magic(family,1.3,98 if family in ['fire','earth','storm'] else 294,[0,.16,.32],122),family=family,rms=.10)
for family in ['fire','frost','storm','water','nature','holy','grave','stone','shell']:
 category={'frost':'ice','stone':'earth','shell':'fire'}.get(family,family)
 for i in range(2):add('magic','impact-'+family,magic(category,.65,85 if category in ['fire','earth','storm'] else 294,[0,.07],117+i),rms=.19)

manifest={'version':1,'sampleRate':RATE,'license':'CC0-1.0','banks':{},'clips':{},'sources':SOURCES,'downloads':{p:{'url':u,'sha256':hashlib.sha256((WORK/p).read_bytes()).hexdigest()} for p,u in DOWNLOADS.items()}}
for group,clips in groups.items():
 chunks=[np.zeros(int(RATE*.12))];cursor=.12
 for key,variants in clips.items():
  entries=[]
  for a in variants:
   entries.append({'offset':round(cursor,6),'duration':round(len(a)/RATE,6)});chunks.extend([a,np.zeros(int(RATE*.12))]);cursor+=len(a)/RATE+.12
  manifest['clips'][key]={'bank':group,'variants':entries,**meta[key]}
 a=np.concatenate(chunks);wav=WORK/(group+'-bank.wav');sf.write(wav,a,RATE,subtype='PCM_16');target=OUT/(group+'.m4a')
 subprocess.run(['afconvert',str(wav),str(target),'-f','m4af','-d','aac','-b','96000','-q','127'],check=True,capture_output=True)
 manifest['banks'][group]={'file':target.name,'bytes':target.stat().st_size,'seconds':len(a)/RATE,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
 print(group,len(clips),'cues',sum(len(v) for v in clips.values()),'variants',round(len(a)/RATE,2),'seconds',target.stat().st_size,'bytes')
(OUT/'foley.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Total',sum(b['bytes'] for b in manifest['banks'].values()),'bytes')
