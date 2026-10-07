import test from 'node:test';
import assert from 'node:assert/strict';
import {townDestinations,renderTownGuide} from '../src/town-guide.js';
const game=(pos,battle=null)=>({hero:{pos},battle,store:{data:{guide:{homeTask:'equipment'}}}});
test('Town guide reflects actual proximity, including height and battle restrictions',()=>{
 const g=game({x:-19,z:8,y:0});let forge=townDestinations(g).find(s=>s.tab==='equipment');
 assert.equal(forge.nearby,true);assert.equal(forge.distance,0);assert.equal(forge.selected,true);
 g.hero.pos.y=5;assert.equal(townDestinations(g).find(s=>s.tab==='equipment').nearby,false);
 g.hero.pos.y=0;g.battle={};assert.equal(townDestinations(g).find(s=>s.tab==='equipment').nearby,false);
});
test('Town guide offers service access only in reach and preserves all six destinations',()=>{
 const g=game({x:-19,z:8,y:0}),before=JSON.stringify(g),html=renderTownGuide({g},()=>'<svg></svg>');
 assert.match(html,/data-action="navigate" data-id="equipment"/);
 assert.match(html,/data-action="find-service" data-id="campaign"/);
 assert.equal((html.match(/class="destination-tile/g)||[]).length,6);
 assert.equal((html.match(/class="town-pin /g)||[]).length,6);
 assert.equal(JSON.stringify(g),before);
});
