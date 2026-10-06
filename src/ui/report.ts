/** Where feedback goes. Anyone with a GitHub account can open an issue there. */
export const REPO = 'https://github.com/syamkushaini/kempen-222-game';

export interface ReportInfo {
  version: string;
  lang: string;
  /** The contest being played, or null on the title screen. */
  scenario: string | null;
  week: number | null;
  /** Screen width in pixels, which tells a phone from a desktop. */
  width: number | null;
}

/**
 * A link that opens a new GitHub issue with the facts that help to find a
 * problem already filled in. Nothing is sent from the game: the player reads
 * the text and decides whether to submit. It holds no name, save or account.
 */
export function feedbackUrl(info: ReportInfo): string {
  const facts = [
    `Version: ${info.version}`,
    `Language: ${info.lang}`,
    info.scenario ? `Contest: ${info.scenario}${info.week !== null ? `, week ${info.week}` : ''}` : null,
    info.width !== null ? `Screen width: ${info.width}px` : null,
  ].filter(Boolean).join('\n');
  const body = `**What happened, or what would you change?**\n\n\n**What did you expect?**\n\n\n---\n${facts}\n`;
  return `${REPO}/issues/new?${new URLSearchParams({ title: 'Feedback: ', body })}`;
}

/**
 * A link that opens a new GitHub issue with the player's verdict on a finished game: a thumb, and the comment they
 * chose to write. As with `feedbackUrl`, nothing is sent from the game; the player reads it and decides.
 */
export function ratingUrl(info: ReportInfo, rating: 'up' | 'down', comment: string): string {
  const facts = [
    `Version: ${info.version}`,
    `Language: ${info.lang}`,
    info.scenario ? `Contest: ${info.scenario}` : null,
    info.width !== null ? `Screen width: ${info.width}px` : null,
  ].filter(Boolean).join('\n');
  const body = `**${rating === 'up' ? '👍 Enjoyed this game' : '👎 Did not enjoy this game'}**\n\n${comment.trim() || '_(no comment)_'}\n\n---\n${facts}\n`;
  return `${REPO}/issues/new?${new URLSearchParams({ title: `Rating: ${rating === 'up' ? '👍' : '👎'}`, body })}`;
}
