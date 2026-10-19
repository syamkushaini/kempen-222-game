import { useT } from './hooks';

/** Search input for filtering lists. Emits the current value on change. */
export function SearchBar({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) {
  const t = useT();
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder={placeholder || t('search.placeholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder || t('search.placeholder')}
      />
    </div>
  );
}
