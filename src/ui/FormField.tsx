import { useState } from 'react';

/** A labelled input with inline validation error text. */
export function FormField({ label, value, onChange, error, type = 'text', placeholder }: {
  label: string; value: string; onChange: (value: string) => void; error?: string; type?: string; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const hasError = error && error.length > 0;
  return (
    <div className="form-field">
      <label className="field-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`field-input${hasError || focused ? ' focused' : ''}${hasError ? ' error' : ''}`}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError ? `error-${label}` : undefined}
      />
      {hasError && <span className="error-text" id={`error-${label}`}>{error}</span>}
    </div>
  );
}
