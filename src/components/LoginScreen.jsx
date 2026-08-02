import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, CheckCircle2 } from 'lucide-react';
import Keypad from './Keypad';
import FloatingHearts from './FloatingHearts';
import { SITE } from '../data/config';

export default function LoginScreen({ onSuccess }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const target = SITE.password;

  const check = (next) => {
    if (next.length < target.length) return;
    if (next === target) {
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 1600);
    } else {
      setError(true);
      setTimeout(() => {
        setError(false);
        setValue('');
      }, 550);
    }
  };

  const handleDigit = (d) => {
    if (success || value.length >= target.length) return;
    const next = value + d;
    setValue(next);
    check(next);
  };

  const handleBackspace = () => {
    if (success) return;
    setValue((v) => v.slice(0, -1));
  };

  const handleClear = () => {
    if (success) return;
    setValue('');
  };

  return (
    <motion.div
      className="relative w-full min-h-svh flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#2b1330] via-[#3a1240] to-[#1a0f1f] px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-rose-500/20 blur-3xl" />
      <FloatingHearts count={14} />

      <div className="relative z-10 w-full max-w-3xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        {/* left illustration */}
        <div className="relative hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-rose-500/30 to-fuchsia-600/30">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-48 h-48 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center shadow-xl"
          >
            <span className="text-7xl">🧑‍🤝‍🧑</span>
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="absolute -bottom-3 -right-3 text-4xl"
            >
              💗
            </motion.span>
          </motion.div>
          <p className="font-script text-3xl text-white mt-6 text-center">
            {SITE.boyName} &amp; {SITE.girlName}
          </p>
          <p className="text-rose-100/70 text-sm mt-2 text-center">Nhập mật khẩu để mở kỷ niệm của tụi mình nhé 🔐</p>
        </div>

        {/* right form */}
        <div className="relative flex flex-col items-center justify-center p-8 gap-6">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-10"
              >
                <CheckCircle2 className="text-emerald-400" size={64} />
                <p className="text-white text-lg font-semibold">Chính xác rồi!</p>
                <p className="text-rose-100/70 text-sm">Đang mở kỷ niệm của hai đứa mình...</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <div className="flex flex-col items-center gap-2">
                  <Lock className="text-rose-200" size={22} />
                  <p className="text-rose-100/80 text-sm">Nhập mật khẩu bí mật</p>
                </div>

                <div
                  className={`flex flex-wrap justify-center gap-2 max-w-[280px] ${error ? 'animate-shake' : ''}`}
                >
                  {Array.from({ length: target.length }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-semibold transition-colors
                        ${error ? 'border-red-400 bg-red-400/10 text-red-300' : value[i] ? 'border-rose-300 bg-white/10 text-white' : 'border-white/20 text-white/30'}`}
                    >
                      {value[i] ? '•' : ''}
                    </div>
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-300 text-xs -mt-3"
                  >
                    Sai mật khẩu rồi, thử lại nè <Heart className="inline" size={12} />
                  </motion.p>
                )}

                <Keypad onDigit={handleDigit} onBackspace={handleBackspace} onClear={handleClear} disabled={success} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
