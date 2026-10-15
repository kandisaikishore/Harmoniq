import {
  PitchClass,
  ScaleDefinition,
  ChordDefinition,
  DiatonicChord,
  GuitarFretNote,
  PianoKeyNote
} from '../types/music';

export const CHROMATIC_PITCHES: PitchClass[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

export const ENHARMONIC_MAP: Record<string, PitchClass> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'B#': 'C',
  'Cb': 'B',
  'E#': 'F',
  'Fb': 'E'
};

export const DISPLAY_NAMES: Record<PitchClass, { sharp: string; flat: string }> = {
  'C': { sharp: 'C', flat: 'C' },
  'C#': { sharp: 'C#', flat: 'D♭' },
  'D': { sharp: 'D', flat: 'D' },
  'D#': { sharp: 'D#', flat: 'E♭' },
  'E': { sharp: 'E', flat: 'E' },
  'F': { sharp: 'F', flat: 'F' },
  'F#': { sharp: 'F#', flat: 'G♭' },
  'G': { sharp: 'G', flat: 'G' },
  'G#': { sharp: 'G#', flat: 'A♭' },
  'A': { sharp: 'A', flat: 'A' },
  'A#': { sharp: 'A#', flat: 'B♭' },
  'B': { sharp: 'B', flat: 'B' }
};

export const INTERVAL_NAMES: Record<number, { name: string; short: string }> = {
  0: { name: 'Root (Unison)', short: 'R' },
  1: { name: 'Minor 2nd', short: '♭2' },
  2: { name: 'Major 2nd', short: '2' },
  3: { name: 'Minor 3rd', short: '♭3' },
  4: { name: 'Major 3rd', short: '3' },
  5: { name: 'Perfect 4th', short: '4' },
  6: { name: 'Diminished 5th / Tritone', short: '♭5' },
  7: { name: 'Perfect 5th', short: '5' },
  8: { name: 'Minor 6th / Aug 5th', short: '♭6' },
  9: { name: 'Major 6th / Dim 7th', short: '6' },
  10: { name: 'Minor 7th', short: '♭7' },
  11: { name: 'Major 7th', short: '7' },
  12: { name: 'Octave', short: '8' },
  13: { name: 'Minor 9th', short: '♭9' },
  14: { name: 'Major 9th', short: '9' },
  15: { name: 'Augmented 9th', short: '#9' },
  17: { name: 'Perfect 11th', short: '11' },
  18: { name: 'Augmented 11th', short: '#11' },
  21: { name: 'Major 13th', short: '13' }
};

