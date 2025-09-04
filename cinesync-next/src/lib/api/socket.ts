import { io, Socket } from 'socket.io-client';
import { getToken } from './authStorage';
import { SocketEvent, SocketEventData } from '@/types';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // Start with 1 second
  private maxReconnectInterval = 30000; // Max 30 seconds
  private connectionPromise: Promise<void> | null = null;
  private isExplicitDisconnect = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private initialize() {
    if (typeof window === 'undefined') return; // Skip in SSR

    const token = getToken();
    if (!token) {
      console.warn('No auth token available for socket connection');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
    
    this.socket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      reconnectionDelayMax: this.maxReconnectInterval,
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      this.reconnectInterval = 1000; // Reset reconnect interval
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (!this.isExplicitDisconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnect();
      }
    });

    // Forward all events to registered handlers
    this.socket.onAny((event, ...args) => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.forEach(handler => handler(...args));
      }
    });
  }

  private handleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectInterval
    );
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.socket && !this.socket.connected && !this.isExplicitDisconnect) {
        this.socket.connect();
      }
    }, delay);
  }

  public connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (!this.socket) {
      this.initialize();
    }

    if (this.socket?.connected) {
      return Promise.resolve();
    }

    this.isExplicitDisconnect = false;
    this.connectionPromise = new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket not initialized'));
      }

      const onConnect = () => {
        this.socket?.off('connect_error', onError);
        resolve();
      };

      const onError = (error: Error) => {
        this.socket?.off('connect', onConnect);
        reject(error);
      };

      this.socket.once('connect', onConnect);
      this.socket.once('connect_error', onError);
      this.socket.connect();
    });

    return this.connectionPromise;
  }

  public disconnect() {
    this.isExplicitDisconnect = true;
    if (this.socket) {
      this.socket.disconnect();
    }
    this.connectionPromise = null;
  }

  public emit<T>(event: SocketEvent, data: T): void {
    if (!this.socket?.connected) {
      console.warn(`Socket not connected. Cannot emit event: ${event}`);
      return;
    }
    this.socket.emit(event, data);
  }

  public on<T extends keyof SocketEventData>(
    event: T,
    handler: (data: SocketEventData[T]) => void
  ): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler);

    // Return cleanup function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    };
  }

  public off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  public get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public get socketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = SocketService.getInstance();
export default socketService;
