"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function AnomalyDetailPage({ params }: { params: { id: string } }) {
	return (
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
						<h1 className="text-4xl font-bold text-foreground">Unexpected IP Access</h1>
					</div>
				</div>

				{/* Status Bar */}
				<Card className="p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Anomaly ID</p>
						<p className="font-semibold text-foreground">{params.id}</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Severity</p>
						<Badge className="bg-red-500/10 text-red-700 border-red-500/20">High</Badge>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Service</p>
						<p className="font-semibold text-foreground">payment-service</p>
					</div>
					<div>
						<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Status</p>
						<Badge className="bg-orange-500/10 text-orange-700 border-orange-500/20">Unresolved</Badge>
					</div>
				</Card>

				{/* Details */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Metadata */}
						<Card className="p-6">
							<h2 className="font-semibold text-foreground mb-4">Request Metadata</h2>
							<div className="space-y-3">
								<div>
									<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">
										Source IP
									</p>
									<p className="font-mono text-foreground">192.168.45.187</p>
								</div>
								<div>
									<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">
										HTTP Method
									</p>
									<p className="text-foreground">POST</p>
								</div>
								<div>
									<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">
										Endpoint
									</p>
									<p className="font-mono text-foreground">/api/payments/process</p>
								</div>
								<div>
									<p className="text-xs uppercase text-muted-foreground font-semibold mb-1">
										Timestamp
									</p>
									<p className="text-foreground">2025-01-15 14:23:45 UTC</p>
								</div>
							</div>
						</Card>

						{/* Raw Logs */}
						<Card className="p-6">
							<h2 className="font-semibold text-foreground mb-4">Raw Access Logs</h2>
							<div className="p-4 bg-card/50 rounded-lg font-mono text-xs text-muted-foreground overflow-x-auto max-h-64 overflow-y-auto">
								<pre>{`[14:23:45.123] POST /api/payments/process HTTP/1.1
Host: payment-service.production.svc.cluster.local
From: 192.168.45.187:54321
User-Agent: curl/7.85.0
Content-Length: 256

{
  "amount": 9999.99,
  "currency": "USD",
  "card_token": "tok_xxxx",
  "timestamp": "2025-01-15T14:23:45Z"
}

Response: 401 Unauthorized
Time: 2.14ms`}</pre>
							</div>
						</Card>

						{/* Timeline */}
						<Card className="p-6">
							<h2 className="font-semibold text-foreground mb-4">Timeline</h2>
							<div className="space-y-3">
								<div className="flex gap-4">
									<div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
									<div>
										<p className="text-sm font-medium text-foreground">Anomaly Detected</p>
										<p className="text-xs text-muted-foreground">
											14:23:45 - Unauthorized source IP
										</p>
									</div>
								</div>
								<div className="flex gap-4">
									<div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
									<div>
										<p className="text-sm font-medium text-foreground">Alert Triggered</p>
										<p className="text-xs text-muted-foreground">
											14:23:46 - Security team notified
										</p>
									</div>
								</div>
								<div className="flex gap-4">
									<div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
									<div>
										<p className="text-sm font-medium text-foreground">
											Policy Suggestion Generated
										</p>
										<p className="text-xs text-muted-foreground">
											14:23:47 - AI suggested mitigation
										</p>
									</div>
								</div>
							</div>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Quick Actions */}
						<Card className="p-6">
							<h2 className="font-semibold text-foreground mb-4">Actions</h2>
							<div className="space-y-2">
								<Button className="w-full bg-primary hover:bg-primary/90 rounded-lg">
									Create Policy Suggestion
								</Button>
								<Button variant="ghost" className="w-full rounded-lg justify-start">
									Block Source IP
								</Button>
								<Button variant="ghost" className="w-full rounded-lg justify-start">
									Whitelist Source
								</Button>
								<Button variant="ghost" className="w-full rounded-lg justify-start">
									Mark as Resolved
								</Button>
							</div>
						</Card>

						{/* Related Information */}
						<Card className="p-6">
							<h2 className="font-semibold text-foreground mb-4">Related</h2>
							<div className="space-y-3 text-sm">
								<p className="text-muted-foreground">5 other anomalies from this IP today</p>
								<p className="text-muted-foreground">3 active policies for payment-service</p>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
