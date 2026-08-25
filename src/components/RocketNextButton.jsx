import { useState } from 'react';
import { motion } from 'framer-motion';

function RocketNextButton({ onNext }) {
  const [isFlying, setIsFlying] = useState(false);

  const handleClick = () => {
    if (isFlying) return;
    setIsFlying(true);
    window.setTimeout(onNext, 650);
  };

  return (
    <motion.button
      type="button"
      className="rocket-next-button"
      aria-label="Bay sang trang tiếp theo"
      title="Sang trang tiếp theo"
      onClick={handleClick}
      disabled={isFlying}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={
        isFlying
          ? { x: '42vw', y: '-55vh', rotate: 45, scale: 0.25, opacity: 0 }
          : { opacity: 1, scale: 1, y: [0, -7, 0] }
      }
      transition={
        isFlying
          ? { duration: 0.65, ease: [0.4, 0, 0.2, 1] }
          : { opacity: { duration: 0.25 }, scale: { duration: 0.25 }, y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }
      }
    >
      <span aria-hidden="true">🚀</span>
      <span className="rocket-next-tooltip">Đi tiếp</span>
    </motion.button>
  );
}

export default RocketNextButton;
