import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from './useRoom';
import { useAuth } from './useAuth';

export function useWatchRoom(roomId: string) {
  const { user } = useAuth();
  const { room, playVideo, pauseVideo, seekVideo, changeVideo, sendMessage } = useRoom();
  const router = useRouter();
  
  // Local UI state
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showVideoLibrary, setShowVideoLibrary] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<{ type: string; message: string } | null>(null);
  
  // Refs
  const lastSeekRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!room) return;
    
    if (room.isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  }, [room, playVideo, pauseVideo]);
  
  // Handle seek
  const handleSeek = useCallback((time: number) => {
    if (!room || !videoRef.current) return;
    
    // Prevent multiple seek events in quick succession
    const now = Date.now();
    if (lastSeekRef.current && now - lastSeekRef.current < 1000) {
      return;
    }
    
    lastSeekRef.current = now;
    seekVideo(time);
  }, [room, seekVideo]);
  
  // Handle video change
  const handleVideoChange = useCallback((video: {
    id: string;
    title: string;
    source: 'youtube' | 'vimeo' | 'upload' | 'other';
    thumbnail: string;
    duration: string;
  }) => {
    changeVideo({
      id: video.id,
      title: video.title,
      source: video.source,
      thumbnail: video.thumbnail,
      duration: video.duration
    });
    setShowVideoLibrary(false);
  }, [changeVideo]);
  
  // Handle chat message submission
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;
    
    const message = {
      id: Date.now().toString(),
      text: chatInput,
      sender: user.username,
      timestamp: new Date().toISOString(),
    };
    
    sendMessage(JSON.stringify(message));
    setChatInput('');
  }, [chatInput, user, sendMessage]);
  
  // Handle copy room link
  const handleCopyRoomLink = useCallback(() => {
    if (!room) return;
    
    const roomUrl = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(roomUrl);
    setIsCopied(true);
    
    const timer = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [room]);
  
  // Sync video time with room state
  useEffect(() => {
    if (!room || !videoRef.current) return;
    
    // Only update if the difference is significant (more than 1 second)
    if (Math.abs(videoRef.current.currentTime - room.currentTime) > 1) {
      videoRef.current.currentTime = room.currentTime;
    }
    
    // Update local time for UI
    const interval = setInterval(() => {
      if (videoRef.current) {
        setLocalCurrentTime(videoRef.current.currentTime);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [room]);
  
  // Handle video playback
  useEffect(() => {
    if (!videoRef.current || !room) return;
    
    if (room.isPlaying) {
      videoRef.current.play().catch(e => {
        console.error('Error playing video:', e);
        setError({
          type: 'PLAYBACK_ERROR',
          message: 'Failed to play video. Please try again.'
        });
      });
    } else {
      videoRef.current.pause();
    }
  }, [room?.isPlaying]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      console.error(`[useWatchRoom] ${error.type}:`, error.message);
      
      // Handle specific error types
      if (error.type === 'AUTH_ERROR') {
        const searchParams = new URLSearchParams({
          from: window.location.pathname,
          error: 'Your session has expired. Please log in again.'
        });
        router.push(`/login?${searchParams.toString()}`);
      }
    }
  }, [error, router]);
  
  return {
    // State
    room,
    isChatOpen,
    showVideoLibrary,
    localCurrentTime,
    chatInput,
    isCopied,
    error,
    isHost: room?.host.id === user?.id,
    
    // Refs
    videoRef,
    
    // Actions
    setIsChatOpen,
    setShowVideoLibrary,
    setChatInput,
    handlePlayPause,
    handleSeek,
    handleVideoChange,
    handleSendMessage,
    handleCopyRoomLink,
  };
}
