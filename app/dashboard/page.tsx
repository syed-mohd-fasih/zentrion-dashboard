"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ServiceHealthChart } from "@/components/dashboard/service-health-chart";
import { TrafficVolumeChart } from "@/components/dashboard/traffic-volume-chart";
import { Activity, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSocketEvent } from "@/hooks/useSocket";
import { useServices, useComplianceScore, useTelemetryLogs } from "@/hooks/useData";
import type { ParsedRequest } from "@/lib/api/types";

export default function DashboardPage() {
	const [recentLogs, setRecentLogs] = useState<ParsedRequest[]>([]);
	const { data: servicesData, loading } = useServices();
	const { data: complianceData, loading: complianceLoading } = useComplianceScore();
	const { data: historicalLogs } = useTelemetryLogs(50);

	useEffect(() => {
		if (historicalLogs?.logs?.length) {
			setRecentLogs((prev) => (prev.length === 0 ? historicalLogs.logs : prev));
		}
	}, [historicalLogs]);

	const totalLogsProcessed = recentLogs.length;
	const anomaliesDetected = recentLogs.filter((log) => log.status >= 400).length;

	const complianceScore = complianceData?.score;
	const complianceSummary = complianceData?.summary;

	useSocketEvent("telemetry.log", (log) => {
		setRecentLogs((prev) => [log, ...prev].slice(0, 50));
	});

	return (
		<TooltipProvider>
			<MainLayout>
				<div className="p-6 space-y-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
						<p className="text-muted-foreground mt-1">System overview and key metrics</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column */}
						<div className="lg:col-span-2 space-y-6">
							{/* Stats Cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								<StatsCard
									title="Live Logs Seen"
									value={totalLogsProcessed.toString()}
									subtitle="Streaming via WebSocket"
									icon={<Activity className="w-5 h-5" />}
								/>
								<StatsCard
									title="4xx/5xx Responses"
									value={anomaliesDetected.toString()}
									subtitle="In live stream"
									icon={<AlertTriangle className="w-5 h-5" />}
								/>
								<Tooltip>
									<TooltipTrigger asChild>
										<div>
											<StatsCard
												title="Policy Compliance Score"
												value={
													complianceLoading
														? "…"
														: complianceScore !== null && complianceScore !== undefined
														? `${complianceScore}%`
														: "N/A"
												}
												subtitle={
													complianceLoading
														? "Asking AI…"
														: complianceSummary ?? "AI offline"
												}
												icon={<CheckCircle2 className="w-5 h-5" />}
											/>
										</div>
									</TooltipTrigger>
									{complianceSummary && (
										<TooltipContent className="max-w-xs">
											<p className="text-xs">{complianceSummary}</p>
										</TooltipContent>
									)}
								</Tooltip>
								<StatsCard
									title="Active Services"
									value={loading ? "…" : servicesData?.services.length.toString() || "0"}
									subtitle="All operational"
									icon={<Zap className="w-5 h-5" />}
								/>
							</div>

							{/* Charts */}
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								<div className="lg:col-span-2">
									<ServiceHealthChart />
								</div>
								<TrafficVolumeChart />
							</div>
						</div>

						{/* Right Column: Live Logs */}
						<div className="space-y-4">
							<div className="rounded-lg shadow p-4 flex flex-col h-3/4">
								<h2 className="text-xl font-bold mb-4">Live Telemetry</h2>
								<div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
									{recentLogs.length === 0 && (
										<p className="text-gray-500 text-center py-4">No logs yet</p>
									)}
									{recentLogs.map((log) => (
										<div
											key={log.id}
											className={`p-2 rounded text-sm font-mono ${
												log.status >= 400 ? "bg-red-100 dark:bg-red-950" : ""
											}`}
										>
											<span className="text-gray-500">
												{new Date(log.timestamp).toLocaleTimeString()}
											</span>
											<span className="ml-2 font-semibold">{log.service}</span>
											<span className="ml-2">
												{log.method} {log.path}
											</span>
											<span
												className={`ml-2 ${
													log.status >= 400
														? "text-red-600 dark:text-red-400"
														: "text-green-600 dark:text-green-400"
												}`}
											>
												{log.status}
											</span>
											<span className="ml-2 text-gray-500">{log.latencyMs}ms</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</MainLayout>
		</TooltipProvider>
	);
}
