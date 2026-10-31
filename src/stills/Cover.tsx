// Cover Reels (still 1080 x 1920). Isi penting berada di area tengah 1080 x 1350
// supaya tidak terpotong saat grid profil Instagram memangkas ke 4:5.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Blob, BLOB_VISUAL_CENTER_Y } from "../components/Blob";
import { COLORS, MOOD_LEVELS } from "../theme";
import { fontFamily } from "../fonts";

const SIZE = 172;
const X = [172, 356, 540, 724, 908];

export const Cover: React.FC = () => (
  <AbsoluteFill
    style={{ backgroundColor: COLORS.bgYellow, fontFamily, color: COLORS.navy }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: 520,
        textAlign: "center",
        fontSize: 112,
        fontWeight: 800,
        lineHeight: 1.1,
      }}
    >
      <div>Hari ini,</div>
      <div>kamu blob</div>
      <div>yang mana?</div>
    </div>
    {MOOD_LEVELS.map((m, i) => (
      <div
        key={m}
        style={{
          position: "absolute",
          left: X[i] - SIZE / 2,
          top: 1180 - SIZE * BLOB_VISUAL_CENTER_Y - (i % 2 === 0 ? 0 : 24),
        }}
      >
        <Blob mood={m} size={SIZE} />
      </div>
    ))}
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: 1360,
        textAlign: "center",
        fontSize: 44,
        fontWeight: 600,
        color: COLORS.textSecondary,
      }}
    >
      relaxboss.my.id
    </div>
  </AbsoluteFill>
);
