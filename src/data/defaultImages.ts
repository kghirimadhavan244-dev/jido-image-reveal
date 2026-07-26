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
    id:          "jido-induction-suite",
    url:         "/humanoid-robot.jpg",
    images:      ["/humanoid-robot.jpg", "/jido-logo-banner.jpg", "/quadruped-robot.jpg", "/mars-rover.jpg"],
    imageTitles: ["Slide 1 — Humanoid Robot", "Slide 2 — JIDO Logo Banner", "Slide 3 — Quadruped Robot Dog", "Slide 4 — NASA Mars Rover"],
    imageAnswers: ["Humanoid Robot", "JIDO", "Quadruped Robot", "Mars Rover"],
    name:        "JIDO Stage Arena Round",
    answer:      "Humanoid Robot",
    category:    "Robotics",
    difficulty:  "Medium",
    hint:        "Advanced autonomous mechanical humanoid",
    description: "Full height white humanoid robot waving hand.",
    createdDate: "2026-07-27T00:00:00.000Z",
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
    id:          "humanoid-robot-stage",
    url:         "/humanoid-robot.jpg",
    images:      ["/humanoid-robot.jpg"],
    imageTitles: ["Humanoid Robot"],
    imageAnswers: ["Humanoid Robot"],
    name:        "Round 1 — Humanoid Android",
    answer:      "Humanoid Robot",
    category:    "Robotics",
    difficulty:  "Easy",
    hint:        "Sleek white bipedal android",
    description: "Autonomous bipedal robot designed for human interaction.",
    createdDate: "2026-07-27T00:05:00.000Z",
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
    id:          "jido-logo-stage",
    url:         "/jido-logo-banner.jpg",
    images:      ["/jido-logo-banner.jpg"],
    imageTitles: ["JIDO Logo Banner"],
    imageAnswers: ["JIDO"],
    name:        "Round 2 — Official JIDO Banner",
    answer:      "JIDO",
    category:    "Branding",
    difficulty:  "Medium",
    hint:        "Event title logo featuring robotic arm",
    description: "Official event logo for JIDO Induction.",
    createdDate: "2026-07-27T00:10:00.000Z",
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
    id:          "quadruped-robot-stage",
    url:         "/quadruped-robot.jpg",
    images:      ["/quadruped-robot.jpg"],
    imageTitles: ["Quadruped Robot Dog"],
    imageAnswers: ["Quadruped Robot"],
    name:        "Round 3 — Quadruped Robot",
    answer:      "Quadruped Robot",
    category:    "Mobility",
    difficulty:  "Medium",
    hint:        "Four-legged robotic dog built for rough terrain",
    description: "Yellow four-legged agile inspection robot.",
    createdDate: "2026-07-27T00:15:00.000Z",
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
    id:          "mars-rover-stage",
    url:         "/mars-rover.jpg",
    images:      ["/mars-rover.jpg"],
    imageTitles: ["NASA Mars Rover"],
    imageAnswers: ["Mars Rover"],
    name:        "Round 4 — Space Exploration Rover",
    answer:      "Mars Rover",
    category:    "Space",
    difficulty:  "Hard",
    hint:        "Autonomous planetary research vehicle on Mars",
    description: "Robotic rover exploring martian surface.",
    createdDate: "2026-07-27T00:20:00.000Z",
    gridCols:    12,
    gridRows:    6,
    revealCount:      6,
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
