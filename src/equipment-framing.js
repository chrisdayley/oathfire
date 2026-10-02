import * as T from 'three';
// Fit the complete equipped silhouette, including long weapons and broad shields.
// Freeze the idle bounds during an attack so the inspection camera never chases the swing.
export function frameEquipment(camera,character,angle,margin=1.16){
 const c=character;if(!c?.held)return;
 let bounds=c.root.userData.equipmentFrame;
 if(!bounds||!c.actionLock){
  c.root.updateMatrixWorld(true);
  bounds=new T.Box3(new T.Vector3(-.55,0,-.35),new T.Vector3(.55,c.height+.34,.35));
  for(const model of [c.held,c.heldShield])if(model)bounds.union(new T.Box3().setFromObject(model));
  c.root.userData.equipmentFrame=bounds;
 }
 const center=bounds.getCenter(new T.Vector3()),direction=new T.Vector3(Math.sin(angle),.045,Math.cos(angle)).normalize(),right=new T.Vector3(Math.cos(angle),0,-Math.sin(angle)),up=new T.Vector3().crossVectors(direction,right),tan=Math.tan(camera.fov*Math.PI/360),v=new T.Vector3();
 let distance=3;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  v.set(x,y,z).sub(center);const depth=v.dot(direction),height=Math.abs(v.dot(up)),width=Math.abs(v.dot(right));distance=Math.max(distance,depth+Math.max(height/tan,width/(tan*camera.aspect))*margin);
 }
 camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);
}

// Hero portraits prioritize the armored body; the armory still frames every weapon tip.
export function frameHero(camera,character,angle,close=false){
 const height=character.height||2,center=new T.Vector3(0,height*(close?.66:.53),0),direction=new T.Vector3(Math.sin(angle),.015,Math.cos(angle)).normalize(),tan=Math.tan(camera.fov*Math.PI/360),vertical=height*(close?.37:.54),horizontal=close?.48:.70,distance=Math.max(vertical/tan,horizontal/(tan*camera.aspect))*1.06;
 camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);
}
