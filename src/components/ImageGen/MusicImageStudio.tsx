import React, { useState } from 'react';
import { AspectRatio, GeneratedImageItem, ImageSize, PitchClass } from '../../types/music';
import { DISPLAY_NAMES } from '../../utils/musicTheory';
import {
  Sparkles,
  Download,
  Maximize2,
  X,
  Palette,
  Layers,
  Image as ImageIcon,
  Check,
  Copy,
  AlertCircle
} from 'lucide-react';

interface MusicImageStudioProps {
  currentRoot: PitchClass;
  currentSelectionName: string;
}

export const MusicImageStudio: React.FC<MusicImageStudioProps> = ({
  currentRoot,
  currentSelectionName,
}) => {
  const [prompt, setPrompt] = useState(
    `Vintage Bauhaus infographic poster of the Circle of Fifths in ${DISPLAY_NAMES[currentRoot].sharp} major, astronomical orbital rings, clean modernist typography, brass and indigo geometric lines, high detail diagram`
  );
  const [imageSize, setImageSize] = useState<ImageSize>('2K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<GeneratedImageItem | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Gallery of generated images
  const [gallery, setGallery] = useState<GeneratedImageItem[]>([
    {
      id: 'sample-1',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      prompt: 'Ornate classical music sheet with vintage brass instruments and harmonic waves in deep amber and navy',
      imageSize: '2K',
      aspectRatio: '1:1',
      createdAt: 'Demo Reference',
      explanation: 'Generated with gemini-3-pro-image-preview',
    },
    {
      id: 'sample-2',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      prompt: 'Neon cybernetic guitar fretboard visualizing modal lighting pathways in violet and cyan',
      imageSize: '4K',
      aspectRatio: '16:9',
      createdAt: 'Demo Reference',
      explanation: 'Generated with gemini-3-pro-image-preview at 4K resolution',
    }
  ]);

  const presetPrompts = [
    {
      title: 'Circle of Fifths Art Poster',
      text: `Vintage Bauhaus infographic poster of the Circle of Fifths in ${DISPLAY_NAMES[currentRoot].sharp} major with astronomical planetary orbits, clean typography, brass and indigo geometry, sharp vector diagram`
    },
    {
      title: 'Cyberpunk Fretboard Blueprint',
      text: `Futuristic neon architectural blueprint of a 6-string guitar fretboard highlighting ${DISPLAY_NAMES[currentRoot].sharp} ${currentSelectionName} notes with glowing laser wires, holographic grid, cyan and amber HUD`
    },
    {
      title: 'Medieval Jazz Manuscript',
      text: `Illuminated medieval parchment manuscript detailing jazz chord voicings (${DISPLAY_NAMES[currentRoot].sharp} maj9 and 13th extensions), ornate gothic calligraphy, gold leaf embellishments, ancient music notation`
    },
    {
      title: 'Minimalist Wave Frequency Print',
      text: `Minimalist Swiss modernist art print illustrating harmonic overtone series, pure sine waves, mathematical pitch ratios of ${DISPLAY_NAMES[currentRoot].sharp}, textured off-white paper and matte black ink`
    }
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageSize,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      const newItem: GeneratedImageItem = {
        id: `img-${Date.now()}`,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        imageSize: data.imageSize,
        aspectRatio: data.aspectRatio,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        explanation: data.explanation || 'Generated using gemini-3-pro-image-preview',
      };

      setGallery(prev => [newItem, ...prev]);
      setSelectedImageModal(newItem);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Image generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImageItem) => {
    if (img.imageUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = img.imageUrl;
      link.download = `harmoniq-${img.imageSize}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      fetch(img.imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `harmoniq-${img.imageSize}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          window.open(img.imageUrl, '_blank');
        });
    }
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              gemini-3-pro-image-preview
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Ultra High-Res Studio
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Music Theory Infographic & Visual Art Generator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create high-fidelity chord posters, vintage scale charts, and architectural music infographics.
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerate} className="space-y-4 bg-slate-950/70 p-4 md:p-5 rounded-2xl border border-slate-800/90">
        {/* Prompt Input Area */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Visual Artwork / Infographic Prompt</span>
            <span className="text-[11px] font-normal text-slate-400">
              Active Root: <strong className="text-amber-400">{DISPLAY_NAMES[currentRoot].sharp}</strong>
            </span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Describe the music theory poster, diagram, or album artwork you want to create..."
            className="w-full bg-slate-900 rounded-xl border border-slate-700 p-3 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner resize-none"
          />
        </div>

        {/* Prompt Presets */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Curated Music Theory Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {presetPrompts.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(preset.text)}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 flex items-center justify-between">
                  <span>{preset.title}</span>
                  <Palette className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-1">
                  {preset.text}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Affordances: Image Size (1K, 2K, 4K) & Aspect Ratio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          {/* CRITICAL AFFORDANCE: Image Size (1K, 2K, 4K) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Image Resolution (Size)
              </label>
              <span className="text-[11px] text-indigo-400 font-mono font-semibold">
                Selected: {imageSize}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setImageSize(size)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    imageSize === size
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black border-indigo-400 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850 font-bold'
                  }`}
                >
                  <div className="text-sm">{size}</div>
                  <div className="text-[9px] font-normal opacity-80">
                    {size === '1K' ? '1024px Standard' : size === '2K' ? '2048px High-Res' : '4096px Ultra-Fine'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                Aspect Ratio
              </label>
              <span className="text-[11px] text-amber-400 font-mono font-semibold">
                {aspectRatio}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    aspectRatio === ratio
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-600/30 font-black'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Generation Notice:</strong>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin text-lg">✨</span>
                <span>Synthesizing {imageSize} Visual ({aspectRatio})...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate High-Quality {imageSize} Artwork</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            Studio Gallery ({gallery.length} Images)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Powered by gemini-3-pro-image-preview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((img) => (
            <div
              key={img.id}
              className="group relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col"
            >
              {/* Image preview */}
              <div
                className="relative aspect-square w-full bg-slate-900 overflow-hidden cursor-pointer"
                onClick={() => setSelectedImageModal(img)}
              >
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <span className="p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>

                {/* Resolution & Ratio Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-indigo-300 border border-indigo-500/40 shadow-sm">
                    {img.imageSize}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700">
                    {img.aspectRatio}
                  </span>
                </div>
              </div>

              {/* Caption & Actions */}
              <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {img.prompt}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                  <span>{img.createdAt}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(img.id, img.prompt)}
                      className="p-1.5 hover:text-slate-200 transition-colors"
                      title="Copy prompt"
                    >
                      {copiedPromptId === img.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(img)}
                      className="p-1.5 hover:text-indigo-400 transition-colors"
                      title="Download PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {selectedImageModal.imageSize} ({selectedImageModal.aspectRatio})
                </span>
                <span className="text-xs text-slate-400 truncate max-w-md">
                  {selectedImageModal.prompt}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
              <img
                src={selectedImageModal.imageUrl}
                alt={selectedImageModal.prompt}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-300 max-w-xl">
                {selectedImageModal.prompt}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPrompt('modal', selectedImageModal.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedPromptId === 'modal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Prompt
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(selectedImageModal)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Full {selectedImageModal.imageSize} PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
