// Test helper: loads a TypeScript file from src/ without adding a dependency.
// It uses the TypeScript compiler already in devDependencies to strip types,
// writes the result to a temp folder, and imports it.
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = mkdtempSync(join(tmpdir(), "wornwith-test-"));
const done = new Set();

function compile(rel) {
  if (done.has(rel)) return;
  done.add(rel);
  const source = readFileSync(join(root, "src", `${rel}.ts`), "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const deps = [];
  const rewritten = js
    .replace(/(from\s+["'])(\.[^"']+)(["'])/g, (_m, a, spec, c) => {
      deps.push(join(dirname(rel), spec).replace(/\\/g, "/"));
      return `${a}${spec}.mjs${c}`;
    })
    .replace(/import\.meta\.env/g, "({})");
  const target = join(out, `${rel}.mjs`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, rewritten);
  deps.forEach(compile);
}

export async function loadTs(rel) {
  compile(rel);
  // A fresh query string gives each call its own copy of the module state.
  return import(`${pathToFileURL(join(out, `${rel}.mjs`)).href}?v=${Math.random()}`);
}
