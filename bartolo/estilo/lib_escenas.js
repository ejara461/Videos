// Utilidades compartidas de escenas (extraídas del piloto)
const ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const lerp=(a,b,p)=>a+(b-a)*p;
const lerpA=(A,B,p)=>A.map((v,i)=>lerp(v,B[i],p));
const PURP='#7B6A97';

/* ---------- CORAZONES (estado a lo largo del video) ---------- */
function heartBar(cx,y,k,st,t){
  if(!st)return '';let g='';const n=5,w=9*k+k*2,x0=cx-(n*w)/2;
  const shake=st.hit>0&&st.hit<1?Math.sin(t*90)*7:0;
  for(let i=0;i<n;i++){
    let on=i<st.n;let op=1;
    if(st.hit>0&&st.hit<1&&i===st.n)on=Math.floor(t*20)%2===0;
    if(on&&st.pulse)op=0.55+0.45*Math.abs(Math.sin(t*3));
    if(on&&st.dim)op=0.35+0.25*Math.abs(Math.sin(t*5));
    let sc=1;if(st.gain>0&&st.gain<1&&i===st.n-1)sc=back(st.gain);
    const hx=x0+i*w,hy=y;
    g+=`<g opacity="${op}" transform="translate(${hx+4.5*k},${hy+4*k}) scale(${sc}) translate(${-4.5*k},${-4*k})">${pix(0,0,k,HEART,{X:P.navy,R:on?P.terra:P.muz,W:on?P.cream:P.muz})}</g>`;
  }
  if(st.hit>0&&st.hit<1)g+=`<text x="${x0+n*w+30}" y="${y+40-st.hit*50}" font-family="Inter" font-weight="800" font-size="46" fill="${P.terra}" opacity="${1-st.hit}">-1</text>`;
  if(st.gain>0&&st.gain<1)g+=`<text x="${x0+n*w+30}" y="${y+40-st.gain*50}" font-family="Inter" font-weight="800" font-size="46" fill="${P.teal}" opacity="${1-st.gain}">+1</text>`;
  if(st.shine){for(let i=0;i<6;i++){const a=t*1.5+i,sx=x0-20+((i*97)%(n*w+40)),sy=y-30+((i*53)%90);g+=`<g opacity="${0.5+0.5*Math.sin(a*3)}" shape-rendering="crispEdges"><rect x="${sx}" y="${sy-8}" width="6" height="22" fill="${P.cream}"/><rect x="${sx-8}" y="${sy}" width="22" height="6" fill="${P.cream}"/></g>`;}}
  return `<g transform="translate(${shake},0)">${g}</g>`;
}

