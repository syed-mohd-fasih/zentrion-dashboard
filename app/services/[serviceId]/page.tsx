"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Activity, BarChart3, FileText, Shield } from "lucide-react";

const tabs = [
	{ id: "overview", label: "Overview", icon: Activity },
	{ id: "traffic", label: "Traffic Analysis", icon: BarChart3 },
	{ id: "logs", label: "Logs & Telemetry", icon: FileText },
	{ id: "policies", label: "Attached Policies", icon: Shield },
];

export default function ServiceDetailPage({ params }: { params: { serviceId: string } }) {
	const [activeTab, setActiveTab] = useState("overview");

	const Tab = tabs.find((t) => t.id === activeTab);

	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				{/* Header */}
				<div className="mb-8 flex items-center gap-4">
					<Link href="/services">
						<Button variant="ghost" size="icon" className="rounded-lg">
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</Link>
					<div>
						<h1 className="text-4xl font-bold text-foreground">payment-service</h1>
						<p className="text-muted-foreground">Service ID: {params.serviceId}</p>
					</div>
				</div>

				{/* Status Bar */}
				<Card className="p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Status</p>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-green-500" />
							<span className="font-semibold text-foreground">Running</span>
						</div>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">RPS</p>
						<p className="font-semibold text-foreground">2,450</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Error Rate</p>
						<p className="font-semibold text-foreground">0.2%</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Policy Status</p>
						<Badge className="bg-green-500/10 text-green-700 border-green-500/20">Fully protected</Badge>
					</div>
				</Card>

				{/* Tabs */}
				<div className="mb-6 flex gap-2 border-b border-border overflow-x-auto">
					{tabs.map((tab) => {
						const TabIcon = tab.icon;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
									activeTab === tab.id
										? "text-primary border-primary"
										: "text-muted-foreground border-transparent hover:text-foreground"
								}`}
							>
								<TabIcon className="w-4 h-4" />
								{tab.label}
							</button>
						);
					})}
				</div>

				{/* Tab Content */}
				<Card className="p-8 space-y-6">
					{activeTab === "overview" && (
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-foreground mb-4">Service Health</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									<div className="p-4 bg-card/50 rounded-lg">
										<p className="text-xs text-muted-foreground mb-1">Latency (p50)</p>
										<p className="text-2xl font-bold text-foreground">45ms</p>
									</div>
									<div className="p-4 bg-card/50 rounded-lg">
										<p className="text-xs text-muted-foreground mb-1">Latency (p99)</p>
										<p className="text-2xl font-bold text-foreground">280ms</p>
									</div>
									<div className="p-4 bg-card/50 rounded-lg">
										<p className="text-xs text-muted-foreground mb-1">Error Count (24h)</p>
										<p className="text-2xl font-bold text-foreground">124</p>
									</div>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-foreground mb-4">Instance Pods</h3>
								<div className="space-y-2">
									{[1, 2, 3].map((pod) => (
										<div
											key={pod}
											className="p-3 bg-card/50 rounded-lg flex items-center justify-between"
										>
											<div>
												<p className="font-medium text-foreground">payment-service-{pod}</p>
												<p className="text-xs text-muted-foreground">Namespace: production</p>
											</div>
											<Badge className="bg-green-500/10 text-green-700 border-green-500/20">
												Running
											</Badge>
										</div>
									))}
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-foreground mb-4">
									Applied Istio Configurations
								</h3>
								<div className="space-y-2 text-sm text-muted-foreground">
									<p>✓ AuthorizationPolicy (authz)</p>
									<p>✓ PeerAuthentication</p>
									<p>✓ RequestAuthentication</p>
								</div>
							</div>
						</div>
					)}

					{activeTab === "traffic" && (
						<div className="space-y-6">
							<h3 className="text-lg font-semibold text-foreground">Traffic Analytics</h3>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								<div className="p-4 bg-card/50 rounded-lg">
									<p className="text-xs text-muted-foreground mb-2">Inbound Calls</p>
									<p className="text-2xl font-bold text-foreground">12.4k</p>
								</div>
								<div className="p-4 bg-card/50 rounded-lg">
									<p className="text-xs text-muted-foreground mb-2">Outbound Calls</p>
									<p className="text-2xl font-bold text-foreground">3.2k</p>
								</div>
								<div className="p-4 bg-card/50 rounded-lg">
									<p className="text-xs text-muted-foreground mb-2">HTTP Methods</p>
									<p className="text-sm text-foreground">GET, POST, PUT</p>
								</div>
							</div>
							<div className="p-4 bg-card/50 rounded-lg">
								<p className="text-sm font-medium text-foreground mb-3">Top Source Services</p>
								<div className="space-y-2 text-sm">
									<p className="text-muted-foreground">• cart-service (42%)</p>
									<p className="text-muted-foreground">• order-service (28%)</p>
									<p className="text-muted-foreground">• api-gateway (18%)</p>
								</div>
							</div>
						</div>
					)}

					{activeTab === "logs" && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-foreground mb-4">Live Logs & Telemetry</h3>
							<div className="p-4 bg-card/50 rounded-lg font-mono text-xs text-muted-foreground space-y-2 max-h-96 overflow-y-auto">
								<p>[2025-01-15 14:23:45] INFO: Payment processing initiated</p>
								<p>[2025-01-15 14:23:46] INFO: Card validated successfully</p>
								<p>[2025-01-15 14:23:47] INFO: Transaction completed (txn_id: 7284920)</p>
								<p>[2025-01-15 14:23:48] INFO: Webhook sent to order-service</p>
								<p>[2025-01-15 14:23:49] INFO: Cache updated</p>
							</div>
							<div className="p-3 bg-card/50 rounded-lg border border-border text-sm text-muted-foreground">
								<p>Filters available: Status Code, Path, Latency, Source Service (Static display)</p>
							</div>
						</div>
					)}

					{activeTab === "policies" && (
						<div className="space-y-6">
							<h3 className="text-lg font-semibold text-foreground mb-4">Active Policies</h3>
							<div className="p-4 bg-card/50 rounded-lg font-mono text-xs text-muted-foreground">
								<pre className="whitespace-pre-wrap break-words">{`apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: payment-authz
  namespace: production
spec:
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/production/sa/cart"]`}</pre>
							</div>

							<h3 className="text-lg font-semibold text-foreground">Policy History</h3>
							<div className="space-y-2">
								<div className="p-3 bg-card/50 rounded-lg border border-border">
									<p className="font-medium text-foreground">v2.0 (Current)</p>
									<p className="text-xs text-muted-foreground">Updated 2 hours ago</p>
								</div>
								<div className="p-3 bg-card/50 rounded-lg border border-border">
									<p className="font-medium text-foreground">v1.9</p>
									<p className="text-xs text-muted-foreground">Updated 1 day ago</p>
								</div>
							</div>
						</div>
					)}
				</Card>
			</div>
		</MainLayout>
	);
}
