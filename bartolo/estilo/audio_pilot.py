# Audio PROVISIONAL del piloto: piano suave sintetizado + efectos de 8 bits.
# Se reemplaza la musica por la pista de la Biblioteca de audio de YouTube y se agrega la voz.
import numpy as np, wave
SR = 44100; DUR = 48.0; N = int(SR * DUR)
out = np.zeros(N); rng = np.random.default_rng(3)
def T(d): return np.arange(int(SR * d)) / SR
def add(sig, at, g=1.0):
    i = int(at * SR); j = min(N, i + len(sig))
    if 0 <= i < N: out[i:j] += sig[:j - i] * g
def env(n, a=0.005, r=0.05):
    e = np.ones(n); ai = max(1, int(a*SR)); ri = max(1, int(r*SR)); e[:ai] = np.linspace(0, 1, ai); e[-ri:] *= np.linspace(1, 0, ri); return e
def piano(f, d=3.0):
    t = T(d); s = sum(np.sin(2*np.pi*f*h*t) * a * np.exp(-t*(1.2+h*0.8)) for h, a in [(1, .6), (2, .25), (3, .1), (4, .05)])
    return s * env(len(t), 0.004, 0.3)
def sq(f, d):
    t = T(d); return np.sign(np.sin(2*np.pi*f*t)) * 0.5

# Piano: Am - F - C - G, notas largas, tempo lento
ch = {'Am': [220.0, 261.63, 329.63], 'F': [174.61, 220.0, 261.63], 'C': [196.0, 261.63, 329.63], 'G': [196.0, 246.94, 293.66]}
prog = ['Am', 'F', 'C', 'G']
t0 = 0.5; bar = 0; step = 3.0
mus = np.zeros(N)
while t0 < 46:
    c = ch[prog[bar % 4]]
    # escena oscura (21-33): solo notas graves
    soft = 0.6 if 21 <= t0 < 33 else 1.0
    for k, f in enumerate(c):
        sig = piano(f, 3.5); i = int((t0 + k*0.35) * SR); j = min(N, i + len(sig)); mus[i:j] += sig[:j-i] * 0.22 * soft
    sig = piano(c[0] / 2, 3.5); i = int(t0 * SR); j = min(N, i + len(sig)); mus[i:j] += sig[:j-i] * 0.3
    t0 += step; bar += 1
for f in [261.63, 329.63, 392.0, 523.25]:
    sig = piano(f, 4.0); i = int(44.0 * SR); j = min(N, i + len(sig)); mus[i:j] += sig[:j-i] * 0.25
fade = np.ones(N); fi = int(46.5 * SR); fade[fi:] = np.linspace(1, 0, N - fi)
import os
if not os.environ.get('SOLO_EFECTOS'): out += mus * fade

# Moto (escena 1)
t = T(5.0); f = 70 + 4*np.sin(2*np.pi*0.5*t)
m = np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)) * 0.3
a = 0.0; y = np.zeros_like(m)
for i in range(len(m)): a += 0.05*(m[i]-a); y[i] = a
add(y * env(len(y), 0.3, 0.6), 0.0, 0.5)

# Efectos de 8 bits
def lose(at):   # corazon perdido: tono cuadrado descendente
    for k, fq in enumerate([660, 494, 330]): add(sq(fq, 0.09) * env(int(SR*0.09), 0.002, 0.02), at + k*0.08, 0.18)
def gain(at):   # corazon recuperado: arpegio ascendente
    for k, fq in enumerate([523, 659, 784, 1046]): add(sq(fq, 0.07) * env(int(SR*0.07), 0.002, 0.02), at + k*0.06, 0.14)
def pop(at):
    s = np.sin(2*np.pi*np.cumsum(np.linspace(300, 700, int(SR*0.07)))/SR) * env(int(SR*0.07), 0.002, 0.03); add(s, at, 0.25)
for at in [11.3, 13.3, 15.3]: pop(at)
for at in [11.4, 13.4, 15.4, 22.5]: lose(at)
for at in [34.5, 35.5, 36.5, 37.5]: gain(at)
for at in [28.0, 29.0, 30.0]: add(sq(220, 0.05) * env(int(SR*0.05), 0.002, 0.02), at, 0.12)  # entrada de palabras

out = out / np.max(np.abs(out)) * 0.85
with wave.open(os.environ.get('SALIDA','audio_pilot.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('ok')
