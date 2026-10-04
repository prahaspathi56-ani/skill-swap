import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  Calendar,
  Clock,
  Star,
  Award,
  Globe,
  Github,
  Linkedin,
  Edit3,
  Plus,
  Trash2,
  Repeat,
  CheckCircle,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { SwapRequestModal } from '../../components/common/SwapRequestModal';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, refreshUser } = useAuth();

  const isMyProfile = !id || id === currentUser?.id;
  const targetId = id || currentUser?.id;

  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Edit Profile Form
  const [editName, setEditName] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvailability, setEditAvailability] = useState('');
  const [editLanguages, setEditLanguages] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');

  // Add Skill Form
  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillType, setNewSkillType] = useState<'TEACH' | 'LEARN'>('TEACH');
  const [newSkillLevel, setNewSkillLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');

  const fetchProfile = async () => {
    if (!targetId) return;
    try {
      const [profileData, cats, sks] = await Promise.all([
        api.get<any>(`/users/${targetId}`),
        api.get<any[]>('/skills/categories'),
        api.get<any[]>('/skills'),
      ]);
      setProfile(profileData);
      setCategories(cats);
      setSkillsList(sks);

      setEditName(profileData.name || '');
      setEditCollege(profileData.college || '');
      setEditDepartment(profileData.department || '');
      setEditYear(profileData.year || '');
      setEditBio(profileData.bio || '');
      setEditAvailability(profileData.availability || '');
      setEditLanguages(profileData.languages || '');
      setEditGithub(profileData.githubUrl || '');
      setEditLinkedin(profileData.linkedinUrl || '');
      setEditPortfolio(profileData.portfolioUrl || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/users/me', {
        name: editName,
        college: editCollege,
        department: editDepartment,
        year: editYear,
        bio: editBio,
        availability: editAvailability,
        languages: editLanguages,
        githubUrl: editGithub,
        linkedinUrl: editLinkedin,
        portfolioUrl: editPortfolio,
      });
      setShowEditModal(false);
      refreshUser();
      fetchProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillId) return;
    try {
      await api.post('/users/me/skills', {
        skillId: newSkillId,
        type: newSkillType,
        level: newSkillLevel,
      });
      setShowAddSkillModal(false);
      refreshUser();
      fetchProfile();
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleRemoveSkill = async (userSkillId: string) => {
    if (window.confirm('Remove this skill from your profile?')) {
      try {
        await api.delete(`/users/me/skills/${userSkillId}`);
        refreshUser();
        fetchProfile();
      } catch (err) {
        console.error('Failed to remove skill:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!profile) return <div className="p-8 text-center text-slate-500">Student not found.</div>;

  const teachSkills = (profile.skills || []).filter((s: any) => s.type === 'TEACH');
  const learnSkills = (profile.skills || []).filter((s: any) => s.type === 'LEARN');
  const reviews = profile.reviewsReceived || [];
  const achievements = profile.achievements || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={
                profile.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=7c3aed&color=fff`
              }
              alt={profile.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-100 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{profile.name}</h1>
                {profile.isVerified && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Verified Student
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                <GraduationCap className="w-4 h-4 text-slate-400" />
                {profile.college} {profile.department ? `• ${profile.department}` : ''} ({profile.year})
              </p>

              <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  {profile.ratingAverage || 5.0} ({reviews.length} reviews)
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-700">
                  {profile.completedSessions || 0} completed swaps
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-center">
            {isMyProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setShowSwapModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Repeat className="w-4 h-4" />
                Request Skill Swap
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs sm:text-sm text-slate-700 mt-6 pt-6 border-t border-slate-100 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Availability & Links */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-4">
            {profile.availability && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {profile.availability}
              </span>
            )}
            {profile.languages && <span>Languages: {profile.languages}</span>}
          </div>

          <div className="flex items-center gap-3">
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900">
                <Github className="w-4 h-4" />
              </a>
            )}
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-brand-600">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {profile.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900">
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Skills Showcase Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills I Can Teach */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                Skills I Can Teach
              </span>
              {isMyProfile && (
                <button
                  onClick={() => {
                    setNewSkillType('TEACH');
                    setShowAddSkillModal(true);
                  }}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {teachSkills.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No teaching skills listed.</p>
              ) : (
                teachSkills.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{s.skill?.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{s.level}</span>
                    </div>
                    {isMyProfile && (
                      <button
                        onClick={() => handleRemoveSkill(s.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Skills I Want to Learn
              </span>
              {isMyProfile && (
                <button
                  onClick={() => {
                    setNewSkillType('LEARN');
                    setShowAddSkillModal(true);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {learnSkills.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No learning goals listed.</p>
              ) : (
                learnSkills.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{s.skill?.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{s.level}</span>
                    </div>
                    {isMyProfile && (
                      <button
                        onClick={() => handleRemoveSkill(s.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reviews Received */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            Peer Reviews ({reviews.length})
          </h3>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No reviews yet. Complete a live learning session to earn ratings!
              </p>
            ) : (
              reviews.map((r: any) => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{r.reviewer?.name}</span>
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-current text-amber-400" />
                      {r.rating}/5
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Badges / Achievements */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Badges & Achievements
          </h3>

          <div className="space-y-2.5">
            {achievements.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Badges are unlocked as you swap skills, solve coding challenges, and help peers!
              </p>
            ) : (
              achievements.map((a: any) => (
                <div key={a.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                    🏅
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{a.achievement?.title || a.title}</h4>
                    <p className="text-[11px] text-slate-500">{a.achievement?.description || a.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Student Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name:</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College:</label>
              <input
                type="text"
                value={editCollege}
                onChange={(e) => setEditCollege(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department:</label>
              <input
                type="text"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio:</label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Availability:</label>
            <input
              type="text"
              value={editAvailability}
              onChange={(e) => setEditAvailability(e.target.value)}
              placeholder="e.g. Weekday evenings, Saturdays"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Skill Modal */}
      <Modal isOpen={showAddSkillModal} onClose={() => setShowAddSkillModal(false)} title="Add Skill to Profile">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Skill:</label>
            <select
              value={newSkillId}
              onChange={(e) => setNewSkillId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              required
            >
              <option value="">Select a skill...</option>
              {skillsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Type:</label>
            <select
              value={newSkillType}
              onChange={(e: any) => setNewSkillType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="TEACH">I Can Teach This Skill</option>
              <option value="LEARN">I Want to Learn This Skill</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Skill Level:</label>
            <select
              value={newSkillLevel}
              onChange={(e: any) => setNewSkillLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="BEGINNER">Beginner (Foundations)</option>
              <option value="INTERMEDIATE">Intermediate (Practical applications)</option>
              <option value="ADVANCED">Advanced (Architecture & optimization)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddSkillModal(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs"
            >
              Add to Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Skill Swap Request Modal for other profiles */}
      {showSwapModal && (
        <SwapRequestModal
          isOpen={showSwapModal}
          onClose={() => setShowSwapModal(false)}
          targetUser={profile}
        />
      )}
    </div>
  );
};
