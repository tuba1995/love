import { motion } from 'framer-motion';

// Anatomy adapted from a detailed reference rig (separate torso/limb/face
// parts, real eyes+pupils+highlights, eyebrows, nose, hands with fingers)
// so the couple reads as an actual illustrated person rather than a plain
// blob-and-stick figure. Boy wears a suit, girl wears a dress with pigtails.
const PALETTES = {
  boy: {
    skin: '#e8b98c',
    hair: '#2b1e16',
    jacket: '#33415c',
    jacketShade: '#283349',
    lapel: '#202a3d',
    shirt: '#f5f2ea',
    tie: '#8f2233',
    tieShade: '#6e1a28',
    pants: '#232b3d',
    shoe: '#15181f',
    shoeSole: '#3a3f4d',
  },
  girl: {
    skin: '#f2cb9e',
    hair: '#5b3423',
    hairShine: '#7a4a34',
    dress: '#f0955b',
    dressShade: '#dd7a3c',
    skirtHem: '#f7b27e',
    bow: '#f4c542',
    legs: '#f7c79a',
    shoe: '#7a3a1f',
    shoeSole: '#a35c34',
  },
};

// 4 expression stages the app steps through as the couple climbs higher —
// eyebrow lift/angle per stage, reused by both figures.
const BROW = [
  { liftL: 0, liftR: 0, angL: -6, angR: 6 },
  { liftL: -1, liftR: -1, angL: -4, angR: 4 },
  { liftL: -3, liftR: -3, angL: -2, angR: 2 },
  { liftL: -4, liftR: 0, angL: -10, angR: 6 },
];

const INK = 'rgba(20,14,10,0.3)';
const outline = { stroke: INK, strokeWidth: 3 };

// Every limb plays ONE stride burst — triggered by the component mounting —
// then holds its neutral pose. The parent remounts this component each time
// the player advances a stair step, so the burst is what makes the figure
// visibly move its arms/legs exactly when a step is taken.
const stride = (values, times) => ({
  animate: { rotate: values },
  transition: { duration: 0.75, ease: 'easeInOut', ...(times ? { times } : {}) },
});
// A fixed bend for the arm that's clasped with the partner's hand — it
// eases into the held position instead of swinging with the stride.
const held = (angle) => ({
  animate: { rotate: angle },
  transition: { duration: 0.45, ease: 'easeOut' },
});

