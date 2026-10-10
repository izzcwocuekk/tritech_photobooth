"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, CameraOff, Check, CircleHelp, Download, Grid2X2, Heart, Images, ImagePlus, RotateCcw, Share2, Sparkles, SwitchCamera, Timer, Trash2, X } from "lucide-react";
import { listPhotos, removePhoto, savePhoto, type SavedPhoto } from "./gallery-db";
import { renderPhoto } from "./render-photo";
import { filters, frames, getLayout, getMajor, layouts, majors, papers, type CaptureId, type FilterId, type FrameId, type LayoutId, type MajorId, type PaperId } from "./studio";

type Stage = "home" | "major" | "setup" | "camera" | "editor" | "result" | "gallery";
type GalleryItem = SavedPhoto & { url: string };
const stages: Stage[] = ["home", "major", "setup", "camera", "editor", "result", "gallery"];
const route = (stage: Stage) => stage === "home" ? "/" : `/${stage}/`;
function Mark() { return <span className="mark" aria-hidden="true"><i /><i /><i /><i /></span>; }
function FormatSketch({ layout }: { layout: LayoutId }) { return <span className={`format-sketch format-${layout}`} aria-hidden="true">{Array.from({ length: getLayout(layout).count }, (_, i) => <i key={i} />)}</span>; }
async function readImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("Foto tidak dapat dibaca.")); img.src = url; });
    const scale = Math.min(1, 1800 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .88);
  } finally { URL.revokeObjectURL(url); }
}

