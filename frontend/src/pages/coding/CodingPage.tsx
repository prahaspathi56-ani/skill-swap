import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';

export const CodingPage: React.FC = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblemSlug, setSelectedProblemSlug] = useState<string>('two-sum');
  const [problemDetail, setProblemDetail] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch problem catalog
  useEffect(() => {
    api.get<any[]>('/coding/problems').then((data) => {
      setProblems(data);
      if (data.length > 0 && !selectedProblemSlug) {
        setSelectedProblemSlug(data[0].slug);
      }
    });
  }, []);

  // 2. Fetch selected problem detail
  useEffect(() => {
    if (!selectedProblemSlug) return;
    setIsLoading(true);
    setSubmissionResult(null);

    api.get<any>(`/coding/problems/${selectedProblemSlug}`).then((data) => {
      setProblemDetail(data);
      const starter = data.starterCode?.[selectedLanguage] || '// Write your solution here';
      setCode(starter);
      setIsLoading(false);
    });
  }, [selectedProblemSlug]);

  // Update starter code when language changes
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (problemDetail?.starterCode?.[lang]) {
      setCode(problemDetail.starterCode[lang]);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim() || !selectedProblemSlug) return;
    setIsSubmitting(true);
    try {
      const result = await api.post<any>(`/coding/problems/${selectedProblemSlug}/submit`, {
        language: selectedLanguage,
        code,
      });
      setSubmissionResult(result);
    } catch (err: any) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4.1rem)] flex flex-col md:flex-row overflow-hidden bg-slate-900 text-white">
      {/* 1. Problem Catalog Sidebar */}
      <div className="w-full md:w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-brand-400" />
            Challenges
          </h2>
          <span className="text-[11px] font-semibold text-slate-500">{problems.length} Problems</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
          {problems.map((p) => {
            const isSelected = p.slug === selectedProblemSlug;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProblemSlug(p.slug)}
                className={`w-full p-3.5 text-left transition-colors flex items-center justify-between ${
                  isSelected ? 'bg-slate-800/90 border-l-4 border-brand-500' : 'hover:bg-slate-900'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{p.title}</h4>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 inline-block ${
                      p.difficulty === 'EASY'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-amber-950 text-amber-400'
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Problem Statement Center Panel */}
      <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto shrink-0 flex flex-col justify-between">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4 rounded-xl bg-slate-800" />
            <Skeleton className="h-20 w-full rounded-xl bg-slate-800" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-900/50 text-brand-300">
                {problemDetail?.category}
              </span>
              <h1 className="text-base font-bold text-white mt-1.5">{problemDetail?.title}</h1>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {problemDetail?.description}
            </div>

            {/* Sample Test Cases */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sample Test Cases:
              </h4>
              <div className="space-y-2">
                {(problemDetail?.testCases || []).slice(0, 2).map((tc: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono">
                    <div className="text-slate-400">Input: <span className="text-slate-200">{tc.input}</span></div>
                    <div className="text-slate-400 mt-1">Expected: <span className="text-emerald-400">{tc.expectedOutput}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints Accordion */}
            {problemDetail?.hints && problemDetail.hints.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showHints ? 'Hide Guided Hints' : 'Need a Hint? (Concept-First)'}
                </button>
                {showHints && (
                  <div className="mt-2 p-3 bg-brand-950/40 rounded-xl border border-brand-800/40 space-y-1.5 text-xs text-brand-200">
                    {problemDetail.hints.map((h: string, idx: number) => (
                      <p key={idx}>• {h}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Code Editor & Execution Results Panel */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {/* Editor Toolbar */}
        <div className="h-12 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-800 text-xs font-bold text-slate-200 rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <button
            onClick={handleRunCode}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isSubmitting ? 'Evaluating Sandbox...' : 'Run & Submit'}
          </button>
        </div>

        {/* Code Input Area */}
        <div className="flex-1 p-3 overflow-hidden flex flex-col">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Execution Output Console */}
        <div className="h-44 bg-slate-900 border-t border-slate-800 p-4 overflow-y-auto shrink-0 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-2 font-bold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            Sandboxed Evaluation Results:
          </div>

          {!submissionResult ? (
            <p className="text-slate-500 text-[11px]">
              Click "Run & Submit" to safely evaluate your solution against test cases.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                    submissionResult.status === 'ACCEPTED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {submissionResult.status === 'ACCEPTED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {submissionResult.status}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Passed: {submissionResult.passedTests}/{submissionResult.totalTests} tests in {submissionResult.executionTimeMs}ms
                </span>
              </div>

              <p className="text-slate-300 text-xs">{submissionResult.outputLog}</p>

              {/* Individual test breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                {(submissionResult.details || []).map((d: any) => (
                  <div
                    key={d.testIndex}
                    className={`p-2 rounded-lg border text-[10px] ${
                      d.passed
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                    }`}
                  >
                    Test #{d.testIndex}: {d.passed ? 'PASSED ✓' : 'FAILED ✗'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
