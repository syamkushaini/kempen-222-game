import { useT } from './hooks';

const LINKS = {
  dosm: 'https://github.com/dosm-malaysia/data-open',
  tindak: 'https://github.com/TindakMalaysia/GE15-Dataset-ARCHIVED-',
  ccby: 'https://creativecommons.org/licenses/by/4.0/',
};

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
      </ul>
      <p>{t('credits.changes')}</p>
    </details>
  );
}
