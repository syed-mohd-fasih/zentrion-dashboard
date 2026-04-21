"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	CheckCircle,
	AlertCircle,
	FileText,
	Upload,
	Trash2,
	Loader2,
	User,
} from "lucide-react";
import { usePolicyHistory } from "@/hooks/useData";
import { useSocketEvent } from "@/hooks/useSocket";
import type { PolicyHistory } from "@/lib/api/types";

type HistoryAction = PolicyHistory["action"];

const ACTIONS: HistoryAction[] = ["created", "approved", "rejected", "applied", "deleted"];

function actionIcon(action: HistoryAction) {
	switch (action) {
		case "created":
			return <FileText className="w-4 h-4 text-blue-500" />;
		case "approved":
			return <CheckCircle className="w-4 h-4 text-green-500" />;
		case "rejected":
			return <AlertCircle className="w-4 h-4 text-red-500" />;
		case "applied":
			return <Upload className="w-4 h-4 text-primary" />;
		case "deleted":
			return <Trash2 className="w-4 h-4 text-muted-foreground" />;
	}
}

function actionBadge(action: HistoryAction) {
	const cls =
		action === "approved" || action === "applied"
			? "bg-green-500/10 text-green-700 border-green-500/20"
			: action === "rejected" || action === "deleted"
			? "bg-red-500/10 text-red-700 border-red-500/20"
			: "bg-blue-500/10 text-blue-700 border-blue-500/20";
	return <Badge className={cls}>{action.charAt(0).toUpperCase() + action.slice(1)}</Badge>;
}

export default function HistoryPage() {
	const { data, loading, error, refetch } = usePolicyHistory();
	const [searchTerm, setSearchTerm] = useState("");
	const [filterAction, setFilterAction] = useState<HistoryAction | null>(null);

	useSocketEvent("policy.draft", () => refetch());
	useSocketEvent("policy.applied", () => refetch());

	const events: PolicyHistory[] = useMemo(() => data?.history ?? [], [data]);

	const filteredEvents = events.filter((event) => {
		const needle = searchTerm.toLowerCase();
		const matchesSearch =
			!needle ||
			event.action.toLowerCase().includes(needle) ||
			event.userId.toLowerCase().includes(needle) ||
			event.details.toLowerCase().includes(needle) ||
			event.policyId.toLowerCase().includes(needle);
		const matchesAction = !filterAction || event.action === filterAction;
		return matchesSearch && matchesAction;
	});

	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">Audit Log</h1>
					<p className="text-muted-foreground">
						Complete history of policy lifecycle events across the cluster
					</p>
				</div>

				{/* Filters */}
				<div className="mb-6 space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							placeholder="Search by action, user, policy id, or details…"
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
						{ACTIONS.map((action) => (
							<Button
								key={action}
								variant={filterAction === action ? "default" : "ghost"}
								onClick={() => setFilterAction(action)}
								className="rounded-lg"
							>
								{action.charAt(0).toUpperCase() + action.slice(1)}
							</Button>
						))}
					</div>
				</div>

				{/* Timeline */}
				{loading ? (
					<Card className="p-8 flex items-center gap-2 text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading audit log…
					</Card>
				) : error ? (
					<Card className="p-8 text-sm text-red-600">Failed to load audit log: {error}</Card>
				) : filteredEvents.length === 0 ? (
					<Card className="p-8 text-center text-muted-foreground">
						{events.length === 0
							? "No policy events have been recorded yet."
							: "No events match the current filters."}
					</Card>
				) : (
					<div className="space-y-4">
						{filteredEvents.map((event, idx) => (
							<Card key={event.id} className="p-6 hover:bg-card/80 transition-colors">
								<div className="flex gap-6">
									{/* Timeline line */}
									<div className="flex flex-col items-center">
										<div className="flex items-center justify-center">
											{actionIcon(event.action)}
										</div>
										{idx < filteredEvents.length - 1 && (
											<div className="w-0.5 h-12 bg-border mt-2" />
										)}
									</div>

									{/* Content */}
									<div className="flex-1 pb-4 min-w-0">
										<div className="flex items-start justify-between gap-4 mb-2">
											<div className="min-w-0">
												<h3 className="font-semibold text-foreground">
													Policy{" "}
													<Link
														href="/policy-review"
														className="font-mono text-primary hover:underline"
													>
														{event.policyId.slice(0, 8)}…
													</Link>{" "}
													<span className="text-muted-foreground font-normal">
														was {event.action}
													</span>
												</h3>
												<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
													<User className="w-4 h-4" />
													<span>{event.userId}</span>
												</div>
											</div>
											{actionBadge(event.action)}
										</div>
										<p className="text-sm text-muted-foreground mb-2 break-words">
											{event.details}
										</p>
										<p className="text-xs text-muted-foreground">
											{new Date(event.timestamp).toLocaleString()}
										</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				)}

				{/* Results Info */}
				<div className="mt-6 text-sm text-muted-foreground">
					Showing {filteredEvents.length} of {events.length} events
				</div>
			</div>
		</MainLayout>
	);
}
