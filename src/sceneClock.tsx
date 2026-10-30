// Jam scene. Storyboard menulis waktu relatif terhadap BATAS scene, sedangkan scene
// yang masuk sudah tampil sejak transisi mulai (0,25 dtk sebelum batas). Reel membungkus
// tiap scene dengan SceneClock; di dalam scene, useSceneFrame() bernilai 0 tepat di batas
// scene dan negatif selama transisi masuk.
import React, { createContext, useContext, type ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { sec } from "./theme";

const LeadContext = createContext(0);

export const SceneClock: React.FC<{ leadSec: number; children: ReactNode }> = ({
  leadSec,
  children,
}) => <LeadContext.Provider value={leadSec}>{children}</LeadContext.Provider>;

/** Frame relatif terhadap batas awal scene (negatif saat transisi masuk). */
export const useSceneFrame = (): number => {
  const frame = useCurrentFrame();
  return frame - sec(useContext(LeadContext));
};
