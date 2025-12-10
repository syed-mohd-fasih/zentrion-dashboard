"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Clock, AlertCircle, User } from "lucide-react";

interface HistoryEvent {
	id: string;
	timestamp: string;
	action: string;
	actor: string;
	service?: string;
	status: "success" | "pending" | "failed";
	details: string;
}

const mockHistoryEvents: HistoryEvent[] = [
	{
		id: "1",
		timestamp: "2025-01-15 14:45:22",
		action: "Policy Approved",
		actor: "Alex Johnson",
		service: "payment-service",
		status: "success",
		details: "AuthorizationPolicy v2.0 approved and deployed",
	},
	{
		id: "2",
		timestamp: "2025-01-15 13:22:10",
		action: "User Login",
		actor: "Sarah Chen",
		status: "success",
		details: "Successful authentication",
	},
	{
		id: "3",
		timestamp: "2025-01-15 12:15:45",
		action: "Policy Rejected",
		actor: "Mike Rodriguez",
		service: "cart-service",
		status: "failed",
		details: "Policy v1.9 rejected - security concerns",
	},
	{
		id: "4",
		timestamp: "2025-01-15 11:30:20",
		action: "Kubernetes Apply",
		actor: "System",
		status: "success",
		details: "Applied 3 new CRD objects to cluster",
	},
	{
		id: "5",
		timestamp: "2025-01-15 10:15:33",
		action: "CRD Update",
		actor: "Platform",
		service: "inventory-service",
		status: "success",
		details: "Updated ZentrionPolicyHistory CRD",
	},
	{
		id: "6",
		timestamp: "2025-01-15 09:45:15",
		action: "Policy Suggested",
		actor: "AI Engine",
		service: "auth-service",
		status: "pending",
		details: "AI suggested policy for unusual traffic pattern",
	},
];

const getStatusIcon = (status: string) => {
	switch (status) {
		case "success":
			return <CheckCircle className="w-4 h-4 text-green-500" />;
		case "failed":
			return <AlertCircle className="w-4 h-4 text-red-500" />;
		case "pending":
			return <Clock className="w-4 h-4 text-yellow-500" />;
		default:
			return null;
	}
};

const getStatusBadge = (status: string) => {
	switch (status) {
		case "success":
			return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Success</Badge>;
		case "failed":
			return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Failed</Badge>;
		case "pending":
			return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>;
		default:
			return null;
	}
};

export default function HistoryPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterAction, setFilterAction] = useState<string | null>(null);

	const filteredEvents = mockHistoryEvents.filter((event) => {
		const matchesSearch =
			event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
			event.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(event.service?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
		const matchesAction = !filterAction || event.action === filterAction;
		return matchesSearch && matchesAction;
	});

	const actions = [...new Set(mockHistoryEvents.map((e) => e.action))];

	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">Audit Log</h1>
					<p className="text-muted-foreground">Complete history of governance events and system changes</p>
				</div>

				{/* Filters */}
				<div className="mb-6 space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							placeholder="Search by action, actor, or service..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 rounded-lg"
						/>
					</div>
					<div className="flex gap-2 flex-wrap">
						<Button
							variant={filterAction === null ? "default" : "ghost"}
							onClick={() => setFilterAction(null)}
							className="rounded-lg"
						>
							All Actions
						</Button>
						{actions.map((action) => (
							<Button
								key={action}
								variant={filterAction === action ? "default" : "ghost"}
								onClick={() => setFilterAction(action)}
								className="rounded-lg"
							>
								{action}
							</Button>
						))}
					</div>
				</div>

				{/* Timeline */}
				<div className="space-y-4">
					{filteredEvents.map((event, idx) => (
						<Card key={event.id} className="p-6 hover:bg-card/80 transition-colors">
							<div className="flex gap-6">
								{/* Timeline Line */}
								<div className="flex flex-col items-center">
									<div className="flex items-center justify-center">
										{getStatusIcon(event.status)}
									</div>
									{idx < filteredEvents.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
								</div>

								{/* Content */}
								<div className="flex-1 pb-4">
									<div className="flex items-start justify-between gap-4 mb-2">
										<div>
											<h3 className="font-semibold text-foreground">{event.action}</h3>
											<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
												<User className="w-4 h-4" />
												<span>{event.actor}</span>
												{event.service && (
													<>
														<span>•</span>
														<span>{event.service}</span>
													</>
												)}
											</div>
										</div>
										{getStatusBadge(event.status)}
									</div>
									<p className="text-sm text-muted-foreground mb-2">{event.details}</p>
									<p className="text-xs text-muted-foreground">{event.timestamp}</p>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Results Info */}
				<div className="mt-6 text-sm text-muted-foreground">
					Showing {filteredEvents.length} of {mockHistoryEvents.length} events
				</div>
			</div>
		</MainLayout>
	);
}
