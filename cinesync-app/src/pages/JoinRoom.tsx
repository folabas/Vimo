import React from 'react';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import Input from '../components/Input';
import { useJoinRoom } from '../hooks/useJoinRoom';
import UserProfile from '../components/UserProfile';
import {
  PageContainer,
  HeaderContainer,
  HeaderLeft,
  HeaderRight,
  BackButton,
  JoinRoomCard,
  CardTitle,
  CardDescription,
  Form,
  FormGroup,
  Label,
  ErrorMessage
} from '../styles/components/JoinRoomStyles';

const JoinRoom: React.FC = () => {
  const {
    roomCode,
    setRoomCode,
    error,
    isLoading,
    handleSubmit,
    handleBackToHome
  } = useJoinRoom();

  return (
    <PageContainer>
      <HeaderContainer>
        <HeaderLeft>
          <BackButton onClick={handleBackToHome}>
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
