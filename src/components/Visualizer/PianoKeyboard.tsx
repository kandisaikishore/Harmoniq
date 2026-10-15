import React, { useState } from 'react';
import { PitchClass } from '../../types/music';
import { generatePianoKeys, DISPLAY_NAMES } from '../../utils/musicTheory';
import { soundEngine } from '../../utils/audioSynth';
import { Volume2 } from 'lucide-react';

interface PianoKeyboardProps {
  root: PitchClass;
  targetNotes: PitchClass[];
  intervalsMap: Record<PitchClass, string>;
  activePlayingMidi: number | null;
  onPlayNote?: (midi: number) => void;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  root,
  targetNotes,
  intervalsMap,
  activePlayingMidi,
  onPlayNote
}) => {
  const [pressedMidi, setPressedMidi] = useState<number | null>(null);

  const keys = generatePianoKeys(root, targetNotes, intervalsMap);
  const whiteKeys = keys.filter(k => !k.isBlack);

  const handleKeyClick = (midi: number) => {
    setPressedMidi(midi);
    soundEngine.playNote(midi, 1.2);
    if (onPlayNote) onPlayNote(midi);
    setTimeout(() => {
      setPressedMidi(null);
    }, 300);
  };

  // Black key offset positions relative to white keys
  // In an octave: C, D, E, F, G, A, B (7 white keys)
  // C# is between 0 and 1 (C & D)
  // D# is between 1 and 2 (D & E)
  // F# is between 3 and 4 (F & G)
  // G# is between 4 and 5 (G & A)
  // A# is between 5 and 6 (A & B)
  const getBlackKeyOffset = (pitch: PitchClass, octave: number) => {
    const octaveBaseWhiteCount = (octave - 3) * 7;
    let whiteIndexBefore = 0;
    if (pitch === 'C#') whiteIndexBefore = 0;
    else if (pitch === 'D#') whiteIndexBefore = 1;
    else if (pitch === 'F#') whiteIndexBefore = 3;
    else if (pitch === 'G#') whiteIndexBefore = 4;
    else if (pitch === 'A#') whiteIndexBefore = 5;

    const totalWhiteIndex = octaveBaseWhiteCount + whiteIndexBefore;
    // Calculate percentage along keyboard of 15 white keys (C3 to C5 = 15 white keys)
    // Each white key is 100 / 15 % = 6.666%
    const whiteWidthPct = 100 / whiteKeys.length;
    // Place black key roughly on the seam (width is ~65% of white key)
    return (totalWhiteIndex + 1) * whiteWidthPct - (whiteWidthPct * 0.33);
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
            Interactive Piano Roll (C3 – C5)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500/90 border border-amber-300 inline-block shadow-sm shadow-amber-500/50" />
            <span className="text-amber-300 font-medium">Root Note</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500/90 border border-indigo-300 inline-block shadow-sm shadow-indigo-500/50" />
            <span className="text-indigo-300 font-medium">Active Tone</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-500">
            <Volume2 className="w-3.5 h-3.5" /> Click any key to hear pitch
          </span>
        </div>
      </div>

      <div className="relative w-full h-48 md:h-56 select-none bg-slate-950 rounded-xl p-1.5 pt-2 border border-slate-800/80 shadow-inner overflow-x-auto">
        <div className="relative min-w-[620px] w-full h-full">
          {/* White Keys container */}
          <div className="flex h-full w-full">
            {whiteKeys.map((k) => {
              const isPlaying = activePlayingMidi === k.midiNumber || pressedMidi === k.midiNumber;
              const displayName = DISPLAY_NAMES[k.pitch].sharp;

              return (
                <button
                  key={k.midiNumber}
                  type="button"
                  onClick={() => handleKeyClick(k.midiNumber)}
                  className={`relative flex-1 h-full rounded-b-md border-r border-slate-300/40 last:border-r-0 transition-all duration-75 flex flex-col justify-end items-center pb-2.5 focus:outline-none ${
                    k.isRoot
                      ? 'bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 border-amber-400 shadow-md shadow-amber-500/20'
                      : k.isTarget
                      ? 'bg-gradient-to-b from-indigo-50 via-indigo-100 to-indigo-200 border-indigo-300 shadow-sm shadow-indigo-500/10'
                      : 'bg-gradient-to-b from-slate-100 via-white to-slate-200 hover:to-slate-100 text-slate-800'
                  } ${
                    isPlaying ? 'translate-y-1 brightness-90 ring-2 ring-indigo-400 shadow-inner' : 'hover:brightness-95'
                  }`}
                >
                  {/* Visual degree / interval badge */}
                  {k.isTarget && (
                    <div
                      className={`w-7 h-7 rounded-full flex flex-col items-center justify-center font-bold text-[10px] leading-tight mb-2 shadow-sm ${
                        k.isRoot
                          ? 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-amber-500/50'
                          : 'bg-indigo-600 text-white shadow-indigo-600/30'
                      }`}
                    >
                      <span>{k.interval || displayName}</span>
                    </div>
                  )}

                  <div className="text-center">
                    <span
                      className={`text-xs font-bold block ${
                        k.isRoot ? 'text-amber-900' : k.isTarget ? 'text-indigo-950' : 'text-slate-600'
                      }`}
                    >
                      {displayName}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      {k.octave}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Black Keys overlay */}
          <div className="absolute top-0 left-0 right-0 h-3/5 pointer-events-none">
            {keys.filter(k => k.isBlack).map(k => {
            const isPlaying = activePlayingMidi === k.midiNumber || pressedMidi === k.midiNumber;
            const leftPct = getBlackKeyOffset(k.pitch, k.octave);
            const displayName = DISPLAY_NAMES[k.pitch].sharp;

            return (
              <button
                key={k.midiNumber}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleKeyClick(k.midiNumber);
                }}
                style={{
                  left: `${leftPct}%`,
                  width: `${(100 / whiteKeys.length) * 0.65}%`,
                }}
                className={`absolute top-0 h-full rounded-b-md pointer-events-auto transition-all duration-75 flex flex-col justify-end items-center pb-2 focus:outline-none z-10 shadow-lg ${
                  k.isRoot
                    ? 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border border-amber-400 text-amber-100 ring-2 ring-amber-400/50'
                    : k.isTarget
                    ? 'bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-950 border border-indigo-400 text-indigo-100'
                    : 'bg-gradient-to-b from-slate-900 via-slate-950 to-black border-x border-b border-slate-700 text-slate-300'
                } ${
                  isPlaying ? 'translate-y-1 brightness-125 ring-2 ring-indigo-300' : 'hover:brightness-110'
                }`}
              >
                {k.isTarget && (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] mb-1.5 shadow-sm ${
                      k.isRoot
                        ? 'bg-amber-400 text-slate-950 ring-1 ring-white'
                        : 'bg-indigo-500 text-white'
                    }`}
                  >
                    <span>{k.interval || displayName}</span>
                  </div>
                )}
                <span className="text-[10px] font-semibold text-slate-300">
                  {displayName}
                </span>
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};
