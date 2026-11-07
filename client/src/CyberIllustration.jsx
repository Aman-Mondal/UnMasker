import React from 'react';

export default function CyberIllustration({ size = 340 }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
    >
      <defs>
        <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.45" />
        </linearGradient>
        <filter id="laptopShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#1e3a8a" floodOpacity="0.12" />
        </filter>
        <filter id="glassShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Soft Background Circular Glow */}
      <ellipse cx="200" cy="150" rx="175" ry="115" fill="#eff6ff" opacity="0.85" />

      {/* Laptop Screen Body */}
      <g filter="url(#laptopShadow)">
        <rect x="75" y="42" width="250" height="162" rx="12" fill="#1e293b" />
        <rect x="85" y="52" width="230" height="142" rx="6" fill="url(#screenGrad)" />

        {/* Browser Top Bar */}
        <rect x="85" y="52" width="230" height="20" fill="#e2e8f0" rx="6" />
        <circle cx="97" cy="62" r="3" fill="#cbd5e1" />
        <circle cx="106" cy="62" r="3" fill="#cbd5e1" />
        <circle cx="115" cy="62" r="3" fill="#cbd5e1" />
        <rect x="128" y="58" width="110" height="8" rx="4" fill="#ffffff" />

        {/* Shield Icon inside Screen */}
        <path
          d="M200 95 C222 95, 238 106, 238 126 C238 156, 200 176, 200 176 C200 176, 162 156, 162 126 C162 106, 178 95, 200 95 Z"
          fill="url(#shieldGrad)"
        />
        {/* Checkmark inside Shield */}
        <path
          d="M188 129 L196 137 L214 119"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Laptop Keyboard Deck Base */}
        <path
          d="M40 204 L360 204 L340 226 L60 226 Z"
          fill="url(#laptopGrad)"
        />
        <rect x="165" y="207" width="70" height="5" rx="2.5" fill="#475569" />
        <path
          d="M32 226 C32 226, 42 231, 62 231 L338 231 C358 231, 368 226, 368 226 L358 228 C358 228, 343 234, 328 234 L72 234 C57 234, 42 228, 42 228 Z"
          fill="#cbd5e1"
        />
      </g>

      {/* Magnifying Glass Overlaid Inspecting Shield */}
      <g filter="url(#glassShadow)" transform="rotate(-15 285 145)">
        {/* Rim Outer */}
        <circle cx="285" cy="145" r="42" fill="#1e3a8a" />
        {/* Glass Lens */}
        <circle cx="285" cy="145" r="34" fill="url(#glassGrad)" />
        {/* Lens Reflection */}
        <path
          d="M266 132 C273 122, 287 120, 298 126"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Magnifier Handle */}
        <rect x="280" y="187" width="10" height="46" rx="5" fill="#1e3a8a" />
        <rect x="282" y="192" width="6" height="36" rx="3" fill="#3b82f6" />
      </g>
    </svg>
  );
}
