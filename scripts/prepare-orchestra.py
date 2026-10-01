"""Build compact CC0 orchestra sprites. Requires numpy and macOS afconvert; shipped files need no build-time downloads."""
from pathlib import Path
import json,re,subprocess,urllib.parse,hashlib,wave
from concurrent.futures import ThreadPoolExecutor
import numpy as np
ROOT=Path(__file__).resolve().parents[1]; WORK=ROOT/'work/music'; OUT=ROOT/'public/music'; WORK.mkdir(parents=True,exist_ok=True); OUT.mkdir(parents=True,exist_ok=True)
COMMIT='440300901dfe9275fd84e0b7763af1f8443ae62e'; SFZ='6dd651d55dde97fd4028699be9d4481f26917891'; RATE=32000
INSTRUMENTS={
 'violin':('ViolinEnsSusVib.sfz',[57,62,66,69,72,76,79,83],3.4),
 'spiccato':('ViolinEnsSpic.sfz',[57,62,66,69,72,76,79,83],1.2),
 'viola':('ViolaEnsSusVib.sfz',[48,55,60,67],3.4),
 'cello':('CelloEnsSusVib.sfz',[36,43,48,55,60],3.4),
 'bass':('ContrabassSusNV.sfz',[28,36,43],3.4),
 'pizzicato':('ViolinEnsPizz.sfz',[57,62,69,76],1.3),
 'harp':('Harp.sfz',[48,55,60,67,72,79],3.4),
 'flute':('FluteSusVib.sfz',[60,67,72,79,84],3.2),
 'oboe':('OboeSusVib.sfz',[58,65,72,79],3.2),
 'clarinet':('ClarinetSus.sfz',[52,60,67],3.2),
 'bassoon':('BassoonSus.sfz',[36,48,60],3.2),
 'horn':('FHornSus.sfz',[48,55,60,67],3.4),
 'trumpet':('TrumpetSus.sfz',[60,65,72,79],3.2),
 'trombone':('TromboneSus.sfz',[40,48,55],3.4),
 'tuba':('TubaSus.sfz',[29,36,43],3.4),
 'timpani':('Timpani.sfz',[42,46,50,55],3.4),
 'glock':('Glockenspiel.sfz',[72,84,91],3.8),
 'bell':('TubularBells.sfz',[48,60,72],4.5)
}
def download(ref,path,dest):
 if dest.exists():return dest
 dest.parent.mkdir(parents=True,exist_ok=True)
 url='https://raw.githubusercontent.com/sgossner/VSCO-2-CE/'+ref+'/'+urllib.parse.quote(path,safe='/')
 subprocess.run(['curl','-fsSL','--retry','3',url,'-o',str(dest)],check=True,capture_output=True)
 return dest
tree=WORK/'vsco-tree.json'
if not tree.exists():subprocess.run(['curl','-fsSL','--retry','3','https://api.github.com/repos/sgossner/VSCO-2-CE/git/trees/'+COMMIT+'?recursive=1','-o',str(tree)],check=True)
files=json.loads(tree.read_text())['tree'];paths={x['path'] for x in files if x['type']=='blob'}
plans={}
for name,(sfz,targets,seconds) in INSTRUMENTS.items():
 s=download(SFZ,sfz,WORK/'sfz'/sfz).read_text();default=re.search(r'default_path=([^\r\n]+)',s).group(1).strip().replace('\\','/')
 regions=[]
 for r in s.split('<region>')[1:]:
  sample=re.search(r'sample=([^\r\n]+)',r)
  center=re.search(r'pitch_keycenter=(\d+)',r)
  if not sample or not center:continue
  path=default+sample.group(1).strip().replace('\\','/')
  if path not in paths:
   matches=[p for p in paths if p.endswith('/'+path.split('/')[-1])]
   if len(matches)!=1:raise ValueError(path)
   path=matches[0]
  low=re.search(r'lovel=(\d+)',r);high=re.search(r'hivel=(\d+)',r)
  regions.append({'source':path,'root':int(center.group(1)),'velocity':(int(low.group(1)) if low else 0,int(high.group(1)) if high else 127)})
 selected=[]
 for key in targets:
  candidates=[r for r in regions if r['velocity'][0]<=94<=r['velocity'][1]] or regions
  chosen=min(candidates,key=lambda r:abs(r['root']-key))
  if chosen['source'] not in [r['source'] for r in selected]:selected.append({**chosen,'limit':seconds})
 plans[name]=selected
