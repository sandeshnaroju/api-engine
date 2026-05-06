import { Endpoint } from '../schemas/manifest';
export declare class SocketManager {
    private endpoint;
    private url;
    private socket;
    private subscribers;
    private retryCount;
    private reconnectTimer;
    private heartbeatTimer;
    constructor(endpoint: {
        path: string;
        autoReconnect?: boolean;
        maxRetries?: number;
        pingInterval?: number;
    }, url: string);
    connect(): void;
    private reconnect;
    private startHeartbeat;
    private stopHeartbeat;
    subscribe(callback: (data: any) => void): () => void;
    send(data: any): void;
    close(): void;
}
export interface SocketConnection {
    send: (data: any) => void;
    subscribe: (callback: (data: any) => void) => () => void;
    close: () => void;
}
export declare const createSocketAdapter: (baseUrl: string) => (endpoint: Endpoint) => SocketManager;
