import React from 'react';
import { Star, GraduationCap, MapPin, Repeat, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    college?: string | null;
    department?: string | null;
    year?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    ratingAverage?: number;
    reviewCount?: number;
    skills?: any[];
    availability?: string | null;
  };
  onRequestSwap: (student: any) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onRequestSwap }) => {
  const teachSkills = (student.skills || []).filter((s) => s.type === 'TEACH');
  const learnSkills = (student.skills || []).filter((s) => s.type === 'LEARN');

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 hover:shadow-lg hover:border-brand-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <img
            src={
              student.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=7c3aed&color=fff`
            }
            alt={student.name}
            className="w-13 h-13 w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${student.id}`}
              className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors truncate block"
            >
              {student.name}
            </Link>
            <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
              <GraduationCap className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              {student.college || 'University Peer'}
            </p>
            {student.department && (
              <p className="text-[10px] text-slate-400 truncate">{student.department}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold shrink-0">
            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>{student.ratingAverage || 5.0}</span>
          </div>
        </div>

        {/* Bio */}
        {student.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3.5 leading-relaxed">
            {student.bio}
          </p>
        )}

        {/* Skills Can Teach */}
        <div className="mb-2.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Can Teach:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {teachSkills.length > 0 ? (
              teachSkills.slice(0, 3).map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100"
                >
                  {s.skill?.name || 'Skill'}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400">Open to sharing</span>
            )}
            {teachSkills.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{teachSkills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Skills Want to Learn */}
        <div className="mb-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Wants to Learn:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {learnSkills.length > 0 ? (
              learnSkills.slice(0, 3).map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"
                >
                  {s.skill?.name || 'Skill'}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400">Exploring skills</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/profile/${student.id}`}
          className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1.5"
        >
          View Profile
        </Link>
        <button
          onClick={() => onRequestSwap(student)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          <Repeat className="w-3.5 h-3.5" />
          Request Swap
        </button>
      </div>
    </div>
  );
};
