import React, { useRef, useEffect } from "react";

export function HexTorq3DVisual({
  size = 140,
  className = "",
  primaryColor = "#0f172a",
  accentColor = "#10b981",
  secondaryColor = "#6366f1",
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const rotRef = useRef({ x: 0.35, y: 0.65, z: 0.2 });
  const velRef = useRef({ x: 0.004, y: 0.007, z: 0.002 });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Generate Concentric Hexagonal Prism Vertices (3D Model of HexTorq Mark)
    const rings = [
      { radius: size * 0.44, zOffset: 18, alpha: 0.85, width: 2.2 },
      { radius: size * 0.35, zOffset: 10, alpha: 0.7, width: 1.8 },
      { radius: size * 0.25, zOffset: 0, alpha: 0.95, width: 2.4 },
    ];

    const vertices = [];
    const edges = [];

    let vertexOffset = 0;
    rings.forEach((ring) => {
      const topPts = [];
      const btmPts = [];

      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        const x = ring.radius * Math.cos(angle);
        const y = ring.radius * Math.sin(angle);

        topPts.push({ x, y, z: ring.zOffset, ringAlpha: ring.alpha, width: ring.width });
        btmPts.push({ x, y, z: -ring.zOffset, ringAlpha: ring.alpha, width: ring.width });
      }

      const ringStart = vertexOffset;
      topPts.forEach((pt) => vertices.push(pt));
      btmPts.forEach((pt) => vertices.push(pt));

      // Edges for top hex ring
      for (let i = 0; i < 6; i++) {
        edges.push([ringStart + i, ringStart + ((i + 1) % 6)]);
        edges.push([ringStart + 6 + i, ringStart + 6 + ((i + 1) % 6)]);
        edges.push([ringStart + i, ringStart + 6 + i]); // Vertical strut
      }

      vertexOffset += 12;
    });

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);

      mouseRef.current.targetX = dx * 0.8;
      mouseRef.current.targetY = -dy * 0.8;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 3D Render Loop with Perspective Projection
    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Smooth torque response
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      rotRef.current.x += velRef.current.x + mouseRef.current.y * 0.01;
      rotRef.current.y += velRef.current.y + mouseRef.current.x * 0.01;
      rotRef.current.z += velRef.current.z;

      const cosX = Math.cos(rotRef.current.x);
      const sinX = Math.sin(rotRef.current.x);
      const cosY = Math.cos(rotRef.current.y);
      const sinY = Math.sin(rotRef.current.y);
      const cosZ = Math.cos(rotRef.current.z);
      const sinZ = Math.sin(rotRef.current.z);

      const fov = 260;
      const cx = size / 2;
      const cy = size / 2;

      // Project vertices to 2D
      const projected = vertices.map((v) => {
        // Rotate Y
        let x1 = v.x * cosY + v.z * sinY;
        let y1 = v.y;
        let z1 = -v.x * sinY + v.z * cosY;

        // Rotate X
        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Rotate Z
        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        const scale = fov / (fov + z3 + 120);
        return {
          px: cx + x3 * scale,
          py: cy + y3 * scale,
          pz: z3,
          scale,
          alpha: v.ringAlpha,
          width: v.width,
        };
      });

      // Draw 3D Edges
      edges.forEach(([i1, i2]) => {
        const p1 = projected[i1];
        const p2 = projected[i2];
        const avgZ = (p1.pz + p2.pz) / 2;

        // Depth-based illumination
        const depthAlpha = Math.max(0.12, Math.min(0.9, (avgZ + 45) / 90));
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);

        // Gradient line from primary to accent
        if (avgZ > 10) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${depthAlpha * 0.85})`;
          ctx.lineWidth = p1.width * 1.1;
        } else if (avgZ > -15) {
          ctx.strokeStyle = `rgba(15, 23, 42, ${depthAlpha * 0.75})`;
          ctx.lineWidth = p1.width;
        } else {
          ctx.strokeStyle = `rgba(99, 102, 241, ${depthAlpha * 0.5})`;
          ctx.lineWidth = p1.width * 0.8;
        }

        ctx.lineCap = "round";
        ctx.stroke();
      });

      // Draw Specular Glowing Vertices
      projected.forEach((p) => {
        if (p.pz > 5) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.scale * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${Math.min(1, p.scale * 0.9)})`;
          ctx.fill();

          // Subtle core gleam
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.scale * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [size, primaryColor, accentColor, secondaryColor]);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="block drop-shadow-[0_4px_12px_rgba(16,185,129,0.18)]"
      />
    </div>
  );
}

export default HexTorq3DVisual;
