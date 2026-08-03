import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, CheckCircle2 } from 'lucide-react';
import Keypad from './Keypad';
import FloatingHearts from './FloatingHearts';
import { SITE } from '../data/config';

const MAX_ATTEMPTS = 3;

// Cảnh báo "hài hài có kẻ gian đột nhập" — tăng dần độ khẩn cấp qua từng lần
// nhập sai, lần thứ 3 (cuối) sẽ xoá sạch tiến trình và quay lại hộp quà.
const INTRUDER_ALERTS = [
  {
    title: '🚨 Cảnh báo đột nhập!',
    text: 'Hệ thống vừa phát hiện một kẻ lạ mặt đang cố mò mật khẩu trái tim của tụi mình 👀 Chắc chắn là người thương chứ không phải ai khác đó nha?',
    action: 'Đã hiểu, thử lại 😅',
  },
  {
    title: '🚨🚨 Nghi ngờ tăng cao!',
    text: 'Sai lần 2 rồi đó nha... đội bảo vệ tình yêu đang được triệu tập gấp, chỉ còn đúng 1 lần thử cuối cùng thôi 😤',
    action: 'Bình tĩnh, thử lại 🫡',
  },
  {
    title: '💥 Tự huỷ kích hoạt!',
    text: 'Sai đủ 3 lần rồi! Toàn bộ manh mối vừa bị xoá sạch, phải quay lại hộp quà tìm lại từ đầu thôi 😭🎁',
    action: 'Về lại hộp quà 🔄',
    final: true,
  },
];

export default function LoginScreen({ target, onSuccess, onLockout }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [alert, setAlert] = useState(null);
  // Ưu tiên mật khẩu động (mảnh ghép 1+2+3) truyền từ GiftScreen; chỉ rơi về
  // SITE.password nếu vào thẳng màn Login mà chưa có mật khẩu nào được tính.
  const passcode = target || SITE.password;

  const check = (next) => {
    if (next.length < passcode.length) return;
    if (next === passcode) {
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 1600);
      return;
    }
    const attemptIndex = attempts;
    setAttempts(attemptIndex + 1);
    setError(true);
    setTimeout(() => {
      setError(false);
      setValue('');
    }, 550);
    setAlert(INTRUDER_ALERTS[Math.min(attemptIndex, INTRUDER_ALERTS.length - 1)]);
  };

  const handleDigit = (d) => {
    if (success || alert || value.length >= passcode.length) return;
    const next = value + d;
    setValue(next);
    check(next);
  };

  const handleBackspace = () => {
    if (success || alert) return;
    setValue((v) => v.slice(0, -1));
  };

  const handleClear = () => {
    if (success || alert) return;
    setValue('');
  };

  const dismissAlert = () => {
    if (alert?.final || attempts >= MAX_ATTEMPTS) {
      onLockout?.();
      return;
    }
    setAlert(null);
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
                  {Array.from({ length: passcode.length }).map((_, i) => (
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

                <Keypad
                  onDigit={handleDigit}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                  disabled={success || !!alert}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {alert && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-sm rounded-3xl bg-linear-to-b from-white to-rose-50 p-6 text-center shadow-2xl"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                {alert.title}
              </p>
              <p className="text-slate-700 text-base font-medium leading-relaxed mb-6">
                {alert.text}
              </p>
              <button
                type="button"
                onClick={dismissAlert}
                className="px-6 py-2.5 rounded-full bg-linear-to-r from-rose-400 to-fuchsia-500 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all"
              >
                {alert.action}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
