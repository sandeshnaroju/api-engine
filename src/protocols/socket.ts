// protocols/socket.ts

import { Endpoint } from '../schemas/manifest';
import WS from 'ws'; // Add this at the top

const WS_CONST = typeof WebSocket !== 'undefined' ? WebSocket : WS;

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
  ) {}

  public connect() {
    if (this.socket?.readyState === WS_CONST.OPEN) return;

    this.socket = new (typeof WebSocket !== 'undefined' ? WebSocket : WS)(this.url) as any;

    this.socket.onopen = () => {
      this.retryCount = 0;
      this.startHeartbeat();
      console.log(`Connected: ${this.url}`);
    };

    this.socket.onmessage = (event) => {
      // Direct delivery: parse and send straight to subscribers
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        this.subscribers.forEach(cb => cb(data));
      } catch (e) {
        this.subscribers.forEach(cb => cb(event.data)); // Send raw if not JSON
      }
    };

    this.socket.onclose = (e) => {
      this.stopHeartbeat();
      if (this.endpoint.autoReconnect && e.code !== 1000) {
        this.reconnect();
      }
    };
  }

  private reconnect() {
    const max = this.endpoint.maxRetries || 5;
    if (this.retryCount >= max) return;

    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    this.retryCount++;

    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WS_CONST.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.endpoint.pingInterval || 30000);
  }

  private stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.reconnectTimer);
  }

  public subscribe(callback: (data: any) => void) {
    this.subscribers.add(callback);
    if (this.socket?.readyState !== WS_CONST.OPEN) this.connect();
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.close(); // Close connection if no one is listening
      }
    };
  }

  public send(data: any) {
    if (this.socket?.readyState === WS_CONST.OPEN) {
      this.socket.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  public close() {
    this.stopHeartbeat();
    this.socket?.close(1000);
    this.socket = null;
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