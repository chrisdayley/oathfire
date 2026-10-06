import test from 'node:test';import assert from 'node:assert/strict';
import {SERVICES} from '../src/data.js';
import {serviceFor,canUseService,actionService,guideToService} from '../src/town-services.js';
test('Town services require physical proximity and remain unavailable during battle',()=>{
 for(const service of SERVICES.filter(s=>s.tab!=='hero')){
  const g={hero:{pos:{x:service.x,z:service.z,y:0}},battle:null};
  assert.equal(serviceFor(service.tab),service);assert.equal(canUseService(g,service.tab),true);
  g.hero.pos.y=5;assert.equal(canUseService(g,service.tab),false);
  g.hero.pos.y=0;g.hero.pos.x+=5;assert.equal(canUseService(g,service.tab),false);
  g.hero.pos.x=service.x;g.battle={id:0};assert.equal(canUseService(g,service.tab),false);
 }
 assert.equal(canUseService({hero:{pos:{x:100,z:100}}},'hero'),true);
});
test('Permanent transactions are associated with the NPC who performs them',()=>{
 for(const a of ['equip','forge','rune','temper','salvage'])assert.equal(actionService(a),'equipment');
 for(const a of ['regiment-confirm','upgrade-unit'])assert.equal(actionService(a),'troops');
 for(const a of ['refit','upgrade-defense','upgrade-logistics'])assert.equal(actionService(a),'defenses');
 assert.equal(actionService('buy'),'shop');assert.equal(actionService('doctrine','shield'),'troops');assert.equal(actionService('doctrine','tower'),'defenses');
 assert.equal(actionService('skill'),undefined);assert.equal(actionService('research-start'),undefined);
});
test('A destination closes overlays and saves guidance without moving the hero or opening a service',()=>{
 const s={guide:{hidden:true},supplies:310},g={hero:{pos:{x:0,z:9}},store:{commit:fn=>fn(s)},journey:{lastCard:'old'},toast:t=>g.notice=t};let closed=false;
 assert.equal(guideToService({g,close:()=>closed=true},'equipment'),true);
 assert.equal(closed,true);assert.equal(s.guide.homeTask,'equipment');assert.equal(s.guide.hidden,false);assert.deepEqual(g.hero.pos,{x:0,z:9});assert.equal(s.supplies,310);assert.match(g.notice,/Torren/);
});
