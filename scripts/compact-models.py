"""Retain licensed geometry and a shared animation library; repack reachable GLB views."""
from pathlib import Path
import json,struct,shutil,hashlib
root=Path(__file__).resolve().parents[1]
archive=root/'work/build/original-models';archive.mkdir(parents=True,exist_ok=True)
clips={'Idle','Walking_A','Walking_B','Walking_Backwards','Running_A','Running_B','Running_Strafe_Left','Running_Strafe_Right','1H_Melee_Attack_Chop','1H_Melee_Attack_Slice_Diagonal','1H_Melee_Attack_Slice_Horizontal','1H_Melee_Attack_Stab','2H_Melee_Attack_Chop','2H_Melee_Attack_Slice','2H_Melee_Attack_Stab','2H_Melee_Attack_Spin','1H_Ranged_Aiming','1H_Ranged_Shoot','2H_Ranged_Aiming','2H_Ranged_Shoot','2H_Ranged_Reload','Block','Blocking','Block_Hit','Block_Attack','Dodge_Forward','Dodge_Backward','Dodge_Left','Dodge_Right','Death_A','Death_B','Hit_A','Hit_B','Jump_Start','Jump_Idle','Jump_Land','Spellcast_Long','Spellcast_Raise','Spellcast_Shoot','Spellcasting','Interact','PickUp','Cheer'}
manifest=[]
for dest in sorted((root/'public/models').glob('*.glb')):
 source=archive/dest.name
 if not source.exists():shutil.copyfile(dest,source)
 data=source.read_bytes();jsz=struct.unpack_from('<I',data,12)[0];j=json.loads(data[20:20+jsz]);blob=data[28+jsz:]
 j['animations']=[a for a in j.get('animations',[]) if dest.stem=='Knight' and a['name'] in clips]
 used=set()
 for m in j.get('meshes',[]):
  for p in m['primitives']:
   used.update(p.get('attributes',{}).values())
   if 'indices'in p:used.add(p['indices'])
   for t in p.get('targets',[]):used.update(t.values())
 for sk in j.get('skins',[]):
  if 'inverseBindMatrices'in sk:used.add(sk['inverseBindMatrices'])
 for a in j['animations']:
  for s in a['samplers']:used.update([s['input'],s['output']])
 remap={old:i for i,old in enumerate(sorted(used))};accessors=[j['accessors'][old] for old in sorted(used)]
 for m in j.get('meshes',[]):
  for p in m['primitives']:
   p['attributes']={k:remap[v] for k,v in p.get('attributes',{}).items()}
   if 'indices'in p:p['indices']=remap[p['indices']]
   p['targets']=[{k:remap[v] for k,v in t.items()} for t in p.get('targets',[])]
   if not p['targets']:del p['targets']
 for sk in j.get('skins',[]):
  if 'inverseBindMatrices'in sk:sk['inverseBindMatrices']=remap[sk['inverseBindMatrices']]
 for a in j['animations']:
  for s in a['samplers']:s['input']=remap[s['input']];s['output']=remap[s['output']]
 views=set(a['bufferView'] for a in accessors if 'bufferView'in a)
 for a in accessors:
  if 'sparse'in a:views.update([a['sparse']['indices']['bufferView'],a['sparse']['values']['bufferView']])
 views.update(im['bufferView'] for im in j.get('images',[]) if 'bufferView'in im)
 vr={old:i for i,old in enumerate(sorted(views))};newblob=bytearray();newviews=[]
 for old in sorted(views):
  v=dict(j['bufferViews'][old]);offset=v.get('byteOffset',0)
  while len(newblob)%4:newblob.append(0)
  v['byteOffset']=len(newblob);newblob.extend(blob[offset:offset+v['byteLength']]);newviews.append(v)
 for a in accessors:
  if 'bufferView'in a:a['bufferView']=vr[a['bufferView']]
  if 'sparse'in a:
   for name in ['indices','values']:a['sparse'][name]['bufferView']=vr[a['sparse'][name]['bufferView']]
 for im in j.get('images',[]):
  if 'bufferView'in im:im['bufferView']=vr[im['bufferView']]
 while len(newblob)%4:newblob.append(0)
 j['accessors']=accessors;j['bufferViews']=newviews;j['buffers']=[{'byteLength':len(newblob)}]
 raw=json.dumps(j,separators=(',',':')).encode()
 while len(raw)%4:raw+=b' '
 packed=struct.pack('<III',0x46546c67,2,28+len(raw)+len(newblob))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(newblob),0x004e4942)+newblob
 dest.write_bytes(packed);manifest.append({'file':dest.name,'originalBytes':len(data),'bytes':len(packed),'animations':len(j['animations']),'sha256':hashlib.sha256(packed).hexdigest()})
print(json.dumps(manifest,indent=2));(root/'public/models/manifest.json').write_text(json.dumps(manifest,indent=2))
