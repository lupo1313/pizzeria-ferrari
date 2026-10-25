/* Convertit les arrondissements municipaux de Marseille (GeoJSON Etalab/IGN, WGS84)
   en une carte SVG légère et stylisée. Aucune librairie.
   Usage: node make-svg.js <input.geojson> <output.svg>  */
const fs = require("fs");
const path = require("path");

const IN = process.argv[2];
const OUT = process.argv[3];
const SERVED = new Set([1, 2, 4, 5, 6, 7, 10]); // arrondissements livrés
const W = 1000;              // largeur du viewBox
const PAD = 14;             // marge interne

const g = JSON.parse(fs.readFileSync(IN, "utf8"));
const feats = g.features.filter(f => String(f.properties.code).startsWith("132"));

// Pour chaque feature, garder l'anneau extérieur le plus grand (ignore les îles du Frioul)
function ringArea(r){ let a=0; for(let i=0,n=r.length;i<n;i++){const [x1,y1]=r[i],[x2,y2]=r[(i+1)%n];a+=x1*y2-x2*y1;} return Math.abs(a)/2; }
function largestRing(geom){
  let rings=[];
  if(geom.type==="Polygon") rings=[geom.coordinates[0]];
  else if(geom.type==="MultiPolygon") rings=geom.coordinates.map(p=>p[0]);
  return rings.sort((a,b)=>ringArea(b)-ringArea(a))[0];
}
const items = feats.map(f=>({
  code:String(f.properties.code),
  n: parseInt(String(f.properties.code).slice(3),10),
  ring: largestRing(f.geometry)
}));

// Projection équirectangulaire corrigée en latitude.
// Cadrage sur les arrondissements LIVRÉS (+ marge) : les voisins débordent et sont rognés,
// ce qui donne la vue centrée + littoral de la maquette.
let minLon=Infinity,maxLon=-Infinity,minLat=Infinity,maxLat=-Infinity;
items.filter(it=>SERVED.has(it.n)).forEach(it=>it.ring.forEach(([lon,lat])=>{
  if(lon<minLon)minLon=lon; if(lon>maxLon)maxLon=lon;
  if(lat<minLat)minLat=lat; if(lat>maxLat)maxLat=lat;
}));
{ const fx=(maxLon-minLon)*0.10, fy=(maxLat-minLat)*0.10;
  minLon-=fx; maxLon+=fx; minLat-=fy; maxLat+=fy; }
const midLat=(minLat+maxLat)/2, k=Math.cos(midLat*Math.PI/180);
const dataW=(maxLon-minLon)*k, dataH=(maxLat-minLat);
const scale=(W-2*PAD)/dataW;
const H=Math.round(dataH*scale+2*PAD);
const px=lon=> PAD + (lon-minLon)*k*scale;
const py=lat=> PAD + (maxLat-lat)*scale; // y inversé
const r1=v=>Math.round(v*10)/10;

function pathD(ring){
  return ring.map(([lon,lat],i)=>(i?"L":"M")+r1(px(lon))+" "+r1(py(lat))).join("")+"Z";
}
// Centroïde (méthode de l'aire signée) pour placer le numéro
function centroid(ring){
  let x=0,y=0,a=0;
  for(let i=0,n=ring.length;i<n;i++){
    const [x1,y1]=[px(ring[i][0]),py(ring[i][1])];
    const [x2,y2]=[px(ring[(i+1)%n][0]),py(ring[(i+1)%n][1])];
    const cr=x1*y2-x2*y1; a+=cr; x+=(x1+x2)*cr; y+=(y1+y2)*cr;
  }
  a/=2; return [x/(6*a), y/(6*a)];
}

const served=items.filter(it=>SERVED.has(it.n));
const rest=items.filter(it=>!SERVED.has(it.n));
const shape=it=>{
  const served=SERVED.has(it.n);
  const postal = 13000+it.n;
  return `<path d="${pathD(it.ring)}" class="am ${served?"am--on":"am--off"}" data-arr="${it.n}" data-cp="${postal}"${served?` tabindex="0" role="button" aria-label="Marseille ${it.n}e arrondissement, code postal ${postal}, zone livrée"`:' aria-hidden="true"'}><title>Marseille ${it.n}${it.n===1?"er":"e"} — ${postal}${served?" · livré":""}</title></path>`;
};
const label=it=>{
  const [cx,cy]=centroid(it.ring);
  const served=SERVED.has(it.n);
  return `<text x="${r1(cx)}" y="${r1(cy)}" class="aml ${served?"aml--on":"aml--off"}" text-anchor="middle" dominant-baseline="central" aria-hidden="true">${it.n}</text>`;
};
// dessiner d'abord les voisins (dessous), puis les zones livrées (dessus)
const svg =
`<svg viewBox="0 0 ${W} ${H}" class="mrs-map" role="img" aria-label="Carte des arrondissements de Marseille livrés par la Pizzeria Ferrari" xmlns="http://www.w3.org/2000/svg">
<g class="am-rest">${rest.map(shape).join("")}</g>
<g class="am-served">${served.map(shape).join("")}</g>
<g class="am-labels">${rest.map(label).join("")}${served.map(label).join("")}</g>
</svg>`;

fs.writeFileSync(OUT, svg, "utf8");
console.log("viewBox 0 0", W, H, "| served", served.map(s=>s.n).join(","), "| rest", rest.map(s=>s.n).join(","), "| bytes", svg.length);
