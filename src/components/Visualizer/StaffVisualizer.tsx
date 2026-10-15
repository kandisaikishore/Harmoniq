import React from 'react';
import { PitchClass } from '../../types/music';
import { DISPLAY_NAMES, pitchToMidi } from '../../utils/musicTheory';
import { soundEngine } from '../../utils/audioSynth';

interface StaffVisualizerProps {
  root: PitchClass;
  targetNotes: PitchClass[];
  intervalsMap: Record<PitchClass, string>;
  activePlayingMidi: number | null;
  onPlayNote?: (midi: number) => void;
}

export const StaffVisualizer: React.FC<StaffVisualizerProps> = ({
  root,
  targetNotes,
  intervalsMap,
  activePlayingMidi,
  onPlayNote,
}) => {
  // Staff line coordinates (Y-positions for 5 staff lines)
  // Standard Treble clef lines from top to bottom:
  // Line 5 (top): F5 (y = 40)
  // Space 4: E5 (y = 50)
  // Line 4: D5 (y = 60)
  // Space 3: C5 (y = 70)
  // Line 3: B4 (y = 80)
  // Space 2: A4 (y = 90)
  // Line 2: G4 (y = 100)
  // Space 1: F4 (y = 110)
  // Line 1 (bottom): E4 (y = 120)
  // Space below: D4 (y = 130)
  // Ledger line: C4 (Middle C) (y = 140)

  // Map pitch to staff step offset from C4 (Middle C = 0)
  const pitchStepsFromC4: Record<PitchClass, { diatonicStep: number; accidental?: 'sharp' | 'flat' }> = {
    'C': { diatonicStep: 0 },
    'C#': { diatonicStep: 0, accidental: 'sharp' },
    'D': { diatonicStep: 1 },
    'D#': { diatonicStep: 1, accidental: 'sharp' },
    'E': { diatonicStep: 2 },
    'F': { diatonicStep: 3 },
    'F#': { diatonicStep: 3, accidental: 'sharp' },
    'G': { diatonicStep: 4 },
    'G#': { diatonicStep: 4, accidental: 'sharp' },
    'A': { diatonicStep: 5 },
    'A#': { diatonicStep: 5, accidental: 'sharp' },
    'B': { diatonicStep: 6 },
  };

  const handleNoteClick = (pitch: PitchClass, octave: number) => {
    const midi = pitchToMidi(pitch, octave);
    soundEngine.playNote(midi, 1.0);
    if (onPlayNote) onPlayNote(midi);
  };

  // Build notes list starting from root in octave 4, ascending
  // (e.g. if root is G, notes ascending G4, A4, B4, C5, D5...)
  const staffNotes = targetNotes.map((pitch, idx) => {
    const stepInfo = pitchStepsFromC4[pitch];
    // Simple octave determination relative to root
    const rootStep = pitchStepsFromC4[root].diatonicStep;
    const isHigherOctave = stepInfo.diatonicStep < rootStep && idx > 0;
    const octave = isHigherOctave ? 5 : 4;
    const totalStep = (octave === 5 ? 7 : 0) + stepInfo.diatonicStep;
    // Each step up lowers Y by 10px (since C4 is at y=140)
    const yPos = 140 - totalStep * 10;
    const midi = pitchToMidi(pitch, octave);

    return {
      pitch,
      octave,
      midi,
      yPos,
      accidental: stepInfo.accidental,
      isRoot: pitch === root,
      interval: intervalsMap[pitch],
      hasLedger: totalStep === 0 || totalStep >= 8, // C4 or A5+
    };
  });

  const width = Math.max(500, staffNotes.length * 55 + 160);
  const height = 180;

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
            Sheet Music Staff Notation (Treble Clef)
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Click any note head to audition
        </span>
      </div>

      <div className="w-full overflow-x-auto bg-slate-950/70 rounded-xl border border-slate-800/80 p-2">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="select-none min-w-[500px]"
        >
          {/* 5 Staff Lines */}
          {[40, 60, 80, 100, 120].map((y, i) => (
            <line
              key={i}
              x1="30"
              y1={y}
              x2={width - 30}
              y2={y}
              stroke="#475569"
              strokeWidth="1.5"
            />
          ))}

          {/* Treble Clef Symbol (Stylized SVG Clef) */}
          <g transform="translate(42, 28) scale(1.1)">
            <text
              x="0"
              y="85"
              fill="#94a3b8"
              fontSize="90"
              fontFamily="serif"
              className="pointer-events-none select-none font-bold"
            >
              𝄞
            </text>
          </g>

          {/* Notes rendering */}
          {staffNotes.map((note, idx) => {
            const xPos = 135 + idx * 48;
            const isPlaying = activePlayingMidi === note.midi;
            const displayName = DISPLAY_NAMES[note.pitch].sharp;

            return (
              <g
                key={`${note.pitch}-${idx}`}
                onClick={() => handleNoteClick(note.pitch, note.octave)}
                className="cursor-pointer group"
              >
                {/* Ledger line if C4 */}
                {note.yPos === 140 && (
                  <line
                    x1={xPos - 14}
                    y1={140}
                    x2={xPos + 14}
                    y2={140}
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                )}
                {/* High ledger line if A5 or higher */}
                {note.yPos <= 30 && (
                  <line
                    x1={xPos - 14}
                    y1={20}
                    x2={xPos + 14}
                    y2={20}
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                )}

                {/* Accidental sharp symbol */}
                {note.accidental === 'sharp' && (
                  <text
                    x={xPos - 16}
                    y={note.yPos + 5}
                    textAnchor="middle"
                    fill={note.isRoot ? '#f59e0b' : '#818cf8'}
                    fontSize="18"
                    fontWeight="bold"
                  >
                    ♯
                  </text>
                )}

                {/* Note stem */}
                <line
                  x1={note.yPos < 80 ? xPos - 6 : xPos + 6}
                  y1={note.yPos}
                  x2={note.yPos < 80 ? xPos - 6 : xPos + 6}
                  y2={note.yPos < 80 ? note.yPos + 35 : note.yPos - 35}
                  stroke={note.isRoot ? '#f59e0b' : isPlaying ? '#38bdf8' : '#cbd5e1'}
                  strokeWidth="2"
                  className="transition-colors"
                />

                {/* Note head (angled ellipse) */}
                <ellipse
                  cx={xPos}
                  cy={note.yPos}
                  rx="7.5"
                  ry="5.5"
                  transform={`rotate(-25 ${xPos} ${note.yPos})`}
                  className={`transition-all duration-150 ${
                    note.isRoot
                      ? 'fill-amber-400 stroke-amber-200 stroke-1'
                      : isPlaying
                      ? 'fill-cyan-400 stroke-white stroke-2'
                      : 'fill-indigo-500 group-hover:fill-indigo-400 stroke-slate-900 stroke-1'
                  }`}
                />

                {/* Note name & interval labels below */}
                <text
                  x={xPos}
                  y={height - 22}
                  textAnchor="middle"
                  className={`text-xs font-bold ${
                    note.isRoot ? 'fill-amber-400' : 'fill-slate-200'
                  }`}
                >
                  {displayName}
                </text>
                <text
                  x={xPos}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-400"
                >
                  {note.interval || ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
