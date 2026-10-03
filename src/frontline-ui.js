import {TURNING_POINTS,turningPointFor,ROUTES,TOWN_PROJECTS,projectEarned,projectAcknowledged} from './frontline-rules.js';
import {MISSIONS} from './data.js';
const $=id=>document.getElementById(id);
const brief={ram:['Break the siege engine before it reaches your gate.','Charged hits: ×2 damage. Rear hits pierce armor.'],commander:['A four-second banner ritual calls up infantry.','Interrupt with a charged hit or perfect guard.'],bombers:['Three bomb carriers attack from the east.','Interrupt before release, or leave the orange circles.']};
export function showFrontlineTactics(ui,m,done=null){
 const siege=m.mode==='siege',types=[...new Set(Array.from({length:m.waves},(_,i)=>turningPointFor(m,i+1)).filter(Boolean))];
 const cards=siege?ROUTES.map(p=>'<article><small>'+Math.abs(p.x)+'m '+(p.x<0?'WEST':'EAST')+' OF ROAD</small><h3>'+p.name+'</h3><p>'+p.description+'</p><b>'+(ui.g.battle?.siege?.routes?.[p.id]?'✓ Secured':p.benefit)+'</b></article>'):types.map(id=>'<article><small>WAVE '+(Array.from({length:m.waves},(_,i)=>turningPointFor(m,i+1)).indexOf(id)+1)+'</small><h3>'+TURNING_POINTS[id].name+'</h3><p>'+brief[id][0]+'</p><b>'+brief[id][1]+'</b></article>');
 ui.dialog('<small>'+ (siege?'CHOOSE YOUR APPROACH':'READ THE BATTLE')+'</small><h2>'+(siege?'The road to the keep':'Make the opening count')+'</h2><div class="frontline-tactics">'+cards.join('')+'</div><p class="combat-tip">'+(siege?'The center road is the direct route. All three detours are optional.':'Perfect guard: +40% melee for 2 seconds. Rear strikes bypass 65% armor.')+'</p><div class="dialog-actions"><button id="frontline-close" class="primary">'+(done?'Back to preparation':'Return to battle')+'</button></div>');
 $('frontline-close').onclick=()=>{$('dialog').hidden=true;ui.g.input.clear();done?.();};
}
export function mountFrontlineHUD(ui){
 const button=document.createElement('button');button.id='frontline-objective';button.hidden=true;button.onclick=()=>{if(ui.g.battle)showFrontlineTactics(ui,MISSIONS[ui.g.battle.id]);};$('hud').append(button);
}
export function updateFrontlineHUD(ui){
 const g=ui.g,b=g.battle,el=$('frontline-objective');if(!el)return;el.hidden=!b||g.mode!=='play'||!!g.menu||ui.modal;if(el.hidden)return;
 let title='Battlefield tactics',detail='Perfect guard · Flank · Interrupt',target=null,warning=false;
 if(b.siege){const r=b.siege.routes,p=ROUTES.filter(p=>!r?.[p.id]).sort((a,c)=>Math.hypot(a.x-g.hero.pos.x,a.z-g.hero.pos.z)-Math.hypot(c.x-g.hero.pos.x,c.z-g.hero.pos.z))[0];
  title='Siege routes';detail='Tap to plan your approach';if(p&&Math.hypot(p.x-g.hero.pos.x,p.z-g.hero.pos.z)<120){title=p.name;target=p;detail=r?.capturing===p.id?(r.capture?'Securing '+Math.ceil(r.capture)+'/6s':'Clear the defenders'):p.kind==='destroy'?'Destroy the mortar':'Clear & occupy for 6s';}
 }else{const t=b.turningPoint;if(t&&['warning','active'].includes(t.phase)){title=TURNING_POINTS[t.kind].name;warning=true;detail=t.phase==='warning'?'Incoming in '+Math.ceil(t.remaining)+'s · tap for counter':t.kind==='ram'?'Flank & use charged strikes':t.kind==='commander'?'Interrupt its raised banner':'Interrupt throws · avoid circles';target=g.enemies.find(e=>t.ids.includes(e.id)&&!e.dead)?.pos;}}
 if(g.combatFeedback?.until>b.time&&!warning){title=g.combatFeedback.text;detail='';}
 const meters=target?Math.round(Math.hypot(target.x-g.hero.pos.x,target.z-g.hero.pos.z)):null,angle=target?Math.atan2(target.x-g.hero.pos.x,-(target.z-g.hero.pos.z))+g.view.yaw:0;
 el.classList.toggle('urgent',warning);el.innerHTML=(target?'<i style="transform:rotate('+angle+'rad)">↑</i>':'')+'<span><b>'+title+(meters!==null?' · '+meters+'m':'')+'</b><small>'+detail+'</small></span>';el.setAttribute('aria-label',title+'. '+detail+'. Open battlefield tactics.');
}
export function pendingHomeProject(s){return TOWN_PROJECTS.find(p=>projectEarned(s,p)&&!projectAcknowledged(s,p));}
