// protocols/socket.ts

import { Endpoint } from '../schemas/manifest';

export class SocketManager {
  private socket: WebSocket | null = null;
  private subscribers = new Set<(data: any) => void>();
  private retryCount = 0;
  private reconnectTimer: any;
  private heartbeatTimer: any;

  constructor(
    private endpoint: {
      path: string;
      autoReconnect?: boolean;
      maxRetries?: number;
      pingInterval?: number
    },
    private url: string
  ) { }

  public connect() {
    // Basic browser guard
    if (typeof window === 'undefined') {
      console.error("APIEngine: WebSockets are only supported in the browser environment.");
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) return;

    // Use native browser WebSocket directly
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.retryCount = 0;
      this.startHeartbeat();
      console.log(`[WS] Connected: ${this.url}`);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        this.subscribers.forEach(cb => cb(data));
      } catch (e) {
        this.subscribers.forEach(cb => cb(event.data));
      }
    };

    this.socket.onclose = (e) => {
      this.stopHeartbeat();
      // Code 1000 is a normal closure; don't reconnect if we intentionally closed it
      if (this.endpoint.autoReconnect && e.code !== 1000) {
        this.reconnect();
      }
    };

    this.socket.onerror = (err) => {
      console.error(`[WS] Error:`, err);
    };
  }

  private reconnect() {
    const max = this.endpoint.maxRetries || 5;
    if (this.retryCount >= max) {
      console.warn(`[WS] Max reconnection attempts reached for ${this.url}`);
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s... up to 30s
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    this.retryCount++;

    console.log(`[WS] Reconnecting in ${delay}ms... (Attempt ${this.retryCount}/${max})`);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private startHeartbeat() {
    if (!this.endpoint.pingInterval) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        // Generic ping - modify based on your server's expectations
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.endpoint.pingInterval);
  }

  private stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.reconnectTimer);
  }

  public subscribe(callback: (data: any) => void) {
    this.subscribers.add(callback);

    // Auto-connect if this is the first subscriber
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect();
    }

    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.close();
      }
    };
  }

  public send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(payload);
    } else {
      console.warn("[WS] Cannot send message: Connection is not open.");
    }
  }

  public close() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.onclose = null; // Prevent reconnect loop during intentional close
      this.socket.close(1000);
      this.socket = null;
    }
    console.log(`[WS] Connection closed: ${this.url}`);
  }
}
export interface SocketConnection {
  send: (data: any) => void;
  subscribe: (callback: (data: any) => void) => () => void;
  close: () => void;
}

export const createSocketAdapter = (baseUrl: string) => {
  const managers = new Map<string, SocketManager>();

  return (endpoint: Endpoint) => {
    if (endpoint.protocol !== 'WS') throw new Error('Invalid Protocol');

    const fullUrl = `${baseUrl.replace('http', 'ws')}${endpoint.path}`;

    if (!managers.has(fullUrl)) {
      managers.set(fullUrl, new SocketManager(endpoint, fullUrl));
    }

    return managers.get(fullUrl)!;
  };
};