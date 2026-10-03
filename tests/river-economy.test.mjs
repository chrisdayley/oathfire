import test from 'node:test';import assert from 'node:assert/strict';
import {RIVER_LEVEL,riverCenter,riverWidth,riverTerrain} from '../src/river-profile.js';
import {blocksActorHeight} from '../src/navigation-height.js';
import {UNITS,unitStats} from '../src/data.js';
import {battleUnitStats} from '../src/research.js';
import {commandBreakdown,commandCap} from '../src/command-economy.js';
test('Underwater channel and dry banks meet for hills and valleys along the full river',()=>{
 for(let z=-225;z<=-32;z+=1.3)for(const base of [-4,-1,0,5]){
  const c=riverCenter(z),w=riverWidth(z);
  assert.ok(riverTerrain(c,z,base)<RIVER_LEVEL-.4);
  for(const side of [-1,1])assert.ok(riverTerrain(c+side*w,z,base)>RIVER_LEVEL+.2);
 }
 assert.ok(riverCenter(-25)>125,'The near end leaves the world, not an exposed rectangle');
});
test('Below-zero rocks block navigation, but overhead arches and small steps remain passable',()=>{
 assert.equal(blocksActorHeight({top:-1.49},-2.98),true);
 assert.equal(blocksActorHeight({top:-1.49,bottom:-3.7},-2.98),true);
 assert.equal(blocksActorHeight({top:7,bottom:3.4},0),false);
 assert.equal(blocksActorHeight({top:.25,bottom:0},0),false);
});
test('Recruiting tiers have distinct wait times and the most expensive trained elite fits the base cap',()=>{
 const income=commandBreakdown(null).total;
 assert.ok(unitStats('shield',1).cost/income<20);
 assert.ok(unitStats('bow',1).cost>=unitStats('shield',1).cost*2);
 assert.ok(unitStats('pike',1).cost>=unitStats('bow',1).cost*1.4);
 assert.ok(unitStats('rider',1).cost>=unitStats('bow',1).cost*4);
 assert.ok(unitStats('giant',1).cost>unitStats('rider',1).cost);
 for(const id of Object.keys(UNITS))for(let rank=1;rank<=10;rank++)assert.ok(battleUnitStats(id,rank,null).cost<=commandCap(null));
 assert.equal(battleUnitStats('bow',10,null).count,1);
 assert.equal(battleUnitStats('shield',10,null).count,3);
 const b={research:[{id:'longbow',complete:true},{id:'logistics',complete:true}]};
 assert.equal(battleUnitStats('bow',1,b).cost,32,'Research surcharge is applied before the discount');
});
