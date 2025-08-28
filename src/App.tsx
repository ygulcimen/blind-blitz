// App.tsx
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ViolationProvider } from './components/shared/ViolationSystem';
import { PlayerEconomyProvider } from './context/PlayerEconomyConcept';
import { ModalProvider } from './context/ModalContext'; // ✅ NEW
import AppLayout from './components/layout/AppLayout';

// Import all screens
import BlindChessLanding from './screens/LandingPage';
import LobbyPage from './screens/lobbyPage/LobbyPage';
import GameScreen from './screens/GameScreen';
import ProfilePage from './screens/ProfilePage';
import SettingsPage from './screens/SettingsPage';
import { LeaderboardPage } from './screens/LeaderboardPage';
import TournamentsPage from './screens/TournamentsPage';
import AboutPage from './screens/AboutPage';
import FAQPage from './screens/FAQPage';
import LoginPage from './screens/auth/LoginPage';
import SignUpPage from './screens/auth/SignUpPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './screens/auth/ProtectedRoute';
import { AuthRedirect } from './screens/auth/AuthRedirect';

function App() {
  useEffect(() => {
    const testDatabase = async () => {
      const { data, error } = await supabase.from('players').select('*');

      console.log('Players data:', data);
      console.log('Any errors:', error);
    };
    testDatabase();
  }, []);
  return (
    <AuthProvider>
      <PlayerEconomyProvider>
        <ViolationProvider>
          <ModalProvider>
            {' '}
            {/* ✅ Wrap here */}
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
                  path="/tournaments"
                  element={
                    <AppLayout>
                      <TournamentsPage />
                    </AppLayout>
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
  );
}

export default App;
