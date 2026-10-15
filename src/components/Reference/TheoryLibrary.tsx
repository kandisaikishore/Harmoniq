import React, { useState } from 'react';
import { PitchClass, ScaleDefinition, ChordDefinition } from '../../types/music';
import { SCALES, CHORDS, DISPLAY_NAMES, pitchToMidi } from '../../utils/musicTheory';
import { soundEngine } from '../../utils/audioSynth';
import { Search, Play, ArrowRight, BookOpen, Music, Layers } from 'lucide-react';

interface TheoryLibraryProps {
  currentRoot: PitchClass;
  onSelectScale: (scaleId: string) => void;
  onSelectChord: (chordId: string) => void;
  onNavigateToVisualizer: () => void;
}

export const TheoryLibrary: React.FC<TheoryLibraryProps> = ({
  currentRoot,
  onSelectScale,
  onSelectChord,
  onNavigateToVisualizer,
}) => {
  const [tab, setTab] = useState<'scales' | 'chords'>('scales');
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const rootDisplay = DISPLAY_NAMES[currentRoot].sharp;

  const filteredScales = SCALES.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.mood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChords = CHORDS.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.quality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayScale = (scale: ScaleDefinition) => {
    setPlayingId(scale.id);
    const rootMidi = pitchToMidi(currentRoot, 3);
    const midis = [...scale.intervals.map(int => rootMidi + int), rootMidi + 12];
    soundEngine.playArpeggio(midis, 0.18, undefined, () => {
      setPlayingId(null);
    });
  };

  const handlePlayChord = (chord: ChordDefinition) => {
    setPlayingId(chord.id);
    const rootMidi = pitchToMidi(currentRoot, 3);
    const midis = chord.intervals.map(int => rootMidi + int);
    soundEngine.playStrum(midis, 'down', () => {
      setPlayingId(null);
    });
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-5">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Interactive Harmony Encyclopedia
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Comprehensive Music Theory Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formulas, moods, and harmonic textures in key of <strong className="text-amber-400">{rootDisplay}</strong>.
          </p>
        </div>

        {/* Tab & Search controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTab('scales')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                tab === 'scales' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Scales & Modes ({SCALES.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('chords')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                tab === 'chords' ? 'bg-amber-600 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chords & Voicings ({CHORDS.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scales, formulas, moods..."
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-950 rounded-xl border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 outline-none w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Grid of Scales or Chords */}
      {tab === 'scales' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredScales.map((s) => {
            const isAuditioning = playingId === s.id;

            return (
              <div
                key={s.id}
                className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/50">
                      {s.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlayScale(s)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Play scale arpeggio"
                    >
                      <Play className={`w-3.5 h-3.5 ${isAuditioning ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                    {rootDisplay} {s.name}
                  </h3>
                  <div className="text-xs font-mono text-amber-400 font-semibold mt-1">
                    Formula: {s.formula.join(' – ')}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {s.description}
                  </p>
                  <p className="text-[11px] text-amber-300/80 font-medium mt-1">
                    ✨ {s.mood}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectScale(s.id);
                      onNavigateToVisualizer();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Visualize in Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredChords.map((c) => {
            const isAuditioning = playingId === c.id;

            return (
              <div
                key={c.id}
                className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/50">
                      {c.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlayChord(c)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-600 text-slate-300 hover:text-slate-950 transition-colors cursor-pointer"
                      title="Strum chord"
                    >
                      <Play className={`w-3.5 h-3.5 ${isAuditioning ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      {rootDisplay} {c.name}
                    </h3>
                    {c.symbol && (
                      <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {rootDisplay}{c.symbol}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-indigo-400 font-semibold mt-1">
                    Formula: {c.formula.join(' – ')}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectChord(c.id);
                      onNavigateToVisualizer();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-600 text-slate-200 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Visualize in Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
