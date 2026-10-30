// Satu-satunya tempat font dimuat. Plus Jakarta Sans = font website RelaxBoss.
// File woff2 ada di public/fonts (lisensi OFL, lihat OFL-LICENSE.txt), jadi
// render tidak bergantung pada internet.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontFamily = "Plus Jakarta Sans";

const WEIGHTS = [500, 600, 800] as const;

WEIGHTS.forEach((weight) => {
  loadFont({
    family: fontFamily,
    url: staticFile(`fonts/plus-jakarta-sans-latin-${weight}-normal.woff2`),
    weight: String(weight),
    format: "woff2",
  }).catch((err) => {
    throw new Error(`Gagal memuat font Plus Jakarta Sans ${weight}: ${err}`);
  });
});
