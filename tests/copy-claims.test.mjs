// Guards the visitor-facing copy against claims the prototype cannot back up.
// If one of these fails, either the feature now exists (update the test) or the
// wording needs to come back down to what is true. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const copy = readFileSync(new URL("../src/lib/i18n.tsx", import.meta.url), "utf8");
const privacyBlock = copy.slice(copy.indexOf("privacy_eyebrow"), copy.indexOf("terms_eyebrow"));

test("privacy copy exists in all three languages for every key", () => {
  const parts = privacyBlock.split(/\n(?=\s{2}privacy_\w+: )/).filter((p) => /^\s{2}privacy_/.test(p));
  assert.ok(parts.length >= 18, `found ${parts.length} privacy keys`);
  for (const part of parts) {
    const key = part.match(/privacy_\w+/)[0];
    for (const lang of ["en", "fr", "pt"]) assert.match(part, new RegExp(`${lang}: "[^"]{3,}"`), `${key} is missing ${lang}`);
  }
});

test("privacy copy does not claim security features the app does not have", () => {
  const banned = [/encrypted storage/i, /secure authentication/i, /protected cloud backups/i, /stockage chiffr/i, /authentification s/i, /armazenamento criptografado/i, /autentica..o segura/i];
  for (const re of banned) assert.ok(!re.test(privacyBlock), `privacy copy still matches ${re}`);
});

test("privacy copy discloses the services that receive typed text", () => {
  assert.match(privacyBlock, /Google Gemini/);
  assert.match(privacyBlock, /ElevenLabs/);
  assert.match(privacyBlock, /stored only in this browser/);
});
