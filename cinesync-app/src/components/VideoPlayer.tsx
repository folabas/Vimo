import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  isPlaying?: boolean;
  initialTime?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  subtitlesEnabled?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  isPlaying,
  initialTime,
  onPlay,
  onPause,
  onTimeUpdate,
  subtitlesEnabled,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      console.log('Video source set:', src);
      videoRef.current.src = src;
      videoRef.current.currentTime = initialTime || 0;

      if (isPlaying) {
        videoRef.current.play().catch((err) => {
          console.error('Error playing video:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [src, isPlaying, initialTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      console.log('Video time updated:', currentTime);
      onTimeUpdate?.(currentTime);
    }
  };

  return (
    <video
      ref={videoRef}
      controls
      onPlay={onPlay}
      onPause={onPause}
      onTimeUpdate={handleTimeUpdate}
      style={{ width: '100%', height: '100%' }}
    >
      {subtitlesEnabled && <track kind="subtitles" />}
    </video>
  );
};

export default VideoPlayer;
