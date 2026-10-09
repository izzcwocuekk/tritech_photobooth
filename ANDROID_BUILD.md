# Build APK Android

Proyek ini memakai Capacitor dan mengemas hasil static export Next.js ke aplikasi Android.

## Prasyarat

- Node.js 20+
- JDK 17
- Android Studio dengan Android SDK dan Build Tools terpasang
- `ANDROID_HOME` atau `ANDROID_SDK_ROOT` sudah diatur

## Build debug APK

```powershell
npm install
npm run cap:sync
.\android\gradlew.bat -p android assembleDebug
```

APK hasil build berada di:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Untuk membuka proyek native di Android Studio:

```powershell
npx cap open android
```

Kamera membutuhkan izin `CAMERA` yang diminta oleh WebRTC saat fitur kamera dibuka.
