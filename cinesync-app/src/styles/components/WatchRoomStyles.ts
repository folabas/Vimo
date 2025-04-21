import styled from '@emotion/styled';
import { theme } from '../theme';
import Button from '../../components/Button';

// Page layout
export const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  @media (max-width: 600px) {
    height: auto;
    min-height: 100vh;
    padding-bottom: 56px;
  }
`;

export const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: rgba(0, 0, 0, 0.3);
  @media (max-width: 600px) {
    flex-direction: column;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    gap: ${theme.spacing.sm};
  }
`;

export const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const RoomCode = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background-color: ${theme.colors.backgroundLight};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.sizes.sm};
`;

export const ParticipantCount = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background-color: ${theme.colors.backgroundLight};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.sizes.sm};
  margin-left: ${theme.spacing.sm};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const CopyButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  font-size: ${theme.typography.sizes.sm};
  display: flex;
  align-items: center;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const LeaveButton = styled(Button)`
  margin-left: ${theme.spacing.md};
`;

// Main content
export const MainContent = styled.div<{ isChatOpen: boolean }>`
  flex: 1;
  display: flex;
  margin-top: ${theme.spacing['3xl']}; /* Adjust for fixed header height */
  ${({ isChatOpen }) =>
    isChatOpen
      ? `
      flex-direction: row;
      overflow: hidden;
    `
      : `
      flex-direction: column;
      overflow-y: auto;
    `}
  @media (max-width: 1024px) {
    flex-direction: column;
    margin-top: ${theme.spacing.xl};
  }
`;

export const VideoSection = styled.div<{ isChatOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing['2xl']} ${theme.spacing.xl} ${theme.spacing.xl};
  overflow-y: ${({ isChatOpen }) => (isChatOpen ? 'auto' : 'hidden')};
  ${({ isChatOpen }) =>
    !isChatOpen &&
    `
    align-items: center;
    justify-content: center;
  `}
  &::-webkit-scrollbar {
    display: none; /* Hide vertical scroll indicator */
  }
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  @media (max-width: 600px) {
    padding: ${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.sm};
  }
`;

export const VideoContainer = styled.div<{ isChatOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  ${({ isChatOpen }) =>
    !isChatOpen &&
    `
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
  `}
  &::-webkit-scrollbar {
    display: none; /* Hide vertical scroll indicator */
  }
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  @media (max-width: 600px) {
    min-height: 200px;
  }
`;

export const MovieTitle = styled.h1`
  font-size: ${theme.typography.sizes['2xl']};
  margin-bottom: ${theme.spacing.md};
`;

// Chat section
export const ChatSection = styled.div<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '320px' : '0'};
  background-color: ${theme.colors.backgroundLight};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  @media (max-width: 1024px) {
    width: 100%;
    height: ${props => props.isOpen ? '300px' : '0'};
    transition: height 0.3s ease;
  }
  @media (max-width: 600px) {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100vw;
    max-width: 100vw;
    height: ${props => props.isOpen ? '60vh' : '0'};
    z-index: 200;
  }
`;

export const ChatHeader = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ChatMessages = styled.div`
  flex: 1;
  padding: ${theme.spacing.md};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const ChatMessage = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MessageSender = styled.span`
  font-weight: 600;
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.primary};
`;

export const MessageContent = styled.span`
  font-size: ${theme.typography.sizes.sm};
  word-break: break-word;
`;

export const ChatInputContainer = styled.form`
  display: flex;
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  gap: ${theme.spacing.sm};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const ChatInput = styled.input`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.text};
  font-size: ${theme.typography.sizes.sm};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${theme.colors.primary};
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

export const SendButton = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.md};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.secondary};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// Video library overlay
export const VideoLibraryOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const VideoLibraryContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1000px;
  padding: ${theme.spacing.lg};
`;

export const VideoLibraryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

// Waiting overlay
export const WaitingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing.xl};
  right: ${theme.spacing.xl};
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
`;

export const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: ${theme.colors.primary};
  animation: spin 1s ease-in-out infinite;
  margin-bottom: ${theme.spacing.xl};
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const WaitingTitle = styled.h2`
  font-size: ${theme.typography.sizes['2xl']};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

export const WaitingText = styled.p`
  font-size: ${theme.typography.sizes.md};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textSecondary};
`;

export const TimerContainer = styled.div`
  font-size: ${theme.typography.sizes.lg};
  margin-bottom: ${theme.spacing.xl};
  color: ${theme.colors.primary};
`;

export const ShareSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  background-color: ${theme.colors.backgroundLight};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  margin-top: ${theme.spacing.xl};
`;

export const ShareTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  margin-bottom: ${theme.spacing.xs};
`;

export const RoomCodeDisplay = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.primary};
`;

// Error states
export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

export const ErrorMessage = styled.div`
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  max-width: 500px;
  
  h3 {
    color: ${theme.colors.error};
    margin-bottom: ${theme.spacing.md};
    font-size: ${theme.typography.sizes.xl};
  }
  
  p {
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.textSecondary};
  }
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  text-align: center;
  height: 100%;
`;

export const EmptyStateMessage = styled.div`
  max-width: 400px;
  
  h3 {
    margin-bottom: ${theme.spacing.md};
    font-size: ${theme.typography.sizes.xl};
  }
  
  p {
    margin-bottom: ${theme.spacing.lg};
    color: ${theme.colors.textSecondary};
  }
`;
