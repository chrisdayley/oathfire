"""Oathfire's editable 3D source. Run with Blender 4.2+ --background --python.

Authored in socket-local coordinates, converted to glTF's Y-up convention.
The game binds these meshes to its existing animation skeleton. Body proportions,
plate curvature, cloth folds and fittings are baked here, never rebuilt per frame.
"""
import bpy, math, json, os, re, random
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'public/models/atelier'); os.makedirs(OUT,exist_ok=True)
SOURCE=os.path.join(ROOT,'art-source'); os.makedirs(SOURCE,exist_ok=True)
random.seed(191)
def xyz(p): return (p[0],-p[2],p[1])
materials={}
for name,color,metal,rough in [('steel',(0.6,.65,.7),.86,.31),('ivory',(.78,.74,.64),.7,.35),('gold',(.58,.36,.12),.82,.32),('leather',(.13,.075,.036),0,.8),('dark',(.025,.028,.035),.15,.7),('cloth',(.04,.08,.15),0,.9),('mail',(.20,.23,.25),.72,.68),('skin',(.64,.4,.27),0,.8),('hair',(.06,.038,.021),0,.85),('eye',(.65,.65,.53),0,.45),('iris',(.11,.18,.15),0,.35),('ember',(1,.24,.025),.1,.3)]:
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 materials[name]=m
def reset():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def make(name,bone,verts,faces,mat,uvs=None,sub=0,**props):
 mesh=bpy.data.meshes.new(name);mesh.from_pydata([xyz(p) for p in verts],[],faces);mesh.update()
 o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.data.materials.append(materials[mat]);o['socket']=bone;o['surface']=mat
 for k,v in props.items():o[k]=v
 for p in mesh.polygons:p.use_smooth=True
 if uvs:
  layer=mesh.uv_layers.new(name='UVMap')
  for poly in mesh.polygons:
   for li in poly.loop_indices:layer.data[li].uv=uvs[mesh.loops[li].vertex_index]
 if sub:
  mod=o.modifiers.new('Tailored surface subdivision','SUBSURF');mod.levels=sub;mod.render_levels=sub
 return o
def shell(name,bone,rings,mat,n=24,fold=0,start=0,end=math.tau,sub=1,**props):
 v=[];uv=[];f=[]
 for j,row in enumerate(rings):
  y,rx,rz,*cz=row;z=cz[0] if cz else 0
  for i in range(n+1):
   a=start+(end-start)*i/n;wrinkle=fold*(math.sin(a*9+j*.9)+.45*math.sin(a*17-j*.6));fac=1+wrinkle
   v.append((math.sin(a)*rx*fac,y,math.cos(a)*rz*fac+z));uv.append((i/n,j/(len(rings)-1)))
 for j in range(len(rings)-1):
  for i in range(n):a=j*(n+1)+i;f.append((a,a+1,a+n+2,a+n+1))
 o=make(name,bone,v,f,mat,uv,sub,**props)
 mod=o.modifiers.new('Material thickness','SOLIDIFY');mod.thickness=.002 if mat in ['cloth','leather'] else .003
 return o
def ball(name,bone,pos,scale,mat,**props):
 v=[];uv=[];f=[];n=16;rows=10
 for j in range(rows+1):
  ph=.001+(math.pi-.002)*j/rows
  for i in range(n+1):
   a=i/n*math.tau;v.append((pos[0]+math.sin(ph)*math.sin(a)*scale[0],pos[1]+math.cos(ph)*scale[1],pos[2]+math.sin(ph)*math.cos(a)*scale[2]));uv.append((i/n,j/rows))
 for j in range(rows):
  for i in range(n):a=j*(n+1)+i;f.append((a,a+1,a+n+2,a+n+1))
 return make(name,bone,v,f,mat,uv,**props)
