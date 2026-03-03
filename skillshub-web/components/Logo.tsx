import React from 'react';

export const Logo = ({ className = "w-9 h-9" }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ filter: 'drop-shadow(0 0 6px rgba(240, 190, 87, 0.4))' }}
  >
    <defs>
      <linearGradient id="logoGold" x1="6" y1="8" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F0BE57" />
        <stop offset="100%" stopColor="#C58B2E" />
      </linearGradient>
    </defs>

    {/* Geometric brain — outer contour */}
    <path
      d="M14 30 L10 24 L12 17 L17 12 L24 10 L31 12 L36 17 L38 24 L36 30 L32 34 L27 36 L21 36 L16 34 Z"
      stroke="url(#logoGold)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Internal triangulation lines */}
    <path
      d="M17 12 L22 20 M24 10 L22 20 M31 12 L26 19 M36 17 L26 19 M38 24 L30 25 M36 30 L30 25 M32 34 L27 28 M27 36 L27 28 M21 36 L22 29 M16 34 L22 29 M14 30 L20 26 M10 24 L20 26 M12 17 L19 22"
      stroke="#F0BE57"
      strokeWidth="0.8"
      opacity="0.5"
    />
    {/* Cross connections */}
    <path
      d="M22 20 L26 19 M26 19 L30 25 M30 25 L27 28 M27 28 L22 29 M22 29 L20 26 M20 26 L19 22 M19 22 L22 20 M22 20 L27 28 M26 19 L22 29 M30 25 L20 26 M19 22 L26 19"
      stroke="#F0BE57"
      strokeWidth="0.8"
      opacity="0.6"
    />

    {/* Glowing nodes — outer vertices */}
    <circle cx="24" cy="10" r="1.8" fill="#F0BE57" />
    <circle cx="17" cy="12" r="1.5" fill="#F0BE57" opacity="0.9" />
    <circle cx="31" cy="12" r="1.5" fill="#F0BE57" opacity="0.9" />
    <circle cx="12" cy="17" r="1.3" fill="#F0BE57" opacity="0.8" />
    <circle cx="36" cy="17" r="1.3" fill="#F0BE57" opacity="0.8" />
    <circle cx="10" cy="24" r="1.3" fill="#F0BE57" opacity="0.7" />
    <circle cx="38" cy="24" r="1.3" fill="#F0BE57" opacity="0.7" />
    <circle cx="14" cy="30" r="1.3" fill="#C58B2E" opacity="0.8" />
    <circle cx="36" cy="30" r="1.3" fill="#C58B2E" opacity="0.8" />
    <circle cx="16" cy="34" r="1.3" fill="#C58B2E" opacity="0.7" />
    <circle cx="32" cy="34" r="1.3" fill="#C58B2E" opacity="0.7" />
    <circle cx="21" cy="36" r="1.3" fill="#C58B2E" opacity="0.7" />
    <circle cx="27" cy="36" r="1.3" fill="#C58B2E" opacity="0.7" />

    {/* Glowing nodes — inner vertices */}
    <circle cx="22" cy="20" r="1.5" fill="#F0BE57" opacity="0.9" />
    <circle cx="26" cy="19" r="1.5" fill="#F0BE57" opacity="0.9" />
    <circle cx="19" cy="22" r="1.3" fill="#F0BE57" opacity="0.8" />
    <circle cx="30" cy="25" r="1.5" fill="#F0BE57" opacity="0.8" />
    <circle cx="20" cy="26" r="1.3" fill="#F0BE57" opacity="0.8" />
    <circle cx="27" cy="28" r="1.3" fill="#C58B2E" opacity="0.8" />
    <circle cx="22" cy="29" r="1.3" fill="#C58B2E" opacity="0.8" />
  </svg>
);
