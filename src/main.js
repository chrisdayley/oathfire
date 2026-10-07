import './castle-customization.css';
import {registerGameUpdates} from './game-updates.js';
import './mission-preparation.css';
import './hero-selection.css';
import './unlock-sequence.css';
import './style.css';
import './menu-theme.css';
import './battle-hud.css';
import './field-menu.css';
import './battle-results.css';
import './regiment-menu.css';
import {Game} from './game.js';
const game=new Game();
game.init().catch(error=>{console.error(error);document.getElementById('load-text').textContent='The beacon could not load. '+error.message;});

if(import.meta.env.PROD)registerGameUpdates(game);

import './ability-ui.css';

import './safe-area.css';
import './town-guide.css';

import "./war-map.css";

import './frontline.css';

import './stable.css';

import './save-recovery.css';

import './game-interface.css';
