import { create } from 'zustand';

export interface Window {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  savedPosition?: { x: number; y: number };
  savedSize?: { width: number; height: number };
}

export interface DesktopItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  position: { x: number; y: number };
}

interface SystemState {
  // Windows
  windows: Window[];
  maxZIndex: number;
  
  // System settings
  volume: number;
  brightness: number;
  theme: 'light' | 'dark';
  lowPowerMode: boolean;
  
  // Active apps in dock
  activeApps: Set<string>;
  
  // Menu Bar
  activeApp: string;
  controlCenterOpen: boolean;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  airDropEnabled: boolean;
  
  // Dynamic Island
  dynamicIslandState: 'idle' | 'music' | 'airdrop' | 'battery';
  musicPlaying: boolean;
  musicTitle: string;
  musicArtist: string;
  musicAlbumArt: string;
  airDropProgress: number;
  airDropActive: boolean;
  quickActionsOpen: boolean;
  
  // System
  isSleeping: boolean;
  showBootup: boolean;
  launchpadOpen: boolean;
  isFullscreen: boolean;
  
  // Toast notifications
  toastMessage: string;
  toastVisible: boolean;
  
  // Spotlight
  spotlightOpen: boolean;
  
  // Clipboard
  clipboardContent: string;
  
  // Media
  mediaPlaying: boolean;
  mediaTitle: string;
  mediaArtist: string;
  
  // Wallpaper
  wallpapers: string[];
  currentWallpaperIndex: number;
  currentWallpaperType: 'image' | 'video';
  currentWallpaperUrl: string;
  
  // Desktop Items
  desktopItems: DesktopItem[];
  
  // Easter Eggs
  doomUnlocked: boolean;
  
  // Actions
  addWindow: (window: Omit<Window, 'zIndex' | 'minimized' | 'maximized'>) => void;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  bringToFront: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string, viewportSize?: { width: number; height: number }) => void;
  restoreWindow: (id: string) => void;
  setVolume: (volume: number) => void;
  setBrightness: (brightness: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLowPowerMode: (enabled: boolean) => void;
  toggleLowPowerMode: () => void;
  setAppActive: (appId: string, active: boolean) => void;
  setActiveApp: (appName: string) => void;
  toggleControlCenter: () => void;
  setWifiEnabled: (enabled: boolean) => void;
  setBluetoothEnabled: (enabled: boolean) => void;
  setAirDropEnabled: (enabled: boolean) => void;
  setDynamicIslandState: (state: 'idle' | 'music' | 'airdrop' | 'battery') => void;
  setMusicPlaying: (playing: boolean) => void;
  setMusicInfo: (title: string, artist: string, albumArt?: string) => void;
  setAirDropProgress: (progress: number) => void;
  setAirDropActive: (active: boolean) => void;
  toggleQuickActions: () => void;
  setSleeping: (sleeping: boolean) => void;
  setShowBootup: (show: boolean) => void;
  setLaunchpadOpen: (open: boolean) => void;
  toggleLaunchpad: () => void;
  restart: () => void;
  shutDown: () => void;
  changeWallpaper: () => void;
  setWallpaper: (url: string, type: 'image' | 'video') => void;
  addDesktopItem: (item: Omit<DesktopItem, 'id'>) => void;
  cleanUpDesktop: () => void;
  sortDesktopBy: (sortBy: 'name' | 'date' | 'size') => void;
  setDoomUnlocked: (unlocked: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  toggleFullscreen: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  setSpotlightOpen: (open: boolean) => void;
  toggleSpotlight: () => void;
  setClipboardContent: (content: string) => void;
  setMediaPlaying: (playing: boolean) => void;
  setMediaInfo: (title: string, artist: string) => void;
}

// High-quality macOS wallpapers
const MACOS_WALLPAPERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3840&auto=format&fit=crop', // Sequoia-like
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=3840&auto=format&fit=crop', // Ventura-like
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=3840&auto=format&fit=crop', // Monterey-like
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=3840&auto=format&fit=crop', // Big Sur-like
];

