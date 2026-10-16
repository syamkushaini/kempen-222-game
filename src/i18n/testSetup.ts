import { loadEventText } from './strings';

// In the game the words of the events are fetched after the first screen; the tests have them from the start.
await loadEventText();
