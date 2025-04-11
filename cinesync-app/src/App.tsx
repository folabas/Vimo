import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Global } from '@emotion/react';
import { globalStyles } from './styles/globalStyles';
import { RoomProvider } from './context/RoomContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import styled from '@emotion/styled';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PickMovie from './pages/PickMovie';
import JoinRoom from './pages/JoinRoom';
import WatchRoom from './pages/WatchRoom';
import RoomNotFound from './pages/RoomNotFound';

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const location = useLocation();
  const isWatchRoomPage = location.pathname.includes('/watch-room');
  const isPickMoviePage = location.pathname.includes('/pick-movie');
  const isJoinRoomPage = location.pathname.includes('/join-room');
  
  // Render a simplified layout for watch room
  return (
    <PageWrapper>
      {!isWatchRoomPage && !isPickMoviePage && !isJoinRoomPage && <Header />}
      <ContentContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/pick-movie" 
            element={
              <ProtectedRoute>
                <PickMovie />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/join-room" 
            element={
              <ProtectedRoute>
                <JoinRoom />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/watch-room/:roomCode" 
            element={
              <ProtectedRoute>
                <WatchRoom />
              </ProtectedRoute>
            } 
          />
          <Route path="/room-not-found" element={<RoomNotFound />} />
          <Route path="*" element={<RoomNotFound />} />
        </Routes>
      </ContentContainer>
      {!isWatchRoomPage && <Footer />}
    </PageWrapper>
  );
}

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <Global styles={globalStyles} />
        <Router>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </Router>
      </RoomProvider>
    </AuthProvider>
  );
}

export default App;
