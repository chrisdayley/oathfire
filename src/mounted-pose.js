import * as T from 'three';
const yAxis=new T.Vector3(0,1,0),v=new T.Vector3(),p=new T.Vector3(),q=new T.Quaternion(),parent=new T.Quaternion();
function aim(bone,target){bone.getWorldPosition(p);v.copy(target).sub(p).normalize();bone.parent.getWorldQuaternion(parent).invert();v.applyQuaternion(parent);const old=bone.quaternion.clone(),axis=yAxis.clone().applyQuaternion(old);q.setFromUnitVectors(axis,v);bone.quaternion.copy(q.multiply(old));bone.updateMatrixWorld(true);}
function target(c,x,y,z,horse=false){const p=new T.Vector3(x,y,z);if(horse)p.applyAxisAngle(new T.Vector3(0,1,0),(c.horseHeading??c.root.rotation.y)-c.root.rotation.y);return c.root.localToWorld(p);}
export function mountedPose(c,dt,{speed=0,grounded=true,guarding=false,charging=false,dead=false}){
 if(!c.mount||dead)return;const seat=c.mount.userData.seat||1.8,bob=c.mount.userData.bob||0;
 const saddleYaw=(c.horseHeading??c.root.rotation.y)-c.root.rotation.y;c.visual.rotation.y=saddleYaw;if(c.actionLock||charging||guarding||c.casting)c.sockets.chest.rotation.y+=T.MathUtils.clamp(-saddleYaw,-1.25,1.25);c.root.updateMatrixWorld(true);const hip=c.sockets.hips,worldHip=hip.getWorldPosition(new T.Vector3());c.visual.position.y+=seat+.06+bob-(worldHip.y-c.root.position.y);c.root.updateMatrixWorld(true);
 for(const [id,sign]of [['l',1],['r',-1]]){aim(c.sockets['upperleg'+id],target(c,sign*.43,seat-.31,.22,true));aim(c.sockets['lowerleg'+id],target(c,sign*.48,seat-.84,.03,true));c.sockets['foot'+id].rotation.x=-.04;}
 // The horse continues along its own heading during an aimed upper-body attack.
 if(c.horseHeading!==undefined)c.mount.rotation.y=c.horseHeading-c.root.rotation.y;
 const a=c.mountedAttack;if(a){a.t+=dt;if(a.t>=a.duration)c.mountedAttack=null;}
 const melee=a&&!['bow','crossbow','staff'].includes(a.type);
 if(melee||charging){const u=charging?0:Math.min(1,a.t/a.duration),cut=charging?0:Math.sin(Math.min(1,Math.max(0,(u-.13)/.30))*Math.PI*.5),recover=Math.max(0,(u-.55)/.45),height=(a?.heavy||charging?1.06:.75)*(1-cut)+.04*cut+recover*.27;const side=-.43-.23*Math.sin(cut*Math.PI);aim(c.sockets.upperarmr,target(c,-.58,seat+.58,.03));aim(c.sockets.lowerarmr,target(c,side,seat+height,.35+cut*.33));c.root.updateMatrixWorld(true);if(c.held){const direction=new T.Vector3(-.2,T.MathUtils.lerp(.96,-.78,cut)*(1-recover*.8),.43).normalize();const rootQ=c.root.getWorldQuaternion(new T.Quaternion()),hand=c.sockets.handslotr.getWorldQuaternion(new T.Quaternion());c.held.quaternion.copy(hand.invert().multiply(new T.Quaternion().setFromUnitVectors(yAxis,direction.applyQuaternion(rootQ))));}}
 else if(!c.actionLock&&!c.casting&&!guarding){for(const [id,sign]of [['l',1],['r',-1]]){aim(c.sockets['upperarm'+id],target(c,sign*.36,seat+.36,.12));aim(c.sockets['lowerarm'+id],target(c,sign*.26,seat+.28,.48));}}
 c.root.updateMatrixWorld(true);
}
