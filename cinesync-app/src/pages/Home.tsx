import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import MovieBackground from '../components/MovieBackground';
import {
  HomeContainer,
  Tagline,
  OptionsContainer,
  OptionCard,
  OptionIcon,
  OptionTitle,
  OptionDescription,
  UserProfileSection,
  UserAvatar,
  UserInitials,
  UserInfo,
  UserName,
  UserSubtitle
} from '../styles/components/HomeStyles';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  return (
    <MovieBackground>
      {isLoggedIn ? (
        <HomeContainer>
          <Logo size="large" />
          <Tagline>Watch movies together, no matter where you are</Tagline>
          
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
        </HomeContainer>
      ) : (
        <HomeContainer>
          <Logo size="large" />
          <Tagline>Watch movies together, no matter where you are</Tagline>
          
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
        </HomeContainer>
      )}
    </MovieBackground>
  );
};

export default Home;
