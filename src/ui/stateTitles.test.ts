import { describe, expect, it } from 'vitest';
import { translate } from '../i18n/strings';

describe('the head of a state and its cabinet, by state', () => {
  it('names the head of government as the state does', () => {
    expect(translate('en', 'form.head.state', undefined, true, 'selangor')).toBe('Menteri Besar');
    expect(translate('en', 'form.head.state', undefined, true, 'penang')).toBe('Chief Minister');
    expect(translate('ms', 'form.head.state', undefined, true, 'sabah')).toBe('Ketua Menteri');
    expect(translate('ms', 'form.head.state', undefined, true, 'sarawak')).toBe('Premier');
  });

  it('turns the Prime Minister of a country text into the right office for the state', () => {
    expect(translate('en', 'legacy.premier', undefined, true, 'sarawak')).toBeTruthy();
    expect(translate('en', 'form.head.general', undefined, true, 'sarawak')).toBe('Premier');
    expect(translate('en', 'form.head.general', undefined, true, 'kedah')).toBe('Menteri Besar');
    expect(translate('ms', 'form.head.general', undefined, true, 'melaka')).toBe('Ketua Menteri');
    expect(translate('en', 'form.head.general')).toBe('Prime Minister');
  });

  it('calls the cabinet an EXCO, or a State Cabinet in Sabah and Sarawak, and leaves a national game alone', () => {
    expect(translate('en', 'form.posts', undefined, true, 'johor')).toBe('EXCO posts');
    expect(translate('ms', 'form.posts', undefined, true, 'johor')).toBe('Jawatan EXCO');
    expect(translate('en', 'form.posts', undefined, true, 'sarawak')).toBe('State Cabinet posts');
    expect(translate('ms', 'form.posts', undefined, true, 'sabah')).toBe('Jawatan Kabinet Negeri');
    expect(translate('en', 'form.posts')).toBe('Cabinet posts');
  });

  it('names the legacy titles for the state, not always the same office', () => {
    expect(translate('en', 'legacy.premier', undefined, true, 'sarawak')).toBe('The Premier');
    expect(translate('en', 'legacy.premier', undefined, true, 'johor')).toBe('The Menteri Besar');
    expect(translate('ms', 'legacy.nearly', undefined, true, 'sabah')).toBe('Hampir Ketua Menteri');
  });

  it('gives the portfolios a state has, not the country\'s', () => {
    expect(translate('en', 'portfolio.defence', undefined, true, 'perak')).toBe('Local Government and Housing');
    expect(translate('ms', 'portfolio.home', undefined, true, 'perak')).toBe('Tanah dan Sumber Asli');
    expect(translate('en', 'portfolio.defence')).toBe('Defence');
  });
});
