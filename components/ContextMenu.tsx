'use client';

import { useEffect, useRef, useState } from 'react';
import { useSystemStore } from '@/store/useSystemStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  
  const changeWallpaper = useSystemStore((state) => state.changeWallpaper);
  const addDesktopItem = useSystemStore((state) => state.addDesktopItem);
  const cleanUpDesktop = useSystemStore((state) => state.cleanUpDesktop);
  const sortDesktopBy = useSystemStore((state) => state.sortDesktopBy);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Small delay to prevent immediate close on right-click
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }, 10);

    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleChangeWallpaper = () => {
    changeWallpaper();
    onClose();
  };

  const handleNewFolder = () => {
    // Generate a random position for the new folder
    const randomX = Math.random() * (window.innerWidth - 200) + 50;
    const randomY = Math.random() * (window.innerHeight - 200) + 100;
    
    addDesktopItem({
      name: 'Yeni Klasör',
      type: 'folder',
      position: { x: randomX, y: randomY },
    });
    onClose();
  };

  const handleCleanUp = () => {
    cleanUpDesktop();
    onClose();
  };

  const handleSortBy = (sortBy: 'name' | 'date' | 'size') => {
    sortDesktopBy(sortBy);
    onClose();
  };

  const menuItems = [
    {
      id: 'change-wallpaper',
      label: 'Duvar Kağıdını Değiştir',
      action: handleChangeWallpaper,
      hasSubmenu: false,
    },
    {
      id: 'new-folder',
      label: 'Yeni Klasör',
      action: handleNewFolder,
      hasSubmenu: false,
    },
    {
      id: 'clean-up',
      label: 'Temizle',
      action: handleCleanUp,
      hasSubmenu: false,
    },
    {
      id: 'sort-by',
      label: 'Sırala',
      hasSubmenu: true,
      submenuItems: [
        { id: 'name', label: 'İsim', action: () => handleSortBy('name') },
        { id: 'date', label: 'Tarih', action: () => handleSortBy('date') },
        { id: 'size', label: 'Boyut', action: () => handleSortBy('size') },
      ],
    },
  ];

  // Adjust position if menu would go off screen
  const menuWidth = 200;
  const submenuWidth = 150;
  const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
  const adjustedY = y + 300 > window.innerHeight ? y - 300 : y;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[10000]"
        style={{
          left: adjustedX,
          top: adjustedY,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 rounded-lg border border-white/20 dark:border-gray-700/20 shadow-xl p-1 min-w-[180px]">
          {menuItems.map((item) => (
            <div key={item.id} className="relative">
              <button
                onClick={item.hasSubmenu ? undefined : item.action}
                onMouseEnter={() => item.hasSubmenu && setHoveredSubmenu(item.id)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white/40 dark:hover:bg-gray-800/40 flex items-center justify-between text-sm text-gray-700 dark:text-gray-200 transition-colors"
              >
                <span>{item.label}</span>
                {item.hasSubmenu && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {item.hasSubmenu && hoveredSubmenu === item.id && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-full top-0 ml-1 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 rounded-lg border border-white/20 dark:border-gray-700/20 shadow-xl p-1 min-w-[140px] z-10"
                  onMouseEnter={() => setHoveredSubmenu(item.id)}
                  onMouseLeave={() => setHoveredSubmenu(null)}
                >
                  {item.submenuItems?.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={subItem.action}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-white/40 dark:hover:bg-gray-800/40 text-sm text-gray-700 dark:text-gray-200 transition-colors"
                    >
                      {subItem.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

