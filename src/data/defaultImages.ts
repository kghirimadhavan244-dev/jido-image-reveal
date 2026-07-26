// ─── Tile visual style overrides ────────────────────────────────────────────
export interface TileStyles {
  cornerRadius:    number; // px
  borderThickness: number; // px
  fontSize:        number; // px
  numberColor:     string; // css color
  borderColor:     string; // css color
  bgOpacity:       number; // 0–1
  tileGap:         number; // px
}

export const DEFAULT_TILE_STYLES: TileStyles = {
  cornerRadius:    4,
  borderThickness: 1,
  fontSize:        12,
  numberColor:     "#94A3B8",
  borderColor:     "#334155",
  bgOpacity:       1,
  tileGap:         3,
};

export interface ImageItem {
  url:    string;
  title?: string;
  answer?: string;
}

export interface PresetImage {
  id:          string;
  url:         string;
  images?:     string[]; // optional list of multiple images for multi-round games
  imageTitles?: string[]; // optional title per image slide
  imageAnswers?: string[]; // optional answer per image slide
  name:        string;   // game / round name
  answer:      string;
  category:    string;
  difficulty:  "Easy" | "Medium" | "Hard";
  hint?:       string;
  description?: string;
  createdDate: string;

  // Grid
  gridCols: number;
  gridRows: number;

  // Game rules
  revealCount:      number;  // max rounds
  enableHints:      boolean;
  enableTimer:      boolean;
  countdownEnabled: boolean;
  shuffleEnabled:   boolean;

  // Tile numbering
  startNumber:        number;
  numberingDirection: string;

  // Visual
  tileStyles: TileStyles;
}

// ─── Defaults ────────────────────────────────────────────────────────────────
export const DEFAULT_GAME: Omit<PresetImage, "id" | "url" | "name" | "answer" | "createdDate"> = {
  category:           "General",
  difficulty:         "Medium",
  gridCols:           6,
  gridRows:           5,
  revealCount:        5,
  enableHints:        true,
  enableTimer:        false,
  countdownEnabled:   false,
  shuffleEnabled:     false,
  startNumber:        1,
  numberingDirection: "left-right",
  tileStyles:         DEFAULT_TILE_STYLES,
};

// ─── Preset library ──────────────────────────────────────────────────────────
export const PRESET_IMAGES: PresetImage[] = [
  {
    id:          "jido-full-induction-suite",
    url:         "/1.png",
    images:      ["/1.png", "/2.png", "/3.png", "/4.png", "/5.png", "/6.jpeg"],
    imageTitles: ["Slide 1 — Image 1", "Slide 2 — Image 2", "Slide 3 — Image 3", "Slide 4 — Image 4", "Slide 5 — Image 5", "Slide 6 — Image 6"],
    imageAnswers: ["Image 1", "Image 2", "Image 3", "Image 4", "Image 5", "Image 6"],
    name:        "JIDO Full Induction Suite (6 Slides)",
    answer:      "JIDO Induction",
    category:    "Induction",
    difficulty:  "Medium",
    hint:        "Complete JIDO induction stage challenge suite",
    description: "6 multi-round images loaded from Jido documents.",
    createdDate: "2026-07-27T00:00:00.000Z",
    gridCols:    6,
    gridRows:    5,
    revealCount:      6,
    enableHints:      true,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: DEFAULT_TILE_STYLES,
  },
  {
    id:          "jido-img-1",
    url:         "/1.png",
    images:      ["/1.png"],
    imageTitles: ["Image 1"],
    imageAnswers: ["Image 1"],
    name:        "Round 1 — Image 1",
    answer:      "Image 1",
    category:    "Induction",
    difficulty:  "Easy",
    hint:        "First induction reveal challenge",
    description: "Image 1 from Jido folder.",
    createdDate: "2026-07-27T00:05:00.000Z",
    gridCols:    6,
    gridRows:    5,
    revealCount:      5,
    enableHints:      true,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: DEFAULT_TILE_STYLES,
  },
  {
    id:          "jido-img-2",
    url:         "/2.png",
    images:      ["/2.png"],
    imageTitles: ["Image 2"],
    imageAnswers: ["Image 2"],
    name:        "Round 2 — Image 2",
    answer:      "Image 2",
    category:    "Induction",
    difficulty:  "Medium",
    hint:        "Second induction reveal challenge",
    description: "Image 2 from Jido folder.",
    createdDate: "2026-07-27T00:10:00.000Z",
    gridCols:    6,
    gridRows:    5,
    revealCount:      5,
    enableHints:      true,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: DEFAULT_TILE_STYLES,
  },
  {
    id:          "jido-img-3",
    url:         "/3.png",
    images:      ["/3.png"],
    imageTitles: ["Image 3"],
    imageAnswers: ["Image 3"],
    name:        "Round 3 — Image 3",
    answer:      "Image 3",
    category:    "Induction",
    difficulty:  "Medium",
    hint:        "Third induction reveal challenge",
    description: "Image 3 from Jido folder.",
    createdDate: "2026-07-27T00:15:00.000Z",
    gridCols:    6,
    gridRows:    5,
    revealCount:      5,
    enableHints:      true,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: DEFAULT_TILE_STYLES,
  },
  {
    id:          "jido-img-4",
    url:         "/4.png",
    images:      ["/4.png"],
    imageTitles: ["Image 4"],
    imageAnswers: ["Image 4"],
    name:        "Round 4 — Image 4",
    answer:      "Image 4",
    category:    "Induction",
    difficulty:  "Hard",
    hint:        "Fourth induction reveal challenge",
    description: "Image 4 from Jido folder.",
    createdDate: "2026-07-27T00:20:00.000Z",
    gridCols:    6,
    gridRows:    5,
    revealCount:      5,
    enableHints:      true,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: DEFAULT_TILE_STYLES,
  },
  {
    id:          "jido-img-5",
    url:         "/5.png",
    images:      ["/5.png"],
    imageTitles: ["Image 5"],
    imageAnswers: ["Image 5"],
    name:        "Round 5 — Image 5",
    answer:      "Image 5",
    category:    "Induction",
    difficulty:  "Hard",
    hint:        "Fifth induction reveal challenge",
    description: "Image 5 from Jido folder.",
    createdDate: "2026-07-27T00:25:00.000Z",
    gridCols:    6,
    gridRows:    5,
    revealCount:      5,
    enableHints:      true,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: DEFAULT_TILE_STYLES,
  },
  {
    id:          "jido-img-6",
    url:         "/6.jpeg",
    images:      ["/6.jpeg"],
    imageTitles: ["Image 6"],
    imageAnswers: ["Image 6"],
    name:        "Round 6 — Image 6",
    answer:      "Image 6",
    category:    "Induction",
    difficulty:  "Easy",
    hint:        "Sixth induction reveal challenge",
    description: "Image 6 from Jido folder.",
    createdDate: "2026-07-27T00:30:00.000Z",
    gridCols:    6,
    gridRows:    5,
    revealCount:      5,
    enableHints:      true,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: DEFAULT_TILE_STYLES,
  },
];

