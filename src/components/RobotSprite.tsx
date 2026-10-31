// Robot RelaxMate dari sprite sheet 8 frame (2560 x 460, tiap frame 320 x 460).
import React from "react";
import { Img, staticFile } from "remotion";
import { FPS } from "../theme";

export type RobotState = "walk" | "idle" | "thinking" | "speaking";

type Props = {
  state: RobotState;
  /** Frame (jam scene) saat state ini dimulai, supaya animasi mulai dari frame 0. */
  stateStartFrame: number;
  frame: number;
  height: number;
  /** Cermin horizontal (sprite walk menghadap kanan). */
  flip?: boolean;
  fps?: number;
};

export const RobotSprite: React.FC<Props> = ({
  state,
  stateStartFrame,
  frame,
  height,
  flip = false,
  fps = state === "walk" ? 12 : 8,
}) => {
  const w = Math.round((height * 320) / 460);
  const idx = Math.max(0, Math.floor(((frame - stateStartFrame) / FPS) * fps)) % 8;
  return (
    <div
      style={{
        width: w,
        height,
        overflow: "hidden",
        transform: flip ? "scaleX(-1)" : undefined,
        position: "relative",
      }}
    >
      <Img
        src={staticFile(`images/relaxmate/${state}.webp`)}
        style={{
          position: "absolute",
          left: -idx * w,
          top: 0,
          width: w * 8,
          height,
          imageRendering: "pixelated",
          maxWidth: "none",
        }}
      />
    </div>
  );
};
