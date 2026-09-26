"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/features/theme/hooks/useTheme";
import styles from "./StaticNoise.module.css";

export default function StaticNoise() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = 0.12;
    let w = 0,
      h = 0,
      raf: number;

    function resize() {
      w = canvas!.width = Math.max(1, Math.floor(window.innerWidth * scale));
      h = canvas!.height = Math.max(1, Math.floor(window.innerHeight * scale));
    }
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    function draw() {
      frame++;
      if (frame % 2 === 0) {
        const imageData = ctx!.createImageData(w, h);
        const buffer = imageData.data;
        for (let i = 0; i < buffer.length; i += 4) {
          const v = Math.random() * 255;
          buffer[i] = v;
          buffer[i + 1] = v;
          buffer[i + 2] = v;
          buffer[i + 3] = 30;
        }
        ctx!.putImageData(imageData, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.noise} aria-hidden="true" />;
}
