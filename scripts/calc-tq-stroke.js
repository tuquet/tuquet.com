// Precision single-stroke centerline calculator for "tq"
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

// Coordinate plan (viewBox 0 0 100 100):
// 1. Crossbar of t: (14, 36) -> (36, 34)
// 2. Loop up to apex of t: (36, 34) -> (38, 22) -> (30, 12) -> (26, 16)
// 3. Stem of t cutting straight down: (26, 16) -> (27, 34) -> (27, 54)
// 4. Base hook of t into q: (27, 54) -> (27, 60) -> (35, 60) -> (42, 42)
// 5. Counter of q (loop):
//    (42, 42) -> (46, 34) -> (54, 34) -> (58, 42) [top arch]
//    (58, 42) -> (58, 54) -> (48, 54) -> (44, 46) -> (48, 38) -> (56, 38)
//    Wait! In calligraphy, the pen traces the oval of q counter-clockwise or clockwise:
//    From hook (38, 52): enters top-right of oval (54, 38), curves left around (44, 42) -> bottom (48, 54) -> up to (56, 38)
// 6. Descender of q:
//    From (56, 38), plunges straight down along x=56: (56, 38) -> (56, 62) -> (56, 86)
// 7. Flourish loop of q:
//    (56, 86) -> loops right: (64, 88) -> (72, 78) -> (70, 64) -> (60, 68) -> (72, 54) -> (88, 38)
//    Or sweeping gracefully: (56, 86) -> (64, 88) -> (72, 76) -> (84, 46)

const segments = [
  // Crossbar of t
  { p0: {x: 14, y: 36}, p1: {x: 22, y: 36}, p2: {x: 30, y: 35}, p3: {x: 38, y: 33} },
  // Loop up to apex of t
  { p0: {x: 38, y: 33}, p1: {x: 42, y: 31}, p2: {x: 38, y: 14}, p3: {x: 30, y: 12} },
  // Down the stem of t
  { p0: {x: 30, y: 12}, p1: {x: 25, y: 12}, p2: {x: 27, y: 35}, p3: {x: 27, y: 54} },
  // Hook at bottom of t
  { p0: {x: 27, y: 54}, p1: {x: 27, y: 60}, p2: {x: 33, y: 60}, p3: {x: 38, y: 52} },
  // Enter oval of q (counter-clockwise)
  { p0: {x: 38, y: 52}, p1: {x: 42, y: 40}, p2: {x: 46, y: 35}, p3: {x: 54, y: 35} },
  // Left curve of oval of q
  { p0: {x: 54, y: 35}, p1: {x: 44, y: 37}, p2: {x: 42, y: 52}, p3: {x: 50, y: 54} },
  // Bottom-right curve of oval connecting to stem
  { p0: {x: 50, y: 54}, p1: {x: 56, y: 54}, p2: {x: 56, y: 44}, p3: {x: 56, y: 35} },
  // Descender plunge of q
  { p0: {x: 56, y: 35}, p1: {x: 56, y: 52}, p2: {x: 56, y: 72}, p3: {x: 56, y: 86} },
  // Bottom loop & grand flourish of q (Lavishly Yours style)
  { p0: {x: 56, y: 86}, p1: {x: 56, y: 92}, p2: {x: 66, y: 88}, p3: {x: 72, y: 76} },
  { p0: {x: 72, y: 76}, p1: {x: 78, y: 64}, p2: {x: 82, y: 50}, p3: {x: 88, y: 36} }
];

let total = 0;
const dParts = [`M ${segments[0].p0.x} ${segments[0].p0.y}`];

segments.forEach((s, idx) => {
  const len = cubicBezierLength(s.p0, s.p1, s.p2, s.p3);
  total += len;
  dParts.push(`C ${s.p1.x} ${s.p1.y}, ${s.p2.x} ${s.p2.y}, ${s.p3.x} ${s.p3.y}`);
  console.log(`Segment ${idx + 1}: ${len.toFixed(2)}px`);
});

const fullD = dParts.join(' ');
console.log(`\nTotal Length: ${total.toFixed(2)}px`);
console.log(`Path d:\n${fullD}`);
