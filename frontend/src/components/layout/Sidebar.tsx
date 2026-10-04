import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Repeat,
  MessageSquare,
  Video,
  HelpCircle,
  Users,
  BookOpen,
  Code2,
  Languages,
  Sparkles,
  Map,
  User,
  ShieldAlert,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/explore', label: 'Explore Skills', icon: Compass },
    { to: '/matches', label: 'Smart Matches', icon: Repeat, badge: 'Smart' },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/sessions', label: 'Live Sessions', icon: Video },
    { to: '/questions', label: 'Question Hub', icon: HelpCircle },
    { to: '/community', label: 'Community', icon: Users },
    { to: '/groups', label: 'Study Groups', icon: BookOpen },
    { to: '/coding', label: 'Coding Practice', icon: Code2 },
    { to: '/english', label: 'English Lab', icon: Languages },
    { to: '/roadmaps', label: 'Learning Roadmaps', icon: Map },
    { to: '/ai-assistant', label: 'AI Doubt Assistant', icon: Sparkles, highlight: true },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'MODERATOR') {
    links.push({ to: '/admin', label: 'Admin Moderation', icon: ShieldAlert, highlight: false });
  }

  const content = (
    <div className="h-full flex flex-col justify-between py-4 px-3 bg-white border-r border-slate-200">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 mb-3 lg:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/10 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${link.highlight ? 'text-violet-700 bg-violet-50/50' : ''}`
              }
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    link.highlight ? 'text-brand-600 animate-pulse-subtle' : ''
                  }`}
                />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Reciprocal Student Manifesto Card */}
      <div className="p-3.5 bg-gradient-to-br from-brand-50 to-indigo-50/60 rounded-2xl border border-brand-100 text-center">
        <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
          <Repeat className="w-4 h-4" />
        </div>
        <p className="text-xs font-bold text-slate-800">100% Free Forever</p>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          No paywalls. No subscriptions. Just peer-to-peer knowledge sharing.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 shrink-0 overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
