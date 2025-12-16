'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BootupProps {
  onComplete: () => void;
}

export default function Bootup({ onComplete }: BootupProps) {
  const [progress, setProgress] = useState(0);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    // Simulate boot sequence
    const duration = 2500; // 2.5 seconds
    const interval = 16; // ~60fps
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setShowLockScreen(true);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Accept any password for demo purposes
    if (password.length > 0) {
      setShowLockScreen(false);
      setTimeout(() => {
        setShowDesktop(true);
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {!showDesktop && (
        <>
          {/* Boot Screen */}
          {!showLockScreen && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
            >
              {/* Apple Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2,
                }}
                className="mb-12"
              >
                <svg
                  width="60"
                  height="74"
                  viewBox="0 0 60 74"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M30.5 0C28.5 0 26.5 0.5 25 1.5C23.5 2.5 22.5 4 22 5.5C21.5 7 21.5 8.5 22 10C22.5 11.5 23.5 13 25 14C26.5 15 28.5 15.5 30.5 15.5C32.5 15.5 34.5 15 36 14C37.5 13 38.5 11.5 39 10C39.5 8.5 39.5 7 39 5.5C38.5 4 37.5 2.5 36 1.5C34.5 0.5 32.5 0 30.5 0Z"
                    fill="currentColor"
                  />
                  <path
                    d="M20 20C18 20 16 20.5 14.5 21.5C13 22.5 12 24 11.5 25.5C11 27 11 28.5 11.5 30C12 31.5 13 33 14.5 34C16 35 18 35.5 20 35.5C22 35.5 24 35 25.5 34C27 33 28 31.5 28.5 30C29 28.5 29 27 28.5 25.5C28 24 27 22.5 25.5 21.5C24 20.5 22 20 20 20Z"
                    fill="currentColor"
                  />
                  <path
                    d="M30.5 20C28.5 20 26.5 20.5 25 21.5C23.5 22.5 22.5 24 22 25.5C21.5 27 21.5 28.5 22 30C22.5 31.5 23.5 33 25 34C26.5 35 28.5 35.5 30.5 35.5C32.5 35.5 34.5 35 36 34C37.5 33 38.5 31.5 39 30C39.5 28.5 39.5 27 39 25.5C38.5 24 37.5 22.5 36 21.5C34.5 20.5 32.5 20 30.5 20Z"
                    fill="currentColor"
                  />
                  <path
                    d="M40 20C38 20 36 20.5 34.5 21.5C33 22.5 32 24 31.5 25.5C31 27 31 28.5 31.5 30C32 31.5 33 33 34.5 34C36 35 38 35.5 40 35.5C42 35.5 44 35 45.5 34C47 33 48 31.5 48.5 30C49 28.5 49 27 48.5 25.5C48 24 47 22.5 45.5 21.5C44 20.5 42 20 40 20Z"
                    fill="currentColor"
                  />
                  <path
                    d="M15 40C13 40 11 40.5 9.5 41.5C8 42.5 7 44 6.5 45.5C6 47 6 48.5 6.5 50C7 51.5 8 53 9.5 54C11 55 13 55.5 15 55.5C17 55.5 19 55 20.5 54C22 53 23 51.5 23.5 50C24 48.5 24 47 23.5 45.5C23 44 22 42.5 20.5 41.5C19 40.5 17 40 15 40Z"
                    fill="currentColor"
                  />
                  <path
                    d="M30.5 40C28.5 40 26.5 40.5 25 41.5C23.5 42.5 22.5 44 22 45.5C21.5 47 21.5 48.5 22 50C22.5 51.5 23.5 53 25 54C26.5 55 28.5 55.5 30.5 55.5C32.5 55.5 34.5 55 36 54C37.5 53 38.5 51.5 39 50C39.5 48.5 39.5 47 39 45.5C38.5 44 37.5 42.5 36 41.5C34.5 40.5 32.5 40 30.5 40Z"
                    fill="currentColor"
                  />
                  <path
                    d="M45 40C43 40 41 40.5 39.5 41.5C38 42.5 37 44 36.5 45.5C36 47 36 48.5 36.5 50C37 51.5 38 53 39.5 54C41 55 43 55.5 45 55.5C47 55.5 49 55 50.5 54C52 53 53 51.5 53.5 50C54 48.5 54 47 53.5 45.5C53 44 52 42.5 50.5 41.5C49 40.5 47 40 45 40Z"
                    fill="currentColor"
                  />
                  <path
                    d="M30.5 60C28.5 60 26.5 60.5 25 61.5C23.5 62.5 22.5 64 22 65.5C21.5 67 21.5 68.5 22 70C22.5 71.5 23.5 73 25 74C26.5 75 28.5 75.5 30.5 75.5C32.5 75.5 34.5 75 36 74C37.5 73 38.5 71.5 39 70C39.5 68.5 39.5 67 39 65.5C38.5 64 37.5 62.5 36 61.5C34.5 60.5 32.5 60 30.5 60Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>

              {/* Loading Bar */}
              <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden mb-8">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 20,
                  }}
                />
              </div>

              {/* Design Credit */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.8,
                  duration: 0.6,
                }}
                className="text-white/60 text-sm font-light tracking-wide"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
              >
                Design by Tahsin Mert
              </motion.p>
            </motion.div>
          )}

          {/* Lock Screen / Login Screen */}
          {showLockScreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3840&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Avatar */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white/20">
                    TM
                  </div>
                </motion.div>

                {/* Username */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl font-semibold text-white mb-8"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
                >
                  Tahsin Mert Mutlu
                </motion.h2>

                {/* Password Input */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  onSubmit={handlePasswordSubmit}
                  className="w-80"
                >
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="Enter password for Tahsin Mert Mutlu"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
                      autoFocus
                    />
                    {passwordFocused && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -bottom-6 left-0 right-0 text-center text-white/80 text-sm"
                      >
                        Press Enter to continue
                      </motion.div>
                    )}
                  </div>
                </motion.form>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

