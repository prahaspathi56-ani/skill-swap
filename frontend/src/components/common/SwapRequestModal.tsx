import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Repeat, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    skills?: any[];
  } | null;
  defaultRequestedSkillId?: string;
}

export const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  defaultRequestedSkillId,
}) => {
  const { user } = useAuth();
  const [requestedSkillId, setRequestedSkillId] = useState(defaultRequestedSkillId || '');
  const [offeredSkillId, setOfferedSkillId] = useState('');
  const [message, setMessage] = useState('');
  const [preferredTime, setPreferredTime] = useState('Tomorrow 6:00 PM');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available skills to teach from current logged in student
  const myTeachingSkills = (user?.skills || []).filter((s) => s.type === 'TEACH');

  // Available skills that target student can teach
  const targetTeachingSkills = (targetUser?.skills || []).filter(
    (s: any) => s.type === 'TEACH' || !s.type
  );

  React.useEffect(() => {
    if (defaultRequestedSkillId) {
      setRequestedSkillId(defaultRequestedSkillId);
    } else if (targetTeachingSkills.length > 0) {
      setRequestedSkillId(targetTeachingSkills[0].skillId || targetTeachingSkills[0].skill?.id || '');
    }

    if (myTeachingSkills.length > 0 && !offeredSkillId) {
      setOfferedSkillId(myTeachingSkills[0].skillId || myTeachingSkills[0].skill?.id || '');
    }
    setIsSuccess(false);
    setError(null);
  }, [isOpen, targetUser, defaultRequestedSkillId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser || !requestedSkillId || !offeredSkillId) {
      setError('Please select both a skill you want to learn and a skill you can teach in exchange.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/swaps/requests', {
        receiverId: targetUser.id,
        requestedSkillId,
        offeredSkillId,
        message: message || `Hi ${targetUser.name}! I would love to do a skill exchange with you.`,
        preferredTime,
        durationMinutes,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit skill swap request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!targetUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request Skill Swap with ${targetUser.name}`}>
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Skill Swap Request Sent!</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {targetUser.name} will be notified. Once accepted, a bilateral learning connection and chat will be opened automatically!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Reciprocal Banner */}
          <div className="p-3.5 bg-brand-50/70 border border-brand-100 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
              <Repeat className="w-4 h-4" />
            </div>
            <p className="text-xs text-brand-900 leading-snug font-medium">
              SkillSwap is 100% free! You learn what {targetUser.name} knows, and you teach what you know in return.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Skill I Want to Learn */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Skill I want to learn:
              </label>
              <select
                value={requestedSkillId}
                onChange={(e) => setRequestedSkillId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-brand-500 focus:outline-none"
                required
              >
                {targetTeachingSkills.length > 0 ? (
                  targetTeachingSkills.map((s: any) => (
                    <option key={s.id || s.skillId} value={s.skillId || s.skill?.id}>
                      {s.skill?.name || s.name || 'Selected Skill'}
                    </option>
                  ))
                ) : (
                  <option value="">No specific skills listed</option>
                )}
              </select>
            </div>

            {/* Skill I Can Teach */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Skill I can teach in return:
              </label>
              <select
                value={offeredSkillId}
                onChange={(e) => setOfferedSkillId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-brand-500 focus:outline-none"
                required
              >
                {myTeachingSkills.length > 0 ? (
                  myTeachingSkills.map((s: any) => (
                    <option key={s.id} value={s.skillId}>
                      {s.skill?.name || 'My Skill'} ({s.level || 'Intermediate'})
                    </option>
                  ))
                ) : (
                  <option value="">Add skills to your profile first</option>
                )}
              </select>
            </div>
          </div>

          {/* Timing & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Proposed Time / Availability:
              </label>
              <input
                type="text"
                placeholder="e.g. Saturday afternoon, or Tuesday 7 PM"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Session Duration:
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value={30}>30 Minutes (Quick concept check)</option>
                <option value={45}>45 Minutes (Standard swap)</option>
                <option value={60}>60 Minutes (Deep hands-on pairing)</option>
                <option value={90}>90 Minutes (Comprehensive lab)</option>
              </select>
            </div>
          </div>

          {/* Personal Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message to {targetUser.name}:
            </label>
            <textarea
              rows={3}
              placeholder={`Introduce what you're working on and how you can help each other...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-brand-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !offeredSkillId || !requestedSkillId}
              className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Swap Request'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
