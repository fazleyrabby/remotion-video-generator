import { Composition, staticFile, CalculateMetadataFunction } from "remotion";
import { PulseVideo } from "./PulseVideo";
import { z } from "zod";
import { getAudioDurationInSeconds } from "@remotion/media-utils";

export const sceneSchema = z.object({
  text: z.string(),
  voice: z.string(),
  duration: z.number(),
  visual: z.string(),
  emphasis: z.string(),
  audioFile: z.string(),
  imageFile: z.string().optional(),
  // Lip-sync character fields
  characterId: z.string().optional().default("narrator"),
  visemeFile: z.string().optional(),
  bodyPose: z.enum(["neutral", "thinking", "excited", "concerned", "pointing"]).optional().default("neutral"),
  expression: z.enum(["neutral", "happy", "serious", "surprised", "thoughtful"]).optional().default("neutral"),
});

export const pulseVideoSchema = z.object({
  scenes: z.array(sceneSchema),
  textRevealStyle: z.enum(["sentence", "word", "typewriter", "char-pop", "slide-left", "karaoke", "glitch", "blur-in"]).optional().default("sentence"),
  backgroundStyle: z.enum(["glowing-orb", "tech-grid", "solid-minimal", "starfield", "aurora", "nebula", "gradient-flow", "matrix-rain", "sunset-vapor", "game-rpg", "game-rpg-anime", "game-rpg-forest"]).optional().default("glowing-orb"),
  backgroundAudio: z.enum(["none", "rain", "nature", "office", "lofi", "ocean", "fire", "whitenoise", "deepspace", "heartbeat", "cinematic"]).optional().default("none"),
  ambientVolume: z.number().min(0).max(100).optional().default(12),
  characterMascot: z.enum(["none", "developer", "cyberpunk", "custom", "pixel-user", "anime-vtuber"]).optional().default("none"),
  customCharacterUrl: z.string().optional(),
  enableLipSync: z.boolean().optional().default(false),
});

const calculateMetadata: CalculateMetadataFunction<z.infer<typeof pulseVideoSchema>> = async ({ props }) => {
  let totalDurationFrames = 0;
  const fps = 30;

  // If there are no scenes, just fallback to 5 seconds
  if (!props.scenes || props.scenes.length === 0) {
    return {
      durationInFrames: 5 * fps,
      props,
    };
  }

  // Iterate over each scene, get audio duration, and save it in the scene props for exact timing
  for (const scene of props.scenes) {
    try {
      const audioUrl = staticFile(scene.audioFile);
      const audioSeconds = await getAudioDurationInSeconds(audioUrl);
      const frames = Math.ceil(audioSeconds * fps);
      scene.duration = frames; // Override the LLM estimate with the actual audio exact length
      totalDurationFrames += frames;
    } catch (e) {
      console.warn("Could not calculate audio duration for " + scene.audioFile + ", using LLM estimate", e);
      totalDurationFrames += scene.duration;
    }
  }

  // Add a small 1-second buffer at the end so it doesn't cut off abruptly
  totalDurationFrames += fps;

  return {
    durationInFrames: totalDurationFrames,
    props,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PulseVideo"
        component={PulseVideo}
        durationInFrames={150} // This is overridden by calculateMetadata
        fps={30}
        width={1920}
        height={1080}
        schema={pulseVideoSchema}
        defaultProps={{
          scenes: [
            {
              text: "Loading...",
              voice: "Loading",
              duration: 150,
              visual: "dark",
              emphasis: "neutral",
              audioFile: "speech.mp3",
              characterId: "narrator",
              bodyPose: "neutral" as const,
              expression: "neutral" as const,
            }
          ],
          textRevealStyle: "sentence",
          backgroundStyle: "glowing-orb",
          backgroundAudio: "none",
          ambientVolume: 12,
          characterMascot: "none",
          enableLipSync: false,
        }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
