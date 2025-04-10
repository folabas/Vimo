import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../styles/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const LogoContainer = styled.div<LogoProps>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-weight: 700;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return theme.typography.sizes.lg;
      case 'large': return theme.typography.sizes['3xl'];
      default: return theme.typography.sizes['2xl'];
    }
  }};
`;

const LogoIcon = styled.div`
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  return (
    <LogoContainer size={size}>
      <LogoIcon>
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
          <line x1="7" y1="2" x2="7" y2="22" stroke="currentColor" strokeWidth="2" />
          <line x1="17" y1="2" x2="17" y2="22" stroke="currentColor" strokeWidth="2" />
          <line x1="2" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="2" />
          <line x1="2" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="2" />
        </svg>
      </LogoIcon>
      Vimo
    </LogoContainer>
  );
};

export default Logo;
