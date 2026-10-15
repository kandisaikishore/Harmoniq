export type PitchClass = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type EnharmonicPitch = 'Db' | 'Eb' | 'Gb' | 'Ab' | 'Bb';

export type NoteName = PitchClass | EnharmonicPitch;

export interface IntervalInfo {
  semitones: number;
  name: string;
  shortName: string;
  degree: string;
}

export interface ScaleDefinition {
  id: string;
  name: string;
  category: 'Major & Modes' | 'Minor Variations' | 'Pentatonic & Blues' | 'Jazz & Bebop' | 'Exotic & World';
  intervals: number[]; // semitones from root (e.g. [0, 2, 4, 5, 7, 9, 11])
  formula: string[]; // ['1', '2', '3', '4', '5', '6', '7']
  description: string;
  mood: string;
  suggestedChords?: string[];
}

export interface ChordDefinition {
  id: string;
  name: string;
  symbol: string;
  category: 'Triads' | 'Seventh Chords' | 'Extended (9th/11th/13th)' | 'Altered & Suspended';
  intervals: number[]; // semitones from root (e.g. [0, 4, 7, 10])
  formula: string[]; // ['1', '3', '5', 'b7']
  description: string;
  quality: 'major' | 'minor' | 'dominant' | 'diminished' | 'augmented' | 'suspended';
}

export interface ActiveMusicState {
  type: 'scale' | 'chord';
  root: PitchClass;
  scaleId: string;
  chordId: string;
}

export interface DiatonicChord {
  degree: string;
  romanNumeral: string;
  root: PitchClass;
  chordName: string;
  chordSymbol: string;
  chordType: string;
  notes: PitchClass[];
}

export interface GuitarFretNote {
  stringIndex: number; // 0 (high E) to 5 (low E)
  stringName: string;
  fret: number;
  pitch: PitchClass;
  octave: number;
  isRoot: boolean;
  isTarget: boolean;
  interval?: string;
  midiNumber: number;
}

export interface PianoKeyNote {
  pitch: PitchClass;
  octave: number;
  midiNumber: number;
  isBlack: boolean;
  isRoot: boolean;
  isTarget: boolean;
  interval?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  rolePersona?: string;
  visualizeAction?: {
    root: PitchClass;
    type: 'scale' | 'chord';
    name: string;
  };
}

export type ChatRole = 'maestro' | 'guitar_guru' | 'producer' | 'songwriter';
export type GeminiModel = 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';
export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface GeneratedImageItem {
  id: string;
  imageUrl: string;
  prompt: string;
  imageSize: ImageSize;
  aspectRatio: AspectRatio;
  createdAt: string;
  explanation?: string;
}
