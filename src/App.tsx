// App.tsx - Updated with PlayerEconomy Provider
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ViolationProvider } from './components/shared/ViolationSystem';
import { PlayerEconomyProvider } from './context/PlayerEconomyConcept';
import AppLayout from './components/layout/AppLayout';
//import LandingPage from './screens/LandingPage';
import LobbyPage from './screens/LobbyPage';
import GameScreen from './screens/GameScreen';
import ProfilePage from './screens/ProfilePage';
import SettingsPage from './screens/SettingsPage';
import BlindChessLanding from './screens/LandingPage';

function App() {
  return (
    <PlayerEconomyProvider>
      <ViolationProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<BlindChessLanding />} />
              <Route path="/lobby" element={<LobbyPage />} />
              <Route path="/game" element={<GameScreen />} />
              <Route path="/game/:gameId" element={<GameScreen />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </AppLayout>
        </Router>
      </ViolationProvider>
    </PlayerEconomyProvider>
  );
}

export default App;