export default function Photobooth({ initial = "home" }: { initial?: string }) {
  const [stage, setStage] = useState<Stage>(stages.includes(initial as Stage) ? initial as Stage : "home");
  const [major, setMajor] = useState<MajorId>("rpl"), [layout, setLayout] = useState<LayoutId>("strip");
  const [captureMode, setCaptureMode] = useState<CaptureId>("auto"), [timer, setTimer] = useState<0 | 3 | 5>(3);
  const [paper, setPaper] = useState<PaperId>("signature"), [frame, setFrame] = useState<FrameId>("classic"), [filter, setFilter] = useState<FilterId>("original");
  const [photos, setPhotos] = useState<string[]>([]), photosRef = useRef<string[]>([]);
  const [cameraStatus, setCameraStatus] = useState<"loading" | "ready" | "error">("loading"), [cameraError, setCameraError] = useState("");
  const [cameraKey, setCameraKey] = useState(0), [facing, setFacing] = useState<"user" | "environment">("user");
  const [countdown, setCountdown] = useState<number | null>(null), [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(""), [resultUrl, setResultUrl] = useState(""), [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]), [galleryFilter, setGalleryFilter] = useState<"all" | MajorId>("all"), [toast, setToast] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null), streamRef = useRef<MediaStream | null>(null), cancelRef = useRef(false), busyRef = useRef(false);
  const needed = getLayout(layout).count, selectedMajor = getMajor(major);
  function navigate(to: Stage) { history.pushState({}, "", route(to)); setStage(to); window.scrollTo(0, 0); }
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 3600); }
  function resetPhotos() { cancelRef.current = true; photosRef.current = []; setPhotos([]); setCountdown(null); busyRef.current = false; setBusy(false); }

  useEffect(() => {
    const sync = () => { const name = location.pathname.split("/").filter(Boolean)[0] || "home"; setStage(stages.includes(name as Stage) ? name as Stage : "home"); };
    sync(); addEventListener("popstate", sync);
    try { const saved = JSON.parse(localStorage.getItem("tritech-settings") || "{}"); if (majors.some(item => item.id === saved.major)) setMajor(saved.major); if (layouts.some(item => item.id === saved.layout)) setLayout(saved.layout); } catch { /* Invalid old settings. */ }
    return () => removeEventListener("popstate", sync);
  }, []);
  useEffect(() => { localStorage.setItem("tritech-settings", JSON.stringify({ major, layout })); }, [major, layout]);
  useEffect(() => {
    if (stage !== "camera") { streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null; return; }
    cancelRef.current = false; let cancelled = false; let active: MediaStream | null = null; setCameraStatus("loading"); setCameraError("");
    const open = async () => {
      if (!navigator.mediaDevices?.getUserMedia) { setCameraStatus("error"); setCameraError("Browser ini belum mendukung kamera. Pakai foto dari galeri perangkat."); return; }
      try {
        active = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 1600 } }, audio: false });
        if (cancelled) { active.getTracks().forEach(track => track.stop()); return; }
        streamRef.current = active; if (videoRef.current) { videoRef.current.srcObject = active; await videoRef.current.play(); } setCameraStatus("ready");
      } catch (error) { if (!cancelled) { setCameraStatus("error"); setCameraError(error instanceof DOMException && error.name === "NotAllowedError" ? "Izin kamera ditolak. Izinkan kamera di browser atau pilih foto dari galeri." : "Kamera belum bisa dibuka. Periksa izin perangkat, lalu coba lagi."); } }
    }; void open();
    return () => { cancelled = true; cancelRef.current = true; active?.getTracks().forEach(track => track.stop()); if (streamRef.current === active) streamRef.current = null; };
  }, [stage, facing, cameraKey]);
  useEffect(() => {
    if (stage !== "editor" || photos.length !== needed) return;
    let cancelled = false, url = "";
    renderPhoto({ photos, major, layout, paper, frame, filter, date: new Date() }).then(blob => { if (!cancelled) { url = URL.createObjectURL(blob); setPreviewUrl(url); } }).catch(() => { if (!cancelled) setPreviewUrl(""); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [stage, photos, major, layout, paper, frame, filter, needed]);
  useEffect(() => {
    if (stage !== "gallery") return;
    let cancelled = false, urls: string[] = [];
    listPhotos().then(items => { if (!cancelled) { const mapped = items.map(item => ({ ...item, url: URL.createObjectURL(item.image) })); urls = mapped.map(item => item.url); setGallery(mapped); } }).catch(() => notify("Gallery belum dapat dibuka pada browser ini."));
    return () => { cancelled = true; urls.forEach(URL.revokeObjectURL); };
  }, [stage]);
  function chooseMajor(id: MajorId) { setMajor(id); resetPhotos(); navigate("setup"); }
  function begin() { resetPhotos(); setFacing("user"); navigate("camera"); }
  async function waitSeconds(seconds: number) { for (let n = seconds; n > 0; n--) { if (cancelRef.current) return false; setCountdown(n); await new Promise(resolve => setTimeout(resolve, 1000)); } setCountdown(null); return !cancelRef.current; }
  function snap() {
    const video = videoRef.current; if (!video || video.readyState < 2 || !video.videoWidth) throw new Error("Kamera belum siap. Coba lagi sebentar.");
    const canvas = document.createElement("canvas"), scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d")!; if (facing === "user") { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); } ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .88);
  }
  async function takeOne(seconds: number) {
    if (!await waitSeconds(seconds)) return false;
    const next = [...photosRef.current, snap()].slice(0, needed); photosRef.current = next; setPhotos(next);
    if (next.length === needed) navigate("editor"); return true;
  }
  async function capture() {
    if (busyRef.current || cameraStatus !== "ready") return;
    busyRef.current = true; setBusy(true); cancelRef.current = false;
    try { if (captureMode === "auto") { while (photosRef.current.length < needed && !cancelRef.current) { if (!await takeOne(timer || 3)) break; if (photosRef.current.length < needed) await new Promise(resolve => setTimeout(resolve, 500)); } } else await takeOne(timer); }
    catch (error) { notify(error instanceof Error ? error.message : "Foto gagal diambil."); }
    finally { busyRef.current = false; setBusy(false); setCountdown(null); }
  }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, needed - photosRef.current.length); event.target.value = ""; if (!files.length) return;
    try { const added = await Promise.all(files.map(readImage)); const next = [...photosRef.current, ...added].slice(0, needed); photosRef.current = next; setPhotos(next); if (next.length === needed) navigate("editor"); else notify(`${next.length} dari ${needed} foto siap. Tambah lagi atau gunakan kamera.`); }
    catch { notify("Ada foto yang gagal dibaca. Pilih JPG atau PNG."); }
  }
  async function finish() {
    if (busyRef.current) return; busyRef.current = true; setBusy(true);
    try { const blob = await renderPhoto({ photos, major, layout, paper, frame, filter, date: new Date() }); const record: SavedPhoto = { id: crypto.randomUUID(), createdAt: Date.now(), major, layout, paper, frame, image: blob };
      try { await savePhoto(record); } catch { notify("Gallery perangkat penuh. Unduh PNG hasil fotomu sekarang."); }
      setResultBlob(blob); setResultUrl(URL.createObjectURL(blob)); navigate("result");
    } catch (error) { notify(error instanceof Error ? error.message : "Hasil foto gagal dibuat."); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function download() { if (!resultBlob) return; const anchor = document.createElement("a"); anchor.href = resultUrl; anchor.download = `tritech-${major}-${layout}-${Date.now()}.png`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); }
  async function share() { if (!resultBlob) return; const file = new File([resultBlob], `tritech-${major}.png`, { type: "image/png" }); if (navigator.share && navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: "Tritech Photobooth", text: "Kenangan dari Tritech Photobooth" }); } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) notify("Gagal berbagi foto. Coba unduh PNG."); } } else { download(); notify("Perangkat ini belum mendukung berbagi file. PNG telah diunduh."); } }
  async function deleteItem(id: string) { if (!confirm("Hapus foto ini dari gallery perangkat?")) return; try { await removePhoto(id); setGallery(items => items.filter(item => item.id !== id)); notify("Foto dihapus dari gallery."); } catch { notify("Foto belum dapat dihapus."); } }
  function openItem(item: GalleryItem) { setMajor(item.major); setLayout(item.layout); setPaper(item.paper); setFrame(item.frame); setResultBlob(item.image); setResultUrl(URL.createObjectURL(item.image)); navigate("result"); }

  const nav = <header className="site-header"><button className="logo" onClick={() => navigate("home")}><Mark /><span>TRITECH<small>PHOTOBOOTH</small></span></button><nav className="desktop-nav"><button onClick={() => navigate("home")}>Beranda</button><button onClick={() => navigate("major")}>Mulai foto</button><button onClick={() => navigate("gallery")}>Gallery</button></nav><button className="header-gallery" onClick={() => navigate("gallery")}><Images size={18} /><span>Gallery</span></button></header>;
  const bottom = <nav className="bottom-nav"><button className={stage === "home" ? "active" : ""} onClick={() => navigate("home")}><Mark /><span>Beranda</span></button><button className={stage !== "home" && stage !== "gallery" ? "active" : ""} onClick={() => navigate("major")}><Camera size={20} /><span>Foto</span></button><button className={stage === "gallery" ? "active" : ""} onClick={() => navigate("gallery")}><Images size={20} /><span>Gallery</span></button></nav>;
  const actionButton = <button className="button button-primary" onClick={() => navigate("major")}>Mulai photobooth <ArrowRight size={19} /></button>;
  let content: React.ReactNode;
  if (stage === "home") { content = <>
    <section className="hero"><div className="hero-copy"><div className="eyebrow"><span /> DIGITAL PHOTO STUDIO · SMK TRITECH</div><h1>Hari ini<br />jadi <em>kenangan.</em></h1><p>Pilih jurusanmu, ambil foto dengan caramu, lalu simpan momen yang pantas dikenang.</p><div className="hero-actions">{actionButton}<small>Gratis · langsung dari browser</small></div><div className="hero-proof"><span>01 / PILIH JURUSAN</span><span>02 / AMBIL FOTO</span><span>03 / SIMPAN</span></div></div><div className="hero-art"><div className="art-disc" /><span className="art-note">your story,<br />your frame.</span><div className="art-strip"><div className="art-strip-head">TRITECH / 2026</div>{["01", "02", "03", "04"].map((n, i) => <div className={`art-shot shot-${i + 1}`} key={n}><span>{n}</span></div>)}<div className="art-strip-foot">MAKE IT A MEMORY. <b>✳</b></div></div><span className="art-sticker">RPL<br />DKV<br />TKJ</span></div></section>
    <section className="home-section"><div className="section-heading"><div><span className="kicker">DIBUAT UNTUK KAMU</span><h2>Satu studio. Banyak cerita.</h2></div><span className="section-aside">Tidak perlu daftar akun.</span></div><div className="feature-grid"><article><span>01</span><Camera size={27} /><h3>Foto sesukamu</h3><p>Selfie sendiri, bareng teman, manual, otomatis, atau pakai foto dari galeri.</p></article><article><span>02</span><Grid2X2 size={27} /><h3>Pilih format</h3><p>Solo, duo, photostrip, dan kolase. Setiap format siap dijadikan PNG.</p></article><article><span>03</span><Heart size={27} /><h3>Simpan momennya</h3><p>Atur gaya sesuai jurusanmu, lalu unduh dan bagikan hasilnya.</p></article></div></section><section className="home-banner"><span>YOUR MEMORY STARTS HERE</span><h2>Siap buat cerita baru?</h2>{actionButton}</section>
  </>; }
   else if (stage === "major") { content = <section className="flow-page"><div className="flow-top"><span className="kicker">LANGKAH 01 / 03</span><button className="text-back" onClick={() => navigate("home")}><ArrowLeft size={16} /> Beranda</button></div><div className="page-intro"><h1>Jurusan kamu,<br /><em>cerita kamu.</em></h1><p>Pilih satu untuk menentukan warna dan identitas pada hasil fotomu.</p></div><div className="major-grid">{majors.map((item, i) => <button className={`major-tile major-${item.id}`} key={item.id} onClick={() => chooseMajor(item.id)}><div className="major-tile-top"><span>0{i + 1} / JURUSAN</span><ArrowRight size={21} /></div><strong className="major-symbol">{item.symbol}</strong><b>{item.code}</b><small>{item.name}</small><em>{item.line}</em></button>)}</div></section>; }
   else if (stage === "setup") { content = <section className="flow-page"><div className="flow-top"><span className="kicker">LANGKAH 02 / 03</span><button className="text-back" onClick={() => navigate("major")}><ArrowLeft size={16} /> Ganti jurusan</button></div><div className="page-intro"><h1>Mulai dari <em>formatnya.</em></h1><p>Mau foto sendiri atau ramai-ramai? Pilih tata letak, lalu cara mengambil fotonya.</p></div><div className="setup-grid"><div className="setup-main"><div className="mini-heading"><span>01</span><h2>Format foto</h2></div><div className="format-grid">{layouts.map(item => <button className={`format-card ${layout === item.id ? "selected" : ""}`} key={item.id} onClick={() => { setLayout(item.id); resetPhotos(); }}><FormatSketch layout={item.id} /><span><b>{item.title}</b><small>{item.detail}</small></span><i>{item.count} FOTO</i></button>)}</div><div className="mini-heading second"><span>02</span><h2>Cara ambil foto</h2></div><div className="capture-options"><button className={captureMode === "auto" ? "selected" : ""} onClick={() => { setCaptureMode("auto"); setTimer(3); }}><Timer size={22} /><span><b>Otomatis</b><small>Hitung mundur tiap pose</small></span><i /></button><button className={captureMode === "manual" ? "selected" : ""} onClick={() => { setCaptureMode("manual"); setTimer(0); }}><Camera size={22} /><span><b>Manual</b><small>Tekan tombol untuk setiap foto</small></span><i /></button></div><button className="button button-primary setup-next" onClick={begin}>Buka kamera <ArrowRight size={19} /></button></div><aside className="setup-aside"><span>SESI KAMU</span><b>{selectedMajor.code} / {getLayout(layout).title}</b><div><FormatSketch layout={layout} /></div><p>{needed} foto · {getLayout(layout).size} px<br />{captureMode === "auto" ? "Pengambilan otomatis" : "Pengambilan manual"}</p><small><CircleHelp size={15} /> Kamu juga bisa memilih foto dari perangkat.</small></aside></div></section>; }
   else if (stage === "camera") { content = <section className="camera-page"><div className="camera-head"><button className="text-back" onClick={() => navigate("setup")}><ArrowLeft size={17} /> Kembali</button><span>{selectedMajor.code} / {getLayout(layout).title.toUpperCase()}</span><b>{photos.length} / {needed}</b></div><div className="camera-layout"><div className="camera-stage"><div className="camera-feed"><video ref={videoRef} playsInline muted autoPlay className={facing === "user" ? "mirror" : ""} /><div className="camera-corners"><i /><i /><i /><i /></div>{cameraStatus !== "ready" && <div className="camera-message">{cameraStatus === "loading" ? <><Camera size={34} /><b>Membuka kamera...</b></> : <><CameraOff size={34} /><b>Kamera belum tersedia</b><p>{cameraError}</p><button className="button button-light" onClick={() => setCameraKey(n => n + 1)}>Coba lagi</button></>}</div>}{countdown !== null && <div className="countdown-overlay"><span>POSE BERIKUTNYA</span><b>{countdown}</b><small>Siap-siap senyum!</small></div>}<span className="camera-watermark">TRITECH / LIVE</span></div><div className="camera-toolbar"><button className="icon-action" onClick={() => setFacing(value => value === "user" ? "environment" : "user")} disabled={busy}><SwitchCamera size={23} /><span>Balik</span></button><button className="shutter" onClick={capture} disabled={busy || cameraStatus !== "ready"}><i /></button><label className="icon-action"><ImagePlus size={23} /><span>Galeri</span><input type="file" accept="image/*" multiple onChange={upload} /></label></div></div><aside className="camera-side"><span className="kicker">SESI FOTO</span><h1>{captureMode === "auto" ? "Ambil otomatis." : "Ambil sendiri."}</h1><p>{captureMode === "auto" ? `Kamera akan mengambil ${needed} foto berurutan. Ganti pose di setiap hitungan.` : `Tekan tombol shutter untuk setiap foto. Butuh ${needed} foto untuk format ini.`}</p><div className="timer-row"><span>Timer</span><div>{([0, 3, 5] as const).filter(value => captureMode === "manual" || value !== 0).map(value => <button key={value} className={timer === value ? "selected" : ""} onClick={() => setTimer(value)} disabled={busy}>{value === 0 ? "Off" : `${value}s`}</button>)}</div></div><div className="captured-row">{Array.from({ length: needed }, (_, i) => <span key={i}>{photos[i] ? <img src={photos[i]} alt={`Foto ${i + 1}`} /> : <small>{String(i + 1).padStart(2, "0")}</small>}</span>)}</div>{busy ? <button className="button button-outline full" onClick={() => { cancelRef.current = true; setCountdown(null); }}>Hentikan sesi <X size={16} /></button> : <button className="button button-outline full" onClick={resetPhotos} disabled={!photos.length}>Ulang dari awal <RotateCcw size={16} /></button>}<small className="camera-help">Jika kamera tidak tersedia, pilih foto dari galeri perangkat.</small></aside></div></section>; }
   else if (stage === "editor") { content = photos.length !== needed ? <div className="fallback"><h1>Foto belum lengkap.</h1><p>Lengkapi {needed} foto untuk membuat {getLayout(layout).title.toLowerCase()}.</p><button className="button button-primary" onClick={() => navigate("camera")}>Kembali ke kamera <ArrowRight size={18} /></button></div> : <section className="editor-page"><div className="flow-top"><span className="kicker">LANGKAH 03 / 03</span><button className="text-back" onClick={() => { resetPhotos(); navigate("camera"); }}><ArrowLeft size={16} /> Ambil ulang</button></div><div className="page-intro compact"><h1>Bikin jadi <em>punyamu.</em></h1><p>Atur warna, bingkai, dan nuansa sebelum kamu simpan.</p></div><div className="editor-layout"><div className="editor-preview"><div className="preview-top"><span>PRATINJAU HASIL</span><span>{getLayout(layout).size} PX</span></div>{previewUrl ? <img src={previewUrl} alt="Pratinjau hasil foto" /> : <div className="preview-loading">Menyiapkan pratinjau...</div>}<small>Tampilan ini sama dengan PNG yang akan diunduh.</small></div><div className="editor-controls"><section><div className="control-head"><span>01</span><h2>Latar kertas</h2></div><p>Warna di sekitar foto, tanpa mengubah foto asli.</p><div className="paper-grid">{papers.map(item => <button className={paper === item.id ? "selected" : ""} key={item.id} onClick={() => setPaper(item.id)}><i className={`paper-swatch paper-${item.id}`} style={{ "--major-color": selectedMajor.color, "--major-light": selectedMajor.light, "--major-dark": selectedMajor.dark } as React.CSSProperties} /><b>{item.label}</b>{paper === item.id && <Check size={15} />}</button>)}</div></section><section><div className="control-head"><span>02</span><h2>Bingkai</h2></div><div className="pill-row">{frames.map(item => <button className={frame === item.id ? "selected" : ""} key={item.id} onClick={() => setFrame(item.id)}>{item.label}</button>)}</div></section><section><div className="control-head"><span>03</span><h2>Filter foto</h2></div><div className="pill-row">{filters.map(item => <button className={filter === item.id ? "selected" : ""} key={item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div></section><button className="button button-primary full" onClick={finish} disabled={busy}>{busy ? "Membuat PNG..." : "Lihat hasil foto"} <ArrowRight size={18} /></button></div></div></section>; }
   else if (stage === "result") { content = !resultBlob ? <div className="fallback"><h1>Belum ada hasil foto.</h1><p>Mulai sesi baru untuk membuat kenangan pertamamu.</p>{actionButton}</div> : <section className="result-page"><div className="result-copy"><span className="kicker">SESI SELESAI</span><Sparkles size={34} /><h1>Ini dia<br /><em>momenmu.</em></h1><p>Hasil fotomu siap disimpan dan dibagikan langsung ke teman.</p><div className="result-actions"><button className="button button-primary" onClick={download}><Download size={18} /> Download PNG</button><button className="button button-outline" onClick={share}><Share2 size={18} /> Bagikan foto</button></div><button className="result-retake" onClick={() => { resetPhotos(); navigate("camera"); }}><RotateCcw size={15} /> Foto lagi dengan format yang sama</button></div><div className="result-art"><img src={resultUrl} alt="Hasil foto Tritech Photobooth" /></div></section>; }
   else { const shown = gallery.filter(item => galleryFilter === "all" || item.major === galleryFilter); content = <section className="gallery-page"><div className="gallery-heading"><div><span className="kicker">KOLEKSI PRIBADI</span><h1>Gallery <em>kenangan.</em></h1><p>Foto tersimpan di perangkat ini. Pilih foto untuk mengunduh atau membagikannya.</p></div>{actionButton}</div><div className="gallery-tabs">{([{ id: "all", label: "Semua" }, ...majors.map(item => ({ id: item.id, label: item.code }))] as const).map(item => <button className={galleryFilter === item.id ? "selected" : ""} key={item.id} onClick={() => setGalleryFilter(item.id as "all" | MajorId)}>{item.label}</button>)}</div>{shown.length ? <div className="gallery-grid">{shown.map(item => <article className="gallery-card" key={item.id}><button className="gallery-image" onClick={() => openItem(item)}><img src={item.url} alt={`Foto ${getMajor(item.major).code}`} /></button><div><span><b>{getLayout(item.layout).title}</b><small>{getMajor(item.major).code} · {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(item.createdAt)}</small></span><button onClick={() => deleteItem(item.id)} aria-label="Hapus foto"><Trash2 size={17} /></button></div></article>)}</div> : <div className="gallery-empty"><Images size={36} /><h2>Belum ada foto di sini.</h2><p>Mulai sesi photobooth untuk mengisi gallery pribadimu.</p>{actionButton}</div>}</section>; }
  return <div className="app-shell">{nav}<main>{content}</main><footer className="site-footer"><span>© 2026 TRITECH PHOTOBOOTH</span><span>MADE FOR SCHOOL MEMORIES <Mark /></span></footer>{bottom}{toast && <div className="toast" role="status">{toast}</div>}</div>;
}




