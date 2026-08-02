import { motion } from 'framer-motion';

const PALETTES = {
  boy: {
    skin: '#ffdcb8',
    hair: '#2b2440',
    hairShine: '#4a3f6b',
    top: '#5b8def',
    top2: '#3f6bd1',
    bottom: '#2a2f4a',
    shoe: '#181c2c',
  },
  girl: {
    skin: '#ffe2c6',
    hair: '#6b3524',
    hairShine: '#9a5a3e',
    top: '#ff7fb0',
    top2: '#e85a95',
    bottom: '#ff9dc6',
    shoe: '#7a2e4a',
  },
};

export default function PersonFigure({ variant = 'boy', className = '', bob = true, walk = true }) {
  const p = PALETTES[variant] ?? PALETTES.boy;
  const isGirl = variant === 'girl';

  return (
    <motion.svg
      viewBox="0 0 60 104"
      className={className}
      animate={bob ? { y: [0, -5, 0] } : undefined}
      transition={bob ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {/* back leg */}
      <motion.g
        style={{ transformOrigin: '37px 76px' }}
        animate={walk ? { rotate: [10, -10, 10] } : undefined}
        transition={walk ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <rect x="32" y="76" width="9" height="22" rx="4.5" fill={p.bottom} />
        <rect x="30" y="95" width="14" height="7" rx="3.5" fill={p.shoe} />
      </motion.g>

      {/* front leg */}
      <motion.g
        style={{ transformOrigin: '23px 76px' }}
        animate={walk ? { rotate: [-10, 10, -10] } : undefined}
        transition={walk ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <rect x="18" y="76" width="9" height="22" rx="4.5" fill={p.bottom} />
        <rect x="16" y="95" width="14" height="7" rx="3.5" fill={p.shoe} />
      </motion.g>

      {/* back arm */}
      <motion.rect
        x="40" y="52" width="8" height="20" rx="4"
        fill={p.top2}
        style={{ transformOrigin: '44px 54px' }}
        animate={walk ? { rotate: [-16, 16, -16] } : undefined}
        transition={walk ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : undefined}
      />

      {/* torso */}
      {isGirl ? (
        <path d="M18 50 Q30 44 42 50 L45 74 Q30 80 15 74 Z" fill={p.top} />
      ) : (
        <rect x="16" y="50" width="28" height="26" rx="11" fill={p.top} />
      )}

      {/* front arm */}
      <motion.rect
        x="12" y="52" width="8" height="20" rx="4"
        fill={p.top}
        style={{ transformOrigin: '16px 54px' }}
        animate={walk ? { rotate: [16, -16, 16] } : undefined}
        transition={walk ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : undefined}
      />

      {/* neck */}
      <rect x="25" y="40" width="10" height="8" fill={p.skin} />

      {/* head — oversized for a cute chibi look */}
      <circle cx="30" cy="26" r="19" fill={p.skin} />

      {/* blush */}
      <ellipse cx="18" cy="31" rx="3.2" ry="1.8" fill="#ff9fb8" opacity="0.6" />
      <ellipse cx="42" cy="31" rx="3.2" ry="1.8" fill="#ff9fb8" opacity="0.6" />

      {/* big sparkly anime eyes */}
      <ellipse cx="22.5" cy="26" rx="2.6" ry="3.6" fill="#241d1d" />
      <ellipse cx="37.5" cy="26" rx="2.6" ry="3.6" fill="#241d1d" />
      <circle cx="21.3" cy="24" r="0.9" fill="#fff" />
      <circle cx="36.3" cy="24" r="0.9" fill="#fff" />

      {/* smile */}
      <path d="M26 33 Q30 36 34 33" stroke="#a5473f" strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {/* hair */}
      {isGirl ? (
        <>
          <path
            d="M11 26 C9 6 22 1 30 1 C38 1 51 6 49 26 C49 38 47 48 44 54 C45 40 42 27 30 27 C18 27 15 40 16 54 C13 48 11 38 11 26 Z"
            fill={p.hair}
          />
          <circle cx="9" cy="38" r="6.5" fill={p.hair} />
          <circle cx="51" cy="38" r="6.5" fill={p.hair} />
          <path d="M11 22 C13 14 20 9 30 9" stroke={p.hairShine} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
        </>
      ) : (
        <>
          <path d="M11 22 C11 5 49 5 49 22 L49 26 C42 15 18 15 11 26 Z" fill={p.hair} />
          <path d="M20 9 L24 15 M30 7 L30 14 M40 9 L36 15" stroke={p.hair} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </motion.svg>
  );
}
