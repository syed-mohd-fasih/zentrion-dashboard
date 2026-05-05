/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Data fetching hooks with automatic loading/error states
 * Uses React Query-like patterns with useState/useEffect
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { telemetryService, anomalyService, policyService, settingsService } from "@/lib/api/services";
// import type { ParsedRequest, ServiceInfo, Anomaly, PolicyDraft, PolicyHistory } from "@/lib/api/types";

interface UseDataResult<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

/**
 * Generic hook for data fetching
 */
function useData<T>(fetchFn: () => Promise<T>, deps: any[] = []): UseDataResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await fetchFn();
			setData(result);
		} catch (err: any) {
			setError(err.message || "Failed to fetch data");
			console.error("Data fetch error:", err);
		} finally {
			setLoading(false);
		}
	}, [fetchFn]);

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return { data, loading, error, refetch: fetchData };
}

// ============================================
// TELEMETRY HOOKS
// ============================================

export function useTelemetryLogs(limit?: number, service?: string) {
	return useData(() => telemetryService.getLiveLogs({ limit, service }), [limit, service]);
}

export function useServices() {
	return useData(() => telemetryService.getServices(), []);
}

export function useService(name: string) {
	return useData(() => telemetryService.getService(name), [name]);
}

// ============================================
// ANOMALY HOOKS
// ============================================

export function useAnomalies(limit?: number) {
	return useData(() => anomalyService.getAll(limit), [limit]);
}

export function useAnomaly(id: string) {
	return useData(() => anomalyService.getById(id), [id]);
}

export function useServiceAnomalies(service: string) {
	return useData(() => anomalyService.getByService(service), [service]);
}

// ============================================
// POLICY HOOKS
// ============================================

export function useActivePolicies() {
	return useData(() => policyService.getActive(), []);
}

export function usePolicyDrafts() {
	return useData(() => policyService.getAllDrafts(), []);
}

export function usePendingDrafts() {
	return useData(() => policyService.getPendingDrafts(), []);
}

export function usePolicyDraft(id: string) {
	return useData(() => policyService.getDraft(id), [id]);
}

export function usePolicyHistory(policyId?: string) {
	return useData(() => policyService.getHistory(policyId), [policyId]);
}

// ============================================
// REAL-TIME DATA HOOK (with polling)
// ============================================

/**
 * Hook that polls data at an interval
 * Useful for data that needs to stay fresh
 */
export function usePolling<T>(
	fetchFn: () => Promise<T>,
	interval: number = 5000,
	enabled: boolean = true
): UseDataResult<T> {
	const result = useData(fetchFn, []);

	useEffect(() => {
		if (!enabled) return;

		const timer = setInterval(() => {
			result.refetch();
		}, interval);

		return () => clearInterval(timer);
	}, [enabled, interval, result]);

	return result;
}

// ============================================
// MUTATION HOOKS (for write operations)
// ============================================

interface UseMutationResult<TData, TVariables> {
	mutate: (variables: TVariables) => Promise<TData>;
	loading: boolean;
	error: string | null;
	data: TData | null;
	reset: () => void;
}

function useMutation<TData, TVariables>(
	mutationFn: (variables: TVariables) => Promise<TData>
): UseMutationResult<TData, TVariables> {
	const [data, setData] = useState<TData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mutate = async (variables: TVariables) => {
		setLoading(true);
		setError(null);

		try {
			const result = await mutationFn(variables);
			setData(result);
			return result;
		} catch (err: any) {
			const errorMsg = err.message || "Mutation failed";
			setError(errorMsg);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const reset = () => {
		setData(null);
		setError(null);
		setLoading(false);
	};

	return { mutate, loading, error, data, reset };
}

// ============================================
// SETTINGS HOOKS
// ============================================

export function useSettings() {
	return useData(() => settingsService.getAll(), []);
}

export function useUpdateSetting() {
	return useMutation(({ key, value }: { key: string; value: string }) =>
		settingsService.update(key, value)
	);
}

// AI-specific policy hooks
export function usePolicyExplanation(draftId: string | null) {
	return useData(
		() => draftId ? policyService.getExplanation(draftId) : Promise.resolve(null),
		[draftId]
	);
}

export function useSimulateDraft() {
	return useMutation(({ id, windowHours }: { id: string; windowHours?: number }) =>
		policyService.simulate(id, windowHours)
	);
}

// Policy mutations
export function useCreatePolicyDraft() {
	return useMutation(policyService.createDraft);
}

export function useGeneratePolicyFromAnomaly() {
	return useMutation((anomalyId: string) => policyService.generateFromAnomaly(anomalyId));
}

export function useApprovePolicyDraft() {
	return useMutation(({ id, notes }: { id: string; notes?: string }) => policyService.approveDraft(id, notes));
}

export function useRejectPolicyDraft() {
	return useMutation(({ id, reason }: { id: string; reason: string }) => policyService.rejectDraft(id, reason));
}
