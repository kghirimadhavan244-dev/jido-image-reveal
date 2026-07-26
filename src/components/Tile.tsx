"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import type { TileStyles } from "../data/defaultImages";

interface TileProps {
  id:       number;
  revealed: boolean;
  onReveal: () => void;
  disabled: boolean;
  styles:   TileStyles;
}

function playSoftClick(): void {
  if (typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    const ctx  = new AC();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // audio unavailable — silently skip
  }
}

export function Tile({ id, revealed, onReveal, disabled, styles }: TileProps) {
  useEffect(() => {
    if (revealed) playSoftClick();
  }, [revealed]);

  const {
    cornerRadius,
    borderThickness,
    fontSize,
    numberColor,
    borderColor,
    bgOpacity,
  } = styles;

  return (
    <div className="relative w-full h-full">
      <motion.button
        type="button"
        onClick={() => { if (!disabled && !revealed) onReveal(); }}
        disabled={disabled || revealed}
        whileHover={!revealed && !disabled ? { scale: 1.05 } : {}}
        whileTap={!revealed && !disabled   ? { scale: 0.96 } : {}}
        animate={
          revealed
            ? { y: -8, opacity: 0, scale: 1.03 }
            : { y: 0,  opacity: 1, scale: 1    }
        }
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          pointerEvents:   revealed ? "none" : "auto",
          borderRadius:    `${cornerRadius}px`,
          borderWidth:     `${borderThickness}px`,
          borderStyle:     "solid",
          borderColor,
          fontSize:        `${fontSize}px`,
          color:           numberColor,
          backgroundColor: `rgba(10, 15, 30, ${bgOpacity})`,
        }}
        className="absolute inset-0 flex items-center justify-center font-semibold select-none"
        aria-label={`Tile ${id}`}
      >
        {String(id).padStart(2, "0")}
      </motion.button>
    </div>
  );
}
