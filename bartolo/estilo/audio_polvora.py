# Audio del Short de pólvora: música (Gemini) + voz (ElevenLabs por frases) + efectos.
# Los estallidos son suaves y a volumen bajo, para no asustar a las mascotas de quien vea el video.
import subprocess, numpy as np, wave
SR=44100; DUR=54.5; N=int(DUR*SR); rng=np.random.default_rng(11)
def load(p,ch=2):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-f','s16le','-ac',str(ch),'-ar',str(SR),'-'],capture_output=True).stdout
    x=np.frombuffer(raw,np.int16).astype(float)/32768; return x.reshape(-1,ch) if ch>1 else x
def T(d): return np.arange(int(SR*d))/SR
def env(n,a=0.003,r=0.03):
    e=np.ones(n); ai=max(1,int(a*SR)); ri=max(1,int(r*SR)); e[:ai]=np.linspace(0,1,ai); e[-ri:]*=np.linspace(1,0,ri); return e
M='../musica/'
PARTES=[(M+'alegre_golden_hour_fiesta.mp3',0.0,9.2,0.0),(M+'triste_the_fading_afternoon.mp3',0.0,15.4,8.6),
        (M+'esperanza_first_light_on_the_porch.mp3',0.0,17.2,23.4),(M+'esperanza_first_light_on_the_porch.mp3',51.4,66.2,40.0)]
mus=np.zeros((N,2))
for k,(f,a,b,at) in enumerate(PARTES):
    x=load(f)[int(a*SR):int(b*SR)].copy(); n=int(0.6*SR)
    if k>0: x[:n]*=np.linspace(0,1,n)[:,None]
    if k<len(PARTES)-1: x[-n:]*=np.linspace(1,0,n)[:,None]
    i=int(at*SR); j=min(N,i+len(x)); mus[i:j]+=x[:j-i]
fo=int(1.0*SR); mus[-fo:]*=np.linspace(1,0,fo)[:,None]
voz=load('../voz/voz_polvora_elevenlabs.mp3',1)
SEG=[(0.08,1.14,0.2),(1.72,3.42,1.5),(3.94,4.68,3.4),(5.28,6.58,4.8),(6.94,8.78,6.4),(9.30,10.60,8.8),(10.92,11.98,10.3),
     (12.50,13.20,11.8),(13.56,14.56,12.8),(14.92,15.98,14.2),(16.48,18.78,16.0),(19.30,21.50,19.0),(21.88,23.12,21.5),
     (23.68,26.02,23.6),(26.40,27.62,31.2),(28.22,30.92,40.2),(31.36,31.90,43.2),(32.26,32.94,44.0),(33.44,35.76,46.2),
     (36.24,37.70,50.6),(38.00,38.96,52.4)]
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
def soft_boom(at,g):   # estallido amortiguado: ruido muy filtrado con caída lenta, sin ataque brusco
    d=1.4; ns=rng.uniform(-1,1,int(SR*d)); a=0; y=np.zeros_like(ns)
    for i in range(len(ns)): a+=0.02*(ns[i]-a); y[i]=a
    e=np.exp(-T(d)*3.0); e[:int(0.03*SR)]*=np.linspace(0,1,int(0.03*SR))
    add(y/np.max(np.abs(y))*e,at,g)
for at in [9.2,10.0,14.6,17.6]: lose(at)
for at in [41.2,41.9,42.6,43.3]: gain(at)
for at in [25.0,26.4,27.8,32.4,33.8,35.2,36.6]: pop(at)
for at in [8.9,9.9,10.5,12.0,13.3,14.5,16.2]: soft_boom(at,0.35)
for at in [41.0,44.5]: soft_boom(at,0.10)          # afuera, muy lejos (escena tranquila)
for at in [46.4,48.2]: soft_boom(at,0.18)
t=T(4.6); m=np.sign(np.sin(2*np.pi*np.cumsum(70+4*np.sin(2*np.pi*0.5*t))/SR))*0.3; a=0; y=np.zeros_like(m)
for i in range(len(m)): a+=0.05*(m[i]-a); y[i]=a
add(y*env(len(y),0.3,0.6),0.0,1.2)
mix=mus*(0.32-0.20*pres)[:,None]+vt[:,None]+fx[:,None]*0.35
mix=mix/np.max(np.abs(mix))*0.9
with wave.open('mezcla_polvora_tmp.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
