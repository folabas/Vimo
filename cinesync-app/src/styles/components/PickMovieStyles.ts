import styled from '@emotion/styled';
import { theme } from '../theme';
import UserProfile from '../../components/UserProfile';

export const PageContainer = styled.div`
  min-height: 100vh;
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.background};
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  font-size: ${theme.typography.sizes.md};
  transition: color ${theme.transitions.fast};
  &:hover {
    color: ${theme.colors.text};
  }
  svg {
    width: 1.2em;
    height: 1.2em;
  }
`;

export const StyledUserProfile = styled(UserProfile)`
  margin-left: 16px;
`;

export const PageTitle = styled.h1`
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.sizes['3xl']};
  color: ${theme.colors.text};
`;

export const PageDescription = styled.p`
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing['2xl']};
  max-width: 600px;
`;

export const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

export const SectionTitle = styled.h2`
  font-size: ${theme.typography.sizes.xl};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text};
`;

export const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing['2xl']};
`;

export const MovieCard = styled.div<{ isSelected?: boolean }>`
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  transition: transform ${theme.transitions.fast};
  cursor: pointer;
  position: relative;
  background-color: ${theme.colors.backgroundLight};
  ${({ isSelected }) =>
    isSelected && `
      box-shadow: 0 0 0 3px ${theme.colors.primary};
    `}
  &:hover {
    transform: translateY(-5px);
  }
`;

export const MovieThumbnail = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
`;

export const MovieInfo = styled.div`
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.backgroundLight};
`;

export const MovieTitle = styled.h3`
  font-size: ${theme.typography.sizes.md};
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.text};
`;

export const MovieDuration = styled.span`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
`;

export const UploadSection = styled.div`
  border: 2px dashed ${theme.colors.textSecondary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.xl};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background-color: ${theme.colors.backgroundLight};
  &:hover {
    background-color: ${theme.colors.background};
    border-color: ${theme.colors.primary};
  }
`;

export const UploadIcon = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 2rem;
  margin-bottom: ${theme.spacing.md};
`;

export const UploadText = styled.p`
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text};
`;

export const UploadSubtext = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const UploadProgress = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${theme.colors.backgroundLight};
  border-radius: 2px;
  margin-top: ${theme.spacing.xs};
  overflow: hidden;
`;

export const Progress = styled.div<{ width: string }>`
  height: 100%;
  background-color: ${theme.colors.primary};
  border-radius: 2px;
  width: ${props => props.width};
  transition: width 0.3s ease;
`;

export const OptionsSection = styled.div`
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  max-width: 600px;
`;

export const OptionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  &:last-of-type {
    border-bottom: none;
  }
`;

export const OptionLabel = styled.div`
  font-weight: 500;
  color: ${theme.colors.text};
`;

export const OptionDescription = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.xs};
`;

export const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

export const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  &:checked + span {
    background-color: ${theme.colors.primary};
  }
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

export const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${theme.colors.backgroundLight};
  transition: ${theme.transitions.fast};
  border-radius: 34px;
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: ${theme.transitions.fast};
    border-radius: 50%;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;
