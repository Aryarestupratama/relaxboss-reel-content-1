// Pembagian scene. Batas scene = titik tengah transisi lingkaran (0,5 dtk).
// Total 27,0 dtk = 810 frame. Sumber: storyboard bagian 1.
import { sec } from "./theme";

export const TRANSITION_SEC = 0.5;

export type SceneKey = "hook" | "pick" | "mood" | "assess" | "chat" | "cta";

export const SCENES: ReadonlyArray<{
  key: SceneKey;
  label: string;
  startSec: number;
  endSec: number;
  bg: string;
}> = [
  { key: "hook", label: "Hook", startSec: 0.0, endSec: 3.2, bg: "#F7F3EA" },
  { key: "pick", label: "Pilih mood", startSec: 3.2, endSec: 6.6, bg: "#FDEFA9" },
  { key: "mood", label: "Mood Tracker", startSec: 6.6, endSec: 12.4, bg: "#CDE5F8" },
  { key: "assess", label: "Asesmen", startSec: 12.4, endSec: 18.0, bg: "#FFDCCB" },
  { key: "chat", label: "RelaxMate", startSec: 18.0, endSec: 23.2, bg: "#D5F4D0" },
  { key: "cta", label: "CTA", startSec: 23.2, endSec: 27.0, bg: "#DED4FF" },
];

export const TOTAL_SEC = SCENES[SCENES.length - 1].endSec;
export const TOTAL_FRAMES = sec(TOTAL_SEC);

export const sceneStartFrame = (key: SceneKey): number =>
  sec(SCENES.find((s) => s.key === key)!.startSec);

export const sceneFrames = (key: SceneKey): number => {
  const s = SCENES.find((x) => x.key === key)!;
  return sec(s.endSec) - sec(s.startSec);
};
