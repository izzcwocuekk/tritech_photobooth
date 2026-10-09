"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Download,
  Images,
  RotateCcw,
  Share2,
  Sparkles,
  SwitchCamera,
  Printer,
  Trash2,
  Upload,
  Check,
  Heart,
  Eye,
  X
} from "lucide-react";

export interface Major {
  id: string;
  short: string;
  name: string;
  color: string;
  accent: string;
  bg: string;
  description: string;
}

export const majors: Major[] = [
  {
    id: "rpl",
    short: "RPL",
    name: "Rekayasa Perangkat Lunak",
    color: "#2563eb",
    accent: "#60a5fa",
    bg: "linear-gradient(145deg, #1d4ed8, #0284c7)",
    description: "Code, create, and innovate. Tema bernuansa biru teknologi."
  },
  {
    id: "dkv",
    short: "DKV",
    name: "Desain Komunikasi Visual",
    color: "#db2777",
    accent: "#f472b6",
    bg: "linear-gradient(145deg, #be185d, #ec4899)",
    description: "Warna ekspresif, seni visual, dan estetika kreatif."
  },
  {
    id: "tkj",
    short: "TKJ",
    name: "Teknik Komputer dan Jaringan",
    color: "#1e293b",
    accent: "#64748b",
    bg: "linear-gradient(145deg, #0f172a, #334155)",
    description: "Jaringan, server, dan keandalan sistem bernuansa sleek."
  }
];

export const frames = [
  "Memories 2026",
  "Jurusan Edition",
  "Polaroid Classic",
  "Best Friends Forever"
];

export const filters = [
  { id: "Normal", name: "Normal", css: "none" },
  { id: "B&W", name: "B&W Film", css: "grayscale(1)" },
  { id: "Vintage", name: "Vintage Sepia", css: "sepia(0.6) contrast(1.1)" },
  { id: "Warm", name: "Warm Glow", css: "sepia(0.25) saturate(1.3)" }
];

// Helper to synthesize camera audio beep
function playBeep(freq = 880, duration = 0.12) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext might be blocked before user gesture, safely ignore
  }
}

// Fallback helper to draw rounded rectangle on Canvas
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
}

