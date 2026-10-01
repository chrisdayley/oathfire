export const RECORDINGS={
 'three-sheets-to-the-wind':{title:'Three Sheets to the Wind',seconds:200.324},
 'into-the-wilds':{title:'Into the Wilds',seconds:246.788},
 'call-to-adventure':{title:'Call to Adventure',seconds:259.840},
 legionnaire:{title:'Legionnaire',seconds:184},
 'the-fury':{title:'Monomyth — The Fury',seconds:425.829},
 terminus:{title:'Terminus',seconds:263.432},
 vanguard:{title:'Vanguard',seconds:234.529},
 'eyes-in-the-void':{title:'Eyes in the Void',seconds:264.066}
};
export const BOSS_CUES={bell:'legionnaire',castellan:'the-fury',veyr:'terminus',regent:'vanguard',hollow:'eyes-in-the-void'};
export const RECORDING_TITLES={castle:RECORDINGS['three-sheets-to-the-wind'].title,march1:'Into the Wilds · Battle suite',march2:'Call to Adventure · Battle suite',march3:'Into the Wilds · Battle suite',march4:'Vanguard · Battle suite',march5:'Terminus · Battle suite',...Object.fromEntries(Object.entries(BOSS_CUES).map(([id,key])=>[id,RECORDINGS[key].title])),victory:'Call to Adventure',defeat:'Into the Wilds'};
export function cuePlan(scene){
 if(scene.id==='castle')return ['three-sheets-to-the-wind'];
 if(scene.id==='victory')return ['call-to-adventure'];if(scene.id==='defeat')return ['into-the-wilds'];
 const opening=BOSS_CUES[scene.id]||(scene.act===2?'call-to-adventure':scene.act>=5?'terminus':scene.act===4?'vanguard':'into-the-wilds');
 return [...new Set([opening,'legionnaire','terminus','the-fury','vanguard','eyes-in-the-void','into-the-wilds','call-to-adventure'])];
}
export function waveCue(scene,played=[]){if(scene.kind!=='battle')return null;const wave=Math.max(1,scene.wave||1),plan=cuePlan(scene);if(wave<=1)return null;return plan.slice(Math.min(wave-1,plan.length-1)).find(id=>!played.includes(id))||plan.find(id=>!played.includes(id))||null;}
export function validateRecordingCheckpoint(r){if(r===undefined)return;if(!r||!RECORDINGS[r.track]||!Number.isFinite(r.seconds)||r.seconds<0||r.seconds>RECORDINGS[r.track].seconds+1||!Array.isArray(r.played)||r.played.length>8||new Set(r.played).size!==r.played.length||r.played.some(id=>!RECORDINGS[id])||!Number.isInteger(r.wave)||r.wave<0||r.wave>6)throw Error('Invalid recorded score checkpoint.');}
