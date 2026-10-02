import {createRequire} from 'node:module';import fs from 'node:fs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='output/royal-atelier';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=metal']}),page=await browser.newPage({viewport:{width:1100,height:850}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
await page.goto('http://127.0.0.1:4179/art-studio.html');await page.waitForFunction(()=>window.__atelier);
for(const role of ['warden','ashwright','ranger','bow'])for(const rank of [1,5,10]){
 await page.selectOption('#role',role);await page.selectOption('#rank',String(rank));await page.waitForTimeout(300);await page.screenshot({path:`${out}/${role}-${rank}.png`});console.log(role,rank,await page.evaluate(()=>({source:window.__atelier.current.atelier.source,triangles:window.__atelier.renderer.info.render.triangles,bodies:window.__atelier.current.body.length})));
}
for(const role of ['warden','ashwright','ranger']){await page.selectOption('#role',role);await page.selectOption('#rank','10');await page.evaluate(()=>{window.__atelier.setAngle(-.9);window.__atelier.setSpeed(3);});await page.waitForTimeout(530);await page.screenshot({path:`${out}/${role}-walk.png`});await page.evaluate(()=>{window.__atelier.setSpeed(0);window.__atelier.current.attack(window.__atelier.current.weaponType,true,0,1);});await page.waitForTimeout(380);await page.screenshot({path:`${out}/${role}-attack.png`});}
console.log('ERRORS',errors);await browser.close();
