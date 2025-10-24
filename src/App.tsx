// App.tsx
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ViolationProvider } from './components/shared/ViolationSystem';
import { PlayerEconomyProvider } from './context/PlayerEconomyConcept';
import { ModalProvider } from './context/ModalContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';
import { trackPageView } from './lib/analytics';

// Analytics tracker and scroll-to-top component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    trackPageView(location.pathname + location.search);

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

// Critical screens - load immediately
import BlindBlitzLanding from './screens/LandingPage';
import LobbyPage from './screens/lobbyPage/LobbyPage';
import GameScreen from './screens/GameScreen';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './screens/auth/ProtectedRoute';
import { AuthRedirect } from './screens/auth/AuthRedirect';

// Non-critical screens - lazy load (saves ~300-400kb initial bundle)
const ProfilePage = lazy(() => import('./screens/ProfilePage'));
const LeaderboardPage = lazy(() => import('./screens/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const RewardsPage = lazy(() => import('./screens/RewardsPage').then(m => ({ default: m.RewardsPage })));
const AboutPage = lazy(() => import('./screens/AboutPage'));
const FAQPage = lazy(() => import('./screens/FAQPage'));
const HowToPlayPage = lazy(() => import('./screens/HowToPlayPage'));
const BugReportPage = lazy(() => import('./screens/BugReportPage'));
const AdminBugReportsPage = lazy(() => import('./screens/AdminBugReportsPage'));
const LoginPage = lazy(() => import('./screens/auth/LoginPage'));
const SignUpPage = lazy(() => import('./screens/auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./screens/auth/ForgotPasswordPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlayerEconomyProvider>
          <ViolationProvider>
            <ModalProvider>
              <Router>
                <AnalyticsTracker />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                <Route
                  path="/"
                  element={
                    <AppLayout hideNavigation={false} hideFooter={false}>
                      <BlindBlitzLanding />
                    </AppLayout>
                  }
                />
                <Route
                  path="/games"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <LobbyPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/game"
                  element={
                    <AppLayout hideNavigation={true} hideFooter={true}>
                      <GameScreen />
                    </AppLayout>
                  }
                />
                <Route
                  path="/game/:gameId"
                  element={
                    <ProtectedRoute>
                      <AppLayout hideNavigation={true} hideFooter={true}>
                        <GameScreen />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <AppLayout>
                      <LeaderboardPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/rewards"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RewardsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <AppLayout>
                      <AboutPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/faq"
                  element={
                    <AppLayout>
                      <FAQPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/how-to-play"
                  element={
                    <AppLayout>
                      <HowToPlayPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/bug-report"
                  element={
                    <AppLayout>
                      <BugReportPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/admin/bug-reports"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AdminBugReportsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <AuthRedirect>
                      <AppLayout hideNavigation={true} hideFooter={true}>
                        <LoginPage />
                      </AppLayout>
                    </AuthRedirect>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <AuthRedirect>
                      <AppLayout hideNavigation={true} hideFooter={true}>
                        <SignUpPage />
                      </AppLayout>
                    </AuthRedirect>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <AuthRedirect>
                      <AppLayout hideNavigation={true} hideFooter={true}>
                        <ForgotPasswordPage />
                      </AppLayout>
                    </AuthRedirect>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ProfilePage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
                </Suspense>
              </Router>
            </ModalProvider>
          </ViolationProvider>
        </PlayerEconomyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
