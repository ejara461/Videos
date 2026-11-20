// Recursos del Short "La Navidad de Canela": comedor navideño, árbol, familia, comidas de diciembre.
// Requiere lib.js, lib_escenas.js, lib_polvora.js (garland, roofStar) y lib_lluvia.js (canela, cama).
// persona tipo frijol detrás de la mesa, mirando a la izquierda; o.target = punto del mundo al que extiende la mano
function persona(x,y,k,o={}){
  const c=o.skin||'#E2B993';let g='';
  g+=`<path d="M-55,0 C-62,-110 -70,-210 -48,-280 C-28,-338 52,-340 66,-282 C82,-214 70,-100 62,0 Z" fill="${o.shirt||c}" ${ol()}/>`;
  g+=`<path d="M-52,-200 C-56,-250 -50,-290 -40,-300 C-20,-338 52,-340 66,-282 C70,-260 70,-230 68,-200 Z" fill="${c}"/>`;
  g+=`<path d="M-55,0 C-62,-110 -70,-210 -48,-280 C-28,-338 52,-340 66,-282 C82,-214 70,-100 62,0 Z" fill="none" ${ol()}/>`;
  const hs=o.hair||'short',hc=o.hairC||P.navy;
  if(hs==='bun')g+=`<path d="M-50,-282 C-40,-340 60,-344 68,-284 C40,-300 0,-302 -50,-282 Z" fill="${hc}" ${ol(5)}/><circle cx="20" cy="-340" r="24" fill="${hc}" ${ol(5)}/>`;
  else if(hs==='long')g+=`<path d="M-58,-290 C-74,-230 -68,-190 -50,-180 L-40,-180 L-40,-290 Z" fill="${hc}" ${ol(5)}/><path d="M-50,-282 C-40,-340 60,-344 68,-284 C40,-300 0,-302 -50,-282 Z" fill="${hc}" ${ol(5)}/>`;
  else g+=`<path d="M-50,-282 C-40,-340 60,-344 68,-284 C40,-300 0,-302 -50,-282 Z" fill="${hc}" ${ol(5)}/>`;
  if(o.glasses)g+=`<circle cx="-12" cy="-252" r="14" fill="none" stroke="${P.navy}" stroke-width="4"/><circle cx="22" cy="-252" r="14" fill="none" stroke="${P.navy}" stroke-width="4"/>`;
  g+=`<circle cx="-10" cy="-252" r="6.5" fill="${P.navy}"/>`+(o.smile!==false?`<path d="M-18,-218 q12,10 24,0" stroke="${P.navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`:`<path d="M-16,-216 h20" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/>`);
  if(o.hat)g+=`<path d="M-48,-290 C-30,-360 50,-370 70,-292 Z" fill="${P.terra}" ${ol(4)}/><circle cx="80" cy="-300" r="12" fill="#fff" ${ol(3)}/><rect x="-54" y="-298" width="128" height="18" rx="9" fill="#fff" ${ol(3)}/>`;
  if(o.target){const lx=(o.target[0]-x)/k,ly=(o.target[1]-y)/k;g+=limb(`M-30,-160 Q${(lx-30)/2-40},${-170} ${lx},${ly}`,c,24);}
  else g+=limb('M-30,-160 C-60,-130 -64,-100 -58,-70',c,24);
  return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#wob)">${g}</g>`;
}
// comidas
function comida(tipo,x,y,k=1){
  let g='';
  if(tipo==='bunuelo')g=`<circle r="22" fill="#D9A441" ${ol(4)}/><circle cx="-6" cy="-6" r="6" fill="#F0C870"/>`;
  else if(tipo==='natilla')g=`<rect x="-20" y="-16" width="40" height="32" rx="5" fill="#B9773F" ${ol(4)}/><rect x="-20" y="-16" width="40" height="8" fill="#8A5A2B"/>`;
  else if(tipo==='lechona')g=`<path d="M-24,0 C-24,-22 22,-24 24,-4 C24,14 -20,18 -24,0 Z" fill="#C98A5A" ${ol(4)}/><path d="M10,-6 L44,-22" stroke="#fff" stroke-width="10" stroke-linecap="round"/><circle cx="46" cy="-24" r="7" fill="#fff" ${ol(2)}/><path d="M10,-6 L44,-22" stroke="${P.line}" stroke-width="2" opacity=".5"/>`;
  else if(tipo==='tamal')g=`<path d="M-30,-18 L30,-18 L24,18 L-24,18 Z" fill="#6FA35A" ${ol(4)}/><path d="M-30,0 H30 M0,-18 V18" stroke="#E6D3AE" stroke-width="4"/>`;
  else if(tipo==='plato')g=`<ellipse rx="70" ry="18" fill="#E9E2D6" ${ol(4)}/><ellipse cx="0" cy="-6" rx="46" ry="10" fill="#9C6B3E"/>`;
  else if(tipo==='premio')g=`<path d="M-26,-6 a8,8 0 1 1 8,-8 h36 a8,8 0 1 1 8,8 a8,8 0 1 1 -8,8 h-36 a8,8 0 1 1 -8,-8 Z" fill="#E6C08A" ${ol(4)}/>`;
  return `<g transform="translate(${x},${y}) scale(${k})">${g}</g>`;
}
function arbolNavidad(x,y,t){
  let g=`<g filter="url(#wob)"><rect x="${x-18}" y="${y-60}" width="36" height="60" fill="#8A5A3B" ${ol()}/><path d="M${x},${y-560} L${x+170},${y-60} L${x-170},${y-60} Z" fill="#3E8E5E" ${ol()}/><path d="M${x},${y-560} L${x+110},${y-300} L${x-110},${y-300} Z" fill="#4FA06C"/></g>`;
  g+=garland(x-120,y-380,x+130,y-330,20,t,8,0)+garland(x-150,y-230,x+160,y-180,24,t,10,2)+garland(x-170,y-100,x+170,y-80,20,t,11,4);
  g+=roofStar(x,y-570,t);
  [[x-90,y-30,P.terra],[x+60,y-34,P.teal],[x+120,y-24,'#E3A93B']].forEach(([a,b,c])=>g+=`<g filter="url(#wob)"><rect x="${a-34}" y="${b-50}" width="68" height="56" fill="${c}" ${ol(4)}/><path d="M${a},${b-50} V${b+6} M${a-34},${b-22} H${a+34}" stroke="${P.cream}" stroke-width="6"/></g>`);
  return g;}
