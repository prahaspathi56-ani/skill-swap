import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Repeat,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Wizard state: 1 (Personal), 2 (Teach), 3 (Learn), 4 (Goals), 5 (Availability), 6 (Format), 7 (Complete)
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');
  const [bio, setBio] = useState('');

  // Skills
  const [teachSkills, setTeachSkills] = useState<string[]>(['Python']);
  const [learnSkills, setLearnSkills] = useState<string[]>(['Figma UI/UX Design']);
  const [customTeachInput, setCustomTeachInput] = useState('');
  const [customLearnInput, setCustomLearnInput] = useState('');

  // Goals & Preferences
  const [learningGoals, setLearningGoals] = useState('Master frontend UI design and build production-ready side projects with peers.');
  const [availability, setAvailability] = useState('Weekdays after 6 PM, Weekends flexible');
  const [preferredFormat, setPreferredFormat] = useState('Video + Shared Screen');

  const popularSkills = [
    'Python',
    'React',
    'TypeScript',
    'C++',
    'Figma UI/UX Design',
    'Machine Learning',
    'Data Analysis with Pandas',
    'PostgreSQL & SQL',
    'English Conversational Fluency',
    'Public Speaking & Presentations',
    'Docker & Containers',
    'AWS Basics',
  ];

  const toggleSkill = (skill: string, list: string[], setList: (s: string[]) => void) => {
    if (list.includes(skill)) {
      setList(list.filter((s) => s !== skill));
    } else {
      setList([...list, skill]);
    }
  };

  const addCustomTeach = () => {
    if (customTeachInput.trim() && !teachSkills.includes(customTeachInput.trim())) {
      setTeachSkills([...teachSkills, customTeachInput.trim()]);
      setCustomTeachInput('');
    }
  };

  const addCustomLearn = () => {
    if (customLearnInput.trim() && !learnSkills.includes(customLearnInput.trim())) {
      setLearnSkills([...learnSkills, customLearnInput.trim()]);
      setCustomLearnInput('');
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await register({
        name,
        email,
        password,
        college,
        department,
        year,
        bio: `${bio} | Learning Goal: ${learningGoals} | Preferred Format: ${preferredFormat}`,
        skillsToTeach: teachSkills,
        skillsToLearn: learnSkills,
        availability,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration');
      setStep(1); // Return to first step to fix errors
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Repeat className="w-5 h-5" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Join SkillSwap — 100% Free
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Step {step} of 7: {
            [
              '',
              'Personal Information',
              'Skills You Can Teach',
              'Skills You Want to Learn',
              'Your Learning Goals',
              'Weekly Availability',
              'Preferred Learning Format',
              'Profile Overview & Launch',
            ][step]
          }
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 max-w-md mx-auto overflow-hidden">
          <div
            className="bg-brand-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Google Fast Sign Up */}
              <GoogleSignInButton text="signup_with" onError={(err) => setError(err)} />

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  or register with college email
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College / University:</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Stanford University"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department / Major:</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year of Study:</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                  >
                    <option>1st Year (Freshman)</option>
                    <option>2nd Year (Sophomore)</option>
                    <option>3rd Year (Junior)</option>
                    <option>4th Year (Senior)</option>
                    <option>Graduate / Postgrad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Student Bio:</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What are you currently studying or hacking on?"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!name || !email || !password || password.length < 6) {
                    setError('Please provide your name, valid email, and a password with at least 6 characters.');
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
                className="w-full py-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center justify-center gap-2"
              >
                Next: What Can You Teach?
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Skills You Can Teach */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">What skills can you share with others?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select at least one skill. You don't need to be an expert — helping peers with basics is huge!
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {popularSkills.map((skill) => {
                  const selected = teachSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill, teachSkills, setTeachSkills)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {skill} {selected && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Custom Skill Input */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Add a custom skill:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTeachInput}
                    onChange={(e) => setCustomTeachInput(e.target.value)}
                    placeholder="e.g. Kotlin, Unity, Chess, French..."
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomTeach}
                    className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-900"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (teachSkills.length === 0) {
                      setError('Please select or add at least one skill you can teach.');
                      return;
                    }
                    setError(null);
                    setStep(3);
                  }}
                  className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center gap-1.5"
                >
                  Next: What Do You Want to Learn? <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Skills You Want to Learn */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">What skills are you excited to learn?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  We will use this to automatically match you with peer mentors.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {popularSkills.map((skill) => {
                  const selected = learnSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill, learnSkills, setLearnSkills)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {skill} {selected && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Custom Learn Skill Input */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Add another skill to learn:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customLearnInput}
                    onChange={(e) => setCustomLearnInput(e.target.value)}
                    placeholder="e.g. Next.js, System Design, Guitar..."
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomLearn}
                    className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-900"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (learnSkills.length === 0) {
                      setError('Please select at least one skill you want to learn.');
                      return;
                    }
                    setError(null);
                    setStep(4);
                  }}
                  className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center gap-1.5"
                >
                  Next: Learning Goals <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Learning Goals */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  What is your primary learning goal?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  This helps our AI roadmap generator craft personalized learning checkpoints.
                </p>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="e.g. I want to build a full-stack portfolio app for upcoming campus placements..."
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center gap-1.5"
                >
                  Next: Availability <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Availability */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  When are you generally free to swap?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Peers will check this when requesting live video sessions.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Weekday evenings (6-9 PM), Weekends anytime"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center gap-1.5"
                >
                  Next: Format <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Preferred Learning Format */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Preferred Learning Format</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  How do you collaborate most comfortably?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: 'Live Video + Screen', desc: 'Real-time WebRTC pair programming' },
                  { title: 'Audio + Chat', desc: 'Low-bandwidth, vocal walk-throughs' },
                  { title: 'Asynchronous Q&A', desc: 'Code review and message exchange' },
                ].map((fmt) => (
                  <button
                    key={fmt.title}
                    type="button"
                    onClick={() => setPreferredFormat(fmt.title)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      preferredFormat === fmt.title
                        ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-xs font-bold">{fmt.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{fmt.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center gap-1.5"
                >
                  Next: Review Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Complete Profile & Launch */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Your SkillSwap Profile is Ready!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                  You are all set to exchange knowledge with students worldwide.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-bold text-slate-800">{name} ({college})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Can Teach:</span>
                  <span className="font-semibold text-brand-700">{teachSkills.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Wants to Learn:</span>
                  <span className="font-semibold text-emerald-700">{learnSkills.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Availability:</span>
                  <span className="text-slate-700">{availability}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="px-7 py-3 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Creating Student Profile...' : 'Launch Dashboard 🚀'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
