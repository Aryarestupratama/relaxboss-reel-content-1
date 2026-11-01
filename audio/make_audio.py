#!/usr/bin/env python3
"""Sintesis audio RelaxBoss Reel: musik latar + efek suara, disinkronkan ke timeline.
Suara ketik memakai sampel keyboard asli (audio/samples/keyboard-clicks-source.mp3).
Berkas audio/samples/<nama>.wav|mp3 (plop, tap, pop, whoosh, swell, click_full) menggantikan suara sintetis dengan nama itu.

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

# ---- timeline dibaca dari src/timeline.json (sumber yang sama dengan video) ----
import json
TL = json.loads((ROOT / "src" / "timeline.json").read_text())
TRANS = TL["transitionSec"]
SC = {}
_t = 0.0
for s in TL["scenes"]:
    end = _t + s["authDur"] * s["speed"] + s["holdSec"]
    SC[s["key"]] = dict(start=_t, end=end, auth=s["authStart"], speed=s["speed"])
    _t = end
TOTAL = _t
BOUNDARIES = [v["start"] for k, v in list(SC.items())[1:]]


def R(key, auth_sec):
    """Detik nyata mutlak untuk detik penulisan di scene `key`."""
    v = SC[key]
    return v["start"] + (auth_sec - v["auth"]) * v["speed"]


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


# ---------------- Sampel ----------------
SAMPLES = ROOT / "audio" / "samples"


def load_audio(path):
    """Decode ke mono float 44,1 kHz lewat ffmpeg."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1",
                          "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def trim(x, lead_thr=0.05, tail_thr=0.01, pre=0.004, fade=0.03):
    """Buang hening di awal (suara mulai tepat di titik yang ditaruh) dan ekor yang nyaris hening."""
    pk = np.abs(x).max()
    idx = np.where(np.abs(x) > pk * lead_thr)[0]
    a = max(0, idx[0] - int(pre * SR))
    idx2 = np.where(np.abs(x) > pk * tail_thr)[0]
    b = idx2[-1] + 1
    y = x[a:b].copy()
    n = min(len(y), int(fade * SR))
    y[-n:] *= np.linspace(1, 0, n)
    return y


# Panjang maksimum (detik) per efek: yang lebih panjang dimampatkan (nada ikut naik sedikit)
FIT = {"swell": 0.8, "whoosh": 0.7, "plop": 0.4, "pop": 0.3, "tap": 0.25, "click_full": 0.3}


def override(name):
    for ext in ("wav", "mp3", "ogg", "flac"):
        p = SAMPLES / f"{name}.{ext}"
        if p.exists():
            x = trim(load_audio(p))
            lim = FIT.get(name)
            if lim and len(x) > lim * SR:
                x = np.interp(np.linspace(0, len(x) - 1, int(lim * SR)), np.arange(len(x)), x)
            return x / max(1e-9, np.abs(x).max()) * 0.9
    return None


def key_clicks():
    """Potong satu per satu bunyi ketik dari rekaman keyboard (deteksi onset)."""
    p = SAMPLES / "keyboard-elevenlabs.wav"
    if not p.exists():
        p = SAMPLES / "keyboard-clicks-source.mp3"
    if not p.exists():
        return None
    x = load_audio(p)
    h = hp(x, 1500)
    k = int(0.004 * SR)
    env = np.convolve(np.abs(h), np.ones(k) / k, mode="same")
    thr = max(env.max() * 0.18, np.percentile(env, 90))
    onsets, last = [], -10**9
    for i in range(len(env)):
        if env[i] > thr and i - last > int(0.06 * SR):
            onsets.append(i)
            last = i
    clicks = []
    for i in onsets:
        a, b = max(0, i - int(0.008 * SR)), min(len(x), i + int(0.11 * SR))
        c = x[a:b].copy()
        if len(c) < int(0.05 * SR):
            continue
        c *= np.minimum(1, np.arange(len(c)) / (0.003 * SR))
        c *= np.minimum(1, (len(c) - np.arange(len(c))) / (0.03 * SR))
        peak = np.abs(c).max()
        if peak > 0:
            clicks.append(c / peak * 0.9)
    return clicks


CLICKS = key_clicks()
OVR = {n: override(n) for n in ("plop", "tap", "pop", "whoosh", "swell", "click_full")}


# ---------------- Efek suara ----------------
def typing(key, start_auth, text_len, cps, gain=0.5):
    """Satu bunyi ketik per karakter, memakai klik keyboard asli (acak tetap)."""
    t0 = R(key, start_auth)
    for k in range(text_len):
        tk = t0 + k / cps
        if CLICKS:
            c = CLICKS[int(rng.integers(len(CLICKS)))]
            add(sfx, tk, c, gain * (0.75 + 0.25 * rng.random()))
        else:
            add(sfx, tk, tick(1 + 0.04 * (k % 3)), 0.22)


