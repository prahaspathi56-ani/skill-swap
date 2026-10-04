import React from 'react';
import { Link } from 'react-router-dom';
import {
  Repeat,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  HelpCircle,
  Code2,
  Languages,
  Award,
  BookOpen,
  CheckCircle,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import { Footer } from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.15),rgba(255,255,255,0))] -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 100% Free Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-6 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Free Student Skill Exchange — No Paywalls Forever
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            SKILLSWAP
            <span className="block mt-2 text-2xl sm:text-3xl font-medium text-brand-600">
              "Learn. Teach. Exchange. Grow."
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8">
            SkillSwap connects university students who want to learn with peers who want to teach.
            Your skills can help someone. Someone else's skills can help you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02]"
            >
              Start Swapping Skills
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-all"
            >
              Explore Skills
            </Link>
          </div>

          {/* Reciprocal Student Exchange Flowchart */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl max-w-4xl mx-auto">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6">
              The Reciprocal Learning Loop
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-center">
              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100">
                <span className="text-xl font-black text-brand-700 block">YOU KNOW</span>
                <span className="text-[11px] text-slate-600 mt-1 block">Your existing skills & passions</span>
              </div>
              <div className="text-brand-500 font-bold text-lg hidden sm:block">↓</div>
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-xl font-black text-indigo-700 block">TEACH SOMEONE</span>
                <span className="text-[11px] text-slate-600 mt-1 block">Pair with a fellow student</span>
              </div>
              <div className="text-brand-500 font-bold text-lg hidden sm:block">↓</div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-xl font-black text-emerald-700 block">GROW TOGETHER</span>
                <span className="text-[11px] text-slate-600 mt-1 block">Bilateral knowledge mastery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything University Students Need to Learn Together
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Built by students, for students. No paid tiers, no subscriptions, no barriers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-4">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Smart Reciprocal Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Matches you with students who want to learn what you can teach, and can teach what you want to learn.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Live WebRTC Peer Sessions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Built-in peer-to-peer video, screen sharing, live chat, shared session notes, and hand raising without third-party downloads.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">AI Concept Doubt Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pedagogical AI tutor that explains core concepts first, gives progressive hints, and links you to human student mentors.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Integrated Coding Challenges</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Practice Python, C++, Java, and JavaScript with test case feedback evaluated inside a safe sandbox architecture.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">English & Speaking Lab</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Practice conversational fluency, campus presentation prep, and placement interviews with peers and AI conversation prompts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-4">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Student Question Hub</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Campus Q&A hub with verified answers, upvoting, tag filtering, bookmarks, and automated AI initial answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Everything you need to know about SkillSwap</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900 mb-1">Is SkillSwap really 100% free?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes, completely. There are no paid subscriptions, credit packages, or locked premium content. SkillSwap operates on pure reciprocal peer learning: you teach what you know, and learn what you don't.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900 mb-1">What if I am a beginner and don't feel like an "expert"?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                You do NOT need to be an expert! A 2nd-year student can teach a 1st-year student basic git commands, or someone good at English can teach an engineering student conversational skills. Everyone has something to share.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900 mb-1">How do live learning sessions work?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                After matching and agreeing on a swap, you schedule a session with a click. When it's time, both students enter the WebRTC live room with peer video, screen sharing, live chat, and collaborative notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-tr from-brand-600 to-indigo-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">Ready to Swap Skills and Level Up?</h2>
          <p className="text-xs sm:text-sm text-brand-100 max-w-xl mx-auto mb-6">
            Join students from colleges worldwide exchanging Python, Figma, React, English, and more.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-brand-700 font-extrabold text-sm shadow-xl hover:bg-slate-100 transition-all hover:scale-105"
          >
            Create Your Free Student Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};
