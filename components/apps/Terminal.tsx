'use client';

import { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '@/store/useSystemStore';

interface Command {
  input: string;
  output: string;
}

const commands: Record<string, (args?: string[]) => string> = {
  ls: () => {
    return 'Applications  Desktop  Documents  Downloads  Library  Movies  Music  Pictures  Public';
  },
  whoami: () => {
    return `╔═══════════════════════════════════════════════════════════╗
║  🚀 Developed & Designed by Tahsin Mert Mutlu           ║
║  Vibe Coder Architecture                              ║
╚═══════════════════════════════════════════════════════════╝

User: Tahsin Mert Mutlu
Role: Full Stack Developer | Creator
System: TasOS (macOS Sequoia Edition)
Serial: TMM-2025-VIBE-CODER`;
  },
  credits: () => {
    return `╔═══════════════════════════════════════════════════════════╗
║  🚀 Developed & Designed by Tahsin Mert Mutlu           ║
║  Vibe Coder Architecture                              ║
╚═══════════════════════════════════════════════════════════╝

Creator: Tahsin Mert Mutlu
Version: 15.0 (Tahsin Mert Mutlu Edition)
Architecture: Vibe Coder
Serial Number: TMM-2025-VIBE-CODER

"Kodlama bir sanattır." - Tahsin Mert Mutlu`;
  },
  clear: () => {
    return '';
  },
  echo: (args) => {
    return args ? args.join(' ') : '';
  },
  help: () => {
    return 'Available commands:\n  ls - List directory contents\n  whoami - Display current user\n  credits - Show creator credits\n  clear - Clear the terminal\n  echo [text] - Echo text\n  help - Show this help message';
  },
};

export default function Terminal() {
  const setDoomUnlocked = useSystemStore((state) => state.setDoomUnlocked);
  const [history, setHistory] = useState<Command[]>([
    { input: '', output: 'Welcome to Terminal. Type "help" for available commands.' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      setHistory((prev) => [...prev, { input: trimmed, output: '' }]);
      return;
    }

    const [command, ...args] = trimmed.split(' ');
    const commandLower = command.toLowerCase();

    if (commandLower === 'clear') {
      setHistory([{ input: '', output: 'Terminal cleared.' }]);
      return;
    }

    // Easter egg: idkfa command unlocks DOOM
    if (commandLower === 'idkfa') {
      setDoomUnlocked(true);
      setHistory((prev) => [
        ...prev,
        {
          input: trimmed,
          output: '🔓 DOOM unlocked! Check the Dock for the DOOM app.',
        },
      ]);
      setCommandHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
      return;
    }

    const handler = commands[commandLower];
    const output = handler ? handler(args) : `Command not found: ${command}. Type "help" for available commands.`;

    setHistory((prev) => [...prev, { input: trimmed, output }]);
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="h-full bg-gray-900 text-green-400 font-mono text-sm flex flex-col overflow-hidden">
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((cmd, index) => (
          <div key={index} className="space-y-1">
            {cmd.input && (
              <div>
                <span className="text-green-400">$</span>{' '}
                <span className="text-white">{cmd.input}</span>
              </div>
            )}
            {cmd.output && (
              <div className="text-gray-300 whitespace-pre-wrap">{cmd.output}</div>
            )}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none ml-1 caret-green-400"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

