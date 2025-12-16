'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';

type FilterType = 'normal' | 'sepia' | 'grayscale' | 'thermal' | 'xray' | 'bulge';

interface Filter {
  id: FilterType;
  name: string;
  cssFilter: string;
}

const filters: Filter[] = [
  { id: 'normal', name: 'Normal', cssFilter: 'none' },
  { id: 'sepia', name: 'Sepia', cssFilter: 'sepia(100%)' },
  { id: 'grayscale', name: 'Gri', cssFilter: 'grayscale(100%)' },
  { id: 'thermal', name: 'Termal', cssFilter: 'contrast(150%) saturate(200%) hue-rotate(0deg) brightness(1.2)' },
  { id: 'xray', name: 'X-Ray', cssFilter: 'invert(1) contrast(1.5) brightness(1.2)' },
  { id: 'bulge', name: 'Şişkin', cssFilter: 'contrast(120%) saturate(150%)' },
];

export default function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showPolaroid, setShowPolaroid] = useState(false);
  const addDesktopItem = useSystemStore((state) => state.addDesktopItem);
  const desktopItems = useSystemStore((state) => state.desktopItems);

  // Photos klasörünü kontrol et ve oluştur
  useEffect(() => {
    const photosFolder = desktopItems.find(item => item.name === 'Photos' && item.type === 'folder');
    if (!photosFolder) {
      addDesktopItem({
        name: 'Photos',
        type: 'folder',
        position: { x: 200, y: 100 },
      });
    }
  }, [desktopItems, addDesktopItem]);

  // Webcam'i başlat
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Kamera erişim hatası:', err);
      setError('Kamera erişimi reddedildi veya kullanılamıyor.');
      setIsStreaming(false);
    }
  }, []);

  // Webcam'i durdur
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Component mount olduğunda kamerayı başlat
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Fotoğraf çekme
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    setCountdown(3);

    // 3-2-1 geri sayım
    for (let i = 3; i > 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(i - 1);
    }

    setCountdown(null);
    
    // Flash efekti
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    // Canvas'a çiz
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Seçili filtreyi uygula
      ctx.filter = filters.find(f => f.id === selectedFilter)?.cssFilter || 'none';
      ctx.drawImage(video, 0, 0);
      
      // Fotoğrafı base64 olarak al
      const photoDataUrl = canvas.toDataURL('image/png');
      setCapturedPhoto(photoDataUrl);
      
      // Polaroid animasyonu göster
      setShowPolaroid(true);
      
      // Fotoğrafı Desktop'a kaydet
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const photoName = `Photo-${timestamp}.png`;
      
      // Desktop'a fotoğraf ekle (simüle edilmiş - gerçek dosya sistemi yok)
      // Burada sadece görsel olarak ekliyoruz
      setTimeout(() => {
        addDesktopItem({
          name: photoName,
          type: 'file',
          position: { 
            x: 300 + Math.random() * 100, 
            y: 150 + Math.random() * 100 
          },
        });
      }, 2000);
    }

    setIsCapturing(false);
  }, [selectedFilter, isCapturing, addDesktopItem]);

  // Polaroid animasyonunu kapat
  useEffect(() => {
    if (showPolaroid) {
      const timer = setTimeout(() => {
        setShowPolaroid(false);
        setCapturedPhoto(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPolaroid]);

  const currentFilter = filters.find(f => f.id === selectedFilter);

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col relative overflow-hidden">
      {/* Retro Frame */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Video Container with Retro Frame */}
        <div className="relative w-full h-full max-w-4xl max-h-[600px] bg-black rounded-lg shadow-2xl border-8 border-gray-700 overflow-hidden">
          {/* Flash Overlay */}
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-white z-50 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Countdown Overlay */}
          <AnimatePresence>
            {countdown !== null && countdown > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-40 bg-black/50"
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  className="text-white text-9xl font-bold drop-shadow-2xl"
                >
                  {countdown}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Feed */}
          {isStreaming ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{
                filter: currentFilter?.cssFilter || 'none',
                transform: selectedFilter === 'bulge' ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ) : error ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-8">
              <div className="text-6xl mb-4">📷</div>
              <div className="text-xl font-semibold mb-2">Kamera Devre Dışı</div>
              <div className="text-sm text-gray-400 text-center max-w-md">
                {error}
              </div>
              <button
                onClick={startCamera}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-4xl animate-pulse">Kamera yükleniyor...</div>
            </div>
          )}

          {/* Hidden Canvas for Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Polaroid Animation */}
        <AnimatePresence>
          {showPolaroid && capturedPhoto && (
            <motion.div
              initial={{ 
                scale: 0,
                rotate: -180,
                x: 0,
                y: 0,
              }}
              animate={{ 
                scale: 1,
                rotate: [0, -10, 10, -5, 0],
                x: 400,
                y: -200,
              }}
              exit={{ 
                scale: 0,
                rotate: 180,
                opacity: 0,
              }}
              transition={{ 
                duration: 1.5,
                ease: "easeOut"
              }}
              className="absolute z-[100] pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
              }}
            >
              <div className="bg-white p-4 shadow-2xl rounded-sm">
                <img 
                  src={capturedPhoto} 
                  alt="Captured" 
                  className="w-64 h-48 object-cover"
                />
                <div className="h-16 bg-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Strip */}
      <div className="bg-gray-900/90 backdrop-blur-xl border-t border-gray-700 p-4">
        <div className="flex gap-3 justify-center overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all ${
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="text-xs font-medium">{filter.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Camera Button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <motion.button
          onClick={capturePhoto}
          disabled={!isStreaming || isCapturing}
          className={`w-20 h-20 rounded-full ${
            isStreaming && !isCapturing
              ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
              : 'bg-gray-600 cursor-not-allowed'
          } shadow-2xl flex items-center justify-center transition-colors`}
          whileHover={isStreaming && !isCapturing ? { scale: 1.1 } : {}}
          whileTap={isStreaming && !isCapturing ? { scale: 0.95 } : {}}
        >
          <Camera className="w-10 h-10 text-white" />
        </motion.button>
      </div>
    </div>
  );
}

