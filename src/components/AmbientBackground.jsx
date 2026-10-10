import React, { useEffect, useState } from "react";
import HexagonPattern from "./HexagonPattern";

export function AmbientBackground() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate normalized mouse percentages (0 to 100)
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Dynamic Animated Floating Light Orbs */}
      <div className="absolute inset-0">
        {/* Orb 1: Soft Emerald Inflow Glow (top-left) */}
        <div
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl transition-transform duration-1000 ease-out animate-pulse"
          style={{
            transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)`,
            animationDuration: "8s",
          }}
        />

        {/* Orb 2: Indigo Treasury Glow (top-right) */}
        <div
          className="absolute top-12 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl transition-transform duration-1000 ease-out animate-pulse"
          style={{
            transform: `translate(${-mousePos.x * 0.2}px, ${mousePos.y * 0.1}px)`,
            animationDuration: "10s",
          }}
        />

        {/* Orb 3: Cyan/Sky Velocity Pulse (center) */}
        <div
          className="absolute top-1/2 left-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/20 blur-3xl transition-transform duration-1000 ease-out animate-pulse"
          style={{
            transform: `translate(${mousePos.x * 0.1}px, ${-mousePos.y * 0.15}px)`,
            animationDuration: "12s",
          }}
        />
      </div>

      {/* HexTorq Hexagonal Pattern Layer with Radial Vignette */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_25%,transparent_90%)]">
        <HexagonPattern
          radius={32}
          gap={3}
          strokeDasharray="4 2"
          className="stroke-slate-300/35 fill-slate-200/10"
          hexagons={[
            [3, 2],
            [5, 4],
            [8, 1],
            [12, 3],
            [14, 5],
            [2, 6],
            [10, 7],
          ]}
        />
      </div>

      {/* Mouse Follow Interactive Spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(241, 245, 249, 0.45), transparent 80%)`,
        }}
      />

      {/* Subtle Bottom Ambient Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#f8fafc] to-transparent" />
    </div>
  );
}

export default AmbientBackground;
