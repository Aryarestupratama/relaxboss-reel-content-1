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
