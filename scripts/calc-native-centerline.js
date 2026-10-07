import fs from 'node:fs';

// Centerline of Lavishly Yours 'tq' in its native coordinate space:
// viewBox="-35 -79 160 160"

const pts = [
  // 1. Crossbar of t (left to right)
  { p0: {x: -2, y: -35}, p1: {x: 10, y: -35}, p2: {x: 25, y: -35}, p3: {x: 40, y: -35} },
  // 2. Loop up to apex of t
  { p0: {x: 40, y: -35}, p1: {x: 44, y: -45}, p2: {x: 35, y: -62}, p3: {x: 27, y: -62} },
  // 3. Stem of t down to baseline
  { p0: {x: 27, y: -62}, p1: {x: 20, y: -62}, p2: {x: 16, y: -30}, p3: {x: 15, y: -16} },
  // 4. Base hook of t connecting to q
  { p0: {x: 15, y: -16}, p1: {x: 15, y: 1}, p2: {x: 26, y: 1}, p3: {x: 38, y: -10} },
  // 5. Entry into oval of q
  { p0: {x: 38, y: -10}, p1: {x: 46, y: -20}, p2: {x: 55, y: -30}, p3: {x: 65, y: -30} },
  // 6. Left curve of oval of q
  { p0: {x: 65, y: -30}, p1: {x: 50, y: -30}, p2: {x: 46, y: -12}, p3: {x: 54, y: 0} },
  // 7. Bottom-right of oval connecting to stem
  { p0: {x: 54, y: 0}, p1: {x: 62, y: 0}, p2: {x: 72, y: -10}, p3: {x: 72, y: -20} },
  // 8. Plunge down the descender of q
  { p0: {x: 72, y: -20}, p1: {x: 72, y: 10}, p2: {x: 65, y: 40}, p3: {x: 52, y: 64} },
  // 9. Loop and flourish sweep up of q
  { p0: {x: 52, y: 64}, p1: {x: 52, y: 72}, p2: {x: 82, y: 55}, p3: {x: 82, y: 30} },
  { p0: {x: 82, y: 30}, p1: {x: 82, y: 10}, p2: {x: 88, y: -5}, p3: {x: 94, y: -15} }
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

console.log('Total centerline length:', total.toFixed(2), 'px');
console.log('Centerline d:');
console.log(dParts.join(' '));
