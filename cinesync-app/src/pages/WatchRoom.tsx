import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import VideoPlayer from '../components/VideoPlayer';
import VideoLibrary from '../components/VideoLibrary';
import ParticipantsList from '../components/ParticipantsList';
import { useWatchRoom } from '../hooks/useWatchRoom';
import { WebRTCService } from '../services/webrtc/WebRTCService';
import { socketService } from '../services/api/socketService';
import {
  PageContainer,
  Header,
  RoomInfo,
  RoomCode,
  ParticipantCount,
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
  const { user } = useAuth();
  const [showParticipants, setShowParticipants] = useState(false);
  
  const {
    // State
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
    handleSendMessage,
    handleCopyRoomCode,
    handleReloadRoom,
    handleLeaveRoom,
    
    // Utils
    formatTime,
    videoSourceLogic,
    emitPlay,
    emitPause,
    emitSeek
  } = useWatchRoom({ roomCode });

  // WebRTC setup
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const [isWebRTCReady, setIsWebRTCReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Define the sync message handler
  const handleSyncMessage = useCallback((message: any) => {
    // Using server timestamp from message instead of local time for consistency
    if (message.timestamp <= lastSyncTimeRef.current) return;
    
    lastSyncTimeRef.current = message.timestamp;

    switch (message.type) {
      case 'play':
        emitPlay(message.time);
        break;
      case 'pause':
        emitPause(message.time);
        break;
      case 'seek':
        emitSeek(message.time);
        break;
      case 'sync':
        // Handle periodic sync if needed
        break;
      default:
        break;
    }
  }, [emitPlay, emitPause, emitSeek]);

  // Set up WebRTC event listeners - wrapped in useCallback to prevent recreation on every render
  const setupWebRTCEventListeners = useCallback((webrtcService: WebRTCService) => {
    // Handle incoming offers
    const handleOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      if (roomState.isHost) return; // Host doesn't handle offers

      try {
        const answer = await webrtcService.createAnswer(offer);
        socketService.sendAnswer(answer, from);
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    // Handle answers
    const handleAnswer = async ({ answer, from }: { answer: RTCSessionDescriptionInit; from: string }) => {
      if (!roomState.isHost) return; // Only host handles answers

      try {
        await webrtcService.handleAnswer(answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    };

    // Handle ICE candidates
    const handleIceCandidate = async ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
      try {
        const iceCandidate = new RTCIceCandidate(candidate);
        await webrtcService.addIceCandidate(iceCandidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    };

    // Set up event listeners
    socketService.onOffer(handleOffer);
    socketService.onAnswer(handleAnswer);
    socketService.onIceCandidate(handleIceCandidate);

    // Cleanup function
    return () => {
      socketService.off('offer', handleOffer);
      socketService.off('answer', handleAnswer);
      socketService.off('ice-candidate', handleIceCandidate);
    };
  }, [roomState.isHost]);

  // Initialize WebRTC
  useEffect(() => {
    if (!roomCode) return;

    const initializeWebRTC = async () => {
      try {
        const webrtcService = new WebRTCService(socketService);
        
        // Set up data channel for sync messages
        await webrtcService.initialize(roomState.isHost);
        
        // Set up sync message handler
        webrtcService.setOnSyncCallback(handleSyncMessage);

        webrtcServiceRef.current = webrtcService;
        
        // Set up WebRTC event listeners
        const cleanupListeners = setupWebRTCEventListeners(webrtcService);
        
        setIsWebRTCReady(true);

        // Cleanup function
        return () => {
          if (cleanupListeners) cleanupListeners();
          webrtcService.cleanup();
        };
      } catch (error) {
        console.error('Error initializing WebRTC:', error);
      }
    };

    initializeWebRTC();

    // Cleanup function for the effect
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
        webrtcServiceRef.current = null;
      }
    };
  }, [roomCode, roomState.isHost, handleSyncMessage, setupWebRTCEventListeners]);



  // Type-safe handlers for VideoPlayer props
  const handlePlay = (currentTime: number) => {
    if (isWebRTCReady && roomState.isHost) {
      webrtcServiceRef.current?.sendPlayCommand(currentTime);
    }
    emitPlay(currentTime);
  };

  const handlePause = (currentTime: number) => {
    if (isWebRTCReady && roomState.isHost) {
      webrtcServiceRef.current?.sendPauseCommand(currentTime);
    }
    emitPause(currentTime);
  };

  const handleSeek = (currentTime: number) => {
    if (isWebRTCReady && roomState.isHost) {
      webrtcServiceRef.current?.sendSeekCommand(currentTime);
    }
    emitSeek(currentTime);
  };

  const handleTimeUpdate = (currentTime: number) => {
    // intentionally left empty
  };

  // Render the video player based on the current state
  const memoizedVideoPlayer = (() => {
    const { hasValidMovie } = videoSourceLogic;
    
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
        src={roomState.selectedMovie?.source || ''}
        isPlaying={roomState.isPlaying}
        currentTime={roomState.currentTime}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onSeek={handleSeek}
        subtitlesEnabled={roomState.subtitlesEnabled}
        controlsEnabled={roomState.isHost}
        isHost={roomState.isHost}
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
          <ParticipantCount onClick={() => setShowParticipants(!showParticipants)}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {roomState.participants?.length || 0}
          </ParticipantCount>
          <LeaveButton 
            variant="outline" 
            size="small"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </LeaveButton>
          
          {/* Participants List */}
          <ParticipantsList 
            participants={roomState.participants || []} 
            isOpen={showParticipants}
            onClose={() => setShowParticipants(false)}
          />
        </RoomInfo>
      </Header>
      
      <MainContent isChatOpen={true}> {/* Force chat to always be open */}
        <VideoSection isChatOpen={true}>
          <VideoContainer isChatOpen={true}>
            {memoizedVideoPlayer}
            {roomState.selectedMovie && (
              <MovieTitle>{roomState.selectedMovie.title}</MovieTitle>
            )}
            <div style={{marginTop: '1rem', color: '#2e7d32', fontWeight: 'bold'}}>
              {roomState.isPlaying
                ? `The video is currently being played in room ${roomCode}.`
                : `The video is currently paused in room ${roomCode}.`}
              <br />
              {`User ${user?.username || 'Unknown'} is currently watching.`}
            </div>
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
