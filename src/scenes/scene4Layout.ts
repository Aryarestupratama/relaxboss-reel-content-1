// Koordinat bersama Scene 4 (Asesmen). Dipisah dari komponen supaya timeline.ts
// bisa membaca titik asal transisi tanpa impor melingkar.
// Waktu scene ini ditulis dalam jam penulisan (storyboard); lihat SceneClock.

export const SCREEN_CENTER = { x: 540, y: 960 };
export const CARD_CY = 1020;
export const CARD_Q = { w: 880, h: 820 }; // kartu pertanyaan
export const CARD_R = { w: 880, h: 900 }; // kartu "Hasil Asesmen"

/** Kamera bergerak pelan 1,00 -> 1,03 sepanjang scene (12,4-18,0 dtk jam penulisan). */
export const CAMERA_END_SCALE = 1.03;

// ---- Kartu pertanyaan (koordinat lokal) ----
export const PROGRESS = { x: 48, y: 104, w: 784, h: 14, from: 0.8 };
export const QUESTION_Y = 156;
export const ANSWER = {
  labels: ["Tidak pernah", "Kadang", "Sering", "Selalu"] as const,
  chosen: 1, // "Kadang"
  x: 48,
  y: 300,
  w: 784,
  h: 104,
  gap: 20,
};
export const answerTop = (i: number): number => ANSWER.y + i * (ANSWER.h + ANSWER.gap);

// ---- Kartu hasil (koordinat lokal) ----
export const RESULT = {
  rowY: [150, 360, 570] as const,
  barX: 48,
  barW: 784,
  barH: 36,
  barOffset: 84, // jarak bar dari label baris
  tagY: 790,
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

export const withCamera = (
  p: { x: number; y: number },
  scale: number,
): { x: number; y: number } => ({
  x: SCREEN_CENTER.x + (p.x - SCREEN_CENTER.x) * scale,
  y: SCREEN_CENTER.y + (p.y - SCREEN_CENTER.y) * scale,
});

/** Pusat kartu hasil di akhir scene = titik asal lingkaran ke Scene 5. */
export const RESULT_CENTER_SCREEN = withCamera(
  { x: SCREEN_CENTER.x, y: CARD_CY },
  CAMERA_END_SCALE,
);
