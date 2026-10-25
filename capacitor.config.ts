import type { CapacitorConfig } from "@capacitor/cli";

// The iPhone app wraps the same site (built into dist/) and adds what only
// a native app can do: reading the coat's NFC tag from inside the app, and
// care reminders as notifications. See NATIVE.md for building it on a Mac.
const config: CapacitorConfig = {
  appId: "care.wornwith.app",
  appName: "Worn With Care",
  webDir: "dist",
  ios: {
    contentInset: "never",
    backgroundColor: "#FFFFFF",
  },
  plugins: {
    LocalNotifications: {
      iconColor: "#8E3D52",
    },
  },
};

export default config;
