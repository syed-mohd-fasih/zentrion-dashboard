/**
 * All API service functions organized by domain
 * Import and use anywhere in your components/pages
 */

import { apiClient } from "./client";
import type { User, AdminUser, UserRole, ParsedRequest, ServiceInfo, Anomaly, PolicyDraft, PolicyHistory, AuthorizationRule, SystemSetting, SandboxResult, LlmPolicyResponse, HealthResponse, ComplianceScore, ChatMessage } from "./types";

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
	 * Mark the onboarding tour as completed on the server.
	 */
	async completeTour() {
		return apiClient.post<{ firstLogin: boolean }>("/auth/tour-completed");
	},

	/**
	 * Self-edit username / email on the authenticated user.
	 */
	async updateProfile(patch: { username?: string; email?: string }) {
		return apiClient.patch<{ user: User }>("/auth/me", patch);
	},

	/**
	 * Change the authenticated user's password.
	 */
	async changePassword(currentPassword: string, newPassword: string) {
		return apiClient.post<{ ok: true }>("/auth/me/password", {
			currentPassword,
			newPassword,
		});
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
		return apiClient.get<{
			service: ServiceInfo | null;
			timestamp: string;
		}>(`/telemetry/services/${encodeURIComponent(name)}`);
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

	async resolveAnomaly(id: string) {
		return apiClient.patch<{ anomaly: Anomaly; timestamp: string }>(`/anomalies/${id}/resolve`);
	},

	async blockSourceIp(id: string) {
		return apiClient.post<{ draft: PolicyDraft; message: string; timestamp: string }>(`/anomalies/${id}/block-ip`);
	},

	async whitelistSource(id: string) {
		return apiClient.patch<{ anomaly: Anomaly; timestamp: string }>(`/anomalies/${id}/whitelist`);
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

	/**
	 * Run sandbox simulation for a policy draft
	 */
	async simulate(id: string, windowHours?: number) {
		const query = windowHours ? `?windowHours=${windowHours}` : "";
		return apiClient.post<{
			result: SandboxResult;
			timestamp: string;
		}>(`/policies/drafts/${id}/simulate${query}`);
	},

	/**
	 * Get LLM explanation for a policy draft (404 if not ready yet)
	 */
	async getExplanation(id: string) {
		return apiClient.get<{
			explanation: LlmPolicyResponse;
			timestamp: string;
		}>(`/policies/drafts/${id}/explain`);
	},

	async getComplianceScore() {
		return apiClient.get<ComplianceScore>("/policies/compliance");
	},

	async getChatHistory(id: string) {
		return apiClient.get<{ messages: ChatMessage[]; timestamp: string }>(
			`/policies/drafts/${id}/chat`,
		);
	},

	async streamChat(
		id: string,
		message: string,
		onEvent: (e: { token?: string; done?: boolean; error?: string }) => void,
		signal?: AbortSignal,
	) {
		return apiClient.streamSSE(
			`/policies/drafts/${id}/chat`,
			{ message },
			onEvent,
			signal,
		);
	},
};

// ============================================
// SETTINGS SERVICE
// ============================================

export const settingsService = {
	async getAll() {
		return apiClient.get<{
			settings: SystemSetting[];
			timestamp: string;
		}>("/settings");
	},

	async update(key: string, value: string) {
		return apiClient.patch<{
			setting: SystemSetting;
			timestamp: string;
		}>("/settings", { key, value });
	},
};

// ============================================
// USERS SERVICE (admin-gated CRUD)
// ============================================

export const usersService = {
	async list() {
		return apiClient.get<{ users: AdminUser[] }>("/users");
	},
	async create(dto: { username: string; password: string; role: UserRole; email?: string }) {
		return apiClient.post<{ user: AdminUser }>("/users", dto);
	},
	async update(id: string, dto: { username?: string; email?: string; role?: UserRole }) {
		return apiClient.patch<{ user: AdminUser }>(`/users/${id}`, dto);
	},
	async delete(id: string) {
		return apiClient.delete<{ ok: true }>(`/users/${id}`);
	},
	async resetPassword(id: string, password: string) {
		return apiClient.post<{ ok: true }>(`/users/${id}/reset-password`, { password });
	},
};

// ============================================
// HEALTH SERVICE
// ============================================

export const healthService = {
	async check() {
		return apiClient.get<HealthResponse>("/health", false);
	},
};
