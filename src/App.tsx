// App.tsx
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
import { LoginPage, SignUpPage } from './screens/auth/LoginPage';

function App() {
  return (
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
                  <AppLayout>
                    <LobbyPage />
                  </AppLayout>
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
                  <AppLayout hideNavigation={true} hideFooter={true}>
                    <GameScreen />
                  </AppLayout>
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
                  <AppLayout hideNavigation={true} hideFooter={true}>
                    <LoginPage />
                  </AppLayout>
                }
              />
              <Route
                path="/signup"
                element={
                  <AppLayout hideNavigation={true} hideFooter={true}>
                    <SignUpPage />
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
  );
}

export default App;
