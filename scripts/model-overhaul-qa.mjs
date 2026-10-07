import {createRequire} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'/Users/christopherdayley/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.GAME_URL||'http://127.0.0.1:4184',out=process.env.QA_OUT||'work/qa-design-overhaul/regression';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({headless:true,args:['--use-angle=metal']}),p=await b.newPage({viewport:{width:844,height:390}}),report={models:[],horses:[],errors:[]};p.on('pageerror',e=>report.errors.push(e.message));p.on('console',e=>{if(e.type()==='error'&&/Shader Error|GL_INVALID|WebGLProgram/.test(e.text()))report.errors.push(e.text());});
try{
 await p.goto(base+'/art-studio.html');await p.waitForFunction(()=>window.__atelier?.current);await p.evaluate(async()=>{window.requestAnimationFrame=()=>0;window.mods={...(await import('/src/characters.js')),...(await import('/src/data.js')),...(await import('/src/materials.js')),...(await import('/src/horse-art.js')),...(await import('/src/mount-rules.js'))};await window.mods.loadCharacters();});await p.waitForTimeout(120);
 const ids=await p.evaluate(()=>Object.keys(mods.UNITS));
 for(const id of ids)for(let rank=1;rank<=10;rank++){
  const row=await p.evaluate(({id,rank})=>{
   const {Character,UNITS,ART}=mods,u=UNITS[id],a=window.__atelier,c=new Character(u.model,{weapon:u.weapon,rank,design:id,color:u.color,height:2*(u.scale||1),mounted:id==='rider'});a.scene.add(c.root);let skinVertices=0,finite=true,triangles=0;
   for(const m of c.body){const hi=m.skeleton.bones.indexOf(c.sockets.head),ix=m.geometry.attributes.skinIndex,skin=m.material.name==='Living skin'||m.material.map===ART.textures['human-skin'];if(skin)for(let i=0;i<ix.count;i++)if(ix.getX(i)===hi)skinVertices++;triangles+=m.geometry.attributes.position.count/3;}
   for(const speed of [0,2,5]){for(let f=0;f<24;f++)c.update(1/30,{speed,grounded:true});c.root.updateMatrixWorld(true);for(const m of c.body){const pos=m.geometry.attributes.position,v=c.root.position.clone();for(let i=0;i<pos.count;i+=101){v.fromBufferAttribute(pos,i);m.applyBoneTransform(i,v);finite&&=v.toArray().every(Number.isFinite);}}}
   c.attack(c.weaponType,true,0,.8);for(let f=0;f<25;f++)c.update(1/30,{speed:0,grounded:true});a.renderer.render(a.scene,a.camera);
   const result={id,rank,skinVertices,finite,triangles,identity:!!c.visual.userData.troopIdentity,mount:c.mount?.userData.anatomyVersion};c.dispose();return result;
  },{id,rank});
  assert.ok(row.skinVertices>300,`${id} rank ${rank} retains its actual skull beneath headgear`);assert.ok(row.finite&&row.identity);if(id==='rider')assert.equal(row.mount,223);report.models.push(row);
 }
 console.log('PASS 150 troop/rank skulls, role identities, idle/walk/run/charged attacks; cavalry uses the same new horse rig');
 for(let tier=0;tier<7;tier++){
  const row=await p.evaluate(tier=>{const a=window.__atelier,h=mods.makeHorse(mods.MOUNTS[tier]);a.scene.add(h);let finite=true,contacts=0;for(let f=0;f<120;f++){h.userData.animate(f/60,7,1/60,true);contacts+=h.userData.contacts.length;h.updateMatrixWorld(true);}h.traverse(o=>{if(o.isMesh)finite&&=o.geometry.attributes.position.array.every(Number.isFinite)&&o.matrixWorld.elements.every(Number.isFinite);});a.renderer.render(a.scene,a.camera);const result={tier,finite,contacts,headLength:h.userData.headLength,supported:h.userData.saddleSupport};h.removeFromParent();h.userData.dispose();return result;},tier);assert.ok(row.finite&&row.contacts>4&&row.headLength<.8&&row.supported);report.horses.push(row);
 }
 assert.equal(report.errors.length,0);console.log('PASS all seven horses animate, produce hoof contacts and render without shader errors');
}catch(e){report.failure=e.stack;console.error(e);process.exitCode=1;}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await b.close();}
