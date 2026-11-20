# Audio "La ventana de Lila": música (Gemini) + voz (ElevenLabs) + efectos. El salto solo lleva un sonido de aire, sin golpe.
import subprocess, numpy as np, wave
SR=44100; DUR=73.5; N=int(DUR*SR); rng=np.random.default_rng(19)
def load(p,ch=2):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-f','s16le','-ac',str(ch),'-ar',str(SR),'-'],capture_output=True).stdout
    x=np.frombuffer(raw,np.int16).astype(float)/32768; return x.reshape(-1,ch) if ch>1 else x
def T(d): return np.arange(int(SR*d))/SR
def env(n,a=0.003,r=0.03):
    e=np.ones(n); ai=max(1,int(a*SR)); ri=max(1,int(r*SR)); e[:ai]=np.linspace(0,1,ai); e[-ri:]*=np.linspace(1,0,ri); return e
def lp(x,k):
    y=np.zeros_like(x); a=0.0
    for i in range(len(x)): a+=k*(x[i]-a); y[i]=a
    return y
M='../musica/'
PARTES=[(M+'dia_coffee_and_clear_skies.mp3',0.0,15.9,0.0),(M+'triste_the_fading_afternoon.mp3',0.0,6.6,15.3),
        (M+'esperanza_first_light_on_the_porch.mp3',0.0,33.2,21.2),(M+'esperanza_first_light_on_the_porch.mp3',46.2,66.2,53.8)]
mus=np.zeros((N,2))
for k,(f,a,b,at) in enumerate(PARTES):
    x=load(f)[int(a*SR):int(b*SR)].copy(); n=int(0.6*SR)
    if k>0: x[:n]*=np.linspace(0,1,n)[:,None]
    if k<len(PARTES)-1: x[-n:]*=np.linspace(1,0,n)[:,None]
    i=int(at*SR); j=min(N,i+len(x)); mus[i:j]+=x[:j-i]
fo=int(1.0*SR); mus[-fo:]*=np.linspace(1,0,fo)[:,None]
voz=load('../voz/voz_ventana_elevenlabs.mp3',1)
SEG=[(0.08,1.16,0.2),(1.44,3.64,1.5),(4.20,7.38,4.2),(7.98,9.10,8.0),(9.50,10.16,9.4),(10.40,11.96,10.2),(12.48,13.58,12.6),
     (13.88,15.00,14.0),(15.44,16.32,15.6),(16.70,17.30,17.1),(17.66,18.52,18.0),(18.94,20.70,19.2),(21.02,22.38,21.6),
     (22.84,27.36,23.3),(27.84,29.98,28.3),(30.22,31.70,30.7),(32.18,33.56,33.2),(33.92,37.18,35.0),(37.60,40.76,38.7),
     (41.16,44.00,42.3),(44.46,48.16,45.6),(48.56,51.14,49.7),(51.40,52.62,52.5),(53.08,54.96,54.2),(55.24,56.54,56.3),
     (57.02,59.24,58.2),(59.60,70.27,61.3)]
vt=np.zeros(N); pres=np.zeros(N)
for n_,(a,b,at) in enumerate(SEG):
    nxt=SEG[n_+1][0]-0.05 if n_+1<len(SEG) else len(voz)/SR
    s=voz[max(0,int((a-0.04)*SR)):int(min(b+0.22,nxt)*SR)].copy(); f=int(0.01*SR); s[:f]*=np.linspace(0,1,f); s[-f:]*=np.linspace(1,0,f)
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
for at in [14.6,16.0,16.4]: lose(at)
for at in [55.0,55.7,56.4]: gain(at)
for at in [21.7,23.3,28.3,35.0,38.7,42.3,45.6,49.7]: pop(at)
w=lp(rng.uniform(-1,1,int(SR*0.7)),0.3)*np.sin(np.linspace(0,np.pi,int(SR*0.7))); add(w,15.6,0.6)   # salto: aire
t=T(4.0); m=np.sign(np.sin(2*np.pi*np.cumsum(70+4*np.sin(2*np.pi*0.5*t))/SR))*0.3; y=lp(m,0.05)
add(y*env(len(y),0.3,0.5),0.0,1.2)
mix=mus*(0.32-0.20*pres)[:,None]+vt[:,None]+fx[:,None]*0.35
mix=mix/np.max(np.abs(mix))*0.9
with wave.open('mezcla_ventana_tmp.wav','wb') as w_:
    w_.setnchannels(2); w_.setsampwidth(2); w_.setframerate(SR); w_.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
