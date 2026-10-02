import {MISSIONS} from './data.js';
export function rewardItem(save,id){const r=save.lastBattle;return save.inventory.find(i=>i.id===id)||r?.items.find(i=>i.id===id)||r?.chests.flatMap(c=>c.rewards.items).find(i=>i.id===id);}
export function rewardVisual(save,card){
 if(card.kind==='territory')return {type:'map',mission:Number(card.id)};
 if(card.kind==='item')return {type:'item',item:rewardItem(save,card.id)};
 if(card.kind==='lesson'){
  if(card.id==='tribute')return {type:'map',mission:card.mission};
  if(card.id==='exploration')return {type:'map',mission:0,home:true};
  if(card.id==='equipment'){const item=[...(save.lastBattle?.items||[])].reverse().find(i=>i.type==='armor')||save.inventory.find(i=>i.type==='armor');return {type:'item',item};}
  if(card.id==='ranks')return {type:'unit',id:'shield',rank:card.rank};
 }
 return {type:card.kind,id:card.id};
}
export function locationVisual(mission,home=false){
 const m=MISSIONS[mission],x=m.map[0]*10,y=m.map[1]*6.67,vx=Math.max(0,Math.min(580,x-210)),vy=Math.max(0,Math.min(247,y-210));
 return '<div class="unlock-location" data-location="'+mission+'" role="img" aria-label="'+(home?'Hearthwatch':m.name)+' highlighted on the campaign map"><svg class="unlock-location-map" viewBox="'+vx+' '+vy+' 420 420"><image href="'+(import.meta.env?.BASE_URL||'/')+'maps/hollow-march.webp" width="1000" height="667"/><circle class="map-reveal-ring" cx="'+x+'" cy="'+y+'" r="28"/><circle cx="'+x+'" cy="'+y+'" r="15" fill="#342217" stroke="#ffe1a0" stroke-width="2"/><path transform="translate('+(x-10)+' '+(y-11)+')" d="M0 22V5h4V0h4v5h4V0h4v5h4v17h-7V13H7v9Z" fill="#f7dca2"/></svg><div class="unlock-location-name"><small>'+(home?'YOUR CASTLE':m.mode==='siege'?'CASTLE SIEGE':'MAIN DEFENSE')+'</small><b>'+(home?'Hearthwatch':m.name)+'</b></div></div>';
}