def tube(name,bone,points,radius,mat,**props):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=5;curve.bevel_depth=radius;curve.bevel_resolution=1
 s=curve.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
 for p,co in zip(s.bezier_points,points):p.co=xyz(co);p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o);o.data.materials.append(materials[mat]);o['socket']=bone;o['surface']=mat
 for k,v in props.items():o[k]=v
 return o
def hem(name,bone,y,rx,rz,mat='gold',z=0,**props):return tube(name,bone,[(math.sin(i*math.tau/24)*rx,y,math.cos(i*math.tau/24)*rz+z) for i in range(25)],.0035,mat,**props)
def panel(name,bone,outline,origin,mat,bulge=.01,**props):
 # Concentric control loops give metal a rolled edge and a gently domed face.
 cx=sum(p[0] for p in outline)/len(outline);cy=sum(p[1] for p in outline)/len(outline);v=[];uv=[];f=[];n=len(outline)
 for fac,depth in [(1,0),(.96,.002),(.82,bulge*.6),(.25,bulge)]:
  for x,y in outline:v.append((origin[0]+cx+(x-cx)*fac,origin[1]+cy+(y-cy)*fac,origin[2]+depth));uv.append((x/.4+.5,y/.5+.5))
 for j in range(3):
  for i in range(n):f.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
 f.append(tuple(range(3*n,4*n)))
 o=make(name,bone,v,f,mat,uv,0,**props);solid=o.modifiers.new('Forged edge thickness','SOLIDIFY');solid.thickness=.006;return o
def ribbon(name,bone,xc,y0,y1,width,z,mat,**props):
 v=[];uv=[];f=[];nx=8;ny=16
 for j in range(ny+1):
  t=j/ny
  for i in range(nx+1):
   u=i/nx;xx=(u-.5)*width*(.85+t*.25);zz=z+math.cos(u*math.pi*6)*(.008+t*.011)+t*.03
   v.append((xc+xx,y0+(y1-y0)*t+(math.sin(u*math.pi)*.02 if j==ny else 0),zz));uv.append((u,1-t))
 for j in range(ny):
  for i in range(nx):a=j*(nx+1)+i;f.append((a,a+1,a+nx+2,a+nx+1))
 return make(name,bone,v,f,mat,uv,1,**props)
def seal(bone,pos,r=.04,**props):
 ball('Sun cabochon',bone,pos,(r,r,.008),'gold',**props)
 for i in range(12):
  a=i*math.tau/12;dx=math.sin(a);dy=math.cos(a)
  panel('Sun ray',bone,[(-.003,0),(0,r*.46),(.003,0)],(pos[0]+dx*r*1.12,pos[1]+dy*r*1.12,pos[2]),'gold',.002,**props)
def face(role):
 raw=open(os.path.join(ROOT,'src/head-mesh.js')).read();h=json.loads(re.search(r'export const HEAD=(.*?);',raw).group(1));v=[]
 for i in range(0,len(h['positions']),3):
  x,y,z=h['positions'][i:i+3]
  if role=='ashwright':x*=1.07;z+=.005*max(0,1-abs(y-.05)*9)
  elif role=='ranger':x*=.94;z*=.98
  v.append((x,y,z))
 make('Anatomical face '+role,'head',v,[h['indices'][i:i+3] for i in range(0,len(h['indices']),3)],'skin',[h['uvs'][i:i+2] for i in range(0,len(h['uvs']),2)],1)
 for s in [-1,1]:
  ball('Eye','head',(s*.0354,.110,.101),(.021,.014,.021),'eye');ball('Iris','head',(s*.0354,.110,.121),(.0065,.007,.003),'iris');ball('Pupil','head',(s*.0354,.110,.123),(.003,.0045,.0018),'dark')
  tube('Eyebrow','head',[(s*.019,.133,.149),(s*.037,.139,.147),(s*.061,.131,.131)],.0025,'hair')
 # Scalp geometry from anatomical head; shaped flattened locks follow the skull.
 scalp=[tuple(f) for f in [h['indices'][i:i+3] for i in range(0,len(h['indices']),3)] if all(v[k][1]>(.184 if v[k][2]>.055 else .108) for k in f)]
 make('Hair scalp','head',[(x*1.03,y+.009,z*1.025) for x,y,z in v],scalp,'hair',sub=1)
 for i in range(9):
  x=(i-4)*.017
  tube('Swept hair lock','head',[(x,.179+abs(i-4)*.003,.071),(x-.016,.213,.044),(x-.022,.219,.005),(x-.010,.199,-.071)],.004,'hair')
 if role=='ashwright':
  for i in range(-9,10):
   x=i*.006;tube('Braided grey beard','head',[(x,.038,.12-abs(x)*.26),(x*1.12,-.009,.103),(x*.7,-.052,.087)],.005,'hair')
