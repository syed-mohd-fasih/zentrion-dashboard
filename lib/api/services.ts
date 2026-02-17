/**
 * All API service functions organized by domain
 * Import and use anywhere in your components/pages
 */

import { apiClient } from "./client";
import type { User, ParsedRequest, ServiceInfo, Anomaly, PolicyDraft, PolicyHistory, AuthorizationRule } from "./types";

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
	/**
	 * Login with username and password
	 */
	async login(username: string, password: string) {
		const response = await apiClient.post<{
			accessToken: string;
			user: User;
		}>("/auth/login", { username, password }, false);

		// Store token in localStorage
		if (typeof window !== "undefined") {
			localStorage.setItem("auth_token", response.accessToken);
		}

		return response;
	},

	/**
	 * Get current user profile
	 */
	async getMe() {
		return apiClient.get<{ user: User }>("/auth/me");
	},

	/**
	 * Logout (clears token)
	 */
	async logout() {
		const response = await apiClient.post<{ message: string }>("/auth/logout");

		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_token");
		}

		return response;
	},

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		if (typeof window === "undefined") return false;
		return !!localStorage.getItem("auth_token");
	},

	/**
	 * Get stored token
	 */
	getToken(): string | null {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("auth_token");
	},
};

// ============================================
// TELEMETRY SERVICE
// ============================================

export const telemetryService = {
	/**
	 * Get live telemetry logs
	 */
	async getLiveLogs(params?: { limit?: number; service?: string }) {
		const query = apiClient.buildQueryString(params || {});
		return apiClient.get<{
			logs: ParsedRequest[];
			timestamp: string;
		}>(`/telemetry/live${query}`);
	},

	/**
	 * Get all services
	 */
	async getServices() {
		return apiClient.get<{
			services: ServiceInfo[];
			timestamp: string;
		}>("/telemetry/services");
	},

	/**
	 * Get specific service details
	 */
	async getService(name: string) {
		const query = apiClient.buildQueryString({ name });
		return apiClient.get<{
			service: ServiceInfo;
			timestamp: string;
		}>(`/telemetry/services${query}`);
	},
};

// ============================================
// ANOMALY SERVICE
// ============================================

export const anomalyService = {
	/**
	 * Get all anomalies
	 */
	async getAll(limit?: number) {
		const query = apiClient.buildQueryString({ limit });
		return apiClient.get<{
			anomalies: Anomaly[];
			timestamp: string;
		}>(`/anomalies${query}`);
	},

	/**
	 * Get specific anomaly by ID
	 */
	async getById(id: string) {
		return apiClient.get<{
			anomaly: Anomaly;
			timestamp: string;
		}>(`/anomalies/${id}`);
	},

	/**
	 * Get anomalies for a specific service
	 */
	async getByService(service: string) {
		return apiClient.get<{
			anomalies: Anomaly[];
			service: string;
			timestamp: string;
		}>(`/anomalies/service/${service}`);
	},
};

// ============================================
// POLICY SERVICE
// ============================================

export const policyService = {
	/**
	 * Get active (applied) policies
	 */
	async getActive() {
		return apiClient.get<{
			policies: PolicyDraft[];
			timestamp: string;
		}>("/policies/active");
	},

	/**
	 * Get all policy drafts
	 */
	async getAllDrafts() {
		return apiClient.get<{
			drafts: PolicyDraft[];
			timestamp: string;
		}>("/policies/drafts");
	},

	/**
	 * Get pending policy drafts
	 */
	async getPendingDrafts() {
		return apiClient.get<{
			drafts: PolicyDraft[];
			timestamp: string;
		}>("/policies/drafts/pending");
	},

	/**
	 * Get specific policy draft
	 */
	async getDraft(id: string) {
		return apiClient.get<{
			draft: PolicyDraft;
			timestamp: string;
		}>(`/policies/drafts/${id}`);
	},

	/**
	 * Create a new policy draft
	 */
	async createDraft(params: {
		service: string;
		namespace: string;
		rules: AuthorizationRule[];
		reason: string;
		anomalyId?: string;
	}) {
		return apiClient.post<{
			draft: PolicyDraft;
			message: string;
		}>("/policies/drafts", params);
	},

	/**
	 * Generate policy draft from an anomaly
	 */
	async generateFromAnomaly(anomalyId: string) {
		return apiClient.post<{
			draft: PolicyDraft;
			message: string;
		}>("/policies/drafts/from-anomaly", { anomalyId });
	},

	/**
	 * Approve a policy draft (ADMIN only)
	 */
	async approveDraft(id: string, notes?: string) {
		return apiClient.post<{
			draft: PolicyDraft;
			message: string;
		}>(`/policies/drafts/${id}/approve`, { notes });
	},

	/**
	 * Reject a policy draft
	 */
	async rejectDraft(id: string, reason: string) {
		return apiClient.post<{
			draft: PolicyDraft;
			message: string;
		}>(`/policies/drafts/${id}/reject`, { reason });
	},

	/**
	 * Get policy history (audit trail)
	 */
	async getHistory(policyId?: string) {
		const endpoint = policyId ? `/policies/history/${policyId}` : "/policies/history";

		return apiClient.get<{
			history: PolicyHistory[];
			policyId?: string;
			timestamp: string;
		}>(endpoint);
	},
};

// ============================================
// HEALTH SERVICE
// ============================================

export const healthService = {
	/**
	 * Check API health
	 */
	async check() {
		return apiClient.get<{
			status: string;
			timestamp: string;
			service: string;
			version: string;
		}>("/health", false);
	},
};
