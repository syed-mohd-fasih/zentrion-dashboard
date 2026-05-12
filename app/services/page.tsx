"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { Search, Server } from "lucide-react";
import { cn } from "@/lib/utils";

import { useServices } from "@/hooks/useData";
import type { ServiceInfo } from "@/lib/api/types";
import { RpsSparkline } from "@/components/services/rps-sparkline";
import Link from "next/link";

export default function ServicesPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const { data: servicesData, loading } = useServices();

	const filteredServices =
		servicesData?.services.filter((s: ServiceInfo) =>
			s.name.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	return (
		<MainLayout>
			<div className="p-6 space-y-6 max-w-[1600px] mx-auto">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">Services</h1>
					<p className="text-muted-foreground mt-1">
						Live registry of every workload behind an Istio sidecar
					</p>
				</div>

				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search services by name or namespace…"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>

				<Card className="overflow-hidden py-0">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border/40">
									<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
										Service
									</th>
									<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
										Namespace
									</th>
									<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
										RPS
									</th>
									<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
										Trend
									</th>
									<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
										Error rate
									</th>
									<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
										Latency
									</th>
									<th className="px-6 py-3" />
								</tr>
							</thead>
							<tbody>
								{loading && filteredServices.length === 0 ? (
									[1, 2, 3, 4, 5].map((i) => (
										<tr key={i} className="border-b border-border/30">
											{[1, 2, 3, 4, 5, 6, 7].map((j) => (
												<td key={j} className="px-6 py-4">
													<Skeleton className="h-4 w-full max-w-[120px] rounded-md" />
												</td>
											))}
										</tr>
									))
								) : filteredServices.length === 0 ? (
									<tr>
										<td colSpan={7} className="px-6 py-4">
											<EmptyState
												icon={Server}
												title={
													servicesData?.services?.length
														? "No services match your search"
														: "No services discovered yet"
												}
												description={
													servicesData?.services?.length
														? "Try clearing the search box."
														: "Once Zentrion sees traffic through Istio sidecars, services will appear here."
												}
											/>
										</td>
									</tr>
								) : (
									filteredServices.map((service: ServiceInfo, i) => (
										<motion.tr
											key={service.name}
											initial={{ opacity: 0, y: 4 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
											className="border-b border-border/30 hover:bg-card/60 transition-colors"
										>
											<td className="px-6 py-3 text-sm font-medium text-foreground">
												{service.name}
											</td>
											<td className="px-6 py-3 text-sm font-mono text-muted-foreground">
												{service.namespace}
											</td>
											<td className="px-6 py-3 text-sm font-mono tabular-nums text-foreground">
												{service.requestsPerSecond}
											</td>
											<td className="px-6 py-3">
												<RpsSparkline service={service.name} />
											</td>
											<td className="px-6 py-3 text-sm font-mono tabular-nums">
												<span
													className={cn(
														service.errorRate >= 5
															? "text-destructive"
															: service.errorRate >= 2
																? "text-warning"
																: "text-success",
													)}
												>
													{service.errorRate}%
												</span>
											</td>
											<td className="px-6 py-3 text-sm font-mono tabular-nums text-muted-foreground">
												{service.avgLatency}ms
											</td>
											<td className="px-6 py-3 text-sm text-right">
												<Link href={`/services/${service.name}`}>
													<Button variant="ghost" size="sm" className="rounded-lg">
														Details
													</Button>
												</Link>
											</td>
										</motion.tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</Card>

				<div className="text-xs text-muted-foreground font-mono">
					Showing {filteredServices.length} of {servicesData?.services?.length ?? 0} services
				</div>
			</div>
		</MainLayout>
	);
}