function comedorBG(t,dark){
  let g=`<rect width="1080" height="1920" fill="#2A3E46"/><rect y="0" width="1080" height="1480" fill="url(#wall)"/>`;
  g+=garland(-20,180,1100,200,40,t,24,1);
  g+=`<g filter="url(#wob)"><rect x="620" y="420" width="320" height="300" rx="24" fill="#0B1620" ${ol()}/><path d="M780,420 V720 M620,570 H940" ${ol()}/></g>`;
  g+=firework(720,520,(t*0.3)%1,'#E3A93B',10,70)+firework(860,600,((t*0.3)+0.5)%1,'#9FE3D9',10,60);
  g+=`<circle cx="540" cy="1000" r="600" fill="url(#lamp)" opacity="${dark?0.25:0.9}"/>`;
  g+=`<rect x="0" y="1480" width="1080" height="440" fill="#5A3E33"/><path d="M0,1480 H1080" ${ol()}/>`;
  for(let i=0;i<8;i++)g+=`<path d="M${i*160},1480 L${i*160-70},1920" stroke="#4A3229" stroke-width="5"/>`;
  g+=arbolNavidad(160,1480,t);
  return g;}
function mesa(){return `<g filter="url(#wob)"><rect x="300" y="1240" width="760" height="40" rx="12" fill="#7A3F35" ${ol()}/><path d="M300,1260 h760 v40 h-760 Z" fill="${P.cream}" opacity=".9"/><path d="M340,1300 V1480 M1020,1300 V1480" stroke="${P.line}" stroke-width="14" stroke-linecap="round"/></g>`+comida('plato',480,1236,0.8)+comida('bunuelo',470,1222,0.8)+comida('plato',680,1236,0.8)+comida('lechona',670,1222,0.8)+comida('plato',880,1236,0.8)+comida('tamal',880,1218,0.8);}
// Canela acostada (recolor de maxLie)
function canelaLie(x,y,k,o){return maxLie(x,y,k,o).split('#D58877').join(CANELA.body).split(P.terra).join(CANELA.ear).split(P.teal).join(P.terra);}
