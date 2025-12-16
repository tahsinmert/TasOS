'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Home, Plus } from 'lucide-react';

export default function Safari() {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/MacOS');
  const [currentUrl, setCurrentUrl] = useState('https://en.wikipedia.org/wiki/MacOS');
  const [hasError, setHasError] = useState(false);

  const handleGo = () => {
    try {
      // Only allow safe URLs
      const safeDomains = ['wikipedia.org', 'github.com', 'github1s.com'];
      const urlObj = new URL(url);
      const isSafe = safeDomains.some(domain => urlObj.hostname.includes(domain));
      
      if (isSafe) {
        setCurrentUrl(url);
        setHasError(false);
      } else {
        setHasError(true);
        setCurrentUrl('');
      }
    } catch {
      // If URL is invalid, show no internet page
      setHasError(true);
      setCurrentUrl('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGo();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Tab Bar with Traffic Lights */}
      <div className="h-10 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-3 gap-2">
        {/* Traffic Lights (integrated) */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        
        {/* Tab */}
        <div className="flex-1 flex items-center gap-2 ml-4">
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
            <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="h-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-700">
          <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none"
            placeholder="Search or enter website name"
          />
          <button
            onClick={handleGo}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
          >
            Go
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {hasError || !currentUrl ? (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold mb-2">No Internet Connection</h2>
            <p className="text-sm">Unable to load the requested page.</p>
            <p className="text-xs mt-2">Try: Wikipedia, GitHub, or GitHub1s</p>
          </div>
        ) : (
          <iframe
            src={currentUrl}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            title="Safari Content"
          />
        )}
      </div>
    </div>
  );
}

