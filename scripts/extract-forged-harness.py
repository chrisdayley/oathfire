"""Rebuild the CC0 artist-authored, bone-local limb armor using Blender.
Source and license: public/licenses/crownjoshua-knight-CC0.txt.
Run extract-forged-armor.py first for the helmet.
"""
import bpy,os,json,math
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('work/art-production/artist-knight.blend'),use_scripts=False)
arm=next(o for o in bpy.data.objects if o.type=='ARMATURE' and 'DEF-upper_arm.L' in o.data.bones)
for o in bpy.data.objects:
 if o.type=='ARMATURE':o.data.pose_position='REST'
bpy.context.view_layer.update()
out={}
config=[('Shoulder-Plate','upperarm','DEF-upper_arm.L',(0.225,.225,.230),-.040),('Gauntlets','lowerarm','DEF-forearm.L',(.12,.245,.125),.015),('cuisse','upperleg','DEF-thigh.L',(.17,.36,.19),.025),('cuisse','knee','DEF-shin.L',(.14,.12,.16),-.020),('Shoes','lowerleg','DEF-shin.L',(.13,.365,.14),.045),('Shoes','foot','DEF-foot.L',(.145,.235,.145),-.010)]
for name,part,bone,size,start in config:
 ob=bpy.data.objects[name]
 for mod in ob.modifiers:
  if mod.type=='SUBSURF':mod.levels=1
 ev=ob.evaluated_get(bpy.context.evaluated_depsgraph_get());me=ev.to_mesh();me.calc_loop_triangles()
 # Evaluate known source vertex groups rather than inferring a silhouette from a box.
 wanted=('DEF-upper_arm.' if part=='upperarm' else 'DEF-forearm.' if part=='lowerarm' else 'DEF-thigh.' if part=='upperleg' else 'DEF-shin.' if part in ['knee','lowerleg'] else ('DEF-foot.','DEF-toe.'))
 groups={g.index:g.name for g in ob.vertex_groups};tri=[]
 for t in me.loop_triangles:
  scores={}
  for vi in t.vertices:
   for g in me.vertices[vi].groups:
    key=groups.get(g.group,'');scores[key]=scores.get(key,0)+g.weight
  if not scores:continue
  primary=max(scores,key=scores.get)
  if primary.startswith(wanted) and '.L' in primary:tri.append(t)
 if not tri:raise RuntimeError('No triangles '+part)
 ids=sorted(set(i for t in tri for i in t.vertices));ref={old:new for new,old in enumerate(ids)}
 bo=arm.data.bones[bone];head=arm.matrix_world@bo.head_local;tail=arm.matrix_world@bo.tail_local;along=(tail-head).normalized();front=Vector((0,1,0));front=(front-along*front.dot(along)).normalized();right=along.cross(front).normalized()
 pts=[]
 for i in ids:
  v=ob.matrix_world@me.vertices[i].co-head;pts.append([v.dot(right),v.dot(along),-v.dot(front)])
 lo=[min(p[i]for p in pts)for i in range(3)];hi=[max(p[i]for p in pts)for i in range(3)]
 pts=[[(p[0]-(lo[0]+hi[0])/2)*size[0]/(hi[0]-lo[0]),start+(p[1]-lo[1])*size[1]/(hi[1]-lo[1]),(p[2]-(lo[2]+hi[2])/2)*size[2]/(hi[2]-lo[2])]for p in pts]
 out[part]={'positions':pts,'triangles':[[ref[i] for i in reversed(t.vertices)]for t in tri],'materials':[t.material_index for t in tri],'slots':[(m.name,list(m.diffuse_color))for m in ob.data.materials]}
 print('EXTRACT',part,len(pts),len(tri));ev.to_mesh_clear()
out['helmet']=json.load(open('art-source/forged-armor.json'))['Helmet']
for piece in out.values():piece['positions']=[[round(v,5) for v in row]for row in piece['positions']]
open('public/models/forged-harness.json','w').write(json.dumps(out,separators=(',',':')))

