/** The part of the browser's storage manager that is used, so that it can be tried without a browser. */
export interface StorageManagerLike {
  persisted?(): Promise<boolean>;
  persist?(): Promise<boolean>;
}

let asked = false;

/**
 * Asks the browser to keep the game's saves for good. Without it a browser may clear a site's storage when the device runs short of
 * room, and Safari clears it after a week of not being used: a player's saves would then go with it. Asked once per page, never
 * throws, and says whether the saves are now safe (false when the browser does not say, or says no).
 */
export async function keepSaves(manager: StorageManagerLike | undefined = typeof navigator === 'undefined' ? undefined : navigator.storage): Promise<boolean> {
  if (asked || !manager?.persist) return false;
  asked = true;
  try {
    if (await manager.persisted?.()) return true;
    return await manager.persist();
  } catch { return false; }
}

/** For tests: forget that it was asked. */
export const forgetAsked = (): void => { asked = false; };
