import { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import FloatingHearts from './FloatingHearts';
import PenguinFigure from './PenguinFigure';
import { SITE, FEED_LOW_GIF, FEED_HIGH_GIF, ROAD_START_GIF, ROAD_FINISH_GIF, ROAD_RESTAURANT_GIF } from '../data/config';

// A horizontal 4-hump wave running left to right, curving gently rather
// than a sharp zig-zag — measured live via SVG's getPointAtLength so the
// penguin can be placed exactly on the curve instead of guessing
// coordinates by hand. The midpoint by path LENGTH (not by x) is where
// chặng 1 ends and chặng 2 (the restaurant/refuel stop) begins.
const PATH_D =
  'M40,220 C145,150 250,150 355,220 C460,290 565,290 670,220 C775,150 880,150 985,220 C1090,290 1195,290 1300,220';
const FINISH_X = 1300;

const TAPS_NEEDED = 100;
const RUN_DURATION = 18; // seconds to cover each half of the (now longer) road
const HUNGRY_TIP_DELAY = 3000; // ms into chặng 1 before the "đói quá" tooltip pops up

// run1 -> hungry (blocked at chặng 2, needs feeding) -> run2 -> arrived
export default function RoadJourneyScreen({ onContinue }) {
  const [phase, setPhase] = useState('run1');
  const [t, setT] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [showHungryTip, setShowHungryTip] = useState(false);
  const [showFullTip, setShowFullTip] = useState(false);
  const [feedLowGifError, setFeedLowGifError] = useState(false);
  const [feedHighGifError, setFeedHighGifError] = useState(false);
  const [startGifError, setStartGifError] = useState(false);
  const [finishGifError, setFinishGifError] = useState(false);
  const [restaurantGifError, setRestaurantGifError] = useState(false);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const startClipId = useId();
  const finishClipId = useId();
  const restaurantClipId = useId();

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, []);

  // drives the penguin smoothly along the path for each running leg, then
  // hands off to the next phase once it reaches the end of that leg
  useEffect(() => {
    if (phase !== 'run1' && phase !== 'run2') return undefined;
    const from = phase === 'run1' ? 0 : 0.5;
    const to = phase === 'run1' ? 0.5 : 1;
    const controls = animate(from, to, {
      duration: RUN_DURATION,
      ease: 'linear',
      onUpdate: setT,
      onComplete: () => setPhase(phase === 'run1' ? 'hungry' : 'arrived'),
    });
    return () => controls.stop();
  }, [phase]);

  // a little "đói quá" speech bubble pops up partway through chặng 1, well
  // before the penguin actually runs out of energy at the restaurant
  useEffect(() => {
    if (phase !== 'run1') {
      setShowHungryTip(false);
      return undefined;
    }
    const timeoutId = setTimeout(() => setShowHungryTip(true), HUNGRY_TIP_DELAY);
    return () => clearTimeout(timeoutId);
  }, [phase]);

  const getPointAt = (frac) => {
    if (!pathRef.current || !pathLength) return { x: 40, y: 220 };
    const clamped = Math.max(0, Math.min(1, frac));
    return pathRef.current.getPointAtLength(clamped * pathLength);
  };

  const point = getPointAt(t);
  const aheadPoint = getPointAt(t + 0.015);
  const facingLeft = aheadPoint.x < point.x - 0.5;
  const restaurantPoint = pathLength > 0 ? getPointAt(0.5) : null;

  const energyPct =
    phase === 'run1'
      ? Math.max(0, Math.round(((0.5 - t) / 0.5) * 100))
      : phase === 'hungry'
        ? 0
        : 100;

  const penguinState =
    phase === 'hungry' ? 'tired' : phase === 'arrived' ? 'happy' : phase === 'run1' || phase === 'run2' ? 'run' : 'idle';

  const feedProgress = tapCount / TAPS_NEEDED;
  const feedGifSrc = feedProgress < 0.5 ? FEED_LOW_GIF : FEED_HIGH_GIF;
  const feedGifErrored = feedProgress < 0.5 ? feedLowGifError : feedHighGifError;

  const handleFeedTap = () => {
    if (phase !== 'hungry') return;
    setTapCount((c) => {
      const next = Math.min(TAPS_NEEDED, c + 1);
      if (next >= TAPS_NEEDED) {
        setShowFullTip(true);
        setTimeout(() => setPhase('run2'), 1300);
      }
      return next;
    });
  };

  return (
    <motion.div
      className="relative w-full min-h-svh overflow-hidden bg-linear-to-b from-[#dfece0] via-[#dff0fb] to-[#fdf2df] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-130 h-100 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-75 h-65 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-70 h-60 rounded-full bg-amber-200/40 blur-3xl" />
      <FloatingHearts count={12} />

      <div className="relative z-10 flex flex-col items-center pt-6 px-4 gap-2">
        <p className="font-script text-fuchsia-800 text-3xl sm:text-4xl drop-shadow-sm text-center">{SITE.title}</p>
      </div>

      {phase === 'run1' && (
        <div className="relative z-10 mx-auto mt-3 w-full max-w-xs px-4">
          <div className="flex items-center justify-between text-xs text-emerald-800/80 mb-1">
            <span>Năng lượng</span>
            <span>{energyPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/60 overflow-hidden border border-white/70">
            <div
              className="h-full bg-linear-to-r from-emerald-400 to-lime-400 transition-[width] duration-200"
              style={{ width: `${energyPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 min-h-0">
        <div className="relative w-full max-w-5xl aspect-17/5">
          <svg viewBox="0 0 1360 400" className="w-full h-full overflow-visible" role="img" aria-label="Con đường hành trình">
            <ellipse cx="200" cy="330" rx="52" ry="18" fill="#bfe3c4" opacity="0.6" />
            <ellipse cx="515" cy="110" rx="56" ry="20" fill="#bfe3c4" opacity="0.6" />
            <ellipse cx="830" cy="330" rx="52" ry="18" fill="#bfe3c4" opacity="0.6" />
            <ellipse cx="1145" cy="110" rx="52" ry="18" fill="#bfe3c4" opacity="0.6" />

            {/* road */}
            <path d={PATH_D} fill="none" stroke="rgba(120,85,40,0.25)" strokeWidth="64" strokeLinecap="round" />
            <path d={PATH_D} fill="none" stroke="#e9c98a" strokeWidth="54" strokeLinecap="round" />
            <path
              ref={pathRef}
              d={PATH_D}
              fill="none"
              stroke="#fff7e6"
              strokeWidth="6"
              strokeDasharray="18 18"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* start marker — rounded ROAD_START_GIF sticker, falling back to 🏠 */}
            {!startGifError ? (
              <>
                <clipPath id={startClipId}>
                  <circle cx="40" cy="266" r="22" />
                </clipPath>
                <circle cx="40" cy="266" r="24" fill="#fff" opacity="0.7" />
                <image
                  href={ROAD_START_GIF}
                  x="16"
                  y="242"
                  width="48"
                  height="48"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${startClipId})`}
                  onError={() => setStartGifError(true)}
                />
                <circle cx="40" cy="266" r="22" fill="none" stroke="#fff" strokeWidth="3" />
              </>
            ) : (
              <text x="40" y="278" textAnchor="middle" fontSize="30">🏠</text>
            )}

            {/* restaurant marker — rounded ROAD_RESTAURANT_GIF sticker, falling back to 🍽️ */}
            {restaurantPoint && !restaurantGifError ? (
              <>
                <clipPath id={restaurantClipId}>
                  <circle cx={restaurantPoint.x} cy={restaurantPoint.y - 44} r="26" />
                </clipPath>
                <circle cx={restaurantPoint.x} cy={restaurantPoint.y - 44} r="28" fill="#fff" opacity="0.7" />
                <image
                  href={ROAD_RESTAURANT_GIF}
                  x={restaurantPoint.x - 26}
                  y={restaurantPoint.y - 70}
                  width="52"
                  height="52"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${restaurantClipId})`}
                  onError={() => setRestaurantGifError(true)}
                />
                <circle cx={restaurantPoint.x} cy={restaurantPoint.y - 44} r="26" fill="none" stroke="#fff" strokeWidth="3" />
              </>
            ) : (
              restaurantPoint && (
                <text x={restaurantPoint.x} y={restaurantPoint.y - 34} textAnchor="middle" fontSize="34">
                  🍽️
                </text>
              )
            )}
            {/* finish marker — rounded ROAD_FINISH_GIF sticker, falling back to 🎉 */}
            {!finishGifError ? (
              <>
                <clipPath id={finishClipId}>
                  <circle cx={FINISH_X} cy="266" r="22" />
                </clipPath>
                <circle cx={FINISH_X} cy="266" r="24" fill="#fff" opacity="0.7" />
                <image
                  href={ROAD_FINISH_GIF}
                  x={FINISH_X - 24}
                  y="242"
                  width="48"
                  height="48"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${finishClipId})`}
                  onError={() => setFinishGifError(true)}
                />
                <circle cx={FINISH_X} cy="266" r="22" fill="none" stroke="#fff" strokeWidth="3" />
              </>
            ) : (
              <text x={FINISH_X} y="278" textAnchor="middle" fontSize="30">🎉</text>
            )}

            {pathLength > 0 && (
              <>
                <g transform={`translate(${point.x} ${point.y}) scale(${facingLeft ? -1 : 1} 1)`}>
                  <PenguinFigure state={penguinState} />
                </g>
                {showHungryTip && phase === 'run1' && (
                  <g transform={`translate(${point.x} ${point.y - 96})`}>
                    <rect x="-56" y="-26" width="112" height="36" rx="14" fill="#fff" stroke="rgba(20,14,10,0.15)" strokeWidth="2" />
                    <path d="M-8,8 L8,8 L0,20 Z" fill="#fff" stroke="rgba(20,14,10,0.15)" strokeWidth="2" />
                    <text x="0" y="-3" textAnchor="middle" fontSize="15" fill="#b5473f">
                      Đói quá... 😣
                    </text>
                  </g>
                )}
                {showFullTip && phase === 'hungry' && (
                  <g transform={`translate(${point.x} ${point.y - 96})`}>
                    <rect x="-108" y="-26" width="216" height="36" rx="14" fill="#fff" stroke="rgba(20,14,10,0.15)" strokeWidth="2" />
                    <path d="M-8,8 L8,8 L0,20 Z" fill="#fff" stroke="rgba(20,14,10,0.15)" strokeWidth="2" />
                    <text x="0" y="-3" textAnchor="middle" fontSize="13" fill="#2f8f5b">
                      No rồi. Đi tiếp thôi mau mau lẹ lẹ 🐧
                    </text>
                  </g>
                )}
              </>
            )}
          </svg>

          {phase === 'arrived' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              onClick={onContinue}
              className="absolute z-20 px-5 py-2 rounded-full bg-linear-to-r from-rose-400 to-fuchsia-500 text-white text-sm font-medium shadow-lg hover:brightness-110 transition-all inline-flex items-center gap-1 whitespace-nowrap"
              style={{
                left: `${((FINISH_X + 50) / 1360) * 100}%`,
                top: `${(266 / 400) * 100}%`,
                marginTop: '-20px',
              }}
            >
              Tiếp tục <ChevronRight size={16} />
            </motion.button>
          )}
        </div>
      </div>

      <div className="relative z-10 px-4 pb-8">
        <AnimatePresence mode="wait">
          {(phase === 'run1' || phase === 'run2') && (
            <motion.div
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-emerald-800/70 text-sm min-h-6"
            >
              {phase === 'run1' ? 'Đang chạy tới quán ăn... 🐧💨' : 'Đang chạy về đích... 🐧💨'}
            </motion.div>
          )}

          {phase === 'hungry' && (
            <motion.div
              key="hungry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm mx-auto rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md p-6 text-center shadow-xl"
            >
              <div className="w-28 h-28 mx-auto mb-3 rounded-2xl overflow-hidden shadow-md bg-white/40">
                {!feedGifErrored ? (
                  <img
                    key={feedProgress < 0.5 ? 'low' : 'high'}
                    src={feedGifSrc}
                    alt="Cánh cụt đang nạp năng lượng"
                    className="w-full h-full object-cover"
                    onError={() => (feedProgress < 0.5 ? setFeedLowGifError(true) : setFeedHighGifError(true))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🐧</div>
                )}
              </div>
              <h3 className="text-fuchsia-900 text-xl font-semibold mb-4">Đói bụng quá, hết sức chạy rồi!</h3>
              <div className="h-3 rounded-full bg-white/70 overflow-hidden border border-white/80 mb-2">
                <div
                  className="h-full bg-linear-to-r from-rose-400 to-amber-400 transition-[width] duration-150"
                  style={{ width: `${(tapCount / TAPS_NEEDED) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {tapCount}/{TAPS_NEEDED}
              </p>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleFeedTap}
                disabled={tapCount >= TAPS_NEEDED}
                className="mx-auto px-6 py-3 rounded-full bg-linear-to-r from-rose-400 to-amber-400 text-white text-base font-semibold shadow-md hover:brightness-110 active:brightness-95 transition-all disabled:opacity-70"
              >
                🍚 Nạp năng lượng
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
