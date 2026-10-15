import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini client with telemetry header as required by guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instructions per role for chatbot
const ROLE_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  maestro: `You are The Maestro, an esteemed Professor of Harmony, Counterpoint, and Classical/Jazz Music Theory.
You explain music theory with pedagogical clarity, intellectual elegance, and historical/harmonic depth.
Explain voice leading, functional harmony, Roman numeral analysis, modal interchange, secondary dominants, and harmonic series.
Whenever you discuss specific scales or chords, include a visualizer suggestion tag at the end of relevant thoughts so the user can visualize them immediately.
Format: [VISUALIZE: {"root": "C", "type": "scale", "name": "Dorian"}] or [VISUALIZE: {"root": "G", "type": "chord", "name": "Dominant 7th"}].
Always keep your formatting clean with markdown, clear interval formulas, and musical explanations.`,

  guitar_guru: `You are The Guitar & Bass Fretboard Guru, a seasoned session guitarist and fretboard logic wizard.
You specialize in visualizing scales and chords across the guitar neck, CAGED positions, 3-notes-per-string patterns, drop-2 voicings, triad inversions, and modal soloing strategies.
You give practical fingering tips, string sets, and fretboard visualization tricks.
Whenever you suggest a chord or scale, include: [VISUALIZE: {"root": "E", "type": "scale", "name": "Minor Pentatonic"}] or [VISUALIZE: {"root": "A", "type": "chord", "name": "Minor 7th"}].
Keep your tone encouraging, practical, groove-oriented, and crystal clear.`,

  producer: `You are The Modern Producer & Beatmaker, specializing in neo-soul chords, lo-fi progressions, trap voicings, R&B extensions (9ths, 11ths, 13ths), anime chord progressions (royal road / IV-V-iii-vi), and lush synth stacks.
You explain how to voice chords for modern DAW productions, MIDI velocity, bassline movement, and harmonic tension.
Include visualizer action tags: [VISUALIZE: {"root": "F", "type": "chord", "name": "Major 9th"}] or [VISUALIZE: {"root": "Bb", "type": "scale", "name": "Natural Minor"}].
Keep explanations punchy, inspiring, modern, and production-ready.`,

  songwriter: `You are The Songwriter's Muse, focusing on emotional resonance, catchy hooks, dramatic harmonic tension & release, chorus lift chords, and bridge contrasts.
You help songwriters break out of boring 4-chord loops by suggesting unexpected borrowed chords, secondary dominants, and key changes.
Include visualizer action tags: [VISUALIZE: {"root": "D", "type": "chord", "name": "Suspended 4th"}] or [VISUALIZE: {"root": "A", "type": "scale", "name": "Major"}].
Keep explanations vivid, emotionally evocative, and practically applicable to songwriting.`
};

// 1. AI Chatbot API Endpoint (multi-turn conversation)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, role } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.'
      });
    }

    // Supported models: gemini-4-argon (complex), gemini-3.8-flash (general), gemini-3.1-flash-lite (fast)
    let selectedModel = 'gemini-3.8-flash';
    if (model === 'gemini-4-argon' || model === 'gemini-3.1-flash-lite' || model === 'gemini-3.8-flash') {
      selectedModel = model;
    }

    const systemInstruction = ROLE_SYSTEM_INSTRUCTIONS[role] || ROLE_SYSTEM_INSTRUCTIONS.maestro;

    // Format messages for @google/genai SDK
    // contents: [{ role: 'user' | 'model', parts: [{ text: string }] }]
    const formattedContents = (messages || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    if (formattedContents.length === 0) {
      return res.status(400).json({ error: 'No messages provided.' });
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I could not generate an answer at this time.';
    res.json({ reply: replyText, modelUsed: selectedModel });
  } catch (error: any) {
    console.error('Chat generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate chat response. Please try again.'
    });
  }
});

// 2. High-Quality Image Generation Endpoint (using gemini-3-pro-image-preview)
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, imageSize, aspectRatio } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.'
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A prompt is required to generate an image.' });
    }

    // Valid sizes: 1K, 2K, 4K as requested
    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : '1K';

    const validAspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
    const chosenAspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    // Model required: gemini-3-pro-image-preview
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: chosenAspect as any,
            imageSize: chosenSize as any,
          },
        },
      });
    } catch (modelErr: any) {
      // If preview alias is unavailable, fallback to gemini-3-pro-image
      if (modelErr?.status === 404 || modelErr?.message?.toLowerCase().includes('not found')) {
        response = await ai.models.generateContent({
          model: 'gemini-3-pro-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: chosenAspect as any,
              imageSize: chosenSize as any,
            },
          },
        });
      } else {
        throw modelErr;
      }
    }

    // Extract image data by iterating candidates and parts
    let imageUrl = '';
    let textExplanation = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textExplanation += part.text + ' ';
        }
      }
    }

    if (!imageUrl) {
      return res.status(502).json({
        error: 'No image was returned by the model. Please refine your prompt and try again.',
        details: textExplanation.trim(),
      });
    }

    res.json({
      imageUrl,
      prompt,
      imageSize: chosenSize,
      aspectRatio: chosenAspect,
      explanation: textExplanation.trim(),
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate image. Please check your model quota or try a different prompt.'
    });
  }
});

// 3. Natural Language Music Theory Query Parser Endpoint
// Converts requests like "C lydian dominant" or "A diminished triad" into structured music parameters
app.post('/api/parse-music-query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const prompt = `Analyze this music request: "${query}".
Identify:
1. Is it asking about a "scale", a "chord", or a "progression"?
2. What is the root note (e.g. C, C#, Db, D, D#, Eb, E, F, F#, Gb, G, G#, Ab, A, A#, Bb, B)?
3. What is the specific scale name or chord name?
4. Short 1-2 sentence harmonic explanation of its character and usage.

Output strictly valid JSON with keys:
{
  "type": "scale" | "chord",
  "root": "string",
  "name": "string",
  "explanation": "string",
  "recommendedProgression": ["string", "string", "string", "string"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let rawText = (response.text || '{}').trim();
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    const parsed = JSON.parse(rawText || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Query parse error:', error);
    res.status(500).json({ error: error.message || 'Failed to parse music query.' });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Harmoniq server running on http://0.0.0.0:${PORT}`);
});
