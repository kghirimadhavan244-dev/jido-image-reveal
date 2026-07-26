import { supabase, BUCKET_NAME, GAMES_TABLE } from "../lib/supabase";
import { PRESET_IMAGES, PresetImage, DEFAULT_TILE_STYLES } from "../data/defaultImages";

export interface DatabaseGameRow {
  id: string;
  name: string;
  answer: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  hint?: string;
  description?: string;
  image_url: string;
  images?: string[];
  image_titles?: string[];
  image_answers?: string[];
  grid_cols: number;
  grid_rows: number;
  reveal_count: number;
  enable_hints: boolean;
  enable_timer: boolean;
  countdown_enabled: boolean;
  shuffle_enabled: boolean;
  start_number: number;
  numbering_direction: string;
  tile_styles: any;
  created_at?: string;
  updated_at?: string;
}

// Map Database row (snake_case) to Frontend PresetImage model (camelCase)
export function mapRowToPreset(row: DatabaseGameRow): PresetImage {
  return {
    id: row.id,
    name: row.name,
    answer: row.answer,
    category: row.category || "General",
    difficulty: row.difficulty || "Medium",
    hint: row.hint || "",
    description: row.description || "",
    url: row.image_url || "",
    images: row.images || (row.image_url ? [row.image_url] : []),
    imageTitles: row.image_titles || [],
    imageAnswers: row.image_answers || [],
    gridCols: row.grid_cols || 10,
    gridRows: row.grid_rows || 5,
    revealCount: row.reveal_count || 5,
    enableHints: row.enable_hints ?? true,
    enableTimer: row.enable_timer ?? false,
    countdownEnabled: row.countdown_enabled ?? false,
    shuffleEnabled: row.shuffle_enabled ?? false,
    startNumber: row.start_number || 1,
    numberingDirection: row.numbering_direction || "left-right",
    tileStyles: row.tile_styles || DEFAULT_TILE_STYLES,
    createdDate: row.created_at || new Date().toISOString(),
  };
}

// Map Frontend PresetImage model (camelCase) to Database row (snake_case)
export function mapPresetToRow(preset: Omit<PresetImage, "createdDate">): Omit<DatabaseGameRow, "created_at" | "updated_at"> {
  return {
    id: preset.id,
    name: preset.name,
    answer: preset.answer,
    category: preset.category,
    difficulty: preset.difficulty,
    hint: preset.hint || "",
    description: preset.description || "",
    image_url: preset.url,
    images: preset.images || [],
    image_titles: preset.imageTitles || [],
    image_answers: preset.imageAnswers || [],
    grid_cols: preset.gridCols,
    grid_rows: preset.gridRows,
    reveal_count: preset.revealCount,
    enable_hints: preset.enableHints,
    enable_timer: preset.enableTimer,
    countdown_enabled: preset.countdownEnabled,
    shuffle_enabled: preset.shuffleEnabled,
    start_number: preset.startNumber,
    numbering_direction: preset.numberingDirection,
    tile_styles: preset.tileStyles,
  };
}

// ─── Supabase Data API ────────────────────────────────────────────────────────

// Fetch all games from Supabase Database
export async function fetchGamesFromSupabase(): Promise<PresetImage[]> {
  try {
    const { data, error } = await supabase
      .from(GAMES_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch error, using default presets:", error.message);
      return PRESET_IMAGES;
    }

    if (!data || data.length === 0) {
      return PRESET_IMAGES;
    }

    return data.map((row) => mapRowToPreset(row as DatabaseGameRow));
  } catch (err) {
    console.error("Failed to fetch games from Supabase:", err);
    return PRESET_IMAGES;
  }
}

// Insert or update a game in Supabase Database
export async function saveGameToSupabase(game: PresetImage): Promise<PresetImage | null> {
  try {
    const row = mapPresetToRow(game);
    const { data, error } = await supabase
      .from(GAMES_TABLE)
      .upsert(row, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase save error:", error.message);
      return null;
    }

    return mapRowToPreset(data as DatabaseGameRow);
  } catch (err) {
    console.error("Failed to save game to Supabase:", err);
    return null;
  }
}

// Delete a game from Supabase Database
export async function deleteGameFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(GAMES_TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete game from Supabase:", err);
    return false;
  }
}

// Upload a File or DataURL to Supabase Storage Bucket and return Public URL
export async function uploadImageToSupabaseStorage(
  fileOrDataUrl: File | string,
  fileNamePrefix: string = "image"
): Promise<string | null> {
  try {
    let blob: Blob;
    let extension = "jpg";

    if (typeof fileOrDataUrl === "string") {
      // Data URL
      if (!fileOrDataUrl.startsWith("data:")) {
        // Already a remote URL
        return fileOrDataUrl;
      }
      const res = await fetch(fileOrDataUrl);
      blob = await res.blob();
      const mime = blob.type;
      extension = mime.split("/")[1] || "jpg";
    } else {
      blob = fileOrDataUrl;
      extension = fileOrDataUrl.name.split(".").pop() || "jpg";
    }

    const filePath = `games/${fileNamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError.message);
      // Fallback: if bucket upload fails (e.g. bucket doesn't exist yet), return data URL
      return typeof fileOrDataUrl === "string" ? fileOrDataUrl : null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Failed to upload image to Supabase Storage:", err);
    return typeof fileOrDataUrl === "string" ? fileOrDataUrl : null;
  }
}
