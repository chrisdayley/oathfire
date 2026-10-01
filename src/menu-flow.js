import {centerMap} from './campaign-ui.js';
import {BATTLE_GLYPHS} from './battle-icons.js';
import {fieldRoster} from './battle-roster.js';
import {battleUnitStats,RESEARCH} from './research.js';
import {researchPage} from './research-ui.js';
import {UNITS,DEFENSES,HEROES,ROMAN,unitStats} from './data.js';
import {unitUnlocked,defenseUnlocked,heroData,skillPoints} from './state.js';
import {EMPLACEMENTS} from './roster.js';
import {nextMission} from './journey.js';
import {fieldDefenseCost} from './field-command.js';
const $=id=>document.getElementById(id);
const labels={home:'Hearthwatch',hero:'Character',equipment:'Armory',troops:'Regiments',defenses:'Castle defenses',campaign:'War table',shop:'Market',bestiary:'Hollow Host',journal:'Chronicle',settings:'Settings',more:'The keep',army:'Battle command'};
const glyphs={...BATTLE_GLYPHS,lock:'M7 14V9a9 9 0 0 1 18 0v5M5 14h22v16H5ZM16 19v6',hero:'M16 3 6 7v10c0 7 10 12 10 12s10-5 10-12V7Z M16 8v14m-5-8h10',equipment:'m8 4 8 5 8-5 4 8-6 3v13H10V15l-6-3Z',troops:'M6 28V8l10-5 10 5v20M10 12h12M16 4v24M4 22h24',defenses:'M4 28V10h5V4h5v6h4V4h5v6h5v18ZM13 28V18h6v10',campaign:'M5 6v23M6 6c8-8 12 8 21 0v13c-9 8-13-8-21 0',orders:'M4 8h24M4 16h24M4 24h24M10 4v8M22 12v8M14 20v8',more:'M16 3 29 16 16 29 3 16ZM10 16h12m-6-6v12',bow:'M9 3q25 13 0 26L20 16ZM3 16h25m-5-4 5 4-5 4',fire:'M17 2c5 9-3 9 5 15l3-7c10 20-25 24-20 5l6 6c-4-11 6-12 6-19Z',spear:'M5 29 24 7m-7-3 12-2-3 12ZM9 20l6 5'};
export function sigil(kind){return '<svg class="menu-sigil" viewBox="0 0 32 32" aria-hidden="true"><path d="'+(glyphs[kind]||glyphs.troops)+'"/></svg>';}
export const sectionTabs=(ui,items)=>'<div class="detail-tabs" role="group" aria-label="Details">'+Object.entries(items).map(([id,label])=>'<button data-action="detail-section" data-id="'+id+'" class="'+(ui.detailTab===id?'active':'')+'" aria-pressed="'+(ui.detailTab===id)+'">'+label+'</button>').join('')+'</div>';
const snapshot=ui=>Object.fromEntries(['screen','detailTab','unit','defense','item','inventoryFilter','battleCommand','detailKind','tree','selectedMission','enemy','researchFilter','researchId'].map(k=>[k,ui[k]]).concat([['tab',ui.g.menu],['scroll',$('menu-content').scrollTop]]));
function refresh(ui,scroll=0){const grids=[...document.querySelectorAll('.research-grid,.field-roster-grid')].map(e=>({className:e.className,scroll:e.scrollTop}));ui.draw();ui.previewForTab();$('menu-content').scrollTop=scroll;if(ui.g.menu==='campaign')centerMap(ui);for(const old of grids){const grid=document.getElementsByClassName(old.className)[0];if(grid)grid.scrollTop=old.scroll;}}
export function navigate(ui,tab,options={},push=true){if(push)ui.navStack.push(snapshot(ui));ui.g.menu=tab;ui.screen='list';ui.detailTab='overview';ui.previewRank=null;Object.assign(ui,options);refresh(ui);}
export function openMenu(ui,tab){const g=ui.g;if(!g.store.data)return;g.checkpoint();g.input.enabled=false;g.input.clear();ui.navStack=[];ui.battleCommand=!!g.battle;ui.detailKind=null;ui.screen='list';ui.detailTab='overview';ui.previewRank=null;
 if(g.battle){ui.screen=tab==='pause'?'pause':tab==='research'?'research':tab==='battle-defenses'?'defenses':'root';tab='army';}else if(tab==='pause'||tab==='army')tab='home';
 g.menu=tab;if(tab==='equipment')ui.item=null;if(tab==='campaign')ui.selectedMission=nextMission(g.store.data).id;$('menu').hidden=false;$('hud').hidden=true;refresh(ui);}
