// Scene 1: Hook (0,0-3,2 dtk). Storyboard bagian 4.
// Frame pertama sudah penuh (blob + kursor), teks diketik, blob "menghela napas",
// kamera mendorong pelan menuju transisi lingkaran.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Blob, BLOB_VISUAL_CENTER_Y } from "../components/Blob";
import { Typewriter } from "../components/Typewriter";
import { COLORS, EASE, TYPE } from "../theme";
import { tween } from "../motion";
import { fontFamily } from "../fonts";
import { useVideoFrame } from "../sceneClock";

const BLOB_SIZE = 440;
const BLOB_CENTER = { x: 540, y: 960 }; // pusat visual blob (titik asal transisi)
const BLOB_BOX = {
  left: BLOB_CENTER.x - BLOB_SIZE / 2,
  top: BLOB_CENTER.y - BLOB_SIZE * BLOB_VISUAL_CENTER_Y,
};

const TITLE_LINES = ["Capek,", "tapi nggak", "tahu kenapa?"];
const TITLE_SIZE = 104; // dalam rentang 96-112 (TYPE)

export const Scene1Hook: React.FC = () => {
  const frame = useVideoFrame();

  // Menghela napas 1,00-1,50 dtk: turun 14 px, memipih 1,04 x 0,96, lalu kembali.
  const t = tween(frame, 1.0, 1.5, 0, 1, (x) => x); // linear 0-1
  const sigh = Math.sin(Math.PI * t); // 0 -> 1 -> 0
  const sighY = 14 * sigh;
  const sighX = 1 + 0.04 * sigh;
  const sighYScale = 1 - 0.04 * sigh;

  // Kamera mendorong pelan 1,00 -> 1,03 (2,60 dtk sampai akhir transisi, 3,85 dtk).
  const push = tween(frame, 2.6, 3.85, 1, 1.03, EASE.inOut);

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bgCream, fontFamily, overflow: "hidden" }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${push})`,
          transformOrigin: `${BLOB_CENTER.x}px ${BLOB_CENTER.y}px`,
        }}
      >
        <Typewriter
          lines={TITLE_LINES}
          startSec={0.2}
          charsPerSec={11}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 350,
            textAlign: "center",
            color: COLORS.navy,
            fontSize: TITLE_SIZE,
            fontWeight: 800,
            lineHeight: TYPE.titleLineHeight,
            letterSpacing: "-0.01em",
            wordSpacing: "0.06em",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: BLOB_BOX.left,
            top: BLOB_BOX.top,
            transform: `translateY(${sighY}px)`,
          }}
        >
          <Blob
            mood={1}
            size={BLOB_SIZE}
            scaleX={sighX}
            scaleY={sighYScale}
            breathe
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
