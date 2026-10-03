// Legacy ground props describe their top but omit their bottom. They are
// grounded, not suspended at world y=0; valleys can sit below sea level.
export function blocksActorHeight(obstacle,ground,step=.6){
 return obstacle.top>ground+step&&(obstacle.bottom??-Infinity)<ground+2.2;
}
