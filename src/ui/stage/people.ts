import { sharedShapes } from './shapes';

// The shapes of the cartoon people, modelled in Blender for Kempen 222 (public/models/crowd-person.glb): a whole body for the crowd, and a
// torso, a leg, an arm and a head for the figures whose limbs move. Each part is painted in greys (shirt white, trousers and shoes dark, hair
// near black) that multiply the colour given in code, so one model serves every shirt and every skin. The file is 48 KB and is fetched once;
// until it arrives, or if it cannot be fetched, the people are drawn from capsules and spheres as before.

const people = sharedShapes('crowd-person.glb', { crowd: 'CrowdBody', torso: 'Torso', leg: 'Leg', arm: 'Arm', head: 'Head' });
export const PEOPLE_URL = people.url;
export const loadPeople = people.load;
export const usePeople = people.use;

// The small pieces that fly about the scenes (public/models/trinkets.glb, 71 KB): a coin with a struck star, a heart, a comic speech
// balloon with its tail, a pennant of bunting with a hem, and the tycoon's top hat with its red band. Painted the same way.
const trinkets = sharedShapes('trinkets.glb', { coin: 'Coin', heart: 'Heart', bubble: 'Bubble', pennant: 'Pennant', hat: 'TopHat' });
export const loadTrinkets = trinkets.load;
export const useTrinkets = trinkets.use;
