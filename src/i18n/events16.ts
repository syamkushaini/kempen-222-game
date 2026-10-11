import type { EventText } from './events';

// The two rungs of a debt that climbs: the alarm and the crisis, in English and Bahasa Malaysia. A result written as a pair is for a gamble.

export const DEBT_EVENTS_EN: Record<string, EventText> = {
  debtAlarm: {
    title: 'The debt alarm',
    body: 'The national debt has passed nine-tenths of national income. The finance ministry warns that at this rate the country will not be able to borrow on its own terms by next year. The bond markets have noticed before you did.',
    options: ['Cut hard now, and say why', 'Sell state assets to pay it down', 'Say it is under control'],
    results: [
      'It was painful and it was believed. The debt eases; the clinics and the schools feel it.',
      'The sale brought in cash and an inquiry into who bought what, and at what price.',
      ['The markets gave you the benefit of the doubt, this time.', 'The markets did not, and the debt grew while you reassured them.'],
    ],
  },
  debtCrisis: {
    title: 'The country cannot borrow',
    body: 'The last bond auction failed. The debt is past a hundred per cent of national income and lenders will not roll it over on any terms the government can live with. There are two ways out, both bitter, and a third that is a prayer.',
    options: ['Accept the bailout, with its conditions', 'Restructure: default on part of the debt', 'Stonewall, and hope the markets blink'],
    results: [
      'The lenders sent a team and a list. Spending is cut, taxes rise and every programme is wiped. The debt falls, and the government with it, in the polls.',
      'Part of the debt was written off, and with it the country’s name abroad. The debt is lighter and nobody will lend for years.',
      ['The markets blinked, for now. The country has bought itself a little time.', 'The markets did not blink. The country cannot pay, and the government falls.'],
    ],
  },
};

export const DEBT_EVENTS_MS: Record<string, EventText> = {
  debtAlarm: {
    title: 'Loceng amaran hutang',
    body: 'Hutang negara telah melepasi sembilan persepuluh daripada pendapatan negara. Kementerian kewangan memberi amaran bahawa pada kadar ini negara tidak akan dapat meminjam dengan syaratnya sendiri menjelang tahun depan. Pasaran bon sudah perasan sebelum anda.',
    options: ['Potong dengan keras sekarang, dan beritahu sebabnya', 'Jual aset negara untuk membayar hutang', 'Katakan ia terkawal'],
    results: [
      'Ia menyakitkan dan ia dipercayai. Hutang reda; klinik dan sekolah merasainya.',
      'Jualan itu membawa wang tunai dan siasatan tentang siapa membeli apa, dan pada harga berapa.',
      ['Pasaran memberi anda manfaat keraguan, kali ini.', 'Pasaran tidak, dan hutang bertambah semasa anda menenangkan mereka.'],
    ],
  },
  debtCrisis: {
    title: 'Negara tidak dapat meminjam',
    body: 'Lelongan bon terakhir gagal. Hutang telah melepasi seratus peratus daripada pendapatan negara dan pemberi pinjaman tidak mahu memperbaharuinya dengan syarat yang boleh diterima kerajaan. Ada dua jalan keluar, kedua-duanya pahit, dan yang ketiga ialah doa.',
    options: ['Terima bailout, dengan syaratnya', 'Susun semula: mungkir sebahagian hutang', 'Berdegil, dan harap pasaran mengalah'],
    results: [
      'Pemberi pinjaman menghantar satu pasukan dan satu senarai. Perbelanjaan dipotong, cukai naik dan setiap program dihapuskan. Hutang turun, dan kerajaan bersamanya, dalam tinjauan.',
      'Sebahagian hutang dihapus kira, dan bersamanya nama negara di luar negeri. Hutang lebih ringan dan tiada siapa mahu meminjamkan bertahun-tahun.',
      ['Pasaran mengalah, buat masa ini. Negara telah membeli sedikit masa.', 'Pasaran tidak mengalah. Negara tidak dapat membayar, dan kerajaan jatuh.'],
    ],
  },
};
