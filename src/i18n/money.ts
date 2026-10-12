// Text for the economy's size in ringgit, the yearly announcement and the government's own money, in English and Bahasa Malaysia.
// Kept apart from strings.ts for size; merged into the same lookup table.

export const MONEY_EN = {
  'hint.treasury': 'Treasury',
  'house.size': 'The size of the economy',
  'house.gdp': 'Output a year',
  'house.perCapita': 'Per person',
  'house.population': 'People',
  'house.owed': 'Public debt',
  'house.deficitRm': 'Deficit a year',
  'house.mix': 'Where the output comes from',
  'house.reports': 'The yearly announcements',
  'house.reports.none': 'The first announcement comes at the end of the first year.',
  'house.reports.year': 'Year',
  'house.reports.growth': 'Growth',
  'house.reports.debtPct': 'Debt',
  'house.line.rm': 'About {rm} a year',
  'news.gdp.up.debtUp': 'Year-end figures: the economy produced {gdp} this year, and each person’s share rose to {pc}. The public debt grew to {debt}, {pct}% of income.',
  'news.gdp.up.debtDown': 'Year-end figures: the economy produced {gdp} this year, and each person’s share rose to {pc}. The public debt fell to {debt}, {pct}% of income.',
  'news.gdp.down.debtUp': 'Year-end figures: the economy produced {gdp} this year, but each person’s share fell to {pc}. The public debt grew to {debt}, {pct}% of income.',
  'news.gdp.down.debtDown': 'Year-end figures: the economy produced {gdp} this year, but each person’s share fell to {pc}. The public debt eased to {debt}, {pct}% of income.',
} as const;

export const MONEY_MS: Record<keyof typeof MONEY_EN, string> = {
  'hint.treasury': 'Kewangan kerajaan',
  'house.size': 'Saiz ekonomi',
  'house.gdp': 'Saiz ekonomi setahun',
  'house.perCapita': 'Setiap orang',
  'house.population': 'Penduduk',
  'house.owed': 'Hutang awam',
  'house.deficitRm': 'Defisit setahun',
  'house.mix': 'Sumber ekonomi',
  'house.reports': 'Laporan tahunan',
  'house.reports.none': 'Laporan pertama akan keluar pada hujung tahun pertama.',
  'house.reports.year': 'Tahun',
  'house.reports.growth': 'Pertumbuhan',
  'house.reports.debtPct': 'Hutang',
  'house.line.rm': 'Lebih kurang {rm} setahun',
  'news.gdp.up.debtUp': 'Laporan hujung tahun: ekonomi berkembang kepada {gdp}, dan pendapatan bagi setiap orang naik kepada {pc}. Hutang negara pula meningkat kepada {debt}, iaitu {pct}% daripada pendapatan.',
  'news.gdp.up.debtDown': 'Laporan hujung tahun: ekonomi berkembang kepada {gdp}, dan pendapatan bagi setiap orang naik kepada {pc}. Hutang negara turun kepada {debt}, iaitu {pct}% daripada pendapatan.',
  'news.gdp.down.debtUp': 'Laporan hujung tahun: ekonomi mengecil kepada {gdp}, dan pendapatan bagi setiap orang turun kepada {pc}. Hutang negara pula meningkat kepada {debt}, iaitu {pct}% daripada pendapatan.',
  'news.gdp.down.debtDown': 'Laporan hujung tahun: ekonomi mengecil kepada {gdp}, dan pendapatan bagi setiap orang turun kepada {pc}. Hutang negara turun kepada {debt}, iaitu {pct}% daripada pendapatan.',
};

export type MoneyKey = keyof typeof MONEY_EN;
