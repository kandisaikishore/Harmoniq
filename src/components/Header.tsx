import React from 'react';
import { PitchClass } from '../types/music';
import { DISPLAY_NAMES } from '../utils/musicTheory';
import {
  Music4,
  Sparkles,
  Bot,
  Image as ImageIcon,
  BookOpen,
  Volume2
} from 'lucide-react';
import { soundEngine } from '../utils/audioSynth';
import { UserMenu } from './Auth/UserMenu';

export type ActiveTab = 'visualizer' | 'chat' | 'image_studio' | 'reference';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentRoot: PitchClass;
  currentSelectionName: string;
  currentType: 'scale' | 'chord';
  onOpenSavedModal?: () => void;
  savedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentRoot,
  currentSelectionName,
  currentType,
  onOpenSavedModal,
  savedCount,
}) => {
  const [volume, setVolume] = React.useState<number>(0.7);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  const navItems = [
    {
      id: 'visualizer' as ActiveTab,
      label: 'Visualizer Studio',
      icon: Music4,
      desc: 'Piano, Fretboard, Circle of 5ths & Staff'
    },
    {
      id: 'chat' as ActiveTab,
      label: 'AI Harmony Chat',
      icon: Bot,
      desc: 'Multi-turn Gemini Mentor'
    },
    {
      id: 'image_studio' as ActiveTab,
      label: 'AI Image Studio',
      icon: ImageIcon,
      desc: '1K / 2K / 4K gemini-3-pro-image-preview'
    },
    {
      id: 'reference' as ActiveTab,
      label: 'Theory Library',
      icon: BookOpen,
      desc: 'Scales & Chords Reference'
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Music4 className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Harmoniq
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Studio
                  </span>
                </h1>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                AI Music Theory & Visualizations
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-1 ring-indigo-400/50'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Active Harmonic Badge & Audio Volume */}
          <div className="flex items-center gap-3">
            {/* Active Key Capsule */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-slate-400 font-mono">Active:</span>
              <span className="font-extrabold text-amber-300">
                {DISPLAY_NAMES[currentRoot].sharp} {currentSelectionName}
              </span>
            </div>

            {/* Volume slider */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-400">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Master synthesizer volume"
                className="w-14 sm:w-16 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Firebase User Authentication & Profile Menu */}
            <UserMenu onOpenSavedModal={onOpenSavedModal} savedCount={savedCount} />
          </div>
        </div>
      </div>
    </header>
  );
};
