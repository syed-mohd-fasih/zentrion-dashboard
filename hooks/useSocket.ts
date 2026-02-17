/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * useSocket Hook
 * Manages WebSocket connection and provides type-safe event subscription
 * Usage: const { connected, subscribe } = useSocket();
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { socketClient } from "@/lib/socket/client";
import type { WebSocketEvents } from "@/lib/api/types";

export function useSocket() {
	const [connected, setConnected] = useState(false);
	const socketRef = useRef(socketClient);

	useEffect(() => {
		// Connect socket on mount
		const socket = socketRef.current.connect();

		// Update connection status
		const checkConnection = () => {
			setConnected(socketRef.current.isConnected());
		};

		// Check every second
		const interval = setInterval(checkConnection, 1000);
		checkConnection(); // Initial check

		return () => {
			clearInterval(interval);
			// Don't disconnect here - socket persists across component mounts
		};
	}, []);

	/**
	 * Subscribe to a typed event
	 * Returns unsubscribe function
	 */
	const subscribe = useCallback(
		<K extends keyof WebSocketEvents>(event: K, callback: (data: WebSocketEvents[K]) => void) => {
			return socketRef.current.on(event, callback);
		},
		[]
	);

	/**
	 * Subscribe once
	 */
	const subscribeOnce = useCallback(
		<K extends keyof WebSocketEvents>(event: K, callback: (data: WebSocketEvents[K]) => void) => {
			socketRef.current.once(event, callback);
		},
		[]
	);

	/**
	 * Unsubscribe from event
	 */
	const unsubscribe = useCallback(
		<K extends keyof WebSocketEvents>(event: K, callback?: (data: WebSocketEvents[K]) => void) => {
			socketRef.current.off(event, callback);
		},
		[]
	);

	return {
		connected,
		subscribe,
		subscribeOnce,
		unsubscribe,
	};
}

/**
 * Hook to subscribe to a specific event
 * Automatically unsubscribes on unmount
 */
export function useSocketEvent<K extends keyof WebSocketEvents>(
	event: K,
	callback: (data: WebSocketEvents[K]) => void,
	deps: React.DependencyList = []
) {
	const { subscribe } = useSocket();

	useEffect(() => {
		const unsubscribe = subscribe(event, callback);
		return unsubscribe;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event, subscribe, ...deps]);
}
