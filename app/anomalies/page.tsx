/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, AlertCircle } from "lucide-react";
import Link from "next/link";

import { useAnomalies } from "@/hooks/useData";
import { useSocketEvent } from "@/hooks/useSocket";
import type { Anomaly as ApiAnomaly } from "@/lib/api/types";

export default function AnomaliesPage() {
	const { data, loading } = useAnomalies(5);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
	const [localAnomalies, setLocalAnomalies] = useState<ApiAnomaly[]>([]);

	// Merge live socket anomalies with API data
	const allAnomalies: ApiAnomaly[] = [...localAnomalies, ...(data?.anomalies || [])];

	// Socket subscription
	useSocketEvent("anomaly.created", (anomaly: ApiAnomaly) => {
		setLocalAnomalies((prev) => [anomaly, ...prev]);
	});

	// Your existing filter logic
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

					{/* <Button onClick={refetch}>Refresh</Button> */}
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

						{["high", "medium", "low"].map((sev) => (
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
				<div className="space-y-4">
					{loading ? (
						<Card className="p-8 text-center text-muted-foreground">Loading anomalies...</Card>
					) : filteredAnomalies.length === 0 ? (
						<Card className="p-8 text-center text-muted-foreground">No anomalies detected yet</Card>
					) : (
						filteredAnomalies.map((anomaly) => (
							<Card key={anomaly.anomalyId} className="p-6 hover:bg-card/80 transition-colors">
								<div className="flex items-start justify-between gap-4 mb-4">
									<div className="flex items-start gap-3 flex-1">
										{anomaly.severity === "high" || anomaly.severity === "critical" ? (
											<AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
										) : (
											<AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
										)}

										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-foreground mb-1">{anomaly.type}</h3>

											<p className="text-sm text-muted-foreground mb-2">
												Service: {anomaly.service}
											</p>

											{"details" in anomaly && (
												<p className="text-sm text-muted-foreground">
													{(anomaly as any).details}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Badge
											className={
												anomaly.severity === "critical"
													? "bg-red-500/10 text-red-700 border-red-500/20"
													: anomaly.severity === "high"
													? "bg-red-500/10 text-red-700 border-red-500/20"
													: anomaly.severity === "medium"
													? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
													: "bg-blue-500/10 text-blue-700 border-blue-500/20"
											}
										>
											{anomaly.severity.toUpperCase()}
										</Badge>

										{"status" in anomaly && (
											<Badge
												variant="outline"
												className={
													(anomaly as any).status === "resolved"
														? "bg-green-500/10 text-green-700 border-green-500/20"
														: "bg-orange-500/10 text-orange-700 border-orange-500/20"
												}
											>
												{(anomaly as any).status === "resolved" ? "Resolved" : "Unresolved"}
											</Badge>
										)}
									</div>
								</div>

								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">
										{new Date(anomaly.timestamp).toLocaleString()}
									</p>

									<Link href={`/anomalies/${anomaly.anomalyId}`}>
										<Button variant="ghost" size="sm" className="rounded-lg">
											View Details
										</Button>
									</Link>
								</div>
							</Card>
						))
					)}
				</div>

				{/* Results Info */}
				<div className="mt-6 text-sm text-muted-foreground">Showing {filteredAnomalies.length} anomalies</div>
			</div>
		</MainLayout>
	);
}
