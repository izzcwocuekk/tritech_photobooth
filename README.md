# Tritech Photobooth

Mobile-first web photobooth for SMK Tritech Jurusan Edition. It works in a browser and can be packaged as an Android APK with Capacitor.

## Web

```bash
npm install
npm run dev
```

Open `http://localhost:3000` or the network URL shown by Next.js. Camera access requires a secure origin (HTTPS or localhost).

## Photo modes

- Solo, Duo, Photostrip, and Kolase layouts
- Automatic countdown or manual shutter
- Front and rear camera switching
- Upload photos from the device gallery
- RPL, DKV, and TKJ visual identity
- Paper, frame, and color filter controls
- PNG download, native file sharing, and offline device gallery

## Android wrapper

```bash
npm run cap:sync
npx cap open android
```

The Android project is in `android/`. See [ANDROID_BUILD.md](./ANDROID_BUILD.md) for APK build requirements.
