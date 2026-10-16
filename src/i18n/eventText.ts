import { EVENTS_EN, EVENTS_MS, flattenEvents } from './events';

// The words of every event, in both languages, as the flat keys the interface looks up. A module of its own so that it is a separate download:
// see loadEventText in strings.ts.
export const EVENT_TEXT_EN = flattenEvents(EVENTS_EN);
export const EVENT_TEXT_MS = flattenEvents(EVENTS_MS);
