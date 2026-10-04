import React from 'react';
import { Repeat, Sparkles, GraduationCap, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MatchCardProps {
  match: {
    userId: string;
    name: string;
    email: string;
    college?: string | null;
    department?: string | null;
    year?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    ratingAverage: number;
    compatibilityScore: number;
    matchBadge: string;
    matchReason: string;
    theyCanTeachYou: Array<{ id: string; name: string; level: string }>;
    youCanTeachThem: Array<{ id: string; name: string; level: string }>;
  };
  onRequestSwap: (student: any) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onRequestSwap }) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-brand-200/90 p-5 shadow-sm hover:shadow-xl hover:border-brand-400 transition-all flex flex-col justify-between relative overflow-hidden group">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          {match.matchBadge}
        </span>
        <div className="flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
          <span>{match.compatibilityScore}%</span>
          <span className="text-[10px] text-brand-500 font-medium">Match</span>
        </div>
      </div>

      {/* Student info */}
      <div className="flex items-start gap-3.5 mb-3.5">
        <img
          src={
            match.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name)}&background=7c3aed&color=fff`
          }
          alt={match.name}
          className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
        />
        <div className="min-w-0 flex-1">
          <Link
            to={`/profile/${match.userId}`}
            className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors truncate block"
          >
            {match.name}
          </Link>
          <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
            <GraduationCap className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            {match.college || 'Peer Student'}
          </p>
          {match.department && (
            <p className="text-[10px] text-slate-400 truncate">{match.department}</p>
          )}
        </div>
      </div>

      {/* Reciprocal Explanation Box */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4 space-y-2">
        <p className="text-xs text-slate-700 font-medium leading-relaxed flex items-start gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <span>{match.matchReason}</span>
        </p>

        {/* Visual Exchange Flow */}
        <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">
              They teach you:
            </span>
            <div className="font-semibold text-emerald-900 truncate">
              {match.theyCanTeachYou.map((s) => s.name).join(', ') || 'Their skills'}
            </div>
          </div>
          <div className="bg-brand-50/70 p-2 rounded-xl border border-brand-100">
            <span className="text-[10px] uppercase font-bold text-brand-700 block mb-0.5">
              You teach them:
            </span>
            <div className="font-semibold text-brand-900 truncate">
              {match.youCanTeachThem.map((s) => s.name).join(', ') || 'Your skills'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/profile/${match.userId}`}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1.5"
        >
          View Profile
        </Link>
        <button
          onClick={() =>
            onRequestSwap({
              id: match.userId,
              name: match.name,
              skills: match.theyCanTeachYou.map((s) => ({
                skillId: s.id,
                skill: { id: s.id, name: s.name },
                type: 'TEACH',
              })),
            })
          }
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Request Swap
        </button>
      </div>
    </div>
  );
};
