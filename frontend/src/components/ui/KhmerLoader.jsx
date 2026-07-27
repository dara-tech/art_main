/**
 * KhmerLoader — ក្បាច់ខ្មែរ animated SVG loading indicator
 *
 * Traditional Cambodian decorative motifs:
 *   • Lotus petals (ផ្កាឈូក)
 *   • Scroll / vine tendrils (ក្បាច់ក្រចក)
 *   • Naga scale ring (ក្បាច់សណ្តូក)
 *   • Angkor diamond lattice (ក្បាច់ហីរ)
 *
 * Uses `currentColor` → inherits the active accent --primary CSS variable automatically.
 */
import React from 'react';

export default function KhmerLoader({ size = 56, className = '' }) {
  const petals8 = Array.from({ length: 8 });
  const ring12  = Array.from({ length: 12 });
  const curls8  = Array.from({ length: 8 });
  const latt6   = Array.from({ length: 6 });

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}
      aria-label="ទំនាក់ទំនង AI..."
    >
      <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="kh-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0"    />
          </radialGradient>
        </defs>

        {/* Glow halo */}
        <circle cx="50" cy="50" r="48" fill="url(#kh-glow)" />

        {/* Outer naga-scale ring — spins clockwise */}
        <g transform="translate(50,50)" style={{ animation: 'kh-cw 9s linear infinite' }}>
          {ring12.map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <g key={i} transform={`translate(${44 * Math.cos(a)},${44 * Math.sin(a)}) rotate(${i * 30})`}>
                <path d="M0,-4.5 L2.8,0 L0,4.5 L-2.8,0 Z" fill="currentColor" opacity={i % 2 === 0 ? 0.85 : 0.3} />
              </g>
            );
          })}
        </g>

        {/* Mid scroll-vine ring — counter-clockwise */}
        <g transform="translate(50,50)" style={{ animation: 'kh-ccw 5.5s linear infinite' }}>
          {curls8.map((_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            return (
              <g key={i} transform={`translate(${32 * Math.cos(a)},${32 * Math.sin(a)}) rotate(${i * 45 + 90})`}>
                <path d="M0,-5 C3,-5 5,-2 5,0 C5,3 3,5 0,5 C-1,5 -2,3 -2,0 C-2,-1 -1,-3 0,-5 Z"
                  fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />
                <circle cx="0" cy="-2" r="1.3" fill="currentColor" opacity="0.9" />
              </g>
            );
          })}
        </g>

        {/* Lattice diamonds — slow reverse */}
        <g transform="translate(50,50)" style={{ animation: 'kh-cw 13s linear infinite reverse' }}>
          {latt6.map((_, i) => {
            const a = (i * 60 * Math.PI) / 180;
            return (
              <g key={i} transform={`translate(${20 * Math.cos(a)},${20 * Math.sin(a)})`}>
                <rect x="-3" y="-3" width="6" height="6" transform="rotate(45)"
                  fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
              </g>
            );
          })}
        </g>

        {/* Lotus flower centre — pulses */}
        <g transform="translate(50,50)" style={{ animation: 'kh-pulse 2.2s ease-in-out infinite', transformOrigin: '50px 50px' }}>
          {/* Outer petals */}
          {petals8.map((_, i) => (
            <g key={i} transform={`rotate(${i * 45})`}>
              <path d="M0,-19 C4.5,-14 4.5,-8 0,-6 C-4.5,-8 -4.5,-14 0,-19 Z"
                fill="currentColor" opacity={i % 2 === 0 ? 0.92 : 0.5} />
            </g>
          ))}
          {/* Inner petals */}
          {petals8.map((_, i) => (
            <g key={i} transform={`rotate(${i * 45 + 22.5})`}>
              <path d="M0,-12 C2.8,-9 2.8,-5 0,-4 C-2.8,-5 -2.8,-9 0,-12 Z"
                fill="currentColor" opacity="0.38" />
            </g>
          ))}
          {/* Centre jewel */}
          <circle cx="0" cy="0" r="4.5" fill="currentColor" />
          <circle cx="0" cy="0" r="2"   fill="currentColor" opacity="0.25" />
        </g>

        <style>{`
          @keyframes kh-cw    { to { transform: rotate(360deg);  } }
          @keyframes kh-ccw   { to { transform: rotate(-360deg); } }
          @keyframes kh-pulse {
            0%, 100% { transform: scale(1);    opacity: 1;    }
            50%       { transform: scale(1.13); opacity: 0.82; }
          }
        `}</style>
      </svg>
    </span>
  );
}
