import React from "react";
import { motion } from "motion/react";

export function CinematicAurora({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* Aurora Ambient Container */}
      <div className="absolute inset-0 filter blur-[95px] opacity-75 transform-gpu">
        {/* Aurora Wave 1: Inflow Emerald Ribbon (Top-Left to Center) */}
        <motion.div
          initial={{
            x: "-20%",
            y: "-15%",
            scale: 1,
            rotate: 0,
          }}
          animate={{
            x: ["-20%", "10%", "-10%", "-20%"],
            y: ["-15%", "-5%", "-25%", "-15%"],
            scale: [1, 1.15, 0.95, 1],
            rotate: [0, 8, -6, 0],
          }}
          transition={{
            duration: 18,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="absolute -top-32 -left-32 w-[38rem] h-[32rem] rounded-full bg-gradient-to-tr from-emerald-300/35 via-teal-200/30 to-transparent"
        />

        {/* Aurora Wave 2: Treasury Indigo Beam (Top-Right) */}
        <motion.div
          initial={{
            x: "15%",
            y: "-10%",
            scale: 1,
            rotate: 0,
          }}
          animate={{
            x: ["15%", "-10%", "5%", "15%"],
            y: ["-10%", "10%", "-20%", "-10%"],
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, -12, 6, 0],
          }}
          transition={{
            duration: 22,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
            delay: 2,
          }}
          className="absolute -top-24 -right-24 w-[42rem] h-[36rem] rounded-full bg-gradient-to-bl from-indigo-300/35 via-purple-200/25 to-sky-200/20"
        />

        {/* Aurora Wave 3: Cyan Core Flow (Center Floating Stream) */}
        <motion.div
          initial={{
            x: "0%",
            y: "0%",
            scale: 0.95,
          }}
          animate={{
            x: ["0%", "15%", "-15%", "0%"],
            y: ["0%", "-15%", "15%", "0%"],
            scale: [0.95, 1.1, 0.9, 0.95],
          }}
          transition={{
            duration: 25,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
            delay: 4,
          }}
          className="absolute top-1/4 left-1/4 w-[34rem] h-[28rem] rounded-full bg-gradient-to-r from-sky-300/25 via-cyan-200/20 to-emerald-200/20"
        />

        {/* Aurora Wave 4: Subtle Warm Amber Horizon Glow (Bottom-Right) */}
        <motion.div
          initial={{
            x: "10%",
            y: "20%",
            scale: 1,
          }}
          animate={{
            x: ["10%", "-5%", "15%", "10%"],
            y: ["20%", "10%", "25%", "20%"],
            scale: [1, 1.12, 0.92, 1],
          }}
          transition={{
            duration: 20,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
            delay: 3,
          }}
          className="absolute bottom-10 right-1/4 w-[30rem] h-[26rem] rounded-full bg-gradient-to-tl from-amber-200/20 via-orange-100/15 to-transparent"
        />
      </div>

      {/* Atmospheric Horizon Light Streaks */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
      <div className="absolute top-20 inset-x-0 h-40 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
    </div>
  );
}

export default CinematicAurora;
