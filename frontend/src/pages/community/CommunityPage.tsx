import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Heart,
  MessageSquare,
  Plus,
  Share2,
  Tag,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Post Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Success Story');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comments state per post
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  const fetchPosts = async () => {
    try {
      const data = await api.get<any[]>(`/community/posts?category=${selectedCategory}`);
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsSubmitting(true);
    try {
      await api.post('/community/posts', {
        title,
        content,
        category,
        tags,
      });
      setShowCreateModal(false);
      setTitle('');
      setContent('');
      setTags('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const res = await api.post<any>(`/community/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiked: res.isLiked, likesCount: res.likesCount } : p
        )
      );
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentInput[postId]?.trim();
    if (!text || !user) return;
    try {
      const newComment = await api.post<any>(`/community/posts/${postId}/comments`, { content: text });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [...(p.comments || []), newComment],
                commentsCount: p.commentsCount + 1,
              }
            : p
        )
      );
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const categories = ['All', 'Success Story', 'Tips & Tricks', 'Collaboration', 'Project Showcase', 'General'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-600" />
            Student Community
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Exchange stories, swap experiences, share learning strategies, and find collaborators.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Share Discussion
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No posts in this category"
          description="Be the first student to start a discussion!"
          actionText="Create Post"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Post Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      post.author?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Student')}&background=7c3aed&color=fff`
                    }
                    alt={post.author?.name}
                    className="w-9 h-9 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{post.author?.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {post.author?.college || 'Peer'} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {post.category}
                </span>
              </div>

              {/* Title & Body */}
              <div>
                <h3 className="text-base font-bold text-slate-900">{post.title}</h3>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border ${
                      post.isLiked
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likesCount || 0}
                  </button>

                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {post.commentsCount || 0} Comments
                  </span>
                </div>
              </div>

              {/* Comments Subsection */}
              <div className="bg-slate-50 rounded-2xl p-3.5 space-y-3">
                {(post.comments || []).map((c: any) => (
                  <div key={c.id} className="text-xs space-y-0.5">
                    <span className="font-bold text-slate-900">{c.author?.name}: </span>
                    <span className="text-slate-700">{c.content}</span>
                  </div>
                ))}

                {user && (
                  <div className="flex gap-2 pt-2 border-t border-slate-200/60">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInput[post.id] || ''}
                      onChange={(e) =>
                        setCommentInput({ ...commentInput, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Discussion Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Share with the Student Community"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
            >
              <option value="Success Story">Success Story</option>
              <option value="Tips & Tricks">Tips & Tricks</option>
              <option value="Collaboration">Collaboration</option>
              <option value="Project Showcase">Project Showcase</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How learning Python helped me build a campus tool"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Content:</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what you learned, tips for other students, or what you're building..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              required
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
              {isSubmitting ? 'Posting...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
