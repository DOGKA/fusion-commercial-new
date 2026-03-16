"use client";

import { useEffect, useRef, useMemo } from "react";

interface ShimmerBackgroundProps {
  color?: string;
  className?: string;
  intensity?: number; // 0-1
  speed?: number; // Animation speed multiplier
}

/**
 * Hafif WebGL Shimmer Background
 * - GPU-accelerated
 * - Performans odaklı (minimal draw calls)
 * - Tema rengi desteği
 * - 60 FPS smooth animasyon
 */
export default function ShimmerBackground({
  color = "#8B5CF6",
  className = "",
  intensity = 0.3,
  speed = 1,
}: ShimmerBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  // Parse hex color to RGB
  const rgbColor = useMemo(() => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { r, g, b };
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get WebGL context
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });

    if (!gl) {
      console.warn("WebGL not supported, falling back to CSS");
      return;
    }

    glRef.current = gl;

    // Vertex shader - simple fullscreen quad
    const vertexShaderSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader - smooth gradient shimmer
    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec3 u_color;
      uniform float u_intensity;
      uniform vec2 u_resolution;
      
      void main() {
        vec2 uv = v_uv;
        
        // Multiple wave layers for organic look
        float wave1 = sin(uv.x * 3.0 + u_time * 0.5) * 0.5 + 0.5;
        float wave2 = sin(uv.y * 2.0 - u_time * 0.3) * 0.5 + 0.5;
        float wave3 = sin((uv.x + uv.y) * 4.0 + u_time * 0.7) * 0.5 + 0.5;
        
        // Diagonal shimmer sweep
        float diagonal = sin((uv.x + uv.y) * 2.0 - u_time * 0.8) * 0.5 + 0.5;
        
        // Combine waves
        float shimmer = (wave1 * 0.3 + wave2 * 0.3 + wave3 * 0.2 + diagonal * 0.2);
        
        // Radial fade from center
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(uv, center);
        float radialFade = 1.0 - smoothstep(0.0, 0.8, dist);
        
        // Apply intensity
        float alpha = shimmer * radialFade * u_intensity;
        
        // Output color with alpha
        gl_FragColor = vec4(u_color, alpha);
      }
    `;

    // Compile shaders
    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;

    // Create fullscreen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Get attribute/uniform locations
    const positionLoc = gl.getAttribLocation(program, "a_position");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const colorLoc = gl.getUniformLocation(program, "u_color");
    const intensityLoc = gl.getUniformLocation(program, "u_intensity");
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2); // Cap DPR for performance
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    // Animation loop
    const startTime = performance.now();

    const render = () => {
      if (!gl || !program) return;

      const currentTime = (performance.now() - startTime) / 1000 * speed;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      // Set uniforms
      gl.uniform1f(timeLoc, currentTime);
      gl.uniform3f(colorLoc, rgbColor.r, rgbColor.g, rgbColor.b);
      gl.uniform1f(intensityLoc, intensity);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);

      // Draw
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(buffer);
      }
    };
  }, [rgbColor, intensity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 1 }}
    />
  );
}
