// Scene Artikel (jam penulisan 0-5,8 dtk). Meniru halaman /artikel di website: kolom cari,
// pill kategori, kartu artikel. Judul artikel adalah CONTOH buatan, bukan artikel asli.
import React from "react";
import { AbsoluteFill } from "remotion";
import { SlamTitle } from "../components/SlamTitle";
import { TapCursor } from "../components/TapCursor";
import { Typewriter } from "../components/Typewriter";
import { COLORS, EASE, SPRING, sec } from "../theme";
import { springIn, tween } from "../motion";
import { fontFamily } from "../fonts";
import { useVideoFrame } from "../sceneClock";
import { CARD, PILLS_Y, PILL_H, READ_BTN, SEARCH } from "./scene7Layout";

const PILLS = [
  { label: "Semua", w: 150 },
  { label: "Stres", w: 126 },
  { label: "Tidur", w: 126 },
  { label: "Kecemasan", w: 220 },
  { label: "Burnout", w: 176 },
];
const PILL_GAP = 14;

type Item = { category: string; title: string; date: string };
const BEFORE: Item[] = [
  { category: "Stres", title: "Saat pikiran terasa penuh", date: "12 Mei 2026" },
  { category: "Burnout", title: "Mengenal kelelahan emosional", date: "3 Mei 2026" },
];
const AFTER: Item[] = [
  { category: "Tidur", title: "Rutinitas tidur yang ramah", date: "20 Mei 2026" },
  { category: "Tidur", title: "Sulit tidur saat banyak pikiran", date: "8 Mei 2026" },
];

const DocIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path
      d="M10 4h11l7 7v19a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
      stroke={COLORS.navy}
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <path d="M21 4v7h7M13 18h10M13 24h10" stroke={COLORS.navy} strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

