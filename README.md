# 🍎 TasOS

A beautiful, interactive macOS-like desktop environment built with Next.js 14, TypeScript, and Tailwind CSS. Experience the familiar macOS interface directly in your web browser with smooth animations, realistic UI components, and fully functional applications.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)

## ✨ Features

### Core Desktop Experience
- **🖥️ Authentic Desktop Environment** - Complete macOS-like interface with Dock, Menu Bar, and Desktop
- **🌊 Fluid Background** - Dynamic, interactive fluid background that responds to window movements (with automatic low-power mode)
- **🎨 Multiple Wallpapers** - Beautiful macOS-style wallpapers that can be switched dynamically
- **🌓 Dark/Light Theme** - Full theme support with smooth transitions
- **⚡ Boot Sequence** - Realistic boot animation on first load
- **😴 Sleep Mode** - Put the system to sleep with a single click
- **📱 Dynamic Island** - Interactive Dynamic Island with music playback and AirDrop simulations
- **🔍 Spotlight Search** - Quick app launcher and search (⌘K or ⌘Space)
- **🚀 Launchpad** - Beautiful grid view for all applications
- **🎛️ Control Center** - Access system controls like brightness, volume, WiFi, Bluetooth
- **💬 Context Menu** - Right-click support on desktop
- **🤖 AI Assistant Orb** - Interactive AI assistant floating on desktop

### Applications
- **📁 Finder** - File browser with sidebar navigation
- **🌐 Safari** - Web browser interface
- **💻 Terminal** - Fully functional terminal with command history and autocomplete
- **📝 VS Code** - Code editor interface
- **🧮 Calculator** - Functional calculator app
- **📄 Notes** - Note-taking application
- **📷 Photo Booth** - Camera and photo viewer
- **🎵 Beat Maker** - Music creation tool with Tone.js
- **🎮 DOOM** - Classic DOOM game (unlockable easter egg)

### Window Management
- **🪟 Multi-Window Support** - Open multiple applications simultaneously
- **📐 Resizable Windows** - Drag to resize windows
- **📍 Window Dragging** - Move windows by dragging the title bar
- **📉 Minimize/Maximize** - Full window management controls
- **🎯 Focus Management** - Click to bring windows to front
- **⌨️ Keyboard Shortcuts** - Full keyboard navigation support

### Advanced Features
- **🔋 Battery Indicator** - Real battery status (when available)
- **🎚️ Brightness Control** - Adjustable screen brightness
- **🔊 Volume Control** - System volume management
- **📶 WiFi/Bluetooth Toggles** - Network and connectivity controls
- **🎵 Music Player** - Integrated music playback with Dynamic Island integration
- **📤 AirDrop Simulation** - Simulated file transfer with progress indicator

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Audio**: Tone.js (for Beat Maker)
- **Gaming**: js-dos (for DOOM)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd TasOS
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 🎮 Usage Guide

### Keyboard Shortcuts

- **⌘K** or **⌘Space** - Open Spotlight Search
- **Esc** - Close Spotlight or other modals
- **⌘W** - Close active window (in apps)
- **⌘M** - Minimize window (in apps)
- **⌘Q** - Quit application (in apps)

### Mouse Interactions

- **Click Dock icons** - Launch or focus applications
- **Double-click Desktop items** - Open files/folders
- **Right-click Desktop** - Open context menu
- **Drag window title bar** - Move windows
- **Drag window edges** - Resize windows
- **Click outside window** - Deselect and lower z-index

### Unlocking DOOM

DOOM is hidden by default! Try to discover how to unlock it... 🎮

## 📁 Project Structure

```
TasOS/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── apps/             # Application components
│   │   ├── BeatMaker.tsx
│   │   ├── Calculator.tsx
│   │   ├── DOOM.tsx
│   │   ├── Finder.tsx
│   │   ├── Notes.tsx
│   │   ├── PhotoBooth.tsx
│   │   ├── Safari.tsx
│   │   ├── Terminal.tsx
│   │   └── VSCode.tsx
│   ├── Desktop.tsx        # Main desktop component
│   ├── Dock.tsx           # Application dock
│   ├── MenuBar.tsx        # Top menu bar
│   ├── Window.tsx         # Window wrapper component
│   ├── Spotlight.tsx      # Search launcher
│   ├── Launchpad.tsx      # App grid view
│   ├── ControlCenter.tsx  # System controls
│   ├── DynamicIsland.tsx  # Dynamic Island component
│   ├── FluidBackground.tsx # Animated background
│   └── ...                # Other UI components
├── store/                 # State management
│   └── useSystemStore.ts  # Zustand store
├── hooks/                 # Custom React hooks
│   └── useBattery.ts      # Battery status hook
└── public/                # Static assets
```

## 🎨 Customization

### Changing Wallpapers

Edit `store/useSystemStore.ts` to modify the `MACOS_WALLPAPERS` array:

```typescript
const MACOS_WALLPAPERS = [
  'your-wallpaper-url-1',
  'your-wallpaper-url-2',
  // ...
];
```

### Adding New Applications

1. Create a new component in `components/apps/`
2. Add the app to the Dock apps array in `components/Dock.tsx`
3. Add app handling in `components/Desktop.tsx` switch statement
4. Update Spotlight and Launchpad if needed

### Theme Customization

Modify `app/globals.css` and Tailwind configuration in `tailwind.config.ts` to customize colors and styling.

## 🐛 Known Issues

- Fluid background automatically disables if FPS drops below 30 (low-power mode)
- Battery status requires browser battery API support
- DOOM requires initial unlock mechanism

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👤 Author

**Tahsin Mert Mutlu**

> "Kodlama bir sanattır." - Coding is an art.

---

Made with ❤️ and lots of ☕ using Next.js and React
