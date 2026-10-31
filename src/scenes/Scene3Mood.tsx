// Scene 3: Mood Tracker (6,6-12,4 dtk). Storyboard bagian 4.
// Blob ungu masuk ke kartu "Mood hari ini", penonton memilih tenaga dan menyimpan,
// kamera bergeser ke kartu "7 hari terakhir" yang grafiknya tergambar.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Blob, BLOB_VISUAL_CENTER_Y } from "../components/Blob";
import { Card } from "../components/Card";
import { MoodChart } from "../components/MoodChart";
import { Pill } from "../components/Pill";
import { SlamTitle } from "../components/SlamTitle";
import { TapCursor } from "../components/TapCursor";
import { COLORS, EASE, FPS, SPRING, type MoodLevel } from "../theme";
import { springIn, tween } from "../motion";
import { fontFamily } from "../fonts";
import { useVideoFrame } from "../sceneClock";
import { sceneRange } from "../timeline";
import {
  BUTTON,
  CAMERA_END_SCALE,
  CARD1,
  CARD2,
  CARD_CY,
  CHIP,
  MINI,
  MINI_X,
  MINI_Y,
  SCREEN_CENTER,
  cardToScreen,
} from "./scene3Layout";

const BREATH_PHASE_SEC = -sceneRange(2).from / FPS;
const PURPLE_START_SIZE = 260; // ukuran blob ungu di akhir Scene 2
const SHIFT_PX = 1100; // jarak geser kartu keluar/masuk saat kamera bergeser

const CHECK_PATH = "M14 34 L28 48 L50 18";

