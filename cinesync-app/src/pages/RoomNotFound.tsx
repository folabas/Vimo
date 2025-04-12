import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { theme } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const ErrorIcon = styled.div`
  color: ${theme.colors.error};
  font-size: 4rem;
  margin-bottom: ${theme.spacing.lg};
`;

const ErrorTitle = styled.h1`
  font-size: ${theme.typography.sizes['3xl']};
  margin-bottom: ${theme.spacing.md};
`;

const ErrorMessage = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.sizes.lg};
  margin-bottom: ${theme.spacing.xl};
  max-width: 500px;
`;

const RoomNotFound: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  return (
    <PageContainer>
      <Logo size="large" />
      
      <ErrorIcon>
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </ErrorIcon>
      
      <ErrorTitle>Room Not Found</ErrorTitle>
      <ErrorMessage>
        The room you're looking for doesn't exist or has expired. Please check the room code and try again.
      </ErrorMessage>
      
      <Button onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}>
        Back to Home
      </Button>
    </PageContainer>
  );
};

export default RoomNotFound;
