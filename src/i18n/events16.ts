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
    body: 'Hutang negara dah lepas sembilan persepuluh daripada pendapatan negara. Kementerian kewangan beri amaran, pada kadar ni negara tak akan dapat meminjam ikut syarat sendiri menjelang tahun depan. Pasaran bon dah perasan sebelum anda.',
    options: ['Potong keras sekarang, dan beritahu sebabnya', 'Jual aset negara untuk bayar hutang', 'Kata ia terkawal'],
    results: [
      'Menyakitkan, tapi dipercayai. Hutang reda; klinik dan sekolah yang rasa.',
      'Jualan tu bawa duit tunai dan siasatan pasal siapa beli apa, dan harga berapa.',
      ['Pasaran bagi anda ruang percaya, kali ni.', 'Pasaran tak, dan hutang bertambah masa anda sibuk tenangkan mereka.'],
    ],
  },
  debtCrisis: {
    title: 'Negara tak boleh meminjam',
    body: 'Lelongan bon terakhir gagal. Hutang dah lepas seratus peratus daripada pendapatan negara dan pemberi pinjaman tak mahu sambung dengan syarat yang kerajaan boleh terima. Ada dua jalan keluar, dua-dua pahit, dan yang ketiga ialah doa.',
    options: ['Terima bailout, dengan syaratnya', 'Susun semula: mungkir sebahagian hutang', 'Berdegil, dan harap pasaran mengalah'],
    results: [
      'Pemberi pinjaman hantar satu pasukan dan satu senarai. Perbelanjaan dipotong, cukai naik dan setiap program dihapuskan. Hutang turun, dan kerajaan pun turun bersama, dalam tinjauan.',
      'Sebahagian hutang dihapus kira, dan nama negara di luar negara pun ikut hilang. Hutang lebih ringan dan tak ada siapa nak pinjamkan bertahun-tahun.',
      ['Pasaran mengalah, buat masa ni. Negara dah beli sedikit masa.', 'Pasaran tak mengalah. Negara tak boleh bayar, dan kerajaan jatuh.'],
    ],
  },
};
