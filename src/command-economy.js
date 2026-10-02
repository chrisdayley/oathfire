// Permanent investment, separate from temporary battlefield research.
export const LOGISTICS_RANKS=[
 {name:'Unbuilt',bonus:0},
 {name:'Signal office',bonus:.08,cost:280,unlock:0},
 {name:'Courier network',bonus:.16,cost:550,unlock:2},
 {name:'Supply depot',bonus:.26,cost:1000,unlock:5},
 {name:'Royal quartermasters',bonus:.38,cost:1800,unlock:10},
 {name:'Grand command lodge',bonus:.52,cost:3000,unlock:16}
];
export const castleCommandBonus=s=>LOGISTICS_RANKS[s?.castleLogistics||0]?.bonus||0;
export function upgradeLogistics(s){
 if(s.battle)throw Error('Construct at Hearthwatch between battles.');
 const next=LOGISTICS_RANKS[(s.castleLogistics||0)+1];
 if(!next)throw Error('The command lodge is fully upgraded.');
 if(s.completed.length<next.unlock)throw Error('Win '+next.unlock+' main defenses to unlock this rank.');
 if(s.supplies<next.cost)throw Error('Not enough Supplies.');
 s.supplies-=next.cost;s.castleLogistics=(s.castleLogistics||0)+1;
}
export const STANDARD_LIMIT=3;
export function commandBreakdown(b){
 const base=.6,castle=Math.max(0,Math.min(.52,b?.castleIncome||0)),standards=Math.max(0,Math.min(1.125,b?.standardIncome||0)),camp=b?.camp?.15:0;
 const multiplier=b?.research?.some(r=>r.id==='logistics'&&r.complete)?1.2:1;
 return {base,castle,standards,camp,multiplier,total:(base+castle+standards+camp)*multiplier};
}