export const SCALES: ScaleDefinition[] = [
  {
    id: 'major',
    name: 'Major (Ionian)',
    category: 'Major & Modes',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    formula: ['1', '2', '3', '4', '5', '6', '7'],
    description: 'The foundation of Western harmony. Bright, joyful, stable, and resolved.',
    mood: 'Triumphant, uplifting, balanced, pure',
    suggestedChords: ['maj7', 'maj9', 'sus4', '6']
  },
  {
    id: 'dorian',
    name: 'Dorian Mode',
    category: 'Major & Modes',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    formula: ['1', '2', '♭3', '4', '5', '6', '♭7'],
    description: 'Minor scale with a raised natural 6th. The defining sound of Miles Davis "So What", Carlos Santana, and funk groove.',
    mood: 'Soulful, groovy, bittersweet, hopeful minor',
    suggestedChords: ['m7', 'm6', 'm9', 'm11']
  },
  {
    id: 'phrygian',
    name: 'Phrygian Mode',
    category: 'Major & Modes',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    formula: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'],
    description: 'Minor scale with a dark, exotic flat 2nd. Famous in flamenco, heavy metal, and cinematic suspense.',
    mood: 'Mysterious, menacing, Spanish, tense',
    suggestedChords: ['m7', 'sus♭9', '♭II']
  },
  {
    id: 'lydian',
    name: 'Lydian Mode',
    category: 'Major & Modes',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    formula: ['1', '2', '3', '#4', '5', '6', '7'],
    description: 'Major scale with a raised sharp 4th. The hallmark sound of John Williams space themes and Steve Vai.',
    mood: 'Dreamy, ethereal, expansive, floating',
    suggestedChords: ['maj7#11', 'maj9#11']
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian Mode',
    category: 'Major & Modes',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    formula: ['1', '2', '3', '4', '5', '6', '♭7'],
    description: 'Major scale with a dominant flat 7th. Ubiquitous in classic rock, blues, funk, and Celtic music.',
    mood: 'Bluesy, driving, swaggering, earthy',
    suggestedChords: ['7', '9', '13', 'sus4']
  },
  {
    id: 'natural_minor',
    name: 'Natural Minor (Aeolian)',
    category: 'Major & Modes',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    formula: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
    description: 'The standard minor scale. Melancholic, emotional, epic, and widely used in all genres.',
    mood: 'Sad, introspective, reflective, dark',
    suggestedChords: ['m', 'm7', 'm9', 'sus2']
  },
  {
    id: 'locrian',
    name: 'Locrian Mode',
    category: 'Major & Modes',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    formula: ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7'],
    description: 'The most unstable mode with a diminished fifth (tritone) from the root.',
    mood: 'Dissonant, chaotic, unresolved, spooky',
    suggestedChords: ['m7♭5', 'dim']
  },
  {
    id: 'harmonic_minor',
    name: 'Harmonic Minor',
    category: 'Minor Variations',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    formula: ['1', '2', '♭3', '4', '5', '♭6', '7'],
    description: 'Minor scale with a natural 7th leading tone creating an augmented 2nd interval. Middle Eastern and neoclassical shred hallmark.',
    mood: 'Dramatic, neoclassical, Middle Eastern, exotic',
    suggestedChords: ['m(maj7)', 'dim7', 'V7(♭9)']
  },
  {
    id: 'melodic_minor',
    name: 'Melodic Minor (Jazz Minor)',
    category: 'Minor Variations',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    formula: ['1', '2', '♭3', '4', '5', '6', '7'],
    description: 'Minor with both major 6th and major 7th. Generates the altered scale, Lydian dominant, and Super Locrian in jazz.',
    mood: 'Sophisticated, enigmatic, modern jazz, dark-yet-bright',
    suggestedChords: ['m(maj7)', 'm6', 'm9']
  },
  {
    id: 'major_pentatonic',
    name: 'Major Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 2, 4, 7, 9],
    formula: ['1', '2', '3', '5', '6'],
    description: '5-note scale without half steps or dissonances. Never sounds bad. Country, pop, soul, and folk staple.',
    mood: 'Sweet, soulful, timeless, peaceful',
    suggestedChords: ['maj', 'add9', '6']
  },
  {
    id: 'minor_pentatonic',
    name: 'Minor Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 7, 10],
    formula: ['1', '♭3', '4', '5', '♭7'],
    description: 'The ultimate rock and blues guitar solo scale. Punchy, visceral, and expressive.',
    mood: 'Gritty, powerful, rebellious, bluesy',
    suggestedChords: ['m7', '7', 'm']
  },
  {
    id: 'blues',
    name: 'Blues Scale',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    formula: ['1', '♭3', '4', '♭5', '5', '♭7'],
    description: 'Minor pentatonic plus the expressive chromatic "blue note" (♭5).',
    mood: 'Raw, emotional, funky, bluesy',
    suggestedChords: ['7#9', '7', 'm7']
  },
  {
    id: 'bebop_dominant',
    name: 'Bebop Dominant',
    category: 'Jazz & Bebop',
    intervals: [0, 2, 4, 5, 7, 9, 10, 11],
    formula: ['1', '2', '3', '4', '5', '6', '♭7', '7'],
    description: '8-note scale allowing chord tones to fall squarely on downbeats when playing continuous eighth-notes.',
    mood: 'Swinging, kinetic, classic bebop, fluid',
    suggestedChords: ['7', '9', '13']
  },
  {
    id: 'whole_tone',
    name: 'Whole Tone',
    category: 'Jazz & Bebop',
    intervals: [0, 2, 4, 6, 8, 10],
    formula: ['1', '2', '3', '#4', '#5', '♭7'],
    description: 'Symmetrical scale composed solely of whole steps. Debussy impressionist dreamscapes and dream sequences.',
    mood: 'Floating, disorienting, dreamlike, weightless',
    suggestedChords: ['7#5', 'aug']
  },
  {
    id: 'phrygian_dominant',
    name: 'Phrygian Dominant (Spanish Gypsy)',
    category: 'Exotic & World',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    formula: ['1', '♭2', '3', '4', '5', '♭6', '♭7'],
    description: '5th mode of Harmonic Minor. Famous in Flamenco, Klezmer, and Arabic music.',
    mood: 'Passionate, Arabian, mystical, fiery',
    suggestedChords: ['7♭9', '7♭13', 'dim7']
  },
  {
    id: 'hirajoshi',
    name: 'Hirajoshi (Japanese Pentatonic)',
    category: 'Exotic & World',
    intervals: [0, 2, 3, 7, 8],
    formula: ['1', '2', '♭3', '5', '♭6'],
    description: 'Traditional Japanese koto tuning. Highly evocative of cherry blossoms, ancient temples, and meditative serenity.',
    mood: 'Zen, melancholic, ethereal, Japanese classical',
    suggestedChords: ['m(add9)', 'm(♭6)']
  }
];

