import type { Effect } from './events';

// The decisions of government that had a price or a consequence for the country the choice did not show: money from the treasury, growth,
// prices, the budget's commitments, and the state of the nation (health, education, standing abroad). Added to what each choice already did,
// by event and then by the choice's number, so that the figures a choice lists are all that it does. Money is at general-election scale.

const nat = (health = 0, education = 0, standing = 0): Effect => ({ t: 'nation', health, education, standing });
const econ = (growth: number, inflation = 0): Effect => ({ t: 'economy', growth, inflation });
const pub = (n: number): Effect => ({ t: 'public', n });
const fiscal = (n: number): Effect => ({ t: 'fiscal', n });

export const GOVERN_EFFECTS: Record<string, Record<number, Effect[]>> = {
  fundGov: { 0: [pub(-15_000), nat(0, 0, 2)], 1: [nat(0, 0, -3), econ(-0.1)] },
  fundGovEnd: { 0: [pub(40_000), nat(0, 0, 3)] },
  newsroomRaid: { 0: [nat(0, 0, -3)], 1: [nat(0, 0, 2)] },
  filmBan: { 0: [nat(0, 0, -2)], 1: [nat(0, 0, 2)] },
  boundaries: { 0: [nat(0, 0, -3)], 1: [nat(0, 0, 2)] },
  auditReport: { 0: [pub(25_000), nat(0, 0, 2)], 1: [nat(0, 0, -2)] },
  custodyDeath: { 0: [nat(0, 0, 3)], 1: [nat(0, 0, -3)] },
  stateDefiance: { 0: [econ(-0.1), nat(0, 0, -1)], 2: [pub(-30_000)] },
  examLeak: { 0: [pub(-25_000), nat(0, 3, 0)], 1: [nat(0, -3, 0)] },
  ministerScandal: { 0: [nat(0, 0, 1)], 2: [nat(0, 0, 1)] },
  claimsTalks: { 0: [pub(-50_000), econ(0.1)], 2: [nat(0, 0, -1)] },
  riverCourt: { 0: [econ(-0.1)], 1: [econ(0.1)] },
  fakeNewsLaw: { 0: [nat(0, 0, -3)], 1: [nat(0, 0, 1)] },
  judicialPanel: { 0: [nat(0, 0, 3)], 2: [nat(0, 0, -2)] },
  mpAllowance: { 0: [pub(-20_000), fiscal(1)], 1: [pub(10_000)] },
  juniorCredit: { 0: [pub(-30_000), fiscal(1)] },
  budgetAsk: { 0: [fiscal(1)], 1: [fiscal(-0.5)] },
  budgetShare: { 0: [fiscal(0.5)], 1: [fiscal(-0.5)] },
};
