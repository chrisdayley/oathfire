// Install updates without interrupting a battle or clearing either save store.
export function registerGameUpdates(game){
 if(!('serviceWorker' in navigator))return;
 const start=async()=>{
  try{
   const registration=await navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js',{updateViaCache:'none'});
   let pending=false;
   navigator.serviceWorker.addEventListener('controllerchange',()=>{if(pending)location.reload();});
   const offer=()=>{
    if(!registration.waiting||document.getElementById('game-update'))return;
    const button=document.createElement('button');button.id='game-update';button.textContent='Update ready · Save & reload';document.body.append(button);
    const visibility=()=>{button.hidden=!game.ready||(game.mode==='play'&&!game.menu);};visibility();const timer=setInterval(visibility,1000);
    button.onclick=()=>{
     if(game.mode!=='title'){game.checkpoint();if(!game.store.persist()){game.toast(game.store.error);return;}}
     pending=true;button.disabled=true;button.textContent='Opening updated game…';clearInterval(timer);registration.waiting?.postMessage({type:'SKIP_WAITING'});
    };
   };
   offer();registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')offer();});});
   registration.update().catch(()=>{});
  }catch(e){console.warn('Offline cache unavailable',e.message);}
 };
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
}
