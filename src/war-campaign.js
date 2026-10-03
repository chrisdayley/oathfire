// Calendar time is earned by finishing a battle, never by waiting or opening menus.
export const DEFENSE_COUNT=24;
export const TOWN_IDS=Array.from({length:8},(_,i)=>24+i);
export const reliefID=town=>town+9;
export const nextDefense=s=>Array.from({length:24},(_,i)=>i).find(id=>!s.completed.includes(id));
export const campaignComplete=s=>nextDefense(s)===undefined&&TOWN_IDS.every(id=>s.settlements?.includes(id))&&s.fortresses?.includes(32)===true;
export function ensureWar(s){if(!s.war)s.war={version:1,day:1,nextAttackDay:4,nextRaidDay:5,captured:[...(s.settlements||[])],raids:[],protectedUntil:{},reliefs:0};return s.war;}
export function daysToAttack(s){return nextDefense(s)===undefined?null:Math.max(0,(s.war?.nextAttackDay??4)-(s.war?.day??1));}
export const raidFor=(s,town)=>s.war?.raids.find(r=>r.town===town);
export const daysToRaid=(s,r)=>Math.max(0,r.deadline-(s.war?.day??1));
export function departureBlock(s,m){if(daysToAttack(s)===0&&m.id!==nextDefense(s))return 'Hearthwatch is under attack. Defend your castle first.';return '';}
export function syncEnding(s){s.ending=campaignComplete(s)?'The Hollow King is defeated. Every town is free. Hearthwatch opens its gates.':null;}
export function warSnapshot(s){return {day:s.war?.day??1,defenses:s.completed.length,held:[...(s.settlements||[])],captured:[...(s.war?.captured||s.settlements||[])],fortress:!!s.fortresses?.includes(32)};}
export function advanceWar(s,m,win,before){
 const w=ensureWar(s),oldDay=w.day;w.day++;
 const events={fromDay:oldDay,toDay:w.day,defensesBefore:before.defenses,defensesAfter:s.completed.length,heldBefore:before.held,heldAfter:[],opened:[],captured:null,relieved:null,lost:[],raidsAdded:[],complete:false};
 if(win&&m.kind==='main'&&s.completed.length>before.defenses)w.nextAttackDay=w.day+(s.completed.length<6?4:3);
 if(win&&m.kind==='settlement'){events.captured=m.id;w.protectedUntil[m.id]=w.day+3;if(!w.captured.includes(m.id))w.captured.push(m.id);}
 if(m.kind==='relief'){
  w.raids=w.raids.filter(r=>r.town!==m.town);
  if(win){events.relieved=m.town;w.reliefs++;w.protectedUntil[m.town]=w.day+4;}
  else {s.settlements=s.settlements.filter(id=>id!==m.town);events.lost.push(m.town);}
 }
 // The final victory ends enemy counterattacks before their deadlines resolve.
 if(campaignComplete(s)){w.raids=[];events.complete=true;}
 else {
  for(const r of w.raids)if(r.deadline<=w.day){s.settlements=s.settlements.filter(id=>id!==r.town);events.lost.push(r.town);}
  w.raids=w.raids.filter(r=>r.deadline>w.day&&s.settlements.includes(r.town));
  const limit=s.completed.length<12?1:2;
  if(w.day>=w.nextRaidDay&&w.raids.length<limit){
   const candidates=TOWN_IDS.filter(id=>s.settlements.includes(id)&&!raidFor(s,id)&&(w.protectedUntil[id]??0)<w.day);
   if(candidates.length){const town=candidates[(w.day+w.reliefs)%candidates.length],r={town,started:w.day,deadline:w.day+3};w.raids.push(r);events.raidsAdded.push(town);w.nextRaidDay=w.day+4;}
   else w.nextRaidDay=w.day+1;
  }
 }
 events.heldAfter=[...s.settlements];syncEnding(s);return events;
}
export function validateWar(s){
 const w=s.war,integer=(n,min=0,max=1000000)=>Number.isInteger(n)&&n>=min&&n<=max;
 if(!w||w.version!==1||!integer(w.day,1)||!integer(w.nextAttackDay,1)||!integer(w.nextRaidDay,1)||!integer(w.reliefs)||!Array.isArray(w.captured)||w.captured.length>8||w.captured.some(id=>!TOWN_IDS.includes(id))||new Set(w.captured).size!==w.captured.length||!Array.isArray(w.raids)||w.raids.length>2||new Set(w.raids.map(r=>r.town)).size!==w.raids.length||!w.protectedUntil||typeof w.protectedUntil!=='object'||Array.isArray(w.protectedUntil))throw Error('Invalid campaign calendar.');
 for(const r of w.raids)if(!TOWN_IDS.includes(r.town)||!s.settlements.includes(r.town)||!integer(r.started,1)||r.started>w.day||!integer(r.deadline,1)||r.deadline<=w.day||r.deadline>r.started+3)throw Error('Invalid invasion deadline.');
 for(const [id,day]of Object.entries(w.protectedUntil))if(!TOWN_IDS.includes(Number(id))||!integer(day,1))throw Error('Invalid settlement protection.');
}
export function validateWarReport(r){if(r===undefined)return;const ints=['fromDay','toDay','defensesBefore','defensesAfter'];if(!r||ints.some(k=>!Number.isInteger(r[k])||r[k]<0||r[k]>1000000)||r.toDay!==r.fromDay+1||r.defensesBefore>24||r.defensesAfter>24||typeof r.complete!=='boolean')throw Error('Invalid campaign report.');for(const k of ['heldBefore','heldAfter','lost','raidsAdded'])if(!Array.isArray(r[k])||r[k].length>8||r[k].some(id=>!TOWN_IDS.includes(id)))throw Error('Invalid campaign territory report.');for(const k of ['captured','relieved'])if(r[k]!==null&&!TOWN_IDS.includes(r[k]))throw Error('Invalid campaign event.');if(!Array.isArray(r.opened)||r.opened.length>9||r.opened.some(id=>!TOWN_IDS.includes(id)&&id!==32))throw Error('Invalid newly available territory.');}
