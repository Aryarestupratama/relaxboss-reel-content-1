#!/usr/bin/env python3
"""Pecah satu rekaman VO (audio/samples/vo/vo-full.mp3) menjadi sembilan klip vo-01..vo-09.wav.

Pemotongan memakai deteksi hening: rekaman dibagi jadi "kelompok bicara", lalu kelompok digabung
menurut pola GROUPS (jumlah kelompok per kalimat, mengikuti struktur naskah: kalimat yang punya
jeda di koma terdiri dari 2 kelompok, dst.). Kalau jumlah kelompok tidak cocok, skrip berhenti
dan mencetak daftar kelompok supaya pola/ambang bisa disesuaikan.
Pakai:  python3 audio/make_vo.py [rekaman.mp3]
"""
import re, subprocess, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
VO_DIR = ROOT / "audio" / "samples" / "vo"
SR = 44100
GROUPS = [2, 2, 2, 2, 1, 2, 1, 2, 3]   # kelompok bicara per kalimat (naskah di storyboard)
NOISE_DB, MIN_GAP = -38, 0.3

src = Path(sys.argv[1]) if len(sys.argv) > 1 else VO_DIR / "vo-full.mp3"
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(src), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
total = len(x) / SR

log = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(src), "-af",
                      f"silencedetect=n={NOISE_DB}dB:d={MIN_GAP}", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(v) for v in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(v) for v in re.findall(r"silence_end: ([0-9.]+)", log)]
# kelompok bicara = ruang di antara hening
runs, t = [], 0.0
for s, e in zip(starts, ends):
    if s > t + 0.05:
        runs.append((t, s))
    t = e
if total > t + 0.05:
    runs.append((t, total))

if len(runs) != sum(GROUPS):
    print(f"Jumlah kelompok bicara {len(runs)} != {sum(GROUPS)} (pola GROUPS). Kelompok:")
    for i, r in enumerate(runs):
        print(f"  {i + 1:2d}: {r[0]:.2f}-{r[1]:.2f}")
    sys.exit(1)

i = 0
for n, g in enumerate(GROUPS, 1):
    a, b = runs[i][0], runs[i + g - 1][1]
    i += g
    a, b = max(0, a - 0.06), min(total, b + 0.12)
    clip = x[int(a * SR):int(b * SR)].copy()
    fi, fo = int(0.015 * SR), int(0.08 * SR)
    clip[:fi] *= np.linspace(0, 1, fi)
    clip[-fo:] *= np.linspace(1, 0, fo)
    clip *= 0.9 / max(1e-9, np.abs(clip).max())
    out = VO_DIR / f"vo-{n:02d}.wav"
    pcm = (np.clip(clip, -1, 1) * 32767).astype(np.int16)
    import wave
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(f"vo-{n:02d}  {a:6.2f}-{b:6.2f}  ({b - a:.2f} dtk)")
