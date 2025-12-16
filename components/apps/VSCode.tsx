'use client';

import { File, Search, Settings, FolderOpen } from 'lucide-react';

export default function VSCode() {
  return (
    <div className="h-full flex bg-[#1e1e1e] text-gray-300">
      {/* Sidebar */}
      <div className="w-12 bg-[#252526] flex flex-col items-center py-2 border-r border-[#3e3e42]">
        <button className="w-10 h-10 flex items-center justify-center hover:bg-[#2a2d2e] rounded mb-2 group">
          <File className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-[#2a2d2e] rounded mb-2 group">
          <Search className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-[#2a2d2e] rounded mb-2 group">
          <FolderOpen className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
        <div className="flex-1" />
        <button className="w-10 h-10 flex items-center justify-center hover:bg-[#2a2d2e] rounded group">
          <Settings className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
      </div>

      {/* File Explorer */}
      <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
        <div className="h-8 px-4 flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Explorer
        </div>
        <div className="flex-1 overflow-auto">
          <div className="px-2 py-1 text-xs text-gray-400">
            OPEN EDITORS
          </div>
          <div className="px-2 py-1 text-xs text-gray-400 mt-4">
            TASOS
          </div>
          <div className="px-4 py-1 text-sm text-gray-300 hover:bg-[#2a2d2e] cursor-pointer">
            📁 src
          </div>
          <div className="px-6 py-1 text-sm text-gray-300 hover:bg-[#2a2d2e] cursor-pointer">
            📄 index.tsx
          </div>
          <div className="px-6 py-1 text-sm text-gray-300 hover:bg-[#2a2d2e] cursor-pointer">
            📄 App.tsx
          </div>
          <div className="px-4 py-1 text-sm text-gray-300 hover:bg-[#2a2d2e] cursor-pointer">
            📁 components
          </div>
          <div className="px-6 py-1 text-sm text-gray-300 hover:bg-[#2a2d2e] cursor-pointer">
            📄 Desktop.tsx
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="h-8 bg-[#2d2d2d] flex items-center border-b border-[#3e3e42]">
          <div className="px-4 py-1 bg-[#1e1e1e] border-r border-[#3e3e42] text-sm text-white">
            index.tsx
          </div>
          <div className="px-4 py-1 text-sm text-gray-400 hover:text-white hover:bg-[#2d2d2d] cursor-pointer">
            App.tsx
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src="https://github1s.com"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            title="VS Code Editor"
          />
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-[#007acc] flex items-center px-4 text-xs text-white">
          <span className="mr-4">Ln 1, Col 1</span>
          <span className="mr-4">Spaces: 2</span>
          <span className="mr-4">UTF-8</span>
          <div className="flex-1" />
          <span>TypeScript React</span>
        </div>
      </div>
    </div>
  );
}

