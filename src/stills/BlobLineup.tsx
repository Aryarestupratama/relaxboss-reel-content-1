// Still pemeriksaan: blob besar + barisan lima blob seperti di scene 2 storyboard.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Blob } from "../components/Blob";
import { COLORS, MOOD_LEVELS } from "../theme";
import { fontFamily } from "../fonts";

export const BlobLineup: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bgCream, fontFamily }}>
    <div style={{ position: "absolute", left: 320, top: 560 }}>
      <Blob mood={1} size={440} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 85,
        top: 1100,
        display: "flex",
        gap: 40,
      }}
    >
      {MOOD_LEVELS.map((m) => (
        <Blob key={m} mood={m} size={150} />
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1400,
        textAlign: "center",
        fontSize: 32,
        fontWeight: 600,
        color: COLORS.textSecondary,
      }}
    >
      Step 1 · blob mood 1–5 (vektor)
    </div>
  </AbsoluteFill>
);
