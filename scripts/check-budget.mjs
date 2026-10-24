// After the build: adds up the JavaScript a first visit downloads (every
// script index.html loads) and stops the build if it grows past the budget.
// This is the number that matters for speed; how the bundler happens to
// split it into files does not.
import { readFileSync, statSync } from "node:fs";

const BUDGET_KB = 540;
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const files = [...new Set(html.match(/assets\/[^"']+\.js/g) || [])];
const bytes = files.reduce((n, f) => n + statSync(new URL(`../dist/${f}`, import.meta.url)).size, 0);
const kb = bytes / 1000;
console.log(`first-visit JavaScript: ${kb.toFixed(1)} kB of ${BUDGET_KB} kB budget`);
if (kb > BUDGET_KB) {
  console.error(`Over budget by ${(kb - BUDGET_KB).toFixed(1)} kB. Load the new feature on demand instead.`);
  process.exit(1);
}
