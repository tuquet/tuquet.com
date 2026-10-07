import fs from 'node:fs';
import opentype from 'opentype.js';

const buf = fs.readFileSync('LavishlyYours.ttf');
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

// Let's find the exact scale and position so 'tq' fits nicely in 0 0 100 100
// Target: width ~60-70px, height ~70-80px, centered around (50, 50)
const testPath = font.getPath('tq', 0, 0, 100);
const bbox = testPath.getBoundingBox();
const width = bbox.x2 - bbox.x1;
const height = bbox.y2 - bbox.y1;

// Target height: 75px inside 100x100 box
const targetHeight = 75;
const scale = targetHeight / height;
const fontSize = 100 * scale;

const finalPath = font.getPath('tq', 0, 0, fontSize);
const finalBBox = finalPath.getBoundingBox();
const finalW = finalBBox.x2 - finalBBox.x1;
const finalH = finalBBox.y2 - finalBBox.y1;

// Center in 0 0 100 100
const offsetX = 50 - (finalBBox.x1 + finalW / 2);
const offsetY = 50 - (finalBBox.y1 + finalH / 2);

const centeredPath = font.getPath('tq', offsetX, offsetY, fontSize);
const maskPathData = centeredPath.toPathData(2);
const cBBox = centeredPath.getBoundingBox();

console.log('Centered Bounding Box in 100x100:');
console.log(cBBox);
console.log('\nMask Path Data:');
console.log(maskPathData.substring(0, 200) + '...');
