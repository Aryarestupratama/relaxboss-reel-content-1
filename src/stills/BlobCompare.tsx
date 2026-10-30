// Still pemeriksaan: gambar asli website (kiri) vs SVG hasil gambar ulang (kanan).
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Blob } from "../components/Blob";
import { MOOD_LEVELS } from "../theme";

export const BlobCompare: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
    {MOOD_LEVELS.map((m, i) => (
      <div
        key={m}
        style={{ position: "absolute", top: 60 + i * 360, left: 0, display: "flex" }}
      >
        <Img
          src={staticFile(`reference/mood-${m}.webp`)}
          style={{ width: 360, height: 360, marginLeft: 120 }}
        />
        <div style={{ marginLeft: 120 }}>
          <Blob mood={m} size={360} />
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
