'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Paper,
  useTheme,
  Divider
} from '@mui/material';
import { useRoom } from '../app/context/RoomContext';
import { useAuth } from '../app/context/AuthContext';

interface ParticipantsListProps {
  maxHeight?: number | string;
  showHeader?: boolean;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  maxHeight = 400,
  showHeader = true
}) => {
  const { currentRoom } = useRoom();
  const { user } = useAuth();
  const theme = useTheme();

  if (!currentRoom) return null;

  const { participants } = currentRoom;

  // In a real app, you would fetch user details for each participant ID
  // For now, we'll just display the IDs
  const participantsList = participants.map(participantId => ({
    id: participantId,
    name: participantId === currentRoom.hostId ? `${participantId} (Host)` : participantId,
    isCurrentUser: user?.id === participantId,
    isHost: participantId === currentRoom.hostId
  }));

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        maxHeight,
        overflow: 'auto',
        bgcolor: theme.palette.background.paper,
        borderRadius: 2
      }}
    >
      {showHeader && (
        <>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: theme.palette.text.primary
            }}
          >
            Participants ({participants.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      
      <List dense>
        {participantsList.map((participant) => (
          <ListItem 
            key={participant.id}
            sx={{
              borderRadius: 1,
              bgcolor: participant.isCurrentUser 
                ? theme.palette.action.selected 
                : 'transparent',
              '&:hover': {
                bgcolor: theme.palette.action.hover,
              },
              transition: 'background-color 0.2s',
              mb: 0.5
            }}
          >
            <ListItemAvatar>
              <Avatar 
                sx={{
                  bgcolor: participant.isHost 
                    ? theme.palette.primary.main 
                    : theme.palette.secondary.main,
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem'
                }}
              >
                {participant.name.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={
                <Typography 
                  variant="body2" 
                  fontWeight={participant.isCurrentUser ? 600 : 'normal'}
                  color={participant.isHost ? 'primary' : 'text.primary'}
                >
                  {participant.name}
                </Typography>
              }
              secondary={
                participant.isHost ? 'Room Host' : 
                participant.isCurrentUser ? 'You' : 'Participant'
              }
              secondaryTypographyProps={{
                variant: 'caption',
                color: 'text.secondary'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ParticipantsList;
