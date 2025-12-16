'use client';

import { useEffect, useRef } from 'react';
import { useSystemStore } from '@/store/useSystemStore';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useResponsive } from '@/hooks/useResponsive';
import {
  Wifi,
  Bluetooth,
  Radio,
  Sun,
  Volume2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Battery,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ControlCenter() {
  const { isMobile } = useResponsive();
  const {
    controlCenterOpen,
    brightness,
    volume,
    wifiEnabled,
    bluetoothEnabled,
    airDropEnabled,
    lowPowerMode,
    setBrightness,
    setVolume,
    setWifiEnabled,
    setBluetoothEnabled,
    setAirDropEnabled,
    toggleLowPowerMode,
    toggleControlCenter,
    showToast,
    mediaPlaying,
    mediaTitle,
    mediaArtist,
    setMediaPlaying,
    setMediaInfo,
    musicPlaying,
    musicTitle,
    musicArtist,
    setMusicPlaying,
    setMusicInfo,
  } = useSystemStore();
  const controlCenterRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Close Control Center when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        controlCenterRef.current &&
        !controlCenterRef.current.contains(event.target as Node)
      ) {
        // Check if click is not on the control center button
        const target = event.target as HTMLElement;
        if (!target.closest('[data-control-center-button]')) {
          if (controlCenterOpen) {
            toggleControlCenter();
          }
        }
      }
    };

    if (controlCenterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [controlCenterOpen, toggleControlCenter]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = async () => {
    const wasFullscreen = isFullscreen;
    await toggleFullscreen();
    // Wait a bit for state to update
    setTimeout(() => {
      if (wasFullscreen) {
        showToast('Tam Ekran Modundan Çıkıldı');
      } else {
        showToast('Tam Ekran Moduna Girildi');
      }
    }, 100);
  };

  if (!controlCenterOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={controlCenterRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`absolute top-8 bg-white/30 dark:bg-black/30 backdrop-blur-2xl rounded-xl p-4 shadow-2xl border border-white/20 z-50 ${
          isMobile 
            ? 'left-2 right-2 w-auto' 
            : 'right-4 w-80'
        }`}
      >
        {/* Brightness Slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              <Sun size={16} />
              <span>Display</span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {brightness}%
            </span>
          </div>
          <div className="relative h-12 bg-gray-200/50 dark:bg-gray-800/50 rounded-full">
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-300 rounded-full transition-all duration-150"
              style={{ width: `${brightness}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-100 rounded-full shadow-xl border-2 border-gray-300 dark:border-gray-400 transition-all duration-150 pointer-events-none"
              style={{
                left: `clamp(0px, calc(${brightness}% - 20px), calc(100% - 40px))`,
              }}
            />
          </div>
        </div>

        {/* Volume Slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              <Volume2 size={16} />
              <span>Sound</span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {volume}%
            </span>
          </div>
          <div className="relative h-12 bg-gray-200/50 dark:bg-gray-800/50 rounded-full">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-300 rounded-full transition-all duration-150"
              style={{ width: `${volume}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-100 rounded-full shadow-xl border-2 border-blue-300 dark:border-blue-400 transition-all duration-150 pointer-events-none"
              style={{
                left: `clamp(0px, calc(${volume}% - 20px), calc(100% - 40px))`,
              }}
            />
          </div>
        </div>

        {/* Media Control */}
        <div className="mb-4 p-3 bg-gray-200/30 dark:bg-gray-800/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Şu An Çalıyor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (musicPlaying) {
                  // Previous track logic
                  showToast('Önceki parça');
                }
              }}
              className="p-2 hover:bg-white/20 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <SkipBack size={16} className="text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => {
                if (!musicPlaying) {
                  setMusicInfo(
                    mediaTitle || 'Blinding Lights',
                    mediaArtist || 'The Weeknd',
                    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'
                  );
                  setMusicPlaying(true);
                  setMediaPlaying(true);
                  setMediaInfo('Blinding Lights', 'The Weeknd');
                  showToast('Müzik başlatıldı');
                } else {
                  setMusicPlaying(false);
                  setMediaPlaying(false);
                  showToast('Müzik durduruldu');
                }
              }}
              className="p-2 hover:bg-white/20 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              {musicPlaying ? (
                <Pause size={16} className="text-gray-700 dark:text-gray-300" />
              ) : (
                <Play size={16} className="text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={() => {
                if (musicPlaying) {
                  // Next track logic
                  showToast('Sonraki parça');
                }
              }}
              className="p-2 hover:bg-white/20 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <SkipForward size={16} className="text-gray-700 dark:text-gray-300" />
            </button>
            <div className="flex-1 ml-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {musicPlaying && musicTitle ? (
                  <>
                    <span className="font-medium">{musicTitle}</span>
                    {musicArtist && <span className="text-gray-500"> - {musicArtist}</span>}
                  </>
                ) : (
                  'Müzik çalmıyor'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Connectivity Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Wi-Fi */}
          <button
            onClick={() => setWifiEnabled(!wifiEnabled)}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 ${
              wifiEnabled
                ? 'bg-blue-500/20 dark:bg-blue-500/30 border-2 border-blue-500/50'
                : 'bg-gray-200/30 dark:bg-gray-800/30 border-2 border-gray-400/30 dark:border-gray-600/30'
            }`}
          >
            <Wifi
              size={24}
              className={
                wifiEnabled
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }
            />
            <span
              className={`text-xs font-medium ${
                wifiEnabled
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Wi-Fi
            </span>
          </button>

          {/* Bluetooth */}
          <button
            onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 ${
              bluetoothEnabled
                ? 'bg-blue-500/20 dark:bg-blue-500/30 border-2 border-blue-500/50'
                : 'bg-gray-200/30 dark:bg-gray-800/30 border-2 border-gray-400/30 dark:border-gray-600/30'
            }`}
          >
            <Bluetooth
              size={24}
              className={
                bluetoothEnabled
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }
            />
            <span
              className={`text-xs font-medium ${
                bluetoothEnabled
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Bluetooth
            </span>
          </button>

          {/* AirDrop */}
          <button
            onClick={() => setAirDropEnabled(!airDropEnabled)}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 ${
              airDropEnabled
                ? 'bg-blue-500/20 dark:bg-blue-500/30 border-2 border-blue-500/50'
                : 'bg-gray-200/30 dark:bg-gray-800/30 border-2 border-gray-400/30 dark:border-gray-600/30'
            }`}
          >
            <Radio
              size={24}
              className={
                airDropEnabled
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }
            />
            <span
              className={`text-xs font-medium ${
                airDropEnabled
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              AirDrop
            </span>
          </button>

          {/* Full Screen */}
          <button
            onClick={handleFullscreenToggle}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 ${
              isFullscreen
                ? 'bg-blue-500/20 dark:bg-blue-500/30 border-2 border-blue-500/50'
                : 'bg-gray-200/30 dark:bg-gray-800/30 border-2 border-gray-400/30 dark:border-gray-600/30'
            }`}
          >
            {isFullscreen ? (
              <Minimize2
                size={24}
                className="text-blue-600 dark:text-blue-400"
              />
            ) : (
              <Maximize2
                size={24}
                className="text-gray-500 dark:text-gray-400"
              />
            )}
            <span
              className={`text-xs font-medium ${
                isFullscreen
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Tam Ekran
            </span>
          </button>
        </div>

        {/* Low Power Mode Toggle */}
        <div className="mt-4 pt-4 border-t border-gray-300/30 dark:border-gray-700/30">
          <button
            onClick={toggleLowPowerMode}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
              lowPowerMode
                ? 'bg-yellow-500/20 dark:bg-yellow-500/30 border-2 border-yellow-500/50'
                : 'bg-gray-200/30 dark:bg-gray-800/30 border-2 border-gray-400/30 dark:border-gray-600/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Battery
                size={20}
                className={
                  lowPowerMode
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-500 dark:text-gray-400'
                }
              />
              <span
                className={`text-sm font-medium ${
                  lowPowerMode
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Düşük Güç Modu
              </span>
            </div>
            <div
              className={`w-12 h-6 rounded-full transition-all duration-200 ${
                lowPowerMode ? 'bg-yellow-500' : 'bg-gray-400'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-200 ${
                  lowPowerMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
                style={{ marginTop: '2px' }}
              />
            </div>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
