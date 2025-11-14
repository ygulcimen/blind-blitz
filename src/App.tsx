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
import { SimpleAuthProvider } from './context/SimpleAuthContext';
import { SimpleProtectedRoute } from './screens/auth/SimpleProtectedRoute';
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
// Use simple auth pages (username + password only, no email!)
const LoginPage = lazy(() => import('./screens/auth/SimpleLoginPage'));
const SignUpPage = lazy(() => import('./screens/auth/SimpleSignUpPage'));
const ForgotPasswordPage = lazy(() => import('./screens/auth/ForgotPasswordPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="relative">
      <div className="absolute inset-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 blur-md animate-pulse" />
      <img
        src="/logo.png"
        alt="BlindBlitz"
        className="relative w-12 h-12 rounded-lg animate-pulse"
      />
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SimpleAuthProvider>
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
                    <SimpleProtectedRoute>
                      <AppLayout>
                        <LobbyPage />
                      </AppLayout>
                    </SimpleProtectedRoute>
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
                    <SimpleProtectedRoute>
                      <AppLayout hideNavigation={true} hideFooter={true}>
                        <GameScreen />
                      </AppLayout>
                    </SimpleProtectedRoute>
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
                    <SimpleProtectedRoute>
                      <AppLayout>
                        <RewardsPage />
                      </AppLayout>
                    </SimpleProtectedRoute>
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
                    <SimpleProtectedRoute>
                      <AppLayout>
                        <AdminBugReportsPage />
                      </AppLayout>
                    </SimpleProtectedRoute>
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
                    <SimpleProtectedRoute>
                      <AppLayout>
                        <ProfilePage />
                      </AppLayout>
                    </SimpleProtectedRoute>
                  }
                />
              </Routes>
                </Suspense>
              </Router>
            </ModalProvider>
          </ViolationProvider>
        </PlayerEconomyProvider>
        </SimpleAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
