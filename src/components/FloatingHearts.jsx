import { useMemo } from 'react';

const SYMBOLS = ['💕', '💗', '💖', '✨', '💫'];

function seededParticles(count) {
  return Array.from({ length: count }, (_, i) => {
    const left = Math.round(Math.random() * 100);
    const delay = Math.round(Math.random() * 12 * 10) / 10;
    const duration = 9 + Math.random() * 8;
    const size = 12 + Math.random() * 20;
    const dx = Math.round((Math.random() - 0.5) * 120);
    const opacity = 0.35 + Math.random() * 0.45;
    const symbol = SYMBOLS[i % SYMBOLS.length];
    return { id: i, left, delay, duration, size, dx, opacity, symbol };
  });
}

export default function FloatingHearts({ count = 22, className = '' }) {
  const particles = useMemo(() => seededParticles(count), [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 select-none"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            '--dx': `${p.dx}px`,
            '--o': p.opacity,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
