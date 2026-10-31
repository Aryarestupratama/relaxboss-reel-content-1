// Teks yang diketik per karakter. Tata letak dihitung dari teks PENUH (bagian yang
// belum diketik transparan), jadi teks rata tengah tidak bergeser saat mengetik.
// Kursor solid saat mengetik, berkedip tiap 0,4 dtk saat diam.
import React, { type CSSProperties } from "react";
import { COLORS, sec } from "../theme";
import { typedLength } from "../motion";
import { useVideoFrame } from "../sceneClock";

type Props = {
  /** Satu elemen per baris. Spasi antar-baris dihitung sebagai satu karakter. */
  lines: string[];
  startSec: number;
  charsPerSec?: number;
  style?: CSSProperties;
  cursorColor?: string;
};

export const Typewriter: React.FC<Props> = ({
  lines,
  startSec,
  charsPerSec = 13,
  style,
  cursorColor = COLORS.navy,
}) => {
  const frame = useVideoFrame();
  const fullText = lines.join(" ");
  const n = typedLength(frame, startSec, fullText, charsPerSec);
  const typing = frame >= sec(startSec) && n < fullText.length;

  const offsets: number[] = [];
  lines.reduce((acc, line) => {
    offsets.push(acc);
    return acc + line.length + 1;
  }, 0);

  // Baris aktif = baris terakhir yang sudah dimulai.
  let active = 0;
  offsets.forEach((o, i) => {
    if (n >= o) active = i;
  });

  const blinkOn = (((Math.floor(frame / sec(0.4)) % 2) + 2) % 2) === 0;
  // Kursor baru muncul saat mengetik mulai; sebelum itu frame pertama tetap bersih.
  const cursorVisible = frame >= sec(startSec) && (typing || blinkOn);

  return (
    <div style={style}>
      {lines.map((line, i) => {
        const typed = Math.max(0, Math.min(line.length, n - offsets[i]));
        const showCursor = i === active && cursorVisible;
        return (
          <div key={i} style={{ whiteSpace: "pre" }}>
            <span>{line.slice(0, typed)}</span>
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                position: "relative",
                width: 0,
                height: "1em",
                verticalAlign: "text-bottom",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "0.04em",
                  top: "0.08em",
                  width: "0.07em",
                  height: "0.84em",
                  borderRadius: "0.04em",
                  backgroundColor: cursorColor,
                  opacity: showCursor ? 1 : 0,
                }}
              />
            </span>
            <span style={{ color: "transparent" }}>{line.slice(typed)}</span>
          </div>
        );
      })}
    </div>
  );
};
