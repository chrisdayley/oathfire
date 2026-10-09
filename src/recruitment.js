// Only living paid squads raise replacement prices. Free reinforcements do not.
export function livingSquads(allies,id){
 const groups=new Set();
 for(const a of allies||[])if(a.unit===id&&!a.dead&&a.hp>0&&a.recruitGroup)groups.add(a.recruitGroup);
 return groups.size;
}
export function bindRecruitment(battle,allies){
 Object.defineProperty(battle,'livingRecruits',{configurable:true,get:()=>Object.fromEntries([...new Set(allies().map(a=>a.unit))].map(id=>[id,livingSquads(allies(),id)]))});
}
export function recruitmentMultiplier(count=0){return 1+.2*Math.max(0,count-2);}
