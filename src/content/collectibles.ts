// Centres in room-local logical pixels. Positions are authored; only identities vary.
export const snackVarieties = ['apple', 'cookie', 'bread', 'crisps', 'banana', 'cheese', 'pretzel', 'doughnut', 'chocolate', 'flapjack'] as const;
export const bonusVarieties = ['chutney'] as const;
export type Variety = typeof snackVarieties[number] | typeof bonusVarieties[number];
export const snackNames: Record<Variety, string> = {
  apple: 'Apple', cookie: 'Cookie', bread: 'Bread roll', crisps: 'Crisp packet', banana: 'Banana',
  cheese: 'Cheese wedge', pretzel: 'Pretzel', doughnut: 'Doughnut', chocolate: 'Chocolate bar',
  flapjack: 'Flapjack', chutney: 'Kilner jar of chilli chutney',
};
export interface Placement { x: number; y: number; kind: 'snack' | 'bonus' }
const snacks = (points: number[][]): Placement[] => points.map(([x,y]) => ({x,y,kind:'snack'}));
export const placements: Record<string, Placement[]> = {
  'ember-vault': [...snacks([[180,294],[320,262],[440,294],[650,294],[940,294],[1072,262],[1330,294]]), {x:1176,y:230,kind:'bonus'}],
  'hollow-grotto': [...snacks([[160,294],[310,294],[490,294],[562,262],[660,230],[936,230],[1040,294],[1300,294]]), {x:808,y:198,kind:'bonus'}],
  'jungle-run': [...snacks([[180,294],[450,294],[650,294],[660,542],[400,542],[275,542],[380,882],[470,902],[760,902],[855,902],[968,774],[1048,654],[968,534]]), {x:1050,y:474,kind:'bonus'}],
};

// Each step specifies a safe take-off centre and the next landing centre/top.
// These are ordinary movement/jump decisions, never teleports or physics changes.
export interface BonusStep { takeoff: number; x: number; feet: number }
export const bonusRoutes: Record<string, { start: number; floor: number; steps: BonusStep[] }> = {
  'ember-vault': {start:990,floor:312,steps:[{takeoff:1010,x:1072,feet:280},{takeoff:1072,x:1176,feet:248}]},
  'hollow-grotto': {start:490,floor:312,steps:[{takeoff:510,x:562,feet:280},{takeoff:562,x:660,feet:248},{takeoff:700,x:808,feet:216}]},
  'jungle-run': {start:830,floor:920,steps:[{takeoff:901,x:1030,feet:852},
    {takeoff:1030,x:968,feet:792},{takeoff:968,x:1044,feet:732},
    {takeoff:1044,x:968,feet:672},{takeoff:968,x:1044,feet:612},
    {takeoff:1044,x:968,feet:552},{takeoff:968,x:1050,feet:492}]},
};
