import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import FloatingHearts from './FloatingHearts';
import PersonFigure from './PersonFigure';
import Candle from './Candle';
import { MEMORIES, SITE } from '../data/config';

const STEP_COUNT = MEMORIES.length;

function CoupleHoldingHands({ className = '', figureClassName, expression = 0 }) {
  return (
    <div className={`flex items-end ${className}`}>
      <PersonFigure variant="boy" expression={expression} innerArm="right" className={`${figureClassName} -mr-5 drop-shadow-md`} />
      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#f2cb9e] border border-black/10 mb-6 sm:mb-7 z-10" />
      <PersonFigure variant="girl" expression={expression} innerArm="left" className={`${figureClassName} -ml-5 drop-shadow-md`} />
    </div>
  );
}

// A straight flight of steps centered on screen, each one a touch narrower
// than the last so it reads as real stairs receding upward.
function buildSteps(count) {
  const maxWidth = 92;
  const minWidth = 52;
  const heightPct = 100 / count;
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    const widthPct = maxWidth - (maxWidth - minWidth) * t;
    return {
      widthPct,
      leftPct: 50 - widthPct / 2,
      bottomPct: i * heightPct,
      heightPct,
    };
  });
}

function finalBurst() {
  const heart = confetti.shapeFromText({ text: '💖', scalar: 2.2 });
  const heart2 = confetti.shapeFromText({ text: '🎉', scalar: 2 });
  const duration = 1400;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, shapes: [heart, heart2], startVelocity: 45, zIndex: 60 });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, shapes: [heart, heart2], startVelocity: 45, zIndex: 60 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function StaircaseJourney() {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const steps = useMemo(() => buildSteps(STEP_COUNT), []);
  const isLast = step === STEP_COUNT - 1;
  const memory = MEMORIES[step];
  const stepHeightPct = 100 / STEP_COUNT;
  // 4-stage expression, more cheerful the higher they've climbed — matches
  // PersonFigure's BROW/mouth/eye stages (0 = focused, 3 = joyful at the top).
  const progress = STEP_COUNT > 1 ? step / (STEP_COUNT - 1) : 1;
  const expression = isLast ? 3 : progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2;

  const goNext = () => {
    if (step < STEP_COUNT - 1) {
      setStep((s) => s + 1);
    } else if (!celebrated) {
      setCelebrated(true);
      finalBurst();
    }
  };
  const goPrev = () => {
    if (celebrated) {
      setCelebrated(false);
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };
  const restart = () => {
    setCelebrated(false);
    setStarted(false);
    setStep(0);
  };

  return (
    <motion.div
      className="relative w-full min-h-svh overflow-hidden bg-linear-to-b from-[#fdf2df] via-[#dfe8fb] to-[#f7dcec] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* dreamy sky glow + clouds */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-130 h-100 rounded-full bg-amber-100/60 blur-3xl" />
      <div className="absolute top-10 -left-15 w-55 h-25 rounded-full bg-white/70 blur-2xl" />
      <div className="absolute top-32 -right-10 w-65 h-30 rounded-full bg-white/60 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-75 h-65 rounded-full bg-rose-200/50 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-70 h-60 rounded-full bg-fuchsia-200/40 blur-3xl" />
      <FloatingHearts count={14} />

      {/* floral decoration along the base */}
      <div className="absolute bottom-0 inset-x-0 flex justify-between px-2 text-2xl sm:text-3xl opacity-80 pointer-events-none select-none">
        <span>🌸🌿</span>
        <span>🌿🌸</span>
      </div>

      <div className="relative z-10 flex flex-col items-center pt-8 px-4">
        <p className="font-script text-fuchsia-800 text-3xl sm:text-4xl drop-shadow-sm">{SITE.title}</p>
        {!celebrated && started && (
          <div className="flex items-center gap-2 mt-3">
            {MEMORIES.map((m, i) => (
              <button
                key={m.month}
                onClick={() => setStep(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === step ? 'bg-rose-500 w-6' : i < step ? 'bg-rose-400/70' : 'bg-fuchsia-900/15'}`}
                aria-label={`Tháng ${m.month}`}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!celebrated ? (
          <motion.div
            key="climb"
            className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-6 px-6 pb-10 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="hidden md:block" />

            {/* a real flight of stairs, always centered — the middle grid column */}
            <div className="relative w-76 h-102 sm:w-86 sm:h-114 shrink-0">
              {steps.map((s, i) => {
                const climbed = i <= step;
                return (
                  <div
                    key={i}
                    className="absolute transition-all duration-500"
                    style={{
                      left: `${s.leftPct}%`,
                      width: `${s.widthPct}%`,
                      bottom: `${s.bottomPct}%`,
                      height: `${s.heightPct}%`,
                    }}
                  >
                    {/* riser — vertical front face of the step, fluted marble columns */}
                    <div
                      className="absolute inset-x-0 bottom-0 top-2.5 sm:top-3.5 transition-colors duration-500"
                      style={{
                        backgroundImage: climbed
                          ? 'repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 7px), linear-gradient(to bottom, #fffaf0, #f4e3bd 55%, #dcb977 100%)'
                          : 'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0 1px, transparent 1px 9px), linear-gradient(to bottom, #f3f0ec, #d9d4cb)',
                        boxShadow: climbed
                          ? 'inset 0 10px 12px -8px rgba(255,255,255,0.8), inset 0 -12px 16px -10px rgba(120,85,30,0.35)'
                          : 'inset 0 8px 10px -8px rgba(255,255,255,0.6), inset 0 -8px 10px -8px rgba(80,70,60,0.15)',
                      }}
                    />
                    {/* scalloped ruffle trim marking the seam between tread and riser */}
                    <div
                      className="absolute inset-x-0 top-2.5 sm:top-3.5 h-1.5 sm:h-2 transition-colors duration-500 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(circle at 6px 0px, transparent 5px, ${climbed ? '#e9b768' : '#c9c3b8'} 5.3px)`,
                        backgroundSize: '12px 6px',
                        backgroundRepeat: 'repeat-x',
                        opacity: climbed ? 0.95 : 0.7,
                      }}
                    />
                    {/* tread — lit horizontal surface on top of the step, with a thin gold edge */}
                    <div
                      className="absolute inset-x-0 top-0 h-2.5 sm:h-3.5 rounded-t-md transition-colors duration-500"
                      style={{
                        background: climbed
                          ? 'linear-gradient(to bottom, #fffdf5, #ffedc2)'
                          : 'linear-gradient(to bottom, #ffffff, #ece8e0)',
                        boxShadow: climbed
                          ? '0 1.5px 0 rgba(216,160,70,0.9), 0 3px 5px rgba(0,0,0,0.15)'
                          : '0 1.5px 0 rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.12)',
                      }}
                    />
                  </div>
                );
              })}

              {/* a candle standing on each step, in front of the riser above it, lit once reached */}
              {steps.map((s, i) => {
                const climbed = i <= step;
                return (
                  <Candle
                    key={`candle-${i}`}
                    lit={climbed}
                    className="absolute w-4 h-8 sm:w-5 sm:h-10"
                    style={{
                      right: `${100 - s.leftPct - s.widthPct * 0.9}%`,
                      bottom: `${s.bottomPct + s.heightPct}%`,
                    }}
                  />
                );
              })}

              {/* a soft glowing light path guiding the way up the middle of the flight */}
              <div
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[14%] rounded-full"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,224,168,0.55) 45%, rgba(255,255,255,0.05))',
                  boxShadow: '0 0 16px 2px rgba(255,214,140,0.35)',
                }}
              />

              {/* couple — hop up one step at a time, pausing to rest on each.
                  Plain CSS transition (not Framer Motion's animate) so the browser
                  resolves the % position live against the container's real size —
                  animating it via Framer Motion caused a wrong-measurement glitch
                  where the couple would flash to the top before sliding back down. */}
              <div
                className="absolute left-1/2 transition-all duration-500 ease-in-out"
                style={{
                  bottom: `${started ? (step + 1) * stepHeightPct : 0}%`,
                  transform: `translateX(-50%) scale(${1 - step * 0.045})`,
                  transformOrigin: 'bottom center',
                }}
              >
                <motion.div
                  key={step}
                  initial={{ y: -22, opacity: 0.65 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <CoupleHoldingHands expression={expression} figureClassName="w-14 h-24 sm:w-16 sm:h-28" />
                </motion.div>
              </div>
            </div>

            {/* intro panel, then memory card once the journey has started */}
            <AnimatePresence mode="wait">
              {!started ? (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-sm rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md p-6 text-center shadow-xl"
                >
                  <div className="text-4xl mb-2">💌</div>
                  <p className="text-rose-600/80 text-xs tracking-widest uppercase mb-1">Hành trình yêu thương</p>
                  <h3 className="text-fuchsia-900 text-xl font-semibold mb-2">Sẵn sàng chưa?</h3>
                  <p className="text-slate-700 text-sm leading-relaxed mb-6">
                    Từng bậc thang phía trước là từng tháng kỷ niệm của hai đứa mình. Bấm vào để cùng bước lên nhé!
                  </p>
                  <button
                    onClick={() => setStarted(true)}
                    className="mx-auto px-5 py-2 rounded-full bg-linear-to-r from-rose-400 to-fuchsia-500 text-white text-sm font-medium shadow-md hover:brightness-110 transition-all inline-flex items-center gap-1"
                  >
                    Khám phá hành trình <ChevronRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={memory.month}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-sm rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md p-6 text-center shadow-xl"
                >
                  <div className="text-4xl mb-2">{memory.emoji}</div>
                  <p className="text-rose-600/80 text-xs tracking-widest uppercase mb-1">{memory.date}</p>
                  <h3 className="text-fuchsia-900 text-xl font-semibold mb-2">{memory.title}</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{memory.text}</p>

                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      onClick={goPrev}
                      disabled={step === 0}
                      className="p-2 rounded-full bg-white/70 hover:bg-white text-rose-600 disabled:opacity-30 transition-colors shadow-sm"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={goNext}
                      className="px-5 py-2 rounded-full bg-linear-to-r from-rose-400 to-fuchsia-500 text-white text-sm font-medium shadow-md hover:brightness-110 transition-all flex items-center gap-1"
                    >
                      {isLast ? 'Về đích 🎉' : 'Bước tiếp'} <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="celebrate"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-10 text-center gap-6"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="flex items-end justify-center"
            >
              <CoupleHoldingHands expression={3} figureClassName="w-20 h-34 sm:w-24 sm:h-40" />
            </motion.div>

            <div>
              <p className="font-script text-fuchsia-800 text-4xl sm:text-5xl mb-2 drop-shadow-sm">
                {SITE.boyName} &amp; {SITE.girlName}
              </p>
              <p className="text-rose-600/80 text-sm tracking-[0.2em] uppercase mb-4">
                6 tháng bên nhau · từ {SITE.startDateLabel}
              </p>
              <p className="text-slate-700 max-w-md mx-auto leading-relaxed">
                Cảm ơn vì đã luôn nắm tay nhau đi qua từng bậc thang kỷ niệm. Mong rằng chặng đường phía trước
                mình sẽ còn thật nhiều bậc thang hạnh phúc như thế này nữa nhé 💍
              </p>
            </div>

            <button
              onClick={restart}
              className="mt-2 px-5 py-2 rounded-full bg-white/70 hover:bg-white text-rose-600 text-sm flex items-center gap-2 border border-white/60 shadow-sm transition-colors"
            >
              <RotateCcw size={16} /> Xem lại hành trình
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
