import React from 'react';
import { PitchClass } from '../../types/music';
import { CIRCLE_OF_FIFTHS, DISPLAY_NAMES } from '../../utils/musicTheory';
import { soundEngine } from '../../utils/audioSynth';
import { pitchToMidi } from '../../utils/musicTheory';

interface CircleOfFifthsProps {
  currentRoot: PitchClass;
  onSelectRoot: (pitch: PitchClass, mode?: 'major' | 'minor') => void;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  currentRoot,
  onSelectRoot,
}) => {
  // SVG dimensions
  const size = 380;
  const center = size / 2;
  const outerRadius = 165;
  const midRadius = 118;
  const innerRadius = 72;

  // Helper to convert polar coordinates to Cartesian
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    // Offset by -90 deg so 0 deg is at 12 o'clock (top)
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Generate SVG path for a donut segment slice
  const describeArcSegment = (
    centerX: number,
    centerY: number,
    startAngle: number,
    endAngle: number,
    innerR: number,
    outerR: number
  ) => {
    const startOuter = polarToCartesian(centerX, centerY, outerR, endAngle);
    const endOuter = polarToCartesian(centerX, centerY, outerR, startAngle);
    const startInner = polarToCartesian(centerX, centerY, innerR, endAngle);
    const endInner = polarToCartesian(centerX, centerY, innerR, startAngle);

    const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', startOuter.x, startOuter.y,
      'A', outerR, outerR, 0, arcSweep, 0, endOuter.x, endOuter.y,
      'L', endInner.x, endInner.y,
      'A', innerR, innerR, 0, arcSweep, 1, startInner.x, startInner.y,
      'Z',
    ].join(' ');
  };

  const handleKeyClick = (pitch: PitchClass, mode: 'major' | 'minor') => {
    soundEngine.playNote(pitchToMidi(pitch, 4), 1.0);
    onSelectRoot(pitch, mode);
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl backdrop-blur-md flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
            Interactive Circle of Fifths
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Click any key to transpose
        </span>
      </div>

      <div className="relative flex items-center justify-center p-2">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none drop-shadow-2xl"
        >
          <defs>
            <radialGradient id="circleCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#312e81" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          {/* Outer circle slices (Major keys) */}
          {CIRCLE_OF_FIFTHS.map((item) => {
            const isSelected = item.majorKey === currentRoot;
            const sliceAngle = 30;
            const startAngle = item.angle - sliceAngle / 2;
            const endAngle = item.angle + sliceAngle / 2;

            const pathData = describeArcSegment(
              center,
              center,
              startAngle,
              endAngle,
              midRadius + 2,
              outerRadius
            );

            const textPos = polarToCartesian(center, center, (outerRadius + midRadius) / 2, item.angle);
            const label = DISPLAY_NAMES[item.majorKey].sharp;

            return (
              <g
                key={`major-${item.majorKey}`}
                onClick={() => handleKeyClick(item.majorKey, 'major')}
                className="cursor-pointer transition-all duration-200 group"
              >
                <path
                  d={pathData}
                  className={`transition-colors duration-150 stroke-slate-950 stroke-[1.5] ${
                    isSelected
                      ? 'fill-amber-500 hover:fill-amber-400 filter drop-shadow(0 0 10px rgba(245,158,11,0.6))'
                      : 'fill-slate-800/90 hover:fill-slate-700/90'
                  }`}
                />
                <text
                  x={textPos.x}
                  y={textPos.y + 4}
                  textAnchor="middle"
                  className={`text-sm font-bold pointer-events-none ${
                    isSelected ? 'fill-slate-950 font-extrabold' : 'fill-slate-200 group-hover:fill-white'
                  }`}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Inner circle slices (Minor keys) */}
          {CIRCLE_OF_FIFTHS.map((item) => {
            const isSelected = item.minorKey === currentRoot;
            const sliceAngle = 30;
            const startAngle = item.angle - sliceAngle / 2;
            const endAngle = item.angle + sliceAngle / 2;

            const pathData = describeArcSegment(
              center,
              center,
              startAngle,
              endAngle,
              innerRadius + 2,
              midRadius
            );

            const textPos = polarToCartesian(center, center, (midRadius + innerRadius) / 2, item.angle);
            const label = `${DISPLAY_NAMES[item.minorKey].sharp}m`;

            return (
              <g
                key={`minor-${item.minorKey}`}
                onClick={() => handleKeyClick(item.minorKey, 'minor')}
                className="cursor-pointer transition-all duration-200 group"
              >
                <path
                  d={pathData}
                  className={`transition-colors duration-150 stroke-slate-950 stroke-[1.5] ${
                    isSelected
                      ? 'fill-indigo-500 hover:fill-indigo-400 filter drop-shadow(0 0 8px rgba(99,102,241,0.6))'
                      : 'fill-slate-900/95 hover:fill-slate-800'
                  }`}
                />
                <text
                  x={textPos.x}
                  y={textPos.y + 3}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold pointer-events-none ${
                    isSelected ? 'fill-white font-bold' : 'fill-slate-400 group-hover:fill-slate-200'
                  }`}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Center Hub */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 4}
            fill="url(#circleCenterGlow)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Active Key Center Info */}
          <text
            x={center}
            y={center - 12}
            textAnchor="middle"
            className="text-[10px] uppercase font-bold tracking-widest fill-amber-400"
          >
            Tonic Root
          </text>
          <text
            x={center}
            y={center + 14}
            textAnchor="middle"
            className="text-2xl font-black fill-white"
          >
            {DISPLAY_NAMES[currentRoot].sharp}
          </text>
          <text
            x={center}
            y={center + 30}
            textAnchor="middle"
            className="text-[10px] font-mono fill-slate-400"
          >
            {CIRCLE_OF_FIFTHS.find(c => c.majorKey === currentRoot)?.accidentalsStr || 'Key'}
          </text>
        </svg>
      </div>

      {/* Legend & quick harmonic hints */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-300">Outer: Major Keys (I)</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="text-slate-300">Inner: Relative Minors (vi)</span>
        </div>
      </div>
    </div>
  );
};
