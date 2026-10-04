import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Video,
  Calendar,
  Clock,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  FileText,
  Star,
  Users,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const SessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form State
  const [participantId, setParticipantId] = useState('');
  const [skillId, setSkillId] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [agenda, setAgenda] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const [sessionsData, convs] = await Promise.all([
        api.get<any[]>('/sessions'),
        api.get<any[]>('/conversations'),
      ]);
      setSessions(sessionsData);
      setConnections(convs.map((c) => c.otherUser).filter(Boolean));
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId || !skillId || !scheduledStartTime) {
      setError('Please select a student, skill, and start time.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/sessions', {
        participantId,
        skillId,
        title: title || 'Collaborative Skill Exchange',
        scheduledStartTime,
        durationMinutes,
        agenda,
      });

      setShowScheduleModal(false);
      fetchSessions();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mySkills = user?.skills || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Video className="w-7 h-7 text-brand-600" />
            Live Learning Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Schedule and conduct real-time video, audio, and screen sharing learning sessions with peers.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Live Session
        </button>
      </div>

      {/* Sessions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No live learning sessions yet"
          description="Schedule a 1-on-1 hands-on session with a matched student to practice and share knowledge live!"
          actionText="Schedule Session"
          onAction={() => setShowScheduleModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const isHost = session.hostId === user?.id;
            const partner = isHost ? session.participant : session.host;
            const isCompleted = session.status === 'COMPLETED';
            const isLive = session.status === 'LIVE' || session.status === 'STARTING_SOON';

            return (
              <div
                key={session.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isLive
                    ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                    : 'border-slate-200/80 hover:border-brand-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isLive
                          ? 'bg-rose-100 text-rose-700 animate-pulse'
                          : isCompleted
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-brand-50 text-brand-700'
                      }`}
                    >
                      {session.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {session.durationMinutes} mins
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-brand-600 block">
                    {session.skill?.name}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                    {session.title}
                  </h3>

                  <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-slate-100">
                    <img
                      src={
                        partner?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'Peer')}&background=7c3aed&color=fff`
                      }
                      alt={partner?.name}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {partner?.name || 'Partner'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isHost ? 'You are Teaching' : 'You are Learning'}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-3">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(session.scheduledStartTime).toLocaleString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  {session.agenda && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-2 rounded-xl">
                      {session.agenda}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                  {isCompleted ? (
                    <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Completed (+{session.durationMinutes / 60}h)
                    </div>
                  ) : (
                    <Link
                      to={`/sessions/${session.meetingRoomId}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Enter Live Room
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Session Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule a Live Learning Session"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Student Partner:
            </label>
            <select
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              required
            >
              <option value="">Choose a connected student...</option>
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.college || 'Peer'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Skill Topic:</label>
            <select
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              required
            >
              <option value="">Select skill to teach/practice...</option>
              {mySkills.map((s: any) => (
                <option key={s.id} value={s.skillId || s.skill?.id}>
                  {s.skill?.name || 'Skill'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Session Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep dive into React Hooks & State"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time:</label>
              <input
                type="datetime-local"
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration:</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Agenda / Goals:</label>
            <textarea
              rows={2}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="What specific tasks or concepts will you cover?"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
