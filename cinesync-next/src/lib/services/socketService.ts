import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private listeners: Record<string, (...args: any[]) => void> = {};

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token?: string): void {
    if (this.socket?.connected) return;

    const options = token ? {
      auth: { token }
    } : {};

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      ...options,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Register all stored listeners
    Object.entries(this.listeners).forEach(([event, listener]) => {
      this.socket?.on(event, listener);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.listeners[event] = listener;
    this.socket?.on(event, listener);
  }

  public off(event: string, listener?: (...args: any[]) => void): void {
    if (listener) {
      this.socket?.off(event, listener);
      delete this.listeners[event];
    } else {
      this.socket?.off(event);
      Object.keys(this.listeners).forEach(key => {
        if (key === event) {
          delete this.listeners[key];
        }
      });
    }
  }

  public emit(event: string, ...args: any[]): void {
    this.socket?.emit(event, ...args);
  }

  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();
