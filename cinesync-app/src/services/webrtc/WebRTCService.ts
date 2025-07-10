// Define the interface for the socket service
interface ISocketService {
  sendOffer: (offer: RTCSessionDescriptionInit, to: string) => void;
  sendAnswer: (answer: RTCSessionDescriptionInit, to: string) => void;
  sendIceCandidate: (candidate: RTCIceCandidateInit, to: string) => void;
  onOffer: (callback: (data: { offer: RTCSessionDescriptionInit; from: string }) => void) => void;
  onAnswer: (callback: (data: { answer: RTCSessionDescriptionInit; from: string }) => void) => void;
  onIceCandidate: (callback: (data: { candidate: RTCIceCandidateInit; from: string }) => void) => void;
  offWebRTCEvents: () => void;
}

export type SyncMessage = {
  type: 'play' | 'pause' | 'seek' | 'sync';
  timestamp: number;
  currentTime?: number;
  isPlaying?: boolean;
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private isConnected: boolean = false;
  private dataChannel: RTCDataChannel | null = null;
  private socket: ISocketService;
  private isHost: boolean = false;
  private onSyncCallback: ((message: SyncMessage) => void) | null = null;
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // Add your TURN servers here if needed
    ],
  };

  constructor(socket: ISocketService) {
    this.socket = socket;
  }

  async initialize(isHost: boolean): Promise<void> {
    this.isHost = isHost;
    this.isConnected = false;
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Set up ICE candidate handling
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(event.candidate.toJSON(), this.isHost ? 'all' : 'host');
      }
    };

    // Set up data channel if host
    if (this.isHost) {
      this.dataChannel = this.peerConnection.createDataChannel('sync');
      this.setupDataChannel();
    } else {
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel();
      };
    }

    return Promise.resolve();
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
      if (this.isHost) {
        this.startSync();
      }
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as SyncMessage;
        console.log('Received sync message:', message);
        this.onSyncCallback?.(message);
      } catch (error) {
        console.error('Error parsing sync message:', error);
      }
    };
  }

  private startSync(): void {
    if (!this.isHost || !this.dataChannel) return;

    setInterval(() => {
      if (this.dataChannel?.readyState === 'open') {
        const syncMessage: SyncMessage = {
          type: 'sync',
          timestamp: Date.now(),
        };
        this.sendSyncMessage(syncMessage);
      }
    }, 1000);
  }

  private sendSyncMessage(message: SyncMessage): void {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    }
  }

  public setOnSyncCallback(callback: (message: SyncMessage) => void): void {
    this.onSyncCallback = callback;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  public async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    await this.peerConnection.setRemoteDescription(answer);
  }

  public async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    await this.peerConnection.addIceCandidate(candidate);
  }

  public sendPlayCommand(currentTime: number): void {
    const message: SyncMessage = {
      type: 'play',
      timestamp: Date.now(),
      currentTime,
      isPlaying: true,
    };
    this.sendSyncMessage(message);
  }

  public sendPauseCommand(currentTime: number): void {
    const message: SyncMessage = {
      type: 'pause',
      timestamp: Date.now(),
      currentTime,
      isPlaying: false,
    };
    this.sendSyncMessage(message);
  }

  public sendSeekCommand(currentTime: number): void {
    const message: SyncMessage = {
      type: 'seek',
      timestamp: Date.now(),
      currentTime,
    };
    this.sendSyncMessage(message);
  }

  private sendIceCandidate(candidate: RTCIceCandidateInit, to: string): void {
    this.socket.sendIceCandidate(candidate, to);
  }

  public cleanup(): void {
    this.socket.offWebRTCEvents();
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.dataChannel = null;
    this.peerConnection = null;
    this.isConnected = false;
  }
}
