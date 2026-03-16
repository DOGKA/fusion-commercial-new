"use client";

import { useEffect, useRef } from "react";

interface WaveMeshProps {
  className?: string;
  color?: string;
  opacity?: number;
}

export default function WaveMesh({ 
  className = "", 
  color = "rgba(255,255,255,0.12)",
  opacity = 1 
}: WaveMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      const lineCount = 14;
      const verticalLines = 50;
      const amplitude = height * 0.25;

      // Draw mesh grid
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;

      // Horizontal wave lines
      for (let line = 0; line < lineCount; line++) {
        const baseY = (height / (lineCount - 1)) * line;
        
        ctx.beginPath();
        for (let v = 0; v <= verticalLines; v++) {
          const x = (width / verticalLines) * v;
          const phase = time * 0.015 + v * 0.12 + line * 0.3;
          const waveStrength = Math.sin((v / verticalLines) * Math.PI);
          const y = baseY + Math.sin(phase) * amplitude * waveStrength;

          if (v === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Vertical connecting lines
      for (let v = 0; v <= verticalLines; v++) {
        const x = (width / verticalLines) * v;
        
        ctx.beginPath();
        for (let line = 0; line < lineCount; line++) {
          const baseY = (height / (lineCount - 1)) * line;
          const phase = time * 0.015 + v * 0.12 + line * 0.3;
          const waveStrength = Math.sin((v / verticalLines) * Math.PI);
          const y = baseY + Math.sin(phase) * amplitude * waveStrength;

          if (line === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none rounded-[inherit] ${className}`}
      style={{ opacity }}
    />
  );
}
