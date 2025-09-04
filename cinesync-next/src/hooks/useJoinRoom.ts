import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from './useRoom';

export function useJoinRoom() {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { joinRoom } = useRoom();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    try {
      setIsLoading(true);
      const room = await joinRoom(roomCode.trim().toUpperCase());
      if (room) {
        router.push(`/room/${room.id}`);
      }
    } catch (err: any) {
      console.error('Failed to join room:', err);
      setError(err.message || 'Failed to join room. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    roomCode,
    setRoomCode,
    error,
    isLoading,
    handleSubmit,
  };
}
