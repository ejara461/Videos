// Recursos del Short de lluvia: atardecer gris, nubes, lluvia, relámpagos, charcos, patio techado y Canela.
const RAIN={sky1:'#4E5A66',sky2:'#7D7F86',glow:'#C98A5A',cloud:'#3B444E',cloudL:'#59636D',wall:'#6F7A80',wallD:'#5A646A',floor:'#3E474D'};
const CANELA={body:'#E3B77A',ear:'#B07A4E',spot:'#F4DBB9'};
const DEFS_LLUVIA=`<defs><linearGradient id="skyr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4450"/><stop offset=".3" stop-color="${RAIN.sky2}"/><stop offset=".44" stop-color="${RAIN.glow}"/><stop offset=".6" stop-color="#8A6A5A"/></linearGradient>
<radialGradient id="vigr" cx="50%" cy="50%" r="72%"><stop offset="55%" stop-color="#0b1015" stop-opacity="0"/><stop offset="100%" stop-color="#0b1015" stop-opacity=".6"/></radialGradient></defs>`;
// destello del relámpago: 0..1 (picos rápidos)
function flashAt(t,times){let f=0;for(const a of times){const d=t-a;if(d>=0&&d<0.5)f=Math.max(f,d<0.08?1:d<0.16?0.3:d<0.24?0.8:Math.max(0,1-(d-0.24)/0.26)*0.5);}return f;}
function rainSky(t,fl){
  let g=`<rect width="1080" height="1920" fill="url(#skyr)"/>`;
  g+=`<ellipse cx="540" cy="800" rx="700" ry="120" fill="#E0A06A" opacity=".45" filter="url(#blur40)"/>`;  // atardecer detrás de las nubes
  for(let i=0;i<6;i++){const x=((i*260+t*10)%1500)-200,y=200+(i%3)*150;g+=`<g opacity=".95"><ellipse cx="${x}" cy="${y}" rx="260" ry="90" fill="${i%2?RAIN.cloud:RAIN.cloudL}"/><ellipse cx="${x-140}" cy="${y+30}" rx="170" ry="70" fill="${RAIN.cloud}"/><ellipse cx="${x+150}" cy="${y+25}" rx="190" ry="72" fill="${RAIN.cloudL}"/></g>`;}
  if(fl>0)g+=`<rect width="1080" height="1920" fill="#EAF2FF" opacity="${0.3*fl}"/>`;
  return g;}
// rayo zigzag desde (x,y)
function bolt(x,y,len,fl,seed=1){if(fl<=0.05)return '';let d=`M${x},${y}`;let cx=x,cy=y;const st=len/7;
  for(let i=0;i<7;i++){cx+=((i*37+seed*53)%2?1:-1)*(30+((i*17+seed*11)%40));cy+=st;d+=` L${cx},${cy}`;}
  return `<path d="${d}" stroke="#EAF2FF" stroke-width="22" fill="none" opacity="${0.35*fl}" filter="url(#blur14)"/><path d="${d}" stroke="#FFFFFF" stroke-width="8" fill="none" stroke-linejoin="round" opacity="${fl}"/>`;}
// lluvia diagonal; dens = densidad
function rain(t,dens=90,y0=0,y1=1920,op=0.55){let g='';for(let i=0;i<dens;i++){const sp=900+(i%5)*120,x0=(i*137)%1180-60,yy=((i*211+t*sp)%(y1-y0+200))+y0-100;g+=`<path d="M${x0-yy*0.18},${yy} l-12,46" stroke="#CFE0EA" stroke-width="3" stroke-linecap="round" opacity="${op}"/>`;}return g;}
// charcos con ondas
function puddle(x,y,w,t){let g=`<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w*0.18}" fill="#5B6E7A" opacity=".75" ${ol(3)}/>`;
  for(let i=0;i<3;i++){const p=((t*0.9+i/3)%1);g+=`<ellipse cx="${x-w*0.4+i*w*0.4}" cy="${y}" rx="${8+p*w*0.25}" ry="${(8+p*w*0.25)*0.25}" fill="none" stroke="#CFE0EA" stroke-width="3" opacity="${1-p}"/>`;}return g;}
// patio de casa con alero (techo) a la izquierda
function patio(t,fl){
  let g=rainSky(t,fl);
  g+=`<g filter="url(#wob)"><rect x="-20" y="840" width="1120" height="640" fill="${RAIN.wall}" ${ol()}/></g>`;
  for(let r=0;r<6;r++)for(let c=0;c<8;c++){const off=r%2?70:0;g+=`<rect x="${c*140+off-40}" y="${880+r*95}" width="110" height="60" rx="6" fill="${RAIN.wallD}" opacity=".6"/>`;}
  g+=`<g filter="url(#wob)"><rect x="40" y="980" width="380" height="500" fill="#2E363C" ${ol()}/><rect x="80" y="1020" width="140" height="460" fill="#8A5A3B" ${ol()}/><rect x="250" y="1040" width="140" height="140" fill="#F4DBB9" opacity=".75" ${ol(4)}/></g>`;   // puerta y ventana iluminada
  g+=`<g filter="url(#wob)"><path d="M-20,940 L520,940 L560,990 L-20,990 Z" fill="${P.terra}" ${ol()}/></g>`;      // alero / techo
  g+=`<rect x="0" y="1480" width="1080" height="440" fill="${RAIN.floor}"/><path d="M0,1480 H1080" ${ol()}/>`;
  if(fl>0)g+=`<rect width="1080" height="1920" fill="#EAF2FF" opacity="${0.15*fl}"/>`;
  return g;}
