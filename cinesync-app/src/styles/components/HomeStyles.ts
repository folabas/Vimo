import styled from '@emotion/styled';
import { theme } from '../theme';
import { colors } from '../colors';

export const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${theme.spacing.xl};
  text-align: center;
  @media (max-width: 600px) {
    padding: ${theme.spacing.md};
  }
`;

export const Tagline = styled.p`
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing['2xl']};
`;

export const OptionsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};
  @media (max-width: 1024px) {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }
  @media (max-width: 600px) {
    gap: ${theme.spacing.md};
    max-width: 100%;
  }
`;

export const OptionCard = styled.div`
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
  @media (max-width: 1024px) {
    width: 100%;
  }
  @media (max-width: 600px) {
    padding: ${theme.spacing.md};
    min-width: 0;
  }
`;

export const OptionIcon = styled.div`
  color: ${theme.colors.primary};
  font-size: 2.5rem;
  margin-bottom: ${theme.spacing.md};
`;

export const OptionTitle = styled.h3`
  margin-bottom: ${theme.spacing.sm};
`;

export const OptionDescription = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.lg};
`;

export const UserProfileSection = styled.div`
  display: flex;
  align-items: center;
  background-color: ${colors.cardBackground};
  border-radius: 12px;
  margin: 1.5rem 0;
  padding: 1.25rem;
  width: 100%;
  max-width: 500px;
`;

export const UserAvatar = styled.div`
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

export const UserInitials = styled.div`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: ${colors.text};
`;

export const UserSubtitle = styled.p`
  font-size: 1rem;
  color: ${colors.textSecondary};
  margin: 0;
`;
