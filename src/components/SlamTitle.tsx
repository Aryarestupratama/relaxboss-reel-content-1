// Judul yang tampil sebagai SATU blok utuh (bukan per kata): skala 1,12 -> 1 dan
// opacity 0 -> 1 dalam 0,35 dtk. Opsional keluar: opacity -> 0 sambil naik.
import React, { type CSSProperties } from "react";
import { COLORS, TYPE } from "../theme";
import { tween } from "../motion";
import { useVideoFrame } from "../sceneClock";

type Props = {
  lines: string[];
  inSec: number;
  outSec?: number;
  outDurationSec?: number;
  fontSize?: number;
  style?: CSSProperties;
};

export const SlamTitle: React.FC<Props> = ({
  lines,
  inSec,
  outSec,
  outDurationSec = 0.4,
  fontSize = 100,
  style,
}) => {
  const frame = useVideoFrame();
  const inP = tween(frame, inSec, inSec + 0.35, 0, 1);
  const outP =
    outSec === undefined ? 0 : tween(frame, outSec, outSec + outDurationSec, 0, 1);
  const scale = 1.12 - 0.12 * inP;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        textAlign: "center",
        color: COLORS.navy,
        fontSize,
        fontWeight: 800,
        lineHeight: TYPE.titleLineHeight,
        letterSpacing: "-0.01em",
        wordSpacing: "0.06em",
        opacity: inP * (1 - outP),
        transform: `translateY(${-60 * outP}px) scale(${scale})`,
        ...style,
      }}
    >
      {lines.map((line) => (
        <div key={line} style={{ whiteSpace: "pre" }}>
          {line}
        </div>
      ))}
    </div>
  );
};
