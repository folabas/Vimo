'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isLoggedIn) {
        // Redirect to login if not authenticated and auth is required
        router.push(redirectTo);
      } else if (!requireAuth && isLoggedIn) {
        // Redirect to dashboard if authenticated but auth is not required (like login/signup pages)
        router.push('/dashboard');
      }
    }
  }, [isLoggedIn, loading, requireAuth, redirectTo, router]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if ((requireAuth && !isLoggedIn) || (!requireAuth && isLoggedIn)) {
    return null; // or a loading spinner while redirecting
  }

  return <>{children}</>;
}
