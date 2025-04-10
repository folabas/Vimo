import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import VideoPlayer from '../components/VideoPlayer';
import { theme } from '../styles/theme';
import { useRoom } from '../context/RoomContext';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: rgba(0, 0, 0, 0.3);
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const RoomCode = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background-color: ${theme.colors.backgroundLight};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.sizes.sm};
`;

const CopyButton = styled.button`
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

const LeaveButton = styled(Button)`
  margin-left: ${theme.spacing.md};
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const VideoSection = styled.div`
  flex: 1;
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
`;

const MovieTitle = styled.h1`
  font-size: ${theme.typography.sizes['2xl']};
  margin-bottom: ${theme.spacing.md};
`;

const ChatSection = styled.div`
  width: 320px;
  background-color: ${theme.colors.backgroundLight};
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1024px) {
    width: 100%;
    height: 300px;
  }
`;

const ChatHeader = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: ${theme.spacing.md};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ChatMessage = styled.div`
  display: flex;
  flex-direction: column;
`;

const MessageSender = styled.span`
  font-weight: 600;
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.primary};
`;

const MessageContent = styled.span`
  font-size: ${theme.typography.sizes.sm};
  word-break: break-word;
`;

const ChatInputContainer = styled.form`
  display: flex;
  padding: ${theme.spacing.md};
  gap: ${theme.spacing.sm};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ChatInput = styled.input`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  color: ${theme.colors.text};
  font-size: ${theme.typography.sizes.sm};
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SendButton = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: #c0392b;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const WaitingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(231, 76, 60, 0.3);
  border-radius: 50%;
  border-top-color: ${theme.colors.primary};
  animation: spin 1s linear infinite;
  margin-bottom: ${theme.spacing.xl};
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const WaitingTitle = styled.h2`
  font-size: ${theme.typography.sizes['3xl']};
  margin-bottom: ${theme.spacing.lg};
`;

const WaitingText = styled.p`
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xl};
`;

const ShareSection = styled.div`
  margin-top: ${theme.spacing.xl};
`;

const ShareTitle = styled.h3`
  font-size: ${theme.typography.sizes.lg};
  margin-bottom: ${theme.spacing.md};
`;

const RoomCodeDisplay = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: ${theme.spacing.md};
`;

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

const WatchRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { roomState, leaveRoom } = useRoom();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'System',
      content: 'Welcome to the watch room! You can chat with other viewers here.',
      timestamp: new Date(),
    },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  
  // Check if we're waiting for others to join
  const isWaiting = roomState.participants.length < 2;
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatInput.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: chatInput.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setChatInput('');
    
    // In a real app, this would send the message to other participants via WebSocket
  };
  
  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };
  
  const handleTimeUpdate = (currentTime: number) => {
    // In a real app, this would sync the time with other participants
    console.log('Current time:', currentTime);
  };
  
  const handlePlay = () => {
    // In a real app, this would notify other participants that the video is playing
    console.log('Video playing');
  };
  
  const handlePause = () => {
    // In a real app, this would notify other participants that the video is paused
    console.log('Video paused');
  };
  
  return (
    <PageContainer>
      <Header>
        <Logo size="small" />
        <RoomInfo>
          <RoomCode>
            Room: {roomCode}
            <CopyButton onClick={handleCopyRoomCode}>
              {isCopied ? 'Copied!' : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.188 2.602C16.0018 2.41148 15.7793 2.26012 15.5338 2.15673C15.2882 2.05334 15.0244 2.00001 14.758 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </CopyButton>
          </RoomCode>
          <LeaveButton 
            variant="outline" 
            size="small"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </LeaveButton>
        </RoomInfo>
      </Header>
      
      <MainContent>
        <VideoSection>
          {roomState.selectedMovie && (
            <>
              <MovieTitle>{roomState.selectedMovie.title}</MovieTitle>
              <VideoPlayer 
                src={roomState.selectedMovie.source}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                isPlaying={roomState.isPlaying}
                initialTime={roomState.currentTime}
                subtitlesEnabled={roomState.subtitlesEnabled}
              />
            </>
          )}
        </VideoSection>
        
        <ChatSection>
          <ChatHeader>Chat</ChatHeader>
          <ChatMessages>
            {messages.map(message => (
              <ChatMessage key={message.id}>
                <MessageSender>{message.sender}</MessageSender>
                <MessageContent>{message.content}</MessageContent>
              </ChatMessage>
            ))}
          </ChatMessages>
          <ChatInputContainer onSubmit={handleSendMessage}>
            <ChatInput 
              placeholder="Type a message..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <SendButton type="submit">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SendButton>
          </ChatInputContainer>
        </ChatSection>
      </MainContent>
      
      {isWaiting && roomState.isHost && (
        <WaitingOverlay>
          <LoadingSpinner />
          <WaitingTitle>Waiting for others to join...</WaitingTitle>
          <WaitingText>Share this room code with your friends</WaitingText>
          
          <ShareSection>
            <ShareTitle>Room Code</ShareTitle>
            <RoomCodeDisplay>{roomCode}</RoomCodeDisplay>
            <Button onClick={handleCopyRoomCode}>
              {isCopied ? 'Copied!' : 'Copy Room Code'}
            </Button>
          </ShareSection>
        </WaitingOverlay>
      )}
    </PageContainer>
  );
};

export default WatchRoom;
