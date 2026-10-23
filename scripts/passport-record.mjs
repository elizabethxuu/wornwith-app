// Writes the public copy of the passport record and prints the values to paste
// into base.easscan.org when publishing the attestation. Run: npm run passport:record
import { writeFileSync } from "node:fs";
import { loadTs } from "../tests/_loadTs.mjs";

const m = await loadTs("lib/passportRecord");
const json = m.canonicalJson(m.PASSPORT_RECORD);
const file = new URL(`../public/passport/${m.PASSPORT_ID}.json`, import.meta.url);
writeFileSync(file, json);
const hash = await m.fingerprint();

console.log(`Wrote public/passport/${m.PASSPORT_ID}.json\n`);
console.log("Schema (register once, Revocable: yes):");
console.log(`  ${m.ATTESTATION.schema}\n`);
console.log("Attestation values:");
console.log(`  passportId     ${m.PASSPORT_ID}`);
console.log(`  recordVersion  ${m.RECORD_VERSION}`);
console.log(`  recordHash     ${hash}`);
console.log(`  status         ${m.PASSPORT_RECORD.status}`);
console.log(`  recordUri      ${m.ATTESTATION.recordUri}`);