// Canela sentada mirando a la derecha. o: wet, scared, shake, lick, happy, coat (impermeable)
function canela(x,y,k,o={}){
  const c=CANELA.body,t=o.t||0,sh=o.shake?Math.sin(t*60)*4:0;let g='';
  g+=limb(o.scared?'M-70,-60 Q-100,-40 -110,-10':'M-70,-100 Q-110,-120 -112,-160',c,18);
  g+=`<path d="M-80,-60 C-95,-130 -40,-170 10,-165 C50,-160 70,-120 62,-80 C55,-50 20,-40 -20,-42 C-60,-44 -75,-48 -80,-60 Z" fill="${c}" ${ol()}/>`;
  g+=`<ellipse cx="-10" cy="-100" rx="30" ry="20" fill="${CANELA.spot}"/>`;
  if(o.coat)g+=`<path d="M-82,-70 C-90,-130 -40,-166 12,-160 C50,-156 66,-120 60,-84 Z" fill="#E3A93B" ${ol()}/><path d="M-30,-160 L-20,-80" stroke="${P.navy}" stroke-width="4"/>`;
  const lk=o.lick?Math.max(0,Math.sin(t*10))*0.6:0;
  g+=limb('M-50,-50 L-60,-4',c)+`<g transform="rotate(${-lk*40},30,-60)">${limb('M30,-60 L34,-4',c)}</g>`;
  let h=`<path d="M10,-200 C4,-262 60,-290 104,-274 C148,-258 156,-212 140,-180 C126,-154 86,-150 58,-156 C28,-162 14,-178 10,-200 Z" fill="${c}" ${ol()}/>`;
  h+=`<path d="M34,-262 C8,-252 -2,-220 8,-196 C16,-184 30,-194 34,-210 Z" fill="${CANELA.ear}" ${ol()}/><ellipse cx="148" cy="-214" rx="9" ry="7" fill="${P.navy}"/>`;
  if(o.happy)h+=`<path d="M90,-232 q10,-10 20,0" stroke="${P.navy}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M112,-186 q12,14 26,0 Z" fill="#E77C7C" ${ol(3)}/>`;
  else if(o.scared)h+=`<circle cx="100" cy="-232" r="12" fill="#fff" ${ol(4)}/><circle cx="104" cy="-230" r="6" fill="${P.navy}"/><path d="M82,-260 L116,-250" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/><path d="M114,-178 q6,-6 12,0 q6,6 12,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else h+=`<circle cx="100" cy="-232" r="7" fill="${P.navy}"/><path d="M84,-252 L116,-256" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/><path d="M118,-182 q10,-5 20,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  h+=`<path d="M36,-160 Q70,-146 104,-158" stroke="${P.terra}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  const hy=o.lick?lk*60:(o.scared?12:0);
  g+=`<g transform="translate(${sh},${hy}) rotate(${o.lick?lk*30:0},40,-170)">${h}</g>`;
  if(o.wet)for(let i=0;i<5;i++){const p=((t*1.4+i/5)%1);g+=`<path d="M${-60+i*30},${-40+p*60} q-6,10 0,14 q6,-4 0,-14 Z" fill="#9FC9E0" opacity="${1-p}"/>`;}
  if(o.wet)g+=`<path d="M-60,-140 q4,14 0,26 M-20,-150 q4,14 0,26 M20,-140 q4,14 0,26 M70,-250 q4,12 0,22" stroke="#B88A55" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if(o.shake)g+=`<path d="M-120,-150 q-12,10 0,20 q12,10 0,20 M180,-230 q12,10 0,20 q-12,10 0,20" stroke="#EAF2FF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;
  return `<g transform="translate(${x},${y}) scale(${o.flip?-k:k},${k})" filter="url(#wob)">${g}</g>`;
}
// cama/cojín: wet=true la muestra húmeda
function cama(x,y,k,wet){return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#wob)"><ellipse cx="0" cy="0" rx="170" ry="40" fill="${wet?'#4E5F6E':P.teal}" ${ol()}/><ellipse cx="0" cy="-10" rx="130" ry="24" fill="${wet?'#5E7383':'#5FB3AE'}"/>${wet?'<path d="M-60,-14 q10,6 20,0 M10,-8 q10,6 20,0" stroke="#9FC9E0" stroke-width="4" fill="none"/>':''}</g>`;}
