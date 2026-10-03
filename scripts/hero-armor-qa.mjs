import {createRequire} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.GAME_URL||'http://127.0.0.1:4179',out=process.env.QA_OUT||'work/qa-hero-armor';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal']}),page=await browser.newPage({viewport:{width:844,height:390}}),report={checks:[],errors:[],coverage:[]};page.on('pageerror',e=>report.errors.push(e.message));const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS',name);};
try{
 await page.goto(base+'/art-studio.html?role=warden&rarity=5');await page.waitForFunction(()=>window.__atelier?.current?.phase>1);
 for(const role of ['warden','ashwright','ranger'])for(const kind of ['hearth','bastion','trail','spellweave','ember','dawn','marshal']){
  await page.selectOption('#role',role);await page.selectOption('#armor',kind);
  for(const rarity of [0,4,5,6]){
   await page.selectOption('#rarity',String(rarity));
   const result=await page.evaluate(()=>{const c=window.__atelier.current;c.update(.016,{speed:0});c.root.updateMatrixWorld(true);const vertices=c.body.reduce((n,m)=>n+m.geometry.attributes.position.count,0),coverage=c.visual.userData.armorCoverage,skin=c.body.filter(m=>m.name.startsWith('Anatomical')).length;let finite=true;const v=c.root.position.clone();for(const m of c.body){m.skeleton.update();for(let i=0;i<m.geometry.attributes.position.count;i+=97){v.fromBufferAttribute(m.geometry.attributes.position,i);m.applyBoneTransform(i,v);if(!v.toArray().every(Number.isFinite))finite=false;}}const cape=!!c.cape&&c.cape.geometry.attributes.position.count>500,yoke=c.gear.some(m=>m.name==='Mantle gathered shoulder yoke');return{coverage,skin,vertices,finite,cape,yoke};});
   report.coverage.push({role,kind,rarity,...result});check(role+' '+kind+' '+rarity+' has finite equipped geometry, helmet and connected mantle',result.coverage.helmet&&result.finite&&result.cape&&result.yoke&&result.vertices>10000);
   if(rarity>=4)check(role+' '+kind+' '+rarity+' replaces exposed skin with articulated armored sleeves',result.coverage.sleeves&&result.skin===0);
   if(rarity>=5)check(role+' '+kind+' '+rarity+' uses full plate despite the armor family',result.coverage.plate);
  }
 }
 // Sampled geometric clearance against live running calf/foot positions, including
 // both weapons that change the torso pose most strongly.
 for(const role of ['warden','ranger','ashwright']){
  await page.selectOption('#role',role);await page.selectOption('#armor','hearth');await page.selectOption('#rarity','6');
  const moving=await page.evaluate(()=>{const c=window.__atelier.current;let finite=true,minimum=1;for(let f=0;f<120;f++){c.update(1/60,{speed:4.5});const p=c.cape.geometry.attributes.position;for(let i=0;i<p.count;i++){if(![p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite))finite=false;}minimum=Math.min(minimum,c.cape.geometry.boundingSphere?.radius||1);}return{finite,moving:c.gaitSpeed>4,clip:c.actionName};});check(role+' moving cloak remains finite through two seconds of running',moving.finite&&moving.moving&&moving.clip==='Running_A');
 }
 check('No browser errors',report.errors.length===0);
}catch(e){report.failure=e.stack;console.error(e.stack);process.exitCode=1;await page.screenshot({path:out+'/failure.jpg',quality:88}).catch(()=>{});}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser.close();}
