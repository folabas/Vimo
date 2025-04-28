import React, { useRef, useEffect, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  isPlaying?: boolean;
  currentTime?: number;
  onPlay?: (currentTime: number) => void;
  onPause?: (currentTime: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onSeek?: (time: number) => void;
  subtitlesEnabled?: boolean;
  controlsEnabled?: boolean;
  isHost: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onTimeUpdate,
  onSeek,
  subtitlesEnabled,
  controlsEnabled = true,
  isHost,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showInteractionPrompt, setShowInteractionPrompt] = useState(false);

  useEffect(() => {
    if (
      videoRef.current &&
      typeof currentTime === 'number' &&
      Math.abs(videoRef.current.currentTime - currentTime) > 0.5
    ) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        console.log('[VideoPlayer] isPlaying=true, attempting to play video. currentTime:', currentTime, 'src:', src);
        // Store the promise to handle it properly
        const playPromise = videoRef.current.play();
        
        // Modern browsers return a promise from play()
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('[VideoPlayer] Video play started successfully');
            setShowInteractionPrompt(false);
          }).catch((err) => {
            console.error('[VideoPlayer] play() failed with error:', err.name, err.message);
            
            // If the error is related to user interaction, we need to inform the user
            if (err.name === 'NotAllowedError') {
              console.warn('[VideoPlayer] Autoplay prevented by browser. User interaction required.');
              setShowInteractionPrompt(true);
              
              // Force the video to play on next user interaction
              const handleUserInteraction = () => {
                console.log('[VideoPlayer] User interaction detected, trying to play again');
                videoRef.current?.play().then(() => {
                  setShowInteractionPrompt(false);
                }).catch(e => console.error('[VideoPlayer] Play after interaction failed:', e));
                // Remove the event listeners after first interaction
                document.removeEventListener('click', handleUserInteraction);
                document.removeEventListener('keydown', handleUserInteraction);
              };
              
              // Add event listeners for user interaction
              document.addEventListener('click', handleUserInteraction);
              document.addEventListener('keydown', handleUserInteraction);
            }
          });
        }
      } else {
        console.log('[VideoPlayer] isPlaying=false, pausing video.');
        videoRef.current.pause();
        setShowInteractionPrompt(false);
      }
    } else {
      console.error('[VideoPlayer] videoRef.current is null');
    }
  }, [isPlaying, currentTime, src]);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    if (videoRef.current && onPlay) {
      onPlay(videoRef.current.currentTime);
    }
  };

  const handlePause = () => {
    if (videoRef.current && onPause) {
      onPause(videoRef.current.currentTime);
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        controls={controlsEnabled && isHost}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        style={{ width: '100%', height: '100%' }}
      >
        {subtitlesEnabled && <track kind="subtitles" />}
      </video>
      
      {showInteractionPrompt && (
        <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center">
          Click anywhere or press any key to enable video playback
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
