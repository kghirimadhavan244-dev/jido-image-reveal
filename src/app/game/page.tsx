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
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type GameStatus = "PLAYING" | "GAME_OVER" | "REVEALED" | "WON";

const LOADING_IMAGE: PresetImage = {
  id:                 "loading",
  url:                "",
  name:               "Loading…",
  answer:             "",
  category:           "",
  difficulty:         "Medium",
  createdDate:        "",
  gridCols:           10,
  gridRows:           5,
  revealCount:        5,
  enableHints:        false,
  enableTimer:        false,
  countdownEnabled:   false,
  shuffleEnabled:     false,
  startNumber:        1,
  numberingDirection: "left-right",
  tileStyles: {
    cornerRadius:    4,
    borderThickness: 1,
    fontSize:        12,
    numberColor:     "#94A3B8",
    borderColor:     "#334155",
    bgOpacity:       0.88,
    tileGap:         3,
  },
};

// ─── Audio helpers ────────────────────────────────────────────────────────────
function playTone(freq: number, duration: number, volume = 0.12): void {
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function GameScreen() {
  // ── Hydration guard ──
  const [mounted, setMounted] = useState(false);

  // ── Game library ──
  const [gamesList,   setGamesList]   = useState<PresetImage[]>([]);
  const [imageIndex,  setImageIndex]  = useState(0);
  const [currentGame, setCurrentGame] = useState<PresetImage>(LOADING_IMAGE);

  // ── Game state ──
  const [gameStarted,        setGameStarted]        = useState(false);
  const [revealedTiles,      setRevealedTiles]      = useState<Set<number>>(new Set());
  const [revealHistory,      setRevealHistory]      = useState<number[]>([]);   // display numbers in order
  const [gameStatus,         setGameStatus]         = useState<GameStatus>("PLAYING");
  const [currentRound,       setCurrentRound]       = useState(1);
  const [revealsThisRound,   setRevealsThisRound]   = useState(0);

  // ── UI state ──
  const [showControls,   setShowControls]   = useState(true);
  const [eventMode,      setEventMode]      = useState(false);
  const [isFullscreen,   setIsFullscreen]   = useState(false);
  const [inputTile,      setInputTile]      = useState("");
  const [toast,          setToast]          = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [transitionRound, setTransitionRound] = useState<number | null>(null);
  const [countdown,       setCountdown]       = useState<number | "GO" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Derived values ──
  const maxRounds     = currentGame.revealCount;
  const cols          = currentGame.gridCols;
  const rows          = currentGame.gridRows;
  const isLastRound   = currentRound >= maxRounds;
  const roundDone     = revealsThisRound >= 1;
  const isGameOver    = gameStatus === "GAME_OVER";
  const isRevealed    = gameStatus === "REVEALED" || gameStatus === "WON";
  const canReveal     = gameStarted && !roundDone && !isGameOver && !isRevealed && gameStatus === "PLAYING";
  const canNextRound  = gameStarted && roundDone && !isLastRound && gameStatus === "PLAYING";
  const canRevealAns  = gameStarted && (isGameOver || (isLastRound && roundDone));

  // ── Toast auto-dismiss ──
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Mount: load games ──
  useEffect(() => {
    const games = loadGames();
    // Migrate any old presets that lack tileStyles
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
    setMounted(true);
  }, []);

  // ── Fullscreen listener ──
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    if (!mounted) return;
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key.toUpperCase()) {
        case "F": e.preventDefault(); toggleFullscreen();      break;
        case "E": e.preventDefault(); toggleEventMode();       break;
        case "H": e.preventDefault(); setShowControls((p) => !p); break;
        case "R": e.preventDefault(); handleReset();           break;
        case "N": e.preventDefault(); handleNextImage();       break;
        case "P": e.preventDefault(); handlePrevImage();       break;
        case "A": e.preventDefault(); handleRevealAnswer();    break;
        default:  break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mounted, gamesList, imageIndex, currentGame]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }, []);

  const toggleEventMode = useCallback(() => {
    setEventMode((prev) => {
      if (!prev && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      if (!prev) setShowControls(false);
      return !prev;
    });
  }, []);

  function playRoundTransition(roundNumber: number) {
    setTransitionRound(roundNumber);
    setCountdown(3);
    playTone(440, 0.3);
    setTimeout(() => { setCountdown(2); playTone(440, 0.3); }, 1000);
    setTimeout(() => { setCountdown(1); playTone(440, 0.3); }, 2000);
    setTimeout(() => { setCountdown("GO"); playTone(880, 0.5, 0.18); }, 3000);
    setTimeout(() => {
      setTransitionRound(null);
      setCountdown(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }, 3800);
  }

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    setRevealedTiles(new Set());
    setRevealHistory([]);
    setGameStatus("PLAYING");
    setCurrentRound(1);
    setRevealsThisRound(0);
    setInputTile("");
    playRoundTransition(1);
  }, []);

  const handleRevealTile = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canReveal) return;

    const n = parseInt(inputTile.trim(), 10);
    if (isNaN(n)) {
      setToast({ text: "Enter a valid tile number.", type: "error" });
      return;
    }

    const physIdx = findPhysicalIndex(
      n,
      cols,
      rows,
      currentGame.startNumber,
      currentGame.numberingDirection,
    );

    if (physIdx === -1) {
      setToast({ text: `Tile ${n} does not exist.`, type: "error" });
      return;
    }

    if (revealedTiles.has(physIdx)) {
      setToast({ text: `Tile ${n} is already revealed.`, type: "error" });
      return;
    }

    const next = new Set(revealedTiles);
    next.add(physIdx);
    setRevealedTiles(next);
    setRevealHistory((prev) => [...prev, n]);
    setRevealsThisRound(1);
    setInputTile("");
    setToast({ text: `Tile ${n} revealed.`, type: "success" });

    if (isLastRound) {
      setGameStatus("GAME_OVER");
    }
  }, [canReveal, inputTile, cols, rows, currentGame, revealedTiles, isLastRound]);

  const handleNextRound = useCallback(() => {
    if (!canNextRound) return;
    const next = currentRound + 1;
    setCurrentRound(next);
    setRevealsThisRound(0);
    setInputTile("");

    // If game has multiple image slides for rounds, advance image URL to slide (next - 1)
    if (currentGame.images && currentGame.images.length > 1) {
      const slideIndex = (next - 1) % currentGame.images.length;
      setCurrentGame((prev) => ({
        ...prev,
        url: prev.images![slideIndex],
      }));
    }

    playRoundTransition(next);
  }, [canNextRound, currentRound, currentGame]);

  const handleRevealAnswer = useCallback(() => {
    if (!gameStarted) return;
    // Reveal all tiles (use physical 0-based indices)
    const all = new Set(Array.from({ length: cols * rows }, (_, i) => i));
    setRevealedTiles(all);
    setGameStatus("REVEALED");
    setInputTile("");
  }, [gameStarted, cols, rows]);

  const handleMarkWinner = useCallback(() => {
    setGameStatus("WON");
  }, []);

  const handleReset = useCallback(() => {
    setRevealedTiles(new Set());
    setRevealHistory([]);
    setGameStatus("PLAYING");
    setCurrentRound(1);
    setRevealsThisRound(0);
    setGameStarted(false);
    setInputTile("");
    setToast(null);
    setTransitionRound(null);
    setCountdown(null);
  }, []);

  const switchToGame = useCallback((game: PresetImage, idx: number) => {
    setCurrentGame(game);
    setImageIndex(idx);
    handleReset();
  }, [handleReset]);

  const handleNextImage = useCallback(() => {
    if (gamesList.length === 0) return;
    const next = (imageIndex + 1) % gamesList.length;
    switchToGame(gamesList[next], next);
    setToast({ text: `Loaded: ${gamesList[next].name}`, type: "success" });
  }, [gamesList, imageIndex, switchToGame]);

  const handlePrevImage = useCallback(() => {
    if (gamesList.length === 0) return;
    const prev = (imageIndex - 1 + gamesList.length) % gamesList.length;
    switchToGame(gamesList[prev], prev);
    setToast({ text: `Loaded: ${gamesList[prev].name}`, type: "success" });
  }, [gamesList, imageIndex, switchToGame]);

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const startRange = currentGame.startNumber;
  const endRange   = startRange + cols * rows - 1;
  const roundLabel = gameStarted
    ? `Round ${currentRound} / ${maxRounds}`
    : "Not started";

  // ─── Loading state ────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="h-full bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 rounded-full border-2 border-slate-700 border-t-slate-400 animate-spin" />
          <span className="text-sm font-medium">Loading games…</span>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className={`h-full flex flex-col relative select-none overflow-hidden ${
        eventMode ? "bg-black" : "bg-[#0a0a0f]"
      }`}
    >

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.18 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
          >
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium shadow-xl border ${
                toast.type === "success"
                  ? "bg-slate-900 border-emerald-800/60 text-emerald-400"
                  : "bg-slate-900 border-red-800/60 text-red-400"
              }`}
            >
              {toast.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      {!eventMode && (
        <header className="flex-none flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white font-bold text-sm tracking-wide hover:text-blue-400 transition-colors">
              JIDO
            </Link>
            <span className="text-slate-600 text-sm">/</span>
            <span className="text-slate-300 text-sm font-medium truncate max-w-xs">
              {currentGame.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
              {roundLabel}
            </span>
            <Link href="/admin">
              <button
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Admin portal"
              >
                <Settings size={16} />
              </button>
            </Link>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? "Exit fullscreen [F]" : "Fullscreen [F]"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => setShowControls((p) => !p)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Toggle controls [H]"
            >
              {showControls ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </button>
          </div>
        </header>
      )}

      {/* ── Game board area ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-0">
        {/* Event mode minimal header */}
        {eventMode && (
          <div className="absolute top-4 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
            <span className="text-white/60 text-sm font-semibold">
              {currentGame.name}
            </span>
            <span className="text-white/40 text-xs font-medium">
              {roundLabel}
            </span>
          </div>
        )}

        <div
          className="w-full max-h-full"
          style={{
            maxWidth: eventMode
              ? `calc(${cols / rows * 90}vh)`
              : `min(calc(${cols / rows * 75}vh), 900px)`,
          }}
        >
          <GameBoard
            imageUrl={currentGame.url}
            revealedTiles={gameStarted ? revealedTiles : new Set()}
            onTileReveal={() => {}}
            isPlaying={false}
            cols={cols}
            rows={rows}
            startNumber={currentGame.startNumber}
            numberingDirection={currentGame.numberingDirection}
            tileStyles={currentGame.tileStyles}
          />
        </div>
      </div>

      {/* ── Status bar (non-event mode) ── */}
      {!eventMode && (
        <footer className="flex-none flex items-center justify-between px-5 py-2.5 border-t border-white/5 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Tiles revealed:&nbsp;
              <span className="text-slate-300 font-medium">{revealedTiles.size}</span>
            </span>
            {revealHistory.length > 0 && (
              <span className="truncate max-w-xs text-slate-600">
                {revealHistory.join(", ")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleEventMode}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
              title="Present mode [E]"
            >
              Present
            </button>
          </div>
        </footer>
      )}

      {/* ── Host Controls Drawer ── */}
      <AnimatePresence>
        {showControls && (
          <motion.aside
            key="controls"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-40 w-72 bg-white shadow-2xl flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Host Controls</h2>
              <button
                onClick={() => setShowControls(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Round info */}
              <div className="bg-slate-50 rounded-xl p-4 text-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Progress</span>
                  <span className="text-slate-700 font-semibold text-xs">{roundLabel}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: gameStarted
                        ? `${((currentRound - (roundDone ? 0 : 1)) / maxRounds) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Status banners */}
              {roundDone && !isLastRound && gameStatus === "PLAYING" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 font-medium">
                  Round complete — click Next Round to continue.
                </div>
              )}
              {(isGameOver || (isLastRound && roundDone)) && !isRevealed && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                  All rounds complete — reveal the answer when ready.
                </div>
              )}

              {/* Tile reveal form */}
              <form onSubmit={handleRevealTile} className="space-y-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Reveal Tile
                </label>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={`${startRange}–${endRange}`}
                    value={inputTile}
                    onChange={(e) => setInputTile(e.target.value)}
                    disabled={!canReveal}
                    className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-40 disabled:bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={!canReveal || !inputTile.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Reveal
                  </button>
                </div>
              </form>

              {/* Actions */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Actions
                </label>

                <button
                  onClick={handleStartGame}
                  disabled={gameStarted}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Play size={15} />
                  Start Game
                </button>

                <button
                  onClick={handleNextRound}
                  disabled={!canNextRound}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <SkipForward size={15} />
                  Next Round
                </button>

                <button
                  onClick={handleRevealAnswer}
                  disabled={!canRevealAns || isRevealed}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Eye size={15} />
                  Reveal Answer
                </button>

                {gameStatus === "PLAYING" && gameStarted && (
                  <button
                    onClick={handleMarkWinner}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Trophy size={15} />
                    Mark Winner
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw size={15} />
                  Reset Game
                </button>
              </div>

              {/* Image navigation */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Images ({imageIndex + 1} / {gamesList.length})
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevImage}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {gamesList.map((g, i) => (
                    <button
                      key={g.id}
                      onClick={() => switchToGame(g, i)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        i === imageIndex
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reveal history */}
              {revealHistory.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Revealed tiles
                  </label>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {revealHistory.join(", ")}
                  </p>
                </div>
              )}

            </div>

            {/* Drawer footer */}
            <div className="flex-none px-5 py-4 border-t border-slate-100">
              <Link href="/admin">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition-colors cursor-pointer">
                  <Settings size={14} />
                  Open Admin
                </button>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Controls toggle (event mode) ── */}
      {eventMode && (
        <button
          onClick={() => setShowControls((p) => !p)}
          className="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer backdrop-blur-sm"
          title="Toggle controls [H]"
        >
          {showControls ? "Hide Controls" : "Controls"}
        </button>
      )}

      {/* ── Toggle button (normal mode, drawer closed) ── */}
      {!eventMode && !showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-slate-900 text-xs font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
          title="Show controls [H]"
        >
          <PanelRightOpen size={15} />
          Controls
        </button>
      )}

      {/* ── Round transition overlay ── */}
      <AnimatePresence>
        {transitionRound !== null && (
          <motion.div
            key="round-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-500 text-xs font-medium uppercase tracking-[0.25em] mb-3"
            >
              {transitionRound === 1 ? "Game starting" : "Next round"}
            </motion.p>
            <motion.h2
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              transition={{ type: "spring", damping: 18, stiffness: 140 }}
              className="text-5xl sm:text-6xl font-bold text-white mb-6 tracking-tight"
            >
              Round {transitionRound}
            </motion.h2>

            <div className="h-20 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={String(countdown)}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  exit={{    scale: 1.4, opacity: 0 }}
                  transition={{ type: "spring", damping: 16, stiffness: 200 }}
                  className={`font-bold tabular-nums ${
                    countdown === "GO"
                      ? "text-emerald-400 text-5xl"
                      : "text-slate-400 text-4xl"
                  }`}
                >
                  {countdown}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Celebration / answer reveal ── */}
      <Celebration
        show={isRevealed}
        answer={currentGame.answer}
        mode={gameStatus === "WON" ? "WON" : "REVEALED"}
        onClose={handleReset}
      />
    </div>
  );
}