plans.update({
 'snare':[{'source':'VSCO 1 Percussion/drums/snare/OldSnare/snare_f.wav','root':38,'limit':1.6},{'source':'VSCO 1 Percussion/drums/snare/OldSnare/snare_f2.wav','root':38,'limit':1.6}],
 'drum':[{'source':'Percussion/BDrumNewhit_v5_rr1_Sum.wav','root':36,'limit':3.5},{'source':'Percussion/BDrumNewhit_v5_rr2_Sum.wav','root':36,'limit':3.5}],
 'cymbal':[{'source':'Percussion/cymbal-crash1_mf_rr1.wav','root':49,'limit':5.8}],
 'triangle':[{'source':'Percussion/Triangle6-Hit_v2_rr1_Sum.wav','root':81,'limit':3.2}]
})
all_regions=[r for rs in plans.values() for r in rs]
def get(r):
 path=r['source'];dest=WORK/'source'/path;download(COMMIT,path,dest);return path
with ThreadPoolExecutor(max_workers=5) as pool:list(pool.map(get,all_regions))
manifest={'version':1,'sampleRate':RATE,'license':'CC0-1.0','source':'https://github.com/sgossner/VSCO-2-CE','sourceCommit':COMMIT,'mappingCommit':SFZ,'instruments':{}}
for name,regions in plans.items():
 chunks=[np.zeros(int(RATE*.12),dtype=np.float64)];cursor=.12;entries=[]
 for index,r in enumerate(regions):
  pcm=WORK/'pcm'/f'{name}-{index}.wav';pcm.parent.mkdir(exist_ok=True)
  subprocess.run(['afconvert',str(WORK/'source'/r['source']),str(pcm),'-f','WAVE','-d','LEI16','-c','1','-r',str(RATE)],check=True,capture_output=True)
  with wave.open(str(pcm),'rb') as w:a=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float64)/32768
  # Remove recording lead-in without removing natural bow/breath transients.
  peak=np.max(np.abs(a));activity=np.flatnonzero(np.abs(a)>peak*.025);start=max(0,int(activity[0]) - int(RATE*.008)) if len(activity) else 0
  a=a[start:start+int(r['limit']*RATE)];rms=float(np.sqrt(np.mean(a*a)));a*=min(2.5,.10/max(.003,rms),.78/max(.001,np.max(np.abs(a))))
  fade=min(int(RATE*.08),len(a)//10);a[-fade:]*=np.linspace(1,0,fade);a[:int(.004*RATE)]*=np.linspace(0,1,int(.004*RATE))
  duration=len(a)/RATE;entries.append({'root':r['root'],'offset':round(cursor,6),'duration':round(duration,6),'source':r['source'],'sourceSha256':hashlib.sha256((WORK/'source'/r['source']).read_bytes()).hexdigest()});chunks.extend([a,np.zeros(int(.15*RATE))]);cursor+=duration+.15
 data=np.concatenate(chunks);bank=WORK/f'{name}-bank.wav'
 with wave.open(str(bank),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(RATE);w.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
 dest=OUT/f'{name}.m4a';subprocess.run(['afconvert',str(bank),str(dest),'-f','m4af','-d','aac','-b','80000','-q','127'],check=True,capture_output=True)
 manifest['instruments'][name]={'file':dest.name,'seconds':round(len(data)/RATE,4),'bytes':dest.stat().st_size,'samples':entries}
 print(name,len(entries),dest.stat().st_size,flush=True)
(OUT/'orchestra.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('TOTAL',sum(b['bytes'] for b in manifest['instruments'].values()),'bytes',len(all_regions),'samples',flush=True)
