import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatRole, GeminiModel, PitchClass } from '../../types/music';
import { marked } from 'marked';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Guitar,
  GraduationCap,
  Sliders,
  Feather,
  RefreshCw,
  Cpu,
  ArrowRight,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface MusicChatProps {
  onLoadInVisualizer: (action: { root: PitchClass; type: 'scale' | 'chord'; name: string }) => void;
  currentRoot: PitchClass;
  currentSelectionName: string;
}

export const MusicChat: React.FC<MusicChatProps> = ({
  onLoadInVisualizer,
  currentRoot,
  currentSelectionName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Welcome to Harmoniq AI Harmony Mentor! 🎼\n\nI can analyze chord progressions, explore modal interchange, suggest fretboard voicings, or explain complex jazz/classical theory.\n\nCurrently you have **${currentRoot} ${currentSelectionName}** active in the visualizer studio. What would you like to explore or reharmonize?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
      rolePersona: 'maestro'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRole>('maestro');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3.8-flash');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const roles = [
    {
      id: 'maestro' as ChatRole,
      title: 'The Maestro',
      desc: 'Classical & Jazz Harmony, Voice Leading, Modal Interchange',
      icon: GraduationCap,
      color: 'text-indigo-400 border-indigo-500/40'
    },
    {
      id: 'guitar_guru' as ChatRole,
      title: 'Fretboard Guru',
      desc: 'CAGED Voicings, Modal Soloing, String Sets & Fingerings',
      icon: Guitar,
      color: 'text-amber-400 border-amber-500/40'
    },
    {
      id: 'producer' as ChatRole,
      title: 'Modern Producer',
      desc: 'Neo-Soul 9ths & 11ths, Trap Voicings, Synth Chords, Lofi',
      icon: Sliders,
      color: 'text-emerald-400 border-emerald-500/40'
    },
    {
      id: 'songwriter' as ChatRole,
      title: "Songwriter's Muse",
      desc: 'Emotional Progressions, Catchy Hooks, Bridge Tension & Release',
      icon: Feather,
      color: 'text-pink-400 border-pink-500/40'
    }
  ];

  const models: { id: GeminiModel; label: string; tag: string }[] = [
    { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash', tag: 'Balanced / General (Recommended)' },
    { id: 'gemini-4-argon', label: 'gemini-4-argon', tag: 'Deep Reasoning / Complex Tasks' },
    { id: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite', tag: 'Fast Responses / Quick Lookups' },
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from Gemini.');
      }

      // Check for visualizer tag: [VISUALIZE: {"root": "...", "type": "...", "name": "..."}]
      let cleanContent = data.reply || '';
      let actionObj: any = null;
      const regex = /\[VISUALIZE:\s*({[\s\S]*?})\]/i;
      const match = cleanContent.match(regex);
      if (match && match[1]) {
        try {
          actionObj = JSON.parse(match[1]);
          cleanContent = cleanContent.replace(/\[VISUALIZE:\s*{[\s\S]*?}\]/gi, '').trim();
        } catch {
          // ignore parse errors
        }
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        rolePersona: selectedRole,
        visualizeAction: actionObj,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error:** ${err.message || 'Could not communicate with the Gemini API server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptSuggestions = [
    'How do I use modal interchange (borrowed chords) in C major?',
    'Explain the Hendrix chord (E7#9) and what scale sounds best over it.',
    'Suggest a 4-chord neo-soul progression with 9th and 11th extensions.',
    'What is the difference between Dorian and Aeolian for guitar solos?',
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Top Header Controls: Role Selector & Model Selector */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Role tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-indigo-400" />
            Role:
          </span>
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                title={r.desc}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white border-indigo-500 shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? r.color : 'text-slate-500'}`} />
                <span>{r.title}</span>
              </button>
            );
          })}
        </div>

        {/* Model dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Model:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
            aria-label="Select Gemini model"
            className="bg-slate-900 text-slate-200 text-xs font-mono font-semibold rounded-xl border border-slate-700 py-1.5 px-3 outline-none focus:border-indigo-500"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.tag})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[550px] min-h-[400px]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const roleConfig = roles.find(r => r.id === msg.rolePersona);
          const htmlContent = marked.parse(msg.content) as string;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black'
                    : 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-50 rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800/80 text-slate-100 rounded-tl-none'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-1.5 pb-1 border-b border-slate-800/40">
                  <div className="flex items-center gap-1.5 font-semibold">
                    {isUser ? (
                      <span className="text-amber-200">You</span>
                    ) : (
                      <>
                        <span className="text-indigo-400 font-bold">
                          {roleConfig?.title || 'Harmoniq AI'}
                        </span>
                        {msg.modelUsed && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {msg.modelUsed}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-200 transition-colors cursor-pointer"
                      title="Copy content"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Markdown body */}
                <div
                  className="prose prose-invert prose-sm max-w-none text-xs md:text-sm leading-relaxed overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Interactive "Apply to Visualizer" card if model recommended a scale or chord */}
                {msg.visualizeAction && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-3 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-800/40">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        {msg.visualizeAction.root} {msg.visualizeAction.name} ({msg.visualizeAction.type})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLoadInVisualizer(msg.visualizeAction!)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <span>Load in Studio</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing harmony and voice leading...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions Bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Ideas:
        </span>
        {promptSuggestions.map((sug, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(sug)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-3 md:p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${roles.find(r => r.id === selectedRole)?.title} about chord progressions, modal interchange, jazz voicings...`}
            className="w-full pl-4 pr-14 py-3 bg-slate-900 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
