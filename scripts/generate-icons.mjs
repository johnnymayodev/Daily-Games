// Rasterizes public/favicon.svg into the PNG sizes referenced by the web manifest.
// Run with: node scripts/generate-icons.mjs
// Uses the sharp copy that ships with Astro; no extra install required.
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = await readFile(new URL("../public/favicon.svg", import.meta.url));

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of targets) {
  const png = await sharp(source, { density: 384 }).resize(size, size).png().toBuffer();
  await writeFile(new URL(`../public/${name}`, import.meta.url), png);
  console.log(`Wrote public/${name} (${size}x${size})`);
}
