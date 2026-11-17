# Audio del Short del baño: musica (Gemini) + voz (ElevenLabs por frases) + efectos.
import subprocess, numpy as np, wave
SR=44100; DUR=54.5; N=int(DUR*SR); rng=np.random.default_rng(9)
def load(p,ch=2):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-f','s16le','-ac',str(ch),'-ar',str(SR),'-'],capture_output=True).stdout
    x=np.frombuffer(raw,np.int16).astype(float)/32768; return x.reshape(-1,ch) if ch>1 else x
def T(d): return np.arange(int(SR*d))/SR
def env(n,a=0.003,r=0.03):
    e=np.ones(n); ai=max(1,int(a*SR)); ri=max(1,int(r*SR)); e[:ai]=np.linspace(0,1,ai); e[-ri:]*=np.linspace(1,0,ri); return e
M='../musica/'
PARTES=[(M+'dia_coffee_and_clear_skies.mp3',0.0,16.9,0.0),(M+'triste_the_fading_afternoon.mp3',0.0,8.9,16.0),
        (M+'dia_coffee_and_clear_skies.mp3',40.0,70.2,24.3)]
mus=np.zeros((N,2))
for k,(f,a,b,at) in enumerate(PARTES):
    x=load(f)[int(a*SR):int(b*SR)].copy(); n=int(0.7*SR)
    if k>0: x[:n]*=np.linspace(0,1,n)[:,None]
    if k<len(PARTES)-1: x[-n:]*=np.linspace(1,0,n)[:,None]
    i=int(at*SR); j=min(N,i+len(x)); mus[i:j]+=x[:j-i]
fo=int(1.0*SR); mus[-fo:]*=np.linspace(1,0,fo)[:,None]
voz=load('../voz/voz_bano_elevenlabs.mp3',1)
SEG=[(0.06,2.10,0.2),(2.48,3.84,2.5),(4.44,5.80,4.5),(6.10,7.36,6.1),(7.80,8.92,7.8),(9.24,11.06,9.4),(11.42,13.10,11.8),
     (13.40,14.94,14.2),(15.32,16.70,16.6),(16.98,17.82,18.2),(18.20,22.66,19.7),(23.14,23.82,24.8),(24.14,26.40,25.9),
     (26.68,27.78,28.5),(28.10,28.94,32.2),(29.28,29.94,33.2),(30.40,32.16,40.8),(32.60,33.94,43.0),(34.32,36.14,45.6),
     (36.48,37.78,47.8),(38.24,39.66,50.3),(39.94,40.34,52.0),(40.58,41.14,52.5)]
vt=np.zeros(N); pres=np.zeros(N)
for a,b,at in SEG:
    s=voz[max(0,int((a-0.04)*SR)):int((b+0.08)*SR)].copy(); f=int(0.01*SR); s[:f]*=np.linspace(0,1,f); s[-f:]*=np.linspace(1,0,f)
    i=int(at*SR); j=min(N,i+len(s)); vt[i:j]+=s[:j-i]; pres[i:j]=1
k=int(0.3*SR); pres=np.clip(np.convolve(pres,np.ones(k)/k,'same')*1.5,0,1)
fx=np.zeros(N)
def add(sig,at,g): i=int(at*SR); j=min(N,i+len(sig)); fx[i:j]+=sig[:j-i]*g
sq=lambda f,d: np.sign(np.sin(2*np.pi*f*T(d)))*0.5
def lose(at):
    for q,f in enumerate([660,494,330]): add(sq(f,0.09)*env(int(SR*0.09)),at+q*0.08,0.5)
def gain(at):
    for q,f in enumerate([523,659,784,1046]): add(sq(f,0.07)*env(int(SR*0.07)),at+q*0.06,0.4)
def pop(at): add(np.sin(2*np.pi*np.cumsum(np.linspace(300,700,int(SR*0.07)))/SR)*env(int(SR*0.07)),at,0.6)
def splash(at,d=1.2):
    ns=rng.uniform(-1,1,int(SR*d)); a=0; y=np.zeros_like(ns)
    for i in range(len(ns)): a+=0.2*(ns[i]-a); y[i]=a
    add(y*env(len(y),0.05,0.4)*2.0,at,0.5)
for at in [5.3,8.6,12.4]: lose(at)
for at in [41.8,42.6,43.4]: gain(at)
for at in [26.2,27.3,28.5,32.8,33.95,35.1,36.25,37.4,38.55]: pop(at)
splash(12.2,1.8); splash(4.3,0.8)
t=T(4.3); m=np.sign(np.sin(2*np.pi*np.cumsum(70+4*np.sin(2*np.pi*0.5*t))/SR))*0.3; a=0; y=np.zeros_like(m)
for i in range(len(m)): a+=0.05*(m[i]-a); y[i]=a
add(y*env(len(y),0.3,0.6),0.0,1.2)
mix=mus*(0.32-0.20*pres)[:,None]+vt[:,None]+fx[:,None]*0.35
mix=mix/np.max(np.abs(mix))*0.9
with wave.open('mezcla_bano_tmp.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
