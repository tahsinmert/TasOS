'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { useBattery } from '@/hooks/useBattery';
import { BatteryCharging, Music, Radio, Camera, Video } from 'lucide-react';

export default function DynamicIsland() {
  const {
    dynamicIslandState,
    setDynamicIslandState,
    musicPlaying,
    musicTitle,
    musicArtist,
    musicAlbumArt,
    airDropProgress,
    airDropActive,
    quickActionsOpen,
    toggleQuickActions,
  } = useSystemStore();

  const battery = useBattery();
  const [isHovered, setIsHovered] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // Close Quick Actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        quickActionsRef.current &&
        !quickActionsRef.current.contains(event.target as Node)
      ) {
        if (quickActionsOpen) {
          toggleQuickActions();
        }
      }
    };

    if (quickActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [quickActionsOpen, toggleQuickActions]);

  // Battery charging detection
  useEffect(() => {
    if (battery.charging && battery.level < 100) {
      setDynamicIslandState('battery');
      const timer = setTimeout(() => {
        if (dynamicIslandState === 'battery') {
          setDynamicIslandState('idle');
        }
      }, 3000);
      return () => clearTimeout(timer);
    } else if (dynamicIslandState === 'battery' && !battery.charging) {
      setDynamicIslandState('idle');
    }
  }, [battery.charging, battery.level, dynamicIslandState, setDynamicIslandState]);

  // Music state management
  useEffect(() => {
    if (musicPlaying) {
      setDynamicIslandState('music');
    } else if (dynamicIslandState === 'music' && !musicPlaying) {
      setDynamicIslandState('idle');
    }
  }, [musicPlaying, dynamicIslandState, setDynamicIslandState]);

  // AirDrop state management
  useEffect(() => {
    if (airDropActive) {
      setDynamicIslandState('airdrop');
    } else if (dynamicIslandState === 'airdrop' && !airDropActive) {
      setDynamicIslandState('idle');
    }
  }, [airDropActive, dynamicIslandState, setDynamicIslandState]);

  // Waveform animation data
  const waveformBars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    height: Math.random() * 20 + 10,
  }));

  const getIslandWidth = () => {
    switch (dynamicIslandState) {
      case 'music':
        return 'w-80';
      case 'airdrop':
        return 'w-64';
      case 'battery':
        return 'w-48';
      default:
        return 'w-28';
    }
  };

  const getIslandHeight = () => {
    switch (dynamicIslandState) {
      case 'music':
        return 'h-16';
      case 'airdrop':
        return 'h-14';
      case 'battery':
        return 'h-12';
      default:
        return 'h-7';
    }
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[60]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={toggleQuickActions}
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={`${getIslandWidth()} ${getIslandHeight()} bg-black rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer`}
          animate={{
            width: dynamicIslandState === 'idle' ? 112 : undefined,
            height: dynamicIslandState === 'idle' ? 28 : undefined,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            {dynamicIslandState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center"
              >
                {/* Camera indicator */}
                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
              </motion.div>
            )}

            {dynamicIslandState === 'music' && (
              <motion.div
                key="music"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full h-full flex items-center gap-3 px-4"
              >
                {/* Album Art */}
                {musicAlbumArt ? (
                  <img
                    src={musicAlbumArt}
                    alt="Album"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Music size={20} className="text-white" />
                  </div>
                )}

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {musicTitle || 'Now Playing'}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {musicArtist || 'Unknown Artist'}
                  </p>
                </div>

                {/* Waveform */}
                <div className="flex items-end gap-0.5 h-8">
                  {waveformBars.map((bar) => (
                    <motion.div
                      key={bar.id}
                      className="w-0.5 bg-white/60 rounded-full"
                      animate={{
                        height: [bar.height, bar.height * 1.5, bar.height],
                      }}
                      transition={{
                        duration: 0.5 + Math.random() * 0.3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ height: `${bar.height}px` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {dynamicIslandState === 'airdrop' && (
              <motion.div
                key="airdrop"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-full h-full flex items-center gap-3 px-4"
              >
                <Radio size={18} className="text-white flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">AirDrop</p>
                  <div className="relative w-full h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${airDropProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">
                  {Math.round(airDropProgress)}%
                </span>
              </motion.div>
            )}

            {dynamicIslandState === 'battery' && (
              <motion.div
                key="battery"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-full h-full flex items-center gap-2 px-4"
              >
                <BatteryCharging size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-xs font-medium text-white">
                  Charging {battery.level}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Quick Actions Dashboard */}
      <AnimatePresence>
        {quickActionsOpen && (
          <motion.div
            ref={quickActionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[55] w-64 bg-white/30 dark:bg-black/30 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  toggleQuickActions();
                  // Screenshot action would go here
                }}
                className="flex flex-col items-center gap-2 p-3 bg-white/20 dark:bg-gray-800/30 rounded-xl hover:bg-white/30 dark:hover:bg-gray-700/40 transition-colors"
              >
                <Camera size={24} className="text-gray-700 dark:text-gray-300" />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Screenshot
                </span>
              </button>
              <button
                onClick={() => {
                  toggleQuickActions();
                  // Record Screen action would go here
                }}
                className="flex flex-col items-center gap-2 p-3 bg-white/20 dark:bg-gray-800/30 rounded-xl hover:bg-white/30 dark:hover:bg-gray-700/40 transition-colors"
              >
                <Video size={24} className="text-gray-700 dark:text-gray-300" />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Record Screen
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

