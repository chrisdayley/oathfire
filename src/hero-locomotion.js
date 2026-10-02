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
 if(hero&&c.weaponType==='hammer')return v.set(.82,.57,.045).normalize();
 if(c.weaponType==='bow')return v.set(-.90,.43,.07).normalize();
 if(['spear','staff'].includes(c.weaponType))return v.set(-.05,.999,.02).normalize();
 if(hero&&c.weaponType==='sword')return v.set(...(moving?[-.36,.84,.40]:[-.69,.64,.18])).normalize();
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
export function settleWeaponGrip(c){
 if(!c.motionSupport||c.weaponType!=='hammer'||!c.held||c.heldShield)return;
 c.root.updateMatrixWorld(true);
 const grip=c.supportGrip||(c.supportGrip=new T.Vector3()),target=c.supportTarget||(c.supportTarget=new T.Vector3()),offset=c.supportOffset||(c.supportOffset=new T.Vector3());
 c.held.localToWorld(grip.set(0,.33,0));
 const bendPoint=c.motionPole;bendPoint.set(.46,-.28,-.21).applyMatrix4(c.sockets.chest.matrixWorld);
 for(let i=0;i<4;i++){
  c.sockets.handslotl.getWorldPosition(offset);c.sockets.wristl.getWorldPosition(target);
  target.add(grip).sub(offset);placeArm(c,'l',target,bendPoint,c.poseWeight);
 }
}
