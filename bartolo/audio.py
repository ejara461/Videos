import numpy as np, wave
SR = 44100; DUR = 40.0
N = int(SR * DUR)
out = np.zeros(N)
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(SR * d)) / SR
def add(sig, at, gain=1.0):
    i = int(at * SR); j = min(N, i + len(sig))
    if i < N: out[i:j] += sig[:j - i] * gain
def env(n, a=0.005, r=0.1):
    e = np.ones(n); ai = max(1, int(a * SR)); ri = max(1, int(r * SR))
    e[:ai] = np.linspace(0, 1, ai); e[-ri:] *= np.linspace(1, 0, ri); return e
def sweep(f0, f1, d, wave_='sin'):
    t = t_(d); f = np.linspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if wave_ == 'sin' else (2 * ((ph / (2 * np.pi)) % 1) - 1)
def pluck(f, d=0.5):
    t = t_(d); s = 0.6 * np.sin(2*np.pi*f*t) + 0.25 * np.sin(4*np.pi*f*t) + 0.1 * np.sin(6*np.pi*f*t)
    return s * np.exp(-t * 6) * env(len(t), 0.003, 0.05)
def lowpass(x, k=0.1):
    y = np.zeros_like(x); a = 0
    for i in range(len(x)): a += k * (x[i] - a); y[i] = a
    return y
def noise(d): return rng.uniform(-1, 1, int(SR * d))

# ---- musica de fondo: C G Am F, 112 bpm ----
bpm = 112; beat = 60 / bpm
notes = {'C': [261.63, 329.63, 392.0], 'G': [196.0, 246.94, 293.66], 'Am': [220.0, 261.63, 329.63], 'F': [174.61, 220.0, 261.63]}
prog = ['C', 'G', 'Am', 'F']
music = np.zeros(N)
def madd(sig, at, g):
    i = int(at * SR); j = min(N, i + len(sig))
    if i < N: music[i:j] += sig[:j - i] * g
bar = 0; tt = 0.0
while tt < 37.5:
    ch = notes[prog[bar % 4]]
    madd(pluck(ch[0] / 2, 1.8) * 1.2, tt, 0.5)            # bajo
    pattern = [0, 1, 2, 1, 0, 2, 1, 2]
    for k, idx in enumerate(pattern):
        madd(pluck(ch[idx] * 2, 0.4), tt + k * beat / 2, 0.22)
    bar += 1; tt += 4 * beat
# acorde final
for f in [261.63, 329.63, 392.0, 523.25]:
    madd(pluck(f, 2.5) * 1.0, 37.6, 0.35)
fade = np.ones(N); fi = int(39.0 * SR); fade[fi:] = np.linspace(1, 0, N - fi)
music *= fade
out += music * 0.55

# ---- efectos ----
def motor(t0, d, f0, f1, g=0.18):
    s = sweep(f0, f1, d, 'saw') * 0.6 + sweep(f0 * 2, f1 * 2, d, 'saw') * 0.3
    s *= 1 + 0.3 * np.sin(2 * np.pi * 22 * t_(d))
    add(lowpass(s, 0.08) * env(len(s), 0.2, 0.4), t0, g)
motor(0.0, 2.6, 95, 55)
motor(35.8, 2.0, 60, 120)
def beep(at, f=740, d=0.12, g=0.25): add(np.sign(np.sin(2*np.pi*f*t_(d))) * env(int(SR*d), 0.005, 0.03) * 0.5, at, g)
beep(2.35); beep(2.55)                                   # pito
def whoosh(at, d=0.35, g=0.2):
    s = lowpass(noise(d), 0.25) * np.sin(np.linspace(0, np.pi, int(SR*d))) ; add(s, at, g)
whoosh(2.7, 0.4, 0.35)                                   # casco
for c in [4, 10, 17, 27, 35]: whoosh(c - 0.2, 0.4, 0.25)  # transiciones
def ding(at, f, g=0.3, d=1.0):
    t = t_(d); add((np.sin(2*np.pi*f*t) + 0.3*np.sin(2*np.pi*f*2.01*t)) * np.exp(-t*4), at, g)
ding(4.3, 880); ding(4.55, 660)                          # ascensor
def bark(at, g=0.45):
    d = 0.16; s = sweep(560, 280, d, 'saw') * 0.7 + noise(d) * 0.25
    add(lowpass(s, 0.3) * env(int(SR*d), 0.004, 0.06), at, g)
bark(6.4); bark(6.65); bark(7.6); bark(7.85)
add(sweep(900, 260, 0.45) * env(int(SR*0.45), 0.005, 0.1), 6.2, 0.25)   # susto
add(sweep(220, 70, 0.25) * env(int(SR*0.25), 0.003, 0.1), 11.6, 0.5)    # plop
d = 0.7; tw = t_(d); f = 2300 + 250*np.sin(np.pi*tw/d) + 40*np.sin(2*np.pi*12*tw)
add(np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tw), 0.03, 0.15), 15.0, 0.22)  # silbido
add(sweep(300, 700, 0.18) * env(int(SR*0.18), 0.005, 0.05), 15.3, 0.3)      # uy
def click(at, g=0.4): add(lowpass(noise(0.03), 0.5) * env(int(SR*0.03), 0.001, 0.02), at, g)
click(18.6); click(18.75)                                # caja
whoosh(19.2, 0.6, 0.3)                                   # objetos vuelan
def popp(at, g=0.35): add(sweep(500, 1100, 0.08) * env(int(SR*0.08), 0.002, 0.04), at, g)
popp(20.0); popp(20.2)
click(21.8, 0.6)                                         # gancho de la trailla
add(lowpass(noise(0.4), 0.6) * env(int(SR*0.4), 0.02, 0.1), 23.6, 0.18)  # bolsa
add(sweep(140, 60, 0.2) * env(int(SR*0.2), 0.002, 0.1), 26.6, 0.6)       # caida en caneca
for k, fq in enumerate([523.25, 659.25, 783.99, 1046.5]): ding(26.65 + k*0.09, fq, 0.18, 0.8)  # exito
ding(27.4, 1046.5, 0.12); ding(31.2, 1174.7, 0.12)       # textos
popp(35.2); popp(37.4)

out = out / np.max(np.abs(out)) * 0.85
pcm = (out * 32767).astype(np.int16)
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok')
