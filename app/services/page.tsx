"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { useServices } from "@/hooks/useData";
import type { ServiceInfo } from "@/lib/api/types";
import Link from "next/link";

export default function ServicesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const { data: servicesData, loading } = useServices();

	const filteredServices =
		servicesData?.services.filter((s: ServiceInfo) => s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
		[];

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
										RPS
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										Error Rate
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										Latency
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
										Action
									</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
											Loading services...
										</td>
									</tr>
								) : filteredServices.length === 0 ? (
									<tr>
										<td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
											No services found
										</td>
									</tr>
								) : (
									filteredServices.map((service: ServiceInfo) => (
										<tr
											key={service.name}
											className="border-b border-border hover:bg-card/50 transition-colors"
										>
											{/* Name */}
											<td className="px-6 py-4 text-sm font-medium text-foreground">
												{service.name}
											</td>

											{/* Namespace */}
											<td className="px-6 py-4 text-sm font-mono text-foreground">
												{service.namespace}
											</td>

											{/* RPS */}
											<td className="px-6 py-4 text-sm font-mono text-foreground">
												{service.requestsPerSecond}
											</td>

											{/* Error Rate */}
											<td className="px-6 py-4 text-sm font-mono">
												<span
													className={
														service.errorRate > 5 ? "text-red-500" : "text-foreground"
													}
												>
													{service.errorRate}%
												</span>
											</td>

											{/* Latency */}
											<td className="px-6 py-4 text-sm font-mono text-foreground">
												{service.avgLatency}ms
											</td>

											{/* Action */}
											<td className="px-6 py-4 text-sm">
												<Link href={`/services/${service.name}`}>
													<Button variant="ghost" size="sm" className="rounded-lg">
														View Details
													</Button>
												</Link>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</Card>

				{/* Results Info */}
				<div className="mt-4 text-sm text-muted-foreground">Showing {filteredServices.length} services</div>
			</div>
		</MainLayout>
	);
}
