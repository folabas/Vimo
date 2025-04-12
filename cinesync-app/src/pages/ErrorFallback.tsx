import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { theme } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

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
  max-width: 600px;
`;

const ErrorDetails = styled.pre`
  background-color: ${theme.colors.backgroundLight};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  max-width: 600px;
  overflow-x: auto;
  text-align: left;
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.xl};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  return (
    <PageContainer>
      <Logo size="large" />
      
      <ErrorIcon>
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ErrorIcon>
      
      <ErrorTitle>Something Went Wrong</ErrorTitle>
      <ErrorMessage>
        We're sorry, but something unexpected happened. Please try again or return to the home page.
      </ErrorMessage>
      
      {error && (
        <ErrorDetails>
          {error.message}
        </ErrorDetails>
      )}
      
      <ButtonGroup>
        {resetErrorBoundary && (
          <Button variant="outline" onClick={resetErrorBoundary}>
            Try Again
          </Button>
        )}
        <Button onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}>
          Back to Home
        </Button>
      </ButtonGroup>
    </PageContainer>
  );
};

export default ErrorFallback;
