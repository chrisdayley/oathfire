import bpy,math,os
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('work/art-production/artist-knight.blend'),use_scripts=False)
keep=['Man','BreastPlate','Shoulder-Plate','Belt','cuisse','Gauntlets','Helmet','Shoes','eyes-Left','eyes-Right']
for ob in list(bpy.data.objects):
 if ob.type=='ARMATURE':ob.data.pose_position='REST';continue
 if ob.name not in keep:bpy.data.objects.remove(ob,do_unlink=True)
 else:
  ob.hide_render=False;ob.hide_viewport=False;ob.hide_set(False)
  for m in ob.modifiers:
   if m.type=='SUBSURF':m.levels=1;m.render_levels=1
bpy.context.scene.render.engine='CYCLES';bpy.context.scene.cycles.samples=16
bpy.context.scene.world.use_nodes=True;bpy.context.scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.18,.18,.18,1)
for pos,energy,size in [((3,-4,6),650,5),((-4,-2,3),350,4),((0,4,6),900,4)]:
 bpy.ops.object.light_add(type='AREA',location=pos);ob=bpy.context.object;ob.data.energy=energy;ob.data.shape='DISK';ob.data.size=size;ob.rotation_euler=(Vector((0,0,2))-ob.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(3,7,2.4));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.4))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=48;bpy.context.scene.camera=cam
bpy.context.scene.render.resolution_x=800;bpy.context.scene.render.resolution_y=800;bpy.context.scene.render.resolution_percentage=100;bpy.context.scene.render.filepath=os.path.abspath('work/art-production/artist-knight.png');bpy.ops.render.render(write_still=True)
