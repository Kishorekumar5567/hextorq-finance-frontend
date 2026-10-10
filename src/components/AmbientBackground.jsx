import React, { useEffect, useState } from "react";
import HexagonPattern from "./HexagonPattern";
import CinematicAurora from "./CinematicAurora";
import Particles from "./Particles";

export function AmbientBackground() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 35 });

  useEffect(() => {
    const handleMouseMove = (e) => {
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
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#f8fafc]"
    >
      {/* 1. Volumetric Flowing Aurora Waves */}
      <CinematicAurora />

      {/* 2. Interactive Magnetic Canvas Particles */}
      <Particles
        quantity={50}
        color="#059669"
        size={0.9}
        staticity={35}
        ease={40}
        className="opacity-60"
      />
      <Particles
        quantity={35}
        color="#6366f1"
        size={1.1}
        staticity={45}
        ease={50}
        className="opacity-50"
      />

      {/* 3. HexTorq Branded Geometric Hexagon Lattice with Radial Vignette */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_25%,transparent_90%)]">
        <HexagonPattern
          radius={34}
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
            [6, 8],
          ]}
        />
      </div>

      {/* 4. Mouse Interactive Specular Spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.45), transparent 85%)`,
        }}
      />

      {/* 5. Edge Vignette & Grounding Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/80 to-transparent" />
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#f8fafc]/60 to-transparent" />
    </div>
  );
}

export default AmbientBackground;
