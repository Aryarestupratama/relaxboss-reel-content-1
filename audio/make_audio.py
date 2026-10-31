#!/usr/bin/env python3
"""Sintesis audio RelaxBoss Reel: musik latar + efek suara, disinkronkan ke timeline.

Pakai:  python3 audio/make_audio.py [video.mp4 ...]
Output: out/audio/relaxboss-audio.wav, relaxboss-music.wav (musik saja),
        dan, bila video diberikan, <video>-audio.mp4 (video disalin, audio ditambahkan).
Butuh: numpy, scipy, ffmpeg.  Semua suara dibuat dari kode (tanpa sampel luar).
Waktu efek = jam penulisan scene + SHIFT (0,4 dtk untuk scene 2-6, lihat timeline.ts).
"""
import re, subprocess, sys
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "audio"
SR = 44100

# ---- timeline dibaca dari timeline.ts supaya selalu sinkron ----
tl = (ROOT / "src" / "timeline.ts").read_text()
ENDS = [float(x) for x in re.findall(r"endSec:\s*([0-9.]+)", tl)]
TOTAL = ENDS[-1]
BOUNDARIES = ENDS[:-1]
SHIFT = float(re.findall(r"shiftSec:\s*([0-9.]+)", tl)[1])  # scene 2 dst.
N = int(TOTAL * SR) + SR  # +1 dtk ekor

rng = np.random.default_rng(7)  # tetap: hasil identik tiap dijalankan
sfx = np.zeros(N)
music = np.zeros(N)


def add(buf, t, sig, gain=1.0):
    i = int(t * SR)
    if i < 0:
        sig = sig[-i:]
        i = 0
    j = min(N, i + len(sig))
    if j > i:
        buf[i:j] += sig[: j - i] * gain


def tt(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def bell(f, d=0.6, bright=0.35):
    t = tt(d)
    e = np.exp(-t * (5.5 / d))
    x = np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 14)
    x += 0.12 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 22)
    a = np.minimum(1, t / 0.004)
    return x * e * a


def tick(pitch=1.0):
    t = tt(0.05)
    n = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180)
    s = np.sin(2 * np.pi * 1900 * pitch * t) * np.exp(-t * 110)
    return 0.5 * n + 0.5 * s


def plop(f):
    t = tt(0.22)
    fr = f * (1 + 0.6 * np.exp(-t * 28))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) * np.exp(-t * 16) * np.minimum(1, t / 0.003)


def tap():
    t = tt(0.07)
    return np.sin(2 * np.pi * 820 * t) * np.exp(-t * 70) + 0.3 * hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 200)


def click_full():
    t = tt(0.16)
    return (np.sin(2 * np.pi * 520 * t) * np.exp(-t * 28)
            + 0.5 * np.sin(2 * np.pi * 1040 * t) * np.exp(-t * 40)
            + 0.3 * hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 150))


def pop(f=620):
    t = tt(0.12)
    fr = f * (1 + 0.5 * (1 - np.exp(-t * 40)))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 32)


def whoosh(d=0.4, f0=500, f1=3500):
    t = tt(d)
    n = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    k = 8
    for s in range(k):  # sapuan band-pass naik, disusun dari potongan
        a, b = int(len(t) * s / k), int(len(t) * (s + 1) / k)
        fc = f0 * (f1 / f0) ** ((s + 0.5) / k)
        out[a:b] = bp(n, fc * 0.7, fc * 1.4)[a:b]
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return out * env * 2.2


def swell(d=0.5):
    t = tt(d)
    w = whoosh(d, 300, 5000)
    tone = (np.sin(2 * np.pi * 392 * t) + np.sin(2 * np.pi * 523.25 * t)) * 0.35
    return w * 0.8 + tone * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2


def sparkle(n=5, span=0.35):
    out = np.zeros(int((span + 0.5) * SR))
    for i in range(n):
        f = [1568, 2093, 2637, 3136, 3951][i % 5]
        add(out, i * span / n, bell(f, 0.35, 0.1), 0.35)
    return out


def sigh(d=0.5):
    t = tt(d)
    n = lp(rng.standard_normal(len(t)), 900) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return n * 0.5


