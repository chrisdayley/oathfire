import RAPIER from '@dimforge/rapier3d-compat';
import * as T from 'three';
export async function initPhysics(){await RAPIER.init();}
export class Physics{
 constructor(){this.world=new RAPIER.World({x:0,y:-22,z:0});this.world.timestep=1/60;this.meta=new Map();this.fixed=[];this.actors=new Set();this.controller=this.world.createCharacterController(.035);this.controller.enableAutostep(.34,.22,false);this.controller.enableSnapToGround(.22);this.controller.setMaxSlopeClimbAngle(Math.PI*.26);this.controller.setMinSlopeSlideAngle(Math.PI*.29);this.controller.setSlideEnabled(true);}
 addBox(x,y,z,sx,sy,sz,kind='wall',angle=0){const d=RAPIER.ColliderDesc.cuboid(sx/2,sy/2,sz/2).setTranslation(x,y,z);d.setRotation({x:0,y:Math.sin(angle/2),z:0,w:Math.cos(angle/2)});const c=this.world.createCollider(d);this.fixed.push(c);this.meta.set(c.handle,{kind});return c;}
 addHull(points,pos,kind='rock'){const d=RAPIER.ColliderDesc.convexHull(points);if(!d)return null;d.setTranslation(...pos);const c=this.world.createCollider(d);this.fixed.push(c);this.meta.set(c.handle,{kind});return c;}
 terrain(vertices,indices){const d=RAPIER.ColliderDesc.trimesh(vertices,indices);const c=this.world.createCollider(d);this.fixed.push(c);this.meta.set(c.handle,{kind:'ground'});return c;}
 actor(entity,pos,height=1.95,radius=.36){const half=Math.max(.25,height*.5-radius),offset=half+radius;const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x,pos.y+offset+.04,pos.z));const c=this.world.createCollider(RAPIER.ColliderDesc.capsule(half,radius).setSensor(true),body);this.meta.set(c.handle,{kind:'actor',entity});const a={body,collider:c,offset,radius,grounded:false,vy:0};this.actors.add(a);return a;}
 move(actor,velocity,dt,jump=false){if(jump&&actor.grounded){actor.vy=8.6;actor.grounded=false;}actor.vy=Math.max(-24,actor.vy-22*dt);const want={x:velocity.x*dt,y:actor.vy*dt,z:velocity.z*dt};this.controller.computeColliderMovement(actor.collider,want,RAPIER.QueryFilterFlags.EXCLUDE_SENSORS);const m=this.controller.computedMovement(),p=actor.body.translation();actor.body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});actor.grounded=this.controller.computedGrounded();if(actor.grounded&&actor.vy<0)actor.vy=0;return m;}
 position(actor,target=new T.Vector3()){const p=actor.body.translation();return target.set(p.x,p.y-actor.offset,p.z);}
 teleport(actor,p){actor.body.setTranslation({x:p.x,y:p.y+actor.offset+.04,z:p.z},true);actor.body.setNextKinematicTranslation({x:p.x,y:p.y+actor.offset+.04,z:p.z});actor.vy=0;actor.grounded=false;}
 removeActor(a){this.meta.delete(a.collider.handle);this.actors.delete(a);this.world.removeRigidBody(a.body);}
 remove(c){if(!c)return;this.meta.delete(c.handle);this.fixed=this.fixed.filter(x=>x!==c);try{this.world.removeCollider(c,true);}catch{}}
 ray(origin,direction,max,exclude=null,environmentOnly=false){const ray=new RAPIER.Ray(origin,direction);const hit=this.world.castRay(ray,max,true,environmentOnly?RAPIER.QueryFilterFlags.EXCLUDE_SENSORS:undefined,undefined,exclude?.collider,exclude?.body);if(!hit)return null;return {distance:hit.timeOfImpact,collider:hit.collider,meta:this.meta.get(hit.collider.handle)};}
 lineClear(a,b){const d=new T.Vector3().subVectors(b,a),distance=d.length();if(distance<.01)return true;d.divideScalar(distance);return !this.ray(a,d,distance,null,true);}
 step(){this.world.step();}
 reset(){for(const a of [...this.actors])this.removeActor(a);for(const c of [...this.fixed])this.remove(c);this.meta.clear();}
}
