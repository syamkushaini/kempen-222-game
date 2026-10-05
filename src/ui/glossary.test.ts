import { describe, expect, it } from 'vitest';
import { translate } from '../i18n/strings';
import { findTerms, GLOSSARY, type TermId } from './glossary';

const joined = (text: string, lang: 'en' | 'ms') => findTerms(text, lang).map((p) => p.text).join('');
const termsIn = (text: string, lang: 'en' | 'ms') => findTerms(text, lang).filter((p) => p.term).map((p) => p.term);

describe('the glossary', () => {
  it('finds a term in a sentence and keeps every word of the text', () => {
    const text = 'Good. Now try a ceramah: it costs a day. The machinery matters too.';
    expect(termsIn(text, 'en')).toEqual(['ceramah', 'machinery']);
    expect(joined(text, 'en')).toBe(text);
  });

  it('marks a term only where it first appears', () => {
    expect(termsIn('Ceramah here, ceramah there, ceramah everywhere.', 'en')).toEqual(['ceramah']);
  });

  it('works in Bahasa Malaysia and leaves other words alone', () => {
    const text = 'Sekarang gerakkan jentera dan ucapan ceramah.';
    expect(termsIn(text, 'ms')).toEqual(['machinery', 'ceramah']);
    expect(joined(text, 'ms')).toBe(text);
    expect(termsIn('Tuan menyelenggara perkara itu.', 'ms')).toEqual([]);
    expect(termsIn('A plain sentence.', 'en')).toEqual([]);
  });

  it('does not mark part of a longer word', () => {
    expect(termsIn('machineryless and unmachinery', 'en')).toEqual([]);
  });

  it('explains every term in both languages', () => {
    for (const id of Object.keys(GLOSSARY) as TermId[]) {
      for (const lang of ['en', 'ms'] as const) expect(translate(lang, GLOSSARY[id].text).length).toBeGreaterThan(20);
    }
  });
});
