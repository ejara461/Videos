// Personajes del Short de gatos: Lila (gata) y su dueña. Requiere lib.js (P, ol, limb, pix...).
const LILA={body:'#A9B8C2',dark:'#7E909C',inner:'#D9BDA0',nose:'#D58877'};
// Lila sentada, mirando a la derecha. expr: neutral | asco | triste | feliz
function lila(x,y,k,o={}){
  const c=LILA.body,e=o.expr||'neutral';let g='';
  g+=limb(o.tailDown?'M-55,-28 C-100,-20 -125,-10 -140,-4':'M-55,-28 C-115,-20 -122,-95 -82,-112',c,16);
  g+=`<path d="M-62,-10 C-78,-82 -52,-152 0,-160 C46,-166 62,-112 56,-62 C52,-26 30,-6 -10,-5 C-40,-5 -60,-6 -62,-10 Z" fill="${c}" ${ol()}/>`;
  g+=`<path d="M-40,-120 q14,6 26,0 M-46,-90 q16,6 30,0" stroke="${LILA.dark}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  g+=limb('M18,-62 L20,-6',c,16)+limb('M40,-62 L46,-6',c,16);
  const tilt=e==='asco'?-14:e==='triste'?8:0;
  let h='';
  h+=`<path d="M-2,-240 L8,-292 L34,-252 Z" fill="${c}" ${ol()}/><path d="M6,-250 L11,-274 L24,-254 Z" fill="${LILA.inner}"/>`;
  h+=`<path d="M44,-254 L72,-288 L78,-236 Z" fill="${c}" ${ol()}/><path d="M54,-250 L69,-270 L72,-244 Z" fill="${LILA.inner}"/>`;
  h+=`<path d="M-16,-205 C-20,-254 72,-266 86,-212 C94,-172 62,-150 32,-150 C2,-150 -12,-170 -16,-205 Z" fill="${c}" ${ol()}/>`;
  h+=`<path d="M20,-246 v14 M34,-248 v14 M48,-246 v12" stroke="${LILA.dark}" stroke-width="5" stroke-linecap="round"/>`;
  if(e==='feliz')h+=`<path d="M34,-210 q8,-9 16,0 M58,-210 q8,-9 16,0" stroke="${P.navy}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  else if(e==='asco')h+=`<path d="M34,-212 h16 M58,-212 h16" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/><path d="M32,-228 L50,-222 M58,-222 L76,-228" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/>`;
  else if(e==='triste')h+=`<circle cx="42" cy="-208" r="6" fill="${P.navy}"/><circle cx="66" cy="-208" r="6" fill="${P.navy}"/><path d="M32,-222 L50,-228 M58,-228 L76,-222" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/>`;
  else h+=`<circle cx="42" cy="-210" r="6" fill="${P.navy}"/><circle cx="66" cy="-210" r="6" fill="${P.navy}"/><path d="M33,-226 h18 M57,-226 h18" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/>`;
  h+=`<path d="M76,-196 l10,0 l-5,7 Z" fill="${LILA.nose}"/>`;
  h+=e==='asco'?`<path d="M66,-180 q6,-5 12,0 q6,5 12,0" stroke="${P.navy}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`:e==='triste'?`<path d="M70,-178 q11,-7 22,0" stroke="${P.navy}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`:`<path d="M81,-189 q-6,10 -12,4 M81,-189 q6,10 12,4" stroke="${P.navy}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  h+=`<path d="M92,-196 l30,-6 M92,-190 l32,2 M10,-194 l-28,-6 M10,-188 l-30,2" stroke="${P.line}" stroke-width="2.5" stroke-linecap="round"/>`;
  h+=`<path d="M2,-158 Q34,-144 70,-156" stroke="${P.terra}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="36" cy="-146" r="8" fill="${P.cream}" ${ol(3)}/>`;
  g+=`<g transform="rotate(${tilt},30,-160)">${h}</g>`;
  return `<g transform="translate(${x},${y}) scale(${o.flip?-k:k},${k})" filter="url(#wob)">${g}</g>`;
}
// Dueña de pie, mirando a la derecha. expr: neutral | asco | brava | feliz
function duena(x,y,k,o={}){
  const c='#E2B993',hair='#3A2A2F',e=o.expr||'neutral';let g='';
  g+=`<path d="M-60,-300 C-82,-230 -74,-176 -50,-166 L58,-166 C80,-186 84,-250 66,-300 Z" fill="${hair}" ${ol()}/>`;           // cabello largo (detrás)
  const sw=o.walk==null?0:Math.sin(o.walk)*26;
  g+=limb(`M-18,-170 L${-24-sw},-4`,c,26)+limb(`M18,-170 L${22+sw},-4`,c,26);                                                          // piernas
  g+=`<path d="M-52,-150 C-60,-230 -62,-300 -40,-360 C-20,-412 56,-412 66,-358 C80,-296 70,-220 58,-150 Z" fill="${c}" ${ol()}/>`;
  g+=`<path d="M-56,-262 C-58,-220 -56,-180 -52,-150 L58,-150 C64,-190 68,-226 68,-262 Z" fill="${P.teal}" ${ol()}/>`;
  g+=`<path d="M-44,-356 C-36,-414 62,-418 70,-356 C46,-374 20,-378 -6,-366 C-20,-360 -34,-352 -44,-356 Z" fill="${hair}" ${ol(5)}/>`; // flequillo
  g+=`<rect x="44" y="-392" width="22" height="12" rx="4" fill="${P.terra}" ${ol(3)}/>`;                                     // gancho
  const ey=-326;
  if(e==='feliz')g+=`<path d="M22,${ey} q9,-9 18,0" stroke="${P.navy}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M18,-290 q14,12 28,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else if(e==='asco')g+=`<path d="M22,${ey} h18" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/><path d="M18,${ey-16} L40,${ey-12}" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>`;
  else if(e==='brava')g+=`<circle cx="32" cy="${ey}" r="6.5" fill="${P.navy}"/><path d="M16,${ey-22} L44,${ey-12}" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/><path d="M20,-288 q12,-8 24,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else g+=`<circle cx="32" cy="${ey}" r="6.5" fill="${P.navy}"/><path d="M18,${ey-18} L44,${ey-18}" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/><path d="M22,-290 h18" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/>`;
  // brazos
  const arm=e==='asco'?'M54,-250 C96,-262 88,-300 64,-304':e==='brava'?'M54,-252 C100,-252 140,-252 180,-264':e==='feliz'?'M54,-250 C90,-236 96,-200 86,-160':'M54,-250 C68,-220 72,-190 70,-150';
  g+=limb('M-46,-250 C-62,-220 -66,-190 -64,-150',c,22);
  g+=limb(o.arm||arm,c,22);
  const bob=o.walk==null?0:-Math.abs(Math.sin(o.walk))*6;
  return `<g transform="translate(${x},${y+bob*k}) scale(${o.flip?-k:k},${k})" filter="url(#wob)">${g}</g>`;
}