const ArticleCard: React.FC<{ item: Item; y: number; pressed?: number }> = ({ item, y, pressed = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: CARD.x,
      top: y,
      width: CARD.w,
      height: CARD.h,
      borderRadius: 48,
      backgroundColor: COLORS.white,
      boxShadow: "0 24px 60px rgba(10,34,68,0.13), 0 6px 16px rgba(10,34,68,0.07)",
      transform: `scale(${1 - 0.03 * pressed})`,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 36,
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: COLORS.bgLavender,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DocIcon />
    </div>
    <div
      style={{
        position: "absolute",
        right: 40,
        top: 50,
        height: 48,
        padding: "0 24px",
        borderRadius: 24,
        backgroundColor: COLORS.bgLavender,
        color: COLORS.navy,
        fontSize: 28,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
      }}
    >
      {item.category}
    </div>
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 140,
        width: 800,
        fontSize: 52,
        fontWeight: 800,
        lineHeight: 1.12,
        color: COLORS.navy,
      }}
    >
      {item.title}
    </div>
    <div style={{ position: "absolute", left: 40, right: 40, top: 246, height: 2, backgroundColor: "#E6EBF3" }} />
    <div style={{ position: "absolute", left: 40, top: 266, fontSize: 28, fontWeight: 500, color: COLORS.textSecondary }}>
      {item.date}
    </div>
    <div
      style={{
        position: "absolute",
        right: 40,
        top: 258,
        fontSize: 36,
        fontWeight: 600,
        color: COLORS.navy,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      Baca
      <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
        <path d="M8 22h27M23 10l12 12-12 12" stroke={COLORS.navy} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

export const Scene7Article: React.FC = () => {
  const frame = useVideoFrame();

  const camera = tween(frame, 0.3, 5.8, 1, 1.03, EASE.inOut);

  const searchIn = springIn(frame, 0.8, SPRING.soft);
  const pillsIn = springIn(frame, 1.0, SPRING.soft);
  const c0 = springIn(frame, 1.15, SPRING.soft);
  const c1 = springIn(frame, 1.3, SPRING.soft);

  const focus = tween(frame, 2.3, 2.45, 0, 1);
  const typingStarted = frame >= sec(2.5);

  // Daftar berganti saat pencarian selesai diketik
  const swap = tween(frame, 3.3, 3.8, 0, 1, EASE.inOut);
  const after = swap > 0;
  const press = Math.sin(Math.PI * tween(frame, 4.8, 5.1, 0, 1));

  const rise = (p: number) => 520 * (1 - p);

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bgYellow, fontFamily, overflow: "hidden" }}
    >
      <SlamTitle
        lines={["Pahami dirimu", "lewat artikel."]}
        inSec={0.3}
        fontSize={96}
        style={{ top: 300 }}
      />

      <AbsoluteFill style={{ transform: `scale(${camera})`, transformOrigin: "540px 960px" }}>
        {/* Kolom cari */}
        <div
          style={{
            position: "absolute",
            left: SEARCH.x,
            top: SEARCH.y,
            width: SEARCH.w,
            height: SEARCH.h,
            boxSizing: "border-box",
            borderRadius: SEARCH.h / 2,
            backgroundColor: COLORS.white,
            border: `${2 + 3 * focus}px solid ${focus > 0.5 ? COLORS.navy : "#D9DFEA"}`,
            boxShadow: "0 14px 36px rgba(10,34,68,0.10)",
            transform: `translateY(${rise(searchIn)}px)`,
            opacity: Math.min(1, searchIn * 2),
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            style={{ position: "absolute", left: 40, top: 32 }}
          >
            <circle cx="19" cy="19" r="12" stroke={COLORS.textSecondary} strokeWidth="4" />
            <path d="M28 28l10 10" stroke={COLORS.textSecondary} strokeWidth="4" strokeLinecap="round" />
          </svg>
          {!typingStarted && (
            <div
              style={{
                position: "absolute",
                left: 112,
                top: 0,
                height: SEARCH.h,
                display: "flex",
                alignItems: "center",
                fontSize: 44,
                fontWeight: 500,
                color: COLORS.textSecondary,
              }}
            >
              Cari judul atau kategori
            </div>
          )}
          <Typewriter
            lines={["tidur"]}
            startSec={2.5}
            charsPerSec={5}
            style={{
              position: "absolute",
              left: 112,
              top: 22,
              fontSize: 52,
              fontWeight: 600,
              color: COLORS.navy,
            }}
          />
        </div>

        {/* Pill kategori */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: PILLS_Y,
            display: "flex",
            justifyContent: "center",
            gap: PILL_GAP,
            transform: `translateY(${rise(pillsIn)}px)`,
            opacity: Math.min(1, pillsIn * 2),
          }}
        >
          {PILLS.map((p, i) => (
            <div
              key={p.label}
              style={{
                width: p.w,
                height: PILL_H,
                borderRadius: PILL_H / 2,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 600,
                backgroundColor: i === 0 ? COLORS.navy : COLORS.white,
                color: i === 0 ? COLORS.white : COLORS.navy,
                border: i === 0 ? "none" : "2px solid #D9DFEA",
              }}
            >
              {p.label}
            </div>
          ))}
        </div>

        {/* Kartu: daftar awal keluar, daftar hasil cari masuk */}
        {[0, 1].map((i) => {
          const inP = i === 0 ? c0 : c1;
          const baseY = CARD.y[i];
          return (
            <React.Fragment key={i}>
              {swap < 1 && (
                <div
                  style={{
                    opacity: (1 - swap) * Math.min(1, inP * 2),
                    transform: `translate(${-120 * swap}px, ${rise(inP)}px)`,
                  }}
                >
                  <ArticleCard item={BEFORE[i]} y={baseY} />
                </div>
              )}
              {after && (
                <div
                  style={{
                    opacity: swap,
                    transform: `translateY(${60 * (1 - swap)}px)`,
                  }}
                >
                  <ArticleCard item={AFTER[i]} y={baseY} pressed={i === 0 ? press : 0} />
                </div>
              )}
            </React.Fragment>
          );
        })}

        <TapCursor
          from={{ x: 940, y: 1500 }}
          via={{ x: 900, y: 1000 }}
          to={{ x: 620, y: SEARCH.y + SEARCH.h / 2 }}
          moveStartSec={1.7}
          moveEndSec={2.3}
          tapSec={2.3}
        />
        <TapCursor
          from={{ x: 700, y: 700 }}
          via={{ x: 900, y: 900 }}
          to={{ x: READ_BTN.x, y: READ_BTN.y }}
          moveStartSec={4.2}
          moveEndSec={4.8}
          tapSec={4.8}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
