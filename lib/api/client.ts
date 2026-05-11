/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Base API client with auth token handling
 * Automatically attaches JWT token from localStorage to all requests
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
	constructor(message: string, public status: number, public response?: any) {
		super(message);
		this.name = "ApiError";
	}
}

class ApiClient {
	private axios: AxiosInstance;

	constructor(baseUrl: string = API_BASE_URL) {
		this.axios = axios.create({
			baseURL: baseUrl,
			headers: {
				"Content-Type": "application/json",
			},
		});

		/**
		 * Request interceptor
		 * Automatically attach auth token
		 */
		this.axios.interceptors.request.use((config) => {
			const token = this.getToken();
			if (token && config.headers) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			console.log("Outgoing request:", config.url, config.data);
			return config;
		});

		/**
		 * Response interceptor
		 * Normalize errors into ApiError
		 */
		this.axios.interceptors.response.use(
			(response: AxiosResponse) => response,
			(error: AxiosError) => {
				// Axios errors with a response
				if (error.response) {
					const data: any = error.response.data;
					return Promise.reject(new ApiError(data?.message || "Request failed", error.response.status, data));
				}

				// Network / unknown errors
				return Promise.reject(new ApiError(error.message || "Network error", 0));
			}
		);
	}

	/**
	 * Get auth token from localStorage
	 * Returns null if not found or in SSR context
	 */
	private getToken(): string | null {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("auth_token");
	}

	/**
	 * Generic request handler
	 */
	private async request<T>(endpoint: string, config: AxiosRequestConfig = {}, includeAuth = true): Promise<T> {
		// Disable auth header if requested
		if (!includeAuth && config.headers) {
			delete (config.headers as any)?.Authorization;
		}

		const response = await this.axios.request<T>({
			url: endpoint,
			...config,
		});

		// Handle empty responses (e.g., 204)
		if (response.status === 204 || response.data === "") {
			return {} as T;
		}

		return response.data;
	}

	/**
	 * GET request
	 */
	async get<T>(endpoint: string, includeAuth = true): Promise<T> {
		return this.request<T>(endpoint, { method: "GET" }, includeAuth);
	}

	/**
	 * POST request
	 */
	async post<T>(endpoint: string, body?: any, includeAuth = true): Promise<T> {
		return this.request<T>(
			endpoint,
			{
				method: "POST",
				data: body ? JSON.stringify(body) : undefined,
			},
			includeAuth
		);
	}

	/**
	 * PUT request
	 */
	async put<T>(endpoint: string, body?: any, includeAuth = true): Promise<T> {
		return this.request<T>(
			endpoint,
			{
				method: "PUT",
				data: body ? JSON.stringify(body) : undefined,
			},
			includeAuth
		);
	}

	/**
	 * PATCH request
	 */
	async patch<T>(endpoint: string, body?: any, includeAuth = true): Promise<T> {
		return this.request<T>(
			endpoint,
			{
				method: "PATCH",
				data: body ? JSON.stringify(body) : undefined,
			},
			includeAuth
		);
	}

	/**
	 * DELETE request
	 */
	async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
		return this.request<T>(endpoint, { method: "DELETE" }, includeAuth);
	}

	/**
	 * Stream a Server-Sent Events response. Each `data: {...}` line is parsed
	 * as JSON and passed to `onEvent`. Resolves when the stream closes.
	 */
	async streamSSE(
		endpoint: string,
		body: any,
		onEvent: (e: { token?: string; done?: boolean; error?: string }) => void,
		signal?: AbortSignal,
	): Promise<void> {
		const token = this.getToken();
		const res = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "text/event-stream",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: JSON.stringify(body),
			signal,
		});

		if (!res.ok) {
			const text = await res.text().catch(() => "");
			throw new ApiError(text || `Stream failed (${res.status})`, res.status);
		}
		if (!res.body) throw new ApiError("No response body for SSE stream", 0);

		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let buf = "";
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buf += decoder.decode(value, { stream: true });
			let nl: number;
			while ((nl = buf.indexOf("\n")) !== -1) {
				const line = buf.slice(0, nl).trimEnd();
				buf = buf.slice(nl + 1);
				if (!line || !line.startsWith("data:")) continue;
				const payload = line.slice(5).trim();
				if (!payload) continue;
				try {
					onEvent(JSON.parse(payload));
				} catch {
					// ignore malformed lines
				}
			}
		}
	}

	/**
	 * Build query string from params object
	 */
	buildQueryString(params: Record<string, any>): string {
		const filtered = Object.entries(params)
			.filter(([_, value]) => value !== undefined && value !== null)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		return filtered ? `?${filtered}` : "";
	}
}

// Singleton instance
export const apiClient = new ApiClient();
