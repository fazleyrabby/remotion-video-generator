/**
 * SVG Viseme Mouth Shapes
 *
 * Maps Rhubarb Lip Sync's mouth cue values (A–H, X) to SVG path data.
 * Each shape is defined as a set of SVG elements that compose a mouth.
 *
 * Rhubarb Viseme Reference:
 *   X — Silence/Rest (closed, relaxed)
 *   A — Closed, pressed (P, B, M sounds)
 *   B — Slightly open, teeth visible (K, S, T, "EE")
 *   C — Open (EH, AE vowels)
 *   D — Wide open (AA vowel — "father")
 *   E — Slightly rounded (AO, ER vowels)
 *   F — Puckered (UW, OW — "you", "show")
 *   G — F/V sounds (bottom lip tucked)
 *   H — L sound (tongue visible)
 *
 * All paths are designed for a 100x60 viewBox centered on (50, 30).
 */

export interface VisemeShape {
  /** Upper lip path */
  upperLip: string;
  /** Lower lip path */
  lowerLip: string;
  /** Optional inner mouth fill (dark cavity) */
  innerMouth?: string;
  /** Optional teeth path */
  teeth?: string;
  /** Optional tongue path */
  tongue?: string;
  /** Lip color override (defaults to character's skin color) */
  lipColor?: string;
}

/**
 * The 9 canonical viseme shapes.
 * Paths are relative to a 100x60 SVG viewBox.
 */
export const VISEME_SHAPES: Record<string, VisemeShape> = {
  // X — Silence/Rest: Neutral closed mouth, relaxed horizontal line
  X: {
    upperLip: "M 25,30 Q 37,28 50,27 Q 63,28 75,30",
    lowerLip: "M 25,30 Q 37,32 50,33 Q 63,32 75,30",
  },

  // A — Closed pressed: Thin line, slight pressure (P, B, M)
  A: {
    upperLip: "M 22,30 Q 36,27 50,26 Q 64,27 78,30",
    lowerLip: "M 22,30 Q 36,33 50,34 Q 64,33 78,30",
  },

  // B — Slightly open with teeth: Small gap (K, S, T, EE)
  B: {
    upperLip: "M 23,28 Q 36,25 50,24 Q 64,25 77,28",
    lowerLip: "M 23,36 Q 36,39 50,40 Q 64,39 77,36",
    innerMouth: "M 25,29 Q 37,27 50,26 Q 63,27 75,29 L 75,35 Q 63,37 50,38 Q 37,37 25,35 Z",
    teeth: "M 28,29 L 72,29 L 72,32 L 28,32 Z",
  },

  // C — Open: Medium oval opening (EH, AE vowels)
  C: {
    upperLip: "M 22,26 Q 35,21 50,20 Q 65,21 78,26",
    lowerLip: "M 22,40 Q 35,46 50,48 Q 65,46 78,40",
    innerMouth: "M 24,27 Q 36,23 50,22 Q 64,23 76,27 L 76,39 Q 64,44 50,46 Q 36,44 24,39 Z",
    teeth: "M 28,27 L 72,27 L 72,31 L 28,31 Z",
  },

  // D — Wide open: Large oval, jaw dropped (AA — "father")
  D: {
    upperLip: "M 20,24 Q 34,18 50,16 Q 66,18 80,24",
    lowerLip: "M 20,44 Q 34,54 50,56 Q 66,54 80,44",
    innerMouth: "M 22,25 Q 35,20 50,18 Q 65,20 78,25 L 78,43 Q 65,52 50,54 Q 35,52 22,43 Z",
    teeth: "M 26,25 L 74,25 L 74,30 L 26,30 Z",
    tongue: "M 35,46 Q 50,50 65,46 Q 60,42 50,40 Q 40,42 35,46 Z",
  },

  // E — Slightly rounded: Small rounded shape (AO, ER — "off", "bird")
  E: {
    upperLip: "M 28,27 Q 38,22 50,21 Q 62,22 72,27",
    lowerLip: "M 28,39 Q 38,44 50,46 Q 62,44 72,39",
    innerMouth: "M 30,28 Q 39,24 50,23 Q 61,24 70,28 L 70,38 Q 61,42 50,44 Q 39,42 30,38 Z",
  },

  // F — Puckered: Small circle, lips pushed forward (UW, OW — "you", "show")
  F: {
    upperLip: "M 33,27 Q 40,22 50,21 Q 60,22 67,27",
    lowerLip: "M 33,37 Q 40,42 50,43 Q 60,42 67,37",
    innerMouth: "M 35,28 Q 42,24 50,23 Q 58,24 65,28 L 65,36 Q 58,40 50,41 Q 42,40 35,36 Z",
  },

  // G — F/V sound: Bottom lip tucked under top teeth
  G: {
    upperLip: "M 23,28 Q 36,24 50,23 Q 64,24 77,28",
    lowerLip: "M 23,34 Q 36,36 50,37 Q 64,36 77,34",
    innerMouth: "M 25,29 Q 37,26 50,25 Q 63,26 75,29 L 75,33 Q 63,35 50,36 Q 37,35 25,33 Z",
    teeth: "M 28,28 L 72,28 L 72,33 L 28,33 Z",
  },

  // H — L sound: Mouth slightly open, tongue visible
  H: {
    upperLip: "M 24,27 Q 36,23 50,22 Q 64,23 76,27",
    lowerLip: "M 24,39 Q 36,43 50,44 Q 64,43 76,39",
    innerMouth: "M 26,28 Q 37,25 50,24 Q 63,25 74,28 L 74,38 Q 63,41 50,42 Q 37,41 26,38 Z",
    teeth: "M 30,28 L 70,28 L 70,31 L 30,31 Z",
    tongue: "M 38,38 Q 50,42 62,38 Q 56,34 50,35 Q 44,34 38,38 Z",
  },
};

/**
 * Get the viseme shape for a given Rhubarb cue value.
 * Falls back to "X" (silence) for unknown values.
 */
export function getVisemeShape(value: string): VisemeShape {
  return VISEME_SHAPES[value] ?? VISEME_SHAPES["X"];
}

/**
 * Interpolate between two SVG path strings.
 * This is a simple numeric interpolation — both paths must have the same structure.
 *
 * @param pathA - Starting path string
 * @param pathB - Ending path string
 * @param t     - Interpolation factor (0 = pathA, 1 = pathB)
 */
export function interpolatePath(pathA: string, pathB: string, t: number): string {
  const numbersA = pathA.match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
  const numbersB = pathB.match(/-?\d+\.?\d*/g)?.map(Number) ?? [];

  if (numbersA.length !== numbersB.length) {
    // Paths have different structures, can't interpolate — snap to target
    return t < 0.5 ? pathA : pathB;
  }

  const interpolated = numbersA.map((a, i) => {
    const b = numbersB[i];
    return Math.round((a + (b - a) * t) * 100) / 100;
  });

  let result = pathA;
  let idx = 0;
  result = result.replace(/-?\d+\.?\d*/g, () => {
    return String(interpolated[idx++]);
  });

  return result;
}
