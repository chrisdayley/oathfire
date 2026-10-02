import * as T from 'three';
import {loadArt,ART,worldMaterial} from './materials.js';
import {DEFAULT_PATTERNS} from './weapon-patterns.js';
import {Character,loadCharacters} from './characters.js';
await loadArt();await loadCharacters();
const renderer=new T.WebGLRenderer({canvas:document.getElementById('view'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color(0x252420);scene.fog=new T.Fog(0x252420,8,22);const env=new T.PMREMGenerator(renderer);scene.environment=env.fromEquirectangular(ART.sky).texture;scene.environmentIntensity=.7;
scene.add(new T.HemisphereLight(0xc6d4e5,0x393021,.9));const key=new T.DirectionalLight(0xffe0b2,3);key.position.set(-3,5,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-3,right:3,top:4,bottom:-1});key.shadow.normalBias=.015;scene.add(key);
const rim=new T.DirectionalLight(0x89bada,2);rim.position.set(3,4,-3);scene.add(rim);
const floor=new T.Mesh(new T.PlaneGeometry(50,50),worldMaterial('cobble',0x62605a,2));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);const camera=new T.PerspectiveCamera(34,1,.05,60);
const roles={warden:['The Warden','sword'],ashwright:['The Ashwright','hammer'],ranger:['The Veilranger','bow'],bow:['Longbowman','bow']};let current,angle=.35,spin=false,speed=0;
const rank=document.getElementById('rank');for(let n=1;n<=10;n++)rank.add(new Option('Rank '+n,n));
function select(){current?.dispose();const role=document.getElementById('role').value;current=new Character('Knight',{design:role,weapon:roles[role][1],weaponItem:role==='bow'?null:{id:'studio',type:roles[role][1],weaponPattern:DEFAULT_PATTERNS[roles[role][1]],plus:0,level:1,rarity:0},rank:Number(rank.value)});scene.add(current.root);document.getElementById('name').textContent=roles[role][0];}
document.getElementById('role').onchange=select;rank.onchange=select;document.getElementById('idle').onclick=()=>speed=0;document.getElementById('walk').onclick=()=>speed=2;document.getElementById('run').onclick=()=>speed=4.5;document.getElementById('attack').onclick=()=>current.attack(current.weaponType,false,0,.8);document.getElementById('spin').onclick=()=>spin=!spin;
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();select();let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(spin)angle+=dt*.35;current.update(dt,{speed});const dist=innerWidth/innerHeight<.8?4.6:4.3;camera.position.set(Math.sin(angle)*dist,1.35,Math.cos(angle)*dist);camera.lookAt(0,1.07,0);renderer.render(scene,camera);document.getElementById('status').textContent=Math.round(renderer.info.render.triangles/1000)+'k triangles';requestAnimationFrame(frame);}requestAnimationFrame(frame);
window.__atelier={get current(){return current},scene,camera,renderer,select,setAngle:n=>angle=n,setSpeed:n=>speed=n};
