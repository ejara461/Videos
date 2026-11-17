// Recursos del Short de pólvora: edificios con alumbrados decembrinos, fuegos artificiales, balcón, Max asustado.
const XMAS=['#C2624F','#F4DBB9','#2F8F8D','#E3A93B','#D58877','#9FE3D9'];
// guirnalda colgante (catenaria) entre dos puntos, con bombillos que titilan
function garland(x1,y1,x2,y2,sag,t,n=10,ph=0){
  let g=`<path d="M${x1},${y1} Q${(x1+x2)/2},${(y1+y2)/2+sag*2} ${x2},${y2}" stroke="#3A4650" stroke-width="3" fill="none"/>`;
  for(let i=1;i<n;i++){const p=i/n,x=(1-p)*(1-p)*x1+2*p*(1-p)*(x1+x2)/2+p*p*x2,y=(1-p)*(1-p)*y1+2*p*(1-p)*((y1+y2)/2+sag*2)+p*p*y2;
    const c=XMAS[(i+ph)%XMAS.length],on=0.55+0.45*Math.sin(t*4+i*1.7+ph);
    g+=`<circle cx="${x}" cy="${y+6}" r="16" fill="${c}" opacity="${0.35*on}" filter="url(#blur14)"/><circle cx="${x}" cy="${y+6}" r="6" fill="${c}" opacity="${0.6+0.4*on}"/>`;}
  return g;}
// edificio nocturno con ventanas cálidas y alumbrado
function xmasBuilding(x,y,w,h,t,seed){
  let g=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#14262F" ${ol(4)}/>`;
  const cols=Math.max(2,Math.floor(w/90)),rows=Math.floor(h/110);
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const lit=((r*7+c*3+seed)%5)<3;g+=`<rect x="${x+24+c*((w-48)/cols)}" y="${y+30+r*110}" width="${(w-48)/cols-24}" height="56" rx="5" fill="${lit?'#F4DBB9':'#0E1B24'}" opacity="${lit?0.55:1}"/>`;}
  // guirnaldas por pisos
  for(let r=0;r<rows;r+=2)g+=garland(x+6,y+100+r*110,x+w-6,y+100+r*110,18,t,Math.max(6,Math.floor(w/40)),seed+r);
  // contorno de luces en el borde superior
  for(let i=0;i<=Math.floor(w/34);i++){const c=XMAS[(i+seed)%XMAS.length],on=0.5+0.5*Math.sin(t*3+i);g+=`<circle cx="${x+i*34}" cy="${y}" r="5" fill="${c}" opacity="${0.5+0.5*on}"/>`;}
  return g;}
// estrella en la azotea
function roofStar(x,y,t){const s=1+0.06*Math.sin(t*3);return `<g transform="translate(${x},${y}) scale(${s})"><circle r="46" fill="#E3A93B" opacity=".35" filter="url(#blur14)"/><path d="M0,-32 L9,-10 L32,-10 L13,4 L20,28 L0,13 L-20,28 L-13,4 L-32,-10 L-9,-10 Z" fill="#E3A93B" ${ol(3)}/></g>`;}
// fuego artificial: p = progreso 0..1
function firework(cx,cy,p,c,n=14,r=150){if(p<=0||p>=1)return '';let g='';const rr=r*Math.sqrt(p),op=1-p;
  g+=`<circle cx="${cx}" cy="${cy}" r="${rr*1.2}" fill="${c}" opacity="${0.18*op}" filter="url(#blur40)"/>`;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr+p*p*40;g+=`<path d="M${cx+Math.cos(a)*rr*0.6},${cy+Math.sin(a)*rr*0.6+p*p*30} L${x},${y}" stroke="${c}" stroke-width="6" stroke-linecap="round" opacity="${op}"/><circle cx="${x}" cy="${y}" r="5" fill="#fff" opacity="${op}"/>`;}
  return g;}
