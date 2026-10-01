"""Free, attributed VPO-derived orchestral sprites. Source recordings stay in work/.
Keeps stereo, sampled sustains/loop points, soft/forte brass and short articulations.
Run with the bundled Python and work/vpo/Virtual-Playing-Orchestra3 extracted.
"""
from pathlib import Path
import sys, re, json, struct, subprocess, hashlib
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'work/foley/python'))
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
from math import gcd
VPO=ROOT/'work/vpo/Virtual-Playing-Orchestra3'; OUT=ROOT/'public/music/chamber'; OUT.mkdir(parents=True,exist_ok=True)
WORK=ROOT/'work/music-v2'; WORK.mkdir(parents=True,exist_ok=True)
RATE=32000
PLANS={
 'violin':('Strings/1st-violin-SEC-sustain.sfz',[60,65,70,75,80,85]),
 'solo':('Strings/1st-violin-SOLO-sustain.sfz',[60,64,67,71,74,78,81,84]),
 'spiccato':('Strings/1st-violin-SEC-staccato.sfz',[60,65,70,75,80,85]),
 'viola':('Strings/viola-SEC-sustain.sfz',[48,55,60,65,70]),
 'cello':('Strings/cello-SEC-sustain.sfz',[36,43,48,55,60]),
 'celloshort':('Strings/cello-SEC-staccato.sfz',[36,43,48,55,60]),
 'bass':('Strings/bass-SEC-sustain.sfz',[28,36,43]),
 'pizzicato':('Strings/1st-violin-SEC-pizzicato.sfz',[60,67,74,81]),
 'harp':('Strings/harp-sustain.sfz',[48,55,60,67,72,79,84]),
 'flute':('Woodwinds/flute-SOLO-sustain.sfz',[67,72,79,84,88]),
 'oboe':('Woodwinds/oboe-SOLO-sustain.sfz',[60,65,72,79]),
 'clarinet':('Woodwinds/clarinet-SOLO-sustain.sfz',[52,60,67,74]),
 'bassoon':('Woodwinds/bassoon-SOLO-sustain.sfz',[36,48,60]),
 'horn':('Brass/french-horn-SEC-sustain.sfz',[48,55,60,67]),
 'trumpet':('Brass/trumpet-SEC-sustain.sfz',[60,65,72,77]),
 'brassshort':('Brass/trumpet-SEC-staccato.sfz',[60,65,72,77]),
 'trombone':('Brass/trombone-SEC-sustain.sfz',[40,48,55]),
 'tuba':('Brass/tuba-SOLO-sustain.sfz',[29,36,43]),
 'timpani':('Percussion/timpani-hit.sfz',[42,46,50,55]),
 'glock':('Percussion/glockenspiel.sfz',[72,84,91]),
 'bell':('Percussion/tubular-bells.sfz',[48,60,72]),
 'celesta':('Keys/celesta.sfz',[60,72,84]),
}
SHORT={'spiccato','celloshort','brassshort','pizzicato','harp','glock','celesta','bell','timpani'}
def midi(s):
 try:return int(s)
 except:pass
 m=re.fullmatch(r'([a-gA-G])([#b]?)(-?\d+)',s)
 if not m:raise ValueError(s)
 return (int(m[3])+1)*12+{'c':0,'d':2,'e':4,'f':5,'g':7,'a':9,'b':11}[m[1].lower()]+({'#':1,'b':-1}.get(m[2],0))
def regions(path):
 raw=re.sub(r'//[^\n]*','',path.read_text());group={}; rows=[]
 for block in re.split(r'(<(?:group|region|global)>)',raw)[1:]:
  if block.startswith('<'):mode=block;continue
  op=dict((m[1],m[2].strip()) for m in re.finditer(r'(\w+)=([^=]+?)(?=\s+\w+=|$)',block,re.S))
  if mode in ('<group>','<global>'):group=op
  elif 'sample' in op:
   r={**group,**op};r['root']=midi(r.get('pitch_keycenter',r.get('key','60')));r['path']=(path.parent/r['sample'].replace('\\','/')).resolve();rows.append(r)
 return rows
def wave_loop(path):
 b=path.read_bytes();p=12
 while p+8<len(b):
  kind=b[p:p+4];n=struct.unpack_from('<I',b,p+4)[0]
  if kind==b'smpl' and n>=60 and struct.unpack_from('<I',b,p+8+28)[0]:return struct.unpack_from('<II',b,p+8+44)
  p+=8+n+(n%2)
 return None
