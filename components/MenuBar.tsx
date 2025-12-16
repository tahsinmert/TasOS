'use client';

import { useState, useEffect, useRef } from 'react';
import { useSystemStore } from '@/store/useSystemStore';
import {
  BatteryFull,
  Battery,
  BatteryCharging,
  Wifi,
  Search,
  LayoutGrid,
  Power,
  RotateCcw,
  Moon,
  Copy,
  Scissors,
  Clipboard,
  FolderPlus,
  Minus,
  Square,
  X,
  Maximize2,
  Minimize2,
  HelpCircle,
  Settings,
  Eye,
  EyeOff,
  Sidebar,
} from 'lucide-react';
import { format } from 'date-fns';
import ControlCenter from './ControlCenter';
import MenuDropdown from './MenuDropdown';
import AboutThisMac from './AboutThisMac';
import Toast from './Toast';
import DynamicIsland from './DynamicIsland';
import { useBattery } from '@/hooks/useBattery';
import { useResponsive } from '@/hooks/useResponsive';

export default function MenuBar() {
  const { isMobile } = useResponsive();
  const {
    activeApp,
    toggleControlCenter,
    controlCenterOpen,
    wifiEnabled,
    setWifiEnabled,
    setSleeping,
    restart,
    shutDown,
    windows,
    addWindow,
    removeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    bringToFront,
    toggleSpotlight,
    clipboardContent,
    setClipboardContent,
    showToast: showSystemToast,
  } = useSystemStore();

  const [appleMenuOpen, setAppleMenuOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [windowMenuOpen, setWindowMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aboutMacOpen, setAboutMacOpen] = useState(false);
  const [viewOptions, setViewOptions] = useState({
    showToolbar: true,
    showSidebar: true,
  });

  const battery = useBattery();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const handleSleep = () => {
    setSleeping(true);
    setAppleMenuOpen(false);
    // Wake up after 3 seconds (or on click)
    setTimeout(() => {
      setSleeping(false);
    }, 3000);
  };

  const handleRestart = () => {
    setAppleMenuOpen(false);
    restart();
  };

  const handleShutDown = () => {
    setAppleMenuOpen(false);
    shutDown();
  };

  const appleMenuItems = [
    {
      label: 'About This Mac',
      onClick: () => {
        setAboutMacOpen(true);
        setAppleMenuOpen(false);
      },
    },
    { separator: true },
    {
      label: 'Sleep',
      icon: <Moon size={14} />,
      onClick: handleSleep,
    },
    {
      label: 'Restart...',
      icon: <RotateCcw size={14} />,
      onClick: handleRestart,
    },
    {
      label: 'Shut Down...',
      icon: <Power size={14} />,
      onClick: handleShutDown,
    },
  ];

  const handleNewWindow = () => {
    const activeWindow = windows
      .filter((w) => !w.minimized)
      .sort((a, b) => b.zIndex - a.zIndex)[0];
    
    if (activeWindow) {
      addWindow({
        id: `${activeApp}-${Date.now()}`,
        title: `${activeApp} - Yeni Pencere`,
        position: {
          x: activeWindow.position.x + 30,
          y: activeWindow.position.y + 30,
        },
        size: activeWindow.size,
      });
      showSystemToast('Yeni pencere açıldı');
    } else {
      addWindow({
        id: `${activeApp}-${Date.now()}`,
        title: `${activeApp} - Yeni Pencere`,
        position: { x: 200, y: 100 },
        size: { width: 800, height: 600 },
      });
      showSystemToast('Yeni pencere açıldı');
    }
    setFileMenuOpen(false);
  };

  const handleCloseWindow = () => {
    const activeWindow = windows
      .filter((w) => !w.minimized)
      .sort((a, b) => b.zIndex - a.zIndex)[0];
    
    if (activeWindow) {
      removeWindow(activeWindow.id);
      showSystemToast('Pencere kapatıldı');
    } else {
      showSystemToast('Kapatılacak pencere bulunamadı');
    }
    setFileMenuOpen(false);
  };

  const fileMenuItems = [
    {
      label: 'New Window',
      icon: <FolderPlus size={14} />,
      onClick: handleNewWindow,
    },
    {
      label: 'New Tab',
      onClick: () => {
        showSystemToast('Yeni sekme özelliği yakında eklenecek');
        setFileMenuOpen(false);
      },
    },
    { separator: true },
    {
      label: 'Close Window',
      onClick: handleCloseWindow,
    },
  ];

  const handleCopy = async () => {
    try {
      const selectedText = window.getSelection()?.toString() || '';
      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        setClipboardContent(selectedText);
        showSystemToast('Panoya kopyalandı');
      } else {
        showSystemToast('Kopyalanacak metin seçilmedi');
      }
    } catch (err) {
      // Fallback for browsers without clipboard API
      const selectedText = window.getSelection()?.toString() || '';
      if (selectedText) {
        setClipboardContent(selectedText);
        showSystemToast('Panoya kopyalandı (tarayıcı API\'si kullanılamadı)');
      } else {
        showSystemToast('Kopyalanacak metin seçilmedi');
      }
    }
    setEditMenuOpen(false);
  };

  const handleCut = async () => {
    try {
      const selectedText = window.getSelection()?.toString() || '';
      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        setClipboardContent(selectedText);
        // Remove selected text from active element if it's an input/textarea
        const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          const start = activeElement.selectionStart || 0;
          const end = activeElement.selectionEnd || 0;
          const value = activeElement.value;
          activeElement.value = value.substring(0, start) + value.substring(end);
          activeElement.setSelectionRange(start, start);
        }
        showSystemToast('Kesildi ve panoya kopyalandı');
      } else {
        showSystemToast('Kesilecek metin seçilmedi');
      }
    } catch (err) {
      const selectedText = window.getSelection()?.toString() || '';
      if (selectedText) {
        setClipboardContent(selectedText);
        showSystemToast('Kesildi ve panoya kopyalandı (tarayıcı API\'si kullanılamadı)');
      } else {
        showSystemToast('Kesilecek metin seçilmedi');
      }
    }
    setEditMenuOpen(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardContent(text);
      // Paste into active element if it's an input/textarea
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;
        const value = activeElement.value;
        activeElement.value = value.substring(0, start) + text + value.substring(end);
        activeElement.setSelectionRange(start + text.length, start + text.length);
        showSystemToast('Yapıştırıldı');
      } else if (clipboardContent) {
        // Fallback: show clipboard content
        showSystemToast(`Panodaki içerik: ${clipboardContent.substring(0, 50)}${clipboardContent.length > 50 ? '...' : ''}`);
      } else {
        showSystemToast('Panoda içerik yok');
      }
    } catch (err) {
      // Fallback: use stored clipboard content
      if (clipboardContent) {
        const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          const start = activeElement.selectionStart || 0;
          const end = activeElement.selectionEnd || 0;
          const value = activeElement.value;
          activeElement.value = value.substring(0, start) + clipboardContent + value.substring(end);
          activeElement.setSelectionRange(start + clipboardContent.length, start + clipboardContent.length);
          showSystemToast('Yapıştırıldı');
        } else {
          showSystemToast(`Panodaki içerik: ${clipboardContent.substring(0, 50)}${clipboardContent.length > 50 ? '...' : ''}`);
        }
      } else {
        showSystemToast('Panoda içerik yok');
      }
    }
    setEditMenuOpen(false);
  };

  const editMenuItems = [
    {
      label: 'Undo',
      onClick: () => {
        document.execCommand('undo');
        showSystemToast('Geri alındı');
        setEditMenuOpen(false);
      },
    },
    {
      label: 'Redo',
      onClick: () => {
        document.execCommand('redo');
        showSystemToast('Yinele');
        setEditMenuOpen(false);
      },
    },
    { separator: true },
    {
      label: 'Cut',
      icon: <Scissors size={14} />,
      onClick: handleCut,
    },
    {
      label: 'Copy',
      icon: <Copy size={14} />,
      onClick: handleCopy,
    },
    {
      label: 'Paste',
      icon: <Clipboard size={14} />,
      onClick: handlePaste,
    },
  ];

  const viewMenuItems = [
    {
      label: 'Show View Options',
      onClick: () => {
        showSystemToast('Görünüm seçenekleri gösteriliyor');
        setViewMenuOpen(false);
      },
    },
    { separator: true },
    {
      label: viewOptions.showToolbar ? 'Hide Toolbar' : 'Show Toolbar',
      icon: viewOptions.showToolbar ? <EyeOff size={14} /> : <Eye size={14} />,
      onClick: () => {
        setViewOptions((prev) => ({ ...prev, showToolbar: !prev.showToolbar }));
        showSystemToast(viewOptions.showToolbar ? 'Araç çubuğu gizlendi' : 'Araç çubuğu gösterildi');
        setViewMenuOpen(false);
      },
    },
    {
      label: viewOptions.showSidebar ? 'Hide Sidebar' : 'Show Sidebar',
      icon: viewOptions.showSidebar ? <Sidebar size={14} /> : <Sidebar size={14} />,
      onClick: () => {
        setViewOptions((prev) => ({ ...prev, showSidebar: !prev.showSidebar }));
        showSystemToast(viewOptions.showSidebar ? 'Kenar çubuğu gizlendi' : 'Kenar çubuğu gösterildi');
        setViewMenuOpen(false);
      },
    },
  ];

  const getBatteryIcon = () => {
    if (battery.charging) {
      return <BatteryCharging size={14} className="text-white" />;
    }
    if (battery.level > 75) {
      return <BatteryFull size={14} className="text-white" />;
    }
    if (battery.level > 50) {
      return <Battery size={14} className="text-white" />;
    }
    if (battery.level > 25) {
      return <Battery size={14} className="text-yellow-400" />;
    }
    return <Battery size={14} className="text-red-400" />;
  };

  const formatTime = (date: Date) => {
    return format(date, 'EEE MMM d h:mm a');
  };

  return (
    <>
      <DynamicIsland />
      <div data-menubar className="fixed top-0 left-0 right-0 h-8 bg-black/30 dark:bg-black/50 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4 text-white text-xs">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Apple Logo with Dropdown */}
          <MenuDropdown
            isOpen={appleMenuOpen}
            onClose={() => setAppleMenuOpen(false)}
            items={appleMenuItems}
          >
            <button
              onClick={() => setAppleMenuOpen(!appleMenuOpen)}
              className="flex items-center justify-center w-6 h-6 hover:bg-white/10 rounded transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="text-white"
              >
                <path d="M11.836 7.84c-.034-2.03 1.658-3.005 1.732-3.053a4.97 4.97 0 0 0-1.354-1.973c-.58-.634-1.414-1.096-2.217-1.096-.938 0-1.363.49-2.125.49-.794 0-1.293-.491-2.157-.491-.838 0-1.736.5-2.327 1.19C3.192 3.906 2.578 5.239 2.668 6.782c.036.532.122 1.061.27 1.582.246.866.583 1.715 1.045 2.484.539.895 1.177 1.696 1.954 2.308.603.472 1.258.85 1.968 1.102.363.13.737.225 1.117.287.338.056.692.084 1.055.084.584 0 1.146-.071 1.68-.21.674-.176 1.317-.468 1.895-.873a6.535 6.535 0 0 0 1.715-1.82c.213-.334.197-.769-.042-1.083-.24-.315-.659-.464-1.044-.334-.761.207-1.534.32-2.305.32-.624 0-1.239-.048-1.838-.142-.595-.093-1.164-.235-1.691-.425-1.436-.518-2.504-1.397-3.134-2.6-.857-1.66-.732-3.626-.692-4.116.01-.122.01-.243.01-.364.038-1.083.365-2.006 1.002-2.73.44-.504.993-.88 1.64-1.11.507-.18 1.054-.268 1.624-.268.71 0 1.353.167 1.953.472.465.237.867.54 1.209.899.274.287.523.602.747.942.226-.34.476-.656.752-.944.344-.36.747-.664 1.214-.901.601-.305 1.245-.472 1.956-.472.571 0 1.119.088 1.627.269.648.23 1.202.607 1.643 1.112.638.725.966 1.649 1.005 2.733 0 .122.001.243.01.365.04.49.165 2.456-.693 4.117z" />
              </svg>
            </button>
          </MenuDropdown>

          {/* Active App Name - Hidden on mobile */}
          {!isMobile && <span className="font-bold">{activeApp || 'Finder'}</span>}

          {/* Menu Items - Hidden on mobile */}
          {!isMobile && (
            <div className="flex items-center gap-4">
              <MenuDropdown
                isOpen={fileMenuOpen}
                onClose={() => setFileMenuOpen(false)}
                items={fileMenuItems}
              >
                <span
                  onClick={() => setFileMenuOpen(!fileMenuOpen)}
                  className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer"
                >
                  File
                </span>
              </MenuDropdown>

              <MenuDropdown
                isOpen={editMenuOpen}
                onClose={() => setEditMenuOpen(false)}
                items={editMenuItems}
              >
                <span
                  onClick={() => setEditMenuOpen(!editMenuOpen)}
                  className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer"
                >
                  Edit
                </span>
              </MenuDropdown>

              <MenuDropdown
                isOpen={viewMenuOpen}
                onClose={() => setViewMenuOpen(false)}
                items={viewMenuItems}
              >
                <span
                  onClick={() => setViewMenuOpen(!viewMenuOpen)}
                  className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer"
                >
                  View
                </span>
              </MenuDropdown>

              <MenuDropdown
                isOpen={windowMenuOpen}
                onClose={() => setWindowMenuOpen(false)}
                items={[
                  {
                    label: 'Minimize',
                    icon: <Minus size={14} />,
                    onClick: () => {
                      const activeWindow = windows
                        .filter((w) => !w.minimized)
                        .sort((a, b) => b.zIndex - a.zIndex)[0];
                      if (activeWindow) {
                        minimizeWindow(activeWindow.id);
                        showSystemToast('Pencere küçültüldü');
                      }
                      setWindowMenuOpen(false);
                    },
                  },
                  {
                    label: 'Zoom',
                    icon: <Maximize2 size={14} />,
                    onClick: () => {
                      const activeWindow = windows
                        .filter((w) => !w.minimized)
                        .sort((a, b) => b.zIndex - a.zIndex)[0];
                      if (activeWindow) {
                        if (activeWindow.maximized) {
                          restoreWindow(activeWindow.id);
                          showSystemToast('Pencere geri yüklendi');
                        } else {
                          maximizeWindow(activeWindow.id, {
                            width: window.innerWidth,
                            height: window.innerHeight - 32,
                          });
                          showSystemToast('Pencere büyütüldü');
                        }
                      }
                      setWindowMenuOpen(false);
                    },
                  },
                  { separator: true },
                  {
                    label: 'Bring All to Front',
                    onClick: () => {
                      windows.forEach((w) => {
                        if (!w.minimized) {
                          bringToFront(w.id);
                        }
                      });
                      showSystemToast('Tüm pencereler öne getirildi');
                      setWindowMenuOpen(false);
                    },
                  },
                  { separator: true },
                  {
                    label: 'Close All',
                    icon: <X size={14} />,
                    onClick: () => {
                      windows.forEach((w) => removeWindow(w.id));
                      showSystemToast('Tüm pencereler kapatıldı');
                      setWindowMenuOpen(false);
                    },
                  },
                ]}
              >
                <span
                  onClick={() => setWindowMenuOpen(!windowMenuOpen)}
                  className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer"
                >
                  Window
                </span>
              </MenuDropdown>

              <MenuDropdown
                isOpen={helpMenuOpen}
                onClose={() => setHelpMenuOpen(false)}
                items={[
                  {
                    label: `${activeApp} Yardım`,
                    icon: <HelpCircle size={14} />,
                    onClick: () => {
                      showSystemToast(`${activeApp} yardım menüsü açılıyor...`);
                      setHelpMenuOpen(false);
                    },
                  },
                  { separator: true },
                  {
                    label: 'Kısayollar',
                    onClick: () => {
                      showSystemToast('Cmd+K: Spotlight, Cmd+W: Pencere Kapat, Cmd+M: Küçült');
                      setHelpMenuOpen(false);
                    },
                  },
                  {
                    label: 'Hakkında',
                    onClick: () => {
                      setAboutMacOpen(true);
                      setHelpMenuOpen(false);
                    },
                  },
                ]}
              >
                <span
                  onClick={() => setHelpMenuOpen(!helpMenuOpen)}
                  className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer"
                >
                  Help
                </span>
              </MenuDropdown>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 relative">
          {/* Status Icons */}
          <div className="flex items-center gap-2">
            {/* Battery */}
            <div className="flex items-center gap-1" title={`${battery.level}% ${battery.charging ? 'Charging' : ''}`}>
              {getBatteryIcon()}
              {battery.level < 100 && (
                <span className="text-[10px] text-white/80">{battery.level}%</span>
              )}
            </div>

            {/* Wi-Fi */}
            <button
              onClick={() => setWifiEnabled(!wifiEnabled)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title={wifiEnabled ? 'Wi-Fi: On' : 'Wi-Fi: Off'}
            >
              <Wifi
                size={14}
                className={wifiEnabled ? 'text-white' : 'text-white/50'}
              />
            </button>

            {/* Search */}
            <button
              onClick={toggleSpotlight}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Spotlight Search"
            >
              <Search size={14} className="text-white" />
            </button>

            {/* Control Center */}
            <button
              data-control-center-button
              onClick={toggleControlCenter}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${
                controlCenterOpen ? 'bg-white/20' : ''
              }`}
              title="Control Center"
            >
              <LayoutGrid size={14} className="text-white" />
            </button>
          </div>

          {/* Clock */}
          <div className="ml-2">
            <span className="text-white">{formatTime(currentTime)}</span>
          </div>

          {/* Control Center */}
          <ControlCenter />
        </div>
      </div>

      {/* About This Mac Modal */}
      <AboutThisMac
        isOpen={aboutMacOpen}
        onClose={() => setAboutMacOpen(false)}
      />

    </>
  );
}
