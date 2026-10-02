"""Derive fitted pieces from crownjoshua's CC0 Knight (Rigged - Mid Poly)."""
import bpy,json,os
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('work/art-production/artist-knight.blend'),use_scripts=False)
for ob in bpy.data.objects:
 if ob.type=='ARMATURE':ob.data.pose_position='REST'
result={}
for name in ['BreastPlate','Helmet']:
 ob=bpy.data.objects[name]
 for mod in ob.modifiers:
  if mod.type=='SUBSURF':mod.levels=1;mod.render_levels=1
 evaluated=ob.evaluated_get(bpy.context.evaluated_depsgraph_get());me=evaluated.to_mesh();me.calc_loop_triangles()
 verts=[list(ob.matrix_world@v.co) for v in me.vertices];lo=[min(p[i] for p in verts) for i in range(3)];hi=[max(p[i] for p in verts) for i in range(3)]
 dims=[hi[i]-lo[i] for i in range(3)];print(name,dims,[(m.name,tuple(m.diffuse_color)) for m in ob.data.materials])
 # Normalize into the socket frame: the source faces +Y, glTF characters face +Z.
 if name=='BreastPlate':scale=[.453/dims[0],.299/dims[1],.59/dims[2]];offset=[0,-.06,.014]
 else:scale=[.240/dims[0],.261/dims[1],.282/dims[2]];offset=[0,.125,-.012]
 pos=[[ (p[0]-(lo[0]+hi[0])/2)*scale[0]+offset[0],(p[2]-(lo[2]+hi[2])/2)*scale[2]+offset[1],(p[1]-(lo[1]+hi[1])/2)*scale[1]+offset[2]]for p in verts]
 result[name]={'positions':pos,'triangles':[list(reversed(t.vertices)) for t in me.loop_triangles],'materials':[t.material_index for t in me.loop_triangles],'slots':[(m.name,list(m.diffuse_color)) for m in ob.data.materials]}
 evaluated.to_mesh_clear()
os.makedirs('art-source',exist_ok=True);open('art-source/forged-armor.json','w').write(json.dumps(result,separators=(',',':')))