def play(name, fn, t, gain, *args):
    sig = OVR.get(name)
    add(sfx, t, sig if sig is not None else fn(*args), gain)


def e_plop(t, f, gain):
    sig = OVR.get("plop")
    if sig is not None:  # sampel diubah nadanya dengan resampling sederhana
        ratio = (f / 330.0) ** 0.5
        idx = np.arange(0, len(sig) - 1, ratio)
        sig = np.interp(idx, np.arange(len(sig)), sig)
        add(sfx, t, sig, gain)
    else:
        add(sfx, t, plop(f), gain)


# Scene 1
typing("hook", 0.2, 30, 11)
add(sfx, R("hook", 1.0), sigh(0.6), 0.25)

# Transisi lingkaran (swell berpusat di tiap batas)
for b in BOUNDARIES:
    play("swell", swell, b - TRANS / 2, 0.2, TRANS)

# Scene 2
for i, f in enumerate([523.25, 587.33, 659.25, 783.99]):  # biru, peach, hijau, kuning
    e_plop(R("pick", 3.2 + i * 0.12 + 0.42), f * 0.5, 0.55)
play("whoosh", whoosh, R("pick", 3.6), 0.28, 0.5)
play("tap", tap, R("pick", 5.0), 0.5)
e_plop(R("pick", 5.0), 330, 0.5)
play("whoosh", whoosh, R("pick", 5.7), 0.18, 0.5, 400, 2500)

# Scene 3
play("whoosh", whoosh, R("mood", 6.9), 0.28, 0.5)
play("tap", tap, R("mood", 7.4), 0.5)
play("pop", pop, R("mood", 7.4), 0.3, 560)
play("click_full", click_full, R("mood", 8.6), 0.5)
add(sfx, R("mood", 8.6) + 0.03, bell(1318.5, 0.5), 0.3)
for i, m in enumerate([60, 62, 64, 67, 69, 72, 71]):   # titik grafik satu per satu
    add(sfx, R("mood", 9.6 + i * (1.4 / 6)), bell(m2f(m + 12), 0.5), 0.18)
add(sfx, R("mood", 11.0), bell(m2f(84), 0.8), 0.22)

# Scene 4
play("whoosh", whoosh, R("assess", 12.4), 0.2, 0.5, 300, 2500)
play("whoosh", whoosh, R("assess", 12.7), 0.28, 0.5)
play("tap", tap, R("assess", 13.8), 0.5)
play("pop", pop, R("assess", 13.8), 0.3, 520)
play("whoosh", whoosh, R("assess", 14.8), 0.22, 0.6, 250, 2800)
for i, m in enumerate([60, 64, 67]):
    add(sfx, R("assess", 15.5 + i * 0.25), bell(m2f(m + 12), 0.6), 0.2)
    play("pop", pop, R("assess", 15.5 + i * 0.25 + 0.8), 0.22, 760)
play("pop", pop, R("assess", 17.0), 0.4, 480)

# Scene Artikel
play("whoosh", whoosh, R("article", 0.3), 0.28, 0.5)
play("whoosh", whoosh, R("article", 0.8), 0.14, 0.45, 300, 2200)
play("whoosh", whoosh, R("article", 1.15), 0.12, 0.45, 300, 2200)
play("tap", tap, R("article", 2.3), 0.5)
typing("article", 2.5, 5, 5)
play("whoosh", whoosh, R("article", 3.3), 0.18, 0.5, 400, 2500)
play("tap", tap, R("article", 4.8), 0.5)
play("click_full", click_full, R("article", 4.8), 0.4)

# Scene 5
play("whoosh", whoosh, R("chat", 18.0), 0.28, 0.5)
e_plop(R("chat", 18.45), 260, 0.55)
for k in range(5):  # robot meluncur sambil memantul
    play("tap", tap, R("chat", 18.0) + 0.14 + k * 0.28, 0.12)
play("pop", pop, R("chat", 18.6), 0.35, 700)
play("pop", pop, R("chat", 18.85), 0.4, 520)
typing("chat", 18.95, 31, 14)
play("pop", pop, R("chat", 20.3), 0.4, 480)
for k in range(3):  # titik mengetik
    add(sfx, R("chat", 20.35 + k * 0.17), tick(0.7), 0.15)
