#!/usr/bin/env node
/**
 * Generate any + maskable PNGs from a simple brand mark (no external deps).
 * Maskable: logo occupies ~70% of canvas (safe zone); solid brand fill.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/icons");

const BRAND = [0x4b, 0x7a, 0x57];
const FG = [0xf6, 0xf5, 0xf1];
const CREAM = [0xf6, 0xf5, 0xf1];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePng(filePath, size, paint) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = paint(x, y, size);
      const i = row + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(filePath, png);
}

function dist(x, y, cx, cy) {
  const dx = x - cx;
  const dy = y - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Open C-ring mark centered; scale is fraction of canvas used by the glyph. */
function paintMark(bg, fg, scale) {
  return (x, y, size) => {
    const cx = size / 2;
    const cy = size / 2;
    const outer = (size * scale) / 2;
    const stroke = outer * 0.18;
    const inner = outer - stroke;
    const d = dist(x, y, cx, cy);
    // Gap on the right side of the C (opening)
    const ang = Math.atan2(y - cy, x - cx); // -PI..PI, 0 = east
    const inGap = Math.abs(ang) < 0.55;
    const onRing = d <= outer && d >= inner && !inGap;
    // Round caps for the C opening
    const capY = Math.sin(0.55) * ((outer + inner) / 2);
    const capX = Math.cos(0.55) * ((outer + inner) / 2);
    const nearCap =
      dist(x, y, cx + capX, cy - capY) <= stroke / 2 ||
      dist(x, y, cx + capX, cy + capY) <= stroke / 2;
    if (onRing || nearCap) return fg;
    return bg;
  };
}

fs.mkdirSync(outDir, { recursive: true });

// any-purpose icons: cream bg, green mark (matches product surface)
writePng(path.join(outDir, "icon-192.png"), 192, paintMark(CREAM, BRAND, 0.72));
writePng(path.join(outDir, "icon-512.png"), 512, paintMark(CREAM, BRAND, 0.72));
// maskable: full-bleed brand, mark inset to ~70% safe zone
writePng(
  path.join(outDir, "icon-maskable-512.png"),
  512,
  paintMark(BRAND, FG, 0.62),
);

console.log("Wrote icons to", outDir);
