import { AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame, staticFile, spring, useVideoConfig } from "remotion";
import { z } from "zod";
import { pulseVideoSchema, sceneSchema } from "./Root";
import React from "react";

type SceneProps = z.infer<typeof sceneSchema>;

const DynamicBackground: React.FC<{ emphasis: string; styleMode?: string }> = ({ emphasis, styleMode = "glowing-orb" }) => {
  const frame = useCurrentFrame();
  
  let color1 = "#0a0a0f";
  let glowColor = "rgba(138, 43, 226, 0.4)";

  if (emphasis.includes("tense") || emphasis.includes("impact")) {
    glowColor = "rgba(220, 20, 60, 0.4)";
  } else if (emphasis.includes("release") || emphasis.includes("reflective")) {
    glowColor = "rgba(0, 191, 255, 0.4)";
  } else if (emphasis.includes("curiosity") || emphasis.includes("insight")) {
    glowColor = "rgba(50, 205, 50, 0.3)";
  }

  const pulse = interpolate(Math.sin(frame / 30), [-1, 1], [0.8, 1.2]);
  const driftX = interpolate(Math.sin(frame / 60), [-1, 1], [-100, 100]);
  const driftY = interpolate(Math.cos(frame / 50), [-1, 1], [-50, 50]);
  const gridOffset = (frame * 0.5) % 40;

  if (styleMode === "solid-minimal") {
    return (
      <AbsoluteFill style={{ backgroundColor: color1 }}>
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          background: `radial-gradient(circle at 50% 0%, ${glowColor.replace('0.4', '0.15')} 0%, transparent 80%)`
        }} />
      </AbsoluteFill>
    );
  }

  if (styleMode === "tech-grid") {
    return (
      <AbsoluteFill style={{ backgroundColor: color1, overflow: "hidden" }}>
        <div style={{
          position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: `translateY(${gridOffset * 1.5}px) perspective(500px) rotateX(45deg)`,
        }} />
      </AbsoluteFill>
    );
  }

  // Default: glowing-orb
  return (
    <AbsoluteFill style={{ backgroundColor: color1, overflow: "hidden" }}>
      <div style={{
        position: 'absolute', width: '200%', height: '200%', top: '-50%', left: '-50%',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        transform: `translateY(${gridOffset}px) perspective(500px) rotateX(20deg)`,
      }} />
      <div style={{
        position: 'absolute', width: '1200px', height: '1200px', borderRadius: '50%',
        background: `radial-gradient(circle, ${glowColor} 0%, rgba(0,0,0,0) 70%)`,
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px) scale(${pulse})`,
        filter: 'blur(80px)',
      }} />
    </AbsoluteFill>
  );
};

const SceneComponent: React.FC<{ 
  scene: SceneProps; 
  index: number;
  textRevealStyle?: string; 
  backgroundStyle?: string; 
  characterMascot?: string;
  customCharacterUrl?: string;
}> = ({ 
  scene, 
  index,
  textRevealStyle = "sentence", 
  backgroundStyle = "glowing-orb", 
  characterMascot = "none", 
  customCharacterUrl 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let highlightColor = "#ffffff";
  if (scene.emphasis.includes("tense") || scene.emphasis.includes("impact")) highlightColor = "#ff7b72";
  else if (scene.emphasis.includes("release")) highlightColor = "#79c0ff";
  else if (scene.emphasis.includes("curiosity")) highlightColor = "#7ee787";

  const fadeOut = interpolate(
    frame,
    [scene.duration - 15, scene.duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const renderMascot = () => {
    if (characterMascot === "none") return null;

    // Decide the pose based on scene emphasis, but also change/randomize it periodically within the scene
    const poseInterval = 75; // change pose every 75 frames (~2.5s)
    const segmentIndex = Math.floor(frame / poseInterval);
    const frameInSegment = frame % poseInterval;

    let suffix = "neutral";
    if (scene.emphasis.includes("tense") || scene.emphasis.includes("impact")) {
      const poses = ["intense", "neutral", "intense", "thinking"];
      suffix = poses[(index + segmentIndex) % poses.length];
    } else if (scene.emphasis.includes("curiosity") || scene.emphasis.includes("insight") || scene.emphasis.includes("reflective")) {
      const poses = ["thinking", "neutral", "thinking", "intense"];
      suffix = poses[(index + segmentIndex) % poses.length];
    } else {
      const poses = ["neutral", "thinking", "neutral", "intense"];
      suffix = poses[(index + segmentIndex) % poses.length];
    }

    let imgSrc = "";
    if (characterMascot === "developer") imgSrc = staticFile(`developer_${suffix}.png`);
    else if (characterMascot === "cyberpunk") imgSrc = staticFile(`cyberpunk_${suffix}.png`);
    else if (characterMascot === "custom" && customCharacterUrl) imgSrc = customCharacterUrl;

    if (!imgSrc) return null;

    const entrance = spring({
      fps,
      frame,
      config: { damping: 13, stiffness: 100 }
    });
    const translateX = interpolate(entrance, [0, 1], [-500, 0]);
    const opacity = entrance * fadeOut;

    // Squash & Stretch on landing impact
    const scaleX = interpolate(entrance, [0, 0.8, 1], [0.85, 1.05, 1.0]);
    const scaleY = interpolate(entrance, [0, 0.8, 1], [1.15, 0.92, 1.0]);

    // Continuous subtle breathing and swaying idle motions
    const breatheScale = 1 + Math.sin(frame / 15) * 0.015;
    const floatY = Math.sin(frame / 12) * 12;
    const swayRotate = Math.sin(frame / 20) * 1.5; 

    // Quick squash/stretch jump pop when the pose switches inside the scene
    const poseTransition = spring({
      fps,
      frame: frameInSegment,
      config: { damping: 12, stiffness: 180 }
    });
    const poseScale = interpolate(poseTransition, [0, 1], [0.92, 1.0]);

    return (
      <div style={{
        width: "35%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `translateX(${translateX}px) translateY(${floatY}px) scaleX(${scaleX}) scaleY(${scaleY}) scale(${breatheScale * poseScale}) rotate(${swayRotate}deg)`,
        transformOrigin: "bottom center",
        opacity,
        zIndex: 10,
      }}>
        <img 
          src={imgSrc} 
          style={{
            maxHeight: "750px",
            maxWidth: "100%",
            objectFit: "contain",
            borderRadius: "24px",
            filter: "drop-shadow(0 25px 45px rgba(0,0,0,0.75))",
          }} 
          alt="Mascot Avatar"
        />
      </div>
    );
  };

  const renderContent = () => {
    if (textRevealStyle === "word") {
      const words = scene.text.replace(/\n/g, ' ').split(' ').filter((w: string) => w.length > 0);
      return (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: characterMascot !== "none" ? 'flex-start' : 'center', 
          gap: '16px' 
        }}>
          {words.map((word: string, i: number) => {
            const delay = i * 4; 
            const wordProgress = spring({ fps, frame: frame - delay, config: { damping: 12, stiffness: 150 } });
            const scale = interpolate(wordProgress, [0, 1], [0.8, 1]);
            const opacity = wordProgress * fadeOut;
            return (
              <span key={i} style={{
                fontSize: "72px",
                color: highlightColor,
                fontWeight: 700,
                fontFamily: "system-ui, -apple-system, sans-serif",
                textShadow: "0 10px 30px rgba(0,0,0,0.8)",
                transform: `scale(${scale})`,
                opacity,
                display: 'inline-block'
              }}>
                {word}
              </span>
            );
          })}
        </div>
      );
    }

    // Default sentence
    const lines = scene.text.split('\n').filter((l: string) => l.trim().length > 0);
    return lines.map((line: string, i: number) => {
      const delay = i * 15;
      const lineProgress = spring({ fps, frame: frame - delay, config: { damping: 14, stiffness: 100 } });
      const translateY = interpolate(lineProgress, [0, 1], [50, 0]);
      const opacity = lineProgress * fadeOut;
      return (
        <h2 key={i} style={{ 
          fontSize: "64px", marginBottom: "30px", color: highlightColor,
          lineHeight: 1.4, fontWeight: 600, fontFamily: "system-ui, -apple-system, sans-serif",
          textShadow: "0 10px 30px rgba(0,0,0,0.8)",
          transform: `translateY(${translateY}px)`, opacity,
          textAlign: characterMascot !== "none" ? "left" : "center"
        }}>
          {line}
        </h2>
      );
    });
  };

  return (
    <AbsoluteFill>
      <DynamicBackground emphasis={scene.emphasis} styleMode={backgroundStyle} />
      <Audio src={staticFile(scene.audioFile)} />
      <AbsoluteFill style={{ 
        flexDirection: "row",
        justifyContent: "center", 
        alignItems: "center", 
        padding: "100px",
        gap: "60px"
      }}>
        {renderMascot()}
        <div style={{ 
          maxWidth: characterMascot !== "none" ? "60%" : "80%", 
          textAlign: characterMascot !== "none" ? "left" : "center",
          display: "flex",
          flexDirection: "column",
          alignItems: characterMascot !== "none" ? "flex-start" : "center",
          justifyContent: "center",
          flex: 1
        }}>
          {renderContent()}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PulseVideo: React.FC<z.infer<typeof pulseVideoSchema>> = ({ 
  scenes, 
  textRevealStyle, 
  backgroundStyle, 
  backgroundAudio = "none",
  characterMascot = "none",
  customCharacterUrl
}) => {
  let accumulatedFrames = 0;
  
  let bgAudioFile = "";
  if (backgroundAudio === "rain") bgAudioFile = "rain.mp3";
  else if (backgroundAudio === "nature") bgAudioFile = "nature.mp3";
  else if (backgroundAudio === "office") bgAudioFile = "office.mp3";

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {bgAudioFile && (
        <Audio 
          src={staticFile(bgAudioFile)} 
          volume={0.12} 
          loop 
        />
      )}
      {scenes.map((scene, i) => {
        const startFrame = accumulatedFrames;
        accumulatedFrames += scene.duration;
        return (
          <Sequence key={i} from={startFrame} durationInFrames={scene.duration}>
            <SceneComponent 
              scene={scene} 
              index={i}
              textRevealStyle={textRevealStyle} 
              backgroundStyle={backgroundStyle} 
              characterMascot={characterMascot}
              customCharacterUrl={customCharacterUrl}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
