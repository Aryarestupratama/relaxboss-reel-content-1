// Percikan bulat kecil yang menyebar ke atas dari satu titik lalu memudar (0,5 dtk).
import React from "react";
import { EASE } from "../theme";
import { tween } from "../motion";
import { useVideoFrame } from "../sceneClock";

type Props = {
  x: number;
  y: number;
  startSec: number;
  color: string;
  count?: number;
  distance?: number;
  radius?: number;
  durationSec?: number;
};

export const Splash: React.FC<Props> = ({
  x,
  y,
  startSec,
  color,
  count = 3,
  distance = 90,
  radius = 12,
  durationSec = 0.5,
}) => {
  const frame = useVideoFrame();
  const p = tween(frame, startSec, startSec + durationSec, 0, 1, EASE.out);
  if (p <= 0 || p >= 1) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        // Sebaran ke atas: -90 derajat di tengah, 50 derajat antar partikel.
        const angle = ((-90 + (i - (count - 1) / 2) * 50) * Math.PI) / 180;
        const r = radius * (1 - 0.5 * p);
        return (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: x + Math.cos(angle) * distance * p - r,
              top: y + Math.sin(angle) * distance * p - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: 1 - p * p,
            }}
          />
        );
      })}
    </>
  );
};