typing("chat", 20.9, 44, 16)
e_plop(R("chat", 21.15), 420, 0.3)
e_plop(R("chat", 22.1), 392, 0.55)
add(sfx, R("chat", 22.2), bell(m2f(88), 0.9), 0.3)
add(sfx, R("chat", 22.2), bell(m2f(95), 0.9), 0.2)
add(sfx, R("chat", 22.3), sparkle(), 0.6)

# Scene 6
play("pop", pop, R("cta", 23.2), 0.45, 600)
play("whoosh", whoosh, R("cta", 23.6), 0.28, 0.5)
play("whoosh", whoosh, R("cta", 24.1), 0.12, 0.4, 800, 3000)
play("whoosh", whoosh, R("cta", 24.4), 0.2, 0.5, 300, 2200)
for i, f in enumerate([523.25, 659.25, 783.99, 987.77, 1174.66]):  # lima blob melompat
    for r in range(3):
        e_plop(R("cta", 24.75 + i * 0.12 + r * 0.45), f * 0.5, 0.26)
play("tap", tap, R("cta", 25.0), 0.5)
play("click_full", click_full, R("cta", 25.0), 0.55)

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
    s = list(SC.values())
    b1, chat0, cta0 = s[1]["start"], SC["chat"]["start"], SC["cta"]["start"]
    return float(np.interp(t, [0, b1 - 0.6, b1, chat0, chat0 + 0.4, cta0, TOTAL - 2.5, TOTAL],
                           [0.55, 0.6, 0.8, 0.9, 1.1, 1.1, 0.9, 0.0]))


def bar_chord(i, t0):
    remaining = TOTAL - t0
    if remaining <= 2 * BAR + 0.5:
        return "C"
    if remaining <= 3 * BAR + 0.5:
        return "G"
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
    ARP0 = list(SC.values())[1]["start"] - 0.2
    if t0 + BAR > ARP0:  # arpeggio mulai di Scene 2
        arp_g = g * (1.0 if t0 + BAR > SC["chat"]["start"] else 0.8)
        for k, idx in enumerate(arp_pattern):
            tk = t0 + k * BEAT / 2
            if tk < ARP0 or tk >= TOTAL - 0.2:
                continue
            m = notes[idx] + 12
            add(music, tk, marimba(m2f(m), 0.55), 0.19 * arp_g * mgain(tk))
    if t0 + BAR > SC["chat"]["start"]:  # lapisan melodi tinggi saat puncak (Scene 5-6)
        for k, idx in enumerate([2, 0, 1, 2]):
            tk = t0 + k * BEAT
            if tk < SC["chat"]["start"] or tk >= TOTAL - 0.4:
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


# ---------------- Voice over (opsional) ----------------
# Klip vo-01..09.wav (hasil audio/make_vo.py) ditaruh di titik berikut (detik nyata).
VO_AT = [1.4, R("pick", 3.9), R("mood", 7.0), R("assess", 12.8), R("assess", 16.2),
         R("article", 1.0), R("chat", 18.3), R("chat", 21.5), R("cta", 23.7)]
vo = np.zeros(N)
VO_DIR = ROOT / "audio" / "samples" / "vo"
vo_clips = sorted(VO_DIR.glob("vo-[0-9][0-9].wav")) if VO_DIR.exists() else []
for i, p in enumerate(vo_clips[: len(VO_AT)]):
    clip = load_audio(p)
    add(vo, VO_AT[i], clip, 1.0)
    end = VO_AT[i] + len(clip) / SR
    nxt = VO_AT[i + 1] if i + 1 < len(VO_AT) else TOTAL
    flag = "  <-- TUMPANG TINDIH dengan klip berikutnya" if end > nxt else ""
    print(f"VO {i + 1}: {VO_AT[i]:6.2f} - {end:6.2f}{flag}")

# Pelembut: efek dipangkas di atas 10 kHz (klik tajam jadi tidak menusuk)
sfx = lp(hp(sfx, 30, 1), 10000, 2)

# Duck: musik turun sedikit saat ada efek keras (sidechain sederhana, selubung)
env = np.abs(sfx)
win = int(0.08 * SR)
env = np.convolve(env, np.ones(win) / win, mode="same")
duck = 1 - 0.35 * np.clip(env / 0.25, 0, 1)
# Musik (dan sedikit efek) turun saat VO bicara
venv = np.convolve(np.abs(vo), np.ones(int(0.15 * SR)) / int(0.15 * SR), mode="same")
vduck = 1 - 0.6 * np.clip(venv / 0.12, 0, 1)
sduck = 1 - 0.3 * np.clip(venv / 0.12, 0, 1)
mix = music * 0.5 * duck * vduck + sfx * sduck + vo * 1.0
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
