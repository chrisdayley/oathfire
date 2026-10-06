import * as T from 'three';
import {ART} from './materials.js';
import {armorStyle} from './equipment-style.js';
import {heroArmorProfile} from './hero-armor-profile.js';
const textures=new Map();
function embroidery(color,trim,tier,emission=false){
 const key=[color,trim,tier,emission].join(':');if(textures.has(key))return textures.get(key);
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1024;
 const x=canvas.getContext('2d'),hex=n=>'#'+new T.Color(n).getHexString();
 x.fillStyle=emission?'#000':hex(color);x.fillRect(0,0,768,1024);
 let seed=731;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 if(!emission){
  for(let i=0;i<30000;i++){x.fillStyle=rand()>.45?'rgba(255,242,215,.035)':'rgba(0,0,0,.10)';x.fillRect(rand()*768,rand()*1024,1,1+rand()*3);}
  // Broad, irregular dye variation. The mesh and light supply the folds;
  // painted vertical stripes made the cloth look like a pleated curtain.
  for(let i=0;i<12;i++){const cx=rand()*768,cy=rand()*1024,r=70+rand()*160,patch=x.createRadialGradient(cx,cy,0,cx,cy,r);patch.addColorStop(0,i%2?'rgba(18,27,31,.065)':'rgba(223,205,171,.035)');patch.addColorStop(1,'transparent');x.fillStyle=patch;x.fillRect(cx-r,cy-r,r*2,r*2);}
  const grime=x.createLinearGradient(0,600,0,1024);grime.addColorStop(0,'transparent');grime.addColorStop(1,'rgba(32,24,17,.38)');x.fillStyle=grime;x.fillRect(0,600,768,424);
 }
 x.strokeStyle=x.fillStyle=emission?'#ddd':hex(tier===0?0xab9876:trim);x.globalAlpha=tier===0?.44:.72;
 // Narrow sewn hems and restrained embroidery; cloth remains the main surface.
 if(!emission){x.lineWidth=2;x.strokeRect(24,16,720,982);x.setLineDash([2,5]);x.lineWidth=1;x.strokeRect(31,22,706,970);x.setLineDash([]);}
 if(tier>=2){
  x.lineWidth=2;for(const side of [48,720])for(let y=55;y<978;y+=36){x.beginPath();x.moveTo(side,y-13);x.quadraticCurveTo(side+10,y,side,y+13);x.quadraticCurveTo(side-10,y,side,y-13);x.stroke();}
 }
 const cx=384,cy=288,r=tier>=2?48:35;x.lineWidth=3;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.stroke();
 for(let i=0;i<16;i++){const a=i*Math.PI/8,outer=r*(i%2?1.55:1.9);x.beginPath();x.moveTo(cx+Math.sin(a-.07)*(r+7),cy+Math.cos(a-.07)*(r+7));x.lineTo(cx+Math.sin(a)*outer,cy+Math.cos(a)*outer);x.lineTo(cx+Math.sin(a+.07)*(r+7),cy+Math.cos(a+.07)*(r+7));x.closePath();x.fill();}
 if(tier>=4){
  x.lineWidth=1.4;for(const sign of [-1,1])for(let i=0;i<9;i++){const xx=cx+sign*(72+i*9),yy=cy+25+i*9;x.beginPath();x.ellipse(xx,yy,4,12,-sign*.6,0,Math.PI*2);x.stroke();}
  // A repeating interlace stays at the hem, not across the whole garment.
  for(let xx=60;xx<710;xx+=28){x.beginPath();x.moveTo(xx,949);x.quadraticCurveTo(xx+14,917,xx+28,949);x.quadraticCurveTo(xx+14,976,xx,949);x.stroke();}
 }
 if(!emission){x.globalCompositeOperation='source-atop';for(let i=0;i<300;i++){x.fillStyle=hex(color);x.globalAlpha=.35;const yy=rand()*1024;x.fillRect(rand()*768,yy,1+rand()*3,rand()*7);}}
 const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;t.userData.shared=true;textures.set(key,t);return t;
}
export function attachHeroCape(c){
 const profile=heroArmorProfile(c);if(!profile)return false;
 const height=profile.capeLength,columns=26,rows=34,p=[],uv=[],colors=[],idx=[],style=armorStyle(c.armor),width=c.design==='ashwright'?.82:.79;
 for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
  const t=j/rows,u=i/columns,across=u*2-1;
  // Gathered at the shoulders, expanding over the back and hips, with soft
  // diagonal folds that continue into an uneven weighted hem.
  const spread=.61+.31*Math.sin(t*Math.PI*.53),x=across*width*.5*spread+.055*Math.sin(t*3.6)*t+.012*Math.sin(u*9+t*4)*t;
  const y=.085-height*t-.024*across*across*Math.exp(-t*7)+Math.pow(t,6)*(.10*(across+1)*.5)+Math.pow(t,9)*(.047*Math.sin(u*7+.3)+.035*across+.015*Math.cos(u*21));
  const foldPhase=u*Math.PI*8+Math.sin(t*3.1+u*4)*1.7;
  const folds=Math.cos(foldPhase)*(.008+.024*t)+Math.sin(u*Math.PI*3-t*4)*.024*t+.018*Math.sin(t*14+Math.abs(across)*9)*Math.exp(-t*4);
  const z=-.205+.035*Math.sin(t*Math.PI*1.65)-.030*t+folds+.045*across*across*Math.exp(-t*5);
  p.push(x,y,z);uv.push(u,1-t);const shade=.92+.07*Math.sin(u*23+t*5);colors.push(shade,shade,shade);
  if(j<rows&&i<columns){const k=j*(columns+1)+i;idx.push(k,k+1,k+columns+1,k+1,k+columns+2,k+columns+1);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(idx);geo.computeVertexNormals();
 const m=new T.MeshStandardMaterial({name:'Woven heraldic mantle',map:embroidery(c.atelier.clothHex,c.atelier.trimHex,profile.rarity),color:0xffffff,vertexColors:true,side:T.DoubleSide,roughness:.94,metalness:0,normalMap:ART.textures['cloth-normal'],normalScale:new T.Vector2(.24,.24),envMapIntensity:.32});
 if(profile.rarity>=5){m.emissive.setHex(style.glow);m.emissiveMap=embroidery(0,0,profile.rarity,true);m.emissiveIntensity=.24;m.userData.equipmentPulse=.24;}
 const cape=new T.Mesh(geo,m);cape.name='Gathered ankle-length mantle';cape.castShadow=cape.receiveShadow=true;c.sockets.chest.add(cape);c.cape=cape;c.capeHeight=height;c.capeBase=new Float32Array(p);c.capeProfile=profile;c.materials.push(m);c.gear.push(cape);
 // A gathered, continuous shoulder yoke physically joins the neck fastening
 // to the mantle. It follows the same chest bone, not a floating back panel.
 const yp=[],yu=[],yi=[],yrows=9;
 for(let j=0;j<=yrows;j++)for(let i=0;i<=columns;i++){
  const t=j/yrows,u=i/columns,a=u*2-1,k=i*3,neckX=a*.09,neckY=.207-.025*Math.abs(a),neckZ=-.077*Math.sqrt(1-a*a)-.018;
  const fold=Math.sin(u*26-t*2)*.009*Math.sin(t*Math.PI);
  yp.push(neckX+(p[k]-neckX)*t,neckY+(p[k+1]-neckY)*(1-Math.pow(1-t,1.6))+fold,neckZ+(p[k+2]-neckZ)*t-.006*Math.sin(t*Math.PI));yu.push(u,t);
  if(j<yrows&&i<columns){const q=j*(columns+1)+i;yi.push(q,q+1,q+columns+1,q+1,q+columns+2,q+columns+1);}
 }
 const yg=new T.BufferGeometry();yg.setAttribute('position',new T.Float32BufferAttribute(yp,3));yg.setAttribute('uv',new T.Float32BufferAttribute(yu,2));yg.setIndex(yi);yg.computeVertexNormals();
 const ym=new T.MeshStandardMaterial({name:'Gathered wool shoulder yoke',color:c.atelier.clothHex,roughness:.96,side:T.DoubleSide,normalMap:ART.textures['cloth-normal'],normalScale:new T.Vector2(.23,.23)}),yoke=new T.Mesh(yg,ym);yoke.name='Mantle gathered shoulder yoke';yoke.castShadow=yoke.receiveShadow=true;c.sockets.chest.add(yoke);c.gear.push(yoke);c.materials.push(ym);
 return true;
}
export function animateHeroCape(c,speed){
 if(!c.capeProfile)return false;
 const p=c.cape.geometry.attributes.position,base=c.capeBase,height=c.capeHeight;
 c.root.updateMatrixWorld(true);const matrix=c.sockets.chest.matrixWorld.elements,ground=c.root.getWorldPosition(new T.Vector3()).y+.085;
 const horseSpace=c.mountDefinition&&c.mount?c.mount.matrixWorld.clone().invert().multiply(c.sockets.chest.matrixWorld):null,clothSpace=horseSpace?.clone().invert(),contact=new T.Vector3();
 const local=id=>c.sockets.chest.worldToLocal(c.sockets[id].getWorldPosition(new T.Vector3())),legs=[];
 for(const side of ['l','r']){
  const knee=local('lowerleg'+side),foot=local('foot'+side),toe=local('toes'+side);
  legs.push([knee,foot,.165],[foot,toe,.17]);
 }
 for(let i=0;i<p.count;i++){
  const x=base[i*3],y=base[i*3+1],t=Math.max(0,Math.min(1,(.085-y)/height)),weight=t*t;
  let xx=x+Math.sin(c.phase*2.3-t*4+x*4)*(.024+Math.min(speed,5)*.007)*weight,yy=y+Math.sin(c.phase*3.2-t*4)*.013*weight;
  let z=base[i*3+2]-Math.min(speed,6)*.055*weight+Math.sin(c.phase*3.6-t*5+x*6)*(.012+Math.min(speed,5)*.005)*weight;
  // The mantle clears actual animated calves and sabatons in chest space.
  // This affects cloth only; world/actor collisions remain the Rapier capsule.
  for(const [a,b,r]of legs){
   const dx=b.x-a.x,dy=b.y-a.y,k=Math.max(0,Math.min(1,((xx-a.x)*dx+(yy-a.y)*dy)/(dx*dx+dy*dy||1))),cx=a.x+dx*k,cy=a.y+dy*k,d2=(xx-cx)**2+(yy-cy)**2;
   if(d2<r*r)z=Math.min(z,a.z+(b.z-a.z)*k-Math.sqrt(r*r-d2)-.035);
  }
  if(horseSpace){
   // A riding mantle trails over the croup. Resolve in the horse's own space
   // so clearance follows every breed's scale and independent riding heading.
   contact.set(xx,yy,z).applyMatrix4(horseSpace);contact.z-=.55*weight;
   const ring=(contact.x/.55)**2+((contact.z+.25)/1.03)**2;
   if(ring<1)contact.y=Math.max(contact.y,1.43+.64*Math.sqrt(1-ring)+.045+(c.mount.userData.bob||0));
   contact.applyMatrix4(clothSpace);xx=contact.x;yy=contact.y;z=contact.z;
  }
  const worldY=matrix[1]*xx+matrix[5]*yy+matrix[9]*z+matrix[13];if(worldY<ground&&matrix[5]>.2)yy+=(ground-worldY)/matrix[5];
  p.setXYZ(i,xx,yy,z);
 }
 p.needsUpdate=true;c.cape.geometry.computeVertexNormals();return true;
}
