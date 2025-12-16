'use client';
/* eslint-disable react-hooks/rules-of-hooks */

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import {
  Folder,
  Grid3x3,
  Globe,
  MessageSquare,
  Mail,
  Code,
  Terminal,
  Trash,
  Trash2,
  Calculator,
  FileText,
  Camera,
  Music,
  Gamepad2,
} from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { useResponsive } from '@/hooks/useResponsive';

interface DockApp {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  pinned?: boolean;
}

// DOOM app definition (will be conditionally added)
const doomApp: DockApp = {
  id: 'doom',
  name: 'DOOM',
  icon: Gamepad2,
  gradient: 'from-red-600 to-red-800',
  pinned: true,
};

// Recent apps (right side, before trash)
const recentApps: DockApp[] = [
  { id: 'launchpad', name: 'Launchpad', icon: Grid3x3, gradient: 'from-purple-500 to-purple-600', pinned: false },
];

// Base icon sizes (responsive)
const BASE_ICON_SIZE_DESKTOP = 48;
const BASE_ICON_SIZE_MOBILE = 40;
const MAX_ICON_SIZE = 80;
const MAGNIFICATION_RANGE = 120; // Distance in pixels where magnification effect applies

// Gaussian function for smooth bell curve
const gaussian = (x: number, sigma: number = MAGNIFICATION_RANGE / 3): number => {
  return Math.exp(-(x * x) / (2 * sigma * sigma));
};

