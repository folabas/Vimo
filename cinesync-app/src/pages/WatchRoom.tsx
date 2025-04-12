import React from 'react';
import { useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import VideoPlayer from '../components/VideoPlayer';
import VideoLibrary from '../components/VideoLibrary';
import { useWatchRoom } from '../hooks/useWatchRoom';
import { RoomState, Message } from '../types/room';
import {
  PageContainer,
  Header,
  RoomInfo,
  RoomCode,
  CopyButton,
  LeaveButton,
  MainContent,
  VideoSection,
  VideoContainer,
  MovieTitle,
  ChatSection,
  ChatHeader,
  ChatMessages,
  ChatMessage,
  MessageSender,
  MessageContent,
  ChatInputContainer,
  ChatInput,
  SendButton,
  VideoLibraryOverlay,
  VideoLibraryContainer,
  VideoLibraryHeader,
  WaitingOverlay,
  CloseButton,
  LoadingSpinner,
  WaitingTitle,
  WaitingText,
  TimerContainer,
  ShareSection,
  ShareTitle,
  RoomCodeDisplay,
  ErrorContainer,
  ErrorMessage,
  EmptyStateContainer,
  EmptyStateMessage
} from '../styles/components/WatchRoomStyles';

interface Props {}

const WatchRoom: React.FC<Props> = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  
  const {
    // State
    isChatOpen,
    showVideoLibrary,
    chatInput,
    isCopied,
    roomState,
    messages,
    isWaitingForParticipants,
    showWaitingOverlay,
    waitingTimeLeft,
    
    // Setters
    setShowVideoLibrary,
    setChatInput,
    setShowWaitingOverlay,
    
    // Handlers
    handleToggleSubtitles,
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleSeek,
    handleSendMessage,
    handleCopyRoomCode,
    handleReloadRoom,
    handleLeaveRoom,
    
    // Utils
    formatTime,
    videoSourceLogic
  } = useWatchRoom({ roomCode });

  // Render the video player based on the current state
  const memoizedVideoPlayer = (() => {
    const { sourceToUse, hasValidMovie } = videoSourceLogic;
    
    if (!hasValidMovie) {
      if (roomState.selectedMovie) {
        return (
          <ErrorContainer>
            <ErrorMessage>
              <h3>Video Source Error</h3>
              <p>The selected video doesn't have a valid source URL.</p>
              <p>Debug info: Movie ID: {roomState.selectedMovie.id}, Title: {roomState.selectedMovie.title}</p>
              <p>Try selecting a different video or check if the video file still exists on the server.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button onClick={handleReloadRoom}>Reload Room</button>
                <button onClick={() => setShowVideoLibrary(true)}>Select Another Video</button>
              </div>
            </ErrorMessage>
          </ErrorContainer>
        );
      } else {
        return (
          <EmptyStateContainer>
            <EmptyStateMessage>
              <h3>No Video Selected</h3>
              <p>The host hasn't selected a video to watch yet.</p>
              {roomState.isHost && (
                <button onClick={() => setShowVideoLibrary(true)}>
                  Select a Video
                </button>
              )}
            </EmptyStateMessage>
          </EmptyStateContainer>
        );
      }
    }
    
    return (
      <VideoPlayer
        src={sourceToUse}
        isPlaying={roomState.isPlaying}
        initialTime={roomState.currentTime}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        subtitlesEnabled={roomState.subtitlesEnabled}
      />
    );
  })();

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
                  <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
      
      <MainContent isChatOpen={true}> {/* Force chat to always be open */}
        <VideoSection isChatOpen={true}>
          <VideoContainer isChatOpen={true}>
            {memoizedVideoPlayer}
            {roomState.selectedMovie && (
              <MovieTitle>{roomState.selectedMovie.title}</MovieTitle>
            )}
            <div className="flex items-center justify-center gap-2">
              <button
                className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-1 text-sm text-white"
                onClick={handleToggleSubtitles}
              >
                <span className="h-4 w-4">CC</span>
                {roomState.subtitlesEnabled ? 'Disable' : 'Enable'} Subtitles
              </button>
            </div>
          </VideoContainer>
        </VideoSection>
        
        <ChatSection isOpen={true}> {/* Chat is always open */}
          <ChatHeader>
            Chat
          </ChatHeader>
          <ChatMessages>
            {messages.map((message) => (
              <ChatMessage key={message.id}>
                <MessageSender>{message.sender}</MessageSender>
                <MessageContent>{message.content}</MessageContent>
              </ChatMessage>
            ))}
          </ChatMessages>
          <ChatInputContainer
            onSubmit={(e) => {
              e.preventDefault(); // Prevent the page from reloading
              handleSendMessage(chatInput);
            }}
          >
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
      
      {isWaitingForParticipants && roomState.isHost && showWaitingOverlay && (
        <WaitingOverlay>
          <CloseButton onClick={() => setShowWaitingOverlay(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
          <LoadingSpinner />
          <WaitingTitle>Waiting for others to join...</WaitingTitle>
          <WaitingText>Share this room code with your friends</WaitingText>
          
          <TimerContainer>
            Room expires in: {formatTime(waitingTimeLeft)}
          </TimerContainer>
          
          <ShareSection>
            <ShareTitle>Room Code</ShareTitle>
            <RoomCodeDisplay>{roomCode}</RoomCodeDisplay>
            <button onClick={handleCopyRoomCode}>
              {isCopied ? 'Copied!' : 'Copy Room Code'}
            </button>
          </ShareSection>
        </WaitingOverlay>
      )}
      
      {showVideoLibrary && (
        <VideoLibraryOverlay>
          <VideoLibraryContainer>
            <VideoLibraryHeader>
              <h2>Select a Video</h2>
              <CloseButton onClick={() => setShowVideoLibrary(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </CloseButton>
            </VideoLibraryHeader>
            <VideoLibrary 
              roomCode={roomCode}
              onSelectVideo={(movie) => {
                setShowVideoLibrary(false);
              }}
              selectedVideoId={roomState.selectedMovie?.id}
            />
          </VideoLibraryContainer>
        </VideoLibraryOverlay>
      )}
    </PageContainer>
  );
};

export default WatchRoom;