def m2f(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------- Efek suara ----------------
def S(t_auth, shifted=True):
    return t_auth + (SHIFT if shifted else 0)


def typing(start_auth, text_len, cps, shifted, gain=0.22):
    n = text_len
    for k in range(0, n, 2):  # klik tiap 2 karakter
        add(sfx, S(start_auth, shifted) + k / cps, tick(1 + 0.04 * ((k // 2) % 3)), gain)


# Scene 1 (jam = absolut)
typing(0.2, 30, 13, False)
add(sfx, 1.0, sigh(0.6), 0.25)

# Transisi lingkaran (swell di tiap batas, 0,5 dtk berpusat di batas)
for b in BOUNDARIES:
    add(sfx, b - 0.25, swell(0.5), 0.2)

# Scene 2
for i, f in enumerate([523.25, 587.33, 659.25, 783.99]):  # biru, peach, hijau, kuning
    add(sfx, S(3.2 + i * 0.12 + 0.42), plop(f * 0.5), 0.55)
add(sfx, S(3.6), whoosh(0.35), 0.28)
add(sfx, S(5.0), tap(), 0.5)
add(sfx, S(5.0), plop(330), 0.5)
add(sfx, S(5.7), whoosh(0.4, 400, 2500), 0.18)

# Scene 3
add(sfx, S(6.9), whoosh(0.35), 0.28)
add(sfx, S(7.4), tap(), 0.5)
add(sfx, S(7.4), pop(560), 0.3)
add(sfx, S(8.6), click_full(), 0.5)
add(sfx, S(8.6) + 0.02, bell(1318.5, 0.5), 0.3)   # centang
SCALE = [60, 62, 64, 67, 69, 72, 71]
for i, m in enumerate(SCALE):                       # titik grafik muncul satu per satu
    add(sfx, S(9.6 + i * (1.4 / 6)), bell(m2f(m + 12), 0.5), 0.18)
add(sfx, S(11.0), bell(m2f(84), 0.8), 0.22)

# Scene 4
add(sfx, S(12.4), whoosh(0.4, 300, 2500), 0.2)
add(sfx, S(12.7), whoosh(0.35), 0.28)
add(sfx, S(13.8), tap(), 0.5)
add(sfx, S(13.8), pop(520), 0.3)
add(sfx, S(14.8), whoosh(0.45, 250, 2800), 0.22)
for i, m in enumerate([60, 64, 67]):
    add(sfx, S(15.5 + i * 0.25), bell(m2f(m + 12), 0.6), 0.2)
    add(sfx, S(15.5 + i * 0.25 + 0.8), pop(760), 0.22)
add(sfx, S(17.0), pop(480), 0.4)

# Scene 5
add(sfx, S(18.0), whoosh(0.35), 0.28)
add(sfx, S(18.45), plop(260), 0.55)
for k in range(5):  # langkah/meluncur robot
    add(sfx, S(18.0) + 0.08 + k * 0.2, tap(), 0.12)
add(sfx, S(18.6), pop(700), 0.35)
add(sfx, S(18.85), pop(520), 0.4)
typing(18.95, 26, 18, True)
add(sfx, S(20.3), pop(480), 0.4)
for k in range(3):  # titik mengetik
    add(sfx, S(20.35 + k * 0.17), tick(0.7), 0.15)
typing(20.9, 32, 18, True, gain=0.2)
add(sfx, S(21.15), plop(420), 0.3)
add(sfx, S(22.1), plop(392), 0.55)
add(sfx, S(22.2), bell(m2f(88), 0.9), 0.3)
add(sfx, S(22.2), bell(m2f(95), 0.9), 0.2)
add(sfx, S(22.3), sparkle(), 0.6)

# Scene 6
add(sfx, S(23.2), pop(600), 0.45)
add(sfx, S(23.6), whoosh(0.35), 0.28)
add(sfx, S(24.1), whoosh(0.3, 800, 3000), 0.12)
add(sfx, S(24.4), whoosh(0.4, 300, 2200), 0.2)
for i, f in enumerate([523.25, 659.25, 783.99, 987.77, 1174.66]):  # lima blob melompat
    for r in range(3):
        add(sfx, S(24.75 + i * 0.12 + r * 0.45), plop(f * 0.5), 0.26)
add(sfx, S(24.6) + 0.4, tap(), 0.0)
add(sfx, S(25.0), tap(), 0.5)
add(sfx, S(25.0), click_full(), 0.55)

# ---------------- Musik ----------------
BPM = 84
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORDS = {  # tiga nada + bass (MIDI)
    "Am": ([57, 60, 64], 45),
    "F": ([53, 57, 60], 41),
    "C": ([60, 64, 67], 48),
    "G": ([55, 59, 62], 43),
}
PROG = ["Am", "F", "C", "G"]


def pad_note(m, d, vol):
    t = tt(d)
    x = np.zeros(len(t))
    for det in (-0.07, 0.0, 0.07):
        f = m2f(m) * 2 ** (det / 12)
        x += np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    a = np.minimum(1, t / 0.9)
    r = np.minimum(1, (d - t) / 0.9)
    return lp(x, 1800) * a * r * vol / 3


def marimba(f, d=0.5):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 7)
            + 0.45 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 28)) * np.minimum(1, t / 0.003)


def mgain(t):
    """Kurva volume musik per bagian (0..1)."""
    return float(np.interp(t, [0, 3.0, 3.6, 7.0, 18.0, 18.4, 23.2, 23.6, TOTAL - 1.8, TOTAL], [0.55, 0.6, 0.8, 0.9, 0.95, 1.1, 1.1, 1.1, 0.9, 0.0]))


def bar_chord(i, t0):
    if t0 >= 23.6 - 0.01 and t0 + BAR > TOTAL - 3.3:
        return "C"
    return PROG[i % 4]


nbars = int(np.ceil(TOTAL / BAR)) + 1
arp_pattern = [0, 1, 2, 1, 2, 1, 2, 1]
for i in range(nbars):
    t0 = i * BAR
    if t0 >= TOTAL:
        break
    name = bar_chord(i, t0)
    notes, bass = CHORDS[name]
    g = mgain(t0 + BAR / 2)
    for m in notes + [notes[0] + 12]:
        add(music, t0, pad_note(m, BAR + 0.9, 0.26), g)
    add(music, t0, pad_note(bass, BAR + 0.6, 0.26), g)
    if t0 + BAR > 3.4:  # arpeggio mulai di Scene 2
        arp_g = g * (1.0 if t0 + BAR > 18.0 else 0.8)
        for k, idx in enumerate(arp_pattern):
            tk = t0 + k * BEAT / 2
            if tk < 3.4 or tk >= TOTAL - 0.2:
                continue
            m = notes[idx] + 12
            add(music, tk, marimba(m2f(m), 0.55), 0.19 * arp_g * mgain(tk))
    if t0 + BAR > 18.0:  # lapisan melodi tinggi saat puncak (Scene 5-6)
        for k, idx in enumerate([2, 0, 1, 2]):
            tk = t0 + k * BEAT
            if tk < 18.2 or tk >= TOTAL - 0.4:
                continue
            add(music, tk, bell(m2f(notes[idx] + 24), 0.9, 0.2), 0.08 * mgain(tk))

# kick halus-lembut dihindari (tanpa drum) agar tetap tenang


def master(x, peak=0.89):
    x = np.tanh(x * 1.1)
    return x / max(1e-9, np.max(np.abs(x))) * peak


def write_wav(name, data):
    OUT.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    import wave
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(np.stack([pcm], axis=1).tobytes())


# Pelembut: efek dipangkas di atas 10 kHz (klik tajam jadi tidak menusuk)
sfx = lp(hp(sfx, 30, 1), 10000, 2)

# Duck: musik turun sedikit saat ada efek keras (sidechain sederhana, selubung)
env = np.abs(sfx)
win = int(0.08 * SR)
env = np.convolve(env, np.ones(win) / win, mode="same")
duck = 1 - 0.35 * np.clip(env / 0.25, 0, 1)
mix = music * 0.5 * duck + sfx * 1.0
cut = int(TOTAL * SR)
mix, music_only = mix[:cut], (music * 0.5)[:cut]
write_wav("relaxboss-music.wav", master(music_only, 0.8))
write_wav("relaxboss-audio-raw.wav", master(mix))

# Normalisasi ke -14 LUFS (standar Reels) dan keluaran MP3 / WAV
raw = OUT / "relaxboss-audio-raw.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af",
                "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "44100", str(OUT / "relaxboss-audio.wav")], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / "relaxboss-audio.wav"),
                "-b:a", "192k", str(OUT / "relaxboss-audio.mp3")], check=True)
raw.unlink()

for v in sys.argv[1:]:
    vp = Path(v)
    outp = vp.with_name(vp.stem + "-audio.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(vp), "-i", str(OUT / "relaxboss-audio.wav"),
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                    "-shortest", str(outp)], check=True)
    print("OK", outp)
print("audio selesai, total", TOTAL, "dtk")
