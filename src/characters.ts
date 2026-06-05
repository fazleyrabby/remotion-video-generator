import { z } from "zod";

/**
 * Character Definition Schema
 * Each character has a unique visual identity and voice configuration.
 */
export const characterDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  // Voice configuration
  voiceEngine: z.enum(["edge-tts", "kokoro"]).default("edge-tts"),
  voiceId: z.string(),
  voiceRate: z.string().optional(),
  voicePitch: z.string().optional(),
  // Visual configuration
  style: z.enum(["svg", "sprite"]).default("svg"),
  svgConfig: z.object({
    bodyColor: z.string(),
    accentColor: z.string(),
    skinColor: z.string(),
    hairColor: z.string(),
    eyeColor: z.string(),
    shape: z.enum(["circle", "rounded-rect", "hexagon"]).default("rounded-rect"),
    size: z.enum(["small", "medium", "large"]).default("medium"),
    accessory: z.enum(["none", "glasses", "headphones", "hoodie", "tie"]).default("none"),
  }).optional(),
  spriteSheet: z.string().optional(),
});

export type CharacterDefinition = z.infer<typeof characterDefinitionSchema>;

/**
 * Built-in character presets.
 * Each character has a distinct visual style and voice personality.
 */
export const CHARACTERS: Record<string, CharacterDefinition> = {
  "pixel-user": {
    id: "pixel-user",
    name: "User",
    description: "8-bit retro gaming character created from photo.",
    voiceEngine: "edge-tts",
    voiceId: "en-US-BrianNeural",
    style: "sprite",
  },
  "anime-vtuber": {
    id: "anime-vtuber",
    name: "VTuber User",
    description: "2D Anime VTuber character in Demon Slayer style.",
    voiceEngine: "edge-tts",
    voiceId: "en-US-BrianNeural",
    style: "sprite",
  },
  narrator: {
    id: "narrator",
    name: "The Narrator",
    description: "Calm, authoritative storyteller. Deep and measured delivery.",
    voiceEngine: "edge-tts",
    voiceId: "en-US-ChristopherNeural",
    voiceRate: "-5%",
    voicePitch: "-15Hz",
    style: "svg",
    svgConfig: {
      bodyColor: "#1a1a2e",
      accentColor: "#e94560",
      skinColor: "#f5c6a0",
      hairColor: "#2c2c3a",
      eyeColor: "#4a90d9",
      shape: "rounded-rect",
      size: "large",
      accessory: "none",
    },
  },

  professor: {
    id: "professor",
    name: "Professor",
    description: "Intellectual, explains complex topics clearly. Thoughtful pace.",
    voiceEngine: "edge-tts",
    voiceId: "en-US-RogerNeural",
    voiceRate: "-3%",
    voicePitch: "-5Hz",
    style: "svg",
    svgConfig: {
      bodyColor: "#16213e",
      accentColor: "#0f3460",
      skinColor: "#deb887",
      hairColor: "#8b8b8b",
      eyeColor: "#2e8b57",
      shape: "rounded-rect",
      size: "large",
      accessory: "glasses",
    },
  },

  hacker: {
    id: "hacker",
    name: "Hacker",
    description: "Fast-talking, energetic. Cyberpunk vibe. Excited about tech.",
    voiceEngine: "edge-tts",
    voiceId: "en-US-GuyNeural",
    voiceRate: "+8%",
    voicePitch: "+5Hz",
    style: "svg",
    svgConfig: {
      bodyColor: "#0d1117",
      accentColor: "#00ff41",
      skinColor: "#e8d5b7",
      hairColor: "#00ff41",
      eyeColor: "#00ff41",
      shape: "hexagon",
      size: "medium",
      accessory: "hoodie",
    },
  },

  analyst: {
    id: "analyst",
    name: "Analyst",
    description: "Data-driven, precise. Measured and factual delivery.",
    voiceEngine: "edge-tts",
    voiceId: "en-US-JennyNeural",
    voiceRate: "+0%",
    voicePitch: "+0Hz",
    style: "svg",
    svgConfig: {
      bodyColor: "#2d3436",
      accentColor: "#6c5ce7",
      skinColor: "#c19a6b",
      hairColor: "#2c1810",
      eyeColor: "#6c5ce7",
      shape: "rounded-rect",
      size: "medium",
      accessory: "glasses",
    },
  },

  creative: {
    id: "creative",
    name: "Creative",
    description: "Enthusiastic, warm. Brings energy and color to ideas.",
    voiceEngine: "edge-tts",
    voiceId: "en-US-AvaNeural",
    voiceRate: "+5%",
    voicePitch: "+10Hz",
    style: "svg",
    svgConfig: {
      bodyColor: "#6a0572",
      accentColor: "#ff6f91",
      skinColor: "#f5c6a0",
      hairColor: "#ff6f91",
      eyeColor: "#ff6f91",
      shape: "circle",
      size: "medium",
      accessory: "headphones",
    },
  },

  executive: {
    id: "executive",
    name: "Executive",
    description: "Confident, business-focused. Clean and direct communication.",
    voiceEngine: "edge-tts",
    voiceId: "en-US-BrianNeural",
    voiceRate: "-2%",
    voicePitch: "-8Hz",
    style: "svg",
    svgConfig: {
      bodyColor: "#1c1c1c",
      accentColor: "#c9a96e",
      skinColor: "#deb887",
      hairColor: "#1c1c1c",
      eyeColor: "#4a4a4a",
      shape: "rounded-rect",
      size: "large",
      accessory: "tie",
    },
  },
};

/**
 * Get a character definition by ID. Falls back to narrator if not found.
 */
export function getCharacter(id: string): CharacterDefinition {
  return CHARACTERS[id] ?? CHARACTERS["narrator"];
}

/**
 * Get all available character IDs
 */
export function getCharacterIds(): string[] {
  return Object.keys(CHARACTERS);
}
