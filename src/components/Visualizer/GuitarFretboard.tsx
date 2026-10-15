import React, { useState } from 'react';
import { PitchClass } from '../../types/music';
import { generateFretboard, DISPLAY_NAMES } from '../../utils/musicTheory';
import { soundEngine } from '../../utils/audioSynth';
import { Eye, Volume2 } from 'lucide-react';

interface GuitarFretboardProps {
  root: PitchClass;
  targetNotes: PitchClass[];
  intervalsMap: Record<PitchClass, string>;
  activePlayingMidi: number | null;
  onPlayNote?: (midi: number) => void;
}

export const GuitarFretboard: React.FC<GuitarFretboardProps> = ({
  root,
  targetNotes,
  intervalsMap,
  activePlayingMidi,
  onPlayNote
}) => {
  const [displayMode, setDisplayMode] = useState<'notes' | 'intervals'>('intervals');
  const [showAllFrets, setShowAllFrets] = useState<boolean>(false);
  const [clickedFretKey, setClickedFretKey] = useState<string | null>(null);

  const fretMatrix = generateFretboard(root, targetNotes, intervalsMap);

  // Inlay markers for guitar: 3, 5, 7, 9, 12 (double), 15
  const singleDotFrets = [3, 5, 7, 9, 15];
  const doubleDotFrets = [12];

  const handleFretClick = (midi: number, strIdx: number, fret: number) => {
    const key = `${strIdx}-${fret}`;
    setClickedFretKey(key);
    // Switch temporarily to pluck sound for authentic guitar timbre
    const prevInst = soundEngine.currentInstrument;
    soundEngine.setInstrument('pluck');
    soundEngine.playNote(midi, 1.2);
    soundEngine.setInstrument(prevInst);

    if (onPlayNote) onPlayNote(midi);
    setTimeout(() => {
      setClickedFretKey(null);
    }, 300);
  };

  // String gauges (thickness in pixels from high E (string 0) to low E (string 5))
  const stringHeights = [1.2, 1.6, 2.0, 2.5, 3.2, 4.0];

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl backdrop-blur-md">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
            6-String Guitar Fretboard (Frets 0 – 15)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setDisplayMode('intervals')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                displayMode === 'intervals'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Intervals (R, 3, 5)
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('notes')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                displayMode === 'notes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Note Names
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAllFrets(!showAllFrets)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              showAllFrets
                ? 'bg-slate-800 text-slate-200 border-slate-600'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
            title="Toggle dim display of all chromatic fretboard notes"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Notes</span>
          </button>
        </div>
      </div>

      {/* Interactive Fretboard Visualizer */}
      <div className="relative w-full overflow-x-auto select-none bg-stone-950 rounded-xl border border-stone-800 shadow-2xl p-2.5 pb-4">
        {/* Fret number indicators on top */}
        <div className="flex min-w-[760px] mb-2 px-8">
          <div className="w-12 text-center text-[10px] font-bold text-amber-500 uppercase tracking-wider">
            Open
          </div>
          {Array.from({ length: 15 }, (_, i) => i + 1).map((fret) => (
            <div
              key={fret}
              className={`flex-1 text-center text-[11px] font-mono font-semibold ${
                singleDotFrets.includes(fret) || doubleDotFrets.includes(fret)
                  ? 'text-amber-400 font-bold'
                  : 'text-stone-500'
              }`}
            >
              {fret}
            </div>
          ))}
        </div>

        {/* Fretboard Neck Surface */}
        <div className="relative min-w-[760px] rounded-lg bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-y-2 border-stone-700/80 shadow-inner px-2 py-2">
          {/* Nut separator line */}
          <div className="absolute top-0 bottom-0 left-12 w-2 bg-gradient-to-r from-amber-100 via-stone-200 to-amber-200 shadow-md z-10 rounded-sm" />

          {/* Fret wire lines */}
          <div className="absolute inset-0 left-14 right-2 flex pointer-events-none">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-stone-400/50 shadow-sm flex items-center justify-center relative"
              >
                {/* Single Inlay Dot */}
                {singleDotFrets.includes(i + 1) && (
                  <div className="w-3.5 h-3.5 rounded-full bg-stone-300/40 border border-stone-100/50 shadow-inner" />
                )}
                {/* Double Inlay Dot at 12th fret */}
                {doubleDotFrets.includes(i + 1) && (
                  <div className="flex flex-col gap-6">
                    <div className="w-3 h-3 rounded-full bg-stone-300/40 border border-stone-100/50 shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-stone-300/40 border border-stone-100/50 shadow-inner" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Guitar Strings & Interactive Note Badges */}
          <div className="relative flex flex-col justify-between py-1 gap-4 z-20">
            {fretMatrix.map((stringFrets, strIdx) => {
              const gauge = stringHeights[strIdx];

              return (
                <div key={strIdx} className="relative flex items-center h-8">
                  {/* String wire graphic */}
                  <div
                    style={{ height: `${gauge}px` }}
                    className="absolute left-0 right-0 bg-gradient-to-b from-stone-300 via-stone-100 to-stone-400 shadow pointer-events-none rounded-full"
                  />

                  {/* Open note header */}
                  <div className="w-12 flex items-center justify-center z-20 pr-2">
                    <button
                      type="button"
                      onClick={() => handleFretClick(stringFrets[0].midiNumber, strIdx, 0)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform active:scale-90 ${
                        stringFrets[0].isRoot
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md shadow-amber-500/50'
                          : stringFrets[0].isTarget
                          ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white ring-1 ring-indigo-300 shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      } ${
                        activePlayingMidi === stringFrets[0].midiNumber || clickedFretKey === `${strIdx}-0`
                          ? 'ring-4 ring-amber-400 scale-110 brightness-125'
                          : ''
                      }`}
                    >
                      {stringFrets[0].isTarget
                        ? (displayMode === 'intervals' ? stringFrets[0].interval || DISPLAY_NAMES[stringFrets[0].pitch].sharp : DISPLAY_NAMES[stringFrets[0].pitch].sharp)
                        : stringFrets[0].stringName}
                    </button>
                  </div>

                  {/* Frets 1 to 15 */}
                  <div className="flex-1 flex items-center pl-2">
                    {stringFrets.slice(1).map((fretObj) => {
                      const isFretClicked = clickedFretKey === `${strIdx}-${fretObj.fret}`;
                      const isFretPlaying = activePlayingMidi === fretObj.midiNumber || isFretClicked;
                      const displayName = DISPLAY_NAMES[fretObj.pitch].sharp;
                      const label = displayMode === 'intervals' ? fretObj.interval || displayName : displayName;

                      if (!fretObj.isTarget && !showAllFrets) {
                        return (
                          <div
                            key={fretObj.fret}
                            onClick={() => handleFretClick(fretObj.midiNumber, strIdx, fretObj.fret)}
                            className="flex-1 flex items-center justify-center h-8 cursor-pointer group"
                          >
                            <span className="w-2 h-2 rounded-full bg-transparent group-hover:bg-stone-500/40 transition-colors" />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={fretObj.fret}
                          className="flex-1 flex items-center justify-center h-8"
                        >
                          <button
                            type="button"
                            onClick={() => handleFretClick(fretObj.midiNumber, strIdx, fretObj.fret)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all transform active:scale-90 shadow-md z-20 ${
                              fretObj.isRoot
                                ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 ring-2 ring-amber-200 ring-offset-1 ring-offset-stone-900 shadow-amber-500/50 scale-105'
                                : fretObj.isTarget
                                ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white ring-1 ring-indigo-300 shadow-indigo-600/40'
                                : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-700 border border-stone-700/60'
                            } ${
                              isFretPlaying ? 'ring-4 ring-amber-400 scale-125 brightness-125' : 'hover:scale-110'
                            }`}
                          >
                            {label}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 px-2 text-[11px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-stone-500" />
            Click any note to play guitar tone
          </span>
          <span className="text-stone-500 font-mono">
            Tuning: Standard E-A-D-G-B-e
          </span>
        </div>
      </div>
    </div>
  );
};