export const CHORDS: ChordDefinition[] = [
  // Triads
  {
    id: 'maj_triad',
    name: 'Major Triad',
    symbol: '',
    category: 'Triads',
    intervals: [0, 4, 7],
    formula: ['1', '3', '5'],
    description: 'Fundamental consonant chord. Crisp, grounded, and bright.',
    quality: 'major'
  },
  {
    id: 'min_triad',
    name: 'Minor Triad',
    symbol: 'm',
    category: 'Triads',
    intervals: [0, 3, 7],
    formula: ['1', '♭3', '5'],
    description: 'Fundamental melancholic chord. Somber, warm, and poignant.',
    quality: 'minor'
  },
  {
    id: 'dim_triad',
    name: 'Diminished Triad',
    symbol: 'dim',
    category: 'Triads',
    intervals: [0, 3, 6],
    formula: ['1', '♭3', '♭5'],
    description: 'Tense, constricted triad with a tritone between 1 and ♭5.',
    quality: 'diminished'
  },
  {
    id: 'aug_triad',
    name: 'Augmented Triad',
    symbol: 'aug',
    category: 'Triads',
    intervals: [0, 4, 8],
    formula: ['1', '3', '#5'],
    description: 'Symmetrical stack of major thirds. Suspended, yearning, and cosmic.',
    quality: 'augmented'
  },
  {
    id: 'sus2',
    name: 'Suspended 2nd',
    symbol: 'sus2',
    category: 'Triads',
    intervals: [0, 2, 7],
    formula: ['1', '2', '5'],
    description: 'Open, ambiguous sound without the 3rd. Neutral and floating.',
    quality: 'suspended'
  },
  {
    id: 'sus4',
    name: 'Suspended 4th',
    symbol: 'sus4',
    category: 'Triads',
    intervals: [0, 5, 7],
    formula: ['1', '4', '5'],
    description: 'Creates magnetic tension pulling downward to resolve to the major 3rd.',
    quality: 'suspended'
  },

  // Seventh Chords
  {
    id: 'maj7',
    name: 'Major 7th',
    symbol: 'maj7',
    category: 'Seventh Chords',
    intervals: [0, 4, 7, 11],
    formula: ['1', '3', '5', '7'],
    description: 'Lush, breezy, sophisticated. The signature sound of bossa nova, smooth jazz, and lo-fi.',
    quality: 'major'
  },
  {
    id: 'min7',
    name: 'Minor 7th',
    symbol: 'm7',
    category: 'Seventh Chords',
    intervals: [0, 3, 7, 10],
    formula: ['1', '♭3', '5', '♭7'],
    description: 'Smooth, mellow, soulful. Essential in R&B, jazz ii-chords, and neo-soul.',
    quality: 'minor'
  },
  {
    id: 'dom7',
    name: 'Dominant 7th',
    symbol: '7',
    category: 'Seventh Chords',
    intervals: [0, 4, 7, 10],
    formula: ['1', '3', '5', '♭7'],
    description: 'Major triad with minor 7th. Houses the restless tritone (3 to ♭7) seeking tonic resolution.',
    quality: 'dominant'
  },
  {
    id: 'm7b5',
    name: 'Half-Diminished (m7♭5)',
    symbol: 'm7♭5',
    category: 'Seventh Chords',
    intervals: [0, 3, 6, 10],
    formula: ['1', '♭3', '♭5', '♭7'],
    description: 'The ii chord of minor key ii-V-i progressions. Bitter-sweet, noir, cinematic.',
    quality: 'diminished'
  },
  {
    id: 'dim7',
    name: 'Diminished 7th',
    symbol: 'dim7',
    category: 'Seventh Chords',
    intervals: [0, 3, 6, 9],
    formula: ['1', '♭3', '♭5', '♭♭7'],
    description: 'Fully symmetrical stack of minor thirds. Highly dramatic suspense chord.',
    quality: 'diminished'
  },
  {
    id: 'min_maj7',
    name: 'Minor Major 7th',
    symbol: 'm(maj7)',
    category: 'Seventh Chords',
    intervals: [0, 3, 7, 11],
    formula: ['1', '♭3', '5', '7'],
    description: 'Minor triad with piercing major 7th. The iconic James Bond spy chord.',
    quality: 'minor'
  },

  // Extended
  {
    id: 'maj9',
    name: 'Major 9th',
    symbol: 'maj9',
    category: 'Extended (9th/11th/13th)',
    intervals: [0, 4, 7, 11, 14],
    formula: ['1', '3', '5', '7', '9'],
    description: 'Sumptuous, silky jazz and neo-soul texture with high major 9th.',
    quality: 'major'
  },
  {
    id: 'min9',
    name: 'Minor 9th',
    symbol: 'm9',
    category: 'Extended (9th/11th/13th)',
    intervals: [0, 3, 7, 10, 14],
    formula: ['1', '♭3', '5', '♭7', '9'],
    description: 'Deep, atmospheric, lush minor voicing standard in modern jazz and chillhop.',
    quality: 'minor'
  },
  {
    id: 'dom9',
    name: 'Dominant 9th',
    symbol: '9',
    category: 'Extended (9th/11th/13th)',
    intervals: [0, 4, 7, 10, 14],
    formula: ['1', '3', '5', '♭7', '9'],
    description: 'Funky, punchy dominant extension favored by James Brown and funk guitarists.',
    quality: 'dominant'
  },
  {
    id: 'dom13',
    name: 'Dominant 13th',
    symbol: '13',
    category: 'Extended (9th/11th/13th)',
    intervals: [0, 4, 7, 10, 14, 21],
    formula: ['1', '3', '5', '♭7', '9', '13'],
    description: 'Rich big-band climax voicing with the sweet major 6th/13th tension.',
    quality: 'dominant'
  },
  {
    id: 'hendrix_7s9',
    name: '7#9 (The Hendrix Chord)',
    symbol: '7#9',
    category: 'Altered & Suspended',
    intervals: [0, 4, 7, 10, 15],
    formula: ['1', '3', '5', '♭7', '#9'],
    description: 'Simultaneously contains major 3rd and minor 3rd (#9). Famous in Purple Haze and psychedelic funk.',
    quality: 'dominant'
  },
  {
    id: 'dom7b9',
    name: 'Dominant 7♭9',
    symbol: '7♭9',
    category: 'Altered & Suspended',
    intervals: [0, 4, 7, 10, 13],
    formula: ['1', '3', '5', '♭7', '♭9'],
    description: 'Classic jazz minor dominant leading tightly into a minor tonic.',
    quality: 'dominant'
  },
  {
    id: 'maj7s11',
    name: 'Major 7#11 (Lydian)',
    symbol: 'maj7#11',
    category: 'Altered & Suspended',
    intervals: [0, 4, 7, 11, 18],
    formula: ['1', '3', '5', '7', '#11'],
    description: 'Hypnotic space-age voicing bringing the Lydian sharp 11 into the chord.',
    quality: 'major'
  }
];