export default function Dock() {
  const { isTouch, isMobile, isTablet } = useResponsive();
  const doomUnlocked = useSystemStore((state) => state.doomUnlocked);
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [clickedApp, setClickedApp] = useState<string | null>(null);
  const [trashFull, setTrashFull] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Responsive icon size
  const BASE_ICON_SIZE = isMobile || isTablet ? BASE_ICON_SIZE_MOBILE : BASE_ICON_SIZE_DESKTOP;
  
  // Conditionally include DOOM in pinned apps
  const pinnedApps: DockApp[] = [
    { id: 'finder', name: 'Finder', icon: Folder, gradient: 'from-blue-500 to-blue-600', pinned: true },
    { id: 'safari', name: 'Safari', icon: Globe, gradient: 'from-cyan-500 to-cyan-600', pinned: true },
    { id: 'messages', name: 'Messages', icon: MessageSquare, gradient: 'from-green-500 to-green-600', pinned: true },
    { id: 'mail', name: 'Mail', icon: Mail, gradient: 'from-blue-400 to-blue-500', pinned: true },
    { id: 'vscode', name: 'VS Code', icon: Code, gradient: 'from-indigo-500 to-indigo-600', pinned: true },
    { id: 'terminal', name: 'Terminal', icon: Terminal, gradient: 'from-gray-600 to-gray-700', pinned: true },
    { id: 'calculator', name: 'Calculator', icon: Calculator, gradient: 'from-orange-500 to-orange-600', pinned: true },
    { id: 'notes', name: 'Notes', icon: FileText, gradient: 'from-yellow-500 to-yellow-600', pinned: true },
    { id: 'photobooth', name: 'Photo Booth', icon: Camera, gradient: 'from-pink-500 to-pink-600', pinned: true },
    { id: 'beatmaker', name: 'Beat Maker', icon: Music, gradient: 'from-purple-500 to-cyan-500', pinned: true },
    ...(doomUnlocked ? [doomApp] : []),
  ];
  
  // Motion value for mouse X position
  const mouseX = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX, {
    stiffness: 500,
    damping: 50,
    mass: 0.1,
  });

  // Fallback motion values for undefined cases
  const fallbackScale = useMotionValue(1);

  // Click animation motion values - create upfront for all apps
  // Create motion values for each app individually
  const clickScaleFinder = useMotionValue(1);
  const clickScaleSafari = useMotionValue(1);
  const clickScaleMessages = useMotionValue(1);
  const clickScaleMail = useMotionValue(1);
  const clickScaleVSCode = useMotionValue(1);
  const clickScaleTerminal = useMotionValue(1);
  const clickScaleCalculator = useMotionValue(1);
  const clickScaleNotes = useMotionValue(1);
  const clickScalePhotoBooth = useMotionValue(1);
  const clickScaleWallpapers = useMotionValue(1);
  const clickScaleLaunchpad = useMotionValue(1);
  const clickScaleDoom = useMotionValue(1);
  const clickScaleTrash = useMotionValue(1);
  
  const clickYFinder = useMotionValue(0);
  const clickYSafari = useMotionValue(0);
  const clickYMessages = useMotionValue(0);
  const clickYMail = useMotionValue(0);
  const clickYVSCode = useMotionValue(0);
  const clickYTerminal = useMotionValue(0);
  const clickYCalculator = useMotionValue(0);
  const clickYNotes = useMotionValue(0);
  const clickYPhotoBooth = useMotionValue(0);
  const clickYWallpapers = useMotionValue(0);
  const clickYLaunchpad = useMotionValue(0);
  const clickYDoom = useMotionValue(0);
  const clickYTrash = useMotionValue(0);
  
  // Map app IDs to their motion values - motion values are stable across renders
  const clickAnimations = useMemo(() => {
    const map = new Map<string, { y: ReturnType<typeof useMotionValue<number>>, scale: ReturnType<typeof useMotionValue<number>> }>();
    map.set('finder', { y: clickYFinder, scale: clickScaleFinder });
    map.set('safari', { y: clickYSafari, scale: clickScaleSafari });
    map.set('messages', { y: clickYMessages, scale: clickScaleMessages });
    map.set('mail', { y: clickYMail, scale: clickScaleMail });
    map.set('vscode', { y: clickYVSCode, scale: clickScaleVSCode });
    map.set('terminal', { y: clickYTerminal, scale: clickScaleTerminal });
    map.set('calculator', { y: clickYCalculator, scale: clickScaleCalculator });
    map.set('notes', { y: clickYNotes, scale: clickScaleNotes });
    map.set('photobooth', { y: clickYPhotoBooth, scale: clickScalePhotoBooth });
    map.set('wallpapers', { y: clickYWallpapers, scale: clickScaleWallpapers });
    map.set('launchpad', { y: clickYLaunchpad, scale: clickScaleLaunchpad });
    map.set('doom', { y: clickYDoom, scale: clickScaleDoom });
    map.set('trash', { y: clickYTrash, scale: clickScaleTrash });
    return map;
  }, [
    clickYFinder, clickScaleFinder,
    clickYSafari, clickScaleSafari,
    clickYMessages, clickScaleMessages,
    clickYMail, clickScaleMail,
    clickYVSCode, clickScaleVSCode,
    clickYTerminal, clickScaleTerminal,
    clickYCalculator, clickScaleCalculator,
    clickYNotes, clickScaleNotes,
    clickYPhotoBooth, clickScalePhotoBooth,
    clickYWallpapers, clickScaleWallpapers,
    clickYLaunchpad, clickScaleLaunchpad,
    clickYDoom, clickScaleDoom,
    clickYTrash, clickScaleTrash,
  ]);
  
  const activeApps = useSystemStore((state) => state.activeApps);
  const setAppActive = useSystemStore((state) => state.setAppActive);
  const windows = useSystemStore((state) => state.windows);
  const addWindow = useSystemStore((state) => state.addWindow);
  const bringToFront = useSystemStore((state) => state.bringToFront);
  const restoreWindow = useSystemStore((state) => state.restoreWindow);
  const toggleLaunchpad = useSystemStore((state) => state.toggleLaunchpad);


  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Disable magnification on touch devices
    if (isTouch) return;
    
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      mouseX.set(x);
    }
  }, [mouseX, isTouch]);

  const handleMouseLeave = useCallback(() => {
    if (isTouch) return;
    mouseX.set(0);
    setHoveredIndex(null);
  }, [mouseX, isTouch]);

  const handleIconHover = useCallback((appId: string) => {
    // Disable hover effects on touch devices
    if (isTouch) return;
    
    setHoveredIndex(appId);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    // Show tooltip immediately on hover (macOS behavior)
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(appId);
    }, 100);
  }, [isTouch]);

  const handleIconLeave = useCallback(() => {
    if (isTouch) return;
    setHoveredIndex(null);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(null);
  }, [isTouch]);

  const handleAppClick = useCallback((appId: string) => {
    if (appId === 'trash') {
      // Trash functionality
      setTrashFull(!trashFull);
      return;
    }

    if (appId === 'launchpad') {
      // Launchpad overlay'i aç
      toggleLaunchpad();
      // Click animation
      setClickedApp(appId);
      const clickAnim = clickAnimations.get(appId);
      if (clickAnim) {
        animate(clickAnim.scale, 0.8, {
          type: 'spring',
          stiffness: 400,
          damping: 15,
        });
        animate(clickAnim.y, -16, {
          type: 'spring',
          stiffness: 400,
          damping: 15,
        });
        setTimeout(() => {
          animate(clickAnim.scale, 1, {
            type: 'spring',
            stiffness: 300,
            damping: 20,
          });
          animate(clickAnim.y, 0, {
            type: 'spring',
            stiffness: 300,
            damping: 20,
          });
          setTimeout(() => setClickedApp(null), 200);
        }, 150);
      } else {
        setTimeout(() => setClickedApp(null), 600);
      }
      return;
    }

    const existingWindow = windows.find(w => w.id === appId);
    
    if (existingWindow) {
      if (existingWindow.minimized) {
        restoreWindow(appId);
      }
      bringToFront(appId);
      setAppActive(appId, true);
    } else {
      // Responsive window configs
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const MENUBAR_HEIGHT = 25;
      const DOCK_HEIGHT = 60;
      const AVAILABLE_HEIGHT = screenHeight - MENUBAR_HEIGHT - DOCK_HEIGHT;
      
      // On tablet: 90% width, centered. On mobile/desktop: use default sizes
      const getWindowSize = (defaultWidth: number, defaultHeight: number) => {
        if (isTablet) {
          const width = screenWidth * 0.9;
          const height = Math.min(defaultHeight, AVAILABLE_HEIGHT);
          const x = (screenWidth - width) / 2;
          const y = MENUBAR_HEIGHT + (AVAILABLE_HEIGHT - height) / 2;
          return { size: { width, height }, position: { x, y } };
        } else if (isMobile) {
          // Mobile will be forced fullscreen by Window component, but set initial size anyway
          return { 
            size: { width: screenWidth, height: AVAILABLE_HEIGHT }, 
            position: { x: 0, y: MENUBAR_HEIGHT } 
          };
        } else {
          // Desktop: use default sizes
          return { 
            size: { width: defaultWidth, height: defaultHeight }, 
            position: { x: 100, y: 100 } 
          };
        }
      };

      const windowConfigs: Record<string, { title: string; size: { width: number; height: number }; position: { x: number; y: number } }> = {
        finder: {
          title: 'Finder',
          ...getWindowSize(900, 600),
        },
        safari: {
          title: 'Safari',
          ...getWindowSize(1000, 700),
        },
        terminal: {
          title: 'Terminal',
          ...getWindowSize(800, 500),
        },
        vscode: {
          title: 'VS Code',
          ...getWindowSize(1200, 800),
        },
        messages: {
          title: 'Messages',
          ...getWindowSize(800, 600),
        },
        mail: {
          title: 'Mail',
          ...getWindowSize(900, 700),
        },
        calculator: {
          title: 'Calculator',
          ...getWindowSize(320, 500),
        },
        notes: {
          title: 'Notes',
          ...getWindowSize(800, 600),
        },
        photobooth: {
          title: 'Photo Booth',
          ...getWindowSize(900, 700),
        },
        beatmaker: {
          title: 'Beat Maker',
          ...getWindowSize(1000, 800),
        },
        wallpapers: {
          title: 'Wallpapers',
          ...getWindowSize(1000, 700),
        },
        doom: {
          title: 'DOOM',
          ...getWindowSize(1024, 768),
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
    
    // Click animation - animate clickScale motion value
    setClickedApp(appId);
    const clickAnim = clickAnimations.get(appId);
    if (clickAnim) {
      // Animate clickScale to 0.8 (press effect)
      animate(clickAnim.scale, 0.8, {
        type: 'spring',
        stiffness: 400,
        damping: 15,
      });
      
      // Animate bounce using spring for y position
      animate(clickAnim.y, -16, {
        type: 'spring',
        stiffness: 400,
        damping: 15,
      });
      
      // Bounce back - restore clickScale to 1
      setTimeout(() => {
        animate(clickAnim.scale, 1, {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        });
        animate(clickAnim.y, 0, {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        });
        setTimeout(() => setClickedApp(null), 200);
      }, 150);
    } else {
      setTimeout(() => setClickedApp(null), 600);
    }
  }, [windows, addWindow, bringToFront, restoreWindow, setAppActive, trashFull, toggleLaunchpad, clickAnimations, isMobile, isTablet]);

  // Calculate icon positions for magnification (centers of icons)
  const iconPositions = useMemo(() => {
    const positions: number[] = [];
    let currentX = 16; // Padding from left
    
    // Pinned apps
    pinnedApps.forEach(() => {
      positions.push(currentX + BASE_ICON_SIZE / 2);
      currentX += BASE_ICON_SIZE + 4; // Base size + minimal gap
    });
    
    // Separator
    currentX += 4; // Separator width + margin
    
    // Recent apps
    recentApps.forEach(() => {
      positions.push(currentX + BASE_ICON_SIZE / 2);
      currentX += BASE_ICON_SIZE + 4;
    });
    
    // Trash
    positions.push(currentX + BASE_ICON_SIZE / 2);
    
    return positions;
  }, [pinnedApps, recentApps, BASE_ICON_SIZE]);

  // Create scale transforms for each icon (disabled on touch devices)
  const iconScales = iconPositions.map((iconCenterX) =>
    useTransform(mouseXSpring, (x) => {
      // Disable magnification on touch devices
      if (isTouch) return 1;
      
      if (x === 0) return 1;
      
      const distance = Math.abs(x - iconCenterX);
      if (distance > MAGNIFICATION_RANGE) return 1;
      
      const gaussianValue = gaussian(distance);
      const scaleValue = 1 + (MAX_ICON_SIZE / BASE_ICON_SIZE - 1) * gaussianValue;
      
      return Math.max(1, scaleValue);
    })
  );

  // Create width transforms based on scales
  const iconWidths = iconScales.map((scale) =>
    useTransform(scale, (s) => BASE_ICON_SIZE * s)
  );

  // Create combined scales for all apps (hover + click)
  const allApps = useMemo(() => [...pinnedApps, ...recentApps, { id: 'trash', name: 'Trash', icon: Trash, gradient: 'from-gray-500 to-gray-600' }], [pinnedApps.length, recentApps.length]);
  
  const combinedScales = allApps.map((app, index) => {
    const hoverScale = iconScales[index] ?? fallbackScale;
    const clickAnim = clickAnimations.get(app.id);
    const clickScale = clickAnim?.scale ?? fallbackScale;
    return useTransform(
      [hoverScale, clickScale],
      (values: number[]) => values[0] * values[1]
    );
  });

  // Render a single dock icon
  const renderDockIcon = (
    app: DockApp | { id: 'trash'; name: 'Trash'; icon: typeof Trash | typeof Trash2; gradient?: string },
    index: number
  ) => {
    const Icon = app.icon;
    const isActive = app.id !== 'trash' && activeApps.has(app.id);
    const isHovered = hoveredIndex === app.id;
    const isClicked = clickedApp === app.id;
    
    const hoverScale = iconScales[index] ?? fallbackScale;
    const width = iconWidths[index];
    const clickAnim = clickAnimations.get(app.id);
    const combinedScale = combinedScales[index] ?? fallbackScale;

    return (
      <motion.div
        key={app.id}
        className="relative flex flex-col items-center"
        style={{ width }}
        layout
      >
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip === app.id && isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
              className="absolute -top-11 px-2.5 py-1 rounded-md bg-gray-900/95 dark:bg-gray-100/95 text-white dark:text-gray-900 text-xs font-medium whitespace-nowrap shadow-lg backdrop-blur-sm z-50 pointer-events-none"
            >
              {app.name}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900/95 dark:border-t-gray-100/95" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.button
          onMouseEnter={() => handleIconHover(app.id)}
          onMouseLeave={handleIconLeave}
          onClick={() => handleAppClick(app.id)}
          className="relative rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
          style={{
            width,
            height: BASE_ICON_SIZE,
            scale: combinedScale,
            y: clickAnim?.y ?? 0,
            transformOrigin: 'center bottom',
          }}
          whileTap={{
            scale: 0.95,
          }}
        >
          <div
            className={`w-full h-full bg-gradient-to-br ${app.gradient || 'from-gray-500 to-gray-600'} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </motion.button>

        {/* Active indicator dot - sharp, tiny square */}
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
            }}
            className="absolute -bottom-0.5 w-1 h-1 bg-white dark:bg-gray-200"
            style={{
              borderRadius: '0',
              clipPath: 'inset(0)',
            }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div data-dock className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex items-end gap-2 px-4 py-3 rounded-3xl backdrop-blur-2xl bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20 shadow-2xl"
        style={{
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {/* Left Section: Pinned Apps */}
        <div className="flex items-end" style={{ gap: '4px' }}>
          {pinnedApps.map((app, index) => renderDockIcon(app, index))}
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-white/20 dark:bg-gray-600/30 mx-1 flex-shrink-0" />

        {/* Right Section: Recent Apps + Trash */}
        <div className="flex items-end" style={{ gap: '4px' }}>
          {recentApps.map((app, index) => 
            renderDockIcon(app, pinnedApps.length + index)
          )}
          
          {/* Trash Icon */}
          {renderDockIcon(
            {
              id: 'trash',
              name: 'Trash',
              icon: trashFull ? Trash2 : Trash,
              gradient: 'from-gray-500 to-gray-600',
            },
            pinnedApps.length + recentApps.length
          )}
        </div>
      </motion.div>
    </div>
  );
}
