// Permanent training. These values drive recruitment, combat and the inspection UI.
const round=n=>Math.round(n*1000)/1000;
export const TRAINING_COSTS=[320,480,700,980,1340,1800,2390,3120,4050];
export function trainingCost(unit,rank){return Math.ceil(TRAINING_COSTS[rank-1]*Math.max(1,((unit.trainingBase??unit.cost)/35)**.3)/10)*10;}
export function trainedUnit(id,u,rank,weapon){
 const i=Math.max(0,Math.min(9,rank-1));
 const s={count:1,hp:Math.round(u.hp*(1+i*.19+i*i*.009)),damage:Math.round(u.damage*(1+i*.14+i*i*.006)),speed:u.speed,reach:u.reach,cost:u.cost+Math.floor(i/3)*4,armor:id==='shield'?12+i*3:id==='dawn'?26+i*2:4,attackInterval:['bow','crossbow','staff'].includes(u.weapon)?({marksman:2.8,pyre:2.7,frost:2.2}[id]||1.5):weapon.speed};
 const roles={
  shield:{count:rank>=8?3:rank>=4?2:1},
  bow:{reach:25+i*1.5},
  pike:{siegeBonus:1.5+i*.07,reach:3.6+i*.07},
  lantern:{healAmount:14+i*4,healRange:10+i*.5,healInterval:3-i*.08},
  breaker:{armorPierce:.55+i*.025,stagger:.08+i*.035},
  crew:{armorPierce:.5,knockback:1.6+i*.42,siegeBonus:1.35+i*.06},
  rider:{armor:18+i*3,armorPierce:.25+i*.025,speed:7.2+i*.18,chargeDamage:1.6+i*.07,chargeStun:.7+i*.06,chargeDistance:6-i*.2},
  giant:{reach:4.4+i*.16,stagger:.3+i*.06,knockback:1.8+i*.3},
  banner:{auraRadius:9+i*.5,auraStrength:.15+i*.015,commandRate:.25+i*.025},
  engineer:{repairAmount:22+i*6,repairInterval:3-i*.1},
  assassin:{speed:5.4+i*.14,armorPierce:.5+i*.03},
  pyre:{blastRadius:1.6+i*.16,burnDps:3+i*.7},
  marksman:{armorPierce:.7+i*.025,reach:34+i*.65},
  frost:{slowStrength:.35+i*.025,slowDuration:2.2+i*.3},
  dawn:{healAmount:14+i*4,healRange:7+i*.4,healEvery:rank>=7?2:3}
 };
 Object.assign(s,roles[id]);for(const k of Object.keys(s))s[k]=round(s[k]);
 if(s.count>1)s.cost=Math.ceil(s.cost*(1+(s.count-1)*.7));
 return s;
}
// key, label, unit, display multiplier, better direction.
export const TACTICAL_STATS={
 shield:[['count','Soldiers / recruit',''],['armor','Armor','']],
 bow:[['reach','Arrow range',' m']],
 pike:[['siegeBonus','Siege-target damage','×'],['reach','Pike reach',' m']],
 lantern:[['healAmount','Healing / pulse',' HP'],['healRange','Healing radius',' m'],['healInterval','Healing cycle',' s',1,-1]],
 breaker:[['armorPierce','Armor ignored','%',100],['stagger','Hit stagger',' s']],
 crew:[['knockback','Bolt push strength',' m/s'],['siegeBonus','Siege-target damage','×']],
 rider:[['speed','Movement',' m/s'],['chargeDamage','Charge damage','×'],['chargeStun','Charge stun',' s'],['chargeDistance','Run to charge',' m',1,-1]],
 giant:[['reach','Sweep reach',' m'],['stagger','Hit stagger',' s'],['knockback','Sweep push strength',' m/s']],
 banner:[['auraStrength','Ally damage & speed','%',100],['auraRadius','Aura radius',' m'],['commandRate','Command / minute','',60]],
 engineer:[['repairAmount','Gate repair / pulse',' HP'],['repairInterval','Repair cycle',' s',1,-1]],
 assassin:[['speed','Movement',' m/s'],['armorPierce','Armor ignored','%',100]],
 pyre:[['blastRadius','Fireball burst radius',' m'],['burnDps','Ember damage / s (rank V)','']],
 marksman:[['armorPierce','Armor ignored','%',100],['reach','Bolt range',' m']],
 frost:[['slowStrength','Movement slowed','%',100],['slowDuration','Slow duration',' s']],
 dawn:[['healAmount','Healing / proc',' HP'],['healRange','Healing radius',' m'],['healEvery','Hits per heal','',1,-1]]
};
