'use client';

import { useState, useEffect } from 'react';
import { Button, Container, Typography, Box, Avatar, Card, CardContent, CircularProgress } from '@mui/material';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, logout, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show loading state while checking auth
  if (!isClient || authLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              fontSize: '2rem',
              mb: 2,
              margin: '0 auto',
              bgcolor: 'primary.main',
            }}
            alt={user?.username || 'User'}
            src={user?.profilePicture}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user?.username ? user.username : 'User'}!
          </Typography>
          {user?.email && (
            <Typography variant="subtitle1" color="text.secondary">
              {user.email}
            </Typography>
          )}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3, 
          mb: 4, 
          mt: 2,
          '& > *': {
            flex: 1,
            minWidth: { xs: '100%', md: '30%' }
          }
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your account settings and profile information.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Watch History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View your recently watched movies and shows.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create Room
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start a new watch party with friends.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{ minWidth: 120 }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

// Add display name for better debugging
DashboardPage.displayName = 'DashboardPage';
DashboardContent.displayName = 'DashboardContent';
