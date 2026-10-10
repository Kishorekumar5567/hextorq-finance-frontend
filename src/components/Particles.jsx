import React, { useEffect, useRef } from "react";

function hexToRgb(hex) {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const hexInt = parseInt(cleanHex, 16);
  return [(hexInt >> 16) & 255, (hexInt >> 8) & 255, hexInt & 255];
}

export function Particles({
  className = "",
  quantity = 45,
  staticity = 40,
  ease = 45,
  size = 0.8,
  color = "#64748b",
  vx = 0,
  vy = -0.05,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const circles = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const rafId = useRef(null);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rgb = hexToRgb(color);

    const resize = () => {
      if (!container || !canvas) return;
      canvasSize.current.w = container.offsetWidth;
      canvasSize.current.h = container.offsetHeight;
      canvas.width = canvasSize.current.w * dpr;
      canvas.height = canvasSize.current.h * dpr;
      canvas.style.width = `${canvasSize.current.w}px`;
      canvas.style.height = `${canvasSize.current.h}px`;
      ctx.scale(dpr, dpr);

      // Re-initialize particles
      circles.current = [];
      for (let i = 0; i < quantity; i++) {
        circles.current.push({
          x: Math.random() * canvasSize.current.w,
          y: Math.random() * canvasSize.current.h,
          translateX: 0,
          translateY: 0,
          size: Math.random() * 1.5 + size,
          alpha: Math.random() * 0.4 + 0.1,
          targetAlpha: Math.random() * 0.5 + 0.15,
          dx: (Math.random() - 0.5) * 0.2,
          dy: (Math.random() - 0.5) * 0.2 - 0.05,
          magnetism: 0.2 + Math.random() * 2.5,
        });
      }
    };

    resize();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - canvasSize.current.w / 2;
      const y = e.clientY - rect.top - canvasSize.current.h / 2;
      mouse.current.x = x;
      mouse.current.y = y;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", resize);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

      circles.current.forEach((circle) => {
        // Move towards target alpha smoothly
        if (circle.alpha < circle.targetAlpha) {
          circle.alpha += 0.008;
        }

        circle.x += circle.dx + vx;
        circle.y += circle.dy + vy;

        // Subtle mouse magnetic attraction
        circle.translateX +=
          (mouse.current.x / (staticity / circle.magnetism) -
            circle.translateX) /
          ease;
        circle.translateY +=
          (mouse.current.y / (staticity / circle.magnetism) -
            circle.translateY) /
          ease;

        const posX = circle.x + circle.translateX;
        const posY = circle.y + circle.translateY;

        // Wrap around boundaries
        if (posX < 0) circle.x = canvasSize.current.w;
        if (posX > canvasSize.current.w) circle.x = 0;
        if (posY < 0) circle.y = canvasSize.current.h;
        if (posY > canvasSize.current.h) circle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(posX, posY, circle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${circle.alpha})`;
        ctx.fill();
      });

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, [color, quantity, size, staticity, ease, vx, vy, dpr]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

export default Particles;
