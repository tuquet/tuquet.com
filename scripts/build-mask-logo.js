import fs from 'node:fs';
import opentype from 'opentype.js';

const buf = fs.readFileSync('LavishlyYours.ttf');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// Target height: 75px inside 100x100
const testPath = font.getPath('tq', 0, 0, 100);
const bbox = testPath.getBoundingBox();
const width = bbox.x2 - bbox.x1;
const height = bbox.y2 - bbox.y1;

const targetHeight = 75;
const scale = targetHeight / height;
const fontSize = 100 * scale;

const finalPath = font.getPath('tq', 0, 0, fontSize);
const finalBBox = finalPath.getBoundingBox();
const finalW = finalBBox.x2 - finalBBox.x1;
const finalH = finalBBox.y2 - finalBBox.y1;

// Offset to center in 0 0 100 100
const offsetX = 50 - (finalBBox.x1 + finalW / 2);
const offsetY = 50 - (finalBBox.y1 + finalH / 2);

const centeredPath = font.getPath('tq', offsetX, offsetY, fontSize);
const maskD = centeredPath.toPathData(2);
const cBBox = centeredPath.getBoundingBox();

console.log('Exact Lavishly Yours Mask BBox:');
console.log(cBBox);

// Now let's calculate the Centerline path that covers EVERY part of this mask:
// BBox: X from 21.44 to 78.56, Y from 12.50 to 87.50
// 1. Crossbar of t: starts at left edge (20, 28) -> right edge (49, 28)
// 2. Ascender of t: loops up to apex (39, 12)
// 3. Stem of t: down from (39, 12) through (31, 28) down to (30, 48)
// 4. Hook of t: curves at (30, 52) to (38, 51) and enters q at (44, 43)
// 5. Oval of q: up to (54, 30), around left (44, 41), bottom (49, 50), up to (60, 41)
// 6. Descender of q: down from (60, 41) along x=60 through (60, 60) down to (58, 88)
// 7. Loop of q: from (58, 88) curves right to (70, 78) and swoops up to (79, 38)!

const pts = [
  // Crossbar left to right
  { p0: {x: 20, y: 28.5}, p1: {x: 28, y: 28.5}, p2: {x: 40, y: 28.5}, p3: {x: 49, y: 28.5} },
  // Loop up to apex of t
  { p0: {x: 49, y: 28.5}, p1: {x: 51, y: 22}, p2: {x: 46, y: 11}, p3: {x: 39, y: 11} },
  // Down the stem of t
  { p0: {x: 39, y: 11}, p1: {x: 33, y: 11}, p2: {x: 31, y: 32}, p3: {x: 30, y: 46} },
  // Base hook of t into q
  { p0: {x: 30, y: 46}, p1: {x: 30, y: 53}, p2: {x: 36, y: 53}, p3: {x: 44, y: 43} },
  // Top arch of q oval
  { p0: {x: 44, y: 43}, p1: {x: 48, y: 34}, p2: {x: 54, y: 29}, p3: {x: 60, y: 29} },
  // Left curve of q oval
  { p0: {x: 60, y: 29}, p1: {x: 47, y: 31}, p2: {x: 44, y: 44}, p3: {x: 50, y: 51} },
  // Bottom-right of q oval connecting to stem
  { p0: {x: 50, y: 51}, p1: {x: 56, y: 51}, p2: {x: 61, y: 44}, p3: {x: 61, y: 36} },
  // Plunge down descender of q
  { p0: {x: 61, y: 36}, p1: {x: 61, y: 54}, p2: {x: 60, y: 72}, p3: {x: 58, y: 88} },
  // Bottom loop and upward flourish of q
  { p0: {x: 58, y: 88}, p1: {x: 58, y: 92}, p2: {x: 72, y: 84}, p3: {x: 73, y: 68} },
  { p0: {x: 73, y: 68}, p1: {x: 73, y: 55}, p2: {x: 77, y: 45}, p3: {x: 79, y: 38} }
];

function cubicBezierLength(p0, p1, p2, p3, steps = 100) {
  let len = 0;
  let prevX = p0.x, prevY = p0.y;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x = mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x;
    const y = mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y;
    const dx = x - prevX;
    const dy = y - prevY;
    len += Math.sqrt(dx*dx + dy*dy);
    prevX = x;
    prevY = y;
  }
  return len;
}

let total = 0;
const dParts = [`M ${pts[0].p0.x} ${pts[0].p0.y}`];
pts.forEach(p => {
  total += cubicBezierLength(p.p0, p.p1, p.p2, p.p3);
  dParts.push(`C ${p.p1.x} ${p.p1.y}, ${p.p2.x} ${p.p2.y}, ${p.p3.x} ${p.p3.y}`);
});

const centerlineD = dParts.join(' ');
console.log('Total centerline length:', total.toFixed(2), 'px');

// Save the complete SVG code
const fullSvg = `<template>
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Tu Quet (tq)</title>
    <mask id="mask_tq_634" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="20" y="10" width="60" height="80">
      <path
        d="${maskD}"
        fill="white"
      />
    </mask>
    <g mask="url(#mask_tq_634)">
      <path
        class="path1"
        d="${centerlineD}"
        stroke="black"
        stroke-width="7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
</template>

<style scoped>
@media (prefers-reduced-motion) {
  .path1 {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}
@media print {
  .path1 {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}

@keyframes grow {
  0% {
    stroke-dashoffset: 1px;
    stroke-dasharray: 0 320px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  40% {
    stroke-dasharray: 320px 0;
  }
  85% {
    stroke-dasharray: 320px 0;
  }
  95%,
  to {
    stroke-dasharray: 0 320px;
  }
}

.path1 {
  stroke-dashoffset: 1px;
  stroke-dasharray: 320px 0;
  animation: grow 10s ease forwards infinite;
  transform-origin: center;
  stroke: #303030;
  animation-delay: 0s;
}

.dark .path1 {
  stroke: #fdfdfd;
}
</style>
`;

fs.writeFileSync('src/components/Logo.vue', fullSvg, 'utf-8');
fs.writeFileSync('src/components/LogoStroke.vue', fullSvg, 'utf-8');
console.log('Successfully written to Logo.vue and LogoStroke.vue!');
