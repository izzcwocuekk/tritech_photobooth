import { getLayout, getMajor, type BucinStyle, type FilterId, type FrameId, type LayoutId, type MajorId, type PaperId } from "./studio";

export type RenderOptions = {
  photos: string[];
  major: MajorId;
  layout: LayoutId;
  paper: PaperId;
  frame: FrameId;
  filter: FilterId;
  date: Date;
  bucinStyle?: BucinStyle;
  coupleA?: string;
  coupleB?: string;
  loveNote?: string;
  className?: string;
};

const font = (size: number, weight = 700) => `${weight} ${size}px Arial, sans-serif`;

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Salah satu foto tidak dapat dibuka."));
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale, sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function colorFilter(filter: FilterId) {
  return { original: "none", mono: "grayscale(1) contrast(1.08)", warm: "sepia(.34) saturate(1.15)", cool: "saturate(.9) hue-rotate(12deg)", soft: "contrast(.89) brightness(1.1) saturate(.94)" }[filter];
}

function frameColors(frame: FrameId) {
  return {
    cotton: { accent: "#ef8caf", ink: "#7e3156", decoration: "♥" },
    blue: { accent: "#8db9ef", ink: "#244875", decoration: "✦" },
    midnight: { accent: "#d9dceb", ink: "#f7f8ff", decoration: "·" },
    lavender: { accent: "#b19ae7", ink: "#5d477f", decoration: "✧" },
  }[frame];
}

