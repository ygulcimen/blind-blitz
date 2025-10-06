// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ViolationProvider } from './components/shared/ViolationSystem';
import { PlayerEconomyProvider } from './context/PlayerEconomyConcept';
import { ModalProvider } from './context/ModalContext'; // ✅ NEW
import { ErrorBoundary } from './components/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';

// Import all screens
import BlindChessLanding from './screens/LandingPage';
import LobbyPage from './screens/lobbyPage/LobbyPage';
import GameScreen from './screens/GameScreen';
import ProfilePage from './screens/ProfilePage';
import SettingsPage from './screens/SettingsPage';
import { LeaderboardPage } from './screens/LeaderboardPage';
import { RewardsPage } from './screens/RewardsPage';
import AboutPage from './screens/AboutPage';
import FAQPage from './screens/FAQPage';
import HowToPlayPage from './screens/HowToPlayPage';
import LoginPage from './screens/auth/LoginPage';
import SignUpPage from './screens/auth/SignUpPage';
import ForgotPasswordPage from './screens/auth/ForgotPasswordPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './screens/auth/ProtectedRoute';
import { AuthRedirect } from './screens/auth/AuthRedirect';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlayerEconomyProvider>
          <ViolationProvider>
            <ModalProvider>
              <Router>
                <Routes>
                <Route
                  path="/"
                  element={
                    <AppLayout hideNavigation={false} hideFooter={false}>
                      <BlindChessLanding />
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
                <Route
                  path="/settings"
                  element={
                    <AppLayout>
                      <SettingsPage />
                    </AppLayout>
                  }
                />
              </Routes>
              </Router>
            </ModalProvider>
          </ViolationProvider>
        </PlayerEconomyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
