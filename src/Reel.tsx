// Komposisi utama. Scene yang sudah dibangun dipasang di SCENE_COMPONENTS;
// sisanya masih kerangka (Placeholder) sampai step-nya dikerjakan.
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CircleReveal } from "./components/CircleReveal";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Pick } from "./scenes/Scene2Pick";
import { SceneClock, useVideoFrame } from "./sceneClock";
import { COLORS, FPS, sec } from "./theme";
import {
  DEFAULT_WIPE_ORIGIN,
  SCENES,
  WIPE_ORIGIN,
  sceneRange,
  type SceneKey,
} from "./timeline";
import { fontFamily } from "./fonts";

const Placeholder: React.FC<{
  label: string;
  index: number;
  bg: string;
  startSec: number;
}> = ({ label, index, bg, startSec }) => {
  const frame = useVideoFrame() - sec(startSec);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.navy,
      }}
    >
      <div style={{ fontSize: 40, fontWeight: 600, color: COLORS.textSecondary }}>
        Scene {index + 1} (belum dibangun)
      </div>
      <div style={{ fontSize: 112, fontWeight: 800, lineHeight: 1.05 }}>{label}</div>
      <div style={{ fontSize: 44, fontWeight: 500, marginTop: 24 }}>
        {Math.max(0, frame / FPS).toFixed(1)} dtk
      </div>
    </AbsoluteFill>
  );
};

const BUILT: Partial<Record<SceneKey, React.FC>> = {
  hook: Scene1Hook,
  pick: Scene2Pick,
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bgCream }}>
    {SCENES.map((s, i) => {
      const { from, duration } = sceneRange(i);
      const Scene = BUILT[s.key];
      const content = Scene ? (
        <Scene />
      ) : (
        <Placeholder label={s.label} index={i} bg={s.bg} startSec={s.startSec} />
      );
      const origin = WIPE_ORIGIN[s.key] ?? DEFAULT_WIPE_ORIGIN;
      return (
        <Sequence key={s.key} name={s.label} from={from} durationInFrames={duration}>
          <SceneClock fromFrame={from}>
            {i === 0 ? (
              content
            ) : (
              <CircleReveal cx={origin.x} cy={origin.y}>
                {content}
              </CircleReveal>
            )}
          </SceneClock>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
