import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ExplorePage } from './pages/explore/ExplorePage';
import { MatchesPage } from './pages/matches/MatchesPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { SessionsPage } from './pages/sessions/SessionsPage';
import { LiveSessionRoom } from './pages/sessions/LiveSessionRoom';
import { QuestionsPage } from './pages/questions/QuestionsPage';
import { QuestionDetailPage } from './pages/questions/QuestionDetailPage';
import { CommunityPage } from './pages/community/CommunityPage';
import { StudyGroupsPage } from './pages/groups/StudyGroupsPage';
import { RoadmapsPage } from './pages/roadmaps/RoadmapsPage';
import { CodingPage } from './pages/coding/CodingPage';
import { EnglishPracticePage } from './pages/english/EnglishPracticePage';
import { AIAssistantPage } from './pages/ai/AIAssistantPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AdminPage } from './pages/admin/AdminPage';

// Layout wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Full-width live room mode
  const isLiveRoom = location.pathname.startsWith('/sessions/swap-');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        {!isLiveRoom && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</main>
      </div>
      {!isLiveRoom && <MobileNav />}
    </div>
  );
};

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<LoginPage />} />

      {/* Authenticated / Student Workflows */}
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        }
      />
      <Route
        path="/explore"
        element={
          <AppLayout>
            <ExplorePage />
          </AppLayout>
        }
      />
      <Route
        path="/skills"
        element={
          <AppLayout>
            <ExplorePage />
          </AppLayout>
        }
      />
      <Route
        path="/matches"
        element={
          <AppLayout>
            <MatchesPage />
          </AppLayout>
        }
      />
      <Route
        path="/messages"
        element={
          <AppLayout>
            <MessagesPage />
          </AppLayout>
        }
      />
      <Route
        path="/sessions"
        element={
          <AppLayout>
            <SessionsPage />
          </AppLayout>
        }
      />
      <Route
        path="/sessions/:roomId"
        element={
          <AppLayout>
            <LiveSessionRoom />
          </AppLayout>
        }
      />
      <Route
        path="/questions"
        element={
          <AppLayout>
            <QuestionsPage />
          </AppLayout>
        }
      />
      <Route
        path="/questions/:id"
        element={
          <AppLayout>
            <QuestionDetailPage />
          </AppLayout>
        }
      />
      <Route
        path="/community"
        element={
          <AppLayout>
            <CommunityPage />
          </AppLayout>
        }
      />
      <Route
        path="/groups"
        element={
          <AppLayout>
            <StudyGroupsPage />
          </AppLayout>
        }
      />
      <Route
        path="/roadmaps"
        element={
          <AppLayout>
            <RoadmapsPage />
          </AppLayout>
        }
      />
      <Route
        path="/coding"
        element={
          <AppLayout>
            <CodingPage />
          </AppLayout>
        }
      />
      <Route
        path="/english"
        element={
          <AppLayout>
            <EnglishPracticePage />
          </AppLayout>
        }
      />
      <Route
        path="/ai-assistant"
        element={
          <AppLayout>
            <AIAssistantPage />
          </AppLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <AppLayout>
            <AdminPage />
          </AppLayout>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