export default function Photobooth({ initial = "home" }: { initial?: string }) {
  const [stage, setStage] = useState<string>(initial);
  const [major, setMajor] = useState<Major>(majors[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [bg, setBg] = useState<string>(majors[0].bg);
  const [frame, setFrame] = useState<string>(frames[0]);
  const [filter, setFilter] = useState<string>("Normal");
  const [final, setFinal] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<string | null>(null);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [error, setError] = useState<string>("");
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [shotIndex, setShotIndex] = useState<number>(0);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync stage with history and load saved gallery
  useEffect(() => {
    const handlePopState = () => {
      const path = location.pathname;
      if (path === "/gallery") setStage("gallery");
      else if (path === "/major") setStage("major");
      else if (path === "/camera") setStage("camera");
      else if (path === "/editor") setStage("editor");
      else if (path === "/result") setStage("result");
      else setStage("home");
    };

    window.addEventListener("popstate", handlePopState);
    try {
      const saved = localStorage.getItem("tritech-gallery");
      if (saved) setGallery(JSON.parse(saved));
    } catch {
      // Storage unavailable or invalid JSON
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const navigateTo = (newStage: string) => {
    setStage(newStage);
    const path = newStage === "home" ? "/" : `/${newStage}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  };

  const selectMajor = (m: Major) => {
    setMajor(m);
    setBg(m.bg);
    navigateTo("camera");
  };

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCameraStream();
    setError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Browser tidak mendukung kamera WebRTC.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Camera access failed", err);
      setError("Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan tombol foto sampel atau unggah foto di bawah.");
    }
  }, [facingMode, stopCameraStream]);

  useEffect(() => {
    if (stage === "camera") {
      startCamera();
    } else {
      stopCameraStream();
    }
  }, [stage, facingMode, startCamera, stopCameraStream]);

  const snapPhoto = (): string => {
    if (!videoRef.current) return "";
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  // Generate mock sample shots when camera is not connected
  const generateSampleShots = () => {
    const colors = ["#38bdf8", "#f472b6", "#a78bfa", "#34d399"];
    const labels = ["Pose 1: Ceria 😊", "Pose 2: Peace ✌️", "Pose 3: Gaya Jurusan 💻", "Pose 4: Best Friends 🎓"];
    const samplePhotos = colors.map((col, idx) => {
      const c = document.createElement("canvas");
      c.width = 720;
      c.height = 960;
      const ctx = c.getContext("2d")!;
      
      const grad = ctx.createLinearGradient(0, 0, 720, 960);
      grad.addColorStop(0, col);
      grad.addColorStop(1, major.color);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 720, 960);

      // Simple avatar outline
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(360, 420, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(360, 850, 320, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "bold 56px Arial, sans-serif";
      ctx.fillText(labels[idx], 360, 440);
      ctx.font = "32px Arial, sans-serif";
      ctx.fillText(`SMK TRITECH · ${major.short}`, 360, 520);

      return c.toDataURL("image/jpeg", 0.9);
    });

    setPhotos(samplePhotos);
    navigateTo("editor");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    const readers = Array.from(files).slice(0, 4).map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            urls.push(ev.target.result as string);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(() => {
      while (urls.length < 4 && urls.length > 0) {
        urls.push(urls[urls.length - 1]);
      }
      setPhotos(urls.slice(0, 4));
      navigateTo("editor");
    });
  };

  // 4-shot automated countdown capture
  const startCaptureSequence = async () => {
    if (busy) return;
    setBusy(true);
    const captured: string[] = [];

    for (let i = 0; i < 4; i++) {
      setShotIndex(i + 1);
      for (let n = 3; n > 0; n--) {
        setCount(n);
        playBeep(880, 0.08);
        await new Promise((r) => setTimeout(r, 650));
      }
      setCount(null);
      
      // Flash effect and snap
      setFlash(true);
      playBeep(1320, 0.25);
      const photo = snapPhoto();
      if (photo) captured.push(photo);
      setTimeout(() => setFlash(false), 160);

      await new Promise((r) => setTimeout(r, 450));
    }

    setPhotos(captured.length === 4 ? captured : captured.length > 0 ? captured : []);
    stopCameraStream();
    setBusy(false);
    setShotIndex(0);
    if (captured.length > 0) {
      navigateTo("editor");
    }
  };

  // Photostrip Canvas generator (1080 x 1920)
  const generatePhotostrip = async () => {
    const canvas = canvasRef.current || document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Draw solid / gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, major.color);
    bgGrad.addColorStop(1, major.accent || "#1e1e38");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative photostrip border styling
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1020, 1860);

    // Header badge & title
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "900 52px Arial, sans-serif";
    ctx.fillText("TRITECH MEMORIES 2026", 540, 84);

    ctx.font = "600 24px Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(`SMK TRITECH INFORMATIKA · ${major.name.toUpperCase()}`, 540, 120);

    // 2. Load and draw the 4 photos
    const loadedImages: HTMLImageElement[] = await Promise.all(
      photos.map((src) => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = src;
        });
      })
    );

    const photoYStart = 150;
    const photoHeight = 390;
    const photoWidth = 920;
    const photoX = 80;
    const photoGap = 24;

    loadedImages.forEach((img, idx) => {
      const y = photoYStart + idx * (photoHeight + photoGap);

      // Outer white photo frame border
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      drawRoundedRect(ctx, photoX - 10, y - 10, photoWidth + 20, photoHeight + 20, 24);
      ctx.fill();

      // Shadow / inner photo slot
      ctx.save();
      ctx.beginPath();
      drawRoundedRect(ctx, photoX, y, photoWidth, photoHeight, 18);
      ctx.clip();

      // Apply photo filter
      if (filter === "B&W") {
        ctx.filter = "grayscale(100%) contrast(110%)";
      } else if (filter === "Vintage") {
        ctx.filter = "sepia(70%) contrast(105%) brightness(95%)";
      } else if (filter === "Warm") {
        ctx.filter = "saturate(130%) sepia(25%)";
      } else {
        ctx.filter = "none";
      }

      try {
        ctx.drawImage(img, photoX, y, photoWidth, photoHeight);
      } catch (err) {
        console.warn("Failed drawing photo image slot", err);
      }
      ctx.restore();

      // Little photo counter badge
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      drawRoundedRect(ctx, photoX + 16, y + 16, 52, 34, 10);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${idx + 1}`, photoX + 42, y + 40);
    });

    // 3. Footer branding, frame style & timestamp
    const footerY = 1830;
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 36px Arial, sans-serif";
    ctx.fillText(`${major.short} · ${frame.toUpperCase()}`, 540, footerY);

    ctx.font = "500 22px Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    ctx.fillText(`PHOTOBOOTH EDITION · ${dateStr} · MEDAN`, 540, footerY + 36);

    const dataUrl = canvas.toDataURL("image/png");
    setFinal(dataUrl);

    // Save to gallery
    try {
      const updated = [dataUrl, ...gallery.filter((g) => g !== dataUrl)].slice(0, 16);
      setGallery(updated);
      localStorage.setItem("tritech-gallery", JSON.stringify(updated));
    } catch {
      // quota or local storage exception
    }

    navigateTo("result");
  };

  const deleteGalleryPhoto = (img: string) => {
    const updated = gallery.filter((item) => item !== img);
    setGallery(updated);
    if (selectedGalleryPhoto === img) setSelectedGalleryPhoto(null);
    try {
      localStorage.setItem("tritech-gallery", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearAllGallery = () => {
    if (window.confirm("Hapus semua foto dari galeri?")) {
      setGallery([]);
      setSelectedGalleryPhoto(null);
      try {
        localStorage.removeItem("tritech-gallery");
      } catch {
        // ignore
      }
    }
  };

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        // Convert data URL to Blob for native sharing if supported
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], "tritech-photobooth.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Tritech Photobooth Memories",
            text: `Kenangan Photobooth SMK Tritech Jurusan ${major.short} 2026!`,
            files: [file]
          });
          return;
        }
      } catch {
        // fallback to standard url share
      }
      try {
        await navigator.share({
          title: "Tritech Photobooth",
          text: `Photobooth SMK Tritech Jurusan ${major.short}`,
          url: window.location.href
        });
      } catch {
        // user aborted share
      }
    } else {
      // Fallback: copy link
      navigator.clipboard?.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <main className="shell">
      {/* Top Navigation */}
      <nav className="nav">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo("home");
          }}
        >
          TRITECH
          <small>PHOTOBOOTH · 2026</small>
        </a>
        <div className="navlinks">
          <a
            className={`ghost ${stage === "gallery" ? "selected" : ""}`}
            href="/gallery"
            onClick={(e) => {
              e.preventDefault();
              navigateTo("gallery");
            }}
          >
            <Images size={16} style={{ marginRight: 6 }} />
            Galeri {gallery.length > 0 && `(${gallery.length})`}
          </a>
        </div>
      </nav>

      {/* STAGE: HOME */}
      {stage === "home" && (
        <>
          <section className="hero">
            <div>
              <div className="eyebrow">JURUSAN EDITION · 2026</div>
              <h1>
                Capture your
                <br />
                <span>school memories.</span>
              </h1>
              <p>
                Foto seru bersama teman dengan tema khas jurusanmu di SMK Tritech.
                Pilih jurusan, ambil 4 foto otomatis, kustomisasi photostrip, lalu bawa pulang
                kenangannya.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
                <button className="primary" onClick={() => navigateTo("major")}>
                  Mulai Photobooth <ArrowRight size={18} style={{ marginLeft: 6 }} />
                </button>
                <button className="ghost" onClick={() => navigateTo("gallery")}>
                  Lihat Hasil ({gallery.length})
                </button>
              </div>
            </div>

            {/* Rotated Photostrip Preview card */}
            <div className="preview">
              <div className="strip">
                <div className="shot" style={{ background: "linear-gradient(135deg,#368cf4,#182867)" }} />
                <div className="shot" style={{ background: "linear-gradient(135deg,#ee65aa,#7e236e)" }} />
                <div className="shot" style={{ background: "linear-gradient(135deg,#334155,#0f172a)" }} />
                <div className="shot" style={{ background: "linear-gradient(135deg,#5594f7,#e879f9)" }} />
                <strong>
                  TRITECH
                  <br />
                  MEMORIES 2026
                </strong>
              </div>
            </div>
          </section>

          {/* Major Cards Selection */}
          <h2 className="section-title">Pilih Jurusan Kamu</h2>
          <div className="cards">
            {majors.map((m) => (
              <button
                className={`major-card ${m.id}`}
                key={m.id}
                onClick={() => selectMajor(m)}
              >
                <div className="orb">{m.short}</div>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: m.color,
                    fontWeight: 700,
                    fontSize: 13
                  }}
                >
                  Pilih {m.short} <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* STAGE: MAJOR SELECTION */}
      {stage === "major" && (
        <>
          <div className="page-head">
            <div>
              <h1>Pilih Jurusan Kamu</h1>
              <p style={{ color: "var(--muted)", margin: "4px 0 0" }}>
                Setiap jurusan memiliki nuansa warna, latar belakang, dan stiker spesial.
              </p>
            </div>
            <button className="ghost" onClick={() => navigateTo("home")}>
              <ArrowLeft size={16} style={{ marginRight: 6 }} /> Kembali
            </button>
          </div>

          <div className="cards" style={{ marginTop: 24 }}>
            {majors.map((m) => (
              <button
                className={`major-card ${m.id}`}
                key={m.id}
                onClick={() => selectMajor(m)}
                style={{
                  border: major.id === m.id ? `2px solid ${m.color}` : "none"
                }}
              >
                <div className="orb">{m.short}</div>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <div
                  style={{
                    marginTop: 18,
                    padding: "8px 14px",
                    borderRadius: 12,
                    background: "#f0f2fe",
                    color: m.color,
                    fontWeight: 800,
                    fontSize: 13,
                    display: "inline-block"
                  }}
                >
                  Mulai Sesi {m.short} →
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* STAGE: CAMERA */}
      {stage === "camera" && (
        <>
          <div className="page-head">
            <div>
              <h1>Ambil 4 Foto</h1>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                {major.short} · {major.name}
              </span>
            </div>
            <button className="ghost" onClick={() => navigateTo("major")}>
              <ArrowLeft size={16} style={{ marginRight: 6 }} /> Ganti Jurusan
            </button>
          </div>

          <div className="camera-wrap panel">
            {/* Viewport */}
            <div className="camera-view" style={{ position: "relative" }}>
              {flash && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#ffffff",
                    zIndex: 20,
                    pointerEvents: "none"
                  }}
                />
              )}

              {error ? (
                <div className="camera-placeholder">
                  <Camera size={48} style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 14, maxWidth: 360, margin: "0 auto 16px" }}>{error}</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    <button className="ghost" onClick={startCamera}>
                      Coba Lagi
                    </button>
                    <button className="primary" onClick={generateSampleShots}>
                      Gunakan Foto Contoh
                    </button>
                    <button
                      className="ghost"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} style={{ marginRight: 4 }} /> Unggah Foto
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: facingMode === "user" ? "scaleX(-1)" : "none"
                  }}
                />
              )}

              {/* Countdown overlay */}
              {count && <div className="countdown">{count}</div>}

              {/* Shot index badge during capture */}
              {busy && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: 14
                  }}
                >
                  Foto {shotIndex} dari 4
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="cam-controls">
              <button
                className="ghost"
                onClick={() => navigateTo("major")}
                title="Kembali"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                className="round"
                onClick={startCaptureSequence}
                disabled={busy}
                title="Ambil 4 Foto Otomatis"
              >
                {busy ? (
                  <span style={{ fontSize: 16 }}>{shotIndex}/4</span>
                ) : (
                  <Camera size={26} />
                )}
              </button>

              <button
                className="ghost"
                onClick={() => {
                  setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
                }}
                title="Putar Kamera"
              >
                <SwitchCamera size={18} />
              </button>
            </div>

            <p style={{ textAlign: "center", color: "var(--muted)", margin: 0, fontSize: 14 }}>
              Countdown 3 detik · Foto otomatis 4 kali bergantian
            </p>

            {/* Fallback sample trigger for testing */}
            <div style={{ marginTop: 14, textAlign: "center" }}>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6366f1",
                  fontSize: 12,
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
                onClick={generateSampleShots}
              >
                Atau gunakan foto simulasi (tanpa kamera)
              </button>
            </div>
          </div>
        </>
      )}

      {/* STAGE: EDITOR */}
      {stage === "editor" && (
        <>
          <div className="page-head">
            <div>
              <h1>Kustomisasi Photostrip</h1>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                {photos.length} foto siap dikemas
              </span>
            </div>
            <button className="ghost" onClick={() => navigateTo("camera")}>
              <RotateCcw size={16} style={{ marginRight: 6 }} /> Ambil Ulang
            </button>
          </div>

          <div className="editor-grid">
            {/* Live Photostrip Preview */}
            <div
              className="panel"
              style={{
                background: bg,
                color: "#fff",
                padding: 24,
                borderRadius: 24,
                boxShadow: "0 18px 45px rgba(0,0,0,0.18)"
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <strong style={{ fontSize: 18, letterSpacing: 1.2, display: "block" }}>
                  TRITECH MEMORIES 2026
                </strong>
                <small style={{ opacity: 0.85, fontSize: 12 }}>
                  {major.name} · {frame}
                </small>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {photos.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "#fff",
                      padding: 4,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}
                  >
                    <img
                      src={p}
                      alt={`Shot ${i + 1}`}
                      style={{
                        width: "100%",
                        height: 125,
                        objectFit: "cover",
                        borderRadius: 10,
                        display: "block",
                        filter:
                          filter === "B&W"
                            ? "grayscale(1)"
                            : filter === "Vintage"
                            ? "sepia(0.65) contrast(1.1)"
                            : filter === "Warm"
                            ? "saturate(1.3) sepia(0.25)"
                            : "none"
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 18 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase"
                  }}
                >
                  {major.short} · {frame}
                </span>
              </div>
            </div>

            {/* Customization Controls */}
            <div className="panel">
              <h3 style={{ margin: "0 0 10px" }}>Warna & Tema Jurusan</h3>
              <div className="options">
                {majors.map((m) => (
                  <button
                    className={`chip ${major.id === m.id ? "selected" : ""}`}
                    key={m.id}
                    onClick={() => {
                      setMajor(m);
                      setBg(m.bg);
                    }}
                  >
                    {m.short}
                  </button>
                ))}
              </div>

              <h3 style={{ margin: "22px 0 10px" }}>Gaya Frame</h3>
              <div className="options">
                {frames.map((f) => (
                  <button
                    className={`chip ${frame === f ? "selected" : ""}`}
                    key={f}
                    onClick={() => setFrame(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <h3 style={{ margin: "22px 0 10px" }}>Filter Foto</h3>
              <div className="options">
                {filters.map((flt) => (
                  <button
                    className={`chip ${filter === flt.id ? "selected" : ""}`}
                    key={flt.id}
                    onClick={() => setFilter(flt.id)}
                  >
                    {flt.name}
                  </button>
                ))}
              </div>

              <button
                className="primary"
                style={{ width: "100%", marginTop: 28, padding: 18 }}
                onClick={generatePhotostrip}
              >
                Buat Photostrip <Sparkles size={18} style={{ marginLeft: 8 }} />
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
      )}

      {/* STAGE: RESULT */}
      {stage === "result" && (
        <>
          <div className="page-head">
            <div>
              <h1>Hasil Foto Kamu! 🎉</h1>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                Photostrip siap diunduh dan dibagikan
              </span>
            </div>
            <button className="ghost" onClick={() => navigateTo("camera")}>
              <RotateCcw size={16} style={{ marginRight: 6 }} /> Foto Baru
            </button>
          </div>

          <div className="panel" style={{ maxWidth: 520, margin: "auto" }}>
            {final && (
              <img
                className="result-img"
                src={final}
                alt="Tritech Photostrip Result"
                style={{ borderRadius: 16 }}
              />
            )}

            {copiedNotification && (
              <div
                style={{
                  background: "#10b981",
                  color: "#fff",
                  padding: "8px 14px",
                  borderRadius: 12,
                  marginTop: 14,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 13
                }}
              >
                Tautan disalin ke papan klip!
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginTop: 22,
                flexWrap: "wrap"
              }}
            >
              <button className="ghost" onClick={() => navigateTo("camera")}>
                <RotateCcw size={16} style={{ marginRight: 6 }} /> Retake
              </button>

              <button
                className="primary"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = final;
                  a.download = `tritech-memories-${major.short.toLowerCase()}-2026.png`;
                  a.click();
                }}
              >
                <Download size={16} style={{ marginRight: 6 }} /> Download PNG
              </button>

              <button className="ghost" onClick={() => handleShare(final)}>
                <Share2 size={16} style={{ marginRight: 6 }} /> Share
              </button>

              <button className="ghost" onClick={() => window.print()}>
                <Printer size={16} style={{ marginRight: 6 }} /> Cetak
              </button>
            </div>
          </div>
        </>
      )}

      {/* STAGE: GALLERY */}
      {stage === "gallery" && (
        <>
          <div className="page-head">
            <div>
              <h1>Galeri Kenangan</h1>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                {gallery.length} photostrip tersimpan di perangkat ini
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {gallery.length > 0 && (
                <button
                  className="ghost"
                  onClick={clearAllGallery}
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 size={16} style={{ marginRight: 4 }} /> Hapus Semua
                </button>
              )}
              <button className="primary" onClick={() => navigateTo("major")}>
                + Foto Baru
              </button>
            </div>
          </div>

          {gallery.length > 0 ? (
            <div className="gallery">
              {gallery.map((p, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                    background: "#fff"
                  }}
                  onClick={() => setSelectedGalleryPhoto(p)}
                >
                  <img
                    src={p}
                    alt={`Saved Photostrip ${i + 1}`}
                    style={{ width: "100%", display: "block", aspectRatio: "9/16", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      background: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "4px 8px",
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <Eye size={12} /> Buka
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel empty">
              <Images size={48} style={{ color: "var(--muted)", marginBottom: 12 }} />
              <h3>Belum ada photostrip yang disimpan</h3>
              <p style={{ maxWidth: 380, margin: "0 auto 20px" }}>
                Ayo mulai sesi photobooth pertamamu sekarang dan rayakan masa sekolah di SMK Tritech!
              </p>
              <button className="primary" onClick={() => navigateTo("major")}>
                Mulai Photobooth Sekarang
              </button>
            </div>
          )}

          {/* Modal Viewer */}
          {selectedGalleryPhoto && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                zIndex: 100,
                display: "grid",
                placeItems: "center",
                padding: 16
              }}
              onClick={() => setSelectedGalleryPhoto(null)}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  maxWidth: 440,
                  width: "100%",
                  maxHeight: "90vh",
                  overflow: "auto",
                  padding: 20,
                  position: "relative"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    border: "none",
                    background: "#f1f2f8",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedGalleryPhoto(null)}
                >
                  <X size={18} />
                </button>

                <h3 style={{ margin: "0 0 16px" }}>Detail Photostrip</h3>
                <img
                  src={selectedGalleryPhoto}
                  alt="Full preview"
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    display: "block",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 18,
                    flexWrap: "wrap",
                    justifyContent: "center"
                  }}
                >
                  <button
                    className="primary"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = selectedGalleryPhoto;
                      a.download = "tritech-memories-2026.png";
                      a.click();
                    }}
                  >
                    <Download size={15} style={{ marginRight: 6 }} /> Unduh PNG
                  </button>
                  <button
                    className="ghost"
                    onClick={() => handleShare(selectedGalleryPhoto)}
                  >
                    <Share2 size={15} style={{ marginRight: 6 }} /> Share
                  </button>
                  <button
                    className="ghost"
                    onClick={() => deleteGalleryPhoto(selectedGalleryPhoto)}
                    style={{ color: "#ef4444" }}
                  >
                    <Trash2 size={15} style={{ marginRight: 6 }} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
