import { useT } from './hooks';

const LINKS = {
  dosm: 'https://github.com/dosm-malaysia/data-open',
  tindak: 'https://github.com/TindakMalaysia/GE15-Dataset-ARCHIVED-',
  tindak2: 'https://github.com/TindakMalaysia/HISTORICAL-ELECTION-RESULTS',
  ccby: 'https://creativecommons.org/licenses/by/4.0/',
  model: 'https://sketchfab.com/3d-models/indian-man-in-suit-985dd9756d89464b9380414b5b12d8aa',
  author: 'https://sketchfab.com/ar.jethin',
};

/** The other modelled people on the stage: the model's name, who made it, where it is, and where its author is. */
const PEOPLE = [
  { name: 'Woman Suit (1)', by: 'arishag', model: 'https://sketchfab.com/3d-models/woman-suit-1-259b1249723c464e840c981dd0c81698', author: 'https://sketchfab.com/arishag' },
  { name: 'male character #3', by: 'BELAZ', model: 'https://sketchfab.com/3d-models/male-character-3-da7723ef494e4627869bba6f4d65577f', author: 'https://sketchfab.com/asset_for_games' },
  { name: 'Blue man baju malayu', by: 'Halim3D', model: 'https://sketchfab.com/3d-models/blue-man-baju-malayu-b15a381388ba47b6aed6ebbf6ae9c2f8', author: 'https://sketchfab.com/Halim3D' },
  { name: 'Hijab muslim woman', by: 'Yasser.Hamedah', model: 'https://sketchfab.com/3d-models/hijab-muslim-woman-6f4d486e45464220beeda01fb6e495a5', author: 'https://sketchfab.com/Yasser.Hamedah' },
];

const Out = ({ href, children }: { href: string; children: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
);

/** Who the characters are not, where the real data came from, and what was done to it. */
export function Credits() {
  const t = useT();
  return (
    <details className="credits">
      <summary>{t('credits.title')}</summary>
      <p>{t('credits.fiction')}</p>
      <p>{t('credits.data')}</p>
      <ul>
        <li>{t('credits.dosm')} <Out href={LINKS.dosm}>{t('credits.link.dosm')}</Out></li>
        <li>{t('credits.tindak')} <Out href={LINKS.tindak}>{t('credits.link.tindak')}</Out> · <Out href={LINKS.ccby}>CC BY 4.0</Out></li>
        <li>{t('credits.tindak2')} <Out href={LINKS.tindak2}>{t('credits.link.tindak2')}</Out> · <Out href={LINKS.ccby}>CC BY 4.0</Out></li>
      </ul>
      <p>{t('credits.changes')}</p>
      <p>{t('credits.model')} <Out href={LINKS.model}>{t('credits.link.model')}</Out> · <Out href={LINKS.author}>Pixel_Monster</Out> · <Out href={LINKS.ccby}>CC BY 4.0</Out></p>
      <p>{t('credits.people')}</p>
      <ul>
        {PEOPLE.map((m) => <li key={m.name}>“{m.name}” · <Out href={m.model}>{t('credits.link.model')}</Out> · <Out href={m.author}>{m.by}</Out> · <Out href={LINKS.ccby}>CC BY 4.0</Out></li>)}
      </ul>
      <p>{t('credits.analytics')}</p>
    </details>
  );
}