/* ---------- PERSONAJES PARAMETRIZADOS ---------- */
const ARM={eat:[-70,-175,-60,-215,-22,-212],offer:[-90,-150,-150,-120,-205,-88],rest:[-60,-120,-70,-90,-60,-60],pet:[-90,-200,-170,-190,-230,-150]};
function ownerArm(o){let a=ARM[o.armA||'rest'];if(o.armB)a=lerpA(a,ARM[o.armB],ease(clamp(o.armP||0)));if(o.osc)a=a.map((v,i)=>i>=4?v+(i===4?Math.sin(o.osc)*18:Math.cos(o.osc)*6):v);return a;}
function item(type,x,y){
  if(type==='grape')return `<circle cx="${x}" cy="${y}" r="17" fill="${PURP}" ${ol(4)}/>`;
  if(type==='choco')return `<g transform="translate(${x},${y})"><rect x="-20" y="-14" width="40" height="28" rx="4" fill="#6B4231" ${ol(4)}/><path d="M0,-14 V14 M-20,0 H20" stroke="#4A2C20" stroke-width="3"/></g>`;
  if(type==='scrap')return `<path d="M${x-20},${y} C${x-18},${y-18} ${x+16},${y-20} ${x+20},${y-2} C${x+18},${y+14} ${x-14},${y+16} ${x-20},${y} Z" fill="#B07A4E" ${ol(4)}/>`;
  if(type==='spoon')return `<path d="M${x},${y} l18,-26" stroke="${P.line}" stroke-width="6" stroke-linecap="round"/>`;
  return '';
}
function owner2(x,y,k,o={}){
  const c=P.creamS;let g='';
  g+=`<path d="M-55,0 C-62,-110 -70,-210 -48,-280 C-28,-338 52,-340 66,-282 C82,-214 70,-100 62,0 Z" fill="${c}" ${ol()}/>`;
  g+=`<path d="M-50,-282 C-40,-340 60,-344 68,-284 C40,-300 0,-302 -50,-282 Z" fill="${P.navy}" ${ol()}/>`;
  const ey=o.look==='down'?-244:-250;
  g+=`<circle cx="-10" cy="${ey}" r="7" fill="${P.navy}"/><path d="M-30,${o.sad?-266:-272} L4,${o.sad?-276:-274}" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/>`;
  g+=o.smile?`<path d="M-18,-216 q12,10 24,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`:o.chew?`<ellipse cx="-6" cy="-212" rx="${6+3*Math.abs(Math.sin(o.chew))}" ry="${3+3*Math.abs(Math.sin(o.chew))}" fill="${P.navy}"/>`:`<path d="M-16,-214 h20" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/>`;
  const a=ownerArm(o);
  g+=limb(`M-30,-160 C${a[0]},${a[1]} ${a[2]},${a[3]} ${a[4]},${a[5]}`,c,24);
  if(o.item)g+=item(o.item,a[4]-14,a[5]+6);
  return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#wob)">${g}</g>`;
}
function ownerHand(x,y,k,o){const a=ownerArm(o);return {x:x+(a[4]-14)*k,y:y+(a[5]+6)*k};}
function max2(x,y,k,o={}){
  const c=P.terraL;let g='';const wag=o.wag||0;
  g+=`<g transform="rotate(${wag},-70,-100)">${limb('M-70,-100 Q-110,-120 -112,-160',c,18)}</g>`;
  g+=`<path d="M-80,-60 C-95,-130 -40,-170 10,-165 C50,-160 70,-120 62,-80 C55,-50 20,-40 -20,-42 C-60,-44 -75,-48 -80,-60 Z" fill="${c}" ${ol()}/>`;
  g+=limb('M-50,-50 L-60,-4',c)+limb('M30,-60 L34,-4',c);
  const hy=o.chew?Math.sin(o.chew)*4:0;
  let h=`<path d="M10,-200 C4,-262 60,-290 104,-274 C148,-258 156,-212 140,-180 C126,-154 86,-150 58,-156 C28,-162 14,-178 10,-200 Z" fill="${c}" ${ol()}/>`;
  h+=`<path d="M38,-262 C14,-262 0,-232 8,-204 C14,-188 30,-196 36,-212 Z" fill="${P.terra}" ${ol()}/><ellipse cx="148" cy="-214" rx="9" ry="7" fill="${P.navy}"/>`;
  const e=o.expr||'up';
  if(e==='happy')h+=`<path d="M88,-230 q10,-10 20,0" stroke="${P.navy}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M110,-186 q12,16 26,0 Z" fill="${P.pink||'#E77C7C'}" ${ol(3)}/>`;
  else h+=`<circle cx="100" cy="-232" r="7" fill="${P.navy}"/><path d="M84,-256 L116,-254" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/><path d="M118,-182 q10,6 20,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  h+=`<path d="M36,-160 Q70,-146 104,-158" stroke="${P.teal}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  g+=`<g transform="translate(0,${hy})">${h}</g>`;
  return `<g transform="translate(${x},${y}) scale(${o.flip?-k:k},${k})" filter="url(#wob)">${g}</g>`;
}
function maxLie(x,y,k,o={}){
  const c=P.terraL;let g='';const br=Math.sin((o.t||0)*2)*3;
  g+=limb('M-110,-40 Q-150,-40 -165,-20',c,18);
  g+=`<path d="M-120,-30 C-125,-${80+br} -40,-${95+br} 30,-${88+br} C80,-82 95,-50 85,-28 C80,-10 40,-4 -30,-4 C-90,-4 -118,-10 -120,-30 Z" fill="${c}" ${ol()}/>`;
  g+=`<path d="M60,-60 C55,-110 110,-130 150,-115 C190,-100 200,-60 185,-35 C170,-12 120,-8 95,-14 C70,-20 62,-38 60,-60 Z" fill="${c}" ${ol()}/>`;
  g+=`<path d="M86,-108 C62,-110 50,-82 56,-56 C62,-42 76,-50 82,-64 Z" fill="${P.terra}" ${ol()}/><ellipse cx="192" cy="-62" rx="9" ry="7" fill="${P.navy}"/>`;
  if(o.expr==='happy')g+=`<path d="M135,-78 q10,-10 20,0" stroke="${P.navy}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M160,-36 q10,8 20,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else g+=`<path d="M132,-74 q12,5 24,0" stroke="${P.navy}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M130,-96 L158,-90" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/><path d="M160,-32 q10,-5 20,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  g+=`<path d="M80,-30 Q110,-16 140,-24" stroke="${P.teal}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#wob)">${g}</g>`;
}
const HELMET=`<path d="M50,-262 C40,-345 175,-360 198,-290 L202,-262 Z" fill="${P.terra}" ${ol()}/><path d="M152,-302 C186,-302 202,-286 202,-262 L152,-262 Z" fill="#2E3D52" ${ol(4)}/><path d="M80,-310 C100,-330 130,-334 150,-330" stroke="${P.terraL}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
function scooterMin(x,y,k,t){
  const sp=t*14;
  const wheel=(cx)=>`<g transform="translate(${cx},-34)"><circle r="40" fill="${P.navy}" ${ol()}/><circle r="16" fill="${P.creamS}"/><path d="M0,-16 V16" stroke="${P.line}" stroke-width="4" transform="rotate(${sp*57})"/></g>`;
  let g=wheel(-120)+wheel(150);
  g+=`<path d="M-170,-60 C-170,-120 -90,-130 -30,-110 L60,-90 C90,-80 120,-90 140,-140 L170,-140 C190,-100 200,-70 190,-50 L-160,-44 Z" fill="${P.terra}" ${ol()}/>`;
  g+=`<path d="M150,-140 L120,-250" stroke="${P.line}" stroke-width="14" stroke-linecap="round"/><path d="M95,-255 L150,-248" stroke="${P.line}" stroke-width="14" stroke-linecap="round"/>`;
  g+=`<rect x="-200" y="-190" width="80" height="70" rx="8" fill="${P.terra}" ${ol()}/>`+paw(-160,-155,.8,P.navy);
  g+=`<circle cx="185" cy="-120" r="10" fill="${P.cream}"/>`;
  return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#wob)">${g}</g>`;
}

