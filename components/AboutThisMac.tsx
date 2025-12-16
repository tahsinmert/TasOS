'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import ContactCard from './ContactCard';

interface AboutThisMacProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutThisMac({ isOpen, onClose }: AboutThisMacProps) {
  const [contactCardOpen, setContactCardOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  About This Mac
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content - Split Layout */}
              <div className="p-8">
                <div className="flex items-start gap-8">
                  {/* Left Side - Laptop Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 flex items-center justify-center">
                      <svg
                        width="128"
                        height="128"
                        viewBox="0 0 128 128"
                        fill="none"
                        className="text-gray-900 dark:text-gray-100"
                      >
                        {/* Laptop Icon */}
                        <rect
                          x="16"
                          y="24"
                          width="96"
                          height="64"
                          rx="4"
                          fill="currentColor"
                          opacity="0.1"
                        />
                        <rect
                          x="20"
                          y="28"
                          width="88"
                          height="56"
                          rx="2"
                          fill="currentColor"
                          opacity="0.2"
                        />
                        <rect
                          x="24"
                          y="32"
                          width="80"
                          height="48"
                          rx="2"
                          fill="currentColor"
                        />
                        {/* Base */}
                        <rect
                          x="8"
                          y="88"
                          width="112"
                          height="8"
                          rx="2"
                          fill="currentColor"
                          opacity="0.3"
                        />
                        <rect
                          x="56"
                          y="96"
                          width="16"
                          height="4"
                          rx="1"
                          fill="currentColor"
                          opacity="0.5"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Right Side - Details */}
                  <div className="flex-1">
                    {/* Heading */}
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
                      macOS Sequoia
                    </h3>
                    
                    {/* Sub-heading */}
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
                      Version 15.0 (
                      <button
                        onClick={() => setContactCardOpen(true)}
                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                      >
                        Tahsin Mert Mutlu Edition
                      </button>
                      )
                    </p>

                    {/* Chip */}
                    <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
                      Apple M3 Max (Designed by{' '}
                      <button
                        onClick={() => setContactCardOpen(true)}
                        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                      >
                        Tahsin Mert Mutlu
                      </button>
                      )
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm mt-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Memory:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          Unlimited Creativity
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Serial Number:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          TMM-2025-VIBE-CODER
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          // System Report functionality
                          onClose();
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors text-sm font-medium"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
                      >
                        System Report...
                      </button>
                      <button
                        onClick={() => {
                          // Software Update functionality
                          onClose();
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors text-sm font-medium"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
                      >
                        Software Update...
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Card Modal */}
      <ContactCard
        isOpen={contactCardOpen}
        onClose={() => setContactCardOpen(false)}
      />
    </>
  );
}

