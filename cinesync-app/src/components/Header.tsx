import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { colors } from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';

const Header: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoLink to="/">
          <LogoText>Vimo</LogoText>
        </LogoLink>
        
        <NavLinks>
          {!isLoggedIn && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
            </>
          )}
        </NavLinks>
        
        {isLoggedIn && (
          <ProfileSection>
            <UserProfile size="small" />
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </ProfileSection>
        )}
      </HeaderContent>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background-color: ${colors.backgroundDark};
  border-bottom: 1px solid ${colors.border};
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const LogoLink = styled(Link)`
  text-decoration: none;
`;

const LogoText = styled.h1`
  color: ${colors.primary};
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const NavLink = styled(Link)`
  color: ${colors.text};
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: ${colors.primary};
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${colors.textSecondary};
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  transition: color 0.2s;
  
  &:hover {
    color: ${colors.primary};
  }
`;

export default Header;
