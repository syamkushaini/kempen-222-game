import type { StringKey } from '../i18n/strings';
import type { Lang } from '../i18n/strings';

/** The words that need explaining to someone new, and what each is called in each language. */
export type TermId = 'ceramah' | 'machinery' | 'hung' | 'moe' | 'unity' | 'credibility';

export const GLOSSARY: Record<TermId, { words: Record<Lang, string[]>; text: StringKey }> = {
  ceramah: { words: { en: ['ceramah'], ms: ['ceramah'] }, text: 'gloss.ceramah' },
  machinery: { words: { en: ['machinery'], ms: ['jentera'] }, text: 'gloss.machinery' },
  hung: { words: { en: ['hung parliament'], ms: ['parlimen tergantung'] }, text: 'gloss.hung' },
  moe: { words: { en: ['margin of error'], ms: ['ralat'] }, text: 'gloss.moe' },
  // Too common as plain words to find inside running text; they are marked up by hand where they label something.
  unity: { words: { en: [], ms: [] }, text: 'gloss.unity' },
  credibility: { words: { en: [], ms: [] }, text: 'gloss.credibility' },
};

export interface Piece { text: string; term?: TermId }

/**
 * Splits a sentence into plain pieces and the terms it contains. Each term is
 * marked once, where it first appears: a tooltip on every mention would be noise.
 */
export function findTerms(text: string, lang: Lang): Piece[] {
  const found: { at: number; word: string; term: TermId }[] = [];
  for (const [term, entry] of Object.entries(GLOSSARY) as [TermId, (typeof GLOSSARY)[TermId]][]) {
    for (const word of entry.words[lang]) {
      const hit = new RegExp(`(?<![\\p{L}])${word}(?![\\p{L}])`, 'iu').exec(text);
      if (hit && !found.some((f) => f.term === term)) found.push({ at: hit.index, word: hit[0], term });
    }
  }
  found.sort((a, b) => a.at - b.at);
  const out: Piece[] = [];
  let from = 0;
  for (const f of found) {
    if (f.at < from) continue;
    if (f.at > from) out.push({ text: text.slice(from, f.at) });
    out.push({ text: f.word, term: f.term });
    from = f.at + f.word.length;
  }
  if (from < text.length) out.push({ text: text.slice(from) });
  return out.length ? out : [{ text }];
}
