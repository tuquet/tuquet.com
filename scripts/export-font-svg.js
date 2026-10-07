import fs from 'node:fs';
import opentype from 'opentype.js';

const buffer = fs.readFileSync('LavishlyYours.ttf');
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));

function exportTextToSvg(text, fontSize = 120) {
  // Generate path
  const path = font.getPath(text, 0, 0, fontSize);
  const bbox = path.getBoundingBox();
  
  // Calculate dimensions with margin
  const width = bbox.x2 - bbox.x1;
  const height = bbox.y2 - bbox.y1;
  const margin = Math.max(width, height) * 0.1;
  
  const minX = bbox.x1 - margin;
  const minY = bbox.y1 - margin;
  const totalW = width + margin * 2;
  const totalH = height + margin * 2;

  // Raw path data
  const pathData = path.toPathData(2);

  // SVG representation with normalized viewBox
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(2)} ${minY.toFixed(2)} ${totalW.toFixed(2)} ${totalH.toFixed(2)}" width="100%" height="100%">
  <title>${text}</title>
  <path d="${pathData}" fill="currentColor" />
</svg>`;

  return {
    text,
    bbox: {
      x1: bbox.x1.toFixed(2),
      y1: bbox.y1.toFixed(2),
      x2: bbox.x2.toFixed(2),
      y2: bbox.y2.toFixed(2),
      width: width.toFixed(2),
      height: height.toFixed(2)
    },
    viewBox: `${minX.toFixed(2)} ${minY.toFixed(2)} ${totalW.toFixed(2)} ${totalH.toFixed(2)}`,
    pathData,
    svg
  };
}

const variants = [
  { text: 'tq', filename: 'font-lowercase-tq.svg' },
  { text: 'Tq', filename: 'font-titlecase-Tq.svg' },
  { text: 'TQ', filename: 'font-uppercase-TQ.svg' }
];
const results = {};

for (const v of variants) {
  const res = exportTextToSvg(v.text, 150);
  results[v.text] = res;
  fs.writeFileSync(`public/${v.filename}`, res.svg, 'utf-8');
  console.log(`\n================== Text: "${v.text}" (public/${v.filename}) ==================`);
  console.log(`ViewBox: ${res.viewBox}`);
  console.log(`Bounding Box: Width ${res.bbox.width}px, Height ${res.bbox.height}px`);
  console.log(`Path Length: ${res.pathData.length} chars`);
}

fs.writeFileSync('public/font-svg-data.json', JSON.stringify(results, null, 2), 'utf-8');
console.log('\nSaved public/font-tq.svg, public/font-Tq.svg, public/font-TQ.svg!');
