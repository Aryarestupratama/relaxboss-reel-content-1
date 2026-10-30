// Kerangka video: enam scene dengan latar warna dan penanda waktu.
// Step 1 hanya memeriksa timeline (27,0 dtk = 810 frame). Isi scene dibangun di step berikutnya.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { COLORS, FPS, sec } from "./theme";
import { SCENES } from "./timeline";
import { fontFamily } from "./fonts";

const Placeholder: React.FC<{ label: string; index: number; bg: string }> = ({
  label,
  index,
  bg,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.navy,
      }}
    >
      <div style={{ fontSize: 40, fontWeight: 600, color: COLORS.textSecondary }}>
        Scene {index + 1}
      </div>
      <div style={{ fontSize: 112, fontWeight: 800, lineHeight: 1.05 }}>{label}</div>
      <div style={{ fontSize: 44, fontWeight: 500, marginTop: 24 }}>
        {(frame / FPS).toFixed(1)} dtk
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bgCream }}>
    {SCENES.map((s, i) => (
      <Sequence
        key={s.key}
        name={s.label}
        from={sec(s.startSec)}
        durationInFrames={sec(s.endSec) - sec(s.startSec)}
      >
        <Placeholder label={s.label} index={i} bg={s.bg} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
