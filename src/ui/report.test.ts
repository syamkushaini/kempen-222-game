import { describe, expect, it } from 'vitest';
import { feedbackUrl, REPO } from './report';

const read = (url: string) => new URL(url).searchParams;

describe('the feedback link', () => {
  it('opens a new issue in the game repository with the facts filled in', () => {
    const url = feedbackUrl({ version: '0.1.0+abc123', lang: 'ms', scenario: 'state:perak', week: 3, width: 375 });
    expect(url.startsWith(`${REPO}/issues/new?`)).toBe(true);
    const body = read(url).get('body')!;
    for (const fact of ['Version: 0.1.0+abc123', 'Language: ms', 'Contest: state:perak, week 3', 'Screen width: 375px']) expect(body).toContain(fact);
    expect(read(url).get('title')).toBe('Feedback: ');
  });

  it('leaves out what is not known on the title screen, and holds nothing personal', () => {
    const body = read(feedbackUrl({ version: '1', lang: 'en', scenario: null, week: null, width: null })).get('body')!;
    expect(body).not.toContain('Contest');
    expect(body).not.toContain('Screen width');
    expect(body).toContain('Version: 1');
  });
});
