import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import FloatingHearts from './FloatingHearts';
import { COMING_SOON } from '../data/config';

function getTimeLeft(target) {
  const diff = Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function ComingSoonScreen() {
  const target = useMemo(() => new Date(COMING_SOON.targetDate).getTime(), []);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [target]);

  const units = [
    { label: 'Ngày', value: timeLeft.days },
    { label: 'Giờ', value: timeLeft.hours },
    { label: 'Phút', value: timeLeft.minutes },
    { label: 'Giây', value: timeLeft.seconds },
  ];

  return (
    <motion.div
      className="relative w-full min-h-svh flex flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#2b1330] via-[#3a1240] to-[#1a0f1f] px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      {/* ánh sáng mờ ảo nền, cùng tông với các màn hình khác */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-130 h-130 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-70 h-70 rounded-full bg-amber-400/10 blur-3xl" />
      <FloatingHearts count={20} />

      {/* trái tim đập nhịp + vòng sáng lan toả phía sau */}
      <div className="relative z-10 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-rose-300/50"
          animate={{ scale: [1, 1.9, 2.6], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl sm:text-7xl relative"
        >
          💗
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10 font-script text-rose-200 text-4xl sm:text-5xl mb-2 text-center px-4"
      >
        {COMING_SOON.title}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 text-rose-300/70 text-sm tracking-[0.3em] uppercase mb-10 text-center px-4"
      >
        {COMING_SOON.subtitle}
      </motion.p>

      <div className="relative z-10 grid grid-cols-4 gap-3 sm:gap-4">
        {units.map((u, i) => (
          <motion.div
            key={u.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 px-3 py-4 sm:px-5 sm:py-6 shadow-xl min-w-16 sm:min-w-20"
          >
            <motion.span
              key={u.value}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl sm:text-4xl font-semibold text-white tabular-nums"
            >
              {String(u.value).padStart(2, '0')}
            </motion.span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-rose-200/70">
              {u.label}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="relative z-10 mt-10 text-rose-100/60 text-xs tracking-widest uppercase"
      >
        Còn một chút nữa thôi...
      </motion.p>

      <div className="relative z-10 mt-6 flex justify-center gap-3 text-2xl">
        {['💕', '💖', '💗'].map((s, i) => (
          <motion.span
            key={s}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
          >
            {s}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
