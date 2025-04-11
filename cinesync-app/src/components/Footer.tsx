import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../styles/theme';
import { colors } from '../styles/colors';

const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-size: ${theme.typography.sizes.sm};
  color: ${colors.textSecondary};
  margin-top: auto;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const FooterLink = styled.a`
  color: ${colors.textSecondary};
  text-decoration: none;
  
  &:hover {
    color: ${colors.text};
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <div> {new Date().getFullYear()} Vimo</div>
      <FooterLinks>
        <FooterLink href="#">About</FooterLink>
        <FooterLink href="#">Privacy</FooterLink>
        <FooterLink href="#">Terms</FooterLink>
      </FooterLinks>
    </FooterContainer>
  );
};

export default Footer;
