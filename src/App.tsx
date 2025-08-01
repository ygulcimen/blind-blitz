import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ViolationProvider } from './components/shared/ViolationSystem';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './screens/LandingPage';
import LobbyPage from './screens/LobbyPage';
import GameScreen from './screens/GameScreen';
import ProfilePage from './screens/ProfilePage';
import SettingsPage from './screens/SettingsPage';

function App() {
  return (
    <ViolationProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/game" element={<GameScreen />} />
            <Route path="/game/:gameId" element={<GameScreen />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AppLayout>
      </Router>
    </ViolationProvider>
  );
}

export default App;
