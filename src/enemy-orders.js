export const WALL_BREAKERS=new Set(['brute','mortar']);
export const committedToWall=e=>WALL_BREAKERS.has(e.type)||e.encounterRole==='ram';
// Assault infantry press the castle; only dedicated hunters acquire soldiers
// merely for being nearby. A hit gives ordinary infantry a bounded reprisal.
export const TROOP_HUNTERS = new Set(['longbow', 'reaver', 'wraith']);
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function rememberAttacker(enemy, source, now) {
 if (committedToWall(enemy)) return;
 if (enemy.team !== 'enemy' || !source?.id || source.dead || !['hero','ally'].includes(source.team)) return;
 enemy.reprisal = {id: source.id, until: now + 9};
}
export function enemyTarget(enemy, candidates, {now=0, range=22, siege=false, reachable=()=>true}={}) {
 if(!siege&&committedToWall(enemy)){delete enemy.reprisal;return null;}
 const valid = target => target && !target.dead && reachable(target);
 const reprisal = enemy.reprisal;
 if (reprisal) {
  const target = candidates.find(a=>a.id===reprisal.id);
  if (reprisal.until > now && valid(target) && distance(enemy.pos,target.pos)<=Math.max(28,range+7)) return target;
  delete enemy.reprisal;
 }
 // Siege garrisons defend their own fortress against the invading army.
 if (!siege && !TROOP_HUNTERS.has(enemy.type)) return null;
 const choices=candidates.filter(a=>valid(a)&&distance(enemy.pos,a.pos)<range);
 if (enemy.type==='longbow') choices.sort((a,b)=>Number(b.wallSlot!==undefined)-Number(a.wallSlot!==undefined)||distance(enemy.pos,a.pos)-distance(enemy.pos,b.pos));
 else choices.sort((a,b)=>distance(enemy.pos,a.pos)-distance(enemy.pos,b.pos));
 return choices[0]||null;
}

// Exterior contact points on the actual curtain walls and central gatehouse.
// All sections share castle integrity, but attackers no longer funnel to the gate.
export function nearestCastleWall(pos){
 const segments=[[-36.8,-18.5,-8.5,-18.5],[-8.5,-19.5,-4.3,-19.5],[-4.3,-17.35,4.3,-17.35],[4.3,-19.5,8.5,-19.5],[8.5,-18.5,36.5,-18.5],[-36.5,-17,-36.5,34],[36.5,-17,36.5,34],[-35,35.5,35,35.5]];
 let best=null,d=Infinity;
 for(const[x1,z1,x2,z2]of segments){const dx=x2-x1,dz=z2-z1,t=Math.max(0,Math.min(1,((pos.x-x1)*dx+(pos.z-z1)*dz)/(dx*dx+dz*dz))),p={x:x1+t*dx,y:0,z:z1+t*dz},n=distance(pos,p);if(n<d){best=p;d=n;}}
 return best;
}
