import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  HelpCircle,
  Search,
  Plus,
  ThumbsUp,
  MessageSquare,
  Eye,
  Sparkles,
  Tag,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);

  // Ask Question Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      const [questionsData, cats] = await Promise.all([
        api.get<any[]>(`/questions?${params.toString()}`),
        api.get<any[]>('/skills/categories'),
      ]);
      setQuestions(questionsData);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [searchQuery, selectedCategory]);

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !categoryId) {
      setError('Title, content, and category are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/questions', {
        title,
        content,
        categoryId,
        tags,
      });

      setShowAskModal(false);
      setTitle('');
      setContent('');
      setTags('');
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to submit question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-brand-600" />
            Student Question Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ask doubts, share peer answers, and get automated AI concept assistance.
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Ask a Question
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus:bg-white focus:outline-none font-medium text-slate-700"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Questions Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions found"
          description="Be the first student to ask a question or explore another category!"
          actionText="Ask a Question"
          onAction={() => setShowAskModal(true)}
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                    {q.category?.name || 'Category'}
                  </span>
                  <span className="text-xs text-slate-400">
                    by {q.author?.name || 'Student'} ({q.author?.college || 'University'})
                  </span>
                </div>

                <Link
                  to={`/questions/${q.id}`}
                  className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors block"
                >
                  {q.title}
                </Link>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {q.content}
                </p>

                {/* AI Assistant Answer Pill */}
                {q.aiAssistanceAnswer && (
                  <div className="mt-3 p-2.5 rounded-xl bg-violet-50/70 border border-violet-100 flex items-center gap-2 text-xs text-violet-800">
                    <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
                    <span className="font-semibold text-[11px] truncate">
                      AI Concept Insight Available
                    </span>
                  </div>
                )}
              </div>

              {/* Stats Footer */}
              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <ThumbsUp className="w-3.5 h-3.5" /> {q.voteCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> {q.answerCount || 0} Answers
                  </span>
                  <span className="flex items-center gap-1 hidden sm:flex">
                    <Eye className="w-3.5 h-3.5" /> {q.views || 0} Views
                  </span>
                </div>

                <Link
                  to={`/questions/${q.id}`}
                  className="font-bold text-brand-600 hover:text-brand-700"
                >
                  View Discussion →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ask Question Modal */}
      <Modal
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
        title="Ask a Question to the Community"
      >
        <form onSubmit={handleAskSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category:
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Question Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Why does React useEffect run twice in development mode?"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Question Content:
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Explain the background, what you tried, and what error or unexpected behavior you observed..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tags (comma separated):
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, javascript, hooks, debugging"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAskModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Posting with AI Assistant...' : 'Post Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
