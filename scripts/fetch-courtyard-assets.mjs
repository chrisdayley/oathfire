// Download only the CC0 model files and their declared dependencies from Poly Haven.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const ids=['large_castle_door','wooden_barrels_01','wooden_lantern_01','round_wooden_table_01'];
const provenance=[];
for(const id of ids){
 const info=await (await fetch('https://api.polyhaven.com/info/'+id)).json();
 const files=await (await fetch('https://api.polyhaven.com/files/'+id)).json();
 const entry=files.gltf?.['1k']?.gltf;if(!entry)throw Error('No 1K glTF '+id);
 const root='work/art-production/'+id;await fs.mkdir(root,{recursive:true});
 for(const [name,data]of Object.entries({[id+'.gltf']:entry,...entry.include})){
  const file=path.join(root,name);await fs.mkdir(path.dirname(file),{recursive:true});
  const response=await fetch(data.url);if(!response.ok)throw Error(data.url+' '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());const hash=crypto.createHash('md5').update(bytes).digest('hex');
  if(hash!==data.md5)throw Error('Hash mismatch '+name);await fs.writeFile(file,bytes);
 }
 provenance.push({id,name:info.name,authors:info.authors,license:'CC0-1.0',source:'https://polyhaven.com/a/'+id,sourceFileMd5:entry.md5});console.log('Verified',id);
}
await fs.writeFile('work/art-production/prop-provenance.json',JSON.stringify(provenance,null,2));