// Calculate actual pitch classes for given root and intervals
export function getNotesForIntervals(root: PitchClass, intervals: number[]): PitchClass[] {
  const rootIndex = CHROMATIC_PITCHES.indexOf(root);
  if (rootIndex === -1) return [root];
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return CHROMATIC_PITCHES[noteIndex];
  });
}

// Convert MIDI number to pitch and octave
export function midiToPitch(midi: number): { pitch: PitchClass; octave: number } {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return {
    pitch: CHROMATIC_PITCHES[noteIndex],
    octave
  };
}

// Pitch & octave to MIDI number (C4 = 60)
export function pitchToMidi(pitch: PitchClass, octave: number): number {
  const index = CHROMATIC_PITCHES.indexOf(pitch);
  return (octave + 1) * 12 + index;
}

// Frequency for MIDI note
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Guitar standard tuning: string 0 is High E (E4 = 64), string 5 is Low E (E2 = 40)
export const GUITAR_STRINGS = [
  { name: 'e', openMidi: 64, pitch: 'E' as PitchClass, octave: 4 }, // string 1 (high E)
  { name: 'B', openMidi: 59, pitch: 'B' as PitchClass, octave: 3 }, // string 2
  { name: 'G', openMidi: 55, pitch: 'G' as PitchClass, octave: 3 }, // string 3
  { name: 'D', openMidi: 50, pitch: 'D' as PitchClass, octave: 3 }, // string 4
  { name: 'A', openMidi: 45, pitch: 'A' as PitchClass, octave: 2 }, // string 5
  { name: 'E', openMidi: 40, pitch: 'E' as PitchClass, octave: 2 }, // string 6 (low E)
];

