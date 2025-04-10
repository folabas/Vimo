const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');

/**
 * Initialize Socket.IO with the HTTP server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vimo-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user to socket
      socket.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);
    
    // Join a room
    socket.on('join-room', async ({ roomCode }) => {
      try {
        // Find room by code
        const room = await Room.findOne({ roomCode });
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Join socket room
        socket.join(roomCode);
        
        // Notify other users
        socket.to(roomCode).emit('participant-joined', {
          userId: socket.user.id,
          username: socket.user.username,
          profilePicture: socket.user.profilePicture
        });
        
        // Send room status to the user
        socket.emit('room-joined', {
          roomCode: room.roomCode,
          movie: room.movie,
          isPrivate: room.isPrivate,
          subtitlesEnabled: room.subtitlesEnabled,
          isPlaying: room.isPlaying,
          currentTime: room.currentTime,
          isHost: room.hostId.toString() === socket.user.id.toString(),
          participants: room.participants
        });
        
        console.log(`${socket.user.username} joined room ${roomCode}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });
    
    // Leave a room
    socket.on('leave-room', async ({ roomCode }) => {
      try {
        // Leave socket room
        socket.leave(roomCode);
        
        // Notify other users
        socket.to(roomCode).emit('participant-left', {
          userId: socket.user.id,
          username: socket.user.username
        });
        
        console.log(`${socket.user.username} left room ${roomCode}`);
      } catch (error) {
        console.error('Leave room error:', error);
      }
    });
    
    // Play video
    socket.on('play-video', async ({ roomCode, currentTime }) => {
      try {
        // Update room status
        await Room.updateOne(
          { roomCode },
          { 
            isPlaying: true,
            currentTime,
            lastActivity: Date.now()
          }
        );
        
        // Broadcast to other users in the room
        socket.to(roomCode).emit('video-played', {
          userId: socket.user.id,
          username: socket.user.username,
          currentTime
        });
        
        console.log(`${socket.user.username} played video in room ${roomCode}`);
      } catch (error) {
        console.error('Play video error:', error);
        socket.emit('error', { message: 'Failed to play video' });
      }
    });
    
    // Pause video
    socket.on('pause-video', async ({ roomCode, currentTime }) => {
      try {
        // Update room status
        await Room.updateOne(
          { roomCode },
          { 
            isPlaying: false,
            currentTime,
            lastActivity: Date.now()
          }
        );
        
        // Broadcast to other users in the room
        socket.to(roomCode).emit('video-paused', {
          userId: socket.user.id,
          username: socket.user.username,
          currentTime
        });
        
        console.log(`${socket.user.username} paused video in room ${roomCode}`);
      } catch (error) {
        console.error('Pause video error:', error);
        socket.emit('error', { message: 'Failed to pause video' });
      }
    });
    
    // Seek video
    socket.on('seek-video', async ({ roomCode, currentTime }) => {
      try {
        // Update room status
        await Room.updateOne(
          { roomCode },
          { 
            currentTime,
            lastActivity: Date.now()
          }
        );
        
        // Broadcast to other users in the room
        socket.to(roomCode).emit('video-seeked', {
          userId: socket.user.id,
          username: socket.user.username,
          currentTime
        });
        
        console.log(`${socket.user.username} seeked video in room ${roomCode}`);
      } catch (error) {
        console.error('Seek video error:', error);
        socket.emit('error', { message: 'Failed to seek video' });
      }
    });
    
    // Toggle subtitles
    socket.on('toggle-subtitles', async ({ roomCode, enabled }) => {
      try {
        // Update room status
        await Room.updateOne(
          { roomCode },
          { 
            subtitlesEnabled: enabled,
            lastActivity: Date.now()
          }
        );
        
        // Broadcast to other users in the room
        socket.to(roomCode).emit('subtitles-toggled', {
          userId: socket.user.id,
          username: socket.user.username,
          enabled
        });
        
        console.log(`${socket.user.username} toggled subtitles in room ${roomCode}`);
      } catch (error) {
        console.error('Toggle subtitles error:', error);
        socket.emit('error', { message: 'Failed to toggle subtitles' });
      }
    });
    
    // Send chat message
    socket.on('send-message', async ({ roomCode, message }) => {
      try {
        // Broadcast to other users in the room
        io.to(roomCode).emit('message-received', {
          userId: socket.user.id,
          username: socket.user.username,
          profilePicture: socket.user.profilePicture,
          message,
          timestamp: Date.now()
        });
        
        console.log(`${socket.user.username} sent message in room ${roomCode}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Send reaction
    socket.on('send-reaction', async ({ roomCode, reaction }) => {
      try {
        // Broadcast to other users in the room
        io.to(roomCode).emit('reaction-received', {
          userId: socket.user.id,
          username: socket.user.username,
          reaction,
          timestamp: Date.now()
        });
        
        console.log(`${socket.user.username} sent reaction in room ${roomCode}`);
      } catch (error) {
        console.error('Send reaction error:', error);
        socket.emit('error', { message: 'Failed to send reaction' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });

  return io;
}

module.exports = initializeSocket;
