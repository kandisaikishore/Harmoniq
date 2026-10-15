import React, { useState } from 'react';
import { PitchClass, ScaleDefinition, ChordDefinition } from '../../types/music';
import { CHROMATIC_PITCHES, DISPLAY_NAMES, SCALES, CHORDS } from '../../utils/musicTheory';
import { Sparkles, Search, Sliders, Music } from 'lucide-react';

interface VisualizerControlsProps {
  type: 'scale' | 'chord';
  root: PitchClass;
  scaleId: string;
  chordId: string;
  onTypeChange: (type: 'scale' | 'chord') => void;
  onRootChange: (root: PitchClass) => void;
  onScaleChange: (scaleId: string) => void;
  onChordChange: (chordId: string) => void;
  onAIParseQuery: (query: string) => Promise<void>;
  isParsingQuery: boolean;
}

export const VisualizerControls: React.FC<VisualizerControlsProps> = ({
  type,
  root,
  scaleId,
  chordId,
  onTypeChange,
  onRootChange,
  onScaleChange,
  onChordChange,
  onAIParseQuery,
  isParsingQuery,
}) => {
  const [nlQuery, setNlQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const scaleCategories = ['all', 'Major & Modes', 'Minor Variations', 'Pentatonic & Blues', 'Jazz & Bebop', 'Exotic & World'];
  const chordCategories = ['all', 'Triads', 'Seventh Chords', 'Extended (9th/11th/13th)', 'Altered & Suspended'];

  const filteredScales = activeCategory === 'all'
    ? SCALES
    : SCALES.filter(s => s.category === activeCategory);

  const filteredChords = activeCategory === 'all'
    ? CHORDS
    : CHORDS.filter(c => c.category === activeCategory);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim() || isParsingQuery) return;
    onAIParseQuery(nlQuery.trim());
  };

  const sampleQueries = [
    'D Dorian',
    'F# Minor Blues',
    'Ab Major 9th',
    'E7#9 Hendrix',
    'G Lydian Dominant',
    'B Half-Diminished',
  ];

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Natural language AI Query Bar */}
      <div>
        <form onSubmit={handleQuerySubmit} className="relative flex items-center">
          <div className="absolute left-3.5 text-indigo-400 pointer-events-none">
            <Sparkles className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder="Type any scale, chord, or theory request (e.g., 'E Phrygian Dominant' or 'Db13 chord')..."
            className="w-full pl-10 pr-28 py-3 bg-slate-950/90 rounded-xl border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isParsingQuery || !nlQuery.trim()}
            className="absolute right-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shadow-sm shadow-indigo-600/40 cursor-pointer"
          >
            {isParsingQuery ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Visualize</span>
          </button>
        </form>

        {/* Quick chip suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">
            Quick Try:
          </span>
          {sampleQueries.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setNlQuery(sample);
                onAIParseQuery(sample);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Main Switchers (Type, Root, and Category) */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher: Scales vs Chords */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                onTypeChange('scale');
                setActiveCategory('all');
              }}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                type === 'scale'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Scales & Modes
            </button>
            <button
              type="button"
              onClick={() => {
                onTypeChange('chord');
                setActiveCategory('all');
              }}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                type === 'chord'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md shadow-amber-600/30 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Chords & Voicings
            </button>
          </div>

          {/* Scale or Chord select dropdown */}
          <div className="flex-1 max-w-xs min-w-[200px]">
            {type === 'scale' ? (
              <select
                value={scaleId}
                onChange={(e) => onScaleChange(e.target.value)}
                aria-label="Select scale or mode"
                className="w-full bg-slate-950 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {filteredScales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={chordId}
                onChange={(e) => onChordChange(e.target.value)}
                aria-label="Select chord voicing"
                className="w-full bg-slate-950 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 p-2.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                {filteredChords.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.symbol ? `(${c.symbol})` : ''} — {c.category}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 12 Root Pitch Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Root Tonic Pitch
            </span>
            <span className="text-[11px] text-indigo-400 font-mono font-medium">
              Current: {DISPLAY_NAMES[root].sharp} / {DISPLAY_NAMES[root].flat}
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {CHROMATIC_PITCHES.map((pitch) => {
              const isSelected = pitch === root;
              const display = DISPLAY_NAMES[pitch];

              return (
                <button
                  key={pitch}
                  type="button"
                  onClick={() => onRootChange(pitch)}
                  className={`py-2 px-1 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="block leading-tight font-extrabold">{display.sharp}</span>
                  {display.sharp !== display.flat && (
                    <span className={`block text-[9px] font-normal leading-none ${isSelected ? 'text-amber-950' : 'text-slate-500'}`}>
                      {display.flat}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(type === 'scale' ? scaleCategories : chordCategories).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                activeCategory === cat
                  ? type === 'scale'
                    ? 'bg-indigo-900/60 text-indigo-200 border-indigo-500/60'
                    : 'bg-amber-900/60 text-amber-200 border-amber-500/60'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800/80 hover:text-slate-300'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
