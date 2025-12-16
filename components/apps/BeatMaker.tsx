'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';

interface BeatMakerProps {
  onClose?: () => void;
}

const STEPS = 16;
const BPM = 120;

// Klavye tuşları ve notaları
const KEYBOARD_MAP: { [key: string]: string } = {
  'a': 'C4',
  'w': 'C#4',
  's': 'D4',
  'e': 'D#4',
  'd': 'E4',
  'f': 'F4',
  't': 'F#4',
  'g': 'G4',
  'y': 'G#4',
  'h': 'A4',
  'u': 'A#4',
  'j': 'B4',
  'k': 'C5',
};

const DRUM_SAMPLES = {
  kick: 'https://tonejs.github.io/audio/drum-samples/kick.mp3',
  snare: 'https://tonejs.github.io/audio/drum-samples/snare.mp3',
  hihat: 'https://tonejs.github.io/audio/drum-samples/hihat.mp3',
  clap: 'https://tonejs.github.io/audio/drum-samples/clap.mp3',
};

export default function BeatMaker({ onClose }: BeatMakerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [beats, setBeats] = useState<{ [key: string]: boolean[] }>({
    kick: new Array(STEPS).fill(false),
    snare: new Array(STEPS).fill(false),
    hihat: new Array(STEPS).fill(false),
    clap: new Array(STEPS).fill(false),
  });
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  
  const sequencerRef = useRef<number | null>(null);
  const playersRef = useRef<{ [key: string]: Tone.Player | null }>({});
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Audio context başlatma
  useEffect(() => {
    const initAudio = async () => {
      await Tone.start();
      
      // Drum samples yükleme
      const players: { [key: string]: Tone.Player } = {};
      for (const [name, url] of Object.entries(DRUM_SAMPLES)) {
        players[name] = new Tone.Player(url).toDestination();
        await players[name].load(url);
      }
      playersRef.current = players;

      // Synthesizer oluştur
      synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();

      // Analyser oluştur (visualizer için)
      analyserRef.current = new Tone.Analyser('fft', 256);
      synthRef.current.connect(analyserRef.current);
      
      // Players'ı da analyser'a bağla
      Object.values(players).forEach(player => {
        player.connect(analyserRef.current!);
      });
    };

    initAudio();

    return () => {
      if (sequencerRef.current) {
        clearInterval(sequencerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      Object.values(playersRef.current).forEach(player => player?.dispose());
      synthRef.current?.dispose();
      analyserRef.current?.dispose();
    };
  }, []);

  // Visualizer animasyonu
  useEffect(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !ctx) return;

      const values = analyserRef.current.getValue() as Float32Array;
      const width = canvas.width;
      const height = canvas.height;

      // Karanlık arka plan
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Frekans çubukları
      const barCount = 64;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * values.length);
        const magnitude = Math.abs(values[dataIndex]) * 2;
        const barHeight = Math.min(magnitude * height * 0.5, height * 0.9);

        // Cyberpunk gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(0.5, '#00ccff');
        gradient.addColorStop(1, '#ff00ff');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);

        // Glow efekti
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff88';
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
        ctx.shadowBlur = 0;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Step sequencer
  useEffect(() => {
    if (!isPlaying) {
      if (sequencerRef.current) {
        clearInterval(sequencerRef.current);
        sequencerRef.current = null;
      }
      setCurrentStep(0);
      return;
    }

    Tone.Transport.bpm.value = BPM;
    Tone.Transport.start();

    const stepInterval = (60 / BPM / 4) * 1000; // 16th note interval

    sequencerRef.current = window.setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % STEPS;

        // Beat çal
        Object.entries(beats).forEach(([drum, pattern]) => {
          if (pattern[nextStep] && playersRef.current[drum]) {
            playersRef.current[drum]?.start();
          }
        });

        return nextStep;
      });
    }, stepInterval);

    return () => {
      if (sequencerRef.current) {
        clearInterval(sequencerRef.current);
      }
    };
  }, [isPlaying, beats]);

  // Klavye tuşları ile notalar çalma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEYBOARD_MAP[key] && !pressedKeys.has(key)) {
        setPressedKeys(prev => new Set(prev).add(key));
        const note = KEYBOARD_MAP[key];
        synthRef.current?.triggerAttack(note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEYBOARD_MAP[key]) {
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
        const note = KEYBOARD_MAP[key];
        synthRef.current?.triggerRelease(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys]);

  const toggleBeat = (drum: string, step: number) => {
    setBeats(prev => ({
      ...prev,
      [drum]: prev[drum].map((active, i) => (i === step ? !active : active)),
    }));
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const clearAll = () => {
    setBeats({
      kick: new Array(STEPS).fill(false),
      snare: new Array(STEPS).fill(false),
      hihat: new Array(STEPS).fill(false),
      clap: new Array(STEPS).fill(false),
    });
  };

  const playNote = (note: string) => {
    synthRef.current?.triggerAttackRelease(note, '8n');
  };

  const drumColors: { [key: string]: string } = {
    kick: '#ff0066',
    snare: '#00ff88',
    hihat: '#00ccff',
    clap: '#ff00ff',
  };

  const drumLabels: { [key: string]: string } = {
    kick: 'Kick',
    snare: 'Snare',
    hihat: 'Hi-Hat',
    clap: 'Clap',
  };

  const pianoKeys = [
    { note: 'C4', key: 'A', isBlack: false },
    { note: 'C#4', key: 'W', isBlack: true },
    { note: 'D4', key: 'S', isBlack: false },
    { note: 'D#4', key: 'E', isBlack: true },
    { note: 'E4', key: 'D', isBlack: false },
    { note: 'F4', key: 'F', isBlack: false },
    { note: 'F#4', key: 'T', isBlack: true },
    { note: 'G4', key: 'G', isBlack: false },
    { note: 'G#4', key: 'Y', isBlack: true },
    { note: 'A4', key: 'H', isBlack: false },
    { note: 'A#4', key: 'U', isBlack: true },
    { note: 'B4', key: 'J', isBlack: false },
    { note: 'C5', key: 'K', isBlack: false },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e] text-white overflow-hidden">
      {/* Visualizer */}
      <div className="h-32 bg-black border-b border-cyan-500/20">
        <canvas
          ref={canvasRef}
          width={800}
          height={128}
          className="w-full h-full"
        />
      </div>

      {/* Kontroller */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
                : 'bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/50'
            }`}
          >
            {isPlaying ? '⏸ Stop' : '▶ Play'}
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
          >
            Clear All
          </button>
          <div className="text-sm text-gray-400">
            BPM: {BPM}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
          >
            ✕
          </button>
        )}
      </div>

      {/* Step Sequencer */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {Object.entries(beats).map(([drum, pattern]) => (
            <div key={drum} className="flex items-center gap-4">
              <div
                className="w-20 text-sm font-semibold text-center"
                style={{ color: drumColors[drum] }}
              >
                {drumLabels[drum]}
              </div>
              <div className="flex gap-2 flex-1">
                {pattern.map((active, step) => (
                  <button
                    key={step}
                    onClick={() => toggleBeat(drum, step)}
                    className={`flex-1 h-16 rounded-lg transition-all ${
                      active
                        ? `shadow-lg ${step === currentStep ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]' : ''}`
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    style={{
                      backgroundColor: active
                        ? drumColors[drum]
                        : undefined,
                      boxShadow: active
                        ? `0 0 20px ${drumColors[drum]}80`
                        : undefined,
                      transform: step === currentStep && isPlaying ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Piyano Klavyesi */}
      <div className="border-t border-cyan-500/20 p-4 bg-[#0a0a0f]">
        <div className="text-xs text-gray-400 mb-2 text-center">
          Klavye ile çal: A S D F G H J K (W E T Y U için diyezler)
        </div>
        <div className="flex justify-center items-end gap-1 h-24">
          {pianoKeys.map((key) => {
            if (key.isBlack) {
              return (
                <button
                  key={key.note}
                  onClick={() => playNote(key.note)}
                  onMouseDown={() => {
                    setPressedKeys(prev => new Set(prev).add(key.key.toLowerCase()));
                    synthRef.current?.triggerAttack(key.note);
                  }}
                  onMouseUp={() => {
                    setPressedKeys(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(key.key.toLowerCase());
                      return newSet;
                    });
                    synthRef.current?.triggerRelease(key.note);
                  }}
                  className={`relative z-10 w-8 h-16 bg-gray-900 border border-gray-700 rounded-b-lg hover:bg-gray-800 transition-all ${
                    pressedKeys.has(key.key.toLowerCase())
                      ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50'
                      : ''
                  }`}
                  style={{
                    marginLeft: '-12px',
                    marginRight: '-12px',
                  }}
                >
                  <span className="text-[8px] text-gray-500 absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    {key.key}
                  </span>
                </button>
              );
            }
            return (
              <button
                key={key.note}
                onClick={() => playNote(key.note)}
                onMouseDown={() => {
                  setPressedKeys(prev => new Set(prev).add(key.key.toLowerCase()));
                  synthRef.current?.triggerAttack(key.note);
                }}
                onMouseUp={() => {
                  setPressedKeys(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(key.key.toLowerCase());
                    return newSet;
                  });
                  synthRef.current?.triggerRelease(key.note);
                }}
                className={`w-12 h-24 bg-white border border-gray-300 rounded-b-lg hover:bg-gray-100 transition-all flex items-end justify-center pb-2 ${
                  pressedKeys.has(key.key.toLowerCase())
                    ? 'bg-cyan-200 shadow-lg shadow-cyan-500/50'
                    : ''
                }`}
              >
                <span className="text-xs text-gray-600 font-semibold">
                  {key.key}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

