# FleetCare — client-only prototype

Next.js UI only. **No Express / backend server required.**  
Auth and fleet data live in the browser (`localStorage`) so you can deploy on **Vercel**.

```
client/   Next.js app (port 3001)
server/   optional / unused for this prototype
```

## Run locally

```bash
cd client
npm install
npm run dev
```

Open http://localhost:3001

## Deploy on Vercel

1. Set **Root Directory** to `client`
2. Build command: `npm run build`
3. Output: Next.js defaults
4. No env vars required for the prototype

## Demo sign-in accounts

| Role | Tab | Identifier | Password |
|------|-----|------------|----------|
| Admin | Admin | `ORG-1001` or `admin@fleetcare.demo` | `Admin@123` |
| Driver | Driver | `driver@fleetcare.demo` | `Driver@123` |

## Mobile app (Capacitor)

The Android app is a native shell that loads your web UI from Vercel (`client/capacitor.config.ts`). iOS still needs Xcode + CocoaPods.

**Requirements on Mac:** Node, **JDK 21** (Capacitor 7), Android SDK. This repo uses Homebrew `android-commandlinetools` at `/opt/homebrew/share/android-commandlinetools` — copy `client/android/local.properties.example` to `local.properties` if needed.

```bash
cd client
npm install
export JAVA_HOME="$HOME/.jdks/temurin-21/Contents/Home"   # or Temurin 21 from brew
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

npm run cap:sync
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

**Run on device/emulator:** open `client/android` in Android Studio → Run, or `npm run cap:run:android` (with a device connected or emulator running).

**Local web instead of Vercel:** `npm run dev` in one terminal, then `npm run cap:sync:local` and reinstall/run the app (emulator uses `10.0.2.2:3001`).

After changing web UI, **redeploy Vercel** so phones see updates (unless using `cap:sync:local`).

**iOS (when Xcode is installed):** `sudo gem install cocoapods`, then `cd client && npx cap add ios && npm run cap:ios`.

## Notes

- Signup creates an admin org in localStorage
- Drivers / vehicles you add are stored in the same browser
- Clearing site data resets the prototype seed
- Module screens (routes, maintenance, bills, etc.) use sample UI data
