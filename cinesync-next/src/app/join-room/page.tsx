'use client';

import { useRouter } from 'next/navigation';
import { Button, TextField, Typography, Container, Box, Paper } from '@mui/material';
import { useJoinRoom } from '@/hooks/useJoinRoom';
import styles from './JoinRoom.module.css';

export default function JoinRoomPage() {
  const { roomCode, setRoomCode, error, isLoading, handleSubmit } = useJoinRoom();
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Container maxWidth="sm">
        <Paper elevation={3} className={styles.paper}>
          <div className={styles.header}>
            <Typography variant="h4" component="h1" gutterBottom>
              Join a Room
            </Typography>
            <Typography variant="body1" color="textSecondary" className={styles.subtitle}>
              Enter the room code to join your friend's watch party
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <TextField
              label="Room Code"
              variant="outlined"
              fullWidth
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABCD12"
              error={!!error}
              helperText={error}
              className={styles.input}
              inputProps={{
                style: { textTransform: 'uppercase' },
                maxLength: 6,
              }}
              autoComplete="off"
              autoFocus
              disabled={isLoading}
            />

            <div className={styles.buttonGroup}>
              <Button
                variant="outlined"
                onClick={() => router.push('/dashboard')}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!roomCode.trim() || isLoading}
                className={styles.joinButton}
              >
                {isLoading ? 'Joining...' : 'Join Room'}
              </Button>
            </div>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
