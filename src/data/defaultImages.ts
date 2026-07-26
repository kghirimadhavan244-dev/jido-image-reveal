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

// ─── Game / Image preset ──────────────────────────────────────────────────────
export interface PresetImage {
  id:          string;
  url:         string;
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
  gridCols:           10,
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
    id:          "robotic-arm",
    url:         "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200",
    name:        "Qualifications Round 1",
    answer:      "Robotic Arm",
    category:    "Robotics",
    difficulty:  "Easy",
    hint:        "Heavy payload manipulator",
    description: "Multi-jointed manipulator arm used in automotive spot-welding.",
    createdDate: "2026-07-26T21:00:00.000Z",
    gridCols:    10,
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
    id:          "plc-cabinet",
    url:         "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200",
    name:        "Logic Controller Induction",
    answer:      "PLC Cabinet",
    category:    "Automation",
    difficulty:  "Medium",
    hint:        "Main logic controller unit",
    description: "Control housing containing PLCs, electrical relays, and power grids.",
    createdDate: "2026-07-26T21:05:00.000Z",
    gridCols:    8,
    gridRows:    4,
    revealCount:      4,
    enableHints:      true,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: DEFAULT_TILE_STYLES,
  },
  {
    id:          "hydraulic-manifold",
    url:         "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200",
    name:        "Hydraulic Core Final Round",
    answer:      "Hydraulic Manifold",
    category:    "Hydraulics",
    difficulty:  "Hard",
    hint:        "Pneumatic flow distribution blocks",
    description: "Manifold controlling air and fluid pressure lines.",
    createdDate: "2026-07-26T21:10:00.000Z",
    gridCols:    6,
    gridRows:    3,
    revealCount:      3,
    enableHints:      false,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: { ...DEFAULT_TILE_STYLES },
  },
  {
    id:          "factory-conveyor",
    url:         "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200",
    name:        "Sorting Conveyor Stage",
    answer:      "Conveyor System",
    category:    "Assembly",
    difficulty:  "Easy",
    hint:        "Moves boxes across lines",
    description: "Roller conveyor belt with infrared sensors for package routing.",
    createdDate: "2026-07-26T21:15:00.000Z",
    gridCols:    12,
    gridRows:    6,
    revealCount:      6,
    enableHints:      true,
    enableTimer:      false,
    countdownEnabled: false,
    shuffleEnabled:   false,
    startNumber:        1,
    numberingDirection: "left-right",
    tileStyles: { ...DEFAULT_TILE_STYLES },
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
    return JSON.parse(raw) as PresetImage[];
  } catch {
    return PRESET_IMAGES;
  }
}

export function saveGames(games: PresetImage[]): void {
  localStorage.setItem(LS_IMAGES, JSON.stringify(games));
}

export function loadActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_ACTIVE_ID);
}

export function saveActiveId(id: string): void {
  localStorage.setItem(LS_ACTIVE_ID, id);
}
