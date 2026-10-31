# relaxboss-reel

Video motion RelaxBoss untuk Instagram Reels, dibuat dengan [Remotion](https://www.remotion.dev).
Konsep: **"Hari ini, kamu blob yang mana?"** (9:16, 1080 × 1920, 30 fps, 27 detik = 810 frame).
Acuan lengkap ada di dokumen storyboard (bagian 1 sampai 8).

## Perintah

```bash
npm install          # pasang dependency
npm run dev          # buka Remotion Studio (pratinjau)
npm run typecheck    # cek TypeScript
npm run still:blobs  # render still barisan blob   -> out/blobs.png
npm run still:compare# render perbandingan blob asli vs SVG -> out/blob-compare.png
npm run preview:s1   # pratinjau Scene 1 (0-3,9 dtk)  -> out/scene1-preview.mp4
npm run preview:s1-s2# pratinjau Scene 1-2 (0-7 dtk)  -> out/scene1-2-preview.mp4
npm run preview:s1-s3# pratinjau Scene 1-3 (0-12,8 dtk) -> out/scene1-3-preview.mp4
npm run render       # render video penuh          -> out/relaxboss-reel.mp4
```

## Struktur

```text
public/
  fonts/        Plus Jakarta Sans 500/600/800 (lisensi OFL), tanpa unduhan saat render
  images/       logo dan sprite robot RelaxMate (dari repo website)
  reference/    gambar blob asli dari website, hanya untuk perbandingan
src/
  theme.ts      ukuran, warna, easing, spring, zona aman, tipografi
  timeline.ts   enam scene dan batas waktunya (satu-satunya tempat durasi scene)
  motion.ts     helper animasi: tween, springIn, breath, typedLength
  fonts.ts      pemuatan font lokal
  components/   Blob (blob mood 1-5, SVG), Typewriter, SlamTitle, TapCursor,
                Splash, Card, Pill, MoodChart, CircleReveal (transisi)
  scenes/       satu file per scene (Scene1Hook, ...); scene3Layout.ts = koordinat bersama
  sceneClock.tsx  useVideoFrame(): frame ABSOLUT video, jadi angka storyboard dipakai apa adanya
  stills/       still pemeriksaan (bukan bagian video akhir)
  Reel.tsx      komposisi utama (saat ini kerangka scene)
```

## Aturan kode

- Semua waktu ditulis dalam detik lewat `sec()`; durasi scene hanya di `timeline.ts`.
- Animasi murni dari frame: tanpa `Math.random`, `setTimeout`, atau CSS animation.
- Proyek ini terpisah dari video VW dan tidak mengimpor kode lama.

## Progres

- [x] Step 1: setup proyek, tema, timeline, komponen `Blob`
- [x] Step 2: Scene 1 (Hook), `Typewriter`, `CircleReveal`, `SceneClock`
- [x] Step 3: Scene 2 (Pilih mood), `SlamTitle`, `TapCursor`, `Splash`, ketikan diperlambat
- [x] Step 4: Scene 3 (Mood Tracker), `Card`, `Pill`, `MoodChart`
- [x] Step 5: Scene 1 +0,4 dtk, blob barisan Scene 2 diperbesar, Scene 4 (Asesmen), `ScoreRow`
- [x] Step 6: Scene 5 (RelaxMate), `RobotSprite`
- [x] Step 7: Scene 6 (CTA) dan render penuh 27,4 detik
- [ ] Step 8: pemeriksaan, cover, versi 4:5

Audio ditunda sampai video disetujui.
