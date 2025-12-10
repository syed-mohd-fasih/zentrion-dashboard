"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, AlertCircle } from "lucide-react";

interface Anomaly {
	id: string;
	timestamp: string;
	service: string;
	type: string;
	severity: "low" | "medium" | "high";
	suggestedAction: string;
	status: "resolved" | "unresolved";
}

const mockAnomalies: Anomaly[] = [
	{
		id: "1",
		timestamp: "2025-01-15 14:23:45",
		service: "payment-service",
		type: "Unexpected IP",
		severity: "high",
		suggestedAction: "Review policy for unauthorized source",
		status: "unresolved",
	},
	{
		id: "2",
		timestamp: "2025-01-15 13:15:22",
		service: "cart-service",
		type: "Rate Spike",
		severity: "medium",
		suggestedAction: "Consider rate limiting",
		status: "unresolved",
	},
	{
		id: "3",
		timestamp: "2025-01-15 12:08:10",
		service: "auth-service",
		type: "New Method",
		severity: "medium",
		suggestedAction: "Verify new HTTP method usage",
		status: "resolved",
	},
	{
		id: "4",
		timestamp: "2025-01-15 10:45:33",
		service: "inventory-service",
		type: "Unexpected IP",
		severity: "high",
		suggestedAction: "Immediate security review required",
		status: "unresolved",
	},
];

const getSeverityBadge = (severity: string) => {
	switch (severity) {
		case "high":
			return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">High</Badge>;
		case "medium":
			return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Medium</Badge>;
		case "low":
			return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">Low</Badge>;
		default:
			return null;
	}
};

export default function AnomaliesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSeverity, setFilterSeverity] = useState<string | null>(null);

	const filteredAnomalies = mockAnomalies.filter((a) => {
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
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">Anomalies</h1>
					<p className="text-muted-foreground">Detected security anomalies and suspicious activities</p>
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
							className="rounded-lg"
						>
							All Severities
						</Button>
						<Button
							variant={filterSeverity === "high" ? "default" : "ghost"}
							onClick={() => setFilterSeverity("high")}
							className="rounded-lg"
						>
							High
						</Button>
						<Button
							variant={filterSeverity === "medium" ? "default" : "ghost"}
							onClick={() => setFilterSeverity("medium")}
							className="rounded-lg"
						>
							Medium
						</Button>
						<Button
							variant={filterSeverity === "low" ? "default" : "ghost"}
							onClick={() => setFilterSeverity("low")}
							className="rounded-lg"
						>
							Low
						</Button>
					</div>
				</div>

				{/* Anomalies Grid */}
				<div className="space-y-4">
					{filteredAnomalies.map((anomaly) => (
						<Card key={anomaly.id} className="p-6 hover:bg-card/80 transition-colors cursor-pointer">
							<div className="flex items-start justify-between gap-4 mb-4">
								<div className="flex items-start gap-3 flex-1">
									{anomaly.severity === "high" ? (
										<AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
									) : (
										<AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
									)}
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-foreground mb-1">{anomaly.type}</h3>
										<p className="text-sm text-muted-foreground mb-2">Service: {anomaly.service}</p>
										<p className="text-sm text-muted-foreground">{anomaly.suggestedAction}</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{getSeverityBadge(anomaly.severity)}
									<Badge
										variant="outline"
										className={
											anomaly.status === "resolved"
												? "bg-green-500/10 text-green-700 border-green-500/20"
												: "bg-orange-500/10 text-orange-700 border-orange-500/20"
										}
									>
										{anomaly.status === "resolved" ? "Resolved" : "Unresolved"}
									</Badge>
								</div>
							</div>
							<div className="flex items-center justify-between">
								<p className="text-xs text-muted-foreground">{anomaly.timestamp}</p>
								<Button variant="ghost" size="sm" className="rounded-lg">
									View Details
								</Button>
							</div>
						</Card>
					))}
				</div>

				{/* Results Info */}
				<div className="mt-6 text-sm text-muted-foreground">
					Showing {filteredAnomalies.length} of {mockAnomalies.length} anomalies
				</div>
			</div>
		</MainLayout>
	);
}
