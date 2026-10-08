import { EVENTS_EN } from '../../i18n/events';
import { EVENTS } from '../../sim/campaign/events';
import { KIND_SCENES, trimmed } from './prompts';

/** Every decision with its title and what it says, as the script that has an image model draw them puts them to it. */
export function allScenes(): Record<string, { title: string; body: string }> {
  const out: Record<string, { title: string; body: string }> = {};
  for (const id of Object.keys(EVENTS)) out[id] = { title: EVENTS_EN[id].title, body: trimmed(EVENTS_EN[id].body) };
  for (const [kind, s] of Object.entries(KIND_SCENES)) out[`kind-${kind}`] = { title: s.title, body: trimmed(s.body) };
  return out;
}