// Generate fretboard matrix (frets 0 to 15 for each of 6 strings)
export function generateFretboard(
  root: PitchClass,
  targetNotes: PitchClass[],
  intervalsMap: Record<PitchClass, string>
): GuitarFretNote[][] {
  return GUITAR_STRINGS.map((str, stringIndex) => {
    const frets: GuitarFretNote[] = [];
    for (let fret = 0; fret <= 15; fret++) {
      const midi = str.openMidi + fret;
      const { pitch, octave } = midiToPitch(midi);
      const isTarget = targetNotes.includes(pitch);
      const isRoot = pitch === root;
      const interval = isTarget ? intervalsMap[pitch] : undefined;

      frets.push({
        stringIndex,
        stringName: str.name,
        fret,
        pitch,
        octave,
        isRoot,
        isTarget,
        interval,
        midiNumber: midi
      });
    }
    return frets;
  });
}

// Generate Piano Keys (from C3 (48) to C5 (72) - 25 keys)
export function generatePianoKeys(
  root: PitchClass,
  targetNotes: PitchClass[],
  intervalsMap: Record<PitchClass, string>
): PianoKeyNote[] {
  const keys: PianoKeyNote[] = [];
  const startMidi = 48; // C3
  const endMidi = 72;   // C5

  for (let midi = startMidi; midi <= endMidi; midi++) {
    const { pitch, octave } = midiToPitch(midi);
    const isBlack = ['C#', 'D#', 'F#', 'G#', 'A#'].includes(pitch);
    const isTarget = targetNotes.includes(pitch);
    const isRoot = pitch === root;
    const interval = isTarget ? intervalsMap[pitch] : undefined;

    keys.push({
      pitch,
      octave,
      midiNumber: midi,
      isBlack,
      isRoot,
      isTarget,
      interval
    });
  }
  return keys;
}

// Circle of Fifths Structure
export interface CircleItem {
  majorKey: PitchClass;
  minorKey: PitchClass;
  accidentals: number; // positive = sharps, negative = flats
  accidentalsStr: string;
  angle: number; // in degrees (0 at top = C)
}

