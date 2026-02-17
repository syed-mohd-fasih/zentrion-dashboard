/**
 * SocketProvider
 * Initializes WebSocket connection when user is authenticated
 * Disconnects on logout
 */

"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { socketClient } from "@/lib/socket/client";

export function SocketProvider({ children }: { children: React.ReactNode }) {
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			// Connect socket when authenticated
			console.log("🔌 Connecting WebSocket...");
			socketClient.connect();
		} else {
			// Disconnect when logged out
			console.log("🔌 Disconnecting WebSocket...");
			socketClient.disconnect();
		}

		return () => {
			// Clean up on unmount
			socketClient.disconnect();
		};
	}, [isAuthenticated]);

	return <>{children}</>;
}
