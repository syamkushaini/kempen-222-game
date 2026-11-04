import type { ReactNode } from 'react';
import type { ActionId } from '../../sim/campaign/types';
import { Hall, Rally, Walk, type SceneProps } from './groundScenes';
import { Attack, Billboards, Build, Money, Social, Studio } from './mediaScenes';

/** The light a scene is played in, which sets the sky behind it. */
export type Mood = 'day' | 'dusk' | 'night' | 'indoor' | 'studio';

interface SceneDef { mood: Mood; render(p: SceneProps): ReactNode }

/** What plays on the map for each thing a player can do: a few seconds of the leader doing it. */
export const SCENES: Record<ActionId, SceneDef> = {
  ceramah: { mood: 'dusk', render: (p) => <Rally {...p} kind="ceramah" /> },
  megarally: { mood: 'day', render: (p) => <Rally {...p} kind="megarally" /> },
  festival: { mood: 'dusk', render: (p) => <Rally {...p} kind="festival" /> },
  youth: { mood: 'night', render: (p) => <Rally {...p} kind="youth" /> },
  local: { mood: 'day', render: (p) => <Rally {...p} kind="local" /> },
  charity: { mood: 'day', render: (p) => <Rally {...p} kind="charity" /> },
  walkabout: { mood: 'day', render: (p) => <Walk {...p} kind="walkabout" /> },
  canvass: { mood: 'day', render: (p) => <Walk {...p} kind="canvass" /> },
  blitz: { mood: 'day', render: (p) => <Walk {...p} kind="blitz" /> },
  townhall: { mood: 'indoor', render: (p) => <Hall {...p} kind="townhall" /> },
  conference: { mood: 'indoor', render: (p) => <Hall {...p} kind="conference" /> },
  tv: { mood: 'studio', render: (p) => <Studio {...p} kind="tv" /> },
  radio: { mood: 'studio', render: (p) => <Studio {...p} kind="radio" /> },
  debate: { mood: 'studio', render: (p) => <Studio {...p} kind="debate" /> },
  manifesto: { mood: 'studio', render: (p) => <Studio {...p} kind="manifesto" /> },
  social: { mood: 'indoor', render: (p) => <Social {...p} kind="social" /> },
  troops: { mood: 'night', render: (p) => <Social {...p} kind="troops" /> },
  billboards: { mood: 'day', render: (p) => <Billboards {...p} /> },
  dinner: { mood: 'indoor', render: (p) => <Money {...p} kind="dinner" /> },
  crowdfund: { mood: 'indoor', render: (p) => <Money {...p} kind="crowdfund" /> },
  tycoon: { mood: 'night', render: (p) => <Money {...p} kind="tycoon" /> },
  build: { mood: 'day', render: (p) => <Build {...p} kind="build" /> },
  gotv: { mood: 'day', render: (p) => <Build {...p} kind="gotv" /> },
  attack: { mood: 'night', render: (p) => <Attack {...p} /> },
};