// Lila caminando (mirando a la derecha)
function lilaWalk(x,y,k,o={}){
  const c=LILA.body,ph=o.walk||0,a=Math.sin(ph)*24;let g='';
  g+=limb('M-80,-90 C-120,-110 -120,-160 -96,-176',c,16);
  const leg=(lx,an)=>`<g transform="translate(${lx},-70) rotate(${an})">${limb('M0,0 L0,64',c,16)}</g>`;
  g+=leg(-50,-a)+leg(40,a);
  g+=`<path d="M-90,-80 C-96,-124 -40,-140 20,-136 C70,-132 90,-110 86,-82 C82,-58 40,-52 -20,-54 C-70,-56 -88,-62 -90,-80 Z" fill="${c}" ${ol()}/>`;
  g+=`<path d="M-50,-128 q8,12 0,22 M-20,-134 q8,12 0,22" stroke="${LILA.dark}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  g+=leg(-30,a)+leg(58,-a);
  let h=`<path d="M56,-176 L64,-218 L86,-186 Z" fill="${c}" ${ol()}/><path d="M92,-188 L116,-214 L120,-174 Z" fill="${c}" ${ol()}/>`;
  h+=`<path d="M44,-150 C40,-196 120,-206 132,-158 C138,-124 112,-108 88,-108 C62,-108 46,-124 44,-150 Z" fill="${c}" ${ol()}/>`;
  h+=o.expr==='asco'?`<path d="M86,-158 h14 M108,-158 h14" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>`:`<circle cx="94" cy="-156" r="5.5" fill="${P.navy}"/><circle cx="116" cy="-156" r="5.5" fill="${P.navy}"/>`;
  h+=`<path d="M124,-142 l9,0 l-4,6 Z" fill="${LILA.nose}"/><path d="M60,-110 Q90,-98 118,-110" stroke="${P.terra}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  g+=h;
  const bob=-Math.abs(Math.sin(ph))*5;
  return `<g transform="translate(${x},${y+bob*k}) scale(${o.flip?-k:k},${k})" filter="url(#wob)">${g}</g>`;
}
// Lila dormida, enroscada
function lilaSleep(x,y,k,o={}){
  const c=LILA.body,br=Math.sin((o.t||0)*2)*3;let g='';
  g+=`<path d="M-110,-20 C-120,-${80+br} -20,-${110+br} 50,-${96+br} C110,-84 120,-40 100,-18 C80,0 -60,4 -100,-4 Z" fill="${c}" ${ol()}/>`;
  g+=`<path d="M-60,-80 q10,10 0,22 M-20,-92 q10,10 0,22 M20,-92 q10,10 0,22" stroke="${LILA.dark}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  g+=limb('M90,-14 C40,10 -60,10 -100,-6',c,16);
  g+=`<path d="M-128,-70 L-122,-108 L-98,-82 Z" fill="${c}" ${ol()}/><path d="M-80,-86 L-58,-110 L-56,-76 Z" fill="${c}" ${ol()}/>`;
  g+=`<path d="M-150,-46 C-156,-90 -60,-98 -50,-54 C-46,-24 -76,-12 -100,-12 C-126,-12 -148,-22 -150,-46 Z" fill="${c}" ${ol()}/>`;
  g+=`<path d="M-128,-52 q8,6 16,0 M-104,-54 q8,6 16,0" stroke="${P.navy}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M-100,-36 l8,0 l-4,5 Z" fill="${LILA.nose}"/>`;
  return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#wob)">${g}</g>`;
}
// Caja de arena. dirty: 0..1 (grumos y olor), t: tiempo para animar el olor
function cajaArena(x,y,k,o={}){
  let g=`<path d="M-130,-90 L130,-90 L115,0 L-115,0 Z" fill="#5E7F86" ${ol()}/>`;
  g+=`<path d="M-118,-86 Q0,-104 118,-86 L118,-80 L-118,-80 Z" fill="${o.dirty>0.5?'#B9A27F':'#E6D3AE'}" ${ol(4)}/>`;
  if(o.dirty>0){[[-60,-92],[-10,-96],[40,-93],[80,-90]].slice(0,Math.ceil(o.dirty*4)).forEach(([a,b])=>g+=`<ellipse cx="${a}" cy="${b}" rx="14" ry="7" fill="#7A5A3A" ${ol(3)}/>`);
    const t=o.t||0;for(let i=0;i<3;i++){const ox=-50+i*50,dy=(t*50+i*22)%70;g+=`<path d="M${ox},${-110-dy} q12,-12 0,-24 q-12,-12 0,-24" stroke="#7FA34A" stroke-width="5" fill="none" stroke-linecap="round" opacity="${o.dirty*(1-dy/70)}"/>`;}}
  if(o.clean){for(let i=0;i<4;i++){const a=(o.t||0)*2+i*1.6,sx=-90+i*60,sy=-130-((i*37)%40);g+=`<g opacity="${0.5+0.5*Math.sin(a*3)}" shape-rendering="crispEdges"><rect x="${sx}" y="${sy-8}" width="6" height="22" fill="${P.cream}"/><rect x="${sx-8}" y="${sy}" width="22" height="6" fill="${P.cream}"/></g>`;}}
  return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#wob)">${g}</g>`;
}
function spray(x,y,k,t,on){
  let g=`<rect x="-16" y="-50" width="32" height="56" rx="8" fill="#E7A6B4" ${ol(4)}/><rect x="-8" y="-66" width="16" height="16" fill="${P.line}"/><rect x="-2" y="-70" width="18" height="8" fill="${P.line}"/>`;
  if(on)for(let i=0;i<8;i++){const p=((t*3+i/8)%1);g+=`<circle cx="${22+p*90}" cy="${-66+p*70+Math.sin(i)*12}" r="${4+p*5}" fill="#E7A6B4" opacity="${0.8*(1-p)}"/>`;}
  return `<g transform="translate(${x},${y}) scale(${k})">${g}</g>`;
}