// estallido tipo cómic (onomatopeya)
function boom(x,y,p,txt='¡BUM!'){if(p<=0||p>=1)return '';const k=back(Math.min(1,p*3)),op=1-seg(p,0.6,1);return `<g transform="translate(${x},${y}) scale(${k}) rotate(-8)" opacity="${op}"><path d="M0,-70 L20,-30 L64,-44 L40,-6 L80,20 L34,26 L40,72 L4,40 L-30,76 L-26,30 L-74,26 L-38,-4 L-66,-44 L-20,-30 Z" fill="#E3A93B" ${ol(5)}/><text x="0" y="16" font-family="Inter" font-weight="900" font-size="38" fill="${P.navy}" text-anchor="middle">${txt}</text></g>`;}
// baranda de balcón (primer plano)
function balcony(y){let g=`<g filter="url(#wob)"><rect x="0" y="${y}" width="1080" height="24" fill="#3A4650" ${ol(4)}/>`;for(let i=0;i<14;i++)g+=`<rect x="${i*80+20}" y="${y+24}" width="12" height="190" fill="#3A4650"/>`;g+=`<rect x="0" y="${y+214}" width="1080" height="20" fill="#3A4650" ${ol(4)}/></g>`;return g;}
// Max asustado (sentado, mirando a la derecha). shake: temblor
function maxAsustado(x,y,k,o={}){
  const c=P.terraL,sh=(o.shake?Math.sin((o.t||0)*60)*4:0);let g='';
  g+=limb('M-70,-60 Q-100,-40 -110,-10',c,18);                                         // cola abajo, entre las patas
  g+=`<path d="M-80,-60 C-95,-130 -40,-170 10,-165 C50,-160 70,-120 62,-80 C55,-50 20,-40 -20,-42 C-60,-44 -75,-48 -80,-60 Z" fill="${c}" ${ol()}/>`;
  g+=limb('M-50,-50 L-60,-4',c)+limb('M30,-60 L34,-4',c);
  let h=`<path d="M10,-190 C4,-252 60,-280 104,-264 C148,-248 156,-202 140,-170 C126,-144 86,-140 58,-146 C28,-152 14,-168 10,-190 Z" fill="${c}" ${ol()}/>`;
  h+=`<path d="M30,-248 C6,-238 -4,-206 6,-182 C14,-170 28,-180 32,-196 Z" fill="${P.terra}" ${ol()}/><ellipse cx="148" cy="-204" rx="9" ry="7" fill="${P.navy}"/>`;
  h+=`<circle cx="100" cy="-222" r="12" fill="#fff" ${ol(4)}/><circle cx="104" cy="-220" r="6" fill="${P.navy}"/><path d="M82,-250 L116,-240" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/>`;
  h+=o.calm?`<path d="M118,-172 q10,6 20,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`:`<path d="M114,-168 q6,-6 12,0 q6,6 12,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  h+=`<path d="M36,-150 Q70,-136 104,-148" stroke="${P.teal}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  if(o.tag)h+=`<circle cx="70" cy="-128" r="13" fill="#E3A93B" ${ol(3)}/>`+(o.tagShine?`<circle cx="70" cy="-128" r="34" fill="#E3A93B" opacity=".35" filter="url(#blur14)"/>`:'');
  g+=`<g transform="translate(${sh},${o.calm?0:12})">${h}</g>`;
  if(o.shake&&!o.calm)g+=`<path d="M-110,-150 q-12,10 0,20 q12,10 0,20 M180,-220 q12,10 0,20 q-12,10 0,20" stroke="${P.cream}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;
  return `<g transform="translate(${x+sh},${y}) scale(${o.flip?-k:k},${k})" filter="url(#wob)">${g}</g>`;
}
function nightCity(t){
  let g=`<rect width="1080" height="1920" fill="#0B1620"/><circle cx="880" cy="380" r="34" fill="#EAF2EE"/><circle cx="880" cy="380" r="80" fill="${P.cream}" opacity=".18" filter="url(#blur14)"/>`;
  for(let i=0;i<40;i++){g+=`<circle cx="${(i*97)%1080}" cy="${150+(i*53)%500}" r="${1.5+(i%3)}" fill="#fff" opacity="${0.3+0.3*Math.sin(t*2+i)}"/>`;}
  g+=`<g opacity=".7">${xmasBuilding(-40,820,300,900,t,1)}${xmasBuilding(800,760,320,960,t,4)}</g>`;
  g+=xmasBuilding(220,700,300,1100,t,2)+roofStar(370,690,t)+xmasBuilding(560,860,280,940,t,3);
  return g;}
