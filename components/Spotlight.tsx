'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import {
  Folder,
  Grid3x3,
  Globe,
  MessageSquare,
  Mail,
  Code,
  Terminal,
  Search,
} from 'lucide-react';

interface App {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const apps: App[] = [
  { id: 'finder', name: 'Finder', icon: Folder, gradient: 'from-blue-500 to-blue-600' },
  { id: 'launchpad', name: 'Launchpad', icon: Grid3x3, gradient: 'from-purple-500 to-purple-600' },
  { id: 'safari', name: 'Safari', icon: Globe, gradient: 'from-cyan-500 to-cyan-600' },
  { id: 'messages', name: 'Messages', icon: MessageSquare, gradient: 'from-green-500 to-green-600' },
  { id: 'mail', name: 'Mail', icon: Mail, gradient: 'from-blue-400 to-blue-500' },
  { id: 'vscode', name: 'VS Code', icon: Code, gradient: 'from-indigo-500 to-indigo-600' },
  { id: 'terminal', name: 'Terminal', icon: Terminal, gradient: 'from-gray-600 to-gray-700' },
];

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (appId: string) => void;
}

export default function Spotlight({ isOpen, onClose, onSelectApp }: SpotlightProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredApps.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredApps.length) % filteredApps.length);
      } else if (e.key === 'Enter' && filteredApps[selectedIndex]) {
        e.preventDefault();
        onSelectApp(filteredApps[selectedIndex].id);
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredApps, selectedIndex, onSelectApp, onClose]);

  const handleAppClick = (appId: string) => {
    onSelectApp(appId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Spotlight Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4 z-[9999] w-full max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search apps..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg"
                />
              </div>

              {/* Results List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredApps.length > 0 ? (
                  <div className="py-2">
                    {filteredApps.map((app, index) => {
                      const Icon = app.icon;
                      const isSelected = index === selectedIndex;

                      return (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                            delay: index * 0.02,
                          }}
                          className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-500/20 dark:bg-blue-400/20'
                              : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                          }`}
                          onClick={() => handleAppClick(app.id)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-md`}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {app.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-gray-400">
                    No apps found
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

