"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { Search, AlertTriangle, AlertCircle, RefreshCw, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { useAnomalies } from "@/hooks/useData";
import { useSocketEvent } from "@/hooks/useSocket";
import type { Anomaly as ApiAnomaly } from "@/lib/api/types";

export default function AnomaliesPage() {
	const { data, loading, refetch } = useAnomalies();
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
	const [localAnomalies, setLocalAnomalies] = useState<ApiAnomaly[]>([]);

	const allAnomalies: ApiAnomaly[] = [...localAnomalies, ...(data?.anomalies || [])];

	useSocketEvent("anomaly.created", (anomaly: ApiAnomaly) => {
		setLocalAnomalies((prev) => [anomaly, ...prev]);
	});

	const filteredAnomalies = allAnomalies.filter((a) => {
		const matchesSearch =
			a.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
			a.type.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesSeverity = !filterSeverity || a.severity === filterSeverity;
		return matchesSearch && matchesSeverity;
	});

	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				{/* Header */}
				<div className="mb-8 flex justify-between items-start">
					<div>
						<h1 className="text-4xl font-bold text-foreground mb-2">Anomalies</h1>
						<p className="text-muted-foreground">Detected security anomalies and suspicious activities</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						disabled={loading}
						className="rounded-lg"
					>
						{loading ? (
							<Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
						) : (
							<RefreshCw className="w-4 h-4 mr-1.5" />
						)}
						Refresh
					</Button>
				</div>

				{/* Filters */}
				<div className="mb-6 space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							placeholder="Search anomalies..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 rounded-lg"
						/>
					</div>

					<div className="flex gap-2 flex-wrap">
						<Button
							variant={filterSeverity === null ? "default" : "ghost"}
							onClick={() => setFilterSeverity(null)}
						>
							All Severities
						</Button>
						{["critical", "high", "medium", "low"].map((sev) => (
							<Button
								key={sev}
								variant={filterSeverity === sev ? "default" : "ghost"}
								onClick={() => setFilterSeverity(sev)}
							>
								{sev.charAt(0).toUpperCase() + sev.slice(1)}
							</Button>
						))}
					</div>
				</div>

				{/* Anomalies List */}
				<div className="space-y-3">
					{loading && allAnomalies.length === 0 ? (
						<>
							{[1, 2, 3, 4].map((i) => (
								<Card key={i} className="p-6 space-y-3">
									<div className="flex justify-between">
										<Skeleton className="h-4 w-48" />
										<Skeleton className="h-6 w-16 rounded-full" />
									</div>
									<Skeleton className="h-3 w-32" />
									<Skeleton className="h-3 w-full" />
								</Card>
							))}
						</>
					) : filteredAnomalies.length === 0 ? (
						<EmptyState
							icon={ShieldCheck}
							title={
								allAnomalies.length === 0
									? "No anomalies detected"
									: "No anomalies match your filters"
							}
							description={
								allAnomalies.length === 0
									? "Your services are healthy. New anomalies will appear here in real time."
									: "Try clearing the search or selecting a different severity."
							}
						/>
					) : (
						filteredAnomalies.map((anomaly, i) => {
							const severityClass =
								anomaly.severity === "critical" || anomaly.severity === "high"
									? "bg-destructive/10 text-destructive border-destructive/20"
									: anomaly.severity === "medium"
										? "bg-warning/10 text-warning border-warning/20"
										: "bg-primary/10 text-primary border-primary/20";
							return (
								<motion.div
									key={anomaly.anomalyId}
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
								>
									<Card className="p-5 hover:bg-card/80 hover:border-primary/30 transition-all">
										<div className="flex items-start justify-between gap-4 mb-3">
											<div className="flex items-start gap-3 flex-1 min-w-0">
												{anomaly.severity === "high" || anomaly.severity === "critical" ? (
													<AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
												) : (
													<AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
												)}

												<div className="flex-1 min-w-0">
													<h3 className="font-semibold text-foreground mb-1">
														{anomaly.type}
													</h3>
													<p className="text-xs text-muted-foreground mb-1.5 font-mono">
														{anomaly.service}
													</p>
													<p className="text-sm text-muted-foreground">{anomaly.details}</p>
												</div>
											</div>

											<div className="flex items-center gap-2 shrink-0">
												<Badge className={severityClass}>{anomaly.severity.toUpperCase()}</Badge>
												<Badge
													variant="outline"
													className={
														anomaly.resolved
															? "bg-success/10 text-success border-success/20"
															: "bg-warning/10 text-warning border-warning/20"
													}
												>
													{anomaly.resolved ? "Resolved" : "Unresolved"}
												</Badge>
											</div>
										</div>

										<div className="flex items-center justify-between">
											<p className="text-xs text-muted-foreground font-mono">
												{new Date(anomaly.timestamp).toLocaleString()}
											</p>
											<Link href={`/anomalies/${anomaly.anomalyId}`}>
												<Button variant="ghost" size="sm" className="rounded-lg">
													View Details
												</Button>
											</Link>
										</div>
									</Card>
								</motion.div>
							);
						})
					)}
				</div>

				<div className="mt-6 text-sm text-muted-foreground">Showing {filteredAnomalies.length} anomalies</div>
			</div>
		</MainLayout>
	);
}
