"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder";
import { Activity, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSocketEvent } from "@/hooks/useSocket";
import { useServices } from "@/hooks/useData";
import type { ParsedRequest } from "@/lib/api/types";

export default function DashboardPage() {
	return (
		<ProtectedRoute>
			<DashboardContent />
		</ProtectedRoute>
	);
}

function DashboardContent() {
	const [recentLogs, setRecentLogs] = useState<ParsedRequest[]>([]);
	const { data: servicesData, loading } = useServices();

	// Derived stats from recentLogs for demo purposes
	const totalLogsProcessed = recentLogs.length;
	const anomaliesDetected = recentLogs.filter((log) => log.status >= 400).length;

	// Subscribe to real-time logs
	useSocketEvent("telemetry.log", (log) => {
		setRecentLogs((prev) => [log, ...prev].slice(0, 50));
	});

	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
					<p className="text-muted-foreground mt-1">System overview and key metrics</p>
				</div>

				{/* Main grid: Left = Cards + Charts, Right = Live Logs */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column */}
					<div className="lg:col-span-2 space-y-6">
						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<StatsCard
								title="Total Logs Processed"
								value={totalLogsProcessed.toString()}
								subtitle="Today"
								icon={<Activity className="w-5 h-5" />}
							/>
							<StatsCard
								title="Anomalies Detected"
								value={anomaliesDetected.toString()}
								subtitle="Today"
								icon={<AlertTriangle className="w-5 h-5" />}
							/>

							<StatsCard
								title="Policy Compliance Score (Placeholder)"
								value="94.2%"
								subtitle="Excellent"
								icon={<CheckCircle2 className="w-5 h-5" />}
							/>
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
								<ChartPlaceholder
									title="Service Health Over Time (Placeholder)"
									description="Last 24 hours"
									height="h-80"
								/>
							</div>
							<ChartPlaceholder
								title="Traffic Volume (Placeholder)"
								description="Request distribution"
								height="h-80"
							/>
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
	);
}
