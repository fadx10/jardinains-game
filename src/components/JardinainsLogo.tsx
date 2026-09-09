import React from 'react';
import { Heart } from 'lucide-react';

interface JardinainsLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBrickFrame?: boolean;
  showDedication?: boolean;
}

/**
 * Authentic recreations of the original "Jardinains!" logo banner
 * featuring:
 * - Rounded cartoon brick frame (magenta, cyan, yellow, and red bricks with black mortar)
 * - Peeking garden gnome with spiky red cone hat, pink nose, and bushy white beard
 * - Puffy white bubble cloud backdrop
 * - 3D glossy neon green jelly bubble typography "Jardinains!"
 * - Daisy flower with yellow button and magenta halo sitting atop the 'i'
 * - "with love for yesra" dedication banner underneath
 */
export default function JardinainsLogo({
  size = 'lg',
  showBrickFrame = true,
  showDedication = true,
}: JardinainsLogoProps) {
  const scale = size === 'sm' ? 0.55 : size === 'md' ? 0.78 : 1;

  return (
    <div className="flex flex-col items-center select-none">
      <div 
        className="relative flex items-center justify-center"
        style={{
          width: `${Math.round(480 * scale)}px`,
          height: `${Math.round(175 * scale)}px`,
        }}
      >
        <svg
          viewBox="0 0 500 180"
          className="w-full h-full overflow-visible drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
        >
          <defs>
            {/* Filter for cloud drop shadow */}
            <filter id="cloudShadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.8" />
            </filter>

            {/* Letter 3D Gel Gradient */}
            <linearGradient id="jellyGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="25%" stopColor="#22c55e" />
              <stop offset="70%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            {/* Magenta brick gradient */}
            <linearGradient id="pinkBrick" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>

            {/* Cyan brick gradient */}
            <linearGradient id="cyanBrick" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>

            {/* Yellow brick gradient */}
            <linearGradient id="yellowBrick" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>

            {/* Red brick gradient */}
            <linearGradient id="redBrick" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>

            {/* Orange brick gradient */}
            <linearGradient id="orangeBrick" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Specular White Gradient */}
            <linearGradient id="specularGlint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {showBrickFrame && (
            <g id="brickFrame">
              {/* Outer black rounded border container */}
              <rect
                x="20"
                y="15"
                width="460"
                height="150"
                rx="36"
                ry="36"
                fill="#18181b"
                stroke="#09090b"
                strokeWidth="10"
              />

              {/* Row 1: Magenta / Pink Bricks */}
              <g stroke="#18181b" strokeWidth="4">
                <rect x="42" y="24" width="46" height="26" rx="4" fill="url(#pinkBrick)" />
                <rect x="92" y="24" width="52" height="26" rx="4" fill="url(#pinkBrick)" />
                <rect x="148" y="24" width="52" height="26" rx="4" fill="url(#pinkBrick)" />
                <rect x="204" y="24" width="52" height="26" rx="4" fill="url(#pinkBrick)" />
                <rect x="260" y="24" width="52" height="26" rx="4" fill="url(#pinkBrick)" />
                <rect x="316" y="24" width="52" height="26" rx="4" fill="url(#pinkBrick)" />
                <rect x="372" y="24" width="48" height="26" rx="4" fill="url(#pinkBrick)" />
                <rect x="424" y="24" width="34" height="26" rx="4" fill="url(#pinkBrick)" />
              </g>

              {/* Row 2: Cyan / Sky Blue Bricks */}
              <g stroke="#18181b" strokeWidth="4">
                <rect x="32" y="54" width="42" height="26" rx="4" fill="url(#cyanBrick)" />
                <rect x="78" y="54" width="54" height="26" rx="4" fill="url(#cyanBrick)" />
                <rect x="136" y="54" width="54" height="26" rx="4" fill="url(#cyanBrick)" />
                <rect x="194" y="54" width="54" height="26" rx="4" fill="url(#cyanBrick)" />
                <rect x="252" y="54" width="54" height="26" rx="4" fill="url(#cyanBrick)" />
                <rect x="310" y="54" width="54" height="26" rx="4" fill="url(#cyanBrick)" />
                <rect x="368" y="54" width="54" height="26" rx="4" fill="url(#cyanBrick)" />
                <rect x="426" y="54" width="42" height="26" rx="4" fill="url(#cyanBrick)" />
              </g>

              {/* Row 3: Bright Yellow / Chartreuse Bricks */}
              <g stroke="#18181b" strokeWidth="4">
                <rect x="30" y="84" width="48" height="26" rx="4" fill="url(#yellowBrick)" />
                <rect x="82" y="84" width="54" height="26" rx="4" fill="url(#yellowBrick)" />
                <rect x="140" y="84" width="54" height="26" rx="4" fill="url(#yellowBrick)" />
                <rect x="198" y="84" width="54" height="26" rx="4" fill="url(#yellowBrick)" />
                <rect x="256" y="84" width="54" height="26" rx="4" fill="url(#yellowBrick)" />
                <rect x="314" y="84" width="54" height="26" rx="4" fill="url(#yellowBrick)" />
                <rect x="372" y="84" width="54" height="26" rx="4" fill="url(#yellowBrick)" />
                <rect x="430" y="84" width="40" height="26" rx="4" fill="url(#yellowBrick)" />
              </g>

              {/* Row 4: Vivid Red / Coral Bricks */}
              <g stroke="#18181b" strokeWidth="4">
                <rect x="42" y="114" width="46" height="26" rx="4" fill="url(#redBrick)" />
                <rect x="92" y="114" width="52" height="26" rx="4" fill="url(#redBrick)" />
                <rect x="148" y="114" width="52" height="26" rx="4" fill="url(#redBrick)" />
                <rect x="204" y="114" width="52" height="26" rx="4" fill="url(#redBrick)" />
                <rect x="260" y="114" width="52" height="26" rx="4" fill="url(#redBrick)" />
                <rect x="316" y="114" width="52" height="26" rx="4" fill="url(#redBrick)" />
                <rect x="372" y="114" width="48" height="26" rx="4" fill="url(#redBrick)" />
                <rect x="424" y="114" width="34" height="26" rx="4" fill="url(#redBrick)" />
              </g>
            </g>
          )}

          {/* Peeking Gnome Character over the top (The iconic Jardinains mascot!) */}
          <g id="peekingGnome" transform="translate(145, 10)">
            {/* Spiky white/tan beard */}
            <polygon
              points="10,40 0,55 8,50 4,64 16,56 22,68 28,56 38,62 34,50 46,55 36,40"
              fill="#fef3c7"
              stroke="#000000"
              strokeWidth="2.5"
            />
            {/* Gnome Face */}
            <ellipse cx="23" cy="35" rx="16" ry="12" fill="#fbcfe8" />
            {/* Big Cartoon Eyes */}
            <circle cx="16" cy="31" r="5.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
            <circle cx="28" cy="31" r="5.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
            {/* Pupils looking down */}
            <circle cx="17" cy="32" r="2.8" fill="#000000" />
            <circle cx="27" cy="32" r="2.8" fill="#000000" />
            {/* Eye glints */}
            <circle cx="16" cy="30" r="1" fill="#ffffff" />
            <circle cx="26" cy="30" r="1" fill="#ffffff" />
            {/* Cute Bulbous Pink Nose */}
            <ellipse cx="22" cy="37" rx="6.5" ry="5" fill="#f43f5e" stroke="#000000" strokeWidth="1.5" />
            <ellipse cx="20" cy="35.5" rx="2" ry="1.2" fill="#fda4af" />
            {/* Spiky Red Cone Hat */}
            <polygon
              points="22,-14 6,10 14,14 2,24 12,24 22,23 32,24 42,24 30,14 38,10"
              fill="#dc2626"
              stroke="#000000"
              strokeWidth="2.5"
            />
            {/* Hat highlight */}
            <polygon points="22,-10 14,12 22,18 26,6" fill="#ef4444" />
          </g>

          {/* White Cloud Backdrop for the Logo */}
          <g id="cloudBackdrop" filter="url(#cloudShadow)">
            <path
              d="M 80,95 
                 C 60,65 95,35 130,48 
                 C 150,30 200,28 230,46 
                 C 260,25 320,25 345,50 
                 C 380,30 425,48 435,80 
                 C 455,95 455,125 435,138 
                 C 420,155 375,152 345,142 
                 C 320,158 260,158 225,144 
                 C 190,158 140,155 115,140 
                 C 80,148 65,120 80,95 Z"
              fill="#ffffff"
              stroke="#27272a"
              strokeWidth="5"
            />
          </g>

          {/* Daisy Flower atop the 'i' */}
          <g id="daisy" transform="translate(320, 52)">
            {/* Magenta glow outline */}
            <circle cx="0" cy="0" r="21" fill="#c026d3" opacity="0.3" />
            {/* 10 Daisy White Petals */}
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, i) => (
              <g key={i} transform={`rotate(${angle})`}>
                <ellipse
                  cx="0"
                  cy="-12"
                  rx="4.5"
                  ry="9"
                  fill="#ffffff"
                  stroke="#4b5563"
                  strokeWidth="1.2"
                />
              </g>
            ))}
            {/* Golden Center Button */}
            <circle cx="0" cy="0" r="7.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="-2" cy="-2" r="2" fill="#fef08a" />
          </g>

          {/* Authentic Comic Bubble Lettering: "Jardinains!" */}
          <g id="textJardinains">
            {/* Heavy Black Outline Behind Letters */}
            <text
              x="250"
              y="118"
              textAnchor="middle"
              fill="#000000"
              stroke="#000000"
              strokeWidth="16"
              strokeLinejoin="round"
              strokeLinecap="round"
              fontFamily="'Sniglet', 'Bubblegum Sans', 'Fredoka', cursive, sans-serif"
              fontSize="78"
              fontWeight="800"
              letterSpacing="1"
            >
              Jardinains!
            </text>

            {/* Juicy Green Jelly Body */}
            <text
              x="250"
              y="118"
              textAnchor="middle"
              fill="url(#jellyGreen)"
              stroke="#15803d"
              strokeWidth="2.5"
              fontFamily="'Sniglet', 'Bubblegum Sans', 'Fredoka', cursive, sans-serif"
              fontSize="78"
              fontWeight="800"
              letterSpacing="1"
            >
              Jardinains!
            </text>

            {/* Specular White Highlights on top of letters */}
            <text
              x="250"
              y="115"
              textAnchor="middle"
              fill="none"
              stroke="url(#specularGlint)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fontFamily="'Sniglet', 'Bubblegum Sans', 'Fredoka', cursive, sans-serif"
              fontSize="78"
              fontWeight="800"
              letterSpacing="1"
              opacity="0.85"
            >
              Jardinains!
            </text>
          </g>
        </svg>
      </div>

      {/* with love for yesra banner */}
      {showDedication && (
        <div className="flex items-center justify-center gap-1.5 mt-1 px-4 py-0.5 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-400 font-['Sniglet'] font-bold text-sm tracking-wide shadow-sm">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
          <span>with love for yesra</span>
        </div>
      )}
    </div>
  );
}
