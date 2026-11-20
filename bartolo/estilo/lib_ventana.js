// Recursos del Short "La ventana de Lila": apartamento de día en un quinto piso, ventana con o sin malla, mariposa, consultorio.
// Requiere lib.js, lib_escenas.js, lib_bano.js (día) y lib_gatos.js (Lila, dueña).
const WIN={x:560,y:640,w:440,h:640};   // ventana
function cityOutside(t){
  let g=`<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" fill="url(#skyd)"/>`;
  g+=`<circle cx="${WIN.x+330}" cy="${WIN.y+120}" r="40" fill="#FFF3D6"/>`;
  [[0,380,120,'#E6D5BD'],[130,300,110,'#DCC7A8'],[250,420,100,'#E9DCC8'],[350,340,90,'#D9C7AE']].forEach(([dx,top,w,c])=>{g+=`<rect x="${WIN.x+dx}" y="${WIN.y+top}" width="${w}" height="${WIN.h-top}" fill="${c}" ${ol(3)}/>`;for(let r=0;r<4;r++)g+=`<rect x="${WIN.x+dx+18}" y="${WIN.y+top+20+r*60}" width="${w-36}" height="28" rx="4" fill="#A9D3D1" opacity=".9"/>`;});
  return g;}
function aptDay(t,o={}){
  let g=`<rect width="1080" height="1920" fill="url(#skyd)"/><rect width="1080" height="1480" fill="${DAY.wall}"/>`;
  g+=`<clipPath id="wclip"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}"/></clipPath><g clip-path="url(#wclip)">${cityOutside(t)}${o.outside||''}</g>`;
  if(o.malla){let m='';for(let i=1;i<14;i++)m+=`<path d="M${WIN.x+i*WIN.w/14},${WIN.y} V${WIN.y+WIN.h}" stroke="#3A4650" stroke-width="2.5" opacity=".75"/>`;for(let j=1;j<20;j++)m+=`<path d="M${WIN.x},${WIN.y+j*WIN.h/20} H${WIN.x+WIN.w}" stroke="#3A4650" stroke-width="2.5" opacity=".75"/>`;g+=m;
    [[WIN.x,WIN.y],[WIN.x+WIN.w,WIN.y],[WIN.x,WIN.y+WIN.h],[WIN.x+WIN.w,WIN.y+WIN.h]].forEach(([a,b])=>g+=`<circle cx="${a}" cy="${b}" r="9" fill="${P.line}"/>`);}
  g+=`<g filter="url(#wob)"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" fill="none" ${ol(10)}/><rect x="${WIN.x-30}" y="${WIN.y+WIN.h}" width="${WIN.w+60}" height="34" rx="8" fill="#F4F0E8" ${ol()}/></g>`;
  if(o.open)g+=`<g filter="url(#wob)"><rect x="${WIN.x+WIN.w-40}" y="${WIN.y}" width="200" height="${WIN.h}" fill="#BFE6E2" opacity=".35" ${ol(5)}/></g>`;
  g+=`<g filter="url(#wob)"><rect x="40" y="1060" width="420" height="250" rx="50" fill="${P.terra}" ${ol()}/><rect x="20" y="1250" width="460" height="130" rx="40" fill="#D07563" ${ol()}/><path d="M60,1380 V1480 M440,1380 V1480" stroke="${P.line}" stroke-width="14" stroke-linecap="round"/></g>`;
  g+=`<rect x="0" y="1480" width="1080" height="440" fill="${DAY.floor}"/><path d="M0,1480 H1080" ${ol()}/>`;
  g+=`<g filter="url(#wob)"><path d="M120,560 h200 v140 h-200 Z" fill="#fff" ${ol()}/><path d="M140,680 l50,-60 l40,40 l30,-25 l40,45" stroke="${P.teal}" stroke-width="6" fill="none"/></g>`;
  if(o.sun)g+=`<path d="M${WIN.x},${WIN.y+WIN.h+34} L${WIN.x-280},1720 L${WIN.x+260},1720 L${WIN.x+WIN.w},${WIN.y+WIN.h+34} Z" fill="#FFF3D6" opacity=".35"/>`;
  return g;}
function mariposa(x,y,t,k=1){const f=Math.abs(Math.sin(t*14));return `<g transform="translate(${x},${y}) scale(${k})"><ellipse cx="${-14*f-4}" cy="-6" rx="${16*f+3}" ry="16" fill="#E3A93B" ${ol(3)}/><ellipse cx="${14*f+4}" cy="-6" rx="${16*f+3}" ry="16" fill="#E3A93B" ${ol(3)}/><rect x="-3" y="-16" width="6" height="26" rx="3" fill="${P.navy}"/></g>`;}
function consultorio(){let g=`<rect width="1080" height="1920" fill="#DCEFEC"/><rect y="1480" width="1080" height="440" fill="#BFD6D3"/><path d="M0,1480 H1080" ${ol()}/>`;
  g+=`<g filter="url(#wob)"><rect x="680" y="560" width="260" height="200" rx="12" fill="#fff" ${ol()}/><path d="M810,600 v120 M750,660 h120" stroke="${P.terra}" stroke-width="22" stroke-linecap="round"/></g>`;
  g+=`<g filter="url(#wob)"><rect x="300" y="1260" width="560" height="40" rx="10" fill="#C8CED2" ${ol()}/><path d="M340,1300 V1480 M820,1300 V1480" stroke="${P.line}" stroke-width="14" stroke-linecap="round"/></g>`;
  return g;}
function vendaje(x,y,k){return `<g transform="translate(${x},${y}) scale(${k})"><rect x="8" y="-44" width="24" height="34" rx="6" fill="#fff" ${ol(3)}/><path d="M8,-34 h24 M8,-24 h24" stroke="#C8CED2" stroke-width="3"/></g>`;}