manifest={'version':2,'sampleRate':RATE,'source':'https://virtualplaying.com/virtual-playing-orchestra/','license':'See LICENSES.txt; bank derivatives are free and retain source licenses.','instruments':{}}
for name,(source,targets) in PLANS.items():
 rs=regions(VPO/source);chosen=[]
 for key in targets:
  for vel in ([65,120] if name in ('horn','trumpet','brassshort') else [100]):
   choices=[r for r in rs if float(r.get('lovel',0))<=vel<=float(r.get('hivel',127)) and ('xfin_lovel' not in r or vel>80) and ('xfout_lovel' not in r or vel<=80)] or rs
   near=min(abs(r['root']-key) for r in choices);picks=[r for r in choices if abs(r['root']-key)==near]
   for r in picks[:2 if name in ('spiccato','celloshort','brassshort') else 1]:
    if any(x['path']==r['path'] for x in chosen):continue
    chosen.append(r)
 chunks=[np.zeros((int(.12*RATE),2),np.float32)];cursor=.12;entries=[]
 for r in chosen:
  a,rate=sf.read(r['path'],always_2d=True,dtype='float32');a=np.repeat(a,2,axis=1) if a.shape[1]==1 else a[:,:2]
  loop=wave_loop(r['path']) if name not in SHORT else None
  ratio=RATE/rate;common=gcd(rate,RATE);a=resample_poly(a,RATE//common,rate//common,axis=0)
  end=min(len(a),int((max(3.3,(loop[1]/rate+.15)) if loop else 4.8 if name in ('bell','harp') else 3.8)*RATE))
  a=a[:end];a*=10**(float(r.get('volume',0))/20)
  rms=float(np.sqrt(np.mean(a*a)));peak=float(np.max(np.abs(a)));gain=min(3,.13/max(.001,rms),.83/max(.001,peak));a*=gain
  fade=min(int(.012*RATE),len(a)//10);a[:fade]*=np.linspace(0,1,fade)[:,None];a[-fade:]*=np.linspace(1,0,fade)[:,None]
  e={'root':r['root'],'offset':round(cursor,7),'duration':round(len(a)/RATE,7),'tune':float(r.get('tune',0)),'layer':'forte' if 'xfin_lovel' in r else 'soft' if 'xfout_lovel' in r else 'all','source':str(r['path'].relative_to(VPO)),'sourceSha256':hashlib.sha256(r['path'].read_bytes()).hexdigest()}
  if loop and loop[1]*ratio<end and loop[1]>loop[0]+100:e.update(loopStart=cursor+loop[0]/rate,loopEnd=cursor+(loop[1]+1)/rate)
  entries.append(e);chunks.extend([a,np.zeros((int(.18*RATE),2),np.float32)]);cursor+=len(a)/RATE+.18
 bank=WORK/(name+'.wav');sf.write(bank,np.concatenate(chunks),RATE,subtype='PCM_16');dest=OUT/(name+'.m4a')
 subprocess.run(['afconvert',str(bank),str(dest),'-f','m4af','-d','aac','-b','144000','-q','127'],check=True,capture_output=True)
 manifest['instruments'][name]={'file':dest.name,'samples':entries,'seconds':round(cursor,5),'bytes':dest.stat().st_size,'articulation':'short' if name in SHORT else 'sustain'}
 print(name,len(entries),sum('loopStart' in e for e in entries),dest.stat().st_size,flush=True)
# The previous bank's acoustic drum recordings remain useful, unlike its orchestral treatment.
old=json.loads((ROOT/'public/music/orchestra.json').read_text())
for name in ['snare','drum','cymbal','triangle']:
 entry=old['instruments'][name].copy();entry['file']='../'+entry['file'];entry['articulation']='short';manifest['instruments'][name]=entry
(OUT/'orchestra.json').write_text(json.dumps(manifest,indent=2)+'\n')
(OUT/'LICENSES.txt').write_text('Oathfire orchestral sample derivatives, distributed free of charge.\nCompiled from Virtual Playing Orchestra 3.3 by Paul Battersby, https://virtualplaying.com/virtual-playing-orchestra/ .\nChanges: excerpted, resampled to 32 kHz, gain balanced, stereo AAC sprites, preserved sustain loops and pitch corrections. Each sample source is identified in orchestra.json.\nSonatina Symphonic Orchestra: Mattias Westlund, Creative Commons Sampling Plus 1.0, https://creativecommons.org/licenses/sampling+/1.0/\nMattias Westlund additional horns: CC BY-SA 3.0, https://creativecommons.org/licenses/by-sa/3.0/\nNo Budget Orchestra: Jeff Glatt and contributors, CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/ ; https://github.com/ssj71/No-Budget-Orchestra\nVSCO 2 CE: Versilian Studios, Sam Gossner and contributors, CC0 1.0; https://github.com/sgossner/VSCO-2-CE\nUniversity of Iowa Electronic Music Studios: unrestricted use; https://theremin.music.uiowa.edu/MIS.html\nstamperadam celesta: CC0 1.0; https://freesound.org/people/stamperadam/\nThe corresponding source licenses apply to the derivative sample banks. These sample licenses are separate from the game code license. All compositions are original Oathfire music. No Chrono or Final Fantasy recordings or melodies are distributed.\n')
print('TOTAL',sum(v['bytes'] for v in manifest['instruments'].values()),flush=True)
