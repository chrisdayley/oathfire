import * as T from 'three';
import {heroPhysique} from './hero-physique.js';

const Y=new T.Vector3(0,1,0),Z=new T.Vector3(0,0,1),v=new T.Vector3(),dir=new T.Vector3(),bend=new T.Vector3(),start=new T.Vector3(),end=new T.Vector3(),elbow=new T.Vector3(),q=new T.Quaternion(),parentQ=new T.Quaternion(),baseQ=new T.Quaternion();
const smooth=(a,b,t)=>a+(b-a)*t;
export function movementState(c,speed,dt){
 if(!heroPhysique(c))return speed;
 c.gaitSpeed=smooth(c.gaitSpeed||0,speed,1-Math.exp(-dt*14));
 if(c.gaitSpeed>3.55)c.running=true;else if(c.gaitSpeed<2.9)c.running=false;
 return c.gaitSpeed;
}
export function carryDirection(c,speed){
 const hero=heroPhysique(c),moving=hero&&speed>.2;
 if(hero&&c.weaponType==='hammer')return v.set(...(c.mounted?[.97,.23,.08]:[.90,.43,.045])).normalize();
 if(c.weaponType==='bow')return v.set(-.90,.43,.07).normalize();
 if(['spear','staff'].includes(c.weaponType))return v.set(-.05,.999,.02).normalize();
 if(hero&&c.weaponType==='sword')return v.set(...(moving?[-.36,.84,.40]:[-.70,-.65,.17])).normalize();
 return v.set(...((c.weaponItem?.rarity||0)>=5?[-.84,-.10,.35]:[-.54,-.72,.35])).normalize();
}
function aimBone(bone,target,blend){
 bone.getWorldPosition(start);dir.copy(target).sub(start).normalize();bone.parent.getWorldQuaternion(parentQ).invert();dir.applyQuaternion(parentQ);
 baseQ.copy(bone.quaternion);v.copy(Y).applyQuaternion(baseQ);q.setFromUnitVectors(v,dir).multiply(baseQ);bone.quaternion.slerp(q,blend);bone.updateMatrixWorld(true);
}
function placeArm(c,side,target,bendTarget,weight){
 const upper=c.sockets['upperarm'+side],lower=c.sockets['lowerarm'+side];upper.getWorldPosition(start);
 end.copy(target);dir.copy(end).sub(start);const scale=c.factor,one=.305*scale,two=.255*scale,d=Math.min(one+two-.005,Math.max(.085,dir.length()));dir.normalize();end.copy(start).addScaledVector(dir,d);
 const along=(one*one-two*two+d*d)/(2*d),height=Math.sqrt(Math.max(.0001,one*one-along*along));
 bend.copy(bendTarget).sub(start);bend.addScaledVector(dir,-bend.dot(dir)).normalize();elbow.copy(start).addScaledVector(dir,along).addScaledVector(bend,height);
 // aimBone uses shared temporaries, so preserve the second target first.
 const wristTarget=c.motionWrist||(c.motionWrist=new T.Vector3());wristTarget.copy(end);
 aimBone(upper,elbow,weight);aimBone(lower,wristTarget,weight);
}

