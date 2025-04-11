import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import Input from '../components/Input';
import { theme } from '../styles/theme';
import { colors } from '../styles/colors';
import { useRoom } from '../context/RoomContext';
import UserProfile from '../components/UserProfile';

const PageContainer = styled.div`
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  background-color: ${colors.background};
  position: relative;
`;

const HeaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-bottom: 1px solid ${colors.border};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  font-size: ${theme.typography.sizes.md};
  transition: color ${theme.transitions.fast};
  
  &:hover {
    color: ${colors.text};
  }
  
  svg {
    width: 1.2em;
    height: 1.2em;
  }
`;

const JoinRoomCard = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  width: 100%;
  max-width: 400px;
  margin-top: ${theme.spacing.lg};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

const CardTitle = styled.h2`
  font-size: ${theme.typography.sizes['2xl']};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

const CardDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
  color: ${colors.textSecondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${theme.typography.sizes.sm};
  margin-bottom: ${theme.spacing.xs};
  color: ${colors.textSecondary};
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  font-size: ${theme.typography.sizes.sm};
  margin-top: ${theme.spacing.sm};
  text-align: center;
`;

const JoinRoom: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { joinRoom } = useRoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await joinRoom(roomCode.trim());
      navigate(`/watch-room/${roomCode.trim()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <HeaderContainer>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/')}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to home
          </BackButton>
        </HeaderLeft>
        <HeaderRight>
          <UserProfile size="small" />
        </HeaderRight>
      </HeaderContainer>
      
      <Logo size="large" />
      <JoinRoomCard>
        <CardTitle>Join a Room</CardTitle>
        <CardDescription>
          Enter the room code provided by your friend to join their watch party.
        </CardDescription>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
            />
          </FormGroup>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Room'}
          </Button>
        </Form>
      </JoinRoomCard>
    </PageContainer>
  );
};

export default JoinRoom;
