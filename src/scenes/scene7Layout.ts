// Tata letak scene Artikel (koordinat kanvas). Meniru halaman /artikel di website:
// kolom pencarian, pill kategori (Semua, Stres, Tidur, Kecemasan, Burnout), lalu kartu artikel.
export const SEARCH = { x: 100, y: 560, w: 880, h: 112 };
export const PILLS_Y = 706;
export const PILL_H = 64;
export const CARD = { x: 100, w: 880, h: 320, y: [800, 1150] as const };
/** Tombol "Baca" pada kartu pertama (pusat), tempat kursor menekan. */
export const READ_BTN = { x: 860, y: CARD.y[0] + CARD.h - 52 };
/** Pusat kartu pertama = titik asal lingkaran ke scene berikutnya. */
export const OPEN_CENTER_SCREEN = { x: CARD.x + CARD.w / 2, y: CARD.y[0] + CARD.h / 2 };
