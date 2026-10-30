// Sumber tunggal: ukuran, waktu, warna, easing, spring, zona aman, tipografi.
// Warna mood dan navy diambil dari resources/css/app.css website RelaxBoss.
// Warna latar scene adalah usulan untuk video ini (lihat storyboard bagian 3).
import { Easing } from "remotion";

// ---------- Waktu ----------
export const FPS = 30;
/** Detik -> frame. Semua waktu di proyek ini ditulis dalam detik. */
export const sec = (n: number): number => Math.round(n * FPS);

// ---------- Kanvas ----------
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

// ---------- Warna ----------
export const COLORS = {
  navy: "#0A2244",
  textSecondary: "#42506A",
  white: "#FFFFFF",
  // Latar scene
  bgCream: "#F7F3EA",
  bgYellow: "#FDEFA9",
  bgBlue: "#CDE5F8",
  bgPeach: "#FFDCCB",
  bgGreen: "#D5F4D0",
  bgLavender: "#DED4FF",
} as const;

/**
 * Warna isi blob per tingkat mood (1 = sangat sedih ... 5 = luar biasa).
 * Diambil dari median warna ilustrasi di website (public/images/mood/mood-N.webp),
 * supaya blob di video sama dengan blob yang dilihat orang di website.
 */
export const MOOD_FILL = {
  1: "#A88CFD",
  2: "#9EC7F3",
  3: "#FEB997",
  4: "#9BEEAA",
  5: "#FCDF6F",
} as const;

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export const MOOD_LEVELS: readonly MoodLevel[] = [1, 2, 3, 4, 5];

// ---------- Easing dan spring ----------
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // masuk: cepat lalu lembut berhenti
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // kamera dan geser
} as const;

export const SPRING = {
  soft: { damping: 22, stiffness: 120, mass: 1 }, // kartu
  bouncy: { damping: 11, stiffness: 170, mass: 0.7 }, // blob dan tombol
  pop: { damping: 14, stiffness: 160, mass: 0.8 }, // centang
} as const;

// ---------- Zona aman Reels (acuan awal, dicek saat render) ----------
export const SAFE = { left: 64, right: 1016, top: 220, bottom: 1540 } as const;

// ---------- Tipografi ----------
export const TYPE = {
  titleMin: 96,
  titleMax: 112,
  titleLineHeight: 1.05,
  bodyMin: 44,
  labelMin: 28,
} as const;
