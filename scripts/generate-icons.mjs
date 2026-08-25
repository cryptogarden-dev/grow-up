// Generates the app's PWA/home-screen icons as raw PNGs with zero
// dependencies (just Node's built-in zlib for DEFLATE compression).
//
// Draws a simple leaf mark (two overlapping circles, rotated) on the
// app's emerald gradient, matching the 🌱 branding used elsewhere in the
// UI (see NavBar). Re-run with `node scripts/generate-icons.mjs` any time
// the brand color changes.

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  const ihdr = chunk("IHDR", ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk("IDAT", deflateSync(raw, { level: 9 }));
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * @param {number} size
 * @param {{ safeZone?: number, roundedSquare?: boolean }} [opts]
 */
function drawIcon(size, opts = {}) {
  const { safeZone = 1, roundedSquare = false } = opts;
  const rgba = Buffer.alloc(size * size * 4);
  const half = size / 2;
  const cornerRadius = size * 0.22;

  // emerald-400 -> emerald-600, matching the NavBar logo badge gradient.
  const c1 = [52, 211, 153];
  const c2 = [5, 150, 105];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = (x + 0.5 - half) / half; // -1..1
      const ny = (y + 0.5 - half) / half;

      let alpha = 255;
      if (roundedSquare) {
        alpha = roundedRectAlpha(x + 0.5, y + 0.5, size, cornerRadius);
        if (alpha === 0) {
          continue;
        }
      }

      const t = Math.min(1, Math.max(0, (nx + ny + 1.4) / 2.8));
      let r = lerp(c1[0], c2[0], t);
      let g = lerp(c1[1], c2[1], t);
      let b = lerp(c1[2], c2[2], t);

      // Leaf mark: intersection of two circles (vesica piscis), rotated.
      const leafScale = 0.46 * safeZone;
      const rx = nx / leafScale;
      const ry = ny / leafScale;
      const rot = -Math.PI / 4;
      const rrx = rx * Math.cos(rot) - ry * Math.sin(rot);
      const rry = rx * Math.sin(rot) + ry * Math.cos(rot);
      const d = 0.62;
      const rad = 1.05;
      const distA = Math.hypot(rrx - d, rry);
      const distB = Math.hypot(rrx + d, rry);
      const inLeaf = distA < rad && distB < rad;

      const stemTop = 0.05 * safeZone;
      const stemBottom = 0.42 * safeZone;
      const stemHalfWidth = 0.035 * safeZone;
      const inStem =
        Math.abs(nx) < stemHalfWidth && ny > stemTop && ny < stemBottom;

      if (inLeaf || inStem) {
        r = 255;
        g = 255;
        b = 255;
      }

      rgba[idx] = Math.round(r);
      rgba[idx + 1] = Math.round(g);
      rgba[idx + 2] = Math.round(b);
      rgba[idx + 3] = alpha;
    }
  }

  return encodePNG(size, size, rgba);
}

function roundedRectAlpha(x, y, size, radius) {
  const cx = Math.min(Math.max(x, radius), size - radius);
  const cy = Math.min(Math.max(y, radius), size - radius);
  const dist = Math.hypot(x - cx, y - cy);
  if (x > radius && x < size - radius) return 255;
  if (y > radius && y < size - radius) return 255;
  return dist <= radius ? 255 : 0;
}

const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const targets = [
  { name: "icon-192.png", size: 192, roundedSquare: true },
  { name: "icon-512.png", size: 512, roundedSquare: true },
  { name: "icon-maskable-512.png", size: 512, safeZone: 0.72 },
  // iOS applies its own corner rounding; keep this fully opaque/square so
  // no transparent corners can show through as black on older iOS.
  { name: "apple-touch-icon.png", size: 180, roundedSquare: false },
];

for (const { name, size, safeZone, roundedSquare } of targets) {
  const png = drawIcon(size, { safeZone: safeZone ?? 1, roundedSquare });
  writeFileSync(path.join(outDir, name), png);
  console.log(`wrote public/icons/${name} (${size}x${size})`);
}
