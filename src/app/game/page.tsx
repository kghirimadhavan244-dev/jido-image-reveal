"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GameBoard } from "../../components/GameBoard";
import { Celebration } from "../../components/Celebration";
import {
  PRESET_IMAGES,
  PresetImage,
  findPhysicalIndex,
  loadGames,
  saveGames,
  loadActiveId,
} from "../../data/defaultImages";
import { fetchGamesFromSupabase } from "../../services/gameService";
import {
  Settings,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  SkipForward,
  Eye,
  RotateCcw,
  Trophy,
  PanelRightOpen,
  PanelRightClose,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type GameStatus = "PLAYING" | "GAME_OVER" | "REVEALED" | "WON";

const LOADING_IMAGE: PresetImage = PRESET_IMAGES[0];

function playTone(freq: number, duration: number = 0.15, volume: number = 0.1) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore
  }
}

export default function GameScreen() {
  const [mounted, setMounted] = useState(false);

  // ── Game library ──
  const [gamesList, setGamesList] = useState<PresetImage[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [currentGame, setCurrentGame] = useState<PresetImage>(LOADING_IMAGE);

  // ── Round & tile state for current image ──
  const [currentRound, setCurrentRound] = useState(1);
  const [revealedTiles, setRevealedTiles] = useState<Set<number>>(new Set());
  const [revealedThisRound, setRevealedThisRound] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [inputTile, setInputTile] = useState("");
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Derived parameters ──
  const maxRounds = currentGame.revealCount || 5;
  const cols = currentGame.gridCols;
  const rows = currentGame.gridRows;
  const startRange = currentGame.startNumber;
  const endRange = startRange + cols * rows - 1;
  const isMaxRoundsReached = currentRound >= maxRounds && revealedThisRound;
  const canRevealTile = !revealedThisRound && !isAnswerRevealed && currentRound <= maxRounds;
  const currentAnswerName = currentGame.answer || currentGame.name;

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Ctrl listener for unblurring sidebar titles
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.ctrlKey) setCtrlPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" || !e.ctrlKey) setCtrlPressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Mount: fetch games from Supabase
  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        const games = await fetchGamesFromSupabase();
        const migrated = games.map((g) => ({
          ...LOADING_IMAGE,
          ...g,
          tileStyles: g.tileStyles ?? LOADING_IMAGE.tileStyles,
        }));
        setGamesList(migrated);
        
        const activeId = loadActiveId();
        let idx = 0;
        if (activeId) {
          const found = migrated.findIndex((g) => g.id === activeId);
          if (found !== -1) idx = found;
        }
        setImageIndex(idx);
        setCurrentGame(migrated[idx] ?? LOADING_IMAGE);
      } catch (err) {
        console.error("Game load error:", err);
      }
    }
    loadData();
  }, []);

  // Fullscreen listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }, []);

  // ── Switch / Replay image reset logic ──
  const resetImageState = useCallback(() => {
    setRevealedTiles(new Set());
    setCurrentRound(1);
    setRevealedThisRound(false);
    setIsAnswerRevealed(false);
    setInputTile("");
    setToast(null);
  }, []);

  const loadSpecificImage = useCallback((idx: number) => {
    if (gamesList.length === 0) return;
    const target = gamesList[idx];
    setImageIndex(idx);
    setCurrentGame(target);
    resetImageState();
  }, [gamesList, resetImageState]);

  const handleNextImage = useCallback(() => {
    if (gamesList.length === 0) return;
    const nextIdx = (imageIndex + 1) % gamesList.length;
    loadSpecificImage(nextIdx);
  }, [gamesList.length, imageIndex, loadSpecificImage]);

  const handlePrevImage = useCallback(() => {
    if (gamesList.length === 0) return;
    const prevIdx = (imageIndex - 1 + gamesList.length) % gamesList.length;
    loadSpecificImage(prevIdx);
  }, [gamesList.length, imageIndex, loadSpecificImage]);

  // ── Gameplay Actions ──
  const handleRevealTileSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canRevealTile) return;

    const n = parseInt(inputTile.trim(), 10);
    if (isNaN(n)) {
      setToast({ text: "Enter a valid tile number.", type: "error" });
      return;
    }

    const physIdx = findPhysicalIndex(n, cols, rows, startRange, currentGame.numberingDirection);
    if (physIdx === -1) {
      setToast({ text: `Tile ${n} out of bounds.`, type: "error" });
      return;
    }

    if (revealedTiles.has(physIdx)) {
      setToast({ text: `Tile ${n} already revealed.`, type: "error" });
      return;
    }

    const nextSet = new Set(revealedTiles);
    nextSet.add(physIdx);
    setRevealedTiles(nextSet);
    setRevealedThisRound(true);
    setInputTile("");
    playTone(600, 0.15);
    setToast({ text: `Tile ${n} revealed!`, type: "success" });
  }, [canRevealTile, inputTile, cols, rows, startRange, currentGame, revealedTiles]);

  const handleAdvanceNextRound = useCallback(() => {
    if (!revealedThisRound || currentRound >= maxRounds) return;
    setCurrentRound((prev) => prev + 1);
    setRevealedThisRound(false);
    setInputTile("");
    playTone(440, 0.15);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [revealedThisRound, currentRound, maxRounds]);

  const handleRevealAnswer = useCallback(() => {
    const all = new Set(Array.from({ length: cols * rows }, (_, i) => i));
    setRevealedTiles(all);
    setIsAnswerRevealed(true);
    playTone(880, 0.4, 0.2);
  }, [cols, rows]);

  if (!mounted) {
    return (
      <div className="h-full bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 rounded-full border-2 border-slate-700 border-t-slate-400 animate-spin" />
          <span className="text-sm font-medium">Loading presentation…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans select-none overflow-x-hidden">
      
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
          >
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl border ${
                toast.type === "success"
                  ? "bg-slate-900/90 border-emerald-500/50 text-emerald-400"
                  : "bg-slate-900/90 border-rose-500/50 text-rose-400"
              }`}
            >
              {toast.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex-none border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white font-bold text-lg tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs uppercase tracking-widest font-extrabold">
                JIDO
              </span>
              <span>Induction</span>
            </Link>
            <span className="text-slate-600 font-light">|</span>
            <div className="text-sm font-medium text-slate-300">
              <span className="text-slate-400">Game:</span>{" "}
              <span className="text-white font-semibold">{currentGame.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm">
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full font-medium border border-slate-700">
                Image <strong className="text-white">{imageIndex + 1}</strong> of {gamesList.length}
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full font-medium border border-slate-700">
                Round <strong className="text-red-400">{currentRound}</strong> / {maxRounds}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin" title="Admin Portal">
                <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700">
                  <Settings size={18} />
                </button>
              </Link>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
        <div
          className="w-full relative flex flex-col items-center justify-center"
          style={{
            maxWidth: `min(calc(${cols / rows * 72}vh), 920px)`,
          }}
        >
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl overflow-hidden relative">
            <GameBoard
              imageUrl={currentGame.url}
              revealedTiles={revealedTiles}
              onTileReveal={() => {}}
              isPlaying={false}
              cols={cols}
              rows={rows}
              startNumber={currentGame.startNumber}
              numberingDirection={currentGame.numberingDirection}
              tileStyles={currentGame.tileStyles}
            />

            {isAnswerRevealed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
              >
                <span className="text-red-500 font-bold uppercase tracking-[0.25em] text-xs mb-2">
                  Correct Answer
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                  {currentAnswerName}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNextImage}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    Next Image <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={resetImageState}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={16} /> Replay Image
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Image Progress
            </span>
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-5 py-2.5 rounded-full shadow-inner">
              {Array.from({ length: maxRounds }, (_, i) => {
                const roundNum = i + 1;
                const isCurrent = roundNum === currentRound;
                const isCompleted = roundNum < currentRound || (isCurrent && revealedThisRound);

                return (
                  <div key={roundNum} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
                        isCurrent
                          ? "ring-4 ring-red-500/30 bg-red-500 scale-125"
                          : isCompleted
                          ? "bg-slate-400"
                          : "bg-slate-800 border border-slate-700"
                      }`}
                    />
                    {i < maxRounds - 1 && (
                      <div
                        className={`w-6 h-0.5 transition-colors ${
                          roundNum < currentRound ? "bg-slate-600" : "bg-slate-800"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Celebration
        show={isAnswerRevealed}
        answer={currentAnswerName}
        mode="REVEALED"
        onClose={() => {}}
      />
    </div>
  );
}