export function animateHeroLocomotion(c,dt,{speed,grounded,guarding,charging,dead}){
 if(!heroPhysique(c)||c.mounted)return;
 const free=!c.actionLock&&!guarding&&!charging&&!dead,walking=free&&grounded&&speed>.15;
 c.motionSupport=free&&grounded;
 c.motionWeight=smooth(c.motionWeight||0,walking?1:0,1-Math.exp(-dt*13));
 c.idleCarryWeight=smooth(c.idleCarryWeight||0,free&&grounded&&!walking?1:0,1-Math.exp(-dt*11));
 c.poseWeight=Math.max(c.motionWeight,c.idleCarryWeight);
 if(!free){c.motionWeight=c.idleCarryWeight=c.poseWeight=0;return;}
 if(c.poseWeight<.001)return;
 const run=c.running?1:0,phase=c.current?.time/(c.current?.getClip().duration||1)||0;
 // Right arm drives forward when the left foot plants; both use clip time.
 const swing=Math.cos((phase-(run?.15:.98))*Math.PI*2)*c.motionWeight,chest=c.sockets.chest;
 c.motionRun=smooth(c.motionRun||0,run,1-Math.exp(-dt*10));const r=c.motionRun*c.motionWeight,w=c.poseWeight;
 // Small shoulder counter-rotation and settled upper-body lean retain the
 // existing leg animation and its heel-contact timing.
 chest.quaternion.multiply(q.setFromAxisAngle(Y,.045*swing*w));
 c.sockets.spine.quaternion.multiply(q.setFromAxisAngle(Z,.017*Math.sin(phase*Math.PI*2)*w));
 c.root.updateMatrixWorld(true);
 const goal=c.motionGoal||(c.motionGoal=new T.Vector3()),bendPoint=c.motionPole||(c.motionPole=new T.Vector3());
 for(const [side,sign]of [['l',1],['r',-1]]){
  let x=sign*(.34+r*.01),y=smooth(-.28,-.20,r),z=.13+r*.075-sign*swing*(.105+r*.065);
  if(side==='l'&&c.heldShield){x=.36;y=smooth(-.28,-.16,r);z=.25-sign*swing*.045;}
  if(side==='r'&&['staff','spear'].includes(c.weaponType)){x=-.35;y=-.28+r*.06;z=.16+swing*.06;}
  if(side==='r'&&c.weaponType==='sword'){x=-.35;y=smooth(-.27,-.21,r);z=.18+swing*.11;}
  if(c.weaponType==='hammer'){
   // Two hands travel together along the diagonally carried haft.
   const bounce=.018*Math.sin(phase*Math.PI*4)*c.motionWeight;
   x=side==='r'?-.25:.09;y=(side==='r'?-.28:-.23)+bounce;z=.23+swing*.03;
  }
  goal.set(x,y,z).applyMatrix4(chest.matrixWorld);
  bendPoint.set(sign*.46,-.28,-.21).applyMatrix4(chest.matrixWorld);
  placeArm(c,side,goal,bendPoint,w);
 }
}

