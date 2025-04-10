import { io, Socket } from 'socket.io-client';
import { getToken } from './authService';

// Socket events
export enum SocketEvents {
  // Client to Server
  JOIN_ROOM = 'join-room',
  LEAVE_ROOM = 'leave-room',
  PLAY_VIDEO = 'play-video',
  PAUSE_VIDEO = 'pause-video',
  SEEK_VIDEO = 'seek-video',
  TOGGLE_SUBTITLES = 'toggle-subtitles',
  SEND_MESSAGE = 'send-message',
  SEND_REACTION = 'send-reaction',
  
  // Server to Client
  ROOM_JOINED = 'room-joined',
  ROOM_LEFT = 'room-left',
  VIDEO_PLAYED = 'video-played',
  VIDEO_PAUSED = 'video-paused',
  VIDEO_SEEKED = 'video-seeked',
  SUBTITLES_TOGGLED = 'subtitles-toggled',
  MESSAGE_RECEIVED = 'message-received',
  REACTION_RECEIVED = 'reaction-received',
  PARTICIPANT_JOINED = 'participant-joined',
  PARTICIPANT_LEFT = 'participant-left',
  ERROR = 'error'
}

// Socket service singleton
class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  
  /**
   * Initialize the socket connection
   */
  initialize(): void {
    if (this.socket) return;
    
    const token = getToken();
    if (!token) return;
    
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  
  /**
   * Disconnect the socket
   */
  disconnect(): void {
    if (!this.socket) return;
    
    this.socket.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
  
  /**
   * Join a room
   * @param roomCode - Room code to join
   */
  joinRoom(roomCode: string): void {
    if (!this.socket) this.initialize();
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.JOIN_ROOM, { roomCode });
  }
  
  /**
   * Leave a room
   * @param roomCode - Room code to leave
   */
  leaveRoom(roomCode: string): void {
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.LEAVE_ROOM, { roomCode });
  }
  
  /**
   * Play video
   * @param roomCode - Room code
   * @param currentTime - Current time in seconds
   */
  playVideo(roomCode: string, currentTime: number): void {
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.PLAY_VIDEO, { roomCode, currentTime });
  }
  
  /**
   * Pause video
   * @param roomCode - Room code
   * @param currentTime - Current time in seconds
   */
  pauseVideo(roomCode: string, currentTime: number): void {
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.PAUSE_VIDEO, { roomCode, currentTime });
  }
  
  /**
   * Seek video
   * @param roomCode - Room code
   * @param currentTime - Current time in seconds
   */
  seekVideo(roomCode: string, currentTime: number): void {
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.SEEK_VIDEO, { roomCode, currentTime });
  }
  
  /**
   * Toggle subtitles
   * @param roomCode - Room code
   * @param enabled - Whether subtitles are enabled
   */
  toggleSubtitles(roomCode: string, enabled: boolean): void {
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.TOGGLE_SUBTITLES, { roomCode, enabled });
  }
  
  /**
   * Send a chat message
   * @param roomCode - Room code
   * @param message - Message content
   */
  sendMessage(roomCode: string, message: string): void {
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.SEND_MESSAGE, { roomCode, message });
  }
  
  /**
   * Send a reaction
   * @param roomCode - Room code
   * @param reaction - Reaction emoji
   */
  sendReaction(roomCode: string, reaction: string): void {
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.SEND_REACTION, { roomCode, reaction });
  }
  
  /**
   * Add event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: SocketEvents, callback: Function): void {
    if (!this.socket) this.initialize();
    if (!this.socket) return;
    
    // Add to listeners map
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    
    // Add socket listener
    this.socket.on(event, (data) => {
      callback(data);
    });
  }
  
  /**
   * Remove event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  off(event: SocketEvents, callback: Function): void {
    if (!this.socket) return;
    
    // Remove from listeners map
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
    
    // Remove socket listener
    this.socket.off(event);
    
    // Re-add remaining listeners
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(cb => {
        this.socket?.on(event, (data) => {
          cb(data);
        });
      });
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
