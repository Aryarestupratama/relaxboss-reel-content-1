// Jam scene. Di dalam scene, useVideoFrame() mengembalikan frame "jam penulisan" scene itu
// (angka detik di file scene), yang berjalan lebih lambat dari waktu nyata sebesar `speed`.
// Sequence scene mulai 0,3 dtk sebelum batas scene (transisi), jadi frame awalnya sudah
// berada sebelum authStart.
import React, { createContext, useContext, type ReactNode } from "react";
import { useCurrentFrame } from "remotion";

type Clock = { base: number; speed: number };
const ClockContext = createContext<Clock>({ base: 0, speed: 1 });

export const SceneClock: React.FC<{
  base: number;
  speed: number;
  children: ReactNode;
}> = ({ base, speed, children }) => (
  <ClockContext.Provider value={{ base, speed }}>{children}</ClockContext.Provider>
);

/** Frame jam penulisan scene (boleh pecahan). */
export const useVideoFrame = (): number => {
  const { base, speed } = useContext(ClockContext);
  return useCurrentFrame() / speed + base;
};

/** Faktor perlambatan scene (detik nyata per detik penulisan). */
export const useSceneSpeed = (): number => useContext(ClockContext).speed;
