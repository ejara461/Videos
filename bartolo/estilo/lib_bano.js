// Recursos de día para el Short del baño. Requiere lib.js y lib_escenas.js.
const DAY={sky1:'#BFE6E2',sky2:'#F3EBDD',wall:'#EADCC6',wallS:'#D9C7AE',floor:'#C9B79C',cream:'#F3EBDD',text:'#182939'};
const DEFS_DIA=`<defs><linearGradient id="skyd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${DAY.sky1}"/><stop offset="1" stop-color="${DAY.sky2}"/></linearGradient>
<radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF3D6" stop-opacity=".9"/><stop offset="1" stop-color="#FFF3D6" stop-opacity="0"/></radialGradient>
<radialGradient id="vigd" cx="50%" cy="50%" r="72%"><stop offset="60%" stop-color="#3a2a1a" stop-opacity="0"/><stop offset="100%" stop-color="#3a2a1a" stop-opacity=".35"/></radialGradient>
<radialGradient id="tealsoft" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${P.teal}" stop-opacity=".22"/><stop offset="1" stop-color="${P.teal}" stop-opacity="0"/></radialGradient></defs>`;
function cloudsD(t){let g='';[[180,330,1],[700,250,.8],[480,470,.6]].forEach(([cx,cy,k],i)=>{const x=((cx+t*14*(i+1))%1300)-110;g+=`<g transform="translate(${x},${cy}) scale(${k})" opacity=".95"><ellipse rx="90" ry="36" fill="#fff"/><ellipse cx="-50" cy="10" rx="60" ry="28" fill="#fff"/><ellipse cx="55" cy="8" rx="64" ry="28" fill="#fff"/></g>`;});return g;}
function streetDay(t){
  let g=`<rect width="1080" height="1920" fill="url(#skyd)"/><circle cx="830" cy="430" r="280" fill="url(#sun)"/><circle cx="830" cy="430" r="62" fill="#FFF3D6"/>`+cloudsD(t);
  const far=(t*60)%600;for(let i=-1;i<4;i++){const bx=i*600-far;g+=`<rect x="${bx}" y="760" width="260" height="740" fill="#E6D5BD" ${ol(4)}/><rect x="${bx+300}" y="880" width="220" height="620" fill="#DCC7A8" ${ol(4)}/>`;for(let r=0;r<5;r++)for(let c=0;c<2;c++)g+=`<rect x="${bx+40+c*110}" y="${820+r*110}" width="60" height="60" rx="6" fill="#A9D3D1" ${ol(3)}/>`;}
  const near=(t*260)%540;for(let i=-1;i<4;i++){const tx=i*540-near+120;g+=`<g filter="url(#wob)"><rect x="${tx-10}" y="1340" width="20" height="160" fill="#8A5A3B" ${ol(4)}/><circle cx="${tx}" cy="1300" r="70" fill="#6FA35A" ${ol(4)}/></g>`;}
  g+=`<rect x="0" y="1500" width="1080" height="420" fill="#B9B3A8"/><path d="M0,1500 H1080" ${ol()}/>`;
  const dash=(t*520)%240;for(let i=-1;i<6;i++)g+=`<rect x="${i*240-dash}" y="1660" width="120" height="12" fill="#F3EBDD" opacity=".8"/>`;
  return g;}
function patioBG(capOnHook){
  let g=`<rect width="1080" height="1920" fill="url(#skyd)"/><circle cx="850" cy="420" r="300" fill="url(#sun)"/><circle cx="850" cy="420" r="70" fill="#FFF3D6"/>`;
  g+=`<rect x="0" y="820" width="1080" height="660" fill="${DAY.wall}" ${ol()}/>`;
  for(let r=0;r<6;r++)for(let c=0;c<8;c++){const off=r%2?70:0;g+=`<rect x="${c*140+off-40}" y="${860+r*95}" width="110" height="60" rx="6" fill="${DAY.wallS}" opacity=".55"/>`;}
  g+=`<g filter="url(#wob)"><path d="M860,1480 L885,1350 H1015 L1040,1480 Z" fill="${P.terra}" ${ol()}/><ellipse cx="925" cy="1300" rx="48" ry="80" fill="#6FA35A" ${ol()}/><ellipse cx="990" cy="1290" rx="40" ry="70" fill="#5F9450" ${ol()}/></g>`;
  g+=`<circle cx="190" cy="980" r="10" fill="${P.line}"/>`;
  if(capOnHook)g+=`<g filter="url(#wob)"><path d="M150,1030 C155,985 235,983 245,1028 Z" fill="${P.terra}" ${ol()}/><path d="M228,1022 Q262,1016 282,1030 Q258,1036 228,1032 Z" fill="${P.terra}" ${ol()}/></g>`;
  g+=`<rect x="0" y="1480" width="1080" height="440" fill="${DAY.floor}"/><path d="M0,1480 H1080" ${ol()}/>`;
  for(let i=0;i<8;i++)g+=`<path d="M${i*160},1480 L${i*160-70},1920" stroke="#B3A084" stroke-width="5"/>`;
  return g;}
function tubFront(foam,t){
  let g=`<g filter="url(#wob)"><path d="M250,1260 L870,1260 L830,1480 L290,1480 Z" fill="${P.teal}" ${ol()}/><rect x="230" y="1240" width="660" height="40" rx="18" fill="#5FB3AE" ${ol()}/></g>`;
  if(foam)[[300,1236,22],[380,1226,28],[470,1232,24],[560,1222,30],[650,1230,24],[740,1226,28],[820,1234,22]].forEach(([x,y,r],i)=>g+=`<circle cx="${x}" cy="${y+Math.sin((t||0)*3+i)*3}" r="${r}" fill="#fff" ${ol(4)}/>`);
  return g;}
