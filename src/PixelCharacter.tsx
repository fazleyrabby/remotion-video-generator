import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, staticFile } from "remotion";

interface PixelCharacterProps {
  characterId: string;
  audioVolume: number;
  expression?: string;
  bodyPose?: string;
  fadeOut?: number;
  sceneIndex?: number;
  highlightColor?: string;
  isFramed?: boolean; // If true, renders inside a golden retro photo frame (like reference 5)
  portraitSize?: number; // Override size for compact portrait mode
}

export const PixelCharacter: React.FC<PixelCharacterProps> = ({
  characterId,
  audioVolume,
  expression = "neutral",
  bodyPose = "neutral",
  fadeOut = 1,
  sceneIndex = 0,
  highlightColor = "#d4af37",
  isFramed = true,
  portraitSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const entrance = spring({
    fps,
    frame,
    config: { damping: 12, stiffness: 110 },
  });
  
  const translateY = interpolate(entrance, [0, 1], [300, 0]);
  const opacity = entrance * fadeOut;

  // Idle vertical bobbing — very slow and subtle (barely perceptible, ~2s period, ±1.5px)
  const bobSeed = (sceneIndex * 33) % 100;
  const bob = Math.sin((frame + bobSeed) / 60) * 1.5;

  // Sound-reactive animation (talking mouth swap)
  // Slower swap (every 8 frames) to avoid flickery rapid toggling
  const isTalking = audioVolume > 0.035;
  const talkFrame = Math.floor(frame / 8) % 2 === 0;
  const showTalkingFrame = isTalking && talkFrame;
  
  // Choose which sprite file to show based on character ID and talk state
  // We will define fallbacks so it works out of the box with custom assets or mock assets.
  const isPixelUser = characterId === "pixel-user";
  const isAnime = characterId === "anime-vtuber";

  let characterImage = "";
  if (!isPixelUser && !isAnime) {
    characterImage = isTalking && talkFrame
      ? "developer_intense.png" // talking fallback
      : "developer_neutral.png"; // idle fallback
  }

  // Double scale layout for pixel art (no antialiasing)
  const imageStyle: React.CSSProperties = {
    imageRendering: "pixelated",
    width: "100%",
    height: "100%",
    objectFit: "contain",
  };

  // Map the character pose to select the appropriate spritesheet
  let spritesheetFilename = isAnime ? "anime_user_spritesheet.png" : "pixel_user_spritesheet.png";
  if (bodyPose === "pointing") {
    spritesheetFilename = isAnime ? "anime_user_spritesheet_pointing.png" : "pixel_user_spritesheet_pointing.png";
  } else if (bodyPose === "thinking") {
    spritesheetFilename = isAnime ? "anime_user_spritesheet_thinking.png" : "pixel_user_spritesheet_thinking.png";
  } else if (bodyPose === "excited") {
    spritesheetFilename = isAnime ? "anime_user_spritesheet_excited.png" : "pixel_user_spritesheet_excited.png";
  }

  // Spritesheet slice styling for consistent 8bit/2d characters
  const spriteStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundImage: `url(${staticFile(spritesheetFilename)})`,
    backgroundSize: "200% 200%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: showTalkingFrame ? "100% 0%" : "0% 0%", // top-right vs top-left
    imageRendering: isAnime ? "auto" : "pixelated",
  };

  const shouldRenderFrame = isFramed && !isAnime;

  const portraitFrame = (
    <div
      style={{
        width: "340px",
        height: "340px",
        position: "relative",
        backgroundColor: "rgba(10, 10, 20, 0.85)",
        border: "6px solid #ffffff",
        boxShadow: `
          0 0 0 6px #000000,
          0 0 0 12px ${highlightColor},
          0 25px 40px rgba(0,0,0,0.85)
        `,
        borderRadius: "4px",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "15px",
        boxSizing: "border-box",
      }}
    >
      {isPixelUser || isAnime ? (
        <div style={spriteStyle} />
      ) : (
        <img
          src={staticFile(characterImage)}
          style={imageStyle}
          alt="8-bit Character Portrait"
          onError={(e) => {
            // If the custom pixel art files don't exist yet, fall back to cyberpunk or developer assets
            e.currentTarget.src = staticFile("developer_neutral.png");
          }}
        />
      )}
    </div>
  );

  // When portraitSize is set for anime-vtuber, render a frameless portrait — no border box,
  // just the character sprite freely floating with a soft drop-shadow (Zelda/BotW style)
  if (portraitSize && isAnime) {
    const sz = portraitSize;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // Only use entrance animation — no bob in portrait mode, character stays locked
          transform: `translateY(${translateY}px)`,
          opacity,
          zIndex: 20,
        }}
      >
        {/* No frame — sprite rendered as a clean cutout */}
        <div
          style={{
            ...spriteStyle,
            width: `${sz}px`,
            height: `${sz}px`,
            backgroundSize: "200% 200%",
            backgroundPosition: showTalkingFrame ? "100% 0%" : "0% 0%",
            imageRendering: "auto",
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
          }}
        />
      </div>
    );
  }

  const fullBody = (
    <div
      style={{
        maxHeight: isAnime ? "1000px" : "750px",
        maxWidth: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isPixelUser || isAnime ? (
        <div
          style={{
            ...spriteStyle,
            width: isAnime ? "900px" : "340px",
            height: isAnime ? "900px" : "340px",
            filter: isAnime ? "drop-shadow(0 15px 25px rgba(0,0,0,0.35))" : undefined,
          }}
        />
      ) : (
        <img
          src={staticFile(characterImage)}
          style={{
            ...imageStyle,
            maxHeight: "700px",
            filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.8))",
          }}
          alt="8-bit Character"
          onError={(e) => {
            e.currentTarget.src = staticFile("developer_neutral.png");
          }}
        />
      )}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // Subtle float: entrance spring + very slow bob
        transform: `translateY(${translateY + bob}px)`,
        opacity,
        zIndex: 20,
      }}
    >
      {shouldRenderFrame ? portraitFrame : fullBody}
    </div>
  );
};
