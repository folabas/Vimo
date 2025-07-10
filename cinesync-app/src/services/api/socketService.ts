import { io, Socket } from 'socket.io-client';
import { getToken } from './authService';
import { Message, Participant, RoomState } from './roomService';

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
  private listeners: Map<string, Function[]> = new Map();
  private currentRoom: string | null = null;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;
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
   * Initialize the socket connection
   */
  initialize(): Promise<void> {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) return this.connectionPromise;
    
    // Return resolved promise if already connected
    if (this.socket && this.socket.connected) {
      return Promise.resolve();
    }
    
    this.connectionPromise = new Promise((resolve, reject) => {
      this.isConnecting = true;
      
      const token = getToken();
      if (!token) {
        this.isConnecting = false;
        this.connectionPromise = null;
        return reject(new Error('Authentication required'));
      }
      
      const BASE_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      
      // Configure socket options with fallback to polling if WebSocket fails
      this.socket = io(BASE_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      this.socket.on('connect', () => {
        console.log('[SocketService] Connected to server, socket id:', this.socket?.id);
        this.isConnecting = false;
        resolve();
      });
      
      this.socket.on('disconnect', () => {
        console.log('[SocketService] Disconnected from server');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('[SocketService] Connection error:', error);
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(error);
      });
      
      // Add timeout to prevent hanging indefinitely
      setTimeout(() => {
        if (this.isConnecting) {
          console.error('[SocketService] Connection timeout after 10 seconds');
          this.isConnecting = false;
          this.connectionPromise = null;
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
    
    return this.connectionPromise;
  }
  
  /**
   * Disconnect the socket
   */
  disconnect(): void {
    if (!this.socket) return;
    
    this.socket.disconnect();
    this.socket = null;
    this.listeners.clear();
    this.currentRoom = null;
    this.connectionPromise = null;
    this.isConnecting = false;
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
    const fullMovie = {
      id: movie.id || `movie-${Date.now()}`,
      title: movie.title || 'Untitled',
      source: movie.source || '',
      // Include videoUrl field to ensure server can map it properly
      videoUrl: movie.source || '',
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
   */
  async on(event: string, callback: Function): Promise<void> {
    // Initialize socket if needed
    await this.initialize();
    
    if (!this.socket) {
      console.error(`[SocketService] Cannot register event '${event}': Socket not initialized`);
      throw new Error('Socket not initialized');
    }
    
    console.log(`[SocketService] Registering event listener for '${event}'`);
    
    // Create a wrapped callback to ensure we can properly remove it later
    const wrappedCallback = (data: any) => {
      console.log(`[SocketService] Event '${event}' received with args:`, data);
      
      // Special handling for room state updates to ensure valid data
      if (event === SocketEvents.ROOM_STATE_UPDATE) {
        // Clone the data to avoid reference issues
        const stateClone = structuredClone(data);
        
        // Ensure we have a valid selectedMovie object with all required fields
        if (!stateClone.selectedMovie) {
          console.log('No selectedMovie in room state update, creating empty placeholder');
          stateClone.selectedMovie = { 
            id: '', 
            title: '', 
            source: '' 
          };
        } 
        // If the server uses 'movie' field instead of 'selectedMovie' (server format)
        else if (stateClone.movie && !stateClone.selectedMovie.source) {
          console.log('Found movie object in room state, mapping to selectedMovie', stateClone.movie);
          stateClone.selectedMovie = {
            id: stateClone.movie.id || '',
            title: stateClone.movie.title || '',
            source: stateClone.movie.source || '',
            thumbnail: stateClone.movie.thumbnail || '',
            duration: stateClone.movie.duration || '00:00'
          };
        }
        // If we have a selectedMovie with videoUrl but no source, map it
        else if (stateClone.selectedMovie.videoUrl && 
               (!stateClone.selectedMovie.source || stateClone.selectedMovie.source === '')) {
          console.log('Mapping videoUrl to source:', stateClone.selectedMovie.videoUrl);
          stateClone.selectedMovie.source = stateClone.selectedMovie.videoUrl;
        } 
        // If we have a selectedMovie but no source (and no videoUrl)
        else if (!stateClone.selectedMovie.source || stateClone.selectedMovie.source === '') {
          console.warn('Room state update contains selectedMovie with no source:', stateClone.selectedMovie);
          
          // Add a flag to indicate the source is invalid, so client can use fallbacks
          stateClone.selectedMovie._sourceInvalid = true;
        }
        
        // Double check that source is valid after our fixes
        if (stateClone.selectedMovie && stateClone.selectedMovie.source) {
          console.log('Final source URL in room state update:', stateClone.selectedMovie.source);
        } else if (stateClone.selectedMovie) {
          console.warn('Source is still empty after processing!');
          // Add a flag to indicate the source is invalid
          stateClone.selectedMovie._sourceInvalid = true;
        }
        
        // Dispatch to listeners with the processed state
        callback(stateClone);
      } else {
        // For all other events, just pass the data through
        callback(data);
      }
    };
    
    // Store the wrapped callback so we can remove it later
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const listeners = this.listeners.get(event)!;
    listeners.push(wrappedCallback);
    
    // Add the event listener
    this.socket.on(event, wrappedCallback);
  }
  
  /**
   * Remove event listener
   * @param event - Event name
   * @param callback - Callback function
   */
  off(event: string, callback: Function): void {
    if (!this.socket) return;
    
    // Remove from listeners map
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        
        // Get the wrapped callback to properly remove the listener
        const wrappedCallback = (callback as any).__wrapped;
        if (wrappedCallback) {
          this.socket.off(event, wrappedCallback);
        } else {
          // Fallback to removing with the original callback
          this.socket.off(event, callback as any);
        }
      }
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
