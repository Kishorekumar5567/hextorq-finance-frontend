import React, { useRef, useState } from "react";

export function MagicCard({
  children,
  className = "",
  gradientColor = "rgba(59, 130, 246, 0.12)",
  borderColor = "rgba(59, 130, 246, 0.3)",
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${className}`}
      style={{
        backgroundImage: isHovered
          ? `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${gradientColor}, transparent 80%)`
          : undefined,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow: `inset 0 0 0 1px ${borderColor}`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default MagicCard;
