import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Global } from '@emotion/react';
import { globalStyles } from './styles/globalStyles';
import { RoomProvider } from './context/RoomContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import PickMovie from './pages/PickMovie';
import JoinRoom from './pages/JoinRoom';
import WatchRoom from './pages/WatchRoom';
import RoomNotFound from './pages/RoomNotFound';

function App() {
  return (
    <ErrorBoundary>
      <RoomProvider>
        <Global styles={globalStyles} />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pick-movie" element={<PickMovie />} />
            <Route path="/join-room" element={<JoinRoom />} />
            <Route path="/watch-room/:roomCode" element={<WatchRoom />} />
            <Route path="/room-not-found" element={<RoomNotFound />} />
            <Route path="*" element={<RoomNotFound />} />
          </Routes>
        </Router>
      </RoomProvider>
    </ErrorBoundary>
  );
}

export default App;
