import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../styles/theme';
import { Participant } from '../types/room';

interface ParticipantsListProps {
  participants: Participant[];
  isOpen: boolean;
  onClose: () => void;
}

const ParticipantsContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 60px;
  right: 20px;
  width: 250px;
  background-color: ${theme.colors.backgroundDark};
  border-radius: ${theme.borderRadius.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
`;

const ParticipantsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ParticipantsTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.sizes.md};
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const ParticipantsListContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: ${theme.spacing.sm} 0;
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const ParticipantAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: ${theme.spacing.sm};
  background-color: ${theme.colors.backgroundLight};
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ParticipantInfo = styled.div`
  flex: 1;
`;

const ParticipantName = styled.div`
  font-weight: 500;
  font-size: ${theme.typography.sizes.sm};
`;

const ParticipantUsername = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.textSecondary};
`;

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, isOpen, onClose }) => {
  // Deduplicate participants by `userId`
  const uniqueParticipants = Array.from(
    new Map(participants.map((p) => [p.userId, p])).values()
  );

  return (
    <ParticipantsContainer isOpen={isOpen}>
      <ParticipantsHeader>
        <ParticipantsTitle>Participants ({uniqueParticipants.length})</ParticipantsTitle>
        <CloseButton onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </CloseButton>
      </ParticipantsHeader>
      <ParticipantsListContainer>
        {uniqueParticipants.map((participant) => (
          <ParticipantItem key={participant.userId}>
            <ParticipantAvatar>
              {participant.profilePicture ? (
                <img src={participant.profilePicture} alt={participant.name || participant.username} />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </ParticipantAvatar>
            <ParticipantInfo>
              <ParticipantName>{participant.name || participant.username}</ParticipantName>
              {participant.name && <ParticipantUsername>@{participant.username}</ParticipantUsername>}
            </ParticipantInfo>
          </ParticipantItem>
        ))}
      </ParticipantsListContainer>
    </ParticipantsContainer>
  );
};

export default ParticipantsList;
