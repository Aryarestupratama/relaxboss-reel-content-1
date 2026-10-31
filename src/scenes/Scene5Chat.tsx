// Scene 5: RelaxMate (18,0-23,2 dtk jam penulisan). Blob ungu didengarkan dan berubah
// jadi hijau. Percakapan hanya contoh ringan (tanpa pengakuan berat).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Blob, BLOB_VISUAL_CENTER_Y } from "../components/Blob";
import { RobotSprite, type RobotState } from "../components/RobotSprite";
import { SlamTitle } from "../components/SlamTitle";
import { Splash } from "../components/Splash";
import { Typewriter } from "../components/Typewriter";
import { COLORS, EASE, FPS, MOOD_FILL, SPRING, sec } from "../theme";
import { landSquash, springIn, tween } from "../motion";
import { fontFamily } from "../fonts";
import { useVideoFrame } from "../sceneClock";
import {
  BLOB_CX,
  BLOB_CY,
  BLOB_SIZE,
  BOT_BUBBLE,
  ROBOT_H,
  ROBOT_TOP,
  ROBOT_W,
  ROBOT_X,
  USER_BUBBLE,
} from "./scene5Layout";

const hex = (h: string): number[] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number): string => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
};

const USER_TEXT = ["Capek banget", "sama skripsi."];
const BOT_TEXT = ["Kedengarannya berat.", "Mau cerita?"];
const CPS = 18;

const Dots: React.FC<{ frame: number; x: number; y: number }> = ({ frame, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", gap: 20 }}>
    {[0, 1, 2].map((i) => {
      const s = 0.75 + 0.35 * (0.5 + 0.5 * Math.sin((frame / FPS) * 9 - i * 0.9));
      return (
        <div
          key={i}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: COLORS.navy,
            transform: `scale(${s})`,
          }}
        />
      );
    })}
  </div>
);

