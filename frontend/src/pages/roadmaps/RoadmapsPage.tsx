import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Map,
  Sparkles,
  CheckCircle,
  Circle,
  Users,
  HelpCircle,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';
import { Link } from 'react-router-dom';

export const RoadmapsPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [targetGoal, setTargetGoal] = useState('Data Analyst');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoadmaps = async () => {
    try {
      const data = await api.get<any[]>('/roadmaps');
      setRoadmaps(data);
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGoal.trim()) return;
    setIsGenerating(true);
    try {
      const result = await api.post<any>('/roadmaps/generate', { targetGoal: targetGoal.trim() });
      setGeneratedPreview(result);
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!generatedPreview) return;
    try {
      await api.post('/roadmaps', generatedPreview);
      setGeneratedPreview(null);
      fetchRoadmaps();
    } catch (err) {
      console.error('Failed to save roadmap:', err);
    }
  };

  const handleToggleItem = async (roadmapId: string, itemId: string, currentStatus: boolean) => {
    try {
      const updated = await api.patch<any>(`/roadmaps/${roadmapId}/items/${itemId}`, {
        isCompleted: !currentStatus,
      });
      setRoadmaps((prev) => prev.map((r) => (r.id === roadmapId ? updated : r)));
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold mb-2 border border-violet-100">
          <Sparkles className="w-3.5 h-3.5" />
          AI Learning Pathways
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Map className="w-7 h-7 text-brand-600" />
          Personal Learning Roadmaps
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate structured milestone pathways for your target role and pair with SkillSwap peers at each step.
        </p>
      </div>

      {/* Generator Input Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          What role or skill milestone do you want to master?
        </h3>

        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={targetGoal}
            onChange={(e) => setTargetGoal(e.target.value)}
            placeholder="e.g. Data Analyst, Full-Stack Engineer, AI Engineer, UI Designer..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="px-6 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Generating Pathway...
              </>
            ) : (
              'Generate Roadmap'
            )}
          </button>
        </form>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Popular:</span>
          {['Data Analyst', 'Full Stack Web Developer', 'Machine Learning Engineer'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setTargetGoal(g)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Preview Card */}
      {generatedPreview && (
        <div className="bg-gradient-to-br from-violet-50/70 to-indigo-50/50 rounded-3xl border border-violet-200 p-6 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full">
                AI Generated Pathway
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{generatedPreview.title}</h2>
              <p className="text-xs text-slate-600 mt-0.5">{generatedPreview.description}</p>
            </div>
            <button
              onClick={handleSaveRoadmap}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs shrink-0"
            >
              Save to My Dashboard ✓
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {(generatedPreview.items || []).map((step: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-violet-100 shadow-xs flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.description}</p>
                </div>
                {step.recommendedSkillName && (
                  <Link
                    to={`/explore?q=${encodeURIComponent(step.recommendedSkillName)}`}
                    className="shrink-0 text-[10px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100"
                  >
                    Find Peer Mentors →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Roadmaps */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-600" />
          Your Active Learning Roadmaps ({roadmaps.length})
        </h3>

        {isLoading ? (
          <Skeleton className="h-64 rounded-3xl" />
        ) : roadmaps.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
            No saved roadmaps yet. Use the prompt above to generate your first roadmap!
          </div>
        ) : (
          roadmaps.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{r.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-600">{r.progressPercent}%</span>
                    <span className="text-[10px] text-slate-400 block -mt-1">Completed</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${r.progressPercent}%` }}
                />
              </div>

              {/* Items checklist */}
              <div className="space-y-2 pt-2 divide-y divide-slate-100">
                {(r.items || []).map((item: any) => (
                  <div
                    key={item.id}
                    className="pt-2 flex items-start justify-between gap-3 text-xs"
                  >
                    <button
                      onClick={() => handleToggleItem(r.id, item.id, item.isCompleted)}
                      className="flex items-start gap-2.5 text-left group"
                    >
                      {item.isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 group-hover:text-brand-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span
                          className={`font-semibold ${
                            item.isCompleted
                              ? 'line-through text-slate-400'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.title}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.recommendedSkillName && (
                        <Link
                          to={`/explore?q=${encodeURIComponent(item.recommendedSkillName)}`}
                          className="text-[10px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md"
                        >
                          Swap Peer
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
