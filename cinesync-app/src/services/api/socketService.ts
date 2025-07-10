import { io, Socket } from 'socket.io-client';
import { isAuthenticated } from './authService';
import { Message, Participant, RoomState } from './roomService';

// Define types for socket events
type EventCallback = (...args: any[]) => void;

interface SocketEventCallbacks {
  [key: string]: EventCallback[];
}

interface SocketAuthError {
  message: string;
  code?: string;
  data?: any;
}

interface SocketError extends Error {
  message: string;
  code?: string;
  data?: any;
}

// Socket events
export enum SocketEvents {
  // Client to Server
  JOIN_ROOM = 'join-room',
  LEAVE_ROOM = 'leave-room',
  PLAY_VIDEO = 'play-video',
  PAUSE_VIDEO = 'pause-video',
  SEEK_VIDEO = 'seek-video',
  TIME_UPDATE = 'time-update',
  TOGGLE_SUBTITLES = 'toggle-subtitles',
  CHAT_MESSAGE = 'chat-message',
  SEND_REACTION = 'send-reaction',
  SELECT_VIDEO = 'select-video',
  
  // Server to Client
  ROOM_STATE_UPDATE = 'room-state-update',
  ROOM_JOINED = 'room-joined',
  ROOM_LEFT = 'room-left',
  VIDEO_PLAYED = 'video-played',
  VIDEO_PAUSED = 'video-paused',
  VIDEO_SEEKED = 'video-seeked',
  SUBTITLES_TOGGLED = 'subtitles-toggled',
  CHAT_MESSAGE_RECEIVED = 'chat-message-received',
  REACTION_RECEIVED = 'reaction-received',
  PARTICIPANT_JOINED = 'participant-joined',
  PARTICIPANT_LEFT = 'participant-left',
  ERROR = 'error',
  
  // WebRTC Signaling Events
  OFFER = 'offer',
  ANSWER = 'answer',
  ICE_CANDIDATE = 'ice-candidate'
}

// WebRTC signaling types are defined where they are used

// Socket service singleton
export class SocketService {
  private socket: Socket | null = null;
  private listeners: SocketEventCallbacks = {};
  private currentRoom: string | null = null;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;
  private connectResolve: (() => void) | null = null;
  private connectReject: ((error: Error) => void) | null = null;
  // WebRTC Signaling Methods
  public sendOffer(offer: RTCSessionDescriptionInit, to: string): void {
    this.socket?.emit(SocketEvents.OFFER, { offer, to });
  }

  public sendAnswer(answer: RTCSessionDescriptionInit, to: string): void {
    this.socket?.emit(SocketEvents.ANSWER, { answer, to });
  }

  public sendIceCandidate(candidate: RTCIceCandidateInit, to: string): void {
    this.socket?.emit(SocketEvents.ICE_CANDIDATE, { candidate, to });
  }

  public onOffer(callback: (data: { offer: RTCSessionDescriptionInit; from: string }) => void): void {
    this.socket?.on(SocketEvents.OFFER, (data: any) => {
      callback({ offer: data.offer, from: data.from });
    });
  }

  public onAnswer(callback: (data: { answer: RTCSessionDescriptionInit; from: string }) => void): void {
    this.socket?.on(SocketEvents.ANSWER, (data: any) => {
      callback({ answer: data.answer, from: data.from });
    });
  }

  public onIceCandidate(callback: (data: { candidate: RTCIceCandidateInit; from: string }) => void): void {
    this.socket?.on(SocketEvents.ICE_CANDIDATE, (data: any) => {
      callback({ candidate: data.candidate, from: data.from });
    });
  }

  public offWebRTCEvents(): void {
    this.socket?.off(SocketEvents.OFFER);
    this.socket?.off(SocketEvents.ANSWER);
    this.socket?.off(SocketEvents.ICE_CANDIDATE);
  }
  
  /**
   * Handle connection errors
   */
  private handleConnectionError(error: Error | string): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorCode = (error as any)?.code || 'CONNECTION_ERROR';
    const isAuthError = errorMessage.toLowerCase().includes('user not found') || 
                      errorMessage.toLowerCase().includes('auth') ||
                      errorCode === 'AUTH_ERROR';
    
    console.error(`[SocketService] ${isAuthError ? 'Authentication' : 'Connection'} error (${errorCode}):`, errorMessage);
    
