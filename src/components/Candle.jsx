import { useId } from 'react';
import { motion } from 'framer-motion';

export default function Candle({ lit = false, className = '', style }) {
  const uid = useId();
  const waxLitId = `waxLit-${uid}`;
  const waxUnlitId = `waxUnlit-${uid}`;
  const flameId = `flame-${uid}`;
  const goldId = `gold-${uid}`;
  const goldRimId = `goldRim-${uid}`;

  return (
    <div className={className} style={style}>
      <div className="relative w-full h-full">
        {lit && (
          <motion.div
            className="absolute left-1/2 -top-2 w-4 h-4 -translate-x-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,214,120,0.95), rgba(255,170,60,0.45) 55%, transparent 75%)',
              filter: 'blur(2.5px)',
            }}
            animate={{ opacity: [0.55, 1, 0.6, 0.95], scale: [0.9, 1.2, 0.95, 1.1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <svg viewBox="0 0 30 60" className="relative w-full h-full">
          <defs>
            <linearGradient id={waxLitId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fff6df" />
              <stop offset="55%" stopColor="#ffe4a8" />
              <stop offset="100%" stopColor="#eec978" />
            </linearGradient>
            <linearGradient id={waxUnlitId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#eeeae4" />
              <stop offset="55%" stopColor="#d7d1c8" />
              <stop offset="100%" stopColor="#b8b1a5" />
            </linearGradient>
            <radialGradient id={flameId} cx="50%" cy="70%" r="70%">
              <stop offset="0%" stopColor="#fff6c8" />
              <stop offset="45%" stopColor="#ffb648" />
              <stop offset="100%" stopColor="#ff6a2e" />
            </radialGradient>
            <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fff3cf" />
              <stop offset="45%" stopColor="#f0c869" />
              <stop offset="100%" stopColor="#b8842e" />
            </linearGradient>
            <linearGradient id={goldRimId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fffbe8" />
              <stop offset="50%" stopColor="#ffe9a8" />
              <stop offset="100%" stopColor="#d9a94a" />
            </linearGradient>
          </defs>

          {/* holder — saucer base + flared cup cradling the candle */}
          <ellipse cx="15" cy="58.5" rx="12.5" ry="2.6" fill={`url(#${goldId})`} />
          <path d="M9.5 53 L12 46.5 L18 46.5 L20.5 53 Z" fill={`url(#${goldId})`} />
          <ellipse cx="15" cy="46.5" rx="6.3" ry="1.4" fill={`url(#${goldRimId})`} />

          <rect
            x="7.5" y="13" width="15" height="35" rx="4.5"
            fill={lit ? `url(#${waxLitId})` : `url(#${waxUnlitId})`}
          />
          <rect x="13.5" y="6" width="2" height="9" fill="#5b4636" />

          {lit && (
            <motion.path
              d="M15 0 C19.5 5.5 19.5 10.5 15 14 C10.5 10.5 10.5 5.5 15 0 Z"
              fill={`url(#${flameId})`}
              animate={{ scaleY: [1, 1.18, 0.92, 1], scaleX: [1, 0.88, 1.06, 1] }}
              transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '15px 14px' }}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
