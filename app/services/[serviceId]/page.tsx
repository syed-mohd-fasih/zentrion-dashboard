"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState, use, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Activity, FileText, Shield, Loader2 } from "lucide-react";

import { useActivePolicies, usePolicyHistory, useServices, useTelemetryLogs } from "@/hooks/useData";

const tabs = [
	{ id: "overview", label: "Overview", icon: Activity },
	{ id: "logs", label: "Logs & Telemetry", icon: FileText },
	{ id: "policies", label: "Attached Policies", icon: Shield },
];

export default function ServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
	const { serviceId } = use(params);

	const [activeTab, setActiveTab] = useState("overview");

	const { data: servicesData, loading } = useServices();
	const { data: logsData } = useTelemetryLogs(50, serviceId);
	const { data: activePoliciesData, loading: policiesLoading } = useActivePolicies();
	const { data: historyData, loading: historyLoading } = usePolicyHistory();

	const service = servicesData?.services.find((s) => s.name === serviceId);

	const attachedPolicies = useMemo(() => {
		if (!service || !activePoliciesData?.policies) return [];
		return activePoliciesData.policies.filter(
			(p) => p.service === service.name && p.namespace === service.namespace
		);
	}, [service, activePoliciesData]);

	const relatedHistory = useMemo(() => {
		if (!historyData?.history || attachedPolicies.length === 0) return [];
		const ids = new Set(attachedPolicies.map((p) => p.draftId));
		return historyData.history.filter((h) => ids.has(h.policyId));
	}, [historyData, attachedPolicies]);

	if (loading) {
		return (
			<MainLayout>
				<div className="p-6 flex items-center gap-2 text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" /> Loading service details…
				</div>
			</MainLayout>
		);
	}

	if (!service) {
		return (
			<MainLayout>
				<div className="p-6 space-y-4">
					<Link href="/services">
						<Button variant="ghost" size="sm" className="rounded-lg">
							<ArrowLeft className="w-4 h-4 mr-2" /> Back to services
						</Button>
					</Link>
					<Card className="p-8 text-center">
						<p className="text-foreground font-semibold">Service not found</p>
						<p className="text-sm text-muted-foreground mt-1">No service named {serviceId} is known.</p>
					</Card>
				</div>
			</MainLayout>
		);
	}

	const getStatusColor = (errorRate: number) => {
		if (errorRate > 5) return "bg-red-500";
		return "bg-green-500";
	};

	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				{/* Header */}
				<div className="mb-8 flex items-center gap-4">
					<Link href="/services">
						<Button variant="ghost" size="icon" className="rounded-lg">
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</Link>
					<div>
						<p className="text-muted-foreground">Service Name:</p>
						<h1 className="text-4xl font-bold text-foreground">{service.name}</h1>
					</div>
				</div>

				{/* Status Bar */}
				<Card className="p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Status</p>
						<div className="flex items-center gap-2">
							<div className={`w-2 h-2 rounded-full ${getStatusColor(service.errorRate)}`} />
							<span className="font-semibold text-foreground">
								{service.errorRate > 5 ? "Degraded" : "Running"}
							</span>
						</div>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">RPS</p>
						<p className="font-semibold text-foreground">{service.requestsPerSecond}</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Error Rate</p>
						<p className="font-semibold text-foreground">{service.errorRate}%</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Last Seen</p>
						<p className="font-semibold text-foreground">
							{new Date(service.lastSeen).toLocaleString()}
						</p>
					</div>
				</Card>

				{/* Tabs */}
				<div className="mb-6 flex gap-2 border-b border-border overflow-x-auto">
					{tabs.map((tab) => {
						const TabIcon = tab.icon;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
									activeTab === tab.id
										? "text-primary border-primary"
										: "text-muted-foreground border-transparent hover:text-foreground"
								}`}
							>
								<TabIcon className="w-4 h-4" />
								{tab.label}
							</button>
						);
					})}
				</div>

				{/* Tab Content */}
				<Card className="p-8 space-y-6">
					{activeTab === "overview" && (
						<div className="space-y-6">
							<h3 className="text-lg font-semibold text-foreground mb-4">Service Health</h3>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								<div className="p-4 bg-card/50 rounded-lg">
									<p className="text-xs text-muted-foreground mb-1">Latency (avg)</p>
									<p className="text-2xl font-bold text-foreground">{service.avgLatency}ms</p>
								</div>
								<div className="p-4 bg-card/50 rounded-lg">
									<p className="text-xs text-muted-foreground mb-1">Namespace</p>
									<p className="text-2xl font-bold text-foreground">{service.namespace}</p>
								</div>
								<div className="p-4 bg-card/50 rounded-lg">
									<p className="text-xs text-muted-foreground mb-1">Dependencies</p>
									<p className="text-2xl font-bold text-foreground">
										{service.dependencies?.length ?? 0}
									</p>
								</div>
							</div>

							{service.dependencies && service.dependencies.length > 0 && (
								<div>
									<h3 className="text-lg font-semibold text-foreground mb-4">Depends on</h3>
									<div className="flex flex-wrap gap-2">
										{service.dependencies.map((dep) => (
											<Badge key={dep} variant="outline" className="rounded-lg">
												{dep}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === "logs" && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-foreground mb-4">Live Logs & Telemetry</h3>
							<div className="p-4 bg-card/50 rounded-lg font-mono text-xs text-muted-foreground space-y-2 max-h-96 overflow-y-auto">
								{logsData?.logs && logsData.logs.length > 0 ? (
									logsData.logs.map((log) => (
										<p key={log.id}>
											[{new Date(log.timestamp).toLocaleTimeString()}] {log.method} {log.path} -{" "}
											{log.status}
										</p>
									))
								) : (
									<p>No logs available yet for this service.</p>
								)}
							</div>
						</div>
					)}

					{activeTab === "policies" && (
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-foreground mb-4">Active policies</h3>
								{policiesLoading ? (
									<div className="flex items-center gap-2 text-muted-foreground text-sm">
										<Loader2 className="h-4 w-4 animate-spin" /> Loading policies…
									</div>
								) : attachedPolicies.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No applied AuthorizationPolicy exists for this service yet.
									</p>
								) : (
									<div className="space-y-4">
										{attachedPolicies.map((policy) => (
											<div
												key={policy.draftId}
												className="p-4 bg-card/50 rounded-lg border border-border space-y-2"
											>
												<div className="flex items-center justify-between flex-wrap gap-2">
													<p className="font-mono text-xs text-muted-foreground">
														{policy.draftId}
													</p>
													<Badge className="bg-green-500/10 text-green-700 border-green-500/20">
														Applied
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground">
													Approved by {policy.approvedBy ?? "—"} •{" "}
													{policy.appliedAt
														? new Date(policy.appliedAt).toLocaleString()
														: "not yet applied"}
												</p>
												<pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
													{policy.yamlContent}
												</pre>
											</div>
										))}
									</div>
								)}
							</div>

							<div>
								<h3 className="text-lg font-semibold text-foreground mb-4">Policy history</h3>
								{historyLoading ? (
									<div className="flex items-center gap-2 text-muted-foreground text-sm">
										<Loader2 className="h-4 w-4 animate-spin" /> Loading history…
									</div>
								) : relatedHistory.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No policy events recorded for this service.
									</p>
								) : (
									<div className="space-y-2">
										{relatedHistory.map((h) => (
											<div
												key={h.id}
												className="p-3 bg-card/50 rounded-lg border border-border"
											>
												<div className="flex items-center justify-between flex-wrap gap-2">
													<p className="font-medium text-foreground capitalize">{h.action}</p>
													<p className="text-xs text-muted-foreground">
														{new Date(h.timestamp).toLocaleString()}
													</p>
												</div>
												<p className="text-xs text-muted-foreground mt-1">
													{h.details} — by {h.userId}
												</p>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</Card>
			</div>
		</MainLayout>
	);
}
