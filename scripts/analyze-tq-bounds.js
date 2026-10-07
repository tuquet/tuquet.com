import fs from 'node:fs';
import opentype from 'opentype.js';

const buf = fs.readFileSync('LavishlyYours.ttf');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// Let's get the exact centered font path in 100x100
const testPath = font.getPath('tq', 0, 0, 100);
const bbox = testPath.getBoundingBox();
const width = bbox.x2 - bbox.x1;
const height = bbox.y2 - bbox.y1;

const targetHeight = 72; // slightly compact so plenty of padding
const scale = targetHeight / height;
const fontSize = 100 * scale;

const finalPath = font.getPath('tq', 0, 0, fontSize);
const finalBBox = finalPath.getBoundingBox();
const finalW = finalBBox.x2 - finalBBox.x1;
const finalH = finalBBox.y2 - finalBBox.y1;

const offsetX = 50 - (finalBBox.x1 + finalW / 2);
const offsetY = 50 - (finalBBox.y1 + finalH / 2);

const centeredPath = font.getPath('tq', offsetX, offsetY, fontSize);
const maskD = centeredPath.toPathData(2);

// Extract all (x, y) coordinates from the font outline
const points = [];
centeredPath.commands.forEach(cmd => {
  if (cmd.x !== undefined && cmd.y !== undefined) {
    points.push({ x: cmd.x, y: cmd.y });
  }
});

console.log(`Total points in Lavishly Yours outline: ${points.length}`);
const minX = Math.min(...points.map(p => p.x));
const maxX = Math.max(...points.map(p => p.x));
const minY = Math.min(...points.map(p => p.y));
const maxY = Math.max(...points.map(p => p.y));
console.log(`Bounds: X [${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y [${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);

// Separate points for 't' (x < 48) and 'q' (x >= 46)
const tPoints = points.filter(p => p.x < 48);
const qPoints = points.filter(p => p.x >= 46);

console.log(`t bounds: X [${Math.min(...tPoints.map(p=>p.x)).toFixed(1)}, ${Math.max(...tPoints.map(p=>p.x)).toFixed(1)}], Y [${Math.min(...tPoints.map(p=>p.y)).toFixed(1)}, ${Math.max(...tPoints.map(p=>p.y)).toFixed(1)}]`);
console.log(`q bounds: X [${Math.min(...qPoints.map(p=>p.x)).toFixed(1)}, ${Math.max(...qPoints.map(p=>p.x)).toFixed(1)}], Y [${Math.min(...qPoints.map(p=>p.y)).toFixed(1)}, ${Math.max(...qPoints.map(p=>p.y)).toFixed(1)}]`);
