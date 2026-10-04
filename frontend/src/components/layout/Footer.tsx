import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Heart, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Repeat className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-slate-900">SkillSwap</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              "Your skills can help someone. Someone else's skills can help you." A free, reciprocal student-to-student learning platform built for true collaborative growth.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Free for Students — No Paywalls Forever
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/explore" className="hover:text-brand-600 transition-colors">Find Mentors & Peers</Link></li>
              <li><Link to="/matches" className="hover:text-brand-600 transition-colors">Smart Reciprocal Matching</Link></li>
              <li><Link to="/questions" className="hover:text-brand-600 transition-colors">Student Question Hub</Link></li>
              <li><Link to="/groups" className="hover:text-brand-600 transition-colors">Study Groups</Link></li>
            </ul>
          </div>

          {/* Learning Labs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Practice Labs</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/coding" className="hover:text-brand-600 transition-colors">Coding Challenges</Link></li>
              <li><Link to="/english" className="hover:text-brand-600 transition-colors">English Speaking Lab</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-brand-600 transition-colors">AI Doubt Assistant</Link></li>
              <li><Link to="/roadmaps" className="hover:text-brand-600 transition-colors">Career Roadmaps</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} SkillSwap. Built with <Heart className="w-3.5 h-3.5 text-rose-500 inline mx-0.5 fill-current" /> for university students globally.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Open Knowledge</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Peer Powered</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
