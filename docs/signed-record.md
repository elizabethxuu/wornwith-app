# Signed passport record

The passport's brand-side record is fingerprinted and published on Base through the Ethereum Attestation Service (EAS). Anyone can check that the record a visitor sees is the record that was published, without trusting Worn With Care.

## What it proves, and what it doesn't

- **Proves:** who published the record (the publisher's wallet) and that the record hasn't changed since.
- **Doesn't prove:** that the details are true, or that a physical garment is this one. That takes independent audits and a secure chip in the label.
- **Never published:** anything an owner writes (moments, condition, wear count). That stays in the visitor's browser.

The record is labelled `"status": "demonstration"`. The garment details and figures are illustrative.

## How it works

1. `src/lib/passportRecord.ts` holds the record in a language-neutral form. The Materials and Environment screens read their figures from it, so the page and the record cannot drift apart.
2. The record is serialised as canonical JSON (keys sorted, no whitespace) and hashed with SHA-256.
3. A copy is served at `/passport/DPP-204839.json`.
4. The hash is published in an attestation on Base.
5. The "Verify this passport" panel recomputes the hash in the browser, fetches the attestation from base.easscan.org, and checks that the hash and the publisher's wallet both match.

## Check it yourself

```bash
curl -s https://wornwith.care/passport/DPP-204839.json | shasum -a 256
```

The result should equal `recordHash` on the public attestation page.

## Publishing (one time)

1. Run `npm run passport:record`. It writes the public JSON and prints the schema and values.
2. Set up a wallet you control (Coinbase Wallet or MetaMask) and keep its recovery phrase offline. Add a few dollars of ETH **on the Base network**.
3. On https://base.easscan.org, create a schema with the printed schema string. Revocable: yes. No resolver.
4. From that schema's page, make an **on-chain** attestation with the printed values. Recipient: leave empty. Expiration: none.
5. Put the schema UID, attestation UID, publish date and wallet address into `ATTESTATION` in `src/lib/passportRecord.ts`.

## Changing the record later

Any change to the record changes its hash, and the panel will show "This page doesn't match the published record". To publish a change: bump `RECORD_VERSION`, run `npm run passport:record`, make a new attestation, update `ATTESTATION`, and revoke the old attestation on base.easscan.org.