// Solve the support hand against the actual carried handle after its orientation
// has blended. A fixed wrist pose floats away as the chest and shoulders move.
function contactHand(c,side,grip,bendPoint,weight=1,orientation=null){
 const target=new T.Vector3(),offset=new T.Vector3();
 for(let i=0;i<8;i++){
  c.root.updateMatrixWorld(true);if(orientation){const wrist=c.sockets['wrist'+side],pq=new T.Quaternion();wrist.parent.getWorldQuaternion(pq);wrist.quaternion.copy(pq.invert().multiply(orientation));c.sockets['hand'+side].quaternion.identity();wrist.updateMatrixWorld(true);}
  c.sockets['handslot'+side].getWorldPosition(offset);c.sockets['wrist'+side].getWorldPosition(target);
  target.add(grip).sub(offset);placeArm(c,side,target,bendPoint,weight);
 }
}
export function settleWeaponGrip(c,{guarding=false,charging=false,dead=false}={}){
 if(!heroPhysique(c)||!c.held)return;
 const bow=c.held.userData.bowString;
 if(bow)bow.nocked.visible=false;
 if(dead||c.casting)return;
 c.root.updateMatrixWorld(true);
 if(c.weaponType==='hammer'&&!c.heldShield){
  const grip=c.supportGrip||(c.supportGrip=new T.Vector3());c.held.localToWorld(grip.set(0,.33,0));
  const shoulder=new T.Vector3();c.sockets.upperarml.getWorldPosition(shoulder);
  const delta=grip.clone().sub(shoulder),reach=.51*c.factor;
  if(delta.length()>reach){
   const correction=delta.clone().setLength(reach).sub(delta),right=new T.Vector3(),weaponQ=new T.Quaternion();c.sockets.handslotr.getWorldPosition(right);right.add(correction);c.held.getWorldQuaternion(weaponQ);
   contactHand(c,'r',right,new T.Vector3(-.46,-.12,-.12).applyMatrix4(c.sockets.chest.matrixWorld));
   c.root.updateMatrixWorld(true);const parent=new T.Quaternion();c.sockets.handslotr.getWorldQuaternion(parent);c.held.quaternion.copy(parent.invert().multiply(weaponQ));c.root.updateMatrixWorld(true);c.held.localToWorld(grip.set(0,.33,0));
  }
  const bendPoint=new T.Vector3(.46,-.18,-.21).applyMatrix4(c.sockets.chest.matrixWorld);
  contactHand(c,'l',grip,bendPoint);
 }
 if(c.weaponType==='bow'&&bow){
  const shooting=c.actionLock>0&&c.actionName==='2H_Ranged_Shoot',aiming=charging||guarding||shooting;
  let midpoint=new T.Vector3(bow.tipX,0,0);
  if(aiming){
   const phase=shooting?Math.min(1,c.current.time/c.current.getClip().duration):.3;
   const draw=shooting?(phase<.42?1:Math.max(0,1-(phase-.42)/.13)):1;
   const gripBasis=new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0)),gripQ=new T.Quaternion().setFromRotationMatrix(gripBasis),rq=new T.Quaternion();c.root.getWorldQuaternion(rq);gripQ.premultiply(rq);
   for(const side of ['l','r']){const wrist=c.sockets['wrist'+side],parent=new T.Quaternion();wrist.parent.getWorldQuaternion(parent);wrist.quaternion.copy(parent.invert().multiply(gripQ));c.sockets['hand'+side].quaternion.identity();wrist.updateMatrixWorld(true);}
   const chest=c.sockets.chest,origin=new T.Vector3();chest.getWorldPosition(origin);
   const rootPoint=(x,y,z)=>new T.Vector3(x,y,z).multiplyScalar(c.factor).applyQuaternion(rq).add(origin);
   const front=rootPoint(-.14,.22,.64),pole=rootPoint(-.48,-.04,.20);
   contactHand(c,'r',front,pole,1,gripQ);
   c.root.updateMatrixWorld(true);
   const rootQ=new T.Quaternion(),handQ=new T.Quaternion();c.root.getWorldQuaternion(rootQ);c.sockets.handslotr.getWorldQuaternion(handQ);
   c.held.quaternion.copy(handQ.invert().multiply(rootQ).multiply(new T.Quaternion().setFromAxisAngle(Y,-Math.PI/2)));
   c.root.updateMatrixWorld(true);
   const target=rootPoint(-.14,.22,.46-.22*draw),leftPole=rootPoint(.46,.25,-.12);
   contactHand(c,'l',target,leftPole,1,gripQ);c.root.updateMatrixWorld(true);
   c.sockets.handslotl.getWorldPosition(midpoint);c.held.worldToLocal(midpoint);
   if(shooting&&phase>.55)midpoint.lerp(new T.Vector3(bow.tipX,0,0),Math.min(1,(phase-.55)/.10));
   bow.nocked.visible=!shooting||phase<.46;
   const aim=new T.Vector3(0,0,0).sub(midpoint).normalize();
   const arrowScale=.65/c.held.scale.x;bow.nocked.scale.setScalar(arrowScale);bow.nocked.position.copy(midpoint).addScaledVector(aim,.40*arrowScale);bow.nocked.quaternion.setFromUnitVectors(Z,aim);
   c.visual.userData.bowDrawContact=draw;
  }
  for(let i=0;i<2;i++){
   const tip=new T.Vector3(bow.tipX,i===0?-.85:.85,0),segment=bow.segments[i],direction=tip.clone().sub(midpoint);
   segment.position.copy(midpoint).add(tip).multiplyScalar(.5);segment.quaternion.setFromUnitVectors(Y,direction.clone().normalize());segment.scale.y=direction.length();
  }
 }
}
