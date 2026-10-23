// Where the game is being played, as far as it matters for keeping a save. The browser built into another app (a social network, a
// messenger) often keeps what a page stores only until the app clears it, so a game played there can lose its saves.

const IN_APP: [RegExp, string][] = [
  [/Barcelona/i, 'Threads'],
  [/Instagram/i, 'Instagram'],
  [/FBAN|FBAV|FB_IAB/i, 'Facebook'],
  [/Messenger/i, 'Messenger'],
  [/TikTok|musical_ly|Bytedance/i, 'TikTok'],
  [/\bLine\//i, 'LINE'],
  [/MicroMessenger/i, 'WeChat'],
  [/Snapchat/i, 'Snapchat'],
  [/;\s*wv\)/i, 'an app'],
];

/** The app whose built-in browser this is, or null for an ordinary browser. */
export function inAppBrowser(userAgent: string): string | null {
  for (const [pattern, name] of IN_APP) if (pattern.test(userAgent)) return name;
  return null;
}

export const currentInApp = (): string | null => (typeof navigator === 'undefined' ? null : inAppBrowser(navigator.userAgent));
