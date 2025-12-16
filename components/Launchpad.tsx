'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import {
  Folder,
  Globe,
  MessageSquare,
  Mail,
  Code,
  Terminal,
  Search,
  Music,
} from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { useResponsive } from '@/hooks/useResponsive';

interface App {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

// Tüm uygulamalar (Launchpad'de gösterilecek)
const apps: App[] = [
  { id: 'finder', name: 'Finder', icon: Folder, gradient: 'from-blue-500 to-blue-600' },
  { id: 'safari', name: 'Safari', icon: Globe, gradient: 'from-cyan-500 to-cyan-600' },
  { id: 'messages', name: 'Messages', icon: MessageSquare, gradient: 'from-green-500 to-green-600' },
  { id: 'mail', name: 'Mail', icon: Mail, gradient: 'from-blue-400 to-blue-500' },
  { id: 'vscode', name: 'VS Code', icon: Code, gradient: 'from-indigo-500 to-indigo-600' },
  { id: 'terminal', name: 'Terminal', icon: Terminal, gradient: 'from-gray-600 to-gray-700' },
  { id: 'beatmaker', name: 'Beat Maker', icon: Music, gradient: 'from-purple-500 to-cyan-500' },
];

interface LaunchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Launchpad({ isOpen, onClose }: LaunchpadProps) {
  const { isMobile, isTablet } = useResponsive();
  const windows = useSystemStore((state) => state.windows);
  const addWindow = useSystemStore((state) => state.addWindow);
  const bringToFront = useSystemStore((state) => state.bringToFront);
  const restoreWindow = useSystemStore((state) => state.restoreWindow);
  const setAppActive = useSystemStore((state) => state.setAppActive);
  
  // Responsive grid columns: mobile 4-5 cols, tablet 6 cols, desktop 7 cols
  const gridCols = isMobile ? 5 : isTablet ? 6 : 7;

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAppClick = (appId: string) => {
    if (appId === 'launchpad') {
      // Launchpad'i kendisi açmaz
      return;
    }

    const existingWindow = windows.find((w) => w.id === appId);

    if (existingWindow) {
      if (existingWindow.minimized) {
        restoreWindow(appId);
      }
      bringToFront(appId);
      setAppActive(appId, true);
    } else {
      const windowConfigs: Record<
        string,
        {
          title: string;
          size: { width: number; height: number };
          position: { x: number; y: number };
        }
      > = {
        finder: {
          title: 'Finder',
          size: { width: 900, height: 600 },
          position: { x: 100, y: 100 },
        },
        safari: {
          title: 'Safari',
          size: { width: 1000, height: 700 },
          position: { x: 150, y: 150 },
        },
        terminal: {
          title: 'Terminal',
          size: { width: 800, height: 500 },
          position: { x: 200, y: 200 },
        },
        vscode: {
          title: 'VS Code',
          size: { width: 1200, height: 800 },
          position: { x: 120, y: 120 },
        },
        messages: {
          title: 'Messages',
          size: { width: 800, height: 600 },
          position: { x: 150, y: 150 },
        },
        mail: {
          title: 'Mail',
          size: { width: 900, height: 700 },
          position: { x: 120, y: 120 },
        },
        beatmaker: {
          title: 'Beat Maker',
          size: { width: 1000, height: 800 },
          position: { x: 100, y: 100 },
        },
      };

      const config = windowConfigs[appId];
      if (config) {
        addWindow({
          id: appId,
          ...config,
        });
        setAppActive(appId, true);
      }
    }

    // Launchpad'i kapat
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blurred & Darkened Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="fixed inset-0 z-[9998] backdrop-blur-2xl bg-black/60"
            onClick={onClose}
          />

          {/* Launchpad Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center pt-20 pb-32 px-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Bar (Visual Only) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: 0.1,
              }}
              className="w-full max-w-2xl mb-12"
            >
              <div className="flex items-center gap-3 px-6 py-4 bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg">
                <Search className="w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-lg"
                  readOnly
                />
              </div>
            </motion.div>

            {/* Apps Grid - Responsive columns */}
            <div className={`w-full max-w-6xl grid justify-items-center ${
              isMobile ? 'grid-cols-5 gap-4' : isTablet ? 'grid-cols-6 gap-6' : 'grid-cols-7 gap-8'
            }`}>
              {apps.map((app, index) => {
                const Icon = app.icon;
                // Grid pozisyonu hesapla
                const col = index % gridCols;
                const row = Math.floor(index / gridCols);
                // Merkez noktası - grid'in ortası
                const centerX = (gridCols - 1) / 2;
                const centerY = 2.5;
                const distanceFromCenter = Math.sqrt(
                  Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2)
                );
                const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
                // Merkeze yakın olanlar daha erken animasyon başlasın
                const delay = (distanceFromCenter / maxDistance) * 0.4;
                
                // Responsive icon size: mobile smaller (44px minimum touch target)
                const iconSize = isMobile ? 'w-16 h-16' : isTablet ? 'w-20 h-20' : 'w-24 h-24';
                const iconInnerSize = isMobile ? 'w-8 h-8' : isTablet ? 'w-10 h-10' : 'w-12 h-12';

                return (
                  <motion.button
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.2 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                      delay: delay,
                    }}
                    style={{
                      transformOrigin: 'center center',
                      minWidth: isMobile ? '44px' : undefined,
                      minHeight: isMobile ? '44px' : undefined,
                    }}
                    onClick={() => handleAppClick(app.id)}
                    className="flex flex-col items-center justify-center gap-2 group cursor-pointer focus:outline-none touch-manipulation"
                  >
                    {/* App Icon */}
                    <motion.div
                      whileHover={!isMobile ? { scale: 1.15 } : {}}
                      whileTap={{ scale: 0.9 }}
                      className={`${iconSize} rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-2xl transition-shadow ${
                        !isMobile ? 'group-hover:shadow-3xl' : ''
                      }`}
                    >
                      <Icon className={`${iconInnerSize} text-white`} />
                    </motion.div>

                    {/* App Label */}
                    <span className={`text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center whitespace-nowrap ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      {app.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