export const useSystemStore = create<SystemState>((set) => ({
  // Initial state
  windows: [],
  maxZIndex: 0,
  volume: 50,
  brightness: 100,
  theme: 'dark',
  lowPowerMode: false,
  activeApps: new Set<string>(),
  activeApp: 'Finder',
  controlCenterOpen: false,
  wifiEnabled: true,
  bluetoothEnabled: true,
  airDropEnabled: false,
  dynamicIslandState: 'idle',
  musicPlaying: false,
  musicTitle: '',
  musicArtist: '',
  musicAlbumArt: '',
  airDropProgress: 0,
  airDropActive: false,
  quickActionsOpen: false,
  isSleeping: false,
  showBootup: false,
  launchpadOpen: false,
  isFullscreen: false,
  toastMessage: '',
  toastVisible: false,
  spotlightOpen: false,
  clipboardContent: '',
  mediaPlaying: false,
  mediaTitle: '',
  mediaArtist: '',
  wallpapers: MACOS_WALLPAPERS,
  currentWallpaperIndex: 0,
  currentWallpaperType: 'image',
  currentWallpaperUrl: MACOS_WALLPAPERS[0],
  desktopItems: [
    {
      id: 'readme-txt',
      name: 'README.txt',
      type: 'file',
      position: { x: 50, y: 100 },
    },
  ],
  doomUnlocked: false,
  
  // Actions
  addWindow: (window) => {
    set((state) => {
      const newZIndex = state.maxZIndex + 1;
      return {
        windows: [
          ...state.windows,
          {
            ...window,
            zIndex: newZIndex,
            minimized: false,
            maximized: false,
          },
        ],
        maxZIndex: newZIndex,
      };
    });
  },
  
  removeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    }));
  },
  
  updateWindow: (id, updates) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
  },
  
  bringToFront: (id) => {
    set((state) => {
      const newZIndex = state.maxZIndex + 1;
      return {
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, zIndex: newZIndex } : w
        ),
        maxZIndex: newZIndex,
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w
      ),
    }));
  },

  maximizeWindow: (id, viewportSize?: { width: number; height: number }) => {
    set((state) => {
      const window = state.windows.find((w) => w.id === id);
      if (!window || window.maximized) return state;

      const maxSize = viewportSize || { width: 1920, height: 1080 };

      return {
        windows: state.windows.map((w) =>
          w.id === id
            ? {
                ...w,
                maximized: true,
                savedPosition: { ...w.position },
                savedSize: { ...w.size },
                position: { x: 0, y: 0 },
                size: maxSize,
              }
            : w
        ),
      };
    });
  },

  restoreWindow: (id) => {
    set((state) => {
      const window = state.windows.find((w) => w.id === id);
      if (!window) return state;

      return {
        windows: state.windows.map((w) =>
          w.id === id
            ? {
                ...w,
                minimized: false,
                maximized: false,
                position: w.savedPosition || w.position,
                size: w.savedSize || w.size,
                savedPosition: undefined,
                savedSize: undefined,
              }
            : w
        ),
      };
    });
  },
  
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)) }),
  setBrightness: (brightness) => set({ brightness: Math.max(0, Math.min(100, brightness)) }),
  setTheme: (theme) => set({ theme }),
  setLowPowerMode: (enabled) => set({ lowPowerMode: enabled }),
  toggleLowPowerMode: () => set((state) => ({ lowPowerMode: !state.lowPowerMode })),
  setAppActive: (appId, active) =>
    set((state) => {
      const newActiveApps = new Set(state.activeApps);
      if (active) {
        newActiveApps.add(appId);
      } else {
        newActiveApps.delete(appId);
      }
      return { activeApps: newActiveApps };
    }),
  setActiveApp: (appName) => set({ activeApp: appName }),
  toggleControlCenter: () => set((state) => ({ controlCenterOpen: !state.controlCenterOpen })),
  setWifiEnabled: (enabled) => set({ wifiEnabled: enabled }),
  setBluetoothEnabled: (enabled) => set({ bluetoothEnabled: enabled }),
  setAirDropEnabled: (enabled) => set({ airDropEnabled: enabled }),
  setDynamicIslandState: (state) => set({ dynamicIslandState: state }),
  setMusicPlaying: (playing) => set({ musicPlaying: playing }),
  setMusicInfo: (title, artist, albumArt = '') => set({ musicTitle: title, musicArtist: artist, musicAlbumArt: albumArt }),
  setAirDropProgress: (progress) => set({ airDropProgress: progress }),
  setAirDropActive: (active) => set({ airDropActive: active }),
  toggleQuickActions: () => set((state) => ({ quickActionsOpen: !state.quickActionsOpen })),
  setSleeping: (sleeping) => set({ isSleeping: sleeping }),
  setShowBootup: (show) => set({ showBootup: show }),
  setLaunchpadOpen: (open) => set({ launchpadOpen: open }),
  toggleLaunchpad: () => set((state) => ({ launchpadOpen: !state.launchpadOpen })),
  restart: () => {
    set({ showBootup: true, isSleeping: false });
    // Reset after boot animation completes
    setTimeout(() => {
      set({ showBootup: false });
    }, 3000);
  },
  shutDown: () => {
    set({ showBootup: true, isSleeping: false });
    // Keep bootup screen for shutdown
  },
  changeWallpaper: () => {
    set((state) => ({
      currentWallpaperIndex: (state.currentWallpaperIndex + 1) % state.wallpapers.length,
      currentWallpaperUrl: state.wallpapers[(state.currentWallpaperIndex + 1) % state.wallpapers.length],
      currentWallpaperType: 'image',
    }));
  },
  setWallpaper: (url, type) => {
    set((state) => {
      // Check if wallpaper already exists in the list
      const existingIndex = state.wallpapers.indexOf(url);
      let newWallpapers = state.wallpapers;
      let newIndex = state.currentWallpaperIndex;
      
      if (existingIndex >= 0) {
        // Wallpaper exists, use its index
        newIndex = existingIndex;
      } else {
        // Add new wallpaper to the list
        newWallpapers = [...state.wallpapers, url];
        newIndex = newWallpapers.length - 1;
      }
      
      return {
        currentWallpaperUrl: url,
        currentWallpaperType: type,
        wallpapers: newWallpapers,
        currentWallpaperIndex: newIndex,
      };
    });
  },
  addDesktopItem: (item) => {
    set((state) => ({
      desktopItems: [
        ...state.desktopItems,
        {
          ...item,
          id: `desktop-item-${Date.now()}-${Math.random()}`,
        },
      ],
    }));
  },
  cleanUpDesktop: () => {
    set((state) => {
      // Reset positions to a grid layout
      const itemsPerRow = Math.ceil(Math.sqrt(state.desktopItems.length));
      const spacing = 120;
      const startX = 50;
      const startY = 100;
      
      return {
        desktopItems: state.desktopItems.map((item, index) => {
          const row = Math.floor(index / itemsPerRow);
          const col = index % itemsPerRow;
          return {
            ...item,
            position: {
              x: startX + col * spacing,
              y: startY + row * spacing,
            },
          };
        }),
      };
    });
  },
  sortDesktopBy: (sortBy) => {
    set((state) => {
      const sorted = [...state.desktopItems];
      
      if (sortBy === 'name') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'date') {
        // Sort by ID (timestamp) - newer items first
        sorted.sort((a, b) => b.id.localeCompare(a.id));
      } else if (sortBy === 'size') {
        // Sort by type (folders first), then name
        sorted.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
      }
      
      // Rearrange positions after sorting
      const itemsPerRow = Math.ceil(Math.sqrt(sorted.length));
      const spacing = 120;
      const startX = 50;
      const startY = 100;
      
      return {
        desktopItems: sorted.map((item, index) => {
          const row = Math.floor(index / itemsPerRow);
          const col = index % itemsPerRow;
          return {
            ...item,
            position: {
              x: startX + col * spacing,
              y: startY + row * spacing,
            },
          };
        }),
      };
    });
  },
  setDoomUnlocked: (unlocked) => set({ doomUnlocked: unlocked }),
  setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  showToast: (message) => set({ toastMessage: message, toastVisible: true }),
  hideToast: () => set({ toastVisible: false }),
  setSpotlightOpen: (open) => set({ spotlightOpen: open }),
  toggleSpotlight: () => set((state) => ({ spotlightOpen: !state.spotlightOpen })),
  setClipboardContent: (content) => set({ clipboardContent: content }),
  setMediaPlaying: (playing) => set({ mediaPlaying: playing }),
  setMediaInfo: (title, artist) => set({ mediaTitle: title, mediaArtist: artist }),
}));