// ─── Tile-number mapping ──────────────────────────────────────────────────────
export function getTileNumber(
  r: number,
  c: number,
  cols: number,
  rows: number,
  startNumber: number,
  direction: string,
): number {
  let seq: number;
  switch (direction) {
    case "right-left":
      seq = r * cols + (cols - 1 - c);
      break;
    case "top-bottom":
      seq = c * rows + r;
      break;
    case "bottom-top":
      seq = c * rows + (rows - 1 - r);
      break;
    case "snake":
      seq = r % 2 === 0 ? r * cols + c : r * cols + (cols - 1 - c);
      break;
    case "zigzag":
      seq = c % 2 === 0 ? c * rows + r : c * rows + (rows - 1 - r);
      break;
    case "left-right":
    default:
      seq = r * cols + c;
  }
  return startNumber + seq;
}

// ─── Find physical index from display number ──────────────────────────────────
export function findPhysicalIndex(
  displayNum: number,
  cols: number,
  rows: number,
  startNumber: number,
  direction: string,
): number {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (getTileNumber(r, c, cols, rows, startNumber, direction) === displayNum) {
        return r * cols + c;
      }
    }
  }
  return -1;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
export const LS_IMAGES    = "jido_reveal_images";
export const LS_ACTIVE_ID = "jido_active_preset_id";

export function loadGames(): PresetImage[] {
  if (typeof window === "undefined") return PRESET_IMAGES;
  try {
    const raw = localStorage.getItem(LS_IMAGES);
    if (!raw) return PRESET_IMAGES;
    const parsed = JSON.parse(raw) as PresetImage[];
    return parsed.length > 0 ? parsed : PRESET_IMAGES;
  } catch (err) {
    console.error("Failed to load games from localStorage:", err);
    return PRESET_IMAGES;
  }
}

export function saveGames(games: PresetImage[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(LS_IMAGES, JSON.stringify(games));
    return true;
  } catch (err) {
    console.error("localStorage quota exceeded when saving images:", err);
    alert("Warning: Storage limit exceeded! Large image files could not be saved to localStorage. Try uploading smaller image files (PNG/JPG).");
    return false;
  }
}

export function loadActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_ACTIVE_ID);
}

export function saveActiveId(id: string): void {
  localStorage.setItem(LS_ACTIVE_ID, id);
}
