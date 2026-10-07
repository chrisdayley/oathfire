import test from 'node:test';
import assert from 'node:assert/strict';
import {Group} from 'three';
import {View} from '../src/render.js';

test('Replacing first-person sculpted weapons disposes each shared material once across mission refreshes',()=>{
 const view={fp:new Group(),firstPerson:false};
 const equip=type=>View.prototype.firstPersonWeapon.call(view,type,1,0x62988f,{type,rarity:0,level:1,plus:0});
 equip('sword');
 for(const type of ['hammer','bow','sword']){
  const resources=new Set();let hasMultiMaterial=false;
  view.fp.traverse(o=>{if(o.geometry&&!o.geometry.userData.shared)resources.add(o.geometry);if(o.material){hasMultiMaterial||=Array.isArray(o.material);for(const m of Array.isArray(o.material)?o.material:[o.material])resources.add(m);}});
  if(type==='hammer')assert.ok(hasMultiMaterial,'Sculpted sword exercises material-array cleanup');
  // The bow and spear camera rigs clone arms; references may occur twice.
  // Disposal must deduplicate real resources rather than treating arrays as materials.
  const counts=new Map([...resources].map(r=>[r,0]));
  for(const r of resources)r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));
  assert.doesNotThrow(()=>equip(type));
  assert.ok([...counts.values()].every(n=>n===1),'Old resources disposed exactly once');
  assert.equal(view.fpWeapon.parent,view.fp);
 }
});
