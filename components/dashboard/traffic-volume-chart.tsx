"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import { usePolling } from "@/hooks/useData";
import { telemetryService } from "@/lib/api/services";
import { Network } from "lucide-react";

const chartConfig = {
	rps: { label: "Req/s", color: "var(--chart-1)" },
};

function barColor(errorRate: number): string {
	if (errorRate >= 5) return "var(--destructive)";
	if (errorRate >= 2) return "var(--warning)";
	return "var(--success)";
}

function truncateName(name: string, max = 18): string {
	return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

export function TrafficVolumeChart() {
	const { data, loading } = usePolling(() => telemetryService.getServices(), 30_000);

	const services = data?.services ?? [];
	const chartData = services
		.filter((s) => s.requestsPerSecond > 0)
		.sort((a, b) => b.requestsPerSecond - a.requestsPerSecond)
		.slice(0, 10)
		.map((s) => ({ name: s.name, rps: s.requestsPerSecond, errorRate: s.errorRate }));

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg font-semibold">Traffic Volume</CardTitle>
				<p className="text-sm text-muted-foreground mt-1">
					Top services by req/s · bar colored by error rate
				</p>
			</CardHeader>
			<CardContent>
				{loading && chartData.length === 0 ? (
					<div className="h-80 space-y-3 pt-2">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Skeleton key={i} className="h-6 w-full rounded-md" />
						))}
					</div>
				) : chartData.length === 0 ? (
					<EmptyState
						icon={Network}
						title="No traffic yet"
						description="Once the orchestrator starts seeing requests, top services will appear here."
						className="h-80"
					/>
				) : (
					<ChartContainer config={chartConfig} className="h-80 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={chartData}
								layout="vertical"
								margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									horizontal={false}
									className="stroke-border/40"
								/>
								<XAxis
									type="number"
									tick={{ fontSize: 11, fill: "currentColor" }}
									tickLine={false}
									axisLine={false}
									className="fill-muted-foreground"
									tickFormatter={(v) => `${v}/s`}
								/>
								<YAxis
									type="category"
									dataKey="name"
									tick={{ fontSize: 11, fill: "currentColor" }}
									tickLine={false}
									axisLine={false}
									className="fill-muted-foreground"
									width={140}
									tickFormatter={(v) => truncateName(String(v))}
								/>
								<ChartTooltip
									cursor={{ fill: "var(--primary)", fillOpacity: 0.05 }}
									content={
										<ChartTooltipContent
											formatter={(value, _name, props) => [
												<span key="val">
													{value}/s &nbsp;
													<span className="text-muted-foreground text-xs">
														({props.payload?.errorRate ?? 0}% errors)
													</span>
												</span>,
												"rps",
											]}
										/>
									}
								/>
								<Bar dataKey="rps" radius={4}>
									{chartData.map((entry, i) => (
										<Cell key={i} fill={barColor(entry.errorRate)} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</ChartContainer>
				)}

				{/* Legend */}
				<div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<span className="h-2 w-3 rounded-sm bg-success" /> &lt; 2% errors
					</div>
					<div className="flex items-center gap-1.5">
						<span className="h-2 w-3 rounded-sm bg-warning" /> 2–5%
					</div>
					<div className="flex items-center gap-1.5">
						<span className="h-2 w-3 rounded-sm bg-destructive" /> ≥ 5%
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
