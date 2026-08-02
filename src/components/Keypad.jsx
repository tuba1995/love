import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

export default function Keypad({ onDigit, onBackspace, onClear, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
      {KEYS.map((key) => {
        if (key === 'back') {
          return (
            <motion.button
              key={key}
              type="button"
              disabled={disabled}
              whileTap={{ scale: 0.9 }}
              onClick={onBackspace}
              className="h-16 rounded-2xl bg-white/10 hover:bg-white/20 text-rose-100 flex items-center justify-center backdrop-blur-sm border border-white/10 transition-colors disabled:opacity-40"
            >
              <Delete size={20} />
            </motion.button>
          );
        }
        if (key === 'clear') {
          return (
            <motion.button
              key={key}
              type="button"
              disabled={disabled}
              whileTap={{ scale: 0.9 }}
              onClick={onClear}
              className="h-16 rounded-2xl bg-white/10 hover:bg-white/20 text-rose-100 text-sm flex items-center justify-center backdrop-blur-sm border border-white/10 transition-colors disabled:opacity-40"
            >
              Xoá
            </motion.button>
          );
        }
        return (
          <motion.button
            key={key}
            type="button"
            disabled={disabled}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDigit(key)}
            className="h-16 rounded-2xl bg-white/90 hover:bg-white text-rose-500 text-xl font-semibold shadow-md flex items-center justify-center transition-colors disabled:opacity-40"
          >
            {key}
          </motion.button>
        );
      })}
    </div>
  );
}