export const Scene3Mood: React.FC = () => {
  const frame = useVideoFrame();

  // ---- Kamera: dorongan pelan sepanjang scene ----
  const camera = tween(frame, 6.6, 12.4, 1, CAMERA_END_SCALE, EASE.inOut);

  // ---- Kartu 1: naik dari bawah (spring lembut), miring 4 derajat lalu mendatar ----
  const s = springIn(frame, 6.6, SPRING.soft);
  const rise = 1100 * (1 - s);
  const tilt = 4 * (1 - s);
  // ---- Geser kamera 8,90-9,50: kartu 1 keluar kiri, kartu 2 masuk kanan ----
  const q = tween(frame, 8.9, 9.5, 0, 1, EASE.inOut);
  const c1x = -SHIFT_PX * q;
  const c1scale = 1 - 0.2 * q;
  const c2x = SHIFT_PX * (1 - q);
  const c2scale = 0.9 + 0.1 * q;

  // ---- Blob ungu: dari posisi Scene 2 (layar) ke slot 1 di kartu ----
  // Dihitung dalam koordinat lokal kartu agar di layar posisinya tetap kontinu
  // walau kartu sedang naik dan berputar.
  const th = (tilt * Math.PI) / 180;
  const dx = SCREEN_CENTER.x - (SCREEN_CENTER.x + c1x);
  const dy = SCREEN_CENTER.y - (CARD_CY + rise);
  const startLocal = {
    x: (dx * Math.cos(th) + dy * Math.sin(th)) / c1scale + CARD1.w / 2,
    y: (-dx * Math.sin(th) + dy * Math.cos(th)) / c1scale + CARD1.h / 2,
  };
  const purpleX = startLocal.x + (MINI_X[0] - startLocal.x) * s;
  const purpleY = startLocal.y + (MINI_Y - startLocal.y) * s;
  const purpleSize = PURPLE_START_SIZE + (MINI - PURPLE_START_SIZE) * s;

  // ---- Isi kartu 1 ----
  const lelah = tween(frame, 7.4, 7.55, 0, 1);
  const ring = tween(frame, 7.0, 7.3, 0, 1, EASE.out);
  const btnIn = tween(frame, 8.2, 8.5, 0, 1, EASE.out);
  const btnPress =
    tween(frame, 8.6, 8.7, 1, 0.95) + tween(frame, 8.7, 8.85, 0, 0.05);
  const labelToCheck = tween(frame, 8.62, 8.76, 0, 1);
  const checkPop = springIn(frame, 8.6, SPRING.pop);

  const lelahCenter = cardToScreen(CARD1, CHIP.lelahX + CHIP.w / 2, CHIP.y + CHIP.h / 2);
  const buttonCenter = cardToScreen(CARD1, BUTTON.x + BUTTON.w / 2, BUTTON.y + BUTTON.h / 2);

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bgBlue, fontFamily, overflow: "hidden" }}
    >
      <SlamTitle
        lines={["Lihat polanya,", "hari demi hari."]}
        inSec={6.9}
        fontSize={96}
        style={{ top: 300 }}
      />

      <AbsoluteFill
        style={{
          transform: `scale(${camera})`,
          transformOrigin: `${SCREEN_CENTER.x}px ${SCREEN_CENTER.y}px`,
        }}
      >
        {/* ---------- Kartu 1: Mood hari ini ---------- */}
        <Card
          w={CARD1.w}
          h={CARD1.h}
          cx={SCREEN_CENTER.x}
          cy={CARD_CY}
          transform={`translate(${c1x}px, ${rise}px) rotate(${tilt}deg) scale(${c1scale})`}
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
            Mood hari ini
          </div>

          {/* Blob mini 2-5: muncul (pop) setelah kartu hampir diam */}
          {[2, 3, 4, 5].map((m, i) => {
            const pop = springIn(frame, 7.0 + i * 0.07, SPRING.bouncy);
            if (pop <= 0.001) return null;
            return (
              <div
                key={m}
                style={{
                  position: "absolute",
                  left: MINI_X[m - 1] - MINI / 2,
                  top: MINI_Y - MINI * BLOB_VISUAL_CENTER_Y,
                }}
              >
                <Blob
                  mood={m as MoodLevel}
                  size={MINI}
                  scaleX={pop}
                  scaleY={pop}
                  breathe
                  breathePhaseSec={0.4 * m}
                />
              </div>
            );
          })}

          {/* Cincin pilihan navy 8 px di sekitar blob ungu */}
          {ring > 0 && (
            <div
              style={{
                position: "absolute",
                left: MINI_X[0] - 68,
                top: MINI_Y - 68,
                width: 136,
                height: 136,
                boxSizing: "border-box",
                borderRadius: "50%",
                border: `8px solid ${COLORS.navy}`,
                opacity: ring,
                transform: `scale(${0.7 + 0.3 * ring})`,
              }}
            />
          )}

          {/* Blob ungu: tetap tegak walau kartu miring */}
          <div
            style={{
              position: "absolute",
              left: purpleX - purpleSize / 2,
              top: purpleY - purpleSize * BLOB_VISUAL_CENTER_Y,
              transform: `rotate(${-tilt}deg)`,
            }}
          >
            <Blob
              mood={1}
              size={purpleSize}
              breathe
              breathePhaseSec={BREATH_PHASE_SEC}
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: 48,
              top: 296,
              fontSize: 28,
              fontWeight: 600,
              color: COLORS.textSecondary,
            }}
          >
            Tenaga
          </div>
          <Pill label="Bertenaga" x={CHIP.energiX} y={CHIP.y} w={CHIP.w} h={CHIP.h} />
          <Pill
            label="Lelah"
            x={CHIP.lelahX}
            y={CHIP.y}
            w={CHIP.w}
            h={CHIP.h}
            selected={lelah}
          />

          {btnIn > 0 && (
            <div
              style={{
                position: "absolute",
                left: BUTTON.x,
                top: BUTTON.y,
                width: BUTTON.w,
                height: BUTTON.h,
                borderRadius: BUTTON.h / 2,
                backgroundColor: COLORS.navy,
                color: COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 600,
                opacity: btnIn,
                transform: `scale(${(0.9 + 0.1 * btnIn) * btnPress})`,
              }}
            >
              <span style={{ opacity: 1 - labelToCheck }}>Simpan</span>
              <svg
                width={64}
                height={64}
                viewBox="0 0 64 64"
                style={{
                  position: "absolute",
                  opacity: labelToCheck,
                  transform: `scale(${checkPop})`,
                }}
              >
                <path
                  d={CHECK_PATH}
                  fill="none"
                  stroke={COLORS.white}
                  strokeWidth={9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </Card>

        {/* ---------- Kartu 2: 7 hari terakhir ---------- */}
        {q > 0 && (
          <Card
            w={CARD2.w}
            h={CARD2.h}
            cx={SCREEN_CENTER.x}
            cy={CARD_CY}
            transform={`translate(${c2x}px, 0px) scale(${c2scale})`}
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
              7 hari terakhir
            </div>
            <MoodChart
              width={CARD2.w}
              height={CARD2.h}
              drawStartSec={9.6}
              drawEndSec={11.0}
              pulseStartSec={11.0}
            />
          </Card>
        )}

        <TapCursor
          from={{ x: 960, y: 1520 }}
          via={{ x: 900, y: 1210 }}
          to={lelahCenter}
          moveStartSec={6.85}
          moveEndSec={7.4}
          tapSec={7.4}
        />
        <TapCursor
          from={{ x: 880, y: 1120 }}
          via={{ x: 880, y: 1330 }}
          to={buttonCenter}
          moveStartSec={8.05}
          moveEndSec={8.6}
          tapSec={8.6}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
