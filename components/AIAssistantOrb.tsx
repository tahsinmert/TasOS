'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export default function AIAssistantOrb() {
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [audioLevel, setAudioLevel] = useState(0);
  const orbRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const addWindow = useSystemStore((state) => state.addWindow);
  const windows = useSystemStore((state) => state.windows);
  const minimizeWindow = useSystemStore((state) => state.minimizeWindow);
  const setTheme = useSystemStore((state) => state.setTheme);
  const theme = useSystemStore((state) => state.theme);

  // Initialize position on mount (bottom right corner)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('orbPosition');
      if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        setPosition({ x, y });
      } else {
        // Default to bottom right corner
        setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
      }
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('orbPosition', JSON.stringify(position));
    }
  }, [position]);

  const handleVoiceCommand = useCallback((command: string) => {
    console.log('Voice command received:', command);

    // Open Safari
    if (command.includes('open safari')) {
      const safariExists = windows.some((w) => w.id === 'safari');
      if (!safariExists) {
        addWindow({
          id: 'safari',
          title: 'Safari',
          position: { x: 100, y: 100 },
          size: { width: 1200, height: 800 },
        });
      }
      setIsExpanded(false);
      setIsListening(false);
      return;
    }

    // Close all windows
    if (command.includes('close all windows') || command.includes('close all')) {
      windows.forEach((window) => {
        minimizeWindow(window.id);
      });
      setIsExpanded(false);
      setIsListening(false);
      return;
    }

    // Turn on Dark Mode / Turn off Dark Mode
    if (command.includes('turn on dark mode') || command.includes('enable dark mode')) {
      setTheme('dark');
      setIsExpanded(false);
      setIsListening(false);
      return;
    }

    if (command.includes('turn off dark mode') || command.includes('disable dark mode') || command.includes('turn on light mode')) {
      setTheme('light');
      setIsExpanded(false);
      setIsListening(false);
      return;
    }

    // Command not recognized
    setIsError(true);
    setTimeout(() => setIsError(false), 2000);
  }, [windows, addWindow, minimizeWindow, setTheme]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.resultIndex];
      const transcript = lastResult[0].transcript.toLowerCase().trim();

      handleVoiceCommand(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // These are expected errors, don't show error state
        return;
      }
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart recognition if still listening
        try {
          recognition.start();
        } catch (e) {
          // Ignore errors when restarting
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
    };
  }, [isListening, handleVoiceCommand]);

  // Initialize Audio Context for volume detection
  useEffect(() => {
    if (!isListening || !isExpanded) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setAudioLevel(0);
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        microphone.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateAudioLevel = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
          setAudioLevel(normalizedLevel);

          if (isListening && isExpanded) {
            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
          }
        };

        updateAudioLevel();
      } catch (error) {
        console.error('Error accessing microphone:', error);
        // Fallback: use mock audio level
        const mockUpdate = () => {
          if (isListening && isExpanded) {
            setAudioLevel(Math.random() * 0.5 + 0.3);
            animationFrameRef.current = requestAnimationFrame(mockUpdate);
          }
        };
        mockUpdate();
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isListening, isExpanded]);

  const handleClick = () => {
    if (isDragging) return;

    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        setIsListening(true);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error starting recognition:', e);
          }
        }
      }, 300);
    } else {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsExpanded(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!orbRef.current) return;
    const rect = orbRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, handleMouseMove, handleMouseUp]);

  // Calculate pulse scale based on audio level
  const pulseScale = isExpanded && isListening ? 1 + audioLevel * 0.3 : 1;

  return (
    <motion.div
      ref={orbRef}
      className="fixed z-50 cursor-pointer select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      animate={{
        scale: isExpanded ? 2 : pulseScale,
        opacity: 1,
      }}
      transition={{
        scale: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        },
      }}
    >
      <div className="relative">
        {/* Main Orb */}
        <motion.div
          className={`w-16 h-16 rounded-full ${
            isError
              ? 'bg-gradient-to-br from-red-500 to-red-700'
              : isListening
              ? 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600'
          } shadow-2xl`}
          animate={{
            boxShadow: isListening
              ? [
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 40px rgba(147, 51, 234, 0.7)',
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                ]
              : isError
              ? ['0 0 30px rgba(239, 68, 68, 0.8)']
              : ['0 0 20px rgba(59, 130, 246, 0.4)'],
          }}
          transition={{
            duration: isListening ? 1 : 0.3,
            repeat: isListening ? Infinity : 0,
            ease: 'easeInOut',
          }}
          style={{
            filter: 'blur(0.5px)',
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-full opacity-60"
            style={{
              background: isError
                ? 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 70%)'
                : 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), transparent 70%)',
            }}
          />
        </motion.div>

        {/* Listening indicator rings */}
        <AnimatePresence>
          {isListening && isExpanded && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-blue-400/50"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{
                    scale: 1 + (i + 1) * 0.5 + audioLevel * 0.3,
                    opacity: [0.8, 0.4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Expanded listening state indicator */}
        {isExpanded && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">
              {isListening ? '🎤 Listening...' : 'Click to listen'}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

