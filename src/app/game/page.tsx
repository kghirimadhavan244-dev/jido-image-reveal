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
  getTileNumber,
  loadActiveId,
} from "../../data/defaultImages";
import { fetchGamesFromSupabase } from "../../services/gameService";
import {
  Settings,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
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

  // ── Live Round & Tile Reveal State ──
  const [currentRound, setCurrentRound] = useState(1);
  const [revealedTiles, setRevealedTiles] = useState<Set<number>>(new Set());
  const [revealedHistory, setRevealedHistory] = useState<number[]>([]);
  const [selectedTileInput, setSelectedTileInput] = useState("");
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

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

  const currentAnswerName = currentGame.imageAnswers?.[0] || currentGame.answer || currentGame.name;
  const totalRevealed = revealedTiles.size;
  const isFinalRound = currentRound >= maxRounds;

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Ctrl listener for unblurring dropdown items
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

  // ── Switch / Replay image reset ──
  const resetImageState = useCallback(() => {
    setRevealedTiles(new Set());
    setRevealedHistory([]);
    setCurrentRound(1);
    setIsAnswerRevealed(false);
    setSelectedTileInput("");
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

  const [guestGuessInput, setGuestGuessInput] = useState("");

  // ── Core Host Reveal Execution ──
  const executePhysicalReveal = useCallback((physIdx: number, displayNum: number) => {
    if (isAnswerRevealed) return;
    if (revealedTiles.has(physIdx)) {
      setToast({ text: `Tile #${displayNum} is already revealed.`, type: "error" });
      return;
    }

    const nextSet = new Set(revealedTiles);
    nextSet.add(physIdx);
    setRevealedTiles(nextSet);
    setRevealedHistory((prev) => [...prev, displayNum]);
    setSelectedTileInput("");
    playTone(600, 0.15);

    // Auto reveal full answer when max round tiles (e.g. 5 tiles) are turned
    if (nextSet.size >= maxRounds) {
      const all = new Set(Array.from({ length: cols * rows }, (_, i) => i));
      setRevealedTiles(all);
      setIsAnswerRevealed(true);
      playTone(880, 0.4, 0.2);
      setToast({ text: `All ${maxRounds} tiles revealed! Showing answer.`, type: "success" });
    } else {
      setToast({ text: `Revealed Tile #${displayNum}`, type: "success" });
      setCurrentRound((prev) => Math.min(maxRounds, prev + 1));
    }
  }, [isAnswerRevealed, revealedTiles, maxRounds, cols, rows]);

  // Audience Guess Check Handler (e.g. Round 2 guess)
  const handleCheckGuessSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!guestGuessInput.trim() || isAnswerRevealed) return;

    const userGuess = guestGuessInput.trim().toLowerCase();
    const targetAnswer = currentAnswerName.trim().toLowerCase();

    if (userGuess === targetAnswer || targetAnswer.includes(userGuess) || userGuess.includes(targetAnswer)) {
      // Correct guess! Reveal full answer immediately
      const all = new Set(Array.from({ length: cols * rows }, (_, i) => i));
      setRevealedTiles(all);
      setIsAnswerRevealed(true);
      playTone(880, 0.5, 0.3);
      setToast({ text: `Correct Guess! Answer: ${currentAnswerName}`, type: "success" });
      setGuestGuessInput("");
    } else {
      setToast({ text: `Incorrect guess: "${guestGuessInput.trim()}"`, type: "error" });
    }
  }, [guestGuessInput, isAnswerRevealed, currentAnswerName, cols, rows]);

  // Direct Grid Click Handler
  const handleGridClick = useCallback((physIdx: number) => {
    const r = Math.floor(physIdx / cols);
    const c = physIdx % cols;
    const displayNum = getTileNumber(r, c, cols, rows, startRange, currentGame.numberingDirection);
    executePhysicalReveal(physIdx, displayNum);
  }, [cols, rows, startRange, currentGame.numberingDirection, executePhysicalReveal]);

  // Host Input Form Reveal Handler
  const handleFormRevealSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAnswerRevealed) return;

    const n = parseInt(selectedTileInput.trim(), 10);
    if (isNaN(n)) {
      setToast({ text: "Please enter a valid tile number.", type: "error" });
      return;
    }

    const physIdx = findPhysicalIndex(n, cols, rows, startRange, currentGame.numberingDirection);
    if (physIdx === -1) {
      setToast({ text: `Tile #${n} does not exist.`, type: "error" });
      return;
    }

    executePhysicalReveal(physIdx, n);
  }, [isAnswerRevealed, selectedTileInput, cols, rows, startRange, currentGame.numberingDirection, executePhysicalReveal]);

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
          <span className="text-sm font-medium">Initializing Host Controls…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col justify-between font-sans select-none overflow-x-hidden">
      
      {/* ── Toast Notification ── */}
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl border ${
                toast.type === "success"
                  ? "bg-slate-900/95 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-900/95 border-rose-500/50 text-rose-300"
              }`}
            >
              {toast.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* TOP NAVIGATION — PREMIUM INDUSTRIAL DESIGN                              */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <header className="flex-none border-b border-slate-800 bg-[#161b22] px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Industrial Header Badge & Game Name */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md text-xs tracking-widest font-bold uppercase">
                JIDO INDUCTION
              </span>
            </Link>
            <span className="text-slate-700 font-light">|</span>
            <div className="text-xs font-medium text-slate-400">
              Active Game: <span className="text-slate-100 font-semibold">{currentGame.name}</span>
            </div>
          </div>

          {/* Center: Stage Counters */}
          <div className="flex items-center gap-4 text-xs">
            <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
              Image <strong className="text-white">{imageIndex + 1}</strong> of {gamesList.length}
            </div>
            <div className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
              Current Round: <strong className="text-blue-400">{currentRound} / {maxRounds}</strong>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Link href="/admin" title="Admin Portal">
              <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700">
                <Settings size={16} />
              </button>
            </Link>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* CENTER: PROJECTOR DISPLAY (~80% SCREEN OCCUPANCY)                        */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 min-h-0">
        <div
          className="w-full relative flex flex-col items-center justify-center"
          style={{
            maxWidth: `min(calc(${cols / rows * 80}vh), 1100px)`,
          }}
        >
          {/* Large Projector Card */}
          <div className="w-full bg-[#161b22] border border-slate-800 rounded-2xl p-3 shadow-2xl overflow-hidden relative">
            <GameBoard
              imageUrl={currentGame.url}
              revealedTiles={revealedTiles}
              onTileReveal={handleGridClick}
              isPlaying={!isAnswerRevealed}
              cols={cols}
              rows={rows}
              startNumber={currentGame.startNumber}
              numberingDirection={currentGame.numberingDirection}
              tileStyles={currentGame.tileStyles}
            />

            {/* Answer Overlay when Revealed */}
            {isAnswerRevealed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 bg-[#0d1117]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
              >
                <span className="text-blue-400 font-bold uppercase tracking-[0.25em] text-xs mb-2">
                  Correct Answer Revealed
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                  {currentAnswerName}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNextImage}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
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
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* COMPACT FIXED HOST CONTROL PANEL                                        */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <footer className="flex-none bg-[#161b22] border-t border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Host Controls & Selected Tile Form */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Host Controls
            </div>

            {/* Host Tile Input Form */}
            <form onSubmit={handleFormRevealSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={`Tile #${startRange}–${endRange}`}
                value={selectedTileInput}
                onChange={(e) => setSelectedTileInput(e.target.value)}
                disabled={isAnswerRevealed || totalRevealed >= maxRounds}
                className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={isAnswerRevealed || totalRevealed >= maxRounds || !selectedTileInput.trim()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-semibold text-xs rounded-lg border border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Reveal Tile
              </button>
            </form>

            {/* Audience Guess Input Form */}
            <form onSubmit={handleCheckGuessSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type audience guess..."
                value={guestGuessInput}
                onChange={(e) => setGuestGuessInput(e.target.value)}
                disabled={isAnswerRevealed}
                className="w-40 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={isAnswerRevealed || !guestGuessInput.trim()}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Check Guess
              </button>
            </form>
          </div>

          {/* Round Stats & Revealed Tile History */}
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <div>
              Current Round: <strong className="text-white">{currentRound} / {maxRounds}</strong>
            </div>
            <div>
              Remaining Chances: <strong className={totalRevealed >= maxRounds ? "text-rose-400 font-bold" : "text-white"}>{Math.max(0, maxRounds - totalRevealed)}</strong>
            </div>
            {revealedHistory.length > 0 && (
              <div className="hidden xl:block truncate max-w-xs text-slate-400">
                Revealed: <span className="text-slate-300 font-mono">{revealedHistory.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Reveal Answer & Next Image Buttons */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={handleRevealAnswer}
              disabled={isAnswerRevealed}
              className="px-5 py-2 bg-amber-600/90 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <Eye size={15} />
              <span>Reveal Answer</span>
            </button>

            <button
              onClick={handleNextImage}
              disabled={!isAnswerRevealed}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <span>Next Image</span>
              <ChevronRight size={15} />
            </button>
          </div>

        </div>
      </footer>

      {/* Celebration animation when answer is revealed */}
      <Celebration
        show={isAnswerRevealed}
        answer={currentAnswerName}
        mode="REVEALED"
        onClose={() => {}}
      />
    </div>
  );
}
