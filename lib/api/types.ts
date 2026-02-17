/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TypeScript types matching the backend API
 * Keep in sync with backend types
 */

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
	id: string;
	username: string;
	role: "ADMIN" | "ANALYST" | "VIEWER";
	email: string;
	createdAt: string;
}

export interface JwtPayload {
	sub: string;
	username: string;
	role: string;
}

// ============================================
// TELEMETRY TYPES
// ============================================

export interface ParsedRequest {
	id: string;
	timestamp: string;
	source: string;
	sourceIp: string;
	method: string;
	path: string;
	status: number;
	latencyMs: number;
	service: string;
	destService?: string;
	userAgent?: string;
	requestSize?: number;
	responseSize?: number;
}

export interface ServiceInfo {
	name: string;
	namespace: string;
	requestsPerSecond: number;
	errorRate: number;
	avgLatency: number;
	lastSeen: string;
	dependencies: string[];
	labels: Record<string, string>;
}

// ============================================
// ANOMALY TYPES
// ============================================

export type AnomalyType =
	| "UNUSUAL_SOURCE"
	| "UNEXPECTED_COMMUNICATION"
	| "NEW_ENDPOINT"
	| "HIGH_ERROR_RATE"
	| "TRAFFIC_SPIKE"
	| "SUSPICIOUS_PATTERN"
	| "LATENCY_ANOMALY"
	| "UNAUTHORIZED_ACCESS";

export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export interface Anomaly {
	id: string;
	timestamp: string;
	service: string;
	type: AnomalyType;
	severity: AnomalySeverity;
	details: string;
	associatedLogs: string[];
	suggestedPolicyDraftId?: string;
	metadata?: Record<string, any>;
}

// ============================================
// POLICY TYPES
// ============================================

export type PolicyStatus = "pending" | "approved" | "rejected" | "applied";

export interface PolicyDraft {
	id: string;
	createdAt: string;
	createdBy: string;
	service: string;
	namespace: string;
	yaml: string;
	status: PolicyStatus;
	reason: string;
	appliedAt?: string;
	approvedBy?: string;
	rejectedBy?: string;
	rejectionReason?: string;
	anomalyId?: string;
}

export interface PolicyHistory {
	id: string;
	policyId: string;
	action: "created" | "approved" | "rejected" | "applied" | "deleted";
	timestamp: string;
	userId: string;
	details: string;
	metadata?: Record<string, any>;
}

export interface AuthorizationRule {
	from?: {
		source?: {
			principals?: string[];
			namespaces?: string[];
			ipBlocks?: string[];
		};
	};
	to?: {
		operation?: {
			methods?: string[];
			paths?: string[];
			ports?: string[];
		};
	};
	when?: Array<{
		key: string;
		values: string[];
	}>;
}

// ============================================
// WEBSOCKET EVENT TYPES
// ============================================

export interface WebSocketEvents {
	"telemetry.log": ParsedRequest;
	"service.update": Partial<ServiceInfo> & { name: string };
	"anomaly.created": Anomaly;
	"policy.draft": PolicyDraft;
	"policy.applied": PolicyDraft;
}

// ============================================
// API RESPONSE WRAPPERS
// ============================================

export interface ApiResponse<T> {
	data?: T;
	error?: {
		message: string;
		status: number;
	};
}
