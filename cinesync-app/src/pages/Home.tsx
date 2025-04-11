import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const Tagline = styled.p`
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing['2xl']};
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

const OptionCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${theme.colors.backgroundLight};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  width: 220px;
  transition: transform ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const OptionIcon = styled.div`
  color: ${theme.colors.primary};
  font-size: 2.5rem;
  margin-bottom: ${theme.spacing.md};
`;

const OptionTitle = styled.h3`
  margin-bottom: ${theme.spacing.sm};
`;

const OptionDescription = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const UserProfileSection = styled.div`
  display: flex;
  align-items: center;
  background-color: ${colors.cardBackground};
  border-radius: 12px;
  margin: 1.5rem 0;
  padding: 1.25rem;
  width: 100%;
  max-width: 500px;
`;

const UserAvatar = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 1.25rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInitials = styled.div`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: ${colors.text};
`;

const UserSubtitle = styled.p`
  font-size: 1rem;
  color: ${colors.textSecondary};
  margin: 0;
`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  return (
    <HomeContainer>
      <Logo size="large" />
      <Tagline>Watch movies together, no matter where you are</Tagline>
      
      {isLoggedIn ? (
        <>
          <UserProfileSection>
            <UserAvatar>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} />
              ) : (
                <UserInitials>
                  {user?.username.substring(0, 2).toUpperCase()}
                </UserInitials>
              )}
            </UserAvatar>
            <UserInfo>
              <UserName>Welcome, {user?.username}</UserName>
              <UserSubtitle>Ready to watch a movie?</UserSubtitle>
            </UserInfo>
          </UserProfileSection>
          
          <OptionsContainer>
            <OptionCard>
              <OptionIcon>🎬</OptionIcon>
              <OptionTitle>Create Room</OptionTitle>
              <OptionDescription>
                Pick a movie and create a new watch room
              </OptionDescription>
              <Button onClick={() => navigate('/pick-movie')}>
                Create Room
              </Button>
            </OptionCard>
            
            <OptionCard>
              <OptionIcon>🔗</OptionIcon>
              <OptionTitle>Join Room</OptionTitle>
              <OptionDescription>
                Join an existing room with a room code
              </OptionDescription>
              <Button onClick={() => navigate('/join-room')}>
                Join Room
              </Button>
            </OptionCard>
          </OptionsContainer>
        </>
      ) : (
        <>
          <OptionsContainer>
            <OptionCard>
              <OptionIcon>🔑</OptionIcon>
              <OptionTitle>Log In</OptionTitle>
              <OptionDescription>
                Already have an account? Log in to continue
              </OptionDescription>
              <Button onClick={() => navigate('/login')}>
                Log In
              </Button>
            </OptionCard>
            
            <OptionCard>
              <OptionIcon>✨</OptionIcon>
              <OptionTitle>Sign Up</OptionTitle>
              <OptionDescription>
                New to Vimo? Create an account to get started
              </OptionDescription>
              <Button onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </OptionCard>
          </OptionsContainer>
        </>
      )}
    </HomeContainer>
  );
};

export default Home;
