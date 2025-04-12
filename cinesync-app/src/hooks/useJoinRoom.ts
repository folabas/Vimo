import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from './useRoom';

export const useJoinRoom = () => {
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

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  return {
    roomCode,
    setRoomCode,
    error,
    isLoading,
    handleSubmit,
    handleBackToHome
  };
};
