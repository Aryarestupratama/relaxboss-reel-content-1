// Versi 4:5 (1080 x 1350): Reel 9:16 yang sama, dipangkas y 230-1580.
// Semua elemen penting sudah berada di zona aman y 220-1540, jadi tidak ada yang terpotong.
import React from "react";
import { Reel } from "./Reel";
import { VIDEO_HEIGHT, VIDEO_WIDTH } from "./theme";

export const CROP_H = 1350;
// Pangkas dari y 230 (bukan tengah) agar judul scene 4 dan 5 (y 300-330) tidak mepet tepi atas.
const OFFSET = 230;

export const Reel45: React.FC = () => (
  <div
    style={{
      width: VIDEO_WIDTH,
      height: CROP_H,
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: -OFFSET,
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
      }}
    >
      <Reel />
    </div>
  </div>
);
