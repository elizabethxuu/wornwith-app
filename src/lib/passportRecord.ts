// The signed passport record.
//
// This is the brand-side record for the demonstration coat, written once in a
// language-neutral form so that EN, FR and PT all check against the same
// fingerprint. The screens that show these facts (Materials, Environment) read
// them from here, so what a visitor sees and what was signed cannot drift apart.
//
// What gets signed is only this record. Nothing an owner writes (moments,
// condition, wear count) is ever fingerprinted or published: that stays in the
// visitor's browser.
//
// The fingerprint is published on Base as an attestation through the Ethereum
// Attestation Service (EAS). The attestation proves who published the record
// and that it has not changed since. It does not prove the claims are true, or
// that a physical garment is this one.

import { GARMENT } from "./garment";

export const PASSPORT_ID = "DPP-204839";
export const RECORD_VERSION = "1";

export const SUPPLY_CHAIN = [
  { stage: "wool_farm", place: "NZ", code: "NZ-F4821" },
  { stage: "milling", place: "Italy", code: "IT-F9043" },
  { stage: "ship", place: "Portugal", code: "PT-F2217" },
  { stage: "retail", place: "Paris", code: "FR-F6631" },
] as const;

// Straight-line distance of each leg (Canterbury → Biella → Porto → Paris),
// rounded to the nearest 100 km. The total is their sum, so the timeline and
// the headline figure always agree.
export const JOURNEY = { countries: 4, legsKm: [18800, 1400, 1200], distanceKm: 21400 } as const;

// Claim statuses use the same vocabulary as the screens: signing a claim proves
// it hasn't been changed, not that it has been checked.
export const ETHICAL_AUDIT = {
  citedReference: { issuer: "Bureau Veritas", id: "BV-2025-09871", status: "cited_not_checked" },
  results: [
    { criterion: "fair_wages", result: "passed", status: "pending_verification" },
    { criterion: "health_safety", result: "grade_a", status: "pending_verification" },
    { criterion: "no_forced_labour", result: "passed", status: "pending_verification" },
  ],
} as const;

export const CHEMICAL_COMPLIANCE = {
  reach: { result: "no_test_report_on_file", status: "not_available" },
  economicOperator: { result: "placeholder", status: "not_available" },
} as const;

export const IMPACT = {
  co2VsCategoryPercent: 30,
  co2CategoryAverageKg: 12.1,
  recycledWaterPercent: 80,
  recyclabilityPercent: 92,
  renewableEnergyPercent: 78,
  ethicalSourcingPercent: 100,
  // 30% below the 12.1 kg category average: 12.1 × 0.30 ≈ 3.6 kg saved.
  co2SavedKg: 3.6,
  waterSavedLitres: 2400,
  topPercentOfBrands: 10,
} as const;

export const PASSPORT_RECORD = {
  format: "wornwith.care/passport",
  recordVersion: RECORD_VERSION,
  passportId: PASSPORT_ID,
  status: "demonstration",
  publisher: "Worn With Care (prototype)",
  disclaimer:
    "Demonstration record. Garment details and impact figures are illustrative and have not been independently verified. Not affiliated with or endorsed by any brand named.",
  product: {
    brandOnLabel: GARMENT.brand,
    sku: GARMENT.brandSku,
    name: GARMENT.name,
    composition: GARMENT.material,
    madeIn: GARMENT.madeIn,
    certificationsCited: ["RWS", "GRS"],
  },
  supplyChain: SUPPLY_CHAIN,
  journey: JOURNEY,
  ethicalAudit: ETHICAL_AUDIT,
  chemicalCompliance: CHEMICAL_COMPLIANCE,
  impact: { ...IMPACT, basis: "illustrative estimates" },
};

export type PassportRecord = typeof PASSPORT_RECORD;

// Stable JSON: object keys sorted at every level, no extra whitespace. The same
// record always produces the same bytes, so anyone can recompute the hash.
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

// SHA-256 of the canonical JSON, as a 0x-prefixed hex string (a bytes32).
export async function fingerprint(record: unknown = PASSPORT_RECORD): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalJson(record));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return `0x${Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

// Where the record is published. The two IDs are filled in once the schema is
// registered and the attestation is made on base.easscan.org. Until then the
// app says plainly that the record has not been published yet.
export const ATTESTATION = {
  network: "Base",
  chainId: 8453,
  service: "Ethereum Attestation Service",
  explorer: "https://base.easscan.org",
  graphql: "https://base.easscan.org/graphql",
  schema: "string passportId,string recordVersion,bytes32 recordHash,string status,string recordUri",
  recordUri: `https://wornwith.care/passport/${PASSPORT_ID}.json`,
  schemaUid: null as string | null,
  attestationUid: null as string | null,
  publishedOn: null as string | null, // e.g. "2026-10-23"
  publisherAddress: null as string | null, // the wallet that signs the attestation
};

export function publicRecordUrl(): string | null {
  return ATTESTATION.attestationUid ? `${ATTESTATION.explorer}/attestation/view/${ATTESTATION.attestationUid}` : null;
}

export function shortHex(hex: string, head = 6, tail = 6): string {
  return hex.length <= head + tail + 1 ? hex : `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

export type RecordCheck =
  | { state: "unpublished"; localHash: string }
  | { state: "match"; localHash: string; attester: string; time: number }
  | { state: "mismatch"; localHash: string; publishedHash: string }
  | { state: "revoked"; localHash: string }
  | { state: "unreachable"; localHash: string };

type DecodedField = { name: string; value: { value: unknown } };

// Fetches the published attestation and compares its recordHash with the hash
// of the record this page was built from. Never throws: a network problem is
// reported as "unreachable" rather than as a failed check.
export async function checkRecord(fetchImpl: typeof fetch = fetch): Promise<RecordCheck> {
  const localHash = await fingerprint();
  if (!ATTESTATION.attestationUid) return { state: "unpublished", localHash };
  try {
    const res = await fetchImpl(ATTESTATION.graphql, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "query($id:String!){attestation(where:{id:$id}){id attester revoked time decodedDataJson}}",
        variables: { id: ATTESTATION.attestationUid },
      }),
    });
    if (!res.ok) return { state: "unreachable", localHash };
    const json = await res.json();
    const a = json?.data?.attestation;
    if (!a) return { state: "unreachable", localHash };
    if (a.revoked) return { state: "revoked", localHash };
    const fields: DecodedField[] = JSON.parse(a.decodedDataJson || "[]");
    const published = String(fields.find((f) => f.name === "recordHash")?.value?.value ?? "").toLowerCase();
    const expected = ATTESTATION.publisherAddress?.toLowerCase();
    if (expected && String(a.attester).toLowerCase() !== expected) return { state: "mismatch", localHash, publishedHash: published };
    if (published !== localHash.toLowerCase()) return { state: "mismatch", localHash, publishedHash: published };
    return { state: "match", localHash, attester: String(a.attester), time: Number(a.time) };
  } catch {
    return { state: "unreachable", localHash };
  }
}
