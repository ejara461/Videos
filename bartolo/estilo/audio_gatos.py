# Audio del Short de gatos: musica (pistas de Gemini) + voz (ElevenLabs por frases) + efectos de 8 bits.
import subprocess, numpy as np, wave
SR=44100; DUR=58.0; N=int(DUR*SR); rng=np.random.default_rng(5)
def load(p,ch=2):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-f','s16le','-ac',str(ch),'-ar',str(SR),'-'],capture_output=True).stdout
    x=np.frombuffer(raw,np.int16).astype(float)/32768; return x.reshape(-1,ch) if ch>1 else x
def T(d): return np.arange(int(SR*d))/SR
def env(n,a=0.003,r=0.03):
    e=np.ones(n); ai=max(1,int(a*SR)); ri=max(1,int(r*SR)); e[:ai]=np.linspace(0,1,ai); e[-ri:]*=np.linspace(1,0,ri); return e
M='../musica/'
PARTES=[(M+'alegre_golden_hour_fiesta.mp3',0.0,15.6,0.0),(M+'triste_the_fading_afternoon.mp3',0.0,11.0,15.0),
        (M+'esperanza_first_light_on_the_porch.mp3',0.0,17.4,25.2),(M+'esperanza_first_light_on_the_porch.mp3',50.0,66.2,41.8)]
mus=np.zeros((N,2))
for k,(f,a,b,at) in enumerate(PARTES):
    x=load(f)[int(a*SR):int(b*SR)].copy(); n=int(0.6*SR)
    if k>0: x[:n]*=np.linspace(0,1,n)[:,None]
    if k<len(PARTES)-1: x[-n:]*=np.linspace(1,0,n)[:,None]
    i=int(at*SR); j=min(N,i+len(x)); mus[i:j]+=x[:j-i]
fo=int(1.2*SR); mus[-fo:]*=np.linspace(1,0,fo)[:,None]
voz=load('../voz/voz_gatos_elevenlabs.mp3',1)
SEG=[(0.06,2.50,0.20),(3.18,4.20,2.90),(4.90,7.78,4.90),(8.36,9.34,8.80),(9.60,10.70,9.90),(11.28,12.42,11.60),(12.70,13.54,13.40),
     (14.00,15.74,15.20),(16.30,17.74,17.60),(17.98,18.34,19.30),(18.84,20.22,21.30),(20.60,22.18,23.00),(22.58,23.84,25.60),
     (24.28,26.22,34.60),(26.72,29.00,42.40),(29.42,30.96,47.80),(31.32,32.44,49.80),(32.88,34.34,54.20),(34.62,35.62,55.90)]
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
for at in [10.6,13.6,16.8]: lose(at)
for at in [43.6,44.4,45.2]: gain(at)
for at in [26.6,28.2,29.8,31.4,35.4,36.8,38.2]: pop(at)
ns=rng.uniform(-1,1,int(SR*1.6)); a=0; y=np.zeros_like(ns)
for i in range(len(ns)): a+=0.35*(ns[i]-a); y[i]=ns[i]-a
add(y*env(len(y),0.05,0.2)*0.4,9.5,0.5)                                   # spray
t=T(4.6); m=np.sign(np.sin(2*np.pi*np.cumsum(70+4*np.sin(2*np.pi*0.5*t))/SR))*0.3; a=0; y=np.zeros_like(m)
for i in range(len(m)): a+=0.05*(m[i]-a); y[i]=a
add(y*env(len(y),0.3,0.6),0.0,1.2)                                        # moto
mix=mus*(0.32-0.20*pres)[:,None]+vt[:,None]+fx[:,None]*0.35
mix=mix/np.max(np.abs(mix))*0.9
with wave.open('mezcla_gatos_tmp.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
