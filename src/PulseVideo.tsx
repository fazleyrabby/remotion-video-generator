import { AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame, staticFile, spring, useVideoConfig } from "remotion";
import { z } from "zod";
import { pulseVideoSchema, sceneSchema } from "./Root";
import React from "react";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { LipSyncCharacter } from "./LipSyncCharacter";
import { GameDialogBox } from "./GameDialogBox";
import { PixelCharacter } from "./PixelCharacter";
import { getCharacter } from "./characters";

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

  if (styleMode === "starfield") {
    const stars = Array.from({ length: 120 }, (_, i) => {
      const seed = i * 13.37;
      const x = (Math.sin(seed) * 0.5 + 0.5) * 100;
      const y = (Math.cos(seed * 1.7) * 0.5 + 0.5) * 100;
      const size = ((i * 7) % 5) + 1;
      const tw = 0.4 + Math.sin(frame / 20 + i) * 0.4;
      return { x, y, size, tw, i };
    });
    return (
      <AbsoluteFill style={{ backgroundColor: "#02030a", overflow: "hidden" }}>
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          background: `radial-gradient(ellipse at center, ${glowColor.replace('0.4', '0.18')} 0%, transparent 70%)`
        }} />
        {stars.map((s) => (
          <div key={s.i} style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`, borderRadius: '50%',
            backgroundColor: '#fff', opacity: s.tw,
            boxShadow: `0 0 ${s.size * 4}px rgba(255,255,255,${s.tw})`,
          }} />
        ))}
      </AbsoluteFill>
    );
  }

  if (styleMode === "aurora") {
    const a1x = interpolate(Math.sin(frame / 80), [-1, 1], [-30, 30]);
    const a2x = interpolate(Math.cos(frame / 100), [-1, 1], [-40, 40]);
    const a3x = interpolate(Math.sin(frame / 120), [-1, 1], [-25, 25]);
    return (
      <AbsoluteFill style={{ backgroundColor: "#05010f", overflow: "hidden" }}>
        <div style={{
          position: 'absolute', width: '80%', height: '60%', top: '10%', left: `${10 + a1x}%`,
          background: 'radial-gradient(circle, rgba(120, 0, 255, 0.5) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }} />
        <div style={{
          position: 'absolute', width: '70%', height: '60%', top: '30%', left: `${20 + a2x}%`,
          background: 'radial-gradient(circle, rgba(0, 200, 255, 0.45) 0%, transparent 70%)',
          filter: 'blur(110px)',
        }} />
        <div style={{
          position: 'absolute', width: '60%', height: '50%', top: '40%', left: `${30 + a3x}%`,
          background: 'radial-gradient(circle, rgba(255, 0, 150, 0.35) 0%, transparent 70%)',
          filter: 'blur(120px)',
        }} />
      </AbsoluteFill>
    );
  }

  if (styleMode === "nebula") {
    return (
      <AbsoluteFill style={{ backgroundColor: "#08010f", overflow: "hidden" }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (frame / 200) + i * 1.25;
          const x = 50 + Math.cos(angle) * (15 + i * 4);
          const y = 50 + Math.sin(angle * 1.3) * (15 + i * 3);
          const colors = ['rgba(180,60,255,0.4)', 'rgba(60,180,255,0.35)', 'rgba(255,80,180,0.35)', 'rgba(80,255,200,0.3)', 'rgba(255,180,60,0.3)'];
          return (
            <div key={i} style={{
              position: 'absolute', width: '900px', height: '900px', borderRadius: '50%',
              top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${colors[i]} 0%, transparent 65%)`,
              filter: 'blur(90px)',
            }} />
          );
        })}
      </AbsoluteFill>
    );
  }

  if (styleMode === "gradient-flow") {
    const hue = (frame * 0.5) % 360;
    return (
      <AbsoluteFill style={{
        background: `linear-gradient(${frame % 360}deg, hsl(${hue}, 70%, 15%), hsl(${(hue + 60) % 360}, 70%, 10%), hsl(${(hue + 180) % 360}, 70%, 18%))`,
      }}>
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          background: `radial-gradient(circle at ${50 + driftX/4}% ${50 + driftY/4}%, ${glowColor} 0%, transparent 60%)`,
          filter: 'blur(60px)',
        }} />
      </AbsoluteFill>
    );
  }

  if (styleMode === "matrix-rain") {
    const cols = 40;
    const chars = "01アイウエオカキクケコサシスセソタチツテト";
    return (
      <AbsoluteFill style={{ backgroundColor: "#000505", overflow: "hidden" }}>
        {Array.from({ length: cols }).map((_, c) => {
          const speed = 2 + ((c * 7) % 5);
          const offset = (frame * speed + c * 50) % 1200;
          return (
            <div key={c} style={{
              position: 'absolute', top: `${offset - 600}px`, left: `${(c / cols) * 100}%`,
              color: '#00ff7f', fontFamily: 'monospace', fontSize: '24px',
              writingMode: 'vertical-rl', textOrientation: 'upright',
              textShadow: '0 0 8px #00ff7f', opacity: 0.7,
            }}>
              {chars[(c + Math.floor(frame / 8)) % chars.length].repeat(20)}
            </div>
          );
        })}
        <AbsoluteFill style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 80%)',
        }} />
      </AbsoluteFill>
    );
  }

  if (styleMode === "sunset-vapor") {
    return (
      <AbsoluteFill style={{
        background: 'linear-gradient(180deg, #2b0a3d 0%, #5a1361 30%, #c2185b 60%, #ff6e40 85%, #ffb74d 100%)',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, width: '100%', height: '40%',
          backgroundImage: 'linear-gradient(rgba(255,0,150,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,150,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          transform: `perspective(400px) rotateX(60deg) translateY(${gridOffset * 2}px)`,
          transformOrigin: 'top',
        }} />
        <div style={{
          position: 'absolute', top: '15%', left: '50%',
          transform: 'translateX(-50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, #ffd54f 0%, #ff6e40 60%, transparent 75%)',
          filter: 'blur(20px)',
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
  enableLipSync?: boolean;
}> = ({
  scene,
  index,
  textRevealStyle = "sentence",
  backgroundStyle = "glowing-orb",
  characterMascot = "none",
  customCharacterUrl,
  enableLipSync = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const audioSrc = staticFile(scene.audioFile);
  const audioData = useAudioData(audioSrc);
  const hasSideVisual = (enableLipSync && scene.characterId) || characterMascot !== "none" || !!scene.imageFile;

  let volume = 0;
  if (audioData) {
    const frequencies = visualizeAudio({
      audioData,
      frame,
      fps,
      numberOfSamples: 16,
    });
    volume = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
  }

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

    // Decide the pose based on scene emphasis, keeping it constant throughout the scene
    let suffix = "neutral";
    if (scene.emphasis.includes("tense") || scene.emphasis.includes("impact")) {
      suffix = "intense";
    } else if (scene.emphasis.includes("curiosity") || scene.emphasis.includes("insight") || scene.emphasis.includes("reflective")) {
      suffix = "thinking";
    } else {
      // For neutral scenes, pick a randomized pose seeded by the scene text & index to avoid predictable cycles
      const poses = ["neutral", "thinking", "intense"];
      const seed = index + (scene.text || "").length;
      suffix = poses[seed % poses.length];
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

    const glowScale = 1 + volume * 0.4;
    const glowOpacity = 0.25 + volume * 0.65;
    const glowIntensity = 50 + volume * 70;

    return (
      <div style={{
        width: "35%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        transform: `translateX(${translateX}px) translateY(${floatY}px) scaleX(${scaleX}) scaleY(${scaleY}) scale(${breatheScale}) rotate(${swayRotate}deg)`,
        transformOrigin: "bottom center",
        opacity,
        zIndex: 10,
      }}>
        <div style={{
          position: "absolute",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${highlightColor} 0%, transparent 70%)`,
          filter: `blur(${glowIntensity}px)`,
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
          zIndex: -1,
          pointerEvents: "none",
        }} />
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

  const renderSceneImage = () => {
    if (!scene.imageFile) return null;
    const imgSrc = staticFile(scene.imageFile);

    // Ken Burns zoom effect
    const scale = interpolate(frame, [0, scene.duration], [1.0, 1.08]);
    const opacity = interpolate(
      frame,
      [0, 15, scene.duration - 15, scene.duration],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    return (
      <div style={{
        width: "45%",
        height: "80%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: "24px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.85)",
        border: "1px solid rgba(255,255,255,0.15)",
        opacity: opacity * fadeOut,
        zIndex: 10,
      }}>
        <img 
          src={imgSrc} 
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }} 
          alt="Scene illustration"
        />
      </div>
    );
  };

  const renderContent = () => {
    const isRpg = backgroundStyle.startsWith("game-rpg");
    const hasSideVisual = !isRpg && ((enableLipSync && scene.characterId) || characterMascot !== "none" || scene.imageFile);
    const baseAlign: 'flex-start' | 'center' = (hasSideVisual || isRpg) ? 'flex-start' : 'center';
    const textAlign: 'left' | 'center' = (hasSideVisual || isRpg) ? 'left' : 'center';
    const fontFamily = isRpg ? "'VT323', monospace" : "'Hind Siliguri', system-ui, -apple-system, sans-serif";
    const textShadow = isRpg ? "2px 2px 0px #000000" : "0 10px 30px rgba(0,0,0,0.8)";

    const getFontSize = (normalSize: number) => {
      if (isRpg) {
        if (normalSize >= 72) return "48px";
        if (normalSize >= 64) return "44px";
        if (normalSize >= 60) return "40px";
        return "36px";
      }
      return `${normalSize}px`;
    };

    if (textRevealStyle === "typewriter") {
      const full = scene.text.replace(/\n/g, ' ');
      const charsPerFrame = 0.6;
      const visible = Math.min(full.length, Math.floor(frame * charsPerFrame));
      const shown = full.slice(0, visible);
      const caretOn = Math.floor(frame / 8) % 2 === 0;
      return (
        <h2 style={{
          fontSize: getFontSize(60), color: highlightColor, lineHeight: 1.4, fontWeight: 600,
          fontFamily, textShadow,
          opacity: fadeOut, textAlign,
        }}>
          {shown}
          <span style={{ opacity: caretOn ? 1 : 0, color: highlightColor }}>|</span>
        </h2>
      );
    }

    if (textRevealStyle === "char-pop") {
      const chars = Array.from(scene.text.replace(/\n/g, ' '));
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: baseAlign, gap: '2px' }}>
          {chars.map((ch, i) => {
            const delay = i * 1.2;
            const p = spring({ fps, frame: frame - delay, config: { damping: 8, stiffness: 200 } });
            const scale = interpolate(p, [0, 1], [0.2, 1]);
            const rot = interpolate(p, [0, 1], [-30, 0]);
            return (
              <span key={i} style={{
                fontSize: getFontSize(64), color: highlightColor, fontWeight: 700, fontFamily,
                textShadow,
                transform: `scale(${scale}) rotate(${rot}deg)`,
                opacity: p * fadeOut, display: 'inline-block',
              }}>{ch === ' ' ? ' ' : ch}</span>
            );
          })}
        </div>
      );
    }

    if (textRevealStyle === "slide-left") {
      const words = scene.text.replace(/\n/g, ' ').split(' ').filter((w: string) => w.length > 0);
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: baseAlign, gap: '16px' }}>
          {words.map((word: string, i: number) => {
            const delay = i * 3;
            const p = spring({ fps, frame: frame - delay, config: { damping: 14, stiffness: 120 } });
            const tx = interpolate(p, [0, 1], [-200, 0]);
            return (
              <span key={i} style={{
                fontSize: getFontSize(72), color: highlightColor, fontWeight: 700, fontFamily,
                textShadow,
                transform: `translateX(${tx}px)`, opacity: p * fadeOut, display: 'inline-block',
              }}>{word}</span>
            );
          })}
        </div>
      );
    }

    if (textRevealStyle === "karaoke") {
      const words = scene.text.replace(/\n/g, ' ').split(' ').filter((w: string) => w.length > 0);
      const wordsPerSec = words.length / Math.max(1, scene.duration / fps);
      const active = Math.floor((frame / fps) * wordsPerSec);
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: baseAlign, gap: '16px' }}>
          {words.map((word: string, i: number) => {
            const isActive = i === active;
            const isPast = i < active;
            return (
              <span key={i} style={{
                fontSize: getFontSize(68),
                color: isActive ? highlightColor : (isPast ? '#ffffff' : 'rgba(255,255,255,0.35)'),
                fontWeight: isActive ? 800 : 600, fontFamily,
                textShadow: isActive ? (isRpg ? `0 0 10px ${highlightColor}` : `0 0 30px ${highlightColor}`) : textShadow,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.15s ease', opacity: fadeOut, display: 'inline-block',
              }}>{word}</span>
            );
          })}
        </div>
      );
    }

    if (textRevealStyle === "glitch") {
      const lines = scene.text.split('\n').filter((l: string) => l.trim().length > 0);
      const jitter = Math.sin(frame * 1.7) * 3;
      const jitter2 = Math.cos(frame * 2.1) * 3;
      return lines.map((line: string, i: number) => {
        const delay = i * 10;
        const p = spring({ fps, frame: frame - delay, config: { damping: 16, stiffness: 140 } });
        return (
          <div key={i} style={{ position: 'relative', marginBottom: isRpg ? '10px' : '30px', opacity: p * fadeOut, textAlign }}>
            <h2 style={{
              fontSize: getFontSize(64), color: highlightColor, lineHeight: 1.4, fontWeight: 700, fontFamily,
              position: 'relative', margin: 0,
            }}>{line}</h2>
            <h2 style={{
              fontSize: getFontSize(64), color: '#ff00ea', lineHeight: 1.4, fontWeight: 700, fontFamily,
              position: 'absolute', top: jitter, left: jitter, margin: 0, mixBlendMode: 'screen', opacity: 0.7,
            }}>{line}</h2>
            <h2 style={{
              fontSize: getFontSize(64), color: '#00eaff', lineHeight: 1.4, fontWeight: 700, fontFamily,
              position: 'absolute', top: -jitter2, left: -jitter2, margin: 0, mixBlendMode: 'screen', opacity: 0.7,
            }}>{line}</h2>
          </div>
        );
      });
    }

    if (textRevealStyle === "blur-in") {
      const lines = scene.text.split('\n').filter((l: string) => l.trim().length > 0);
      return lines.map((line: string, i: number) => {
        const delay = i * 12;
        const p = spring({ fps, frame: frame - delay, config: { damping: 18, stiffness: 80 } });
        const blur = interpolate(p, [0, 1], [40, 0]);
        const scale = interpolate(p, [0, 1], [1.3, 1]);
        return (
          <h2 key={i} style={{
            fontSize: getFontSize(66), marginBottom: isRpg ? "10px" : "30px", color: highlightColor, lineHeight: 1.4,
            fontWeight: 700, fontFamily, textShadow,
            filter: `blur(${blur}px)`, transform: `scale(${scale})`,
            opacity: p * fadeOut, textAlign,
          }}>{line}</h2>
        );
      });
    }

    if (textRevealStyle === "word") {
      const words = scene.text.replace(/\n/g, ' ').split(' ').filter((w: string) => w.length > 0);
      return (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: (hasSideVisual || isRpg) ? 'flex-start' : 'center', 
          gap: '16px' 
        }}>
          {words.map((word: string, i: number) => {
            const delay = i * 4; 
            const wordProgress = spring({ fps, frame: frame - delay, config: { damping: 12, stiffness: 150 } });
            const scale = interpolate(wordProgress, [0, 1], [0.8, 1]);
            const opacity = wordProgress * fadeOut;
            return (
              <span key={i} style={{
                fontSize: getFontSize(72),
                color: highlightColor,
                fontWeight: 700,
                fontFamily,
                textShadow,
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
          fontSize: getFontSize(64), marginBottom: isRpg ? "10px" : "30px", color: highlightColor,
          lineHeight: 1.4, fontWeight: 600, fontFamily,
          textShadow,
          transform: `translateY(${translateY}px)`, opacity,
          textAlign: (hasSideVisual || isRpg) ? "left" : "center"
        }}>
          {line}
        </h2>
      );
    });
  };

  // Render check for Retro Game/Visual Novel layout
  if (backgroundStyle.startsWith("game-rpg")) {
    const character = getCharacter(scene.characterId || characterMascot);
    const speakerName = character?.name || "Player";
    
    // Background image custom path or theme default fallback
    let defaultBg = "scene_images/scene_0.png";
    if (backgroundStyle === "game-rpg-anime") {
      defaultBg = "scene_images/anime_country_road.png";
    } else if (backgroundStyle === "game-rpg-forest" || backgroundStyle === "game-rpg") {
      defaultBg = "scene_images/night_forest.png";
    }

    const bgImgSrc = scene.imageFile ? staticFile(scene.imageFile) : staticFile(defaultBg);
    
    // Ken Burns subtle zoom
    const bgScale = interpolate(frame, [0, scene.duration], [1.0, 1.05]);

    // Choose body pose: respect scene override, otherwise pick randomized poses per scene
    let activePose = scene.bodyPose || "neutral";
    if (activePose === "neutral") {
      const poses = ["neutral", "thinking", "pointing", "excited"] as const;
      const seed = index + (scene.text || "").length;
      activePose = poses[seed % poses.length];
    }

    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {/* Full-screen background */}
        <AbsoluteFill style={{ zIndex: 1 }}>
          <img
            src={bgImgSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${bgScale})`,
            }}
            alt="RPG Background"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.25)" }} />
        </AbsoluteFill>

        <Audio src={staticFile(scene.audioFile)} />

        {/* Character portrait layer */}
        {(scene.characterId !== "none" && characterMascot !== "none") && (() => {
          const charId = scene.characterId || characterMascot;
          const isVtuber = charId === "anime-vtuber";
          // Anime vtuber: compact portrait anchored above left edge of dialog box
          // Pixel user: full-body right-side placement
          return (
            <div
              style={{
                position: "absolute",
                left: isVtuber ? undefined : undefined,
                right: isVtuber ? "40px" : "80px",
                // dialog box is 220px tall + 40px bottom offset = 260px from bottom
                // portrait sits just above the dialog box
                bottom: isVtuber ? "248px" : "290px",
                zIndex: 10,
              }}
            >
              <PixelCharacter
                characterId={charId}
                audioVolume={volume}
                bodyPose={activePose}
                fadeOut={fadeOut}
                sceneIndex={index}
                highlightColor={highlightColor}
                isFramed={true}
                portraitSize={isVtuber ? 680 : undefined}
              />
            </div>
          );
        })()}

        {/* Dialog Box */}
        {/* When vtuber portrait is on the right, speaker tag stays on the left */}
        <GameDialogBox
          speakerName={speakerName}
          themeColor={highlightColor}
          speakerTagAlign="left"
        >
          {renderContent()}
        </GameDialogBox>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
      `}</style>
      <DynamicBackground emphasis={scene.emphasis} styleMode={backgroundStyle} />
      <Audio src={staticFile(scene.audioFile)} />
      <AbsoluteFill style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: "100px",
        gap: "60px"
      }}>
        {enableLipSync && scene.characterId ? (
          <LipSyncCharacter
            characterId={scene.characterId}
            visemeFile={scene.visemeFile}
            audioVolume={volume}
            bodyPose={scene.bodyPose as any}
            expression={scene.expression as any}
            fadeOut={fadeOut}
            sceneIndex={index}
            highlightColor={highlightColor}
          />
        ) : characterMascot !== "none" ? (
          renderMascot()
        ) : scene.imageFile ? (
          renderSceneImage()
        ) : null}
        <div style={{
          maxWidth: hasSideVisual ? "50%" : "85%",
          textAlign: hasSideVisual ? "left" : "center",
          display: "flex",
          flexDirection: "column",
          alignItems: hasSideVisual ? "flex-start" : "center",
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
  ambientVolume = 12,
  characterMascot = "none",
  customCharacterUrl,
  enableLipSync = false,
}) => {
  let accumulatedFrames = 0;
  
  const bgAudioMap: Record<string, string> = {
    rain: "rain.mp3",
    nature: "nature.mp3",
    office: "office.mp3",
    lofi: "lofi.mp3",
    ocean: "ocean.mp3",
    fire: "fire.mp3",
    whitenoise: "whitenoise.mp3",
    deepspace: "deepspace.mp3",
    heartbeat: "heartbeat.mp3",
    cinematic: "cinematic.mp3",
  };
  const bgAudioFile = bgAudioMap[backgroundAudio] || "";

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {bgAudioFile && (
        <Audio
          src={staticFile(bgAudioFile)}
          volume={Math.max(0, Math.min(1, ambientVolume / 100))}
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
              enableLipSync={enableLipSync}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
