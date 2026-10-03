// Assault infantry press the castle; only dedicated hunters acquire soldiers
// merely for being nearby. A hit gives ordinary infantry a bounded reprisal.
export const TROOP_HUNTERS = new Set(['longbow', 'reaver', 'wraith']);
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function rememberAttacker(enemy, source, now) {
 if (enemy.team !== 'enemy' || !source?.id || source.dead || !['hero','ally'].includes(source.team)) return;
 enemy.reprisal = {id: source.id, until: now + 9};
}
export function enemyTarget(enemy, candidates, {now=0, range=22, siege=false, reachable=()=>true}={}) {
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
