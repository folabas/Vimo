import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Global } from '@emotion/react';
import { globalStyles } from './styles/globalStyles';
import { RoomProvider } from './context/RoomContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import styled from '@emotion/styled';
import { Analytics } from "@vercel/analytics/react";

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
  const { isLoggedIn } = useAuth();
  const isWatchRoomPage = location.pathname.includes('/watch-room');
  const isPickMoviePage = location.pathname.includes('/pick-movie');
  const isJoinRoomPage = location.pathname.includes('/join-room');
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';
  const isHomePage = location.pathname === '/';
  
  // Only show header on authenticated pages or non-auth pages that aren't login/signup/home
  const showHeader = !isWatchRoomPage && !isPickMoviePage && !isJoinRoomPage && 
                    !(isLoginPage || isSignupPage || (isHomePage && !isLoggedIn));
  
  // Render a simplified layout for watch room
  return (
    <PageWrapper>
      {showHeader && <Header />}
      <ContentContainer>
        <Routes>
          <Route 
            path="/" 
            element={
              isLoggedIn ? 
                <Navigate to="/dashboard" /> : 
                <Home />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              isLoggedIn ? 
                <Navigate to="/dashboard" /> : 
                <Login />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isLoggedIn ? 
                <Navigate to="/dashboard" /> : 
                <Signup />
            } 
          />
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
            <Analytics />
          </ErrorBoundary>
        </Router>
      </RoomProvider>
    </AuthProvider>
  );
}

export default App;
