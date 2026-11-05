import { useId, useState } from 'react';

/** A labelled input with inline validation error text. */
export function FormField({ label, value, onChange, error, type = 'text', placeholder }: {
  label: string; value: string; onChange: (value: string) => void; error?: string; type?: string; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const hasError = error && error.length > 0;
  return (
    <div className="form-field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`field-input${hasError || focused ? ' focused' : ''}${hasError ? ' error' : ''}`}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
      {hasError && <span className="error-text" id={`${id}-error`}>{error}</span>}
    </div>
  );
}