export async function renderPhoto(options: RenderOptions): Promise<Blob> {
  const layout = getLayout(options.layout);
  if (options.photos.length !== layout.count) throw new Error(`Format ${layout.title} memerlukan ${layout.count} foto.`);
  const images = await Promise.all(options.photos.map(loadImage));
  const major = getMajor(options.major);
  const frameColorset = frameColors(options.frame);
  const bucin = options.bucinStyle && options.bucinStyle !== "none";
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = options.layout === "strip" ? 1920 : 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia pada perangkat ini.");
  const height = canvas.height;

  if (options.paper === "midnight" || options.frame === "midnight") {
    ctx.fillStyle = major.dark; ctx.fillRect(0, 0, 1080, height);
  } else if (options.paper === "confetti") {
    ctx.fillStyle = major.light; ctx.fillRect(0, 0, 1080, height);
    ctx.fillStyle = major.color;
    for (let i = 0; i < 85; i++) {
      const x = (i * 191 + 41) % 1080, y = (i * 317 + 71) % height;
      ctx.save(); ctx.translate(x, y); ctx.rotate((i % 5) * .35); ctx.fillRect(-3, -10, 6, 20); ctx.restore();
    }
  } else {
    ctx.fillStyle = "#f8f4eb"; ctx.fillRect(0, 0, 1080, height);
    ctx.fillStyle = frameColorset.accent; ctx.fillRect(0, 0, 28, height);
    ctx.globalAlpha = .07; ctx.fillStyle = major.dark;
    for (let x = 48; x < 1080; x += 30) for (let y = 20; y < height; y += 30) { ctx.beginPath(); ctx.arc(x, y, 1.7, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  }

  const dark = options.paper === "midnight" || options.frame === "midnight";
  ctx.textBaseline = "middle";
  ctx.fillStyle = dark ? "#ffffff" : frameColorset.ink;
  ctx.textAlign = "left";
  ctx.font = font(50, 900);
  ctx.fillText("TRITECH", 82, 78);
  ctx.font = font(25, 700);
  ctx.fillText("PHOTOBOOTH  /  JURUSAN EDITION", 84, 122);
  ctx.textAlign = "right";
  ctx.font = font(30, 900);
  ctx.fillText(major.code, 998, 82);
  if (bucin) {
    ctx.textAlign = "center";
    ctx.fillStyle = options.paper === "midnight" ? "#ffd6e5" : "#bd3e6d";
    ctx.font = font(22, 800);
    ctx.fillText("♡  OUR LITTLE MEMORY  ♡", 540, 145);
  }
  ctx.textAlign = "left";
  ctx.fillStyle = dark ? "#ffffff" : frameColorset.accent;
  ctx.font = font(28, 900);
  ctx.fillText(frameColorset.decoration, 47, 75);
  ctx.textAlign = "right";
  ctx.fillText(frameColorset.decoration, 1033, 75);

  const rects: Array<[number, number, number, number]> = options.layout === "strip"
    ? [[80, 164, 920, 360], [80, 548, 920, 360], [80, 932, 920, 360], [80, 1316, 920, 360]]
    : options.layout === "grid"
      ? [[80, 174, 445, 450], [555, 174, 445, 450], [80, 654, 445, 450], [555, 654, 445, 450]]
      : options.layout === "duo"
        ? [[80, 172, 920, 460], [80, 662, 920, 460]]
        : [[80, 170, 920, 954]];

  rects.forEach(([x, y, w, h], index) => {
    ctx.save();
    ctx.fillStyle = dark ? "#ffffff" : frameColorset.accent;
    rounded(ctx, x - 7, y - 7, w + 14, h + 14, options.frame === "midnight" ? 7 : 22);
    ctx.fill();
    rounded(ctx, x, y, w, h, options.frame === "midnight" ? 3 : 16);
    ctx.clip();
    ctx.filter = colorFilter(options.filter);
    drawCover(ctx, images[index], x, y, w, h);
    ctx.restore();
    if (options.frame === "blue" || options.frame === "lavender") {
      ctx.save(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5; ctx.setLineDash([14, 12]);
      rounded(ctx, x + 20, y + 20, w - 40, h - 40, 9); ctx.stroke(); ctx.restore();
    }
    if (options.frame === "cotton" || options.frame === "lavender") {
      ctx.save(); ctx.fillStyle = frameColorset.accent; ctx.translate(x + w - 42, y + 40); ctx.rotate(.15);
      rounded(ctx, -64, -25, 128, 50, 12); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = font(22, 900); ctx.fillText(options.frame === "cotton" ? "♥" : "✧", 0, 2); ctx.restore();
    }
  });

  const footerY = height - 129;
  ctx.fillStyle = dark ? "#ffffff" : frameColorset.ink;
  ctx.textAlign = "left"; ctx.font = font(44, 900); ctx.fillText("MAKE IT A MEMORY.", 82, footerY);
  ctx.font = font(25, 700); ctx.fillText(major.name.toUpperCase(), 84, footerY + 49);
  if (options.className?.trim()) {
    ctx.font = font(21, 600);
    ctx.fillText(`KELAS ${options.className.trim().slice(0, 18).toUpperCase()}`, 84, footerY + 81);
  }
  ctx.textAlign = "right"; ctx.font = font(25, 700);
  ctx.fillText(new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(options.date), 997, footerY + 48);
  if (bucin) {
    ctx.textAlign = "center";
    ctx.fillStyle = dark ? "#ffd6e5" : "#bd3e6d";
    ctx.font = font(26, 800);
    const names = [options.coupleA?.trim(), options.coupleB?.trim()].filter(Boolean).join("  ×  ");
    if (names) ctx.fillText(names, 540, footerY - 28);
    if (options.loveNote?.trim()) {
      ctx.font = font(21, 600);
      ctx.fillText(`“${options.loveNote.trim().slice(0, 58)}”`, 540, footerY + 82);
    }
    ctx.font = font(28, 900);
    ctx.fillText("♥", 540, height - 24);
  }
  if (options.frame === "midnight") {
    ctx.save(); ctx.strokeStyle = dark ? "#ffffff" : frameColorset.accent; ctx.lineWidth = 3; ctx.setLineDash([13, 10]);
    ctx.beginPath(); ctx.moveTo(82, footerY - 48); ctx.lineTo(998, footerY - 48); ctx.stroke(); ctx.restore();
  }

  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG gagal dibuat.")), "image/png"));
}
