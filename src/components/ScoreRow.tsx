// Satu baris hasil Asesmen per subskala: label, bar horizontal yang terisi, dan chip
// kategori yang muncul (pop) saat bar selesai. Koordinat lokal kartu.
import React from "react";
import { COLORS, EASE, SPRING } from "../theme";
import { springIn, tween } from "../motion";
import { useVideoFrame } from "../sceneClock";

type Props = {
  label: string;
  category: string;
  /** Warna isi bar (warna mood). */
  color: string;
  /** Panjang isi bar, 0..1. */
  pct: number;
  /** Posisi atas baris di kartu (lokal). */
  y: number;
  x: number;
  width: number;
  barHeight: number;
  barOffset: number;
  fillStartSec: number;
  fillDurationSec: number;
};

export const ScoreRow: React.FC<Props> = ({
  label,
  category,
  color,
  pct,
  y,
  x,
  width,
  barHeight,
  barOffset,
  fillStartSec,
  fillDurationSec,
}) => {
  const frame = useVideoFrame();
  const p = tween(frame, fillStartSec, fillStartSec + fillDurationSec, 0, 1, EASE.out);
  const chip = springIn(frame, fillStartSec + fillDurationSec, SPRING.pop);
  const fillW = width * pct * p;

  return (
    <div style={{ position: "absolute", left: x, top: y, width }}>
      <div
        style={{
          fontSize: 44,
          fontWeight: 600,
          color: COLORS.navy,
          lineHeight: "56px",
        }}
      >
        {label}
      </div>
      {chip > 0.001 && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: 56,
            padding: "0 28px",
            borderRadius: 28,
            backgroundColor: COLORS.bgLavender,
            color: COLORS.navy,
            fontSize: 32,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            transform: `scale(${chip})`,
            transformOrigin: "100% 50%",
          }}
        >
          {category}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: barOffset,
          width,
          height: barHeight,
          borderRadius: barHeight / 2,
          backgroundColor: "#EEF2F8",
        }}
      >
        {fillW > barHeight * 0.4 && (
          <div
            style={{
              width: fillW,
              height: barHeight,
              boxSizing: "border-box",
              borderRadius: barHeight / 2,
              backgroundColor: color,
              border: `4px solid ${COLORS.navy}`,
            }}
          />
        )}
      </div>
    </div>
  );
};
