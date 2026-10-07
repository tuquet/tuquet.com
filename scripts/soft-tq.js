// Ultra-fluid, soft calligraphic single-stroke "tq"
// Designed with harmonic C1 continuity and natural italic slant for maximum softness

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
  // 1. Soft wavy crossbar of t (starts with gentle curl, waves across)
  { p0: {x: 16, y: 40}, p1: {x: 24, y: 40}, p2: {x: 34, y: 38}, p3: {x: 44, y: 34} },
  
  // 2. Wide, airy ascender loop of t
  { p0: {x: 44, y: 34}, p1: {x: 50, y: 31}, p2: {x: 44, y: 14}, p3: {x: 34, y: 11} },
  
  // 3. Graceful tilted stem of t (gently bowed, not a stiff vertical rod)
  { p0: {x: 34, y: 11}, p1: {x: 27, y: 11}, p2: {x: 29, y: 36}, p3: {x: 28, y: 58} },
  
  // 4. Soft rounded base hook of t (deep, smooth curve at baseline)
  { p0: {x: 28, y: 58}, p1: {x: 28, y: 66}, p2: {x: 36, y: 66}, p3: {x: 44, y: 48} },
  
  // 5. Entry into oval of q (soft arching shoulder)
  { p0: {x: 44, y: 48}, p1: {x: 48, y: 38}, p2: {x: 54, y: 33}, p3: {x: 62, y: 33} },
  
  // 6. Round, organic belly of q (generous curvature)
  { p0: {x: 62, y: 33}, p1: {x: 50, y: 34}, p2: {x: 45, y: 49}, p3: {x: 53, y: 58} },
  
  // 7. Base curve of q oval joining the spine
  { p0: {x: 53, y: 58}, p1: {x: 60, y: 60}, p2: {x: 66, y: 48}, p3: {x: 66, y: 36} },
  
  // 8. Flowing descender of q (gentle calligraphic curvature)
  { p0: {x: 66, y: 36}, p1: {x: 66, y: 54}, p2: {x: 65, y: 72}, p3: {x: 63, y: 86} },
  
  // 9. Luxurious sweeping loop at the bottom of q
  { p0: {x: 63, y: 86}, p1: {x: 63, y: 94}, p2: {x: 75, y: 92}, p3: {x: 79, y: 79} },
  
  // 10. Soaring signature flourish (elevating up-right with graceful deceleration)
  { p0: {x: 79, y: 79}, p1: {x: 82, y: 66}, p2: {x: 86, y: 52}, p3: {x: 91, y: 38} }
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
