import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ICON_NAMES, Icon } from './Icon';

describe('the icons', () => {
  it('has all 45 the interface uses, each drawing an svg of the size asked for', () => {
    expect(ICON_NAMES).toHaveLength(45);
    for (const name of ICON_NAMES) {
      const html = renderToStaticMarkup(createElement(Icon, { name, size: 20 }));
      expect(html, name).toMatch(/^<svg[^>]*width="20"[^>]*height="20"/);
      expect(html, name).toContain('<path');
      expect(html, name).toContain('aria-hidden="true"');
    }
  });
});
