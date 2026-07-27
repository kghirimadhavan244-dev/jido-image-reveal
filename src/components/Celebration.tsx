"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationProps {
  show:        boolean;
  answer:      string;
  mode:        "WON" | "REVEALED";
  onClose:     () => void;
  onNextImage?: () => void;
}

export function Celebration({ show, answer, mode, onClose, onNextImage }: CelebrationProps) {
  useEffect(() => {
    if (!show || mode !== "WON") return;
    const end = Date.now() + 3500;
    function burst() {
      confetti({
        particleCount: 55,
        spread:        340,
        startVelocity: 28,
        ticks:         55,
        origin:        { x: Math.random(), y: 0.3 },
        colors:        ["#2563EB", "#16A34A", "#F59E0B", "#EC4899", "#8B5CF6"],
      });
      if (Date.now() < end) requestAnimationFrame(burst);
    }
    burst();
  }, [show, mode]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="celebration-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
          onClick={onClose}
        >
          <motion.div
            key="celebration-card"
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{    scale: 0.85, opacity: 0, y: 24  }}
            transition={{ type: "spring", damping: 22, stiffness: 180 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-4 leading-none">
              {mode === "WON" ? "🎉" : "👁️"}
            </div>

            <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-2">
              {mode === "WON" ? "Correct Answer!" : "Answer Revealed"}
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
              {answer}
            </h2>

            <div className="flex flex-col gap-2.5">
              {onNextImage && (
                <button
                  onClick={onNextImage}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors duration-150 text-sm cursor-pointer shadow-md"
                >
                  Next Image →
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors duration-150 text-xs cursor-pointer"
              >
                Replay Image
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
