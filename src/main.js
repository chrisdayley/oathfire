import './style.css';
import './menu-theme.css';
import './battle-hud.css';
import {Game} from './game.js';
const game=new Game();
game.init().catch(error=>{console.error(error);document.getElementById('load-text').textContent='The beacon could not load. '+error.message;});

if(import.meta.env.PROD&&'serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js').catch(e=>console.warn('Offline cache unavailable',e.message)));
