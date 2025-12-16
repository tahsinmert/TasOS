'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
  submenu?: MenuItem[];
}

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  position?: 'left' | 'right';
  children: ReactNode;
}

export default function MenuDropdown({
  isOpen,
  onClose,
  items,
  position = 'left',
  children,
}: MenuDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={containerRef}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-1 min-w-48 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-md shadow-xl border border-white/20 py-1 z-50 ${
              position === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {items.map((item, index) => {
              if (item.separator) {
                return (
                  <div
                    key={`separator-${index}`}
                    className="h-px bg-gray-300 dark:bg-gray-700 my-1 mx-2"
                  />
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!item.disabled && item.onClick) {
                      item.onClick();
                      if (!item.submenu) {
                        onClose();
                      }
                    }
                  }}
                  disabled={item.disabled}
                  className={`w-full text-left px-4 py-2 hover:bg-white/20 dark:hover:bg-gray-800/50 flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100 transition-colors ${
                    item.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  } ${item.submenu ? 'relative group' : ''}`}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.submenu && (
                    <span className="text-xs opacity-60">›</span>
                  )}
                  {item.submenu && (
                    <div className="absolute left-full top-0 ml-1 min-w-48 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-md shadow-xl border border-white/20 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      {item.submenu.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => {
                            if (!subItem.disabled && subItem.onClick) {
                              subItem.onClick();
                              onClose();
                            }
                          }}
                          disabled={subItem.disabled}
                          className={`w-full text-left px-4 py-2 hover:bg-white/20 dark:hover:bg-gray-800/50 flex items-center gap-3 text-sm text-gray-900 dark:text-gray-100 transition-colors ${
                            subItem.disabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                        >
                          {subItem.icon && (
                            <span className="flex-shrink-0">{subItem.icon}</span>
                          )}
                          <span>{subItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

