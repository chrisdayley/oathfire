// Asset-only extraction. Inputs are the CC0 MakeHuman base mesh and adult morph.
import fs from 'node:fs';import crypto from 'node:crypto';
// Download the first two source URLs in public/materials/atelier-provenance.json
// to their listed work/atelier paths, then run node scripts/build-head.mjs.
const provenance=JSON.parse(fs.readFileSync('public/materials/atelier-provenance.json','utf8'));
for(const a of provenance.assets.slice(0,2)){const sha=crypto.createHash('sha256').update(fs.readFileSync(a.path)).digest('hex');if(sha!==a.sha256)throw Error('Source hash mismatch: '+a.path);}
import * as T from 'three';import {SimplifyModifier} from 'three/addons/modifiers/SimplifyModifier.js';
const root='work/atelier/', lines=fs.readFileSync(root+'base.obj','utf8').split('\n'),v=[],vt=[],faces=[],uvById=new Map();let group='';
for(const l of lines){if(l.startsWith('v '))v.push(l.split(/\s+/).slice(1,4).map(Number));else if(l.startsWith('vt '))vt.push(l.split(/\s+/).slice(1,3).map(Number));else if(l.startsWith('g '))group=l.slice(2);else if(l.startsWith('f ')&&group==='body'){const entries=l.split(/\s+/).slice(1).map(x=>x.split('/').map(Number));faces.push(entries.map(x=>x[0]-1));for(const x of entries)if(!uvById.has(x[0]-1))uvById.set(x[0]-1,vt[x[1]-1]);}}
for(const l of fs.readFileSync(root+'male.target','utf8').split('\n')){if(!/^\d/.test(l))continue;const [i,x,y,z]=l.split(/\s+/).map(Number);v[i][0]+=x*.85;v[i][1]+=y*.85;v[i][2]+=z*.85;}
const chosen=faces.filter(f=>f.every(i=>v[i][1]>6.95&&Math.abs(v[i][0])<1.3)),ids=[...new Set(chosen.flat())],map=new Map(ids.map((id,i)=>[id,i])),positions=ids.flatMap(i=>[v[i][0]*.12,(v[i][1]-6.95)*.12-.025,(v[i][2]-.42)*.12].map(n=>+n.toFixed(5))),indices=[],uvs=ids.flatMap(id=>uvById.get(id));
for(const f of chosen)for(let i=1;i<f.length-1;i++)indices.push(map.get(f[0]),map.get(f[i]),map.get(f[i+1]));
const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();const low=new SimplifyModifier().modify(geo,Math.max(0,ids.length-1500));const headData={positions:Array.from(low.attributes.position.array,n=>+n.toFixed(5)),indices:Array.from(low.index.array),uvs:Array.from(low.attributes.uv.array,n=>+n.toFixed(6))};
fs.writeFileSync('src/head-mesh.js','// Anatomical head derived from MakeHuman CC0 base mesh and adult male target. See public/licenses/makehuman-assets.txt.\nexport const HEAD='+JSON.stringify({positions,indices,uvs})+';\nexport const HEAD_LOD='+JSON.stringify(headData)+';\n');
console.log(ids.length,'head vertices',indices.length/3,'triangles');
