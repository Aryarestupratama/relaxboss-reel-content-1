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
  components/   Blob.tsx (blob mood 1-5 sebagai SVG)
  stills/       still pemeriksaan (bukan bagian video akhir)
  Reel.tsx      komposisi utama (saat ini kerangka scene)
```

## Aturan kode

- Semua waktu ditulis dalam detik lewat `sec()`; durasi scene hanya di `timeline.ts`.
- Animasi murni dari frame: tanpa `Math.random`, `setTimeout`, atau CSS animation.
- Proyek ini terpisah dari video VW dan tidak mengimpor kode lama.

## Progres

- [x] Step 1: setup proyek, tema, timeline, komponen `Blob`
- [ ] Step 2: Scene 1 (Hook) dan Scene 2 (Pilih mood)
- [ ] Step 3: Scene 3 (Mood Tracker) dan Scene 4 (Asesmen)
- [ ] Step 4: Scene 5 (RelaxMate)
- [ ] Step 5: Scene 6 (CTA), transisi lingkaran, render penuh
- [ ] Step 6: pemeriksaan, cover, versi 4:5

Audio ditunda sampai video disetujui.
