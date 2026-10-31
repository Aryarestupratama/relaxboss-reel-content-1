// Helper animasi bersama. Semua murni dari frame (deterministik).
import { interpolate, spring } from "remotion";
import { EASE, FPS, SPRING, sec } from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

type EasingFn = (t: number) => number;

/** Interpolasi dengan waktu dalam DETIK (relatif ke Sequence induk). */
export const tween = (
  frame: number,
  fromSec: number,
  toSec: number,
  from: number,
  to: number,
  easing: EasingFn = EASE.out,
): number =>
  interpolate(frame, [sec(fromSec), sec(toSec)], [from, to], {
    ...clamp,
    easing,
  });

/** Spring 0 -> 1 mulai dari detik tertentu. */
export const springIn = (
  frame: number,
  startSec: number,
  config: Record<string, number> = SPRING.bouncy,
): number => spring({ frame: frame - sec(startSec), fps: FPS, config });

/** Napas pelan: 1 -> 1 + amplitude, periode dalam detik. */
export const breath = (
  frame: number,
  amplitude = 0.03,
  periodSec = 2.4,
  phaseSec = 0,
): number =>
  1 +
  amplitude *
    (0.5 - 0.5 * Math.cos(((frame / FPS - phaseSec) / periodSec) * Math.PI * 2));

/** Jumlah karakter yang sudah tampil pada teks yang diketik. */
export const typedLength = (
  frame: number,
  startSec: number,
  text: string,
  charsPerSec = 16,
): number =>
  Math.max(
    0,
    Math.min(text.length, Math.floor(((frame - sec(startSec)) / FPS) * charsPerSec)),
  );

/** Squash saat mendarat: 1,12 x 0,88 lalu kembali ke 1 x 1 dalam 0,25 dtk. */
export const landSquash = (
  frame: number,
  landSec: number,
  amount = 0.12,
  durationSec = 0.25,
): { sx: number; sy: number } => {
  const t = tween(frame, landSec, landSec + durationSec, 0, 1, EASE.out);
  const a = frame < sec(landSec) ? 0 : amount * (1 - t);
  return { sx: 1 + a, sy: 1 - a };
};
