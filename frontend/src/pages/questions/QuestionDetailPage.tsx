import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  HelpCircle,
  ThumbsUp,
  Bookmark,
  Share2,
  CheckCircle,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  User,
  GraduationCap,
} from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';

export const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [question, setQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [userVote, setUserVote] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const fetchQuestion = async () => {
    try {
      const data = await api.get<any>(`/questions/${id}`);
      setQuestion(data);
      setUserVote(data.userVote || 0);
      setIsBookmarked(data.isBookmarked || false);
    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQuestion();
  }, [id]);

  const handleVote = async (value: number) => {
    if (!user) return;
    try {
      const res = await api.post<any>(`/questions/${id}/vote`, { value });
      setUserVote(res.userVote);
      setQuestion((prev: any) => ({
        ...prev,
        voteCount: prev.voteCount + (res.userVote === value ? value : -value),
      }));
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    try {
      const res = await api.post<any>(`/questions/${id}/bookmark`);
      setIsBookmarked(res.isBookmarked);
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !user) return;

    setIsSubmittingAnswer(true);
    try {
      await api.post(`/questions/${id}/answers`, { content: newAnswer.trim() });
      setNewAnswer('');
      fetchQuestion();
    } catch (err) {
      console.error('Failed to post answer:', err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleAnswerVote = async (answerId: string, value: number) => {
    if (!user) return;
    try {
      const res = await api.post<any>(`/questions/answers/${answerId}/vote`, { value });
      setQuestion((prev: any) => ({
        ...prev,
        answers: prev.answers.map((a: any) =>
          a.id === answerId ? { ...a, voteCount: res.voteCount } : a
        ),
      }));
    } catch (err) {
      console.error('Failed to vote on answer:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">Question not found</p>
        <Link to="/questions" className="text-brand-600 font-bold text-xs mt-2 inline-block">
          ← Back to Question Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to="/questions"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Question Hub
      </Link>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700">
            {question.category?.name || 'General'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl border transition-all ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'text-slate-400 border-slate-200 hover:bg-slate-50'
              }`}
              title="Bookmark question"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {question.title}
        </h1>

        {/* Author Byline */}
        <div className="flex items-center gap-3 py-2 border-y border-slate-100 text-xs text-slate-500">
          <img
            src={
              question.author?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(question.author?.name || 'Student')}&background=7c3aed&color=fff`
            }
            alt={question.author?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <span className="font-bold text-slate-800">{question.author?.name}</span>
            <span className="text-slate-400 ml-1.5 font-medium">({question.author?.college || 'University'})</span>
          </div>
          <span className="text-slate-300">•</span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line py-2">
          {question.content}
        </div>

        {/* Tags */}
        {question.tags && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {question.tags.split(',').map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Question Voting Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                userVote === 1
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Upvote ({question.voteCount || 0})
            </button>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {question.views} views • {question.answers?.length || 0} answers
          </span>
        </div>
      </div>

      {/* AI Assistant Conceptual Answer Card */}
      {question.aiAssistanceAnswer && (
        <div className="bg-gradient-to-br from-violet-50 via-brand-50 to-indigo-50 rounded-3xl border border-violet-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-violet-900 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-violet-600" />
            SkillSwap AI Concept Assistant
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {question.aiAssistanceAnswer}
          </p>
          <div className="text-[10px] text-violet-600 italic">
            Note: This AI summary provides conceptual hints. Review answers from fellow students below!
          </div>
        </div>
      )}

      {/* Answers Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-600" />
          Student Answers ({question.answers?.length || 0})
        </h3>

        {question.answers?.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-xs text-slate-500">
            No student answers yet. Know the solution? Share your knowledge below!
          </div>
        ) : (
          question.answers.map((ans: any) => (
            <div
              key={ans.id}
              className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs space-y-3 ${
                ans.isAccepted ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      ans.author?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(ans.author?.name || 'Peer')}&background=7c3aed&color=fff`
                    }
                    alt={ans.author?.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">{ans.author?.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({ans.author?.college || 'Student'})
                    </span>
                  </div>
                </div>

                {ans.isAccepted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Accepted Answer
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {ans.content}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={() => handleAnswerVote(ans.id, 1)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Helpful ({ans.voteCount || 0})
                </button>
                <span>{new Date(ans.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Answer Submission Form */}
      {user ? (
        <form onSubmit={handleAnswerSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Post Your Answer:
          </h4>
          <textarea
            rows={4}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Write a clear, supportive answer. Explain the concept and share code or steps..."
            className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:outline-none"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingAnswer || !newAnswer.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmittingAnswer ? 'Posting...' : 'Submit Answer'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-600">
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign in
          </Link>{' '}
          to answer this question.
        </div>
      )}
    </div>
  );
};
