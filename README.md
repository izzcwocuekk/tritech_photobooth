# Tritech Photobooth – Jurusan Edition (2026)

Aplikasi photobooth digital untuk siswa SMK Tritech Informatika guna mengabadikan momen sekolah berdasarkan jurusan dengan nuansa modern, interaktif, dan penuh kenangan.

## Fitur Utama

1. **Pilihan Jurusan Khas:**
   - **RPL (Rekayasa Perangkat Lunak)**: Nuansa biru teknologi (#2563EB)
   - **DKV (Desain Komunikasi Visual)**: Nuansa merah muda/magenta kreatif (#DB2777)
   - **TKJ (Teknik Komputer dan Jaringan)**: Nuansa slate/dark sleek (#1E293B)

2. **Kamera & Capture Photobooth:**
   - Akses kamera WebRTC dengan toggle kamera depan/belakang
   - Hitung mundur 3 detik otomatis sebelum tiap foto
   - Pengambilan 4 foto berurutan dengan efek flash dan nada audio sintetis (Web Audio API)
   - Opsi foto contoh/unggah foto untuk kemudahan pengujian tanpa kamera fisik

3. **Editor & Kustomisasi Photostrip:**
   - Kustomisasi background jurusan (RPL, DKV, TKJ)
   - Pilihan frame: *Memories 2026*, *Jurusan Edition*, *Polaroid Classic*, *Best Friends Forever*
   - Pilihan filter: *Normal*, *B&W Film*, *Vintage Sepia*, *Warm Glow*
   - Generator Photostrip resolusi tinggi (1080x1920) dengan badge nomor foto, identitas sekolah, dan cap tanggal

4. **Hasil & Berbagi:**
   - Download photostrip instan dalam format PNG berkualitas tinggi
   - Fitur bagikan (Web Share API / Intent)
   - Cetak langsung (format print-friendly)
   - Foto ulang / retake

5. **Galeri Kenangan:**
   - Penyimpanan lokal untuk photostrip yang sudah dibuat
   - Tampilan grid responsif
   - Modal preview detail, opsi unduh ulang, dan manajemen hapus

## Arsitektur Aplikasi

- **Web Core**: Next.js App Router, React 19, Lucide Icons, Canvas 2D API
- **Android Native Architecture**:
  - `com.tritech.photobooth.model`: Model `Major`, `Photostrip`, frame & filter
  - `com.tritech.photobooth.viewmodel`: `PhotoboothViewModel` mengelola state (`StateFlow`)
  - `com.tritech.photobooth.ui.screens`: `HomeScreen`, `MajorScreen`, `CameraScreen`, `EditorScreen`, `ResultScreen`, `GalleryScreen` berbasis Jetpack Compose
  - `com.tritech.photobooth.util`: `PhotostripGenerator` untuk rendering bitmap 1080x1920
  - `com.tritech.photobooth.NativePhotoboothActivity`: Implementasi activity Jetpack Compose
  - `MainActivity.java`: Capacitor Bridge Activity dengan izin kamera `WebChromeClient.onPermissionRequest`
