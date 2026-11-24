import React, { useState } from 'react';

interface MchEmblemProps {
  size?: number;
  className?: string;
  showGoldRing?: boolean;
  glow?: boolean;
  alt?: string;
  customImageSrc?: string | null;
}

export const MchEmblem: React.FC<MchEmblemProps> = ({
  size = 56,
  className = '',
  showGoldRing = true,
  glow = true,
  alt = 'MyCoinHarvest Emblem',
  customImageSrc = null,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Target image asset: user-uploaded IMG_0900.jpeg
  const targetSrc = customImageSrc || '/IMG_0900.jpeg';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full select-none overflow-hidden ${
        glow ? 'shadow-[0_0_18px_rgba(0,240,255,0.45)]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Double Gold Glowing Rings */}
      {showGoldRing && (
        <>
          <div
            className="absolute inset-0 rounded-full border-2 border-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.7)] pointer-events-none z-20"
            style={{
              background: 'radial-gradient(circle, transparent 60%, rgba(251, 191, 36, 0.2) 100%)',
            }}
          />
          <div className="absolute inset-[3px] rounded-full border border-[#f59e0b]/80 pointer-events-none z-20" />
        </>
      )}

      {/* Official MCH Logo Asset (Image 1 Upload) */}
      {!imageFailed && targetSrc ? (
        <img
          src={targetSrc}
          alt={alt}
          onError={() => setImageFailed(true)}
          className="w-full h-full rounded-full object-cover bg-black select-none pointer-events-none"
          style={{
            objectPosition: 'center 46%',
            transform: 'scale(1.18)',
          }}
        />
      ) : (
        /* Pixel-perfect Vector SVG Fallback with Cyan-Purple-Pink Gradient Tree, MCH, & Roots */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full rounded-full bg-black overflow-hidden"
        >
          <defs>
            <linearGradient id="emblemMchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#9b5de5" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="mchGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Deep Black Core */}
          <circle cx="50" cy="50" r="48" fill="#000000" />

          <g filter="url(#mchGlowFilter)">
            {/* Tree Branches spreading upwards */}
            <path
              d="M50 36 L50 22 M50 30 L40 18 M50 28 L60 17 M40 22 L34 16 M60 21 L66 15 M50 25 L47 13 M50 25 L53 13 M38 24 C36 19 32 18 30 20 M62 24 C64 19 68 18 70 20"
              stroke="url(#emblemMchGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Foliage Nodes */}
            <circle cx="40" cy="18" r="1.5" fill="#00f0ff" />
            <circle cx="60" cy="17" r="1.5" fill="#ec4899" />
            <circle cx="34" cy="16" r="1.2" fill="#00f0ff" />
            <circle cx="66" cy="15" r="1.2" fill="#ec4899" />
            <circle cx="50" cy="13" r="1.5" fill="#9b5de5" />

            {/* Bold Centered MCH Lettering */}
            <text
              x="50"
              y="53"
              textAnchor="middle"
              fill="url(#emblemMchGrad)"
              fontFamily="Space Grotesk, sans-serif"
              fontWeight="800"
              fontSize="17"
              letterSpacing="1.2"
            >
              MCH
            </text>

            {/* Tree Roots extending downwards */}
            <path
              d="M50 61 L50 78 M50 67 L38 82 M50 67 L62 81 M38 74 L32 85 M62 73 L68 84 M50 72 L46 88 M50 72 L54 88 M36 78 C33 82 28 84 26 86 M64 78 C67 82 72 84 74 86"
              stroke="url(#emblemMchGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Root Nodes */}
            <circle cx="38" cy="82" r="1.4" fill="#00f0ff" />
            <circle cx="62" cy="81" r="1.4" fill="#ec4899" />
            <circle cx="50" cy="88" r="1.5" fill="#9b5de5" />
          </g>
        </svg>
      )}
    </div>
  );
};