function headFoam(t){return [[600,985,30],[645,975,26],[560,995,22],[690,990,20]].map(([x,y,r],i)=>`<circle cx="${x}" cy="${y+Math.sin((t||0)*3+i)*2}" r="${r}" fill="#fff" ${ol(4)}/>`).join('');}
function bubbles(t,n=6){let g='';for(let i=0;i<n;i++){const p=((t*0.4+i/n)%1);const x=300+((i*137)%520);g+=`<circle cx="${x+Math.sin(p*6+i)*20}" cy="${1200-p*500}" r="${10+(i%3)*5}" fill="#fff" opacity="${0.8*(1-p)}" ${ol(3)}/>`;}return g;}
function steam(t,x0=330,x1=800){let g='';for(let i=0;i<5;i++){const x=x0+i*(x1-x0)/4,dy=(t*60+i*30)%120;g+=`<path d="M${x},${1180-dy} q16,-18 0,-36 q-16,-18 0,-36" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="${0.85*(1-dy/120)}"/>`;}return g;}
// brazo humano que entra desde la derecha; termina en (hx,hy)
function humanArm(hx,hy){return limb(`M1120,${hy-160} C1000,${hy-120} ${hx+90},${hy-40} ${hx},${hy}`,'#D9BDA0',30);}
function bottleHuman(x,y,r){return `<g transform="translate(${x},${y}) rotate(${r||0})"><rect x="-26" y="-80" width="52" height="110" rx="14" fill="#6C7FD1" ${ol(4)}/><rect x="-12" y="-100" width="24" height="22" fill="${P.line}"/><rect x="-18" y="-50" width="36" height="34" rx="4" fill="#fff"/><path d="M-10,-40 h20 M-10,-30 h14" stroke="#6C7FD1" stroke-width="4"/></g>`;}
function bottleDog(x,y,r){return `<g transform="translate(${x},${y}) rotate(${r||0})"><rect x="-26" y="-80" width="52" height="110" rx="14" fill="${P.terra}" ${ol(4)}/><rect x="-12" y="-100" width="24" height="22" fill="${P.line}"/><rect x="-18" y="-52" width="36" height="36" rx="4" fill="#fff"/>${paw(0,-34,.75,P.terra)}</g>`;}
function jug(x,y,r,pour){let g=`<g transform="translate(${x},${y}) rotate(${r||0})"><path d="M-36,-50 L36,-50 L30,40 L-30,40 Z" fill="#9FC9D0" ${ol(4)}/><path d="M36,-30 q30,10 0,40" stroke="${P.line}" stroke-width="8" fill="none"/></g>`;
  if(pour)g+=`<path d="M${x-40},${y-30} C${x-80},${y+10} ${x-110},${y+60} ${x-120},${y+130}" stroke="#7FC4E8" stroke-width="16" fill="none" stroke-linecap="round" opacity=".85"/>`;return g;}
function towel(x,y,r){return `<g transform="translate(${x},${y}) rotate(${r||0})" filter="url(#wob)"><rect x="-120" y="-50" width="240" height="100" rx="20" fill="#F4F0E8" ${ol()}/><path d="M-120,-20 H120 M-120,20 H120" stroke="${P.teal}" stroke-width="10"/></g>`;}
function drops(t,cx,cy,n=6){let g='';for(let i=0;i<n;i++){const p=((t*1.2+i/n)%1);const x=cx-120+((i*71)%240);g+=`<path d="M${x},${cy-60+p*160} q-8,14 0,18 q8,-4 0,-18 Z" fill="#7FC4E8" opacity="${1-p}" ${ol(2)}/>`;}return g;}
function sparkles(t,cx,cy,w=300,h=200,n=7){let g='';for(let i=0;i<n;i++){const a=t*2+i*1.3,sx=cx-w/2+((i*97)%w),sy=cy-h/2+((i*61)%h);g+=`<g opacity="${0.5+0.5*Math.sin(a*3)}" shape-rendering="crispEdges"><rect x="${sx}" y="${sy-9}" width="7" height="25" fill="#FFF3D6"/><rect x="${sx-9}" y="${sy}" width="25" height="7" fill="#FFF3D6"/></g>`;}return g;}
// manchas de polvo sobre Bartolo (mismas coordenadas que bartolo())
function dust(x,y,k,flip){const pts=[[-70,-120,16],[-20,-96,12],[30,-150,14],[60,-110,10],[100,-280,12],[150,-250,9],[-40,-170,10]];
  return `<g transform="translate(${x},${y}) scale(${flip?-k:k},${k})">${pts.map(([a,b,r])=>`<ellipse cx="${a}" cy="${b}" rx="${r}" ry="${r*0.7}" fill="#9C7A55" opacity=".7"/>`).join('')}</g>`;}
function wetMarks(x,y,k){return `<g transform="translate(${x},${y}) scale(${k})">${[[-60,-120],[0,-150],[50,-110],[120,-260]].map(([a,b])=>`<path d="M${a},${b} q6,16 0,30" stroke="#9FB8C2" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`).join('')}</g>`;}
function flakes(t,cx,cy){let g='';for(let i=0;i<8;i++){const p=((t*0.8+i/8)%1);g+=`<rect x="${cx-80+((i*53)%160)}" y="${cy+p*160}" width="7" height="7" fill="#fff" opacity="${1-p}" ${ol(1.5)}/>`;}return g;}
