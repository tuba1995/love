import { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { PENGUIN_RUN_GIF, PENGUIN_ARRIVED_GIF } from '../data/config';

// The penguin itself is a real GIF sticker — PENGUIN_RUN_GIF while it's
// moving/waiting, swapped for PENGUIN_ARRIVED_GIF once it reaches the
// destination (state 'happy') — falling back to a plain emoji if the
// active one fails to load. Returned as an SVG <g> (not a full <svg>) so
// callers can drop it straight inside another SVG and position it with a
// wrapping transform. Local coordinate space: ground sits at y=0, sticker
// top near y=-108, roughly -46..46 wide — same footprint as the old
// hand-drawn rig so placement code elsewhere didn't need to change.
const bodyMotion = {
  run: {
    animate: { y: [0, -9, 0], rotate: [-4, 4, -4] },
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  },
  tired: {
    animate: { y: [0, -2, 0], rotate: [2, 4, 2] },
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
  },
  happy: {
    animate: { y: [0, -16, 0] },
    transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' },
  },
  idle: {
    animate: { y: [0, -4, 0] },
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  },
};

export default function PenguinFigure({ state = 'idle', className = '' }) {
  const m = bodyMotion[state] || bodyMotion.idle;
  const tired = state === 'tired';
  const happy = state === 'happy';
  const [penguinGifError, setPenguinGifError] = useState(false);
  const spriteClipId = useId();
  const spriteSrc = happy ? PENGUIN_ARRIVED_GIF : PENGUIN_RUN_GIF;

  useEffect(() => setPenguinGifError(false), [spriteSrc]);

  return (
    <motion.g className={className} {...m} style={{ transformOrigin: '0px 0px' }}>
      {/* shadow */}
      <ellipse cx="0" cy="7" rx="34" ry="7" fill="rgba(20,15,10,0.18)" />

      {/* penguin sprite */}
      {!penguinGifError ? (
        <>
          <clipPath id={spriteClipId}>
            <rect x="-46" y="-108" width="92" height="112" rx="18" />
          </clipPath>
          <rect x="-48" y="-110" width="96" height="116" rx="20" fill="#fff" opacity="0.6" />
          <image
            href={spriteSrc}
            x="-46"
            y="-108"
            width="92"
            height="112"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${spriteClipId})`}
            onError={() => setPenguinGifError(true)}
          />
          <rect x="-46" y="-108" width="92" height="112" rx="18" fill="none" stroke="rgba(20,14,10,0.25)" strokeWidth="2.5" />
        </>
      ) : (
        <text x="0" y="-20" textAnchor="middle" fontSize="80">
          🐧
        </text>
      )}

      {/* mood accents layered on top of the sprite */}
      {tired && (
        <text x="20" y="-100" textAnchor="middle" fontSize="20">
          😪
        </text>
      )}
      {happy && (
        <text x="22" y="-96" textAnchor="middle" fontSize="20">
          ✨
        </text>
      )}
    </motion.g>
  );
}
