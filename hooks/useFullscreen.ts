'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Cross-browser fullscreen hook that handles:
 * - Safari (webkitRequestFullscreen)
 * - Firefox (mozRequestFullScreen)
 * - Chrome/Edge (standard API)
 * - State tracking via fullscreenchange event
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if fullscreen is currently active
  const checkFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return false;

    const doc = document as any;
    return !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
  }, []);

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;

    const element = document.documentElement;
    const doc = element as any;

    try {
      if (doc.requestFullscreen) {
        await doc.requestFullscreen();
      } else if (doc.webkitRequestFullscreen) {
        // Safari
        await doc.webkitRequestFullscreen();
      } else if (doc.mozRequestFullScreen) {
        // Firefox
        await doc.mozRequestFullScreen();
      } else if (doc.msRequestFullscreen) {
        // IE/Edge
        await doc.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error);
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;

    const doc = document as any;

    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        // Safari
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        // Firefox
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        // IE/Edge
        await doc.msExitFullscreen();
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (checkFullscreen()) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [checkFullscreen, enterFullscreen, exitFullscreen]);

  // Listen to fullscreen change events
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFullscreenChange = () => {
      setIsFullscreen(checkFullscreen());
    };

    // Listen to all possible fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Initial check
    setIsFullscreen(checkFullscreen());

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [checkFullscreen]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}

