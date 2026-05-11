"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolling } from "@/hooks/useData";
import { telemetryService } from "@/lib/api/services";

const chartConfig = {
  rps: { label: "Req/s", color: "hsl(var(--chart-1))" },
};

function barColor(errorRate: number): string {
  if (errorRate >= 5) return "hsl(var(--destructive))";
  if (errorRate >= 2) return "hsl(48 96% 53%)"; // amber
  return "hsl(142 71% 45%)"; // green
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
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Traffic Volume</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Request distribution by service</p>
      </CardHeader>
      <CardContent>
        {loading && chartData.length === 0 ? (
          <div className="h-80 space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-6 w-full rounded" />)}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
            No service data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => `${v}/s`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                  width={110}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => [
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
                <Bar dataKey="rps" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.errorRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
