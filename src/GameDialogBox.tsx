import React from "react";

interface GameDialogBoxProps {
  speakerName: string;
  children: React.ReactNode;
  themeColor?: string;
  speakerTagAlign?: "left" | "right";
}

export const GameDialogBox: React.FC<GameDialogBoxProps> = ({
  speakerName,
  children,
  themeColor = "#d4af37", // Gold default
  speakerTagAlign = "left",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "40px",
        left: "5%",
        width: "90%",
        height: "220px",
        backgroundColor: "rgba(12, 12, 26, 0.95)",
        // Pixel art double border look
        border: "6px solid #ffffff",
        boxShadow: `
          0 0 0 6px #000000,
          0 0 0 12px ${themeColor},
          inset 0 0 0 4px #000000
        `,
        borderRadius: "4px",
        padding: "25px 40px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        zIndex: 50,
      }}
    >
      {/* Import VT323 pixel font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
      `}</style>

      {/* Speaker Name Tag */}
      {speakerName && (
        <div
          style={{
            position: "absolute",
            top: "-42px",
            left: speakerTagAlign === "left" ? "30px" : undefined,
            right: speakerTagAlign === "right" ? "30px" : undefined,
            backgroundColor: "#0c0c1a",
            color: themeColor,
            border: "4px solid #ffffff",
            boxShadow: `
              0 0 0 4px #000000,
              inset 0 0 0 2px #000000
            `,
            borderRadius: "2px",
            padding: "4px 20px 2px 20px",
            fontFamily: "'VT323', monospace",
            fontSize: "36px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "2px",
            zIndex: 60,
          }}
        >
          {speakerName}
        </div>
      )}

      {/* Content Area */}
      <div
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: "44px",
          lineHeight: "1.25",
          color: "#ffffff",
          textShadow: "4px 4px 0px #000000",
          letterSpacing: "1px",
          wordBreak: "break-word",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      
      {/* Animated Next Indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "15px",
          right: "25px",
          width: "18px",
          height: "14px",
          backgroundColor: themeColor,
          clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
          animation: "blink 0.8s infinite alternate",
        }}
      />
      <style>{`
        @keyframes blink {
          0% { opacity: 0.2; transform: translateY(-2px); }
          100% { opacity: 1; transform: translateY(2px); }
        }
      `}</style>
    </div>
  );
};