export default function PersonFigure({
  variant = 'boy',
  className = '',
  expression = 0,
  // which arm is clasped with the partner's — that arm bends in and holds
  // still instead of swinging; 'none' makes both arms stride normally.
  innerArm = 'none',
}) {
  const isGirl = variant === 'girl';
  const p = PALETTES[variant];
  const b = BROW[Math.min(expression, BROW.length - 1)];
  const leftHolds = innerArm === 'left';
  const rightHolds = innerArm === 'right';

  const legL = stride([0, 24, -10, 0]);
  const legR = stride([0, -24, 10, 0]);
  const armL = leftHolds ? held(34) : stride([0, -22, 20, 0]);
  const armR = rightHolds ? held(-34) : stride([0, 22, -20, 0]);

  return (
    <motion.svg
      viewBox="0 0 320 560"
      className={className}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx="160" cy="540" rx="88" ry="13" fill="rgba(20,15,10,0.14)" />

      {/* LEGS */}
      <motion.g style={{ transformOrigin: '137px 322px' }} {...legL}>
        <rect x="122" y="322" width="30" height="90" rx="10" fill={isGirl ? p.legs : p.pants} {...outline} />
        <rect x="124" y="405" width="26" height="45" rx="8" fill={isGirl ? '#ffffff' : p.pants} {...outline} />
        <rect x="116" y="446" width="42" height="18" rx="9" fill={p.shoe} {...outline} />
        <rect x="116" y="458" width="42" height="6" rx="3" fill={p.shoeSole} />
      </motion.g>
      <motion.g style={{ transformOrigin: '183px 322px' }} {...legR}>
        <rect x="168" y="322" width="30" height="90" rx="10" fill={isGirl ? p.legs : p.pants} {...outline} />
        <rect x="170" y="405" width="26" height="45" rx="8" fill={isGirl ? '#ffffff' : p.pants} {...outline} />
        <rect x="162" y="446" width="42" height="18" rx="9" fill={p.shoe} {...outline} />
        <rect x="162" y="458" width="42" height="6" rx="3" fill={p.shoeSole} />
      </motion.g>

      {/* LEFT ARM */}
      <motion.g style={{ transformOrigin: '96px 196px' }} {...armL}>
        <rect x="70" y="195" width="26" height="72" rx="13" fill={isGirl ? p.dressShade : p.jacketShade} {...outline} />
        <rect x="74" y="258" width="22" height="55" rx="11" fill={p.skin} {...outline} />
        <circle cx="90" cy="322" r="15" fill={p.skin} {...outline} />
        <path d="M82,320 q0,10 0,14 M90,322 q0,11 0,15 M98,320 q0,10 0,14" stroke="#c99b71" strokeWidth="2" fill="none" strokeLinecap="round" />
      </motion.g>

      {/* skirt flares over the upper legs, waist-pivoted so it sways with the stride */}
      {isGirl && (
        <motion.path
          style={{ transformOrigin: '160px 300px' }}
          {...stride([0, -6, 6, 0])}
          d="M100,296 Q92,340 78,404 Q160,424 242,404 Q228,340 220,296 Q160,312 100,296 Z"
          fill={p.dress}
          {...outline}
        />
      )}
      {isGirl && (
        <path d="M84,392 Q160,412 236,392 L232,404 Q160,422 88,404 Z" fill={p.skirtHem} opacity="0.9" />
      )}

      {/* RIGHT ARM */}
      <motion.g style={{ transformOrigin: '224px 196px' }} {...armR}>
        <rect x="224" y="195" width="26" height="72" rx="13" fill={isGirl ? p.dressShade : p.jacketShade} {...outline} />
        <rect x="224" y="258" width="22" height="55" rx="11" fill={p.skin} {...outline} />
        <circle cx="230" cy="322" r="15" fill={p.skin} {...outline} />
        <path d="M222,320 q0,10 0,14 M230,322 q0,11 0,15 M238,320 q0,10 0,14" stroke="#c99b71" strokeWidth="2" fill="none" strokeLinecap="round" />
      </motion.g>

      {/* NECK */}
      <rect x="142" y="168" width="36" height="26" fill={p.skin} />

      {/* BODY: suit jacket for the boy, fitted bodice for the girl */}
      <path
        d="M92,200 Q97,182 142,178 L178,178 Q223,182 228,200 L224,300 Q218,320 198,322 L122,322 Q102,320 96,300 Z"
        fill={isGirl ? p.dress : p.jacket}
        {...outline}
      />
      {isGirl ? (
        <path d="M144,182 L176,182 L169,214 L151,214 Z" fill={p.dressShade} />
      ) : (
        <>
          <path d="M144,178 L176,178 L160,232 Z" fill={p.shirt} />
          <path d="M144,178 L160,232 L118,196 Z" fill={p.lapel} />
          <path d="M176,178 L160,232 L202,196 Z" fill={p.lapel} />
          <path d="M154,182 L166,182 L163,224 L157,224 Z" fill={p.tie} />
          <path d="M154,182 L166,182 L164,192 L156,192 Z" fill={p.tieShade} />
          <circle cx="160" cy="248" r="4.5" fill="#131722" />
          <circle cx="160" cy="264" r="4.5" fill="#131722" />
        </>
      )}

      {/* EARS */}
      <ellipse cx="101" cy="102" rx="9" ry="14" fill={p.skin} {...outline} />
      <ellipse cx="219" cy="102" rx="9" ry="14" fill={p.skin} {...outline} />

      {/* HEAD */}
      <path
        d="M104,96 C104,50 128,26 160,26 C192,26 216,50 216,96 C216,128 208,152 190,164 C178,172 168,175 160,175 C152,175 142,172 130,164 C112,152 104,128 104,96 Z"
        fill={p.skin}
        {...outline}
      />

      {/* blush */}
      <ellipse cx="120" cy="128" rx="10" ry="6" fill="#ff9fb8" opacity={expression >= 2 ? 0.7 : 0.4} />
      <ellipse cx="200" cy="128" rx="10" ry="6" fill="#ff9fb8" opacity={expression >= 2 ? 0.7 : 0.4} />

      {/* NOSE */}
      <path d="M160,102 Q164,116 161,123 Q158,126 155,123" stroke="#c99b71" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* MOUTH — 4 expression stages, from a small neutral line to a wide happy grin */}
      <motion.g key={`mouth-${expression}`} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }} style={{ transformOrigin: '160px 150px' }}>
        {expression === 0 && <path d="M144,148 Q160,152 176,148" stroke="#a5473f" strokeWidth="3" fill="none" strokeLinecap="round" />}
        {expression === 1 && <path d="M138,146 Q160,158 182,146 Q160,156 138,146 Z" fill="#b5695a" />}
        {expression === 2 && (
          <>
            <path d="M130,144 Q160,170 190,144 Q160,158 130,144 Z" fill="#7a2e2e" />
            <rect x="144" y="146" width="32" height="7" rx="3.5" fill="#fff" />
          </>
        )}
        {expression >= 3 && <path d="M126,142 Q160,178 194,142 Q160,164 126,142 Z" fill="#7a2e2e" />}
      </motion.g>

      {/* EYEBROWS */}
      <g style={{ transformOrigin: '160px 78px' }}>
        <rect x="118" y="76" width="34" height="7" rx="3.5" fill={p.hair} transform={`translate(0 ${b.liftL}) rotate(${b.angL} 135 79)`} />
        <rect x="168" y="76" width="34" height="7" rx="3.5" fill={p.hair} transform={`translate(0 ${b.liftR}) rotate(${b.angR} 185 79)`} />
      </g>

      {/* EYES — blink together every few seconds; curve into happy arcs at the top expression */}
      <motion.g
        style={{ transformOrigin: '160px 100px' }}
        animate={{ scaleY: [1, 1, 1, 0.12, 1, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.85, 0.92, 0.95, 0.98, 1] }}
      >
        {expression >= 3 ? (
          <>
            <path d="M124,102 Q135,90 146,102" stroke="#2b1e16" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M174,102 Q185,90 196,102" stroke="#2b1e16" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="135" cy="100" rx={expression === 2 ? 11 : 9.5} ry={expression === 2 ? 10 : 8} fill="#fff" />
            <circle cx="135" cy="100" r="5" fill="#6b4a31" />
            <circle cx="135" cy="100" r="2.4" fill="#1c1c1c" />
            <circle cx="133" cy="98" r="1.1" fill="#fff" />
            <ellipse cx="185" cy="100" rx={expression === 2 ? 11 : 9.5} ry={expression === 2 ? 10 : 8} fill="#fff" />
            <circle cx="185" cy="100" r="5" fill="#6b4a31" />
            <circle cx="185" cy="100" r="2.4" fill="#1c1c1c" />
            <circle cx="183" cy="98" r="1.1" fill="#fff" />
          </>
        )}
      </motion.g>

      {/* HAIR */}
      {isGirl ? (
        <>
          <path
            d="M100,96 Q94,30 160,22 Q226,30 220,96 Q222,60 208,50 Q196,64 182,52 Q170,66 156,52 Q142,66 128,52 Q116,62 108,52 Q96,62 100,96 Z"
            fill={p.hair}
          />
          <path d="M112,90 C104,140 108,180 128,206 Q108,180 106,120 Z" fill={p.hair} />
          <path d="M208,90 C216,140 212,180 192,206 Q212,180 214,120 Z" fill={p.hair} />
          <circle cx="112" cy="196" r="6.5" fill={p.bow} />
          <circle cx="208" cy="196" r="6.5" fill={p.bow} />
          <path d="M104,52 C108,42 120,34 138,32" stroke={p.hairShine} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.6" />
        </>
      ) : (
        <>
          <path
            d="M98,92 Q94,28 160,20 Q226,28 222,92 Q224,58 208,52 Q198,66 184,54 Q170,68 156,54 Q142,68 128,54 Q114,64 104,58 Q96,66 98,92 Z"
            fill={p.hair}
          />
        </>
      )}
    </motion.svg>
  );
}
