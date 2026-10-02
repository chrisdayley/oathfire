// Ashwright's active spell. Ordinary staff bolts never inherit these effects.
const RANKS=[
 {impact:58,blast:24,radius:3,burn:8,duration:3,sunder:0},
 {impact:78,blast:32,radius:3.5,burn:12,duration:4,sunder:4},
 {impact:104,blast:42,radius:4,burn:16,duration:5,sunder:6}
];
export const furnaceFireball=rank=>RANKS[Math.max(0,Math.min(2,rank-1))];
export const furnaceDescriptions=RANKS.map(r=>r.impact+' direct + '+r.blast+' blast damage. Burns a '+r.radius+'m area for '+r.burn+' damage/s over '+r.duration+'s.'+(r.sunder?' Blast reduces enemy armor 20% for '+r.sunder+'s.':''));
