"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
	useActivePolicies,
	useApprovePolicyDraft,
	usePolicyDraft,
	useRejectPolicyDraft,
} from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";

interface DiffViewerProps {
	draftId: string | null;
	onAfterAction: () => void;
}

export function DiffViewer({ draftId, onAfterAction }: DiffViewerProps) {
	const { user } = useAuth();
	const { data, loading, error } = usePolicyDraft(draftId ?? "");
	const { data: activeData } = useActivePolicies();
	const approve = useApprovePolicyDraft();
	const reject = useRejectPolicyDraft();

	const [rejectOpen, setRejectOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState("");

	const canApprove = user?.role === "ADMIN";
	const canReject = user?.role === "ADMIN" || user?.role === "ANALYST";

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
	const existing = (activeData?.policies ?? []).find(
		(p) => p.service === draft.service && p.namespace === draft.namespace
	);

	const handleApprove = async () => {
		try {
			await approve.mutate({ id: draft.draftId });
			toast.success("Policy approved and applied", {
				description: `${draft.service} / ${draft.namespace}`,
			});
			onAfterAction();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Approve failed";
			toast.error("Could not approve draft", { description: msg });
		}
	};

	const handleReject = async () => {
		if (!rejectReason.trim()) {
			toast.error("Reason required", { description: "Please describe why this draft is being rejected." });
			return;
		}
		try {
			await reject.mutate({ id: draft.draftId, reason: rejectReason.trim() });
			toast.success("Draft rejected", { description: `${draft.service} / ${draft.namespace}` });
			setRejectOpen(false);
			setRejectReason("");
			onAfterAction();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Reject failed";
			toast.error("Could not reject draft", { description: msg });
		}
	};

	return (
		<div className="space-y-6">
			<Card className="rounded-2xl border-0 shadow-sm">
				<CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
					<div>
						<CardTitle className="text-lg font-semibold">Manifest diff</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							{draft.service} / {draft.namespace}
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							disabled={!canApprove || approve.loading}
							onClick={handleApprove}
							className="rounded-lg border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950 bg-transparent"
						>
							<Check className="w-4 h-4 mr-1" />
							{approve.loading ? "Approving…" : "Approve"}
						</Button>
						<Button
							variant="outline"
							disabled={!canReject || reject.loading}
							onClick={() => setRejectOpen(true)}
							className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 bg-transparent"
						>
							<X className="w-4 h-4 mr-1" />
							Reject
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{!canApprove && (
						<p className="text-xs text-muted-foreground mb-4">
							Only ADMIN users can approve drafts. Your role: {user?.role ?? "unauthenticated"}.
						</p>
					)}

					<div className="space-y-0 rounded-xl overflow-hidden border border-border">
						<div className="grid grid-cols-1 md:grid-cols-2">
							<div className="bg-red-50 dark:bg-red-950/20 p-4 md:border-r border-border">
								<h4 className="font-mono text-sm font-semibold text-red-700 dark:text-red-400 mb-3">
									BEFORE {existing ? "" : "(no active policy for this service)"}
								</h4>
								<pre className="font-mono text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
									{existing?.yamlContent ??
										"# No applied AuthorizationPolicy exists yet for this service/namespace.\n# Approving this draft will create a new policy."}
								</pre>
							</div>

							<div className="bg-green-50 dark:bg-green-950/20 p-4">
								<h4 className="font-mono text-sm font-semibold text-green-700 dark:text-green-400 mb-3">
									AFTER
								</h4>
								<pre className="font-mono text-xs text-green-700 dark:text-green-400 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
									{draft.yamlContent}
								</pre>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject this draft?</DialogTitle>
						<DialogDescription>
							Provide a reason so auditors can understand why this draft was not applied.
						</DialogDescription>
					</DialogHeader>
					<Textarea
						value={rejectReason}
						onChange={(e) => setRejectReason(e.target.value)}
						placeholder="Explain the rejection reason…"
						rows={4}
						className="rounded-lg"
					/>
					<DialogFooter>
						<Button variant="ghost" onClick={() => setRejectOpen(false)} disabled={reject.loading}>
							Cancel
						</Button>
						<Button onClick={handleReject} disabled={reject.loading} className="rounded-lg">
							{reject.loading ? "Rejecting…" : "Confirm reject"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
