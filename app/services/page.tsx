"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Service {
	id: string;
	name: string;
	namespace: string;
	status: "running" | "crashed" | "restarting";
	rps: number;
	errorRate: number;
	cpu: number;
	memory: number;
	policyStatus: "protected" | "needs-update" | "missing";
}

const mockServices: Service[] = [
	{
		id: "1",
		name: "payment-service",
		namespace: "production",
		status: "running",
		rps: 2450,
		errorRate: 0.2,
		cpu: 45,
		memory: 62,
		policyStatus: "protected",
	},
	{
		id: "2",
		name: "cart-service",
		namespace: "production",
		status: "running",
		rps: 3100,
		errorRate: 0.5,
		cpu: 38,
		memory: 58,
		policyStatus: "needs-update",
	},
	{
		id: "3",
		name: "auth-service",
		namespace: "security",
		status: "running",
		rps: 1200,
		errorRate: 0.1,
		cpu: 22,
		memory: 40,
		policyStatus: "protected",
	},
	{
		id: "4",
		name: "inventory-service",
		namespace: "production",
		status: "restarting",
		rps: 800,
		errorRate: 2.1,
		cpu: 78,
		memory: 85,
		policyStatus: "missing",
	},
	{
		id: "5",
		name: "notification-service",
		namespace: "infrastructure",
		status: "running",
		rps: 450,
		errorRate: 0.8,
		cpu: 15,
		memory: 32,
		policyStatus: "protected",
	},
];

const getStatusIcon = (status: string) => {
	switch (status) {
		case "running":
			return <CheckCircle className="w-4 h-4 text-green-500" />;
		case "crashed":
			return <AlertCircle className="w-4 h-4 text-red-500" />;
		case "restarting":
			return <Clock className="w-4 h-4 text-yellow-500" />;
		default:
			return null;
	}
};

const getPolicyBadge = (status: string) => {
	switch (status) {
		case "protected":
			return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Fully protected</Badge>;
		case "needs-update":
			return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Needs update</Badge>;
		case "missing":
			return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Missing policy</Badge>;
		default:
			return null;
	}
};

export default function ServicesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const filteredServices = mockServices.filter(
		(s) =>
			s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			s.namespace.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">Services</h1>
					<p className="text-muted-foreground">Monitor all microservices across your infrastructure</p>
				</div>

				{/* Search */}
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							placeholder="Search services by name or namespace..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 rounded-lg"
						/>
					</div>
				</div>

				{/* Services Table */}
				<Card className="overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border bg-card/50">
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										Service Name
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										Namespace
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										Status
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										RPS
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										Error Rate
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										CPU / Memory
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										Policy Status
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										Action
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredServices.map((service) => (
									<tr
										key={service.id}
										className="border-b border-border hover:bg-card/50 transition-colors"
									>
										<td className="px-6 py-4 text-sm font-medium text-foreground">
											{service.name}
										</td>
										<td className="px-6 py-4 text-sm text-muted-foreground">{service.namespace}</td>
										<td className="px-6 py-4 text-sm">
											<div className="flex items-center gap-2">
												{getStatusIcon(service.status)}
												<span className="capitalize">{service.status}</span>
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-foreground">
											{service.rps.toLocaleString()}
										</td>
										<td className="px-6 py-4 text-sm text-foreground">
											{service.errorRate.toFixed(2)}%
										</td>
										<td className="px-6 py-4 text-sm text-foreground">
											{service.cpu}% / {service.memory}%
										</td>
										<td className="px-6 py-4 text-sm">{getPolicyBadge(service.policyStatus)}</td>
										<td className="px-6 py-4 text-sm">
											<Button variant="ghost" size="sm" className="rounded-lg">
												View Details
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>

				{/* Results Info */}
				<div className="mt-4 text-sm text-muted-foreground">
					Showing {filteredServices.length} of {mockServices.length} services
				</div>
			</div>
		</MainLayout>
	);
}
