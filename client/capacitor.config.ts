import type { CapacitorConfig } from "@capacitor/cli";

/** Production web app URL loaded inside the native WebView (Option A). Override for local dev. */
const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://client-nu-beryl-76.vercel.app";

const config: CapacitorConfig = {
  appId: "com.fleetcare.app",
  appName: "FleetCare",
  webDir: "www",
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: "https",
    allowNavigation: ["*.vercel.app", "localhost"],
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f172a",
    },
  },
};

export default config;
