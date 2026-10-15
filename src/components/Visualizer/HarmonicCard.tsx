import React, { useState } from 'react';
import { PitchClass, ScaleDefinition, ChordDefinition } from '../../types/music';
import { DISPLAY_NAMES, getDiatonicChords, INTERVAL_NAMES, pitchToMidi } from '../../utils/musicTheory';
import { soundEngine, InstrumentType } from '../../utils/audioSynth';
import { Play, Volume2, Sparkles, Music2, Layers, Bookmark, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface HarmonicCardProps {
  type: 'scale' | 'chord';
  root: PitchClass;
  scale?: ScaleDefinition;
  chord?: ChordDefinition;
  targetNotes: PitchClass[];
  onSelectChordOrScale?: (action: { root: PitchClass; type: 'scale' | 'chord'; name: string }) => void;
  onPlayingMidiChange?: (midi: number | null) => void;
}

export const HarmonicCard: React.FC<HarmonicCardProps> = ({
  type,
  root,
  scale,
  chord,
  targetNotes,
  onSelectChordOrScale,
  onPlayingMidiChange,
}) => {
  const { user, signIn } = useAuth();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const rootDisplay = DISPLAY_NAMES[root].sharp;
  const currentTitle = type === 'scale' ? `${rootDisplay} ${scale?.name}` : `${rootDisplay} ${chord?.name}`;
  const formula = type === 'scale' ? scale?.formula || [] : chord?.formula || [];
  const description = type === 'scale' ? scale?.description : chord?.description;
  const mood = type === 'scale' ? scale?.mood : chord?.quality;

  const diatonicChords = type === 'scale' ? getDiatonicChords(root, scale?.id || 'major') : [];

  const handleInstrumentChange = (inst: InstrumentType) => {
    setInstrument(inst);
    soundEngine.setInstrument(inst);
  };

  const handlePlayArpeggio = () => {
    setIsPlaying(true);
    // Convert target notes to ascending MIDI numbers in octave 3 & 4
    const intervals = type === 'scale' ? scale?.intervals || [] : chord?.intervals || [];
    const rootMidi = pitchToMidi(root, 3);
    const midis = intervals.map(int => rootMidi + int);
    // Add octave note at the end for scales
    if (type === 'scale' && intervals[intervals.length - 1] !== 12) {
      midis.push(rootMidi + 12);
    }

    soundEngine.playArpeggio(
      midis,
      0.22,
      (midi) => {
        if (onPlayingMidiChange) onPlayingMidiChange(midi);
      },
      () => {
        setIsPlaying(false);
        if (onPlayingMidiChange) onPlayingMidiChange(null);
      }
    );
  };

  const handlePlayChordStrum = () => {
    setIsPlaying(true);
    const intervals = type === 'scale' ? [0, 4, 7] : chord?.intervals || [0, 4, 7];
    const rootMidi = pitchToMidi(root, 3);
    const midis = intervals.map(int => rootMidi + int);

    soundEngine.playStrum(midis, 'down', () => {
      setIsPlaying(false);
    });
  };

  const handleDiatonicChordClick = (c: { root: PitchClass; chordSymbol: string }) => {
    if (onSelectChordOrScale) {
      // Find matching chord
      onSelectChordOrScale({
        root: c.root,
        type: 'chord',
        name: c.chordSymbol.replace(c.root, '') || 'Major Triad'
      });
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      await signIn();
      return;
    }
    setIsSaving(true);
    const safeName = (type === 'scale' ? scale?.name || 'Scale' : chord?.name || 'Chord').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const progressionId = `${type}_${root}_${safeName}`;
    const path = `users/${user.uid}/savedProgressions/${progressionId}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'savedProgressions', progressionId), {
        id: progressionId,
        userId: user.uid,
        title: currentTitle,
        root,
        type,
        name: type === 'scale' ? scale?.name || 'Scale' : chord?.name || 'Chord',
        notes: targetNotes.join(', '),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Top Header & Audio trigger bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                type === 'scale'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {type === 'scale' ? 'Scale / Mode' : 'Chord Voicing'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Formula: {formula.join(' – ')}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {currentTitle}
            {chord?.symbol && (
              <span className="text-base text-amber-400 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                {rootDisplay}{chord.symbol}
              </span>
            )}
          </h2>
        </div>

        {/* Playback Controls & Timbre selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Instrument Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['piano', 'rhodes', 'pluck', 'synth'] as InstrumentType[]).map((inst) => (
              <button
                key={inst}
                type="button"
                onClick={() => handleInstrumentChange(inst)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                  instrument === inst
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {inst}
              </button>
            ))}
          </div>

          {/* Arpeggio Button */}
          <button
            type="button"
            disabled={isPlaying}
            onClick={handlePlayArpeggio}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : 'fill-white'}`} />
            Arpeggio
          </button>

          {/* Strum Button */}
          <button
            type="button"
            disabled={isPlaying}
            onClick={handlePlayChordStrum}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/30 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Music2 className="w-3.5 h-3.5" />
            Strum Voicing
          </button>

          {/* Bookmark / Cloud Save Button */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveToCloud}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isSaved
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={user ? 'Save to your cloud collection' : 'Sign in to save to your cloud collection'}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isSaved ? 'Saved' : user ? 'Save' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Note Spells & Intervals Pills */}
      <div>
        <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
          Pitches & Harmonic Degrees
        </h4>
        <div className="flex flex-wrap gap-2">
          {targetNotes.map((pitch, idx) => {
            const isRoot = pitch === root;
            const intervalFormula = formula[idx] || '';
            const intervalSemitones = type === 'scale' ? scale?.intervals[idx] : chord?.intervals[idx];
            const intervalDetails = intervalSemitones !== undefined ? INTERVAL_NAMES[intervalSemitones % 12]?.name : '';

            return (
              <div
                key={pitch}
                className={`px-3 py-2 rounded-xl border flex flex-col items-center min-w-[70px] ${
                  isRoot
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-base font-black ${isRoot ? 'text-amber-400' : 'text-white'}`}>
                    {DISPLAY_NAMES[pitch].sharp}
                  </span>
                  {DISPLAY_NAMES[pitch].sharp !== DISPLAY_NAMES[pitch].flat && (
                    <span className="text-[10px] text-slate-500">
                      /{DISPLAY_NAMES[pitch].flat}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-indigo-400 mt-0.5">
                  {intervalFormula}
                </span>
                <span className="text-[9px] text-slate-400 truncate max-w-[80px]">
                  {intervalDetails}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Description & Mood */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Theoretical Character
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Emotional Mood & Texture
          </div>
          <p className="text-xs text-amber-300/90 font-medium leading-relaxed">
            {mood}
          </p>
        </div>
      </div>

      {/* Diatonic Chord Progression Harmony Matrix (if scale) */}
      {type === 'scale' && diatonicChords.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Diatonic Harmony Matrix ({scale?.name})
            </h4>
            <span className="text-[11px] text-slate-500">
              Click a chord to load into visualizer
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {diatonicChords.map((chordObj) => (
              <button
                key={chordObj.degree}
                type="button"
                onClick={() => handleDiatonicChordClick(chordObj)}
                className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {chordObj.romanNumeral}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase">
                    {chordObj.chordType}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white group-hover:text-indigo-300">
                  {chordObj.chordSymbol}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
