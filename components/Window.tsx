'use client';

import { motion, useDragControls, PanInfo } from 'framer-motion';
import { useSystemStore, Window as WindowType } from '@/store/useSystemStore';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface WindowProps {
  window: WindowType;
  children?: React.ReactNode;
}

// Alias to avoid conflict with global window
const globalWindow = typeof window !== 'undefined' ? window : null;

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;

export default function Window({ window, children }: WindowProps) {
  const { isMobile, isTablet, width: screenWidth, height: screenHeight } = useResponsive();
  const {
    bringToFront,
    removeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindow,
    windows,
  } = useSystemStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    top: number;
  } | null>(null);
  const [snapZone, setSnapZone] = useState<'left' | 'right' | 'top' | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  
  // On mobile, force fullscreen when window opens
  useEffect(() => {
    if (isMobile && !window.maximized && window.size.width < screenWidth * 0.95) {
      const MENUBAR_HEIGHT = 25;
      const DOCK_HEIGHT = 60;
      maximizeWindow(window.id, {
        width: screenWidth,
        height: screenHeight - MENUBAR_HEIGHT - DOCK_HEIGHT,
      });
    }
  }, [isMobile, window.id, window.maximized, window.size.width, screenWidth, screenHeight, maximizeWindow]);

  const isActive = windows
    .filter((w) => !w.minimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]?.id === window.id;

  const handleWindowClick = useCallback(() => {
    if (!window.minimized) {
      bringToFront(window.id);
    }
  }, [window.id, window.minimized, bringToFront]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeWindow(window.id);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    minimizeWindow(window.id);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.maximized) {
      restoreWindow(window.id);
    } else {
      const MENUBAR_HEIGHT = 25;
      const DOCK_HEIGHT = isMobile || isTablet ? 60 : 60;
      maximizeWindow(window.id, {
        width: screenWidth,
        height: screenHeight - MENUBAR_HEIGHT - DOCK_HEIGHT,
      });
    }
  };

  const SNAP_THRESHOLD = isTablet ? 30 : 50; // Pixels from edge to trigger snap (smaller on tablet)
  const MENUBAR_HEIGHT = 25;
  const DOCK_HEIGHT = isMobile || isTablet ? 60 : 60;
  const AVAILABLE_HEIGHT = screenHeight - MENUBAR_HEIGHT - DOCK_HEIGHT;

  const handleDragStart = () => {
    setIsDragging(true);
    bringToFront(window.id);
    setSnapZone(null);
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Disable dragging on mobile
    if (isMobile) return;
    
    if (!window.maximized && isDragging) {
      const currentX = window.position.x + info.offset.x;
      const currentY = window.position.y + info.offset.y;

      // Check for snap zones (only on tablet and desktop)
      if (currentX <= SNAP_THRESHOLD && currentY > MENUBAR_HEIGHT) {
        // Left edge
        setSnapZone('left');
      } else if (currentX + window.size.width >= screenWidth - SNAP_THRESHOLD && currentY > MENUBAR_HEIGHT) {
        // Right edge
        setSnapZone('right');
      } else if (currentY <= MENUBAR_HEIGHT + SNAP_THRESHOLD) {
        // Top edge (maximize)
        setSnapZone('top');
      } else {
        setSnapZone(null);
      }
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    // Disable dragging on mobile
    if (isMobile) {
      setSnapZone(null);
      return;
    }
    
    if (!window.maximized && snapZone) {
      const halfWidth = screenWidth / 2;

      if (snapZone === 'left') {
        // Snap to left half (tablet snap-to-edge with magnet effect)
        updateWindow(window.id, {
          position: { x: 0, y: MENUBAR_HEIGHT },
          size: { width: halfWidth, height: AVAILABLE_HEIGHT },
        });
      } else if (snapZone === 'right') {
        // Snap to right half
        updateWindow(window.id, {
          position: { x: halfWidth, y: MENUBAR_HEIGHT },
          size: { width: halfWidth, height: AVAILABLE_HEIGHT },
        });
      } else if (snapZone === 'top') {
        // Maximize
        maximizeWindow(window.id, {
          width: screenWidth,
          height: AVAILABLE_HEIGHT,
        });
      }
    } else if (!window.maximized && isTablet) {
      // Tablet: snap-to-edge magnet effect (90% width, centered)
      const targetWidth = screenWidth * 0.9;
      const targetX = (screenWidth - targetWidth) / 2;
      const currentX = window.position.x + info.offset.x;
      
      // Magnet effect: if close to center, snap to center
      if (Math.abs(currentX - targetX) < 50) {
        updateWindow(window.id, {
          position: { x: targetX, y: window.position.y + info.offset.y },
          size: { width: targetWidth, height: window.size.height },
        });
      } else {
        updateWindow(window.id, {
          position: {
            x: window.position.x + info.offset.x,
            y: window.position.y + info.offset.y,
          },
        });
      }
    } else if (!window.maximized) {
      updateWindow(window.id, {
        position: {
          x: window.position.x + info.offset.x,
          y: window.position.y + info.offset.y,
        },
      });
    }

    setSnapZone(null);
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    handle: ResizeHandle
  ) => {
    e.stopPropagation();
    if (window.maximized) return;

    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
      left: window.position.x,
      top: window.position.y,
    });
    bringToFront(window.id);
  };

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeHandle || !resizeStart) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.left;
      let newY = resizeStart.top;

      if (resizeHandle.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, resizeStart.width + deltaX);
      }
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(MIN_WIDTH, resizeStart.width - deltaX);
        newX = resizeStart.left + deltaX;
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStart.height + deltaY);
      }
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStart.height - deltaY);
        newY = resizeStart.top + deltaY;
      }

      updateWindow(window.id, {
        size: { width: newWidth, height: newHeight },
        position: { x: newX, y: newY },
      });
    },
    [isResizing, resizeHandle, resizeStart, window.id, updateWindow]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStart(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  if (window.minimized) {
    return null;
  }

  const dragConstraints = window.maximized
    ? { left: 0, right: 0, top: 0, bottom: 0 }
    : undefined;

  return (
    <motion.div
      ref={windowRef}
      data-window
      className={`absolute bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isActive ? 'opacity-100' : 'opacity-80'
      } ${!isActive ? 'shadow-lg' : 'shadow-2xl'} ${
        window.id === 'wallpapers' ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm' : ''
      }`}
      style={{
        x: window.maximized ? 0 : window.position.x,
        y: window.maximized ? 0 : window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
      }}
      initial={false}
      animate={{
        x: window.maximized ? 0 : window.position.x,
        y: window.maximized ? 0 : window.position.y,
        width: window.size.width,
        height: window.size.height,
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200,
      }}
      onClick={handleWindowClick}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      drag={window.maximized || isMobile ? false : true}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={dragConstraints}
    >
      {/* Header Bar */}
      <div
        className={`h-10 bg-gray-100 dark:bg-gray-900 flex items-center justify-between px-3 select-none ${
          isMobile ? 'cursor-default' : 'cursor-move'
        }`}
        onPointerDown={(e) => {
          if (!window.maximized && !isMobile) {
            dragControls.start(e);
          }
        }}
      >
        {/* Traffic Lights - Hidden on mobile, or replaced with Done button */}
        {isMobile ? (
          <div className="flex-1 text-center">
            <button
              onClick={handleClose}
              className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              aria-label="Done"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            {/* Red - Close */}
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X
                className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity"
                strokeWidth={3}
              />
            </button>

            {/* Yellow - Minimize */}
            <button
              onClick={handleMinimize}
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-colors"
              aria-label="Minimize"
            >
              <Minus
                className="w-2 h-2 text-yellow-900 opacity-0 group-hover:opacity-100 transition-opacity"
                strokeWidth={3}
              />
            </button>

            {/* Green - Maximize */}
            <button
              onClick={handleMaximize}
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
              aria-label="Maximize"
            >
              <Square
                className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100 transition-opacity"
                strokeWidth={2}
              />
            </button>
          </div>
        )}

        {/* Title */}
        {!isMobile && (
          <>
            <div className="flex-1 text-center text-sm font-medium text-gray-700 dark:text-gray-300 pointer-events-none">
              {window.title}
            </div>
            {/* Spacer for symmetry */}
            <div className="w-16" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="h-[calc(100%-2.5rem)] overflow-auto">
        {children}
      </div>

      {/* Resize Handles - Disabled on mobile and tablet */}
      {!window.maximized && !isMobile && !isTablet && (
        <>
          {/* Corners */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />

          {/* Edges */}
          <div
            className="absolute top-0 left-3 right-3 h-1 cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute bottom-0 left-3 right-3 h-1 cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute left-0 top-3 bottom-3 w-1 cursor-ew-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="absolute right-0 top-3 bottom-3 w-1 cursor-ew-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}

      {/* Snap Overlay */}
      {isDragging && snapZone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed pointer-events-none z-[10000]"
          style={{
            left: snapZone === 'left' ? 0 : snapZone === 'right' ? (globalWindow?.innerWidth ?? 1920) / 2 : 0,
            top: snapZone === 'top' ? MENUBAR_HEIGHT : MENUBAR_HEIGHT,
            width: snapZone === 'top' ? (globalWindow?.innerWidth ?? 1920) : (globalWindow?.innerWidth ?? 1920) / 2,
            height: snapZone === 'top' ? AVAILABLE_HEIGHT : AVAILABLE_HEIGHT,
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-white/90 text-base font-semibold drop-shadow-lg"
            >
              {snapZone === 'top' ? 'Tam Ekran' : snapZone === 'left' ? 'Sol Yarı' : 'Sağ Yarı'}
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
