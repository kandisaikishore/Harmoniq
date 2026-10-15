import React, { useState, useMemo } from 'react';
import { PitchClass, ScaleDefinition, ChordDefinition } from './types/music';
import {
  CHROMATIC_PITCHES,
  SCALES,
  CHORDS,
  DISPLAY_NAMES,
  getNotesForIntervals,
  ENHARMONIC_MAP,
} from './utils/musicTheory';
import { Header, ActiveTab } from './components/Header';
import { VisualizerControls } from './components/Visualizer/VisualizerControls';
import { PianoKeyboard } from './components/Visualizer/PianoKeyboard';
import { GuitarFretboard } from './components/Visualizer/GuitarFretboard';
import { CircleOfFifths } from './components/Visualizer/CircleOfFifths';
import { StaffVisualizer } from './components/Visualizer/StaffVisualizer';
import { HarmonicCard } from './components/Visualizer/HarmonicCard';
import { MusicChat } from './components/Chat/MusicChat';
import { MusicImageStudio } from './components/ImageGen/MusicImageStudio';
import { TheoryLibrary } from './components/Reference/TheoryLibrary';
import { SavedProgressionsModal } from './components/Saved/SavedProgressionsModal';
import { Piano, Guitar, Compass, FileMusic, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('visualizer');
  const [type, setType] = useState<'scale' | 'chord'>('scale');
  const [root, setRoot] = useState<PitchClass>('C');
  const [scaleId, setScaleId] = useState<string>('major');
  const [chordId, setChordId] = useState<string>('maj7');
  const [activePlayingMidi, setActivePlayingMidi] = useState<number | null>(null);
  const [isParsingQuery, setIsParsingQuery] = useState(false);
  const [queryNotification, setQueryNotification] = useState<string | null>(null);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  // Sub-view layout for Visualizer Studio
  const [visualizerLayout, setVisualizerLayout] = useState<'all' | 'piano' | 'fretboard' | 'circle_staff'>('all');

  // Currently selected scale or chord object
  const currentScale = useMemo(() => {
    return SCALES.find(s => s.id === scaleId) || SCALES[0];
  }, [scaleId]);

  const currentChord = useMemo(() => {
    return CHORDS.find(c => c.id === chordId) || CHORDS[0];
  }, [chordId]);

  const currentSelectionName = type === 'scale' ? currentScale.name : currentChord.name;

  // Compute target pitches and intervals map
  const { targetNotes, intervalsMap } = useMemo(() => {
    const intervals = type === 'scale' ? currentScale.intervals : currentChord.intervals;
    const formula = type === 'scale' ? currentScale.formula : currentChord.formula;

    const notes = getNotesForIntervals(root, intervals);
    const map: Record<PitchClass, string> = {} as any;

    notes.forEach((pitch, idx) => {
      map[pitch] = formula[idx] || '';
    });

    return { targetNotes: notes, intervalsMap: map };
  }, [type, root, currentScale, currentChord]);

  // Handle Natural Language query parse from AI
  const handleAIParseQuery = async (queryText: string) => {
    setIsParsingQuery(true);
    setQueryNotification(null);

    try {
      const res = await fetch('/api/parse-music-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse request');

      if (data.root) {
        // Normalize root (e.g. Db -> C#)
        let resolvedRoot = data.root.trim();
        if (ENHARMONIC_MAP[resolvedRoot]) {
          resolvedRoot = ENHARMONIC_MAP[resolvedRoot];
        }
        if (CHROMATIC_PITCHES.includes(resolvedRoot as PitchClass)) {
          setRoot(resolvedRoot as PitchClass);
        }
      }

      if (data.type === 'scale' || data.type === 'chord') {
        setType(data.type);
      }

      if (data.name) {
        const queryLower = data.name.toLowerCase();
        if (data.type === 'scale') {
          const match = SCALES.find(s =>
            s.name.toLowerCase().includes(queryLower) ||
            s.id.toLowerCase().includes(queryLower)
          );
          if (match) setScaleId(match.id);
        } else {
          const match = CHORDS.find(c =>
            c.name.toLowerCase().includes(queryLower) ||
            c.symbol.toLowerCase() === queryLower ||
            c.id.toLowerCase().includes(queryLower)
          );
          if (match) setChordId(match.id);
        }
      }

      setQueryNotification(`✨ Visualizing ${data.root || ''} ${data.name || queryText} (${data.type || type})`);
      setTimeout(() => setQueryNotification(null), 5000);
    } catch (err: any) {
      console.error(err);
      setQueryNotification(`Could not parse: ${err.message}`);
      setTimeout(() => setQueryNotification(null), 4000);
    } finally {
      setIsParsingQuery(false);
    }
  };

  // Handle action from Chatbot or Library
  const handleLoadInVisualizer = (action: { root: PitchClass; type: 'scale' | 'chord'; name: string }) => {
    let resolvedRoot = action.root;
    if (ENHARMONIC_MAP[resolvedRoot]) {
      resolvedRoot = ENHARMONIC_MAP[resolvedRoot];
    }
    if (CHROMATIC_PITCHES.includes(resolvedRoot)) {
      setRoot(resolvedRoot);
    }

    setType(action.type);

    const nameLower = action.name.toLowerCase().trim();
    if (action.type === 'scale') {
      const match = SCALES.find(s =>
        s.name.toLowerCase().includes(nameLower) ||
        nameLower.includes(s.name.toLowerCase()) ||
        s.id.toLowerCase().includes(nameLower) ||
        nameLower.includes(s.id.toLowerCase())
      );
      if (match) setScaleId(match.id);
    } else {
      const match = CHORDS.find(c =>
        c.name.toLowerCase().includes(nameLower) ||
        nameLower.includes(c.name.toLowerCase()) ||
        c.symbol.toLowerCase() === nameLower ||
        (c.symbol && nameLower.includes(c.symbol.toLowerCase())) ||
        c.id.toLowerCase().includes(nameLower)
      );
      if (match) setChordId(match.id);
    }

    setActiveTab('visualizer');
    setQueryNotification(`Loaded ${action.root} ${action.name} into Studio!`);
    setTimeout(() => setQueryNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRoot={root}
        currentSelectionName={currentSelectionName}
        currentType={type}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Floating Notification */}
        {queryNotification && (
          <div className="bg-indigo-600/90 text-white px-4 py-2.5 rounded-xl border border-indigo-400 shadow-xl flex items-center justify-between text-xs font-semibold backdrop-blur-md animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{queryNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setQueryNotification(null)}
              className="text-indigo-200 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Visualizer Studio */}
        {activeTab === 'visualizer' && (
          <div className="space-y-6">
            {/* Top Control Bar with AI Search and Root/Scale Selectors */}
            <VisualizerControls
              type={type}
              root={root}
              scaleId={scaleId}
              chordId={chordId}
              onTypeChange={setType}
              onRootChange={setRoot}
              onScaleChange={setScaleId}
              onChordChange={setChordId}
              onAIParseQuery={handleAIParseQuery}
              isParsingQuery={isParsingQuery}
            />

            {/* Harmonic Analysis & Audio Playback Card */}
            <HarmonicCard
              type={type}
              root={root}
              scale={currentScale}
              chord={currentChord}
              targetNotes={targetNotes}
              onSelectChordOrScale={handleLoadInVisualizer}
              onPlayingMidiChange={setActivePlayingMidi}
            />

            {/* Instrument View Toggles */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visualization Instruments
              </span>

              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setVisualizerLayout('all')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    visualizerLayout === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>All Views</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualizerLayout('piano')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    visualizerLayout === 'piano' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Piano className="w-3.5 h-3.5" />
                  <span>Piano</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualizerLayout('fretboard')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    visualizerLayout === 'fretboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Guitar className="w-3.5 h-3.5" />
                  <span>Fretboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualizerLayout('circle_staff')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    visualizerLayout === 'circle_staff' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Circle & Staff</span>
                </button>
              </div>
            </div>

            {/* Visualizer Display Sections */}
            {(visualizerLayout === 'all' || visualizerLayout === 'piano') && (
              <PianoKeyboard
                root={root}
                targetNotes={targetNotes}
                intervalsMap={intervalsMap}
                activePlayingMidi={activePlayingMidi}
                onPlayNote={(midi) => setActivePlayingMidi(midi)}
              />
            )}

            {(visualizerLayout === 'all' || visualizerLayout === 'fretboard') && (
              <GuitarFretboard
                root={root}
                targetNotes={targetNotes}
                intervalsMap={intervalsMap}
                activePlayingMidi={activePlayingMidi}
                onPlayNote={(midi) => setActivePlayingMidi(midi)}
              />
            )}

            {(visualizerLayout === 'all' || visualizerLayout === 'circle_staff') && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 flex">
                  <CircleOfFifths
                    currentRoot={root}
                    onSelectRoot={(newRoot, mode) => {
                      setRoot(newRoot);
                      if (mode === 'minor') {
                        if (type === 'scale') {
                          setScaleId('natural_minor');
                        } else {
                          setChordId('min_triad');
                        }
                      } else if (mode === 'major') {
                        if (type === 'scale') {
                          setScaleId('major');
                        } else {
                          setChordId('maj_triad');
                        }
                      }
                    }}
                  />
                </div>
                <div className="lg:col-span-6 flex">
                  <StaffVisualizer
                    root={root}
                    targetNotes={targetNotes}
                    intervalsMap={intervalsMap}
                    activePlayingMidi={activePlayingMidi}
                    onPlayNote={(midi) => setActivePlayingMidi(midi)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Harmony Chat */}
        {activeTab === 'chat' && (
          <div className="max-w-5xl mx-auto">
            <MusicChat
              onLoadInVisualizer={handleLoadInVisualizer}
              currentRoot={root}
              currentSelectionName={currentSelectionName}
            />
          </div>
        )}

        {/* Tab 3: AI Image Studio (gemini-3-pro-image-preview) */}
        {activeTab === 'image_studio' && (
          <div className="max-w-6xl mx-auto">
            <MusicImageStudio
              currentRoot={root}
              currentSelectionName={currentSelectionName}
            />
          </div>
        )}

        {/* Tab 4: Harmonic Reference Library */}
        {activeTab === 'reference' && (
          <div className="max-w-6xl mx-auto">
            <TheoryLibrary
              currentRoot={root}
              onSelectScale={(id) => {
                setType('scale');
                setScaleId(id);
              }}
              onSelectChord={(id) => {
                setType('chord');
                setChordId(id);
              }}
              onNavigateToVisualizer={() => setActiveTab('visualizer')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">Harmoniq Studio</span>
            <span>—</span>
            <span>Interactive Music Theory Engine & Visualizer</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Web Audio API Polyphonic Synthesizer</span>
            <span>•</span>
            <span>Gemini AI Integration</span>
          </div>
        </div>
      </footer>

      {/* Saved Progressions Modal */}
      <SavedProgressionsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onLoadProgression={handleLoadInVisualizer}
      />
    </div>
  );
}
