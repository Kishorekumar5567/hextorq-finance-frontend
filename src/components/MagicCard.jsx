import React, { useRef, useState } from "react";

export function MagicCard({
  children,
  className = "",
  gradientColor = "rgba(241, 245, 249, 0.7)",
  borderColor = "rgba(203, 213, 225, 0.9)",
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
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 transition-all duration-300 shadow-[0_1px_3px_0_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 ${className}`}
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
