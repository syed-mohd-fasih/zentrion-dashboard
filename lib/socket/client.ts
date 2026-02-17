/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Socket.IO client singleton
 * Manages connection lifecycle and reconnection
 */

import { io, Socket } from "socket.io-client";
import type { WebSocketEvents } from "../api/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ServerToClientEvents = WebSocketEvents;
type ClientToServerEvents = Record<string, any>;

class SocketClient {
	private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
	private connected = false;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;

	/**
	 * Initialize socket connection
	 * Should be called once in app lifecycle
	 */
	connect(): Socket<ServerToClientEvents, ClientToServerEvents> {
		if (this.socket?.connected) {
			return this.socket;
		}

		this.socket = io(SOCKET_URL, {
			transports: ["websocket", "polling"],
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: this.maxReconnectAttempts,
		}) as Socket<ServerToClientEvents, ClientToServerEvents>;

		this.setupEventHandlers();
		return this.socket;
	}

	/**
	 * Setup connection event handlers
	 */
	private setupEventHandlers() {
		if (!this.socket) return;

		this.socket.on("connect", () => {
			console.log("✅ Socket.IO connected:", this.socket?.id);
			this.connected = true;
			this.reconnectAttempts = 0;
		});

		this.socket.on("disconnect", (reason: string) => {
			console.log("❌ Socket.IO disconnected:", reason);
			this.connected = false;

			// Auto-reconnect on server disconnect
			if (reason === "io server disconnect") {
				this.socket?.connect();
			}
		});

		this.socket.on("connect_error", (error: { message: any }) => {
			console.error("🔴 Socket.IO connection error:", error.message);
			this.reconnectAttempts++;

			if (this.reconnectAttempts >= this.maxReconnectAttempts) {
				console.error("Max reconnection attempts reached. Giving up.");
			}
		});

		this.socket.on("reconnect" as any, (attemptNumber: any) => {
			console.log(`🔄 Socket.IO reconnected after ${attemptNumber} attempts`);
			this.reconnectAttempts = 0;
		});

		this.socket.on("reconnect_attempt" as any, (attemptNumber: any) => {
			console.log(`🔄 Socket.IO reconnect attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
		});

		this.socket.on("reconnect_failed" as any, () => {
			console.error("❌ Socket.IO reconnection failed");
		});
	}

	/**
	 * Subscribe to a typed event
	 */
	on<K extends keyof ServerToClientEvents>(event: K, callback: (data: ServerToClientEvents[K]) => void): () => void {
		if (!this.socket) {
			console.warn(`Cannot subscribe to ${event}: Socket not initialized`);
			return () => {};
		}

		this.socket.on(event, callback as any);

		return () => {
			this.socket?.off(event, callback as any);
		};
	}

	/**
	 * Subscribe to event once
	 */
	once<K extends keyof ServerToClientEvents>(event: K, callback: (data: ServerToClientEvents[K]) => void): void {
		if (!this.socket) {
			console.warn(`Cannot subscribe to ${event}: Socket not initialized`);
			return;
		}

		this.socket.once(event, callback as any);
	}

	/**
	 * Unsubscribe from event
	 */
	off<K extends keyof ServerToClientEvents>(event: K, callback?: (data: ServerToClientEvents[K]) => void): void {
		if (!this.socket) return;

		if (callback) {
			this.socket.off(event, callback as any);
		} else {
			this.socket.off(event);
		}
	}

	/**
	 * Emit an event (if you need client->server events)
	 */
	emit(event: string, data?: any): void {
		if (!this.socket) {
			console.warn(`Cannot emit ${event}: Socket not initialized`);
			return;
		}

		this.socket.emit(event, data);
	}

	/**
	 * Disconnect socket
	 */
	disconnect(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
			this.connected = false;
		}
	}

	/**
	 * Get connection status
	 */
	isConnected(): boolean {
		return this.connected && !!this.socket?.connected;
	}

	/**
	 * Get socket instance (use with caution)
	 */
	getSocket(): Socket | null {
		return this.socket;
	}
}

// Singleton instance
export const socketClient = new SocketClient();
