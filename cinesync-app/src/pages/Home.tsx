import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { theme } from '../styles/theme';

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

const Footer = styled.footer`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
`;

const FooterLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const FooterLink = styled.a`
  color: ${theme.colors.textSecondary};
  text-decoration: none;
  
  &:hover {
    color: ${theme.colors.text};
  }
`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <HomeContainer>
      <Logo size="large" />
      <Tagline>Watch movies together, perfectly in sync.</Tagline>
      
      <OptionsContainer>
        <OptionCard>
          <OptionIcon>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </OptionIcon>
          <OptionTitle>Create a Room</OptionTitle>
          <OptionDescription>Start a new watching session</OptionDescription>
          <Button fullWidth onClick={() => navigate('/pick-movie')}>
            Create a Room
          </Button>
        </OptionCard>
        
        <OptionCard>
          <OptionIcon>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </OptionIcon>
          <OptionTitle>Join a Room</OptionTitle>
          <OptionDescription>Enter an existing room code</OptionDescription>
          <Button fullWidth onClick={() => navigate('/join-room')}>
            Join a Room
          </Button>
        </OptionCard>
      </OptionsContainer>
      
      <Footer>
        <FooterLinks>
          <FooterLink href="#">Privacy Policy</FooterLink>
          <span>•</span>
          <FooterLink href="#">Terms of Service</FooterLink>
        </FooterLinks>
        <FooterLink href="https://github.com/yourusername/Vimo" target="_blank">
          View on GitHub
        </FooterLink>
      </Footer>
    </HomeContainer>
  );
};

export default Home;
