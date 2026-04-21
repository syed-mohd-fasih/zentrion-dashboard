"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Inbox } from "lucide-react";
import { usePendingDrafts } from "@/hooks/useData";
import { useSocketEvent } from "@/hooks/useSocket";
import type { PolicyDraft } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface IncomingPoliciesProps {
	selectedDraftId: string | null;
	onSelect: (draftId: string) => void;
}

export function IncomingPolicies({ selectedDraftId, onSelect }: IncomingPoliciesProps) {
	const { data, loading, error, refetch } = usePendingDrafts();
	const [search, setSearch] = useState("");

	useSocketEvent("policy.draft", () => {
		refetch();
	});

	useSocketEvent("policy.applied", () => {
		refetch();
	});

	const drafts: PolicyDraft[] = data?.drafts ?? [];

	const filtered = drafts.filter((d) => {
		if (!search) return true;
		const needle = search.toLowerCase();
		return (
			d.service.toLowerCase().includes(needle) ||
			d.namespace.toLowerCase().includes(needle) ||
			d.reason.toLowerCase().includes(needle)
		);
	});

	return (
		<div className="space-y-6">
			{/* Filters */}
			<Card className="rounded-2xl border-0 shadow-sm">
				<CardContent className="pt-6">
					<div className="flex gap-4 flex-col md:flex-row md:items-end">
						<div className="flex-1">
							<label className="text-sm font-medium text-foreground mb-2 block">
								Search pending drafts
							</label>
							<Input
								placeholder="Search by service, namespace, or reason…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="rounded-lg"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Drafts list */}
			{loading ? (
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="pt-6 flex items-center gap-2 text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading pending drafts…
					</CardContent>
				</Card>
			) : error ? (
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="pt-6 text-sm text-red-600">Failed to load drafts: {error}</CardContent>
				</Card>
			) : filtered.length === 0 ? (
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="pt-6 py-10 text-center text-muted-foreground">
						<Inbox className="w-8 h-8 mx-auto mb-3 opacity-60" />
						<p className="font-medium">No pending policy drafts</p>
						<p className="text-sm mt-1">
							Drafts generated from anomalies will appear here for review.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{filtered.map((draft) => {
						const isSelected = selectedDraftId === draft.draftId;
						return (
							<Card
								key={draft.draftId}
								onClick={() => onSelect(draft.draftId)}
								className={cn(
									"rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer",
									isSelected ? "border-primary ring-2 ring-primary/30" : "border-border/60"
								)}
							>
								<CardContent className="pt-6">
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-foreground text-base">
												{draft.service}
												<span className="text-muted-foreground font-normal">
													{" "}
													/ {draft.namespace}
												</span>
											</h3>
											<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
												{draft.reason}
											</p>
											<div className="flex gap-2 items-center mt-2 flex-wrap text-xs text-muted-foreground">
												<span className="font-mono">{draft.draftId.slice(0, 8)}…</span>
												<span>•</span>
												<span>{new Date(draft.createdAt).toLocaleString()}</span>
												<span>•</span>
												<span>by {draft.createdBy}</span>
											</div>
										</div>
										<div className="flex gap-2 items-center flex-wrap">
											{draft.anomalyId && (
												<Badge
													variant="outline"
													className="rounded-lg bg-amber-500/10 text-amber-700 border-amber-500/20"
												>
													From anomaly
												</Badge>
											)}
											<Badge className="rounded-lg bg-blue-500/10 text-blue-700 border-blue-500/20">
												Pending
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
