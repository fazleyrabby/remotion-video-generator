import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { getCharacter } from "./characters";
import { useVisemeData } from "./useVisemeData";

type BodyPose = "neutral" | "thinking" | "excited" | "concerned" | "pointing";
type Expression = "neutral" | "happy" | "serious" | "surprised" | "thoughtful";

interface LipSyncCharacterProps {
  characterId: string;
  visemeFile?: string;
  audioVolume: number;
  bodyPose?: BodyPose;
  expression?: Expression;
  fadeOut?: number;
  /** Used to seed randomized idle animations so each scene looks unique */
  sceneIndex?: number;
  highlightColor?: string;
}

export const LipSyncCharacter: React.FC<LipSyncCharacterProps> = ({
  characterId,
  visemeFile,
  audioVolume,
  bodyPose = "neutral",
  expression = "neutral",
  fadeOut = 1,
  sceneIndex = 0,
  highlightColor = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const character = getCharacter(characterId);
  const { interpolatedShape } = useVisemeData(visemeFile);

  const cfg = character.svgConfig ?? {
    bodyColor: "#1a1a2e",
    accentColor: "#e94560",
    skinColor: "#f5c6a0",
    hairColor: "#2c2c3a",
    eyeColor: "#4a90d9",
    shape: "rounded-rect" as const,
    size: "medium" as const,
    accessory: "none" as const,
  };

  // Entrance slide + fade
  const entrance = spring({ fps, frame, config: { damping: 13, stiffness: 100 } });
  const translateX = interpolate(entrance, [0, 1], [-500, 0]);
  const opacity = entrance * fadeOut;

  // Idle motion
  const breathe = 1 + Math.sin(frame / 15) * 0.012;
  const floatY = Math.sin(frame / 12) * 10;
  const sway = Math.sin(frame / 20) * 1.5;

  // Audio-reactive glow
  const glowScale = 1 + audioVolume * 0.4;
  const glowOpacity = 0.2 + audioVolume * 0.55;

  // Eye blink — seeded per scene so blinks don't sync across scenes
  const blinkSeed = (sceneIndex * 137) % 90;
  const blinkCycle = (frame + blinkSeed) % 90;
  const eyeScaleY = blinkCycle < 4 ? interpolate(blinkCycle, [0, 2, 4], [1, 0.08, 1]) : 1;

  // Pose-driven head tilt
  const headTilt =
    bodyPose === "thinking" ? 8
    : bodyPose === "concerned" ? -4
    : bodyPose === "excited" ? interpolate(Math.sin(frame / 5), [-1, 1], [-3, 3])
    : 0;

  // Arm pose
  const leftArmRot =
    bodyPose === "pointing" ? -40
    : bodyPose === "thinking" ? -15
    : bodyPose === "excited" ? interpolate(Math.sin(frame / 8), [-1, 1], [-5, 5])
    : 0;
  const rightArmRot =
    bodyPose === "pointing" ? 20
    : bodyPose === "excited" ? interpolate(Math.sin(frame / 8 + 1), [-1, 1], [-5, 5])
    : 0;

  // Expression-driven eyebrow Y (lower = raised brows)
  const eyebrowY =
    expression === "surprised" ? 54
    : expression === "happy" ? 62
    : expression === "serious" ? 67
    : expression === "thoughtful" ? 64
    : 60;

  // Happy expression adds slight cheek/eye crinkle via eye squint
  const eyeRadiusY = expression === "happy" ? 8 : 10;

  const { bodyColor, accentColor, skinColor, hairColor, eyeColor, accessory } = cfg;

  return (
    <div
      style={{
        width: "35%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        transform: `translateX(${translateX}px) translateY(${floatY}px) scale(${breathe}) rotate(${sway}deg)`,
        transformOrigin: "bottom center",
        opacity,
        zIndex: 10,
      }}
    >
      {/* Audio-reactive glow backdrop */}
      <div
        style={{
          position: "absolute",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
          filter: "blur(55px)",
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      <svg
        width="280"
        height="420"
        viewBox="0 0 200 300"
        style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.7))" }}
      >
        {/* Body */}
        <rect x="55" y="165" width="90" height="110" rx="20" fill={bodyColor} />

        {/* Shirt accent / logo strip */}
        <rect x="70" y="172" width="60" height="28" rx="8" fill={accentColor} opacity={0.55} />

        {/* Left arm */}
        <rect
          x="18"
          y="172"
          width="38"
          height="18"
          rx="9"
          fill={bodyColor}
          transform={`rotate(${leftArmRot}, 55, 181)`}
        />
        {/* Right arm */}
        <rect
          x="144"
          y="172"
          width="38"
          height="18"
          rx="9"
          fill={bodyColor}
          transform={`rotate(${rightArmRot}, 145, 181)`}
        />

        {/* Neck */}
        <rect x="88" y="150" width="24" height="18" rx="6" fill={skinColor} />

        {/* Head — tilts with headTilt */}
        <g transform={`rotate(${headTilt}, 100, 120)`}>
          {/* Hair back */}
          <ellipse cx="100" cy="52" rx="56" ry="28" fill={hairColor} />

          {/* Head */}
          <circle cx="100" cy="100" r="60" fill={skinColor} />

          {/* Hair front */}
          <rect x="44" y="50" width="112" height="22" fill={hairColor} />
          <ellipse cx="100" cy="50" rx="56" ry="12" fill={hairColor} />

          {/* Eyebrows */}
          <path
            d={`M 72,${eyebrowY} Q 81,${eyebrowY - 5} 91,${eyebrowY}`}
            stroke={hairColor}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M 109,${eyebrowY} Q 119,${eyebrowY - 5} 128,${eyebrowY}`}
            stroke={hairColor}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Eyes — blink via scaleY */}
          <g
            transform={`scale(1, ${eyeScaleY}) translate(0, ${(1 - eyeScaleY) * 95})`}
          >
            <ellipse cx="82" cy="95" rx="11" ry={eyeRadiusY} fill="white" />
            <ellipse cx="118" cy="95" rx="11" ry={eyeRadiusY} fill="white" />
            <circle cx="83" cy="96" r="5.5" fill={eyeColor} />
            <circle cx="119" cy="96" r="5.5" fill={eyeColor} />
            <circle cx="83" cy="96" r="2.5" fill="#0a0a0a" />
            <circle cx="119" cy="96" r="2.5" fill="#0a0a0a" />
            {/* Catchlights */}
            <circle cx="86" cy="93" r="1.5" fill="white" />
            <circle cx="122" cy="93" r="1.5" fill="white" />
          </g>

          {/* Mouth — nested SVG maps 100×60 viseme paths into head */}
          <svg x="38" y="109" width="124" height="46" viewBox="0 0 100 60">
            {interpolatedShape.innerMouth && (
              <path d={interpolatedShape.innerMouth} fill="#1a0808" />
            )}
            {interpolatedShape.teeth && (
              <path d={interpolatedShape.teeth} fill="#f0ede8" />
            )}
            {interpolatedShape.tongue && (
              <path d={interpolatedShape.tongue} fill="#c0524a" />
            )}
            <path
              d={interpolatedShape.upperLip}
              stroke={skinColor}
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={interpolatedShape.lowerLip}
              stroke={skinColor}
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          {/* Accessories */}
          {accessory === "glasses" && (
            <g stroke={accentColor} strokeWidth="2.5" fill="none">
              <circle cx="82" cy="95" r="15" />
              <circle cx="118" cy="95" r="15" />
              <line x1="97" y1="95" x2="103" y2="95" />
              <line x1="38" y1="94" x2="67" y2="94" />
              <line x1="133" y1="94" x2="156" y2="94" />
            </g>
          )}
          {accessory === "headphones" && (
            <g>
              <path
                d="M 40,92 Q 40,38 100,38 Q 160,38 160,92"
                stroke={accentColor}
                strokeWidth="4.5"
                fill="none"
              />
              <rect x="31" y="88" width="17" height="26" rx="7" fill={accentColor} />
              <rect x="152" y="88" width="17" height="26" rx="7" fill={accentColor} />
            </g>
          )}
          {accessory === "tie" && (
            <g>
              <polygon points="100,168 108,182 100,218 92,182" fill={accentColor} />
              <polygon
                points="93,168 107,168 109,182 91,182"
                fill={accentColor}
                opacity={0.75}
              />
            </g>
          )}
          {accessory === "hoodie" && (
            <path
              d="M 55,165 Q 38,148 54,130 Q 68,118 100,116 Q 132,118 146,130 Q 162,148 145,165 Z"
              fill={bodyColor}
              opacity={0.65}
            />
          )}
        </g>
      </svg>
    </div>
  );
};
