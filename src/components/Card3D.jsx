import React, { useRef, useState } from "react";
import { motion } from "motion/react";

export function Card3D({
  children,
  className = "",
  maxTilt = 8,
  glareOpacity = 0.35,
  elevation = "0 10px 30px -10px rgba(0, 0, 0, 0.06)",
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50, active: false });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      rx: rotateX,
      ry: rotateY,
      glareX,
      glareY,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      rx: 0,
      ry: 0,
      glareX: 50,
      glareY: 50,
      active: false,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rx,
        rotateY: tilt.ry,
        transformPerspective: 1000,
        boxShadow: tilt.active
          ? "0 20px 35px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(203, 213, 225, 0.9)"
          : elevation,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/92 backdrop-blur-md transition-colors duration-200 ${className}`}
    >
      {/* 3D Specular Glare Reflection Sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-20"
        style={{
          opacity: tilt.active ? glareOpacity : 0,
          background: `radial-gradient(450px circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.8), rgba(241, 245, 249, 0.2) 40%, transparent 80%)`,
        }}
      />

      {/* Card Content with 3D Depth Layer */}
      <div
        className="relative z-10"
        style={{
          transform: tilt.active ? "translateZ(15px)" : "translateZ(0px)",
          transition: "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

export default Card3D;