export function menuBack(ui){if(ui.navStack.length){const prior=ui.navStack.pop();ui.g.menu=prior.tab;Object.assign(ui,prior);ui.previewRank=null;refresh(ui,prior.scroll);}else if(ui.battleCommand&&ui.screen!=='root'){ui.screen='root';refresh(ui);}else if(ui.g.menu!=='home'&&!ui.battleCommand)navigate(ui,'home',{},false);else ui.close();}
export function previewTab(ui){return ui.battleCommand?(ui.screen==='detail'?(ui.detailKind==='defenses'?'defenses':'troops'):['troops','defenses'].includes(ui.screen)?ui.screen:'none'):ui.g.menu;}
export function drawMenu(ui){const g=ui.g,s=g.store.data,tab=g.menu,battle=ui.battleCommand;
 $('menu').className=(battle?'battle-menu ':'castle-menu ')+(battle&&['troops','defenses','research','research-detail'].includes(ui.screen)?'field-menu ':'')+(battle&&ui.screen==='detail'?'battle-detail ':'')+(tab==='home'?'castle-home ':'')+(tab==='campaign'?'atlas-menu ':'')+(tab==='equipment'?'equipment-menu ':'');
 $('menu-title').textContent=battle?({root:'Command the field',troops:'Deploy troops',defenses:'Castle defenses',orders:'Army orders',placements:'Choose emplacement',detail:ui.detailKind==='defenses'?DEFENSES[ui.defense].name:UNITS[ui.unit].name,pause:'Battle paused',research:'Combat research','research-detail':'Combat research'}[ui.screen]):labels[tab]||'Hearthwatch';
 $('menu').querySelector('header>div>small').textContent=battle?'OATHFIRE · BATTLE PAUSED':'OATHFIRE · THE LAST EMBER';ui.updateResources();
 $('menu-nav').innerHTML='<button data-action="menu-back" aria-label="Back">‹ <span>Back</span></button><span class="breadcrumb">'+(battle?'BATTLE COMMAND':tab==='home'?'YOUR KINGDOM':('HEARTHWATCH / '+labels[tab].toUpperCase()))+(ui.screen==='detail'?' / INSPECT':'')+'</span>'+(battle&&ui.screen!=='pause'?'<button data-action="battle-category" data-id="pause">Pause</button>':'');
 $('menu-note').textContent=battle?'Battle paused · Close to return to the fight.':g.store.error||'Saved on this device';
 $('menu-content').innerHTML=battle?battlePage(ui):tab==='home'?castleHome(ui):tab==='more'?keepPage(ui):ui[tab+'Page']?.()||ui.pausePage();
 $('model-stage').hidden=tab==='campaign'||battle&&ui.screen!=='detail';ui.previewCaption();
}
function tile(ui,id,name,subtitle,kind=id,action='navigate'){return '<button class="destination-tile" data-action="'+action+'" data-id="'+id+'">'+sigil(kind)+'<span><b>'+name+'</b><small>'+subtitle+'</small></span><em>›</em></button>';}
function castleHome(ui){const s=ui.g.store.data,m=nextMission(s);return '<div class="hub-heading"><small>THE FIRE STILL BURNS</small><h2>Prepare your next oath</h2></div><button class="campaign-banner" data-action="navigate" data-id="campaign">'+sigil('campaign')+'<span><small>YOUR NEXT MISSION</small><b>'+m.name+'</b><small>War table · Read the story & begin</small></span><em>›</em></button><div class="destination-grid">'+tile(ui,'hero','Character','Level '+heroData(s).level+' · '+skillPoints(s)+' skill points')+tile(ui,'equipment','Armory','Equip · Compare · Forge')+tile(ui,'troops','Regiments','15 troop types · Train your army')+tile(ui,'defenses','Castle','8 defense types · Fortify')+'</div><div class="hub-bottom">'+ui.button('navigate','more','Market, chronicle & settings')+ui.button('resume',null,'Return to the world',false,true)+'</div>';}
function keepPage(ui){return '<div class="destination-grid">'+tile(ui,'shop','Market','Supplies for the road','equipment')+tile(ui,'journal','Chronicle','Story, treasure & training','campaign')+tile(ui,'bestiary','Hollow Host','Study your enemies','troops')+tile(ui,'settings','Settings','Sound, controls & save backup','more')+'</div><div class="hub-bottom">'+ui.button('home',null,'Rest at the beacon')+ui.button('title',null,'Save & return to title')+'</div>';}
export function rosterList(ui,kind,battle=false){const s=ui.g.store.data,b=ui.g.battle,units=kind==='troops',list=units?UNITS:DEFENSES,available=units?unitUnlocked:defenseUnlocked;
 return (battle?'':'<p class="list-hint">'+(units?'Choose a regiment to inspect or train.':'Choose a defense to inspect or upgrade.')+'</p>')+'<div class="roster-list">'+Object.entries(list).map(([id,d])=>{const unlocked=available(s,id),rank=(units?s.units:s.defenses)[id],st=units?battleUnitStats(id,rank,battle?b:null):null,cost=units?st.cost:fieldDefenseCost(id),count=ui.g.allies.filter(a=>!a.dead).length;
 const icon=units?(d.weapon==='bow'?'bow':d.weapon==='staff'?'fire':d.weapon==='spear'?'spear':'troops'):'defenses';
 return '<article class="roster-row '+(!unlocked?'locked':'')+'"><button class="roster-select" data-action="inspect-object" data-id="'+id+'" data-value="'+kind+'">'+sigil(icon)+'<span><b>'+d.name+'</b><small>'+(unlocked?('Rank '+ROMAN[rank-1]+' · '+(units?d.count+' soldier'+(d.count>1?'s':''):id==='gate'?'Gate repair':'Emplacement')):'Unlock · '+d.unlock+' victories')+'</small></span></button>'+(battle?'<button class="deploy-button" data-action="'+(units?'recruit':'field-select')+'" data-id="'+id+'" '+(!unlocked||b.command<cost||(units?count+d.count>24:id==='gate'&&(b.gate>=b.maxGate||b.gate<=0))?'disabled':'')+'><b>⚑ '+cost+'</b><small>'+(units?'Deploy':id==='gate'?'Repair':'Refit')+'</small></button>':'<span class="row-chevron">›</span>')+'</article>';}).join('')+'</div>';
}
function battlePage(ui){const g=ui.g,s=g.store.data,b=g.battle;if(ui.screen==='research'||ui.screen==='research-detail')return researchPage(ui);
 if(ui.screen==='root')return '<div class="battle-categories">'+tile(ui,'troops','Troops','Deploy · Troops seek enemies','troops','battle-category')+tile(ui,'defenses','Defenses','Refit emplacements · Repair gate','defenses','battle-category')+tile(ui,'orders','Orders','Attack · Follow · Hold','orders','battle-category')+tile(ui,'research','Research','Four timed upgrades · This battle only','more','battle-category')+'</div>';
 if(ui.screen==='troops'||ui.screen==='defenses')return fieldRoster(ui,ui.screen);
 if(ui.screen==='detail')return ui.detailKind==='troops'?ui.troopsPage():ui.defensesPage();
 if(ui.screen==='placements')return '<h2>'+DEFENSES[ui.defense].name+'</h2><p class="list-hint">⚑ '+fieldDefenseCost(ui.defense)+' Command · Rank '+ROMAN[s.defenses[ui.defense]-1]+'<br>Replaces a defense for this battle only.</p><div class="placement-list">'+EMPLACEMENTS.map((p,i)=>'<button data-action="field-build" data-id="'+i+'" '+(b.layout[i]===ui.defense||b.command<fieldDefenseCost(ui.defense)?'disabled':'')+'><span><b>'+p.name+'</b><small>'+DEFENSES[b.layout[i]].name+'</small></span><em>'+(b.layout[i]===ui.defense?'Installed':'Replace ›')+'</em></button>').join('')+'</div>';
 if(ui.screen==='orders')return '<p class="list-hint">Orders affect troops already on the field. New recruits always advance; engineers guard and repair the gate.</p><div class="order-list">'+[['assault','Seek & attack','Hunt enemies across the battlefield.'],['follow','Follow me','Stay near your hero and engage nearby threats.'],['hold','Hold here','Defend your hero’s current position.']].map(([id,title,desc])=>'<button class="'+(g.order===id?'active':'')+'" data-action="order" data-id="'+id+'"><b>'+(g.order===id?'✓ ':'')+title+'</b><span>'+desc+'</span></button>').join('')+'</div>';
 return '<div class="pause-list">'+ui.button('resume',null,'Return to battle',false,true)+ui.button('battle-category','root','Battle command')+ui.button('battle-settings',null,'Sound & settings')+ui.button('help',null,'Combat controls')+ui.button('home',null,'Abandon battle & return')+ui.button('title',null,'Save & return to title')+'</div>';
}
export function menuAction(ui,action,id,value){switch(action){
 case 'research-filter':ui.researchFilter=id;refresh(ui);return true;
 case 'research-inspect':ui.researchId=id;ui.researchFilter=Object.keys(RESEARCH).includes(id)&&ui.researchFilter!=='all'&&ui.researchFilter!==RESEARCH[id].group?'all':ui.researchFilter;refresh(ui);return true;
 case 'field-inspect':if(value==='troops')ui.unit=id;else ui.defense=id;refresh(ui);return true;
 case 'research-start':ui.g.research(id);refresh(ui);return true;
 case 'research-cancel':ui.g.research(id,true);refresh(ui);return true;
 case 'menu-back':menuBack(ui);return true;
 case 'navigate':navigate(ui,id,{battleCommand:false});return true;
 case 'battle-category':navigate(ui,'army',{battleCommand:true,screen:id});return true;
 case 'battle-settings':navigate(ui,'settings',{battleCommand:false});return true;
 case 'detail-section':ui.detailTab=id;refresh(ui);return true;
 case 'inspect-object':ui.g.journey.mark(value);navigate(ui,ui.battleCommand?'army':value,{screen:'detail',detailKind:value,[value==='troops'?'unit':'defense']:id});return true;
 case 'equipment-slot':navigate(ui,'equipment',{screen:'inventory',inventoryFilter:id,item:heroData(ui.g.store.data).equipped[id]});return true;
 case 'item':ui.itemOnHero=false;navigate(ui,'equipment',{screen:'detail',item:id});return true;
 case 'field-select':if(id==='gate'){ui.g.fieldDefense(id);refresh(ui);}else navigate(ui,'army',{screen:'placements',defense:id});return true;
 case 'field-build':ui.g.fieldDefense(ui.defense,Number(id));menuBack(ui);return true;
 case 'order':ui.g.setOrder(id);ui.g.toast({assault:'Your army is seeking the enemy.',follow:'Your army is following you.',hold:'Your army is holding this ground.'}[id]);refresh(ui);return true;
 }return false;}
