// Pembagian scene dan peta waktu. Sumber kebenaran: src/timeline.json (juga dibaca skrip audio).
//
// Tiap scene punya "jam penulisan" sendiri: angka detik di file scene (dan storyboard) adalah
// waktu penulisan. Waktu nyata di video = startSec + (waktu penulisan - authStart) * speed,
// dengan speed > 1 berarti diperlambat (lebih lama dilihat). Batas scene = titik tengah
// transisi lingkaran.
import { FPS, sec } from "./theme";
import data from "./timeline.json";
import { LAST_POINT_SCREEN } from "./scenes/scene3Layout";
import { RESULT_CENTER_SCREEN } from "./scenes/scene4Layout";
import { OPEN_CENTER_SCREEN } from "./scenes/scene7Layout";
import { BLOB_CENTER_SCREEN } from "./scenes/scene5Layout";

export const TRANSITION_SEC = data.transitionSec;

export type SceneKey = "hook" | "pick" | "mood" | "assess" | "article" | "chat" | "cta";

type RawScene = (typeof data.scenes)[number];

export type SceneDef = {
  key: SceneKey;
  label: string;
  bg: string;
  /** Detik penulisan pada batas awal scene. */
  authStart: number;
  /** Detik nyata per detik penulisan. */
  speed: number;
  /** Detik nyata (mutlak) awal dan akhir scene. */
  startSec: number;
  endSec: number;
};

const build = (): SceneDef[] => {
  let t = 0;
  return (data.scenes as RawScene[]).map((s) => {
    const startSec = t;
    const endSec = startSec + s.authDur * s.speed + s.holdSec;
    t = endSec;
    return {
      key: s.key as SceneKey,
      label: s.label,
      bg: s.bg,
      authStart: s.authStart,
      speed: s.speed,
      startSec,
      endSec,
    };
  });
};

export const SCENES: ReadonlyArray<SceneDef> = build();

export const TOTAL_SEC = SCENES[SCENES.length - 1].endSec;
export const TOTAL_FRAMES = sec(TOTAL_SEC);

/** Scene yang masuk mulai tampil sebesar ini sebelum batas scene (setengah transisi). */
export const LEAD_SEC = TRANSITION_SEC / 2;

/** Titik asal lingkaran saat scene masuk (pusat elemen fokus scene sebelumnya). */
export const WIPE_ORIGIN: Partial<Record<SceneKey, { x: number; y: number }>> = {
  pick: { x: 540, y: 960 }, // pusat blob ungu scene Hook
  mood: { x: 540, y: 960 }, // pusat blob ungu di akhir scene Pilih mood
  assess: LAST_POINT_SCREEN, // titik terakhir grafik Mood Tracker
  article: RESULT_CENTER_SCREEN, // pusat kartu hasil Asesmen
  chat: OPEN_CENTER_SCREEN, // kartu artikel yang dibuka
  cta: BLOB_CENTER_SCREEN, // blob hijau di akhir RelaxMate
};
export const DEFAULT_WIPE_ORIGIN = { x: 540, y: 960 };

/** Rentang Sequence tiap scene (frame), sudah termasuk tumpang tindih transisi. */
export const sceneRange = (
  index: number,
): { from: number; duration: number; clockBase: number; speed: number } => {
  const s = SCENES[index];
  const isFirst = index === 0;
  const isLast = index === SCENES.length - 1;
  const from = sec(s.startSec - (isFirst ? 0 : LEAD_SEC));
  const to = sec(s.endSec + (isLast ? 0 : LEAD_SEC));
  // Frame penulisan = frame lokal Sequence / speed + clockBase.
  const clockBase = sec(s.authStart) + (from - sec(s.startSec)) / s.speed;
  return { from, duration: to - from, clockBase, speed: s.speed };
};

/** Detik nyata mutlak untuk sebuah detik penulisan di scene tertentu. */
export const realSec = (key: SceneKey, authSec: number): number => {
  const s = SCENES.find((x) => x.key === key)!;
  return s.startSec + (authSec - s.authStart) * s.speed;
};

export const FPS_OUT = FPS;
