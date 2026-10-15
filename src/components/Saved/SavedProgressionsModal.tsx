import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { PitchClass } from '../../types/music';
import { DISPLAY_NAMES, pitchToMidi } from '../../utils/musicTheory';
import { soundEngine } from '../../utils/audioSynth';
import { Bookmark, Trash2, Play, ArrowRight, X, Music, Sparkles } from 'lucide-react';

export interface SavedProgressionItem {
  id: string;
  userId: string;
  title: string;
  root: PitchClass;
  type: 'scale' | 'chord';
  name: string;
  notes?: string;
  createdAt?: any;
}

interface SavedProgressionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProgression: (item: { root: PitchClass; type: 'scale' | 'chord'; name: string }) => void;
}

export const SavedProgressionsModal: React.FC<SavedProgressionsModalProps> = ({
  isOpen,
  onClose,
  onLoadProgression,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedProgressionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isOpen) {
      setItems([]);
      setLoading(false);
      return;
    }

    const path = `users/${user.uid}/savedProgressions`;
    const colRef = collection(db, path);
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: SavedProgressionItem[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setItems(loaded);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isOpen]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/savedProgressions/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'savedProgressions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handlePlay = (item: SavedProgressionItem) => {
    setPlayingId(item.id);
    const rootMidi = pitchToMidi(item.root, 3);
    if (item.type === 'scale') {
      soundEngine.playArpeggio([rootMidi, rootMidi + 2, rootMidi + 4, rootMidi + 5, rootMidi + 7, rootMidi + 9, rootMidi + 11, rootMidi + 12], 0.16, undefined, () => {
        setPlayingId(null);
      });
    } else {
      soundEngine.playStrum([rootMidi, rootMidi + 4, rootMidi + 7, rootMidi + 11], 'down', () => {
        setPlayingId(null);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                My Saved Progressions & Chords
              </h3>
              <p className="text-xs text-slate-400">
                Synced to your Firebase account ({user?.email})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading saved items from Firestore...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                No saved items yet
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                While exploring scales and chord voicings in the studio, click the "Bookmark" icon to save them to your cloud collection.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const rootDisplay = DISPLAY_NAMES[item.root]?.sharp || item.root;
              const isPlaying = playingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handlePlay(item)}
                      className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Play className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            item.type === 'scale'
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {item.type}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {rootDisplay} {item.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadProgression({
                          root: item.root,
                          type: item.type,
                          name: item.name,
                        });
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-600/30"
                    >
                      <span>Load in Studio</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
