// Guards the per-chapter color identity. Each screen keeps its own accent, and
// small text set in an accent stays readable. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadTs } from "./_loadTs.mjs";

const { readableOn, contrastRatio } = await loadTs("lib/contrast");
const source = readFileSync(new URL("../src/lib/chapterColor.tsx", import.meta.url), "utf8");
const CHAPTER_COLORS = [...source.slice(source.indexOf("CHAPTER_COLORS"), source.indexOf("];")).matchAll(/"(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1]);
const ARCHIVE_ACCENT_COLOR = source.match(/ARCHIVE_ACCENT_COLOR = "(#[0-9A-Fa-f]{6})"/)[1];

// The original palette (commit 164bfd9 onward, Story from de9b782).
const ORIGINAL = ["#3B342F", "#B98A4A", "#7B5A45", "#7B5A45", "#6E7E5C", "#8A9F7A", "#5E7B5E", "#2FC7D8", "#A66A73", "#556B8A", "#3B342F"];

test("the original chapter palette is unchanged", () => {
  assert.deepEqual(CHAPTER_COLORS, ORIGINAL);
  assert.equal(ARCHIVE_ACCENT_COLOR, "#6D556A");
});

test("chapters keep distinct identities, not one shared accent", () => {
  assert.ok(new Set(CHAPTER_COLORS).size >= 9);
});

test("readableOn keeps colors that already pass and fixes the ones that do not", () => {
  for (const c of CHAPTER_COLORS) {
    const out = readableOn(c);
    assert.ok(contrastRatio(out, "#FFFFFF") >= 4.5, `${c} -> ${out} is below 4.5:1`);
    if (contrastRatio(c, "#FFFFFF") >= 4.5) assert.equal(out, c, `${c} should not change`);
  }
});

test("the eyebrow label and the progress marker read the chapter color", () => {
  const ui = readFileSync(new URL("../src/components/UI.tsx", import.meta.url), "utf8");
  const shell = readFileSync(new URL("../src/components/ChapterShell.tsx", import.meta.url), "utf8");
  assert.match(ui, /chapterInk\(useChapterColor\(\)\)/);
  assert.match(shell, /useChapterColor\(\)/);
});

test("chapter colors are readable as text on the dark theme too", async () => {
  const { readableOnDark, DARK_SURFACE } = await loadTs("lib/contrast");
  for (const c of CHAPTER_COLORS) {
    const out = readableOnDark(c);
    assert.ok(contrastRatio(out, DARK_SURFACE) >= 4.5, `${c} -> ${out} is below 4.5:1 on dark`);
  }
});
