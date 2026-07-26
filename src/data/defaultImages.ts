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
    imageTitles: ["Slide 1 — Drone", "Slide 2 — JIDO Logo", "Slide 3 — Humanoid Robot", "Slide 4 — 3D Printer", "Slide 5 — Robotic Dog", "Slide 6 — Rover"],
    imageAnswers: ["Drone", "JIDO", "Humanoid", "3D Printer", "Robotic Dog", "Rover"],
    name:        "JIDO Full Stage Suite (6 Rounds)",
    answer:      "Drone",
    category:    "Robotics",
    difficulty:  "Medium",
    hint:        "Complete JIDO induction stage challenge suite",
    description: "6 multi-round stage images.",
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
    id:          "jido-img-1-drone",
    url:         "/1.png",
    images:      ["/1.png"],
    imageTitles: ["Drone"],
    imageAnswers: ["Drone"],
    name:        "Round 1 — Drone",
    answer:      "Drone",
    category:    "Aerial Robotics",
    difficulty:  "Easy",
    hint:        "Unmanned quadcopter aerial vehicle",
    description: "Camera drone in flight.",
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
    id:          "jido-img-2-jido",
    url:         "/2.png",
    images:      ["/2.png"],
    imageTitles: ["JIDO Logo"],
    imageAnswers: ["JIDO"],
    name:        "Round 2 — JIDO Logo",
    answer:      "JIDO",
    category:    "Branding",
    difficulty:  "Medium",
    hint:        "Official event banner logo",
    description: "Official JIDO emblem.",
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
    id:          "jido-img-3-humanoid",
    url:         "/3.png",
    images:      ["/3.png"],
    imageTitles: ["Humanoid Robot"],
    imageAnswers: ["Humanoid"],
    name:        "Round 3 — Humanoid",
    answer:      "Humanoid",
    category:    "Robotics",
    difficulty:  "Medium",
    hint:        "White bipedal android robot waving",
    description: "Full body humanoid android.",
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
    id:          "jido-img-4-3dprinter",
    url:         "/4.png",
    images:      ["/4.png"],
    imageTitles: ["3D Printer"],
    imageAnswers: ["3D Printer"],
    name:        "Round 4 — 3D Printer",
    answer:      "3D Printer",
    category:    "Manufacturing",
    difficulty:  "Hard",
    hint:        "Additive manufacturing precision extruder machine",
    description: "Filament 3D printing nozzle in action.",
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
    id:          "jido-img-5-roboticdog",
    url:         "/5.png",
    images:      ["/5.png"],
    imageTitles: ["Robotic Dog"],
    imageAnswers: ["Robotic Dog"],
    name:        "Round 5 — Robotic Dog",
    answer:      "Robotic Dog",
    category:    "Mobility",
    difficulty:  "Hard",
    hint:        "Yellow quadruped robot dog",
    description: "Four-legged agile robot dog.",
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
    id:          "jido-img-6-rover",
    url:         "/6.jpeg",
    images:      ["/6.jpeg"],
    imageTitles: ["Rover"],
    imageAnswers: ["Rover"],
    name:        "Round 6 — Rover",
    answer:      "Rover",
    category:    "Space Robotics",
    difficulty:  "Easy",
    hint:        "NASA Mars space exploration vehicle",
    description: "Planetary exploration rover.",
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
