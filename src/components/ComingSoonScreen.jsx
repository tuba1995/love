import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FloatingHearts from './FloatingHearts';
import { GALLERY_IMAGE, SITE } from '../data/config';

const LOVE_STARTED_AT = new Date(2026, 3, 18, 0, 0, 0).getTime();

function getLoveTime() {
  const diff = Math.max(0, Date.now() - LOVE_STARTED_AT);
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function ComingSoonScreen() {
  const [loveTime, setLoveTime] = useState(getLoveTime);

  useEffect(() => {
    const intervalId = window.setInterval(() => setLoveTime(getLoveTime()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const units = [
    { label: 'Ngày', value: loveTime.days },
    { label: 'Giờ', value: loveTime.hours },
    { label: 'Phút', value: loveTime.minutes },
    { label: 'Giây', value: loveTime.seconds },
  ];

  return (
    <motion.main
      className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#fff1f5] via-[#fce7f3] to-[#eadcff] px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute -top-28 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-300/35 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-fuchsia-300/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl" />
      <FloatingHearts count={18} />

      <motion.section
        className="relative z-10 flex w-full max-w-xl flex-col items-center text-center"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
          Hành trình của chúng mình
        </p>
        <h1 className="font-script text-4xl text-fuchsia-900 sm:text-5xl">
          {SITE.boyName} &amp; {SITE.girlName}
        </h1>

        <motion.div
          className="relative my-7"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute -inset-3 rounded-[2.5rem] bg-linear-to-br from-rose-300 via-fuchsia-300 to-amber-200 opacity-70 blur-md" />
          <div className="relative h-72 w-56 overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-2xl sm:h-80 sm:w-64">
            <img
              src={GALLERY_IMAGE}
              alt="Kỷ niệm của hai chúng mình"
              className="h-full w-full object-cover"
            />
          </div>
          <motion.span
            className="absolute -bottom-4 -right-5 text-5xl drop-shadow-md"
            animate={{ scale: [1, 1.16, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            aria-hidden="true"
          >
            💗
          </motion.span>
        </motion.div>

        <p className="mb-4 font-script text-3xl text-fuchsia-800">Chúng mình đã yêu nhau được</p>

        <div className="grid w-full grid-cols-4 gap-2 sm:gap-3">
          {units.map((unit, index) => (
            <motion.div
              key={unit.label}
              className="flex min-w-0 flex-col items-center rounded-2xl border border-white/80 bg-white/55 px-1 py-3 shadow-lg backdrop-blur-md sm:py-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + index * 0.08 }}
            >
              <motion.span
                key={unit.value}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold tabular-nums text-fuchsia-900 sm:text-3xl"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-500 sm:text-xs">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>

        <p className="mt-5 text-sm font-medium tracking-wider text-fuchsia-800/70">
          Kể từ ngày 18 / 04 / 2026
        </p>
      </motion.section>
    </motion.main>
  );
}
