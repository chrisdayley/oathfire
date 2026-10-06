import {BUILD} from './data.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const RELEASE=BUILD.match(/\d+\.\d+\.\d+/)[0];
export function downloadRecovery(store){
 const blob=new Blob([store.exportRecovery()],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='oathfire-recovery-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function showSaveRecovery(ui){
 const store=ui.g.store,repair=store.recovery;
 ui.dialog('<small>SAVE RECOVERY · '+RELEASE+'</small><h2>'+(repair?'Your campaign is recoverable':'Your saved data is preserved')+'</h2><p>'+(repair?'Return to Hearthwatch with your equipment, hero levels, upgrades and completed missions. The interrupted battle will need to be started again.':'Export the recovery file to keep every available save copy. You can also import a backup without clearing browser data.')+'</p>'+(repair?'<p><b>'+repair.data.completed.length+' defenses completed · '+repair.data.inventory.length+' equipment items</b></p>':'')+'<div class="dialog-actions save-recovery-actions">'+(repair?'<button id="recover-campaign" class="primary">Recover campaign</button>':'')+'<button id="export-recovery">Export recovery file</button><button id="recovery-import">Import backup</button><button id="close-recovery">Back</button></div><details><summary>Technical details</summary><p>'+store.sources.filter(c=>c.reason).map(c=>esc(c.source+': '+c.reason)).join('<br>')+'</p></details>');
 document.getElementById('close-recovery').onclick=()=>{document.getElementById('dialog').hidden=true;};
 document.getElementById('export-recovery').onclick=()=>downloadRecovery(store);
 document.getElementById('recovery-import').onclick=()=>document.getElementById('import-save').click();
 if(repair)document.getElementById('recover-campaign').onclick=async()=>{try{store.recover();await ui.g.start(null,true);ui.toast('Campaign recovered. Your interrupted battle is available at the war table.');}catch(e){ui.toast(e.message);}};
}
export function bindSaveTitle(ui){
 const store=ui.g.store,actions=document.querySelector('.title-actions');
 document.querySelector('#title-screen .version').textContent='A 3D HERO & CASTLE ADVENTURE · '+RELEASE+' · SAVES ON THIS DEVICE';
 const button=document.createElement('button');button.id='title-recovery';button.textContent=store.recovery?'Recover latest campaign':store.hasStoredSave&&!store.data?'Save recovery':'Import backup';
 button.onclick=()=>store.hasStoredSave?showSaveRecovery(ui):document.getElementById('import-save').click();
 actions.append(button);
 if(store.recovery||store.hasStoredSave&&!store.data){button.className='primary';document.getElementById('new-game').classList.remove('primary');actions.prepend(button);const note=document.createElement('p');note.className='save-recovery-note';note.textContent=store.recovery?'An interrupted battle needs recovery. Your campaign progress can be kept.':'A saved campaign was found. Recover or export it before starting a new journey.';actions.before(note);}
 if(store.recovery&&store.data)document.getElementById('continue-game').textContent='Continue earlier checkpoint';
}
