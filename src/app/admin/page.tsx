"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  PRESET_IMAGES,
  PresetImage,
  DEFAULT_GAME,
  DEFAULT_TILE_STYLES,
  TileStyles,
  loadGames,
  saveGames,
  loadActiveId,
  saveActiveId,
} from "../../data/defaultImages";
import { GameBoard } from "../../components/GameBoard";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Image as ImageIcon,
  ChevronRight,
  Check,
  RefreshCw,
  Upload,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminView = "library" | "edit";

const EMPTY_FORM: Omit<PresetImage, "id" | "createdDate"> = {
  url:                "",
  name:               "",
  answer:             "",
  category:           "",
  difficulty:         "Medium",
  hint:               "",
  description:        "",
  gridCols:           10,
  gridRows:           5,
  revealCount:        5,
  enableHints:        true,
  enableTimer:        false,
  countdownEnabled:   false,
  shuffleEnabled:     false,
  startNumber:        1,
  numberingDirection: "left-right",
  tileStyles:         { ...DEFAULT_TILE_STYLES },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeInt(v: string, fallback: number): number {
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
}
function safeFloat(v: string, fallback: number): number {
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}
function numStr(v: number): string {
  return isNaN(v) ? "" : String(v);
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DifficultyBadge({ d }: { d: "Easy" | "Medium" | "Hard" }) {
  const cls = {
    Easy:   "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    Hard:   "bg-red-100 text-red-700",
  }[d];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {d}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, required, type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}

function NumberInput({
  value, onChange, min, max, step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={numStr(value)}
      onChange={(e) => {
        const n = safeInt(e.target.value, value);
        if (min !== undefined && n < min) return;
        if (max !== undefined && n > max) return;
        onChange(n);
      }}
      min={min}
      max={max}
      step={step}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}

function Toggle({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-none ${
          checked ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function ColorInput({
  value, onChange, label,
}: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5"
      />
      <span className="text-xs text-slate-600">{label}</span>
    </div>
  );
}

// ─── Image upload component ───────────────────────────────────────────────────
// ─── Multi Image upload component ─────────────────────────────────────────────
function ImageUpload({
  value,
  images = [],
  imageTitles = [],
  imageAnswers = [],
  onChange,
}: {
  value: string;
  images?: string[];
  imageTitles?: string[];
  imageAnswers?: string[];
  onChange: (mainUrl: string, imagesList: string[], titlesList: string[], answersList: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Combine into a list
  const currentList = images.length > 0 ? images : value ? [value] : [];
  const titles = currentList.map((_, i) => imageTitles[i] ?? `Slide ${i + 1}`);
  const answers = currentList.map((_, i) => imageAnswers[i] ?? "");

  const readFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    let pending = files.length;
    const newUrls: string[] = [];
    const newTitles: string[] = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          newUrls.push(e.target.result);
          const baseName = file.name.replace(/\.[^.]+$/, "");
          newTitles.push(baseName);
        }
        pending--;
        if (pending === 0) {
          const updatedImages = [...currentList, ...newUrls];
          const updatedTitles = [...titles, ...newTitles];
          const updatedAnswers = [...answers, ...newUrls.map(() => "")];
          onChange(updatedImages[0] ?? "", updatedImages, updatedTitles, updatedAnswers);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    readFiles(e.dataTransfer.files);
  };

  const removeImageAt = (index: number) => {
    const updatedImages = currentList.filter((_, i) => i !== index);
    const updatedTitles = titles.filter((_, i) => i !== index);
    const updatedAnswers = answers.filter((_, i) => i !== index);
    onChange(updatedImages[0] ?? "", updatedImages, updatedTitles, updatedAnswers);
  };

  const updateTitleAt = (index: number, newTitle: string) => {
    const updated = [...titles];
    updated[index] = newTitle;
    onChange(currentList[0] ?? "", currentList, updated, answers);
  };

  const updateAnswerAt = (index: number, newAnswer: string) => {
    const updated = [...answers];
    updated[index] = newAnswer;
    onChange(currentList[0] ?? "", currentList, titles, updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FieldLabel>Game Images ({currentList.length})</FieldLabel>
        {currentList.length > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
          >
            + Add Image
          </button>
        )}
      </div>

      {currentList.length > 0 ? (
        /* Image gallery grid with title & answer inputs */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentList.map((imgUrl, idx) => (
            <div
              key={idx}
              className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden p-3 space-y-2.5 shadow-2xs"
            >
              {/* Image Thumbnail */}
              <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-semibold rounded-full backdrop-blur-xs">
                  Image {idx + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeImageAt(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Title & Answer Inputs */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Image Name / Title
                  </label>
                  <input
                    type="text"
                    value={titles[idx] ?? ""}
                    onChange={(e) => updateTitleAt(idx, e.target.value)}
                    placeholder={`e.g. Round ${idx + 1} — Image Name`}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Answer (Optional)
                  </label>
                  <input
                    type="text"
                    value={answers[idx] ?? ""}
                    onChange={(e) => updateAnswerAt(idx, e.target.value)}
                    placeholder="e.g. Hidden object answer"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors aspect-video ${
            dragging
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <ImageIcon size={28} className="text-slate-300" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">
              Click to upload or drag &amp; drop images
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Upload one or multiple images for this game</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          readFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Main admin component ─────────────────────────────────────────────────────
export default function AdminPage() {
  const [mounted,    setMounted]    = useState(false);
  const [gamesList,  setGamesList]  = useState<PresetImage[]>([]);
  const [activeId,   setActiveId]   = useState<string>("");
  const [view,       setView]       = useState<AdminView>("library");
  const [editingId,  setEditingId]  = useState<string | null>(null);   // null = new

  // ── Form state ──
  const [form, setForm] = useState<Omit<PresetImage, "id" | "createdDate">>(EMPTY_FORM);

  // ── Merge helper ──
  const setField = useCallback(
    <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
      setForm((prev) => ({ ...prev, [k]: v })),
    [],
  );
  const setStyle = useCallback(
    <K extends keyof TileStyles>(k: K, v: TileStyles[K]) =>
      setForm((prev) => ({ ...prev, tileStyles: { ...prev.tileStyles, [k]: v } })),
    [],
  );

  // ── Mount ──
  useEffect(() => {
    const games = loadGames();
    const migrated = games.map((g) => ({
      ...DEFAULT_GAME,
      ...g,
      tileStyles: g.tileStyles ?? DEFAULT_TILE_STYLES,
    } as PresetImage));
    setGamesList(migrated);
    setActiveId(loadActiveId() ?? "");
    setMounted(true);
  }, []);

  // ── Persist ──
  const persist = useCallback((list: PresetImage[]) => {
    setGamesList(list);
    saveGames(list);
  }, []);

  // ── Open edit form ──
  const openEdit = useCallback((game: PresetImage) => {
    const { id: _, createdDate: __, ...rest } = game;
    setForm({ ...EMPTY_FORM, ...rest, tileStyles: { ...DEFAULT_TILE_STYLES, ...rest.tileStyles } });
    setEditingId(game.id);
    setView("edit");
  }, []);

  const openNew = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setView("edit");
  }, []);

  const closeEdit = useCallback(() => {
    setView("library");
    setEditingId(null);
  }, []);

  // ── Save form ──
  const handleSave = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      const updated = gamesList.map((g) =>
        g.id === editingId ? { ...g, ...form } : g,
      );
      persist(updated);
    } else {
      const newGame: PresetImage = {
        ...form,
        id:          `game-${Date.now()}`,
        createdDate: new Date().toISOString(),
      };
      persist([...gamesList, newGame]);
    }
    closeEdit();
  }, [editingId, form, gamesList, persist, closeEdit]);

  // ── Delete ──
  const handleDelete = useCallback((id: string) => {
    persist(gamesList.filter((g) => g.id !== id));
    if (activeId === id) {
      setActiveId("");
      localStorage.removeItem("jido_active_preset_id");
    }
  }, [gamesList, activeId, persist]);

  // ── Set active ──
  const handleSetActive = useCallback((id: string) => {
    setActiveId(id);
    saveActiveId(id);
  }, []);

  // ── Restore presets ──
  const handleRestoreDefaults = useCallback(() => {
    if (!confirm("Replace all games with the default presets?")) return;
    persist([...PRESET_IMAGES]);
    setActiveId("");
    localStorage.removeItem("jido_active_preset_id");
  }, [persist]);

  // ── Bulk image upload ──
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const handleBulkUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      let remaining = files.length;
      const newGames: PresetImage[] = [];

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) { remaining--; return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (typeof ev.target?.result === "string") {
            const baseName = file.name.replace(/\.[^.]+$/, "");
            newGames.push({
              ...EMPTY_FORM,
              id:          `game-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdDate: new Date().toISOString(),
              url:         ev.target.result,
              name:        baseName,
              answer:      baseName,
            } as PresetImage);
          }
          remaining--;
          if (remaining === 0) {
            persist([...gamesList, ...newGames]);
          }
        };
        reader.readAsDataURL(file);
      });

      // Reset the input so the same files can be re-selected
      e.target.value = "";
    },
    [gamesList, persist],
  );

  // ─── Preview game (derived from form) ─────────────────────────────────────
  const previewGame: PresetImage = {
    id:          editingId ?? "preview",
    createdDate: "",
    ...form,
  };

  if (!mounted) {
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
      </div>
    );
  }

  // ─── Library view ─────────────────────────────────────────────────────────
  if (view === "library") {
    return (
      <div className="h-full bg-slate-50 flex flex-col">
        {/* Header */}
        <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900">JIDO</span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-sm text-slate-600 font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Restore default games"
            >
              <RefreshCw size={13} />
              Restore defaults
            </button>

            {/* Bulk upload */}
            <button
              onClick={() => bulkInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Upload multiple images at once — each becomes a new game"
            >
              <Upload size={13} />
              Upload Images
            </button>
            <input
              ref={bulkInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleBulkUpload}
            />

            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} />
              New Game
            </button>
            <Link href="/">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer">
                <ArrowLeft size={13} />
                Game Screen
              </button>
            </Link>
          </div>
        </header>

        {/* Game cards */}
        <div className="flex-1 overflow-y-auto p-6">
          {gamesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <ImageIcon size={40} className="mb-4 opacity-30" />
              <p className="text-sm font-medium">No games yet.</p>
              <p className="text-xs mt-1">
                Click <strong>Upload Images</strong> to bulk-add from files, or{" "}
                <strong>New Game</strong> to build one manually.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gamesList.map((game) => (
                <div
                  key={game.id}
                  className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-all ${
                    activeId === game.id ? "border-blue-500" : "border-slate-200"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    {game.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={game.url}
                        alt={game.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={28} />
                      </div>
                    )}
                    {activeId === game.id && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-blue-600 rounded-full text-[10px] text-white font-semibold">
                        <Check size={10} />
                        Active
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <DifficultyBadge d={game.difficulty} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{game.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 mb-3">
                      {game.gridCols}×{game.gridRows} grid · {game.revealCount} rounds
                      {game.images && game.images.length > 1 ? ` · ${game.images.length} slides` : ""}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSetActive(game.id)}
                        disabled={activeId === game.id}
                        className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs text-slate-600 font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Set active
                      </button>
                      <button
                        onClick={() => openEdit(game)}
                        className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="p-1.5 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Edit / Create view ────────────────────────────────────────────────────
  const maxTiles = form.gridCols * form.gridRows;

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={closeEdit}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-semibold text-slate-900 text-sm">
            {editingId ? "Edit Game" : "New Game"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={closeEdit}
            className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            form="game-form"
            type="submit"
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {editingId ? "Save changes" : "Create game"}
          </button>
        </div>
      </header>

      {/* Two-column body */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

        {/* ── Form column ── */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="game-form" onSubmit={handleSave} className="max-w-xl space-y-8">

            {/* ── Image & identity ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Image & Identity</h3>

              <ImageUpload
                value={form.url}
                images={form.images}
                imageTitles={form.imageTitles}
                imageAnswers={form.imageAnswers}
                onChange={(mainUrl, imagesList, titlesList, answersList) => {
                  setForm((prev) => ({
                    ...prev,
                    url: mainUrl,
                    images: imagesList,
                    imageTitles: titlesList,
                    imageAnswers: answersList,
                  }));
                }}
              />

              <div>
                <FieldLabel>Game Name</FieldLabel>
                <TextInput
                  value={form.name}
                  onChange={(v) => setField("name", v)}
                  placeholder="Round 1 — Robotics"
                  required
                />
              </div>

              <div>
                <FieldLabel>Answer</FieldLabel>
                <TextInput
                  value={form.answer}
                  onChange={(v) => setField("answer", v)}
                  placeholder="What is shown in the image?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Category</FieldLabel>
                  <TextInput
                    value={form.category}
                    onChange={(v) => setField("category", v)}
                    placeholder="e.g. Robotics"
                  />
                </div>
                <div>
                  <FieldLabel>Difficulty</FieldLabel>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setField("difficulty", e.target.value as "Easy" | "Medium" | "Hard")}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <FieldLabel>Hint (optional)</FieldLabel>
                <TextInput
                  value={form.hint ?? ""}
                  onChange={(v) => setField("hint", v)}
                  placeholder="A clue shown to players"
                />
              </div>
            </section>

            {/* ── Grid ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Grid</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <FieldLabel>Columns</FieldLabel>
                  <NumberInput
                    value={form.gridCols}
                    onChange={(v) => {
                      const c = clamp(v, 1, 30);
                      setField("gridCols", c);
                      setField("revealCount", Math.min(form.revealCount, c * form.gridRows));
                    }}
                    min={1} max={30}
                  />
                </div>
                <div>
                  <FieldLabel>Rows</FieldLabel>
                  <NumberInput
                    value={form.gridRows}
                    onChange={(v) => {
                      const r = clamp(v, 1, 20);
                      setField("gridRows", r);
                      setField("revealCount", Math.min(form.revealCount, form.gridCols * r));
                    }}
                    min={1} max={20}
                  />
                </div>
                <div>
                  <FieldLabel>Max Rounds</FieldLabel>
                  <NumberInput
                    value={form.revealCount}
                    onChange={(v) => setField("revealCount", clamp(v, 1, maxTiles))}
                    min={1} max={maxTiles}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Total tiles: {maxTiles} · Max rounds capped at total tiles
              </p>
            </section>

            {/* ── Tile numbering ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Tile Numbering</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Start Number</FieldLabel>
                  <NumberInput
                    value={form.startNumber}
                    onChange={(v) => setField("startNumber", Math.max(0, v))}
                    min={0}
                  />
                </div>
                <div>
                  <FieldLabel>Direction</FieldLabel>
                  <select
                    value={form.numberingDirection}
                    onChange={(e) => setField("numberingDirection", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="left-right">Left → Right</option>
                    <option value="right-left">Right → Left</option>
                    <option value="top-bottom">Top → Bottom</option>
                    <option value="bottom-top">Bottom → Top</option>
                    <option value="snake">Snake</option>
                    <option value="zigzag">Zigzag</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ── Tile appearance ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Tile Appearance</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Tile Gap (px)</FieldLabel>
                  <NumberInput
                    value={form.tileStyles.tileGap}
                    onChange={(v) => setStyle("tileGap", clamp(v, 0, 20))}
                    min={0} max={20}
                  />
                </div>
                <div>
                  <FieldLabel>Corner Radius (px)</FieldLabel>
                  <NumberInput
                    value={form.tileStyles.cornerRadius}
                    onChange={(v) => setStyle("cornerRadius", clamp(v, 0, 24))}
                    min={0} max={24}
                  />
                </div>
                <div>
                  <FieldLabel>Border Thickness (px)</FieldLabel>
                  <NumberInput
                    value={form.tileStyles.borderThickness}
                    onChange={(v) => setStyle("borderThickness", clamp(v, 0, 6))}
                    min={0} max={6}
                  />
                </div>
                <div>
                  <FieldLabel>Font Size (px)</FieldLabel>
                  <NumberInput
                    value={form.tileStyles.fontSize}
                    onChange={(v) => setStyle("fontSize", clamp(v, 8, 32))}
                    min={8} max={32}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Background Opacity</FieldLabel>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0} max={1} step={0.01}
                    value={form.tileStyles.bgOpacity}
                    onChange={(e) => setStyle("bgOpacity", safeFloat(e.target.value, 0.88))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="text-xs text-slate-500 w-10 text-right">
                    {Math.round(form.tileStyles.bgOpacity * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <ColorInput
                  value={form.tileStyles.numberColor}
                  onChange={(v) => setStyle("numberColor", v)}
                  label="Number color"
                />
                <ColorInput
                  value={form.tileStyles.borderColor}
                  onChange={(v) => setStyle("borderColor", v)}
                  label="Border color"
                />
              </div>
            </section>

            {/* ── Game rules ── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Game Rules</h3>

              <div className="space-y-3">
                <Toggle
                  checked={form.enableHints}
                  onChange={(v) => setField("enableHints", v)}
                  label="Hints enabled"
                />
                <Toggle
                  checked={form.enableTimer}
                  onChange={(v) => setField("enableTimer", v)}
                  label="Timer enabled"
                />
                <Toggle
                  checked={form.countdownEnabled}
                  onChange={(v) => setField("countdownEnabled", v)}
                  label="Countdown between rounds"
                />
                <Toggle
                  checked={form.shuffleEnabled}
                  onChange={(v) => setField("shuffleEnabled", v)}
                  label="Shuffle tile order"
                />
              </div>
            </section>

          </form>
        </div>

        {/* ── Live preview column ── */}
        <div className="lg:w-80 xl:w-96 flex-none border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Live Preview</h3>
            <p className="text-xs text-slate-400">Updates as you change settings.</p>
          </div>

          {/* Mini board */}
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <GameBoard
              imageUrl={previewGame.url}
              revealedTiles={new Set()}
              onTileReveal={() => {}}
              isPlaying={false}
              cols={previewGame.gridCols}
              rows={previewGame.gridRows}
              startNumber={previewGame.startNumber}
              numberingDirection={previewGame.numberingDirection}
              tileStyles={previewGame.tileStyles}
            />
          </div>

          {/* Info summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Grid</span>
              <span className="font-medium">{form.gridCols} × {form.gridRows}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total tiles</span>
              <span className="font-medium">{maxTiles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Max rounds</span>
              <span className="font-medium">{form.revealCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Start number</span>
              <span className="font-medium">{form.startNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Direction</span>
              <span className="font-medium capitalize">{form.numberingDirection.replace("-", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Number range</span>
              <span className="font-medium">
                {form.startNumber} – {form.startNumber + maxTiles - 1}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
