import React, { useEffect, useState } from "react";
import HexagonPattern from "./HexagonPattern";
import CinematicAurora from "./CinematicAurora";
import Floating3DParticles from "./Floating3DParticles";

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

      {/* 2. Floating 3D Perspective Particle Field */}
      <Floating3DParticles
        quantity={120}
        color="#10B981"
        size={3.5}
        opacity={0.22}
        drift={0.35}
        depth={0.65}
        className="opacity-70"
      />
      <Floating3DParticles
        quantity={80}
        color="#6366F1"
        size={4.2}
        opacity={0.18}
        drift={0.4}
        depth={0.75}
        className="opacity-60"
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
