"""Compact Poly Haven's CC0 props and author a reusable stone arcade in Blender."""
import bpy,os,math,json,random
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'public/models/courtyard');os.makedirs(OUT,exist_ok=True)
for name in ['large_castle_door','wooden_barrels_01','wooden_lantern_01','round_wooden_table_01']:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'work/art-production',name,name+'.gltf'))
 for ob in list(bpy.context.scene.objects):
  if ob.type!='MESH':continue
  bpy.context.view_layer.objects.active=ob
  if len(ob.data.polygons)>3000:
   d=ob.modifiers.new('Mobile mesh budget','DECIMATE');d.ratio=min(1,3000/len(ob.data.polygons));bpy.ops.object.modifier_apply(modifier=d.name)
 for im in bpy.data.images:
  if im.size[0]>(1024 if name=='large_castle_door' else 512) or im.size[1]>(1024 if name=='large_castle_door' else 512):
   sz=1024 if name=='large_castle_door' else 512;im.scale(sz,sz);im.pack()
 # glTF material textures are packed into each independent game asset.
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',export_image_format='JPEG',export_jpeg_quality=83,export_animations=False)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
stone=bpy.data.materials.new('limestone');stone.diffuse_color=(.6,.54,.42,1)
def block(name,p,size,angle=0,bevel=.035):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0],-p[2],p[1]));o=bpy.context.object;o.name=name;o.scale=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.rotation_euler.y=angle
 o.data.materials.append(stone);m=o.modifiers.new('Worn stone edges','BEVEL');m.width=bevel;m.segments=2;bpy.ops.object.modifier_apply(modifier=m.name)
 o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');return o
# Full-size 8m clear gate opening, continuous rounded archivolt and carved columns.
random.seed(7821)
for side in [-1,1]:
 for row in range(12):
  for col in range(3):
   x=side*(4.18+col*.57);block('Dressed pier stone',(x,(row+.5)*.4,0),(.55,.385,.50+random.random()*.07))
 for z in [-.07,.10]:
  for row in range(10):block('Engaged column',(side*4.04,row*.44+.22,z+.28),(.21,.432,.22),bevel=.055)
 for y in [.13,4.57,4.76]:block('Column capital',(side*4.05,y,.25),(.52,.20,.60),bevel=.03)
for ring in range(3):
 for i in range(25):
  a=(i+.5)*math.pi/25;inner=4.0+ring*.27;outer=inner+.26;verts=[]
  for depth in [-.06,.40-ring*.05]:
   for radius in [inner,outer]:
    for aa in [a-math.pi/50+.003,a+math.pi/50-.003]:verts.append((math.cos(aa)*radius,-depth,4.78+math.sin(aa)*radius*.44))
  faces=[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)]
  me=bpy.data.meshes.new('Voussoir');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Carved archivolt',me);bpy.context.collection.objects.link(o);o.data.materials.append(stone);bpy.context.view_layer.objects.active=o;mod=o.modifiers.new('Chipped stone edges','BEVEL');mod.width=.015;mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art-source/castle-arch.blend'),compress=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'castle-arch.glb'),export_format='GLB',export_animations=False)
