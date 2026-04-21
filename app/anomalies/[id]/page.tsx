"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAnomaly } from "@/hooks/useData";
import { useGeneratePolicyFromAnomaly } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";

function severityBadge(severity: string) {
	const cls =
		severity === "critical" || severity === "high"
			? "bg-red-500/10 text-red-700 border-red-500/20"
			: severity === "medium"
			? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
			: "bg-blue-500/10 text-blue-700 border-blue-500/20";
	return <Badge className={cls}>{severity.toUpperCase()}</Badge>;
}

function formatType(type: string) {
	return type
		.split("_")
		.map((w) => w.charAt(0) + w.slice(1).toLowerCase())
		.join(" ");
}

export default function AnomalyDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const router = useRouter();
	const { user } = useAuth();
	const canGenerate = user?.role === "ADMIN" || user?.role === "ANALYST";

	const { data, loading, error } = useAnomaly(id);
	const generatePolicy = useGeneratePolicyFromAnomaly();

	const anomaly = data?.anomaly;

	const handleGeneratePolicy = async () => {
		if (!anomaly) return;
		try {
			const result = await generatePolicy.mutate(anomaly.anomalyId);
			toast.success("Policy draft generated", {
				description: `Draft ${result.draft.draftId.slice(0, 8)}… created for ${result.draft.service}`,
			});
			router.push("/policy-review");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Failed to generate policy";
			toast.error("Could not generate policy", { description: msg });
		}
	};

	if (loading) {
		return (
			<MainLayout>
				<div className="p-6 flex items-center gap-2 text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" /> Loading anomaly…
				</div>
			</MainLayout>
		);
	}

	if (error || !anomaly) {
		return (
			<MainLayout>
				<div className="p-6 space-y-4">
					<Link href="/anomalies">
						<Button variant="ghost" size="sm" className="rounded-lg">
							<ArrowLeft className="w-4 h-4 mr-2" /> Back to anomalies
						</Button>
					</Link>
					<Card className="p-8 text-center">
						<AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
						<p className="text-foreground font-semibold">Anomaly not found</p>
						<p className="text-sm text-muted-foreground mt-1">{error ?? `No anomaly with id ${id}`}</p>
					</Card>
				</div>
			</MainLayout>
		);
	}

	const metadataEntries = anomaly.metadata ? Object.entries(anomaly.metadata) : [];

	return (
		<TooltipProvider>
			<MainLayout>
				<div className="p-6 space-y-8">
					{/* Header */}
					<div className="mb-8 flex items-center gap-4">
						<Link href="/anomalies">
							<Button variant="ghost" size="icon" className="rounded-lg">
								<ArrowLeft className="w-5 h-5" />
							</Button>
						</Link>
						<div className="flex items-center gap-3">
							<AlertTriangle className="w-8 h-8 text-red-500" />
							<h1 className="text-4xl font-bold text-foreground">{formatType(anomaly.type)}</h1>
						</div>
					</div>

					{/* Status Bar */}
					<Card className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
						<div>
							<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Anomaly ID</p>
							<p className="font-mono text-foreground text-sm break-all">{anomaly.anomalyId}</p>
						</div>
						<div>
							<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Severity</p>
							{severityBadge(anomaly.severity)}
						</div>
						<div>
							<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Service</p>
							<p className="font-semibold text-foreground">{anomaly.service}</p>
						</div>
						<div>
							<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Status</p>
							<Badge
								className={
									anomaly.resolved
										? "bg-green-500/10 text-green-700 border-green-500/20"
										: "bg-orange-500/10 text-orange-700 border-orange-500/20"
								}
							>
								{anomaly.resolved ? "Resolved" : "Unresolved"}
							</Badge>
						</div>
					</Card>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-6">
							{/* Details */}
							<Card className="p-6">
								<h2 className="font-semibold text-foreground mb-4">Details</h2>
								<p className="text-sm text-foreground whitespace-pre-wrap">{anomaly.details}</p>
							</Card>

							{/* Metadata */}
							{metadataEntries.length > 0 && (
								<Card className="p-6">
									<h2 className="font-semibold text-foreground mb-4">Metadata</h2>
									<dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{metadataEntries.map(([k, v]) => (
											<div key={k}>
												<dt className="text-xs uppercase text-muted-foreground font-semibold mb-1">
													{k}
												</dt>
												<dd className="font-mono text-sm text-foreground break-all">
													{typeof v === "object" ? JSON.stringify(v) : String(v)}
												</dd>
											</div>
										))}
									</dl>
								</Card>
							)}

							{/* Associated log IDs */}
							<Card className="p-6">
								<h2 className="font-semibold text-foreground mb-4">Associated Telemetry Logs</h2>
								{anomaly.associatedLogs && anomaly.associatedLogs.length > 0 ? (
									<ul className="space-y-1 font-mono text-xs text-muted-foreground max-h-48 overflow-y-auto">
										{anomaly.associatedLogs.map((logId) => (
											<li key={logId} className="break-all">
												{logId}
											</li>
										))}
									</ul>
								) : (
									<p className="text-sm text-muted-foreground">
										No telemetry logs linked to this anomaly.
									</p>
								)}
							</Card>

							{/* Timeline */}
							<Card className="p-6">
								<h2 className="font-semibold text-foreground mb-4">Timeline</h2>
								<div className="space-y-3">
									<TimelineRow
										label="Anomaly detected"
										timestamp={anomaly.timestamp}
										description={`Detected by the ${formatType(anomaly.type)} rule.`}
									/>
									{anomaly.suggestedPolicyDraftId && (
										<TimelineRow
											label="Policy draft suggested"
											description={
												<>
													Draft{" "}
													<Link
														href="/policy-review"
														className="text-primary hover:underline font-mono"
													>
														{anomaly.suggestedPolicyDraftId.slice(0, 8)}…
													</Link>{" "}
													linked to this anomaly.
												</>
											}
										/>
									)}
									{anomaly.resolved && anomaly.resolvedAt && (
										<TimelineRow
											label="Resolved"
											timestamp={anomaly.resolvedAt}
											description="Marked resolved by an operator."
										/>
									)}
								</div>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							<Card className="p-6">
								<h2 className="font-semibold text-foreground mb-4">Actions</h2>
								<div className="space-y-2">
									<Button
										onClick={handleGeneratePolicy}
										disabled={!canGenerate || generatePolicy.loading || anomaly.resolved}
										className="w-full bg-primary hover:bg-primary/90 rounded-lg"
									>
										{generatePolicy.loading ? "Generating…" : "Create Policy Suggestion"}
									</Button>
									{!canGenerate && (
										<p className="text-xs text-muted-foreground">
											Requires ADMIN or ANALYST role.
										</p>
									)}
									<DisabledAction label="Block Source IP" />
									<DisabledAction label="Whitelist Source" />
									<DisabledAction label="Mark as Resolved" />
								</div>
							</Card>
						</div>
					</div>
				</div>
			</MainLayout>
		</TooltipProvider>
	);
}

function TimelineRow({
	label,
	timestamp,
	description,
}: {
	label: string;
	timestamp?: string;
	description: React.ReactNode;
}) {
	return (
		<div className="flex gap-4">
			<div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
			<div>
				<p className="text-sm font-medium text-foreground">{label}</p>
				<p className="text-xs text-muted-foreground">
					{timestamp && <span>{new Date(timestamp).toLocaleString()} — </span>}
					{description}
				</p>
			</div>
		</div>
	);
}

function DisabledAction({ label }: { label: string }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span className="block">
					<Button variant="ghost" disabled className="w-full rounded-lg justify-start">
						{label}
					</Button>
				</span>
			</TooltipTrigger>
			<TooltipContent>Coming soon</TooltipContent>
		</Tooltip>
	);
}
