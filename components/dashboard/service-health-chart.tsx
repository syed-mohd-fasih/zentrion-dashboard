"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocketEvent } from "@/hooks/useSocket";
import { useTelemetryLogs } from "@/hooks/useData";
import type { ParsedRequest } from "@/lib/api/types";

const BUCKET_MINUTES = 1;
const MAX_BUCKETS = 20;

interface TimeBucket {
  time: string;
  avgLatency: number;
  errorRate: number;
  _latencySum: number;
  _count: number;
  _errorCount: number;
}

function bucketKey(timestamp: string): string {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, "0")}:${String(Math.floor(d.getMinutes() / BUCKET_MINUTES) * BUCKET_MINUTES).padStart(2, "0")}`;
}

const chartConfig = {
  avgLatency: { label: "Avg Latency (ms)", color: "var(--chart-1)" },
  errorRate: { label: "Error Rate (%)", color: "var(--chart-5)" },
};

export function ServiceHealthChart() {
  const [buckets, setBuckets] = useState<Map<string, TimeBucket>>(new Map());

  const handleLog = useCallback((log: ParsedRequest) => {
    const key = bucketKey(log.timestamp);
    setBuckets((prev) => {
      const next = new Map(prev);
      const existing = next.get(key) ?? {
        time: key,
        avgLatency: 0,
        errorRate: 0,
        _latencySum: 0,
        _count: 0,
        _errorCount: 0,
      };
      const updated: TimeBucket = {
        ...existing,
        _latencySum: existing._latencySum + log.latencyMs,
        _count: existing._count + 1,
        _errorCount: existing._errorCount + (log.status >= 400 ? 1 : 0),
        avgLatency: 0,
        errorRate: 0,
      };
      updated.avgLatency = Math.round(updated._latencySum / updated._count);
      updated.errorRate = parseFloat(((updated._errorCount / updated._count) * 100).toFixed(1));
      next.set(key, updated);

      // Keep only the most recent MAX_BUCKETS by sorted key
      if (next.size > MAX_BUCKETS) {
        const sorted = [...next.keys()].sort();
        next.delete(sorted[0]);
      }
      return next;
    });
  }, []);

  useSocketEvent("telemetry.log", handleLog);

  const { data: historical } = useTelemetryLogs(200);
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (!historical?.logs?.length) return;
    seededRef.current = true;
    historical.logs.forEach((log) => handleLog(log));
  }, [historical, handleLog]);

  const data = [...buckets.values()].sort((a, b) => a.time.localeCompare(b.time));
  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Service Health Over Time</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Live latency and error rate per minute</p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-80 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Skeleton className="h-4 w-48" />
            <p className="text-sm">Waiting for live telemetry data…</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-avgLatency)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-avgLatency)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-errorRate)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-errorRate)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                />
                <YAxis
                  yAxisId="latency"
                  orientation="left"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => `${v}ms`}
                />
                <YAxis
                  yAxisId="error"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  yAxisId="latency"
                  type="monotone"
                  dataKey="avgLatency"
                  stroke="var(--color-avgLatency)"
                  fill="url(#latencyGrad)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  yAxisId="error"
                  type="monotone"
                  dataKey="errorRate"
                  stroke="var(--color-errorRate)"
                  fill="url(#errorGrad)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Legend */}
        {hasData && (
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm bg-chart-1" /> Latency (ms)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm bg-chart-5" /> Error rate (%)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
