import type { Career, Dial } from './types';

// The numbers behind the debt plan, the tax mix and the national projects (see econPlans.ts).

export const MAX_PROJECTS_AT_ONCE = 3;

export const TAX_IDS = ['sales', 'income', 'corporate', 'luxury'] as const;
export type TaxId = (typeof TAX_IDS)[number];

/** What a notch up of each tax does: its share of the takings, the drift it gives prices and growth, and who feels it each week (and how much). */
export const TAX_MIX: Record<TaxId, { takings: number; prices: number; growth: number; blocs: string[]; feel: number }> = {
  sales:     { takings: 0.06, prices: 0.25, growth: -0.02, blocs: ['urban_b40', 'heartland', 'gig', 'felda'], feel: 0.0004 },
  income:    { takings: 0.06, prices: 0, growth: -0.1, blocs: ['m40', 'civil', 'urban_lib'], feel: 0.0004 },
  corporate: { takings: 0.05, prices: 0.05, growth: -0.15, blocs: ['smallbiz'], feel: 0.0005 },
  luxury:    { takings: 0.02, prices: 0, growth: 0, blocs: ['smallbiz'], feel: 0.0001 },
};

export interface Project {
  id: string;
  /** Weeks it takes to build. */
  weeks: number;
  /** What it costs a week, as a share of the head of government's allocation. */
  cost: number;
  /** What a finished one does for good: to the drift of prices (negative is lower) and growth, to the takings (a share), and the standing commitments it takes off. */
  prices?: number; growth?: number; takings?: number; commitments?: number;
}

export const PROJECTS: Project[] = [
  { id: 'foodSecurity', weeks: 52, cost: 0.1, prices: -0.3 },
  { id: 'localProduction', weeks: 78, cost: 0.12, growth: 0.3, prices: -0.1 },
  { id: 'energyGrid', weeks: 78, cost: 0.15, prices: -0.2, growth: 0.1 },
  { id: 'railPorts', weeks: 104, cost: 0.22, growth: 0.4 },
  { id: 'digitalGov', weeks: 52, cost: 0.1, commitments: 1.5 },
  { id: 'taxCollection', weeks: 39, cost: 0.08, takings: 0.04 },
];
export const projectOf = (id: string): Project | undefined => PROJECTS.find((p) => p.id === id);

export const taxMixOf = (k: Career): Record<TaxId, Dial> => ({ sales: 0, income: 0, corporate: 0, luxury: 0, ...(k.taxMix ?? {}) });

/** What the tax mix does to the takings, to prices and to growth, per week: the sum of each tax's dial. */
export function taxEffects(k: Career): { takings: number; prices: number; growth: number } {
  const mix = taxMixOf(k);
  return TAX_IDS.reduce((a, id) => ({
    takings: a.takings + TAX_MIX[id].takings * mix[id], prices: a.prices + TAX_MIX[id].prices * mix[id], growth: a.growth + TAX_MIX[id].growth * mix[id],
  }), { takings: 0, prices: 0, growth: 0 });
}

/** What the projects that have been finished do for good: to prices, growth and the takings. */
export function builtEffects(k: Career): { takings: number; prices: number; growth: number } {
  return (k.built ?? []).reduce((a, id) => {
    const p = projectOf(id);
    return p ? { takings: a.takings + (p.takings ?? 0), prices: a.prices + (p.prices ?? 0), growth: a.growth + (p.growth ?? 0) } : a;
  }, { takings: 0, prices: 0, growth: 0 });
}

/** The money the projects under way cost a week, as shares of the head of government's allocation. */
export const projectsCost = (k: Career): number => (k.projects ?? []).reduce((a, p) => a + (projectOf(p.id)?.cost ?? 0), 0);

