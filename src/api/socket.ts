import { io, type Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(url = 'http://localhost:3000'): Socket {
    if (!this.socket) {
      this.socket = io(url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('소켓 서버에 연결되었습니다.');
      });

      this.socket.on('disconnect', () => {
        console.log('소켓 서버와의 연결이 끊어졌습니다.');
      });

      this.socket.on('connect_error', (error) => {
        console.error('소켓 연결 오류:', error);
      });
    }

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public emit<T>(event: string, data?: T): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  public on<T>(event: string, callback: (data: T) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

// 웹소켓 서비스 싱글턴 인스턴스 내보내기
export const socketService = SocketService.getInstance();