/* ---------- FONDOS ---------- */
function vignette(){return `<rect width="1080" height="1920" fill="url(#vig)"/>`;}
function bars(){return `<rect width="1080" height="110" fill="#000"/><rect y="1810" width="1080" height="110" fill="#000"/>`;}
function streetBG(t){
  let g=`<rect width="1080" height="1920" fill="#0E1A24"/><circle cx="820" cy="520" r="44" fill="#EAF2EE"/><circle cx="820" cy="520" r="90" fill="${P.cream}" opacity=".18" filter="url(#blur14)"/>`;
  const far=(t*60)%600;for(let i=-1;i<4;i++){const bx=i*600-far;g+=`<g opacity=".7"><rect x="${bx}" y="760" width="260" height="700" fill="#14262F" ${ol(4)}/><rect x="${bx+300}" y="880" width="220" height="580" fill="#12222B" ${ol(4)}/></g>`;for(let r=0;r<5;r++)for(let c=0;c<2;c++){if((i+r+c)%3===0)g+=`<rect x="${bx+40+c*110}" y="${820+r*110}" width="60" height="60" rx="6" fill="${P.cream}" opacity=".45"/>`;}}
  const near=(t*260)%540;for(let i=-1;i<4;i++){const lx=i*540-near+100;g+=`<path d="M${lx},1500 V1060 Q${lx},1030 ${lx+40},1030" stroke="${P.line}" stroke-width="10" fill="none"/><circle cx="${lx+46}" cy="1046" r="80" fill="url(#lamp)"/><ellipse cx="${lx+46}" cy="1040" rx="22" ry="10" fill="${P.cream}"/>`;}
  g+=`<rect x="0" y="1500" width="1080" height="420" fill="#16232C"/><path d="M0,1500 H1080" ${ol()}/>`;
  const dash=(t*520)%240;for(let i=-1;i<6;i++)g+=`<rect x="${i*240-dash}" y="1660" width="120" height="12" fill="${P.line}" opacity=".7"/>`;
  return g;
}
function kitchenBG(){
  let g=`<rect width="1080" height="1920" fill="url(#wall)"/>`;
  g+=`<g filter="url(#wob)"><rect x="110" y="420" width="330" height="330" rx="26" fill="#0B1620" ${ol()}/><path d="M275,420 V750 M110,585 H440" ${ol()}/></g>`;
  g+=`<circle cx="355" cy="500" r="60" fill="${P.cream}" opacity=".35" filter="url(#blur14)"/><circle cx="355" cy="500" r="36" fill="#EAF2EE"/>`;
  g+=`<g filter="url(#wob)"><rect x="620" y="380" width="380" height="250" rx="18" fill="#1A3540" ${ol()}/><path d="M810,380 V630" ${ol()}/><circle cx="790" cy="505" r="7" fill="${P.line}"/><circle cx="830" cy="505" r="7" fill="${P.line}"/></g>`;
  g+=`<rect x="0" y="1480" width="1080" height="440" fill="#13252F"/><path d="M0,1480 H1080" ${ol()}/>`;
  g+=`<path d="M640,0 V820" stroke="${P.lineD}" stroke-width="5"/><circle cx="640" cy="1080" r="560" fill="url(#lamp)"/>`;
  g+=`<g filter="url(#wob)"><path d="M570,880 Q640,780 710,880 Z" fill="${P.terra}" ${ol()}/></g><ellipse cx="640" cy="888" rx="36" ry="14" fill="${P.cream}"/><circle cx="640" cy="900" r="90" fill="${P.cream}" opacity=".35" filter="url(#blur40)"/>`;
  return g;
}
function kitchenTable(plateItems){
  let g=`<g filter="url(#wob)"><rect x="430" y="1290" width="600" height="34" rx="10" fill="#5A3E33" ${ol()}/><path d="M470,1324 V1480 M990,1324 V1480" stroke="${P.line}" stroke-width="14" stroke-linecap="round"/><ellipse cx="820" cy="1286" rx="90" ry="14" fill="#E9E2D6" ${ol(4)}/></g>`;
  if(plateItems)[[795,1272],[815,1268],[835,1273]].forEach(([a,b])=>g+=`<circle cx="${a}" cy="${b}" r="11" fill="${PURP}" ${ol(3)}/>`);
  return g;
}
function bedroomBG(){
  let g=`<rect width="1080" height="1920" fill="#0B141C"/>`;
  g+=`<g filter="url(#wob)"><rect x="560" y="520" width="330" height="330" rx="26" fill="#0E1C27" ${ol()}/><path d="M725,520 V850 M560,685 H890" ${ol()}/></g><circle cx="800" cy="600" r="34" fill="#EAF2EE"/><circle cx="800" cy="600" r="70" fill="${P.cream}" opacity=".25" filter="url(#blur14)"/>`;
  g+=`<path d="M560,850 L300,1500 L1080,1500 L1080,1150 L890,850 Z" fill="#9FC9D0" opacity=".045"/>`;
  g+=`<rect x="0" y="1500" width="1080" height="420" fill="#0E1922"/><path d="M0,1500 H1080" ${ol()}/>`;
  g+=`<g filter="url(#wob)"><rect x="90" y="1300" width="200" height="200" rx="18" fill="#1A242C" ${ol()}/><rect x="110" y="1230" width="160" height="70" rx="30" fill="#141C22" ${ol()}/></g>`;
  g+=`<text x="190" y="1282" font-family="Inter" font-weight="800" font-size="46" fill="${P.terra}" text-anchor="middle">3:15</text><circle cx="190" cy="1265" r="70" fill="${P.terra}" opacity=".12" filter="url(#blur14)"/>`;
  g+=`<ellipse cx="660" cy="1490" rx="250" ry="46" fill="${P.navy}" ${ol()}/>`;
  return g;
}
function sofaBG(){
  let g=`<rect width="1080" height="1920" fill="url(#wall)"/>`;
  g+=`<g filter="url(#wob)"><rect x="140" y="480" width="300" height="300" rx="24" fill="#0B1620" ${ol()}/><path d="M290,480 V780 M140,630 H440" ${ol()}/></g><circle cx="360" cy="560" r="30" fill="#EAF2EE"/>`;
  g+=`<g filter="url(#wob)"><path d="M880,1500 V900" stroke="${P.line}" stroke-width="10"/><path d="M820,900 L940,900 L910,820 L850,820 Z" fill="${P.terra}" ${ol()}/></g><circle cx="880" cy="930" r="420" fill="url(#lamp)"/><circle cx="880" cy="910" r="80" fill="${P.cream}" opacity=".35" filter="url(#blur40)"/>`;
  g+=`<rect x="0" y="1500" width="1080" height="420" fill="#13252F"/><path d="M0,1500 H1080" ${ol()}/>`;
  g+=`<g filter="url(#wob)"><rect x="90" y="1040" width="760" height="260" rx="60" fill="#7E4338" ${ol()}/></g>`;
  return g;
}
function sofaFront(){return `<g filter="url(#wob)"><rect x="60" y="1300" width="820" height="150" rx="40" fill="#8E4A3F" ${ol()}/><rect x="40" y="1180" width="90" height="280" rx="40" fill="#7E4338" ${ol()}/><rect x="810" y="1180" width="90" height="280" rx="40" fill="#7E4338" ${ol()}/><path d="M120,1450 V1500 M820,1450 V1500" stroke="${P.line}" stroke-width="14" stroke-linecap="round"/></g>`;}