    // Clean up connection state
    this.isConnecting = false;
    this.connectionPromise = null;
    
    // Create a proper error object
    const connectionError = typeof error === 'string' 
      ? new Error(error) 
      : error;
    
    // Set error code and type
    if (!(connectionError as any).code) {
      (connectionError as any).code = errorCode;
    }
    
    // Mark as auth error if needed
    if (isAuthError) {
      (connectionError as any).isAuthError = true;
      // Clear invalid token
      const { logout } = require('./authService');
      logout();
    }
    
    // Reject the connection promise if it exists
    if (this.connectReject) {
      this.connectReject(connectionError);
    }
    
    // Clean up socket
    if (this.socket) {
      this.socket.off('connect_error');
      this.socket.off('connect_timeout');
      this.socket.off('error');
      this.disconnect();
    }
  }

  /**
   * Initialize the socket connection
   */
  async initialize(): Promise<void> {
    console.log('[SocketService] Initializing socket connection...');
    
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      console.log('[SocketService] Reusing existing connection promise');
      return this.connectionPromise;
    }
    
    // Return resolved promise if already connected
    if (this.socket?.connected) {
      console.log('[SocketService] Socket already connected');
      return Promise.resolve();
    }
    
    // Check if user is authenticated
    try {
      console.log('[SocketService] Checking authentication status...');
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        const error = new Error('User is not authenticated. Please log in first.');
        error.name = 'AuthError';
        throw error;
      }
      console.log('[SocketService] User is authenticated');
    } catch (error) {
      console.error('[SocketService] Authentication check failed:', error);
      if (error instanceof Error) {
        error.name = 'AuthError';
      }
      throw error;
    }
    
    this.connectionPromise = new Promise((resolve, reject) => {
      this.isConnecting = true;
      this.connectResolve = resolve;
      this.connectReject = reject;
      
      // Disconnect existing socket if any
      if (this.socket) {
        console.log('[SocketService] Disconnecting existing socket');
        this.socket.disconnect();
      }

      const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('[SocketService] Connecting to:', socketUrl);
      
      // Create new socket connection with credentials
      this.socket = io(socketUrl, {
        withCredentials: true,
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        secure: process.env.NODE_ENV === 'production',
        // Ensure WebSocket is used as the primary transport
        transports: ['websocket', 'polling']
      });
      
      // Log connection attempt
      console.log('[SocketService] Socket connection options:', {
        url: socketUrl,
        withCredentials: true,
        secure: process.env.NODE_ENV === 'production',
        transports: ['websocket', 'polling']
      });

      // Add connection timeout
      const connectTimeout = setTimeout(() => {
        if (this.isConnecting) {
          console.error('[SocketService] Connection timeout');
          this.handleConnectionError(new Error('Connection timeout. Please check your network and try again.'));
        }
      }, 10000);
      
      // Socket event handlers
      this.socket.on('connect', () => {
        clearTimeout(connectTimeout);
        console.log('[SocketService] Connected successfully');
        this.isConnecting = false;
        if (this.connectResolve) {
          this.connectResolve();
        }
      });
      
      this.socket.on('disconnect', (reason: string) => {
        console.log('[SocketService] Disconnected:', reason);
        if (reason === 'io server disconnect') {
          // The server has forcefully disconnected the socket
          console.error('[SocketService] Server disconnected. Please log in again.');
        }
        this.isConnecting = false;
        this.connectionPromise = null;
      });
      
      this.socket.on('connect_error', (error: Error) => {
        clearTimeout(connectTimeout);
        this.handleConnectionError(error);
      });

      this.socket.on('error', (error: Error) => {
        console.error('[SocketService] Socket error:', error);
      });

      // Handle authentication errors
      this.socket.on('unauthorized', (error: SocketAuthError | string) => {
        const errorMessage = typeof error === 'string' ? error : error.message;
        const errorCode = typeof error === 'string' ? 'AUTH_ERROR' : (error.code || 'AUTH_ERROR');
        
        console.error(`[SocketService] Authentication error (${errorCode}):`, errorMessage);
        
        // Create a proper error object
        const authError = new Error(`Authentication failed: ${errorMessage}`);
        (authError as any).code = errorCode;
        
        // Clean up and reject
        this.disconnect();
        if (this.connectReject) {
          this.connectReject(authError);
        }
        
        // Clear any stored token as it's invalid
        const { logout } = require('./authService');
        logout();
      });
    });

    return this.connectionPromise;
  }
  
  /**
   * Disconnect the socket
   */
  /**
   * Disconnect the socket and clean up resources
   */
  disconnect(): void {
    if (!this.socket) return;
    
    console.log('[SocketService] Disconnecting socket');
    
    // Remove all event listeners
    this.socket.off();
    this.socket.disconnect();
    
    // Clean up references
    this.socket = null;
    this.listeners = {};
    this.currentRoom = null;
    this.connectionPromise = null;
    this.isConnecting = false;
    
    // Clean up connection promise handlers
    if (this.connectReject) {
      this.connectReject(new Error('Socket disconnected'));
    }
    this.connectResolve = null;
    this.connectReject = null;
  }
  
  /**
   * Join a room
   * @param roomCode - Room code to join
   */
  async joinRoom(roomCode: string): Promise<void> {
    // Skip if already in this room
    if (this.currentRoom === roomCode) {
      console.log(`Already in room: ${roomCode}, skipping join`);
      return;
    }
    
    try {
      // Initialize socket if needed
      await this.initialize();
      
      if (!this.socket) {
        throw new Error('Socket not initialized');
      }
      
      console.log(`Joining room: ${roomCode}`);
      this.socket.emit(SocketEvents.JOIN_ROOM, { roomCode });
      this.currentRoom = roomCode;
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }
  
  /**
   * Leave a room
   * @param roomCode - Room code to leave
   */
  leaveRoom(roomCode: string): void {
    if (!this.socket) return;
    
    // Only leave if we're in this room
    if (this.currentRoom !== roomCode) {
      console.log(`Not in room: ${roomCode}, skipping leave`);
      return;
    }
    
    console.log(`Leaving room: ${roomCode}`);
    this.socket.emit(SocketEvents.LEAVE_ROOM, { roomCode });
    this.currentRoom = null;
  }
  
  /**
   * Emit play event
   * @param payload - Object with roomCode and currentTime
   * @param isHost - Whether the user is the host
   */
  emitPlay(payload: { roomCode: string; currentTime: number }, isHost: boolean): void {
    if (!this.socket) return;
    if (!isHost) {
      console.warn('Non-host tried to emit play event');
      return;
    }
    console.log(`Emitting play in room ${payload.roomCode} at time: ${payload.currentTime}`);
    this.socket.emit(SocketEvents.PLAY_VIDEO, payload);
  }

  /**
   * Emit pause event
   * @param payload - Object with roomCode and currentTime
   * @param isHost - Whether the user is the host
   */
  emitPause(payload: { roomCode: string; currentTime: number }, isHost: boolean): void {
    if (!this.socket) return;
    if (!isHost) {
      console.warn('Non-host tried to emit pause event');
      return;
    }
    console.log(`Emitting pause in room ${payload.roomCode} at time: ${payload.currentTime}`);
    this.socket.emit(SocketEvents.PAUSE_VIDEO, payload);
  }

  /**
   * Emit seek event
   * @param payload - Object with roomCode and currentTime
   * @param isHost - Whether the user is the host
   */
  emitSeek(payload: { roomCode: string; currentTime: number }, isHost: boolean): void {
    if (!this.socket) return;
    if (!isHost) {
      console.warn('Non-host tried to emit seek event');
      return;
    }
    console.log(`Emitting seek in room ${payload.roomCode} to time: ${payload.currentTime}`);
    this.socket.emit(SocketEvents.SEEK_VIDEO, payload);
  }
  
  /**
   * Emit time update event
   * @param currentTime - Current time in seconds
   */
  emitTimeUpdate(currentTime: number): void {
    if (!this.socket) return;
    
    // This is a high-frequency event, so we don't log it
    this.socket.emit(SocketEvents.TIME_UPDATE, { currentTime });
  }
  
  /**
   * Toggle subtitles
   * @param enabled - Whether subtitles are enabled
   */
  toggleSubtitles(enabled: boolean): void {
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.TOGGLE_SUBTITLES, { enabled });
  }
  
  /**
   * Select a video for the room
   * @param movie - Movie object with source URL
   */
  selectVideo(movie: any): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot select video: Socket not connected');
      return;
    }

    if (!this.currentRoom) {
      console.error('Cannot select video: Not in a room');
      return;
    }

    console.log('Selecting video with details:', {
      id: movie.id,
      title: movie.title,
      source: movie.source,
      socketConnected: this.socket.connected,
      currentRoom: this.currentRoom
    });
    
    // Make sure we have all required fields for the Movie type
    // This ensures we send a complete object to the server, which will then
    // be properly reflected in the ROOM_STATE_UPDATE events
    const source = movie.source || movie.videoUrl || '';
    const fullMovie = {
      id: movie.id || `movie-${Date.now()}`,
      title: movie.title || 'Untitled',
      source: source,
      videoUrl: source,  // Use the same source for both fields
      thumbnail: movie.thumbnail || '',
      duration: movie.duration || '00:00'
    };
    
    // Add debugging
    console.log('Emitting SELECT_VIDEO event with data:', fullMovie);
    
    // Emit the SELECT_VIDEO event with the enhanced movie object
    this.socket.emit(SocketEvents.SELECT_VIDEO, fullMovie);
    
    // Emit a backup event with the same data in case the server is listening for a different event name
    console.log('Also emitting select-video (non-enum version) as backup');
    this.socket.emit('select-video', fullMovie);
  }
  
  /**
   * Emit chat message
   * @param message - Message object
   */
  emitChatMessage(message: { content: string }): void {
    if (!this.socket) return;
    
    console.log(`Sending chat message: ${message.content.substring(0, 20)}${message.content.length > 20 ? '...' : ''}`);
    this.socket.emit(SocketEvents.CHAT_MESSAGE, message);
  }
  
  /**
   * Send a reaction
   * @param reaction - Reaction emoji
   */
  sendReaction(reaction: string): void {
    if (!this.socket) return;
    
    this.socket.emit(SocketEvents.SEND_REACTION, { reaction });
  }
  
  /**
   * Listen for room state updates
   * @param callback - Callback function
   */
  onRoomStateUpdate(callback: (state: RoomState) => void): void {
    this.on(SocketEvents.ROOM_STATE_UPDATE, callback);
  }
  
  /**
   * Listen for chat messages
   * @param callback - Callback function
   */
  onChatMessage(callback: (message: Message) => void): void {
    this.on(SocketEvents.CHAT_MESSAGE_RECEIVED, (data: Message) => {
        console.log('Chat message received from server:', data); // Debug log
        callback(data);
    });
  }
  
  /**
   * Listen for participant joined events
   * @param callback - Callback function
   */
  onParticipantJoined(callback: (participant: Participant) => void): void {
    this.on(SocketEvents.PARTICIPANT_JOINED, callback);
  }
  
  /**
   * Listen for participant left events
   * @param callback - Callback function
   */
  onParticipantLeft(callback: (data: { userId: string, username: string }) => void): void {
    this.on(SocketEvents.PARTICIPANT_LEFT, callback);
  }
  
  /**
   * Register a socket event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  async on(event: string, callback: EventCallback): Promise<void> {
    // Initialize socket if needed
    await this.initialize();
    
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }
    
    // Add to our listeners map
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    // Create a wrapper function to maintain proper 'this' context
    const wrappedCallback = (...args: any[]) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`[SocketService] Error in '${event}' handler:`, error);
      }
    };
    
    // Store the original callback reference so we can remove it later
    (wrappedCallback as any).__originalCallback = callback;
    this.listeners[event].push(wrappedCallback);
    
    // Add the actual socket listener with the wrapped callback
    this.socket.on(event, wrappedCallback);
  }
  
  /**
   * Remove event listener
   * @param event - Event name
   * @param callback - Callback function to remove
   */
  off(event: string, callback: EventCallback): void {
    if (!this.socket || !this.listeners[event]) return;
    
    // Find the wrapped callback in our listeners
    const wrappedCallback = this.listeners[event].find(
      (cb) => (cb as any).__originalCallback === callback
    );
    
    // Remove from our listeners map
    this.listeners[event] = this.listeners[event].filter(
      (cb) => (cb as any).__originalCallback !== callback
    );
    
    // Remove the actual socket listener using the wrapped callback if found
    if (wrappedCallback) {
      this.socket.off(event, wrappedCallback);
    } else {
      // Fallback to removing with the original callback
      this.socket.off(event, callback);
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
