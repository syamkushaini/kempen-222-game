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
  'hint.treasury': 'Perbendaharaan',
  'house.size': 'Saiz ekonomi',
  'house.gdp': 'Keluaran setahun',
  'house.perCapita': 'Seorang',
  'house.population': 'Penduduk',
  'house.owed': 'Hutang awam',
  'house.deficitRm': 'Defisit setahun',
  'house.mix': 'Dari mana keluaran datang',
  'house.reports': 'Pengumuman tahunan',
  'house.reports.none': 'Pengumuman pertama datang pada akhir tahun pertama.',
  'house.reports.year': 'Tahun',
  'house.reports.growth': 'Pertumbuhan',
  'house.reports.debtPct': 'Hutang',
  'house.line.rm': 'Kira-kira {rm} setahun',
  'news.gdp.up.debtUp': 'Angka hujung tahun: ekonomi menghasilkan {gdp} tahun ini, dan bahagian setiap orang naik kepada {pc}. Hutang awam bertambah kepada {debt}, {pct}% daripada pendapatan.',
  'news.gdp.up.debtDown': 'Angka hujung tahun: ekonomi menghasilkan {gdp} tahun ini, dan bahagian setiap orang naik kepada {pc}. Hutang awam turun kepada {debt}, {pct}% daripada pendapatan.',
  'news.gdp.down.debtUp': 'Angka hujung tahun: ekonomi menghasilkan {gdp} tahun ini, tetapi bahagian setiap orang jatuh kepada {pc}. Hutang awam bertambah kepada {debt}, {pct}% daripada pendapatan.',
  'news.gdp.down.debtDown': 'Angka hujung tahun: ekonomi menghasilkan {gdp} tahun ini, tetapi bahagian setiap orang jatuh kepada {pc}. Hutang awam reda kepada {debt}, {pct}% daripada pendapatan.',
};

export type MoneyKey = keyof typeof MONEY_EN;
