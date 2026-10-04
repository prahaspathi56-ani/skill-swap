import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Languages,
  Send,
  Sparkles,
  BookOpen,
  Mic,
  Users,
  Award,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EnglishPracticePage: React.FC = () => {
  const { user } = useAuth();
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [inputMessage, setInputMessage] = useState('');
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content:
        'Hello! Welcome to the SkillSwap English Lab. What topic would you like to discuss today? We can practice software interview behavioral questions, technical presentations, or casual college conversations!',
    },
  ]);
  const [lastFeedback, setLastFeedback] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get<any[]>('/english/prompts').then(setPrompts).catch(() => {});
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    const newHist = [...history, { role: 'user', content: message }];
    setHistory(newHist);
    setIsLoading(true);

    try {
      const result = await api.post<any>('/english/practice', {
        message,
        history: newHist,
        level,
      });

      setHistory((prev) => [...prev, { role: 'assistant', content: result.reply }]);
      setLastFeedback(result);
    } catch (err) {
      console.error('English practice error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2 border border-amber-200">
            <Languages className="w-3.5 h-3.5" />
            Communication & Fluency Lab
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            English & Speaking Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Improve your technical vocabulary, interview speech, and presentation confidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  level === lvl ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <Link
            to="/explore?q=English"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Practice with Students
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chat Conversation Window */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-[520px]">
          {/* Message History */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {history.map((h, i) => (
              <div
                key={i}
                className={`flex flex-col ${h.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                    h.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {h.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-brand-600 italic animate-pulse flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Analyzing phrasing and grammar...
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your response or question in English..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Feedback & Speaking Prompts */}
        <div className="space-y-5">
          {/* Live Feedback Card */}
          {lastFeedback && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-200 p-5 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Live Fluency & Grammar Feedback
              </h4>

              {lastFeedback.grammarFeedback && (
                <div className="text-xs text-amber-950 bg-white/70 p-3 rounded-xl border border-amber-100">
                  <span className="font-bold block mb-1">Grammar Note:</span>
                  {lastFeedback.grammarFeedback}
                </div>
              )}

              {lastFeedback.vocabularySuggestions?.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-900 block mb-1">
                    Advanced Vocabulary Words to Try:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lastFeedback.vocabularySuggestions.map((w: string) => (
                      <span
                        key={w}
                        className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-800 text-[11px] font-semibold"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lastFeedback.speakingPrompt && (
                <p className="text-[11px] text-amber-800 italic pt-1">
                  💡 {lastFeedback.speakingPrompt}
                </p>
              )}
            </div>
          )}

          {/* Daily Campus Speaking Prompts */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-600" />
              Speaking & Presentation Prompts
            </h4>

            <div className="space-y-2.5">
              {prompts.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setInputMessage(`Let's discuss: ${p.title}.`)}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 cursor-pointer transition-all"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                    {p.category}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 mt-1">{p.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {p.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
