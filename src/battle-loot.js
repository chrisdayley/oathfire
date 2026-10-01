import * as T from 'three';
import {warChest,disposeChest,CHEST_COLORS} from './chest-model.js';
export class BattleLoot{
 constructor(game){this.g=game;this.models=new Map();}
 clear(){for(const entry of this.models.values()){disposeChest(entry.root);}this.models.clear();}
 sync(){const g=this.g;for(const drop of g.battle?.ledger?.chests||[]){if(drop.secured||this.models.has(drop.id))continue;const root=warChest(drop.rarity);root.scale.setScalar(.46);root.position.set(drop.pos.x,g.world.height(drop.pos.x,drop.pos.z)+.05,drop.pos.z);root.rotation.y=.4;const beam=new T.Mesh(new T.CylinderGeometry(.035,.15,4,8,1,true),new T.MeshBasicMaterial({color:CHEST_COLORS[drop.rarity],transparent:true,opacity:.3,depthWrite:false,blending:T.AdditiveBlending}));beam.position.y=3;root.add(beam);g.view.scene.add(root);this.models.set(drop.id,{root,beam,drop,age:0});}}
 update(dt){this.sync();const g=this.g;if(!g.battle)return;for(const [id,e]of this.models){e.age+=dt;e.beam.material.opacity=.22+Math.sin(e.age*3)*.09;const d=Math.hypot(e.drop.pos.x-g.hero.pos.x,e.drop.pos.z-g.hero.pos.z);if(d<2.7&&Math.abs(g.hero.pos.y-e.root.position.y)<3&&!g.hero.dead){e.drop.secured=true;g.audio.play('chest-found');g.fx.emit('holy',e.root.position,24,{speed:2});g.toast('Chest secured · Open it after the battle.');disposeChest(e.root);this.models.delete(id);g.checkpoint();}}}
}
