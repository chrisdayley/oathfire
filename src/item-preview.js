import * as T from 'three';
import {weapon,compactRigid} from './art.js';
export class ItemPreview{
 constructor(item){this.root=new T.Group();this.weaponType=item.type;this.itemId=item.id;this.inspection=true;const model=compactRigid(weapon(item.type,1+Math.floor(item.plus/2),undefined,item.temper,null,item));if(item.type==='bow')model.rotation.set(0,.15,-.15);else model.rotation.z=-.18;this.root.add(model);model.updateMatrixWorld(true);const box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());const scale=1.9/Math.max(size.y,size.x);model.scale.multiplyScalar(scale);model.position.sub(center.multiplyScalar(scale));model.position.y+=1.05;this.root.userData.itemId=item.id;this.root.userData.pattern=model.userData.pattern;}
 update(){} attack(){}
 dispose(){this.root.traverse(o=>{if(o.isMesh){if(!o.geometry.userData.shared)o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});this.root.removeFromParent();}
}
