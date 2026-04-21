"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomingPolicies } from "./incoming-policies";
import { PolicySummary } from "./policy-summary";
import { DiffViewer } from "./diff-viewer";

export function PolicyStageTabs() {
	const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("incoming");

	const handleSelect = (draftId: string) => {
		setSelectedDraftId(draftId);
		setActiveTab("summary");
	};

	const handleAfterAction = () => {
		setSelectedDraftId(null);
		setActiveTab("incoming");
	};

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
			<TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
				<TabsTrigger value="incoming" className="rounded-lg">
					Stage 1: Incoming
				</TabsTrigger>
				<TabsTrigger value="summary" className="rounded-lg" disabled={!selectedDraftId}>
					Stage 2: Summary
				</TabsTrigger>
				<TabsTrigger value="diff" className="rounded-lg" disabled={!selectedDraftId}>
					Stage 3: Review
				</TabsTrigger>
			</TabsList>

			<TabsContent value="incoming" className="mt-6">
				<IncomingPolicies selectedDraftId={selectedDraftId} onSelect={handleSelect} />
			</TabsContent>

			<TabsContent value="summary" className="mt-6">
				<PolicySummary draftId={selectedDraftId} onContinue={() => setActiveTab("diff")} />
			</TabsContent>

			<TabsContent value="diff" className="mt-6">
				<DiffViewer draftId={selectedDraftId} onAfterAction={handleAfterAction} />
			</TabsContent>
		</Tabs>
	);
}
