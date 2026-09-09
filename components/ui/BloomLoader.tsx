import type { CSSProperties } from "react";

interface BloomLoaderProps {
  label?: string;
  variant?: "page" | "overlay";
}

/** A lightweight loading ornament; the specimens themselves remain true 3D. */
export function BloomLoader({
  label = "Growing your garden…",
  variant = "page",
}: BloomLoaderProps) {
  return (
    <div
      className={`bloom-loader bloom-loader--${variant}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <svg
        className="bloom-loader-flower"
        viewBox="0 0 120 144"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="bloom-loader-stem"
          pathLength="1"
          d="M60 132C54 110 65 89 60 58"
        />
        <g className="bloom-loader-leaves">
          <path d="M59 114C43 115 35 105 33 96C48 96 57 102 59 114Z" />
          <path d="M60 104C74 104 83 94 84 85C70 87 62 93 60 104Z" />
          <path d="m59 114-18-12m19 2 16-12" />
        </g>
        <g className="bloom-loader-corolla">
          {Array.from({ length: 8 }, (_, index) => (
            <g key={index} transform={`rotate(${index * 45} 60 58)`}>
              <g
                className="bloom-loader-petal"
                style={
                  { "--petal-delay": `${index * -0.13}s` } as CSSProperties
                }
              >
                <path d="M60 58C43 47 41 26 60 15C77 26 78 46 60 58Z" />
                <path
                  className="bloom-loader-vein"
                  d="M60 58C57 43 62 31 60 22"
                />
              </g>
            </g>
          ))}
          <g transform="translate(60 58) scale(.62) rotate(22.5) translate(-60 -58)">
            {Array.from({ length: 8 }, (_, index) => (
              <g key={index} transform={`rotate(${index * 45} 60 58)`}>
                <path
                  className="bloom-loader-petal bloom-loader-petal--inner"
                  style={
                    {
                      "--petal-delay": `${-0.65 - index * 0.1}s`,
                    } as CSSProperties
                  }
                  d="M60 58C43 47 41 26 60 15C77 26 78 46 60 58Z"
                />
              </g>
            ))}
          </g>
          <circle className="bloom-loader-heart" cx="60" cy="58" r="4" />
        </g>
        <g className="bloom-loader-pollen">
          <circle cx="21" cy="28" r="1" />
          <circle cx="98" cy="40" r="1.4" />
          <circle cx="85" cy="13" r="0.8" />
        </g>
      </svg>
      <p className="bloom-loader-label">{label}</p>
      <span className="bloom-loader-signature" aria-hidden="true">
        living colors
      </span>
    </div>
  );
}
