import {SERVICES} from './data.js';

export const SERVICE_REACH=4.5;
export const serviceFor=tab=>SERVICES.find(s=>s.tab===tab&&s.tab!=='hero');
export function canUseService(g,tab){
 const service=serviceFor(tab);
 return !service||!!(!g.battle&&g.hero&&Math.hypot(g.hero.pos.x-service.x,g.hero.pos.z-service.z,(g.hero.pos.y||0)-(service.y||0))<SERVICE_REACH);
}
export const serviceActions={
 'mount-hire':'stable','mount-select':'stable',
 'regiment-confirm':'troops','upgrade-unit':'troops',
 'upgrade-defense':'defenses','upgrade-logistics':'defenses','refit':'defenses',
 forge:'equipment',rune:'equipment',temper:'equipment',salvage:'equipment',equip:'equipment',buy:'shop'
};
export function actionService(action,id){return action==='doctrine'?(id==='shield'?'troops':'defenses'):serviceActions[action];}

export function guideToService(ui,tab){
 const service=serviceFor(tab);if(!service||ui.g.battle)return false;
 ui.close();ui.g.store.commit(s=>s.guide.homeTask=tab);ui.g.journey.lastCard='';
 ui.g.toast('Follow the marker to '+service.name+'. Speak to them when you arrive.');
 return true;
}
