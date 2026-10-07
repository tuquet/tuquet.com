// Hand-crafted single-stroke cursive "tq"
// Inspired by the authentic cursive geometry of Lavishly Yours

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

const pts = [
  // 1. Crossbar of t (starts at left, sweeps right with soft calligraphic curve)
  { p0: {x: 18, y: 38}, p1: {x: 26, y: 38}, p2: {x: 36, y: 37}, p3: {x: 44, y: 35} },
  
  // 2. Ascender loop of t (sweeps up from right crossbar, crests at top apex)
  { p0: {x: 44, y: 35}, p1: {x: 48, y: 33}, p2: {x: 42, y: 15}, p3: {x: 33, y: 13} },
  
  // 3. Stem of t (firm, confident downstroke cutting straight through crossbar at (31, 37))
  { p0: {x: 33, y: 13}, p1: {x: 28, y: 13}, p2: {x: 30, y: 38}, p3: {x: 30, y: 58} },
  
  // 4. Base hook of t (curves right at baseline, gliding up into q)
  { p0: {x: 30, y: 58}, p1: {x: 30, y: 65}, p2: {x: 37, y: 65}, p3: {x: 44, y: 48} },
  
  // 5. Entry into oval of q (arches over the top)
  { p0: {x: 44, y: 48}, p1: {x: 47, y: 40}, p2: {x: 52, y: 35}, p3: {x: 60, y: 35} },
  
  // 6. Left belly of q (curves counter-clockwise down the left side)
  { p0: {x: 60, y: 35}, p1: {x: 49, y: 37}, p2: {x: 46, y: 52}, p3: {x: 54, y: 59} },
  
  // 7. Bottom curve of q oval (curves up to meet the stem)
  { p0: {x: 54, y: 59}, p1: {x: 60, y: 60}, p2: {x: 64, y: 48}, p3: {x: 64, y: 37} },
  
  // 8. Long descender plunge of q (shoots straight down along the right side)
  { p0: {x: 64, y: 37}, p1: {x: 64, y: 55}, p2: {x: 63, y: 72}, p3: {x: 63, y: 86} },
  
  // 9. Reverse descender loop of q (curves right and loops at bottom)
  { p0: {x: 63, y: 86}, p1: {x: 63, y: 93}, p2: {x: 74, y: 91}, p3: {x: 77, y: 78} },
  
  // 10. Upward signature flourish of q (swoops gracefully up to the right)
  { p0: {x: 77, y: 78}, p1: {x: 80, y: 65}, p2: {x: 84, y: 52}, p3: {x: 89, y: 40} }
];

let total = 0;
const dParts = [`M ${pts[0].p0.x} ${pts[0].p0.y}`];
pts.forEach((p, i) => {
  const l = cubicBezierLength(p.p0, p.p1, p.p2, p.p3);
  total += l;
  dParts.push(`C ${p.p1.x} ${p.p1.y}, ${p.p2.x} ${p.p2.y}, ${p.p3.x} ${p.p3.y}`);
  console.log(`Segment ${i + 1}: ${l.toFixed(2)}px`);
});

const pathD = dParts.join(' ');
console.log(`\nTotal Path Length: ${total.toFixed(2)}px`);
console.log(`Path d:\n${pathD}`);
