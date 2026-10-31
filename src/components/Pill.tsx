// Pil/chip/tombol bulat. `selected` 0 -> 1 mengubah warna dari abu-biru ke navy.
import React, { type CSSProperties, type ReactNode } from "react";
import { interpolateColors } from "remotion";
import { COLORS } from "../theme";

type Props = {
  label: ReactNode;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 0 = belum dipilih, 1 = terpilih (navy, teks putih). */
  selected?: number;
  fontSize?: number;
  style?: CSSProperties;
};

export const Pill: React.FC<Props> = ({
  label,
  x,
  y,
  w,
  h,
  selected = 0,
  fontSize = 44,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: h / 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize,
      fontWeight: 600,
      backgroundColor: interpolateColors(selected, [0, 1], ["#EEF2F8", COLORS.navy]),
      color: interpolateColors(selected, [0, 1], [COLORS.navy, COLORS.white]),
      ...style,
    }}
  >
    {label}
  </div>
);
