import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { StudentCard } from '../../components/common/StudentCard';
import { SwapRequestModal } from '../../components/common/SwapRequestModal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Filter, Compass, Sparkles, GraduationCap } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCollege, setSelectedCollege] = useState<string>('All');
  const [categories, setCategories] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'skills'>('students');
  const [selectedStudentForSwap, setSelectedStudentForSwap] = useState<any>(null);

  useEffect(() => {
    // Fetch categories and initial skills
    Promise.all([
      api.get<any[]>('/skills/categories'),
      api.get<any[]>('/skills'),
    ]).then(([cats, sks]) => {
      setCategories(cats);
      setSkills(sks);
    });
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (selectedCategory && selectedCategory !== 'All') {
          params.append('skill', selectedCategory);
        }
        if (selectedCollege && selectedCollege !== 'All') {
          params.append('college', selectedCollege);
        }

        const data = await api.get<any[]>(`/users?${params.toString()}`);
        setStudents(data);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [searchQuery, selectedCategory, selectedCollege]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-brand-600" />
            Explore Student Skills
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search peer mentors, filter by categories and universities, or request a bilateral skill swap.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'students'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'skills'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skill Taxonomy ({skills.length})
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name, college, skill (e.g. Python, Figma, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none text-slate-700 font-medium"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none text-slate-700 font-medium"
          >
            <option value="All">All Universities</option>
            <option value="Stanford">Stanford University</option>
            <option value="MIT">MIT</option>
            <option value="UC Berkeley">UC Berkeley</option>
            <option value="Carnegie Mellon">Carnegie Mellon (CMU)</option>
            <option value="Georgia Tech">Georgia Tech</option>
            <option value="Harvard">Harvard University</option>
          </select>

          {(searchQuery || selectedCategory !== 'All' || selectedCollege !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedCollege('All');
                setSearchParams({});
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'students' ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No students matched your search"
            description="Try clearing your filters or searching for another skill like Python, Figma, or React."
            actionText="Clear Search"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedCollege('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onRequestSwap={(st) => setSelectedStudentForSwap(st)}
              />
            ))}
          </div>
        )
      ) : (
        /* Taxonomy View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                  {skill.category?.name || 'Category'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{skill.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{skill.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                <span className="text-slate-400">
                  {skill._count?.userSkills || 0} students teaching/learning
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory(skill.name);
                    setActiveTab('students');
                  }}
                  className="font-bold text-brand-600 hover:text-brand-700"
                >
                  Find Peers →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Swap Request Modal */}
      {selectedStudentForSwap && (
        <SwapRequestModal
          isOpen={Boolean(selectedStudentForSwap)}
          onClose={() => setSelectedStudentForSwap(null)}
          targetUser={selectedStudentForSwap}
        />
      )}
    </div>
  );
};
