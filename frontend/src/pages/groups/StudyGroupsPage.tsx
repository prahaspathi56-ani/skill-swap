import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Users,
  Plus,
  Check,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const StudyGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [topics, setTopics] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      const data = await api.get<any[]>('/groups');
      setGroups(data);
    } catch (err) {
      console.error('Failed to load study groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoinLeave = async (groupId: string, isMember: boolean) => {
    if (!user) return;
    try {
      if (isMember) {
        await api.post(`/groups/${groupId}/leave`);
      } else {
        await api.post(`/groups/${groupId}/join`);
      }
      fetchGroups();
    } catch (err) {
      console.error('Failed to toggle membership:', err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;
    setIsSubmitting(true);
    try {
      await api.post('/groups', {
        name,
        description,
        category,
        topics,
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      setTopics('');
      fetchGroups();
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-brand-600" />
            Student Study Groups
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Join peer-led study circles for interview prep, open-source projects, and collaborative mastery.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Study Group
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study groups found"
          description="Start a new study circle on Python, AI/ML, English, or Placement Prep!"
          actionText="Create Study Group"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                    {group.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    {group.memberCount} members
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{group.name}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                  {group.description}
                </p>

                {group.topics && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    {group.topics.split(',').map((t: string) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                      >
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Lead: {group.creator?.name || 'Student'}
                </span>

                <button
                  onClick={() => handleJoinLeave(group.id, group.isMember)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    group.isMember
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                  }`}
                >
                  {group.isMember ? 'Joined ✓' : 'Join Group'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Start a Student Study Group"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Group Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI & ML Deep Learning Circle"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            >
              <option value="Programming">Programming</option>
              <option value="AI & ML">AI & ML</option>
              <option value="Web Development">Web Development</option>
              <option value="UI/UX">UI/UX</option>
              <option value="English">English</option>
              <option value="Career & Placements">Career & Placements</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the goals of this group? When will you meet?"
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Topics:</label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="PyTorch, Transformers, Computer Vision, Math"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
