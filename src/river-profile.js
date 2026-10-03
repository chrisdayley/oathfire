// Shared by terrain, water, vegetation and foot contacts. The near bend leaves
// the east side of the world rather than ending in a rectangular pool at the gate.
export const RIVER_LEVEL=-.65;
export const riverCenter=z=>12+Math.sin(z*.045)*15+140*Math.max(0,(z+65)/40)**2;
export const riverWidth=z=>6.8+Math.sin(z*.071)*.65+Math.sin(z*.019)*.45;
export const riverDistance=(x,z)=>Math.abs(x-riverCenter(z));
export const inRiver=(x,z,margin=0)=>z<-24&&riverDistance(x,z)<riverWidth(z)+margin;
const smooth=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);};
export function riverTerrain(x,z,base){
 if(z>=-24)return base;
 const d=riverDistance(x,z),w=riverWidth(z);
 if(d>=w+19)return base;
 // A shallow ford remains physically traversable; no sheer trench banks.
 const ford=Math.max(Math.exp(-(((z+63)/5)**2)),Math.exp(-(((z+126)/5)**2)));
 const depth=1.15-ford*.63,edge=RIVER_LEVEL+.28;
 const bed=RIVER_LEVEL-depth+(depth+.28)*smooth(d/w);
 if(d<=w)return bed;
 return edge+(base-edge)*smooth((d-w)/19);
}
export function riverBankTint(x,z){const d=riverDistance(x,z),w=riverWidth(z);return z<-24?1-smooth((d-w+1.2)/3.8):0;}
