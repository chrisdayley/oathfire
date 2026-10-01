// Command pays for temporary battlefield construction; Supplies train permanent ranks.
export const FIELD_DEFENSE_COST={gate:45,tower:55,ballista:75,cannon:90,frost:70,mortar:100,sanctuary:85,storm:110};
export const fieldDefenseCost=id=>FIELD_DEFENSE_COST[id]??Infinity;
