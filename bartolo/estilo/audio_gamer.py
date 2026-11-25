# Audio "Una partida más": chiptune propio + efectos sintetizados + coro de "¡Bartolo ya llegó!" desde la entrega.
import subprocess, numpy as np, wave
SR=44100; DUR=32.0; N=int(DUR*SR)
def load(p,ch=2):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-f','s16le','-ac',str(ch),'-ar',str(SR),'-'],capture_output=True).stdout
    x=np.frombuffer(raw,np.int16).astype(float)/32768; return x.reshape(-1,ch)
def T(d): return np.arange(int(SR*d))/SR
def env(n,a=0.003,r=0.03):
    e=np.ones(n); ai=max(1,int(a*SR)); ri=max(1,int(r*SR)); e[:ai]=np.linspace(0,1,ai); e[-ri:]*=np.linspace(1,0,ri); return e
fx=np.zeros(N); chip=np.zeros(N)
def add(buf,sig,at,g): i=int(at*SR); j=min(N,i+len(sig)); buf[i:j]+=sig[:j-i]*g
sq=lambda f,d: np.sign(np.sin(2*np.pi*f*T(d)))*0.5
# chiptune en bucle (escenas 0-1), sigue suave hasta la pausa (9.95 s)
mel=[523,659,784,659,587,698,880,698,523,659,784,1046,988,784,659,587]
bas=[131,131,175,175,147,147,196,196]
st=0.15
for k in range(int(9.95/st)):
    at=k*st; add(chip,sq(mel[k%16],st*0.9)*env(int(SR*st*0.9)),at,0.35)
    if k%2==0: add(chip,sq(bas[(k//2)%8],st*1.8)*env(int(SR*st*1.8)),at,0.3)
chip[int(3.5*SR):int(9.95*SR)]*=np.linspace(1,0.45,int(9.95*SR)-int(3.5*SR))
def lose(at):
    for q,f in enumerate([660,494,330]): add(fx,sq(f,0.09)*env(int(SR*0.09)),at+q*0.08,0.5)
def gain(at):
    for q,f in enumerate([523,659,784,1046]): add(fx,sq(f,0.07)*env(int(SR*0.07)),at+q*0.06,0.4)
def pop(at): add(fx,np.sin(2*np.pi*np.cumsum(np.linspace(300,700,int(SR*0.07)))/SR)*env(int(SR*0.07)),at,0.6)
def tick(at): t=T(0.03); add(fx,np.sin(2*np.pi*2400*t)*np.exp(-t*200),at,0.5)
# reloj acelerado (escena 1)
for k in range(30): tick(3.6+k*0.1)
lose(5.0); lose(6.2); lose(7.6)
# gruñido (escena 2)
t=T(1.0); g=np.sign(np.sin(2*np.pi*np.cumsum(85+15*np.sin(2*np.pi*7*t))/SR))*0.4*np.exp(-t*1.5)
add(fx,np.convolve(g,np.ones(30)/30,'same'),8.1,1.0)
# salto + golpe del control + PAUSA (escena 3)
add(fx,np.sin(2*np.pi*np.cumsum(np.linspace(200,900,int(SR*0.25)))/SR)*env(int(SR*0.25)),9.7,0.5)
t=T(0.2); add(fx,np.random.default_rng(3).normal(0,1,len(t))*np.exp(-t*30),10.4,0.6)
add(fx,sq(880,0.12)*env(int(SR*0.12)),10.0,0.4); add(fx,sq(440,0.2)*env(int(SR*0.2)),10.12,0.4)
# idea (escena 4)
t=T(0.8); add(fx,(np.sin(2*np.pi*1568*t)+0.5*np.sin(2*np.pi*3136*t))*np.exp(-t*5),13.5,0.3)
# chat (escena 5)
pop(14.9); pop(16.1)
# moto (escena 6)
t=T(4.0); m=np.sign(np.sin(2*np.pi*np.cumsum(70+6*np.sin(2*np.pi*0.7*t))/SR))*0.3
m=np.convolve(m,np.ones(40)/40,'same'); add(fx,m*env(len(m),0.3,0.5),17.5,1.0)
gain(17.7)
# timbre + plato + fanfarria (escena 7)
t=T(0.6); add(fx,np.sin(2*np.pi*988*t)*np.exp(-t*5),21.55,0.4); add(fx,np.sin(2*np.pi*784*T(0.9))*np.exp(-T(0.9)*4),21.95,0.4)
t=T(0.5); add(fx,np.random.default_rng(5).normal(0,1,len(t))*np.exp(-t*8)*0.4,22.9,0.6)
for q,f in enumerate([523,659,784,1046,784,1046]): add(fx,sq(f,0.12 if q<5 else 0.4)*env(int(SR*(0.12 if q<5 else 0.4))),23.1+q*0.12,0.35)
for at in [23.3,23.8,24.3]: gain(at)
pop(28.5); pop(28.9)
# coro de la canción desde 17.5 s
mus=np.zeros((N,2)); x=load('../musica/cancion_bartolo_ya_llego.mp3')[int(45.6*SR):int((45.6+14.5)*SR)].copy()
n=int(0.8*SR); x[:n]*=np.linspace(0,1,n)[:,None]; i=int(17.5*SR); j=min(N,i+len(x)); mus[i:j]=x[:j-i]
fo=int(1.0*SR); mus[-fo:]*=np.linspace(1,0,fo)[:,None]
mix=mus*0.55+(chip+fx*0.6)[:,None]*0.45
mix=mix/np.max(np.abs(mix))*0.9
with wave.open('mezcla_gamer_tmp.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
