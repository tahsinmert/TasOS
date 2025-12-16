'use client';

import { useSystemStore } from '@/store/useSystemStore';
import { useEffect, useState, useCallback, useRef } from 'react';
import Dock from './Dock';
import MenuBar from './MenuBar';
import Spotlight from './Spotlight';
import Launchpad from './Launchpad';
import Window from './Window';
import Finder from './apps/Finder';
import Safari from './apps/Safari';
import Terminal from './apps/Terminal';
import VSCode from './apps/VSCode';
import Calculator from './apps/Calculator';
import Notes from './apps/Notes';
import PhotoBooth from './apps/PhotoBooth';
import BeatMaker from './apps/BeatMaker';
import DOOM from './apps/DOOM';
import Wallpapers from './apps/Wallpapers';
import Bootup from './Bootup';
import ContextMenu from './ContextMenu';
import AIAssistantOrb from './AIAssistantOrb';
import FluidBackground from './FluidBackground';
import ControlCenter from './ControlCenter';
import Toast from './Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Radio, BatteryCharging } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useResponsive } from '@/hooks/useResponsive';

export default function Desktop() {
  const { isTouch, width: screenWidth, height: screenHeight } = useResponsive();
  const theme = useSystemStore((state) => state.theme);
  const windows = useSystemStore((state) => state.windows);
  const brightness = useSystemStore((state) => state.brightness);
  const isSleeping = useSystemStore((state) => state.isSleeping);
  const showBootup = useSystemStore((state) => state.showBootup);
  const setSleeping = useSystemStore((state) => state.setSleeping);
  const setShowBootup = useSystemStore((state) => state.setShowBootup);
  const currentWallpaperUrl = useSystemStore((state) => state.currentWallpaperUrl);
  const currentWallpaperType = useSystemStore((state) => state.currentWallpaperType);
  const desktopItems = useSystemStore((state) => state.desktopItems);
  const lowPowerMode = useSystemStore((state) => state.lowPowerMode);
  const setLowPowerMode = useSystemStore((state) => state.setLowPowerMode);
  const [fps, setFps] = useState(60);
  const spotlightOpen = useSystemStore((state) => state.spotlightOpen);
  const setSpotlightOpen = useSystemStore((state) => state.setSpotlightOpen);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const updateWindow = useSystemStore((state) => state.updateWindow);
  const setAppActive = useSystemStore((state) => state.setAppActive);
  const launchpadOpen = useSystemStore((state) => state.launchpadOpen);
  const setLaunchpadOpen = useSystemStore((state) => state.setLaunchpadOpen);
  const addWindow = useSystemStore((state) => state.addWindow);
  const bringToFront = useSystemStore((state) => state.bringToFront);
  const restoreWindow = useSystemStore((state) => state.restoreWindow);
  const toastMessage = useSystemStore((state) => state.toastMessage);
  const toastVisible = useSystemStore((state) => state.toastVisible);
  const showToast = useSystemStore((state) => state.showToast);
  const hideToast = useSystemStore((state) => state.hideToast);
  const setIsFullscreen = useSystemStore((state) => state.setIsFullscreen);
  
  // Fullscreen hook
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  // Sync fullscreen state with store
  useEffect(() => {
    setIsFullscreen(isFullscreen);
  }, [isFullscreen, setIsFullscreen]);
  
  // Dynamic Island controls
  const musicPlaying = useSystemStore((state) => state.musicPlaying);
  const setMusicPlaying = useSystemStore((state) => state.setMusicPlaying);
  const setMusicInfo = useSystemStore((state) => state.setMusicInfo);
  const airDropActive = useSystemStore((state) => state.airDropActive);
  const setAirDropActive = useSystemStore((state) => state.setAirDropActive);
  const setAirDropProgress = useSystemStore((state) => state.setAirDropProgress);
  const [showTestPanel, setShowTestPanel] = useState(false);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Cmd+Space
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === ' ')) {
        e.preventDefault();
        setSpotlightOpen(!spotlightOpen);
      }
      // Escape to close
      if (e.key === 'Escape' && spotlightOpen) {
        setSpotlightOpen(false);
      }
      // Cmd+Shift+F or F11 for fullscreen
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') ||
        e.key === 'F11'
      ) {
        e.preventDefault();
        const wasFullscreen = isFullscreen;
        toggleFullscreen().then(() => {
          // Wait a bit for state to update
          setTimeout(() => {
            if (wasFullscreen) {
              showToast('Tam Ekran Modundan Çıkıldı');
            } else {
              showToast('Tam Ekran Moduna Girildi');
            }
          }, 100);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spotlightOpen, toggleFullscreen, isFullscreen, showToast]);

  const handleSelectApp = (appId: string) => {
    setAppActive(appId, true);
  };

  // Handle right-click on desktop (desktop) or long-press (touch)
  const handleContextMenu = (e: React.MouseEvent) => {
    // Only show context menu if clicking on the desktop (not on windows, dock, menubar)
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-window]') ||
      target.closest('[data-dock]') ||
      target.closest('[data-menubar]')
    ) {
      return;
    }

    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Handle touch start for long-press gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-window]') ||
      target.closest('[data-dock]') ||
      target.closest('[data-menubar]')
    ) {
      return;
    }

    const touch = e.touches[0];
    longPressTimerRef.current = setTimeout(() => {
      setContextMenu({ x: touch.clientX, y: touch.clientY });
    }, 500); // 500ms long-press
  };

  // Handle touch end - cancel long-press if released early
  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Handle touch move - cancel long-press if moved too much
  const handleTouchMove = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Handle orientation change - reposition windows that are off-screen
  useEffect(() => {
    const handleOrientationChange = () => {
      // Small delay to allow orientation change to complete
      setTimeout(() => {
        const newWidth = typeof window !== 'undefined' ? window.innerWidth : screenWidth;
        const newHeight = typeof window !== 'undefined' ? window.innerHeight : screenHeight;
        
        windows.forEach((win) => {
          if (!win.maximized && !win.minimized) {
            // If window is off-screen, reposition it
            if (win.position.x + win.size.width > newWidth || 
                win.position.y + win.size.height > newHeight) {
              const MENUBAR_HEIGHT = 25;
              const DOCK_HEIGHT = 60;
              const maxX = newWidth - win.size.width;
              const maxY = newHeight - MENUBAR_HEIGHT - DOCK_HEIGHT - win.size.height;
              
              updateWindow(win.id, {
                position: {
                  x: Math.max(0, Math.min(win.position.x, maxX)),
                  y: Math.max(MENUBAR_HEIGHT, Math.min(win.position.y, maxY)),
                },
              });
            }
          }
        });
      }, 100);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleOrientationChange);
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      };
    }
  }, [windows, screenWidth, screenHeight, updateWindow]);

  // Handle sleep wake up
  useEffect(() => {
    if (isSleeping) {
      const handleClick = () => {
        setSleeping(false);
      };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [isSleeping, setSleeping]);

  // Handle bootup completion
  const handleBootupComplete = () => {
    setShowBootup(false);
  };

  // Mock music player
  const handleToggleMusic = () => {
    if (!musicPlaying) {
      setMusicInfo(
        'Blinding Lights',
        'The Weeknd',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'
      );
      setMusicPlaying(true);
    } else {
      setMusicPlaying(false);
    }
  };

  // Mock AirDrop transfer
  const handleStartAirDrop = () => {
    setAirDropActive(true);
    setAirDropProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAirDropProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setAirDropActive(false);
          setAirDropProgress(0);
        }, 1000);
      }
    }, 300);
  };

  if (showBootup) {
    return <Bootup onComplete={handleBootupComplete} />;
  }

  // Enable fluid if not in low power mode and FPS is acceptable (>= 30) or not yet measured (fps === 60 default)
  const fluidEnabled = !lowPowerMode && (fps >= 30 || fps === 60);

  // Auto-disable fluid if FPS drops below 30
  useEffect(() => {
    if (!lowPowerMode && fps > 0 && fps < 30) {
      setLowPowerMode(true);
    }
  }, [fps, lowPowerMode, setLowPowerMode]);

  const handleWindowDrag = useCallback((x: number, y: number) => {
    // Window drag will be handled by FluidBackground component
  }, []);

  return (
    <div
      data-desktop-container
      className="fixed inset-0 w-full h-full overflow-hidden"
      onContextMenu={isTouch ? undefined : handleContextMenu}
      onTouchStart={isTouch ? handleTouchStart : undefined}
      onTouchEnd={isTouch ? handleTouchEnd : undefined}
      onTouchMove={isTouch ? handleTouchMove : undefined}
      style={{
        filter: `brightness(${brightness}%)`,
        transition: 'filter 0.2s ease',
      }}
    >
      {/* Fluid Background or Static Wallpaper */}
      {currentWallpaperType !== 'video' && (
        <FluidBackground
          enabled={fluidEnabled}
          onWindowDrag={handleWindowDrag}
          onFPSChange={setFps}
        />
      )}
      
      {/* Wallpaper - with cross-fade animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWallpaperUrl}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 w-full h-full"
          style={{
            zIndex: -1,
          }}
        >
          {currentWallpaperType === 'video' ? (
            <video
              src={currentWallpaperUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : currentWallpaperUrl.startsWith('linear-gradient') ? (
            <div
              className="w-full h-full"
              style={{ background: currentWallpaperUrl }}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${currentWallpaperUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <MenuBar />
      <Dock />
      <ControlCenter />
      
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={hideToast}
        duration={2000}
      />
      
      {/* Desktop Items (Folders & Files) */}
      {desktopItems.map((item) => (
        <div
          key={item.id}
          className="absolute cursor-pointer select-none z-10"
          style={{
            left: `${item.position.x}px`,
            top: `${item.position.y}px`,
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (item.id === 'readme-txt') {
              // Open README.txt in a TextEdit-like window
              const existingWindow = windows.find(w => w.id === 'readme-txt');
              if (!existingWindow) {
                addWindow({
                  id: 'readme-txt',
                  title: 'README.txt',
                  position: { x: 200, y: 100 },
                  size: { width: 600, height: 500 },
                });
              } else {
                bringToFront('readme-txt');
                if (existingWindow.minimized) {
                  restoreWindow('readme-txt');
                }
              }
            } else {
              // Future: Open folder
            }
          }}
        >
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
            <div className="text-6xl">{item.type === 'file' ? '📄' : '📁'}</div>
            <span className="text-white text-sm drop-shadow-lg px-1 rounded text-center max-w-[80px] truncate">
              {item.name}
            </span>
          </div>
        </div>
      ))}
      
      {/* Render Windows */}
      {windows.map((window) => {
        const getAppContent = () => {
          switch (window.id) {
            case 'finder':
              return <Finder />;
            case 'safari':
              return <Safari />;
            case 'terminal':
              return <Terminal />;
            case 'vscode':
              return <VSCode />;
            case 'calculator':
              return <Calculator />;
            case 'notes':
              return <Notes />;
            case 'photobooth':
              return <PhotoBooth />;
            case 'beatmaker':
              return <BeatMaker />;
            case 'doom':
              return <DOOM />;
            case 'wallpapers':
              return <Wallpapers />;
            case 'readme-txt':
              return (
                <div className="h-full bg-white dark:bg-gray-950 p-6">
                  <div className="h-full bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-950 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                    <textarea
                      readOnly
                      value="Kodlama bir sanattır. - Tahsin Mert Mutlu"
                      className="w-full h-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 text-base leading-relaxed font-serif"
                      style={{
                        fontFamily: 'Georgia, serif',
                      }}
                    />
                  </div>
                </div>
              );
            default:
              return (
                <div className="p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    {window.title} içeriği
                  </p>
                </div>
              );
          }
        };

        return (
          <Window key={window.id} window={window}>
            {getAppContent()}
          </Window>
        );
      })}
      
      <Spotlight
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        onSelectApp={handleSelectApp}
      />

      <Launchpad
        isOpen={launchpadOpen}
        onClose={() => setLaunchpadOpen(false)}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Sleep Overlay */}
      <AnimatePresence>
        {isSleeping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black z-[9999] cursor-pointer"
            onClick={() => setSleeping(false)}
          />
        )}
      </AnimatePresence>

      {/* AI Assistant Orb */}
      <AIAssistantOrb />

      {/* Dynamic Island Test Panel */}
      <div className="fixed bottom-24 left-4 z-40">
        <button
          onClick={() => setShowTestPanel(!showTestPanel)}
          className="px-4 py-2 bg-black/50 backdrop-blur-xl rounded-lg text-white text-xs hover:bg-black/70 transition-colors border border-white/10"
        >
          {showTestPanel ? 'Hide' : 'Show'} Dynamic Island Tests
        </button>
        
        {showTestPanel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 p-4 bg-black/50 backdrop-blur-xl rounded-lg border border-white/10 space-y-2"
          >
            <div className="text-white text-xs font-semibold mb-2">Test Dynamic Island</div>
            
            <button
              onClick={handleToggleMusic}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors"
            >
              {musicPlaying ? (
                <>
                  <Pause size={14} />
                  <span>Stop Music</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Play Music</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleStartAirDrop}
              disabled={airDropActive}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Radio size={14} />
              <span>Start AirDrop</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

