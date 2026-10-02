// Original Oathfire roles. Unlock counts are distinct first victories, never replays.
export const NEW_UNITS={
 banner:{name:'Dawn standard',role:'Generate passive Command anywhere on the field; nearby allies gain damage and movement speed.',model:'Knight',weapon:'spear',cost:45,count:1,hp:155,damage:12,speed:3,reach:3.2,unlock:1,color:0xb29143,category:'Support'},
 engineer:{name:'Field engineers',role:'Repair the gate. Training improves repair strength and speed; a fallen gate cannot be rebuilt.',model:'Barbarian',weapon:'hammer',cost:65,count:1,hp:105,damage:14,speed:3.3,reach:2.6,unlock:2,color:0x806345,category:'Support'},
 assassin:{name:'Veil blades',role:'Hunt ranged enemies with fast movement and armor-piercing blades.',model:'Rogue_Hooded',weapon:'sword',cost:65,count:1,hp:82,damage:27,speed:5.4,reach:2.5,unlock:3,color:0x3c4b56,category:'Flank'},
 pyre:{name:'Cinder adepts',role:'Slow fireballs burst on impact. Keep them behind shields to burn tightly packed infantry.',model:'Mage',weapon:'staff',cost:75,count:1,hp:78,damage:28,speed:3,reach:23,unlock:4,color:0x844d32,category:'Ranged'},
 marksman:{name:'Ironwatch marksmen',role:'Long-range crossbows pierce armor. Training improves penetration and reach.',model:'Rogue_Hooded',weapon:'crossbow',cost:85,count:1,hp:86,damage:42,speed:3,reach:34,unlock:6,color:0x697873,category:'Ranged'},
 frost:{name:'Rime scholars',role:'Ice shards slow enemies. Training improves slow strength and duration.',model:'Mage',weapon:'staff',cost:70,count:1,hp:88,damage:17,speed:3,reach:24,unlock:7,color:0x527d91,category:'Control'},
 dawn:{name:'Sun sworn',role:'Armored champions heal wounded allies as they strike. Training strengthens their renewal.',model:'Knight',weapon:'sword',cost:105,count:1,hp:245,damage:32,speed:2.9,reach:2.7,unlock:10,color:0xb5a173,category:'Frontline'}
};
const ranks=(base,growth)=>Array.from({length:10},(_,i)=>Math.round(base*(1+i*growth+i*i*.006)));
const defense=(name,desc,unlock,damage,range,interval,appearance)=>({name,desc,unlock,interval,hp:ranks(360,.14),damage:ranks(damage,.11),third:Array.from({length:10},(_,i)=>range+i*.8),costs:[110,150,210,280,370,490,650,850,1120],appearance:Array.from({length:10},(_,i)=>appearance+' '+['Field timber footing.','Iron-banded footing.','Cut-stone pedestal.','Braced corner piers.','Armored mechanism casing.','Brass reinforcement rings.','Masonry parapets.','Oath banners and veteran fittings.','A gilded sun crest.','Twin ceremonial spires and a complete dawn harness.'][i]),effects:Array.from({length:10},()=>desc)});
export const NEW_DEFENSES={
 cannon:defense('Ember cannon','Iron shot deals direct damage and a 3m blast for 45% damage. Fires every 4.2s; ignores half of direct-hit armor.',2,48,29,4.2,'A bored iron barrel, carriage wheels and powder rack.'),
 frost:defense('Rime obelisk','A physical ice shard slows its target by 35% for 3s. Fires every 2.5s; weak damage, reliable crowd control.',4,17,27,2.5,'A faceted ice prism held in a bronze crown.'),
 mortar:defense('Stone lobber','Lobs a stone in a high arc every 6s. Explodes for full listed damage within 4m. Cannot fire at enemies closer than 9m.',5,60,42,6,'A counterweight, timber throwing arm and stone sling.'),
 sanctuary:defense('Sanctuary brazier','Every 4s, heals up to four wounded allies in range for the listed power and grants 30% protection for 2s. Uses one weapon emplacement.',7,14,17,4,'A sheltered ember bowl with a tall pilgrim arch.'),
 storm:defense('Storm spire','Lightning jumps to three enemies within 7m of one another for 100%, 65%, then 40% damage. Fires every 3.6s.',9,35,26,3.6,'Copper induction rings climb a grounded iron mast.')
};
export const EMPLACEMENTS=[{name:'West gate',x:-13,z:-20},{name:'East gate',x:13,z:-20},{name:'West wing',x:-23,z:-21},{name:'East wing',x:23,z:-21}];
export const DEFAULT_LAYOUT=['tower','tower','ballista','ballista'];
