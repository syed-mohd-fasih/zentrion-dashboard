/**
 * AuthProvider
 * Wrap your app with this to provide authentication context
 * Automatically checks auth status on mount
 */

"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { checkAuth } = useAuth();

	useEffect(() => {
		// Check if user is authenticated on mount
		checkAuth();
	}, [checkAuth]);

	return <>{children}</>;
}
