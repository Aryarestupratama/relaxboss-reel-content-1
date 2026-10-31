// Grafik garis mood 7 hari (kartu "7 hari terakhir"), digambar di koordinat lokal kartu.
// Garis tergambar dari kiri ke kanan; tiap titik muncul (pop) tepat saat garis
// melewatinya; titik terakhir bisa berdenyut dua kali.
import React from "react";
import { COLORS, FPS, MOOD_FILL, SPRING, type MoodLevel } from "../theme";
import { springIn, tween } from "../motion";
import { useVideoFrame } from "../sceneClock";
import { CHART } from "../scenes/scene3Layout";

type Pt = { x: number; y: number };
type Seg = { p1: Pt; c1: Pt; c2: Pt; p2: Pt };

/** Spline Catmull-Rom terbuka -> segmen bezier kubik. */
const toSegments = (pts: Pt[]): Seg[] =>
  pts.slice(0, -1).map((_, i) => {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    return {
      p1,
      p2,
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
    };
  });

const bez = (s: Seg, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * s.p1.x + 3 * u * u * t * s.c1.x + 3 * u * t * t * s.c2.x + t * t * t * s.p2.x,
    y: u * u * u * s.p1.y + 3 * u * u * t * s.c1.y + 3 * u * t * t * s.c2.y + t * t * t * s.p2.y,
  };
};

/** Pecahan panjang kurva (0..1) pada tiap titik data. */
const knotFractions = (segs: Seg[]): number[] => {
  const lens = segs.map((s) => {
    let len = 0;
    let prev = bez(s, 0);
    for (let k = 1; k <= 24; k++) {
      const cur = bez(s, k / 24);
      len += Math.hypot(cur.x - prev.x, cur.y - prev.y);
      prev = cur;
    }
    return len;
  });
  const total = lens.reduce((a, b) => a + b, 0);
  const out = [0];
  lens.reduce((acc, l) => {
    out.push((acc + l) / total);
    return acc + l;
  }, 0);
  return out;
};

const POINTS: Pt[] = CHART.data.map((lvl, i) => ({
  x: CHART.x0 + i * CHART.dx,
  y: CHART.yBase - (lvl - 1) * CHART.dy,
}));
const SEGS = toSegments(POINTS);
const FRACTIONS = knotFractions(SEGS);
const PATH_D =
  `M${POINTS[0].x} ${POINTS[0].y}` +
  SEGS.map(
    (s) => `C${s.c1.x} ${s.c1.y} ${s.c2.x} ${s.c2.y} ${s.p2.x} ${s.p2.y}`,
  ).join("");

type Props = {
  width: number;
  height: number;
  drawStartSec: number;
  drawEndSec: number;
  /** Detik mulai denyut titik terakhir (dua kali, 0,2 dtk per denyut). */
  pulseStartSec: number;
};

export const MoodChart: React.FC<Props> = ({
  width,
  height,
  drawStartSec,
  drawEndSec,
  pulseStartSec,
}) => {
  const frame = useVideoFrame();
  // Garis linear terhadap waktu agar kemunculan titik bisa dihitung tepat.
  const p = tween(frame, drawStartSec, drawEndSec, 0, 1, (x) => x);
  const last = POINTS.length - 1;

  // Denyut titik terakhir: dua kali, skala 1 -> 1,35 -> 1.
  const pulseU = (frame / FPS - pulseStartSec) / 0.2;
  const pulse =
    pulseU >= 0 && pulseU < 2 ? 0.35 * Math.sin(Math.PI * (pulseU % 1)) : 0;
  const ringU = tween(frame, pulseStartSec, pulseStartSec + 0.4, 0, 1);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    >
      {[0, 1, 2, 3, 4].map((k) => (
        <line
          key={k}
          x1={48}
          x2={width - 48}
          y1={CHART.yBase - k * CHART.dy}
          y2={CHART.yBase - k * CHART.dy}
          stroke="#EEF2F8"
          strokeWidth={3}
        />
      ))}
      {p > 0.001 && (
        <path
          d={PATH_D}
          pathLength={1}
          fill="none"
          stroke={COLORS.navy}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={1 - p}
        />
      )}
      {POINTS.map((pt, i) => {
        const reachSec = drawStartSec + (drawEndSec - drawStartSec) * FRACTIONS[i];
        const s = springIn(frame, reachSec, SPRING.pop);
        if (s <= 0.001) return null;
        const extra = i === last ? pulse : 0;
        const level = CHART.data[i] as MoodLevel;
        return (
          <g key={i}>
            {i === last && ringU > 0 && ringU < 1 && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={20 + ringU * 34}
                fill="none"
                stroke={COLORS.navy}
                strokeWidth={4}
                opacity={0.45 * (1 - ringU)}
              />
            )}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={20 * s * (1 + extra)}
              fill={MOOD_FILL[level]}
              stroke={COLORS.navy}
              strokeWidth={6}
            />
          </g>
        );
      })}
      {CHART.days.map((d, i) => (
        <text
          key={d}
          x={CHART.x0 + i * CHART.dx}
          y={CHART.labelY}
          textAnchor="middle"
          fontSize={28}
          fontWeight={600}
          fill={COLORS.textSecondary}
        >
          {d}
        </text>
      ))}
    </svg>
  );
};
