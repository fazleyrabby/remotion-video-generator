import { useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender } from "remotion";
import { useState, useEffect } from "react";
import { getVisemeShape, interpolatePath, VisemeShape } from "./viseme-shapes";

interface VisemeCue {
  start: number;
  end: number;
  value: string;
}

interface VisemeData {
  metadata: { soundFile: string; duration: number };
  mouthCues: VisemeCue[];
}

export interface VisemeDataResult {
  currentViseme: string;
  nextViseme: string;
  /** 0–1 progress through the current cue */
  progress: number;
  currentShape: VisemeShape;
  /** Shape smoothly interpolated toward the next cue in the last 30% of each cue */
  interpolatedShape: VisemeShape;
}

const SILENCE: VisemeDataResult = {
  currentViseme: "X",
  nextViseme: "X",
  progress: 0,
  currentShape: getVisemeShape("X"),
  interpolatedShape: getVisemeShape("X"),
};

export function useVisemeData(visemeFile: string | undefined): VisemeDataResult {
  const [handle] = useState(() =>
    visemeFile ? delayRender(`Loading viseme data: ${visemeFile}`) : null
  );
  const [visemeData, setVisemeData] = useState<VisemeData | null>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    if (!visemeFile || !handle) return;

    fetch(staticFile(visemeFile))
      .then((r) => r.json())
      .then((data: VisemeData) => {
        setVisemeData(data);
        continueRender(handle);
      })
      .catch(() => {
        continueRender(handle);
      });
  }, [visemeFile, handle]);

  if (!visemeData) return SILENCE;

  const currentTimeSecs = frame / fps;
  const cues = visemeData.mouthCues;

  let idx = cues.length - 1;
  for (let i = 0; i < cues.length; i++) {
    if (currentTimeSecs >= cues[i].start && currentTimeSecs < cues[i].end) {
      idx = i;
      break;
    }
  }

  const current = cues[idx];
  const next = cues[Math.min(idx + 1, cues.length - 1)];

  const cueDuration = current.end - current.start;
  const timeInCue = currentTimeSecs - current.start;
  const progress = cueDuration > 0 ? Math.min(timeInCue / cueDuration, 1) : 1;

  const currentShape = getVisemeShape(current.value);
  const nextShape = getVisemeShape(next.value);

  // Start blending toward next shape in the final 30% of each cue
  const blendT = progress > 0.7 ? (progress - 0.7) / 0.3 : 0;

  const interpolatedShape: VisemeShape = {
    upperLip: interpolatePath(currentShape.upperLip, nextShape.upperLip, blendT),
    lowerLip: interpolatePath(currentShape.lowerLip, nextShape.lowerLip, blendT),
    innerMouth:
      currentShape.innerMouth && nextShape.innerMouth
        ? interpolatePath(currentShape.innerMouth, nextShape.innerMouth, blendT)
        : blendT > 0.5
        ? nextShape.innerMouth
        : currentShape.innerMouth,
    teeth: blendT > 0.5 ? nextShape.teeth : currentShape.teeth,
    tongue: blendT > 0.5 ? nextShape.tongue : currentShape.tongue,
  };

  return { currentViseme: current.value, nextViseme: next.value, progress, currentShape, interpolatedShape };
}
