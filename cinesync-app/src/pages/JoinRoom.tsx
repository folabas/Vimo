import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import Input from '../components/Input';
import { theme } from '../styles/theme';
import { useRoom } from '../context/RoomContext';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
`;

const BackButton = styled.button`
  position: absolute;
  top: ${theme.spacing.xl};
  left: ${theme.spacing.xl};
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

const JoinRoomCard = styled.div`
  background-color: ${theme.colors.backgroundLight};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  width: 100%;
  max-width: 400px;
  margin-top: ${theme.spacing.xl};
`;

const JoinRoomTitle = styled.h2`
  font-size: ${theme.typography.sizes['2xl']};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

const JoinRoomForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const RoomCodeLabel = styled.label`
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.textSecondary};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.sizes.sm};
  margin-top: ${theme.spacing.sm};
  text-align: center;
`;

const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const { joinRoom } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await joinRoom(roomCode.trim().toUpperCase());
      
      if (success) {
        navigate(`/watch-room/${roomCode.trim().toUpperCase()}`);
      } else {
        setError('Room not found. Please check the code and try again.');
      }
    } catch (error) {
      setError('Failed to join room. Please try again.');
      console.error('Join room error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/')}>
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to selection
      </BackButton>
      
      <Logo size="large" />
      
      <JoinRoomCard>
        <JoinRoomTitle>Join a Room</JoinRoomTitle>
        
        <JoinRoomForm onSubmit={handleSubmit}>
          <div>
            <RoomCodeLabel htmlFor="roomCode">Room Code</RoomCodeLabel>
            <Input
              id="roomCode"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              fullWidth
            />
          </div>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Button 
            type="submit" 
            fullWidth
            isLoading={isLoading}
          >
            Join Room
          </Button>
        </JoinRoomForm>
      </JoinRoomCard>
    </PageContainer>
  );
};

export default JoinRoom;
