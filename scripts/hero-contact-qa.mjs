import fs from 'node:fs';import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.QA_OUT||'work/qa-hero-contact';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({headless:true,args:['--use-angle=metal']}),p=await b.newPage({viewport:{width:1000,height:760}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
let result;
try{
 await p.goto((process.env.GAME_URL||'http://127.0.0.1:4184')+'/art-studio.html');await p.waitForFunction(()=>window.__atelier?.current,null,{timeout:90000});
 await p.evaluate(()=>window.requestAnimationFrame=()=>0);await p.waitForTimeout(100);
 result=await p.evaluate(async()=>{
  const T=await import('/node_modules/.vite/deps/three.js'),a=__atelier,records=[];
  const change=(id,value)=>{document.getElementById(id).value=value;a.select();};
  for(const role of ['warden','ashwright','ranger'])for(const rarity of [0,3,6]){
   document.querySelector('#role').value=role;document.querySelector('#role').onchange();change('rarity',String(rarity));const c=a.current;
   for(let i=0;i<60;i++)c.update(1/60,{});
   for(const pose of ['idle','run','guard','charge','quick','heavy']){
    if(pose==='quick'||pose==='heavy')c.attack(c.weaponType,pose==='heavy',0,.8);
    let maxGrip=0,bad=0,nocked=0,drawn=0;
    for(let i=0;i<45;i++){
     c.update(1/60,{speed:pose==='run'?4.5:0,guarding:pose==='guard',charging:pose==='charge'});c.root.updateMatrixWorld(true);
     const hand=new T.Vector3(),target=new T.Vector3();
     if(role==='ashwright') {c.sockets.handslotl.getWorldPosition(hand);c.held.localToWorld(target.set(0,.33,0));maxGrip=Math.max(maxGrip,hand.distanceTo(target));}
     if(role==='warden'){c.sockets.handslotl.getWorldPosition(hand);c.heldShield.localToWorld(target.set(0,.045,-.024));maxGrip=Math.max(maxGrip,hand.distanceTo(target));}
     const bow=c.held.userData.bowString;if(bow){if(bow.nocked.visible)nocked++;if(c.visual.userData.bowDrawContact>.5)drawn++;if(bow.nocked.visible){c.sockets.handslotl.getWorldPosition(hand);const segment=bow.segments[0],mid=new T.Vector3(0,-.5,0).applyMatrix4(segment.matrixWorld);maxGrip=Math.max(maxGrip,hand.distanceTo(mid));}}
     for(const mesh of c.body){const weights=mesh.geometry.attributes.skinWeight;for(let v=0;v<weights.count;v+=97){const sum=weights.getX(v)+weights.getY(v)+weights.getZ(v)+weights.getW(v);if(!Number.isFinite(sum)||Math.abs(sum-1)>.001)bad++;}}
    }
    records.push({role,rarity,pose,maxGrip,bad,nocked,drawn});
   }
  }
  return records;
 });
 fs.writeFileSync(out+'/report.json',JSON.stringify({records:result,errors},null,2));
 assert.equal(errors.length,0,'Browser/shader errors');assert.ok(result.every(r=>r.bad===0),'Normalized finite skinning weights');
 assert.ok(result.filter(r=>r.role==='warden').every(r=>r.maxGrip<.003),'Shield grip remains attached');
 assert.ok(result.filter(r=>r.role==='ashwright').every(r=>r.maxGrip<.06),'Hammer support hand remains on haft');
 assert.ok(result.filter(r=>r.role==='ranger'&&['guard','charge','quick','heavy'].includes(r.pose)).every(r=>r.nocked>0&&r.drawn>0&&r.maxGrip<.01),'Bow draw contact and nocked arrow');
 console.log(JSON.stringify({pass:true,states:result.length,maxHammerError:Math.max(...result.filter(r=>r.role==='ashwright').map(r=>r.maxGrip)),errors}));
}finally{await b.close()}
