// What the player's alliance looks like on the map: its members share one colour and one name. The store hands it over whenever
// the game changes, so that everything that draws a party in colour follows without being told.

export interface AllianceLook { members: number[]; color: string; title: string | null; name: number }

let look: AllianceLook | null = null;
export const showAlliance = (next: AllianceLook | null): void => { look = next; };
export const shownAlliance = (): AllianceLook | null => look;
