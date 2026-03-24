import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ConnectX by Marrowx";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INSET = 56;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#080808",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* SVG layer: hatching outside frame + frame border + corner dots */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 45° diagonal hatch pattern — explicit path so lines connect across corners */}
            <pattern
              id="hatch"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,14 L14,0 M-1,1 L1,-1 M13,15 L15,13"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                strokeLinecap="square"
              />
            </pattern>

            {/* Mask: hatch only outside the inner frame */}
            <mask id="outer-mask">
              {/* White = show hatching */}
              <rect width="1200" height="630" fill="white" />
              {/* Black = hide hatching (inner frame area) */}
              <rect
                x={INSET} y={INSET}
                width={1200 - INSET * 2}
                height={630 - INSET * 2}
                fill="black"
              />
            </mask>
          </defs>

          {/* Hatching outside the frame */}
          <rect
            width="1200" height="630"
            fill="url(#hatch)"
            mask="url(#outer-mask)"
          />

          {/* Inner frame border */}
          <rect
            x={INSET} y={INSET}
            width={1200 - INSET * 2}
            height={630 - INSET * 2}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />

          {/* Lines extending from each inner frame corner to the image edges */}
          {/* Top-left */}
          <line x1={INSET} y1={INSET} x2={0}    y2={INSET}       stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <line x1={INSET} y1={INSET} x2={INSET} y2={0}          stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          {/* Top-right */}
          <line x1={1200 - INSET} y1={INSET} x2={1200}           y2={INSET}       stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <line x1={1200 - INSET} y1={INSET} x2={1200 - INSET}   y2={0}           stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          {/* Bottom-right */}
          <line x1={1200 - INSET} y1={630 - INSET} x2={1200}         y2={630 - INSET} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <line x1={1200 - INSET} y1={630 - INSET} x2={1200 - INSET} y2={630}         stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          {/* Bottom-left */}
          <line x1={INSET} y1={630 - INSET} x2={0}    y2={630 - INSET} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <line x1={INSET} y1={630 - INSET} x2={INSET} y2={630}        stroke="rgba(255,255,255,0.14)" strokeWidth="1" />

          {/* Corner dots */}
          <circle cx={INSET}            cy={INSET}            r="3.5" fill="rgba(255,255,255,0.7)" />
          <circle cx={1200 - INSET}     cy={INSET}            r="3.5" fill="rgba(255,255,255,0.7)" />
          <circle cx={1200 - INSET}     cy={630 - INSET}      r="3.5" fill="rgba(255,255,255,0.7)" />
          <circle cx={INSET}            cy={630 - INSET}      r="3.5" fill="rgba(255,255,255,0.7)" />
        </svg>

        {/* Top-left: brand mark */}
        <div
          style={{
            position: "absolute",
            top: `${INSET + 28}px`,
            left: `${INSET + 28}px`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            ConnectX
          </div>
        </div>

        {/* Bottom-left: label + main title */}
        <div
          style={{
            position: "absolute",
            bottom: `${INSET + 36}px`,
            left: `${INSET + 28}px`,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.14)",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            AI-Powered LMS
          </div>
          <div
            style={{
              fontSize: "88px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: "#ffffff",
              display: "flex",
            }}
          >
            ConnectX
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.3)",
              fontWeight: 400,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            by Marrowx
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
