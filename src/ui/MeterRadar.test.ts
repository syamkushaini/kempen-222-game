import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getWorld } from '../data/world';
import { STRINGS, type StringKey } from '../i18n/strings';
import { PARTY_IDS } from '../sim/types';
import { startCareer } from '../sim/campaign/career';
import { playable } from '../sim/campaign/field';
import { setStance } from '../sim/campaign/stances';
import { MeterRadar, Sparkline } from './MeterRadar';

const world = getWorld('career')!;

describe('the radar and the forecast line', () => {
  it('draw a point for each meter, the shape now and in a year, and follow the sliders', () => {
    const c = startCareer(world, { player: PARTY_IDS.indexOf('ps'), difficulty: 'normal', seed: 5 });
    const html = renderToStaticMarkup(createElement(MeterRadar, { k: c.career!, scenario: c.scenario }));
    expect(html.match(/class="radar-point"/g)).toHaveLength(6);
    expect(html).toContain('radar-now');
    expect(html).toContain('radar-later');
    const before = html.match(/class="radar-later" points="([^"]+)"/)![1];
    setStance(c, 'environment', 2);
    const after = renderToStaticMarkup(createElement(MeterRadar, { k: c.career!, scenario: c.scenario })).match(/class="radar-later" points="([^"]+)"/)![1];
    expect(after).not.toBe(before);
    const spark = renderToStaticMarkup(createElement(Sparkline, { k: c.career!, id: 'environment', notch: 2 }));
    expect(spark).toContain('spark-here');
    expect(spark).toContain('spark-mid');
    expect(spark).not.toContain('NaN');
  });

  it('leave the armed forces off the radar of a state, and have words in both languages', () => {
    const w = getWorld('career:perak')!;
    const state = playable(w).map((player) => startCareer(w, { player, difficulty: 'normal', seed: 5 })).find((x) => x.career!.government.pm === x.player)!;
    const html = renderToStaticMarkup(createElement(MeterRadar, { k: state.career!, scenario: state.scenario }));
    expect(html.match(/class="radar-point"/g)).toHaveLength(4);
    expect(html).not.toContain('NaN');
    for (const lang of ['en', 'ms'] as const) {
      for (const key of ['radar.title', 'radar.desc', 'radar.now', 'radar.year', 'forecast.line', 'forecast.end', 'radar.cohesion', 'radar.tech', 'radar.environment', 'radar.law', 'radar.readiness', 'radar.influence']) {
        expect(STRINGS[lang][key as StringKey], `${lang} ${key}`).toBeTruthy();
      }
    }
  });
});
