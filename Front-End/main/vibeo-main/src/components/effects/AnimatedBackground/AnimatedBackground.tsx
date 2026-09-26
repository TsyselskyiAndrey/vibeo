"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/features/theme/hooks/useTheme";
import styles from "./AnimatedBackground.module.css";

export const VARIANTS = [
  "organic",
  "topo",
  "layers",
  "silk",
  "flow",
  "arcs",
  "blobs",
  "aurora",
  "mesh",
  "bubbles",
  "dotwave",
  "constellation",
  "hexgrid",
  "dotfield",
  "liquid",
  "caustics",
  "lowpoly",
  "glass",
] as const;

export type Variant = (typeof VARIANTS)[number];

const PALETTES = {
  light: {
    bgFrom: "#f3faff",
    bgMid: "#dcf0fd",
    bgTo: "#c4e4fa",
    halos: [
      { x: 0.08, y: 0.05, rgb: "255, 255, 255", a: 0.85, r: 0.75 },
      { x: 0.95, y: 0.08, rgb: "103, 232, 249", a: 0.45, r: 0.7 },
      { x: 0.5, y: 0.5, rgb: "125, 211, 252", a: 0.28, r: 0.6 },
      { x: 0.05, y: 0.88, rgb: "96, 165, 250", a: 0.32, r: 0.65 },
      { x: 0.88, y: 0.94, rgb: "34, 211, 238", a: 0.28, r: 0.75 },
    ],
    fill: "rgba(14, 165, 233, 0.12)",
    primary: "rgba(2, 110, 190, 0.72)",
    secondary: "rgba(255, 255, 255, 0.9)",
    tertiary: "rgba(14, 165, 233, 0.38)",
    layers: ["rgba(14, 150, 230, 0.18)", "rgba(14, 150, 230, 0.13)", "rgba(14, 150, 230, 0.09)", "rgba(14, 150, 230, 0.05)"],
    glow: ["56, 189, 248", "34, 211, 238", "59, 130, 246", "6, 182, 212"],
    glowAlpha: 0.4,
    dot: "2, 132, 199",
    line: "2, 132, 199",
    polyA: [244, 251, 255],
    polyB: [125, 195, 245],
  },
  dark: {
    bgFrom: "#080d1c",
    bgMid: "#0a1023",
    bgTo: "#0b1226",
    halos: [
      { x: 0.15, y: 0.1, rgb: "56, 130, 246", a: 0.1, r: 0.7 },
      { x: 0.9, y: 0.95, rgb: "99, 102, 241", a: 0.09, r: 0.7 },
    ],
    fill: "rgba(56, 189, 248, 0.07)",
    primary: "rgba(56, 189, 248, 0.85)",
    secondary: "rgba(186, 230, 253, 0.4)",
    tertiary: "rgba(148, 163, 184, 0.3)",
    layers: ["rgba(56, 189, 248, 0.10)", "rgba(56, 189, 248, 0.07)", "rgba(56, 189, 248, 0.05)", "rgba(56, 189, 248, 0.03)"],
    glow: ["56, 130, 246", "56, 189, 248", "99, 102, 241", "14, 165, 233"],
    glowAlpha: 0.22,
    dot: "56, 189, 248",
    line: "56, 189, 248",
    polyA: [10, 17, 38],
    polyB: [24, 56, 108],
  },
};

