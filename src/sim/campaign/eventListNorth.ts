import type { EventDef } from './events';

/** Ten things that happen to the head of the Penang government, all within what a state can do: land, local councils, state roads, heritage, drainage and concessions. */
export const PENANG_STORIES: Record<string, EventDef> = {
  heritageShopLotAppeal: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}]},
      {"effects": [{"t": "funds", "n": 12000}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}, {"t": "mood", "blocs": ["urban_lib"], "n": -0.03}]},
      {"effects": [{"t": "funds", "n": -5000}, {"t": "cred", "n": -1}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}, {"t": "mood", "blocs": ["urban_lib"], "n": -0.02}]},
    ],
  },
  islandSlopePermit: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [{"t": "funds", "n": -25000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}, {"t": "mood", "blocs": ["m40"], "n": -0.02}]},
      {"effects": [{"t": "stability", "n": 1}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}, {"t": "mood", "blocs": ["urban_b40"], "n": -0.03}]},
      {"effects": [{"t": "funds", "n": -40000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.02}, {"t": "mood", "blocs": ["m40"], "n": -0.02}]},
    ],
  },
  ferryTerminalVendorSpace: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [{"t": "funds", "n": -8000}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.04}, {"t": "mood", "blocs": ["m40"], "n": -0.02}]},
      {"effects": [{"t": "funds", "n": -12000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.01}]},
      {"effects": [{"t": "funds", "n": 30000}, {"t": "mood", "blocs": ["m40"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.04}, {"t": "cred", "n": -1}]},
    ],
  },
  hilltopViewpointConcession: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [{"t": "cred", "n": -1}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]},
      {"effects": [{"t": "funds", "n": -65000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.03}]},
      {"effects": [{"t": "funds", "n": -18000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["m40"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.01}]},
    ],
  },
  urbanTreeRootConflict: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}, {"t": "mood", "blocs": ["urban_lib"], "n": -0.04}]},
      {"effects": [{"t": "funds", "n": -45000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.01}]},
      {"effects": [{"t": "funds", "n": -80000}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}, {"t": "mood", "blocs": ["m40"], "n": -0.02}]},
    ],
  },
  nightMarketNoiseRules: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.04}]},
      {"effects": [{"t": "funds", "n": -50000}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.03}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.02}]},
      {"effects": [{"t": "funds", "n": -90000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}, {"t": "mood", "blocs": ["m40"], "n": 0.02}]},
    ],
  },
  coastalFishingLanding: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [{"t": "mood", "blocs": ["agri"], "n": 0.04}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}, {"t": "cred", "n": 1}]},
      {"effects": [{"t": "funds", "n": -12000}, {"t": "stability", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": 0.01}]},
      {"effects": [{"t": "funds", "n": -100000}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}, {"t": "cred", "n": -1}]},
    ],
  },
  stateLandAffordableHomes: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [{"t": "funds", "n": -25000}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.04}, {"t": "cred", "n": -1}]},
      {"effects": [{"t": "funds", "n": -18000}, {"t": "trust", "n": 2}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]},
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["m40"], "n": 0.02}, {"t": "mood", "blocs": ["urban_b40"], "n": -0.02}]},
    ],
  },
  oldQuarryGreenBuffer: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.04}, {"t": "mood", "blocs": ["m40"], "n": -0.03}]},
      {"effects": [{"t": "funds", "n": 25000}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}, {"t": "mood", "blocs": ["urban_lib"], "n": -0.03}]},
      {"effects": [{"t": "funds", "n": -30000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["m40"], "n": -0.02}]},
    ],
  },
  heritageNightMarketGamble: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "penang"},
    choices: [
      {"effects": [], "gamble": {"chance": "cred", "win": [{"t": "cred", "n": 2}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}], "lose": [{"t": "trust", "n": -2}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}]}},
      {"effects": [{"t": "funds", "n": -35000}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}]},
      {"effects": [{"t": "funds", "n": -15000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["m40"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]},
    ],
  },
};

