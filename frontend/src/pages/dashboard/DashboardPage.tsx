import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Repeat,
  ArrowRightLeft,
  Clock,
  Video,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { SwapRequestModal } from '../../components/common/SwapRequestModal';
import { Skeleton } from '../../components/common/Skeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeerForSwap, setSelectedPeerForSwap] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, matchesRes] = await Promise.all([
          api.get<any>('/users/me/dashboard'),
          api.get<any[]>('/matches'),
        ]);
        setDashboardData(dashRes);
        setMatches(matchesRes);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  const skillsTeaching = dashboardData?.skillsTeaching || [];
  const skillsLearning = dashboardData?.skillsLearning || [];
  const upcomingSessions = dashboardData?.upcomingSessions || [];
  const roadmaps = dashboardData?.roadmaps || [];
  const achievements = dashboardData?.achievements || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. HERO PRODUCT DIFFERENTIATOR CARD: "Your Skill Exchange" */}
      <div className="relative overflow-hidden bg-gradient-to-tr from-brand-900 via-brand-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-200 text-xs font-bold border border-brand-400/30">
              <Repeat className="w-3.5 h-3.5 text-brand-300" />
              Reciprocal Student Learning
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
              "I teach what I know, and I learn what I don't." Your bilateral exchange status:
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/matches"
              className="px-5 py-2.5 rounded-xl bg-white text-brand-900 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              View Matches ({matches.length})
            </Link>
          </div>
        </div>

        {/* Central Reciprocal Exchange Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-brand-700/60">
          {/* I CAN TEACH */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-brand-200 block mb-1">
              I CAN TEACH:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skillsTeaching.length > 0 ? (
                skillsTeaching.map((s: any) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 text-white"
                  >
                    {s.skill?.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-brand-300">No teaching skills set</span>
              )}
            </div>
          </div>

          {/* I WANT TO LEARN */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-300 block mb-1">
              I WANT TO LEARN:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skillsLearning.length > 0 ? (
                skillsLearning.map((s: any) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30"
                  >
                    {s.skill?.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-brand-300">No learning skills set</span>
              )}
            </div>
          </div>

          {/* POTENTIAL MATCHES */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-300 block mb-1">
                POTENTIAL RECIPROCAL MATCHES:
              </span>
              <p className="text-xs text-brand-100 font-medium mt-1">
                {matches.length} students need what you teach & can teach what you need!
              </p>
            </div>
            <Link
              to="/matches"
              className="text-xs font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 mt-2"
            >
              Explore Reciprocal Peers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Clock className="w-4 h-4 text-brand-600" />
            Teaching Given
          </div>
          <p className="text-2xl font-black text-slate-900">
            {dashboardData?.user?.teachingHours || 0} <span className="text-xs font-semibold text-slate-400">hrs</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Clock className="w-4 h-4 text-emerald-600" />
            Learning Received
          </div>
          <p className="text-2xl font-black text-slate-900">
            {dashboardData?.user?.learningHours || 0} <span className="text-xs font-semibold text-slate-400">hrs</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Video className="w-4 h-4 text-indigo-600" />
            Completed Swaps
          </div>
          <p className="text-2xl font-black text-slate-900">
            {dashboardData?.completedSessionsCount || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            Achievements
          </div>
          <p className="text-2xl font-black text-slate-900">
            {achievements.length}
          </p>
        </div>
      </div>

      {/* 3. UPCOMING SESSIONS & SMART MATCHES PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upcoming Live Learning Sessions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">Upcoming Live Sessions</h3>
              </div>
              <Link to="/sessions" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingSessions.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">No sessions scheduled right now.</p>
                  <Link
                    to="/explore"
                    className="inline-block mt-2 text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    Match with a peer to schedule one!
                  </Link>
                </div>
              ) : (
                upcomingSessions.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-100 text-brand-700">
                        {s.skill?.name}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{s.title}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(s.scheduledStartTime).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <Link
                      to={`/sessions/${s.meetingRoomId}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
                    >
                      Enter Room
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Top Reciprocal Matches */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">Recommended Reciprocal Peers</h3>
              </div>
              <Link to="/matches" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                All Matches ({matches.length})
              </Link>
            </div>

            <div className="space-y-3">
              {matches.slice(0, 3).map((m: any) => (
                <div
                  key={m.userId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 hover:border-brand-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        m.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=7c3aed&color=fff`
                      }
                      alt={m.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        Teaches {m.theyCanTeachYou.map((s: any) => s.name).join(', ') || 'Skills'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedPeerForSwap({
                        id: m.userId,
                        name: m.name,
                        skills: m.theyCanTeachYou.map((s: any) => ({
                          skillId: s.id,
                          skill: { id: s.id, name: s.name },
                          type: 'TEACH',
                        })),
                      })
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-600 hover:text-white transition-all shrink-0"
                  >
                    Swap
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE LEARNING ROADMAPS & ACHIEVEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roadmaps */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">Your Learning Roadmaps</h3>
            </div>
            <Link to="/roadmaps" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Generate New Roadmap
            </Link>
          </div>

          {roadmaps.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500">No active learning roadmaps yet.</p>
              <Link
                to="/roadmaps"
                className="inline-block mt-2 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                Use AI to generate a step-by-step roadmap!
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {roadmaps.map((r: any) => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>
                    <span className="text-xs font-bold text-brand-600">{r.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-brand-600 h-full rounded-full transition-all"
                      style={{ width: `${r.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                    {(r.items || []).slice(0, 3).map((item: any) => (
                      <span
                        key={item.id}
                        className={`px-2 py-0.5 rounded-md border ${
                          item.isCompleted
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {item.isCompleted && '✓ '}
                        {item.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges / Achievements */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Achievements</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{achievements.length} Unlocked</span>
          </div>

          <div className="space-y-2.5">
            {achievements.map((a: any) => (
              <div
                key={a.id || a.code}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                  🏅
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Swap Modal */}
      {selectedPeerForSwap && (
        <SwapRequestModal
          isOpen={Boolean(selectedPeerForSwap)}
          onClose={() => setSelectedPeerForSwap(null)}
          targetUser={selectedPeerForSwap}
        />
      )}
    </div>
  );
};