export const Scene5Chat: React.FC = () => {
  const frame = useVideoFrame();

  // ---- Robot ----
  const walkP = tween(frame, 18.0, 18.55, 0, 1, EASE.out);
  const robotCx = 1340 + (ROBOT_X - 1340) * walkP;
  let state: RobotState = "walk";
  let stateStart = sec(18.0);
  if (frame >= sec(20.85)) {
    state = "speaking";
    stateStart = sec(20.85);
  } else if (frame >= sec(20.25)) {
    state = "thinking";
    stateStart = sec(20.25);
  } else if (frame >= sec(18.6)) {
    state = "idle";
    stateStart = sec(18.6);
  }
  const robotIn = tween(frame, 18.0, 18.2, 0, 1);

  // ---- Kapsul ----
  const capsule = springIn(frame, 18.6, SPRING.pop);
  const capsuleOut = tween(frame, 20.2, 20.4, 1, 0);

  // ---- Blob ----
  const enter = springIn(frame, 18.1, SPRING.bouncy);
  const blobDrop = 700 * (1 - enter);
  const land = landSquash(frame, 18.45);
  const toPeach = tween(frame, 20.9, 21.4, 0, 1, EASE.inOut);
  const toGreen = tween(frame, 22.0, 22.4, 0, 1, EASE.inOut);
  const fill =
    frame < sec(22.0)
      ? mix(MOOD_FILL[1], MOOD_FILL[3], toPeach)
      : mix(MOOD_FILL[3], MOOD_FILL[4], toGreen);
  const face = frame >= sec(22.2) ? 4 : frame >= sec(21.15) ? 3 : 1;
  // Pop kecil saat wajah berganti
  const popA = Math.sin(Math.PI * tween(frame, 20.9, 21.4, 0, 1));
  const hop = Math.sin(Math.PI * tween(frame, 22.0, 22.45, 0, 1));
  const lookDown = 1 - tween(frame, 20.9, 21.3, 0, 1);
  const tilt = -5 * lookDown * (frame > sec(18.5) ? 1 : 0);
  const blobSx = land.sx * (1 + 0.04 * popA) * (1 - 0.05 * hop);
  const blobSy = land.sy * (1 + 0.04 * popA) * (1 + 0.1 * hop) * (1 - 0.04 * lookDown);

  // ---- Balon ----
  const userIn = springIn(frame, 18.85, SPRING.pop);
  const botIn = springIn(frame, 20.3, SPRING.pop);
  const showDots = frame >= sec(20.3) && frame < sec(20.85);

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bgGreen, fontFamily, overflow: "hidden" }}
    >
      <SlamTitle
        lines={["Atau cerita ke", "RelaxMate."]}
        inSec={18.0}
        fontSize={96}
        style={{ top: 330 }}
      />

      {/* Balon pengguna (lavender), ekor ke blob */}
      {userIn > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: USER_BUBBLE.x,
            top: USER_BUBBLE.y,
            width: USER_BUBBLE.w,
            height: USER_BUBBLE.h,
            borderRadius: 48,
            backgroundColor: COLORS.bgLavender,
            transform: `scale(${userIn})`,
            transformOrigin: "30% 100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: BLOB_CX - USER_BUBBLE.x - 24,
              bottom: -20,
              width: 48,
              height: 48,
              backgroundColor: COLORS.bgLavender,
              transform: "rotate(45deg)",
              borderRadius: 8,
            }}
          />
          <Typewriter
            lines={USER_TEXT}
            startSec={18.95}
            charsPerSec={CPS}
            style={{
              position: "absolute",
              left: 40,
              top: 32,
              fontSize: 52,
              fontWeight: 600,
              lineHeight: "68px",
              color: COLORS.navy,
            }}
          />
        </div>
      )}

      {/* Balon RelaxMate (putih), ekor ke robot */}
      {botIn > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: BOT_BUBBLE.x,
            top: BOT_BUBBLE.y,
            width: BOT_BUBBLE.w,
            height: BOT_BUBBLE.h,
            borderRadius: 48,
            backgroundColor: COLORS.white,
            boxShadow: "0 16px 40px rgba(10,34,68,0.12)",
            transform: `scale(${botIn})`,
            transformOrigin: "70% 100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: ROBOT_X - BOT_BUBBLE.x - 24,
              bottom: -20,
              width: 48,
              height: 48,
              backgroundColor: COLORS.white,
              transform: "rotate(45deg)",
              borderRadius: 8,
            }}
          />
          {showDots ? (
            <Dots frame={frame} x={BOT_BUBBLE.w / 2 - 54} y={BOT_BUBBLE.h / 2 - 13} />
          ) : (
            frame >= sec(20.85) && (
              <Typewriter
                lines={BOT_TEXT}
                startSec={20.9}
                charsPerSec={CPS}
                style={{
                  position: "absolute",
                  left: 40,
                  top: 24,
                  fontSize: 48,
                  fontWeight: 600,
                  lineHeight: "66px",
                  color: COLORS.navy,
                }}
              />
            )
          )}
        </div>
      )}

      {/* Blob */}
      <div
        style={{
          position: "absolute",
          left: BLOB_CX - BLOB_SIZE / 2,
          top: BLOB_CY - BLOB_SIZE * BLOB_VISUAL_CENTER_Y + blobDrop - 120 * hop,
          transform: `rotate(${tilt}deg)`,
          transformOrigin: "50% 88%",
        }}
      >
        <Blob
          mood={1}
          size={BLOB_SIZE}
          fill={fill}
          face={face}
          scaleX={blobSx}
          scaleY={blobSy}
          breathe
          breathePhaseSec={0.3}
        />
      </div>
      <Splash
        x={BLOB_CX}
        y={BLOB_CY - Math.round(BLOB_SIZE * 0.37)}
        startSec={22.3}
        color={MOOD_FILL[4]}
      />

      {/* Robot */}
      <div
        style={{
          position: "absolute",
          left: robotCx - ROBOT_W / 2,
          top: ROBOT_TOP,
          opacity: robotIn,
        }}
      >
        <RobotSprite
          state={state}
          stateStartFrame={stateStart}
          frame={frame}
          height={ROBOT_H}
          flip={state === "walk"}
        />
      </div>

      {/* Kapsul */}
      {capsule > 0.001 && capsuleOut > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: ROBOT_X - 150,
            top: ROBOT_TOP - 62,
            width: 300,
            height: 52,
            borderRadius: 26,
            backgroundColor: COLORS.navy,
            color: COLORS.white,
            fontSize: 28,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: capsuleOut,
            transform: `scale(${capsule})`,
          }}
        >
          RelaxMate · AI
        </div>
      )}
    </AbsoluteFill>
  );
};
