// Kartu UI putih (radius 48, bayangan lembut). Anak-anaknya memakai koordinat LOKAL
// kartu (position: absolute terhadap pojok kiri atas kartu). Tidak memotong isi
// (overflow visible), jadi elemen boleh keluar dari kartu saat animasi.
import React, { type CSSProperties, type ReactNode } from "react";
import { COLORS } from "../theme";

type Props = {
  w: number;
  h: number;
  /** Pusat kartu di kanvas. */
  cx: number;
  cy: number;
  /** transform CSS tambahan (translate/rotate/scale di sekitar pusat kartu). */
  transform?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export const Card: React.FC<Props> = ({ w, h, cx, cy, transform, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: cx - w / 2,
      top: cy - h / 2,
      width: w,
      height: h,
      borderRadius: 48,
      backgroundColor: COLORS.white,
      boxShadow:
        "0 30px 80px rgba(10, 34, 68, 0.14), 0 6px 18px rgba(10, 34, 68, 0.08)",
      transform,
      transformOrigin: "50% 50%",
      ...style,
    }}
  >
    {children}
  </div>
);
