// Scene 4: Asesmen (12,4-18,0 dtk jam penulisan). Storyboard bagian 4.
// Kartu pertanyaan (satu pertanyaan contoh, jawaban dipilih), lalu kartu "Hasil Asesmen"
// dengan bar per subskala dan tag "Bukan diagnosis".
// Semua isi adalah CONTOH buatan, bukan butir Instrumen asli (OQ-1).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Card } from "../components/Card";
import { Pill } from "../components/Pill";
import { ScoreRow } from "../components/ScoreRow";
import { SlamTitle } from "../components/SlamTitle";
import { TapCursor } from "../components/TapCursor";
import { COLORS, EASE, MOOD_FILL, SPRING, sec } from "../theme";
import { springIn, tween } from "../motion";
import { fontFamily } from "../fonts";
import { useVideoFrame } from "../sceneClock";
import {
  ANSWER,
  CAMERA_END_SCALE,
  CARD_CY,
  CARD_Q,
  CARD_R,
  PROGRESS,
  QUESTION_Y,
  RESULT,
  SCREEN_CENTER,
  answerTop,
  cardToScreen,
} from "./scene4Layout";

const RESULT_ROWS = [
  { label: "Stres", category: "Sedang", color: MOOD_FILL[3], pct: 0.6 },
  { label: "Kecemasan", category: "Ringan", color: MOOD_FILL[2], pct: 0.35 },
  { label: "Kelelahan", category: "Sedang", color: MOOD_FILL[1], pct: 0.55 },
] as const;

export const Scene4Assess: React.FC = () => {
  const frame = useVideoFrame();

  const camera = tween(frame, 12.4, 18.0, 1, CAMERA_END_SCALE, EASE.inOut);

  // ---- Kartu pertanyaan: naik dari bawah, miring -3 derajat lalu mendatar ----
  const s = springIn(frame, 12.4, SPRING.soft);
  const qRise = 1200 * (1 - s);
  const qTilt = -3 * (1 - s);
  // Keluar 14,80-15,40: mengecil ke 0,6 dan terbang ke kiri atas
  const out = tween(frame, 14.8, 15.4, 0, 1, EASE.inOut);
  const outFade = tween(frame, 14.9, 15.4, 1, 0);

  // ---- Kartu hasil: naik dari bawah pada 14,80 ----
  const sR = springIn(frame, 14.8, SPRING.soft);
  const rRise = 1300 * (1 - sR);
  const rTilt = 3 * (1 - sR);
  const showResult = frame >= sec(14.8);

  // ---- Isi kartu pertanyaan ----
  const chosen = tween(frame, 13.8, 13.95, 0, 1);
  const progress = tween(frame, 14.0, 14.6, PROGRESS.from, 1);

  // ---- Tag "Bukan diagnosis" ----
  const tag = springIn(frame, 17.0, SPRING.pop);

  const answerCenter = cardToScreen(
    CARD_Q,
    ANSWER.x + ANSWER.w / 2,
    answerTop(ANSWER.chosen) + ANSWER.h / 2,
  );

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bgPeach, fontFamily, overflow: "hidden" }}
    >
      <SlamTitle
        lines={["Kenali", "kondisimu dulu."]}
        inSec={12.7}
        fontSize={96}
        style={{ top: 300 }}
      />

      <AbsoluteFill
        style={{
          transform: `scale(${camera})`,
          transformOrigin: `${SCREEN_CENTER.x}px ${SCREEN_CENTER.y}px`,
        }}
      >
        {/* ---------- Kartu pertanyaan ---------- */}
        {out < 1 && (
          <Card
            w={CARD_Q.w}
            h={CARD_Q.h}
            cx={SCREEN_CENTER.x}
            cy={CARD_CY}
            style={{ opacity: outFade }}
            transform={`translate(${-760 * out}px, ${qRise - 700 * out}px) rotate(${qTilt}deg) scale(${1 - 0.4 * out})`}
          >
            <div
              style={{
                position: "absolute",
                left: 48,
                top: 44,
                fontSize: 28,
                fontWeight: 600,
                color: COLORS.textSecondary,
              }}
            >
              Asesmen
            </div>
            <div
              style={{
                position: "absolute",
                left: PROGRESS.x,
                top: PROGRESS.y,
                width: PROGRESS.w,
                height: PROGRESS.h,
                borderRadius: PROGRESS.h / 2,
                backgroundColor: "#EEF2F8",
              }}
            >
              <div
                style={{
                  width: PROGRESS.w * progress,
                  height: PROGRESS.h,
                  borderRadius: PROGRESS.h / 2,
                  backgroundColor: COLORS.navy,
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: 48,
                top: QUESTION_Y,
                width: 784,
                fontSize: 52,
                fontWeight: 800,
                lineHeight: 1.15,
                color: COLORS.navy,
              }}
            >
              <div>Seminggu terakhir,</div>
              <div>aku merasa kewalahan.</div>
            </div>
            {ANSWER.labels.map((label, i) => (
              <Pill
                key={label}
                label={label}
                x={ANSWER.x}
                y={answerTop(i)}
                w={ANSWER.w}
                h={ANSWER.h}
                selected={i === ANSWER.chosen ? chosen : 0}
              />
            ))}
          </Card>
        )}

        {/* ---------- Kartu hasil ---------- */}
        {showResult && (
          <Card
            w={CARD_R.w}
            h={CARD_R.h}
            cx={SCREEN_CENTER.x}
            cy={CARD_CY}
            transform={`translate(0px, ${rRise}px) rotate(${rTilt}deg)`}
          >
            <div
              style={{
                position: "absolute",
                left: 48,
                top: 44,
                fontSize: 40,
                fontWeight: 800,
                color: COLORS.navy,
              }}
            >
              Hasil Asesmen
            </div>
            {RESULT_ROWS.map((r, i) => (
              <ScoreRow
                key={r.label}
                label={r.label}
                category={r.category}
                color={r.color}
                pct={r.pct}
                x={RESULT.barX}
                y={RESULT.rowY[i]}
                width={RESULT.barW}
                barHeight={RESULT.barH}
                barOffset={RESULT.barOffset}
                fillStartSec={15.5 + i * 0.25}
                fillDurationSec={0.8}
              />
            ))}
            {tag > 0.001 && (
              <div
                style={{
                  position: "absolute",
                  left: (CARD_R.w - 340) / 2,
                  top: RESULT.tagY,
                  width: 340,
                  height: 64,
                  boxSizing: "border-box",
                  borderRadius: 32,
                  border: `3px solid ${COLORS.navy}`,
                  backgroundColor: COLORS.white,
                  color: COLORS.navy,
                  fontSize: 32,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${tag})`,
                }}
              >
                Bukan diagnosis
              </div>
            )}
          </Card>
        )}

        <TapCursor
          from={{ x: 940, y: 1540 }}
          via={{ x: 900, y: 1320 }}
          to={answerCenter}
          moveStartSec={13.25}
          moveEndSec={13.8}
          tapSec={13.8}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
