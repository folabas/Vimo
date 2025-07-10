import React, { useRef, useEffect, useState, useMemo } from 'react';

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
  const [error, setError] = useState<string | null>(null);
  
  // Validate source URL
  const isValidSource = useMemo(() => {
    if (!src) return false;
    try {
      // Basic URL validation
      new URL(src);
      return true;
    } catch (e) {
      return false;
    }
  }, [src]);

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
    if (!isValidSource) {
      console.error('[VideoPlayer] Invalid or missing source URL:', src);
      setError('Video source is invalid or missing');
      return;
    }
    
    setError(null);
    
    if (videoRef.current) {
      if (isPlaying) {
        console.log('[VideoPlayer] isPlaying=true, attempting to play video. currentTime:', currentTime, 'src:', src);
        
        // Reset any previous error state
        setError(null);
        
        // Store the promise to handle it properly
        const playPromise = videoRef.current.play().catch(err => {
          // Rethrow to be caught by the outer catch
          console.error('[VideoPlayer] Initial play() failed:', err);
          throw err;
        });
        
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

  if (error || !isValidSource) {
    return (
      <div className="relative bg-gray-800 text-white p-4 rounded-lg flex items-center justify-center" style={{ minHeight: '200px' }}>
        <div className="text-center">
          <div className="text-red-500 font-medium mb-2">
            {error || 'Invalid video source'}
          </div>
          <p className="text-sm text-gray-400">
            The video cannot be played because the source URL is invalid or missing.
          </p>
          {isHost && (
            <p className="text-sm text-gray-400 mt-2">
              Please select a different video from the library.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        controls={controlsEnabled && isHost}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onError={(e) => {
          console.error('[VideoPlayer] Video error:', e);
          setError('Failed to load video. The file may be corrupted or in an unsupported format.');
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {subtitlesEnabled && <track kind="subtitles" />}
        Your browser does not support the video tag.
      </video>
      
      {showInteractionPrompt && (
        <div 
          className="absolute top-0 left-0 right-0 bg-blue-600 text-white p-3 text-center cursor-pointer hover:bg-blue-700 transition-colors"
          onClick={() => {
            videoRef.current?.play().catch(e => {
              console.error('[VideoPlayer] Play after interaction failed:', e);
              setError('Could not play video. Please try again.');
            });
          }}
        >
          <div>Click to play video</div>
          <div className="text-xs opacity-80 mt-1">Your browser requires interaction to play media</div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
