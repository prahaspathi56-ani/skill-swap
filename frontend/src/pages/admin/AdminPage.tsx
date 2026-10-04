import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Users,
  Video,
  BookOpen,
  CheckCircle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');

  const fetchAdminData = async () => {
    try {
      const [statsData, usersData, reportsData] = await Promise.all([
        api.get<any>('/admin/stats'),
        api.get<any[]>('/admin/users'),
        api.get<any[]>('/admin/reports'),
      ]);
      setStats(statsData);
      setUsersList(usersData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      await api.patch(`/admin/reports/${reportId}`, { status });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update report:', err);
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
    return (
      <div className="p-8 text-center text-rose-600 font-bold">
        Access Denied. You must be an Administrator or Moderator to view this portal.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-400" />
          Platform Moderation & RBAC
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Admin Moderation Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage user permissions, monitor platform health, and resolve moderation flags.
        </p>
      </div>

      {/* Analytics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-600" /> Total Students
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" /> Curated Skills
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalSkills}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-indigo-600" /> Completed Swaps
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.completedSessions}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Pending Reports
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.pendingReports}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Management ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'reports'
              ? 'border-brand-600 text-brand-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Reports & Flags ({reports.length})
        </button>
      </div>

      {/* Tab 1: User Management Table */}
      {activeTab === 'users' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.college || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-100 text-rose-800'
                            : u.role === 'MODERATOR'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-brand-50 text-brand-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {user.role === 'ADMIN' && u.id !== user.id && (
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="text-[11px] bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-semibold"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Reports Queue */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          {reports.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">
              No pending reports. All student interactions are in healthy standing!
            </p>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    {rep.targetType} Flag
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{rep.reason}</h4>
                  <p className="text-[11px] text-slate-400">
                    Reported by: {rep.reporter?.name} ({rep.reporter?.email})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolveReport(rep.id, 'DISMISSED')}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
