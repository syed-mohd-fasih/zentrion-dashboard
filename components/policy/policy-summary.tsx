"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ArrowRight } from "lucide-react";
import { usePolicyDraft } from "@/hooks/useData";

interface PolicySummaryProps {
	draftId: string | null;
	onContinue: () => void;
}

function summarizeYaml(yaml: string): string[] {
	const lines = yaml.split("\n");
	const summary: string[] = [];

	for (const raw of lines) {
		const line = raw.trim();
		if (line.startsWith("kind:")) summary.push(`Kind: ${line.replace("kind:", "").trim()}`);
		if (line.startsWith("name:")) summary.push(`Name: ${line.replace("name:", "").trim()}`);
		if (line.startsWith("namespace:")) summary.push(`Namespace: ${line.replace("namespace:", "").trim()}`);
		if (line.startsWith("action:")) summary.push(`Action: ${line.replace("action:", "").trim()}`);
	}

	if (summary.length === 0) {
		summary.push("Manifest parsed but produced no summary fields.");
	}
	return summary;
}

export function PolicySummary({ draftId, onContinue }: PolicySummaryProps) {
	const { data, loading, error } = usePolicyDraft(draftId ?? "");

	if (!draftId) {
		return (
			<Card className="rounded-2xl border-0 shadow-sm">
				<CardContent className="pt-6 py-12 text-center text-muted-foreground">
					<FileText className="w-8 h-8 mx-auto mb-3 opacity-60" />
					<p className="font-medium">No draft selected</p>
					<p className="text-sm mt-1">Pick a pending policy from the Incoming tab to review it here.</p>
				</CardContent>
			</Card>
		);
	}

	if (loading) {
		return (
			<Card className="rounded-2xl border-0 shadow-sm">
				<CardContent className="pt-6 flex items-center gap-2 text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" /> Loading draft…
				</CardContent>
			</Card>
		);
	}

	if (error || !data?.draft) {
		return (
			<Card className="rounded-2xl border-0 shadow-sm">
				<CardContent className="pt-6 text-sm text-red-600">
					Failed to load draft: {error ?? "not found"}
				</CardContent>
			</Card>
		);
	}

	const draft = data.draft;
	const summary = summarizeYaml(draft.yamlContent);

	return (
		<div className="space-y-6">
			<Card className="rounded-2xl border-0 shadow-sm">
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
						<div>
							<CardTitle className="text-lg font-semibold">
								{draft.service}{" "}
								<span className="text-muted-foreground font-normal">/ {draft.namespace}</span>
							</CardTitle>
							<p className="text-sm text-muted-foreground mt-2">
								Draft <span className="font-mono">{draft.draftId.slice(0, 8)}…</span> • created{" "}
								{new Date(draft.createdAt).toLocaleString()} • by {draft.createdBy}
							</p>
						</div>
						<Badge className="rounded-lg bg-blue-500/10 text-blue-700 border-blue-500/20">
							{draft.status}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div>
						<h4 className="font-semibold text-foreground mb-2">Reason</h4>
						<p className="text-sm text-foreground whitespace-pre-wrap bg-muted rounded-xl p-4">
							{draft.reason}
						</p>
					</div>

					<div>
						<h4 className="font-semibold text-foreground mb-2">Manifest overview</h4>
						<ul className="text-sm text-foreground bg-muted rounded-xl p-4 space-y-1 font-mono">
							{summary.map((s, i) => (
								<li key={i}>• {s}</li>
							))}
						</ul>
					</div>

					{draft.anomalyId && (
						<div>
							<h4 className="font-semibold text-foreground mb-2">Triggered by</h4>
							<Link
								href={`/anomalies/${draft.anomalyId}`}
								className="text-primary hover:underline text-sm font-mono"
							>
								Anomaly {draft.anomalyId.slice(0, 8)}…
							</Link>
						</div>
					)}

					<div className="flex justify-end pt-2">
						<Button onClick={onContinue} className="rounded-lg">
							Continue to review <ArrowRight className="w-4 h-4 ml-2" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