/** Ten things that happen to the head of the Perlis government, all within what a state can do. */
export const PERLIS_STORIES: Record<string, EventDef> = {
  kakiBukitOrchardAccess: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [{"t": "funds", "n": -90000}, {"t": "mood", "blocs": ["agri"], "n": 0.04}, {"t": "stability", "n": 1}]},
      {"effects": [{"t": "funds", "n": -30000}, {"t": "cred", "n": -1}, {"t": "mood", "blocs": ["agri"], "n": 0.02}]},
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": -0.02}]},
    ],
  },
  kangarOldMarketStalls: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]},
      {"effects": [{"t": "funds", "n": -12000}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.03}, {"t": "cred", "n": -1}]},
      {"effects": [{"t": "funds", "n": -6000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}]},
    ],
  },
  limestoneCaveSurvey: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}]},
      {"effects": [{"t": "funds", "n": -18000}, {"t": "stability", "n": 1}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.03}, {"t": "cred", "n": -1}]},
      {"effects": [{"t": "funds", "n": -75000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}]},
    ],
  },
  paddyDrainageBoard: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [{"t": "funds", "n": -55000}, {"t": "mood", "blocs": ["agri"], "n": 0.04}, {"t": "stability", "n": 1}]},
      {"effects": [{"t": "mood", "blocs": ["agri"], "n": -0.02}, {"t": "cred", "n": -1}]},
      {"effects": [{"t": "funds", "n": -22000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": -0.03}]},
    ],
  },
  stateLandSolarLease: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [{"t": "funds", "n": 25000}, {"t": "mood", "blocs": ["m40"], "n": 0.02}, {"t": "mood", "blocs": ["agri"], "n": -0.03}, {"t": "cred", "n": -1}]},
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": 0.03}, {"t": "mood", "blocs": ["m40"], "n": -0.02}]},
      {"effects": [{"t": "funds", "n": -15000}, {"t": "trust", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": 0.01}]},
    ],
  },
  townHeritageSignage: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.04}]},
      {"effects": [{"t": "funds", "n": -25000}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.03}]},
      {"effects": [{"t": "funds", "n": -10000}, {"t": "cred", "n": -1}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}, {"t": "mood", "blocs": ["urban_lib"], "n": -0.02}]},
    ],
  },
  hilltopWaterTank: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [{"t": "funds", "n": -40000}, {"t": "stability", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": 0.02}]},
      {"effects": [{"t": "cred", "n": -1}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.02}]},
      {"effects": [{"t": "funds", "n": -35000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["m40"], "n": -0.02}]},
    ],
  },
  lakeFishingPermit: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [{"t": "funds", "n": -20000}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.02}, {"t": "cred", "n": -1}]},
      {"effects": [{"t": "funds", "n": -12000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": -0.02}, {"t": "mood", "blocs": ["urban_lib"], "n": 0.02}]},
      {"effects": [{"t": "funds", "n": 15000}, {"t": "mood", "blocs": ["m40"], "n": 0.02}, {"t": "mood", "blocs": ["urban_b40"], "n": -0.03}, {"t": "cred", "n": -1}]},
    ],
  },
  smallQuarryDust: {
    role: "pm",
    seats: ["pm"],
    weight: 3,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [{"t": "cred", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]},
      {"effects": [{"t": "funds", "n": 20000}, {"t": "stability", "n": 1}, {"t": "mood", "blocs": ["agri"], "n": -0.02}]},
      {"effects": [{"t": "funds", "n": -80000}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}, {"t": "mood", "blocs": ["m40"], "n": -0.02}]},
    ],
  },
  stateParkLeaseGamble: {
    role: "pm",
    seats: ["pm"],
    weight: 2,
    topic: "local",
    needs: {"holds": "perlis"},
    choices: [
      {"effects": [], "gamble": {"chance": "cred", "win": [{"t": "cred", "n": 2}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}], "lose": [{"t": "trust", "n": -2}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.03}]}},
      {"effects": [{"t": "funds", "n": -60000}, {"t": "mood", "blocs": ["urban_b40"], "n": 0.03}, {"t": "mood", "blocs": ["smallbiz"], "n": 0.02}]},
      {"effects": [{"t": "funds", "n": -10000}, {"t": "cred", "n": 1}, {"t": "mood", "blocs": ["m40"], "n": 0.02}, {"t": "mood", "blocs": ["smallbiz"], "n": -0.02}]},
    ],
  },
};
