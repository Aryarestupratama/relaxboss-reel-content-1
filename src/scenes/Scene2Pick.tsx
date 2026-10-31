// Scene 2: Pilih mood (3,2-6,6 dtk). Storyboard bagian 4.
// Blob ungu dari Scene 1 mengecil ke barisan, empat blob lain terlempar masuk,
// penonton diajak memilih, kursor menekan blob ungu, lalu blob ungu membesar ke tengah.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Blob, BLOB_VISUAL_CENTER_Y } from "../components/Blob";
import { SlamTitle } from "../components/SlamTitle";
import { Splash } from "../components/Splash";
import { TapCursor } from "../components/TapCursor";
import { COLORS, EASE, FPS, MOOD_FILL, type MoodLevel } from "../theme";
import { landSquash, tween } from "../motion";
import { fontFamily } from "../fonts";
import { useVideoFrame } from "../sceneClock";
import { sceneRange } from "../timeline";

const SMALL = 150;
const BIG_START = 440;
const BIG_END = 260;
const ROW_Y = 1000;
const SLOT_X = [160, 350, 540, 730, 920]; // pusat 5 blob, jarak 40 px, mulai x 85
const CENTER = { x: 540, y: 960 }; // posisi blob ungu di Scene 1 dan akhir Scene 2

// Fase napas disambung dari Scene 1 (Sequence Scene 2 mulai di frame `from`).
const BREATH_PHASE_SEC = -sceneRange(1).from / FPS;

const FLY_SEC = 0.42;
const FLY_STAGGER_SEC = 0.12;
const FLY_START_SEC = 3.2;

type Flyer = { mood: MoodLevel; slot: number; from: { x: number; y: number } };
const FLYERS: Flyer[] = [
  { mood: 2, slot: 1, from: { x: -170, y: 2060 } }, // biru: kiri bawah
  { mood: 3, slot: 2, from: { x: 540, y: 2170 } }, // peach: bawah
  { mood: 4, slot: 3, from: { x: 1250, y: 2060 } }, // hijau: kanan bawah
  { mood: 5, slot: 4, from: { x: 1250, y: -170 } }, // kuning: kanan atas
];

const placed = (cx: number, cy: number, size: number) => ({
  position: "absolute" as const,
  left: cx - size / 2,
  top: cy - size * BLOB_VISUAL_CENTER_Y,
});

export const Scene2Pick: React.FC = () => {
  const frame = useVideoFrame();

  // ---- Blob ungu ----
  const shrink = tween(frame, 3.2, 3.8, 0, 1, EASE.inOut);
  const grow = tween(frame, 5.3, 6.1, 0, 1, EASE.inOut);
  const size = BIG_START - (BIG_START - SMALL) * shrink + (BIG_END - SMALL) * grow;
  const px = CENTER.x + (SLOT_X[0] - CENTER.x) * shrink + (CENTER.x - SLOT_X[0]) * grow;
  const py = CENTER.y + (ROW_Y - CENTER.y) * shrink + (CENTER.y - ROW_Y) * grow;

  // Tap pada 5,00 dtk: melompat 40 px (sin), sedikit memanjang saat naik.
  const hop = Math.sin(Math.PI * tween(frame, 5.0, 5.35, 0, 1, (x) => x));
  const purpleY = py - 40 * hop;
  const purpleSx = 1 - 0.06 * hop;
  const purpleSy = 1 + 0.08 * hop;

  // ---- Empat blob lain: meredup ke 35% saat tap, lalu mengecil dan hilang ----
  const dim = tween(frame, 5.0, 5.25, 1, 0.35);
  const out = tween(frame, 5.3, 5.8, 0, 1);
  const othersOpacity = dim * (1 - out);
  const othersScale = 1 - 0.3 * out;

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bgYellow, fontFamily, overflow: "hidden" }}
    >
      <SlamTitle
        lines={["Hari ini,", "kamu yang mana?"]}
        inSec={3.6}
        outSec={5.7}
        style={{ top: 520 }}
      />

      {FLYERS.map((f, i) => {
        const start = FLY_START_SEC + i * FLY_STAGGER_SEC;
        if (frame < start * FPS) return null;
        const fly = tween(frame, start, start + FLY_SEC, 0, 1, EASE.out);
        const tx = SLOT_X[f.slot];
        const cx = f.from.x + (tx - f.from.x) * fly;
        const cy = f.from.y + (ROW_Y - f.from.y) * fly;
        const sq = landSquash(frame, start + FLY_SEC);
        return (
          <div
            key={f.mood}
            style={{
              ...placed(cx, cy, SMALL),
              opacity: othersOpacity,
              transform: `scale(${othersScale})`,
              transformOrigin: "50% 50%",
            }}
          >
            <Blob
              mood={f.mood}
              size={SMALL}
              scaleX={sq.sx}
              scaleY={sq.sy}
              breathe
              breathePhaseSec={0.4 * f.mood}
            />
          </div>
        );
      })}

      <div style={placed(px, purpleY, size)}>
        <Blob
          mood={1}
          size={size}
          scaleX={purpleSx}
          scaleY={purpleSy}
          breathe
          breathePhaseSec={BREATH_PHASE_SEC}
        />
      </div>

      <Splash
        x={SLOT_X[0]}
        y={ROW_Y - 58}
        startSec={5.0}
        color={MOOD_FILL[1]}
      />

      <TapCursor
        from={{ x: 960, y: 1500 }}
        via={{ x: 700, y: 1180 }}
        to={{ x: SLOT_X[0], y: ROW_Y }}
        moveStartSec={4.4}
        moveEndSec={5.0}
        tapSec={5.0}
      />
    </AbsoluteFill>
  );
};
