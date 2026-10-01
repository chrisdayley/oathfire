import * as T from 'three';
import {arrowMesh} from './art.js';
import {updateFortification} from './fortifications.js';
export function clearDefensePreview(ui){for(const p of ui.defenseEffects||[]){p.model.removeFromParent();p.model.traverse(o=>{if(!o.geometry?.userData.shared)o.geometry?.dispose();if(o.material)o.material.dispose();});}ui.defenseEffects=[];ui.defensePreview=null;}
export function fireDefensePreview(ui){
 const id=ui.defense,root=ui.defensePreview;if(!root)return;ui.defensePulse=1;ui.preview?.attack(id==='tower'?'bow':id==='mortar'?'hammer':'crossbow',true,0,1);
 ui.g.audio.play({tower:'bow',ballista:'bolt',cannon:'shell',mortar:'stone',frost:'frost',storm:'storm',sanctuary:'sanctuary',gate:'metal'}[id],.6);
 let model;const color={frost:0x98dcea,storm:0xbadfff,sanctuary:0xeecf8a,cannon:0x4f5354,mortar:0x8b8270,gate:0xd9b778}[id]||0xeeddb5;
 if(['tower','ballista'].includes(id))model=arrowMesh(id==='ballista');
 else if(['gate','sanctuary'].includes(id)){model=new T.Mesh(new T.RingGeometry(1.5,1.62,48),new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:.85}));model.rotation.x=-Math.PI/2;}
 else if(id==='storm'){const points=[];for(let i=0;i<=8;i++)points.push(new T.Vector3(Math.sin(i*4)*.16,-i*.13,-i*.55));model=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color}));}
 else{const geo=id==='frost'?new T.OctahedronGeometry(.20):id==='mortar'?new T.IcosahedronGeometry(.3,1):new T.SphereGeometry(.2,12,8);model=new T.Mesh(geo,new T.MeshStandardMaterial({color,metalness:id==='cannon'?.7:0,roughness:.65,emissive:id==='frost'?0x2b6983:0,emissiveIntensity:1.3}));if(id==='frost')model.scale.z=2.5;}
 const pos=['gate','sanctuary'].includes(id)?new T.Vector3(0,.12,0):root.userData.muzzle.clone();model.position.copy(pos);ui.g.view.previewScene.add(model);ui.defenseEffects.push({model,id,pos,time:0});
}
export function tickDefensePreview(ui,dt){
 if(!ui.defensePreview)return;ui.defensePulse=Math.max(0,(ui.defensePulse||0)-dt*2);updateFortification({model:ui.defensePreview,recoil:ui.defensePulse*.35},ui.g.time+performance.now()/1000);const aim=ui.defensePreview.userData.aim;if(aim)aim.position.z=Math.sin(ui.defensePulse*Math.PI)*.24;
 for(let i=(ui.defenseEffects?.length||0)-1;i>=0;i--){const p=ui.defenseEffects[i];p.time+=dt;const t=p.time;if(['gate','sanctuary'].includes(p.id)){p.model.scale.setScalar(1+t*2);p.model.material.opacity=Math.max(0,.8-t*.6);}else if(p.id!=='storm'){p.model.position.z=p.pos.z-t*5;p.model.position.y=p.pos.y+(p.id==='mortar'?3*t-3*t*t:0);}if(t>1.25){p.model.removeFromParent();p.model.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});ui.defenseEffects.splice(i,1);}}
}
