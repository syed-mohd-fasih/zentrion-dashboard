"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState, use, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Activity, BarChart3, FileText, Shield } from "lucide-react";

import { useServices, useTelemetryLogs } from "@/hooks/useData";

const tabs = [
	{ id: "overview", label: "Overview", icon: Activity },
	{ id: "traffic", label: "Traffic Analysis", icon: BarChart3 },
	{ id: "logs", label: "Logs & Telemetry", icon: FileText },
	{ id: "policies", label: "Attached Policies", icon: Shield },
];

export default function ServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
	const { serviceId } = use(params);

	const [activeTab, setActiveTab] = useState("overview");

	const { data: servicesData, loading } = useServices();
	const { data: logsData } = useTelemetryLogs(50, serviceId);

	const serviceData = servicesData?.services.filter((s) => s.name === serviceId);

	if (loading || !serviceData) {
		return (
			<MainLayout>
				<div className="p-6 text-center text-muted-foreground">Loading service details...</div>
			</MainLayout>
		);
	}

	const getStatusColor = (errorRate: number) => {
		if (errorRate > 5) return "bg-red-500";
		return "bg-green-500";
	};

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
						<p className="text-muted-foreground">Service Name:</p>
						{/* Replace service name with params data */}
						<h1 className="text-4xl font-bold text-foreground">{serviceData[0].name}</h1>
					</div>
				</div>

				{/* Status Bar - Replace with ServiceInfo */}
				{/* Status Bar */}
				<Card className="p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Status</p>
						<div className="flex items-center gap-2">
							<div className={`w-2 h-2 rounded-full ${getStatusColor(serviceData[0].errorRate)}`} />
							<span className="font-semibold text-foreground">
								{serviceData[0].errorRate > 5 ? "Degraded" : "Running"}
							</span>
						</div>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">RPS</p>
						<p className="font-semibold text-foreground">{serviceData[0].requestsPerSecond}</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Error Rate</p>
						<p className="font-semibold text-foreground">{serviceData[0].errorRate}%</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Last Seen</p>
						<p className="font-semibold text-foreground">
							{new Date(serviceData[0].lastSeen).toLocaleString()}
						</p>
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
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-foreground mb-4">Service Health</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									<div className="p-4 bg-card/50 rounded-lg">
										<p className="text-xs text-muted-foreground mb-1">Latency (avg)</p>
										<p className="text-2xl font-bold text-foreground">
											{serviceData[0].avgLatency}ms
										</p>
									</div>
									<div className="p-4 bg-card/50 rounded-lg">
										<p className="text-xs text-muted-foreground mb-1">Namespace</p>
										<p className="text-2xl font-bold text-foreground">{serviceData[0].namespace}</p>
									</div>
								</div>
							</div>

							{/* <div>
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
							</div> */}
						</div>
					)}

					{activeTab === "traffic" && (
						<div className="space-y-6">
							<h3 className="text-lg font-semibold text-foreground">Traffic Analytics (placeholder)</h3>
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
								{logsData?.logs.map((log) => (
									<p key={log.id}>
										[{new Date(log.timestamp).toLocaleTimeString()}] {log.method} {log.path} -{" "}
										{log.status}
									</p>
								)) || <p>No logs available</p>}
							</div>
						</div>
					)}

					{activeTab === "policies" && (
						<div className="space-y-6">
							<h3 className="text-lg font-semibold text-foreground mb-4">
								Active Policies (placeholder)
							</h3>
							<div className="p-4 bg-card/50 rounded-lg font-mono text-xs text-muted-foreground">
								<pre className="whitespace-pre-wrap wrap-break-words">
									{`apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
name: payment-authz
namespace: production
spec:
action: ALLOW
rules:
- from:
	- source:
		principals: ["cluster.local/ns/production/sa/cart"]`}
								</pre>
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
