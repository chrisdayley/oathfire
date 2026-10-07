import {FIELD_LIMIT,WALL_LIMIT,canGarrison,fieldCount,wallCount,isWallUnit} from './wall-garrison.js';
import {UNITS,ROMAN} from './data.js';
import {unitUnlocked,campaignCap,upgradeUnit} from './state.js';
import {UNIT_TACTICS,regimentStats,regimentUpgrade} from './regiment-details.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const isRegimentMenu=ui=>!ui.battleCommand&&ui.g.menu==='troops'||ui.battleCommand&&(ui.screen==='troops'||ui.screen==='detail'&&ui.detailKind==='troops');
export function renderRegimentList(ui){
 const s=ui.g.store.data,wall=ui.battleCommand&&ui.deployWall;
 return (ui.battleCommand&&!ui.g.battle.siege?'<div class="garrison-tabs"><button data-action="regiment-deployment" data-id="field" aria-pressed="'+!wall+'">Field '+fieldCount(ui.g.allies)+'/24</button><button data-action="regiment-deployment" data-id="wall" aria-pressed="'+!!wall+'">Wall '+wallCount(ui.g.allies)+'/8</button></div>':'')+'<button class="regiment-back" data-action="menu-back">‹ Back</button><div class="regiment-list-scroll" aria-label="Army units">'+Object.entries(UNITS).filter(([id])=>!wall||canGarrison(id)).map(([id,u])=>{
  const ready=unitUnlocked(s,id),st=regimentStats(id,s.units[id],ui.battleCommand?ui.g.battle:null,{wall}).stats;
  return '<button class="regiment-choice '+(ui.unit===id?'selected ':'')+(!ready?'locked':'')+'" data-action="regiment-select" data-id="'+id+'" aria-pressed="'+(ui.unit===id)+'"><b>'+u.name+'</b><span>'+(ready?'Rank '+ROMAN[s.units[id]-1]+' · ⚑ '+st.cost:u.unlock+' victories to unlock')+'</span></button>';
 }).join('')+'</div>';
}
function upgradeBlock(ui,id,rank){
 const s=ui.g.store.data;
 if(!unitUnlocked(s,id))return 'Unlock after '+UNITS[id].unlock+' victories';
 if(rank>=10)return 'Fully trained';
 if(rank>=campaignCap(s))return 'Requires '+(rank<7?5:10)+' campaign victories';
 if(ui.g.battle)return 'Train at Hearthwatch';
 return null;
}
export function renderRegiment(ui){
 const s=ui.g.store.data,id=ui.unit,u=UNITS[id],owned=s.units[id],rank=ui.previewRank||owned,battle=ui.battleCommand?ui.g.battle:null,{stats,rows}=regimentStats(id,rank,battle,{wall:!!battle&&!!ui.deployWall}),t=UNIT_TACTICS[id],mode=ui.regimentMode||'stats',quote=mode==='upgrade'?regimentUpgrade(id,owned):null;
 const heading='<div class="regiment-heading"><small>'+t.role+(battle?(ui.deployWall?' · WALL +'+(battle.perks?.includes('battlements')?90:75)+'% RANGE':' · FIELD TROOP'):'')+'</small><h2>'+u.name+'</h2><div class="regiment-rank"><span class="rank-diamonds" aria-hidden="true">'+ROMAN.map((_,i)=>'<i class="'+(i<rank?'filled':'')+'"></i>').join('')+'</span><label>Rank <select id="regiment-rank" aria-label="Preview unit rank" '+(battle||mode==='upgrade'?'disabled':'')+'>'+ROMAN.map((r,i)=>'<option value="'+(i+1)+'" '+(rank===i+1?'selected':'')+'>'+r+(owned===i+1?' · owned':'')+'</option>').join('')+'</select></label></div></div>';
 let body='',actions='';
 if(quote){
  ui.regimentQuote={id,rank:owned,cost:quote.cost};
  body='<div class="training-price"><span>Rank '+ROMAN[owned-1]+' → '+ROMAN[owned]+'</span><b>'+quote.cost+' Supplies</b><small>You have '+s.supplies+'</small></div><div class="training-columns"><span>Improvement</span><span>Now → Next</span><span>Change</span></div><div class="training-changes">'+quote.rows.map(r=>'<div data-upgrade-stat="'+r.key+'" class="training-change '+(r.delta*r.direction>0?'gain':'tradeoff')+'"><span>'+r.label+'</span><b>'+r.before+' → '+r.after+'</b><em>'+r.change+'</em></div>').join('')+'</div>'+quote.abilities.map(a=>'<div class="training-ability"><b>Unlock · '+a.name+'</b><p>'+esc(a.text)+'</p></div>').join('');
  const blocked=upgradeBlock(ui,id,owned);
  actions=ui.button('regiment-cancel',null,'Cancel')+ui.button('regiment-confirm',id,blocked||'Confirm · '+quote.cost,!!blocked||s.supplies<quote.cost,true);
  if(s.supplies<quote.cost)body+='<p class="regiment-warning">Need '+(quote.cost-s.supplies)+' more Supplies.</p>';
 }else if(mode==='abilities'){
  body='<div class="regiment-abilities">'+stats.abilities.map(a=>'<article class="'+(rank<a.unlock?'locked':'')+'"><h3>'+a.name+'</h3><small>'+(rank<a.unlock?'Unlocks at rank '+ROMAN[a.unlock-1]:'Active at rank '+ROMAN[rank-1])+'</small><p>'+esc(a.text)+'</p></article>').join('')+'</div>';
  actions=ui.button('regiment-overview',null,'‹ Stats & role',false,true);
 }else{
  body=(rank!==owned?'<div class="regiment-preview-note">Preview rank '+ROMAN[rank-1]+' · Owned '+ROMAN[owned-1]+'</div>':'')+'<dl class="regiment-stats">'+rows.map(r=>'<div data-stat="'+r.key+'"><dt>'+r.label+'</dt><dd>'+r.text+'</dd></div>').join('')+'</dl><p class="regiment-purpose">'+t.use+'</p><div class="regiment-matchups"><p><b>'+(['lantern','banner','engineer','dawn'].includes(id)?'Best used for':'Strong against')+'</b> '+t.strong+'</p><p><b>Watch out for</b> '+t.weak+'</p></div>'+(!unitUnlocked(s,id)?'<p class="regiment-warning">Unlock after '+u.unlock+' campaign victories.</p>':'');
  if(battle){
   const wall=!!ui.deployWall,count=wall?wallCount(ui.g.allies):fieldCount(ui.g.allies),limit=wall?WALL_LIMIT:FIELD_LIMIT,field=ui.g.allies.filter(a=>!a.dead&&a.unit===id&&isWallUnit(a)===wall),blocked=!unitUnlocked(s,id)||battle.command<stats.cost||count+stats.count>limit;
   body+='<p class="regiment-field">'+field.length+' deployed · '+count+' / '+limit+(wall?' wall slots · ':' field slots · ')+Math.floor(battle.command)+' Command available</p>';
   actions='<small>Repeat hires: +20% of initial cost each. Resets next battle.</small>'+ui.button('regiment-abilities',null,'Abilities')+ui.button('recruit',id,!unitUnlocked(s,id)?'Locked':count+stats.count>limit?(wall?'Wall full':'Field full'):battle.command<stats.cost?'Need ⚑ '+stats.cost:(wall?'Garrison':'Recruit')+' · ⚑ '+stats.cost,blocked,true);
  }else{
   const blocked=upgradeBlock(ui,id,owned);
   actions='<small>Repeat hires: +20% of initial cost each. Resets next battle.</small>'+ui.button('regiment-abilities',null,'Abilities')+ui.button('regiment-upgrade',id,blocked||'Upgrade ›',!!blocked,true);
  }
 }
 return '<section class="regiment-sheet" data-unit="'+id+'" data-rank="'+rank+'">'+heading+'<div class="regiment-body">'+body+'</div><div class="regiment-actions">'+actions+'</div></section>';
}
function refresh(ui){const list=document.querySelector('.regiment-list-scroll'),scroll=list?.scrollTop||0;ui.draw();ui.previewForTab();const next=document.querySelector('.regiment-list-scroll');if(next)next.scrollTop=scroll;}
export function regimentAction(ui,action,id){
 if(!action.startsWith('regiment-'))return false;
 const s=ui.g.store.data;
 switch(action){
  case 'regiment-deployment':ui.deployWall=id==='wall'&&!ui.g.battle?.siege;if(ui.deployWall&&!canGarrison(ui.unit))ui.unit='bow';ui.regimentMode='stats';break;
  case 'regiment-select':if(!UNITS[id])return true;ui.unit=id;ui.regimentMode='stats';ui.previewRank=null;ui.regimentQuote=null;ui.g.journey.mark('troops');break;
  case 'regiment-abilities':ui.regimentMode='abilities';break;
  case 'regiment-overview':ui.regimentMode='stats';break;
  case 'regiment-rank':ui.previewRank=Math.max(1,Math.min(10,Number(id)));ui.regimentMode='stats';break;
  case 'regiment-upgrade':{
   const rank=s.units[ui.unit];if(upgradeBlock(ui,ui.unit,rank))return true;
   ui.regimentMode='upgrade';ui.previewRank=rank+1;break;
  }
  case 'regiment-cancel':ui.regimentMode='stats';ui.previewRank=null;ui.regimentQuote=null;break;
  case 'regiment-confirm':{
   const quote=ui.regimentQuote;
   if(ui.regimentMode!=='upgrade'||!quote||quote.id!==id||quote.rank!==s.units[id]||upgradeBlock(ui,id,quote.rank))return true;
   ui.g.store.commit(n=>{upgradeUnit(n,id);n.guide.homeTask=null;});
   ui.regimentQuote=null;ui.regimentMode='stats';ui.previewRank=null;ui.g.journey.mark('troops');ui.g.audio.play('upgrade');break;
  }
  default:return false;
 }
 refresh(ui);return true;
}
