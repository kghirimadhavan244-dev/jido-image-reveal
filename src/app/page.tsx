"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Settings,
  Sparkles,
  Grid,
  Tv,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  loadGames,
  loadActiveId,
  PresetImage,
} from "../data/defaultImages";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeGame, setActiveGame] = useState<PresetImage | null>(null);
  const [totalGames, setTotalGames] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    const games = loadGames();
    const activeId = loadActiveId();
    setTotalGames(games.length);
    const current = games.find((g) => g.id === activeId) || games[0] || null;
    setActiveGame(current);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900">
      
      {/* ── Header / Navigation ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* JIDO Clean Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold tracking-wider text-base shadow-sm">
              JIDO
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline-block">
              Reveal Arena
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200">
                <Settings size={14} />
                Admin Portal
              </button>
            </Link>
            <Link href="/game">
              <button className="flex items-center gap-2 px-4.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer">
                <Play size={14} fill="currentColor" />
                Launch Arena
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-12">
        
        {/* ── Hero Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Introduction */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles size={13} />
              <span>College Events & Induction Game</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Interactive Image Reveal Stage Game
            </h1>

            <p className="text-slate-600 text-base max-w-xl leading-relaxed">
              Welcome to the official <strong>JIDO Induction Stage Game</strong>. Test participants' observation and rapid recognition skills as hidden images are revealed tile by tile in live event rounds.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href="/game">
                <button className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer">
                  <Play size={16} fill="currentColor" />
                  Launch Game Stage
                  <ArrowRight size={16} className="ml-1 opacity-80" />
                </button>
              </Link>

              <Link href="/admin">
                <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-sm font-semibold transition-colors cursor-pointer shadow-sm">
                  <Settings size={16} />
                  Admin Portal
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Stage Overview Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Stage Game</span>
                  <h3 className="text-base font-bold text-slate-900 truncate max-w-[200px]">
                    {activeGame ? activeGame.name : "No Game Selected"}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready
                </span>
              </div>

              {/* Image Preview */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                {activeGame?.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={activeGame.url} 
                      alt={activeGame.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md">
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Layers size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500">No active game loaded</p>
                  </div>
                )}
              </div>

              {/* Specs */}
              <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Library Games</span>
                  <span className="font-semibold text-slate-900">{totalGames} Loaded</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Stage Grid</span>
                  <span className="font-semibold text-slate-900">
                    {activeGame ? `${activeGame.gridCols} × ${activeGame.gridRows} tiles` : "10 × 5"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Max Reveals</span>
                  <span className="font-semibold text-slate-900">
                    {activeGame ? `${activeGame.revealCount} Turns` : "5 Rounds"}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <Link href="/game" className="block">
                <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Play size={14} fill="currentColor" />
                  Launch Game Stage Now
                </button>
              </Link>
            </div>
          </motion.div>

        </div>

        {/* ── Game Rules Section ── */}
        <section className="pt-4 space-y-6">
          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Game Rules & How It Works
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Simple, high-energy stage competition rules for teams and audience participants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pick Tile Numbers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Participants take turns calling out a numbered tile from the grid. The stage host types the number to reveal it.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">Reveal Image Section</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The tile animates open, making that portion of the image underneath visible to the entire audience.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">Guess & Score Points</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Teams attempt to guess the hidden object or concept. Correct guesses with fewer tiles revealed earn maximum points!
              </p>
            </div>

          </div>
        </section>

        {/* ── Key Features ── */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Tv size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Projector Mode</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-700">E</kbd> for fullscreen clean display.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Grid size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Flexible Grid Options</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Custom row/col counts, starting numbers & patterns.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Zap size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Host Shortcuts</h4>
              <p className="text-[11px] text-slate-500 mt-0.5"><kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-700">H</kbd> Controls, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-700">A</kbd> Answer, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-700">R</kbd> Reset.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Offline App</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Runs offline with zero internet requirements.</p>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500 mt-auto">
        <p>JIDO Reveal Arena — Stage Presentation System for College Events & Induction</p>
      </footer>
    </div>
  );
}
