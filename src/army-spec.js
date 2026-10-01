export const ARMY_SPEC={
  "shield": {
    "title":"Shieldward", "asset":"shieldward-ten-refined-v4.png",
    "names":["Levy","Leatherbound","Ironbound","Marchguard","Sworn","Steelguard","Veteran","Banner Guard","Dawnsworn","Dawn Sentinel"],
    "appearance":["Quilted coat · bare head · wooden round shield","Leather jack · skullcap · metal shield boss","Iron kettle helm · short mail · iron shield rim","Long mail · shoulder lames · small kite shield","Steel breastplate · visor · tall sun shield","Articulated arm and leg plate · riveted long shield","Full plate · short surcoat · rectangular shield","Broad pavise · heraldic tabard · back pennant","Winged shoulders · half crest · split cape","High crest · gold-edged armor · long cape · radiant shield"],
    "hp":[120,132,148,166,188,212,239,269,301,336],
    "damage":[16,17,19,20,22,24,26,28,31,34],
    "third":[30,35,42,48,58,66,76,87,100,116], "thirdLabel":"Guard",
    "abilities":["Hold the line","Set the feet","Brace","Shield recovery","Linked shields","Turn the edge","Covering retreat","Veteran discipline","Prepare the counter","Counterpush"],
    "effects":["Hold assigned ground. A short stab keeps the shield in front.","A wider planted stance accompanies the stronger guard pool.","Frontal charges cause 40% less stagger while braced; soldiers lower shoulders behind their shields.","Block recovery shortens from 0.60s to 0.54s; the shield returns through a tighter arc.","Sentinel formation: adjacent shields reduce frontal projectile damage by 15%. Shields visibly overlap while holding.","Recovery shortens to 0.50s. The soldier rolls the shield edge into the blow, then resets.","A retreat order protects an allied squad crossing the line for 3s; 20s cooldown. Soldiers reverse-step in formation.","Retreat protection lasts 4s. The rear rank pivots before the front withdraws.","Retreat protection lasts 5s. An absorbed charge produces a visible shield-draw preparation for the final promotion.","After absorbing a charge, perform one coordinated step-and-bash counterpush; 25s cooldown. Cannot trigger itself."],
    "costs":[80,110,150,210,280,370,490,640,840],
    "deeds":["Recruit the militia","Supply the leatherworker","Recover the armorer's tools","Train at the restored yard","Swear the Reed Ford oath","Restore the steelworks","Rescue the veteran captain","Secure the western road","Recover the Dawn Standard","Complete the Sentinel oath"]
  },
  "tower": {
    "title":"Archer tower", "asset":"archer-tower-ten-v4.png",
    "names":["Watchpost","Crossbraced","Ironwatch","High Platform","Stonewatch","Covered Gallery","Buttressed Watch","Ward Turret","Dawn Bastion","Dawnwatch"],
    "appearance":["Bare scaffold · rope ladder · one bow station","Wood rails · diagonal braces · raised deck","Iron bands · stone feet · gabled roof","High stone footing · exterior stairs","Masonry shaft · battlements","Covered gallery · timber shutters","Flared buttresses · twin firing balconies","Octagonal armored gallery · side lookout","Expanded lower bastion · paired pennants","Fortified base · three bow windows · grand sun crest"],
    "hp":[350,390,445,510,590,680,785,905,1040,1190],
    "damage":[12,13,15,16,19,21,24,26,29,33],
    "third":[22,23,24,25,26,27,28,29,30,32], "thirdLabel":"Range", "interval":1.4,
    "abilities":["Watchfire","Steady platform","Protected draw","High watch","Firing doctrine","Sheltered reload","Track the approach","Suppress or mark","Volley preparation","Coordinated volley"],
    "effects":["One real arrow per 1.4s. The bow bends, releases and is visibly nocked again.","Crossbracing reduces visible deck sway; the firing cadence stays 1.4s.","The archer draws behind the new roof's cover and leans into the firing opening.","The higher firing position uses a distinct downward aim pose for close targets.","Choose Longwatch (+20% range, 20% slower firing rate) or Suppression (-15% range, 25% faster firing rate). Changes aim/reload choreography.","The archer crouches behind a shutter to nock, then rises into the next shot. Same listed cadence.","The crew hands off tracking between balconies; extra crew do not multiply listed damage.","Longwatch's hit marks its target for 2s; Suppression's hit slows 15% for 0.7s. These effects do not stack with themselves.","Crew coordinate their draw and target call. Rank VIII effects last 3s / 1s respectively.","Every 18s, three crew release a 3-arrow volley at one marked target, each arrow dealing 50% listed damage (150% total), replacing one ordinary shot."],
    "costs":[100,140,190,260,350,460,610,800,1050],
    "deeds":["Build the watchpost","Reopen the timber yard","Recover iron fittings","Repair the rampart stairs","Rescue the quarry workers","Reopen the bowyers' guild","Clear the stone road","Train the signal crew","Recover the bastion plans","Restore the Dawnwatch charter"]
  },
  "ballista": {
    "title":"Ballista", "asset":"ballista-ten-v4.png",
    "names":["Field Engine","Broadfoot","Ironbow","Ratchet Engine","Steelbow","Shielded Engine","Torsion Engine","Siegebreaker","Dawn Battery","Sunlance"],
    "appearance":["Wood bow · tripod · rope winding","Splayed legs · iron feet · reinforced stock","Iron limb bands · hand crank","Ratchet winch · stone plinth","Steel limbs · armored swivel","Crew shield · bolt rack","Twin torsion drums · loading lever","Counterweights · geared turntable","Two crew · low fortification · sun banners","Fortified platform · gold plates · solid burning broadhead"],
    "hp":[280,312,350,395,450,515,590,680,785,910],
    "damage":[70,77,85,95,107,120,136,154,175,200],
    "third":[28,29,30,31,32,33,34,35,36,38], "thirdLabel":"Range", "interval":4,
    "abilities":["Heavy bolt","Plant the engine","Geared draw","Ratchet lock","Bolt doctrine","Protected loader","Torsion release","Traverse mechanism","Charge rehearsal","Sunlance charge"],
    "effects":["One large physical bolt every 4s, with shaft, metal head and fletching. Heavy mechanical recoil.","Wider feet visibly settle after recoil. The machine stays planted.","Crew use a crank to draw the string; draw and release remain part of a 4s cycle.","The ratchet locks tooth by tooth, then snaps open on firing. No decorative extra projectile.","Piercing hits a second target for 50% damage. Pinning sacrifices 15% damage to slow the target 35% for 2s.","Loader feeds a bolt from the visible rack behind the shield, then clears the stock before release.","Two torsion drums unwind in opposite directions; the loaded limbs flex before the shot.","Traverse speed improves from 25 to 35 degrees/s. The gear train turns with the aim.","Traverse reaches 40 degrees/s. Crew lock counterweights and check the Sunlance mechanism before firing.","Every 22s a 0.65s visible winding charge replaces a normal shot: 180% listed damage against siege targets, 120% otherwise. A solid bolt carries flame; it is never a laser."],
    "costs":[120,165,220,300,400,530,700,920,1200],
    "deeds":["Recover a siege blueprint","Reopen the timber yard","Recover the crank plans","Repair the workshop","Rescue the siege engineer","Recover the armored cradle","Restore the torsion workshop","Recover the traverse gear","Cleanse the old battery","Light the Sunlance forge"]
  }
}
;
