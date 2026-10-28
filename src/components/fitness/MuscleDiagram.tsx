'use client';

import React, { useState } from 'react';

interface MuscleDiagramProps {
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio' | string;
  imageUrl?: string;
  imageUrlFinish?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  altText?: string;
}

export const MuscleDiagram: React.FC<MuscleDiagramProps> = ({
  muscleGroup,
  imageUrl,
  imageUrlFinish,
  className = '',
  size = 'md',
  altText,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine active frame when dual-frame images are available
  const activeImage = isHovered && imageUrlFinish ? imageUrlFinish : imageUrl;

  // If a valid image URL is provided and has not failed, display real movement photography
  if (imageUrl && !imageError) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg bg-[#000000] border border-[#242424] flex items-center justify-center select-none group/img transition-all ${className} ${
          size === 'sm'
            ? 'w-10 h-10'
            : size === 'md'
            ? 'w-16 h-16'
            : size === 'lg'
            ? 'w-24 h-24'
            : 'w-full h-56'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={altText || `${muscleGroup} movement (hover to toggle movement)`}
      >
        <img
          src={activeImage}
          alt={altText || muscleGroup}
          className="w-full h-full object-cover object-center transition-all duration-300"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Dual-frame motion indicator chip */}
        {imageUrlFinish && (size === 'md' || size === 'lg' || size === 'xl') && (
          <div className="absolute top-1 right-1 bg-[#000000]/80 backdrop-blur-sm border border-[#333333] px-1 py-0.2 rounded text-[8px] font-mono text-[#CCCCCC] uppercase tracking-wider flex items-center gap-0.5 pointer-events-none">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isHovered ? 'bg-[#E50914] animate-pulse' : 'bg-[#555555]'
              }`}
            />
            <span>{isHovered ? 'FINISH' : 'START'}</span>
          </div>
        )}

        {/* Muscle group badge on XL views */}
        {size === 'xl' && (
          <div className="absolute bottom-2 right-2 bg-[#000000]/85 border border-[#333333] px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-wider pointer-events-none">
            {muscleGroup}
          </div>
        )}
      </div>
    );
  }

  // Pre-configured dimensions for SVG Anatomical Fallback
  // Colors
  const primaryHighlight = '#E50914';
  const bodyBase = '#222222';
  const bodyAccent = '#383838';

  const isChest = muscleGroup === 'Chest';
  const isBack = muscleGroup === 'Back';
  const isLegs = muscleGroup === 'Legs';
  const isShoulders = muscleGroup === 'Shoulders';
  const isArms = muscleGroup === 'Arms';
  const isCore = muscleGroup === 'Core';
  const isCardio = muscleGroup === 'Cardio';

  return (
    <div
      className={`relative flex items-center justify-center bg-[#0D0D0D] border border-[#222222] rounded-lg overflow-hidden shrink-0 select-none ${className} ${
        size === 'sm' ? 'w-10 h-10 p-1' : size === 'md' ? 'w-16 h-16 p-1.5' : size === 'lg' ? 'w-24 h-24 p-2' : 'w-full h-44 p-3'
      }`}
      title={`${muscleGroup} Target`}
    >
      {/* Background subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:8px_8px] opacity-40 pointer-events-none" />

      {isCardio ? (
        // Cardio Pulse & Heart/Lungs Iconography
        <svg viewBox="0 0 100 100" className="w-full h-full max-h-full">
          <circle cx="50" cy="50" r="42" fill="#141414" stroke="#262626" strokeWidth="2" />
          <path
            d="M 50 68 C 50 68 30 52 30 38 C 30 28 38 22 46 28 C 50 32 50 32 54 28 C 62 22 70 28 70 38 C 70 52 50 68 50 68 Z"
            fill={primaryHighlight}
            className="animate-pulse"
          />
          <path
            d="M 22 52 L 34 52 L 40 40 L 46 62 L 52 36 L 58 58 L 64 52 L 78 52"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        // High-contrast Vector Anatomical Silhouette
        <svg viewBox="0 0 100 110" className="w-full h-full max-h-full drop-shadow-sm">
          {/* Head & Neck */}
          <circle cx="50" cy="14" r="8" fill={bodyBase} stroke={bodyAccent} strokeWidth="1" />
          <path d="M 46 22 L 46 27 L 54 27 L 54 22 Z" fill={bodyBase} />

          {/* Trapezius / Upper Back */}
          <path
            d="M 40 27 L 50 24 L 60 27 L 55 33 L 45 33 Z"
            fill={isBack ? primaryHighlight : bodyBase}
            stroke={isBack ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />

          {/* Shoulders (Deltoids) */}
          <path
            d="M 33 28 C 30 30 27 36 29 42 C 32 42 37 38 38 32 Z"
            fill={isShoulders ? primaryHighlight : bodyBase}
            stroke={isShoulders ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />
          <path
            d="M 67 28 C 70 30 73 36 71 42 C 68 42 63 38 62 32 Z"
            fill={isShoulders ? primaryHighlight : bodyBase}
            stroke={isShoulders ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />

          {/* Chest (Pectorals) */}
          <path
            d="M 39 31 C 45 31 49 33 49 42 C 43 43 37 41 36 35 Z"
            fill={isChest ? primaryHighlight : bodyBase}
            stroke={isChest ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />
          <path
            d="M 61 31 C 55 31 51 33 51 42 C 57 43 63 41 64 35 Z"
            fill={isChest ? primaryHighlight : bodyBase}
            stroke={isChest ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />

          {/* Back (Latissimus Dorsi) */}
          <path
            d="M 36 36 L 41 42 L 41 53 L 34 46 Z"
            fill={isBack ? primaryHighlight : bodyBase}
          />
          <path
            d="M 64 36 L 59 42 L 59 53 L 66 46 Z"
            fill={isBack ? primaryHighlight : bodyBase}
          />

          {/* Core / Abs (Rectus Abdominis & Obliques) */}
          <rect
            x="44"
            y="43"
            width="12"
            height="15"
            rx="2"
            fill={isCore ? primaryHighlight : bodyBase}
            stroke={isCore ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />
          <line x1="50" y1="44" x2="50" y2="57" stroke="#101010" strokeWidth="1" />
          <line x1="45" y1="48" x2="55" y2="48" stroke="#101010" strokeWidth="1" />
          <line x1="45" y1="53" x2="55" y2="53" stroke="#101010" strokeWidth="1" />

          {/* Arms (Biceps & Triceps & Forearms) */}
          <path
            d="M 28 42 L 25 56 L 30 56 L 31 43 Z"
            fill={isArms ? primaryHighlight : bodyBase}
            stroke={isArms ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />
          <path
            d="M 24 57 L 22 71 L 27 70 L 29 57 Z"
            fill={isArms ? primaryHighlight : bodyBase}
            stroke={isArms ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />

          <path
            d="M 72 42 L 75 56 L 70 56 L 69 43 Z"
            fill={isArms ? primaryHighlight : bodyBase}
            stroke={isArms ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />
          <path
            d="M 76 57 L 78 71 L 73 70 L 71 57 Z"
            fill={isArms ? primaryHighlight : bodyBase}
            stroke={isArms ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />

          {/* Pelvis / Hips */}
          <path d="M 42 59 L 58 59 L 55 66 L 45 66 Z" fill={bodyBase} />

          {/* Legs (Quads / Thighs) */}
          <path
            d="M 40 66 L 48 66 L 46 84 L 38 84 Z"
            fill={isLegs ? primaryHighlight : bodyBase}
            stroke={isLegs ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />
          <path
            d="M 52 66 L 60 66 L 62 84 L 54 84 Z"
            fill={isLegs ? primaryHighlight : bodyBase}
            stroke={isLegs ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />

          {/* Calves */}
          <path
            d="M 38 86 L 45 86 L 43 103 L 39 103 Z"
            fill={isLegs ? primaryHighlight : bodyBase}
            stroke={isLegs ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />
          <path
            d="M 55 86 L 62 86 L 61 103 L 57 103 Z"
            fill={isLegs ? primaryHighlight : bodyBase}
            stroke={isLegs ? primaryHighlight : bodyAccent}
            strokeWidth="1"
          />
        </svg>
      )}

      {/* Target muscle label tag on large views */}
      {size === 'xl' && (
        <div className="absolute bottom-2 right-2 bg-[#000000]/80 border border-[#262626] px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#E50914] uppercase tracking-wider">
          {muscleGroup} Target
        </div>
      )}
    </div>
  );
};
