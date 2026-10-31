// Jam video. Storyboard menulis waktu ABSOLUT dari awal video (mis. "Scene 2, tap pada 5,00").
// Reel membungkus tiap scene dengan SceneClock yang tahu di frame berapa Sequence-nya mulai;
// di dalam scene, useVideoFrame() mengembalikan frame absolut video, sehingga angka
// storyboard dipakai apa adanya. Scene yang masuk sudah tampil 0,25 dtk sebelum batas
// scene (transisi), jadi frame-nya sudah > 0 pada saat itu.
import React, { createContext, useContext, type ReactNode } from "react";
import { useCurrentFrame } from "remotion";

const FromContext = createContext(0);

export const SceneClock: React.FC<{ fromFrame: number; children: ReactNode }> = ({
  fromFrame,
  children,
}) => <FromContext.Provider value={fromFrame}>{children}</FromContext.Provider>;

/** Frame absolut video (0 = awal video), terlepas dari Sequence tempat scene dipasang. */
export const useVideoFrame = (): number => useCurrentFrame() + useContext(FromContext);
