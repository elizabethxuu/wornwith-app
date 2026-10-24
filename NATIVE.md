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
