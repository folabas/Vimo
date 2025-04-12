import { useContext } from 'react';
import { RoomContext, RoomContextType } from '../context/RoomContext';

export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
