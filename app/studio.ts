export type MajorId = "rpl" | "dkv" | "tkj";
export type LayoutId = "solo" | "duo" | "strip" | "grid";
export type CaptureId = "manual" | "auto";
export type PaperId = "signature" | "confetti" | "midnight";
export type FrameId = "cotton" | "blue" | "midnight" | "lavender";
export type FilterId = "original" | "mono" | "warm" | "cool" | "soft";
export type BucinStyle = "none" | "love" | "date" | "letter";

export const majors = [
  { id: "rpl", code: "RPL", name: "Rekayasa Perangkat Lunak", line: "For the ones who build what comes next.", color: "#2255dc", light: "#e3ebff", dark: "#11286e", symbol: "</>" },
  { id: "dkv", code: "DKV", name: "Desain Komunikasi Visual", line: "For ideas that refuse to stay quiet.", color: "#e15189", light: "#ffe3ee", dark: "#85264e", symbol: "✳" },
  { id: "tkj", code: "TKJ", name: "Teknik Komputer dan Jaringan", line: "For the connections behind every story.", color: "#315875", light: "#e0eaf1", dark: "#142b3e", symbol: "◎" },
] as const;

export const layouts = [
  { id: "solo", title: "Solo", count: 1, detail: "Satu foto, satu momen", size: "1080 × 1350" },
  { id: "duo", title: "Duo", count: 2, detail: "Dua pose berurutan", size: "1080 × 1350" },
  { id: "strip", title: "Photostrip", count: 4, detail: "Empat pose klasik", size: "1080 × 1920" },
  { id: "grid", title: "Kolase", count: 4, detail: "Empat foto, satu cerita", size: "1080 × 1350" },
] as const;

export const papers = [
  { id: "signature", label: "Signature" },
  { id: "confetti", label: "Confetti" },
  { id: "midnight", label: "Midnight" },
] as const;

export const frames = [
  { id: "cotton", label: "Cotton Candy" },
  { id: "blue", label: "Blue Dream" },
  { id: "midnight", label: "Midnight" },
  { id: "lavender", label: "Lavender Pop" },
] as const;

export const filters = [
  { id: "original", label: "Original" },
  { id: "mono", label: "Mono" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "soft", label: "Soft" },
] as const;

export function getMajor(id: MajorId) { return majors.find(item => item.id === id) ?? majors[0]; }
export function getLayout(id: LayoutId) { return layouts.find(item => item.id === id) ?? layouts[2]; }
