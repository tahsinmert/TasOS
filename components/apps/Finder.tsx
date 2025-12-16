'use client';

import { Folder, HardDrive, Download, Monitor, Wifi } from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Wifi, label: 'AirDrop' },
  { icon: Folder, label: 'Applications' },
  { icon: Monitor, label: 'Desktop' },
  { icon: Download, label: 'Downloads' },
];

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  icon: string;
}

const fileItems: FileItem[] = [
  { name: 'Documents', type: 'folder', icon: '📁' },
  { name: 'Pictures', type: 'folder', icon: '📁' },
  { name: 'Movies', type: 'folder', icon: '📁' },
  { name: 'Music', type: 'folder', icon: '📁' },
  { name: 'Desktop', type: 'folder', icon: '📁' },
  { name: 'Downloads', type: 'folder', icon: '📁' },
  { name: 'Applications', type: 'folder', icon: '📁' },
  { name: 'Library', type: 'folder', icon: '📁' },
  { name: 'System', type: 'folder', icon: '📁' },
  { name: 'Users', type: 'folder', icon: '📁' },
  { name: 'readme.txt', type: 'file', icon: '📄' },
  { name: 'notes.md', type: 'file', icon: '📄' },
];

export default function Finder() {
  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-48 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50">
        <div className="p-3 space-y-1">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
              >
                <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content - Grid View */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-4 gap-6 auto-rows-min">
          {fileItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer transition-all group"
            >
              <div className="text-6xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="text-xs text-center text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 max-w-[100px] truncate">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

