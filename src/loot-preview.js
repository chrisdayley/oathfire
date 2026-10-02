import * as T from 'three';
import {ItemPreview} from './item-preview.js';
import {Character} from './characters.js';
import {shield,mesh,cyl,mat} from './art.js';
import {WEAPONS} from './data.js';

export class LootPreview{
 constructor(item){
  this.root=new T.Group();this.root.userData.itemId=item.id;this.itemId=item.id;this.inspection=true;
  if(WEAPONS[item.type]){this.delegate=new ItemPreview(item);this.root.add(this.delegate.root);return;}
  if(item.type==='armor')this.armor(item);
  else if(item.type==='shield')this.root.add(shield(Math.min(10,4+Math.floor(item.plus/2)),item.rarity>=3?0x843b52:0x31596d));
  else{const gold=mat(0xcbb079,.36,.8),stone=mat(0x84cfec,.22,.5,{emissive:0x307fa7,emissiveIntensity:.8});mesh(new T.TorusGeometry(.36,.033,8,48),gold,this.root,0,.3,0);mesh(new T.OctahedronGeometry(.25,1),stone,this.root,0,-.21,0);cyl(this.root,.10,.15,.1,[0,.01,0],gold,8);}
  this.root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(this.root),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),group=new T.Group();for(const child of [...this.root.children])group.add(child);this.root.add(group);const scale=1.8/Math.max(size.x,size.y,size.z);group.scale.setScalar(scale);group.position.copy(center).multiplyScalar(-scale);group.position.y+=1.03;
 }
 armor(item){
  // Bake the equipped game's own chest/shoulder geometry into an armor display.
  const c=new Character('Knight',{design:'warden',rank:Math.min(10,5+Math.floor(item.plus/2)),weapon:'sword',armor:item});c.update(0,{});c.root.updateMatrixWorld(true);
  const keep=name=>['chest','spine','hips','upperarml','upperarmr'].includes(name.replaceAll('.',''));
  c.root.traverse(o=>{
   if(!o.isMesh)return;
   if(o.isSkinnedMesh){
    o.skeleton.update();const geo=o.geometry,positions=[],uvs=[],uv=geo.attributes.uv,skin=geo.attributes.skinIndex,weights=geo.attributes.skinWeight,point=new T.Vector3();
    for(let k=0,n=geo.index?.count||geo.attributes.position.count;k<n;k+=3){const ids=[0,1,2].map(j=>geo.index?geo.index.getX(k+j):k+j);if(!ids.every(v=>{let total=0;for(let j=0;j<4;j++)if(keep(o.skeleton.bones[skin.getComponent(v,j)]?.name||''))total+=weights.getComponent(v,j);return total>.7;}))continue;
     for(const v of ids){point.fromBufferAttribute(geo.attributes.position,v);o.applyBoneTransform(v,point);point.applyMatrix4(o.matrixWorld);positions.push(...point.toArray());if(uv)uvs.push(uv.getX(v),uv.getY(v));}}
    if(positions.length){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));if(uvs.length)g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.computeVertexNormals();this.root.add(new T.Mesh(g,o.material.clone()));}
   }else{let b=o.parent;while(b&&!b.isBone)b=b.parent;if(b&&keep(b.name)){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);this.root.add(new T.Mesh(g,o.material.clone()));}}
  });c.dispose();
 }
 update(){} attack(){}
 dispose(){if(this.delegate){this.delegate.dispose();return;}this.root.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});this.root.removeFromParent();}
}
