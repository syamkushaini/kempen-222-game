import dunJohor from './generated/dun-johor.json';
import dunKedah from './generated/dun-kedah.json';
import dunKelantan from './generated/dun-kelantan.json';
import dunMelaka from './generated/dun-melaka.json';
import dunNsembilan from './generated/dun-nsembilan.json';
import dunPahang from './generated/dun-pahang.json';
import dunPenang from './generated/dun-penang.json';
import dunPerak from './generated/dun-perak.json';
import dunPerlis from './generated/dun-perlis.json';
import dunSabah from './generated/dun-sabah.json';
import dunSarawak from './generated/dun-sarawak.json';
import dunSelangor from './generated/dun-selangor.json';
import dunTerengganu from './generated/dun-terengganu.json';
import type { SeatFile } from '../sim/election';
import { registerState } from './world';

// Every state's results at once, for the tests (see `setupFiles` in vite.config.ts). The game itself never imports
// this file: it fetches a state when the state is first wanted, so that the page starts small.
registerState('perlis', dunPerlis as SeatFile);
registerState('kedah', dunKedah as SeatFile);
registerState('penang', dunPenang as SeatFile);
registerState('perak', dunPerak as SeatFile);
registerState('kelantan', dunKelantan as SeatFile);
registerState('terengganu', dunTerengganu as SeatFile);
registerState('pahang', dunPahang as SeatFile);
registerState('selangor', dunSelangor as SeatFile);
registerState('nsembilan', dunNsembilan as SeatFile);
registerState('melaka', dunMelaka as SeatFile);
registerState('johor', dunJohor as SeatFile);
registerState('sabah', dunSabah as SeatFile);
registerState('sarawak', dunSarawak as SeatFile);
