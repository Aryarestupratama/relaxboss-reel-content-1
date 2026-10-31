// Kursor tap: lingkaran navy transparan 56 px (bukan ikon tangan) yang bergerak
// melengkung ke target, menekan, memancarkan riak, lalu menghilang.
// Satu instance = satu gerakan dan satu tap.
import React from "react";
import { COLORS, EASE } from "../theme";
import { tween } from "../motion";
import { useVideoFrame } from "../sceneClock";

type Pt = { x: number; y: number };

type Props = {
  from: Pt;
  /** Titik kontrol kurva (membuat gerakan melengkung, bukan garis lurus). */
  via: Pt;
  to: Pt;
  moveStartSec: number;
  moveEndSec: number;
  tapSec: number;
};

const SIZE = 56;

export const TapCursor: React.FC<Props> = ({
  from,
  via,
  to,
  moveStartSec,
  moveEndSec,
  tapSec,
}) => {
  const frame = useVideoFrame();
  const t = tween(frame, moveStartSec, moveEndSec, 0, 1, EASE.inOut);
  const u = 1 - t;
  const x = u * u * from.x + 2 * u * t * via.x + t * t * to.x;
  const y = u * u * from.y + 2 * u * t * via.y + t * t * to.y;

  const fadeIn = tween(frame, moveStartSec - 0.15, moveStartSec, 0, 1);
  const fadeOut = tween(frame, tapSec + 0.2, tapSec + 0.45, 1, 0);
  const opacity = Math.min(fadeIn, fadeOut);
  if (opacity <= 0) return null;

  // Tekan: 1 -> 0,78 dalam 0,1 dtk, lalu kembali ke 1 pada 0,3 dtk setelah tap.
  const pressScale =
    tween(frame, tapSec, tapSec + 0.1, 1, 0.78) +
    tween(frame, tapSec + 0.1, tapSec + 0.3, 0, 0.22);

  const ripple = tween(frame, tapSec, tapSec + 0.45, 0, 1);
  const rippleSize = SIZE + ripple * 170;

  return (
    <>
      {ripple > 0 && ripple < 1 && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: to.x - rippleSize / 2,
            top: to.y - rippleSize / 2,
            width: rippleSize,
            height: rippleSize,
            borderRadius: "50%",
            boxSizing: "border-box",
            border: `4px solid ${COLORS.navy}`,
            opacity: 0.5 * (1 - ripple),
          }}
        />
      )}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: x - SIZE / 2,
          top: y - SIZE / 2,
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          boxSizing: "border-box",
          backgroundColor: "rgba(10, 34, 68, 0.28)",
          border: "3px solid rgba(10, 34, 68, 0.6)",
          opacity,
          transform: `scale(${pressScale})`,
        }}
      />
    </>
  );
};
