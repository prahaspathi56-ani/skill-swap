import React, { useState } from 'react';
import { api } from '../../lib/api';
import {
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Users,
  Send,
  BookOpen,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AIAssistantPage: React.FC = () => {
  const [concept, setConcept] = useState('Dynamic Programming Memoization');
  const [question, setQuestion] = useState('Why does top-down memoization prevent exponential time complexity?');
  const [isLoading, setIsLoading] = useState(false);
  const [explanationResult, setExplanationResult] = useState<any>(null);

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setIsLoading(true);

    try {
      const data = await api.post<any>('/ai/doubt', {
        concept: concept.trim(),
        question: question.trim(),
        level: 'INTERMEDIATE',
      });
      setExplanationResult(data);
    } catch (err) {
      console.error('AI assistant error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleDoubtButtons = [
    { c: 'SQL Window Functions', q: 'What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK()?' },
    { c: 'React useEffect Hook', q: 'How do I clean up event listeners to avoid memory leaks?' },
    { c: 'WebRTC Signaling', q: 'How do SDP offers and ICE candidates establish a P2P video stream?' },
    { c: 'Python GIL', q: 'Why does multi-threading not speed up CPU-bound tasks in standard Python?' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold mb-2 border border-violet-100">
          <Sparkles className="w-3.5 h-3.5" />
          Concept-First Student Learning Mentor
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          AI Doubt Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Stuck on a tricky concept? We break problems down using first principles, guided hints, and practice questions.
        </p>
      </div>

      {/* Ask Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <form onSubmit={handleAskDoubt} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Core Topic / Concept:
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. Recursion, Docker volumes, SQL joins..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Specific Question or Code Trap:
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What exactly is confusing you?"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Try:</span>
              {sampleDoubtButtons.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setConcept(s.c);
                    setQuestion(s.q);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px]"
                >
                  {s.c}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Analyzing Concept...
                </>
              ) : (
                'Explain & Provide Hints'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Conceptual Result Card */}
      {explanationResult && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Explanation */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800">
              Concept Breakdown
            </span>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mt-3">
              {explanationResult.explanation}
            </div>
          </div>

          {/* Guided Hints */}
          {explanationResult.hints?.length > 0 && (
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
              <h4 className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Step-by-Step Guided Hints
              </h4>
              <ul className="space-y-1 text-xs text-amber-950">
                {explanationResult.hints.map((hint: string, i: number) => (
                  <li key={i}>• {hint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Question */}
          {explanationResult.practiceQuestion && (
            <div className="p-4 bg-brand-50/70 border border-brand-200/80 rounded-2xl space-y-1.5">
              <h4 className="text-xs font-extrabold text-brand-900 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                Practice Question to Test Your Understanding
              </h4>
              <p className="text-xs text-brand-950 font-medium">
                {explanationResult.practiceQuestion}
              </p>
            </div>
          )}

          {/* ASK A HUMAN STUDENT - Reciprocal Link */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Still have doubts? Ask a real student!
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pair up with someone who listed this skill on SkillSwap for a quick 30-min swap.
              </p>
            </div>

            <Link
              to={`/explore?q=${encodeURIComponent(concept)}`}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs flex items-center gap-2 shrink-0"
            >
              <Users className="w-4 h-4" />
              Ask a Human Student Peer
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
