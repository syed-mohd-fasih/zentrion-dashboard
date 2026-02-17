/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useAuth Hook
 * Manages authentication state and provides login/logout functions
 * Usage: const { user, loading, login, logout, isAuthenticated } = useAuth();
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/lib/api/services";
import type { User } from "@/lib/api/types";

interface AuthState {
	user: User | null;
	loading: boolean;
	error: string | null;
	isAuthenticated: boolean;

	// Actions
	login: (username: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
	clearError: () => void;
}

/**
 * Zustand store for auth state
 * Persists to localStorage automatically
 */
export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			loading: false,
			error: null,
			isAuthenticated: false,

			login: async (username: string, password: string) => {
				set({ loading: true, error: null });

				try {
					const response = await authService.login(username, password);

					set({
						user: response.user,
						isAuthenticated: true,
						loading: false,
						error: null,
					});
				} catch (error: any) {
					set({
						user: null,
						isAuthenticated: false,
						loading: false,
						error: error.message || "Login failed",
					});
					throw error;
				}
			},

			logout: async () => {
				try {
					await authService.logout();
				} catch (error) {
					console.error("Logout error:", error);
				} finally {
					set({
						user: null,
						isAuthenticated: false,
						loading: false,
						error: null,
					});
				}
			},

			checkAuth: async () => {
				if (!authService.isAuthenticated()) {
					set({ user: null, isAuthenticated: false, loading: false });
					return;
				}

				set({ loading: true });

				try {
					const response = await authService.getMe();
					set({
						user: response.user,
						isAuthenticated: true,
						loading: false,
					});
				} catch (error) {
					// Token invalid/expired
					set({
						user: null,
						isAuthenticated: false,
						loading: false,
					});
					authService.logout(); // Clear invalid token
				}
			},

			clearError: () => set({ error: null }),
		}),
		{
			name: "auth-storage",
			// Only persist user and isAuthenticated, not loading/error
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);

/**
 * Convenience hook with same interface
 */
export function useAuth() {
	return useAuthStore();
}
