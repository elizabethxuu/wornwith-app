# Worn With Care: iPhone app

The iPhone app wraps the same site in a native shell (Capacitor). It adds two things:

- **Scan the coat's tag.** A tag button sits in the menu's top row and appears only inside the app. Hold the phone near the NFC sticker and the app confirms "This is your coat." It only trusts wornwith.care links.
- **Care reminders.** On the Care screen, "Turn on reminders" schedules four local notifications at 9 am: brush (Saturdays), steam (1st of each month), store (15 Apr), and bring back (1 Oct). Nothing leaves the phone. On the website, the same card offers "Add to my calendar" (.ics) instead.

## Build it on your Mac

1. Install **Xcode** from the App Store and open it once to accept the licence.
2. In the project folder, run:
   ```
   npm install
   npm run build && npx cap sync ios
   npx cap open ios
   ```
3. In Xcode, select the **App** target, then open **Signing & Capabilities**:
   - Choose your **Team**. You need a paid Apple Developer account ($99/yr): free accounts can't use NFC.
   - Check that **Near Field Communication Tag Reading** is listed. If it isn't, click **+ Capability** and add it. The entitlement file `App/App.entitlements` is already set.
4. Plug in your iPhone (an iPhone 7 or later), pick it as the run destination, and press **▶**.
5. On the phone: Menu → tag icon → hold near the sticker. Then Care → Turn on reminders → Allow.

## Good to know

- The NFC reader is a small Swift plugin at the bottom of `ios/App/App/AppDelegate.swift`. It was written without a Mac, so if Xcode flags anything on the first build, paste the error back to Claude.
- In the app, the AI and voice features call https://wornwith.care/api/…; those endpoints already allow the app's origin.
- After any web change: `npm run build && npx cap sync ios`, then run again in Xcode.
- Write the NFC sticker with the passport URL (e.g. https://wornwith.care/?dpp=COS-8821-4f2a) using an app like NFC Tools.

## Apple Wallet pass

The share sheet shows **Add to Apple Wallet** (on Apple devices) once the pass can be signed. Until then the button stays hidden.

1. In your Apple Developer account → Certificates, Identifiers & Profiles → **Identifiers** → **+** → **Pass Type IDs**. Use `pass.care.wornwith.passport`.
2. Open it → **Create Certificate**. Follow the prompt to make a certificate request in Keychain Access, upload it, and download the `.cer`.
3. Double-click the `.cer` to add it to Keychain, then export it from Keychain as a `.p12` (set a password).
4. Convert it in Terminal:
   ```
   openssl pkcs12 -in pass.p12 -clcerts -nokeys -out pass-cert.pem -legacy
   openssl pkcs12 -in pass.p12 -nocerts -out pass-key.pem -legacy
   ```
5. Download Apple's **WWDR G4** certificate (apple.com/certificateauthority), then `openssl x509 -inform der -in AppleWWDRCAG4.cer -out wwdr.pem`.
6. In Vercel → Settings → Environment Variables, add:
   - `APPLE_PASS_TYPE_ID` = `pass.care.wornwith.passport`
   - `APPLE_TEAM_ID` = your 10-character Team ID (top right of the developer site)
   - `APPLE_PASS_CERT` = contents of `pass-cert.pem`
   - `APPLE_PASS_KEY` = contents of `pass-key.pem`
   - `APPLE_PASS_KEY_PASSPHRASE` = the key's password
   - `APPLE_WWDR_CERT` = contents of `wwdr.pem`
7. Redeploy. Keep the `.p12` and `.pem` files private: never put them in the repo.

## Waitlist (wornwith.care/waitlist)

Until a database is connected, the form offers to email hello@wornwith.care instead. To turn it on: Vercel → your project → **Storage** → **Create Database** → **Upstash for Redis** (free tier) → connect it to this project, then redeploy. To read the sign-ups, open the database's **Data Browser** in Vercel and look at the `wl:people` hash. The count and most-named piece only show on the page once 10 people have joined.
