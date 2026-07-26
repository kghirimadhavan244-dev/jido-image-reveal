"use client";

import React from "react";
import { Tile } from "./Tile";
import { getTileNumber, DEFAULT_TILE_STYLES } from "../data/defaultImages";
import type { TileStyles } from "../data/defaultImages";

interface GameBoardProps {
  imageUrl:           string;
  revealedTiles:      Set<number>;   // physical indices (0-based)
  onTileReveal:       (physicalIdx: number) => void;
  isPlaying:          boolean;
  cols:               number;
  rows:               number;
  startNumber:        number;
  numberingDirection: string;
  tileStyles?:        Partial<TileStyles>;
}

export function GameBoard({
  imageUrl,
  revealedTiles,
  onTileReveal,
  isPlaying,
  cols,
  rows,
  startNumber,
  numberingDirection,
  tileStyles,
}: GameBoardProps) {
  const styles: TileStyles = { ...DEFAULT_TILE_STYLES, ...tileStyles };

  const tiles: Array<{ idx: number; displayNum: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx        = r * cols + c;
      const displayNum = getTileNumber(r, c, cols, rows, startNumber, numberingDirection);
      tiles.push({ idx, displayNum });
    }
  }

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden shadow-2xl select-none bg-slate-950"
      style={{ aspectRatio: `${cols} / ${rows}` }}
    >
      {/* ── Layer 1: Image ── */}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Game image"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <span className="text-slate-600 text-xs font-medium">No image</span>
        </div>
      )}

      {/* ── Layer 2: Tile overlay ── */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows:    `repeat(${rows}, 1fr)`,
          gap:                 `${styles.tileGap}px`,
          padding:             `${styles.tileGap}px`,
        }}
      >
        {tiles.map(({ idx, displayNum }) => (
          <Tile
            key={idx}
            id={displayNum}
            revealed={revealedTiles.has(idx)}
            onReveal={() => onTileReveal(idx)}
            disabled={!isPlaying}
            styles={styles}
          />
        ))}
      </div>
    </div>
  );
}
