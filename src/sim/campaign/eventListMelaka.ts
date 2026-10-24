import type { EventDef } from './events';

/** Ten things that happen to the head of the Melaka government, all within what a state can do: land, water, local councils, heritage, state roads, licences and its coalition. Invented places and people. */
export const MELAKA_STORIES: Record<string, EventDef> = {
  reliefCentreFloods: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [{"t": "funds", "n": -60000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["heartland"], "n": 0.03}, {"t": "mood", "blocs": ["m40"], "n": -0.01}]},
      {"effects": [{"t": "funds", "n": -25000}, {"t": "mood", "blocs": ["heartland"], "n": 0.02}, {"t": "mood", "blocs": ["seniors"], "n": 0.02}]},
      {"effects": [{"t": "cred", "n": -1}, {"t": "mood", "blocs": ["heartland"], "n": -0.03}]},
    ],
  },
  tankerAtTamanGate: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [{"t": "funds", "n": -50000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}]},
      {"effects": [{"t": "funds", "n": -20000}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.02}, {"t": "mood", "blocs": ["m40"], "n": 0.01}]},
      {"effects": [{"t": "cred", "n": -1}, {"t": "mood", "blocs": ["urban_b40"], "n": -0.04}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.01}]},
    ],
  },
  heritageFeeSpend: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [{"t": "funds", "n": -40000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.03}, {"t": "mood", "blocs": ["urban_b40"], "n": -0.01}]},
      {"effects": [{"t": "mood", "blocs": ["smallbiz"], "n": 0.03}, {"t": "mood", "blocs": ["m40"], "n": 0.01}]},
      {"effects": [{"t": "funds", "n": -25000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}, {"t": "mood", "blocs": ["urban_lib"], "n": -0.02}]},
    ],
  },
  riverCruiseMooring: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [{"t": "funds", "n": -10000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}]},
      {"effects": [{"t": "funds", "n": 12000}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.03}, {"t": "mood", "blocs": ["urban_lib"], "n": -0.02}]},
      {"effects": [{"t": "funds", "n": -30000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]},
    ],
  },
  nightMarketAmbulance: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [{"t": "funds", "n": -35000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["m40"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}]},
      {"effects": [{"t": "funds", "n": -12000}, {"t": "mood", "blocs": ["m40"], "n": 0.02}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.01}]},
      {"effects": [{"t": "cred", "n": -2}, {"t": "trust", "n": -2}, {"t": "mood", "blocs": ["m40"], "n": -0.03}]},
    ],
  },
  reclaimedIslandDeadline: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [{"t": "funds", "n": 30000}, {"t": "cred", "n": -1}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}, {"t": "mood", "blocs": ["urban_lib"], "n": -0.02}]},
      {"effects": [], "gamble": {"chance": "cred", "win": [{"t": "cred", "n": 2}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}], "lose": [{"t": "funds", "n": -40000}, {"t": "trust", "n": -2}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]}},
      {"effects": [{"t": "funds", "n": -20000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["heartland"], "n": 0.02}, {"t": "mood", "blocs": ["agri"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]},
    ],
  },
  emptyExcoChairs: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [], "gamble": {"chance": "cred", "win": [{"t": "unity", "n": 3}, {"t": "stability", "n": 1}], "lose": [{"t": "unity", "n": -2}, {"t": "cred", "n": -1}]}},
      {"effects": [{"t": "stability", "n": 1}, {"t": "unity", "n": -2}]},
      {"effects": [{"t": "cred", "n": -1}, {"t": "stability", "n": -1}, {"t": "mood", "blocs": ["civil"], "n": -0.02}]},
    ],
  },
  durianRoadsideStalls: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [{"t": "funds", "n": 8000}, {"t": "mood", "blocs": ["agri"], "n": 0.03}, {"t": "mood", "blocs": ["urban_b40"], "n": -0.01}]},
      {"effects": [{"t": "funds", "n": -3000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": -0.02}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.02}]},
      {"effects": [{"t": "funds", "n": -25000}, {"t": "mood", "blocs": ["agri"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.03}]},
    ],
  },
  reclamationSilt: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [{"t": "funds", "n": -20000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]},
      {"effects": [{"t": "mood", "blocs": ["agri"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.01}]},
      {"effects": [{"t": "cred", "n": -1}, {"t": "mood", "blocs": ["agri"], "n": -0.03}]},
    ],
  },
  busTerminalEmpty: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "melaka"},
    choices: [
      {"effects": [{"t": "funds", "n": -30000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}, {"t": "mood", "blocs": ["m40"], "n": 0.01}]},
      {"effects": [{"t": "funds", "n": -6000}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.02}, {"t": "mood", "blocs": ["gig"], "n": -0.02}]},
      {"effects": [{"t": "funds", "n": 15000}, {"t": "cred", "n": -1}, {"t": "mood", "blocs": ["urban_lib"], "n": -0.03}]},
    ],
  },
};
