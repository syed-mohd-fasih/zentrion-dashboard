"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ServiceHealthChart } from "@/components/dashboard/service-health-chart";
import { TrafficVolumeChart } from "@/components/dashboard/traffic-volume-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDot } from "@/components/ui/status-dot";
import { Activity, AlertTriangle, CheckCircle2, Zap, Radio } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSocketEvent } from "@/hooks/useSocket";
import { useServices, useComplianceScore, useTelemetryLogs } from "@/hooks/useData";
import type { ParsedRequest } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function statusTone(status: number): {
	row: string;
	text: string;
} {
	if (status >= 500) return { row: "border-l-2 border-destructive bg-destructive/[0.04]", text: "text-destructive" };
	if (status >= 400) return { row: "border-l-2 border-warning bg-warning/[0.04]", text: "text-warning" };
	return { row: "border-l-2 border-transparent", text: "text-success" };
}

const containerStagger = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.06 },
	},
} as const;

const itemFade = {
	hidden: { opacity: 0, y: 6 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export default function DashboardPage() {
	const [recentLogs, setRecentLogs] = useState<ParsedRequest[]>([]);
	const { data: servicesData, loading } = useServices();
	const { data: complianceData, loading: complianceLoading } = useComplianceScore();
	const { data: historicalLogs, loading: historyLoading } = useTelemetryLogs(50);

	useEffect(() => {
		if (historicalLogs?.logs?.length) {
			setRecentLogs((prev) => (prev.length === 0 ? historicalLogs.logs : prev));
		}
	}, [historicalLogs]);

	useSocketEvent("telemetry.log", (log) => {
		setRecentLogs((prev) => [log, ...prev].slice(0, 50));
	});

	const totalLogsProcessed = recentLogs.length;
	const errorResponses = recentLogs.filter((log) => log.status >= 400).length;
	const errorRate = totalLogsProcessed > 0 ? (errorResponses / totalLogsProcessed) * 100 : 0;

	const complianceScore = complianceData?.score;
	const complianceSummary = complianceData?.summary;

	// Determine the compliance tone based on the score
	const complianceTone =
		complianceScore === null || complianceScore === undefined
			? "default"
			: complianceScore >= 80
				? "success"
				: complianceScore >= 50
					? "warning"
					: "destructive";

	const errorsTone = errorRate >= 5 ? "destructive" : errorRate >= 2 ? "warning" : "default";

	return (
		<TooltipProvider>
			<MainLayout>
				<div className="p-6 space-y-8 max-w-[1600px] mx-auto">
					<motion.div
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
						<p className="text-muted-foreground mt-1">System overview and key metrics</p>
					</motion.div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column */}
						<div className="lg:col-span-2 space-y-6">
							{/* Stats Cards (staggered) */}
							<motion.div
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
								initial="hidden"
								animate="visible"
								variants={containerStagger}
							>
								<motion.div variants={itemFade}>
									<StatsCard
										title="Live Logs Seen"
										value={totalLogsProcessed.toString()}
										subtitle="Streaming via WebSocket"
										icon={<Activity className="w-4 h-4" />}
										tone="primary"
									/>
								</motion.div>
								<motion.div variants={itemFade}>
									<StatsCard
										title="4xx / 5xx Responses"
										value={errorResponses.toString()}
										subtitle={
											totalLogsProcessed > 0
												? `${errorRate.toFixed(1)}% of live stream`
												: "In live stream"
										}
										icon={<AlertTriangle className="w-4 h-4" />}
										tone={errorsTone}
									/>
								</motion.div>
								<motion.div variants={itemFade}>
									<Tooltip>
										<TooltipTrigger asChild>
											<div>
												<StatsCard
													title="Compliance Score"
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
															: (complianceSummary ?? "AI offline")
													}
													icon={<CheckCircle2 className="w-4 h-4" />}
													tone={complianceTone}
												/>
											</div>
										</TooltipTrigger>
										{complianceSummary && (
											<TooltipContent className="max-w-xs">
												<p className="text-xs">{complianceSummary}</p>
											</TooltipContent>
										)}
									</Tooltip>
								</motion.div>
								<motion.div variants={itemFade}>
									<StatsCard
										title="Active Services"
										value={loading ? "…" : (servicesData?.services.length.toString() || "0")}
										subtitle={
											servicesData?.services?.length
												? `${servicesData.services.length} watched`
												: "Awaiting discovery"
										}
										icon={<Zap className="w-4 h-4" />}
										tone="primary"
									/>
								</motion.div>
							</motion.div>

							{/* Charts */}
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								<div className="lg:col-span-2">
									<ServiceHealthChart />
								</div>
								<TrafficVolumeChart />
							</div>
						</div>

						{/* Right Column: Live Telemetry */}
						<div>
							<Card className="flex flex-col h-[min(34rem,calc(100vh-9rem))] overflow-hidden">
								<CardHeader className="pb-3 border-b border-border/40">
									<CardTitle className="flex items-center justify-between text-base">
										<span className="flex items-center gap-2">
											<Radio className="w-4 h-4 text-primary" />
											Live Telemetry
										</span>
										<StatusDot tone="success" pulse />
									</CardTitle>
								</CardHeader>
								<CardContent className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 min-h-0">
									{historyLoading && recentLogs.length === 0 ? (
										<div className="space-y-2 pt-2">
											{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
												<Skeleton key={i} className="h-7 w-full rounded-md" />
											))}
										</div>
									) : recentLogs.length === 0 ? (
										<div className="text-center text-sm text-muted-foreground py-12">
											No telemetry yet — waiting for the cluster to emit logs.
										</div>
									) : (
										recentLogs.map((log) => {
											const tone = statusTone(log.status);
											return (
												<div
													key={log.id}
													className={cn(
														"px-2.5 py-1.5 rounded-md text-xs font-mono",
														tone.row,
													)}
												>
													<span className="text-muted-foreground/60">
														{new Date(log.timestamp).toLocaleTimeString()}
													</span>
													<span className="ml-2 font-semibold text-foreground">
														{log.service}
													</span>
													<span className="ml-2 text-muted-foreground truncate">
														{log.method} {log.path}
													</span>
													<span className={cn("ml-2 font-semibold", tone.text)}>
														{log.status}
													</span>
													<span className="ml-2 text-muted-foreground/60">
														{log.latencyMs}ms
													</span>
												</div>
											);
										})
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</MainLayout>
		</TooltipProvider>
	);
}
