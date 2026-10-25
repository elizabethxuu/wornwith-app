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

## Home-screen widget (one-time setup in Xcode)

The widget's code and images are ready in `ios/App/WornWidgetFiles/`. Xcode has to create the widget "target" itself, once:

1. In Xcode: **File → New → Target… → Widget Extension** → Next.
2. Product Name: `WornWidget`. **Untick** "Include Live Activity" and "Include Configuration App Intent". Finish, then **Activate** when asked.
3. In the left sidebar, open the new **WornWidget** folder. Select the `.swift` files Xcode made (e.g. `WornWidget.swift`, `WornWidgetBundle.swift`) → right-click → **Delete → Move to Trash**.
4. Drag `ios/App/WornWidgetFiles/WornWidget.swift` from Finder into that **WornWidget** folder. In the dialog, tick **Copy items if needed** and, under Targets, tick **WornWidget only**.
5. Open the WornWidget folder's **Assets** catalog and drag in `Coat.png` and `WLogo.png` from `WornWidgetFiles` (they must keep those names).
6. Select the **App** target → Signing & Capabilities → **+ Capability → App Groups** → tick `group.care.wornwith.app` (add it with + if it isn't listed). Do the same for the **WornWidget** target.
7. Set the **WornWidget** target's Minimum Deployments to iOS 16.0 (General tab).
8. Run the app on your iPhone, then long-press the home screen → **+** → Worn With Care. The widget shows the next care step and your wear count; the lock-screen version is under Lock Screen → Customize.

The widget code was written without a Mac, so if Xcode shows an error, paste it to Claude.

## TestFlight pilot, then the App Store

What's already set in the project: bundle ID `care.wornwith.app`, display name "Worn With Care", iPhone only, the pink W app icon and launch screen, permission texts (microphone, camera, photos, location, NFC), the export-compliance flag (standard HTTPS only), and a privacy manifest (`App/PrivacyInfo.xcprivacy`: no tracking; audio, wardrobe questions, approximate location and anonymous usage, none linked to the person).

1. **App Store Connect** (appstoreconnect.apple.com) → Apps → **+** → New App: iOS, name "Worn With Care", bundle ID `care.wornwith.app`, SKU `wornwith-001`.
2. **Upload a build:** in Xcode choose *Any iOS Device (arm64)* → Product → **Archive** → Distribute App → App Store Connect → Upload. Raise **Build** (`CURRENT_PROJECT_VERSION`) by 1 for every upload.
3. **TestFlight pilot:**
   - *Internal* (you and up to 100 people on your App Store Connect team): available minutes after upload, no review.
   - *External* (up to 10,000 people by email or a public link): needs a short beta review (usually about a day). Use this for boutiques, language testers and friends. Put the Google Form link in "What to Test".
4. **App Privacy** (App Store Connect → App Privacy): answer to match the manifest. Data not linked to the user, not used for tracking: Audio Data and Other User Content (app functionality), Coarse Location (app functionality), Product Interaction (analytics). Privacy policy URL: https://wornwith.care (Privacy page) or a direct link.
5. **Listing:** category Lifestyle; age rating 4+; subtitle (30 characters), description, keywords; support URL and marketing URL https://wornwith.care; screenshots at 6.9" (1320 × 2868), at least 3.
6. **Listing and App Review notes:** ready to paste in `ios/APP_STORE.md`. They lead with tag scanning, reminders and the widget, which is what shows Apple this is more than a website. Attach a 30-second video of a tag scan for the reviewers.
7. **Submit for Review**, then release manually or automatically once approved.
