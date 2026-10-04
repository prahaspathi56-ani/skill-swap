import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { MatchCard } from '../../components/common/MatchCard';
import { SwapRequestModal } from '../../components/common/SwapRequestModal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Repeat, Sparkles, Filter, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudentForSwap, setSelectedStudentForSwap] = useState<any>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await api.get<any[]>('/matches');
        setMatches(data);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2 border border-brand-100">
            <Sparkles className="w-3.5 h-3.5" />
            Reciprocal Compatibility Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-7 h-7 text-brand-600" />
            Your Smart Skill Matches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            These peers have complementary skills: they teach what you want to learn, and they want to learn what you can teach.
          </p>
        </div>
      </div>

      {/* Reciprocal Explanatory Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="text-xs text-brand-900 leading-relaxed">
          <span className="font-bold">How our reciprocal matching works:</span> Compatibility is calculated from bilateral teach/learn overlap, learning goals, availability, and college proximity. No competitive ranking — only mutual collaborative synergy!
        </div>
      </div>

      {/* Matches Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No direct reciprocal matches yet"
          description="Add more skills you can teach or skills you want to learn in your profile to expand your compatibility network!"
          actionText="Update My Profile Skills"
          onAction={() => (window.location.href = '/profile')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.userId}
              match={match}
              onRequestSwap={(target) => setSelectedStudentForSwap(target)}
            />
          ))}
        </div>
      )}

      {/* Swap Request Modal */}
      {selectedStudentForSwap && (
        <SwapRequestModal
          isOpen={Boolean(selectedStudentForSwap)}
          onClose={() => setSelectedStudentForSwap(null)}
          targetUser={selectedStudentForSwap}
        />
      )}
    </div>
  );
};