export const CIRCLE_OF_FIFTHS: CircleItem[] = [
  { majorKey: 'C', minorKey: 'A', accidentals: 0, accidentalsStr: 'Natural', angle: 0 },
  { majorKey: 'G', minorKey: 'E', accidentals: 1, accidentalsStr: '1♯', angle: 30 },
  { majorKey: 'D', minorKey: 'B', accidentals: 2, accidentalsStr: '2♯', angle: 60 },
  { majorKey: 'A', minorKey: 'F#', accidentals: 3, accidentalsStr: '3♯', angle: 90 },
  { majorKey: 'E', minorKey: 'C#', accidentals: 4, accidentalsStr: '4♯', angle: 120 },
  { majorKey: 'B', minorKey: 'G#', accidentals: 5, accidentalsStr: '5♯', angle: 150 },
  { majorKey: 'F#', minorKey: 'D#', accidentals: 6, accidentalsStr: '6♯/6♭', angle: 180 },
  { majorKey: 'C#', minorKey: 'A#', accidentals: -5, accidentalsStr: '5♭ (D♭)', angle: 210 },
  { majorKey: 'G#', minorKey: 'F', accidentals: -4, accidentalsStr: '4♭ (A♭)', angle: 240 },
  { majorKey: 'D#', minorKey: 'C', accidentals: -3, accidentalsStr: '3♭ (E♭)', angle: 270 },
  { majorKey: 'A#', minorKey: 'G', accidentals: -2, accidentalsStr: '2♭ (B♭)', angle: 300 },
  { majorKey: 'F', minorKey: 'D', accidentals: -1, accidentalsStr: '1♭', angle: 330 },
];

// Diatonic Chords for a Major or Minor scale
export function getDiatonicChords(root: PitchClass, scaleType: string): DiatonicChord[] {
  const rootIdx = CHROMATIC_PITCHES.indexOf(root);
  if (scaleType === 'major' || scaleType.includes('Ionian')) {
    const degrees = [
      { num: 'I', deg: '1st', int: 0, qual: 'maj7', name: 'Major 7th', type: 'Tonic' },
      { num: 'ii', deg: '2nd', int: 2, qual: 'm7', name: 'Minor 7th', type: 'Supertonic' },
      { num: 'iii', deg: '3rd', int: 4, qual: 'm7', name: 'Minor 7th', type: 'Mediant' },
      { num: 'IV', deg: '4th', int: 5, qual: 'maj7', name: 'Major 7th', type: 'Subdominant' },
      { num: 'V', deg: '5th', int: 7, qual: '7', name: 'Dominant 7th', type: 'Dominant' },
      { num: 'vi', deg: '6th', int: 9, qual: 'm7', name: 'Minor 7th', type: 'Submediant' },
      { num: 'vii°', deg: '7th', int: 11, qual: 'm7♭5', name: 'Half-Diminished', type: 'Leading Tone' },
    ];
    return degrees.map(d => {
      const cRoot = CHROMATIC_PITCHES[(rootIdx + d.int) % 12];
      return {
        degree: d.deg,
        romanNumeral: d.num,
        root: cRoot,
        chordName: `${cRoot} ${d.name}`,
        chordSymbol: `${cRoot}${d.qual}`,
        chordType: d.type,
        notes: [cRoot] // can be expanded
      };
    });
  } else {
    // Natural Minor
    const degrees = [
      { num: 'i', deg: '1st', int: 0, qual: 'm7', name: 'Minor 7th', type: 'Tonic' },
      { num: 'ii°', deg: '2nd', int: 2, qual: 'm7♭5', name: 'Half-Diminished', type: 'Supertonic' },
      { num: '♭III', deg: '3rd', int: 3, qual: 'maj7', name: 'Major 7th', type: 'Mediant' },
      { num: 'iv', deg: '4th', int: 5, qual: 'm7', name: 'Minor 7th', type: 'Subdominant' },
      { num: 'v', deg: '5th', int: 7, qual: 'm7 / V7', name: 'Minor / Dom 7th', type: 'Dominant' },
      { num: '♭VI', deg: '6th', int: 8, qual: 'maj7', name: 'Major 7th', type: 'Submediant' },
      { num: '♭VII', deg: '7th', int: 10, qual: '7', name: 'Dominant 7th', type: 'Subtonic' },
    ];
    return degrees.map(d => {
      const cRoot = CHROMATIC_PITCHES[(rootIdx + d.int) % 12];
      return {
        degree: d.deg,
        romanNumeral: d.num,
        root: cRoot,
        chordName: `${cRoot} ${d.name}`,
        chordSymbol: `${cRoot}${d.qual}`,
        chordType: d.type,
        notes: [cRoot]
      };
    });
  }
}