def outfit(role):
 reset();hero=role!='bow';smith=role=='ashwright';ranger=role in ['ranger','bow'];plate=not ranger and not smith
 face(role)
 shell('Padded hip foundation','hips',[[-.10,.16,.103],[0,.169,.116],[.12,.15,.103],[.18,.15,.105]],'dark',fold=.018)
 shell('Waisted gambeson','spine',[[0,.149,.103],[.06,.151,.108],[.18,.176,.12],[.26,.196,.135]],'mail' if plate else 'leather',fold=.025)
 shell('Fitted coat','chest',[[-.16,.151,.110],[-.12,.173,.133],[-.04,.211,.144],[.06,.222,.145],[.13,.214,.127],[.19,.166,.092],[.205,.151,.085]],'steel' if plate else 'leather',n=32,fold=.015 if not plate else 0)
 shell('Soft neck','chest',[[.18,.060,.065],[.24,.061,.063],[.30,.052,.054]],'leather')
 shell('Articulated gorget','chest',[[.143,.176,.112],[.17,.172,.11],[.215,.092,.072],[.24,.08,.068]],'gold' if smith else 'steel' if plate else 'cloth',n=28,fold=.035 if ranger else 0)
 if plate:
  for s in [-1,1]:
   # Two fitted, overlapping breast plates meet at a raised center keel.
   panel('Ivory breast plate','chest',[(0,-.135),(s*.11,-.119),(s*.197,.028),(s*.175,.137),(s*.08,.173),(0,.151)],(0,0,.143),'ivory',.010)
   tube('Breast engraved scroll','chest',[(s*.018,-.08,.158),(s*.074,-.066,.157),(s*.103,.017,.162),(s*.146,.096,.133)],.0025,'gold')
   panel('Fluted hip tasset','hips',[(-.062,.07),(.058,.07),(.083,-.26),(.042,-.34),(-.072,-.28)],(s*.148,-.03,.10),'ivory',.017)
  seal('chest',(0,.046,.165),.037)
 elif ranger:
  for s in [-1,1]:
   panel('Overlapping brigandine breast','chest',[(-.05,-.12),(.057,-.13),(.084,.061),(.042,.155),(-.07,.132)],(s*.105,0,.137),'leather',.003)
   for j in range(6):ball('Brigandine rivet','chest',(s*.155,.13-j*.048,.145),(.003,.003,.002),'gold')
  shell('Draped shoulder cowl','chest',[[.13,.233,.139],[.175,.245,.145],[.223,.17,.11],[.25,.107,.087],[.265,.103,.085]],'cloth',n=36,fold=.05,minRank=3 if not hero else 1)
  for s in [-1,1]:ribbon('Split leather coat','hips',s*.105,.07,-.46,.195,.125,'leather')
  if hero:panel('Asymmetric ranger cuirass','chest',[(-.06,-.10),(.07,-.08),(.09,.15),(-.10,.15)],(.11,-.01,.145),'steel',.015)
 else:
  ribbon('Sculpted forge apron','chest',0,.13,-.76,.355,.165,'leather')
  for s in [-1,1]:
   tube('Apron shoulder harness','chest',[(s*.17,.2,.082),(s*.12,.09,.193),(s*.13,-.16,.181)],.013,'leather')
   panel('Apron clasp','chest',[(-.021,-.027),(.021,-.027),(.021,.027),(-.021,.027)],(s*.12,.1,.2),'gold',.002)
  for x in [-.092,0,.092]:panel('Forging tool pocket','hips',[(-.033,.035),(.033,.035),(.029,-.085),(-.029,-.085)],(x,-.035,.19),'leather',.014)
 shell('Fitted belt','hips',[[.102,.176,.132],[.112,.18,.137],[.155,.18,.137],[.164,.172,.13]],'leather',n=32)
 panel('Belt buckle','hips',[(-.038,-.024),(.038,-.024),(.038,.024),(-.038,.024)],(.01,.132,.148),'gold',.004)
 panel('Buckle inset','hips',[(-.026,-.015),(.026,-.015),(.026,.015),(-.026,.015)],(.01,.132,.160),'dark',.002)
 for s in [-1,1]:
  panel('Belt satchel','hips',[(-.04,.04),(.04,.04),(.05,-.07),(.035,-.088),(-.04,-.08)],(s*.188,.03,.075),'leather',.025)
  tube('Satchel stitched edge','hips',[(s*.188-.035,.062,.09),(s*.188,.052,.115),(s*.188+.035,.062,.09)],.002,'gold')
  suffix='l' if s>0 else 'r';arm='upperarm'+suffix;fore='lowerarm'+suffix;hand='hand'+suffix;shin='lowerleg'+suffix;thigh='upperleg'+suffix;foot='foot'+suffix
  shell('Tailored sleeve',arm,[[-.035,.076,.073],[.025,.09,.086],[.12,.082,.08],[.21,.06,.064],[.285,.051,.052]],'skin' if smith else 'mail' if plate else 'cloth',fold=.06 if not smith else 0)
  ball('Elbow joint',fore,(0,0,0),(.047,.045,.047),'skin' if smith else 'leather')
  shell('Forearm sleeve',fore,[[-.014,.054,.053],[.065,.064,.059],[.145,.054,.052],[.245,.039,.038]],'leather',fold=.05)
  shell('Fitted breeches',thigh,[[-.02,.085,.088],[.06,.092,.089],[.17,.087,.08],[.29,.071,.066],[.43,.051,.053]],'dark',fold=.055)
  shell('Boot leg',shin,[[-.03,.057,.064],[.07,.067,.066],[.16,.063,.06],[.30,.044,.047],[.42,.041,.043]],'leather',fold=.035)
  # A sculpted leather boot in local foot coordinates, matching the rig's angled foot.
  def rotfoot(x,y,z):return (x,y*math.cos(-math.pi*.75)-z*math.sin(-math.pi*.75),y*math.sin(-math.pi*.75)+z*math.cos(-math.pi*.75))
  verts=[];faces=[];uv=[]
  for j,(z,rx,ry,cy) in enumerate([(-.068,.022,.025,.008),(-.04,.056,.078,.018),(.02,.062,.073,.012),(.08,.060,.052,-.008),(.16,.055,.035,-.018),(.205,.035,.024,-.020),(.219,.004,.006,-.021)]):
   for i in range(17):a=i*math.tau/16;verts.append(rotfoot(math.sin(a)*rx,math.cos(a)*ry+cy,z));uv.append((i/16,j/6))
  for j in range(6):
   for i in range(16):a=j*17+i;faces.append((a,a+1,a+18,a+17))
  make('Sculpted boot',foot,verts,faces,'leather',uv,1)
  for y in [.105,.276]:hem('Greave leather fastening',shin,y,.066-y*.05,.068-y*.06,'leather')
  for y in [.105,.276]:panel('Greave fastening buckle',shin,[(-.010,-.014),(.010,-.014),(.010,.014),(-.010,.014)],(s*.060,y,0),'gold',.003)
  for j in range(3):
   z=.065+j*.038
   tube('Boot instep lacing',foot,[rotfoot(-.042,.030-j*.008,z),rotfoot(0,.040-j*.008,z+.008),rotfoot(.042,.030-j*.008,z)],.0027,'dark')
  shell('Glove cuff','wrist'+suffix,[[0,.038,.037],[.04,.042,.037],[.071,.039,.032]],'leather')
  shell('Gloved hand',hand,[[-.005,.034,.029],[.045,.043,.029],[.08,.039,.027],[.093,.026,.023]],'leather',n=20)
  for i in range(4):tube('Articulated finger',hand,[((i-1.5)*.017,.06,.018),((i-1.5)*.016,.10,.025),((i-1.5)*.014,.111,.043)],.007,'leather')
  tube('Glove thumb',hand,[(s*.032,.016,.012),(s*.053,.05,.023),(s*.038,.075,.041)],.009,'leather')
  # A curved open pauldron cap, and downward overlapping lames; no stacked cylinders.
  for tier in range(3):
   lo=1 if hero else [2,5,8][tier];hi=10 if tier==2 else [4,7][tier]
   if hero and tier!=1:continue
   width=(.104 if ranger else .116 if smith else .117)+(tier-1)*.01
   n=20;rows=9;v=[];f=[];uv=[]
   for j in range(rows+1):
    ph=.001+(1.8-.001)*j/rows
    for i in range(n+1):
     a=i*math.tau/n;v.append((math.sin(ph)*math.sin(a)*width,-.015-math.cos(ph)*.047,math.sin(ph)*math.cos(a)*width*.95));uv.append((i/n,j/rows))
   for j in range(rows):
    for i in range(n):a=j*(n+1)+i;f.append((a,a+1,a+n+2,a+n+1))
   props={'minRank':lo,'maxRank':10 if hero else hi}
   make('Forged shoulder cap',arm,v,f,'gold' if smith else 'steel',uv,1,**props)
   for j in range(2+tier):
    shell('Overlapping shoulder lame',arm,[[.014+j*.038,width*.99,width*.90],[.027+j*.038,width*1.02,width*.91],[.060+j*.04,width*.95,width*.88]],'steel' if ranger else 'ivory' if plate else 'leather',n=24,**props)
    hem('Rolled pauldron rim',arm,.061+j*.04,width*.95,width*.885,**props)
  panel('Curved vambrace',fore,[(-.048,.02),(0,-.012),(.048,.02),(.034,.195),(0,.226),(-.035,.195)],(0,0,-.064),'steel' if not smith else 'gold',-.016,minRank=1 if hero else 4)
  for y in [.055,.183]:hem('Vambrace strap',fore,y,.064-y*.095,.06-y*.078,'leather')
  if plate or hero:
   panel('Fitted greave',shin,[(-.055,0),(0,-.043),(.055,0),(.055,.14),(.034,.371),(-.034,.371),(-.055,.14)],(0,0,-.067),'ivory' if plate else 'steel',-.016)
   tube('Greave central ridge',shin,[(0,-.023,-.082),(0,.123,-.093),(0,.359,-.061)],.003,'gold')
  else:panel('Veteran shin guard',shin,[(-.055,0),(.05,0),(.035,.28),(-.035,.28)],(0,.02,-.07),'steel',-.012,minRank=6)
  if plate:
   panel('Knee cop',shin,[(-.056,0),(-.035,.06),(.04,.063),(.073,.01),(.033,-.034),(-.04,-.027)],(0,-.01,-.088),'gold',-.012)
  if ranger:
   ribbon('Ranked split mantle','hips',s*.113,.08,-.50,.16,.153,'cloth',minRank=5 if not hero else 1)
  for i in range(9):
   panel('Earned rank seal',fore,[(-.005,0),(0,.008),(.005,0),(0,-.008)],((i%2-.5)*.017,.04+(i//2)*.021,-.082),'gold',-.002,minRank=i+2)
 if ranger:
  shell('Sculpted hood','head',[[-.031,.091,.099,-.008],[.02,.13,.133,-.014],[.11,.137,.145,-.027],[.20,.124,.14,-.038],[.272,.078,.094,-.028],[.302,.007,.032,-.031]],'cloth',n=32,start=.75,end=math.tau-.75,fold=.025,minRank=1 if hero else 3)
  for s in [-1,1]:tube('Embroidered hood edge','head',[(s*.070,-.028,.082),(s*.097,.039,.1),(s*.105,.139,.09),(s*.073,.255,.063),(0,.30,.005)],.004,'gold',minRank=1 if hero else 5)
  # Long asymmetric feather crown, instead of an oversized pair of shoulder wings.
  for i in range(4):
   ribbon('Royal hood feather','head',.107+i*.012,.04,.19+i*.022,.018,-.055-i*.018,'gold',minRank=7+i)
  shell('Quiver','chest',[[-.34,.058,.054,-.245],[-.30,.067,.06,-.245],[.10,.075,.062,-.245],[.15,.077,.065,-.245]],'leather',n=20)
  # Move quiver to the off shoulder after authoring the cylindrical surface.
  for o in list(bpy.context.scene.objects):
   if o.name=='Quiver':o.location.x=.19
  for i in range(6):
   x=.148+i*.015;top=.40+(i%3)*.03
   tube('Visible arrow shaft','chest',[(x,-.24,-.25),(x-.045,top,-.25)],.003,'leather')
   panel('Arrow fletching','chest',[(0,0),(.015,.02),(.015,.08),(0,.065)],(x-.045,top-.075,-.25),'ivory',.001)
  tube('Quiver baldric','chest',[(-.195,.184,.07),(-.10,.09,.159),(.014,-.03,.173),(.162,-.15,.108)],.016,'leather')
 if smith:
  tube('Lantern hanger','hips',[(.18,.145,.02),(.25,-.02,.05),(.25,-.14,.09)],.009,'gold')
  shell('Forge lantern','hips',[[-.34,.048,.048,.09],[-.32,.053,.053,.09],[-.17,.044,.044,.09],[-.15,.055,.055,.09]],'gold',n=12)
  for o in list(bpy.context.scene.objects):
   if o.name=='Forge lantern':o.location.x=.25
  ball('Lantern ember','hips',(.25,-.24,.09),(.032,.068,.032),'ember')
  for i in range(6):
   a=i*math.tau/6;tube('Lantern cage','hips',[(.25+math.sin(a)*.049,-.33,.09+math.cos(a)*.049),(.25+math.sin(a)*.049,-.16,.09+math.cos(a)*.049)],.004,'dark')
 # A fitted artist-authored cuirass replaces the approximation used during blocking.
 if role=='warden':
  for o in list(bpy.context.scene.objects):
   if any(o.name.startswith(n) for n in ['Fitted coat','Ivory breast plate','Breast engraved scroll','Sun cabochon','Sun ray']):bpy.data.objects.remove(o,do_unlink=True)
  source=json.load(open(os.path.join(SOURCE,'forged-armor.json')))
  for piece in ['BreastPlate','Helmet']:
   a=source[piece]
   for index,slot in enumerate(a['slots']):
    faces=[f for f,m in zip(a['triangles'],a['materials']) if m==index]
    if not faces:continue
    col=slot[1];surface='gold' if col[0]>col[2]*1.25 else 'ivory'
    props={'minRank':6} if piece=='Helmet' else {}
    make('Forged '+piece, 'head' if piece=='Helmet' else 'chest',a['positions'],faces,surface,[(p[0]*2+.5,p[1]*2+.5) for p in a['positions']],0,**props)
 # Prestige fittings are silhouette changes, earned through the existing hero rank.
 if hero:
  for side in [-1,1]:
   for j in range(3):
    panel('Royal layered hip plate','hips',[(-.055,.035),(.050,.035),(.067,-.035),(0,-.075),(-.05,-.04)],(side*.17,-.05-j*.055,.145+j*.012),'gold' if j==0 else 'steel',.006,minRank=5+j)
   tube('Royal clasp chain','chest',[(side*.18,.15,.12),(side*.10,.08,.18),(0,.055,.18)],.003,'gold',minRank=8)
  if smith:
   seal('chest',(0,.05,.202),.045,minRank=6)
   for i in range(3):panel('Master forge rune','chest',[(-.015,0),(0,.035),(.015,0),(0,-.025)],((i-1)*.065,-.22,.194),'ember',.002,minRank=8+i)
  elif role=='warden':
   for i in range(11):
    x=(i-5)*.005
    tube('Royal horsehair plume','head',[(x,.245,-.025),(x,.348,-.052),(x,.361,-.124),(x,.297,-.203),(x,.18,-.24)],.0036,'cloth',minRank=9)
   seal('head',(0,.16,.131),.017,minRank=10)
 # All heroes have additional earned details and armor-family-specific geometry.
 for i in range(10):
  panel('Forge seal','chest',[(-.005,0),(0,.01),(.005,0),(0,-.01)],((1 if i%2 else -1)*(.07+(i//2)*.014),.125-(i//2)*.037,.177),'gold',.003,minForge=i+1)
 if hero:
  ribbon('Marshal sash','chest',-.12,.17,-.55,.10,.194,'cloth',armorKind='marshal')
  for s in [-1,1]:
   panel('Bastion raised guard','chest',[(-.05,0),(.06,0),(.065,.19),(.005,.24),(-.055,.17)],(s*.175,.095,.074),'steel',.013,armorKind='bastion')
   tube('Ember channels','chest',[(s*.08,-.12,.17),(s*.13,.005,.17),(s*.11,.12,.157)],.006,'ember',armorKind='ember')
   ribbon('Dawn stole','chest',s*.139,.18,-.81,.10,.18,'ivory',armorKind='dawn')
   panel('Spellweave collar','chest',[(-.055,0),(.055,0),(.063,.18),(0,.30),(-.045,.17)],(s*.17,.10,0),'gold',.01,armorKind='spellweave')
   panel('Trail satchel','hips',[(-.065,.06),(.064,.055),(.055,-.095),(-.05,-.1)],(s*.22,-.02,.1),'leather',.032,armorKind='trail')
 for o in list(bpy.context.scene.objects):
  if o.get('socket')=='head':
   o.scale=(.88,.88,.88);o.location.z+=.018
 # Convert curve fittings and apply modeled surface modifiers before glTF export.
 for o in list(bpy.context.scene.objects):
  bpy.context.view_layer.objects.active=o;o.select_set(True)
  if o.type=='CURVE':bpy.ops.object.convert(target='MESH')
  for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
  # Keep the authored curvature while reducing hidden/backside triangles for mobile.
  if o.type=='MESH' and len(o.data.polygons)>80 and not o.name.startswith(('Forged BreastPlate','Forged Helmet','Forged limb')):
   mod=o.modifiers.new('Mobile topology reduction','DECIMATE');mod.ratio=.18 if role=='bow' else .36
   bpy.ops.object.modifier_apply(modifier=mod.name)
  o.select_set(False)
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE,role+'.blend'),compress=True)
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,role+'.glb'),export_format='GLB',export_extras=True,export_yup=True,export_animations=False)
 stats={'role':role,'objects':len(bpy.context.scene.objects),'triangles':sum(len(p.vertices)-2 for o in bpy.context.scene.objects if o.type=='MESH' for p in o.data.polygons)}
 print('ASSET',json.dumps(stats));return stats
stats=[outfit(role) for role in ['warden','ashwright','ranger','bow']]
open(os.path.join(OUT,'manifest.json'),'w').write(json.dumps({'version':'2.3.0','source':'scripts/build-atelier-assets.py','models':stats},indent=2))
