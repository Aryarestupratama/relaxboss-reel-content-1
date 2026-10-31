// Koordinat bersama Scene 3 (Mood Tracker). Dipisah dari komponen supaya timeline.ts
// bisa membaca titik asal transisi tanpa impor melingkar.
// Semua nilai dalam px kanvas 1080 x 1920 (sebelum gerak kamera) kecuali disebut lain.

export const SCREEN_CENTER = { x: 540, y: 960 };
export const CARD_CY = 980;
export const CARD1 = { w: 880, h: 620 }; // "Mood hari ini"
export const CARD2 = { w: 880, h: 760 }; // "7 hari terakhir"

/** Kamera bergerak pelan 1,00 -> 1,03 sepanjang scene (6,6-12,4 dtk), pivot di tengah kanvas. */
export const CAMERA_END_SCALE = 1.03;

// ---- Kartu 1 (koordinat lokal kartu) ----
export const MINI = 120; // ukuran blob mini
export const MINI_X = [108, 274, 440, 606, 772]; // pusat 5 blob, jarak 46 px
export const MINI_Y = 205;
export const CHIP = {
  y: 340,
  h: 96,
  w: 380,
  energiX: 48, // "Bertenaga"
  lelahX: 452, // "Lelah"
};
export const BUTTON = { x: 60, y: 480, w: 760, h: 104 };

// ---- Kartu 2: grafik 7 hari (koordinat lokal kartu) ----
export const CHART = {
  data: [2, 3, 1, 2, 3, 4, 1] as const, // level mood: biru, peach, ungu, biru, peach, hijau, ungu
  days: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const,
  x0: 90,
  dx: 700 / 6,
  yBase: 560, // y untuk level 1
  dy: 80, // selisih y per level
  labelY: 672,
};

/** Titik kartu (lokal) -> kanvas, untuk kartu yang sudah diam di tengah. */
export const cardToScreen = (
  card: { w: number; h: number },
  lx: number,
  ly: number,
): { x: number; y: number } => ({
  x: SCREEN_CENTER.x - card.w / 2 + lx,
  y: CARD_CY - card.h / 2 + ly,
});

/** Pusat titik data ke-i pada grafik, di kanvas (sebelum kamera). */
export const chartPointScreen = (i: number): { x: number; y: number } =>
  cardToScreen(
    CARD2,
    CHART.x0 + i * CHART.dx,
    CHART.yBase - (CHART.data[i] - 1) * CHART.dy,
  );

/** Efek kamera (skala sekitar pusat kanvas) pada satu titik, pada skala `scale`. */
export const withCamera = (
  p: { x: number; y: number },
  scale: number,
): { x: number; y: number } => ({
  x: SCREEN_CENTER.x + (p.x - SCREEN_CENTER.x) * scale,
  y: SCREEN_CENTER.y + (p.y - SCREEN_CENTER.y) * scale,
});

/** Titik terakhir grafik di akhir scene = titik asal lingkaran ke Scene 4. */
export const LAST_POINT_SCREEN = withCamera(
  chartPointScreen(CHART.data.length - 1),
  CAMERA_END_SCALE,
);