const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(", ")})`;

type Palette = typeof PALETTES.light;
type Pt = { x: number; y: number };
type LineKind = "primary" | "secondary" | "tertiary";

type OrganicRibbon = {
  baseX: number;
  baseW: number;
  ampX: number;
  f1: number;
  s1: number;
  p1: number;
  f2: number;
  s2: number;
  p2: number;
  lines: { k: number; kind: LineKind; w: number }[];
};

type OrganicBlob = {
  cx: number;
  cy: number;
  R: number;
  sx: number;
  sy: number;
  p: number;
  rings: number[];
};

const ORGANIC_RIBBONS: OrganicRibbon[] = [
  {
    baseX: 0.8,
    baseW: 0.16,
    ampX: 0.09,
    f1: 1.6,
    s1: 0.5,
    p1: 0.4,
    f2: 3.4,
    s2: 0.35,
    p2: 2.1,
    lines: [
      { k: -0.5, kind: "primary", w: 2.2 },
      { k: -0.22, kind: "secondary", w: 1.6 },
      { k: -0.08, kind: "secondary", w: 1.4 },
      { k: 0.08, kind: "secondary", w: 1.2 },
    ],
  },
  {
    baseX: 0.13,
    baseW: 0.11,
    ampX: 0.07,
    f1: 1.3,
    s1: 0.4,
    p1: 3.2,
    f2: 3.0,
    s2: 0.3,
    p2: 0.8,
    lines: [
      { k: 0.5, kind: "primary", w: 2 },
      { k: -0.6, kind: "tertiary", w: 1.2 },
      { k: -0.75, kind: "tertiary", w: 1.2 },
      { k: -0.9, kind: "tertiary", w: 1 },
    ],
  },
];

const ORGANIC_BLOBS: OrganicBlob[] = [
  { cx: 0.62, cy: 0.05, R: 0.2, sx: 0.35, sy: 0.3, p: 0.5, rings: [1.07, 1.14] },
  { cx: 0.05, cy: 0.95, R: 0.22, sx: 0.3, sy: 0.4, p: 2.4, rings: [1.08, 1.16] },
];

const TOPO_CENTERS = [
  { x: 0.15, y: 0.3, ph: 0.4 },
  { x: 0.85, y: 0.75, ph: 2.6 },
];
const TOPO_RINGS = 14;

const LAYER_ROWS = 4;

const SILK_LINES = 42;

const FLOW_STEPS = 30;
const FLOW_STEP_LEN = 7;

const ARC_CENTERS = [
  { x: 0.92, y: 0.1, dir: 1, ph: 0.3 },
  { x: 0.06, y: 0.92, dir: -1, ph: 2.2 },
];
const ARC_RINGS = 7;

const SOFT_BLOBS = [
  { x: 0.1, y: 0.25, R: 0.26, ph: 0.6 },
  { x: 0.88, y: 0.7, R: 0.3, ph: 2.9 },
  { x: 0.55, y: 1.02, R: 0.2, ph: 4.4 },
];

const GLOWS = [
  { x: 0.15, y: 0.25, R: 0.55, sx: 0.22, sy: 0.18, ph: 0.4 },
  { x: 0.85, y: 0.3, R: 0.5, sx: 0.17, sy: 0.25, ph: 2.1 },
  { x: 0.5, y: 0.85, R: 0.6, sx: 0.2, sy: 0.15, ph: 3.7 },
  { x: 0.7, y: 0.6, R: 0.4, sx: 0.28, sy: 0.22, ph: 5.2 },
];

const MESH_ROWS = 20;
const MESH_COLS = 28;

const MS_TABLE: number[][] = [
  [],
  [3, 0],
  [0, 1],
  [3, 1],
  [1, 2],
  [3, 0, 1, 2],
  [0, 2],
  [3, 2],
  [3, 2],
  [0, 2],
  [0, 1, 3, 2],
  [1, 2],
  [3, 1],
  [0, 1],
  [3, 0],
  [],
];

const LIQUID_BALLS = [
  { x: 0.25, y: 0.35, r: 0.15, sx: 0.31, sy: 0.23, ph: 0.0 },
  { x: 0.7, y: 0.3, r: 0.13, sx: 0.27, sy: 0.35, ph: 1.7 },
  { x: 0.5, y: 0.7, r: 0.17, sx: 0.22, sy: 0.29, ph: 3.1 },
  { x: 0.85, y: 0.75, r: 0.12, sx: 0.36, sy: 0.25, ph: 4.4 },
  { x: 0.15, y: 0.8, r: 0.11, sx: 0.3, sy: 0.33, ph: 5.6 },
  { x: 0.4, y: 0.15, r: 0.1, sx: 0.33, sy: 0.27, ph: 2.4 },
];

const GLASS_ORBS = [
  { x: 0.18, y: 0.32, r: 0.22, ph: 0.4, sx: 0.21, sy: 0.17, c: 0 },
  { x: 0.82, y: 0.7, r: 0.24, ph: 2.2, sx: 0.17, sy: 0.22, c: 1 },
  { x: 0.55, y: 0.2, r: 0.14, ph: 4.1, sx: 0.25, sy: 0.19, c: 2 },
  { x: 0.4, y: 0.75, r: 0.16, ph: 1.3, sx: 0.19, sy: 0.24, c: 3 },
  { x: 0.9, y: 0.18, r: 0.1, ph: 3.3, sx: 0.28, sy: 0.2, c: 0 },
  { x: 0.08, y: 0.85, r: 0.09, ph: 5.2, sx: 0.23, sy: 0.27, c: 1 },
  { x: 0.68, y: 0.48, r: 0.07, ph: 0.9, sx: 0.3, sy: 0.26, c: 3 },
  { x: 0.3, y: 0.55, r: 0.05, ph: 2.8, sx: 0.32, sy: 0.29, c: 2 },
];

type Props = {
  variant?: Variant | "random";
  speed?: number;
};

export default function AnimatedBackground({ variant = "organic", speed = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const variantRef = useRef<Variant>(variant === "random" ? VARIANTS[0] : variant);
  const speedRef = useRef(speed);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    variantRef.current = variant === "random" ? VARIANTS[Math.floor(Math.random() * VARIANTS.length)] : variant;
  }, [variant]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let time = 0;
    let animationId: number;

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function tracePath(pts: Pt[], close = false) {
      ctx!.beginPath();
      pts.forEach((p, i) => (i ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y)));
      if (close) ctx!.closePath();
    }

    function ribbonOffsets(r: OrganicRibbon) {
      const N = 90;
      const center: Pt[] = [];
      const width: number[] = [];

      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const x =
          W *
          (r.baseX + r.ampX * Math.sin(t * r.f1 * Math.PI + time * r.s1 + r.p1) + r.ampX * 0.5 * Math.sin(t * r.f2 * Math.PI - time * r.s2 + r.p2));
        const y = (t * 1.3 - 0.15) * H;
        center.push({ x, y });
        width.push(W * r.baseW * (1 + 0.35 * Math.sin(t * 3 + time * 0.4 + r.p1)));
      }

      const normals = center.map((_, i) => {
        const a = center[Math.max(0, i - 1)];
        const b = center[Math.min(N, i + 1)];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        return { x: -dy / len, y: dx / len };
      });

      return (k: number): Pt[] =>
        center.map((c, i) => ({
          x: c.x + normals[i].x * width[i] * k,
          y: c.y + normals[i].y * width[i] * k,
        }));
    }

    function organicBlob(b: OrganicBlob, scale: number): Pt[] {
      const N = 120;
      const cx = W * (b.cx + Math.sin(time * b.sx + b.p) * 0.03);
      const cy = H * (b.cy + Math.cos(time * b.sy + b.p) * 0.03);
      const base = Math.min(W, H) * b.R * 1.6;
      const pts: Pt[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const r = base * scale * (1 + 0.18 * Math.sin(3 * a + time * 0.5 + b.p) + 0.1 * Math.sin(5 * a - time * 0.7 + b.p * 2));
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
      return pts;
    }

    function drawOrganic(pal: Palette) {
      for (const b of ORGANIC_BLOBS) {
        ctx!.fillStyle = pal.fill;
        tracePath(organicBlob(b, 1), true);
        ctx!.fill();

        ctx!.strokeStyle = pal.tertiary;
        ctx!.lineWidth = 1.2;
        for (const s of b.rings) {
          tracePath(organicBlob(b, s), true);
          ctx!.stroke();
        }
      }

      for (const r of ORGANIC_RIBBONS) {
        const offset = ribbonOffsets(r);
        const left = offset(-0.5);
        const right = offset(0.5).reverse();
        ctx!.fillStyle = pal.fill;
        tracePath([...left, ...right], true);
        ctx!.fill();

        for (const l of r.lines) {
          ctx!.strokeStyle = pal[l.kind];
          ctx!.lineWidth = l.w;
          tracePath(offset(l.k));
          ctx!.stroke();
        }
      }
    }

    function drawTopo(pal: Palette) {
      const N = 140;
      for (const c of TOPO_CENTERS) {
        const cx = W * (c.x + Math.sin(time * 0.3 + c.ph) * 0.02);
        const cy = H * (c.y + Math.cos(time * 0.25 + c.ph) * 0.02);

        for (let i = 0; i < TOPO_RINGS; i++) {
          const base = Math.min(W, H) * (0.05 + i * 0.05);
          ctx!.beginPath();
          for (let j = 0; j <= N; j++) {
            const a = (j / N) * Math.PI * 2;
            const r = base * (1 + 0.12 * Math.sin(3 * a + time * 0.4 + c.ph + i * 0.3) + 0.07 * Math.sin(5 * a - time * 0.5 + c.ph * 2 + i * 0.2));
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            j ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y);
          }
          ctx!.closePath();

          const accent = i % 5 === 0;
          ctx!.strokeStyle = accent ? pal.primary : pal.tertiary;
          ctx!.lineWidth = accent ? 1.8 : 1.1;
          ctx!.globalAlpha = Math.max(0.15, 1 - i / TOPO_RINGS);
          ctx!.stroke();
        }
      }
      ctx!.globalAlpha = 1;
    }

    function drawLayers(pal: Palette) {
      for (let i = 0; i < LAYER_ROWS; i++) {
        const baseY = H * (0.5 + i * 0.13);
        const amp = H * 0.06;
        const yAt = (x: number) =>
          baseY + Math.sin(x * 0.004 * (1 + i * 0.2) + time * (0.5 + i * 0.1) + i * 1.7) * amp + Math.sin(x * 0.009 - time * 0.4 + i) * amp * 0.4;

        ctx!.beginPath();
        ctx!.moveTo(0, H);
        for (let x = 0; x <= W + 8; x += 8) ctx!.lineTo(x, yAt(x));
        ctx!.lineTo(W, H);
        ctx!.closePath();
        ctx!.fillStyle = pal.layers[i % pal.layers.length];
        ctx!.fill();

        ctx!.beginPath();
        for (let x = 0; x <= W + 8; x += 8) {
          x ? ctx!.lineTo(x, yAt(x)) : ctx!.moveTo(x, yAt(x));
        }
        ctx!.strokeStyle = i === 0 ? pal.primary : pal.secondary;
        ctx!.lineWidth = i === 0 ? 1.8 : 1.4;
        ctx!.stroke();
      }
    }

    function drawSilk(pal: Palette) {
      for (let i = 0; i < SILK_LINES; i++) {
        const y0 = H * (-0.05 + (i / (SILK_LINES - 1)) * 1.1);

        ctx!.beginPath();
        for (let x = 0; x <= W + 10; x += 10) {
          const envelope = 0.5 + 0.5 * Math.sin(x * 0.0015 + time * 0.2);
          const y = y0 + Math.sin(x * 0.003 + time * 0.5 + i * 0.12) * H * 0.12 * envelope + Math.sin(x * 0.007 - time * 0.3 + i * 0.05) * H * 0.02;
          x ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y);
        }

        const accent = i % 10 === 0;
        ctx!.strokeStyle = accent ? pal.primary : pal.tertiary;
        ctx!.lineWidth = accent ? 1.6 : 1;
        ctx!.globalAlpha = accent ? 0.9 : 0.6;
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;
    }

    const flowSeeds = Array.from({ length: 260 }, () => ({
      x: Math.random() * 1.1 - 0.05,
      y: Math.random() * 1.1 - 0.05,
    }));

    function flowAngle(x: number, y: number) {
      return (Math.sin(x * 0.0035 + time * 0.3) + Math.cos(y * 0.0045 - time * 0.2) + Math.sin((x + y) * 0.0025 + time * 0.15)) * 1.2;
    }

    function drawFlow(pal: Palette) {
      flowSeeds.forEach((s, i) => {
        let x = s.x * W;
        let y = s.y * H;

        ctx!.beginPath();
        ctx!.moveTo(x, y);
        for (let k = 0; k < FLOW_STEPS; k++) {
          const a = flowAngle(x, y);
          x += Math.cos(a) * FLOW_STEP_LEN;
          y += Math.sin(a) * FLOW_STEP_LEN;
          ctx!.lineTo(x, y);
        }

        const accent = i % 9 === 0;
        ctx!.strokeStyle = accent ? pal.primary : pal.tertiary;
        ctx!.lineWidth = accent ? 1.7 : 1.1;
        ctx!.globalAlpha = accent ? 0.9 : 0.7;
        ctx!.stroke();
      });
      ctx!.globalAlpha = 1;
    }

    function drawArcs(pal: Palette) {
      const m = Math.min(W, H);
      const bandW = m * 0.035;

      for (const c of ARC_CENTERS) {
        const cx = W * c.x;
        const cy = H * c.y;

        for (let i = 0; i < ARC_RINGS; i++) {
          const r = m * (0.14 + i * 0.075) * (1 + 0.02 * Math.sin(time * 0.5 + i + c.ph));

          ctx!.beginPath();
          ctx!.arc(cx, cy, r, 0, Math.PI * 2);
          ctx!.strokeStyle = pal.layers[i % pal.layers.length];
          ctx!.lineWidth = bandW;
          ctx!.stroke();

          const a0 = time * 0.12 * c.dir * (i % 2 ? 1 : -1) + i * 0.9 + c.ph;
          const len = Math.PI * (1.1 + 0.35 * Math.sin(time * 0.3 + i));
          ctx!.beginPath();
          ctx!.arc(cx, cy, r + bandW * 0.5, a0, a0 + len);
          const accent = i % 3 === 0;
          ctx!.strokeStyle = accent ? pal.primary : pal.secondary;
          ctx!.lineWidth = accent ? 1.8 : 1.4;
          ctx!.stroke();
        }
      }
    }

    function softBlobPath(b: (typeof SOFT_BLOBS)[number], scale: number) {
      const N = 120;
      const cx = W * (b.x + Math.sin(time * 0.25 + b.ph) * 0.03);
      const cy = H * (b.y + Math.cos(time * 0.2 + b.ph) * 0.03);
      const base = Math.min(W, H) * b.R;

      ctx!.beginPath();
      for (let j = 0; j <= N; j++) {
        const a = (j / N) * Math.PI * 2;
        const r =
          base *
          scale *
          (1 + 0.2 * Math.sin(2 * a + time * 0.4 + b.ph) + 0.1 * Math.sin(4 * a - time * 0.6 + b.ph * 2) + 0.05 * Math.sin(7 * a + time * 0.8));
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        j ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y);
      }
      ctx!.closePath();
    }

    function drawBlobs(pal: Palette) {
      for (const b of SOFT_BLOBS) {
        softBlobPath(b, 1);
        ctx!.fillStyle = pal.fill;
        ctx!.fill();
        ctx!.strokeStyle = pal.primary;
        ctx!.lineWidth = 1.8;
        ctx!.stroke();

        softBlobPath(b, 0.86);
        ctx!.strokeStyle = pal.secondary;
        ctx!.lineWidth = 1.4;
        ctx!.stroke();

        ctx!.strokeStyle = pal.tertiary;
        ctx!.lineWidth = 1.1;
        for (const s of [1.08, 1.16, 1.24]) {
          softBlobPath(b, s);
          ctx!.stroke();
        }
      }
    }

    function drawAurora(pal: Palette) {
      const m = Math.max(W, H);
      GLOWS.forEach((g, i) => {
        const cx = W * (g.x + Math.sin(time * g.sx + g.ph) * 0.12);
        const cy = H * (g.y + Math.cos(time * g.sy + g.ph) * 0.12);
        const r = m * g.R * (1 + 0.1 * Math.sin(time * 0.4 + g.ph));
        const rgb = pal.glow[i % pal.glow.length];

        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${rgb}, ${pal.glowAlpha})`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, W, H);
      });
    }

    function warp(x: number, y: number): Pt {
      const amp = Math.min(W, H) * 0.035;
      return {
        x: x + Math.sin(y * 0.005 + time * 0.5 + x * 0.002) * amp,
        y: y + Math.cos(x * 0.005 + time * 0.4 + y * 0.002) * amp,
      };
    }

    function drawMesh(pal: Palette) {
      const S = 14;

      for (let i = 0; i <= MESH_ROWS; i++) {
        const y0 = (i / MESH_ROWS) * H;
        ctx!.beginPath();
        for (let x = -S; x <= W + S; x += S) {
          const p = warp(x, y0);
          x === -S ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y);
        }
        const accent = i % 5 === 0;
        ctx!.strokeStyle = accent ? pal.primary : pal.tertiary;
        ctx!.lineWidth = accent ? 1.6 : 1;
        ctx!.globalAlpha = accent ? 0.85 : 0.6;
        ctx!.stroke();
      }

      for (let i = 0; i <= MESH_COLS; i++) {
        const x0 = (i / MESH_COLS) * W;
        ctx!.beginPath();
        for (let y = -S; y <= H + S; y += S) {
          const p = warp(x0, y);
          y === -S ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y);
        }
        const accent = i % 7 === 0;
        ctx!.strokeStyle = accent ? pal.primary : pal.tertiary;
        ctx!.lineWidth = accent ? 1.6 : 1;
        ctx!.globalAlpha = accent ? 0.85 : 0.45;
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;
    }

    const bubbles = Array.from({ length: 36 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 10 + Math.random() * 46,
      v: 0.3 + Math.random() * 0.7,
      ph: Math.random() * Math.PI * 2,
    }));

    function drawBubbles(pal: Palette, isLight: boolean) {
      const rgb = pal.glow[0];
      for (const b of bubbles) {
        b.y -= b.v * 0.0004 * (1 + b.r / 60);
        if (b.y < -0.1) {
          b.y = 1.1;
          b.x = Math.random();
        }
        const x = (b.x + Math.sin(time * 0.4 + b.ph) * 0.02) * W;
        const y = b.y * H;

        const g = ctx!.createRadialGradient(x - b.r * 0.3, y - b.r * 0.3, 0, x, y, b.r);
        g.addColorStop(0, `rgba(${rgb}, ${isLight ? 0.05 : 0.02})`);
        g.addColorStop(1, `rgba(${rgb}, ${isLight ? 0.3 : 0.12})`);
        ctx!.beginPath();
        ctx!.arc(x, y, b.r, 0, Math.PI * 2);
        ctx!.fillStyle = g;
        ctx!.fill();

        ctx!.strokeStyle = pal.tertiary;
        ctx!.lineWidth = 1.2;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(x, y, b.r * 0.72, Math.PI * 1.1, Math.PI * 1.45);
        ctx!.strokeStyle = pal.secondary;
        ctx!.lineWidth = 1.8;
        ctx!.stroke();
      }
    }

    function drawDotWave(pal: Palette, isLight: boolean) {
      const gap = Math.max(26, Math.min(W, H) / 26);
      const cx = W / 2;
      const cy = H / 2;

      for (let x = gap / 2; x < W; x += gap) {
        for (let y = gap / 2; y < H; y += gap) {
          const d = Math.hypot(x - cx, y - cy);
          const w = 0.5 + 0.5 * Math.sin(d * 0.012 - time * 1.4);
          const w2 = 0.5 + 0.5 * Math.sin(x * 0.008 + y * 0.006 + time * 0.6);
          const s = w * 0.7 + w2 * 0.3;
          const r = 0.6 + s * gap * 0.22;

          ctx!.beginPath();
          ctx!.arc(x, y, r, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${pal.dot}, ${(isLight ? 0.15 : 0.1) + s * (isLight ? 0.45 : 0.3)})`;
          ctx!.fill();
        }
      }
    }

    const nodes = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      r: 1.6 + Math.random() * 2.2,
    }));

    function drawConstellation(pal: Palette) {
      const link = Math.min(W, H) * 0.2;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -0.05 || n.x > 1.05) n.vx *= -1;
        if (n.y < -0.05 || n.y > 1.05) n.vy *= -1;
      }

      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
          if (d < link) {
            ctx!.strokeStyle = `rgba(${pal.line}, ${(1 - d / link) * 0.55})`;
            ctx!.beginPath();
            ctx!.moveTo(a.x * W, a.y * H);
            ctx!.lineTo(b.x * W, b.y * H);
            ctx!.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx!.beginPath();
        ctx!.arc(n.x * W, n.y * H, n.r, 0, Math.PI * 2);
        ctx!.fillStyle = pal.primary;
        ctx!.fill();
      }
    }

    function hexPath(cx: number, cy: number, r: number) {
      ctx!.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k - Math.PI / 6;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        k ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y);
      }
      ctx!.closePath();
    }

    function drawHexGrid(pal: Palette) {
      const s = Math.max(28, Math.min(W, H) / 16);
      const dx = Math.sqrt(3) * s;
      const dy = 1.5 * s;

      for (let row = -1; row * dy < H + dy; row++) {
        const y = row * dy;
        for (let x = (row & 1 ? dx / 2 : 0) - dx; x < W + dx; x += dx) {
          const wave = 0.5 + 0.5 * Math.sin(x * 0.006 + y * 0.004 - time * 0.9);
          const wave2 = 0.5 + 0.5 * Math.sin(x * 0.003 - y * 0.007 + time * 0.5);
          const v = wave * 0.65 + wave2 * 0.35;
          const r = s * (0.55 + v * 0.4);

          hexPath(x, y, r);
          if (v > 0.72) {
            ctx!.fillStyle = `rgba(${pal.line}, ${(v - 0.72) * 0.9})`;
            ctx!.fill();
          }
          ctx!.strokeStyle = `rgba(${pal.line}, ${0.15 + v * 0.5})`;
          ctx!.lineWidth = v > 0.85 ? 1.8 : 1.1;
          ctx!.stroke();
        }
      }
    }

    function drawDotfield(pal: Palette) {
      const cols = 52;
      const rows = 26;
      const horizon = H * 0.3;

      for (let r = 0; r < rows; r++) {
        const p = Math.pow(r / (rows - 1), 1.8);
        const sy = horizon + (H - horizon) * p;
        const f = 0.35 + p * 1.9;
        const amp = H * 0.1 * (0.25 + p);

        for (let c = 0; c < cols; c++) {
          const u = c / (cols - 1) - 0.5;
          const h = Math.sin(c * 0.32 + time * 0.8 + r * 0.35) * 0.6 + Math.cos(r * 0.28 - time * 0.5 + c * 0.12) * 0.4;
          const x = W / 2 + u * W * f;
          const y = sy - h * amp;
          if (x < -10 || x > W + 10) continue;

          const rad = 0.7 + p * 2.6 + h * 0.4 * (0.5 + p);
          ctx!.beginPath();
          ctx!.arc(x, y, rad, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${pal.line}, ${0.15 + p * 0.55 + (h * 0.5 + 0.5) * 0.25})`;
          ctx!.fill();
        }
      }
    }

    const tmp = [0, 0];
    let fieldBuf = new Float32Array(1);
    function getField(n: number) {
      if (fieldBuf.length < n) fieldBuf = new Float32Array(n);
      return fieldBuf;
    }

    function edgePt(e: number, x0: number, y0: number, cs: number, v0: number, v1: number, v2: number, v3: number, L: number) {
      if (e === 0) {
        tmp[0] = x0 + ((L - v0) / (v1 - v0)) * cs;
        tmp[1] = y0;
      } else if (e === 1) {
        tmp[0] = x0 + cs;
        tmp[1] = y0 + ((L - v1) / (v2 - v1)) * cs;
      } else if (e === 2) {
        tmp[0] = x0 + ((L - v3) / (v2 - v3)) * cs;
        tmp[1] = y0 + cs;
      } else {
        tmp[0] = x0;
        tmp[1] = y0 + ((L - v0) / (v3 - v0)) * cs;
      }
    }

    function contour(f: Float32Array, cols: number, rows: number, cs: number, L: number) {
      const stride = cols + 1;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const v0 = f[j * stride + i];
          const v1 = f[j * stride + i + 1];
          const v2 = f[(j + 1) * stride + i + 1];
          const v3 = f[(j + 1) * stride + i];
          const idx = (v0 >= L ? 1 : 0) | (v1 >= L ? 2 : 0) | (v2 >= L ? 4 : 0) | (v3 >= L ? 8 : 0);
          if (idx === 0 || idx === 15) continue;
          const segs = MS_TABLE[idx];
          const x0 = i * cs;
          const y0 = j * cs;
          for (let k = 0; k < segs.length; k += 2) {
            edgePt(segs[k], x0, y0, cs, v0, v1, v2, v3, L);
            ctx!.moveTo(tmp[0], tmp[1]);
            edgePt(segs[k + 1], x0, y0, cs, v0, v1, v2, v3, L);
            ctx!.lineTo(tmp[0], tmp[1]);
          }
        }
      }
    }

    function drawLiquid(pal: Palette) {
      const m = Math.min(W, H);
      const cs = Math.max(16, m / 38);
      const cols = Math.ceil(W / cs);
      const rows = Math.ceil(H / cs);
      const stride = cols + 1;
      const f = getField(stride * (rows + 1));

      const balls = LIQUID_BALLS.map((b) => ({
        x: W * (b.x + Math.sin(time * b.sx + b.ph) * 0.14),
        y: H * (b.y + Math.cos(time * b.sy * 1.1 + b.ph * 1.3) * 0.16),
        r: m * b.r,
      }));

      balls.forEach((b, i) => {
        const rgb = pal.glow[i % pal.glow.length];
        const g = ctx!.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2.2);
        g.addColorStop(0, `rgba(${rgb}, ${pal.glowAlpha * 0.8})`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, W, H);
      });

      for (let j = 0; j <= rows; j++) {
        const y = j * cs;
        for (let i = 0; i <= cols; i++) {
          const x = i * cs;
          let v = 0;
          for (const b of balls) {
            const dx = x - b.x;
            const dy = y - b.y;
            v += (b.r * b.r) / (dx * dx + dy * dy + 1);
          }
          f[j * stride + i] = v;
        }
      }

      const levels: { L: number; color: string; w: number }[] = [
        { L: 0.55, color: pal.tertiary, w: 1 },
        { L: 1, color: pal.primary, w: 2 },
        { L: 1.7, color: pal.tertiary, w: 1.2 },
        { L: 3, color: pal.secondary, w: 1.6 },
      ];
      for (const lv of levels) {
        ctx!.beginPath();
        contour(f, cols, rows, cs, lv.L);
        ctx!.strokeStyle = lv.color;
        ctx!.lineWidth = lv.w;
        ctx!.stroke();
      }
    }

    function drawCaustics(pal: Palette) {
      const cs = Math.max(14, Math.min(W, H) / 55);
      const cols = Math.ceil(W / cs);
      const rows = Math.ceil(H / cs);
      const stride = cols + 1;
      const f = getField(stride * (rows + 1));
      const t = time;

      for (let j = 0; j <= rows; j++) {
        const fy = j * cs * 0.011;
        for (let i = 0; i <= cols; i++) {
          const fx = i * cs * 0.011;
          const wx = fx + 0.9 * Math.sin(fy * 1.3 + t * 0.6);
          const wy = fy + 0.9 * Math.cos(fx * 1.1 - t * 0.5);
          const v = Math.sin(wx * 2.1 + t * 0.4) + Math.sin(wy * 2.3 - t * 0.3) + Math.sin((wx + wy) * 1.7 + t * 0.5);
          f[j * stride + i] = Math.abs(v);
        }
      }

      const levels: { L: number; color: string; w: number }[] = [
        { L: 0.8, color: `rgba(${pal.line}, 0.18)`, w: 1 },
        { L: 0.4, color: pal.tertiary, w: 1.1 },
        { L: 0.15, color: pal.secondary, w: 1.8 },
      ];
      for (const lv of levels) {
        ctx!.beginPath();
        contour(f, cols, rows, cs, lv.L);
        ctx!.strokeStyle = lv.color;
        ctx!.lineWidth = lv.w;
        ctx!.stroke();
      }
    }

    const hash = (i: number, j: number, k: number) => {
      const v = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
      return v - Math.floor(v);
    };

    function drawLowpoly(pal: Palette) {
      const cw = Math.max(90, W / 12);
      const ch = cw * 0.85;
      const cols = Math.ceil(W / cw) + 2;
      const rows = Math.ceil(H / ch) + 2;

      const pts: Pt[][] = [];
      for (let j = 0; j <= rows; j++) {
        const row: Pt[] = [];
        for (let i = 0; i <= cols; i++) {
          const gi = i - 1;
          const gj = j - 1;
          row.push({
            x: gi * cw + (hash(gi, gj, 1) - 0.5) * cw * 0.7 + Math.sin(time * 0.3 + hash(gi, gj, 2) * 6.283) * cw * 0.12,
            y: gj * ch + (hash(gi, gj, 3) - 0.5) * ch * 0.7 + Math.cos(time * 0.27 + hash(gi, gj, 4) * 6.283) * ch * 0.12,
          });
        }
        pts.push(row);
      }

      const tri = (a: Pt, b: Pt, c: Pt, seed: number) => {
        const cx = (a.x + b.x + c.x) / 3;
        const cy = (a.y + b.y + c.y) / 3;
        const wave = 0.5 + 0.5 * Math.sin(cx * 0.004 + cy * 0.005 + time * 0.35);
        const v = wave * 0.6 + seed * 0.4;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.lineTo(c.x, c.y);
        ctx!.closePath();
        ctx!.fillStyle = mix(pal.polyA, pal.polyB, v);
        ctx!.fill();
        ctx!.stroke();
      };

      ctx!.strokeStyle = pal.secondary;
      ctx!.lineWidth = 1;
      ctx!.globalAlpha = 0.5;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const p00 = pts[j][i];
          const p10 = pts[j][i + 1];
          const p01 = pts[j + 1][i];
          const p11 = pts[j + 1][i + 1];
          if ((i + j) & 1) {
            tri(p00, p10, p11, hash(i, j, 5));
            tri(p00, p11, p01, hash(i, j, 6));
          } else {
            tri(p00, p10, p01, hash(i, j, 5));
            tri(p10, p11, p01, hash(i, j, 6));
          }
        }
      }
      ctx!.globalAlpha = 1;
    }

    function drawGlass(pal: Palette, isLight: boolean) {
      const m = Math.min(W, H);
      const hi = isLight ? 0.8 : 0.3;
      const body = isLight ? 0.35 : 0.16;

      for (const o of GLASS_ORBS) {
        const x = W * (o.x + Math.sin(time * o.sx + o.ph) * 0.06);
        const y = H * (o.y + Math.cos(time * o.sy + o.ph * 1.4) * 0.06);
        const r = m * o.r;
        const rgb = pal.glow[o.c % pal.glow.length];

        const sx = x + r * 0.15;
        const sy = y + r * 0.45;
        const sh = ctx!.createRadialGradient(sx, sy, 0, sx, sy, r * 1.15);
        sh.addColorStop(0, `rgba(${rgb}, ${isLight ? 0.28 : 0.12})`);
        sh.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx!.fillStyle = sh;
        ctx!.beginPath();
        ctx!.arc(sx, sy, r * 1.15, 0, Math.PI * 2);
        ctx!.fill();

        const g = ctx!.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
        g.addColorStop(0, `rgba(255, 255, 255, ${hi})`);
        g.addColorStop(0.55, `rgba(${rgb}, ${body})`);
        g.addColorStop(1, `rgba(${rgb}, ${body * 1.6})`);
        ctx!.beginPath();
        ctx!.arc(x, y, r, 0, Math.PI * 2);
        ctx!.fillStyle = g;
        ctx!.fill();

        ctx!.strokeStyle = `rgba(255, 255, 255, ${isLight ? 0.85 : 0.35})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(x, y, r * 0.86, Math.PI * 1.05, Math.PI * 1.45);
        ctx!.strokeStyle = `rgba(255, 255, 255, ${hi})`;
        ctx!.lineWidth = 2.4;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(x, y, r * 0.86, Math.PI * 0.05, Math.PI * 0.35);
        ctx!.strokeStyle = `rgba(${rgb}, ${isLight ? 0.6 : 0.4})`;
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }
    }

    const renderers: Record<Variant, (pal: Palette, isLight: boolean) => void> = {
      organic: drawOrganic,
      topo: drawTopo,
      layers: drawLayers,
      silk: drawSilk,
      flow: drawFlow,
      arcs: drawArcs,
      blobs: drawBlobs,
      aurora: drawAurora,
      mesh: drawMesh,
      bubbles: drawBubbles,
      dotwave: drawDotWave,
      constellation: drawConstellation,
      hexgrid: drawHexGrid,
      dotfield: drawDotfield,
      liquid: drawLiquid,
      caustics: drawCaustics,
      lowpoly: drawLowpoly,
      glass: drawGlass,
    };

    function draw() {
      time += 0.012 * speedRef.current;

      const isLight = themeRef.current === "light";
      const pal = isLight ? PALETTES.light : PALETTES.dark;

      const grad = ctx!.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, pal.bgFrom);
      grad.addColorStop(0.5, pal.bgMid);
      grad.addColorStop(1, pal.bgTo);
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      const mx = Math.max(W, H);
      pal.halos.forEach((h, i) => {
        const hx = W * (h.x + Math.sin(time * 0.15 + i * 1.7) * 0.05);
        const hy = H * (h.y + Math.cos(time * 0.12 + i * 2.3) * 0.05);
        const g = ctx!.createRadialGradient(hx, hy, 0, hx, hy, mx * h.r);
        g.addColorStop(0, `rgba(${h.rgb}, ${h.a})`);
        g.addColorStop(1, `rgba(${h.rgb}, 0)`);
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, W, H);
      });

      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      (renderers[variantRef.current] ?? drawOrganic)(pal, isLight);

      ctx!.globalAlpha = 1;

      animationId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.bgCanvas} />;
}
