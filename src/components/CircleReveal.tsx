// Transisi scene: scene yang masuk terungkap lewat lingkaran yang tumbuh dari
// satu titik (pusat elemen fokus scene sebelumnya), dengan cincin navy 6 px di tepinya.
// Bungkus scene yang MASUK; waktu relatif terhadap Sequence induk.
import React, { type ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, EASE, VIDEO_HEIGHT, VIDEO_WIDTH } from "../theme";
import { TRANSITION_SEC } from "../timeline";
import { tween } from "../motion";

type Props = {
  cx: number;
  cy: number;
  startSec?: number;
  durationSec?: number;
  children: ReactNode;
};

export const CircleReveal: React.FC<Props> = ({
  cx,
  cy,
  startSec = 0,
  durationSec = TRANSITION_SEC,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = tween(frame, startSec, startSec + durationSec, 0, 1, EASE.inOut);
  if (p <= 0) return null;

  const maxR =
    Math.hypot(Math.max(cx, VIDEO_WIDTH - cx), Math.max(cy, VIDEO_HEIGHT - cy)) + 40;
  const r = p * maxR;
  const done = p >= 1;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: done ? undefined : `circle(${r}px at ${cx}px ${cy}px)`,
        }}
      >
        {children}
      </div>
      {!done && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: cx - r,
            top: cy - r,
            width: r * 2,
            height: r * 2,
            boxSizing: "border-box",
            borderRadius: "50%",
            border: `${Math.min(6, r / 2)}px solid ${COLORS.navy}`,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
};
