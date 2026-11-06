import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Campaign } from '../sim/campaign/types';
import { shownWeek } from '../sim/campaign/news';
import { partyColor, partyShort, useFormat, useT } from './hooks';

/** Whether two colours are close enough to be mistaken for each other on a chart (a rough distance in RGB). */
const alike = (a: string, b: string): boolean => {
  const rgb = (h: string) => { const m = /^#?([0-9a-f]{6})$/i.exec(h.trim()); if (!m) return null; const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const x = rgb(a), y = rgb(b);
  return !!x && !!y && Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < 90;
};

/** How many parties the chart follows: the player's and the strongest others, so the lines stay readable. */
const PARTIES_SHOWN = 4;

/**
 * The race poll by poll, as lines: every party the player is up against, week by week. Drawn with Recharts, in the game's colours.
 * The list of figures below it in the panel says the same in words, so the chart is a picture, not the only way to read the polls.
 */
export default function PollTrend({ campaign }: { campaign: Campaign }) {
  const t = useT();
  const f = useFormat();
  const polls = campaign.polls.filter((p) => p.scope === 'national' && p.national);
  if (polls.length < 2) return null;
  const last = polls[polls.length - 1].national!;
  const me = campaign.player;
  const others = last.map((s, p) => ({ s, p })).filter((x) => x.p !== me && x.s > 0.01).sort((a, b) => b.s - a.s).slice(0, PARTIES_SHOWN - 1).map((x) => x.p);
  const shown = [me, ...others];
  const key = (p: number) => `p${p}`;
  const rows = polls.map((p) => ({ week: t('trend.week', { n: shownWeek(campaign, p.week).week }), ...Object.fromEntries(shown.map((q) => [key(q), Math.round((p.national![q] ?? 0) * 1000) / 10])) }));
  const summary = shown.map((q) => `${partyShort(t, q)} ${f.pct(last[q] ?? 0, 0)}`).join(', ');
  return (
    <figure className="poll-trend mt-3 mb-1" aria-label={t('trend.title')}>
      <figcaption className="text-xs text-muted mb-1">{t('trend.title')} <span className="sr-only">{summary}</span></figcaption>
      <div className="h-44 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--line-2)' }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} unit="%" width={40} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line-2)', borderRadius: 8, color: 'var(--ink)', fontSize: 12 }}
              labelStyle={{ color: 'var(--muted)' }} formatter={(v: number, name: string) => [`${v}%`, name]}
            />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 11, color: 'var(--muted)' }} />
            {shown.map((q) => (
              // A rival in the player's own colour is drawn dashed, so the two lines can be told apart.
              <Line key={q} type="monotone" dataKey={key(q)} name={q === me ? t('trend.you', { party: partyShort(t, q) }) : partyShort(t, q)} stroke={partyColor(q)} strokeWidth={q === me ? 3 : 1.6}
                strokeDasharray={q !== me && alike(partyColor(q), partyColor(me)) ? '5 4' : undefined}
                dot={q === me ? { r: 2.5 } : false} activeDot={{ r: 4 }} isAnimationActive={!matchMedia('(prefers-reduced-motion: reduce)').matches} animationDuration={500} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
