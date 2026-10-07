import fs from 'node:fs';
import opentype from 'opentype.js';

const buffer = fs.readFileSync('LavishlyYours.ttf');
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
const path = font.getPath('tq', 0, 0, 150);

// Let's calculate total perimeter length
let totalLength = 0;
let currentX = 0, currentY = 0;

for (const cmd of path.commands) {
  if (cmd.type === 'M') {
    currentX = cmd.x;
    currentY = cmd.y;
  } else if (cmd.type === 'L') {
    const dx = cmd.x - currentX;
    const dy = cmd.y - currentY;
    totalLength += Math.sqrt(dx*dx + dy*dy);
    currentX = cmd.x;
    currentY = cmd.y;
  } else if (cmd.type === 'Q') {
    // Approximate quadratic bezier length with 10 steps
    let prevX = currentX, prevY = currentY;
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const mt = 1 - t;
      const x = mt*mt*currentX + 2*mt*t*cmd.x1 + t*t*cmd.x;
      const y = mt*mt*currentY + 2*mt*t*cmd.y1 + t*t*cmd.y;
      const dx = x - prevX;
      const dy = y - prevY;
      totalLength += Math.sqrt(dx*dx + dy*dy);
      prevX = x;
      prevY = y;
    }
    currentX = cmd.x;
    currentY = cmd.y;
  } else if (cmd.type === 'Z') {
    // Close path
  }
}

console.log('Approx Total Perimeter Length of tq:', Math.round(totalLength), 'px');
