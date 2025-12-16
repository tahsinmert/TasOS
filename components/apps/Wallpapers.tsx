'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Image, Upload, Video, Sparkles } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';

type WallpaperType = 'image' | 'video';
type Category = 'Dynamic' | 'Landscapes' | 'Abstract' | 'Solid Colors' | 'My Photos';

interface Wallpaper {
  id: string;
  name: string;
  url: string;
  type: WallpaperType;
  category: Category;
  thumbnail?: string;
}

// Curated Unsplash wallpapers
const WALLPAPERS: Wallpaper[] = [
  // Dynamic (time-based simulation)
  {
    id: 'dynamic-sequoia',
    name: 'Sequoia Dynamic',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Dynamic',
  },
  {
    id: 'dynamic-ventura',
    name: 'Ventura Dynamic',
    url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Dynamic',
  },
  
  // Landscapes
  {
    id: 'landscape-1',
    name: 'Mountain Vista',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Landscapes',
  },
  {
    id: 'landscape-2',
    name: 'Ocean Sunset',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Landscapes',
  },
  {
    id: 'landscape-3',
    name: 'Forest Path',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Landscapes',
  },
  {
    id: 'landscape-4',
    name: 'Desert Dunes',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Landscapes',
  },
  {
    id: 'landscape-5',
    name: 'Alpine Lake',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Landscapes',
  },
  {
    id: 'landscape-6',
    name: 'Coastal Cliffs',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Landscapes',
  },
  
  // Abstract
  {
    id: 'abstract-1',
    name: 'Color Waves',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Abstract',
  },
  {
    id: 'abstract-2',
    name: 'Geometric Patterns',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Abstract',
  },
  {
    id: 'abstract-3',
    name: 'Nebula',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Abstract',
  },
  {
    id: 'abstract-4',
    name: 'Liquid Art',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Abstract',
  },
  {
    id: 'abstract-5',
    name: 'Cosmic',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=3840&auto=format&fit=crop',
    type: 'image',
    category: 'Abstract',
  },
  
  // Solid Colors
  {
    id: 'solid-blue',
    name: 'Ocean Blue',
    url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'image',
    category: 'Solid Colors',
  },
  {
    id: 'solid-purple',
    name: 'Purple Haze',
    url: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'image',
    category: 'Solid Colors',
  },
  {
    id: 'solid-green',
    name: 'Forest Green',
    url: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    type: 'image',
    category: 'Solid Colors',
  },
  {
    id: 'solid-orange',
    name: 'Sunset Orange',
    url: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    type: 'image',
    category: 'Solid Colors',
  },
  {
    id: 'solid-dark',
    name: 'Midnight',
    url: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    type: 'image',
    category: 'Solid Colors',
  },
];

const CATEGORIES: Category[] = ['Dynamic', 'Landscapes', 'Abstract', 'Solid Colors', 'My Photos'];

export default function Wallpapers() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Landscapes');
  const [customWallpapers, setCustomWallpapers] = useState<Wallpaper[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentWallpaperUrl = useSystemStore((state) => state.currentWallpaperUrl);
  const setWallpaper = useSystemStore((state) => state.setWallpaper);
  
  const allWallpapers = [...WALLPAPERS, ...customWallpapers];
  const filteredWallpapers = allWallpapers.filter(
    (wp) => wp.category === selectedCategory
  );
  
  const isSelected = useCallback((wallpaper: Wallpaper) => {
    return currentWallpaperUrl === wallpaper.url;
  }, [currentWallpaperUrl]);
  
  const handleSelectWallpaper = useCallback((wallpaper: Wallpaper) => {
    setWallpaper(wallpaper.url, wallpaper.type);
  }, [setWallpaper]);
  
  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
      alert('Lütfen bir resim veya video dosyası seçin.');
      return;
    }
    
    const blobUrl = URL.createObjectURL(file);
    
    const newWallpaper: Wallpaper = {
      id: `custom-${Date.now()}`,
      name: file.name,
      url: blobUrl,
      type: isVideo ? 'video' : 'image',
      category: 'My Photos',
    };
    
    setCustomWallpapers((prev) => [...prev, newWallpaper]);
    
    // Automatically set as wallpaper
    setWallpaper(blobUrl, newWallpaper.type);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setWallpaper]);
  
  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-56 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
            Kategoriler
          </h2>
          <div className="space-y-1">
            {CATEGORIES.map((category) => {
              const Icon = category === 'Dynamic' ? Sparkles : 
                          category === 'My Photos' ? Image : Image;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500/20 dark:bg-blue-500/30 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category}</span>
                </button>
              );
            })}
          </div>
          
          {/* Upload Button */}
          <button
            onClick={handleUpload}
            className="w-full mt-6 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Fotoğraf Ekle</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      
      {/* Main Content - Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-4 auto-rows-min">
          <AnimatePresence mode="popLayout">
            {filteredWallpapers.map((wallpaper) => {
              const selected = isSelected(wallpaper);
              const isGradient = wallpaper.url.startsWith('linear-gradient');
              
              return (
                <motion.div
                  key={wallpaper.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="relative group cursor-pointer"
                  onClick={() => handleSelectWallpaper(wallpaper)}
                >
                  {/* Thumbnail */}
                  <div
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                      selected
                        ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {wallpaper.type === 'video' ? (
                      <video
                        src={wallpaper.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => {
                          const video = e.currentTarget;
                          video.play().catch(() => {});
                        }}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget;
                          video.pause();
                          video.currentTime = 0;
                        }}
                      />
                    ) : isGradient ? (
                      <div
                        className="w-full h-full"
                        style={{ background: wallpaper.url }}
                      />
                    ) : (
                      <img
                        src={wallpaper.url}
                        alt={wallpaper.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    
                    {/* Video Badge */}
                    {wallpaper.type === 'video' && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
                        <Video className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">Canlı</span>
                      </div>
                    )}
                    
                    {/* Selected Checkmark */}
                    {selected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 bg-blue-500/20 flex items-center justify-center"
                      >
                        <div className="bg-blue-500 rounded-full p-2 shadow-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Hover Overlay */}
                    {!selected && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    )}
                  </div>
                  
                  {/* Name */}
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {wallpaper.name}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Empty State */}
        {filteredWallpapers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Image className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Bu kategoride duvar kağıdı yok</p>
            <p className="text-sm mt-2">Fotoğraf ekleyerek başlayın</p>
          </div>
        )}
      </div>
    </div>
  );
}

