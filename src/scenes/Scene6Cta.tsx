// Scene 6: CTA (23,2-27,0 dtk jam penulisan). Satu tindakan: buka website.
// Frame akhir hampir diam supaya URL terbaca.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Blob, BLOB_VISUAL_CENTER_Y } from "../components/Blob";
import { SlamTitle } from "../components/SlamTitle";
import { TapCursor } from "../components/TapCursor";
import { COLORS, EASE, SPRING, MOOD_LEVELS } from "../theme";
import { springIn, tween } from "../motion";
import { fontFamily } from "../fonts";
import { useVideoFrame } from "../sceneClock";
import { sec } from "../theme";

const LOGO_Y = 600;
const SUB_Y = 1000;
const PILL = { w: 760, h: 120, cy: 1120 };
const BLOB_SIZE = 150;
const BLOB_CY = 1330;
const BLOB_X = [172, 356, 540, 724, 908];

export const Scene6Cta: React.FC = () => {
  const frame = useVideoFrame();

  const logoS = 0.6 + 0.4 * springIn(frame, 23.2, SPRING.bouncy);
  const logoO = tween(frame, 23.2, 23.4, 0, 1);

  const subP = tween(frame, 24.1, 24.5, 0, 1, EASE.out);
  const discO = tween(frame, 24.3, 24.6, 0, 1);

  const rise = springIn(frame, 24.4, SPRING.pop);
  const press = Math.sin(Math.PI * tween(frame, 25.0, 25.3, 0, 1));
  const pillScale = 1 - 0.04 * press;
  const pillY = 400 * (1 - rise);

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.bgLavender, fontFamily, overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          left: 540 - 120,
          top: LOGO_Y - 120,
          width: 240,
          height: 240,
          borderRadius: 56,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(10,34,68,0.18)",
          opacity: logoO,
          transform: `scale(${logoS})`,
        }}
      >
        <Img
          src={staticFile("images/logo-relaxboss.png")}
          style={{ width: 240, height: 240, display: "block" }}
        />
      </div>

      <SlamTitle
        lines={["Mulai tenang."]}
        inSec={23.6}
        fontSize={112}
        style={{ top: 790 }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          top: SUB_Y - 36,
          textAlign: "center",
          fontSize: 52,
          fontWeight: 600,
          color: COLORS.navy,
          opacity: subP,
          transform: `translateY(${20 * (1 - subP)}px)`,
        }}
      >
        Gratis. Langsung dari browser.
      </div>

      {/* Pill URL */}
      <div
        style={{
          position: "absolute",
          left: 540 - PILL.w / 2,
          top: PILL.cy - PILL.h / 2,
          width: PILL.w,
          height: PILL.h,
          borderRadius: 60,
          backgroundColor: COLORS.white,
          boxShadow: "0 20px 50px rgba(10,34,68,0.16)",
          transform: `translateY(${pillY}px) scale(${pillScale})`,
          opacity: tween(frame, 24.4, 24.6, 0, 1),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 0,
            height: PILL.h,
            display: "flex",
            alignItems: "center",
            fontSize: 48,
            fontWeight: 600,
            color: COLORS.navy,
          }}
        >
          relaxboss.my.id
        </div>
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: COLORS.navy,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M8 22h27M23 10l12 12-12 12"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Lima blob melompat bergelombang */}
      {MOOD_LEVELS.map((m, i) => {
        const start = 24.75 + i * 0.12;
        const t = (frame - sec(start)) / sec(0.45);
        const inRound = t >= 0 && t < 3;
        const ph = inRound ? (t % 1) / 0.8 : 1;
        const hop = ph < 1 ? Math.sin(Math.PI * ph) : 0;
        const appear = tween(frame, 24.75 + i * 0.08, 25.0 + i * 0.08, 0, 1);
        return (
          <div
            key={m}
            style={{
              position: "absolute",
              left: BLOB_X[i] - BLOB_SIZE / 2,
              top: BLOB_CY - BLOB_SIZE * BLOB_VISUAL_CENTER_Y - 36 * hop,
              opacity: appear,
            }}
          >
            <Blob
              mood={m}
              size={BLOB_SIZE}
              scaleX={1 - 0.05 * hop}
              scaleY={1 + 0.08 * hop}
            />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          top: 1424,
          textAlign: "center",
          fontSize: 36,
          fontWeight: 500,
          lineHeight: "48px",
          color: COLORS.textSecondary,
          opacity: discO,
        }}
      >
        <div>Bukan layanan medis dan</div>
        <div>bukan pengganti psikolog.</div>
      </div>

      <TapCursor
        from={{ x: 940, y: 1500 }}
        via={{ x: 900, y: 1250 }}
        to={{ x: 700, y: PILL.cy }}
        moveStartSec={24.6}
        moveEndSec={25.0}
        tapSec={25.0}
      />
    </AbsoluteFill>
  );
};
